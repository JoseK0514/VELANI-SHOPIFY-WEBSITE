(function(){
  var V=window.VP,$=V.$,$$=V.$$;

  /* Each belief lights up as it reaches the middle of the screen. */
  var bl=$$('[data-lt]');
  V.onTick(function(){
    bl.forEach(function(el){
      var v=V.rm()?1:V.clamp((innerHeight*.78-el.getBoundingClientRect().top)/(innerHeight*.22));
      el.style.setProperty('--lt',v.toFixed(3));
    });
  });

  /* Copy the support address. */
  var btn=$('#copy'),st=$('#copy-st'),mail=$('#mail');
  btn.addEventListener('click',function(){
    function done(t){btn.textContent=t;st.textContent=t==='Copied'?'Email address copied.':'';setTimeout(function(){btn.textContent='Copy'},1800)}
    try{
      navigator.clipboard.writeText(mail.textContent).then(function(){done('Copied')},function(){selectIt()});
    }catch(e){selectIt()}
    function selectIt(){var r=document.createRange();r.selectNodeContents(mail);var s=getSelection();s.removeAllRanges();s.addRange(r);done('Selected')}
  });
})();
