
const sb=window.supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);

const PD_CRITERIA=[
{title:"Функциональная грамотность",focus:"Фокус наблюдения: связь заданий с реальными жизненными ситуациями, практическим применением знаний и переносом изученного в жизненный контекст."},
{title:"Уровневая дифференциация",focus:"Фокус наблюдения: адаптация сложности, темпа и степени поддержки (карточки-помощники, разные алгоритмы) под индивидуальные возможности и уровень подготовки учеников."},
{title:"Адресное вовлечение (управление вниманием)",focus:"Фокус наблюдения: способы управления вниманием класса, адресное включение учеников в работу, распределение вопросов и ролей, предотвращение пассивного участия."},
{title:"Критическое мышление",focus:"Фокус наблюдения: задания и вопросы, побуждающие сравнивать, анализировать, обосновывать, делать выводы, оценивать информацию и аргументировать позицию."},
{title:"Таксономия Блума",focus:"Фокус наблюдения: поэтапное усложнение мыслительных задач, от воспроизведения фактов и понимания к анализу, синтезу и критической оценке материала."},
{title:"ТРИЗ и креативное мышление",focus:"Фокус наблюдения: инструменты поиска нестандартных решений, генерации идей и творческого мышления."},
{title:"Логическое мышление",focus:"Фокус наблюдения: задания на последовательное рассуждение, выявление закономерностей, причинно-следственных связей, проверку гипотез и аргументацию."},
{title:"Рефлексия (осознанность обучения)",focus:"Фокус наблюдения: осмысление учениками целей, критериев успеха, собственного прогресса, затруднений и дальнейших зон роста."},
{title:"Интеграция ценностей воспитания",focus:"Фокус наблюдения: связь содержания и организации урока с воспитательными ценностями, уважительным взаимодействием и безопасной образовательной средой."}
];

const PD_RUBRIC=[
{min:9,max:10,score:"9–10",level:"Эталонный",teacher:"Выступает модератором. Приём встроен в урок органично. Гибко реагирует на незапланированные ситуации.",students:"Проявляют субъектность. Работают самостоятельно: формулируют цели, ищут решения, оценивают друг друга. 100% вовлечённость."},
{min:7,max:8,score:"7–8",level:"Достаточный",teacher:"Уверенно применяет методику. Ведёт учеников за собой. Возможны небольшие нехватки времени или охвата класса.",students:"Активно участвуют и выполняют задания, но идут за инструкцией учителя. Вовлечено большинство класса."},
{min:4,max:6,score:"4–6",level:"Базовый / формальный",teacher:"Приём используется формально. Основная инициатива и трансляция знаний исходят от учителя.",students:"Пассивны, отвечают односложно, выполняют алгоритм без достаточного осмысления."},
{min:1,max:3,score:"1–3",level:"С ошибками",teacher:"Пытается применить приём, но допускает методические ошибки: нечёткая инструкция, сбой тайминга или организации.",students:"Запутаны инструкцией, отвлекаются; приём вызывает ступор или потерю рабочего ритма."},
{min:0,max:0,score:"0",level:"Отсутствует",teacher:"Критерий должен был проявляться в этом уроке, но фактически отсутствует.",students:"Ждут готовых ответов или не получают необходимой поддержки при затруднениях."}
];

