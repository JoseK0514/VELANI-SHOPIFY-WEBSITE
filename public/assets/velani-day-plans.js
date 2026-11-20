/* Plans on the Day design: the extras around Jose's team-size card (velani-commerce.js sets data-n on [data-pcard]).
   This script only reads that number: the price per employee, the matching plan card, and the 30 days on real dates. */
(function(){
  var d=document,card=d.querySelector('[data-pcard]');
  if(card){
    var per=card.querySelector('[data-per-emp]'),plans=[].slice.call(d.querySelectorAll('.pc[data-band]'));
    var draw=function(){
      var n=Math.max(1,Math.min(31,+card.dataset.n||8)),over=n>30,price=n>15?29:19;
      if(per)per.textContent=over?'':'$'+(price/n).toFixed(2)+' per employee';
      plans.forEach(function(p){p.classList.toggle('sel',!over&&p.dataset.band===(n>15?'2':'1'))});
    };
    new MutationObserver(draw).observe(card,{attributes:true,attributeFilter:['data-n']});
    draw();
  }
  /* The 30 days on the visitor's calendar; without the script the cards say Day 1, 4, 11 and 30. */
  var t=new Date();t.setHours(12,0,0,0);
  [].slice.call(d.querySelectorAll('.cal[data-off]')).forEach(function(c){
    var x=new Date(t);x.setDate(t.getDate()+(+c.dataset.off));
    c.querySelector('small').textContent=x.toLocaleDateString('en-US',{weekday:'short'});
    c.querySelector('b').textContent=x.getDate();
    c.setAttribute('role','img');c.setAttribute('aria-label',x.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}));
  });
})();
