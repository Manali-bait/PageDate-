const $=s=>document.querySelector(s);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
function el(t,p={},...k){const e=document.createElement(t);Object.assign(e,p);k.flat().forEach(c=>e.append(c));return e}
const MOODS={Cozy:'cozy mystery',Romantic:'romance',Emotional:'emotional',Mysterious:'mystery',Adventurous:'adventure',Magical:'magic',Funny:'humor','Dark Academia':'dark academia','Comfort Read':'feel good',Thoughtful:'philosophy',Suspenseful:'suspense thriller',Inspirational:'inspirational'};
const TROPES=['Enemies to Lovers','Friends to Lovers','Slow Burn','Found Family','Second Chance','Forbidden Love','Coming of Age','Hidden Identity','Survival','Time Travel','Unexpected Friendship','Grumpy Sunshine','Fake Dating'];
let shelf=load('pd-shelf',[]),journal=load('pd-journal',[]),goal=load('pd-goal',12),editing=null;
// tabs + theme
function tab(t){document.querySelectorAll('main>section').forEach(s=>s.hidden=s.id!==t);document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 if(t==='shelf')drawShelf();if(t==='journal')drawJournal();if(t==='stats')drawStats();if(t==='quote')drawQuote()}
$('#tabs').onclick=e=>{if(e.target.dataset.t)tab(e.target.dataset.t)};
$('#theme').value=load('pd-theme','midnight');document.documentElement.dataset.theme=$('#theme').value;
$('#theme').onchange=e=>{document.documentElement.dataset.theme=e.target.value;save('pd-theme',e.target.value)};
// Open Library
async function ol(q,page=1){const f='key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject';
 const r=await fetch(`https://openlibrary.org/search.json?limit=20&page=${page}&fields=${f}&q=${encodeURIComponent(q)}`);
 if(!r.ok)throw new Error('Open Library is unavailable. Please try again.');const d=await r.json();
 return d.docs.map(b=>({id:b.key,title:b.title,author:(b.author_name||[])[0]||'Unknown author',cover:b.cover_i?`https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`:null,pages:b.number_of_pages_median||null,year:b.first_publish_year||null,subject:(b.subject||[])[0]||null}))}
function chips(box,items,key){items.forEach(n=>box.append(el('button',{className:'chip',type:'button',textContent:n,onclick:e=>{const on=e.target.classList.contains('on');box.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));if(!on)e.target.classList.add('on');sel[key]=on?'':n}})))}
const sel={mood:'',trope:''};chips($('#moods'),Object.keys(MOODS),'mood');chips($('#tropes'),TROPES,'trope');
function card(b){const c=el('article',{className:'card'},b.cover?el('img',{src:b.cover,alt:'Cover of '+b.title,loading:'lazy'}):el('div',{className:'nc',textContent:'No cover'}),el('h4',{textContent:b.title}),el('small',{textContent:b.author}));
 c.append(el('button',{className:'btn',textContent:'Add to shelf',onclick:e=>{if(shelf.some(x=>x.id===b.id)){e.target.textContent='Already on shelf';return}
  shelf.unshift({...b,status:'want',page:0,rating:'',added:Date.now()});save('pd-shelf',shelf);e.target.textContent='Added!'}}));return c}
let page=1,lastQ='';
async function run(more){const base=$('#q').value.trim(),parts=[base,sel.mood&&MOODS[sel.mood],sel.trope&&sel.trope.replace('Grumpy Sunshine','grumpy sunshine')].filter(Boolean);
 if(!parts.length){$('#msg').textContent='Type something or pick a mood or trope.';return}
 lastQ=more?lastQ:parts.join(' ');page=more?page+1:1;$('#msg').textContent='Searching...';if(!more)$('#res').innerHTML='';
 try{const bs=await ol(lastQ,page);bs.forEach(b=>$('#res').append(card(b)));$('#more').hidden=bs.length<20;
  $('#msg').textContent=$('#res').children.length?'':'No books found. Try different words.'}catch(e){$('#msg').textContent=e.message}}
