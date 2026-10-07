const mainScreen=document.getElementById('screen');
const scoreTop=document.getElementById('scoreTop');
const workingFile=document.getElementById('workingFile');
const tip=document.getElementById('tip');
const stageStrip=document.getElementById('stageStrip');
const reduceMotion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let step=1,score=0,persona=null,selectedNeeds=[],builtStories=[],freeStory=null,independentChallenge=null,priorityOrder=[],priorityReason='';
let learnerName='',learnerClass='',evidenceScored=false,guidedScored=false;
const stages=['Brief','Persona','Evidence','Guided story','Transfer task','Critique','Priority'];

const personas=[
{id:'maya',avatar:'MP',name:'Maya Patel',age:17,role:'Sixth-form student',device:'Mostly phone',
context:'Revises on buses and in short gaps between lessons. Mobile signal is not always reliable.',
goals:['Revise in short bursts','See progress quickly','Use the service comfortably on a phone'],
frustrations:['Long walls of text','Losing progress','Desktop-first layouts'],
access:'Clear text, strong contrast and large touch targets.'},
{id:'dan',avatar:'DR',name:'Dan Reeves',age:42,role:'Part-time mature learner',device:'Laptop at home',
context:'Works full-time and studies late in the evening. He has little patience for hunting through menus.',
goals:['Find exactly what he needs','Resume previous work','Understand unfamiliar terminology'],
frustrations:['Hidden navigation','Unexplained jargon','Unnecessary steps'],
access:'Plain language, obvious navigation and reliable save/resume.'},
{id:'leo',avatar:'LB',name:'Leo Brooks',age:19,role:'College student',device:'Laptop + keyboard',
context:'Technically confident. Uses keyboard navigation and assistive technology rather than relying on a mouse.',
goals:['Reach every control by keyboard','Know where focus is','Complete the same tasks as everyone else'],
frustrations:['Mouse-only controls','Invisible focus states','Unlabelled icons'],
access:'Keyboard access, visible focus and meaningful labels.'}
];

const needs=[
{id:'save',title:'Save progress automatically',
support:{
maya:'Maya revises in short, interrupted sessions, so she may need to stop and continue later.',
dan:'Dan studies around full-time work, so he needs to stop and resume without losing progress.'
},
story:{
maya:{goal:'save my revision progress',benefit:'I can continue later after an interrupted study session'},
dan:{goal:'resume my saved revision progress',benefit:'I can continue where I stopped after work'}
}},
{id:'mobile',title:'Responsive mobile layout',
support:{maya:'Maya mainly studies on her phone, including while travelling.'},
story:{maya:{goal:'use every revision activity comfortably on my phone',benefit:'I can revise during short gaps wherever I am'}}},
{id:'keyboard',title:'Keyboard-accessible controls',
support:{leo:'Leo uses keyboard navigation rather than relying on a mouse.'},
story:{leo:{goal:'use every interactive control from the keyboard',benefit:'I can complete tasks without needing a mouse'}}},
{id:'focus',title:'Strong visible focus states',
support:{leo:'Leo needs to know which control currently has keyboard focus.'},
story:{leo:{goal:'see a clear focus indicator as I move through controls',benefit:'I always know where I am on the page'}}},
{id:'labels',title:'Meaningful labels on controls',
support:{leo:'Leo uses assistive technology, so controls need meaningful text labels rather than unexplained icons.'},
story:{leo:{goal:'get meaningful labels for buttons and controls',benefit:'my assistive technology can identify what each control does'}}},
{id:'plain',title:'Plain-language explanations',
support:{dan:'Dan is frustrated by unexplained jargon and wants to understand unfamiliar terminology quickly.'},
story:{dan:{goal:'see plain-English explanations of technical terms',benefit:'I can understand unfamiliar content without getting stuck'}}},
{id:'search',title:'Fast topic search',
support:{
maya:'Maya has short study windows, so reaching a topic quickly matters.',
dan:'Dan has limited study time after work, so he needs to find the right content quickly.'
},
story:{
maya:{goal:'find a revision topic quickly',benefit:'I can use short study windows effectively'},
dan:{goal:'search directly for the topic I need',benefit:'I do not waste my limited evening study time'}
}},
{id:'threeD',title:'Animated 3D landing page',support:{},story:{},noFit:'No persona evidence says a 3D intro solves a user problem. It is a design preference.'},
{id:'music',title:'Autoplay background music',support:{},story:{},noFit:'No persona asks for background music, and autoplay could create an accessibility or concentration barrier.'}
];

