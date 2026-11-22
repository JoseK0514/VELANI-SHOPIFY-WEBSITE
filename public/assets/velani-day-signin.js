/* Sign in on the Day design: the PIN fills in as its card scrolls into view. */
(function(){
  var V=window.VD,$=V.$,$$=V.$$,pv=$('#pv');
  if(pv){
    var dots=$$('.pv-d i',pv),done=$('.pv-ok',pv);
    V.onTick(function(){var p=V.still()?1:V.clamp((innerHeight*.9-pv.getBoundingClientRect().top)/(innerHeight*.4)),k=Math.min(4,Math.floor(p*5));dots.forEach(function(d,i){d.classList.toggle('on',i<k)});done.classList.toggle('on',p>=1)});
    V.tick();
  }
})();
