(function(){
  var V=window.VP,$=V.$,$$=V.$$,H=document.documentElement;
  var INTEREST={trial:'nevora-demo',big:'nevora',relay:'relay',other:'other'};
  var SENT={
    trial:['Request sent.','Jose from Velani replies within two business days and sets up your workplace with you.'],
    big:['Request sent.','We reply within two business days to review your team and give you a quote.'],
    relay:['You’re on the list.','We’ll email you when early access opens. Relay has no date yet.'],
    other:['Message sent.','Thanks for writing. We reply by email within two business days.']
  };
  var f=$('#f'),radios=$$('input[name="topic"]'),team=$('#f-team'),hint=$('#hint'),hintT=$('#hint-t'),hintB=$('#hint-b'),st=$('#form-st'),sent=$('#sent');
  function topic(){var c=radios.filter(function(r){return r.checked})[0];return c?c.value:'other'}

  /* The topic sets the words, fields and button through a class on <html>, and keeps ?interest= in step. */
  function setTopic(t,fromUser){
    ['trial','big','relay','other'].forEach(function(k){H.classList.toggle('t-'+k,k===t)});
    radios.forEach(function(r){r.checked=r.value===t});
    if(fromUser){try{var u=new URL(location.href);u.searchParams.set('interest',INTEREST[t]);u.hash='';history.replaceState(null,'',u)}catch(e){}}
    clearErrors();checkHint();
  }
  radios.forEach(function(r){r.addEventListener('change',function(){setTopic(r.value,true)})});

  /* Team size that belongs to the other NEVORA topic: offer the switch, never make it silently. */
  function checkHint(){
    var t=topic(),v=team.value,over=v.indexOf('More than 30')===0,under=v&&!over;
    if(t==='trial'&&over){hintT.textContent='More than 30 employees starts with assisted setup.';hintB.textContent='Switch to assisted setup';hintB.dataset.to='big';hint.hidden=false}
    else if(t==='big'&&under){hintT.textContent='Up to 30 employees can start the free trial.';hintB.textContent='Switch to free trial';hintB.dataset.to='trial';hint.hidden=false}
    else hint.hidden=true;
  }
  team.addEventListener('change',checkHint);
  hintB.addEventListener('click',function(){setTopic(hintB.dataset.to,true);team.focus()});

  /* The same checks as the live form (src/inquiry.mjs). */
  var EMAIL=/^[^\s@<>"\\,;]+@[^\s@<>"\\,;]+\.[^\s@<>"\\,;]+$/u,tried=false;
  var RULES=[
    ['f-name','e-name',function(v){return v?'':'Enter your name.'}],
    ['f-email','e-email',function(v){return EMAIL.test(v)?'':'Enter an email address we can reply to.'}],
    ['f-loc','e-loc',function(v){return /^(trial|big)$/.test(topic())&&v&&!/^[1-9]\d{0,3}$/.test(v)?'Enter the number of locations, for example 2.':''}],
    ['f-msg','e-msg',function(v){return topic()==='other'&&!v?'Tell us what you want to discuss.':''}]
  ];
  function check(rule){
    var el=$('#'+rule[0]),msg=rule[2](el.value.normalize('NFC').trim());
    $('#'+rule[1]).textContent=msg;
    if(msg)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');
    return msg;
  }
  function clearErrors(){RULES.forEach(function(r){$('#'+r[1]).textContent='';$('#'+r[0]).removeAttribute('aria-invalid')});st.textContent='';tried=false}
  RULES.forEach(function(r){$('#'+r[0]).addEventListener('input',function(){if(tried)check(r)})});

  f.addEventListener('submit',function(e){
    e.preventDefault();tried=true;
    var bad=RULES.filter(function(r){return check(r)});
    if(bad.length){
      st.textContent=bad.length===1?'Check the field marked below.':'Check the '+bad.length+' fields marked below.';
      $('#'+bad[0][0]).focus();return;
    }
    st.textContent='';
    var s=SENT[topic()];$('#sent-h').textContent=s[0];$('#sent-p').textContent=s[1];
    f.hidden=true;sent.hidden=false;$('#sent-h').focus();
  });
  var start=['trial','big','relay','other'].filter(function(k){return H.classList.contains('t-'+k)})[0]||'other';
  setTopic(start,false);

  $('#edit').addEventListener('click',function(){sent.hidden=true;f.hidden=false;$('#f-name').focus()});
})();