const LS_SECTIONS=[
{
 title:"II. Анализ планирования и организации урока",
 options:["Соответствует","Частично соответствует","Не соответствует"],
 items:[
 "Цель урока соответствует теме и содержанию учебного материала",
 "Цель урока сформулирована конкретно и ориентирована на результаты обучения",
 "Учебные задания направлены на достижение цели урока",
 "Содержание урока соответствует возрастным особенностям учащихся",
 "Структура урока логична и последовательна",
 "Рационально распределено время между этапами урока",
 "Используемые методы и приёмы соответствуют поставленным задачам"
 ]
},
{
 title:"III. Анализ методической организации урока",
 options:["Соответствует","Частично соответствует","Не соответствует"],
 items:[
 "Используются активные методы обучения",
 "Организована познавательная деятельность учащихся",
 "Созданы условия для самостоятельной работы",
 "Предусмотрены задания различного уровня сложности",
 "Используются эффективные формы индивидуальной, парной и групповой работы",
 "Применяются вопросы, стимулирующие мышление и рассуждение",
 "Используются наглядные материалы и образовательные ресурсы",
 "Обеспечена логическая связь между этапами урока"
 ]
},
{
 title:"IV. Анализ оценивания и обратной связи",
 options:["Соответствует","Частично соответствует","Не соответствует"],
 items:[
 "Критерии успеха соответствуют цели урока",
 "Учащимся понятны критерии выполнения заданий",
 "Используются приёмы формативного оценивания",
 "Обратная связь способствует дальнейшему обучению",
 "Предусмотрены возможности для самооценивания и рефлексии",
 "Результаты оценивания используются для корректировки учебного процесса"
 ]
},
{
 title:"V. Анализ соответствия урока исследовательскому вопросу Lesson Study",
 options:["Да","Частично","Нет"],
 items:[
 "Содержание урока соответствует исследовательскому вопросу",
 "Используемые педагогические приёмы направлены на изучение исследуемой проблемы",
 "Предусмотрены возможности для сбора данных наблюдения",
 "Организация урока позволяет выявить влияние педагогических приёмов на обучение",
 "Полученные результаты могут быть использованы для дальнейшего совершенствования урока"
 ]
}
];

const LS_GENERAL=[
"Сильные стороны урока",
"Методические решения, способствовавшие достижению цели урока",
"Выявленные трудности и недостатки в организации урока",
"Насколько эффективно были реализованы запланированные педагогические приёмы?",
"Какие аспекты урока требуют дальнейшего совершенствования?"
];

const LS_FINAL=[
"Общий вывод о качестве организации и проведения урока",
"Соответствие урока цели Lesson Study",
"Рекомендации по совершенствованию урока",
"Предложения для следующего цикла Lesson Study"
];

let step=1,campus="",kind="",directory=[],selectedTeacher=null;
let pdScores=Array(9).fill(null),pdNotes=Array(9).fill(""),pdNa=Array(9).fill(false);
let lsMeta={topic:"",lesson_goal:"",research_question:""};
let lsAnswers=[];
let lsGeneral=Array(LS_GENERAL.length).fill("");
let lsFinal=Array(LS_FINAL.length).fill("");
const $=x=>document.getElementById(x);

function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function escAttr(s){return escapeHtml(s)}

async function loadDirectory(){
  const {data,error}=await sb.from("teacher_directory")
    .select("last_name,first_name,middle_name,full_name,subject")
    .eq("active",true)
    .order("subject")
    .order("last_name");
  if(error){$("directoryNotice").textContent="Не удалось загрузить список педагогов: "+error.message;return}
  directory=data||[];
  const subjects=[...new Set(directory.map(x=>x.subject))].sort((a,b)=>a.localeCompare(b,"ru"));
  $("subjectSelect").innerHTML='<option value="">Выберите предмет</option>'+subjects.map(s=>`<option value="${escAttr(s)}">${escapeHtml(s)}</option>`).join("");
}

function go(n){
  for(let i=1;i<=9;i++)$("step"+i).classList.toggle("hidden",i!==n);
  step=n;
  $("stepper").innerHTML=Array.from({length:8},(_,i)=>`<span class="${i<Math.min(n,9)?"on":""}"></span>`).join("");
  if(n===8)renderSelectedForm();
  window.scrollTo({top:0,behavior:"smooth"});
}

$("oLast").oninput=$("oFirst").oninput=()=>{$("next1").disabled=!($("oLast").value.trim()&&$("oFirst").value.trim())};
document.querySelectorAll("[data-campus]").forEach(x=>x.onclick=()=>{
  document.querySelectorAll("[data-campus]").forEach(y=>y.classList.remove("selected"));
  x.classList.add("selected");campus=x.dataset.campus;$("next2").disabled=false;
});
$("roomInput").oninput=e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,3);$("next3").disabled=!e.target.value};

