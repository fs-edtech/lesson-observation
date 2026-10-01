
const sb=window.supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
const C=["Функциональная грамотность","Уровневая дифференциация","Адресное вовлечение (управление вниманием)","Критическое мышление","Таксономия Блума","ТРИЗ и креативное мышление","Логическое мышление","Рефлексия (осознанность обучения)","Интеграция ценностей воспитания"];
let allRows=[],currentRecord=null,analyticsCampus="all";
const $=x=>document.getElementById(x);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const full=(r,p)=>[r[p+"_last_name"],r[p+"_first_name"],r[p+"_middle_name"]].filter(Boolean).join(" ");
const tkey=r=>full(r,"teacher").toLowerCase();
const fmt=d=>new Date(d).toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"short"});
const fmtDate=d=>new Date(d).toLocaleDateString("ru-RU");
const monday=d=>{const x=new Date(d),day=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-day);return x};
const maxScore=r=>Number(r.total_possible)||90;
const pct=r=>{const m=maxScore(r);return m?((Number(r.total_score)||0)/m*100):0};
const levelPct=p=>p>=80?"Высокий":p>=50?"Средний":"Низкий";
const scoreText=r=>`${Number(r.total_score)||0}/${maxScore(r)}`;

async function boot(){const{data:{session}}=await sb.auth.getSession();if(session)showDashboard(session.user)}boot();
$("loginBtn").onclick=async()=>{const{data,error}=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){$("loginNotice").innerHTML=`<div class="notice error">${esc(error.message)}</div>`;return}showDashboard(data.user)};
$("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.reload()};
async function showDashboard(user){$("loginBox").classList.add("hidden");$("dashboard").classList.remove("hidden");$("welcome").textContent=user.email||"Все опубликованные листы";const{data,error}=await sb.from("lesson_observations").select("*").order("created_at",{ascending:false});if(error){alert("Не удалось загрузить наблюдения: "+error.message);return}allRows=data||[];renderObservationPage();renderAnalytics();renderTeachers()}

document.querySelectorAll("[data-view]").forEach(btn=>btn.onclick=()=>{document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===btn));const v=btn.dataset.view;["observations","analytics","teachers"].forEach(x=>$("view-"+x).classList.toggle("hidden",x!==v));$("pageTitle").textContent=v==="observations"?"Журнал наблюдений":v==="analytics"?"Аналитика":"Педагоги";if(v==="teachers"){$("teachersListView").classList.remove("hidden");$("teacherProfileView").classList.add("hidden");renderTeachers()}});

["fObserver","fTeacher","fKind","fDate","fWeek"].forEach(id=>$(id).addEventListener(["fKind","fDate","fWeek"].includes(id)?"change":"input",renderObservationPage));

function filteredRows(){const fo=$("fObserver").value.toLowerCase().trim(),ft=$("fTeacher").value.toLowerCase().trim(),fk=$("fKind").value,fd=$("fDate").value,fw=$("fWeek").value,ws=monday(new Date());return allRows.filter(r=>{const dt=new Date(r.created_at);return(!fo||full(r,"observer").toLowerCase().includes(fo))&&(!ft||full(r,"teacher").toLowerCase().includes(ft))&&(!fk||r.observation_type===fk)&&(!fd||r.created_at.slice(0,10)===fd)&&(!fw||dt>=ws)})}

