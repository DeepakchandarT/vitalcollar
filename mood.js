(function(){
  const root=document.getElementById('mood');
  if(!root)return;
  const box=root.querySelector('[data-mood-options]');
  const card=root.querySelector('[data-mood-card]');
  const daysEl=root.querySelector('[data-mood-days]');
  const streakEl=root.querySelector('[data-mood-streak]');
  const WHATSAPP='919025863098';
  const E='<circle cx="20" cy="20" r="17"/>',D='<path d="M14 17h.01M26 17h.01" stroke-width="3.4"/>';
  const moods=[
    {id:'energised',label:'Energised',svg:E+D+'<path d="M12 24q8 9 16 0M20 2v4M9 6l2 3M31 6l-2 3"/>',tag:'Fitness',mode:'fitness',anchor:'features',cta:'See fitness support',h:'Make the most of it.',t:'A good day for a strength session. Warm up well and finish with a short stretch.'},
    {id:'calm',label:'Calm',svg:E+'<path d="M11 18q3 3 6 0M23 18q3 3 6 0M15 26q5 3 10 0"/>',tag:'Wellness',mode:'wellness',anchor:'pillars',cta:'Explore mindfulness',h:'Keep that steady feeling.',t:'Five slow minutes of breathing or gentle stretching can help the calm last through the day.'},
    {id:'okay',label:'Okay',svg:E+D+'<path d="M14 27h12"/>',tag:'Fitness',mode:'fitness',anchor:'features',cta:'Choose light movement',h:'An okay day is a good day to move.',t:'A 15-minute walk and a glass of water may be exactly enough for today.'},
    {id:'tired',label:'Tired',svg:E+'<path d="M10 18h7M23 18h7M15 28q5-3 10 0"/>',tag:'Wellness',mode:'wellness',anchor:'about',cta:'Try gentle wellness',h:'Go gently today.',t:'Choose light mobility instead of a hard session, and give rest a real place in your plan.'},
    {id:'stressed',label:'Stressed',svg:E+D+'<path d="M10 11l6 2M30 11l-6 2M13 27q2-3 4 0t4 0t4 0"/>',tag:'Wellness',mode:'wellness',anchor:'about',cta:'Explore mindfulness',breath:true,h:'Take 14 seconds first.',t:'Breathe in for 4, hold for 4, and out for 6. Press start and follow the circle.'},
    {id:'sore',label:'Sore',svg:E+'<path d="M11 15l6 3-6 3M29 15l-6 3 6 3M14 28q6-4 12 0"/>',tag:'Physio',wa:true,cta:'Talk to our physio',h:'Listen to your body.',t:'Rest the area and keep moving what does not hurt. If the pain is sharp, follows an injury or lasts more than a few days, book a physio assessment.'}
  ];
  const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const load=()=>{try{return JSON.parse(localStorage.getItem('febfit-mood'))||{}}catch(e){return{}}};
  const save=value=>{try{localStorage.setItem('febfit-mood',JSON.stringify(value))}catch(e){}};
  const icon=m=>'<svg viewBox="0 0 40 40" aria-hidden="true">'+m.svg+'</svg>';
  let timer=null;
  box.innerHTML=moods.map(m=>'<button class="fwm-m" type="button" data-id="'+m.id+'" aria-pressed="false" aria-label="Feeling '+m.label+'">'+icon(m)+'<span>'+m.label+'</span></button>').join('');

  function route(mode,anchor){
    const own=document.body.classList.contains(mode+'-theme');
    if(own){document.getElementById(anchor)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}
    if(window.parent!==window){window.parent.postMessage({type:'febfit-mode',mode,anchor},'*');return}
    location.href='index.html#'+mode;
  }
  function breathe(){
    clearTimeout(timer);const orb=root.querySelector('#fwm-orb');if(!orb)return;
    let phase=0;const phases=[['In 4',1,4000],['Hold 4',1,4000],['Out 6',.62,6000]];
    const go=()=>{if(phase===phases.length){orb.textContent='Done';return}const [label,scale,duration]=phases[phase++];orb.textContent=label;orb.style.transitionDuration=(label.startsWith('Hold')?0:duration)+'ms';orb.style.transform='scale('+scale+')';timer=setTimeout(go,duration)};go();
  }
  function show(m){
    clearTimeout(timer);card.hidden=false;card.style.animation='none';void card.offsetWidth;card.style.animation='';
    const link=m.wa?'https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent('Hi, I would like help with soreness.'):'#';
    card.innerHTML='<span class="fwm-tag">'+m.tag+'</span><h3>'+m.h+'</h3><p>'+m.t+'</p>'+(m.breath?'<div class="fwm-breath"><div class="fwm-orb" id="fwm-orb">Ready</div></div>':'')+'<div class="fwm-act">'+(m.breath?'<button class="fwm-btn" data-breathe type="button">Start 14-second reset</button>':'')+'<a class="fwm-btn'+(m.breath?' alt':'')+'" href="'+link+'" '+(m.wa?'target="_blank" rel="noopener"':'data-route="true"')+'>'+m.cta+'</a></div>';
    card.querySelector('[data-breathe]')?.addEventListener('click',breathe);
    if(!m.wa)card.querySelector('[data-route]')?.addEventListener('click',e=>{e.preventDefault();route(m.mode,m.anchor)});
  }
  function week(){
    const stored=load(),names=['S','M','T','W','T','F','S'],now=new Date();let html='',streak=0;
    for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);const mood=moods.find(x=>x.id===stored[key(d)]);html+='<div class="fwm-d'+(i===0?' today':'')+'">'+names[d.getDay()]+(mood?icon(mood):'<i></i>')+'</div>'}
    for(let i=0;i<30;i++){const d=new Date(now);d.setDate(now.getDate()-i);if(stored[key(d)])streak++;else if(i>0)break}
    daysEl.innerHTML=html;streakEl.textContent=streak>1?streak+' day check-in streak. Keep going.':streak===1?'1 day checked in. Come back tomorrow.':'Check in today to start your streak.';
  }
  function pick(id){const mood=moods.find(x=>x.id===id);box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));const stored=load();stored[key(new Date())]=id;save(stored);show(mood);week()}
  box.addEventListener('click',event=>{const button=event.target.closest('button[data-id]');if(button)pick(button.dataset.id)});
  const today=load()[key(new Date())];if(today&&moods.some(m=>m.id===today))pick(today);else week();
  window.setMoodTheme=theme=>root.dataset.theme=theme==='wellness'?'wellness':'fitness';
  window.setMoodTheme(document.body.classList.contains('wellness-theme')?'wellness':'fitness');
})();