$("subjectSelect").onchange=()=>{
  const subject=$("subjectSelect").value;
  selectedTeacher=null;$("next4").disabled=!subject;$("next5").disabled=true;
  const teachers=directory.filter(x=>x.subject===subject);
  $("teacherSelect").innerHTML='<option value="">Выберите педагога</option>'+teachers.map((t,i)=>`<option value="${i}">${escapeHtml(t.full_name)}</option>`).join("");
};
$("teacherSelect").onchange=()=>{
  const teachers=directory.filter(x=>x.subject===$("subjectSelect").value);
  selectedTeacher=$("teacherSelect").value===""?null:teachers[Number($("teacherSelect").value)];
  $("next5").disabled=!selectedTeacher;
};

function validateClass(){$("next6").disabled=!($("classGrade").value!==""&&$("classLetter").value.trim())}
$("classGrade").onchange=validateClass;
$("classLetter").oninput=e=>{
  e.target.value=e.target.value.replace(/[^A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/g,"").slice(0,1).toUpperCase();
  validateClass();
};

document.querySelectorAll(".kind").forEach(x=>x.onclick=()=>{
  document.querySelectorAll(".kind").forEach(y=>y.classList.remove("selected"));
  x.classList.add("selected");kind=x.dataset.kind;$("next7").disabled=false;
});
document.querySelectorAll(".back").forEach(x=>x.onclick=()=>go(+x.dataset.go));
$("next1").onclick=()=>go(2);$("next2").onclick=()=>go(3);$("next3").onclick=()=>go(4);$("next4").onclick=()=>go(5);
$("next5").onclick=()=>go(6);$("next6").onclick=()=>go(7);$("next7").onclick=()=>go(8);

function renderSelectedForm(){
  $("submitNotice").innerHTML="";
  if(kind==="Lesson Study") renderLessonStudy();
  else renderPedDesign();
}

function renderPedDesign(){
  $("formTitle").textContent="Критериальная карта";
  $("formSubtitle").textContent="Оцените каждый применимый критерий от 0 до 10. Комментарий к выставленной оценке обязателен.";
  $("formIntro").innerHTML="";
  $("formOutro").innerHTML="";
  $("totalSummary").classList.remove("hidden");
  $("generalWrap").classList.remove("hidden");
  drawPedCriteria();
}

function drawPedCriteria(){
  const box=$("criteria");box.innerHTML="";
  PD_CRITERIA.forEach((c,i)=>{
    const needsComment=!pdNa[i]&&pdScores[i]!==null&&!pdNotes[i].trim();
    const d=document.createElement("div");
    d.className="criterion"+(pdNa[i]?" na":"")+(needsComment?" comment-missing":"");
    d.innerHTML=`<div class="criterion-head"><div class="criterion-head-left"><div class="criterion-title">${i+1}. ${c.title}</div><div class="criterion-desc">${c.focus}</div></div><label class="na-toggle"><input type="checkbox" data-pdna="${i}" ${pdNa[i]?"checked":""}> Не предусмотрено</label></div>
    <div class="score-instruction">Оцените критерий от 0 до 10 и аргументируйте оценку в комментарии.</div>
    <button type="button" class="rubric-trigger" data-pdrubric="${i}"><span class="rubric-q">?</span> Как поставить балл</button>
    <div class="score">${Array.from({length:11},(_,v)=>`<button type="button" data-pdi="${i}" data-pdv="${v}" class="${pdScores[i]===v?"sel":""}" ${pdNa[i]?"disabled":""}>${v}</button>`).join("")}</div>
    <label>Комментарий ${pdNa[i]?"":"<span class='req'>*</span>"}</label>
    <textarea data-pdnote="${i}" ${pdNa[i]?"disabled":""} placeholder="Подтвердите оценку примерами с урока и укажите методические решения, которые вы возьмёте в собственную практику.">${pdNotes[i]||""}</textarea>
    <div class="comment-required-note">Комментарий обязателен для выставленной оценки.</div>
    <div class="na-note">Критерий не входит в структуру данного урока и не будет учитываться в итоговом результате и аналитике.</div>`;
    box.appendChild(d);
  });
  box.querySelectorAll("[data-pdnote]").forEach(t=>t.oninput=()=>{
    pdNotes[+t.dataset.pdnote]=t.value;updatePedTotal();
    t.closest(".criterion").classList.toggle("comment-missing",pdScores[+t.dataset.pdnote]!==null&&!pdNa[+t.dataset.pdnote]&&!t.value.trim());
  });
  box.querySelectorAll("[data-pdi]").forEach(b=>b.onclick=()=>{
    box.querySelectorAll("[data-pdnote]").forEach(t=>pdNotes[+t.dataset.pdnote]=t.value);
    pdScores[+b.dataset.pdi]=+b.dataset.pdv;drawPedCriteria();
  });
  box.querySelectorAll("[data-pdna]").forEach(ch=>ch.onchange=()=>{
    box.querySelectorAll("[data-pdnote]").forEach(t=>pdNotes[+t.dataset.pdnote]=t.value);
    const i=+ch.dataset.pdna;pdNa[i]=ch.checked;if(pdNa[i])pdScores[i]=null;drawPedCriteria();
  });
  box.querySelectorAll("[data-pdrubric]").forEach(b=>b.onclick=()=>openPedRubric(+b.dataset.pdrubric));
  updatePedTotal();
}

function updatePedTotal(){
  const applicable=pdNa.filter(x=>!x).length;
  const filled=pdScores.filter((v,i)=>!pdNa[i]&&v!==null).length;
  const commentsOk=PD_CRITERIA.every((_,i)=>pdNa[i]||(pdScores[i]!==null&&pdNotes[i].trim().length>0));
  const total=pdScores.reduce((a,b,i)=>a+(pdNa[i]?0:(b??0)),0),max=applicable*10,p=max?total/max*100:0;
  $("total").textContent=`${total} / ${max}`;
  $("level").textContent=(filled<applicable||applicable===0||!commentsOk)?"Не заполнено":p>=80?"Высокий уровень":p>=50?"Средний уровень":"Низкий уровень";
  $("publish").disabled=(applicable===0||filled!==applicable||!commentsOk);
}

function openPedRubric(i){
  $("rubricTitle").textContent="Как поставить балл";
  $("rubricSubtitle").textContent=PD_CRITERIA[i].title;const selected=pdScores[i];
  $("rubricGrid").innerHTML=PD_RUBRIC.map(r=>`<div class="rubric-band ${selected!==null&&selected>=r.min&&selected<=r.max?"active":""}"><div class="rubric-band-head"><span class="rubric-band-score">${r.score}</span><span class="rubric-band-level">${r.level}</span></div><div class="rubric-cols"><div class="rubric-col"><small>Действия учителя — организация</small><div>${r.teacher}</div></div><div class="rubric-col"><small>Действия учеников — результат</small><div>${r.students}</div></div></div></div>`).join("");
  $("rubricBackdrop").classList.remove("hidden");
}

function initLsAnswers(){
  if(lsAnswers.length)return;
  let idx=0;
  LS_SECTIONS.forEach((section,si)=>section.items.forEach(q=>{
    lsAnswers.push({id:`ls_${++idx}`,section_index:si,section:section.title,options:section.options,question:q,value:"",comment:""});
  }));
}

function renderLessonStudy(){
  initLsAnswers();
  $("formTitle").textContent="Карта анализа урока в рамках Lesson Study";
  $("formSubtitle").textContent="Для проверяющего / участника команды Lesson Study. Выберите вариант по каждому критерию и обязательно аргументируйте его в комментарии.";
  $("totalSummary").classList.add("hidden");
  $("generalWrap").classList.add("hidden");

  $("formIntro").innerHTML=`<div class="ls-intro">
    <div><label>Тема урока <span class="req">*</span></label><input id="lsTopic" value="${escAttr(lsMeta.topic)}" placeholder="Введите тему урока"></div>
    <div><label>Цель урока <span class="req">*</span></label><textarea id="lsGoal" placeholder="Введите цель урока">${escapeHtml(lsMeta.lesson_goal)}</textarea></div>
    <div><label>Исследовательский вопрос Lesson Study <span class="req">*</span></label><textarea id="lsResearch" placeholder="Введите исследовательский вопрос">${escapeHtml(lsMeta.research_question)}</textarea></div>
  </div>`;

  const box=$("criteria");box.innerHTML="";
  LS_SECTIONS.forEach((section,si)=>{
    const h=document.createElement("div");h.className="ls-section";h.textContent=section.title;box.appendChild(h);
    lsAnswers.filter(a=>a.section_index===si).forEach((a,localIndex)=>{
      const globalIndex=lsAnswers.indexOf(a);
      const missing=a.value&&!a.comment.trim();
      const d=document.createElement("div");
      d.className="criterion"+(missing?" ls-comment-missing":"");
      d.innerHTML=`<div class="criterion-head"><div class="criterion-head-left"><div class="criterion-title">${localIndex+1}. ${escapeHtml(a.question)}</div></div></div>
      <button type="button" class="ls-help" data-lshelp="${globalIndex}"><span class="rubric-q">?</span> Как оценивать</button>
      <div class="ls-choice-row">
        ${a.options.map(v=>`<button type="button" class="ls-choice ${a.value===v?"selected":""}" data-lsi="${globalIndex}" data-lsv="${v}">${v}</button>`).join("")}
      </div>
      <label>Комментарий <span class="req">*</span></label>
      <textarea data-lscomment="${globalIndex}" placeholder="Зафиксируйте конкретные факты и наблюдения по критерию.">${escapeHtml(a.comment)}</textarea>
      <div class="ls-required-note">Комментарий обязателен после выбора варианта.</div>`;
      box.appendChild(d);
    });
  });

  $("formOutro").innerHTML=`
    <div class="ls-final-title">VI. Общий анализ урока</div>
    ${LS_GENERAL.map((q,i)=>`<div class="ls-text-block"><label>${i+1}. ${escapeHtml(q)} <span class="req">*</span></label><textarea data-lsgeneral="${i}" placeholder="Введите ответ">${escapeHtml(lsGeneral[i])}</textarea></div>`).join("")}
    <div class="ls-final-title">VII. Итоговое заключение проверяющего</div>
    ${LS_FINAL.map((q,i)=>`<div class="ls-text-block"><label>${escapeHtml(q)} <span class="req">*</span></label><textarea data-lsfinal="${i}" placeholder="Введите ответ">${escapeHtml(lsFinal[i])}</textarea></div>`).join("")}
  `;

  $("lsTopic").oninput=e=>{lsMeta.topic=e.target.value;updateLsPublish()};
  $("lsGoal").oninput=e=>{lsMeta.lesson_goal=e.target.value;updateLsPublish()};
  $("lsResearch").oninput=e=>{lsMeta.research_question=e.target.value;updateLsPublish()};

  box.querySelectorAll("[data-lsi]").forEach(b=>b.onclick=()=>{
    syncLsTextareas();
    lsAnswers[+b.dataset.lsi].value=b.dataset.lsv;
    renderLessonStudy();
  });
  box.querySelectorAll("[data-lscomment]").forEach(t=>t.oninput=()=>{
    const i=+t.dataset.lscomment;lsAnswers[i].comment=t.value;
    t.closest(".criterion").classList.toggle("ls-comment-missing",!!lsAnswers[i].value&&!t.value.trim());
    updateLsPublish();
  });
  box.querySelectorAll("[data-lshelp]").forEach(b=>b.onclick=()=>openLsRubric(+b.dataset.lshelp));
  $("formOutro").querySelectorAll("[data-lsgeneral]").forEach(t=>t.oninput=()=>{lsGeneral[+t.dataset.lsgeneral]=t.value;updateLsPublish()});
  $("formOutro").querySelectorAll("[data-lsfinal]").forEach(t=>t.oninput=()=>{lsFinal[+t.dataset.lsfinal]=t.value;updateLsPublish()});
  updateLsPublish();
}

function syncLsTextareas(){
  const topic=$("lsTopic"),goal=$("lsGoal"),research=$("lsResearch");
  if(topic)lsMeta.topic=topic.value;if(goal)lsMeta.lesson_goal=goal.value;if(research)lsMeta.research_question=research.value;
  document.querySelectorAll("[data-lscomment]").forEach(t=>lsAnswers[+t.dataset.lscomment].comment=t.value);
  document.querySelectorAll("[data-lsgeneral]").forEach(t=>lsGeneral[+t.dataset.lsgeneral]=t.value);
  document.querySelectorAll("[data-lsfinal]").forEach(t=>lsFinal[+t.dataset.lsfinal]=t.value);
}

function updateLsPublish(){
  const metaOk=lsMeta.topic.trim()&&lsMeta.lesson_goal.trim()&&lsMeta.research_question.trim();
  const criteriaOk=lsAnswers.length>0&&lsAnswers.every(a=>a.value&&a.comment.trim());
  const generalOk=lsGeneral.every(x=>x.trim());
  const finalOk=lsFinal.every(x=>x.trim());
  $("publish").disabled=!(metaOk&&criteriaOk&&generalOk&&finalOk);
}

function openLsRubric(i){
  const a=lsAnswers[i];
  $("rubricTitle").textContent="Как оценивать";
  $("rubricSubtitle").textContent=a.question;
  $("rubricGrid").innerHTML=`<div class="ls-status-grid">${a.options.map(v=>`<div class="ls-status-card ${a.value===v?"rubric-band active":""}"><b>${escapeHtml(v)}</b><div>Вариант оценки, предусмотренный картой Lesson Study. Подтвердите выбор конкретным наблюдением в комментарии.</div></div>`).join("")}</div>`;
  $("rubricBackdrop").classList.remove("hidden");
}

$("closeRubric").onclick=()=>$("rubricBackdrop").classList.add("hidden");
$("rubricBackdrop").onclick=e=>{if(e.target===$("rubricBackdrop"))$("rubricBackdrop").classList.add("hidden")};

$("publish").onclick=async()=>{
  if(!selectedTeacher)return;
  let payload={
    campus,
    room:$("roomInput").value.trim(),
    subject:$("subjectSelect").value,
    class_grade:Number($("classGrade").value),
    class_letter:$("classLetter").value.trim().toUpperCase(),
    observer_last_name:$("oLast").value.trim(),
    observer_first_name:$("oFirst").value.trim(),
    observer_middle_name:$("oMiddle").value.trim()||null,
    observation_type:kind,
    teacher_last_name:selectedTeacher.last_name,
    teacher_first_name:selectedTeacher.first_name,
    teacher_middle_name:selectedTeacher.middle_name||null
  };

  if(kind==="Lesson Study"){
    syncLsTextareas();
    payload.card_version="lesson-study-v1";
    payload.total_score=0;
    payload.total_possible=0;
    payload.general_comment=null;
    payload.form_payload={
      schema:"lesson-study-v1",
      lesson_topic:lsMeta.topic.trim(),
      lesson_goal:lsMeta.lesson_goal.trim(),
      research_question:lsMeta.research_question.trim(),
      criteria:lsAnswers.map(a=>({section:a.section,question:a.question,value:a.value,comment:a.comment.trim()})),
      general_analysis:LS_GENERAL.map((q,i)=>({question:q,answer:lsGeneral[i].trim()})),
      final_conclusion:LS_FINAL.map((q,i)=>({question:q,answer:lsFinal[i].trim()}))
    };
  }else{
    const applicable=pdNa.filter(x=>!x).length,total=pdScores.reduce((a,b,i)=>a+(pdNa[i]?0:(b??0)),0),max=applicable*10;
    payload.card_version="pilot-v6";
    payload.total_score=total;
    payload.total_possible=max;
    payload.general_comment=$("general").value.trim()||null;
    payload.form_payload=null;
    for(let i=0;i<9;i++){
      payload[`criterion_${i+1}_score`]=pdNa[i]?null:pdScores[i];
      payload[`criterion_${i+1}_note`]=pdNotes[i]||null;
      payload[`criterion_${i+1}_na`]=pdNa[i];
    }
  }

  $("publish").disabled=true;$("publish").textContent="Сохраняем...";
  const{error}=await sb.from("lesson_observations").insert(payload);
  $("publish").textContent="Опубликовать лист";
  if(error){$("submitNotice").innerHTML=`<div class="notice error">${escapeHtml(error.message)}</div>`;$("publish").disabled=false;return}
  go(9);
};

$("restart").onclick=()=>location.reload();
loadDirectory();
go(1);
