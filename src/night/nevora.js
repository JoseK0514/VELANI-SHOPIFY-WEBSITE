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
