/* Shared shell for product pages (Rondo, Relay): device fitting, section bar, one sky, content that settles in, Tweaks. */
(function(){
  var root=document.documentElement;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('rm');
  function rm(){return root.classList.contains('rm')}
  function clamp(v){return v<0?0:v>1?1:v}
  function ease(t){return 1-Math.pow(1-t,3)}
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  var ticks=[];

  function fit(){
    $$('.fit').forEach(function(f){
      var nw=+f.dataset.nw,nh=+f.dataset.nh||0,p=f.parentElement;
      var z=p.clientWidth/nw; if(nh&&p.clientHeight) z=Math.min(z,p.clientHeight/nh);
      f.style.zoom=Math.max(.05,z).toFixed(4);
    });
  }

  /* Section bar: current section and dark mode over night sections. */
  var ln=$('#ln'),links=$$('.ln nav a'),secs=links.map(function(a){return $(a.getAttribute('href'))});
  function navTick(){
    var cur=-1;
    secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=innerHeight*.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur);if(i===cur)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    var dark=false;
    $$('[data-dark]').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<=60&&r.bottom>60)dark=true});
    if(ln) ln.classList.toggle('dark',dark);
  }

  /* One sky for the whole page. */
  var SK={dawn:[[217,211,230],[242,210,196],[251,237,228],[255,196,150,.6],80],morning:[[188,216,242],[220,235,247],[247,250,253],[255,238,206,.5],46],
    noon:[[207,230,248],[238,246,252],[255,255,255],[255,255,236,.5],12],golden:[[242,207,158],[249,227,196],[255,246,234],[255,186,110,.55],58],
    night:[[7,12,28],[13,21,48],[24,33,63],[90,120,200,.18],30],white:[[251,251,253],[251,251,253],[251,251,253],[255,255,255,0],50]};
  var atmo=$('#atmo'),skies=$$('[data-sky]');
  function mixc(a,b,t){return a.map(function(v,i){return i===3?+(v+(b[i]-v)*t).toFixed(3):Math.round(v+(b[i]-v)*t)})}
  function skyTick(){
    if(!atmo||!skies.length) return;
    var mid=innerHeight/2,a=null,b=null;
    skies.forEach(function(s){var r=s.getBoundingClientRect(),c=r.top+Math.min(r.height,innerHeight*1.4)/2;if(c<=mid)a={c:c,k:s.dataset.sky};else if(!b)b={c:c,k:s.dataset.sky}});
    var A=SK[(a||b).k],B=SK[(b||a).k],t=a&&b?clamp((mid-a.c)/(b.c-a.c)):0;t=t*t*(3-2*t);
    var s=atmo.style;
    s.setProperty('--sa','rgb('+mixc(A[0],B[0],t).join(',')+')');
    s.setProperty('--sb','rgb('+mixc(A[1],B[1],t).join(',')+')');
    s.setProperty('--sc','rgb('+mixc(A[2],B[2],t).join(',')+')');
    s.setProperty('--gl','rgba('+mixc(A[3],B[3],t).join(',')+')');
    s.setProperty('--gy',(A[4]+(B[4]-A[4])*t).toFixed(1)+'%');
  }

  /* Content settles in as it arrives. */
  var rvs=$$('[data-rv]');
  function rvTick(){rvs.forEach(function(el){var v=rm()?1:ease(clamp((innerHeight*.98-el.getBoundingClientRect().top)/(innerHeight*.34)));el.style.setProperty('--rv',v.toFixed(3))})}

  function tick(){navTick();skyTick();rvTick();ticks.forEach(function(f){f()})}
  var raf=0;addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;tick()})},{passive:true});
  addEventListener('resize',function(){fit();tick()});

  /* Tweaks. */
  var tb=$('#tw-b'),tw=$('#tw');
  if(tb){
    tb.addEventListener('click',function(){tw.hidden=!tw.hidden;tb.setAttribute('aria-expanded',String(!tw.hidden))});
    var tn=$('#t-notes'),td=$('#t-dm'),trm=$('#t-rm');trm.checked=rm();
    tn.addEventListener('change',function(){root.classList.toggle('notes',tn.checked)});
    td.addEventListener('change',function(){root.classList.toggle('dm',td.checked);setTimeout(function(){fit();tick()},60)});
    trm.addEventListener('change',function(){root.classList.toggle('rm',trm.checked);tick()});
  }

  window.VP={rm:rm,clamp:clamp,ease:ease,$:$,$$:$$,fit:fit,tick:tick,onTick:function(f){ticks.push(f)}};
  fit();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fit();tick()});
  setTimeout(tick,0);
})();
