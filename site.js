(()=>{
  'use strict';
  const root=document.documentElement;
  const theme=document.getElementById('theme');
  const menu=document.getElementById('menu');
  const mobile=document.getElementById('mobile-nav');
  const safeStorage={
    read(k){try{return window.localStorage.getItem(k)}catch(_){return null}},
    write(k,v){try{window.localStorage.setItem(k,v)}catch(_){} }
  };
  if(safeStorage.read('turbine-theme')==='light')root.dataset.theme='light';
  const isLight=()=>root.dataset.theme==='light';
  function updateTheme(){
    if(!theme)return;
    const action=isLight()?'Dark':'Light';
    theme.textContent=isLight()?'◑ Dark mode':'◐ Light mode';
    theme.setAttribute('aria-label',`Switch to ${action.toLowerCase()} mode`);
    theme.setAttribute('title',`Switch to ${action.toLowerCase()} mode`);
    theme.setAttribute('aria-pressed',String(isLight()));
  }
  updateTheme();
  theme?.addEventListener('click',()=>{
    root.dataset.theme=isLight()?'dark':'light';
    safeStorage.write('turbine-theme',root.dataset.theme);
    updateTheme();
  });
  function closeMenu(returnFocus=false){
    if(!mobile||!menu)return;
    mobile.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open navigation');
    if(returnFocus)menu.focus();
  }
  menu?.setAttribute('aria-label','Open navigation');
  menu?.addEventListener('click',()=>{
    if(!mobile)return;
    const willOpen=!mobile.classList.contains('open');
    mobile.classList.toggle('open',willOpen);
    menu.setAttribute('aria-expanded',String(willOpen));
    menu.setAttribute('aria-label',willOpen?'Close navigation':'Open navigation');
  });
  mobile?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&mobile?.classList.contains('open'))closeMenu(true);
  });
  document.addEventListener('click',e=>{
    if(mobile?.classList.contains('open')&&!mobile.contains(e.target)&&!menu?.contains(e.target))closeMenu();
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>1120)closeMenu()});

  // Page-chapter navigation: desktop remains visible; small layouts collapse.
  const chapterNav=document.querySelector('[data-chapters]');
  if(chapterNav){
    const toggle=chapterNav.querySelector('.chapter-toggle');
    const links=chapterNav.querySelector('.chapter-links');
    let wasCompact=null;
    function chapterViewport(){
      const compact=window.matchMedia('(max-width:1120px)').matches;
      if(compact!==wasCompact){
        links.hidden=compact;
        toggle?.setAttribute('aria-expanded',String(!compact));
        wasCompact=compact;
      }
    }
    chapterViewport();
    window.addEventListener('resize',chapterViewport,{passive:true});
    toggle?.addEventListener('click',()=>{
      links.hidden=!links.hidden;
      toggle.setAttribute('aria-expanded',String(!links.hidden));
    });
    links.addEventListener('click',e=>{
      if(e.target.closest('a')&&window.matchMedia('(max-width:1120px)').matches){
        links.hidden=true;toggle.setAttribute('aria-expanded','false');
      }
    });
    const chapterLinks=[...links.querySelectorAll('a[href^="#"]')];
    const sections=chapterLinks.map(a=>document.getElementById(a.hash.slice(1)));
    let scheduled=false;
    function updateCurrentChapter(){
      scheduled=false;
      const header=document.querySelector('.header');
      const base=(header?.getBoundingClientRect().height||82)+55;
      const pad=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
      const margin=sections[0]?(parseFloat(getComputedStyle(sections[0]).scrollMarginTop)||0):0;
      const offset=Math.max(base,pad+margin+12);
      let current=0;
      for(let i=0;i<sections.length;i++){
        const element=sections[i];
        if(element&&element.getBoundingClientRect().top<=offset)current=i;
      }
      chapterLinks.forEach((a,i)=>{
        if(i===current)a.setAttribute('aria-current','location');
        else a.removeAttribute('aria-current');
      });
    }
    const scheduleChapter=()=>{
      if(!scheduled){scheduled=true;window.requestAnimationFrame(updateCurrentChapter)}
    };
    chapterLinks.forEach((a,i)=>a.addEventListener('click',()=>{
      chapterLinks.forEach((other,j)=>{
        if(i===j)other.setAttribute('aria-current','location');
        else other.removeAttribute('aria-current');
      });
      window.setTimeout(scheduleChapter,300);
    }));
    window.addEventListener('scroll',scheduleChapter,{passive:true});
    window.addEventListener('resize',scheduleChapter,{passive:true});
    window.addEventListener('hashchange',scheduleChapter);
    updateCurrentChapter();
  }

  // WEB-01 preview boundary: no network, mailto or tenant action is authorised.
  const form=document.querySelector('#enquiry');
  const status=document.querySelector('#form-status');
  const setStatus=(message)=>{if(status){status.textContent=message;status.classList.add('status-notice')}};
  if(form){
    const purpose=form.dataset.enquiryPurpose==='trial-interest'?'trial-interest':'general';
    setStatus('Preview only: no enquiry service is connected. Your information stays in this browser.');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const required=[...form.querySelectorAll('[required]')];
      for(const input of required){
        if(typeof input.value==='string')input.value=input.value.trim();
      }
      if(!form.reportValidity()){
        setStatus('Please complete the required fields to check your enquiry. Nothing has been sent.');
        return;
      }
      const message=purpose==='trial-interest'
        ? 'Your trial-interest details pass the local form checks. This preview cannot send the request or create a trial.'
        : 'Your enquiry details pass the local form checks. This preview cannot send the request or initiate a trial.';
      setStatus(message);
      window.TURBINE_Telemetry?.emit('contact_attempt_blocked');
    });
  }

})();