$('#sf').onsubmit=e=>{e.preventDefault();run(false)};$('#more').onclick=()=>run(true);
document.querySelectorAll('#moods,#tropes').forEach(b=>b.addEventListener('click',()=>run(false)));
// shelf
const ST={want:'Want to Read',reading:'Currently Reading',read:'Read',hold:'On Hold',dnf:'Did Not Finish'};
const opts=(s,o,v)=>{s.innerHTML='';Object.entries(o).forEach(([k,l])=>s.append(el('option',{value:k,textContent:l,selected:k===v})))};
opts($('#fs'),{all:'All books',...ST},'all');$('#fs').onchange=drawShelf;
function drawShelf(){const L=$('#shelfList');L.innerHTML='';const f=$('#fs').value,rows=shelf.filter(b=>f==='all'||b.status===f);
 if(!rows.length)L.append(el('p',{textContent:'Nothing here yet. Add books from Discover.'}));
 rows.forEach(b=>{const st=el('select',{onchange:e=>{b.status=e.target.value;if(b.status==='read'){b.finished=Date.now();if(b.pages)b.page=b.pages}save('pd-shelf',shelf);drawShelf()}});opts(st,ST,b.status);
  const rt=el('select',{onchange:e=>{b.rating=e.target.value;save('pd-shelf',shelf)}});opts(rt,{'':'Rating',1:'1 star',2:'2 stars',3:'3 stars',4:'4 stars',5:'5 stars'},String(b.rating));
  const pct=b.pages?Math.min(100,Math.round(b.page/b.pages*100)):0;
  const pg=b.pages?el('label',{textContent:'Page '},el('input',{type:'number',min:0,max:b.pages,value:b.page,style:'width:80px',onchange:e=>{b.page=+e.target.value;save('pd-shelf',shelf);drawShelf()}}),` / ${b.pages} (${pct}%)`):'';
  L.append(el('div',{className:'item'},b.cover?el('img',{src:b.cover,alt:''}):'',el('div',{},el('b',{textContent:b.title}),el('div',{textContent:b.author,style:'color:var(--mu)'}),el('div',{className:'row'},st,rt,pg,
   el('button',{className:'btn',textContent:'Remove',onclick:()=>{if(confirm('Remove this book from your shelf?')){shelf=shelf.filter(x=>x!==b);save('pd-shelf',shelf);drawShelf()}}})))))})}
// blind date
opts($('#bm'),{'':'Any mood',...Object.fromEntries(Object.keys(MOODS).map(m=>[m,m]))},'');opts($('#bt'),{'':'Any trope',...Object.fromEntries(TROPES.map(m=>[m,m]))},'');
$('#wrap').onclick=async()=>{const m=$('#bm').value,t=$('#bt').value,q=[m&&MOODS[m],t].filter(Boolean).join(' ')||'fiction';$('#bd').innerHTML='Wrapping...';
 try{const bs=(await ol(q,1+Math.floor(Math.random()*3))).filter(b=>b.cover);if(!bs.length){$('#bd').textContent='No match found. Try another combination.';return}
  const b=bs[Math.floor(Math.random()*bs.length)],tease=`${m||'A surprising'} story${t?' built on '+t.toLowerCase():''}${b.year?', first published in '+b.year:''}${b.subject?'. Subject: '+b.subject:''}.`;
  const w=el('div',{className:'wrapped'},el('div',{textContent:'🎁',style:'font-size:3rem'}),el('p',{textContent:tease}),el('button',{className:'btn',textContent:'Reveal My Book',onclick:()=>{w.innerHTML='';w.append(card(b),el('button',{className:'btn',textContent:'Another one',style:'margin-top:8px',onclick:()=>$('#wrap').click()}))}}));
  $('#bd').innerHTML='';$('#bd').append(w)}catch(e){$('#bd').textContent=e.message}};
// journal
function jbooks(){opts($('#jb'),{'':'No book selected',...Object.fromEntries(shelf.map(b=>[b.id,b.title]))},'')}
function drawJournal(){jbooks();$('#jd').value=$('#jd').value||new Date().toISOString().slice(0,10);const L=$('#jl'),q=$('#jq').value.toLowerCase();L.innerHTML='';
 journal.filter(j=>(j.text+j.title).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date)).forEach(j=>L.append(el('div',{className:'item'},el('div',{},el('b',{textContent:(j.title||'General entry')+(j.rating?' ('+j.rating+'/5)':'')}),el('div',{textContent:j.date,style:'color:var(--mu)'}),el('p',{textContent:j.text}),
  el('div',{className:'row'},el('button',{className:'btn',textContent:'Edit',onclick:()=>{editing=j.id;$('#jb').value=j.book;$('#jd').value=j.date;$('#jr').value=j.rating;$('#jt').value=j.text;scrollTo(0,0)}}),
  el('button',{className:'btn',textContent:'Delete',onclick:()=>{if(confirm('Delete this entry?')){journal=journal.filter(x=>x!==j);save('pd-journal',journal);drawJournal()}}}))))))}
$('#jq').oninput=drawJournal;
$('#js').onclick=()=>{const text=$('#jt').value.trim();if(!text){alert('Write something first.');return}
 const b=shelf.find(x=>x.id===$('#jb').value),e={id:editing||String(Date.now()),book:$('#jb').value,title:b?b.title:'',date:$('#jd').value,rating:$('#jr').value,text};
 journal=editing?journal.map(x=>x.id===editing?e:x):[e,...journal];editing=null;save('pd-journal',journal);$('#jt').value='';drawJournal()};
