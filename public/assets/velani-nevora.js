window.__fx=[];
(()=>{
 const $=s=>document.querySelector(s),rm=matchMedia('(prefers-reduced-motion: reduce)'),big=matchMedia('(min-width:960px)');
 // Local nav: solid as soon as it sticks; names the section whose heading has passed
 const lnav=$('#lnav'),ink=$('#lnav-ink'),links=[...document.querySelectorAll('[data-spy]')];
 const heads=links.map(a=>{const t=document.getElementById(a.dataset.spy);return t&&(t.querySelector('h1,h2')||t)});
 let lastIdx=-1;
 const moveInk=i=>{if(!big.matches)return;const a=links[i];ink.style.setProperty('--x',(a.offsetLeft+12)+'px');ink.style.setProperty('--w',a.offsetWidth-24)};
 __fx.push({always:true,el:document.body,run(p,r,vh){lnav.classList.toggle('solid',lnav.getBoundingClientRect().top<=0&&scrollY>2);
  let idx=0;heads.forEach((h,i)=>{if(h&&h.getBoundingClientRect().top<=vh*.45)idx=i});
  if(idx!==lastIdx){lastIdx=idx;links.forEach((a,i)=>i===idx?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));moveInk(idx)}}});
 addEventListener('resize',()=>{if(lastIdx>=0)moveInk(lastIdx)});
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
 big.addEventListener('change',e=>{if(e.matches)setL(false)});
})();

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
 const count=()=>say(es?pin.length+' de 4 dígitos':pin.length+' of 4 digits entered');
 const back=()=>{pin=pin.slice(0,-1);render();count()};
 const clear=()=>{pin='';render();say(es?'Borrado':'Cleared')};
 const render=()=>{dots.forEach((d,i)=>d.classList.toggle('on',i<pin.length));go.disabled=pin.length<4};
 const press=d=>{if(pin.length>=4){const s=$('kio-dots');s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake');return}pin+=d;render();count()};
 const inside=()=>k.contains(document.activeElement);
 const reset=()=>{clearTimeout(timer);const f=inside();pin='';render();okStep.hidden=true;pinStep.hidden=false;bar.classList.remove('run');say('');if(f)$('kio-pin-h').focus()};
 const submit=()=>{if(pin.length!==4)return;const d=new Date(),{hm,ap}=parts(d),day=new Intl.DateTimeFormat(loc(),{month:'short',day:'numeric'}).format(d);
  $('kio-saved').textContent=day+' · '+hm+' '+ap;const f=inside();pinStep.hidden=true;okStep.hidden=false;const ck=k.querySelector('.kio-check');ck.style.animation='none';void ck.offsetWidth;ck.style.animation='';
  bar.classList.remove('run');void bar.offsetWidth;bar.classList.add('run');if(f)$('kio-ok-h').focus();clearTimeout(timer);timer=setTimeout(reset,8000)};
 k.querySelector('.kio-pad').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.d)press(b.dataset.d);else if(b.dataset.act==='clear')clear();else if(b.dataset.act==='back')back()});
 go.addEventListener('click',submit);$('kio-done').addEventListener('click',reset);
 k.addEventListener('keydown',e=>{if(pinStep.hidden||e.metaKey||e.ctrlKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){e.preventDefault();press(e.key)}else if(e.key==='Backspace'){e.preventDefault();back()}
  else if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){e.preventDefault();submit()}else if(e.key==='Escape')clear()});
 lang.addEventListener('click',()=>{es=!es;k.lang=es?'es':'en';const lt=$('kio-lang-t');lt.textContent=es?'English':'Español';lt.lang=es?'en':'es';
  k.querySelectorAll('[data-k-t]').forEach(n=>{const en=n.dataset.kT;n.textContent=es?(ES[en]||en):en});
  k.querySelectorAll('[data-k-l]').forEach(n=>{const en=n.dataset.kL;n.setAttribute('aria-label',es?(ES[en]||en):en)});last='';tick()});
 tick();let iv=setInterval(tick,1000);
 document.addEventListener('visibilitychange',()=>{clearInterval(iv);if(!document.hidden){tick();iv=setInterval(tick,1000)}});
})();
