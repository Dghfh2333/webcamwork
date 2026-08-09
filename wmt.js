// WMT Tracker — webcamwork.com.ua
window.WMT=(function(){
  var t0=Date.now();
  var ret=localStorage.getItem('wm_ret')?'Повторний':'Новий';
  try{localStorage.setItem('wm_ret','1');}catch(e){}
  var src=sessionStorage.getItem('wm_src')||'';
  if(!src){
    var p=new URLSearchParams(location.search);
    function q(k){return p.get(k)||'';}
    var ref=document.referrer,h='';
    try{h=ref?new URL(ref).hostname.replace(/^www\./,''):'';}catch(e){}
    if(q('gclid')||q('utm_source')==='google'&&/cpc|ppc/.test(q('utm_medium')))src='Google Ads';
    else if(q('utm_source'))src=q('utm_source')+(q('utm_medium')?' / '+q('utm_medium'):'');
    else if(h&&h.indexOf('webcamwork')===-1){
      if(/google\./.test(h))src='Google (органіка)';
      else if(/bing\./.test(h))src='Bing';
      else if(h==='t.me'||/telegram/.test(h))src='Telegram';
      else if(/instagram/.test(h))src='Instagram';
      else if(/facebook|fb\.com/.test(h))src='Facebook';
      else if(/tiktok/.test(h))src='TikTok';
      else if(/olx\./.test(h))src='OLX';
      else src='Реферал: '+h;
    }
    else src='Прямий захід';
    try{sessionStorage.setItem('wm_src',src);}catch(e){}
  }
  var dev=(function(){
    var ua=navigator.userAgent,m;
    if(/iPhone/.test(ua)){m=ua.match(/OS (\d+)_(\d+)/);return 'iPhone'+(m?' · iOS '+m[1]+'.'+m[2]:'');}
    if(/iPad/.test(ua))return 'iPad';
    if(/Android/.test(ua)){m=ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build|\))/);var mod=m&&m[1].trim()!=='K'?m[1].trim():'';var av=(ua.match(/Android (\d+)/)||[])[1];return (mod||'Android')+(av?' · Android '+av:'');}
    if(/Windows/.test(ua))return 'Windows PC';
    if(/Macintosh/.test(ua))return 'Mac';
    return 'Інший пристрій';
  })();
  if(navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues){
    navigator.userAgentData.getHighEntropyValues(['model','platformVersion']).then(function(d){
      if(d.model)dev=d.model+' · Android'+(d.platformVersion?' '+parseInt(d.platformVersion):'');
    }).catch(function(){});
  }
  var geo=null;
  var ready=fetch('https://get.geojs.io/v1/ip/geo.json').then(function(r){return r.json();}).then(function(g){geo=g;}).catch(function(){});
  function onSite(){var s=Math.round((Date.now()-t0)/1000);return s>=60?Math.floor(s/60)+' хв '+(s%60)+' сек':s+' сек';}
  function lines(noTime){
    var L=['🔗 <b>Джерело:</b> '+src];
    if(geo&&geo.ip){
      L.push('📍 <b>Гео:</b> '+[geo.city,geo.country].filter(Boolean).join(', ')+' · IP '+geo.ip);
      if(geo.organization_name)L.push('📡 <b>Провайдер:</b> '+geo.organization_name);
    }
    L.push('📟 <b>Пристрій:</b> '+dev);
    L.push('👤 '+ret+' відвідувач'+(noTime?'':' · на сайті '+onSite()));
    return L;
  }
  function raw(){return {src:src,geo:geo&&geo.city?geo.city:'',dev:dev};}
  return {lines:lines,ready:ready,raw:raw};
})();

// UTM saver
(function(){
  var p=new URLSearchParams(window.location.search);
  ['utm_source','utm_medium','utm_campaign','utm_term'].forEach(function(k){
    var v=p.get(k);if(v)sessionStorage.setItem(k,v);
  });
})();

function utmVal(k){return sessionStorage.getItem(k)||'';}

function wmUtmBlock(){
  var utm=['utm_source','utm_medium','utm_campaign','utm_term'];
  var lines=utm.map(function(k){var v=utmVal(k);return v?'• '+k.replace('utm_','')+': '+v:null;}).filter(Boolean).join('\n');
  return lines?'📊 <b>UTM:</b>\n'+lines:'';
}

async function wmSendLead(fields){
  var now=new Date();
  var ts=now.toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  try{await Promise.race([WMT.ready,new Promise(function(r){setTimeout(r,1500);})]);}catch(e){}
  var parts=fields.concat(['']).concat(WMT.lines());
  var utmB=wmUtmBlock();if(utmB)parts.push(utmB);
  parts.push('');
  parts.push('🕐 '+ts+' · webcamwork.com.ua');
  var text=parts.join('\n');
  try{
    await fetch('/lead.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({site:location.hostname,page:location.pathname,text:text,website:document.querySelector('input[name="website"]')?.value||''})
    });
  }catch(e){}
}

// wcwForm — enriched
function wcwForm(fid,label){
  var f=document.getElementById(fid);
  if(!f)return;
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(f.website&&f.website.value)return;
    var last=+sessionStorage.getItem('ls')||0;
    if(Date.now()-last<30000){alert('Заявку вже надіслано. Зачекайте хвилину.');return;}
    var fields=['🔔 <b>'+label+'</b>',''];
    Array.prototype.forEach.call(f.querySelectorAll('input:not(.hp),select,textarea'),function(el){
      if(el.value&&el.type!=='submit'&&el.getAttribute('data-l'))
        fields.push(el.getAttribute('data-l')+': '+el.value);
    });
    fields.push('📄 Сторінка: '+location.href);
    wmSendLead(fields).then(function(){
      sessionStorage.setItem('ls',Date.now());
      window.dataLayer=window.dataLayer||[];dataLayer.push({event:'lead_submit',form:fid});
      f.innerHTML='<p style="text-align:center;font-size:17px">✅ Заявку надіслано!<br>Напишемо вам протягом години.</p>';
    });
  });
}

// Telegram click tracker
document.addEventListener('click',function(e){
  var el=e.target.closest('a[href*="t.me"]');
  if(!el)return;
  e.preventDefault();
  if(window.dataLayer)dataLayer.push({event:'telegram_click',page:location.pathname});
  var href=el.href;
  var now=new Date();
  var date=('0'+now.getDate()).slice(-2)+'.'+('0'+(now.getMonth()+1)).slice(-2);
  Promise.race([WMT.ready,new Promise(function(r){setTimeout(r,1500);})]).then(function(){
    var r=WMT.raw();
    fetch('/lead.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      lead_type:'tg_click',
      date:date,
      site:location.hostname,
      page:location.pathname,
      source:r.src,
      campaign:utmVal('utm_campaign'),
      term:utmVal('utm_term'),
      geo:r.geo||'-',
      device:r.dev||'-'
    })}).catch(function(){});
  });
  setTimeout(function(){window.open(href,'_blank');},150);
});
