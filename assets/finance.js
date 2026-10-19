(function (root) {
  'use strict';
  function number(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < min || n > max) throw new RangeError('Valor fuera de rango');
    return n;
  }
  function totals(entries) {
    const income = entries.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0);
    const expenses = entries.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
    return { income, expenses, balance: income - expenses };
  }
  // Tasa anual efectiva; capitalización mensual equivalente; aporte al fin del mes.
  function project(initial, contribution, months, annualRate, inflation) {
    number(initial, 0, 1e8); number(contribution, 0, 1e7); number(months, 1, 120);
    if (!Number.isInteger(months)) throw new RangeError('Usa un plazo entero');
    number(annualRate, -50, 50); number(inflation, -10, 50);
    const rate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const points = [{ month: 0, balance: initial, contributed: initial }];
    let balance = initial;
    for (let i = 1; i <= months; i++) {
      balance = balance * (1 + rate) + contribution;
      points.push({ month: i, balance, contributed: initial + contribution * i });
    }
    const contributed = initial + contribution * months;
    return { balance, contributed, yield: balance - contributed,
      real: balance / Math.pow(1 + inflation / 100, months / 12), points };
  }
  const models = {
    roulette: { name: 'Modelo de ruleta europea', p: 18 / 37, payout: 2 },
    coin: { name: 'Moneda con pago reducido', p: .5, payout: 1.9 },
    fair: { name: 'Moneda justa (control)', p: .5, payout: 2 }
  };
  function expected(model, stake, rounds) {
    return stake * rounds * (model.p * model.payout - 1);
  }
  // Todas las rondas se realizan con fichas de laboratorio, sin límite de capital.
  // Se mide el resultado neto acumulado, no un saldo bancario.
  function experiment(key, stake, rounds, sessions = 300, random = Math.random) {
    if (!models[key]) throw new RangeError('Modelo desconocido');
    number(stake, 1, 100000); number(rounds, 1, 1000); number(sessions, 1, 1000);
    if (!Number.isInteger(rounds) || !Number.isInteger(sessions)) throw new RangeError('Usa enteros');
    const model = models[key];
    const sums = Array(rounds + 1).fill(0), sample = [0], ends = [];
    for (let s = 0; s < sessions; s++) {
      let net = 0;
      for (let r = 1; r <= rounds; r++) {
        net += (random() < model.p ? model.payout - 1 : -1) * stake;
        sums[r] += net;
        if (s === 0) sample.push(net);
      }
      ends.push(net);
    }
    const mean = sums.map(x => x / sessions);
    return { sample, mean, ends, average: mean[rounds],
      theory: expected(model, stake, rounds),
      winners: ends.filter(x => x > 1e-7).length,
      tied: ends.filter(x => Math.abs(x) <= 1e-7).length,
      losers: ends.filter(x => x < -1e-7).length,
      edge: 1 - model.p * model.payout,
      totalStaked: sessions * rounds * stake };
  }
  function validateBackup(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.entries) || data.entries.length > 5000) throw Error('Respaldo no compatible');
    const entries = data.entries.map(x => {
      if (!x || !['income','expense'].includes(x.type) || !['Mesada','Trabajo ocasional','Transporte','Comida','Ocio','Otros'].includes(x.category)) throw Error('Movimiento inválido');
      if (typeof x.note !== 'string' || x.note.length > 80 || typeof x.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x.date)) throw Error('Movimiento inválido');
      const d = new Date(x.date + 'T12:00:00');
      if (isNaN(d) || d.toISOString().slice(0,10) !== x.date) throw Error('Fecha inválida');
      number(x.amount, 1, 1e7);
      if (!Number.isInteger(x.amount)) throw Error('Monto inválido');
      return { id: String(x.id).slice(0,80), date: x.date, note: x.note, category: x.category, type: x.type, amount: x.amount };
    });
    const goal = data.goal;
    if (!goal || typeof goal.name !== 'string' || goal.name.length > 60) throw Error('Meta inválida');
    if (typeof goal.target !== 'number' || typeof goal.saved !== 'number') throw Error('Monto de meta inválido');
    number(goal.target, 1, 1e8); number(goal.saved, 0, 1e8);
    const completed = Array.isArray(data.completed) ? [...new Set(data.completed.filter(x => ['budget','saving','risk'].includes(x)))] : [];
    return { version: 1, entries, goal: { name: goal.name, target: goal.target, saved: goal.saved }, completed, demo: data.demo === true };
  }
  const api = { totals, project, models, expected, experiment, validateBackup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RumboFinance = api;
})(typeof window !== 'undefined' ? window : globalThis);
