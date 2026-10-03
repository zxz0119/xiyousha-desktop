import {normalizeReleases} from './releases.mjs';
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
function date(value){return value?new Date(value).toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}):'历史版本';}
function revealHash(){if(!location.hash.startsWith('#release-'))return;const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target){target.open=true;target.scrollIntoView({block:'start'});}}
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
    actions.append(link('夸克各版本 ↗',quark,'button'),link('GitHub 发布页 ↗',release.url,'button'));
    const permalink=el('a','本版直达链接','button');permalink.href='#'+card.id;actions.append(permalink);
    content.append(actions);card.append(content);list.append(card);
  });
  const latest=releases[0];$('#latest-version').textContent=latest.tag+' · 正式版';$('#latest-size').textContent=latest.installer?`约 ${(latest.installer.size/1024/1024).toFixed(1)} MiB`:'';
  $('#latest-download').href=latest.installer?.url??latest.url;$('#latest-notes').href='#release-'+latest.tag;
  revealHash();return true;
}
async function json(url){const response=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{Accept:'application/json'}});if(!response.ok)throw new Error('request failed');return response.json();}
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
window.addEventListener('hashchange',revealHash);
updates();
