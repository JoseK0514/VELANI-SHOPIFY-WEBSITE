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
/* Home first screen: the light that follows the pointer, and "A Saturday at Northside Coffee" (sample data, browser only). */
(()=>{
 const d=document,root=d.documentElement,hero=d.querySelector('.hpanel.sig');if(!hero)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
 // The launcher stays out of the first screen and off the live objects below it
 if('IntersectionObserver' in window){root.classList.add('sig-top');const busy=new Set([hero]),io=new IntersectionObserver(es=>{es.forEach(e=>busy[e.isIntersecting&&(e.target!==hero||e.intersectionRatio>.35)?'add':'delete'](e.target));root.classList.toggle('sig-top',busy.size>0)},{threshold:[0,.35,1]});[hero,...d.querySelectorAll('.hn-phone,.hn-cards,.rc-flow,#kio')].forEach(el=>io.observe(el))}
 // Light: target from the pointer, eased with a slow lerp; runs only while it is still moving
 const light=hero.querySelector('.hlight');
 if(light&&fine&&!reduce){let tx=0,ty=0,x=0,y=0,raf=0;
  const step=()=>{x+=(tx-x)*.045;y+=(ty-y)*.045;light.style.transform='translate3d('+(x*9).toFixed(2)+'vw,'+(y*7).toFixed(2)+'vh,0)';raf=Math.abs(tx-x)+Math.abs(ty-y)>.002?requestAnimationFrame(step):0};
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=(e.clientY-r.top)/r.height*2-1;if(!raf)raf=requestAnimationFrame(step)},{passive:true})}
 // The week: four views of one sample workplace. Every number comes from the same rows, so the views always agree.
 const day=hero.querySelector('[data-day]');if(!day)return;
 const D=day.dataset,rate=+D.rate,q=s=>day.querySelector(s),qa=s=>[...day.querySelectorAll(s)],rows=qa('.day-row'),face=q('[data-clockface]'),ampm=q('[data-ampm]'),pay=q('[data-pay]'),on=q('[data-on]'),say=q('[data-day-status]'),pp=q('[data-pp]'),
  tabs=qa('[role=tab]'),panels=qa('[role=tabpanel]'),hrs=qa('[data-ph]'),pa=qa('[data-pp-amt]'),wkPay=q('[data-week-pay]'),wkH=q('[data-week-h]'),rondo=qa('[data-rondo]');
 let now=+D.now,timer=0,seen=true,paused=reduce,auto=!reduce,beat=0,tab=1,ask=0;const es=/^es\b/i.test(root.lang),binds=[...d.querySelectorAll('[data-b]')],asks=qa('[data-ask]'),rq=q('[data-rq]'),rsrc=q('[data-rsrc]');const END=16*60;
 const hm=m=>{const h=Math.floor(m/60)%12||12;return h+':'+String(m%60).padStart(2,'0')},full=m=>hm(m)+' '+(m<720?D.am:D.pm),dur=m=>Math.floor(m/60)+':'+String(m%60).padStart(2,'0'),fill=(t,o)=>t.replace(/\{(\w)\}/g,(_,k)=>o[k]),usd=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 const worked=r=>r.dataset.state==='in'?Math.max(0,Math.min(r.dataset.out?+r.dataset.out:now,+r.dataset.due+480)-r.dataset.in):0;
 const clockIn=(row,at,byYou)=>{row.dataset.state='in';row.dataset.in=at;const st=row.querySelector('.day-st');
  if(!reduce){row.classList.remove('just');void row.offsetWidth;row.classList.add('just');st.classList.add('arrive')}
  if(byYou)say.textContent=fill(D.tSaid,{n:row.querySelector('b').textContent,t:full(at)});paint()};
 function paint(){face.textContent=hm(now);ampm.textContent=now<720?D.am:D.pm;let today=0,week=0,n=0,dueN=0;const notes=[],later=[],B={};
  rows.forEach((r,i)=>{const s=r.querySelector('[data-s]'),h=r.querySelector('[data-h]'),due=+r.dataset.due,st=r.dataset.state,name=r.querySelector('b').textContent,w=worked(r),wk=+r.dataset.week+w;today+=w;week+=wk;
   if(st==='in'){if(!r.dataset.out)n++;r.classList.toggle('out',!!r.dataset.out);s.textContent=r.dataset.out&&D.tOut?fill(D.tOut,{t:hm(+r.dataset.out)}):fill(D.tIn,{t:hm(+r.dataset.in)});h.textContent=dur(w);if(r.dataset.in-due>5)notes.push(fill(D.tRLatein,{n:name,t:hm(+r.dataset.in),m:r.dataset.in-due}))}
   else{h.textContent='';s.textContent=st==='late'?fill(D.tLate,{t:hm(due)}):fill(D.tStarts,{t:hm(due)});if(now>due+5)notes.push(fill(D.tRLate,{n:name,t:hm(due)}));else if(now<due)later.push(fill(D.tRLater,{n:name,t:hm(due)}))}
   if(now>=due)dueN++;
   if(hrs[i]){hrs[i].textContent=dur(wk);pa[i].textContent=usd(wk*rate/60)}B['t'+i]=dur(w);B['h'+i]=dur(wk);B['a'+i]=usd(wk*rate/60)});
  const ar=rows[2],arW=worked(ar),jt=rows[3];Object.assign(B,{need:notes[0]||D.tNone,needs:D.tNeeds1?fill(notes.length===1?D.tNeeds1:D.tNeedsN,{n:notes.length}):'',inN:D.tOf?fill(D.tOf,{c:n,s:dueN}):'',lateN:String(notes.length),weekPay:usd(week*rate/60),weekH:dur(week),f3:jt.dataset.state==='in'?fill(D.tIn,{t:hm(+jt.dataset.in)}):fill(D.tLate,{t:hm(+jt.dataset.due)}),arWeek:dur(+ar.dataset.week+arW),arToday:dur(arW),arState:ar.dataset.state==='in'?fill(D.tPhIn,{t:full(+ar.dataset.in)}):D.tPhOut,brief:notes.concat(later,fill(D.tRSum,{c:n,s:dueN,p:usd(week*rate/60)})).join(' ')});
  {const nm=r=>r.querySelector('b').textContent,list=a=>a.length>1?a.slice(0,-1).join(', ')+' '+D.tAnd+' '+a.at(-1):a[0],sun=rows.filter(r=>r.dataset.sun==='1'),off=rows.filter(r=>r.dataset.sun==='0'&&+r.dataset.sched<40),fullW=rows.filter(r=>r.dataset.sun==='0'&&+r.dataset.sched>=40);
   B.cov=fill(D.tCov,{w:list(sun.map(r=>{const st=+(r.dataset.sunt||r.dataset.due);return nm(r)+', '+hm(st)+(es?' a ':' to ')+hm(st+480)})),n:list(off.map(nm)),h:off.length?off[0].dataset.sched:''})+(fullW.length?' '+fill(D.tCovFull,{n:list(fullW.map(nm))}):'')}
  binds.forEach(e=>{const v=B[e.dataset.b];if(v===undefined)return;if(e.textContent!==v)e.textContent=v;if(e.dataset.b==='arState')e.classList.toggle('in',ar.dataset.state==='in')});
  if(pay)pay.textContent=usd(today*rate/60);if(on)on.textContent=fill(D.tOn,{n:n});if(wkPay){wkPay.textContent=usd(week*rate/60);wkH.textContent=fill(D.tHours,{h:dur(week)})}
  if(rondo[0]){rondo[0].textContent=B.brief;rondo[1].textContent=B.cov}}
 const select=(i,focus)=>{if(!tabs.length)return;tab=(i+tabs.length)%tabs.length;tabs.forEach((t,k)=>{const on=k===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;panels[k].classList.toggle('on',on);panels[k].inert=!on});if(focus)tabs[tab].focus()};
 const tick=()=>{if(auto&&tabs.length&&++beat%7===0)select(tab+1);if(now>=END)return;now++;rows.forEach(r=>{if(r.dataset.state!=='in'&&r.dataset.auto&&now>=+r.dataset.auto)clockIn(r,+r.dataset.auto)});paint()};
 const stop=()=>{clearInterval(timer);timer=0},run=()=>{stop();if(!paused&&seen&&!d.hidden)timer=setInterval(tick,1000)};
 const setPaused=p=>{paused=p;day.toggleAttribute('data-paused',p);pp.setAttribute('aria-label',p?D.tPlay:D.tPause);run()};
 const hands=()=>{auto=false};['pointerdown','keydown','focusin'].forEach(e=>day.addEventListener(e,hands,{passive:true}));
 pp.addEventListener('click',()=>setPaused(!paused));
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{const k=e.key,to=k==='ArrowRight'?tab+1:k==='ArrowLeft'?tab-1:k==='Home'?0:k==='End'?tabs.length-1:null;if(to!==null){e.preventDefault();select(to,true)}})});
 window.NVWEEK={now:()=>now,isIn:()=>rows[2].dataset.state==='in'&&!rows[2].dataset.out,clockIn:()=>{const r=rows[2];if(r.dataset.out){delete r.dataset.out;paint();return now}if(r.dataset.state!=='in')clockIn(r,now,true);return +r.dataset.in},clockOut:()=>{const r=rows[2];r.dataset.out=now;paint();return{at:now,len:now-r.dataset.in}}};
 q('[data-clock]').addEventListener('click',e=>{const row=e.currentTarget.closest('.day-row');row.tabIndex=-1;clockIn(row,now,true);row.focus({preventScroll:true})});
 asks.forEach((b,i)=>b.addEventListener('click',()=>{ask=i;asks.forEach((x,k)=>x.setAttribute('aria-pressed',k===i));rq.textContent=b.textContent;rsrc.textContent=i?D.tSrc1:D.tSrc0;rondo.forEach((x,k)=>{x.classList.toggle('on',k===i);x.hidden=false;x.setAttribute('aria-hidden',k!==i)})}));
 const ok=d.querySelector('[data-approve]');
 if(ok)ok.addEventListener('click',()=>{const dana=rows[1],done=d.querySelector('[data-cov-done]');
  dana.dataset.sched=40;dana.dataset.sun=1;dana.dataset.sunt=720;d.querySelectorAll('.day-sched tbody').forEach(tb=>{const tr=tb.children[1];tr.children[7].innerHTML='<span class="day-chip">12<span class="sr"> '+(es?'a':'to')+' </span><i>8</i></span>';tr.querySelector('.day-wk').textContent='40 h'});
  d.querySelector('[data-cov-acts]').hidden=true;done.textContent=D.tApproved;done.tabIndex=-1;done.focus({preventScroll:true});paint()});
 const tcb=d.querySelector('[data-tc-approve]');if(tcb)tcb.addEventListener('click',()=>{const done=d.querySelector('[data-tc-done]');d.querySelector('[data-tc-acts]').hidden=true;d.querySelector('.tc-card').classList.add('ok');done.textContent=done.dataset.t;done.tabIndex=-1;done.focus({preventScroll:true})});
 d.addEventListener('visibilitychange',run);
 // The sample clock runs only while a live piece is on screen, on either page, and rests when none is
 if('IntersectionObserver' in window){const live=new Set(),io=new IntersectionObserver(es=>{es.forEach(e=>live[e.isIntersecting?'add':'delete'](e.target));seen=live.size>0;run()});[day,...d.querySelectorAll('.hn-phone,.hn-cards,.rc-flow,#kio,.tc-card,.ps-card')].forEach(el=>io.observe(el))}
 rondo.forEach((x,k)=>{x.hidden=false;x.setAttribute('aria-hidden',k!==0)});select(1);setPaused(paused);paint();
})();
/* The chat launcher steps aside on phones while a form, a calendar, a table or a live piece is on screen (any page). */
(()=>{const d=document,root=d.documentElement;if(!('IntersectionObserver' in window))return;const els=d.querySelectorAll('form.inquiry-form,.cal,.pcard,table,.day,.hn-phone,.hn-cards,.rc-flow,#kio,.ps-card');if(!els.length)return;
 const on=new Set(),io=new IntersectionObserver(es=>{es.forEach(e=>on[e.isIntersecting?'add':'delete'](e.target));root.classList.toggle('quiet-chat',on.size>0)},{rootMargin:'0px 0px -8% 0px'});els.forEach(el=>io.observe(el))})();
