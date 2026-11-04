(()=>{
 const d=document,root=d.documentElement;root.classList.remove('no-js');root.classList.add('js');
 // The boot script marks the document "still" if this file has not run after 2.5s (everything shows, nothing animates). Arriving late, keep it that way.
 clearTimeout(window.__pre);const late=root.classList.contains('still');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 // Headings: words rise from behind a mask in reading order. Screen readers get the whole sentence once.
 if(!late)d.querySelectorAll('.rise').forEach(el=>{
  el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
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
 const mb=d.getElementById('gmenu-btn'),mm=d.getElementById('gmenu'),behind=[...d.querySelectorAll('main,footer,.lnav,.skip')];
 const setMenu=o=>{if(!mb)return;mb.setAttribute('aria-expanded',String(o));mb.setAttribute('aria-label',o?'Close menu':'Menu');mm.hidden=!o;mb.querySelector('.i-open').hidden=o;mb.querySelector('.i-close').hidden=!o;d.body.style.overflow=o?'hidden':'';behind.forEach(x=>x.inert=o);if(o)nav.classList.remove('tuck')};
 if(mb){mb.addEventListener('click',()=>setMenu(mb.getAttribute('aria-expanded')!=='true'));
  mm.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&mb.getAttribute('aria-expanded')==='true'){setMenu(false);mb.focus()}});
  matchMedia('(min-width:834px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});}
 nav&&nav.addEventListener('focusin',()=>nav.classList.remove('tuck'));
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
