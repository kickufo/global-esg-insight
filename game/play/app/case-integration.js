const FEED_URL='https://global-esg-insight.pages.dev/data/cases-feed.json';
const severityRank={S4:4,S3:3,S2:2,S1:1};
let feed=null;

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const asArray=value=>Array.isArray(value)?value:[];

function trackedUrl(raw,params){
  try{
    const url=new URL(raw);
    new URLSearchParams(params||'utm_source=game&utm_medium=referral').forEach((value,key)=>url.searchParams.set(key,value));
    return url.href;
  }catch{return raw||'#'}
}

function matchingCases(issueIds,limit=3){
  const wanted=new Set(asArray(issueIds));
  if(!feed||!wanted.size)return[];
  return asArray(feed.cases).map(item=>{
    const overlap=asArray(item.issues).filter(id=>wanted.has(id)).length;
    if(!overlap)return null;
    const score=overlap*100+(asArray(item.countries).includes('DE')?24:0)+(asArray(item.regions).includes('eu')?12:0)+(asArray(item.industries).some(x=>String(x).startsWith('manufacturing'))?6:0)+(severityRank[item.severity]||0);
    return{item,score,time:Date.parse(item.date)||0};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||b.time-a.time).slice(0,limit).map(x=>x.item);
}

function caseCard(item){
  return`<a class="real-case" href="${escapeHtml(trackedUrl(item.url,feed?.link_params))}" target="_blank" rel="noopener noreferrer"><div><b>${escapeHtml(item.company||'相关企业')}</b><span>${escapeHtml(item.date||'日期未注明')} · ${escapeHtml(item.severity||'未分级')}</span></div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.summary||'')}</p></a>`;
}

export function caseSectionShell(issueIds){
  const ids=[...new Set(asArray(issueIds))];
  if(!ids.length)return'';
  return`<section class="real-cases hidden" data-case-issues="${escapeHtml(ids.join(','))}"></section>`;
}

export function hydrateCaseBlocks(root=document){
  root.querySelectorAll?.('[data-case-issues]').forEach(block=>{
    const matches=matchingCases((block.dataset.caseIssues||'').split(',').filter(Boolean));
    if(!matches.length){block.classList.add('hidden');block.innerHTML='';return}
    block.innerHTML=`<header><div><span>REAL-WORLD SIGNALS</span><h3>现实中的类似案例</h3></div><small>来自全球 ESG 案例库</small></header><div class="real-case-grid">${matches.map(caseCard).join('')}</div><p class="case-disclaimer">案例依据公开报道整理，涉及的指控与调查以有关机构的最终结论为准。</p>`;
    block.classList.remove('hidden');
  });
}

fetch(FEED_URL,{headers:{Accept:'application/json'}}).then(response=>{
  if(!response.ok)throw new Error(`案例数据请求失败：${response.status}`);
  return response.json();
}).then(data=>{feed=data;hydrateCaseBlocks()}).catch(error=>console.warn('真实案例暂不可用',error));
