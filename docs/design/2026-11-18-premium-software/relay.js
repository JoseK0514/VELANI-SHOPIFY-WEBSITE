(function(){
  var V=window.VP,$=V.$;

  /* The concept screen rises as you scroll. */
  var dev=$('#xh-dev');
  V.onTick(function(){
    if(V.rm()){dev.style.removeProperty('--xp');return}
    var r=dev.getBoundingClientRect();
    dev.style.setProperty('--xp',V.ease(V.clamp((innerHeight-r.top)/(innerHeight*.6))).toFixed(3));
  });

  /* Waitlist form: validates, sends nothing. */
  var form=$('#wl-form'),email=$('#wl-email'),msg=$('#wl-msg');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=email.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){
      msg.className='wl-msg is-err';msg.textContent='Enter an email address, like name@business.com.';
      email.setAttribute('aria-invalid','true');email.focus();return;
    }
    email.removeAttribute('aria-invalid');
    msg.className='wl-msg is-ok';
    msg.textContent='That works. On the live site this joins the Relay waitlist; this mockup sends nothing.';
  });
})();
