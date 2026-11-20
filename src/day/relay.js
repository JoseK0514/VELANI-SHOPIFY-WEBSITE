(function(){
  var V=window.VD,$=V.$;

  /* The concept screen rises as you scroll. */
  var dev=$('#xh-dev');
  V.onTick(function(){
    if(V.still()){dev.style.removeProperty('--xp');return}
    var r=dev.getBoundingClientRect();
    dev.style.setProperty('--xp',V.ease(V.clamp((innerHeight-r.top)/(innerHeight*.6))).toFixed(3));
  });

})();
