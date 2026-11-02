// Try the time clock: a working copy of the NEVORA PIN screen. Fictional; nothing is stored or sent.
(()=>{
 const k=document.getElementById('kio');if(!k)return;
 const $=id=>document.getElementById(id);
 const ES={'Time clock':'Registro de tiempo','Enter your PIN':'Ingresa tu PIN','Clear':'Borrar','Continue':'Continuar','Your PIN is separate from your portal password.':'Tu PIN es distinto de tu contraseña del portal.','Clock in recorded':'Tiempo registrado','Saved at':'Registrado','. This screen clears in eight seconds.':'. Esta pantalla se borra en ocho segundos.','Done':'Listo','Delete digit':'Borrar dígito'};
 const dots=[...$('kio-dots').children],go=$('kio-go'),live=$('kio-live'),pinStep=$('kio-pin'),okStep=$('kio-ok'),bar=$('kio-bar'),lang=$('kio-lang');
 let es=false,pin='',timer=0,last='';
 const loc=()=>es?'es-US':'en-US';
 const parts=d=>{const p=new Intl.DateTimeFormat(loc(),{hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(d);const v=t=>(p.find(x=>x.type===t)||{}).value||'';return{hm:v('hour')+':'+v('minute'),ap:v('dayPeriod').toUpperCase()}};
 const tick=()=>{const d=new Date(),{hm,ap}=parts(d),day=new Intl.DateTimeFormat(loc(),{weekday:'long',month:'long',day:'numeric'}).format(d),key=hm+ap+day;
  if(key===last)return;last=key;$('kio-hm').textContent=hm;$('kio-ap').textContent=ap;$('kio-date').textContent=day.charAt(0).toUpperCase()+day.slice(1)};
 const say=t=>{live.textContent=t};
 const render=()=>{dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));go.disabled=pin.length<4};
 const press=d=>{if(pin.length>=4){const s=$('kio-dots');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');return}pin+=d;render();say(es?pin.length+' de 4 dígitos':pin.length+' of 4 digits entered')};
 const inside=()=>k.contains(document.activeElement);
 const reset=()=>{clearTimeout(timer);const f=inside();pin='';render();okStep.hidden=true;pinStep.hidden=false;bar.classList.remove('run');say('');if(f)$('kio-pin-h').focus()};
 const submit=()=>{if(pin.length!==4)return;const d=new Date(),{hm,ap}=parts(d),day=new Intl.DateTimeFormat(loc(),{month:'short',day:'numeric'}).format(d);
  $('kio-saved').textContent=day+' · '+hm+' '+ap;const f=inside();pinStep.hidden=true;okStep.hidden=false;
  bar.classList.remove('run');void bar.offsetWidth;bar.classList.add('run');if(f)$('kio-ok-h').focus();clearTimeout(timer);timer=setTimeout(reset,8000)};
 k.querySelector('.kio-pad').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.d)press(b.dataset.d);else if(b.dataset.act==='clear'){pin='';render();say(es?'Borrado':'Cleared')}else if(b.dataset.act==='back'){pin=pin.slice(0,-1);render();say(es?pin.length+' de 4 dígitos':pin.length+' of 4 digits entered')}});
 go.addEventListener('click',submit);$('kio-done').addEventListener('click',reset);
 k.addEventListener('keydown',e=>{if(pinStep.hidden||e.metaKey||e.ctrlKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){e.preventDefault();press(e.key)}else if(e.key==='Backspace'){e.preventDefault();pin=pin.slice(0,-1);render()}
  else if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){e.preventDefault();submit()}else if(e.key==='Escape'){pin='';render()}});
 lang.addEventListener('click',()=>{es=!es;lang.setAttribute('aria-pressed',String(es));k.lang=es?'es':'en';
  k.querySelectorAll('[data-k-t]').forEach(n=>{const en=n.dataset.kT;n.textContent=es?(ES[en]||en):en});
  k.querySelectorAll('[data-k-l]').forEach(n=>{const en=n.dataset.kL;n.setAttribute('aria-label',es?(ES[en]||en):en)});last='';tick()});
 tick();let iv=setInterval(tick,1000);
 document.addEventListener('visibilitychange',()=>{clearInterval(iv);if(!document.hidden){tick();iv=setInterval(tick,1000)}});
})();