function renderCampusJournal(campus,prefix,bodyId){
  const rows=filteredRows().filter(r=>r.campus===campus),ws=monday(new Date());
  $(prefix+"Total").textContent=rows.length;
  $(prefix+"Week").textContent=rows.filter(r=>new Date(r.created_at)>=ws).length;
  $(prefix+"Teachers").textContent=new Set(rows.map(tkey)).size;
  $(prefix+"Avg").textContent=rows.length?(rows.reduce((a,r)=>a+pct(r),0)/rows.length).toFixed(1)+"%":"—";
  $(bodyId).innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(fmt(r.created_at))}</td><td>${esc(r.room||"—")}</td><td>${esc(full(r,"observer"))}</td><td>${esc(full(r,"teacher"))}</td><td><span class="tag">${esc(r.observation_type)}</span></td><td><b>${scoreText(r)}</b></td><td><button class="linkbtn" data-open="${r.id}">Открыть лист</button></td><td><button class="trash-btn" data-delete="${r.id}" title="Удалить лист">🗑️</button></td></tr>`).join(""):'<tr><td colspan="8" style="text-align:center;color:#7b8598;padding:28px">Записей пока нет.</td></tr>';
}
function renderObservationPage(){renderCampusJournal("Astana Future School","afs","afsRows");renderCampusJournal("Sport School","sport","sportRows");bindRowActions()}
function bindRowActions(){document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openRecord(b.dataset.open));document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteSheet(b.dataset.delete))}
async function deleteSheet(id){const r=allRows.find(x=>String(x.id)===String(id));if(!r)return;if(!confirm(`Удалить лист наблюдения?\n\n${full(r,"teacher")}\n${fmt(r.created_at)}\n\nЭто действие нельзя отменить.`))return;const{error}=await sb.from("lesson_observations").delete().eq("id",id);if(error){alert("Не удалось удалить лист: "+error.message);return}allRows=allRows.filter(x=>String(x.id)!==String(id));renderObservationPage();renderAnalytics();renderTeachers()}

document.querySelectorAll("[data-analytics]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-analytics]").forEach(x=>x.classList.toggle("active",x===b));analyticsCampus=b.dataset.analytics;renderAnalytics()});
function analyticsRows(){return analyticsCampus==="all"?allRows:allRows.filter(r=>r.campus===analyticsCampus)}
function averages(rows){
  return C.map((_,i)=>{
    const vals=rows.filter(r=>r[`criterion_${i+1}_na`]!==true).map(r=>Number(r[`criterion_${i+1}_score`])).filter(Number.isFinite);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  });
}
function renderAnalytics(){
  const rows=analyticsRows(),tc=new Set(rows.map(tkey)).size,avp=rows.length?rows.reduce((a,r)=>a+pct(r),0)/rows.length:0,a=averages(rows);
  $("aTotal").textContent=rows.length;$("aTeachers").textContent=tc;$("aAvg").textContent=rows.length?avp.toFixed(1)+"%":"—";$("aPerTeacher").textContent=tc?(rows.length/tc).toFixed(1):"—";
  $("analyticsScope").textContent=analyticsCampus==="all"?"Все кампусы":analyticsCampus;
  $("scopeMeta").innerHTML=`<div class="meta"><small>Выбранный срез</small><b>${analyticsCampus==="all"?"Общий анализ":esc(analyticsCampus)}</b></div>`;
  const counts={Высокий:0,Средний:0,Низкий:0};rows.forEach(r=>counts[levelPct(pct(r))]++);
  $("levels").innerHTML=Object.entries(counts).map(([k,v])=>`<div class="level-card"><small>${k}</small><strong>${v}</strong></div>`).join("");
  $("criteriaBars").innerHTML=C.map((c,i)=>`<div class="bar-row"><div>${esc(c)}</div><div class="bar-track"><div class="bar-fill" style="width:${a[i]===null?0:a[i]*10}%"></div></div><div class="bar-value">${a[i]===null?"Н/П":a[i].toFixed(1)+"/10"}</div></div>`).join("");
  const rank=C.map((c,i)=>({c,v:a[i]})).filter(x=>x.v!==null).sort((x,y)=>x.v-y.v);
  $("growthPoints").innerHTML=rank.length?rank.slice(0,3).map((x,i)=>`<div class="meta" style="margin-bottom:8px"><small>Точка роста ${i+1}</small><b>${esc(x.c)}</b><div style="color:#6c7688;margin-top:4px">Средний балл: ${x.v.toFixed(1)}/10</div></div>`).join(""):'<div class="meta">Недостаточно применимых оценок для расчёта.</div>';
  radar(a);
}
function radar(v){
  const svg=$("radarChart"),cx=350,cy=350,R=205,n=C.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
  const poly=r=>Array.from({length:n},(_,i)=>pt(i,r).join(",")).join(" ");
  const wrapLabel=(text,max=22)=>{const words=text.split(" "),lines=[];let line="";words.forEach(w=>{const test=(line+" "+w).trim();if(test.length>max&&line){lines.push(line);line=w}else line=test});if(line)lines.push(line);return lines.slice(0,3)};
  let out="";
  [2,4,6,8,10].forEach(val=>{const rr=R*(val/10);out+=`<polygon points="${poly(rr)}" fill="none" stroke="#d9deea" stroke-width="1"/>`;out+=`<text x="${cx+5}" y="${cy-rr+12}" class="radar-axis-number">${val}</text>`});
  for(let i=0;i<n;i++){const[x,y]=pt(i,R);out+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e3e7ef" stroke-width="1"/>`}
  const data=v.map((x,i)=>pt(i,R*((x===null?0:x)/10)).join(",")).join(" ");
  out+=`<polygon points="${data}" fill="rgba(91,79,243,.20)" stroke="#5b4ff3" stroke-width="3"/>`;
  v.forEach((x,i)=>{if(x!==null){const[p,q]=pt(i,R*x/10);out+=`<circle cx="${p}" cy="${q}" r="5" fill="#5b4ff3"/>`}});
  C.forEach((label,i)=>{const[lx,ly]=pt(i,R+82),angle=-Math.PI/2+i*2*Math.PI/n;let anchor="middle";if(Math.cos(angle)>.25)anchor="start";if(Math.cos(angle)<-.25)anchor="end";const lines=wrapLabel(label,22),value=v[i]===null?"Н/П":v[i].toFixed(1)+"/10",valueY=ly-(lines.length*7);out+=`<text x="${lx}" y="${valueY}" text-anchor="${anchor}" class="radar-label-value">${value}</text>`;lines.forEach((line,idx)=>out+=`<text x="${lx}" y="${ly+12+idx*14}" text-anchor="${anchor}" class="radar-label-text">${esc(line)}</text>`)});
  svg.innerHTML=out;
}

