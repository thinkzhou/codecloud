(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const WALK_SAVE='liangjie_v020_walk_0320';
const state=()=>window.V020&&V020.state?V020.state():null;
const sceneEl=$('#scene'), artEl=$('#sceneArt'), npcLayer=$('#npcLayer');
if(!sceneEl||!window.V020)return;

const cfg={
 temple:{start:{x:50,y:80},bounds:{xmin:8,xmax:92,ymin:62,ymax:87},npcs:{sunpo:{x:28,y:69},xiaobao:{x:76,y:77}},spots:[
  {id:'sleep',x:55,y:61,label:'土地庙 · 歇息',kind:'place',match:/在此歇息/},
  {id:'river',x:8,y:78,label:'← 青石河',kind:'exit',match:/去河边捕鱼/},
  {id:'hill',x:91,y:65,label:'后山 →',kind:'exit',match:/去后山看看/}
 ]},
 river:{start:{x:18,y:62},bounds:{xmin:7,xmax:93,ymin:53,ymax:66},spots:[
  {id:'fish',x:72,y:58,label:'水边 · 捕鱼',kind:'action',match:/下竿捕鱼/},
  {id:'temple',x:8,y:63,label:'← 土地庙',kind:'exit',match:/回土地庙/},
  {id:'hill',x:92,y:61,label:'后山 →',kind:'exit',match:/绕去后山/}
 ]},
 hill:{start:{x:15,y:81},bounds:{xmin:7,xmax:92,ymin:66,ymax:88},spots:[
  {id:'portal',x:79,y:68,label:'异界白光',kind:'portal',match:/走进白光/},
  {id:'temple',x:8,y:82,label:'← 土地庙',kind:'exit',match:/回土地庙/},
  {id:'forage',x:43,y:72,label:'草丛 · 搜寻',kind:'action',match:/附近找找/}
 ]},
 modern:{start:{x:50,y:84},bounds:{xmin:8,xmax:92,ymin:61,ymax:88},npcs:{lin:{x:53,y:66}},spots:[
  {id:'job',x:23,y:68,label:'货架 · 帮工',kind:'action',match:/整理货架/},
  {id:'preservative',x:79,y:65,label:'保鲜剂 ¥4',kind:'shop',match:/现代保鲜剂/},
  {id:'msg',x:79,y:74,label:'味精 ¥3',kind:'shop',match:/味精/},
  {id:'return',x:9,y:84,label:'← 白光入口',kind:'portal',match:/回到古代/}
 ]}
};
let positions=loadPos(), current=null, timer=null, markerTimer=null, wrapping=false;
function loadPos(){try{return JSON.parse(localStorage.getItem(WALK_SAVE)||'{}')}catch(e){return {}}}
function savePos(){try{localStorage.setItem(WALK_SAVE,JSON.stringify(positions))}catch(e){}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function place(){return state()?.place||'temple'}
function conf(){return cfg[place()]||cfg.temple}
function getPos(){let p=positions[place()]||conf().start;return {x:p.x,y:p.y}}
function setPos(x,y){positions[place()]={x,y};savePos();current={x,y}}
function playerSVG(){return `<svg viewBox="0 0 72 124" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="robe" x2="0" y2="1"><stop stop-color="#74604a"/><stop offset="1" stop-color="#40362c"/></linearGradient></defs><path d="M19 119q2-44 11-65h22q12 24 11 65Z" fill="url(#robe)" stroke="#2b241d" stroke-width="1.4"/><path d="M30 66L19 99l11 5 9-35zM49 67l15 31-10 7-14-34z" fill="#6d5842"/><circle cx="40" cy="42" r="21" fill="#e7b77f" stroke="#5e4633" stroke-width="1"/><path d="M18 43q1-26 23-27 19 0 25 18l-9-5 2 8-11-5-1 9-12-8-4 10-7-7-2 12z" fill="#28231e"/><path d="M25 39q5-5 10 0M45 39q5-5 10 0" fill="none" stroke="#493328" stroke-width="1.5"/><circle cx="31" cy="44" r="1.7" fill="#2d211a"/><circle cx="50" cy="44" r="1.7" fill="#2d211a"/><path d="M34 53q6 4 12 0" fill="none" stroke="#995f48" stroke-width="1.6"/><path d="M29 61l11 7 10-7 4 57H23z" fill="#5f4d3b" opacity=".9"/><g stroke="#b49a76" stroke-width="1.2" opacity=".45"><path d="M33 78l-7 24M45 76l9 29M38 88l-1 29"/></g><path d="M29 117l-6 5M51 117l7 5" stroke="#2b211b" stroke-width="3" stroke-linecap="round"/></svg>`}
function ensureLayer(){
 let layer=$('#walkLayer');
 if(!layer){layer=document.createElement('div');layer.id='walkLayer';layer.className='walkLayer';layer.innerHTML=`<div id="walkMarker" class="walkMarker"></div><div id="playerPawn" class="playerPawn"><div class="pawnShadow"></div><div class="pawnSprite">${playerSVG()}</div><small>你</small></div><div id="walkHotspots" class="walkHotspots"></div><div id="walkHint" class="walkHint">点击地面行走 · 点击人物或路口自动靠近</div>`;sceneEl.appendChild(layer)}
 return layer;
}
function pawn(){return $('#playerPawn')}
function movePawnInstant(){let p=getPos(),el=pawn();if(!el)return;current=p;el.style.transition='none';el.style.left=p.x+'%';el.style.top=p.y+'%';scalePawn(p.y);requestAnimationFrame(()=>{el.style.transition=''})}
function scalePawn(y){let el=pawn();if(!el)return;let s=clamp(.72+(y-52)*.008,.78,1.08);el.style.setProperty('--pawn-scale',s.toFixed(3))}
function showMarker(x,y){let m=$('#walkMarker');if(!m)return;m.style.left=x+'%';m.style.top=y+'%';m.classList.remove('show');void m.offsetWidth;m.classList.add('show');clearTimeout(markerTimer);markerTimer=setTimeout(()=>m.classList.remove('show'),650)}
function normalize(x,y){let b=conf().bounds;return{x:clamp(x,b.xmin,b.xmax),y:clamp(y,b.ymin,b.ymax)}}
function walkTo(x,y,done){
 let p0=current||getPos(),p1=normalize(x,y),el=pawn();if(!el){done&&done();return}
 clearTimeout(timer);showMarker(p1.x,p1.y);
 let rect=sceneEl.getBoundingClientRect(),dx=(p1.x-p0.x)*rect.width/100,dy=(p1.y-p0.y)*rect.height/100,dist=Math.hypot(dx,dy),duration=clamp(dist/0.30,180,1550);
 let sprite=el.querySelector('.pawnSprite');if(sprite)sprite.classList.toggle('faceLeft',p1.x<p0.x);
 el.classList.add('walking');el.style.transitionDuration=duration+'ms';el.style.left=p1.x+'%';el.style.top=p1.y+'%';scalePawn(p1.y);setPos(p1.x,p1.y);
 timer=setTimeout(()=>{el.classList.remove('walking');done&&done()},duration+35);
}
function findAction(re){return $$('#actions .actionBtn').find(b=>re.test((b.textContent||'').trim()))}
function runSpot(spot){let b=findAction(spot.match);if(b)b.click()}
function renderSpots(){let box=$('#walkHotspots');if(!box)return;box.innerHTML='';for(const sp of conf().spots||[]){let b=document.createElement('button');b.className='walkHotspot '+sp.kind;b.dataset.spot=sp.id;b.style.left=sp.x+'%';b.style.top=sp.y+'%';b.innerHTML=`<span>${sp.label}</span>`;b.onclick=e=>{e.stopPropagation();walkTo(sp.x,sp.y,()=>runSpot(sp))};box.appendChild(b)}}
function wrapNpcs(){if(wrapping)return;wrapping=true;try{let map=conf().npcs||{};for(const [id,p] of Object.entries(map)){let el=$('.npc.'+id);if(!el)continue;el.style.left=p.x+'%';el.style.right='auto';el.style.top=p.y+'%';el.style.transform='translate(-50%,-92%)';if(el.dataset.walkWrapped==='1')continue;let original=el.onclick;el.dataset.walkWrapped='1';el.onclick=e=>{e.stopPropagation();walkTo(p.x,p.y,()=>original&&original.call(el,e))}}}finally{wrapping=false}}
function applyScene(){
 let p=place();if(!cfg[p])return;sceneEl.classList.add('walkable');sceneEl.dataset.walkScene=p;ensureLayer();renderSpots();movePawnInstant();setTimeout(wrapNpcs,0);
 let hint=$('#walkHint');if(hint)hint.classList.toggle('hide',localStorage.getItem('liangjie_walk_hint_seen')==='1');
}
function groundClick(e){if(!sceneEl.classList.contains('walkable'))return;if(e.target.closest('.npc,.walkHotspot,.questChip,.dialogue,.dock,.overlay,.actions,.walkHint'))return;let r=sceneEl.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;localStorage.setItem('liangjie_walk_hint_seen','1');$('#walkHint')?.classList.add('hide');walkTo(x,y)}
sceneEl.addEventListener('click',groundClick);
new MutationObserver(()=>setTimeout(applyScene,0)).observe(artEl,{childList:true});
new MutationObserver(()=>setTimeout(wrapNpcs,0)).observe(npcLayer,{childList:true});

function routeMap(){
 const s=state(),p=s.place;let html=`<button class="close">×</button><h2>落霞镇 · 行路图</h2><div class="routeMap"><div class="routeLine l1"></div><div class="routeLine l2"></div><div class="routeNode temple ${p==='temple'?'here':''}"><i>庙</i><b>土地庙</b></div><div class="routeNode river ${p==='river'?'here':''}"><i>水</i><b>青石河</b></div><div class="routeNode hill ${p==='hill'?'here':''}"><i>山</i><b>后山裂洞</b></div><div class="routeNode modern ${p==='modern'?'here':''}"><i>异</i><b>另一世界</b></div></div><div class="card">地图只用来看方向，不再瞬移。关闭地图后，点击场景中的路口，主角会亲自走过去并进入下一张地图。</div>`;$('#panel').innerHTML=html;$('#overlay').classList.remove('hidden');$('.close').onclick=()=>$('#overlay').classList.add('hidden')}
let mapBtn=$('.dock [data-panel="map"]');if(mapBtn)mapBtn.onclick=routeMap;
let portalBtn=$('#portalDock');if(portalBtn)portalBtn.onclick=()=>{let id=place()==='hill'?'portal':place()==='modern'?'return':null;if(id){let b=$(`.walkHotspot[data-spot="${id}"]`);b&&b.click()}else routeMap()};

window.V020Walk={position:getPos,walkTo,apply:applyScene,routeMap,spots:()=>conf().spots.map(x=>x.id)};
applyScene();
})();