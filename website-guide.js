(()=>{
  'use strict';
  const button=document.getElementById('website-guide-trigger');
  const panel=document.getElementById('website-guide-panel');
  const close=document.getElementById('website-guide-close');
  if(!button||!panel||!close)return;
  const guideHeading=panel.querySelector('.website-guide-head h2');
  const guideIntro=panel.querySelector('p');
  if(guideHeading){guideHeading.id='website-guide-heading';panel.setAttribute('aria-labelledby',guideHeading.id)}
  if(guideIntro){guideIntro.id='website-guide-intro';panel.setAttribute('aria-describedby',guideIntro.id)}
  // The compact menu and website guide must not remain open together.
  const navMenu=document.getElementById('menu');
  navMenu?.addEventListener('click',()=>{if(!panel.hidden)hide(false)});


  // Keep the guide accessible without obscuring content at high browser zoom.
  // Reparent the original control instead of creating duplicate triggers.
  const headerActions=document.querySelector('.header .actions');
  const menu=headerActions?.querySelector('.menu');
  const compactGuide=window.matchMedia('(max-width: 1120px), (max-height: 650px)');
  function positionGuide(){
    const compact=compactGuide.matches && Boolean(headerActions);
    if(compact){
      headerActions.insertBefore(button, menu || null);
    } else {
      panel.parentElement.insertBefore(button, panel);
    }
    button.classList.toggle('guide-in-header',compact);
  }
  positionGuide();
  compactGuide.addEventListener('change',positionGuide);
  const hide=(focus=false)=>{panel.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open website journey guide');if(focus)button.focus();window.TURBINE_Telemetry?.emit('website_guide_close')};
  const show=()=>{if(navMenu?.getAttribute('aria-expanded')==='true')navMenu.click();panel.hidden=false;button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Close website journey guide');close.focus();window.TURBINE_Telemetry?.emit('website_guide_open')};
  button.addEventListener('click',()=>panel.hidden?show():hide(true));
  close.addEventListener('click',()=>hide(true));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)hide(true)});
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!button.contains(e.target))hide()});
})();
