const repository='https://github.com/zxz0119/xiyousha-desktop';
function installerURL(value,tag){
  try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='github.com'&&!u.username&&!u.password&&!u.port&&u.pathname.startsWith(`/zxz0119/xiyousha-desktop/releases/download/${tag}/`)&&/\.exe$/i.test(u.pathname)?u.href:null;}catch{return null;}
}
export function normalizeReleases(input){
  if(!Array.isArray(input))return [];
  const seen=new Set();return input.flatMap(r=>{
    if(!r||r.draft!==false||r.prerelease!==false||!/^v?\d+\.\d+\.\d+$/.test(r.tag_name)||seen.has(r.tag_name))return [];
    seen.add(r.tag_name);
    const assets=Array.isArray(r.assets)?r.assets:[],server=a=>/^(?:xiyousha-server|西游杀开服器)/i.test(a.name),valid=a=>typeof a?.name==='string'&&/setup.*\.exe$/i.test(a.name)&&Number.isFinite(a.size)&&a.size>0&&installerURL(a.browser_download_url,r.tag_name);
    const a=assets.find(a=>valid(a)&&!server(a)),s=assets.find(a=>valid(a)&&server(a)),item=a=>a?{url:installerURL(a.browser_download_url,r.tag_name),size:a.size}:null;
    return [{tag:r.tag_name,date:Number.isFinite(Date.parse(r.published_at))?r.published_at:null,body:typeof r.body==='string'?r.body.slice(0,100000):'',url:`${repository}/releases/tag/${r.tag_name}`,installer:item(a),serverInstaller:item(s)}];
  }).sort((a,b)=>{const x=a.tag.replace(/^v/,'').split('.').map(Number),y=b.tag.replace(/^v/,'').split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return y[i]-x[i];return 0;});
}
