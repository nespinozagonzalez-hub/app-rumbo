(() => {
  'use strict';
  const F = window.RumboFinance, $ = id => document.getElementById(id);
  const KEY = 'rumbo.finanzas.v1';
  const money = value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  const count = value => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(value);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  const today = localDate(), month = today.slice(0,7);
  const empty = () => ({ version: 1, entries: [], goal: { name: 'Mi próxima meta', target: 100000, saved: 0 }, completed: [], demo: false });
  function demo() {
    return { version: 1, demo: true, completed: [], goal: { name: 'Mi primera bicicleta', target: 120000, saved: 20000 }, entries: [
      { id:'demo1',type:'income',amount:50000,category:'Mesada',note:'Mesada de ejemplo',date:month+'-01' },
      { id:'demo2',type:'income',amount:15000,category:'Trabajo ocasional',note:'Ayuda en un proyecto',date:month+'-02' },
      { id:'demo3',type:'expense',amount:8000,category:'Transporte',note:'Traslados de la semana',date:month+'-03' },
      { id:'demo4',type:'expense',amount:4500,category:'Comida',note:'Colaciones',date:month+'-04' },
      { id:'demo5',type:'expense',amount:6000,category:'Ocio',note:'Salida con amigos',date:month+'-05' }
    ] };
  }
  let state, storageOK = true, startupMessage = '';
  try { const raw = localStorage.getItem(KEY); state = raw ? F.validateBackup(JSON.parse(raw)) : demo(); }
  catch { state = empty(); startupMessage = 'No pudimos recuperar el guardado. Puedes restaurar un respaldo.'; }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch { storageOK = false; }
    document.querySelector('.local-pill').innerHTML = storageOK ? '<i></i> Guardado en este navegador' : 'Sin guardado: descarga un respaldo';
  }
  let toastTimer;
  function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500); }
  function save(message) { persist(); toast(storageOK ? message : 'El navegador no permite guardar. Descarga un respaldo.'); }
  function selectedEntries() { return state.entries.filter(x => x.date.slice(0,7) === $('period').value); }
  function allocation() {
    let needs = +$('needs').value, wants = +$('wants').value;
    if (needs + wants > 100) { wants = 100 - needs; $('wants').value = wants; }
    const saving = 100 - needs - wants, income = F.totals(selectedEntries()).income;
    $('needs-out').textContent = needs+'%'; $('wants-out').textContent = wants+'%'; $('save-percent').textContent = saving+'%';
    $('allocation-bar').innerHTML = `<span class="purple" style="width:${needs}%"></span><span class="gray" style="width:${wants}%"></span><span class="green" style="width:${saving}%"></span>`;
    $('allocation-amounts').innerHTML = `<span><i class="dot purple"></i> Necesidades ${money(income*needs/100)}</span><span><i class="dot gray"></i> Gustos ${money(income*wants/100)}</span><span><i class="dot green"></i> Ahorro ${money(income*saving/100)}</span>`;
    const gap = Math.max(0,state.goal.target-state.goal.saved), monthly = income*saving/100;
    $('budget-feedback').textContent = !income ? 'Agrega ingresos para calcular los montos de tu plan.' : gap === 0 ? 'Tu meta ya está cubierta. Puedes elegir tu siguiente paso.' : monthly > 0 ? `Si reservas ${money(monthly)} cada mes, cubrirías lo que falta en unos ${Math.ceil(gap/monthly)} meses, sin considerar intereses. Es una proyección, no ahorro registrado.` : 'Tu plan aún no reserva dinero para la meta. Puedes ajustar el reparto según tu realidad.';
  }
  function renderGoal() {
    $('goal-name').value = state.goal.name; $('goal-target').value = state.goal.target; $('goal-saved').value = state.goal.saved;
    const pct = Math.min(100,100*state.goal.saved/state.goal.target);
    $('goal-percentage').textContent = Math.floor(pct)+'%'; $('goal-progress').value = pct;
    $('goal-progress').textContent = Math.floor(pct)+'%';
    $('goal-status').textContent = `${money(state.goal.saved)} reservados · ${money(Math.max(0,state.goal.target-state.goal.saved))} por reunir`;
  }
  function renderBudget() {
    $('demo-notice').hidden = !state.demo;
    const list = selectedEntries(), totals = F.totals(list);
    $('income').textContent = money(totals.income); $('expenses').textContent = money(totals.expenses); $('balance').textContent = money(totals.balance);
    $('entry-count').textContent = list.length+' movimientos';
    $('entries').innerHTML = list.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x => `<tr><td>${escape(x.note)}</td><td>${escape(x.category)}</td><td>${x.date.split('-').reverse().join('/')}</td><td class="align-right ${x.type==='income'?'positive':'negative'}">${x.type==='income'?'+':'−'}${money(x.amount)}</td><td><button class="icon-button" data-delete="${escape(x.id)}" aria-label="Eliminar ${escape(x.note)}">×</button></td></tr>`).join('') || '<tr><td colspan="5">No hay movimientos en este mes. Agrega el primero para comenzar.</td></tr>';
    const groups = {}; list.filter(x=>x.type==='expense').forEach(x=>groups[x.category]=(groups[x.category]||0)+x.amount);
    const highest = Object.entries(groups).sort((a,b)=>b[1]-a[1])[0];
    $('spending-summary').textContent = highest ? `Tu mayor categoría de gasto es ${highest[0]}: ${money(highest[1])}. ${totals.balance<0?'En este mes gastaste más de lo que registraste como ingresos. Revisa el plan y tus fuentes de dinero.':'Revisa si coincide con lo que es importante para ti.'}` : 'Cuando registres gastos, podrás ver dónde estás usando más dinero.';
    renderGoal(); allocation();
  }
  const products = [
    { name:'Cuenta de ahorro',tag:'Reservar y organizar',summary:'Guarda dinero bajo condiciones definidas por la institución.',risk:'Depende de la entidad y las condiciones; considera inflación y costos.',time:'Revisa límites de retiro, reajustes y condiciones de interés.',detail:'Una cuenta de ahorro puede pagar intereses o reajustes según su contrato. Antes de elegirla, verifica cargos, saldo mínimo, reglas de retiro y requisitos para menores. Tener dinero guardado no asegura que conserve su poder de compra.' },
    { name:'Depósito a plazo',tag:'Un plazo acordado',summary:'Entregas dinero por un período y una tasa pactados.',risk:'Hay riesgo de la entidad, inflación y condiciones contractuales.',time:'Planifica mantener el dinero hasta el vencimiento.',detail:'En un depósito a plazo, la institución recibe dinero por un período determinado y pacta intereses o reajustes. La disponibilidad antes del vencimiento depende del contrato. Compara tasas usando el mismo plazo, moneda y condiciones; una tasa mensual y una anual no se comparan directamente.' },
    { name:'Fondo mutuo',tag:'Una cartera compartida',summary:'Tus aportes se invierten junto a los de otras personas.',risk:'Puede ganar o perder valor; depende de los activos del fondo.',time:'Revisa plazo de rescate, comisiones y horizonte recomendado.',detail:'Un fondo invierte en distintos activos según su política. Diversificar puede repartir riesgos, pero no los elimina. El valor de la cuota cambia. Revisa el reglamento, los costos y el riesgo; la rentabilidad pasada no garantiza la futura.' },
    { name:'Acciones',tag:'Participar en una empresa',summary:'Compras una parte del patrimonio de una empresa.',risk:'El precio puede caer y no hay ganancias garantizadas.',time:'Vender depende del mercado y no asegura recuperar lo aportado.',detail:'Los retornos pueden venir de dividendos y variaciones del precio. Una empresa puede no repartir dividendos y una acción puede perder mucho valor. Concentrar todo en una sola empresa aumenta la exposición. Se estudian aquí para comprenderlas, no como recomendación de compra.' }
  ];
  $('products').innerHTML = products.map(x=>`<article class="card product"><span class="product-tag">${x.tag}</span><h3>${x.name}</h3><p class="product-summary">${x.summary}</p><dl><div><dt>Riesgo</dt><dd>${x.risk}</dd></div><div><dt>Disponibilidad</dt><dd>${x.time}</dd></div></dl><details><summary>Entender este producto</summary><p>${x.detail}</p></details></article>`).join('');
  function chart(target, series, monthsLabel, valueFormatter) {
    const w=720,h=270,left=72,right=22,top=22,bottom=38;
    const values=series.flatMap(s=>s.values), min=Math.min(0,...values), max=Math.max(0,...values);
    const span=max-min||1, lower=min-span*.08, upper=max+span*.08;
    const x=(i,n)=>left+(w-left-right)*i/Math.max(1,n-1), y=v=>top+(h-top-bottom)*(upper-v)/(upper-lower);
    let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(monthsLabel)}"><title>${escape(monthsLabel)}</title>`;
    for(let i=0;i<5;i++){const v=lower+(upper-lower)*i/4;svg+=`<line class="axis" x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}"/><text x="${left-8}" y="${y(v)+4}" text-anchor="end">${escape(valueFormatter(v))}</text>`;}
    svg+=`<line x1="${left}" x2="${w-right}" y1="${y(0)}" y2="${y(0)}" stroke="#b9b4cc" stroke-dasharray="4 4"/>`;
    series.forEach(s=>{
      const stride=Math.max(1,Math.floor(s.values.length/150));
      const pts=s.values.map((v,i)=>i%stride===0||i===s.values.length-1?`${x(i,s.values.length).toFixed(2)},${y(v).toFixed(2)}`:null).filter(Boolean).join(' ');
      svg+=`<polyline points="${pts}" stroke="${s.color}" ${s.dashed?'stroke-dasharray="6 5"':''}><title>${escape(s.name)}</title></polyline>`;
    });
    const n=series[0].values.length-1;
    [0,Math.round(n/2),n].forEach(i=>{svg+=`<text x="${x(i,n+1)}" y="${h-10}" text-anchor="middle">${i}</text>`;});
    svg+='</svg>';
    $(target).innerHTML=svg;
  }
  function compactMoney(v) { return Math.abs(v)>=1000000?count(v/1000000)+' M':Math.abs(v)>=1000?count(v/1000)+' mil':count(v); }
  function renderProjection() {
    const result=F.project(+$('initial').value,+$('monthly').value,+$('months').value,+$('rate').value,+$('inflation').value);
    $('projection-total').textContent=money(result.balance);$('contributed').textContent=money(result.contributed);$('yield').textContent=money(result.yield);$('real').textContent=money(result.real);
    chart('saving-chart',[{name:'Total nominal',values:result.points.map(x=>x.balance),color:'#6652d5'},{name:'Aportes',values:result.points.map(x=>x.contributed),color:'#8b879d',dashed:true}],`Evolución en CLP durante ${$('months').value} meses: total ${money(result.balance)}, aportado ${money(result.contributed)}. Eje horizontal: meses.`,compactMoney);
  }
  function renderRisk() {
    const key=$('risk-model').value,stake=+$('risk-stake').value,rounds=+$('risk-rounds').value,model=F.models[key];
    const result=F.experiment(key,stake,rounds);
    $('house-edge').textContent=count(result.edge*100)+'%';
    $('expected-net').textContent=count(result.theory)+' fichas';$('observed-net').textContent=count(result.average)+' fichas';
    $('model-description').textContent=`Probabilidad de acierto: ${count(model.p*100)}%. Pago total al acertar: ${count(model.payout)}× lo apostado (incluye la ficha inicial). Total apostado entre 300 sesiones: ${count(result.totalStaked)} fichas. ${key==='fair'?'Este control tiene resultado esperado cero: no elimina el riesgo de perder en una sesión.':''}`;
    const theory=Array.from({length:rounds+1},(_,i)=>F.expected(model,stake,i));
    chart('risk-chart',[{name:'Una sesión',values:result.sample,color:'#aaa6b7'},{name:'Promedio observado',values:result.mean,color:'#6652d5'},{name:'Resultado esperado',values:theory,color:'#dc765f',dashed:true}],`Resultado neto acumulado en fichas por ronda. Resultado esperado final ${count(result.theory)}; promedio observado ${count(result.average)}. Eje horizontal: rondas.`,compactMoney);
    $('session-bar').innerHTML=`<span class="green" style="width:${result.winners/3}%"></span><span class="gray" style="width:${result.tied/3}%"></span><span class="coral-dot" style="width:${result.losers/3}%"></span>`;
    $('session-summary').textContent=`De 300 sesiones: ${result.winners} terminaron con ganancia, ${result.tied} empatadas y ${result.losers} con pérdida. ${result.edge>0?'Las ganancias puntuales no cambian la desventaja matemática.':'El modelo justo puede producir ganancias y pérdidas, aunque su expectativa sea cero.'} Repetir el experimento genera otros resultados.`;
  }
  const missions={budget:{right:'compare',yes:'Comparar el costo completo permite decidir si ese gasto cabe en tus prioridades. Puedes conservarlo, ajustarlo o dejarlo; lo importante es decidir con información.',no:'El precio mensual puede esconder el costo acumulado. Multiplica por 12 y compáralo con tu meta antes de decidir.'},saving:{right:'liquidity',yes:'La meta tiene una fecha cercana. Revisa si podrás retirar el dinero a tiempo, los costos y si su valor puede caer.',no:'Una promesa de rendimiento no asegura disponibilidad ni evita pérdidas. Para una meta cercana, revisar el plazo y el riesgo es esencial.'},risk:{right:'same',yes:'Exacto: en rondas independientes, una racha no altera la probabilidad siguiente. Ganar no es una deuda que el azar tenga contigo.',no:'El azar no compensa una racha. En este modelo cada ronda conserva su probabilidad, independientemente de las anteriores.'}};
  function renderProgress(){
    const n=state.completed.length;$('progress').value=n;$('progress-label').textContent=n+' de 3 misiones';
    document.querySelectorAll('[data-mission]').forEach(el=>{const key=el.dataset.mission;if(state.completed.includes(key)){el.parentElement.querySelector('.mission-feedback').textContent='Misión completada. '+missions[key].yes;el.querySelector(`[data-answer="${missions[key].right}"]`).classList.add('selected');}});
  }
  function route(){
    const key=['dinero','futuro','riesgos'].includes(location.hash.slice(1))?location.hash.slice(1):'dinero';
    document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!=='page-'+key);
    document.querySelectorAll('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===key);if(a.dataset.route===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('breadcrumb').textContent='APRENDE HACIENDO / '+({dinero:'MI DINERO',futuro:'MI FUTURO',riesgos:'SIN TRAMPAS'}[key]);
  }
  $('period').value=month;$('entry-date').value=today;
  $('period').addEventListener('change',renderBudget);
  $('needs').addEventListener('input',allocation);
  $('wants').addEventListener('input',()=>{if(+$('needs').value + +$('wants').value>100)$('needs').value=100-+$('wants').value;allocation();});
  $('entry-form').addEventListener('submit',e=>{
    e.preventDefault();
    const date=$('entry-date').value,amount=+$('entry-amount').value,note=$('entry-note').value.trim();
    if(!note){$('entry-note').setCustomValidity('Agrega una descripción.');$('entry-note').reportValidity();return;}
    if(state.entries.length>=5000){toast('Hay 5.000 movimientos. Respalda y elimina los que ya no necesitas.');return;}
    state.entries.push({id:globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random(),type:$('entry-type').value,amount,category:$('entry-category').value,note,date});
    $('period').value=date.slice(0,7);$('entry-amount').value='';$('entry-note').value='';renderBudget();save('Movimiento agregado.');
  });
  $('entry-note').addEventListener('input',()=> $('entry-note').setCustomValidity(''));
  $('entries').addEventListener('click',e=>{const b=e.target.closest('[data-delete]');if(!b)return;state.entries=state.entries.filter(x=>x.id!==b.dataset.delete);renderBudget();save('Movimiento eliminado.');});
  $('goal-form').addEventListener('submit',e=>{e.preventDefault();const name=$('goal-name').value.trim();if(!name){toast('Escribe el nombre de tu meta.');return;}state.goal={name,target:+$('goal-target').value,saved:+$('goal-saved').value};renderGoal();allocation();save('Meta actualizada.');});
  $('saving-form').addEventListener('submit',e=>{e.preventDefault();try{renderProjection();toast('Escenario actualizado.');}catch{toast('Revisa los valores del escenario.');}});
  $('risk-form').addEventListener('submit',e=>{e.preventDefault();try{renderRisk();toast('Experimento completo: 300 sesiones analizadas.');}catch{toast('Revisa los valores del experimento.');}});
  document.querySelectorAll('[data-mission]').forEach(el=>el.addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b)return;const key=el.dataset.mission,right=b.dataset.answer===missions[key].right;el.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));el.parentElement.querySelector('.mission-feedback').textContent=right?missions[key].yes:missions[key].no;if(right&&!state.completed.includes(key)){state.completed.push(key);renderProgress();save('Una nueva misión completada.');}}));
  function refresh(){renderBudget();document.querySelectorAll('.mission-feedback').forEach(x=>x.textContent='');document.querySelectorAll('.choices button').forEach(x=>x.classList.remove('selected'));renderProgress();}
  function replace(next,message){state=next;refresh();save(message);}
  $('start-empty').addEventListener('click',()=>{if(confirm('¿Eliminar los datos de ejemplo y comenzar desde cero?'))replace(empty(),'Tu espacio está listo para comenzar.');});
  $('open-data').addEventListener('click',()=>{$('data-feedback').textContent='';$('data-dialog').showModal();});
  $('open-sources').addEventListener('click',()=> $('sources-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
  $('clear-data').addEventListener('click',()=>{if(confirm('¿Borrar movimientos, meta y progreso de este navegador? Descarga un respaldo si quieres conservarlos.')){replace(empty(),'Datos borrados.');feedbackNotes=[];saveNotes();renderNotes();try{localStorage.removeItem(TUTORIAL_KEY);}catch{}$('data-feedback').textContent='Datos anteriores eliminados. Tu espacio quedó vacío.';}});
  $('load-demo').addEventListener('click',()=>{if(confirm('¿Reemplazar movimientos, meta y progreso por el ejemplo?')){replace(demo(),'Ejemplo cargado.');$('period').value=month;renderBudget();$('data-feedback').textContent='Ahora estás usando datos ficticios de ejemplo.';}});
  $('export-data').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='rumbo-respaldo-'+today+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('data-feedback').textContent='Respaldo preparado. Consérvalo en un lugar privado.';});
  $('import-data').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2e6)throw Error();const restored=F.validateBackup(JSON.parse(await file.text()));if(confirm('¿Reemplazar los datos de este navegador por el respaldo?')){replace(restored,'Respaldo restaurado.');const last=state.entries.map(x=>x.date).sort().at(-1);$('period').value=last?last.slice(0,7):month;renderBudget();$('data-feedback').textContent='Respaldo restaurado correctamente.';}}catch{$('data-feedback').textContent='El archivo no es un respaldo válido de Rumbo. Tus datos actuales se conservaron.';}finally{e.target.value='';}});
  const FEEDBACK_KEY = 'rumbo.feedback.v1';
  let feedbackNotes = [];
  try {
    const notes = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
    if (Array.isArray(notes)) feedbackNotes = notes.slice(0,200).filter(n => n && ['section','kind','task','result','expect','date'].every(k => typeof n[k] === 'string' && n[k].length <= 700)).map(n => ({section:n.section,kind:n.kind,task:n.task,result:n.result,expect:n.expect,date:n.date}));
  } catch { /* Las notas no bloquean la app si el navegador impide guardarlas. */ }
  function saveNotes() {
    try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackNotes)); return true; }
    catch { return false; }
  }
  function renderNotes() {
    $('feedback-list').innerHTML = feedbackNotes.map((n,i) => `<article><strong>${i+1}. ${escape(n.kind)} · ${escape(n.section)}</strong><p><b>Intentaba:</b> ${escape(n.task)}</p><p><b>Observé:</b> ${escape(n.result)}</p>${n.expect?`<p><b>Propongo:</b> ${escape(n.expect)}</p>`:''}<button class="text-button" data-remove-note="${i}">Eliminar esta nota</button></article>`).join('');
    $('download-feedback').disabled = feedbackNotes.length === 0;
    $('feedback-status').textContent = feedbackNotes.length ? `${feedbackNotes.length} nota(s) listas para descargar. No se envían automáticamente.` : 'Todavía no has guardado notas.';
  }
  $('open-feedback').addEventListener('click', () => {
    const current = location.hash.slice(1);
    $('feedback-section').value = ['dinero','futuro','riesgos'].includes(current) ? current : 'dinero';
    renderNotes(); $('feedback-dialog').showModal();
  });
  $('feedback-form').addEventListener('submit', e => {
    e.preventDefault();
    const task=$('feedback-task').value.trim(), result=$('feedback-result').value.trim();
    if (!task || !result) { $('feedback-status').textContent='Describe qué intentabas hacer y qué ocurrió.'; return; }
    if (feedbackNotes.length>=200) { $('feedback-status').textContent='Descarga tus notas y elimina alguna antes de agregar más.'; return; }
    feedbackNotes.push({date:localDate(),section:$('feedback-section').selectedOptions[0].textContent,kind:$('feedback-kind').value,task,result,expect:$('feedback-expect').value.trim()});
    const stored=saveNotes(); renderNotes();
    $('feedback-task').value=''; $('feedback-result').value=''; $('feedback-expect').value='';
    if (!stored) $('feedback-status').textContent='La nota está en esta sesión, pero no se pudo guardar en el navegador. Descárgala antes de salir.';
  });
  $('feedback-list').addEventListener('click', e => {
    const b=e.target.closest('[data-remove-note]'); if (!b) return;
    feedbackNotes.splice(+b.dataset.removeNote,1); const stored=saveNotes(); renderNotes();
    if(!stored) $('feedback-status').textContent='No se pudo actualizar el guardado. Descarga tus notas antes de salir.';
  });
  $('download-feedback').addEventListener('click', () => {
    const header='RUMBO · NOTAS DE LA PRUEBA EN AULA\nVersión 1.1 · 19 de octubre de 2026\nSin identificación del estudiante\n\n';
    const body=feedbackNotes.map((n,i)=>`${i+1}. ${n.kind} · ${n.section} (${n.date})\nIntentaba: ${n.task}\nObservé: ${n.result}\nPropongo: ${n.expect || '(sin propuesta)'}\n`).join('\n');
    const url=URL.createObjectURL(new Blob([header+body],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='Rumbo_notas_'+localDate()+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('feedback-status').textContent='Archivo preparado. Compártelo con tu docente por el medio acordado.';
  });
  const TUTORIAL_KEY = 'rumbo.tutorial.v1';
  const tutorialSteps = [
    {route:'dinero',target:'#classroom-intro',title:'Tu dinero, tus decisiones',copy:'Rumbo tiene tres espacios: organiza tu dinero, comprende opciones de ahorro y explora las matemáticas de las apuestas. Este recorrido te mostrará los controles para que después puedas probarlos.',tip:'Empieza con los datos ficticios del ejemplo. No necesitas registrarte ni contar cuánto dinero tiene tu familia.'},
    {route:'dinero',target:'#entry-form',title:'Registra lo que entra y lo que sale',copy:'Elige Ingreso o Gasto, escribe un monto en pesos chilenos, selecciona una categoría y agrega descripción y fecha. Pulsa Agregar. El mes se ajusta a la fecha del movimiento y las cifras de arriba se actualizan.',tip:'Prueba un gasto ficticio de $2.500. En el ejemplo, los gastos pasarán de $18.500 a $21.000. Puedes quitarlo con la × de su fila. El balance es ingresos menos gastos del mes, no un saldo bancario.'},
    {route:'dinero',target:'#needs',title:'Dale un destino a tu presupuesto',copy:'Mueve las barras de Necesidades y Gustos. Lo que resta se asigna al plan de ahorro. Los porcentajes se calculan sobre los ingresos del mes seleccionado y entre los tres suman 100%.',tip:'Es una planificación que puedes adaptar a tu realidad. Mover una barra no transfiere dinero ni registra un gasto; los escenarios se restablecen al recargar.'},
    {route:'dinero',target:'#goal-form',title:'Ponle nombre a tu próxima meta',copy:'Escribe qué quieres lograr, su costo total y cuánto dinero ya reservaste. Pulsa Guardar mi meta para actualizar el progreso. El plan estima cuántos meses tomaría reunir lo que falta si reservas la misma cantidad.',tip:'Ejemplo: meta $100.000 y ya reservado $25.000 significa 25%. Solo anota como reservado lo que realmente separaste; este campo no descuenta dinero del balance automáticamente.'},
    {route:'futuro',target:'#products',title:'Conoce antes de elegir',copy:'Compara las fichas de cuenta de ahorro, depósito a plazo, fondo mutuo y acciones. Abre Entender este producto para leer más. Observa qué puede pasar con su valor y cuándo podrías recuperar el dinero.',tip:'Una meta cercana requiere revisar disponibilidad, costos y riesgo. Las fichas explican conceptos; no son ofertas ni recomendaciones de contratación.'},
    {route:'futuro',target:'#saving-form',title:'Construye un escenario de ahorro',copy:'Completa monto inicial, aporte mensual, meses, tasa anual efectiva e inflación supuesta. Luego pulsa Calcular mi escenario. Revisa el total, lo aportado, la variación y el valor en pesos de hoy.',tip:'Prueba $20.000 iniciales + $10.000 al mes durante 12 meses con tasa e inflación en 0%: el resultado es $140.000. Cambia una variable a la vez para comprender su efecto. La tasa es hipotética, no una promesa.'},
    {route:'riesgos',target:'#risk-form',title:'Mira muchas sesiones, no solo una racha',copy:'Elige modelo, fichas por ronda y rondas por sesión, y pulsa Analizar 300 sesiones. Compara la sesión individual, el promedio observado y el resultado esperado. Todos los valores son fichas ficticias.',tip:'Compara la ruleta con la moneda justa. En el control justo la expectativa es cero, pero algunas sesiones ganan y otras pierden. Con ventaja de la casa la expectativa es negativa; una ganancia puntual no cambia las probabilidades.'},
    {route:'dinero',target:'#open-feedback',title:'Anota algo que podamos mejorar',copy:'Abre Anotar una mejora. Indica la sección, qué intentabas hacer, qué ocurrió y qué propones. Guarda la nota y usa Descargar mis notas para obtener un TXT y compartirlo con tu docente.',tip:'Las notas quedan en este navegador y no se entregan automáticamente. Usa ejemplos ficticios y evita nombres o información financiera real.'},
    {route:'dinero',target:'#open-data',title:'Conserva tu avance y vuelve cuando quieras',copy:'En Mis datos y respaldo puedes descargar un JSON con tus movimientos, meta y misiones, o restaurar uno existente. Las notas de mejora se descargan por separado. Al cerrar el recorrido podrás seguir explorando.',tip:'El avance se guarda en este navegador. Si cambias de dispositivo o borras sus datos, necesitarás un respaldo. Puedes volver a abrir este tutorial con Aprender a usar Rumbo y consultar las ayudas de cada sección.'}
  ];
  let tutorialIndex=0, tutorialActive=false, tutorialReturnFocus=null;
  function rememberTutorial(value){try{localStorage.setItem(TUTORIAL_KEY,value);}catch{ /* El tutorial sigue disponible aunque no se pueda guardar su estado. */ }}
  function clearTutorialHighlight(){document.querySelectorAll('.tutorial-highlight').forEach(el=>el.classList.remove('tutorial-highlight'));}
  function setTutorialRoute(step){
    history.replaceState(null,'','#'+step.route);route();
  }
  function updateTutorial(){
    const step=tutorialSteps[tutorialIndex],last=tutorialIndex===tutorialSteps.length-1;
    clearTutorialHighlight();setTutorialRoute(step);
    $('tutorial-title').textContent=step.title;$('tutorial-copy').textContent=step.copy;$('tutorial-tip').textContent=step.tip;
    $('tutorial-step-label').textContent=`PASO ${tutorialIndex+1} DE ${tutorialSteps.length}`;
    $('tutorial-progress').value=tutorialIndex+1;$('tutorial-progress').textContent=`${tutorialIndex+1} de ${tutorialSteps.length}`;
    $('tutorial-prev').disabled=tutorialIndex===0;
    $('tutorial-next').textContent=last?'Terminar tutorial ✓':tutorialIndex===0?'Empezar recorrido →':'Siguiente →';
    $('tutorial-dock-next').textContent=last?'Terminar ✓':'Siguiente →';
    $('tutorial-dock-count').textContent=`TUTORIAL · ${tutorialIndex+1} DE ${tutorialSteps.length}`;
    $('tutorial-dock-title').textContent=step.title;
    $('tutorial-dock').hidden=true;
    if(!$('tutorial-dialog').open)$('tutorial-dialog').showModal();
  }
  function startTutorial(index=0){
    tutorialReturnFocus=document.activeElement;tutorialIndex=index;tutorialActive=true;
    document.body.classList.add('tutorial-active');rememberTutorial('seen');updateTutorial();
  }
  function stopTutorial(completed=false){
    tutorialActive=false;clearTutorialHighlight();document.body.classList.remove('tutorial-active');
    $('tutorial-dock').hidden=true;$('tutorial-dialog').close();
    if(completed){rememberTutorial('completed');toast('Recorrido completado. Puedes volver a abrirlo cuando quieras.');}
    if(tutorialReturnFocus?.isConnected&&tutorialReturnFocus.getClientRects().length)tutorialReturnFocus.focus({preventScroll:true});
    else document.querySelector('[data-start-tutorial="0"]').focus({preventScroll:true});
  }
  function nextTutorial(){if(tutorialIndex===tutorialSteps.length-1)stopTutorial(true);else{tutorialIndex++;updateTutorial();}}
  $('tutorial-next').addEventListener('click',nextTutorial);
  $('tutorial-dock-next').addEventListener('click',nextTutorial);
  $('tutorial-prev').addEventListener('click',()=>{if(tutorialIndex>0){tutorialIndex--;updateTutorial();}});
  $('tutorial-view').addEventListener('click',()=>{
    const target=document.querySelector(tutorialSteps[tutorialIndex].target);
    $('tutorial-dialog').close();$('tutorial-dock').hidden=false;
    if(target){target.classList.add('tutorial-highlight');if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});target.focus({preventScroll:true});}
  });
  $('tutorial-dock-explain').addEventListener('click',updateTutorial);
  ['tutorial-close','tutorial-skip','tutorial-dock-exit'].forEach(id=>$(id).addEventListener('click',()=>stopTutorial(false)));
  $('tutorial-dialog').addEventListener('cancel',e=>{e.preventDefault();stopTutorial(false);});
  document.querySelectorAll('[data-start-tutorial]').forEach(b=>b.addEventListener('click',()=>startTutorial(+b.dataset.startTutorial)));
  window.addEventListener('hashchange',()=>{if(tutorialActive)stopTutorial(false);route();window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true});});
  renderBudget();renderProjection();renderRisk();renderProgress();route();persist();
  if(startupMessage)toast(startupMessage);
  try{if(!localStorage.getItem(TUTORIAL_KEY))startTutorial(0);}catch{ /* El botón de ayuda queda disponible si el navegador bloquea el almacenamiento. */ }
})();
