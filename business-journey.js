/* WEB-01 V4-R5 | Business-first journey. No account creation, tracking or external calls. */
(()=>{
  'use strict';
  const STORIES={
    starting: {"title": "A clear start, without making things complicated.", "description": "There is plenty to think about when you are getting started. You need a way to look after your first customers, deliver what you promised and know where your money stands.", "payoff": "Start with a simple routine that can grow with you."},
    solo: {"title": "You run the business. You should not have to remember everything.", "description": "When you work for yourself, you are often the person talking to customers, doing the work, sorting the paperwork and making sure you get paid. The aim is to make that easier to manage.", "payoff": "Keep a clear view of your customers, work and money, without a bigger admin burden."},
    team: {"title": "Help everyone know what to do, without chasing every detail.", "description": "When other people join the business, a quick conversation is no longer enough. Customers need answers, people need clear responsibilities, and the owner needs to see where things stand.", "payoff": "Keep the freedom of a small team while giving every important job an owner."},
    growing: {"title": "Grow without losing sight of the work or the money.", "description": "More customers and more staff bring opportunity, but they also bring more handovers. Clear decisions, sensible approvals and reliable records become much more important.", "payoff": "Put useful structure around the business without slowing it down."},
    enterprise: {"title": "Keep teams moving together, with a clear view of what matters.", "description": "A larger business has more people, departments and decisions. The challenge is not finding more software. It is keeping information reliable as the work moves across the organisation.", "payoff": "Connect work and accountability while keeping the right checks in place."},
  };
  const chooser=document.querySelector('[data-business-chooser="home"]');
  const detail=document.querySelector('[data-business-chooser="detail"]');
  const allowed=Object.keys(STORIES);
  const valid=key=>allowed.includes(key)?key:'';
  function chosen(container,key,group){
    container.querySelectorAll(`input[name="${group}"]`).forEach(r=>{r.checked=r.value===key});
  }
  if(chooser){
    const title=chooser.querySelector('[data-stage-title]');
    const description=chooser.querySelector('[data-stage-description]');
    const payoff=chooser.querySelector('[data-stage-payoff]');
    const link=chooser.querySelector('[data-stage-next]');
    chooser.querySelectorAll('input[name="business-stage-home"]').forEach(input=>input.addEventListener('change',()=>{
      const key=valid(input.value); if(!key)return;
      title.textContent=STORIES[key].title;
      description.textContent=STORIES[key].description;
      payoff.textContent=STORIES[key].payoff;
      link.href=`my-business.html?stage=${encodeURIComponent(key)}`;
      link.textContent='Follow my working day →';
      window.TURBINE_Telemetry?.emit('business_stage_select',{stage:key});
    }));
  }
  if(detail){
    const panels=[...detail.querySelectorAll('[data-stage-panel]')];
    const placeholder=detail.querySelector('#business-day-placeholder');
    function apply(key){
      const selected=valid(key);
      chosen(detail,selected,'business-stage-detail');
      panels.forEach(p=>{p.hidden=p.dataset.stagePanel!==selected});
      if(placeholder)placeholder.hidden=Boolean(selected);
      try{
        const u=new URL(location.href);
        if(selected)u.searchParams.set('stage',selected); else u.searchParams.delete('stage');
        history.replaceState(null,'',u.pathname+u.search+u.hash);
      }catch(_){/* Navigation must keep working without history API. */}
    }
    const initial=valid(new URLSearchParams(location.search).get('stage')||'');
    apply(initial);
    detail.querySelectorAll('input[name="business-stage-detail"]').forEach(input=>input.addEventListener('change',()=>apply(input.value)));
  }
  const focusData={
    customers:['Keep every promise and follow-up in view.','A customer does not need another system. They need to know you remember what you agreed and what happens next.','capabilities.html#section-1','See the connected customer journey →'],
    work:['Know what has to happen next.','Once work is agreed, the details should stay clear: what needs doing, when it is due and who is looking after it.','capabilities.html#section-3','See how work could be organised →'],
    money:['See what is owed and what has been paid.','Follow costs, invoices and payments in the context of the work that caused them, instead of searching across separate records.','capabilities.html#section-6','See how money stays connected →'],
    people:['Make responsibility clear without adding red tape.','Whether it is two people or twenty teams, everyone should know what belongs to them and when a decision needs approval.','capabilities.html#section-12','See how responsibility works →']
  };
  const answer=document.querySelector('.business-focus-answer');
  document.querySelectorAll('[data-focus]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!answer)return;
    document.querySelectorAll('[data-focus]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    const row=focusData[btn.dataset.focus];if(!row)return;
    answer.querySelector('[data-focus-title]').textContent=row[0];
    answer.querySelector('[data-focus-description]').textContent=row[1];
    const a=answer.querySelector('[data-focus-link]');a.href=row[2];a.textContent=row[3];
    window.TURBINE_Telemetry?.emit('business_focus_select',{focus:btn.dataset.focus});
  }));
})();

;(()=>{
  const node=document.getElementById('occupation-context-note');
  if(!node)return;
  const occupation=new URLSearchParams(window.location.search).get('occupation');
  if(!occupation||!occupation.trim())return;
  const value=occupation.trim().slice(0,90);
  node.querySelector('strong').textContent='Your work matters here: '+value;
  node.querySelector('p').textContent='We may not have a separate story for that exact title. Choose how you work below and follow a general business journey. This does not claim specialist functions for your occupation are already available.';
  node.hidden=false;
})();
