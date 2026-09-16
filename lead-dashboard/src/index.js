const STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads' && request.method === 'GET') return listLeads(env);
    if (url.pathname === '/api/stats' && request.method === 'GET') return getStats(env);
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
  return json({ success: true, stats: { total: total.count, today: today.count, open: open.count } });
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
:root{--ink:#111722;--blue:#334ee8;--paper:#f5f3ed;--line:#d7d5ce;--muted:#6d7280;--white:#fff}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:26px 28px 18px;border-bottom:2px solid var(--ink)}
h1{margin:0;font-size:clamp(26px,4vw,48px);letter-spacing:-.05em;line-height:.95}header p{margin:8px 0 0;color:var(--muted)}
.actions{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;font-weight:700;border:1px solid var(--ink);background:var(--white);padding:9px 12px;border-radius:7px;cursor:pointer}button.primary{background:var(--blue);color:#fff;border-color:var(--blue)}
.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--line)}.stat{padding:18px 28px;border-right:1px solid var(--line)}.stat:last-child{border-right:0}.stat b{display:block;font-size:28px;letter-spacing:-.04em}.stat span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.filters{display:flex;gap:10px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:3}.filters input,.filters select{border:1px solid var(--line);background:#fff;padding:9px 10px;border-radius:6px;font:inherit}.filters input{min-width:260px;flex:1}
.table-wrap{overflow:auto}.lead-table{width:100%;border-collapse:collapse;min-width:1480px;background:#fff}.lead-table th{position:sticky;top:59px;z-index:2;background:#eceae4;text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:11px;text-transform:uppercase;letter-spacing:.07em}.lead-table td{padding:12px;border-bottom:1px solid #e8e6df;vertical-align:top}.lead-table tr:hover td{background:#faf9f5}
.name{font-weight:800}.contact a{display:block;color:var(--blue);text-decoration:none}.small{font-size:12px;color:var(--muted)}.question{color:var(--muted);font-size:11px;font-weight:800;letter-spacing:.02em;margin-bottom:4px}.answer{font-weight:700;max-width:280px;white-space:normal}.status,.notes{width:100%;border:1px solid var(--line);border-radius:5px;padding:7px;font:inherit}.notes{min-height:64px;resize:vertical}.save{margin-top:6px;padding:6px 9px}.empty{padding:60px 28px;text-align:center;color:var(--muted)}.flash{position:fixed;right:20px;bottom:20px;background:var(--ink);color:#fff;padding:10px 14px;border-radius:7px;display:none}
@media(max-width:700px){header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr}.stat{border-right:0;border-bottom:1px solid var(--line)}.filters{position:static;flex-direction:column}.filters input{min-width:0}.lead-table th{top:0}}
</style></head><body>
<header><div><h1>UFYT Lead Desk</h1><p>Lead spreadsheet · newest first</p></div><div class="actions"><button id="refresh">Refresh</button><button class="primary" id="csv">Download CSV</button></div></header>
<section class="stats"><div class="stat"><b id="total">—</b><span>Total leads</span></div><div class="stat"><b id="today">—</b><span>Today</span></div><div class="stat"><b id="open">—</b><span>Open</span></div></section>
<div class="filters"><input id="search" type="search" placeholder="Search name, email, phone or submitted answers"><select id="statusFilter"><option value="">All statuses</option><option>new</option><option>contacted</option><option>qualified</option><option>proposal_sent</option><option>won</option><option>lost</option></select></div>
<div class="table-wrap"><table class="lead-table"><thead><tr><th>Submitted</th><th>First name</th><th>Last name</th><th>Email</th><th>Phone</th><th>Tax problem</th><th>Follow-up 1</th><th>Follow-up 2</th><th>Status & notes</th></tr></thead><tbody id="rows"></tbody></table><div class="empty" id="empty" hidden>No leads match this view.</div></div><div class="flash" id="flash"></div>
<script>
const statuses=${JSON.stringify(STATUSES)};let leads=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function payload(lead){try{return JSON.parse(lead.payload_json||'{}')}catch{return {}}}
const followUpFields=[['debt_amount','Approximately how much do you owe?'],['collection_actions','Have you received any of the following?'],['unfiled_years','How many years are unfiled?'],['self_employed','Are you self-employed?'],['notice_type','What type of notice did you receive?'],['notice_deadline','What is the deadline listed on the notice?'],['filing_status','Are you filing as:'],['refund_expectation','Do you expect to owe or receive a refund?'],['unsure_situation','Which of these sounds closest to your situation?'],['urgency','Is anything urgent?'],['amount_owed','Amount owed'],['details','Additional details']];
function value(v){return Array.isArray(v)?v.join(', '):String(v??'')}
function hasValue(v){return v!==null&&v!==undefined&&value(v).trim()!==''}
function names(lead){const p=payload(lead);if(p.first_name||p.last_name)return{first:p.first_name||'',last:p.last_name||''};const parts=String(lead.name||'').trim().split(/\s+/);return{first:parts.shift()||'',last:parts.join(' ')}}
function taxProblem(lead){const p=payload(lead);return p.tax_problem||p.problem||lead.problem||'Not provided'}
function followUps(lead){const p=payload(lead);return followUpFields.filter(([key])=>hasValue(p[key])).map(([key,label])=>({question:label,answer:value(p[key])})).slice(0,2)}
function answerCell(item){return item?'<div class="question">'+esc(item.question)+'</div><div class="answer">'+esc(item.answer)+'</div>':'<span class="small">Not asked</span>'}
function searchable(lead){const n=names(lead);return[n.first,n.last,lead.email,lead.phone,taxProblem(lead),...followUps(lead).flatMap(x=>[x.question,x.answer])].join(' ').toLowerCase()}
function render(){const q=document.querySelector('#search').value.toLowerCase();const status=document.querySelector('#statusFilter').value;const filtered=leads.filter(l=>(!status||l.status===status)&&(!q||searchable(l).includes(q)));const rows=document.querySelector('#rows');rows.innerHTML='';document.querySelector('#empty').hidden=filtered.length>0;for(const l of filtered){const tr=document.createElement('tr');const n=names(l);const answers=followUps(l);const statusOptions=statuses.map(s=>'<option '+(s===l.status?'selected':'')+'>'+esc(s)+'</option>').join('');tr.innerHTML='<td><b>'+esc(new Date(l.created_at+'Z').toLocaleDateString())+'</b><div class="small">'+esc(new Date(l.created_at+'Z').toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'</div><div class="small">#'+l.id+'</div></td><td><div class="name">'+esc(n.first||'—')+'</div></td><td><div class="name">'+esc(n.last||'—')+'</div></td><td class="contact"><a href="mailto:'+encodeURIComponent(l.email)+'">'+esc(l.email)+'</a></td><td class="contact"><a href="tel:'+encodeURIComponent(l.phone||'')+'">'+esc(l.phone||'No phone')+'</a></td><td><div class="question">What’s going on with your taxes?</div><div class="answer">'+esc(taxProblem(l))+'</div></td><td>'+answerCell(answers[0])+'</td><td>'+answerCell(answers[1])+'</td><td><select class="status">'+statusOptions+'</select><textarea class="notes" placeholder="Sales notes">'+esc(l.notes||'')+'</textarea><button class="save" data-id="'+l.id+'">Save</button></td>';rows.appendChild(tr)}document.querySelector('#csv').onclick=()=>downloadCsv(filtered)}
async function load(){const [leadRes,statRes]=await Promise.all([fetch('/api/leads'),fetch('/api/stats')]);if(!leadRes.ok)throw new Error('Could not load leads');leads=(await leadRes.json()).leads;const stats=(await statRes.json()).stats;for(const k of ['total','today','open'])document.querySelector('#'+k).textContent=stats[k];render()}
document.addEventListener('click',async e=>{if(e.target.matches('.save')){const cell=e.target.closest('td');e.target.disabled=true;const res=await fetch('/api/leads/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:Number(e.target.dataset.id),status:cell.querySelector('.status').value,notes:cell.querySelector('.notes').value})});e.target.disabled=false;flash(res.ok?'Saved':'Save failed');if(res.ok)await load()}});
function downloadCsv(rows){const cols=['submitted','first_name','last_name','email','phone','tax_problem','follow_up_1_question','follow_up_1_answer','follow_up_2_question','follow_up_2_answer','status','sales_notes'];const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const records=rows.map(l=>{const n=names(l);const a=followUps(l);return[l.created_at,n.first,n.last,l.email,l.phone,taxProblem(l),a[0]?.question,a[0]?.answer,a[1]?.question,a[1]?.answer,l.status,l.notes]});const csv=[cols.join(','),...records.map(row=>row.map(quote).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='ufyt-sales-leads-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href)}
function flash(message){const el=document.querySelector('#flash');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',1800)}
document.querySelector('#search').addEventListener('input',render);document.querySelector('#statusFilter').addEventListener('change',render);document.querySelector('#refresh').addEventListener('click',load);load().catch(e=>{document.querySelector('#empty').hidden=false;document.querySelector('#empty').textContent=e.message});
</script></body></html>`;