const transferChallenges={
maya:[
{id:'maya-captions',
evidence:'A follow-up interview finds that Maya often watches revision videos on a noisy bus. She cannot always hear the narration and usually keeps her phone muted around other passengers.',
concepts:['caption','captions','subtitle','subtitles','transcript','text','video','hear','sound','audio','muted','narration'],
model:'As a student revising while travelling, I want a text alternative to spoken video content, so that I can understand the lesson when I cannot hear the audio.'},
{id:'maya-duration',
evidence:'Maya says she sometimes has only 10–15 minutes before her next lesson. She gets frustrated when she opens a revision activity and only discovers halfway through that it takes much longer than the time she has available.',
concepts:['time','minutes','duration','length','estimate','short','activity','finish','choose','available'],
model:'As a student revising in short gaps, I want to know roughly how long an activity will take, so that I can choose one I have time to finish.'}
],
dan:[
{id:'dan-progress',
evidence:'In a later interview, Dan says that after several busy days away from studying he often cannot remember which revision topics he has already completed. He sometimes repeats work by mistake.',
concepts:['progress','completed','complete','topics','track','status','remember','repeat','finished','studied'],
model:'As a part-time learner, I want to see which topics I have already completed, so that I can continue my revision without repeating work.'},
{id:'dan-duration',
evidence:'Dan explains that some evenings he has 20 minutes to study and other evenings he has an hour. He wants to choose an activity that fits the time he actually has before going to bed.',
concepts:['time','minutes','hour','duration','length','estimate','activity','choose','finish','evening'],
model:'As a part-time learner, I want to know how long revision activities are likely to take, so that I can choose one that fits the time I have available.'}
],
leo:[
{id:'leo-errors',
evidence:'During an accessibility test, Leo submits a form with a mistake. The page only puts a red border around the incorrect field. His assistive technology does not explain what went wrong or how to correct it.',
concepts:['error','errors','message','text','explain','mistake','wrong','correct','field','invalid','assistive'],
model:'As a learner using assistive technology, I want form errors to be explained in text, so that I can understand what went wrong and correct it.'},
{id:'leo-timeout',
evidence:'Leo reports that a timed revision quiz sometimes moves on before his assistive technology has finished reading the question and answer choices. He knows the content but cannot always respond before the timer expires.',
concepts:['time','timer','timed','extra','extend','pause','reading','read','pace','respond','expires','assistive'],
model:'As a learner using assistive technology, I want enough time to read and answer each question, so that I can demonstrate what I know without the timer blocking me.'}
]
};

const critiqueBank=[
{story:'As a student, I want a dark blue navigation bar, so that the website looks modern.',good:false,
why:'It jumps to a visual solution. “Dark blue” does not describe a user problem or outcome.',
fix:'Describe the need first: “As a student, I want important navigation choices to be easy to identify, so that I can move around the site quickly.”'},
{story:'As a student, I want my progress to be saved, so that I can continue revising later.',good:true,
why:'It identifies a user, a genuine goal and the value of achieving it.',
fix:'The team can now decide how best to provide saving without the story prescribing the implementation.'},
{story:'As a user, I want the database to use SQL, so that the backend is efficient.',good:false,
why:'SQL is an implementation choice. The user story should describe the experience the user needs.',
fix:'A user-centred version might focus on fast search results or reliable saving.'},
{story:'As a student, I want to use the revision app, so that I can use the app for revision.',good:false,
why:'The “so that” is circular. It repeats the action instead of explaining why it matters.',
fix:'Add real value: “…so that I can practise weak topics before my exam.”'},
{story:'As a student, I want the entire course, every assessment and all feedback in one feature, so that I can pass the whole qualification.',good:false,
why:'This is too large to be a useful story. It bundles many different goals into one epic-sized request.',
fix:'Break it into smaller stories that can be understood, built and tested separately.'},
{story:'As a learner with limited study time, I want to return to the last topic I opened, so that I can continue without searching for it again.',good:true,
why:'The user context is meaningful, the goal is focused, and the benefit clearly explains its value.',
fix:'This is focused enough to discuss and test while still leaving the implementation open.'},
{story:'As a student, I want a search box fixed at the top of every page, so that I can find revision topics quickly.',good:false,
why:'The underlying need is good, but the story has already prescribed a particular interface control and its position.',
fix:'Keep the need and remove the design decision: “As a student, I want to find revision topics quickly, so that I can spend more time revising.”'}
];

function esc(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]})}
function shuffle(items){
  const a=items.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}
  return a
}
function personaById(id){return personas.find(function(p){return p.id===id})}
function update(){
  scoreTop.textContent='SCORE '+String(score).padStart(3,'0');
  stageStrip.innerHTML=stages.map(function(s,i){
    const state=i+1<step?'done':i+1===step?'current':'';
    const current=i+1===step?' aria-current="step"':'';
    return '<div class="stage-dot '+state+'"'+current+'>'+(i+1)+'. '+esc(s)+'</div>'
  }).join('');
  if(learnerName){
    workingFile.innerHTML='<span class="meta">LEARNER</span><br><strong>'+esc(learnerName)+'</strong><br>'+esc(learnerClass)+'<br><br><span class="meta">CURRENT FILE</span><br>'+(persona?'<strong>'+esc(persona.name)+'</strong><br>'+esc(persona.role):'Awaiting persona selection')+'<br><br><span class="meta">PHASE</span><br>'+esc(stages[Math.min(step-1,stages.length-1)]);
  }else workingFile.textContent='No learner details yet.';
}
function addScore(n){score+=n;update()}
function render(html){
  mainScreen.innerHTML=html;update();
  window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
  const heading=mainScreen.querySelector('h2');
  if(heading){heading.setAttribute('tabindex','-1');requestAnimationFrame(function(){heading.focus({preventScroll:true})})}
}
function button(text,fn,alt){
  const b=document.createElement('button');b.type='button';b.className='btn'+(alt?' alt':'');b.textContent=text;b.addEventListener('click',fn);return b
}
function actions(){const d=document.createElement('div');d.className='btns';return d}
function next(text,fn){const a=actions();a.append(button(text,fn,false));mainScreen.append(a)}
function supportedNeeds(p){return needs.filter(function(n){return !!n.support[p.id]})}
function fitNames(n){return Object.keys(n.support).map(function(id){return personaById(id).name.split(' ')[0]})}
function significantTokens(s){
  const stop=new Set(['this','that','with','from','into','have','will','their','there','when','where','what','which','because','about','they','them','then','than','user','student','learner','want','your','need','needs','app','page','able','every']);
  return (String(s).toLowerCase().match(/[a-z]+/g)||[]).filter(function(w){return w.length>3&&!stop.has(w)})
}
function lesson(title,definition,why,lookFor,mistake,example){
  return '<section class="lesson">'+
    '<div class="lesson-head"><span class="lesson-no">?</span><strong>'+esc(title)+'</strong></div>'+
    '<div class="lesson-body">'+
      '<div class="definition">'+definition+'</div>'+
      '<div class="explain-grid">'+
        '<div class="explain"><h4>Why do we use it?</h4><p>'+why+'</p></div>'+
        '<div class="explain"><h4>What should you look for?</h4><p>'+lookFor+'</p></div>'+
        '<div class="explain"><h4>Common mistake</h4><p>'+mistake+'</p></div>'+
        '<div class="explain"><h4>In simple terms</h4><p>Use evidence about a user to make a better decision. Do not guess from your own preferences.</p></div>'+
      '</div>'+
      '<div class="example"><div class="label">Worked example</div>'+example+'</div>'+
    '</div>'+
  '</section>'
}

