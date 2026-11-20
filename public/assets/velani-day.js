/* Day pages: the phone menu, the page-wide sky, content that settles in as it arrives, and copy buttons.
   Every part checks for its markup first, so a page uses only what it has. */
(function(){
  var d=document,root=d.documentElement,mq=matchMedia('(prefers-reduced-motion: reduce)');
  function still(){return mq.matches}
  function clamp(v){return v<0?0:v>1?1:v}
  function ease(t){return 1-Math.pow(1-t,3)}
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return [].slice.call((c||d).querySelectorAll(s))}
  var ticks=[];

  /* Phone menu: a modal dialog with its own focus loop; Escape, a link or a wide window closes it. */
  var mb=$('.gn .mb'),mm=$('#mm');
  if(mb&&mm){
    var mx=$('.mx',mm),last=null,behind=$$('body > :not(#mm):not(script):not(dialog)');
    var open=function(){last=d.activeElement;mm.hidden=false;mb.setAttribute('aria-expanded','true');root.classList.add('mm-open');behind.forEach(function(el){el.inert=true});requestAnimationFrame(function(){requestAnimationFrame(function(){mm.classList.add('in')})});mx.focus()};
    var close=function(){if(mm.hidden)return;mm.classList.remove('in');mm.hidden=true;mb.setAttribute('aria-expanded','false');root.classList.remove('mm-open');behind.forEach(function(el){el.inert=false});if(last&&last.focus)last.focus()};
    mb.addEventListener('click',open);mx.addEventListener('click',close);
    mm.addEventListener('keydown',function(e){
      if(e.key==='Escape'){e.preventDefault();close();return}
      if(e.key!=='Tab')return;
      var f=$$('a[href],button',mm),i=f.indexOf(d.activeElement);
      if(e.shiftKey&&i<=0){f[f.length-1].focus();e.preventDefault()}else if(!e.shiftKey&&i===f.length-1){f[0].focus();e.preventDefault()}
    });
    $$('a[href]',mm).forEach(function(a){a.addEventListener('click',close)});
    addEventListener('resize',function(){if(innerWidth>820)close()});
  }

  /* One sky for the whole page: each section names its light (data-sky) and the colours blend between them. */
  var SK={dawn:[[217,211,230],[242,210,196],[251,237,228],[255,196,150,.6],80],morning:[[188,216,242],[220,235,247],[247,250,253],[255,238,206,.5],46],
    noon:[[207,230,248],[238,246,252],[255,255,255],[255,255,236,.5],12],golden:[[242,207,158],[249,227,196],[255,246,234],[255,186,110,.55],58],
    night:[[7,12,28],[13,21,48],[24,33,63],[90,120,200,.18],30],white:[[251,251,253],[251,251,253],[251,251,253],[255,255,255,0],50]};
  var atmo=$('#atmo'),skies=$$('[data-sky]');
  function mixc(a,b,t){return a.map(function(v,i){return i===3?+(v+(b[i]-v)*t).toFixed(3):Math.round(v+(b[i]-v)*t)})}
  function skyTick(){
    if(!atmo||!skies.length)return;
    var mid=innerHeight/2,a=null,b=null;
    skies.forEach(function(s){var r=s.getBoundingClientRect(),c=r.top+Math.min(r.height,innerHeight*1.4)/2;if(c<=mid)a={c:c,k:s.dataset.sky};else if(!b)b={c:c,k:s.dataset.sky}});
    var A=SK[(a||b).k]||SK.dawn,B=SK[(b||a).k]||SK.dawn,t=a&&b?clamp((mid-a.c)/(b.c-a.c)):0;t=t*t*(3-2*t);
    var s=atmo.style;
    s.setProperty('--sa','rgb('+mixc(A[0],B[0],t).join(',')+')');
    s.setProperty('--sb','rgb('+mixc(A[1],B[1],t).join(',')+')');
    s.setProperty('--sc','rgb('+mixc(A[2],B[2],t).join(',')+')');
    s.setProperty('--gl','rgba('+mixc(A[3],B[3],t).join(',')+')');
    s.setProperty('--gy',(A[4]+(B[4]-A[4])*t).toFixed(1)+'%');
  }

  /* Content settles in as it arrives; with reduced motion it is simply there. */
  var rvs=$$('[data-rv]');
  function rvTick(){rvs.forEach(function(el){var v=still()?1:ease(clamp((innerHeight*.98-el.getBoundingClientRect().top)/(innerHeight*.34)));el.style.setProperty('--rv',v.toFixed(3))})}

  /* Lines that light up as they reach the middle of the screen (data-lt); they never drop below half strength. */
  var lts=$$('[data-lt]');
  function ltTick(){lts.forEach(function(el){var v=still()?1:clamp((innerHeight*.78-el.getBoundingClientRect().top)/(innerHeight*.22));el.style.setProperty('--lt',v.toFixed(3))})}

  /* A product page's section bar (marked data-bar; NEVORA drives its own): the section on screen is marked, and the bar
     turns dark over night sections. */
  var bar=$('#ln[data-bar]'),barLinks=bar?$$('nav a',bar):[],barSecs=barLinks.map(function(a){return $(a.getAttribute('href'))});
  function barTick(){
    if(!bar)return;
    var cur=-1,dark=false;
    barSecs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=innerHeight*.4)cur=i});
    barLinks.forEach(function(a,i){a.classList.toggle('on',i===cur);if(i===cur)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    $$('[data-dark]').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<=60&&r.bottom>60)dark=true});
    bar.classList.toggle('dark',dark);
  }

  /* Devices are drawn at their natural size and scaled to the space they are given. */
  function fit(){$$('.fit').forEach(function(f){var nw=+f.dataset.nw,nh=+f.dataset.nh||0,p=f.parentElement,z=p.clientWidth/nw;if(nh&&p.clientHeight)z=Math.min(z,p.clientHeight/nh);f.style.zoom=Math.max(.05,z).toFixed(4)})}
  fit();addEventListener('resize',fit);

  /* Legal pages: the "On this page" list is open on wide screens and folded on phones (as on the Night pages) */
  var tocs=$$('.doc-toc'),tocWide=matchMedia('(min-width:600px)');
  function syncToc(){tocs.forEach(function(x){x.open=tocWide.matches})}
  if(tocs.length){syncToc();if(tocWide.addEventListener)tocWide.addEventListener('change',syncToc)}

  function tick(){skyTick();rvTick();ltTick();barTick();ticks.forEach(function(f){f()})}
  var raf=0;
  addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;tick()})},{passive:true});
  addEventListener('resize',tick);
  if(mq.addEventListener)mq.addEventListener('change',tick);

  /* Copy buttons: data-copy names the element whose text is copied; the words come from the button's data attributes. */
  $$('[data-copy]').forEach(function(btn){
    var src=d.getElementById(btn.dataset.copy),st=d.getElementById(btn.dataset.copyStatus),label=btn.textContent;
    function done(word,said){btn.textContent=word;if(st)st.textContent=said;setTimeout(function(){btn.textContent=label},1800)}
    function select(){var r=d.createRange();r.selectNodeContents(src);var s=getSelection();s.removeAllRanges();s.addRange(r);done(btn.dataset.selected,btn.dataset.selectedSaid)}
    btn.addEventListener('click',function(){
      try{navigator.clipboard.writeText(src.textContent.trim()).then(function(){done(btn.dataset.copied,btn.dataset.copiedSaid)},select)}catch(e){select()}
    });
  });

  window.VD={still:still,clamp:clamp,ease:ease,$:$,$$:$$,tick:tick,onTick:function(f){ticks.push(f)}};
  tick();
})();
