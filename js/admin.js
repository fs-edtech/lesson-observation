
const sb=window.supabase.createClient(APP_CONFIG.SUPABASE_URL,APP_CONFIG.SUPABASE_PUBLISHABLE_KEY);
const C=["Функциональная грамотность","Уровневая дифференциация","Адресное вовлечение (управление вниманием)","Критическое мышление","Таксономия Блума","ТРИЗ и креативное мышление","Логическое мышление","Рефлексия (осознанность обучения)","Интеграция ценностей воспитания"];
let rows=[];const $=x=>document.getElementById(x);const name=(r,p)=>[r[p+"_last_name"],r[p+"_first_name"],r[p+"_middle_name"]].filter(Boolean).join(" ");const fmt=d=>new Date(d).toLocaleString("ru-RU");const key=r=>name(r,"teacher").toLowerCase();const mon=d=>{let x=new Date(d),n=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-n);return x};
async function boot(){const {data:{session}}=await sb.auth.getSession();if(session)show()}boot();
$("loginBtn").onclick=async()=>{const {error}=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){$("loginNotice").innerHTML=`<div class="notice error">${error.message}</div>`;return}show()};
$("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.reload()};
async function show(){$("loginBox").classList.add("hidden");$("dashboard").classList.remove("hidden");const {data,error}=await sb.from("lesson_observations").select("*").order("created_at",{ascending:false});if(error){alert(error.message);return}rows=data||[];renderObs();renderAnalytics();renderTeachers()}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));["observations","analytics","teachers"].forEach(v=>$("view-"+v).classList.toggle("hidden",v!==b.dataset.view));$("pageTitle").textContent=b.dataset.view==="observations"?"Журнал наблюдений":b.dataset.view==="analytics"?"Аналитика":"Педагоги"});
["fObserver","fTeacher","fKind","fDate","fWeek"].forEach(id=>$(id).oninput=renderObs);
function renderObs(){let q1=$("fObserver").value.toLowerCase(),q2=$("fTeacher").value.toLowerCase(),k=$("fKind").value,d=$("fDate").value,w=$("fWeek").value,ws=mon(new Date());let rr=rows.filter(r=>(!q1||name(r,"observer").toLowerCase().includes(q1))&&(!q2||name(r,"teacher").toLowerCase().includes(q2))&&(!k||r.observation_type===k)&&(!d||r.created_at.slice(0,10)===d)&&(!w||new Date(r.created_at)>=ws));$("rows").innerHTML=rr.map(r=>`<tr><td>${fmt(r.created_at)}</td><td>${r.campus||"—"}</td><td>${r.room||"—"}</td><td>${name(r,"observer")}</td><td>${name(r,"teacher")}</td><td>${r.observation_type}</td><td><b>${r.total_score}/90</b></td><td><button class="linkbtn" data-open="${r.id}">Открыть</button></td><td><button class="trash-btn" data-delete="${r.id}" title="Удалить лист" aria-label="Удалить лист">🗑️</button></td></tr>`).join("")||'<tr><td colspan="9">Нет данных</td></tr>';document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>openSheet(b.dataset.open));document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteSheet(b.dataset.delete));$("kTotal").textContent=rows.length;$("kWeek").textContent=rows.filter(r=>new Date(r.created_at)>=ws).length;$("kTeachers").textContent=new Set(rows.map(key)).size;$("kAvg").textContent=rows.length?(rows.reduce((a,b)=>a+(+b.total_score||0),0)/rows.length).toFixed(1):"—"}
function averages(rr){return C.map((_,i)=>{let v=rr.map(r=>+r[`criterion_${i+1}_score`]).filter(Number.isFinite);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0})}
function renderAnalytics(){let t=new Set(rows.map(key)).size,avg=rows.length?rows.reduce((a,b)=>a+(+b.total_score||0),0)/rows.length:0,a=averages(rows);$("aTotal").textContent=rows.length;$("aTeachers").textContent=t;$("aAvg").textContent=rows.length?avg.toFixed(1)+"/90":"—";$("aPerTeacher").textContent=t?(rows.length/t).toFixed(1):"—";$("criteriaBars").innerHTML=C.map((c,i)=>`<div class="bar-row"><div>${c}</div><div class="bar-track"><div class="bar-fill" style="width:${a[i]*10}%"></div></div><div>${a[i].toFixed(1)}/10</div></div>`).join("");let rank=C.map((c,i)=>({c,v:a[i]})).sort((x,y)=>x.v-y.v);$("growthPoints").innerHTML=rank.slice(0,3).map((x,i)=>`<div class="meta" style="margin-bottom:8px"><small>Точка роста ${i+1}</small><b>${x.c}</b><div>${x.v.toFixed(1)}/10</div></div>`).join("");radar(a)}
function radar(v){let svg=$("radarChart"),cx=250,cy=250,R=175,n=C.length,pt=(i,r)=>{let a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]},poly=r=>Array.from({length:n},(_,i)=>pt(i,r).join(",")).join(" "),s="";[.2,.4,.6,.8,1].forEach(k=>s+=`<polygon points="${poly(R*k)}" fill="none" stroke="#d9deea"/>`);for(let i=0;i<n;i++){let[x,y]=pt(i,R);s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e3e7ef"/>`}let data=v.map((x,i)=>pt(i,R*Math.min(10,x)/10).join(",")).join(" ");s+=`<polygon points="${data}" fill="rgba(91,79,243,.22)" stroke="#5b4ff3" stroke-width="3"/>`;svg.innerHTML=s;$("radarLegend").innerHTML=C.map((c,i)=>`<div class="meta"><small>${i+1}. ${c}</small><b>${v[i].toFixed(1)}/10</b></div>`).join("")}
function renderTeachers(){let q=$("teacherSearch").value.toLowerCase(),m=new Map();rows.forEach(r=>{let k=key(r);if(!m.has(k))m.set(k,{n:name(r,"teacher"),r:[]});m.get(k).r.push(r)});$("teachersGrid").innerHTML=[...m.values()].filter(x=>x.n.toLowerCase().includes(q)).map(x=>{let a=x.r.reduce((s,r)=>s+(+r.total_score||0),0)/x.r.length;return`<div class="teacher-card"><h4>${x.n}</h4><p>${x.r.length} наблюдений</p><b>${a.toFixed(1)}/90</b></div>`}).join("")}

async function deleteSheet(id){
  const r=rows.find(x=>String(x.id)===String(id));
  if(!r)return;
  const ok=confirm(`Удалить лист наблюдения?\n\n${name(r,"teacher")}\n${fmt(r.created_at)}\n\nЭто действие нельзя отменить.`);
  if(!ok)return;

  const {error}=await sb.from("lesson_observations").delete().eq("id",id);
  if(error){
    alert("Не удалось удалить лист: "+error.message);
    return;
  }

  rows=rows.filter(x=>String(x.id)!==String(id));
  renderObs();
  renderAnalytics();
  renderTeachers();
}

$("teacherSearch").oninput=renderTeachers;
function openSheet(id){let r=rows.find(x=>String(x.id)===String(id));$("modalBody").innerHTML=`<div class="modal-meta"><div class="meta"><small>Наблюдатель</small><b>${name(r,"observer")}</b></div><div class="meta"><small>Педагог</small><b>${name(r,"teacher")}</b></div><div class="meta"><small>Кампус</small><b>${r.campus||"—"}</b></div><div class="meta"><small>Кабинет</small><b>${r.room||"—"}</b></div><div class="meta"><small>Дата</small><b>${fmt(r.created_at)}</b></div><div class="meta"><small>Формат</small><b>${r.observation_type}</b></div></div><div class="table-wrap"><table><thead><tr><th>№</th><th>Критерий</th><th>Балл</th><th>Комментарий</th></tr></thead><tbody>${C.map((c,i)=>`<tr><td>${i+1}</td><td>${c}</td><td><b>${r[`criterion_${i+1}_score`]??"—"}</b></td><td>${r[`criterion_${i+1}_note`]||"Комментарий не оставлен"}</td></tr>`).join("")}</tbody></table></div><div class="summary"><strong>${r.total_score}/90</strong></div>`;$("modalBackdrop").classList.remove("hidden")}
$("closeModal").onclick=()=>$("modalBackdrop").classList.add("hidden");
