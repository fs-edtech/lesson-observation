
const sb=window.supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);

const CRITERIA=[
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
const RUBRIC=[
{min:9,max:10,score:"9–10",level:"Эталонный",teacher:"Выступает модератором. Приём встроен в урок органично. Гибко реагирует на незапланированные ситуации.",students:"Проявляют субъектность. Работают самостоятельно: формулируют цели, ищут решения, оценивают друг друга. 100% вовлечённость."},
{min:7,max:8,score:"7–8",level:"Достаточный",teacher:"Уверенно применяет методику. Ведёт учеников за собой. Возможны небольшие нехватки времени или охвата класса.",students:"Активно участвуют и выполняют задания, но идут за инструкцией учителя. Вовлечено большинство класса."},
{min:4,max:6,score:"4–6",level:"Базовый / формальный",teacher:"Приём используется формально. Основная инициатива и трансляция знаний исходят от учителя.",students:"Пассивны, отвечают односложно, выполняют алгоритм без достаточного осмысления."},
{min:1,max:3,score:"1–3",level:"С ошибками",teacher:"Пытается применить приём, но допускает методические ошибки: нечёткая инструкция, сбой тайминга или организации.",students:"Запутаны инструкцией, отвлекаются; приём вызывает ступор или потерю рабочего ритма."},
{min:0,max:0,score:"0",level:"Отсутствует",teacher:"Критерий должен был проявляться в этом уроке, но фактически отсутствует.",students:"Ждут готовых ответов или не получают необходимой поддержки при затруднениях."}
];

let step=1,campus="",kind="",directory=[],selectedTeacher=null;
let scores=Array(9).fill(null),notes=Array(9).fill(""),na=Array(9).fill(false);
const $=x=>document.getElementById(x);

async function loadDirectory(){
  const {data,error}=await sb.from("teacher_directory")
    .select("last_name,first_name,middle_name,full_name,subject")
    .eq("active",true)
    .order("subject")
    .order("last_name");
  if(error){
    $("directoryNotice").textContent="Не удалось загрузить список педагогов: "+error.message;
    return;
  }
  directory=data||[];
  const subjects=[...new Set(directory.map(x=>x.subject))].sort((a,b)=>a.localeCompare(b,"ru"));
  $("subjectSelect").innerHTML='<option value="">Выберите предмет</option>'+subjects.map(s=>`<option value="${escAttr(s)}">${escapeHtml(s)}</option>`).join("");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function escAttr(s){return escapeHtml(s)}

function go(n){
  for(let i=1;i<=9;i++)$("step"+i).classList.toggle("hidden",i!==n);
  step=n;
  $("stepper").innerHTML=Array.from({length:8},(_,i)=>`<span class="${i<Math.min(n,9)?"on":""}"></span>`).join("");
  if(n===8)drawCriteria();
  window.scrollTo({top:0,behavior:"smooth"});
}

$("oLast").oninput=$("oFirst").oninput=()=>{$("next1").disabled=!($("oLast").value.trim()&&$("oFirst").value.trim())};
document.querySelectorAll("[data-campus]").forEach(x=>x.onclick=()=>{
  document.querySelectorAll("[data-campus]").forEach(y=>y.classList.remove("selected"));
  x.classList.add("selected"); campus=x.dataset.campus; $("next2").disabled=false;
});
$("roomInput").oninput=e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,3);$("next3").disabled=!e.target.value};

$("subjectSelect").onchange=()=>{
  const subject=$("subjectSelect").value;
  selectedTeacher=null;
  $("next4").disabled=!subject;
  $("next5").disabled=true;
  const teachers=directory.filter(x=>x.subject===subject);
  $("teacherSelect").innerHTML='<option value="">Выберите педагога</option>'+teachers.map((t,i)=>`<option value="${i}">${escapeHtml(t.full_name)}</option>`).join("");
  $("teacherSelect").dataset.subject=subject;
};
$("teacherSelect").onchange=()=>{
  const subject=$("subjectSelect").value;
  const teachers=directory.filter(x=>x.subject===subject);
  selectedTeacher=$("teacherSelect").value===""?null:teachers[Number($("teacherSelect").value)];
  $("next5").disabled=!selectedTeacher;
};
function validateClass(){
  $("next6").disabled=!($("classGrade").value!=="" && $("classLetter").value.trim());
}
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

