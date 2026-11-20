(function(){
  var V=window.VP,$=V.$,$$=V.$$;

  /* Team-size picker: price, bar and matching plan follow the slider. */
  var r=$('#team'),n=$('#team-n'),p=$('#team-p'),per=$('#team-per'),note=$('#calc-note'),marks=$('#marks'),minus=$('#minus'),plus=$('#plus'),pc1=$('#pc1'),pc2=$('#pc2');
  var NOTE='Owners aren’t counted. One price for the whole business, billed monthly.';
  for(var i=1;i<=31;i++){var m=document.createElement('i');m.className=i<=15?'b1':i<=30?'b2':'over';marks.appendChild(m)}
  var ms=$$('i',marks);
  function draw(){
    var v=+r.value,over=v>30;
    n.innerHTML=(over?'31+':v)+'<small>'+(v===1?'employee':'employees')+'</small>';
    p.innerHTML=over?'Let’s talk':(v<=15?'$19':'$29')+'<small>/month</small>';
    r.setAttribute('aria-valuetext',over?'More than 30 employees, assisted setup':v+(v===1?' employee, ':' employees, ')+(v<=15?'$19':'$29')+' a month');
    per.textContent=over?'':'$'+((v<=15?19:29)/v).toFixed(2)+' per employee';
    note.innerHTML=over?'More than 30? <b>Write to us for assisted setup.</b> We reply within two business days.':NOTE;
    ms.forEach(function(m,i){m.classList.toggle('on',i===v-1)});
    pc1.classList.toggle('sel',!over&&v<=15);pc2.classList.toggle('sel',!over&&v>15);
    minus.disabled=v<=1;plus.disabled=v>=31;
  }
  r.addEventListener('input',draw);
  minus.addEventListener('click',function(){r.value=Math.max(1,+r.value-1);draw()});
  plus.addEventListener('click',function(){r.value=Math.min(31,+r.value+1);draw()});
  draw();

  /* The 30 days on the visitor's calendar. */
  var t=new Date();t.setHours(12,0,0,0);
  $$('.cal[data-off]').forEach(function(c){
    var d=new Date(t);d.setDate(t.getDate()+(+c.dataset.off));
    c.querySelector('small').textContent=d.toLocaleDateString('en-US',{weekday:'short'});
    c.querySelector('b').textContent=d.getDate();
    c.setAttribute('aria-label',d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}));
  });
})();
