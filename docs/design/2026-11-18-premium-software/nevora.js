(function(){
  var root=document.documentElement;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) root.classList.add('rm');
  function rm(){return root.classList.contains('rm')}
  function clamp(v){return v<0?0:v>1?1:v}
  function ease(t){return 1-Math.pow(1-t,3)}
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  function nowTime(lang){var d=new Date(),h=d.getHours(),m=d.getMinutes();var t=(h%12||12)+':'+String(m).padStart(2,'0');return lang==='es'?t+(h<12?' a. m.':' p. m.'):t+(h<12?' AM':' PM')}

  /* Scale natural-size devices to their wrappers. */
  function fit(){
    $$('.fit').forEach(function(f){
      var nw=+f.dataset.nw,nh=+f.dataset.nh||0,p=f.parentElement;
      var z=p.clientWidth/nw; if(nh&&p.clientHeight) z=Math.min(z,p.clientHeight/nh);
      f.style.zoom=Math.max(.05,z).toFixed(4);
    });
  }

  /* Live clock on the tablet. */
  function live(){
    var d=new Date(),h=d.getHours(),m=d.getMinutes();
    $$('[data-live-time]').forEach(function(n){n.textContent=(h%12||12)+':'+String(m).padStart(2,'0')});
    $$('[data-live-mer]').forEach(function(n){n.textContent=h<12?'AM':'PM'});
    $$('[data-live-date]').forEach(function(n){n.textContent=d.toLocaleDateString(n.closest('[data-lang="es"]')?'es-PR':'en-US',{weekday:'long',month:'long',day:'numeric'})});
    var g=h<12&&h>=4?'Good morning':h>=12&&h<18?'Good afternoon':'Good evening';
    $$('#zh [data-greet]').forEach(function(n){n.textContent=g+', '+n.dataset.greet});
  }

  /* ---------------- hero: zoom into the screen ---------------- */
  var zh=$('#zh'),pin=$('#zh-pin'),dev=$('#zh-dev'),call=$('#zh-call');
  function heroTick(){
    if(rm()){dev.style.removeProperty('--zs');pin.style.removeProperty('--zbg');call.classList.remove('show');return}
    var r=zh.getBoundingClientRect(),ph=pin.offsetHeight,tot=r.height-ph;
    var p=clamp((52-r.top)/tot);
    var w=dev.offsetWidth,sw=w*1280/1500,sh=w*800/1500;
    var S=Math.max(innerWidth*1.04/sw,ph*1.04/sh);
    var t=ease(clamp(p/.72));
    dev.style.setProperty('--zs',(1+(S-1)*t).toFixed(4));
    pin.style.setProperty('--zbg','rgba(6,64,60,'+clamp((p-.15)/.5).toFixed(3)+')');
    call.classList.toggle('show',p>.8);
  }

  /* ---------------- local nav: section spy + dark ---------------- */
  var ln=$('#ln'),links=$$('.ln nav a'),secs=links.map(function(a){return $(a.getAttribute('href'))});
  function navTick(){
    var y=60,cur=-1;
    secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=innerHeight*.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur);if(i===cur)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    var dark=false;
    $$('[data-dark]').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<=y&&r.bottom>y)dark=true});
    var pr=pin.getBoundingClientRect();if(!rm()&&pr.top<=y&&pr.bottom>y&&+(dev.style.getPropertyValue('--zs')||1)>1.6)dark=true;
    ln.classList.toggle('dark',dark);
  }

  /* ---------------- highlights carousel ---------------- */
  var tr=$('#hl-track'),prev=$('#hl-prev'),next=$('#hl-next');
  function step(){var c=tr.querySelector('.hc');return c?c.offsetWidth+20:380}
  prev.addEventListener('click',function(){tr.scrollBy({left:-step(),behavior:rm()?'auto':'smooth'})});
  next.addEventListener('click',function(){tr.scrollBy({left:step(),behavior:rm()?'auto':'smooth'})});
  function hlState(){prev.disabled=tr.scrollLeft<8;next.disabled=tr.scrollLeft>tr.scrollWidth-tr.clientWidth-8}
  tr.addEventListener('scroll',hlState,{passive:true});

  /* ---------------- schedule: publish ---------------- */
  var pub=$('#pub'),chip=$('#sd-chip'),toasts=$('#toasts'),sst=$('#sd-status');
  var PEOPLE=[['AC','Ana Colón','5 shifts · 40 h'],['DK','Dana Kim','4 shifts · 32 h'],['AR','Alexandra Rivera','4 shifts · 32 h'],['JT','Jordan Torres','4 shifts · 32 h'],['LM','Luis Medina','4 shifts · 32 h']];
  pub.addEventListener('click',function(){
    pub.disabled=true;pub.textContent='Published';chip.textContent='Published';chip.className='cp te';
    toasts.innerHTML='';
    PEOPLE.forEach(function(p,i){
      var t=document.createElement('div');t.className='toast';
      t.innerHTML='<div class="av">'+p[0]+'</div><div><b>'+p[1]+'</b><small>Notified · '+p[2]+'</small></div>';
      toasts.appendChild(t);
      setTimeout(function(){t.classList.add('in')},rm()?0:120+i*140);
      setTimeout(function(){t.classList.add('out')},3200+i*90);
    });
    sst.innerHTML='5 people notified. Each sees their own shifts. <button class="reset" type="button" id="sd-reset">Reset the demo</button>';
    $('#sd-reset').addEventListener('click',function(){pub.disabled=false;pub.textContent='Publish';chip.textContent='Draft';chip.className='cp gy';toasts.innerHTML='';sst.textContent='';pub.focus()});
  });

  /* ---------------- time clock (works in the iPad and as a card on phones) ---------------- */
  var ES={'TIME CLOCK':'REGISTRO DE TIEMPO','Enter your PIN':'Ingresa tu PIN','Clear':'Borrar','Continue':'Continuar','Your PIN is separate from your portal password.':'Tu PIN es distinto de tu contraseña del portal.','Done':'Listo','Tablet registered · Main Street iPad':'Tableta registrada · iPad de Main Street'};
  var kios=[];
  function makeKiosk(el){
    var st={pin:'',lang:'en',inAt:null,timer:0};
    var dots=$$('.pin i',el),pinBox=$('.pin',el),msg=$('.kmsg',el),cont=$('.cont',el),vPin=$('.kv-pin',el),vDone=$('.kv-done',el),okc=$('.okc',el),kt=$('.kd-t',el),ks=$('.kd-s',el),lb=$('.lang-b span',el);
    function tr(s){return st.lang==='es'&&ES[s]?ES[s]:s}
    function texts(){
      $$('[data-t]',el).forEach(function(n){n.textContent=tr(n.dataset.t)});
      lb.textContent=st.lang==='es'?'English':'Español';
      el.setAttribute('data-lang',st.lang);el.setAttribute('lang',st.lang);live();
    }
    function draw(){dots.forEach(function(d,i){d.classList.toggle('on',i<st.pin.length)});cont.disabled=st.pin.length<4}
    function reset(){clearTimeout(st.timer);st.pin='';vDone.hidden=true;vPin.hidden=false;msg.classList.remove('err');pinBox.classList.remove('err');msg.textContent=tr('Your PIN is separate from your portal password.');draw()}
    function key(k){
      if(!vDone.hidden) return;
      msg.classList.remove('err');pinBox.classList.remove('err');msg.textContent=tr('Your PIN is separate from your portal password.');
      if(k==='c')st.pin='';else if(k==='b')st.pin=st.pin.slice(0,-1);else if(st.pin.length<4)st.pin+=k;
      draw();
    }
    function go(){
      if(st.pin.length<4) return;
      if(st.pin==='0000'){
        st.pin='';draw();msg.textContent=st.lang==='es'?'PIN no reconocido en esta ubicación. Inténtalo de nuevo o pregunta a tu gerente.':'PIN not recognized for this location. Try again or ask your manager.';
        msg.classList.add('err');void pinBox.offsetWidth;pinBox.classList.add('err');return;
      }
      var out=!!st.inAt;
      if(out){
        var mins=Math.max(1,Math.round((Date.now()-st.inAt)/60000));st.inAt=null;
        kt.textContent=st.lang==='es'?'Salida registrada':'Clock-out recorded';
        ks.textContent=(st.lang==='es'?'Duración del turno: ':'Shift length: ')+Math.floor(mins/60)+':'+String(mins%60).padStart(2,'0');
      }else{
        st.inAt=Date.now();
        kt.textContent=st.lang==='es'?'Entrada registrada':'Clock-in recorded';
        ks.textContent=(st.lang==='es'?'Registrada a las ':'Recorded at ')+nowTime(st.lang);
      }
      okc.classList.toggle('out',out);
      vPin.hidden=true;vDone.hidden=false;
      var d=$('.done',el);d.focus({preventScroll:true});
      st.timer=setTimeout(reset,8000);
    }
    $$('.keys button',el).forEach(function(b){b.addEventListener('click',function(){key(b.dataset.k)})});
    cont.addEventListener('click',go);
    $('.done',el).addEventListener('click',function(){reset();var k=$('.keys button',el);if(k)k.focus({preventScroll:true})});
    $('.lang-b',el).addEventListener('click',function(){st.lang=st.lang==='en'?'es':'en';texts();if(!vDone.hidden)reset()});
    el.addEventListener('keydown',function(e){
      if(/^[0-9]$/.test(e.key)){key(e.key);e.preventDefault()}
      else if(e.key==='Backspace'){key('b');e.preventDefault()}
      else if(e.key==='Enter'&&!cont.disabled&&vDone.hidden){go();e.preventDefault()}
      else if(e.key==='Escape'){reset()}
    });
    draw();
    return {el:el};
  }
  var k1=$('[data-kio]');
  var km=$('#kio-m');
  var card=k1.querySelector('.ckc').cloneNode(true);
  var wrapM=document.createElement('div');wrapM.className='nv kio';wrapM.style.cssText='background:transparent;height:auto';
  wrapM.appendChild(card);km.appendChild(wrapM);
  kios.push(makeKiosk(k1),makeKiosk(wrapM));

  /* ---------------- timecards: approve ---------------- */
  var tcb=$('#tc-ok'),tcRows=$$('.tcard .r'),tcp=$('#tc-pill'),tcs=$('#tc-st');
  tcb.addEventListener('click',function(){
    tcb.disabled=true;tcb.textContent='Approved';
    tcRows.forEach(function(r,i){setTimeout(function(){r.classList.add('is-ok');var s=r.querySelector('.wk small');if(s)s.textContent='approved'},rm()?0:i*120)});
    setTimeout(function(){tcp.textContent='Approved';tcp.style.background='#E7F4EC';tcp.style.color='#1D6B45';tcs.textContent='Approved. Ready for payroll.'},rm()?0:650);
  });

  /* ---------------- pay statement language ---------------- */
  $$('#stmt .seg2 button').forEach(function(b){b.addEventListener('click',function(){
    var l=b.dataset.l;$$('#stmt .seg2 button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
    $$('#stmt [data-en]').forEach(function(n){n.textContent=n.dataset[l]});$('#stmt').setAttribute('lang',l);
  })});

  /* ---------------- team phones fan out ---------------- */
  var fan=$('#fan');
  function fanTick(){if(rm()){fan.style.removeProperty('--fp');return}var r=fan.getBoundingClientRect();fan.style.setProperty('--fp',ease(clamp((innerHeight*.95-r.top)/(innerHeight*.55))).toFixed(3))}

  /* ---------------- Rondo answers ---------------- */
  var ANS=[
    {lang:'en',who:'Rondo',text:'Jordan Torres was due at 7:30 and hasn’t clocked in. Alexandra Rivera starts at 8:00. Sunday has one open register shift, 12:00 to 8:00.',src:'From today’s punches and the published schedule'},
    {lang:'en',who:'Rondo',text:'Dana Kim is off on Sunday and at 32 hours this week, so this shift brings her to 40. Ana Colón is already at 40.',src:'From the published schedule, Nov 2 – 8',prep:{t:'Add Dana Kim on Sunday, November 8',d:'Register, 12:00 to 8:00, with Luis Medina.'}},
    {lang:'es',who:'Rondo',text:'Solo Jordan Torres. El sábado marcó entrada a las 7:52 y su turno empezaba a las 7:30.',src:'Registros de tiempo, 2 – 8 de nov.'}
  ];
  var ans=$('#ans');
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function showAns(i){
    var a=ANS[i],h='<div class="c-a fade" lang="'+a.lang+'"><div class="c-who"><span class="rm-badge">R</span>'+a.who+'</div><p>'+esc(a.text)+'</p><span class="src"><i></i><span>'+esc(a.src)+'</span></span>';
    if(a.prep) h+='<div class="prep"><h4>'+esc(a.prep.t)+'</h4><p class="d">'+esc(a.prep.d)+'</p><div class="row"><button class="ok" type="button" aria-pressed="false" id="ans-ok">Approve</button><small id="ans-m">Nothing changes until you approve.</small></div></div>';
    ans.innerHTML=h+'</div>';
    var ok=$('#ans-ok');if(ok)ok.addEventListener('click',function(){ok.setAttribute('aria-pressed','true');ok.textContent='Approved';$('#ans-m').textContent='Dana is on Sunday, 12:00 to 8:00. Sample only.'});
  }
  $$('.chips button').forEach(function(b){b.addEventListener('click',function(){
    $$('.chips button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});showAns(+b.dataset.q);
  })});
  showAns(0);

  /* ---------------- one sky for the whole page ---------------- */
  var SK={dawn:[[217,211,230],[242,210,196],[251,237,228],[255,196,150,.6],80],morning:[[188,216,242],[220,235,247],[247,250,253],[255,238,206,.5],46],
    noon:[[207,230,248],[238,246,252],[255,255,255],[255,255,236,.5],12],golden:[[242,207,158],[249,227,196],[255,246,234],[255,186,110,.55],58],
    night:[[7,12,28],[13,21,48],[24,33,63],[90,120,200,.18],30],white:[[251,251,253],[251,251,253],[251,251,253],[255,255,255,0],50]};
  var atmo=$('#atmo'),skies=$$('[data-sky]');
  function mixc(a,b,t){return a.map(function(v,i){return i===3?+(v+(b[i]-v)*t).toFixed(3):Math.round(v+(b[i]-v)*t)})}
  function skyTick(){
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
  /* ---------------- content settles in ---------------- */
  var rvs=$$('[data-rv]');
  function rvTick(){rvs.forEach(function(el){var v=rm()?1:ease(clamp((innerHeight*.98-el.getBoundingClientRect().top)/(innerHeight*.34)));el.style.setProperty('--rv',v.toFixed(3))})}

  /* ---------------- loop ---------------- */
  function tick(){heroTick();navTick();fanTick();skyTick();rvTick()}
  var raf=0;addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;tick()})},{passive:true});
  addEventListener('resize',function(){fit();tick();hlState()});
  live();setInterval(live,15000);fit();tick();hlState();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fit();tick()});

  /* ---------------- Tweaks ---------------- */
  var tb=$('#tw-b'),tw=$('#tw');
  tb.addEventListener('click',function(){tw.hidden=!tw.hidden;tb.setAttribute('aria-expanded',String(!tw.hidden))});
  var tn=$('#t-notes'),td=$('#t-dm'),trm=$('#t-rm');trm.checked=rm();
  tn.addEventListener('change',function(){root.classList.toggle('notes',tn.checked)});
  td.addEventListener('change',function(){root.classList.toggle('dm',td.checked);setTimeout(function(){fit();tick()},60)});
  trm.addEventListener('change',function(){root.classList.toggle('rm',trm.checked);tick()});
})();
