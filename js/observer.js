
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


const LS_CRITERIA=[
{
 title:"Понимание задания и вхождение в работу",
 focus:"Понимает ли ученик, что и зачем нужно делать: может ли пересказать задание или показать на примере? Как приступает к работе: сразу, после подсказки, смотрит на соседа или ждёт учителя?"
},
{
 title:"Способ мышления",
 focus:"Как ученик объясняет своё решение: словами, жестом, рисунком, действием с предметами или схемой? Задаёт ли содержательные вопросы? Зафиксируйте 1–2 дословные фразы."
},
{
 title:"Реакция на затруднение",
 focus:"Что делает ученик, когда не получается или допущена ошибка: пробует ещё раз, ищет другой способ, берёт опору, просит помощи — или замирает, отвлекается, списывает?"
},
{
 title:"Общение и сотрудничество",
 focus:"О чём ученик говорит с другими: объясняет, спрашивает, слушает, помогает — или подсказывает готовый ответ и списывает? Зафиксируйте реплики."
},
{
 title:"Опоры и уровень задания",
 focus:"Использует ли ученик опоры: карточки, схемы, образцы, предметы — и помогают ли они продвинуться? Соответствует ли уровень задания его возможностям: не слишком лёгкий и не слишком трудный?"
},
{
 title:"Реакция на обратную связь",
 focus:"Что ученик делает после замечания, подсказки, похвалы или самопроверки: исправляет, переделывает, повторяет ошибку или не реагирует?"
},
{
 title:"Видимое понимание («Я понял(а)!»)",
 focus:"Были ли эпизоды, когда понимание стало заметно: изменился взгляд, появилась реплика, самостоятельное действие или объяснение другому? Что происходило непосредственно перед этим?"
},
{
 title:"Внимание и вовлечённость",
 focus:"Когда внимание ученика на задании, а когда уходит и на что? Учится он или просто занят? По каким признакам видно интерес, уверенность, тревогу или усталость?"
},
{
 title:"Результат к концу урока",
 focus:"Что ученик смог сделать самостоятельно по отношению к цели урока? Что осталось непонятным или получилось только с помощью?"
}
];

const LS_RUBRIC=[
{min:9,max:10,score:"9–10",level:"Устойчиво и самостоятельно",desc:"Признак проявляется устойчиво, в разные моменты урока и самостоятельно."},
{min:7,max:8,score:"7–8",level:"В основном самостоятельно",desc:"Признак проявляется в большинстве подходящих ситуаций, в основном самостоятельно."},
{min:4,max:6,score:"4–6",level:"Нестабильно / с помощью",desc:"Признак проявляется нестабильно или только с заметной поддержкой."},
{min:1,max:3,score:"1–3",level:"Эпизодически",desc:"Признак проявляется эпизодически или только при постоянной поддержке взрослого."},
{min:0,max:0,score:"0",level:"Не проявился",desc:"Ситуация в уроке была, но признак не проявился у выбранного фокусного ученика."}
];

const LS_STUDENT_LABELS={
 A:"Ученик A — сильный",
 B:"Ученик B — средний",
 C:"Ученик C — испытывает трудности"
};

const LS_FINAL=[
"Ключевой эпизод или неожиданное наблюдение: как учился выбранный фокусный ученик — когда и что произошло?",
"Что в дизайне урока (задание, материалы, организация работы, вопросы) помогло ученику учиться, а что помешало?",
"Что предлагаете сохранить или изменить в следующей версии исследовательского урока?"
];

let step=1,campus="",kind="",directory=[],selectedTeacher=null,lsStudent="";
let pdScores=Array(9).fill(null),pdNotes=Array(9).fill(""),pdNa=Array(9).fill(false);
let lsMeta={student_name:"",student_place:"",research_question:"",group_type:""};
let lsScores=Array(9).fill(null),lsNotes=Array(9).fill(""),lsNa=Array(9).fill(false);
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
  for(let i=1;i<=10;i++)$("step"+i).classList.toggle("hidden",i!==n);
  step=n;
  $("stepper").innerHTML=Array.from({length:9},(_,i)=>`<span class="${i<Math.min(n,10)?"on":""}"></span>`).join("");
  if(n===9)renderSelectedForm();
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

document.querySelectorAll(".ls-student").forEach(x=>x.onclick=()=>{
  document.querySelectorAll(".ls-student").forEach(y=>y.classList.remove("selected"));
  x.classList.add("selected");lsStudent=x.dataset.lsStudent;$("next8").disabled=false;
});
$("next8").onclick=()=>go(9);