function stage1(){
  step=1;tip.textContent='Good design starts with evidence about users, not personal preference.';
  render(
    '<div class="kicker">Client brief / 01</div>'+
    '<h2>Why are we doing this?</h2>'+
    '<p class="lead">When a team designs a website or app, the dangerous question is <strong>“What do I like?”</strong> The better question is <strong>“What does the user need, and what evidence supports that?”</strong></p>'+
    '<div class="why-chain">'+
      '<div class="chain-box">RESEARCH<br><span class="small">What do we know?</span></div><div class="chain-arrow">→</div>'+
      '<div class="chain-box">PERSONA<br><span class="small">Who represents the user?</span></div><div class="chain-arrow">→</div>'+
      '<div class="chain-box">USER STORY<br><span class="small">What do they need and why?</span></div><div class="chain-arrow">→</div>'+
      '<div class="chain-box">FEATURE<br><span class="small">What could we build?</span></div>'+
    '</div>'+
    '<section class="lesson"><div class="lesson-head"><span class="lesson-no">1</span><strong>The design problem</strong></div><div class="lesson-body">'+
      '<div class="explain-grid">'+
        '<div class="explain"><h4>The problem</h4><p>Designers are not the same as every user. A feature that seems obvious to you might confuse or exclude somebody else.</p></div>'+
        '<div class="explain"><h4>The approach</h4><p>Research users, identify patterns, represent those patterns in personas, then turn needs into user stories and requirements.</p></div>'+
        '<div class="explain"><h4>Your task</h4><p>You will make decisions for one persona and keep a visible evidence trail from that person to the final priority.</p></div>'+
        '<div class="explain"><h4>What counts as strong?</h4><p>You should be able to say: “I chose this because the evidence about the user shows…”</p></div>'+
      '</div></div></section>'+
    '<hr class="rule">'+
    '<div class="casefile"><div class="case-no">01</div><div><h3>The client</h3><p>A college has asked your team to redesign <strong>StudySprint</strong>, a revision web app. The old team kept adding features they personally liked. Students still found it awkward to use.</p><div class="big-quote">Replace <span class="mark">guesswork</span> with <span class="mark">evidence</span>.</div></div></div>'+
    '<hr class="rule">'+
    '<h3>Before you start</h3>'+
    '<div class="field-grid">'+
      '<div class="field"><label for="learnerName">Your name</label><input id="learnerName" autocomplete="name" maxlength="80"></div>'+
      '<div class="field"><label for="learnerClass">Class / group</label><input id="learnerClass" maxlength="80" placeholder="e.g. T-Level DSS Y1"></div>'+
    '</div>'+
    '<div id="feedback" class="feedback" aria-live="polite"></div>'
  );
  const a=actions();
  a.append(button('Open the user files →',function(){
    const name=document.getElementById('learnerName').value.trim();
    const group=document.getElementById('learnerClass').value.trim();
    const fb=document.getElementById('feedback');
    if(name.length<2||group.length<2){
      fb.className='feedback bad';fb.innerHTML='<strong>Add your name and class/group first.</strong> These will appear on your final evidence sheet.';return
    }
    learnerName=name;learnerClass=group;step=2;stage2()
  },false));
  mainScreen.append(a)
}

function stage2(){
  tip.textContent='Personas are fictional, but good personas should be based on real research patterns.';
  const expl=lesson(
    'What is a user persona?',
    '<strong>A user persona is a fictional but believable representative user.</strong> In real UX work, it should be based on patterns found through research such as interviews, observations, surveys, support data or analytics — not simply invented from stereotypes.',
    'A persona gives a design team a concrete user to reason about. It turns vague phrases like “users might want…” into questions about a defined context, goal or barrier.',
    'Goals, frustrations, behaviours, devices, environment, technical confidence and accessibility needs.',
    'Treating a persona as a demographic profile. “Sam, 18, student” tells you almost nothing about how Sam will use the product.',
    '<p><strong>Weak:</strong> “Sam, 18, student.”</p><p><strong>Stronger:</strong> “Sam studies on a phone during a 25-minute bus journey and often loses signal. Sam wants short activities that can continue reliably.”</p>'
  );
  render(
    '<div class="kicker">User files / 02</div>'+
    '<h2>Understand the person before choosing features.</h2>'+
    '<p class="lead">Read the context, goals and frustrations. Those details are the evidence you will use later.</p>'+
    expl+
    '<h3>Choose one persona</h3><p>Your score does not depend on which persona you choose.</p>'+
    '<div class="grid" id="personaGrid"></div>'
  );
  const g=document.getElementById('personaGrid');
  personas.forEach(function(p){
    const b=document.createElement('button');b.type='button';b.className='choice persona';
    b.innerHTML='<div class="avatar" aria-hidden="true">'+p.avatar+'</div><div class="meta">'+esc(p.device)+'</div><h3>'+esc(p.name)+', '+p.age+'</h3>'+
      '<span class="sticker">'+esc(p.role)+'</span><p>'+esc(p.context)+'</p>'+
      '<p class="small"><strong>Goals:</strong> '+p.goals.map(esc).join(' · ')+'</p>'+
      '<p class="small"><strong>Frustrations:</strong> '+p.frustrations.map(esc).join(' · ')+'</p>'+
      '<p class="small"><strong>Accessibility / usability:</strong> '+esc(p.access)+'</p>';
    b.addEventListener('click',function(){persona=p;addScore(10);step=3;stage3()});g.append(b)
  })
}

