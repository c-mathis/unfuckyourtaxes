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
    `SELECT id, name, email, phone, problem, selected_issues, status, priority,
      notes, next_action, next_action_date, utm_source, utm_medium, utm_campaign,
      utm_content, referrer, landing_page, brand, surface, event_id, triage_score,
      payload_json, created_at, updated_at
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
.table-wrap{overflow:auto}.lead-table{width:100%;border-collapse:collapse;min-width:1180px;background:#fff}.lead-table th{position:sticky;top:59px;z-index:2;background:#eceae4;text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);font-size:11px;text-transform:uppercase;letter-spacing:.07em}.lead-table td{padding:12px;border-bottom:1px solid #e8e6df;vertical-align:top}.lead-table tr:hover td{background:#faf9f5}
.name{font-weight:800}.contact a{display:block;color:var(--blue);text-decoration:none}.small{font-size:12px;color:var(--muted)}.score{display:inline-block;min-width:30px;text-align:center;padding:3px 7px;border-radius:999px;background:#edf0ff;color:#233ac5;font-weight:800}
details{max-width:330px}summary{cursor:pointer;font-weight:700}pre{white-space:pre-wrap;font:12px/1.45 ui-monospace,SFMono-Regular,monospace;background:#f4f3ef;padding:10px;border-radius:5px;max-height:260px;overflow:auto}.status,.notes{width:100%;border:1px solid var(--line);border-radius:5px;padding:7px;font:inherit}.notes{min-height:64px;resize:vertical}.save{margin-top:6px;padding:6px 9px}.empty{padding:60px 28px;text-align:center;color:var(--muted)}.flash{position:fixed;right:20px;bottom:20px;background:var(--ink);color:#fff;padding:10px 14px;border-radius:7px;display:none}
@media(max-width:700px){header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:1fr}.stat{border-right:0;border-bottom:1px solid var(--line)}.filters{position:static;flex-direction:column}.filters input{min-width:0}.lead-table th{top:0}}
</style></head><body>
<header><div><h1>UFYT Lead Desk</h1><p>Lead spreadsheet · newest first</p></div><div class="actions"><button id="refresh">Refresh</button><button class="primary" id="csv">Download CSV</button></div></header>
<section class="stats"><div class="stat"><b id="total">—</b><span>Total leads</span></div><div class="stat"><b id="today">—</b><span>Today</span></div><div class="stat"><b id="open">—</b><span>Open</span></div></section>
<div class="filters"><input id="search" type="search" placeholder="Search name, email, phone, problem or campaign"><select id="statusFilter"><option value="">All statuses</option><option>new</option><option>contacted</option><option>qualified</option><option>proposal_sent</option><option>won</option><option>lost</option></select></div>
<div class="table-wrap"><table class="lead-table"><thead><tr><th>Date</th><th>Lead</th><th>Contact</th><th>Situation</th><th>Score</th><th>Campaign</th><th>Status & notes</th></tr></thead><tbody id="rows"></tbody></table><div class="empty" id="empty" hidden>No leads match this view.</div></div><div class="flash" id="flash"></div>
<script>
const statuses=${JSON.stringify(STATUSES)};let leads=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function payload(lead){try{return JSON.parse(lead.payload_json||'{}')}catch{return {}}}
function situation(lead){const p=payload(lead);const pairs=[['Problem',p.tax_problem],['Amount',p.debt_amount],['Collections',p.collection_actions],['Unfiled',p.unfiled_years],['Self-employed',p.self_employed],['Notice',p.notice_type],['Deadline',p.notice_deadline],['Filing',p.filing_status],['Expected',p.refund_expectation],['Closest',p.unsure_situation]].filter(x=>x[1]);return pairs.length?pairs.map(x=>x[0]+': '+(Array.isArray(x[1])?x[1].join(', '):x[1])).join('\n'):(lead.problem||lead.selected_issues||'Not provided')}
function campaign(lead){return [lead.utm_source,lead.utm_campaign,lead.utm_content].filter(Boolean).join(' / ')||'Direct / unknown'}
function render(){const q=document.querySelector('#search').value.toLowerCase();const status=document.querySelector('#statusFilter').value;const filtered=leads.filter(l=>(!status||l.status===status)&&(!q||[l.name,l.email,l.phone,situation(l),campaign(l)].join(' ').toLowerCase().includes(q)));const rows=document.querySelector('#rows');rows.innerHTML='';document.querySelector('#empty').hidden=filtered.length>0;for(const l of filtered){const tr=document.createElement('tr');const statusOptions=statuses.map(s=>'<option '+(s===l.status?'selected':'')+'>'+esc(s)+'</option>').join('');tr.innerHTML='<td><b>'+esc(new Date(l.created_at+'Z').toLocaleDateString())+'</b><div class="small">'+esc(new Date(l.created_at+'Z').toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))+'</div><div class="small">#'+l.id+'</div></td><td><div class="name">'+esc(l.name)+'</div><div class="small">'+esc(payload(l).surface||l.surface||'form')+'</div></td><td class="contact"><a href="mailto:'+encodeURIComponent(l.email)+'">'+esc(l.email)+'</a><a href="tel:'+encodeURIComponent(l.phone||'')+'">'+esc(l.phone||'No phone')+'</a></td><td><details><summary>View answers</summary><pre>'+esc(situation(l))+'</pre></details></td><td><span class="score">'+esc(l.triage_score||0)+'</span></td><td>'+esc(campaign(l))+'<div class="small">'+esc(l.landing_page||'')+'</div></td><td><select class="status">'+statusOptions+'</select><textarea class="notes" placeholder="Notes">'+esc(l.notes||'')+'</textarea><button class="save" data-id="'+l.id+'">Save</button></td>';rows.appendChild(tr)}document.querySelector('#csv').onclick=()=>downloadCsv(filtered)}
async function load(){const [leadRes,statRes]=await Promise.all([fetch('/api/leads'),fetch('/api/stats')]);if(!leadRes.ok)throw new Error('Could not load leads');leads=(await leadRes.json()).leads;const stats=(await statRes.json()).stats;for(const k of ['total','today','open'])document.querySelector('#'+k).textContent=stats[k];render()}
document.addEventListener('click',async e=>{if(e.target.matches('.save')){const cell=e.target.closest('td');e.target.disabled=true;const res=await fetch('/api/leads/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:Number(e.target.dataset.id),status:cell.querySelector('.status').value,notes:cell.querySelector('.notes').value})});e.target.disabled=false;flash(res.ok?'Saved':'Save failed');if(res.ok)await load()}});
function downloadCsv(rows){const cols=['id','created_at','name','email','phone','status','triage_score','situation','utm_source','utm_medium','utm_campaign','utm_content','landing_page','notes'];const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv=[cols.join(','),...rows.map(l=>cols.map(c=>quote(c==='situation'?situation(l):l[c])).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='ufyt-leads-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(a.href)}
function flash(message){const el=document.querySelector('#flash');el.textContent=message;el.style.display='block';setTimeout(()=>el.style.display='none',1800)}
document.querySelector('#search').addEventListener('input',render);document.querySelector('#statusFilter').addEventListener('change',render);document.querySelector('#refresh').addEventListener('click',load);load().catch(e=>{document.querySelector('#empty').hidden=false;document.querySelector('#empty').textContent=e.message});
</script></body></html>`;