document.querySelectorAll(".back").forEach(x=>x.onclick=()=>go(+x.dataset.go));
$("next1").onclick=()=>go(2);$("next2").onclick=()=>go(3);$("next3").onclick=()=>go(4);$("next4").onclick=()=>go(5);
$("next5").onclick=()=>go(6);$("next6").onclick=()=>go(7);
$("next7").onclick=()=>{ if(kind==="Lesson Study") go(8); else go(9); };
$("backFromForm").onclick=()=>go(kind==="Lesson Study"?8:7);

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


function renderLessonStudy(){
  $("formTitle").textContent="Карта наблюдения урока — Lesson Study";
  $("formSubtitle").textContent="«Видимое обучение» выбранного фокусного ученика. Оцените каждый применимый критерий от 0 до 10 и обязательно зафиксируйте конкретные факты.";
  $("totalSummary").classList.remove("hidden");
  $("generalWrap").classList.add("hidden");

  $("formIntro").innerHTML=`<div class="ls-focus-banner">
    <b>${escapeHtml(LS_STUDENT_LABELS[lsStudent]||"Фокусный ученик")}</b>
    <span>Наблюдение ведётся за выбранным учеником. Низкий балл — не «плохо», а материал для обсуждения дизайна урока в группе.</span>
  </div>
  <div class="ls-meta-grid">
    <div><label>Имя / инициалы ученика <span class="req">*</span></label><input id="lsStudentName" value="${escAttr(lsMeta.student_name)}" placeholder="Имя или инициалы"></div>
    <div><label>Место в классе <span class="req">*</span></label><input id="lsStudentPlace" value="${escAttr(lsMeta.student_place)}" placeholder="Например: 2 ряд, 3 парта"></div>
    <div class="full"><label>Исследовательский вопрос фокус-группы <span class="req">*</span></label><textarea id="lsResearch" placeholder="Введите исследовательский вопрос">${escapeHtml(lsMeta.research_question)}</textarea></div>
    <div class="full"><label>Группа Lesson Study <span class="req">*</span></label>
      <select id="lsGroupType">
        <option value="">Выберите вариант</option>
        <option value="Своя группа" ${lsMeta.group_type==="Своя группа"?"selected":""}>Своя группа</option>
        <option value="Другая группа" ${lsMeta.group_type==="Другая группа"?"selected":""}>Другая группа</option>
      </select>
    </div>
  </div>`;

  const box=$("criteria");box.innerHTML="";
  LS_CRITERIA.forEach((c,i)=>{
    const needsComment=!lsNa[i]&&lsScores[i]!==null&&!lsNotes[i].trim();
    const d=document.createElement("div");
    d.className="criterion"+(lsNa[i]?" na":"")+(needsComment?" comment-missing":"");
    d.innerHTML=`<div class="criterion-head">
      <div class="criterion-head-left">
        <div class="criterion-title">${i+1}. ${escapeHtml(c.title)}</div>
        <div class="criterion-desc">Фокус наблюдения: ${escapeHtml(c.focus)}</div>
      </div>
      <label class="na-toggle"><input type="checkbox" data-lsna="${i}" ${lsNa[i]?"checked":""}> Не предусмотрено</label>
    </div>
    <div class="score-instruction">Оцените проявление признака у выбранного фокусного ученика от 0 до 10 и подтвердите оценку фактом с урока.</div>
    <button type="button" class="rubric-trigger" data-lsrubric="${i}"><span class="rubric-q">?</span> Как поставить балл</button>
    <div class="score">${Array.from({length:11},(_,v)=>`<button type="button" data-lsi="${i}" data-lsv="${v}" class="${lsScores[i]===v?"sel":""}" ${lsNa[i]?"disabled":""}>${v}</button>`).join("")}</div>
    <label>Комментарий по ${escapeHtml(LS_STUDENT_LABELS[lsStudent]||"ученику")} ${lsNa[i]?"":"<span class='req'>*</span>"}</label>
    <textarea data-lsnote="${i}" ${lsNa[i]?"disabled":""} placeholder="Укажите время / этап урока и что ученик сказал, сделал, написал или показал.">${escapeHtml(lsNotes[i])}</textarea>
    <div class="comment-required-note">Комментарий обязателен для выставленной оценки.</div>
    <div class="na-note">В уроке не было ситуации, где данный признак мог проявиться. Критерий не считается нулём и не снижает итоговый результат.</div>`;
    box.appendChild(d);
  });

  $("formOutro").innerHTML=`<div class="ls-final-title">Итоговый комментарий / рекомендации</div>
    ${LS_FINAL.map((q,i)=>`<div class="ls-text-block"><label>${i+1}. ${escapeHtml(q)} <span class="req">*</span></label><textarea data-lsfinal="${i}" placeholder="Введите ответ">${escapeHtml(lsFinal[i])}</textarea></div>`).join("")}`;

  $("lsStudentName").oninput=e=>{lsMeta.student_name=e.target.value;updateLsTotal()};
  $("lsStudentPlace").oninput=e=>{lsMeta.student_place=e.target.value;updateLsTotal()};
  $("lsResearch").oninput=e=>{lsMeta.research_question=e.target.value;updateLsTotal()};
  $("lsGroupType").onchange=e=>{lsMeta.group_type=e.target.value;updateLsTotal()};

  box.querySelectorAll("[data-lsnote]").forEach(t=>t.oninput=()=>{
    lsNotes[+t.dataset.lsnote]=t.value;updateLsTotal();
    t.closest(".criterion").classList.toggle("comment-missing",lsScores[+t.dataset.lsnote]!==null&&!lsNa[+t.dataset.lsnote]&&!t.value.trim());
  });
  box.querySelectorAll("[data-lsi]").forEach(b=>b.onclick=()=>{
    box.querySelectorAll("[data-lsnote]").forEach(t=>lsNotes[+t.dataset.lsnote]=t.value);
    lsScores[+b.dataset.lsi]=+b.dataset.lsv;renderLessonStudy();
  });
  box.querySelectorAll("[data-lsna]").forEach(ch=>ch.onchange=()=>{
    box.querySelectorAll("[data-lsnote]").forEach(t=>lsNotes[+t.dataset.lsnote]=t.value);
    const i=+ch.dataset.lsna;lsNa[i]=ch.checked;if(lsNa[i])lsScores[i]=null;renderLessonStudy();
  });
  box.querySelectorAll("[data-lsrubric]").forEach(b=>b.onclick=()=>openLsRubric(+b.dataset.lsrubric));
  $("formOutro").querySelectorAll("[data-lsfinal]").forEach(t=>t.oninput=()=>{lsFinal[+t.dataset.lsfinal]=t.value;updateLsTotal()});

  updateLsTotal();
}

