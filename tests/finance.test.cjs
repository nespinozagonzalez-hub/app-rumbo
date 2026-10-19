const assert = require('node:assert/strict');
const test = require('node:test');
const F = require('../assets/finance.js');
test('El balance usa ingresos menos gastos; no atribuye el ahorro reservado a un gasto', () => {
  assert.deepEqual(F.totals([{type:'income',amount:65000},{type:'expense',amount:18500}]), {income:65000,expenses:18500,balance:46500});
  assert.deepEqual(F.totals([]),{income:0,expenses:0,balance:0});
});
test('Sin interés, el total es capital inicial más aportes',()=>{
  const p=F.project(20000,10000,12,0,0);
  assert.equal(p.balance,140000);assert.equal(p.contributed,140000);assert.equal(p.yield,0);assert.equal(p.real,140000);
});
test('Una tasa anual efectiva de 12% devuelve exactamente 112.000 tras un año sin aportes',()=>{
  const p=F.project(100000,0,12,12,12);
  assert.ok(Math.abs(p.balance-112000)<1e-7);assert.ok(Math.abs(p.real-100000)<1e-7);
});
test('La caída anual se refleja como pérdida, sin inventar retornos positivos',()=>{
  const p=F.project(100000,0,12,-20,0);assert.ok(Math.abs(p.balance-80000)<1e-7);assert.ok(p.yield<0);
});
test('El aporte del último mes no gana intereses anticipados',()=>{
  const p=F.project(0,10000,1,12,0);assert.equal(p.balance,10000);
});
test('La ruleta de color pierde 1/37 del monto apostado en expectativa; el control justo tiene expectativa cero',()=>{
  assert.ok(Math.abs(F.expected(F.models.roulette,100,1000)+100000/37)<1e-8);
  assert.ok(Math.abs(F.expected(F.models.coin,100,1000)+5000)<1e-8);
  assert.equal(F.expected(F.models.fair,100,1000),0);
});
test('La simulación permite tanto ganar como perder y contabiliza el pago neto',()=>{
  const win=F.experiment('roulette',100,10,3,()=>0);assert.equal(win.average,1000);assert.equal(win.winners,3);
  const loss=F.experiment('roulette',100,10,3,()=>.99);assert.equal(loss.average,-1000);assert.equal(loss.losers,3);
  const coin=F.experiment('coin',100,1,1,()=>0);assert.ok(Math.abs(coin.average-90)<1e-9);
});
test('Promedios de muchas rondas convergen dentro de una tolerancia estadística; no se fuerza cada sesión a perder',()=>{
  let seed=12345;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const r=F.experiment('roulette',100,1000,1000,rng);
  const standardError=100*2*Math.sqrt((18/37)*(19/37)*1000/1000);
  assert.ok(Math.abs(r.average-r.theory)<5*standardError);
  assert.equal(r.winners+r.losers+r.tied,1000);assert.ok(r.winners>0&&r.losers>0);
});
test('Los respaldos rechazan entradas peligrosas o incompatibles y no aceptan valores no finitos',()=>{
  const d={version:1,entries:[],goal:{name:'Bici',target:100000,saved:0},completed:['budget','inventada','budget']};
  assert.deepEqual(F.validateBackup(d).completed,['budget']);
  assert.throws(()=>F.validateBackup({...d,version:2}));
  assert.throws(()=>F.validateBackup({...d,goal:{name:'Bici',target:Infinity,saved:0}}));
  const e={id:'1',note:'Ejemplo',date:'2026-02-30',type:'income',category:'Mesada',amount:100};
  assert.throws(()=>F.validateBackup({...d,entries:[e]}));
  assert.throws(()=>F.validateBackup({...d,entries:[{...e,date:'2026-02-01',amount:'100'}]}));
  assert.throws(()=>F.project(100,0,0,0,0));
  assert.throws(()=>F.experiment('unknown',100,10));
});
