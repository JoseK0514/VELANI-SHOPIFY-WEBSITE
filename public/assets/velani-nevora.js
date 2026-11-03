window.__fx=[];
(()=>{
 const $=s=>document.querySelector(s),big=matchMedia('(min-width:960px)');
 // Local nav: solid as soon as it sticks; names the section whose heading has passed
 const lnav=$('#lnav'),ink=$('#lnav-ink'),links=[...document.querySelectorAll('[data-spy]')];
 const heads=links.map(a=>{const t=document.getElementById(a.dataset.spy);return t&&(t.querySelector('h1,h2')||t)});
 let lastIdx=-1;
 const moveInk=i=>{if(!big.matches)return;if(i<0){ink.style.setProperty('--w',0);return}const a=links[i];ink.style.setProperty('--x',(a.offsetLeft+12)+'px');ink.style.setProperty('--w',a.offsetWidth-24)};
 __fx.push({always:true,el:document.body,run(p,r,vh){lnav.classList.toggle('solid',lnav.getBoundingClientRect().top<=0&&scrollY>2);
  // Nothing is current above the first chapter: the wordmark stands for the overview
  let idx=-1;heads.forEach((h,i)=>{if(h&&h.getBoundingClientRect().top<=vh*.45)idx=i});
  if(idx!==lastIdx){lastIdx=idx;links.forEach((a,i)=>i===idx?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));moveInk(idx)}}});
 addEventListener('resize',()=>{moveInk(lastIdx)});
 // Phone story: the pinned phone shows what each step describes; Alexandra's shift line fills with a live time
 const steps=[...document.querySelectorAll('.st')],pp=$('#pinPhone'),feed=$('#pinPhone .feed'),bar=$('#shiftbar'),now=$('#shiftNow');let si=-1;
 const show=i=>{if(i===si)return;si=i;steps.forEach((s,j)=>s.classList.toggle('on',j===i));feed.style.setProperty('--y',steps[i].dataset.y+'%');pp.classList.toggle('down',i>0)};show(0);
 __fx.push({always:true,el:$('#story'),run(p,r,vh,c){let best=0,bd=1e9;steps.forEach((s,i)=>{const b=s.getBoundingClientRect();const d=Math.abs(b.top+b.height/2-vh/2);if(d<bd){bd=d;best=i}});show(best);
  const sp=c((vh*.5-r.top)/r.height);bar.style.setProperty('--sp',sp.toFixed(3));const mins=Math.round(sp*480/15)*15,h=12+Math.floor(mins/60),m=mins%60;
  now.textContent=((h-1)%12+1)+':'+String(m).padStart(2,'0')+(h<12?' AM':' PM');now.style.setProperty('--tip',(sp*r.height).toFixed(0)+'px')}});
 // Owner screenshot: clip reveal, then hand the edge back to the slab's own ring and shadow
 const ow=$('#owner');ow.addEventListener('transitionend',e=>{if(e.propertyName==='clip-path')ow.style.clipPath='none'});
 // Local nav disclosure on narrow screens
 const tog=$('#lnav-tog'),list=$('#lnav-list');const setL=o=>{tog.setAttribute('aria-expanded',String(o));list.classList.toggle('open',o)};
 tog.addEventListener('click',()=>setL(tog.getAttribute('aria-expanded')!=='true'));list.addEventListener('click',e=>{if(e.target.closest('a'))setL(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tog.getAttribute('aria-expanded')==='true'){setL(false);tog.focus()}});
 big.addEventListener('change',e=>{if(e.matches)setL(false);else setV(false)});
 // "by Velani": the company links on wide screens (narrow screens keep them in the menu)
 const vb=$('#lnav-vbtn'),vm=$('#lnav-vmenu');const setV=o=>{if(!vb)return;vb.setAttribute('aria-expanded',String(o));vm.hidden=!o};
 if(vb){vb.addEventListener('click',()=>setV(vb.getAttribute('aria-expanded')!=='true'));
  vm.addEventListener('click',e=>{if(e.target.closest('a'))setV(false)});
  document.addEventListener('click',e=>{if(!e.target.closest('.lnav-v'))setV(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&vb.getAttribute('aria-expanded')==='true'){setV(false);vb.focus()}});
  vm.addEventListener('focusout',e=>{if(!e.relatedTarget||!e.currentTarget.parentNode.contains(e.relatedTarget))setV(false)});}
})();

