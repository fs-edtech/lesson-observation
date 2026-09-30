
const sb=window.supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
const CRITERIA=[
["Функциональная грамотность","Связь заданий с реальными жизненными ситуациями и практическим применением знаний."],
["Уровневая дифференциация","Учет разного уровня подготовки учащихся через задания, поддержку или способы работы."],
["Адресное вовлечение (управление вниманием)","Управление вниманием класса и адресное вовлечение учащихся."],
["Критическое мышление","Анализ, сравнение, обоснование, выводы и оценка информации."],
["Таксономия Блума","Использование заданий разных уровней мыслительной деятельности, включая анализ, синтез и оценку."],
["ТРИЗ и креативное мышление","Инструменты поиска нестандартных решений, генерации идей и творческого мышления."],
["Логическое мышление","Последовательные рассуждения, закономерности, причинно-следственные связи и аргументация."],
["Рефлексия (осознанность обучения)","Понимание целей, критериев успеха, собственного прогресса и зон роста."],
["Интеграция ценностей воспитания","Отражение воспитательных ценностей и поддержание безопасной, уважительной среды."]
];
let step=1,campus="",kind="",scores=Array(9).fill(null),notes=Array(9).fill("");
const $=x=>document.getElementById(x);
function go(n){for(let i=1;i<=8;i++)$("step"+i).classList.toggle("hidden",i!==n);step=n;$("stepper").innerHTML=Array.from({length:7},(_,i)=>`<span class="${i<Math.min(n,7)?"on":""}"></span>`).join("");if(n===7)drawCriteria();window.scrollTo({top:0,behavior:"smooth"})}
$("oLast").oninput=$("oFirst").oninput=()=>{$("next1").disabled=!($("oLast").value.trim()&&$("oFirst").value.trim())};
$("tLast").oninput=$("tFirst").oninput=()=>{$("next4").disabled=!($("tLast").value.trim()&&$("tFirst").value.trim())};
document.querySelectorAll("[data-campus]").forEach(x=>x.onclick=()=>{document.querySelectorAll("[data-campus]").forEach(y=>y.classList.remove("selected"));x.classList.add("selected");campus=x.dataset.campus;$("next2").disabled=false});
$("roomInput").oninput=e=>{e.target.value=e.target.value.replace(/\D/g,"").slice(0,3);$("next3").disabled=!e.target.value};
document.querySelectorAll(".kind").forEach(x=>x.onclick=()=>{document.querySelectorAll(".kind").forEach(y=>y.classList.remove("selected"));x.classList.add("selected");kind=x.dataset.kind;$("next5").disabled=false});
document.querySelectorAll(".back").forEach(x=>x.onclick=()=>go(+x.dataset.go));
$("next1").onclick=()=>go(2);$("next2").onclick=()=>go(3);$("next3").onclick=()=>go(4);$("next4").onclick=()=>go(5);$("next5").onclick=()=>go(6);$("next6").onclick=()=>go(7);
function drawCriteria(){const box=$("criteria");box.innerHTML="";CRITERIA.forEach((c,i)=>{const d=document.createElement("div");d.className="criterion";d.innerHTML=`<div class="criterion-title">${i+1}. ${c[0]}</div><div class="criterion-desc">${c[1]}</div><div class="score">${Array.from({length:11},(_,v)=>`<button data-i="${i}" data-v="${v}" class="${scores[i]===v?"sel":""}">${v}</button>`).join("")}</div><label>Комментарий</label><textarea data-note="${i}" placeholder="При необходимости добавьте наблюдение или пояснение">${notes[i]||""}</textarea>`;box.appendChild(d)});box.querySelectorAll(".score button").forEach(b=>b.onclick=()=>{box.querySelectorAll("[data-note]").forEach(t=>notes[+t.dataset.note]=t.value);scores[+b.dataset.i]=+b.dataset.v;drawCriteria()});box.querySelectorAll("[data-note]").forEach(t=>t.oninput=()=>notes[+t.dataset.note]=t.value);const filled=scores.filter(v=>v!==null).length,total=scores.reduce((a,b)=>a+(b??0),0);$("total").textContent=`${total} / 90`;$("level").textContent=filled<9?"Не заполнено":total>=72?"Высокий уровень":total>=45?"Средний уровень":"Низкий уровень";$("publish").disabled=filled!==9}
$("publish").onclick=async()=>{const p={campus,room:$("roomInput").value.trim(),observer_last_name:$("oLast").value.trim(),observer_first_name:$("oFirst").value.trim(),observer_middle_name:$("oMiddle").value.trim()||null,observation_type:kind,card_version:"pilot-v2",teacher_last_name:$("tLast").value.trim(),teacher_first_name:$("tFirst").value.trim(),teacher_middle_name:$("tMiddle").value.trim()||null,total_score:scores.reduce((a,b)=>a+b,0),general_comment:$("general").value.trim()||null};for(let i=0;i<9;i++){p[`criterion_${i+1}_score`]=scores[i];p[`criterion_${i+1}_note`]=notes[i]||null}$("publish").disabled=true;$("publish").textContent="Сохраняем...";const{error}=await sb.from("lesson_observations").insert(p);$("publish").textContent="Опубликовать лист";if(error){$("submitNotice").innerHTML=`<div class="notice error">${error.message}</div>`;$("publish").disabled=false;return}go(8)};
$("restart").onclick=()=>location.reload();go(1);
