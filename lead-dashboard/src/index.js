const STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads' && request.method === 'GET') return listLeads(env);
    if (url.pathname === '/api/stats' && request.method === 'GET') return getStats(env);
    if (url.pathname === '/api/calls' && request.method === 'GET') return listCalls(env);
    if (url.pathname === '/api/leads/update' && request.method === 'POST') return updateLead(request, env);
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    if (url.pathname !== '/') return new Response('Not found', { status: 404 });

    return new Response(DASHBOARD_HTML, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'X-Frame-Options': 'DENY',
      },
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function listLeads(env) {
  const result = await env.DB.prepare(
    `SELECT id, name, email, phone, problem, selected_issues, status,
      notes, payload_json, created_at, updated_at
     FROM leads WHERE source = 'taxes' ORDER BY created_at DESC LIMIT 500`
  ).all();
  return json({ success: true, leads: result.results });
}

async function getStats(env) {
  const total = await env.DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE source = 'taxes'").first();
  const today = await env.DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE source = 'taxes' AND DATE(created_at) = DATE('now')").first();
  const open = await env.DB.prepare("SELECT COUNT(*) AS count FROM leads WHERE source = 'taxes' AND status NOT IN ('won', 'lost')").first();
  let missedCalls = 0;
  try {
    const missed = await env.DB.prepare("SELECT COUNT(*) AS count FROM calls WHERE brand = 'ufyt' AND DATE(started_at) = DATE('now') AND answered = 0 AND ended_at IS NOT NULL").first();
    missedCalls = missed.count;
  } catch (error) {
    // The calls table arrives with the call-tracking migration; keep the desk working before it lands.
    console.error('Missed call stat error:', error.message);
  }
  return json({ success: true, stats: { total: total.count, today: today.count, open: open.count, missed_calls_today: missedCalls } });
}

async function listCalls(env) {
  try {
    const result = await env.DB.prepare(
      `SELECT c.id, c.call_sid, c.source, c.caller, c.caller_name, c.caller_city, c.caller_state,
        c.status, c.dial_status, c.answered, c.duration_seconds, c.recording_url,
        c.lead_id, c.lead_created, c.started_at, c.ended_at, l.name AS lead_name
       FROM calls c LEFT JOIN leads l ON l.id = c.lead_id
       WHERE c.brand = 'ufyt' ORDER BY c.started_at DESC LIMIT 300`
    ).all();
    return json({ success: true, calls: result.results });
  } catch (error) {
    console.error('List calls error:', error.message);
    return json({ success: true, calls: [], unavailable: true });
  }
}

async function updateLead(request, env) {
  let data;
  try { data = await request.json(); } catch { return json({ success: false, error: 'Invalid JSON' }, 400); }
  const id = Number(data.id);
  if (!Number.isInteger(id) || id < 1) return json({ success: false, error: 'Invalid lead ID' }, 400);
  if (!STATUSES.includes(data.status)) return json({ success: false, error: 'Invalid status' }, 400);
  const notes = typeof data.notes === 'string' ? data.notes.slice(0, 10000) : '';

  await env.DB.prepare(
    "UPDATE leads SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ? AND source = 'taxes'"
  ).bind(data.status, notes, id).run();
  await env.DB.prepare(
    "INSERT INTO activity_log (lead_id, activity_type, description) VALUES (?, 'dashboard_update', ?)"
  ).bind(id, `Status: ${data.status}`).run();
  return json({ success: true });
}