function updateLsTotal(){
  const applicable=lsNa.filter(x=>!x).length;
  const filled=lsScores.filter((v,i)=>!lsNa[i]&&v!==null).length;
  const commentsOk=LS_CRITERIA.every((_,i)=>lsNa[i]||(lsScores[i]!==null&&lsNotes[i].trim().length>0));
  const metaOk=lsMeta.student_name.trim()&&lsMeta.student_place.trim()&&lsMeta.research_question.trim()&&lsMeta.group_type;
  const finalOk=lsFinal.every(x=>x.trim());
  const total=lsScores.reduce((a,b,i)=>a+(lsNa[i]?0:(b??0)),0),max=applicable*10,p=max?total/max*100:0;
  $("total").textContent=`${total} / ${max}`;
  $("level").textContent=(filled<applicable||applicable===0||!commentsOk)?"Не заполнено":p>=80?"Высокий уровень":p>=50?"Средний уровень":"Низкий уровень";
  $("publish").disabled=!(applicable>0&&filled===applicable&&commentsOk&&metaOk&&finalOk);
}

function openLsRubric(i){
  $("rubricTitle").textContent="Как поставить балл";
  $("rubricSubtitle").textContent=LS_CRITERIA[i].title;
  const selected=lsScores[i];
  $("rubricGrid").innerHTML=LS_RUBRIC.map(r=>`<div class="rubric-band ${selected!==null&&selected>=r.min&&selected<=r.max?"active":""}">
    <div class="rubric-band-head"><span class="rubric-band-score">${r.score}</span><span class="rubric-band-level">${r.level}</span></div>
    <div class="rubric-col"><div>${escapeHtml(r.desc)}</div></div>
  </div>`).join("");
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
    const applicable=lsNa.filter(x=>!x).length;
    const total=lsScores.reduce((a,b,i)=>a+(lsNa[i]?0:(b??0)),0);
    const max=applicable*10;
    payload.card_version="lesson-study-focus-v1";
    payload.total_score=total;
    payload.total_possible=max;
    payload.general_comment=null;
    payload.form_payload={
      schema:"lesson-study-focus-v1",
      focus_student:lsStudent,
      focus_student_label:LS_STUDENT_LABELS[lsStudent],
      student_name:lsMeta.student_name.trim(),
      student_place:lsMeta.student_place.trim(),
      research_question:lsMeta.research_question.trim(),
      group_type:lsMeta.group_type,
      criteria:LS_CRITERIA.map((c,i)=>({
        title:c.title,
        focus:c.focus,
        score:lsNa[i]?null:lsScores[i],
        not_applicable:lsNa[i],
        comment:lsNotes[i].trim()
      })),
      final_recommendations:LS_FINAL.map((q,i)=>({question:q,answer:lsFinal[i].trim()}))
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
  go(10);
};

$("restart").onclick=()=>location.reload();
loadDirectory();
go(1);
