
const supabaseClient = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY
);

const CRITERIA = [
 "Функциональная грамотность и уровневая дифференциация",
 "Адресное вовлечение и управление вниманием",
 "Критическое мышление и таксономия Блума",
 "ТРИЗ, креативное и логическое мышление",
 "Рефлексия и осознанность обучения",
 "Интеграция ценностей воспитания"
];

let allRows=[], currentRecord=null, currentTeacherKey=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const fullName=(r,p)=>[r[p+"_last_name"],r[p+"_first_name"],r[p+"_middle_name"]].filter(Boolean).join(" ");
const teacherKey=r=>[r.teacher_last_name,r.teacher_first_name,r.teacher_middle_name].filter(Boolean).join("|").toLowerCase();
const fmt=d=>new Date(d).toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"short"});
const fmtDate=d=>new Date(d).toLocaleDateString("ru-RU");
const monday=d=>{const x=new Date(d);const day=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-day);return x};
const level=t=>t>=10?"Высокий":t>=5?"Средний":"Низкий";

async function bootstrap(){
  const {data:{session}} = await supabaseClient.auth.getSession();
  if(session) showDashboard(session.user);
}
bootstrap();

$("loginBtn").onclick=async()=>{
  $("loginNotice").innerHTML="";
  $("loginBtn").disabled=true;
  const {data,error}=await supabaseClient.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  $("loginBtn").disabled=false;
  if(error){$("loginNotice").innerHTML=`<div class="notice error">${esc(error.message)}</div>`;return}
  showDashboard(data.user);
};

$("forgotBtn").onclick=async()=>{
  const email=$("email").value.trim();
  if(!email){$("loginNotice").innerHTML='<div class="notice error">Сначала введите email.</div>';return}
  const redirectTo = new URL("admin.html?reset=1", location.href).href;
  const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
  $("loginNotice").innerHTML = error ? `<div class="notice error">${esc(error.message)}</div>` : '<div class="notice ok">Письмо для восстановления пароля отправлено.</div>';
};

$("changeBtn").onclick=async()=>{
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session){$("loginNotice").innerHTML='<div class="notice error">Для смены пароля сначала войдите.</div>';return}
  const p=prompt("Введите новый пароль (не менее 8 символов):");
  if(!p)return;
  const {error}=await supabaseClient.auth.updateUser({password:p});
  alert(error ? error.message : "Пароль изменён.");
};

supabaseClient.auth.onAuthStateChange(async(event)=>{
  if(event==="PASSWORD_RECOVERY"){
    const p=prompt("Введите новый пароль (не менее 8 символов):");
    if(p){const {error}=await supabaseClient.auth.updateUser({password:p});alert(error?error.message:"Пароль изменён.");}
  }
});

async function showDashboard(user){
  $("loginBox").classList.add("hidden");$("dashboard").classList.remove("hidden");
  $("welcome").textContent=user.email||"Все опубликованные листы";
  await loadRows();
}
$("logoutBtn").onclick=async()=>{await supabaseClient.auth.signOut();location.reload()};

async function loadRows(){
  $("adminNotice").innerHTML="";
  const {data,error}=await supabaseClient.from("lesson_observations").select("*").order("created_at",{ascending:false});
  if(error){$("adminNotice").innerHTML=`<div class="notice error">Не удалось загрузить наблюдения: ${esc(error.message)}</div>`;return}
  allRows=data||[];
  renderRows(); renderAnalytics(); renderTeachers();
}

document.querySelectorAll("[data-view]").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===btn));
  const view=btn.dataset.view;
  ["observations","analytics","teachers"].forEach(v=>$("view-"+v).classList.toggle("hidden",v!==view));
  $("pageTitle").textContent = view==="observations"?"Журнал наблюдений":view==="analytics"?"Аналитика":"Педагоги";
  if(view==="teachers"){ $("teachersListView").classList.remove("hidden"); $("teacherProfileView").classList.add("hidden"); renderTeachers(); }
});

["fObserver","fTeacher","fKind","fDate","fWeek"].forEach(id=>$(id).addEventListener(["fKind","fDate","fWeek"].includes(id)?"change":"input",renderRows));

