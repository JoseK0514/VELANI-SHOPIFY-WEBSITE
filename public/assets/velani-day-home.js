/* Home on the Day design: time-of-day hero, the pinned day, Rondo conversation, start track. Ported from the approved mockup. */
(function(){
  var root=document.documentElement;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('rm');
  function rm(){return root.classList.contains('rm')}
  function clamp(v){return v<0?0:v>1?1:v}
  function ss(t){return t*t*(3-2*t)}
  function hm(m){return Math.floor(m/60)+':'+String(m%60).padStart(2,'0')}
  function money(c){return '$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}

  /* Scale natural-size devices to their wrappers. */
  function fit(){
    document.querySelectorAll('.fit').forEach(function(f){
      var nw=+f.dataset.nw, nh=+f.dataset.nh||0, p=f.parentElement;
      var z=p.clientWidth/nw;
      if(nh&&p.clientHeight) z=Math.min(z,p.clientHeight/nh);
      f.style.zoom=Math.max(.05,z).toFixed(4);
    });
  }

  /* Hero follows the visitor's time of day. */
  var hero=document.getElementById('hero'),skyPick='auto';
  function period(h){return h>=5&&h<9?'dawn':h>=9&&h<16?'day':h>=16&&h<19?'golden':'night'}
  function heroSky(){
    var d=new Date(),p=skyPick==='auto'?period(d.getHours()):skyPick;
    hero.classList.remove('t-dawn','t-day','t-golden','t-night');hero.classList.add('t-'+p);
    if(p==='night')hero.setAttribute('data-dark','');else hero.removeAttribute('data-dark');
    var h=d.getHours(),g=h<12&&h>=4?'Good morning':h>=12&&h<18?'Good afternoon':'Good evening';
    document.querySelectorAll('#hero [data-greet]').forEach(function(n){n.textContent=g+', '+n.dataset.greet});
  }
  var phT=document.querySelector('.hs-ph .sb span');if(phT)phT.setAttribute('data-live-time','');
  function live(){
    var d=new Date(),h=d.getHours(),m=d.getMinutes();
    var t=(h%12||12)+':'+String(m).padStart(2,'0');
    document.querySelectorAll('[data-live-time]').forEach(function(n){n.textContent=t});
    document.querySelectorAll('[data-live-mer]').forEach(function(n){n.textContent=h<12?'AM':'PM'});
    document.querySelectorAll('[data-live-date]').forEach(function(n){n.textContent=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})});
    heroSky();
  }
  live(); setInterval(live,15000);

  /* Split text into word spans. */
  function words(el,cls,tag){
    var html='';
    el.childNodes.forEach(function(n){
      var txt=n.textContent.trim(); if(!txt) return;
      var tg=n.nodeType===1?n.tagName.toLowerCase():tag;
      txt.split(/\s+/).forEach(function(w){html+='<'+tg+' class="'+cls+'">'+w+'</'+tg+'> '});
    });
    el.innerHTML=html; return [].slice.call(el.querySelectorAll('.'+cls.split(' ')[0]));
  }
  var lit=document.querySelector('[data-lit]'),litW=[];
  if(lit){var full=lit.textContent.trim();litW=words(lit,'w','span');litW.forEach(function(w){w.setAttribute('aria-hidden','true')});var sr=document.createElement('span');sr.className='sr';sr.textContent=full;lit.appendChild(sr)}

  /* ---------------- the day ---------------- */
  var day=document.getElementById('day');
  var A=[345,478,750,960,1320]; /* 5:45, 7:58, 12:30, 4:00 PM, 10:00 PM in minutes */
  var STOPS=[ /* p, sky top, mid, bottom, glow rgba, glow y, window [x vw, opacity, skew, r,g,b] */
    [.10,[217,211,230],[242,210,196],[251,237,228],[255,196,150,.75],80,[-16,.5,-30,255,232,210]],
    [.30,[188,216,242],[220,235,247],[247,250,253],[255,238,206,.6],46,[0,.42,-18,255,251,242]],
    [.50,[207,230,248],[238,246,252],[255,255,255],[255,255,236,.55],12,[16,.16,-4,255,255,250]],
    [.70,[242,207,158],[249,227,196],[255,246,234],[255,186,110,.6],58,[32,.6,20,255,214,152]],
    [.80,[62,58,107],[178,122,140],[240,179,143],[255,150,100,.5],86,[42,.16,28,255,170,130]],
    [.90,[7,12,28],[13,21,48],[24,33,63],[90,120,200,.18],30,[50,0,30,120,140,200]]
  ];
  var clock=day.querySelector('.clock'),digits=[].slice.call(day.querySelectorAll('.dg')),mer=day.querySelectorAll('.mer span');
  var mos=day.querySelectorAll('.mo'),scrs=day.querySelectorAll('.scr'),tl=day.querySelectorAll('.tl button'),lbls=day.querySelectorAll('.devlbl span');
  var LBL=[0,1,2,2,2];
  var ck=day.querySelector('.ck-scene'),ro=day.querySelector('.ro-scene'),tm=day.querySelector('.tm-scene'),py=day.querySelector('.py-scene');
  var roW=words(ro.querySelector('[data-words]'),'wd off','span');
  var tmRows=[].slice.call(tm.querySelectorAll('.tr')),tmTot=tm.querySelector('[data-tm-total]');
  var pyAmt=[].slice.call(py.querySelectorAll('[data-v]')),pyTot=py.querySelector('[data-py-total]'),pyTop=py.querySelector('[data-py-top]'),pyChip=py.querySelector('[data-py-chip]');
  var gn=document.getElementById('gn'),cur=-1,lastMin=-1,last={};
  function mix(a,b,t){return a.map(function(v,i){return i===3?+(v+(b[i]-v)*t).toFixed(3):Math.round(v+(b[i]-v)*t)})}
  function sky(p){
    var a=STOPS[0],b=STOPS[0],t=0,L=STOPS.length;
    if(p>=STOPS[L-1][0]){a=b=STOPS[L-1]}
    else if(p>STOPS[0][0]) for(var i=0;i<L-1;i++){if(p>=STOPS[i][0]&&p<=STOPS[i+1][0]){a=STOPS[i];b=STOPS[i+1];t=ss((p-a[0])/(b[0]-a[0]));break}}
    var s=day.style,w=mix(a[6],b[6],t);
    s.setProperty('--sa','rgb('+mix(a[1],b[1],t).join(',')+')');
    s.setProperty('--sb','rgb('+mix(a[2],b[2],t).join(',')+')');
    s.setProperty('--sc','rgb('+mix(a[3],b[3],t).join(',')+')');
    s.setProperty('--gl','rgba('+mix(a[4],b[4],t).join(',')+')');
    s.setProperty('--gy',(a[5]+(b[5]-a[5])*t).toFixed(1)+'%');
    s.setProperty('--wx',(a[6][0]+(b[6][0]-a[6][0])*t).toFixed(2));
    s.setProperty('--wo',(a[6][1]+(b[6][1]-a[6][1])*t).toFixed(3));
    s.setProperty('--wk',(a[6][2]+(b[6][2]-a[6][2])*t).toFixed(2));
    s.setProperty('--wc',w.slice(3).join(','));
    day.classList.toggle('night',p>.8);
  }
  function setClock(m,isLive){
    if(m===lastMin&&clock.classList.contains('live')===isLive) return; lastMin=m;
    clock.classList.toggle('live',isLive);
    var h24=Math.floor(m/60)%24,mm=m%60,h=h24%12||12;
    var v=[h>=10?Math.floor(h/10):10,h%10,Math.floor(mm/10),mm%10];
    digits.forEach(function(d,k){d.querySelector('.strip').style.setProperty('--n',v[k]);d.classList.toggle('blank',v[k]===10)});
    mer[0].classList.toggle('off',h24>=12);mer[1].classList.toggle('off',h24<12);
  }
  function setMoment(i){
    cur=i; day.dataset.i=i;
    mos.forEach(function(m,k){m.classList.toggle('on',k===i);m.inert=k!==i});
    var si=i===1?0:i; scrs.forEach(function(s){s.classList.toggle('on',+s.dataset.s===si)});
    lbls.forEach(function(l,k){l.classList.toggle('on',k===LBL[i])});
    tl.forEach(function(b,k){b.classList.toggle('on',k===i);b.classList.toggle('done',k<i);if(k===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  }
  function put(key,val,fn){if(last[key]!==val){last[key]=val;fn(val)}}
  function scenes(i,q){
    var R=rm();
    /* 5:45 the notification arrives */
    var n0=R||i>0?1:clamp((q-.1)/.22);
    day.style.setProperty('--n0',n0.toFixed(3));
    /* 7:58 PIN fills, then the check draws */
    var c=R||i>1?5:i<1?0:q<.12?0:q<.42?1+Math.floor((q-.12)/.075):q<.5?4:5;
    put('ck',c,function(v){ck.dataset.ck=v});
    /* 12:30 Rondo is asked, answers, prepares */
    var r=R||i>2?3:i<2?0:q<.1?0:q<.22?1:q<.55?2:3;
    put('ro',r,function(v){ro.dataset.ro=v});
    var nw=r<2?0:r>2?roW.length:Math.round(clamp((q-.22)/.3)*roW.length);
    put('rw',nw,function(v){roW.forEach(function(w,k){w.classList.toggle('off',k>=v)})});
    /* 4:00 PM punches land in order */
    var t=R||i>3?5:i<3?0:q<.04?0:Math.min(5,1+Math.floor((q-.04)/.09));
    put('tm',t,function(v){var sum=0;tmRows.forEach(function(row,k){row.classList.toggle('off',k>=v);if(k<v)sum+=+row.dataset.h});tmTot.textContent=hm(sum)+' h'});
    /* 10:00 PM pay resolves person by person */
    var y=R||i>4?5:i<4?0:q<.08?0:Math.min(5,1+Math.floor((q-.08)/.08));
    put('py',y,function(v){var sum=0;pyAmt.forEach(function(a,k){var on=k<v;a.classList.toggle('pend',!on);a.textContent=on?money(+a.dataset.v):'—';if(on)sum+=+a.dataset.v});
      pyTot.textContent=money(sum);pyTop.textContent=v?money(sum):'—';pyChip.textContent=v<5?'Calculating':'Calculated';pyChip.className='cp '+(v<5?'gy':'gr')});
  }
  function dayTick(){
    var r=day.getBoundingClientRect(),tot=r.height-innerHeight;
    var p=clamp(-r.top/tot);
    sky(p);
    var i=Math.min(4,Math.floor(p*5)),q=Math.min(1,p*5-i);
    if(i!==cur) setMoment(i);
    var lv=!rm()&&i<4&&q>.62;
    setClock(lv?Math.round(A[i]+(A[i+1]-A[i])*ss((q-.62)/.38)):A[i],lv);
    scenes(i,q);
  }
  tl.forEach(function(b){b.addEventListener('click',function(){
    var i=+b.dataset.go,tot=day.offsetHeight-innerHeight;
    window.scrollTo({top:day.offsetTop+tot*(i+.4)/5,behavior:rm()?'auto':'smooth'});
  })});

  /* ---------------- other scroll effects ---------------- */
  var convo=document.getElementById('convo'),typed=false;
  var rises=[].slice.call(document.querySelectorAll('[data-rise]'));
  function prog(el,a,b){var r=el.getBoundingClientRect(),vh=innerHeight;return clamp((vh*a-r.top)/(vh*a-vh*b))}
  function under(el){var r=el.getBoundingClientRect();return r.top<=24&&r.bottom>24&&r.left<innerWidth/2&&r.right>innerWidth/2}
  function typeAnswer(){
    typed=true; if(rm()) return;
    var p=convo.querySelector('.c-a p'),ws=words(p,'tw2','span');
    ws.forEach(function(w){w.style.opacity='0';w.style.transition='opacity .25s'});
    ws.forEach(function(w,k){setTimeout(function(){w.style.opacity='1'},520+k*55)});
  }
  function tick(){
    if(!rm()){var hr=hero.getBoundingClientRect();hero.style.setProperty('--hp',clamp(-hr.top/(hr.height*.7)).toFixed(3));}
    if(litW.length){var p=rm()?1:prog(lit,.9,.4),n=p*litW.length;litW.forEach(function(w,i){w.style.setProperty('--o',Math.max(.5,Math.min(1,n-i+.6)).toFixed(2))})}
    dayTick();
    if(convo.getBoundingClientRect().top<innerHeight*.8&&!convo.classList.contains('on')){convo.classList.add('on');if(!typed)typeAnswer()}
    rises.forEach(function(el){el.style.setProperty('--tp',rm()?1:prog(el.parentElement,1,.35).toFixed(3))});
    var dark=day.classList.contains('night')&&under(day);
    document.querySelectorAll('[data-dark]').forEach(function(el){if(under(el))dark=true});
    gn.classList.toggle('dark',dark);
  }
  var raf=0;addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;tick()})},{passive:true});
  addEventListener('resize',function(){fit();tick()});
  fit();setMoment(0);tick();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fit();tick()});

  /* How starting works: the line fills as you scroll. */
  var track=document.getElementById('track'),stps=[].slice.call(track.querySelectorAll('.stp'));
  function startTick(){var p=rm()?1:prog(track,.85,.35);track.style.setProperty('--sp',p.toFixed(3));stps.forEach(function(s,i){s.classList.toggle('lit',p>=i/(stps.length-1)-.02)})}
  addEventListener('scroll',function(){requestAnimationFrame(startTick)},{passive:true});startTick();

  /* ---------------- Rondo: approve + language ---------------- */
  var ok=document.getElementById('ok'),okm=document.getElementById('ok-m'),seg0=document.querySelector('.seg [aria-pressed="true"]'),lang=seg0&&seg0.dataset.lang||'en';
  /* the Spanish page starts the conversation in Spanish */
  if(convo)convo.setAttribute('lang',lang);
  function okText(){if(ok.getAttribute('aria-pressed')==='true'){ok.textContent=lang==='es'?'Aprobado':'Approved';okm.textContent=lang==='es'?'Dana cubre el domingo, 12:00 a 8:00. Es solo una muestra.':'Dana is on Sunday, 12:00 to 8:00. Sample only.'}}
  ok.addEventListener('click',function(){ok.setAttribute('aria-pressed','true');okText()});
  convo.addEventListener('focusin',function(){if(!convo.classList.contains('on')){convo.classList.add('instant','on');if(!typed)typeAnswer()}});
  document.querySelectorAll('.seg button').forEach(function(b){b.addEventListener('click',function(){
    lang=b.dataset.lang;
    document.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
    document.querySelectorAll('#rondo [data-en]').forEach(function(n){n.textContent=n.dataset[lang]});
    convo.setAttribute('lang',lang);
    okText();
  })});

})();