// Try the time clock: a working copy of the NEVORA PIN screen, on the home and NEVORA pages.
// Fictional: any four digits work. The PIN lives only in this closure; nothing is stored, sent or logged.
(()=>{
 const k=document.getElementById('kio');if(!k)return;
 const $=id=>document.getElementById(id);
 // Spanish strings come from the NEVORA app's own time-clock copy where it has one
 const ES={'Time clock':'Registro de tiempo','Enter your PIN':'Ingresa tu PIN','Clear':'Borrar','Continue':'Continuar','Your PIN is separate from your portal password.':'Tu PIN es distinto de tu contraseña del portal.','Clock-in recorded':'Tiempo registrado','Saved at':'Registrado','Demo only. No hours were saved.':'Solo es una demostración. No se guardaron horas.','Clock in again':'Registrar de nuevo','Delete digit':'Borrar dígito'};
 const dots=[...$('kio-dots').children],go=$('kio-go'),live=$('kio-live'),pinStep=$('kio-pin'),okStep=$('kio-ok'),lang=$('kio-lang'),langT=$('kio-lang-t');
 let es=false,pin='',last='';
 const loc=()=>es?'es-US':'en-US';
 const parts=d=>{const p=new Intl.DateTimeFormat(loc(),{hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(d);const v=t=>(p.find(x=>x.type===t)||{}).value||'';return{hm:v('hour')+':'+v('minute'),ap:v('dayPeriod').toUpperCase()}};
 const tick=()=>{const d=new Date(),{hm,ap}=parts(d),day=new Intl.DateTimeFormat(loc(),{weekday:'long',month:'long',day:'numeric'}).format(d),key=hm+ap+day;
  if(key===last)return;last=key;$('kio-hm').textContent=hm;$('kio-ap').textContent=ap;$('kio-date').textContent=day.charAt(0).toUpperCase()+day.slice(1)};
 // Announce the count or the clearing, never the digits themselves
 const say=t=>{live.textContent=t};
 const count=()=>say(es?pin.length+' de 4 dígitos':pin.length+' of 4 digits entered');
 const render=()=>{dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));go.disabled=pin.length<4};
 const press=d=>{if(pin.length>=4){const s=$('kio-dots');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');say(es?'Ya hay 4 dígitos':'4 digits already entered');return}pin+=d;render();count()};
 const back=()=>{if(!pin)return;pin=pin.slice(0,-1);render();count()};
 const clear=()=>{if(!pin)return;pin='';render();say(es?'Borrado':'Cleared')};
 const inside=()=>k.contains(document.activeElement);
 // Confirmation stays until the visitor chooses Try again (the real workplace tablet clears itself; this page does not)
 const submit=()=>{if(pin.length!==4)return;const d=new Date(),{hm,ap}=parts(d),day=new Intl.DateTimeFormat(loc(),{month:'short',day:'numeric'}).format(d);
  pin='';render();$('kio-saved').textContent=day+' · '+hm+' '+ap;$('kio-dot').textContent=/\.$/.test(ap)?'':'.';const f=inside();pinStep.hidden=true;okStep.hidden=false;
  const ck=k.querySelector('.kio-check');ck.style.animation='none';void ck.offsetWidth;ck.style.animation='';say('');if(f)$('kio-ok-h').focus()};
 const again=()=>{const f=inside();pin='';render();okStep.hidden=true;pinStep.hidden=false;say('');if(f)$('kio-pin-h').focus()};
 k.querySelector('.kio-pad').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.d)press(b.dataset.d);else if(b.dataset.act==='clear')clear();else if(b.dataset.act==='back')back()});
 go.addEventListener('click',submit);$('kio-done').addEventListener('click',again);
 // Physical keys only while focus is inside the demo; Enter and Space keep their native button behaviour
 k.addEventListener('keydown',e=>{if(pinStep.hidden||e.metaKey||e.ctrlKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){e.preventDefault();press(e.key)}else if(e.key==='Backspace'){e.preventDefault();back()}else if(e.key==='Escape'){clear()}});
 lang.addEventListener('click',()=>{es=!es;k.lang=es?'es':'en';langT.textContent=es?'English':'Español';langT.lang=es?'en':'es';
  k.querySelectorAll('[data-k-t]').forEach(n=>{const en=n.dataset.kT;n.textContent=es?(ES[en]||en):en});
  k.querySelectorAll('[data-k-l]').forEach(n=>{const en=n.dataset.kL;n.setAttribute('aria-label',es?(ES[en]||en):en)});say('');last='';tick()});
 // The clock ticks only while the demo is on screen and the tab is visible
 let iv=0,onScreen=true;const run=()=>{clearInterval(iv);iv=0;if(onScreen&&!document.hidden){tick();iv=setInterval(tick,1000)}};
 if('IntersectionObserver' in window)new IntersectionObserver(en=>{onScreen=en[en.length-1].isIntersecting;run()}).observe(k);
 document.addEventListener('visibilitychange',run);tick();run();
})();