function stage3(){
  selectedNeeds=[];evidenceScored=false;
  tip.textContent='A requirement is defensible when you can trace it to evidence about the selected persona.';
  const expl=lesson(
    'From persona evidence to a requirement',
    '<strong>A user need is a goal to support, a problem to solve or a barrier to remove.</strong> A requirement describes something the product should provide because of that need.',
    'This stops teams jumping straight from an idea to a feature. It makes the reason for a design decision visible.',
    'Find a clue in the persona, identify what that clue means for the user, then ask what the product needs to provide.',
    'Picking something because it sounds impressive. “It would be cool” is not evidence.',
    '<p><strong>Evidence:</strong> “Maya mainly studies on her phone.”</p><p><strong>Need:</strong> Study comfortably on a small screen.</p><p><strong>Requirement:</strong> The interface must work well on mobile.</p>'
  );
  render(
    '<div class="kicker">Evidence board / 03</div>'+
    '<h2>Which requirements can you actually defend?</h2>'+expl+
    '<div class="callout"><strong>Your persona: '+esc(persona.name)+'</strong><br>'+esc(persona.context)+'</div>'+
    '<h3>Choose exactly three</h3><p>Three cards are supported by this persona. The others belong to a different user or have no research justification.</p>'+
    '<div class="grid" id="needsGrid"></div><div id="feedback" class="feedback" aria-live="polite"></div>'
  );
  const correct=supportedNeeds(persona);
  const distractors=shuffle(needs.filter(function(n){return !n.support[persona.id]})).slice(0,3);
  const cards=shuffle(correct.concat(distractors));
  const g=document.getElementById('needsGrid');

  cards.forEach(function(n){
    const b=document.createElement('button');b.type='button';b.className='choice';b.setAttribute('aria-pressed','false');
    b.innerHTML='<strong>'+esc(n.title)+'</strong>';
    b.addEventListener('click',function(){
      const selected=b.getAttribute('aria-pressed')==='true';
      b.setAttribute('aria-pressed',String(!selected));b.classList.toggle('selected',!selected);
      if(!selected)selectedNeeds.push(n);else selectedNeeds=selectedNeeds.filter(function(x){return x.id!==n.id})
    });
    g.append(b)
  });

  const a=actions();
  a.append(button('Check the evidence',function(){
    const fb=document.getElementById('feedback');
    if(selectedNeeds.length!==3){fb.className='feedback bad';fb.innerHTML='<strong>Choose exactly three cards.</strong> You need to make a decision before checking it.';return}
    const hits=selectedNeeds.filter(function(n){return !!n.support[persona.id]}).length;
    if(!evidenceScored){addScore(hits*10);evidenceScored=true}
    const lines=selectedNeeds.map(function(n){
      if(n.support[persona.id])return '<strong>'+esc(n.title)+'</strong><br>✓ Evidence link: '+esc(n.support[persona.id]);
      const fits=fitNames(n);
      if(fits.length)return '<strong>'+esc(n.title)+'</strong><br>✗ This is supported by evidence for <strong>'+esc(fits.join(' and '))+'</strong>, not '+esc(persona.name.split(' ')[0])+'.';
      return '<strong>'+esc(n.title)+'</strong><br>✗ '+esc(n.noFit)
    });
    fb.className='feedback '+(hits===3?'good':'bad');
    fb.innerHTML='<strong>'+hits+'/3 choices are supported by '+esc(persona.name)+'.</strong><br><br>'+lines.join('<br><br>');
    if(hits===3){
      a.innerHTML='';
      a.append(button('Use these needs to build stories →',function(){step=4;stage4()},false))
    }else{
      fb.innerHTML+='<br><br><span class="teacher-mark">Revise your choices. You can continue only when all three are supported.</span>'
    }
  },false));
  mainScreen.append(a)
}

