const DATA=[
  {w:'arrange',ipa:'/əˈreɪndʒ/',cn:'安排；整理',ex:'Let’s arrange a time to meet after work.'},
  {w:'relaxing',ipa:'/rɪˈlæksɪŋ/',cn:'令人放松的',ex:'A quiet walk can be very relaxing.'},
  {w:'unpredictable',ipa:'/ˌʌnprɪˈdɪktəbl/',cn:'难以预测的',ex:'The weather here is unpredictable.'},
  {w:'nearby',ipa:'/ˌnɪrˈbaɪ/',cn:'附近的；在附近',ex:'Is there a good café nearby?'},
  {w:'flexible',ipa:'/ˈfleksəbl/',cn:'灵活的',ex:'My schedule is flexible this afternoon.'}
];
const SENTENCES=[
  {id:'s1',en:'I’d like to arrange a relaxing weekend, but the weather is unpredictable, so perhaps we should choose a nearby place and keep our schedule flexible.',cn:'我想安排一个轻松的周末，但天气难以预测，所以也许我们应该选个附近的地方，并让行程保持灵活。'},
  {id:'s2',en:'That sounds sensible; if we arrange everything in advance, we can enjoy a relaxing morning nearby and still be flexible enough to change our plans when the unpredictable weather arrives.',cn:'这听起来很合理；如果我们提前安排好一切，就能在附近享受一个轻松的早晨，也能在多变天气到来时灵活调整计划。'}
];
const DICT={
  'i’d':'我想要；我会','i':'我','like':'喜欢；想要','to':'到；用于','arrange':'安排；整理','a':'一个','relaxing':'令人放松的','weekend':'周末','but':'但是','the':'这个；该（定冠词）','weather':'天气','is':'是','unpredictable':'难以预测的','so':'所以','perhaps':'也许','we':'我们','should':'应该','choose':'选择','nearby':'附近的；在附近','place':'地点','and':'并且','keep':'保持','our':'我们的','schedule':'日程；安排','flexible':'灵活的','that':'那；那个','sounds':'听起来','sensible':'明智的；合理的','if':'如果','everything':'一切','in':'在……里','advance':'提前','can':'能够','enjoy':'享受','morning':'早晨','still':'仍然','be':'是；保持','enough':'足够地','change':'改变','plans':'计划','when':'当……时','arrives':'到来'
};
const KEY='lingo5-progress-v1';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let state;
try{state=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{state={}}
state.words=Array.isArray(state.words)?state.words:[];
state.sentences=!!state.sentences;
state.completed=!!state.completed;
state.historyWords=Array.isArray(state.historyWords)?state.historyWords:[];
state.historySentences=Array.isArray(state.historySentences)?state.historySentences:[];
state.focusSessions=Array.isArray(state.focusSessions)?state.focusSessions:[];
const today=()=>new Date().toISOString().slice(0,10);
DATA.forEach((x,i)=>{if(state.words.includes(i)&&!state.historyWords.some(v=>v.w===x.w))state.historyWords.push({...x,learnedAt:today(),source:'今日课程'})});
if(state.sentences&&state.historySentences.length===0)state.historySentences=SENTENCES.map(x=>({...x,learnedAt:today()}));
let oldN=-1,libraryTab='words',time=720,tick=null;

function save(renderToo=true){localStorage.setItem(KEY,JSON.stringify(state));if(renderToo)render()}
function speak(t){if(!('speechSynthesis'in window))return toast('当前浏览器暂不支持朗读');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=.84;speechSynthesis.speak(u)}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1900)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(w){return w.toLowerCase().replace(/'/g,'’')}
function confetti(){const c=['#5ee1e6','#c9f55f','#ff806d','#ffd45b','#9e8cff'];for(let i=0;i<34;i++){let p=document.createElement('i');p.className='confetti';p.style.left=Math.random()*100+'vw';p.style.background=c[i%5];p.style.setProperty('--x',(Math.random()*180-90)+'px');p.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(p);setTimeout(()=>p.remove(),2300)}}
function buildRoute(n){let h='';for(let i=0;i<7;i++){h+=`<span class="route-step ${i<n?'done':i===n?'current':''}">${i<n?'✓':i+1}</span>`;if(i<6)h+=`<i class="route-line ${i<n?'filled':''}"></i>`}$('#route').innerHTML=h}
function renderSentence(el,text){el.innerHTML=text.replace(/([A-Za-z]+(?:[’'][A-Za-z]+)?)/g,w=>{const key=norm(w),hot=DATA.some(x=>x.w===key);return `<button class="tap-word ${hot?'key-word':''}" data-lookup="${esc(key)}">${esc(w)}</button>`})}
function recordWord(word,cn,ipa='',source='对话点词'){if(!state.historyWords.some(x=>x.w===word))state.historyWords.unshift({w:word,cn,ipa,learnedAt:today(),source})}
function recordSentences(){SENTENCES.forEach(s=>{if(!state.historySentences.some(x=>x.id===s.id))state.historySentences.unshift({...s,learnedAt:today()})})}

function render(){
  $('#words').innerHTML=DATA.map((x,i)=>`<div class="word ${state.words.includes(i)?'done':''}" data-i="${i}" role="button" tabindex="0"><span class="mastered">✓</span><button class="sound" data-say="${i}" aria-label="朗读 ${x.w}">♪</button><div class="word-no">WORD 0${i+1}</div><b>${x.w}</b><div class="ipa">${x.ipa}</div><div class="meaning">${x.cn}</div></div>`).join('');
  renderSentence($('#sentence1'),SENTENCES[0].en);renderSentence($('#sentence2'),SENTENCES[1].en);
  const n=state.words.length+(state.sentences?2:0),p=Math.round(n/7*100);buildRoute(n);$('#progressText').textContent=n+' / 7 完成';$('#percent').textContent=p;$('#meter').style.width=p+'%';$('#xp').textContent=20+n*10;$('#encourage').textContent=p===0?'完成一个词，就点亮一步':p<100?'很好，路线正在被点亮':'今日路线全部点亮！';$('#sentenceDone').textContent=state.sentences?'✓ 已掌握并记录':'两段都学会了';
  $('#libraryWordsCount').textContent=state.historyWords.length;$('#librarySentencesCount').textContent=state.historySentences.length;$('#libStatWords').textContent=state.historyWords.length;$('#libStatSentences').textContent=state.historySentences.length;$('#libStatFocus').textContent=state.focusSessions.length;
  if(n===7){state.completed=true;localStorage.setItem(KEY,JSON.stringify(state));$('#reviewCount').textContent='已安排：5 个词 + 2 段长句';if(oldN!==-1&&oldN<7)confetti()}oldN=n;
  if($('#libraryOverlay').classList.contains('open'))renderLibrary();
}

function openWord(i){const x=DATA[i];$('#sheet').innerHTML=`<button class="close" id="close">✕</button><div style="font-size:.72rem;font-weight:900;color:var(--violet);letter-spacing:.1em">WORD 0${i+1}</div><h3>${x.w} <button class="sound" style="position:static;display:inline-grid;vertical-align:middle" id="say">♪</button></h3><div class="big-ipa">${x.ipa} · ${x.cn}</div><div class="example"><b>放进一句话</b><br>${x.ex}</div><button class="btn primary" style="width:100%" id="master">${state.words.includes(i)?'标记为需要再学':'记住了并加入学习库'}</button>`;$('#modal').classList.add('open');$('#close').onclick=closeModal;$('#say').onclick=()=>speak(x.w);$('#master').onclick=()=>{const adding=!state.words.includes(i);state.words=adding?[...state.words,i]:state.words.filter(v=>v!==i);if(adding)recordWord(x.w,x.cn,x.ipa,'今日课程');save();closeModal();toast(adding?'已记录到学习库 ＋10 能量':'已放回学习路线（历史记录保留）')}}
function lookupWord(word){const cn=DICT[word]||'暂未收录释义',known=DATA.find(x=>x.w===word);recordWord(word,cn,known?.ipa||'','对话点词');save(false);$('#sheet').innerHTML=`<button class="close" id="close">✕</button><div class="word-pop"><div class="word-pop-icon">Aa</div><div><b>${esc(word)}</b><span>${esc(cn)}</span></div></div><div class="example"><b>来自今日对话</b><br>点击单词即可逐词理解整句，不需要离开当前页面。</div><button class="btn primary" style="width:100%" id="sayLookup">🔊 听发音</button><p style="text-align:center;color:var(--muted);font-size:.75rem;margin-bottom:0">已自动记录到学习库</p>`;$('#modal').classList.add('open');$('#close').onclick=closeModal;$('#sayLookup').onclick=()=>speak(word);render()}
function closeModal(){$('#modal').classList.remove('open')}

function openLibrary(){libraryTab='words';$('#librarySearch').value='';$('#libraryOverlay').classList.add('open');$$('.library-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab==='words'));renderLibrary()}
function renderLibrary(){const q=$('#librarySearch').value.trim().toLowerCase(),list=$('#libraryList');if(libraryTab==='words'){const items=state.historyWords.filter(x=>(x.w+' '+x.cn).toLowerCase().includes(q));list.innerHTML=items.length?items.map(x=>`<button class="library-item" data-lib-word="${esc(x.w)}"><div><h4>${esc(x.w)} · ${esc(x.cn)}</h4><p>${esc(x.ipa||x.source||'已学习')}</p></div><span class="date-tag">${esc(x.learnedAt||'已记录')}<br>点击复习</span></button>`).join(''):`<div class="empty-library">还没有记录单词。<br>学会单词或点击对话中的词，就会自动出现在这里。</div>`}else{const items=state.historySentences.filter(x=>(x.en+' '+x.cn).toLowerCase().includes(q));list.innerHTML=items.length?items.map(x=>`<div class="library-item sentence-record"><button class="sound" style="position:static;float:right" data-lib-say="${esc(x.id)}">♪</button><h4>${esc(x.en)}</h4><p class="cn-record">${esc(x.cn)}</p><p>${esc(x.learnedAt||'已记录')}</p></div>`).join(''):`<div class="empty-library">还没有记录句子。<br>完成今日两段长句后会自动保存到这里。</div>`}}

$('#words').addEventListener('click',e=>{const s=e.target.closest('[data-say]');if(s){e.stopPropagation();speak(DATA[+s.dataset.say].w);return}const b=e.target.closest('.word');if(b)openWord(+b.dataset.i)});
$('#words').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('word'))openWord(+e.target.dataset.i)});
$('#sentencesSection').addEventListener('click',e=>{const b=e.target.closest('[data-lookup]');if(b)lookupWord(b.dataset.lookup)});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
$('#sentenceDone').onclick=()=>{state.sentences=!state.sentences;if(state.sentences)recordSentences();save();toast(state.sentences?'两段长句已记录到学习库':'已重新加入今日学习（历史记录保留）')};
$('#hideChinese').onclick=e=>{$$('.cn').forEach(x=>x.hidden=!x.hidden);e.currentTarget.textContent=$('.cn').hidden?'显示整句中文':'隐藏整句中文'};
$('#readAll').onclick=()=>speak(SENTENCES.map(x=>x.en).join(' '));
$('#quickQuiz').onclick=()=>{const pool=state.historyWords.length?state.historyWords:DATA,x=pool[Math.floor(Math.random()*pool.length)];$('#sheet').innerHTML=`<button class="close" id="close">✕</button><div style="font-size:.72rem;font-weight:900;color:var(--violet);letter-spacing:.1em">自主复习</div><h3 style="margin-top:9px">“${esc(x.cn)}” 用英语怎么说？</h3><div class="example" id="answer" style="filter:blur(7px);cursor:pointer;text-align:center;font-size:1.35rem"><b>${esc(x.w)}</b><br><small>${esc(x.ipa||'')}</small></div><p style="color:var(--muted);font-size:.86rem;text-align:center">点击卡片揭晓答案</p><div class="actions"><button class="btn soft" id="fuzzy">还不熟</button><button class="btn primary" id="gotit">想起来了</button></div>`;$('#modal').classList.add('open');$('#close').onclick=closeModal;$('#answer').onclick=e=>e.currentTarget.style.filter='none';$('#fuzzy').onclick=()=>{closeModal();toast('已标记：明天优先复习')};$('#gotit').onclick=()=>{closeModal();toast('答对啦 ＋5 能量')}};
$('#openLibrary').onclick=openLibrary;$('#navLibrary').onclick=openLibrary;$('#libraryClose').onclick=()=>$('#libraryOverlay').classList.remove('open');$('#librarySearch').oninput=renderLibrary;
$$('.library-tabs button').forEach(b=>b.onclick=()=>{libraryTab=b.dataset.tab;$$('.library-tabs button').forEach(x=>x.classList.toggle('active',x===b));renderLibrary()});
$('#libraryList').addEventListener('click',e=>{const w=e.target.closest('[data-lib-word]');if(w){const x=state.historyWords.find(v=>v.w===w.dataset.libWord);lookupWord(x.w)}const s=e.target.closest('[data-lib-say]');if(s){const x=state.historySentences.find(v=>v.id===s.dataset.libSay);if(x)speak(x.en)}});
$('#navReview').onclick=()=>{$('#reviewCard').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>$('#quickQuiz').click(),350)};

function drawTime(){const m=Math.floor(time/60),s=time%60;$('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('#focusOverlay').style.setProperty('--timer-progress',((720-time)/720*360)+'deg');$('#timerStatus').textContent=tick?'专注进行中':time===720?'尚未开始':'已暂停';$('#focusStart').textContent=tick?`◉ 专注中 ${Math.floor(time/60)}:${String(s).padStart(2,'0')}`:'◎ 开启专注模式'}
function pauseFocus(){if(tick){clearInterval(tick);tick=null}drawTime();$('#timerToggle').textContent=time===720?'开始 12 分钟专注':'继续专注'}
function finishFocus(){if(tick)clearInterval(tick);tick=null;state.focusSessions.unshift({date:today(),minutes:12});time=720;save();drawTime();confetti();toast('完成 12 分钟专注，记录已保存！');$('#focusOverlay').classList.remove('open')}
$('#focusStart').onclick=()=>{$('#focusOverlay').classList.add('open');drawTime()};
$('#focusClose').onclick=()=>{pauseFocus();$('#focusOverlay').classList.remove('open');toast(time<720?'已保存本次专注进度':'已退出专注模式')};
$('#focusLearn').onclick=()=>{$('#focusOverlay').classList.remove('open');toast(tick?'计时继续，安心学习吧':'请先点击“开始专注”')};
$('#timerToggle').onclick=e=>{if(tick){pauseFocus()}else{e.target.textContent='暂停计时';tick=setInterval(()=>{if(time>1){time--;drawTime()}else finishFocus()},1000);drawTime()}};
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#installBtn').classList.add('ready')});$('#installBtn').onclick=async()=>{if(deferred){deferred.prompt();await deferred.userChoice;deferred=null}else toast('请在浏览器菜单中选择“添加到主屏幕”')};
const d=new Date();$('#dateLabel').textContent=`${d.getMonth()+1}月${d.getDate()}日 · 今日任务`;if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');save();drawTime();