// quote studio
const QT={Midnight:['#17243A','#FAF7F0','#D6B36A'],'Dark Academia':['#2b1d16','#e9dcc3','#a8784a'],Botanical:['#e8f0e4','#1e3326','#2f6b45'],Pastel:['#fbe3ec','#583D59','#c2577f'],'Vintage Library':['#f2e6cf','#3b2a22','#8a5a3c'],Minimalist:['#ffffff','#111111','#999999'],'Modern Editorial':['#FAF7F0','#17243A','#D6B36A']};
opts($('#qs'),Object.fromEntries(Object.keys(QT).map(k=>[k,k])),'Midnight');
function drawQuote(){const c=$('#cv'),x=c.getContext('2d'),[bg,fg,ac]=QT[$('#qs').value],W=1080,al=$('#qal').value,sz=+$('#qz').value,f=$('#qf').value;
 x.fillStyle=bg;x.fillRect(0,0,W,W);x.strokeStyle=ac;x.lineWidth=6;x.strokeRect(50,50,W-100,W-100);
 x.fillStyle=ac;x.font=`160px ${f}`;x.textAlign='left';x.fillText('\u201C',90,230);
 x.fillStyle=fg;x.font=`italic ${sz}px ${f}`;x.textAlign=al;const px=al==='center'?W/2:110,mw=W-220,lines=[];let ln='';
 ($('#qt').value||'').split(/\s+/).forEach(w=>{const t=ln?ln+' '+w:w;if(x.measureText(t).width>mw&&ln){lines.push(ln);ln=w}else ln=t});lines.push(ln);
 const lh=sz*1.35,y0=Math.max(300,W/2-(lines.length*lh)/2);lines.forEach((l,i)=>x.fillText(l,px,y0+i*lh));
 x.fillStyle=ac;x.font=`32px ${f}`;const by=[$('#qb').value&&'\u2014 '+$('#qb').value,$('#qa').value].filter(Boolean).join(', ');x.fillText(by,px,W-120);
 x.font='24px '+f;x.textAlign='right';x.fillStyle=fg;x.globalAlpha=.6;x.fillText('PageDate',W-90,W-80);x.globalAlpha=1}
['qt','qb','qa','qs','qf','qz','qal'].forEach(i=>$('#'+i).addEventListener('input',drawQuote));
$('#qd').onclick=()=>{const a=el('a',{href:$('#cv').toDataURL('image/png'),download:'pagedate-quote.png'});a.click()};
if(navigator.canShare){$('#qsh').hidden=false;$('#qsh').onclick=()=>$('#cv').toBlob(async b=>{const f=new File([b],'quote.png',{type:'image/png'});try{if(navigator.canShare({files:[f]}))await navigator.share({files:[f]})}catch(e){}})}
// stats (all numbers computed from your data)
function drawStats(){const y=new Date().getFullYear(),read=shelf.filter(b=>b.status==='read'),thisY=read.filter(b=>b.finished&&new Date(b.finished).getFullYear()===y),
 mo=Array(12).fill(0);thisY.forEach(b=>mo[new Date(b.finished).getMonth()]++);const subs={};read.forEach(b=>{if(b.subject)subs[b.subject]=(subs[b.subject]||0)+1});
 const top=Object.entries(subs).sort((a,b)=>b[1]-a[1]).slice(0,5),mx=Math.max(1,...mo),S=$('#st');S.innerHTML='';
 [['Read',read.length],['Reading now',shelf.filter(b=>b.status==='reading').length],['Want to read',shelf.filter(b=>b.status==='want').length],['This month',mo[new Date().getMonth()]]].forEach(([l,v])=>S.append(el('div',{className:'stat'},el('b',{textContent:v}),l)));
 S.append(el('p',{},`Yearly goal: `,el('input',{type:'number',min:1,value:goal,style:'width:80px',onchange:e=>{goal=Math.max(1,+e.target.value);save('pd-goal',goal);drawStats()}}),` books. Progress: ${thisY.length}/${goal} (${Math.min(100,Math.round(thisY.length/goal*100))}%)`));
 S.append(el('h3',{textContent:'Books finished by month, '+y}),el('div',{className:'bar'},mo.map((n,i)=>el('div',{style:`height:${n/mx*100}%`,title:n+' books'},el('span',{textContent:'JFMAMJJASOND'[i]})))),el('br'),el('h3',{textContent:'Top subjects in books you read'}),
  el('p',{textContent:top.length?top.map(t=>t[0]+' ('+t[1]+')').join(', '):'Mark books as Read to see this.'}))}
tab('discover');