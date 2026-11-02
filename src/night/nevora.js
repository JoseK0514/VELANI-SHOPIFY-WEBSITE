window.__fx=[];
(()=>{
 const $=s=>document.querySelector(s),rm=matchMedia('(prefers-reduced-motion: reduce)'),big=matchMedia('(min-width:960px)');
 const pinOK=matchMedia('(min-width:1024px) and (min-height:600px)');
 // Local nav: solid as soon as it sticks; names the section whose heading has passed
 const lnav=$('#lnav'),cur=$('#lnav-cur'),ink=$('#lnav-ink'),links=[...document.querySelectorAll('[data-spy]')];
 const heads=links.map(a=>{const t=document.getElementById(a.dataset.spy);return t&&(t.querySelector('h1,h2')||t)});
 let lastIdx=-1;
 const moveInk=i=>{if(!big.matches)return;const a=links[i];ink.style.setProperty('--x',(a.offsetLeft+12)+'px');ink.style.setProperty('--w',a.offsetWidth-24)};
 __fx.push({always:true,el:document.body,run(p,r,vh){lnav.classList.toggle('solid',lnav.getBoundingClientRect().top<=0&&scrollY>2);
  let idx=0;heads.forEach((h,i)=>{if(h&&h.getBoundingClientRect().top<=vh*.45)idx=i});
  if(idx!==lastIdx){lastIdx=idx;links.forEach((a,i)=>i===idx?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current'));cur.textContent=links[idx].textContent;moveInk(idx)}}});
 addEventListener('resize',()=>{if(lastIdx>=0)moveInk(lastIdx)});
 // Phone story: the pinned phone shows what each step describes; Alexandra's shift line fills with a live time
 const steps=[...document.querySelectorAll('.st')],pp=$('#pinPhone'),feed=$('#pinPhone .feed'),bar=$('#shiftbar'),now=$('#shiftNow');let si=-1;
 const show=i=>{if(i===si)return;si=i;steps.forEach((s,j)=>s.classList.toggle('on',j===i));feed.style.setProperty('--y',steps[i].dataset.y+'%');pp.classList.toggle('down',i>0)};show(0);
 __fx.push({always:true,el:$('#story'),run(p,r,vh,c){let best=0,bd=1e9;steps.forEach((s,i)=>{const b=s.getBoundingClientRect();const d=Math.abs(b.top+b.height/2-vh/2);if(d<bd){bd=d;best=i}});show(best);
  const sp=c((vh*.5-r.top)/r.height);bar.style.setProperty('--sp',sp.toFixed(3));const mins=Math.round(sp*480/15)*15,h=12+Math.floor(mins/60),m=mins%60;
  now.textContent=((h-1)%12+1)+':'+String(m).padStart(2,'0')+(h<12?' AM':' PM');now.style.setProperty('--tip',(sp*r.height).toFixed(0)+'px')}});
 // Time clock: scrolling the pinned section steps the tablet; tabs jump to a step without flicker
 const tabs=[...document.querySelectorAll('.ktabs [role=tab]')],imgs=[...document.querySelectorAll('#kdev img[data-k]')],note=$('#knote'),kdev=$('#kdev'),clock=$('#clock');
 const notes=['Four digits, then Continue. The screen reminds him that his PIN is different from the password he uses to sign in to NEVORA. The Español button is in the corner.','NEVORA shows the time it saved, 2:17 PM, then clears the screen after eight seconds for the next person.','When he comes back, the same PIN shows his options: clock out or start a break.'];
 let ki=0,wasT;
 const swap=i=>{imgs.forEach(m=>{const k=+m.dataset.k;m.classList.toggle('was',m.classList.contains('on')&&k!==i);m.classList.toggle('on',k===i)});clearTimeout(wasT);wasT=setTimeout(()=>imgs.forEach(m=>m.classList.remove('was')),380)};
 const setK=(i,focus,user)=>{if(i===ki&&!focus&&!user)return;const changed=i!==ki;ki=i;if(changed)swap(i);
  tabs.forEach(t=>{const on=+t.dataset.i===i;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;if(on&&focus)t.focus()});
  kdev.setAttribute('aria-labelledby','kt-'+i);note.setAttribute('aria-live',user?'polite':'off');note.textContent=notes[i];
  kdev.classList.remove('k1');if(i===1){void kdev.offsetWidth;kdev.classList.add('k1')}};
 let lock=-1,lockT;const unlock=()=>{lock=-1;window.__req&&__req()};
 const goK=(i,focus)=>{setK(i,focus,true);if(!pinOK.matches)return;lock=i;const top=clock.getBoundingClientRect().top+scrollY,track=clock.offsetHeight-(window.__svh||innerHeight);
  scrollTo({top:top+track*(i+.5)/3,behavior:rm.matches?'auto':'smooth'});clearTimeout(lockT);lockT=setTimeout(unlock,1000)};
 addEventListener('scrollend',unlock);['wheel','touchstart'].forEach(t=>addEventListener(t,()=>{if(lock>=0)unlock()},{passive:true}));
 tabs.forEach((t,k)=>{t.addEventListener('click',()=>goK(+t.dataset.i));t.addEventListener('keydown',e=>{
  if(e.key==='Home'||e.key==='End'){e.preventDefault();goK(e.key==='Home'?0:2,true);return}
  const d={ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key]||0;if(!d)return;e.preventDefault();goK((k+d+3)%3,true)})});
 __fx.push({always:true,el:clock,run(p){if(!pinOK.matches||lock>=0)return;setK(Math.min(2,Math.floor(p*3)))}});
 // Owner screenshot: clip reveal, then hand the edge back to the slab's own ring and shadow
 const ow=$('#owner');ow.addEventListener('transitionend',e=>{if(e.propertyName==='clip-path')ow.style.clipPath='none'});
 // Local nav disclosure on narrow screens
 const tog=$('#lnav-tog'),list=$('#lnav-list');const setL=o=>{tog.setAttribute('aria-expanded',String(o));list.classList.toggle('open',o)};
 tog.addEventListener('click',()=>setL(tog.getAttribute('aria-expanded')!=='true'));list.addEventListener('click',e=>{if(e.target.closest('a'))setL(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tog.getAttribute('aria-expanded')==='true'){setL(false);tog.focus()}});
 big.addEventListener('change',e=>{if(e.matches)setL(false)});
})();