function aggregateTeachers(){
  const m=new Map();allRows.forEach(r=>{const k=tkey(r);if(!m.has(k))m.set(k,{key:k,name:full(r,"teacher"),rows:[]});m.get(k).rows.push(r)});
  return[...m.values()].map(t=>{t.rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));t.avgPct=t.rows.reduce((a,r)=>a+pct(r),0)/t.rows.length;t.bestPct=Math.max(...t.rows.map(pct));t.last=t.rows[0]?.created_at;t.campuses=[...new Set(t.rows.map(r=>r.campus).filter(Boolean))];return t}).sort((a,b)=>a.name.localeCompare(b.name,"ru"));
}
function renderTeachers(){
  const q=($("teacherSearch").value||"").toLowerCase().trim(),ts=aggregateTeachers().filter(t=>!q||t.name.toLowerCase().includes(q));
  $("teachersGrid").innerHTML=ts.length?ts.map(t=>`<div class="teacher-card" data-teacher="${esc(t.key)}"><h4>${esc(t.name)}</h4><div style="color:#6c7688;font-size:13px">Последнее наблюдение: ${fmtDate(t.last)}</div><div class="campus-mini">${t.campuses.map(c=>`<span>${esc(c)}</span>`).join("")}</div><div class="teacher-meta"><div class="teacher-stat"><small>Наблюдений</small><b>${t.rows.length}</b></div><div class="teacher-stat"><small>Средний результат</small><b>${t.avgPct.toFixed(1)}%</b></div></div><button class="linkbtn" style="margin-top:14px">Открыть профиль →</button></div>`).join(""):'<div style="color:#7b8598">Педагоги пока не найдены.</div>';
  document.querySelectorAll("[data-teacher]").forEach(c=>c.onclick=()=>openTeacher(c.dataset.teacher));
}
$("teacherSearch").oninput=renderTeachers;
function openTeacher(key){
  const t=aggregateTeachers().find(x=>x.key===key);if(!t)return;
  $("teachersListView").classList.add("hidden");$("teacherProfileView").classList.remove("hidden");
  $("profileName").textContent=t.name;$("profileSub").textContent=`История и динамика по ${t.rows.length} наблюдениям`;
  $("pCount").textContent=t.rows.length;$("pAvg").textContent=t.avgPct.toFixed(1)+"%";$("pLast").textContent=fmtDate(t.last);$("pBest").textContent=t.bestPct.toFixed(1)+"%";
  const chrono=[...t.rows].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  $("profileSpark").innerHTML=chrono.map(r=>`<i title="${fmtDate(r.created_at)} — ${scoreText(r)} (${pct(r).toFixed(1)}%)" style="height:${Math.max(8,pct(r))}px"></i>`).join("");
  const a=averages(t.rows);
  $("profileCriteria").innerHTML=C.map((c,i)=>`<div class="bar-row" style="grid-template-columns:1fr 1.2fr 50px"><div>${esc(c)}</div><div class="bar-track"><div class="bar-fill" style="width:${a[i]===null?0:a[i]*10}%"></div></div><div class="bar-value">${a[i]===null?"Н/П":a[i].toFixed(1)}</div></div>`).join("");
  $("profileRows").innerHTML=t.rows.map(r=>`<tr><td>${esc(fmt(r.created_at))}</td><td>${esc(r.campus||"—")}</td><td>${esc(r.room||"—")}</td><td>${esc(full(r,"observer"))}</td><td>${esc(r.observation_type)}</td><td><b>${scoreText(r)}</b></td><td><button class="linkbtn" data-open="${r.id}">Открыть лист</button></td></tr>`).join("");
  bindRowActions();
}
$("backTeachers").onclick=()=>{$("teacherProfileView").classList.add("hidden");$("teachersListView").classList.remove("hidden")};

