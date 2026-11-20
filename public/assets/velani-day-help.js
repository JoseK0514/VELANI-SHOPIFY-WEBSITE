/* Help on the Day design: search and chips filter the answers, the PIN fills in, copy the address, open the client form from a link. */
(function(){
  var V=window.VD,$=V.$,$$=V.$$;

  /* Search and topic chips filter the same list of answers. */
  var q=$('#q'),chips=$$('.chip-b'),items=$$('#answers-list details'),grps=$$('[data-grp]'),st=$('#ans-st'),empty=$('#empty'),topic='';
  var TOTAL=items.length;
  function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[“”"’']/g,'')}
  items.forEach(function(d){d._t=norm(d.textContent)});
  function apply(){
    var words=norm(q.value).split(/\s+/).filter(Boolean),n=0;
    items.forEach(function(d){
      var ok=(!topic||d.dataset.topic===topic)&&words.every(function(w){return d._t.indexOf(w)>-1});
      d.hidden=!ok;if(ok)n++;
    });
    grps.forEach(function(g){g.hidden=!$$('details',g).some(function(d){return !d.hidden})});
    empty.hidden=n>0;
    var label=topic?$('.chip-b[data-topic="'+topic+'"]').textContent:'';
    st.textContent=(n===0?'No answers':n+(n===1?' answer':' answers'))+(label?' in '+label:'')+(q.value.trim()?' for “'+q.value.trim()+'”':'');
    if(n===1&&(words.length||topic))items.filter(function(d){return !d.hidden})[0].open=true;
  }
  q.addEventListener('input',apply);
  chips.forEach(function(c){c.addEventListener('click',function(){
    topic=topic===c.dataset.topic?'':c.dataset.topic;
    chips.forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.topic===topic))});
    apply();
  })});
  $('#clear').addEventListener('click',function(){q.value='';topic='';chips.forEach(function(x){x.setAttribute('aria-pressed','false')});apply();q.focus()});
  st.textContent=TOTAL+' answers';

  /* The PIN fills in as its card scrolls into view, then clocks in. */
  var pv=$('#pv'),dots=$$('.pv-d i',pv),ok=$('.pv-ok',pv);
  V.onTick(function(){
    var p=V.still()?1:V.clamp((innerHeight*.9-pv.getBoundingClientRect().top)/(innerHeight*.4));
    var k=Math.min(4,Math.floor(p*5));
    dots.forEach(function(d,i){d.classList.toggle('on',i<k)});
    ok.classList.toggle('on',p>=1);
  });

  /* Copy the support address. */
  var btn=$('#copy'),cs=$('#copy-st'),mail=$('#mail');
  btn.addEventListener('click',function(){
    function done(t){btn.textContent=t;cs.textContent=t==='Copied'?'Email address copied.':'Email address selected.';setTimeout(function(){btn.textContent='Copy'},1800)}
    function selectIt(){var r=document.createRange();r.selectNodeContents(mail);var s=getSelection();s.removeAllRanges();s.addRange(r);done('Selected')}
    try{navigator.clipboard.writeText(mail.textContent).then(function(){done('Copied')},selectIt)}catch(e){selectIt()}
  });

  /* Existing clients: a link to #client (or ?interest=client-…) opens the request form */
  var cd=$('#client-d');
  if(cd&&(/^#client/.test(location.hash)||/[?&]interest=client-/.test(location.search))){cd.open=true;setTimeout(function(){cd.scrollIntoView({block:'start'})},0)}
})();
