window.__fx=[];
(()=>{
 const $=s=>document.querySelector(s);
 const wide=matchMedia('(min-width:834px)');
 // The greeting card's place in the full screenshot, as fractions of the image
 const X0=.2208,X1=.9483,Y0=.1167,Y1=.4673,A=1500/2400;
 const frame=$('#frame'),crop=$('#crop'),img=crop.querySelector('img');
 const c01=v=>Math.min(1,Math.max(0,v));
 const setOpen=e=>{const W=crop.clientWidth,H=crop.clientHeight;const s0=1/(X1-X0);const s=s0+(1-s0)*e;
  img.style.setProperty('--sc',s.toFixed(4));img.style.setProperty('--tx',(-X0*W*s0*(1-e)).toFixed(1)+'px');img.style.setProperty('--ty',(-Y0*W*A*s0*(1-e)).toFixed(1)+'px');
  const h0=(Y1-Y0)*W*A*s0;crop.style.setProperty('--cb',(Math.max(0,H-h0)*(1-e)).toFixed(1)+'px');crop.style.setProperty('--r',(W*.0206*(1-e)+16*e).toFixed(1)+'px');
  const pe=c01((e-.55)/.45);frame.style.setProperty('--po',c01(pe/.6).toFixed(3));frame.style.setProperty('--pt',((1-(1-Math.pow(1-pe,3)))*48).toFixed(1)+'px');
  frame.style.setProperty('--co',c01((e-.88)/.12).toFixed(3))};
 __fx.push({el:$('#open'),run(p){if(!wide.matches)return;const t=c01(p/.8);setOpen(t<.5?2*t*t:1-2*(1-t)*(1-t))},reset(){setOpen(1)}});
 window.__setOpen=setOpen;
})();
