// HCP Attachment Export Tool
// Licensed for single-use. Unauthorized redistribution is prohibited.

(async function() {
  "use strict";

  // ===== LICENSE CONFIGURATION (replaced at build time) =====
  const __LICENSE__ = {
    company: "Stols HVAC",
    expires: "2026-05-07T23:59:59.000Z",
    token: "6368d278865511773709f7701a939c20"
  };

  // ===== EXPIRATION CHECK =====
  const now = new Date();
  const expiry = new Date(__LICENSE__.expires);
  if (now > expiry) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid #e94560;border-radius:12px;padding:40px;max-width:420px;text-align:center;color:#eee;">
        <div style="font-size:48px;margin-bottom:16px;">⏱️</div>
        <h2 style="margin:0 0 12px;color:#e94560;">Tool Expired</h2>
        <p style="margin:0 0 20px;color:#aaa;line-height:1.5;">
          This export tool expired on <strong>${expiry.toLocaleDateString()}</strong>. 
          Please contact support to request a new download link.
        </p>
        <button onclick="this.closest('div').parentElement.remove()" 
                style="background:#e94560;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">
          Dismiss
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
    throw new Error("TOOL_EXPIRED");
  }

  // ===== COMPANY VERIFICATION =====
  try {
    const orgRes = await fetch("/api/v2/organization", {
      credentials: "include",
      headers: { "Accept": "application/json" }
    });

    if (!orgRes.ok) {
      alert("Unable to verify your account. Make sure you are logged into HouseCall Pro and try again.");
      throw new Error("ORG_API_FAILED");
    }

    const orgData = await orgRes.json();
    const actualName = (orgData.data?.name || orgData.name || "").trim().toLowerCase();
    const licensedName = __LICENSE__.company.trim().toLowerCase();

    if (actualName !== licensedName) {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
      overlay.innerHTML = `
        <div style="background:#1a1a2e;border:1px solid #e94560;border-radius:12px;padding:40px;max-width:420px;text-align:center;color:#eee;">
          <div style="font-size:48px;margin-bottom:16px;">🔒</div>
          <h2 style="margin:0 0 12px;color:#e94560;">Unauthorized Account</h2>
          <p style="margin:0 0 20px;color:#aaa;line-height:1.5;">
            This export tool is licensed for a specific account and cannot be used with this login.
            Please contact support if you believe this is an error.
          </p>
          <button onclick="this.closest('div').parentElement.remove()" 
                  style="background:#e94560;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;">
            Dismiss
          </button>
        </div>
      `;
      document.body.appendChild(overlay);
      throw new Error("LICENSE_MISMATCH");
    }
  } catch (err) {
    if (["ORG_API_FAILED", "LICENSE_MISMATCH", "TOOL_EXPIRED"].includes(err.message)) throw err;
    alert("Verification error. Please make sure you are on the HouseCall Pro website and logged in.");
    throw err;
  }

  // ===== VERIFIED — LOAD MAIN EXPORT SCRIPT =====
  // If verification passes, inject the actual export engine
  console.log("[HCP Export] License verified for: " + __LICENSE__.company);
  console.log("[HCP Export] Valid until: " + expiry.toLocaleDateString());

  (function(){
if(!window.location.hostname.includes('housecallpro.com')){alert('Please run this from your HouseCallPro account!\nGo to pro.housecallpro.com first.');return;}
if(window.__hcpExporterRunning){alert('Export is already running!');return;}
window.__hcpExporterRunning=true;
var PAGE_SIZE=100,ATT_PAGE_SIZE=100,RETRY_MAX=2,RETRY_DELAY=2000,KEEPALIVE_MS=120000,MAX_ZIP_BYTES=800*1024*1024,CONCURRENCY=6;
var keepaliveTimer=setInterval(function(){fetch('/api/v2/organization',{credentials:'include',headers:{accept:'application/json'}}).catch(function(){});},KEEPALIVE_MS);
var DEDUP_KEY='__hcp_export_v2';
function getDedupData(){try{return JSON.parse(sessionStorage.getItem(DEDUP_KEY)||'{}');}catch(e){return {};}}
function saveDedupData(d){sessionStorage.setItem(DEDUP_KEY,JSON.stringify(d));}
function getStoredCount(cid){var d=getDedupData();return d[cid]?d[cid].count:0;}
function markCompleted(cid,count){var d=getDedupData();d[cid]={count:count,t:Date.now()};saveDedupData(d);}
function clearAllDedup(){sessionStorage.removeItem(DEDUP_KEY);}
var overlay=document.createElement('div');
overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(8,8,18,0.92);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;backdrop-filter:blur(4px)';
var box=document.createElement('div');
box.style.cssText='background:linear-gradient(145deg,#111827,#0f172a);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:44px;max-width:560px;width:92%;color:#d1d5db;box-shadow:0 30px 80px rgba(0,0,0,0.6)';
function el(t,s,x){var e=document.createElement(t);if(s)e.style.cssText=s;if(x)e.textContent=x;return e;}
var title=el('h2','margin:0 0 6px 0;color:#f9fafb;font-size:18px;font-weight:700','HouseCallPro Attachment Export');
var phase=el('p','margin:0 0 20px 0;color:#6b7280;font-size:12px;font-weight:500;letter-spacing:0.3px;text-transform:uppercase','Initializing...');
var tO=el('div','background:#1f2937;border-radius:10px;height:20px;overflow:hidden;margin-bottom:10px');
var tF=el('div','background:linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa);height:100%;width:0%;transition:width 0.4s ease;border-radius:10px');
tO.appendChild(tF);
var sts=el('div','display:flex;gap:16px;margin-bottom:4px;flex-wrap:wrap');
var sF=el('span','font-size:13px;color:#9ca3af','0 files');
var sE=el('span','font-size:13px;color:#9ca3af','0 errors');
var sZ=el('span','font-size:13px;color:#9ca3af','');
var sT=el('span','font-size:13px;color:#9ca3af','');
sts.appendChild(sF);sts.appendChild(sE);sts.appendChild(sZ);sts.appendChild(sT);
var det=el('p','margin:0 0 20px 0;font-size:12px;color:#4b5563;min-height:18px','');
var summaryBox=el('div','display:none;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px','');
var br=el('div','display:flex;gap:10px');
var cb=el('button','background:rgba(255,255,255,0.05);color:#9ca3af;border:1px solid rgba(255,255,255,0.08);padding:9px 22px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500','Cancel');
br.appendChild(cb);
box.appendChild(title);box.appendChild(phase);box.appendChild(tO);box.appendChild(sts);box.appendChild(det);box.appendChild(summaryBox);box.appendChild(br);
overlay.appendChild(box);document.body.appendChild(overlay);
var cancelled=false;
function cleanup(){cancelled=true;clearInterval(keepaliveTimer);window.__hcpExporterRunning=false;overlay.remove();}
cb.onclick=cleanup;
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)});}
function pct(n,t){return Math.round(n/Math.max(t,1)*100);}
function fmtTime(s){if(s<60)return s+'s';return Math.floor(s/60)+'m '+(s%60)+'s';}
function fmtBytes(b){if(b<1024)return b+' B';if(b<1048576)return(b/1024).toFixed(1)+' KB';if(b<1073741824)return(b/1048576).toFixed(1)+' MB';return(b/1073741824).toFixed(2)+' GB';}
function getCSRF(){var m=document.querySelector('meta[name="csrf-token"]');if(m)return m.getAttribute('content');var ck=document.cookie.split(';');for(var i=0;i<ck.length;i++){var c=ck[i].trim();if(c.toLowerCase().indexOf('csrf')===0)return c.split('=')[1];}return '';}
async function api(url){var h={accept:'application/json'};var csrf=getCSRF();if(csrf)h['x-csrf-token']=csrf;var r=await fetch(url,{credentials:'include',headers:h});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}
async function dlB(url,retries){retries=retries||0;try{var r=await fetch(url);if(!r.ok)throw new Error('HTTP '+r.status);return r.blob();}catch(e){if(retries<RETRY_MAX){await sleep(RETRY_DELAY);return dlB(url,retries+1);}throw e;}}
function safe(s,m){return(s||'unnamed').replace(/[^a-zA-Z0-9 ._-]/g,'_').substring(0,m||60);}
var useFS=!!window.showDirectoryPicker;
async function getDir(){
try{var dh=await window.showDirectoryPicker({mode:'readwrite',startIn:'downloads'});return await dh.getDirectoryHandle('HCP_Export_'+(new Date().toISOString().slice(0,10)),{create:true});}
catch(e){
try{var dh2=await window.showDirectoryPicker({mode:'readwrite'});return await dh2.getDirectoryHandle('HCP_Export_'+(new Date().toISOString().slice(0,10)),{create:true});}
catch(e2){return null;}
}}
async function writeFileToDir(dh,pp,blob){var c=dh;for(var i=0;i<pp.length-1;i++){c=await c.getDirectoryHandle(pp[i],{create:true});}var fh=await c.getFileHandle(pp[pp.length-1],{create:true});var w=await fh.createWritable();await w.write(blob);await w.close();}
async function writeTextToDir(dh,fn,txt){var fh=await dh.getFileHandle(fn,{create:true});var w=await fh.createWritable();await w.write(txt);await w.close();}
async function run(){
try{
phase.textContent='PHASE 1 OF 3 \u2014 SCANNING CUSTOMERS';
var f1=await api('/alpha/customers?page=1&page_size=1&contractor=false');
var tC=f1.total_count||0;
det.textContent='Found '+tC+' customers';
await sleep(400);
var buckets=[],totF=0,skippedCust=0,updatedCust=0,forceAll=false,pg=1,cD=0;
while(!cancelled){
var cd=await api('/alpha/customers?page='+pg+'&page_size='+PAGE_SIZE+'&contractor=false');
var cs=cd.data||[];if(!cs.length)break;
var tP=cd.total_pages_count||1;
for(var i=0;i<cs.length;i++){
if(cancelled)return;cD++;
var c=cs[i];
var cn=((c.first_name||'')+' '+(c.last_name||'')).trim()||c.display_name||'Unknown';
tF.style.width=pct(cD,tC)*0.4+'%';
det.textContent='Scanning: '+cn+' ('+cD+'/'+tC+')';
var cf=[],ap=1;
var currentAttCount=0;
while(true){try{
var ad=await api('/api/customers/'+c.id+'/attachments?page='+ap+'&page_size='+ATT_PAGE_SIZE+'&sort_by=created_at&sort_direction=desc&attachable_type=');
var at=ad.data||[];
currentAttCount=ad.total_count||at.length;
for(var j=0;j<at.length;j++){var a=at[j];var du=a.download_url||a.attachment_file_url;if(!du)continue;
cf.push({aId:a.id||'',fN:a.file_name||a.file_file_name||'file',aT:a.attachable_type||'Unknown',aTypeId:String(a.attachable_id||''),aUuid:a.attachable_uuid||'',custUuid:a.customer_uuid||c.id,du:du,fSize:a.file_file_size||0});}
if(ap>=(ad.total_pages_count||1))break;ap++;
}catch(e){break;}}
if(cf.length>0){
var storedCount=getStoredCount(c.id);
if(!forceAll&&storedCount>0&&storedCount>=currentAttCount){
skippedCust++;sF.textContent=totF+' files found ('+skippedCust+' skipped)';await sleep(50);continue;
}
if(storedCount>0&&storedCount<currentAttCount){updatedCust++;}
var jobMap={};
try{
var jp=1;
while(true){
var jd=await api('/alpha/jobs?page='+jp+'&page_size=100&parent_customer_uuid='+c.id);
var jobsWrapper=jd.data||{};
var jobs=jobsWrapper.data||jd.data||[];
if(!Array.isArray(jobs))jobs=[];
for(var ji=0;ji<jobs.length;ji++){
var jb=jobs[ji];
jobMap[jb.id]={num:jb.invoice_number||'',name:jb.name||''};
}
var jtp=jd.total_page_count||jd.total_pages_count||1;
if(jp>=jtp)break;jp++;
}
}catch(e){}
var custNumericId='';
for(var fi=0;fi<cf.length;fi++){
if(cf[fi].aT==='Customer'&&cf[fi].aTypeId){custNumericId=cf[fi].aTypeId;break;}
}
buckets.push({cn:cn,cId:c.id,cNumId:custNumericId,files:cf,jobMap:jobMap,attCount:currentAttCount});
totF+=cf.length;
}
sF.textContent=totF+' files found'+(skippedCust?' ('+skippedCust+' skipped)':'')+(updatedCust?' ('+updatedCust+' updated)':'');
await sleep(50);
}
if(pg>=tP)break;pg++;
}
if(cancelled)return;
if(!totF&&!skippedCust){
phase.textContent='COMPLETE \u2014 NO ATTACHMENTS FOUND';
det.textContent='No attachments found in this account.';
tF.style.width='100%';tF.style.background='linear-gradient(90deg,#f59e0b,#eab308)';
cb.textContent='Close';window.__hcpExporterRunning=false;clearInterval(keepaliveTimer);return;
}
if(!totF&&skippedCust>0){
phase.textContent='SCAN COMPLETE \u2014 NO NEW FILES';
tF.style.width='40%';
det.textContent='';
summaryBox.style.display='block';
summaryBox.innerHTML='<div style="margin-bottom:14px;font-size:15px;font-weight:600;color:#e2e8f0">No New Attachments</div><div style="font-size:13px;color:#6b7280;margin-bottom:16px">'+skippedCust+' customers were already exported and have no new files.</div><div style="display:flex;gap:10px"><button id="__hcp_redownload" style="flex:1;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;font-size:14px;font-weight:600;cursor:pointer">Re-download All Customers</button><button id="__hcp_cancel_dl" style="padding:12px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);color:#9ca3af;font-size:14px;cursor:pointer">Close</button></div>';
var uc0=await new Promise(function(res){
document.getElementById('__hcp_redownload').onclick=function(){res('redownload')};
document.getElementById('__hcp_cancel_dl').onclick=function(){res('no')};
});
if(uc0==='no'){cleanup();return;}
clearAllDedup();
forceAll=true;
summaryBox.style.display='none';summaryBox.innerHTML='';
phase.textContent='PHASE 1 OF 3 \u2014 RE-SCANNING ALL CUSTOMERS';
det.textContent='Re-scanning with no skips...';
buckets=[];totF=0;skippedCust=0;updatedCust=0;pg=1;cD=0;
while(!cancelled){
var cd3=await api('/alpha/customers?page='+pg+'&page_size='+PAGE_SIZE+'&contractor=false');
var cs3=cd3.data||[];if(!cs3.length)break;
var tP3=cd3.total_pages_count||1;
for(var i3=0;i3<cs3.length;i3++){
if(cancelled)return;cD++;
var c3=cs3[i3];
var cn3=((c3.first_name||'')+' '+(c3.last_name||'')).trim()||c3.display_name||'Unknown';
tF.style.width=pct(cD,tC)*0.4+'%';
det.textContent='Scanning: '+cn3+' ('+cD+'/'+tC+')';
var cf3=[],ap3=1;
while(true){try{
var ad3=await api('/api/customers/'+c3.id+'/attachments?page='+ap3+'&page_size='+ATT_PAGE_SIZE+'&sort_by=created_at&sort_direction=desc&attachable_type=');
var at3=ad3.data||[];
for(var j3=0;j3<at3.length;j3++){var a3=at3[j3];var du3=a3.download_url||a3.attachment_file_url;if(!du3)continue;
cf3.push({aId:a3.id||'',fN:a3.file_name||a3.file_file_name||'file',aT:a3.attachable_type||'Unknown',aTypeId:String(a3.attachable_id||''),aUuid:a3.attachable_uuid||'',custUuid:a3.customer_uuid||c3.id,du:du3,fSize:a3.file_file_size||0});}
if(ap3>=(ad3.total_pages_count||1))break;ap3++;
}catch(e){break;}}
if(cf3.length>0){
var jobMap3={};
try{var jp3=1;while(true){var jd3=await api('/alpha/jobs?page='+jp3+'&page_size=100&parent_customer_uuid='+c3.id);var jw3=jd3.data||{};var jobs3=jw3.data||jd3.data||[];if(!Array.isArray(jobs3))jobs3=[];for(var ji3=0;ji3<jobs3.length;ji3++){jobMap3[jobs3[ji3].id]={num:jobs3[ji3].invoice_number||'',name:jobs3[ji3].name||''};}var jtp3=jd3.total_page_count||jd3.total_pages_count||1;if(jp3>=jtp3)break;jp3++;}}catch(e){}
var cni3='';for(var fi3=0;fi3<cf3.length;fi3++){if(cf3[fi3].aT==='Customer'&&cf3[fi3].aTypeId){cni3=cf3[fi3].aTypeId;break;}}
buckets.push({cn:cn3,cId:c3.id,cNumId:cni3,files:cf3,jobMap:jobMap3,attCount:cf3.length});
totF+=cf3.length;
}
sF.textContent=totF+' files found';
await sleep(50);
}
if(pg>=tP3)break;pg++;
}
if(!totF){phase.textContent='NO ATTACHMENTS';det.textContent='No attachments found.';tF.style.width='100%';tF.style.background='linear-gradient(90deg,#f59e0b,#eab308)';cb.textContent='Close';window.__hcpExporterRunning=false;clearInterval(keepaliveTimer);return;}
}
phase.textContent='SCAN COMPLETE';
tF.style.width='40%';
var estTotalBytes=0,filesWithSize=0;
for(var bi=0;bi<buckets.length;bi++){for(var bfi=0;bfi<buckets[bi].files.length;bfi++){if(buckets[bi].files[bfi].fSize>0){estTotalBytes+=buckets[bi].files[bfi].fSize;filesWithSize++;}}}
if(filesWithSize>0&&filesWithSize<totF){estTotalBytes=Math.round((estTotalBytes/filesWithSize)*totF);}else if(filesWithSize===0){estTotalBytes=totF*2*1024*1024;}
var estTimeSec=Math.round(estTotalBytes/(5*1024*1024));
var ch='<div style="margin-bottom:14px;font-size:15px;font-weight:600;color:#e2e8f0">Ready to Download</div>';
ch+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">';
ch+='<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px"><div style="font-size:11px;color:#6b7280;margin-bottom:2px">Customers</div><div style="font-size:18px;font-weight:700;color:#e2e8f0">'+buckets.length+'</div></div>';
ch+='<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px"><div style="font-size:11px;color:#6b7280;margin-bottom:2px">Total Files</div><div style="font-size:18px;font-weight:700;color:#e2e8f0">'+totF.toLocaleString()+'</div></div>';
ch+='<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px"><div style="font-size:11px;color:#6b7280;margin-bottom:2px">Estimated Size</div><div style="font-size:18px;font-weight:700;color:#e2e8f0">'+fmtBytes(estTotalBytes)+'</div></div>';
ch+='<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px"><div style="font-size:11px;color:#6b7280;margin-bottom:2px">Estimated Time</div><div style="font-size:18px;font-weight:700;color:#e2e8f0">~'+fmtTime(estTimeSec)+'</div></div>';
ch+='</div>';
if(skippedCust>0)ch+='<div style="font-size:12px;color:#6b7280;margin-bottom:4px">'+skippedCust+' customers skipped (no new files since last export)</div>';
if(updatedCust>0)ch+='<div style="font-size:12px;color:#818cf8;margin-bottom:4px">'+updatedCust+' customers have new files since last export</div>';
ch+='<div style="font-size:12px;color:#f59e0b;line-height:1.5;margin-bottom:16px">Make sure you have at least <strong style="color:#fbbf24">'+fmtBytes(Math.round(estTotalBytes*1.1))+'</strong> of free disk space.</div>';
ch+='<div style="display:flex;gap:10px;margin-bottom:12px">';
ch+='<button id="__hcp_start_dl" style="flex:1;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;font-size:14px;font-weight:600;cursor:pointer">Start Download</button>';
ch+='<button id="__hcp_cancel_dl" style="padding:12px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.05);color:#9ca3af;font-size:14px;cursor:pointer">Cancel</button>';
ch+='</div>';
if(skippedCust>0){ch+='<button id="__hcp_redownload" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#9ca3af;font-size:12px;cursor:pointer">Re-download all customers (ignore previous exports)</button>';}
det.textContent='';summaryBox.style.display='block';summaryBox.innerHTML=ch;
var uc=await new Promise(function(res){
document.getElementById('__hcp_start_dl').onclick=function(){res('go')};
document.getElementById('__hcp_cancel_dl').onclick=function(){res('no')};
var reBtn=document.getElementById('__hcp_redownload');
if(reBtn)reBtn.onclick=function(){res('redownload')};
});
if(uc==='no'){cleanup();return;}
if(uc==='redownload'){
clearAllDedup();
forceAll=true;
summaryBox.style.display='none';summaryBox.innerHTML='';
phase.textContent='PHASE 1 OF 3 \u2014 RE-SCANNING ALL CUSTOMERS';
det.textContent='Re-scanning with no skips...';
buckets=[];totF=0;skippedCust=0;updatedCust=0;pg=1;cD=0;
while(!cancelled){
var cd2=await api('/alpha/customers?page='+pg+'&page_size='+PAGE_SIZE+'&contractor=false');
var cs2=cd2.data||[];if(!cs2.length)break;
var tP2=cd2.total_pages_count||1;
for(var i2=0;i2<cs2.length;i2++){
if(cancelled)return;cD++;
var c2=cs2[i2];
var cn2=((c2.first_name||'')+' '+(c2.last_name||'')).trim()||c2.display_name||'Unknown';
tF.style.width=pct(cD,tC)*0.4+'%';
det.textContent='Scanning: '+cn2+' ('+cD+'/'+tC+')';
var cf2=[],ap2=1;
while(true){try{
var ad2=await api('/api/customers/'+c2.id+'/attachments?page='+ap2+'&page_size='+ATT_PAGE_SIZE+'&sort_by=created_at&sort_direction=desc&attachable_type=');
var at2=ad2.data||[];
for(var j2=0;j2<at2.length;j2++){var a2=at2[j2];var du2=a2.download_url||a2.attachment_file_url;if(!du2)continue;
cf2.push({aId:a2.id||'',fN:a2.file_name||a2.file_file_name||'file',aT:a2.attachable_type||'Unknown',aTypeId:String(a2.attachable_id||''),aUuid:a2.attachable_uuid||'',custUuid:a2.customer_uuid||c2.id,du:du2,fSize:a2.file_file_size||0});}
if(ap2>=(ad2.total_pages_count||1))break;ap2++;
}catch(e){break;}}
if(cf2.length>0){
var jobMap2={};
try{var jp2=1;while(true){var jd2=await api('/alpha/jobs?page='+jp2+'&page_size=100&parent_customer_uuid='+c2.id);var jw2=jd2.data||{};var jobs2=jw2.data||jd2.data||[];if(!Array.isArray(jobs2))jobs2=[];for(var ji2=0;ji2<jobs2.length;ji2++){jobMap2[jobs2[ji2].id]={num:jobs2[ji2].invoice_number||'',name:jobs2[ji2].name||''};}var jtp2=jd2.total_page_count||jd2.total_pages_count||1;if(jp2>=jtp2)break;jp2++;}}catch(e){}
var cni2='';for(var fi2=0;fi2<cf2.length;fi2++){if(cf2[fi2].aT==='Customer'&&cf2[fi2].aTypeId){cni2=cf2[fi2].aTypeId;break;}}
buckets.push({cn:cn2,cId:c2.id,cNumId:cni2,files:cf2,jobMap:jobMap2,attCount:cf2.length});
totF+=cf2.length;
}
sF.textContent=totF+' files found';
await sleep(50);
}
if(pg>=tP2)break;pg++;
}
if(!totF){phase.textContent='NO ATTACHMENTS';det.textContent='No attachments found.';tF.style.width='100%';tF.style.background='linear-gradient(90deg,#f59e0b,#eab308)';cb.textContent='Close';window.__hcpExporterRunning=false;clearInterval(keepaliveTimer);return;}
}
summaryBox.style.display='none';summaryBox.innerHTML='';
phase.textContent='PHASE 2 OF 3 \u2014 PREPARING DOWNLOAD';
det.textContent=totF+' attachments across '+buckets.length+' customers.';
var dirHandle=null;
if(useFS){det.textContent='Select a folder to save into. Tip: Create a new folder on your Desktop or in Downloads, then select it.';dirHandle=await getDir();if(!dirHandle){useFS=false;det.textContent='Folder selection failed. Falling back to ZIP downloads...';await sleep(1000);}else{sZ.textContent='\ud83d\udcc2 Saving to folder';det.textContent='Folder selected. Loading libraries...';}}
if(!useFS){sZ.textContent='ZIP mode';det.textContent='Loading ZIP library...';}
var sc=document.createElement('script');sc.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';document.head.appendChild(sc);
await new Promise(function(ok,fl){sc.onload=ok;sc.onerror=function(){fl(new Error('JSZip failed'))};});
var sc2=document.createElement('script');sc2.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';document.head.appendChild(sc2);
await new Promise(function(ok,fl){sc2.onload=ok;sc2.onerror=function(){fl(new Error('SheetJS failed'))};});
await sleep(300);
phase.textContent='PHASE 3 OF 3 \u2014 DOWNLOADING';
var dl=0,er=0,totalBytes=0,dlStartTime=Date.now(),ds=new Date().toISOString().slice(0,10);
var csvH='customer_uuid,customer_numeric_id,customer_name,attachment_id,file_name,job_uuid,job_number,estimate_uuid,equipment_uuid,attachable_type,file_path,status';
var masterCsv=[csvH],masterRows=[],custResults=[];
var zip=null,zC=0,zipBytes=0,zipCsv=null;
if(!useFS){zip=new JSZip();zipCsv=[csvH];}
async function flushZip(){if(!zip)return;zC++;var zN='HCP_Attachments_part'+zC+'_'+ds+'.zip';zip.file('_log_part'+zC+'.csv',zipCsv.join('\n'));det.textContent='Compressing ZIP '+zC+'...';var ct=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}});var a=document.createElement('a');a.href=URL.createObjectURL(ct);a.download=zN;a.click();URL.revokeObjectURL(a.href);await sleep(800);zip=new JSZip();zipBytes=0;zipCsv=[csvH];}
function updProg(cf){var el2=(Date.now()-dlStartTime)/1000;var dn=dl-er;var rt=dn/Math.max(el2,1);var rm=Math.round((totF-dl)/Math.max(rt,0.1));sT.textContent='\u23f1 '+fmtTime(rm)+' left';tF.style.width=(40+pct(dl,totF)*0.55)+'%';if(cf)det.textContent=cf+' ('+dl+'/'+totF+')';sF.textContent=dn+' downloaded ('+fmtBytes(totalBytes)+')';sE.textContent=er>0?er+' errors':'';}
async function dlBatch(tasks){var results=[],idx=0,bOk=0,bEr=0,bBy=0;
async function wk(){while(idx<tasks.length){if(cancelled)return;var ti=idx++;if(ti>=tasks.length)return;var t=tasks[ti];var ff=t.ff,fo=t.fo,cId=t.cId,cNumId=t.cNumId,cNm=t.cNm,jMap=t.jMap;
var aT=ff.aT;
var jobUuid=aT==='Job'?ff.aUuid:'';
var jobNum=aT==='Job'&&ff.aUuid&&jMap[ff.aUuid]?String(jMap[ff.aUuid].num):'';
var estUuid=aT==='Estimate'?ff.aUuid:'';
var eqUuid=aT==='Equipment'?ff.aUuid:'';
var sfLabel=aT==='Job'?(jobNum?'Job_'+jobNum:'Job_'+ff.aUuid.slice(-8)):aT==='Estimate'?'Estimate_'+ff.aUuid.slice(-8):aT==='Equipment'?'Equipment_'+ff.aUuid.slice(-8):'Customer';
var fn2=(ff.aId?ff.aId.slice(-8)+'_':'')+safe(ff.fN,80);
var pp=[fo,sfLabel,fn2],fp=pp.join('/');
dl++;updProg(cNm+' \u2014 '+ff.fN);
try{var bl=await dlB(ff.du);var bS=bl.size||0;totalBytes+=bS;bBy+=bS;
if(useFS){await writeFileToDir(dirHandle,pp,bl);}else{zip.file(fp,bl);zipBytes+=bS;}
bOk++;var row='"'+cId+'","'+cNumId+'","'+cNm+'","'+ff.aId+'","'+ff.fN+'","'+jobUuid+'","'+jobNum+'","'+estUuid+'","'+eqUuid+'","'+aT+'","'+fp+'","success"';
results.push({row:row,mr:{customer_uuid:cId,customer_numeric_id:cNumId,customer_name:cNm,attachment_id:ff.aId,file_name:ff.fN,job_uuid:jobUuid,job_number:jobNum,estimate_uuid:estUuid,equipment_uuid:eqUuid,attachable_type:aT,file_path:fp,status:'success'},ok:true});
}catch(e){er++;dl--;bEr++;var row='"'+cId+'","'+cNumId+'","'+cNm+'","'+ff.aId+'","'+ff.fN+'","'+jobUuid+'","'+jobNum+'","'+estUuid+'","'+eqUuid+'","'+aT+'","'+fp+'","error:'+e.message.substring(0,40)+'"';
results.push({row:row,mr:{customer_uuid:cId,customer_numeric_id:cNumId,customer_name:cNm,attachment_id:ff.aId,file_name:ff.fN,job_uuid:jobUuid,job_number:jobNum,estimate_uuid:estUuid,equipment_uuid:eqUuid,attachable_type:aT,file_path:fp,status:'error: '+e.message.substring(0,40)},ok:false});}
updProg(null);}}
var wks=[];for(var w=0;w<Math.min(CONCURRENCY,tasks.length);w++)wks.push(wk());await Promise.all(wks);
return{ok:bOk,er:bEr,bytes:bBy,results:results};}
for(var ci=0;ci<buckets.length;ci++){
if(cancelled)return;var bk=buckets[ci];var fo=safe(bk.cn,50)+'_'+bk.cId.slice(-8);
if(!useFS){var ecs=bk.files.length*2*1024*1024;if(zipBytes>0&&zipBytes+ecs>MAX_ZIP_BYTES)await flushZip();}
var tasks=[];for(var fi=0;fi<bk.files.length;fi++){tasks.push({ff:bk.files[fi],fo:fo,cId:bk.cId,cNumId:bk.cNumId,cNm:bk.cn,jMap:bk.jobMap});}
var batch=await dlBatch(tasks);
for(var ri=0;ri<batch.results.length;ri++){masterCsv.push(batch.results[ri].row);if(zipCsv)zipCsv.push(batch.results[ri].row);masterRows.push(batch.results[ri].mr);}
if(batch.er===0)markCompleted(bk.cId,bk.attCount);
custResults.push({name:bk.cn,id:bk.cId,numId:bk.cNumId,total:bk.files.length,ok:batch.ok,fail:batch.er,bytes:batch.bytes});
}
if(!useFS&&zip){var hf=false;try{hf=Object.keys(zip.files).length>0;}catch(e){}if(hf)await flushZip();}
det.textContent='Generating Excel report...';
try{
var wb=XLSX.utils.book_new();
var wd=[['Customer UUID','Customer Numeric ID','Customer Name','Attachment ID','File Name','Job UUID','Job Number','Estimate UUID','Equipment UUID','Type','File Path','Status']];
for(var ri=0;ri<masterRows.length;ri++){var m=masterRows[ri];wd.push([m.customer_uuid,m.customer_numeric_id,m.customer_name,m.attachment_id,m.file_name,m.job_uuid,m.job_number,m.estimate_uuid,m.equipment_uuid,m.attachable_type,m.file_path,m.status]);}
var ws=XLSX.utils.aoa_to_sheet(wd);ws['!cols']=[{wch:30},{wch:16},{wch:25},{wch:30},{wch:35},{wch:30},{wch:12},{wch:30},{wch:30},{wch:12},{wch:55},{wch:15}];
XLSX.utils.book_append_sheet(wb,ws,'All Attachments');
var sd=[['Customer UUID','Customer Numeric ID','Customer Name','Total','OK','Errors','Size','Status']];
for(var si=0;si<custResults.length;si++){var cr=custResults[si];sd.push([cr.id,cr.numId,cr.name,cr.total,cr.ok,cr.fail,fmtBytes(cr.bytes),cr.fail===0?'Complete':'Partial']);}
var ws2=XLSX.utils.aoa_to_sheet(sd);ws2['!cols']=[{wch:30},{wch:16},{wch:25},{wch:8},{wch:8},{wch:8},{wch:14},{wch:12}];
XLSX.utils.book_append_sheet(wb,ws2,'Customer Summary');
if(er>0){var ed=[['Customer UUID','Customer Numeric ID','Customer Name','Attachment ID','File Name','Job UUID','Job Number','Estimate UUID','Equipment UUID','Error']];
for(var ei=0;ei<masterRows.length;ei++){if(masterRows[ei].status.indexOf('error')===0){var em=masterRows[ei];ed.push([em.customer_uuid,em.customer_numeric_id,em.customer_name,em.attachment_id,em.file_name,em.job_uuid,em.job_number,em.estimate_uuid,em.equipment_uuid,em.status]);}}
var ws3=XLSX.utils.aoa_to_sheet(ed);XLSX.utils.book_append_sheet(wb,ws3,'Errors');}
var xo=XLSX.write(wb,{bookType:'xlsx',type:'array'});
var xb=new Blob([xo],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
var cb2=new Blob([masterCsv.join('\n')],{type:'text/csv'});
if(useFS){await writeTextToDir(dirHandle,'HCP_Export_Log_'+ds+'.csv',masterCsv.join('\n'));await writeFileToDir(dirHandle,['HCP_Export_Log_'+ds+'.xlsx'],xb);}
else{var cl=document.createElement('a');cl.href=URL.createObjectURL(cb2);cl.download='HCP_Log_'+ds+'.csv';cl.click();URL.revokeObjectURL(cl.href);await sleep(500);var xl=document.createElement('a');xl.href=URL.createObjectURL(xb);xl.download='HCP_Log_'+ds+'.xlsx';xl.click();URL.revokeObjectURL(xl.href);}
}catch(xe){det.textContent='Excel error: '+xe.message;await sleep(1500);}
clearInterval(keepaliveTimer);
tF.style.width='100%';tF.style.background='linear-gradient(90deg,#059669,#10b981,#34d399)';
phase.textContent='EXPORT COMPLETE';phase.style.color='#34d399';title.textContent='All Done!';sT.textContent='';
var te=fmtTime(Math.round((Date.now()-dlStartTime)/1000));
var tcp=custResults.length,tcc=custResults.filter(function(c){return c.fail===0}).length,tce=tcp-tcc;
summaryBox.style.display='block';
var sh='<div style="margin-bottom:12px;font-size:14px;font-weight:600;color:#e2e8f0">Verification Summary</div>';
sh+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
sh+='<div style="color:#9ca3af">Mode:</div><div style="color:#e2e8f0">'+(useFS?'Direct to folder':'ZIP ('+zC+')')+'</div>';
sh+='<div style="color:#9ca3af">Customers:</div><div style="color:#e2e8f0">'+tcp+(skippedCust?' (+'+skippedCust+' skipped)':'')+'</div>';
sh+='<div style="color:#9ca3af">Files:</div><div style="color:#e2e8f0">'+(dl-er)+' ('+fmtBytes(totalBytes)+')</div>';
sh+='<div style="color:#9ca3af">Errors:</div><div style="color:'+(er?'#f87171':'#34d399')+'">'+er+'</div>';
sh+='<div style="color:#9ca3af">Time:</div><div style="color:#e2e8f0">'+te+'</div>';
sh+='</div>';
if(tce>0){sh+='<div style="font-size:12px;font-weight:600;color:#f87171;margin-bottom:6px">Customers with errors:</div><div style="font-size:11px;color:#9ca3af;max-height:120px;overflow-y:auto">';
for(var ri=0;ri<custResults.length;ri++){if(custResults[ri].fail>0)sh+='<div>'+custResults[ri].name+' \u2014 '+custResults[ri].fail+'/'+custResults[ri].total+'</div>';}sh+='</div>';}
else{sh+='<div style="font-size:12px;color:#34d399">\u2713 All files downloaded successfully.</div>';}
if(useFS){var isMac=/Mac|iPhone|iPad/.test(navigator.userAgent),isWin=/Win/.test(navigator.userAgent);
sh+='<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06)">';
sh+='<div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-bottom:8px">\ud83d\udce6 Next: Zip and Send</div>';
if(isMac){sh+='<div style="font-size:12px;color:#9ca3af;line-height:1.6">1. Open <strong style="color:#cbd5e1">Finder</strong><br>2. <strong style="color:#cbd5e1">Right-click</strong> the <strong style="color:#a78bfa">HCP_Export</strong> folder<br>3. Click <strong style="color:#cbd5e1">Compress</strong><br>4. Send the .zip file</div>';}
else if(isWin){sh+='<div style="font-size:12px;color:#9ca3af;line-height:1.6">1. Open <strong style="color:#cbd5e1">File Explorer</strong><br>2. <strong style="color:#cbd5e1">Right-click</strong> the <strong style="color:#a78bfa">HCP_Export</strong> folder<br>3. Click <strong style="color:#cbd5e1">Compress to ZIP file</strong><br>4. Send the .zip file</div>';}
else{sh+='<div style="font-size:12px;color:#9ca3af;line-height:1.6">Right-click the <strong style="color:#a78bfa">HCP_Export</strong> folder \u2192 Compress \u2192 Send the .zip</div>';}
sh+='<div style="font-size:11px;color:#4b5563;margin-top:8px">\ud83d\udca1 Or share via Google Drive / Dropbox for large exports.</div></div>';}
summaryBox.innerHTML=sh;
det.textContent=(dl-er)+' files ('+fmtBytes(totalBytes)+') in '+te;sF.textContent=(dl-er)+' files';
cb.textContent='Close';cb.style.background='rgba(16,185,129,0.15)';cb.style.color='#34d399';
window.__hcpExporterRunning=false;
}catch(e){clearInterval(keepaliveTimer);phase.textContent='ERROR';phase.style.color='#ef4444';det.textContent=e.message;tF.style.background='linear-gradient(90deg,#dc2626,#ef4444)';cb.textContent='Close';window.__hcpExporterRunning=false;}}
run();
})();

})();
