// Try the time clock: a working copy of the NEVORA PIN screen, on the home and NEVORA pages.
// Fictional: any four digits work. The PIN lives only in this closure; nothing is stored, sent or logged.
(()=>{
 const k=document.getElementById('kio');if(!k)return;
 const $=id=>document.getElementById(id);
 // Spanish strings come from the NEVORA app's own time-clock copy where it has one ("Clock In" = "Marcar entrada",
 // "Clock In Recorded" = "Entrada registrada"). src/night.mjs reads this table to render the Spanish page's demo in Spanish.
 const ES={'Time clock':'Registro de tiempo','Enter your PIN':'Ingresa tu PIN','Clear':'Borrar','Continue':'Continuar','Your PIN is separate from your portal password.':'Tu PIN es distinto de tu contraseña del portal.','Clock-in recorded':'Entrada registrada','Recorded at':'Registrada el','This demo keeps nothing.':'Solo es una demostración. No se guarda nada.','Done':'Listo','PIN not recognized for this location. Try again or ask your manager.':'PIN no reconocido en esta ubicación. Inténtalo de nuevo o pregunta a tu gerente.','Clock-out recorded':'Salida registrada','Shift length':'Duración del turno','See her timecard':'Mira su tarjeta de tiempo','Delete digit':'Borrar dígito','Tablet registered':'Tableta registrada','New York time · Main Street iPad':'Hora de Nueva York · iPad de Main Street'};
 const dots=[...$('kio-dots').children],go=$('kio-go'),live=$('kio-live'),pinStep=$('kio-pin'),okStep=$('kio-ok'),lang=$('kio-lang'),langT=$('kio-lang-t');
 let es=false,pin='',last='';
 const loc=()=>es?'es-PR':'en-US';
 // Spanish writes "p. m." (lowercase, a space inside, never split); browsers differ ("p.m.", "p. m."), so it is normalized
 const parts=d=>{const p=new Intl.DateTimeFormat(loc(),{hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(d);const v=t=>(p.find(x=>x.type===t)||{}).value||'';const ap=v('dayPeriod');return{hm:v('hour')+':'+v('minute'),ap:es?ap.toLowerCase().replace(/^([ap])\.?\s*m\.?$/,'$1.\u00a0m.'):ap.toUpperCase()}};
 // The demo runs on the page's sample week (Saturday, November 7), so it agrees with the screens around it
 const W=()=>window.NVWEEK,sample=m=>{const h=Math.floor(m/60)%12||12;return{hm:h+':'+String(m%60).padStart(2,'0'),ap:es?(m<720?'a.\u00a0m.':'p.\u00a0m.'):(m<720?'AM':'PM')}};
 const tick=()=>{if(!W()&&document.querySelector('[data-day]'))return;const d=new Date(),{hm,ap}=W()?sample(W().now()):parts(d),day=W()?(es?'sábado, 7 de noviembre':'Saturday, November 7'):new Intl.DateTimeFormat(loc(),{weekday:'long',month:'long',day:'numeric'}).format(d),key=hm+ap+day;
  if(key===last)return;last=key;$('kio-hm').textContent=hm;$('kio-ap').textContent=ap;$('kio-date').textContent=day.charAt(0).toUpperCase()+day.slice(1)};
 // Announce the count or the clearing, never the digits themselves
 const say=t=>{live.textContent=t};
 const count=()=>say(es?pin.length+' de 4 dígitos':pin.length+' of 4 digits entered');
 const err=$('kio-err'),box=$('kio-dots'),setErr=on=>{box.classList.toggle('err',on);err.hidden=!on};
 const render=()=>{dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));go.disabled=pin.length<4;if(pin.length)setErr(false)};
 const press=d=>{if(pin.length>=4){const s=$('kio-dots');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');say(es?'Ya hay 4 dígitos':'4 digits already entered');return}pin+=d;render();count()};
 const back=()=>{if(!pin)return;pin=pin.slice(0,-1);render();count()};
 const clear=()=>{if(!pin)return;pin='';render();say(es?'Borrado':'Cleared')};
 const inside=()=>k.contains(document.activeElement);
 // Confirmation stays until the visitor chooses Try again (the real workplace tablet clears itself; this page does not)
 const submit=()=>{if(pin.length!==4)return;
  // 0000 is the demo's unrecognized PIN: the field turns red with the kiosk's own message; focus stays on the keypad
  if(pin==='0000'){pin='';dots.forEach(d=>d.classList.remove('on'));go.disabled=true;setErr(true);if(!matchMedia('(prefers-reduced-motion: reduce)').matches){box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake')}$('kio-pin-h').focus({preventScroll:true});say('');setTimeout(()=>say(err.textContent),60);return}
  const out=W()&&W().isIn(),res=out?W().clockOut():null,head=$('kio-ok-h'),len=$('kio-len');head.dataset.kT=out?'Clock-out recorded':'Clock-in recorded';head.textContent=es?ES[head.dataset.kT]:head.dataset.kT;len.hidden=!out;if(out)$('kio-len-v').textContent=Math.floor(res.len/60)+':'+String(res.len%60).padStart(2,'0');
  const d=new Date(),{hm,ap}=W()?sample(out?res.at:W().clockIn()):parts(d),day=W()?(es?'7 nov':'Nov 7'):new Intl.DateTimeFormat(loc(),{month:'short',day:'numeric'}).format(d);
  // Continue was just used (it is the only way here), so focus goes to the result in every browser. Before, render() disabled
  // the focused button first, Chromium dropped focus to the page and the result was never focused
  pin='';render();$('kio-saved').textContent=es?day.replace(/\.$/,'')+' · '+hm+'\u00a0'+ap:day+' · '+hm+' '+ap;$('kio-dot').textContent=/\.$/.test(ap)?'':'.';pinStep.hidden=true;okStep.hidden=false;
  const ck=k.querySelector('.kio-check');ck.style.animation='none';void ck.offsetWidth;ck.style.animation='';
  $('kio-ok-h').focus({preventScroll:true});
  // The live region sits outside both steps, so it is still read when the PIN step hides
  say('');setTimeout(()=>say((out?(es?'Salida registrada a las ':'Clock-out recorded at '):(es?'Entrada registrada a las ':'Clock-in recorded at '))+hm+' '+ap),60)};
 const again=()=>{const f=inside();pin='';setErr(false);render();okStep.hidden=true;pinStep.hidden=false;say('');if(f)$('kio-pin-h').focus({preventScroll:true})};
 k.querySelector('.kio-pad').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.d)press(b.dataset.d);else if(b.dataset.act==='clear')clear();else if(b.dataset.act==='back')back()});
 go.addEventListener('click',submit);$('kio-done').addEventListener('click',again);
 // Physical keys only while focus is inside the demo; Enter and Space keep their native button behaviour
 k.addEventListener('keydown',e=>{if(pinStep.hidden||e.metaKey||e.ctrlKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){e.preventDefault();press(e.key)}else if(e.key==='Backspace'){e.preventDefault();back()}else if(e.key==='Escape'){clear()}});
 const setLang=v=>{es=v;k.lang=es?'es':'en';langT.textContent=es?'English':'Español';langT.lang=es?'en':'es';
  k.querySelectorAll('[data-k-t]').forEach(n=>{const en=n.dataset.kT;n.textContent=es?(ES[en]||en):en});
  k.querySelectorAll('[data-k-l]').forEach(n=>{const en=n.dataset.kL;n.setAttribute('aria-label',es?(ES[en]||en):en)});say('');last='';tick()};
 lang.addEventListener('click',()=>setLang(!es));
 // On a Spanish page the demo starts in Spanish (the page already renders it so; this keeps the script's state in step)
 if(/^es\b/i.test(document.documentElement.lang))setLang(true);
 // The clock ticks only while the demo is on screen and the tab is visible
 let iv=0,onScreen=true;const run=()=>{clearInterval(iv);iv=0;if(onScreen&&!document.hidden){tick();iv=setInterval(tick,1000)}};
 if('IntersectionObserver' in window)new IntersectionObserver(en=>{onScreen=en[en.length-1].isIntersecting;run()}).observe(k);
 document.addEventListener('visibilitychange',run);tick();run();
})();