function stage4(){
  builtStories=[];guidedScored=false;
  tip.textContent='A user story keeps the need and the reason visible without deciding the solution too early.';
  const rows=selectedNeeds.map(function(n){return {need:n,story:n.story[persona.id]}});

  const expl=lesson(
    'What is a user story?',
    '<strong>A user story is a short description of something a user needs to do and why it matters.</strong> A common structure is: “As a [user], I want [goal], so that [benefit].”',
    'It keeps the team focused on the outcome before choosing a technical or visual solution.',
    'Three parts: a meaningful user, a focused goal and a benefit that explains the value.',
    'Writing the implementation instead of the need — for example “I want a blue button” or “I want SQL”.',
    '<div class="anatomy"><div><strong>As a…</strong>part-time learner</div><div><strong>I want…</strong>to resume saved progress</div><div><strong>So that…</strong>I can continue after work</div></div>'
  );

  render(
    '<div class="kicker">Guided story workshop / 04</div><h2>Connect the needs you selected to user stories.</h2>'+expl+
    '<div class="callout"><strong>The chain is now live:</strong> the three requirements below are the same three you justified in the previous stage.</div>'+
    '<h3>Match each requirement to its best goal and benefit</h3><p>Each goal and each benefit can be used only once.</p>'+
    '<div id="storyForms"></div><div id="feedback" class="feedback" aria-live="polite"></div>'
  );

  const goalOptions=shuffle(rows.map(function(r){return {id:r.need.id,text:r.story.goal}}));
  const benefitOptions=shuffle(rows.map(function(r){return {id:r.need.id,text:r.story.benefit}}));
  const wrap=document.getElementById('storyForms');

  rows.forEach(function(r,i){
    const d=document.createElement('div');d.className='story-form';
    const goalId='goal-'+i,benefitId='benefit-'+i;
    d.innerHTML='<div class="meta">Requirement '+(i+1)+'</div><p><strong>'+esc(r.need.title)+'</strong></p>'+
      '<p class="small">Evidence: '+esc(r.need.support[persona.id])+'</p>'+
      '<label for="'+goalId+'">I want…</label><select id="'+goalId+'" data-kind="goal" data-row="'+i+'"><option value="">Choose the best goal…</option>'+
      goalOptions.map(function(o){return '<option value="'+esc(o.id)+'">'+esc(o.text)+'</option>'}).join('')+'</select>'+
      '<label for="'+benefitId+'" style="margin-top:12px">So that…</label><select id="'+benefitId+'" data-kind="benefit" data-row="'+i+'"><option value="">Choose the strongest benefit…</option>'+
      benefitOptions.map(function(o){return '<option value="'+esc(o.id)+'">'+esc(o.text)+'</option>'}).join('')+'</select>'+
      '<div class="story-preview" id="preview-'+i+'">Your story will appear here.</div>';
    wrap.append(d)
  });

  function refresh(){
    ['goal','benefit'].forEach(function(kind){
      const selects=[].slice.call(document.querySelectorAll('select[data-kind="'+kind+'"]'));
      const chosen=selects.map(function(s){return s.value}).filter(Boolean);
      selects.forEach(function(s){
        [].slice.call(s.options).forEach(function(o){
          o.disabled=!!o.value && o.value!==s.value && chosen.indexOf(o.value)!==-1
        })
      })
    });
    rows.forEach(function(r,i){
      const g=document.getElementById('goal-'+i),b=document.getElementById('benefit-'+i),p=document.getElementById('preview-'+i);
      if(!g.value||!b.value){p.textContent='Your story will appear here.';return}
      const goal=rows.find(function(x){return x.need.id===g.value}).story.goal;
      const benefit=rows.find(function(x){return x.need.id===b.value}).story.benefit;
      p.textContent='As a '+persona.role.toLowerCase()+', I want to '+goal+', so that '+benefit+'.'
    })
  }
  [].slice.call(wrap.querySelectorAll('select')).forEach(function(s){s.addEventListener('change',refresh)});

  const a=actions();
  a.append(button('Review the matches',function(){
    const answers=rows.map(function(r,i){return {need:r,goal:document.getElementById('goal-'+i).value,benefit:document.getElementById('benefit-'+i).value}});
    const fb=document.getElementById('feedback');
    if(answers.some(function(x){return !x.goal||!x.benefit})){fb.className='feedback bad';fb.innerHTML='<strong>Complete all three stories first.</strong>';return}
    const uniqueGoals=new Set(answers.map(function(x){return x.goal})).size===3;
    const uniqueBenefits=new Set(answers.map(function(x){return x.benefit})).size===3;
    if(!uniqueGoals||!uniqueBenefits){fb.className='feedback bad';fb.innerHTML='<strong>Do not reuse the same goal or benefit.</strong> Each selected need should lead to a different story.';return}
    const hits=answers.filter(function(x){return x.goal===x.need.need.id&&x.benefit===x.need.need.id}).length;
    if(!guidedScored){addScore(hits*10);guidedScored=true}
    fb.className='feedback '+(hits===3?'good':'bad');
    fb.innerHTML='<strong>'+hits+'/3 stories keep the evidence, goal and benefit correctly connected.</strong><br><br>'+
      answers.map(function(x){
        const correct=x.goal===x.need.need.id&&x.benefit===x.need.need.id;
        return '<strong>'+esc(x.need.need.title)+'</strong><br>'+(correct?'✓ The goal and benefit both follow from this requirement.':'✗ One or both parts belong to a different requirement. Follow the evidence chain rather than just making a sentence that sounds plausible.')
      }).join('<br><br>');
    if(hits===3){
      builtStories=rows.map(function(r){return {
        needId:r.need.id,
        text:'As a '+persona.role.toLowerCase()+', I want to '+r.story.goal+', so that '+r.story.benefit+'.',
        goal:r.story.goal,benefit:r.story.benefit
      }});
      a.innerHTML='';a.append(button('Apply it to new evidence →',function(){step=5;stage5()},false))
    }
  },false));
  mainScreen.append(a)
}