const DASHBOARD_HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>UFYT Lead Desk</title>
<style>
:root{--ink:#111722;--blue:#334ee8;--paper:#f5f3ed;--line:#d7d5ce;--muted:#6d7280;--white:#fff;--dark:#11100e;--accent:#ef5a46}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}
.crm-bar{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:10px 20px;color:#ece9e2;background:var(--dark);border-bottom:1px solid #302e2a}.crm-brand{display:flex;align-items:center;gap:10px}.crm-mark{display:grid;width:32px;height:32px;place-items:center;border-radius:9px;color:var(--dark);background:var(--accent);font-weight:900;letter-spacing:-.08em}.crm-brand div{display:flex;flex-direction:column}.crm-brand strong{font-size:13px}.crm-brand small{margin-top:1px;color:#858077;font-size:9px;text-transform:uppercase;letter-spacing:.12em}.crm-nav{display:flex;gap:4px;padding:4px;border:1px solid #302e2a;border-radius:10px;background:#1a1917}.crm-nav a{display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:7px;color:#99938a;font-size:11px;font-weight:750;text-decoration:none}.crm-nav a:hover{color:#f8f5ef;background:#24221f}.crm-nav a.active{color:#fff;background:#2b2925;box-shadow:inset 0 -2px var(--accent)}
.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:26px 28px 18px;border-bottom:2px solid var(--ink)}
h1{margin:0;font-size:clamp(26px,4vw,48px);letter-spacing:-.05em;line-height:.95}.page-header p{margin:8px 0 0;color:var(--muted)}
.actions{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;font-weight:700;border:1px solid var(--ink);background:var(--white);padding:9px 12px;border-radius:7px;cursor:pointer}button.primary{background:var(--blue);color:#fff;border-color:var(--blue)}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid var(--line)}.stat{padding:18px 28px;border-right:1px solid var(--line)}.stat:last-child{border-right:0}.stat b{display:block;font-size:28px;letter-spacing:-.04em}.stat span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.filters{display:flex;gap:10px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--line)}.filters input,.filters select{border:1px solid var(--line);background:#fff;padding:9px 10px;border-radius:4px;font:inherit}.filters input{min-width:260px;flex:1}
.table-wrap{overflow:auto;max-height:65vh;background:#fff;border-bottom:1px solid var(--line)}.lead-table{width:100%;border-collapse:separate;border-spacing:0;min-width:2180px;background:#fff}.lead-table th{position:sticky;top:0;z-index:4;background:#e9e8e3;text-align:left;padding:9px 10px;border-right:1px solid #d2d0c9;border-bottom:2px solid #aaa79e;font-size:11px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.lead-table td{padding:9px 10px;border-right:1px solid #e1dfd9;border-bottom:1px solid #e1dfd9;vertical-align:top;background:#fff}.lead-table tbody tr:nth-child(even) td{background:#fafafa}.lead-table tr:hover td{background:#f4f6ff}.lead-table th:last-child,.lead-table td:last-child{border-right:0}
.section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:22px 28px 12px;border-bottom:2px solid var(--ink);background:var(--paper)}.section-head h2{margin:0;font-size:clamp(20px,3vw,30px);letter-spacing:-.04em;line-height:1}.section-head p{margin:6px 0 0;color:var(--muted)}.call-table{min-width:1180px}.pill{display:inline-block;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.05em;background:#e9e8e3;color:#3c4048}.pill.missed{background:#fde4df;color:#a12b1a}.pill.answered{background:#dff1e4;color:#1d6b3a}.pill.live{background:#e3e8ff;color:#2b3fb8}.name{font-weight:700}.contact a{display:block;color:var(--blue);text-decoration:none}.small{font-size:12px;color:var(--muted)}.status,.notes{width:100%;border:1px solid #c9c7c0;border-radius:3px;padding:6px;font:inherit;background:#fff}.status{min-width:125px}.notes{width:220px;min-height:54px;resize:vertical}.save{padding:6px 9px}.empty{padding:60px 28px;text-align:center;color:var(--muted)}.flash{position:fixed;right:20px;bottom:20px;background:var(--ink);color:#fff;padding:10px 14px;border-radius:7px;display:none}
@media(max-width:700px){.crm-bar{align-items:flex-start;flex-direction:column;gap:10px}.crm-nav{width:100%}.crm-nav a{flex:1;justify-content:center}.page-header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr}.stat{border-right:0;border-bottom:1px solid var(--line)}.filters{flex-direction:column}.filters input{min-width:0}.table-wrap{max-height:70vh}}
</style></head><body>
<nav class="crm-bar" aria-label="UFYT CRM"><div class="crm-brand"><span class="crm-mark">U/</span><div><strong>UFYT CRM</strong><small>Fortifi LLC</small></div></div><div class="crm-nav"><a class="active" href="/" aria-current="page">Leads</a><a href="https://inbox.ufyt.dev/">Inbox</a></div></nav>
<header class="page-header"><div><h1>UFYT Lead Desk</h1><p>Lead spreadsheet · newest first</p></div><div class="actions"><button id="refresh">Refresh</button><button class="primary" id="csv">Download CSV</button></div></header>
<section class="stats"><div class="stat"><b id="total">—</b><span>Total leads</span></div><div class="stat"><b id="today">—</b><span>Today</span></div><div class="stat"><b id="open">—</b><span>Open</span></div><div class="stat"><b id="missedCalls">—</b><span>Missed calls today</span></div></section>
<div class="filters"><input id="search" type="search" placeholder="Search name, email, phone or submitted answers"><select id="statusFilter"><option value="">All statuses</option><option>new</option><option>contacted</option><option>qualified</option><option>proposal_sent</option><option>won</option><option>lost</option></select></div>
<div class="table-wrap"><table class="lead-table"><thead><tr><th>Submitted</th><th>First name</th><th>Last name</th><th>Email</th><th>Phone</th><th>Tax problem</th><th>Follow-up 1 question</th><th>Follow-up 1 answer</th><th>Follow-up 2 question</th><th>Follow-up 2 answer</th><th>Status</th><th>Sales notes</th><th>Action</th></tr></thead><tbody id="rows"></tbody></table><div class="empty" id="empty" hidden>No leads match this view.</div></div><section class="section-head" id="callsHead"><div><h2>Tracked calls</h2><p>Calls to the UFYT tracking numbers · newest first</p></div><div class="actions"><select id="callFilter"><option value="">All calls</option><option value="missed">Missed only</option><option value="email-followup">Email follow-up number</option><option value="meta-ads">Meta ads number</option></select></div></section><div class="table-wrap"><table class="lead-table call-table"><thead><tr><th>Time</th><th>Outcome</th><th>Source</th><th>Caller</th><th>Lead</th><th>Duration</th><th>Recording</th><th>Location</th></tr></thead><tbody id="callRows"></tbody></table><div class="empty" id="callsEmpty" hidden>No tracked calls yet.</div></div><div class="flash" id="flash"></div>
<script>
const statuses=${JSON.stringify(STATUSES)};let leads=[];let calls=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function payload(lead){try{return JSON.parse(lead.payload_json||'{}')}catch{return {}}}
const followUpFields=[['debt_amount','Approximately how much do you owe?'],['collection_actions','Have you received any of the following?'],['unfiled_years','How many years are unfiled?'],['self_employed','Are you self-employed?'],['notice_type','What type of notice did you receive?'],['notice_deadline','What is the deadline listed on the notice?'],['filing_status','Are you filing as:'],['refund_expectation','Do you expect to owe or receive a refund?'],['unsure_situation','Which of these sounds closest to your situation?'],['urgency','Is anything urgent?'],['amount_owed','Amount owed'],['details','Additional details']];
function value(v){return Array.isArray(v)?v.join(', '):String(v??'')}
function hasValue(v){return v!==null&&v!==undefined&&value(v).trim()!==''}
function names(lead){const p=payload(lead);if(p.first_name||p.last_name)return{first:p.first_name||'',last:p.last_name||''};const parts=String(lead.name||'').trim().split(/\s+/);return{first:parts.shift()||'',last:parts.join(' ')}}
function taxProblem(lead){const p=payload(lead);return p.tax_problem||p.problem||lead.problem||'Not provided'}
function followUps(lead){const p=payload(lead);return followUpFields.filter(([key])=>hasValue(p[key])).map(([key,label])=>({question:label,answer:value(p[key])})).slice(0,2)}
function searchable(lead){const n=names(lead);return[n.first,n.last,lead.email,lead.phone,taxProblem(lead),...followUps(lead).flatMap(x=>[x.question,x.answer])].join(' ').toLowerCase()}
function render(){const q=document.querySelector('#search').value.toLowerCase();const status=document.querySelector('#statusFilter').value;const filtered=leads.filter(l=>(!status||l.status===status)&&(!q||searchable(l).includes(q)));const rows=document.querySelector('#rows');rows.innerHTML='';document.querySelector('#empty').hidden=filtered.length>0;for(const l of filtered){const tr=document.createElement('tr');const n=names(l);const answers=followUps(l);const statusOptions=statuses.map(s=>'<option '+(s===l.status?'selected':'')+'>'+esc(s)+'</option>').join('');tr.innerHTML='<td><b>'+esc(new Date(l.created_at+'Z').toLocaleDateString())+'</b><div class="small">'+esc(new Date(l.created_at+'Z').toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'</div><div class="small">#'+l.id+'</div></td><td class="name">'+esc(n.first||'—')+'</td><td class="name">'+esc(n.last||'—')+'</td><td class="contact"><a href="mailto:'+encodeURIComponent(l.email)+'">'+esc(l.email)+'</a></td><td class="contact"><a href="tel:'+encodeURIComponent(l.phone||'')+'">'+esc(l.phone||'No phone')+'</a></td><td>'+esc(taxProblem(l))+'</td><td>'+esc(answers[0]?.question||'—')+'</td><td>'+esc(answers[0]?.answer||'—')+'</td><td>'+esc(answers[1]?.question||'—')+'</td><td>'+esc(answers[1]?.answer||'—')+'</td><td><select class="status">'+statusOptions+'</select></td><td><textarea class="notes" placeholder="Sales notes">'+esc(l.notes||'')+'</textarea></td><td><button class="save" data-id="'+l.id+'">Save</button></td>';rows.appendChild(tr)}document.querySelector('#csv').onclick=()=>downloadCsv(filtered)}
const sourceLabels={'email-followup':'Email follow-up','meta-ads':'Meta ads'};function callOutcome(c){if(!c.ended_at&&['initiated','ringing','in-progress'].includes(c.status))return{label:'In progress',cls:'live'};if(Number(c.answered)===1)return{label:'Answered',cls:'answered'};const why={'busy':'Busy','no-answer':'No answer','failed':'Failed','canceled':'Caller hung up'};return{label:'Missed · '+(why[c.dial_status]||why[c.status]||'Not answered'),cls:'missed'}}function fmtDuration(s){s=Number(s)||0;const m=Math.floor(s/60);return m?m+'m '+(s%60)+'s':s+'s'}function fmtWhen(v){const d=new Date(String(v).replace(' ','T')+'Z');return esc(d.toLocaleDateString())+'<div class="small">'+esc(d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'</div>'}function renderCalls(){const f=document.querySelector('#callFilter').value;const filtered=calls.filter(c=>!f||(f==='missed'?(Number(c.answered)===0&&c.ended_at):c.source===f));const rows=document.querySelector('#callRows');rows.innerHTML='';document.querySelector('#callsEmpty').hidden=filtered.length>0;for(const c of filtered){const o=callOutcome(c);const tr=document.createElement('tr');const caller=c.caller||'Withheld';const loc=[c.caller_city,c.caller_state].filter(Boolean).join(', ');tr.innerHTML='<td>'+fmtWhen(c.started_at)+'</td><td><span class="pill '+o.cls+'">'+esc(o.label)+'</span></td><td>'+esc(sourceLabels[c.source]||c.source)+'</td><td class="contact"><a href="tel:'+encodeURIComponent(c.caller||'')+'">'+esc(caller)+'</a>'+(c.caller_name?'<div class="small">'+esc(c.caller_name)+'</div>':'')+'</td><td>'+(c.lead_id?'<b>'+esc(c.lead_name||'Lead')+'</b><div class="small">#'+c.lead_id+(Number(c.lead_created)===1?' · new from call':'')+'</div>':'<span class="small">Not linked</span>')+'</td><td>'+esc(fmtDuration(c.duration_seconds))+'</td><td>'+(c.recording_url?'<a href="'+esc(c.recording_url)+'.mp3" target="_blank" rel="noopener">Listen</a>':'<span class="small">—</span>')+'</td><td>'+esc(loc||'—')+'</td>';rows.appendChild(tr)}}async function load(){const [leadRes,statRes,callRes]=await Promise.all([fetch('/api/leads'),fetch('/api/stats'),fetch('/api/calls')]);if(!leadRes.ok)throw new Error('Could not load leads');leads=(await leadRes.json()).leads;calls=callRes.ok?((await callRes.json()).calls||[]):[];const stats=(await statRes.json()).stats;for(const k of ['total','today','open'])document.querySelector('#'+k).textContent=stats[k];document.querySelector('#missedCalls').textContent=stats.missed_calls_today??'—';render();renderCalls()}
document.addEventListener('click',async e=>{if(e.target.matches('.save')){const row=e.target.closest('tr');e.target.disabled=true;const res=await fetch('/api/leads/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:Number(e.target.dataset.id),status:row.querySelector('.status').value,notes:row.querySelector('.notes').value})});e.target.disabled=false;flash(res.ok?'Saved':'Save failed');if(res.ok)await load()}});
function downloadCsv(rows){const cols=['submitted','first_name','last_name','email','phone','tax_problem','follow_up_1_question','follow_up_1_answer','follow_up_2_question','follow_up_2_answer','status','sales_notes'];const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const records=rows.map(l=>{const n=names(l);const a=followUps(l);return[l.created_at,n.first,n.last,l.email,l.phone,taxProblem(l),a[0]?.question,a[0]?.answer,a[1]?.question,a[1]?.answer,l.status,l.notes]});const csv=[cols.join(','),...records.map(row=>row.map(quote).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='ufyt-sales-leads-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href)}
function flash(message){const el=document.querySelector('#flash');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',1800)}
document.querySelector('#search').addEventListener('input',render);document.querySelector('#callFilter').addEventListener('change',renderCalls);document.querySelector('#statusFilter').addEventListener('change',render);document.querySelector('#refresh').addEventListener('click',load);load().catch(e=>{document.querySelector('#empty').hidden=false;document.querySelector('#empty').textContent=e.message});
</script></body></html>`;
