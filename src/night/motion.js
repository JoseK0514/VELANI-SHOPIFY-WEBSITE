(()=>{
 const d=document,root=d.documentElement;root.classList.remove('no-js');root.classList.add('js');
 // The boot script marks the document "still" if this file has not run after 2.5s (everything shows, nothing animates). Arriving late, keep it that way.
 clearTimeout(window.__pre);const late=root.classList.contains('still');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),es=/^es\b/i.test(root.lang);
 // Headings: words rise from behind a mask in reading order. Screen readers get the whole sentence once.
 // The first section is shown at first paint (CSS settles it in), and a heading with no words (an image) is left alone.
 if(!late)d.querySelectorAll('.rise').forEach(el=>{
  const words=el.textContent.replace(/\s+/g,' ').trim();if(!words||el.closest('main>section:first-of-type'))return;
  el.setAttribute('aria-label',words);
  let i=0;const walk=n=>{[...n.childNodes].forEach(c=>{
   if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/([ \t\n\r]+)/).forEach(p=>{if(!p)return;if(/^[ \t\n\r]+$/.test(p)){f.appendChild(d.createTextNode(p));return}
     const w=d.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');const s=d.createElement('span');s.textContent=p;s.style.setProperty('--i',Math.min(i++,7));w.appendChild(s);f.appendChild(w)});c.replaceWith(f)}
   else if(c.nodeType===1&&!c.classList.contains('w')&&!c.classList.contains('sr')){if(c.classList.contains('nw')){c.setAttribute('aria-hidden','true')}walk(c)}
  })};walk(el)});
 root.classList.remove('pre');
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -12% 0px'});
 d.querySelectorAll('.rise,.draw,.fade,[data-in]').forEach(el=>io.observe(el));
 // Nav: a hairline once you leave the top; tucks after 24px of scrolling down, returns after 12px up
 const nav=d.getElementById('gnav'),tuckable=nav&&!nav.classList.contains('static');let lastY=scrollY,dir=0,anchor=scrollY;
 const mb=d.getElementById('gmenu-btn'),mm=d.getElementById('gmenu'),behind=[...d.querySelectorAll('main,footer,.lnav,.skip,#ast-root')];
 const setMenu=o=>{if(!mb)return;mb.setAttribute('aria-expanded',String(o));mb.setAttribute('aria-label',o?(es?'Cerrar menú':'Close menu'):(es?'Menú':'Menu'));mm.hidden=!o;mb.querySelector('.i-open').hidden=o;mb.querySelector('.i-close').hidden=!o;d.body.style.overflow=o?'hidden':'';behind.forEach(x=>x.inert=o);if(o)nav.classList.remove('tuck')};
 if(mb){mb.addEventListener('click',()=>setMenu(mb.getAttribute('aria-expanded')!=='true'));
  mm.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&mb.getAttribute('aria-expanded')==='true'){setMenu(false);mb.focus()}});
  matchMedia('(min-width:834px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});}
 nav&&nav.addEventListener('focusin',()=>nav.classList.remove('tuck'));
 // Header menus (desktop): each is a disclosure with one open state, and only one is open at a time. Only its button opens
 // and closes it (click, Enter or Space; ArrowDown opens and focuses the first item); Escape, a click outside or focus leaving closes it.
 // Hover never opens a menu, so a click never fights the pointer.
 const dds=[...d.querySelectorAll('.gnav-dd')].map(dd=>({dd,btn:dd.querySelector('.gnav-ddbtn')})).filter(x=>x.btn);
 if(dds.length){const set=(x,o)=>{x.dd.classList.toggle('open',o);x.btn.setAttribute('aria-expanded',String(o))};
  const openOne=()=>dds.find(x=>x.dd.classList.contains('open'));
  dds.forEach(x=>{
   x.btn.addEventListener('click',()=>{const o=!x.dd.classList.contains('open');dds.forEach(y=>y!==x&&set(y,false));set(x,o)});
   x.btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();dds.forEach(y=>y!==x&&set(y,false));set(x,true);const first=x.dd.querySelector('.gnav-ddmenu a');first&&first.focus()}});
   x.dd.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(x.dd.classList.contains('open')&&!x.dd.contains(d.activeElement))set(x,false)}));
  });
  d.addEventListener('keydown',e=>{const x=openOne();if(e.key!=='Escape'||!x)return;const inside=x.dd.contains(d.activeElement);set(x,false);if(inside)x.btn.focus()});
  d.addEventListener('click',e=>{const x=openOne();if(x&&!x.dd.contains(e.target))set(x,false)});}
 // Language switch: keep the visitor's place. Both languages use the same section ids, so the current #section carries over
 // (unless the link already names a section, as for an English-only page whose closest Spanish page is another one)
 d.querySelectorAll('.lang-sw a[hreflang]:not([aria-current])').forEach(a=>a.addEventListener('click',()=>{const h=location.hash;if(/^#[\w-]+$/.test(h)&&!a.hash)a.hash=h}));
 // Rows that scroll sideways on narrow screens are reachable by keyboard only while they actually scroll
 const sx=[...d.querySelectorAll('[data-scroll-x]')];const syncX=()=>sx.forEach(el=>{if(el.scrollWidth>el.clientWidth+1)el.tabIndex=0;else el.removeAttribute('tabindex')});syncX();addEventListener('resize',syncX);
 // Footer groups
 const fd=[...d.querySelectorAll('.foot-cols details')],wide=matchMedia('(min-width:834px)');
 const td=[...d.querySelectorAll('.doc-toc')],tocWide=matchMedia('(min-width:600px)');const syncToc=()=>td.forEach(x=>x.open=tocWide.matches);syncToc();tocWide.addEventListener('change',syncToc);
 const syncFoot=()=>fd.forEach(x=>x.open=wide.matches);syncFoot();wide.addEventListener('change',syncFoot);
 // Scroll-linked effects registered by each page. p = progress through a pinned track (0..1)
 const fx=window.__fx||[];const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
 // Measure the small viewport (svh) once per resize: on phones innerHeight changes as the browser
 // toolbar shows and hides, which would make pinned scenes jump mid-scroll.
 const probe=d.createElement('div');probe.setAttribute('aria-hidden','true');probe.style.cssText='position:fixed;left:0;top:0;width:0;height:100vh;height:100svh;visibility:hidden;pointer-events:none';d.body.appendChild(probe);
 const measure=()=>{window.__svh=probe.offsetHeight||innerHeight};measure();
 let ticking=false;
 const frame=()=>{ticking=false;const vh=window.__svh,y=Math.min(Math.max(scrollY,0),Math.max(0,root.scrollHeight-innerHeight));
  if(nav&&!(mb&&mb.getAttribute('aria-expanded')==='true')){nav.classList.toggle('scrolled',y>8);
   if(tuckable&&!reduce.matches&&!nav.contains(d.activeElement)){const dy=y-lastY;
    // A jump (hash landing, in-page link, restored position) is not scrolling: it never hides the header
    if(Math.abs(dy)>innerHeight/2){dir=0;anchor=y;nav.classList.remove('tuck')}else if(dy){const s=Math.sign(dy);if(s!==dir){dir=s;anchor=lastY}}
    if(dir>0&&y-anchor>24&&y>240)nav.classList.add('tuck');else if((dir<0&&anchor-y>12)||y<120)nav.classList.remove('tuck')}
   lastY=y}
  for(const f of fx){if(reduce.matches&&!f.always)continue;const r=f.el.getBoundingClientRect();const track=Math.max(1,r.height-vh);f.run(clamp(-r.top/track),r,vh,clamp)}
 };
 const req=()=>{if(!ticking){ticking=true;requestAnimationFrame(frame)}};
 addEventListener('scroll',req,{passive:true});addEventListener('resize',()=>{measure();req()});req();
 const jump=()=>{lastY=anchor=scrollY;dir=0;nav&&nav.classList.remove('tuck')};addEventListener('hashchange',jump);addEventListener('pageshow',jump);
 const resetAll=()=>fx.forEach(f=>f.reset&&f.reset());
 reduce.addEventListener('change',()=>{if(reduce.matches)resetAll();req()});
 if(reduce.matches)resetAll();
})();

/* Plans: an example calendar from the visitor's clock (Nov 10 inspection: the trial starts when the workplace is ready, so no
   date on the page is a promise). It shows 30 days as if a workplace were ready today, and says so. */
(()=>{
 const cal=document.querySelector('[data-cal]');if(!cal)return;
 const es=/^es\b/i.test(document.documentElement.lang),loc=es?'es':'en-US';
 const d0=new Date();d0.setHours(12,0,0,0);const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};const d30=add(d0,29);
 const long=d=>d.toLocaleDateString(loc,{weekday:'long',month:'long',day:'numeric'});
 const start=add(d0,-((d0.getDay()+6)%7)),end=add(d30,(7-d30.getDay())%7);
 const month=d=>d.toLocaleDateString(loc,{month:'long'}),cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
 const head=cap(month(d0))+(month(d0)!==month(d30)?(es?' a ':' to ')+month(d30):'')+' '+d30.getFullYear();
 const wk=[...Array(7)].map((_,i)=>add(start,i).toLocaleDateString(loc,{weekday:'narrow'}));
 let cells='';for(let d=start;d<=end;d=add(d,1)){const n=Math.round((d-d0)/864e5);const inT=n>=0&&n<=29;const first=d.getDate()===1;
  cells+='<span class="c'+(inT?' in':'')+(n===0?' d1':'')+(n===29?' d30':'')+'"><b>'+(first?'<span class="mo">'+d.toLocaleDateString(loc,{month:'short'}).replace('.','')+' </span>':'')+d.getDate()+'</b>'+(n===0?'<i>'+(es?'Día 1':'Day 1')+'</i>':n===29?'<i>'+(es?'Día 30':'Day 30')+'</i>':'')+'</span>'}
 cal.innerHTML='<p class="cal-h">'+head+'</p><div class="cal-g">'+wk.map(w=>'<span class="w">'+w+'</span>').join('')+cells+'</div><p class="cal-key">'+(es?'Ejemplo: un lugar de trabajo listo hoy. Tu día 1 es el día en que tu lugar de trabajo queda listo.':'Example: a workplace that’s ready today. Your day 1 is the day your workplace is ready.')+'</p>';
 cal.setAttribute('aria-label',cal.getAttribute('aria-label')+': '+long(d0)+' – '+long(d30));cal.hidden=false;
})();
(()=>{
 const d=document;
 // Home (Nov 10): NEVORA in three parts is a tab list. Click or arrow keys (Home and End too) pick a part; focus follows with the keys
 const tl=d.querySelector('.nh-tabs');if(tl){const ts=[...tl.querySelectorAll('[role=tab]')];const pick=(b,f)=>{ts.forEach(x=>{const on=x===b;x.setAttribute('aria-selected',String(on));x.tabIndex=on?0:-1;d.getElementById(x.getAttribute('aria-controls')).hidden=!on});if(f)b.focus()};
  ts.forEach((b,i)=>{b.addEventListener('click',()=>pick(b));b.addEventListener('keydown',e=>{const n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?ts.length-1:null;if(n===null)return;e.preventDefault();pick(ts[(n+ts.length)%ts.length],true)})})}
})();