function stage5(){
  tip.textContent='This is the transfer task: new evidence, a new need, and a user story you have not seen before.';
  freeStory=null;
  independentChallenge=shuffle(transferChallenges[persona.id])[0];

  render(
    '<div class="kicker">Independent transfer task / 05</div>'+
    '<h2>New evidence has arrived. What does it mean for the design?</h2>'+
    '<p class="lead">This research note was <strong>not used in the earlier matching activity</strong>. Work out the user need yourself, then turn it into an original user story.</p>'+
    '<section class="lesson"><div class="lesson-head"><span class="lesson-no">5</span><strong>Do the full chain yourself</strong></div><div class="lesson-body">'+
      '<div class="why-chain">'+
        '<div class="chain-box">NEW EVIDENCE<br><span class="small">What happened?</span></div><div class="chain-arrow">→</div>'+
        '<div class="chain-box">NEED<br><span class="small">What problem should be solved?</span></div><div class="chain-arrow">→</div>'+
        '<div class="chain-box">USER STORY<br><span class="small">Who needs what, and why?</span></div><div class="chain-arrow">→</div>'+
        '<div class="chain-box">POSSIBLE FEATURE<br><span class="small">Decided later</span></div>'+
      '</div>'+
      '<div class="example"><div class="label">Important</div><p>Do not jump straight to a specific button, colour or technology. First describe the <strong>outcome the user needs</strong>. Different designs could potentially satisfy the same story.</p></div>'+
    '</div></section>'+
    '<h3>New research note: '+esc(persona.name)+'</h3>'+
    '<div class="summary-card" style="background:#edf4f4"><span class="meta">Follow-up research</span><p><strong>'+esc(independentChallenge.evidence)+'</strong></p></div>'+
    '<h3 style="margin-top:24px">1. Infer the user need</h3>'+
    '<div class="story-form"><label for="inferredNeed">What problem, goal or barrier does this evidence reveal?</label>'+
      '<textarea id="inferredNeed" rows="3" maxlength="260" placeholder="In my own words, the user needs…"></textarea>'+
      '<p class="small">Do not write the user story yet. State the underlying need first.</p></div>'+
    '<h3 style="margin-top:24px">2. Turn that need into a user story</h3>'+
    '<div class="story-form">'+
      '<div class="field"><label for="freeUser">As a…</label><input id="freeUser" maxlength="100" value="'+esc(persona.role.toLowerCase())+'"></div>'+
      '<div class="field"><label for="freeGoal">I want…</label><textarea id="freeGoal" rows="2" maxlength="220" placeholder="Describe what the user needs to be able to do"></textarea></div>'+
      '<div class="field"><label for="freeBenefit">So that…</label><textarea id="freeBenefit" rows="2" maxlength="220" placeholder="Explain why this outcome matters to the user"></textarea></div>'+
      '<div class="story-preview" id="freePreview">Your complete story will appear here.</div>'+
    '</div>'+
    '<div id="feedback" class="feedback" aria-live="polite"></div>'
  );

  function preview(){
    const u=document.getElementById('freeUser').value.trim();
    const g=document.getElementById('freeGoal').value.trim();
    const b=document.getElementById('freeBenefit').value.trim();
    document.getElementById('freePreview').textContent=(u&&g&&b)?'As a '+u+', I want '+g+', so that '+b+'.':'Your complete story will appear here.'
  }
  ['freeUser','freeGoal','freeBenefit'].forEach(function(id){document.getElementById(id).addEventListener('input',preview)});

  const a=actions();
  a.append(button('Check my independent story',function(){
    const inferred=document.getElementById('inferredNeed').value.trim();
    const u=document.getElementById('freeUser').value.trim();
    const g=document.getElementById('freeGoal').value.trim();
    const b=document.getElementById('freeBenefit').value.trim();
    const fb=document.getElementById('feedback');

    if(inferred.length<18){
      fb.className='feedback bad';
      fb.innerHTML='<strong>Explain the need first.</strong> Use a short sentence that identifies the problem, goal or barrier in the new research note.';
      return
    }
    if(u.length<4||g.length<12||b.length<12){
      fb.className='feedback bad';
      fb.innerHTML='<strong>Your user story needs all three meaningful parts.</strong> Give a user, a focused goal and a reason that adds value.';
      return
    }

    const combined=(inferred+' '+g+' '+b).toLowerCase();
    const conceptHits=independentChallenge.concepts.filter(function(word){return combined.indexOf(word)!==-1});
    const allWords=(inferred+' '+g+' '+b).toLowerCase().match(/[a-z]+/g)||[];
    const unique=new Set(allWords);

    if(allWords.length<16||unique.size<11){
      fb.className='feedback bad';
      fb.innerHTML='<strong>Add more meaning.</strong> Repeated or filler text does not demonstrate that you have interpreted the new evidence.';
      return
    }
    if(new Set(conceptHits).size<2){
      fb.className='feedback bad';
      fb.innerHTML='<strong>Make the link to the new research clearer.</strong> Your wording is original, but the need and story should clearly respond to the problem described in the research note.';
      return
    }

    freeStory={
      challengeId:independentChallenge.id,
      evidence:independentChallenge.evidence,
      inferredNeed:inferred,
      user:u,
      goal:g,
      benefit:b,
      text:'As a '+u+', I want '+g+', so that '+b+'.'
    };
    addScore(20);
    fb.className='feedback good';
    fb.innerHTML=
      '<strong>Independent evidence chain found.</strong><br><br>'+
      '<strong>Your inferred need:</strong> '+esc(inferred)+'<br><br>'+
      '<strong>Your story:</strong> '+esc(freeStory.text)+'<br><br>'+
      '<strong>Compare with one possible model answer:</strong> '+esc(independentChallenge.model)+
      '<br><br><span class="small">Your wording does not need to match the model. The important question is whether it responds to the evidence and explains genuine user value.</span>';
    a.innerHTML='';
    a.append(button('Critique other stories →',function(){step=6;stage6()},false))
  },false));
  mainScreen.append(a)
}