function renderRows(){
  const fo=$("fObserver").value.toLowerCase().trim(), ft=$("fTeacher").value.toLowerCase().trim(), fk=$("fKind").value, fd=$("fDate").value, fw=$("fWeek").value;
  const ws=monday(new Date());
  const rows=allRows.filter(r=>{
    const obs=fullName(r,"observer").toLowerCase(),tea=fullName(r,"teacher").toLowerCase(),dt=new Date(r.created_at);
    return (!fo||obs.includes(fo))&&(!ft||tea.includes(ft))&&(!fk||r.observation_type===fk)&&(!fd||r.created_at.slice(0,10)===fd)&&(!fw||dt>=ws);
  });
  $("rows").innerHTML = rows.length ? rows.map(r=>`
    <tr>
      <td>${esc(fmt(r.created_at))}</td>
      <td>${esc(r.room||"—")}</td>
      <td>${esc(fullName(r,"observer"))}</td>
      <td>${esc(fullName(r,"teacher"))}</td>
      <td><span class="tag">${esc(r.observation_type)}</span></td>
      <td><b>${r.total_score ?? "—"}/12</b></td>
      <td><button class="linkbtn" data-open="${r.id}">Открыть лист</button></td>
    </tr>`).join("") : '<tr><td colspan="7" style="text-align:center;color:#7b8598;padding:34px">По выбранным фильтрам записей нет.</td></tr>';
  bindOpen();
  $("kTotal").textContent=allRows.length;
  $("kWeek").textContent=allRows.filter(r=>new Date(r.created_at)>=ws).length;
  $("kTeachers").textContent=new Set(allRows.map(teacherKey)).size;
  $("kAvg").textContent=allRows.length?(allRows.reduce((a,b)=>a+(Number(b.total_score)||0),0)/allRows.length).toFixed(1):"—";
}

