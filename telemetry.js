/* TURBINE WEB-01 | Privacy-preserving, in-memory instrumentation.
   No network requests, cookies, identity, addresses, form contents or search terms.
   External analytics may be connected only after approved consent controls. */
(()=>{
  'use strict';
  const events=[];
  const safePage=()=>window.location.pathname.split('/').filter(Boolean).slice(-2).join('/');
  let authorizedAdapter=null;
  const allowed=new Set([
    'page_view','navigation_click','chapter_jump','trial_cta_click',
    'business_stage_select','business_focus_select',
    'occupation_search','occupation_profile_open','website_guide_open',
    'website_guide_close','contact_attempt_blocked','scroll_depth_75'
  ]);
  function emit(name,detail={}){
    if(!allowed.has(name))return;
    const record={event:name,page:safePage(),...detail};
    events.push(record);
    if(events.length>60)events.shift();
    // Only a consent-authorized adapter is allowed to forward events.
    try{authorizedAdapter?.(record)}catch(_){/* Analytics must never break the site. */}
    document.dispatchEvent(new CustomEvent('turbine:analytics',{detail:record}));
  }
  window.TURBINE_Telemetry={
    emit,
    // The caller is responsible for explicit prior consent and approved tags.
    connectWithConsent(adapter,consentApproved){
      if(consentApproved===true&&typeof adapter==='function')authorizedAdapter=adapter;
    },
    disconnect(){authorizedAdapter=null},
    // Read-only test access; never sent by this script.
    inspect(){return events.map(e=>({...e}))}
  };
  document.addEventListener('DOMContentLoaded',()=>{
    emit('page_view');
    let depthRecorded=false;
    window.addEventListener('scroll',()=>{
      if(depthRecorded)return;
      const maximum=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      if(window.scrollY/maximum>=.75){depthRecorded=true;emit('scroll_depth_75')}
    },{passive:true});
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href]');if(!a)return;
      const path=a.getAttribute('href')||'';
      if(path.startsWith('#')){
        emit('chapter_jump',{destination:path.slice(1,65)});return;
      }
      let destination='';
      try{const url=new URL(path,window.location.href);destination=url.pathname.split('/').filter(Boolean).slice(-2).join('/')}catch(_){return}
      if(/trial\.html$/.test(destination))emit('trial_cta_click',{destination});
      if(/occupation\.html$|occupations\.html$|roles\//.test(destination))emit('occupation_profile_open',{destination});
      if(a.closest('.nav,.mobile-nav'))emit('navigation_click',{destination});
    });
  });
})();