function stage6(){
  tip.textContent='Strong stories have a meaningful user, a focused goal and a reason that adds real value.';
  let qi=0,correctCount=0;
  const questions=shuffle(critiqueBank);

  function ask(){
    const q=questions[qi];
    render(
      '<div class="kicker">Red-pen review / 06</div><h2>Would you keep this user story?</h2>'+
      '<section class="lesson"><div class="lesson-head"><span class="lesson-no">6</span><strong>Use four checks</strong></div><div class="lesson-body">'+
      '<ol class="checklist">'+
        '<li><strong>User:</strong> Is the user meaningful rather than just “someone”?</li>'+
        '<li><strong>Goal:</strong> Is there one focused thing they need to achieve?</li>'+
        '<li><strong>Value:</strong> Does “so that…” add a real reason rather than repeat the goal?</li>'+
        '<li><strong>Scope:</strong> Is it small enough to discuss, build and test rather than being an entire project?</li>'+
      '</ol></div></section>'+
      '<div class="meta">Story '+(qi+1)+' of '+questions.length+'</div>'+
      '<div class="summary-card"><p style="font-size:1.18rem"><strong>'+esc(q.story)+'</strong></p></div>'+
      '<p><strong>Decision:</strong> is this useful enough to keep in the backlog?</p>'+
      '<div id="feedback" class="feedback" aria-live="polite"></div>'
    );
    const a=actions();
    function answer(v){
      const hit=v===q.good;if(hit){correctCount++;addScore(10)}
      const fb=document.getElementById('feedback');fb.className='feedback '+(hit?'good':'bad');
      fb.innerHTML='<strong>'+(hit?'✓ Good judgement.':'✗ Reconsider it.')+'</strong><br><br>'+esc(q.why)+'<br><br><strong>Better thinking:</strong> '+esc(q.fix);
      a.innerHTML='';a.append(button(qi<questions.length-1?'Next critique →':'Prioritise your backlog →',function(){qi++;if(qi<questions.length)ask();else{step=7;stage7(correctCount)}},false))
    }
    a.append(button('Keep it',function(){answer(true)},false));
    a.append(button('Send it back',function(){answer(false)},true));
    mainScreen.append(a)
  }
  ask()
}

function stage7(critiqueScore){
  tip.textContent='Prioritisation is a ranked decision backed by evidence, not “everything is important”.';
  priorityOrder=[];priorityReason='';

  const expl=lesson(
    'What does prioritising mean?',
    '<strong>Prioritising means deciding what should be worked on first, second and later.</strong> Time and resources are limited, so a team has to make trade-offs.',
    'A ranking forces you to compare needs rather than calling every story “important”.',
    'Consider impact, frequency, barriers and whether the user can complete a core task without it.',
    'Prioritising your favourite idea instead of the need with the strongest user impact.',
    '<p>If a keyboard user cannot reach the submit control at all, keyboard access may outrank a cosmetic improvement because the barrier prevents task completion.</p>'
  );

  render(
    '<div class="kicker">Backlog / 07</div><h2>Rank the whole backlog, then defend number one.</h2>'+expl+
    '<h3>1. Give every story a unique rank</h3><p><strong>1 = build first</strong>, 2 = next, 3 = later.</p>'+
    '<div id="ranking"></div>'+
    '<h3 style="margin-top:26px">2. Justify your number-one priority</h3>'+
    '<div class="story-form"><label for="reason">Why should this come first for '+esc(persona.name)+'?</label>'+
      '<textarea id="reason" rows="5" maxlength="420" placeholder="I ranked this first because the persona evidence shows that…"></textarea>'+
      '<p class="small">Refer to the persona\'s context, goal, frustration, accessibility need or the evidence linked to the story.</p>'+
    '</div>'+
    '<div id="feedback" class="feedback" aria-live="polite"></div>'
  );

  const ranking=document.getElementById('ranking');
  builtStories.forEach(function(s,i){
    const id='rank-'+i;
    const row=document.createElement('div');row.className='rank-row';
    row.innerHTML='<p><span class="meta">Story '+(i+1)+'</span><br><strong>'+esc(s.text)+'</strong></p>'+
      '<div><label class="meta" for="'+id+'">Rank</label><select id="'+id+'"><option value="">—</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>';
    ranking.append(row)
  });

  const a=actions();
  a.append(button('Submit my prioritisation',function(){
    const ranks=builtStories.map(function(s,i){return Number(document.getElementById('rank-'+i).value)});
    const reason=document.getElementById('reason').value.trim();
    const fb=document.getElementById('feedback');
    if(ranks.some(function(r){return !r})){fb.className='feedback bad';fb.innerHTML='<strong>Rank all three stories.</strong>';return}
    if(new Set(ranks).size!==3){fb.className='feedback bad';fb.innerHTML='<strong>Use each rank once.</strong> Prioritisation means making a clear order.';return}
    const topIndex=ranks.indexOf(1);
    const topStory=builtStories[topIndex];
    const topNeed=needs.find(function(n){return n.id===topStory.needId});
    const words=(reason.toLowerCase().match(/[a-z]+/g)||[]);
    const unique=new Set(words);
    const evidenceSource=persona.context+' '+persona.goals.join(' ')+' '+persona.frustrations.join(' ')+' '+persona.access+' '+topNeed.support[persona.id]+' '+topStory.text;
    const evidenceWords=new Set(significantTokens(evidenceSource));
    const overlap=significantTokens(reason).filter(function(w){return evidenceWords.has(w)});
    const reasoningWords=['because','therefore','means','without','barrier','important','priority','first','impact','prevents','allows','needs','need'];
    const hasReasoning=reasoningWords.some(function(w){return words.indexOf(w)!==-1});

    if(words.length<12||unique.size<8){fb.className='feedback bad';fb.innerHTML='<strong>Your justification needs more substance.</strong> Write one or two meaningful sentences rather than filler or repeated text.';return}
    if(overlap.length<1){fb.className='feedback bad';fb.innerHTML='<strong>Link your reasoning to the persona.</strong> Mention something from the user evidence, not just “this is most important”.';return}
    if(!hasReasoning){fb.className='feedback bad';fb.innerHTML='<strong>Explain the reason for the ranking.</strong> Use causal language such as “because”, “without this…” or explain the impact on the user.';return}

    priorityOrder=ranks.map(function(rank,i){return {rank:rank,index:i}}).sort(function(a,b){return a.rank-b.rank}).map(function(x){return x.index});
    priorityReason=reason;addScore(20);
    const model='Model reasoning: I would rank this highly because '+topNeed.support[persona.id]+' Without addressing that evidence, the user may struggle to achieve the goal described in the story.';
    fb.className='feedback good';
    fb.innerHTML='<strong>Prioritisation recorded.</strong><br><br><strong>Your reasoning:</strong> '+esc(reason)+'<br><br><strong>Compare with a model:</strong> '+esc(model)+'<br><br><span class="small">There is not always one correct ranking. What matters is whether the order is justified with user evidence.</span>';
    a.innerHTML='';a.append(button('Open my completed evidence sheet →',function(){showResults(critiqueScore)},false))
  },false));
  mainScreen.append(a)
}