function drawCriteria(){
  const box=$("criteria");box.innerHTML="";
  CRITERIA.forEach((c,i)=>{
    const needsComment=!na[i]&&scores[i]!==null&&!notes[i].trim();
    const d=document.createElement("div");
    d.className="criterion"+(na[i]?" na":"")+(needsComment?" comment-missing":"");
    d.innerHTML=`<div class="criterion-head"><div class="criterion-head-left"><div class="criterion-title">${i+1}. ${c.title}</div><div class="criterion-desc">${c.focus}</div></div><label class="na-toggle"><input type="checkbox" data-na="${i}" ${na[i]?"checked":""}> Не предусмотрено</label></div>
    <div class="score-instruction">Оцените критерий от 0 до 10 и аргументируйте оценку в комментарии.</div>
    <button type="button" class="rubric-trigger" data-rubric="${i}"><span class="rubric-q">?</span> Как поставить балл</button>
    <div class="score">${Array.from({length:11},(_,v)=>`<button type="button" data-i="${i}" data-v="${v}" class="${scores[i]===v?"sel":""}" ${na[i]?"disabled":""}>${v}</button>`).join("")}</div>
    <label>Комментарий ${na[i]?"":"<span class='req'>*</span>"}</label>
    <textarea data-note="${i}" ${na[i]?"disabled":""} placeholder="Подтвердите оценку примерами с урока и укажите методические решения, которые вы возьмёте в собственную практику.">${notes[i]||""}</textarea>
    <div class="comment-required-note">Комментарий обязателен для выставленной оценки.</div>
    <div class="na-note">Критерий не входит в структуру данного урока и не будет учитываться в итоговом результате и аналитике.</div>`;
    box.appendChild(d);
  });
  box.querySelectorAll("[data-note]").forEach(t=>t.oninput=()=>{
    notes[+t.dataset.note]=t.value;
    updateTotal();
    t.closest(".criterion").classList.toggle("comment-missing",scores[+t.dataset.note]!==null&&!na[+t.dataset.note]&&!t.value.trim());
  });
  box.querySelectorAll(".score button").forEach(b=>b.onclick=()=>{
    box.querySelectorAll("[data-note]").forEach(t=>notes[+t.dataset.note]=t.value);
    scores[+b.dataset.i]=+b.dataset.v;drawCriteria();
  });
  box.querySelectorAll("[data-na]").forEach(ch=>ch.onchange=()=>{
    box.querySelectorAll("[data-note]").forEach(t=>notes[+t.dataset.note]=t.value);
    const i=+ch.dataset.na;na[i]=ch.checked;if(na[i])scores[i]=null;drawCriteria();
  });
  box.querySelectorAll("[data-rubric]").forEach(b=>b.onclick=()=>openRubric(+b.dataset.rubric));
  updateTotal();
}
function updateTotal(){
  const applicable=na.filter(x=>!x).length;
  const filled=scores.filter((v,i)=>!na[i]&&v!==null).length;
  const commentsOk=CRITERIA.every((_,i)=>na[i]||(scores[i]!==null&&notes[i].trim().length>0));
  const total=scores.reduce((a,b,i)=>a+(na[i]?0:(b??0)),0),max=applicable*10,p=max?total/max*100:0;
  $("total").textContent=`${total} / ${max}`;
  $("level").textContent=(filled<applicable||applicable===0||!commentsOk)?"Не заполнено":p>=80?"Высокий уровень":p>=50?"Средний уровень":"Низкий уровень";
  $("publish").disabled=(applicable===0||filled!==applicable||!commentsOk);
}
function openRubric(i){
  $("rubricSubtitle").textContent=CRITERIA[i].title;const selected=scores[i];
  $("rubricGrid").innerHTML=RUBRIC.map(r=>`<div class="rubric-band ${selected!==null&&selected>=r.min&&selected<=r.max?"active":""}"><div class="rubric-band-head"><span class="rubric-band-score">${r.score}</span><span class="rubric-band-level">${r.level}</span></div><div class="rubric-cols"><div class="rubric-col"><small>Действия учителя — организация</small><div>${r.teacher}</div></div><div class="rubric-col"><small>Действия учеников — результат</small><div>${r.students}</div></div></div></div>`).join("");
  $("rubricBackdrop").classList.remove("hidden");
}
$("closeRubric").onclick=()=>$("rubricBackdrop").classList.add("hidden");
$("rubricBackdrop").onclick=e=>{if(e.target===$("rubricBackdrop"))$("rubricBackdrop").classList.add("hidden")};

$("publish").onclick=async()=>{
  if(!selectedTeacher)return;
  const applicable=na.filter(x=>!x).length,total=scores.reduce((a,b,i)=>a+(na[i]?0:(b??0)),0),max=applicable*10;
  const p={
    campus,
    room:$("roomInput").value.trim(),
    subject:$("subjectSelect").value,
    class_grade:Number($("classGrade").value),
    class_letter:$("classLetter").value.trim().toUpperCase(),
    observer_last_name:$("oLast").value.trim(),
    observer_first_name:$("oFirst").value.trim(),
    observer_middle_name:$("oMiddle").value.trim()||null,
    observation_type:kind,
    card_version:"pilot-v5",
    teacher_last_name:selectedTeacher.last_name,
    teacher_first_name:selectedTeacher.first_name,
    teacher_middle_name:selectedTeacher.middle_name||null,
    total_score:total,total_possible:max,
    general_comment:$("general").value.trim()||null
  };
  for(let i=0;i<9;i++){p[`criterion_${i+1}_score`]=na[i]?null:scores[i];p[`criterion_${i+1}_note`]=notes[i]||null;p[`criterion_${i+1}_na`]=na[i]}
  $("publish").disabled=true;$("publish").textContent="Сохраняем...";
  const{error}=await sb.from("lesson_observations").insert(p);
  $("publish").textContent="Опубликовать лист";
  if(error){$("submitNotice").innerHTML=`<div class="notice error">${escapeHtml(error.message)}</div>`;$("publish").disabled=false;return}
  go(9);
};
$("restart").onclick=()=>location.reload();

loadDirectory();
go(1);
