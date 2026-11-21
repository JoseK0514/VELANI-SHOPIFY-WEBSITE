/* Contact on the Day design. velani.js owns the form (topic, checks, preview, live sending); this script only keeps the side
   (heading, line, next steps) and the button's words in step with the chosen topic. Before it runs, the boot script's ask-*
   classes pick the side; after, its own dt-* classes do, so velani.js's word variants (.v-*) are never hidden by a change. */
(function(){
  var d=document,h=d.documentElement,form=d.getElementById('project-inquiry'),interest=d.getElementById('inquiry-interest');
  if(!form||!interest)return;
  var submit=form.querySelector('[data-inquiry-submit]'),es=/^es\b/i.test(h.lang);
  var WORDS=es?{trial:'Enviar solicitud de prueba',big:'Pedir configuración asistida',relay:'Unirme a la lista',other:'Enviar consulta'}
    :{trial:'Send trial request',big:'Request assisted setup',relay:'Join the waitlist',other:'Send inquiry'};
  var MSG=es?['Qué necesita funcionar mejor','Algo más','opcional']:['What needs to work better','Anything else','optional'];
  function key(v){return v==='nevora-demo'?'trial':v==='nevora'?'big':v==='relay'?'relay':'other'}
  var last='';
  function sync(){
    var k=key(interest.value||'');
    h.classList.add('dt');['trial','big','relay','other'].forEach(function(x){h.classList.toggle('dt-'+x,x===k)});
    if(submit&&k!==last){submit.textContent=WORDS[k]}
    /* the message is required only for a general question; its label says so (Jose's words) */
    var ml=form.querySelector('label[for="inquiry-message"]');
    if(ml&&k!==last)ml.innerHTML=k==='other'?MSG[0]:MSG[1]+' <span class="opt">'+MSG[2]+'</span>';
    /* team size and locations belong to the NEVORA topics (velani.js does the same on a change; this covers the first load) */
    var row=form.querySelector('[data-nevora-fields]');if(row)row.hidden=!/^nevora/.test(interest.value||'');
    last=k;
  }
  /* velani.js changes the topic on a choice, on a team of more than 30 and on a restored draft; read it after its handlers run */
  form.addEventListener('change',function(){setTimeout(sync,0)});
  form.addEventListener('input',function(){setTimeout(sync,0)});
  setTimeout(sync,0);
})();
