(function(){
  const body=document.body;
  const header=document.getElementById('siteHeader');
  const menu=document.getElementById('menuToggle');
  const nav=document.querySelector('.nav-links');
  let lastY=window.scrollY,ticking=false;

  function publish(hidden){
    body.classList.toggle('floating-hidden',hidden);
    if(window.parent!==window)window.parent.postMessage({type:'febfit-floating',hidden},'*');
  }
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(()=>{
      const y=window.scrollY;const down=y>lastY&&y>110;const nearEnd=y+innerHeight>document.documentElement.scrollHeight-360;
      header?.classList.toggle('header-condensed',down);
      publish(down||nearEnd);
      body.classList.toggle('floating-low',!down&&window.parent===window);
      lastY=Math.max(0,y);ticking=false;
    });
  }
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  if(menu&&nav){
    menu.setAttribute('aria-label','Open menu');menu.setAttribute('aria-expanded','false');
    menu.addEventListener('click',()=>{
      const open=!body.classList.contains('menu-open');body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');
    });
    nav.addEventListener('click',event=>{if(event.target.closest('a')){body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu')}});
  }

  const featureBook=document.getElementById('featureBook');
  if(featureBook){
    let startX=0,startY=0;
    featureBook.addEventListener('pointerdown',event=>{startX=event.clientX;startY=event.clientY});
    featureBook.addEventListener('pointerup',event=>{const dx=event.clientX-startX,dy=event.clientY-startY;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)document.getElementById(dx<0?'bookNext':'bookPrev')?.click()});
  }

  document.querySelectorAll('input,select,textarea').forEach(field=>{
    field.addEventListener('focus',()=>publish(true));
    field.addEventListener('blur',()=>setTimeout(()=>publish(false),180));
  });

})();
