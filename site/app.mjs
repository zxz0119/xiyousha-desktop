import {normalizeReleases} from './releases.mjs?v=20261011-rights-final';
const repo='https://github.com/zxz0119/xiyousha-desktop',api='https://api.github.com/repos/zxz0119/xiyousha-desktop/releases';
const quark='https://pan.quark.cn/s/7b98d60e6ce2?pwd=Jd1Z';
const $=s=>document.querySelector(s);
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function link(text,url,className){const a=el('a',text,className);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function inline(parent,text){
  const pattern=/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;let start=0;
  for(const m of text.matchAll(pattern)){
    parent.append(document.createTextNode(text.slice(start,m.index)));
    if(m[1]){try{const u=new URL(m[2]);if(u.protocol==='https:'&&!u.username&&!u.password)parent.append(link(m[1],u.href));else parent.append(document.createTextNode(m[1]));}catch{parent.append(document.createTextNode(m[1]));}}
    else parent.append(el(m[3]?'strong':'code',m[3]??m[4]));start=m.index+m[0].length;
  }parent.append(document.createTextNode(text.slice(start)));
}
function notes(body){
  const box=el('div',undefined,'release-notes');let list=null,fence=null;
  for(const raw of (body||'此版本暂未附带更新说明，可前往发布页查看。').split(/\r?\n/)){
    const line=raw.trim();if(line.startsWith('```')){if(fence)fence=null;else{fence=el('pre','');box.append(fence);}continue;}
    if(fence){fence.append(document.createTextNode(raw+'\n'));continue;}
    if(!line){list=null;continue;}
    const heading=line.match(/^#{1,6}\s+(.*)/),bullet=line.match(/^[-*]\s+(.*)/),ordered=line.match(/^\d+[.)]\s+(.*)/);
    if(bullet||ordered){const tag=bullet?'UL':'OL';if(!list||list.tagName!==tag){list=el(tag.toLowerCase());box.append(list);}const li=el('li');inline(li,(bullet??ordered)[1]);list.append(li);}
    else{list=null;const p=el(heading?'h4':'p');inline(p,heading?heading[1]:line);box.append(p);}
  }return box;
}
function date(value){
  if(!value)return '历史版本';
  const parts=Object.fromEntries(new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).filter(part=>part.type!=='literal').map(({type,value:part})=>[type,part]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
function revealHash(){if(!location.hash.startsWith('#release-')&&!location.hash.startsWith('#mobile-release-'))return;const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){target.open=true;target.scrollIntoView({block:'start'});}}
function render(input){
  const releases=normalizeReleases(input);if(!releases.length)return false;
  const list=$('#release-list');list.replaceChildren();
  releases.forEach((release,index)=>{
    const card=el('details',undefined,'release-card');card.id='release-'+release.tag;
    const summary=el('summary'),title=el('span',undefined,'release-title');title.append(el('strong',release.tag));if(index===0)title.append(el('span','最新正式版','latest-badge'));
    summary.append(title,el('span',date(release.date),'release-date'));card.append(summary);
    const content=el('div',undefined,'release-content');content.append(notes(release.body));
    const actions=el('div',undefined,'release-actions');
    if(release.installer)actions.append(link('下载此版安装包 ↓',release.installer.url,'button button-primary'));
    if(release.serverInstaller)actions.append(link('下载此版开服器 ↓',release.serverInstaller.url,'button'));
    actions.append(link('夸克备用下载 ↗',quark,'button'),link('GitHub 发布页 ↗',release.url,'button'));
    const permalink=el('a','本版直达链接','button');permalink.href='#'+card.id;actions.append(permalink);
    content.append(actions);card.append(content);list.append(card);
  });
  const latest=releases[0];$('#latest-version').textContent=latest.tag+' · 正式版';$('#latest-size').textContent=latest.installer?`约 ${(latest.installer.size/1024/1024).toFixed(1)} MiB`:'';
  $('#latest-download').href=latest.installer?.url??latest.url;$('#latest-notes').href='#release-'+latest.tag;
  if(latest.serverInstaller&&$('#latest-server-download')){$('#latest-server-download').href=latest.serverInstaller.url;$('#latest-server-download').textContent='下载开服器 '+latest.tag+' ↓';}
  revealHash();return true;
}
async function json(url){const response=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('request failed');return response.json();}
async function repositoryStats(){
  const issueQuery=new URLSearchParams({q:'repo:zxz0119/xiyousha-desktop is:issue is:open',per_page:'1'});
  const sources=[
    {id:'stars',label:'Stars',url:'https://api.github.com/repos/zxz0119/xiyousha-desktop',count:data=>data.stargazers_count},
    {id:'issues',label:'未关闭Issues（不含Pull Request）',url:'https://api.github.com/search/issues?'+issueQuery,count:data=>data.incomplete_results===false?data.total_count:undefined}
  ];
  await Promise.all(sources.map(async source=>{
    const counter=$('#github-'+source.id+'-count'),entry=$('#github-'+source.id);
    try{
      const count=source.count(await json(source.url));
      if(!Number.isSafeInteger(count)||count<0)throw new Error('invalid repository count');
      counter.textContent=count.toLocaleString('zh-CN');entry.title=source.label+'：'+count;
    }catch{counter.textContent='查看';entry.title='暂时无法读取'+source.label+'，点击前往GitHub查看';}
  }));
}
function startMobileReleaseCountdown(){
  const panel=$('#mobile-panel'),upcoming=$('#mobile-release-upcoming'),download=$('#mobile-release-download'),pending=$('#mobile-release-pending');
  const releaseAt=Date.parse('2026-10-07T17:00:00+08:00'),ready=panel.dataset.downloadReady==='true';
  const update=()=>{
    let remaining=releaseAt-Date.now();
    if(remaining<=0){
      upcoming.hidden=true;download.hidden=!ready;pending.hidden=ready;
      if(ready){$('#mobile-quark-download').href=quark;$('#tab-mobile small').textContent='0.12.0';
        const published=panel.dataset.publishedAt;
        if(published&&Number.isFinite(Date.parse(published))){const stamp=$('[data-mobile-publication]');stamp.dateTime=published;stamp.textContent=date(published);}
      }
      return false;
    }
    const days=Math.floor(remaining/86400000);remaining%=86400000;
    const hours=Math.floor(remaining/3600000);remaining%=3600000;
    const minutes=Math.floor(remaining/60000);const seconds=Math.floor(remaining/1000)%60;
    $('#mobile-countdown-days').textContent=String(days).padStart(2,'0');
    $('#mobile-countdown-hours').textContent=String(hours).padStart(2,'0');
    $('#mobile-countdown-minutes').textContent=String(minutes).padStart(2,'0');
    $('#mobile-countdown-seconds').textContent=String(seconds).padStart(2,'0');
    return true;
  };
  if(update()){const timer=window.setInterval(()=>{if(!update())window.clearInterval(timer);},1000);}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  window.addEventListener('pageshow',update);
}
async function updates(){
  let available=false;
  try{available=render(await json(new URL('releases.json',import.meta.url)));if(available)$('#release-status').textContent='已加载发布记录，正在检查最新变化…';}catch{}
  try{
    const live=await json(api+'?per_page=100');if(!render(live))throw new Error('no releases');
    $('#release-status').textContent='更新内容同步自 GitHub 正式发布。';
  }catch{$('#release-status').textContent=available?'暂时无法刷新，当前显示已保存的发布记录。':'暂时无法读取更新记录，请通过下方 GitHub 发布页查看。';}
}
document.addEventListener('click',async event=>{
  const shot=event.target.closest('[data-image]');if(shot){$('#image-title').textContent=shot.dataset.title;$('#large-image').src=shot.dataset.image;$('#large-image').alt=shot.dataset.title;$('#original-image').href=shot.dataset.image;$('#image-dialog').showModal();}
});
$('#close-image').addEventListener('click',()=>$('#image-dialog').close());
$('#image-dialog').addEventListener('click',event=>{if(event.target===$('#image-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
function selectPlatform(platform){
  $('#platform-features').href=platform==='mobile'?'#mobile-features':'#features';
  $('#platform-updates').href=platform==='mobile'?'#mobile-updates':'#updates';
  for(const name of ['desktop','mobile']){
    const active=name===platform,tab=$('#tab-'+name);
    tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
    $('#'+name+'-panel').hidden=!active;
  }
}
function platformRoute(){
  const hash=location.hash;
  if(hash==='#mobile'||hash.startsWith('#mobile-')){selectPlatform('mobile');if(hash==='#mobile')window.scrollTo({top:0,left:0,behavior:'instant'});else document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'});}
  else if(['','#desktop','#features','#updates','#server','#preview-0125'].includes(hash)||hash.startsWith('#release-')){
    const switched=$('#desktop-panel').hidden;selectPlatform('desktop');
    if(hash==='#desktop'||hash==='')window.scrollTo({top:0,left:0,behavior:'instant'});
    else if(switched&&['#features','#updates','#server','#preview-0125'].includes(hash))document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'});
  }
  revealHash();
}
document.querySelector('[role="tablist"]').addEventListener('click',event=>{
  const tab=event.target.closest('[data-platform]');if(!tab)return;
  selectPlatform(tab.dataset.platform);location.hash=tab.dataset.platform;window.scrollTo({top:0,left:0,behavior:'instant'});
});
document.querySelector('[role="tablist"]').addEventListener('keydown',event=>{
  const tabs=[...document.querySelectorAll('[data-platform]')],index=tabs.indexOf(event.target);
  if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?1:(index+(event.key==='ArrowRight'?1:-1)+2)%2;
  tabs[next].click();tabs[next].focus();
});
window.addEventListener('hashchange',platformRoute);
window.addEventListener('load',platformRoute,{once:true});
const headerObserver=new ResizeObserver(([entry])=>{document.documentElement.style.scrollPaddingTop=`${entry.target.getBoundingClientRect().height+16}px`;});
headerObserver.observe($('.site-header'));
platformRoute();
updates();
repositoryStats();
startMobileReleaseCountdown();