function showResults(critiqueScore){
  step=8;
  const completedAt=new Date().toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
  const max=180,pct=Math.round(score/max*100);
  tip.textContent='The strongest design decisions can be traced backwards to research and user evidence.';

  const needSummary=selectedNeeds.map(function(n){return '<span class="evidence-chip">'+esc(n.title)+'</span>'}).join(' ');
  const ranked=priorityOrder.map(function(i,pos){return '<div class="summary-card"><span class="meta">Rank '+(pos+1)+'</span><p>'+esc(builtStories[i].text)+'</p></div>'}).join('');

  render(
    '<div class="kicker">Completed UX evidence sheet</div><div class="rating">'+pct+'%</div>'+
    '<h2>'+esc(learnerName)+' — Persona Lab complete</h2>'+
    '<p class="lead">The score records the automatic checks. The written user story and justification are the stronger pieces of assessment evidence.</p>'+
    '<div class="field-grid"><div class="summary-card"><span class="meta">Learner</span><p><strong>'+esc(learnerName)+'</strong><br>'+esc(learnerClass)+'</p></div>'+
      '<div class="summary-card"><span class="meta">Completed</span><p><strong>'+esc(completedAt)+'</strong></p></div></div>'+
    '<hr class="rule">'+
    '<div class="casefile"><div class="case-no">1</div><div><h3>Persona</h3><p><strong>'+esc(persona.name)+'</strong> — '+esc(persona.role)+'</p><p>'+esc(persona.context)+'</p><p><strong>Goals:</strong> '+persona.goals.map(esc).join(' · ')+'</p><p><strong>Frustrations:</strong> '+persona.frustrations.map(esc).join(' · ')+'</p></div></div>'+
    '<h3 style="margin-top:28px">Evidence-backed requirements</h3><p>'+needSummary+'</p>'+
    '<h3 style="margin-top:28px">Guided stories</h3>'+builtStories.map(function(s){return '<div class="summary-card"><p>'+esc(s.text)+'</p></div>'}).join('')+
    '<h3 style="margin-top:28px">Independent transfer task</h3>'+    '<div class="summary-card" style="background:#edf4f4"><span class="meta">New research evidence</span><p>'+esc(freeStory.evidence)+'</p></div>'+    '<div class="summary-card"><span class="meta">Need inferred by learner</span><p>'+esc(freeStory.inferredNeed)+'</p></div>'+    '<div class="summary-card" style="background:#e7eee2"><span class="meta">User story written by learner</span><p>'+esc(freeStory.text)+'</p></div>'+
    '<h3 style="margin-top:28px">Ranked backlog</h3>'+ranked+
    '<div class="summary-card" style="background:#f1dc63"><span class="meta">Priority justification</span><p>'+esc(priorityReason)+'</p></div>'+
    '<section class="lesson"><div class="lesson-head"><span class="lesson-no">✓</span><strong>What this work demonstrates</strong></div><div class="lesson-body"><ul class="checklist">'+
      '<li>A persona should be based on research patterns, not stereotypes.</li>'+
      '<li>Requirements should be traceable to evidence about user goals, context, barriers or frustrations.</li>'+
      '<li>A user story connects a meaningful user to a focused goal and a reason.</li>'+
      '<li>A user need is different from a visual or technical implementation choice.</li>'+
      '<li>Prioritisation requires ranking and justification, not simply calling everything important.</li>'+
      '<li>Critique score: <strong>'+critiqueScore+'/'+critiqueBank.length+'</strong>.</li>'+
    '</ul></div></section>'+
    '<p class="print-note">For assessment: use this sheet together with the learner-written story and priority justification. Automated score alone should not be treated as the final grade.</p>'
  );

  const a=actions();
  a.append(button('Start again',function(){
    step=1;score=0;persona=null;selectedNeeds=[];builtStories=[];freeStory=null;independentChallenge=null;priorityOrder=[];priorityReason='';learnerName='';learnerClass='';stage1()
  },true));
  a.append(button('Print / save evidence',function(){window.print()},false));
  mainScreen.append(a);update()
}

stage1();