function renderAnalytics(){
  const teacherCount=new Set(allRows.map(teacherKey)).size;
  const avg=allRows.length?allRows.reduce((a,b)=>a+(Number(b.total_score)||0),0)/allRows.length:0;
  $("aTotal").textContent=allRows.length;
  $("aTeachers").textContent=teacherCount;
  $("aAvg").textContent=allRows.length?avg.toFixed(1)+"/12":"—";
  $("aPerTeacher").textContent=teacherCount?(allRows.length/teacherCount).toFixed(1):"—";

  const counts={Высокий:0,Средний:0,Низкий:0};
  allRows.forEach(r=>counts[level(Number(r.total_score)||0)]++);
  $("levels").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="level-card"><small>${k}</small><strong>${v}</strong></div>`).join("");

  const byWeek={};
  allRows.forEach(r=>{
    const m=monday(new Date(r.created_at));
    const k=m.toISOString().slice(0,10);
    byWeek[k]=(byWeek[k]||0)+1;
  });
  const weeks=Object.entries(byWeek).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8);
  const max=Math.max(1,...weeks.map(x=>x[1]));
  $("weekChart").innerHTML=weeks.length?weeks.map(([k,v])=>`
    <div class="week-col"><div class="week-count">${v}</div><div class="week-bar" style="height:${Math.max(8,170*v/max)}px"></div><div class="week-label">${fmtDate(k)}</div></div>
  `).join(""):'<div style="color:#7b8598">Пока недостаточно данных.</div>';

  const avgs=CRITERIA.map((_,i)=>{
    const vals=allRows.map(r=>Number(r[`criterion_${i+1}_score`])).filter(v=>Number.isFinite(v));
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
  });
  $("criteriaBars").innerHTML=CRITERIA.map((c,i)=>`
    <div class="bar-row"><div>${esc(c)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,avgs[i]/2*100))}%"></div></div><div class="bar-value">${avgs[i].toFixed(2)}/2</div></div>
  `).join("");
  const ranked=CRITERIA.map((c,i)=>({c,avg:avgs[i]})).sort((a,b)=>a.avg-b.avg);
  $("growthPoints").innerHTML=ranked.slice(0,3).map((x,i)=>`<div class="meta" style="margin-bottom:8px"><small>Точка роста ${i+1}</small><b>${esc(x.c)}</b><div style="color:#6c7688;margin-top:4px">Средний балл: ${x.avg.toFixed(2)}/2</div></div>`).join("");
}

function aggregateTeachers(){
  const map=new Map();
  allRows.forEach(r=>{
    const key=teacherKey(r);
    if(!map.has(key))map.set(key,{key,name:fullName(r,"teacher"),rows:[]});
    map.get(key).rows.push(r);
  });
  return [...map.values()].map(t=>{
    t.rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    t.avg=t.rows.reduce((a,b)=>a+(Number(b.total_score)||0),0)/t.rows.length;
    t.best=Math.max(...t.rows.map(r=>Number(r.total_score)||0));
    t.last=t.rows[0]?.created_at;
    return t;
  }).sort((a,b)=>a.name.localeCompare(b.name,"ru"));
}

function renderTeachers(){
  const q=($("teacherSearch")?.value||"").toLowerCase().trim();
  const teachers=aggregateTeachers().filter(t=>!q||t.name.toLowerCase().includes(q));
  $("teachersGrid").innerHTML=teachers.length?teachers.map(t=>`
    <div class="teacher-card" data-teacher="${esc(t.key)}">
      <h4>${esc(t.name)}</h4>
      <div style="color:#6c7688;font-size:13px">Последнее наблюдение: ${fmtDate(t.last)}</div>
      <div class="teacher-meta">
        <div class="teacher-stat"><small>Наблюдений</small><b>${t.rows.length}</b></div>
        <div class="teacher-stat"><small>Средний балл</small><b>${t.avg.toFixed(1)}/12</b></div>
      </div>
      <button class="linkbtn" style="margin-top:14px">Открыть профиль →</button>
    </div>`).join(""):'<div style="color:#7b8598">Педагоги пока не найдены.</div>';
  document.querySelectorAll("[data-teacher]").forEach(c=>c.onclick=()=>openTeacher(c.dataset.teacher));
}
$("teacherSearch").addEventListener("input",renderTeachers);

function openTeacher(key){
  const t=aggregateTeachers().find(x=>x.key===key);
  if(!t)return;
  currentTeacherKey=key;
  $("teachersListView").classList.add("hidden");$("teacherProfileView").classList.remove("hidden");
  $("profileName").textContent=t.name;
  $("profileSub").textContent=`История и динамика по ${t.rows.length} наблюдениям`;
  $("pCount").textContent=t.rows.length;
  $("pAvg").textContent=t.avg.toFixed(1)+"/12";
  $("pLast").textContent=fmtDate(t.last);
  $("pBest").textContent=t.best+"/12";

  const chrono=[...t.rows].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  $("profileSpark").innerHTML=chrono.map(r=>`<i title="${fmtDate(r.created_at)} — ${r.total_score}/12" style="height:${Math.max(8,(Number(r.total_score)||0)/12*78)}px"></i>`).join("");

  const avgs=CRITERIA.map((_,i)=>{
    const vals=t.rows.map(r=>Number(r[`criterion_${i+1}_score`])).filter(v=>Number.isFinite(v));
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
  });
  $("profileCriteria").innerHTML=CRITERIA.map((c,i)=>`
    <div class="bar-row" style="grid-template-columns:1fr 1.2fr 48px"><div>${esc(c)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,avgs[i]/2*100))}%"></div></div><div class="bar-value">${avgs[i].toFixed(1)}</div></div>
  `).join("");

  $("profileRows").innerHTML=t.rows.map(r=>`
    <tr><td>${esc(fmt(r.created_at))}</td><td>${esc(fullName(r,"observer"))}</td><td>${esc(r.observation_type)}</td><td><b>${r.total_score}/12</b></td><td><button class="linkbtn" data-open="${r.id}">Открыть лист</button></td></tr>
  `).join("");
  bindOpen();
}
$("backTeachers").onclick=()=>{$("teacherProfileView").classList.add("hidden");$("teachersListView").classList.remove("hidden")};

function bindOpen(){document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openRecord(b.dataset.open));}

function openRecord(id){
  currentRecord=allRows.find(r=>String(r.id)===String(id));
  if(!currentRecord)return;
  const r=currentRecord;
  $("modalSubtitle").textContent=`${fmt(r.created_at)} • ${r.observation_type}`;
  const criterionRows=CRITERIA.map((c,i)=>`
    <tr><td>${i+1}</td><td>${esc(c)}</td><td><b>${r[`criterion_${i+1}_score`] ?? "—"}</b></td><td>${esc(r[`criterion_${i+1}_note`] || "Комментарий не оставлен")}</td></tr>`).join("");
  $("modalBody").innerHTML=`
    <div class="modal-meta">
      <div class="meta"><small>Кто приходил</small><b>${esc(fullName(r,"observer"))}</b></div>
      <div class="meta"><small>К кому пришли</small><b>${esc(fullName(r,"teacher"))}</b></div>
      <div class="meta"><small>Кабинет</small><b>${esc(r.room||"—")}</b></div>
      <div class="meta"><small>Дата и время</small><b>${esc(fmt(r.created_at))}</b></div>
      <div class="meta"><small>Формат</small><b>${esc(r.observation_type)}</b></div>
      <div class="meta"><small>Версия карты</small><b>${esc(r.card_version==="pilot"?"Единая карта — пилот":r.card_version)}</b></div>
    </div>
    <div class="table-wrap" style="border-radius:14px"><table class="sheet-table"><thead><tr><th>№</th><th>Критерий / вопрос</th><th>Балл</th><th>Комментарий</th></tr></thead><tbody>${criterionRows}</tbody></table></div>
    <div class="summary"><div><small>Итог </small><strong>${r.total_score}/12</strong></div><span class="tag">${level(Number(r.total_score)||0)} уровень</span></div>
    <div style="margin-top:16px"><label>Итоговый комментарий / рекомендации</label><div class="meta">${esc(r.general_comment||"Комментарий не оставлен")}</div></div>`;
  $("modalBackdrop").classList.remove("hidden");
}
$("closeModal").onclick=()=>$("modalBackdrop").classList.add("hidden");
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))$("modalBackdrop").classList.add("hidden")});

$("downloadDocx").onclick=async()=>{
  if(!currentRecord)return;
  if(!window.docx){
    alert("Не удалось загрузить модуль DOCX. Обновите страницу и попробуйте ещё раз.");
    return;
  }
  if(typeof window.saveAs !== "function"){
    alert("Не удалось загрузить модуль скачивания. Обновите страницу и попробуйте ещё раз.");
    return;
  }
  const r=currentRecord,d=window.docx;
  const rows=[
    new d.TableRow({children:[
      new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:"№",bold:true})]})]}),
      new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:"Критерий / вопрос",bold:true})]})]}),
      new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:"Балл",bold:true})]})]}),
      new d.TableCell({children:[new d.Paragraph({children:[new d.TextRun({text:"Комментарий",bold:true})]})]})
    ]}),
    ...CRITERIA.map((c,i)=>new d.TableRow({children:[
      new d.TableCell({children:[new d.Paragraph(String(i+1))]}),
      new d.TableCell({children:[new d.Paragraph(c)]}),
      new d.TableCell({children:[new d.Paragraph(String(r[`criterion_${i+1}_score`] ?? "—"))]}),
      new d.TableCell({children:[new d.Paragraph(r[`criterion_${i+1}_note`] || "Комментарий не оставлен")]})
    ]}))
  ];
  const doc=new d.Document({sections:[{properties:{},children:[
    new d.Paragraph({text:"Future School",heading:d.HeadingLevel.TITLE,alignment:d.AlignmentType.CENTER}),
    new d.Paragraph({text:"Лист наблюдения урока",heading:d.HeadingLevel.HEADING_1,alignment:d.AlignmentType.CENTER}),
    new d.Paragraph(""),
    new d.Paragraph({children:[new d.TextRun({text:"Дата и время: ",bold:true}),new d.TextRun(fmt(r.created_at))]}),
    new d.Paragraph({children:[new d.TextRun({text:"Кабинет: ",bold:true}),new d.TextRun(r.room||"—")]}),
    new d.Paragraph({children:[new d.TextRun({text:"Формат: ",bold:true}),new d.TextRun(r.observation_type)]}),
    new d.Paragraph({children:[new d.TextRun({text:"Наблюдатель: ",bold:true}),new d.TextRun(fullName(r,"observer"))]}),
    new d.Paragraph({children:[new d.TextRun({text:"Наблюдаемый педагог: ",bold:true}),new d.TextRun(fullName(r,"teacher"))]}),
    new d.Paragraph(""),
    new d.Table({rows,width:{size:100,type:d.WidthType.PERCENTAGE}}),
    new d.Paragraph(""),
    new d.Paragraph({children:[new d.TextRun({text:"Итог: ",bold:true}),new d.TextRun(`${r.total_score}/12 — ${level(Number(r.total_score)||0)} уровень`)]}),
    new d.Paragraph({children:[new d.TextRun({text:"Итоговый комментарий / рекомендации: ",bold:true}),new d.TextRun(r.general_comment||"Комментарий не оставлен")]})
  ]}]});
  const blob=await d.Packer.toBlob(doc);
  const date=new Date(r.created_at).toISOString().slice(0,10);
  const teacher=`${r.teacher_last_name} ${r.teacher_first_name}`.trim().replace(/[\\/:*?"<>|]/g,"");
  const observer=`${r.observer_last_name} ${r.observer_first_name}`.trim().replace(/[\\/:*?"<>|]/g,"");
  saveAs(blob,`${date} — ${r.observation_type} — ${teacher} — ${observer}.docx`);
};