function openRecord(id){
  currentRecord=allRows.find(r=>String(r.id)===String(id));if(!currentRecord)return;const r=currentRecord;
  $("modalSubtitle").textContent=`${fmt(r.created_at)} • ${r.observation_type}`;
  $("modalBody").innerHTML=`<div class="modal-meta"><div class="meta"><small>Кто приходил</small><b>${esc(full(r,"observer"))}</b></div><div class="meta"><small>К кому пришли</small><b>${esc(full(r,"teacher"))}</b></div><div class="meta"><small>Кампус</small><b>${esc(r.campus||"—")}</b></div><div class="meta"><small>Кабинет</small><b>${esc(r.room||"—")}</b></div><div class="meta"><small>Дата и время</small><b>${esc(fmt(r.created_at))}</b></div><div class="meta"><small>Формат</small><b>${esc(r.observation_type)}</b></div></div><div class="table-wrap"><table style="min-width:0"><thead><tr><th>№</th><th>Критерий</th><th>Балл</th><th>Комментарий</th></tr></thead><tbody>${C.map((c,i)=>{const nap=r[`criterion_${i+1}_na`]===true;return`<tr><td>${i+1}</td><td>${esc(c)}</td><td><b>${nap?"Не предусмотрено":(r[`criterion_${i+1}_score`]??"—")}</b></td><td>${esc(r[`criterion_${i+1}_note`]||"Комментарий не оставлен")}</td></tr>`}).join("")}</tbody></table></div><div class="summary"><div><small>Итог</small><strong>${scoreText(r)}</strong></div><span class="tag">${levelPct(pct(r))} уровень · ${pct(r).toFixed(1)}%</span></div><div style="margin-top:16px"><label>Итоговый комментарий / рекомендации</label><div class="meta">${esc(r.general_comment||"Комментарий не оставлен")}</div></div>`;
  $("modalBackdrop").classList.remove("hidden");
}
$("closeModal").onclick=()=>$("modalBackdrop").classList.add("hidden");$("modalBackdrop").onclick=e=>{if(e.target===$("modalBackdrop"))$("modalBackdrop").classList.add("hidden")};

$("downloadDocx").onclick=async()=>{
  if(!currentRecord)return;if(typeof JSZip==="undefined"){alert("Не удалось загрузить модуль DOCX.");return}
  const r=currentRecord,xe=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
  const p=(t,b=false)=>`<w:p><w:r>${b?'<w:rPr><w:b/></w:rPr>':''}<w:t xml:space="preserve">${xe(t)}</w:t></w:r></w:p>`;
  const cell=(t,b=false)=>`<w:tc><w:tcPr><w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr>${p(t,b)}</w:tc>`;
  const row=a=>`<w:tr>${a.join("")}</w:tr>`;
  const trs=C.map((c,i)=>{const nap=r[`criterion_${i+1}_na`]===true;return row([cell(String(i+1)),cell(c),cell(nap?"Не предусмотрено":String(r[`criterion_${i+1}_score`]??"—"),true),cell(r[`criterion_${i+1}_note`]||"Комментарий не оставлен")])}).join("");
  const table=`<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="6" w:color="B8C0CC"/><w:left w:val="single" w:sz="6" w:color="B8C0CC"/><w:bottom w:val="single" w:sz="6" w:color="B8C0CC"/><w:right w:val="single" w:sz="6" w:color="B8C0CC"/><w:insideH w:val="single" w:sz="4" w:color="D9DEE7"/><w:insideV w:val="single" w:sz="4" w:color="D9DEE7"/></w:tblBorders></w:tblPr>${row([cell("№",true),cell("Критерий",true),cell("Балл",true),cell("Комментарий",true)])}${trs}</w:tbl>`;
  const body=[p("Future School",true),p("Лист наблюдения урока",true),p("Дата и время: "+fmt(r.created_at)),p("Кампус: "+(r.campus||"—")),p("Кабинет: "+(r.room||"—")),p("Формат: "+r.observation_type),p("Наблюдатель: "+full(r,"observer")),p("Наблюдаемый педагог: "+full(r,"teacher")),p(""),table,p(""),p(`Итог: ${scoreText(r)} — ${pct(r).toFixed(1)}%`,true),p("Итоговый комментарий / рекомендации: "+(r.general_comment||"Комментарий не оставлен")),`<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>`].join("");
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const zip=new JSZip();zip.file("[Content_Types].xml",ct);zip.folder("_rels").file(".rels",rels);zip.folder("word").file("document.xml",documentXml);zip.folder("word").folder("_rels").file("document.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');
  const blob=await zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
  const safe=x=>String(x).replace(/[\\/:*?"<>|]/g,"").trim(),fn=`${new Date(r.created_at).toISOString().slice(0,10)} — ${safe(r.observation_type)} — ${safe(full(r,"teacher"))}.docx`;
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
};
