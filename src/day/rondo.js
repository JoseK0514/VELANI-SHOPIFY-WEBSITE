(function(){
  var V=window.VD,$=V.$,$$=V.$$;

  /* Hero phone plays one exchange: typed question, answer word by word, prepared change. */
  var scene=$('#rh-scr .ro-scene'),words=[];
  if(scene){
    var p=scene.querySelector('[data-words]');
    words=p.textContent.trim().split(/\s+/);
    p.innerHTML=words.map(function(w){return '<span class="wd off">'+w+'</span>'}).join(' ');
    var ws=$$('.wd',p);
    function play(){
      if(V.still()){scene.dataset.ro='3';ws.forEach(function(w){w.classList.remove('off')});return}
      scene.dataset.ro='0';ws.forEach(function(w){w.classList.add('off')});
      setTimeout(function(){scene.dataset.ro='1'},1500);
      setTimeout(function(){scene.dataset.ro='2';ws.forEach(function(w,i){setTimeout(function(){w.classList.remove('off')},i*70)})},2300);
      setTimeout(function(){scene.dataset.ro='3'},2300+ws.length*70+500);
    }
    play();
  }

  /* Question picker. The Spanish page asks three questions in Spanish and two in English; the English page the other way round. */
  var ES=document.documentElement.lang==='es';
  var ANS_ES=[
    {lang:'es',text:'Jordan Torres debía entrar a las 7:30 y todavía no marca. Alexandra Rivera empieza a las 8:00. El domingo tiene un turno de caja abierto, de 12:00 a 8:00.',src:'De las marcas de hoy y el horario publicado'},
    {lang:'es',text:'Dana Kim está libre el domingo y lleva 32 horas esta semana, así que este turno la lleva a 40. Ana Colón ya tiene 40.',src:'Del horario publicado, 2 – 8 de nov.',prep:{t:'Añadir a Dana Kim el domingo 8 de noviembre',d:'Caja, 12:00 a 8:00, con Luis Medina.'}},
    {lang:'es',text:'Ana Colón tiene 40:00. Dana Kim tiene 32:04, así que un turno más de 8 horas la llevaría a 40:04. Nadie más pasa de 32 horas.',src:'De las tarjetas de tiempo, 2 – 8 de nov.'},
    {lang:'en',text:'Only Jordan Torres. On Saturday he clocked in at 7:52 for a shift that started at 7:30.',src:'From timecards, Nov 2 – 8'},
    {lang:'en',text:'Ana Colón, Dana Kim and Alexandra Rivera have clocked in. Jordan Torres was due at 7:30 and hasn’t clocked in yet.',src:'From today’s punches'}
  ];
  var W=ES?{approve:'Aprobar',approved:'Aprobado',wait:'Nada cambia hasta que apruebes.',done:'Dana queda el domingo, de 12:00 a 8:00. Solo es una muestra.',notNow:'Ahora no',left:'Se quedó igual. No cambió nada.'}:{approve:'Approve',approved:'Approved',wait:'Nothing changes until you approve.',done:'Dana is on Sunday, 12:00 to 8:00. Sample only.',notNow:'Not now',left:'Left as is. Nothing changed.'};
  var ANS=[
    {lang:'en',text:'Jordan Torres was due at 7:30 and hasn’t clocked in. Alexandra Rivera starts at 8:00. Sunday has one open register shift, 12:00 to 8:00.',src:'From today’s punches and the published schedule'},
    {lang:'en',text:'Dana Kim is off on Sunday and at 32 hours this week, so this shift brings her to 40. Ana Colón is already at 40.',src:'From the published schedule, Nov 2 – 8',prep:{t:'Add Dana Kim on Sunday, November 8',d:'Register, 12:00 to 8:00, with Luis Medina.'}},
    {lang:'en',text:'Ana Colón is at 40:00. Dana Kim is at 32:04, so one more 8-hour shift would bring her to 40:04. Everyone else is at 32 hours or less.',src:'From timecards, Nov 2 – 8'},
    {lang:'es',text:'Solo Jordan Torres. El sábado marcó entrada a las 7:52 y su turno empezaba a las 7:30.',src:'De los registros de tiempo, 2 – 8 de nov.'},
    {lang:'es',text:'Ana Colón, Dana Kim y Alexandra Rivera marcaron entrada. Jordan Torres debía entrar a las 7:30 y todavía no marca.',src:'De los registros de hoy'}
  ];
  if(ES)ANS=ANS_ES;
  var ans=$('#ans');
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function show(i){
    var a=ANS[i],es=a.lang==='es';
    var h='<div class="c-a fade" lang="'+a.lang+'"><div class="c-who"><span class="rm-badge">R</span>Rondo</div><p>'+esc(a.text)+'</p><span class="src"><i></i><span>'+esc(a.src)+'</span></span>';
    if(a.prep) h+='<div class="prep"><h4>'+esc(a.prep.t)+'</h4><p class="d">'+esc(a.prep.d)+'</p><div class="row"><button class="ok" type="button" aria-pressed="false" id="ans-ok">'+W.approve+'</button><small id="ans-m">'+W.wait+'</small></div></div>';
    ans.innerHTML=h+'</div>';
    var ok=$('#ans-ok');if(ok)ok.addEventListener('click',function(){ok.setAttribute('aria-pressed','true');ok.textContent=W.approved;$('#ans-m').textContent=W.done});
  }
  $$('.chips button').forEach(function(b){b.addEventListener('click',function(){
    $$('.chips button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});show(+b.dataset.q);
  })});
  show(0);

  /* Approval demo. */
  var ok=$('#ap-ok'),no=$('#ap-no'),steps=$$('#ap-chk div');
  ok.addEventListener('click',function(){
    if(ok.getAttribute('aria-pressed')==='true') return;
    ok.setAttribute('aria-pressed','true');ok.textContent=W.approved;no.hidden=true;
    steps.forEach(function(s,i){setTimeout(function(){s.classList.add('on')},V.still()?0:i*650)});
  });
  no.addEventListener('click',function(){
    ok.setAttribute('aria-pressed','false');ok.textContent=W.approve;steps.forEach(function(s){s.classList.remove('on')});
    $('#ap-chk').setAttribute('data-note','');steps[0].parentNode.firstElementChild.classList.remove('on');
    no.textContent=W.left;no.disabled=true;setTimeout(function(){no.textContent=W.notNow;no.disabled=false},2200);
  });
})();
