/* Local composite interpretation. Symbolic rules, not a generative AI or clinical assessment. */
(function(root){
'use strict';
const S=typeof module==='object'&&module.exports?require('./engine.js'):root.Saju;
const Romance=typeof module==='object'&&module.exports?require('./romance.js'):root.RomanceReport;
const ko=g=>Array.from(g).map(c=>S.KO[c]).join('');
const particle=(word,closed,open)=>word+((word.charCodeAt(word.length-1)-0xac00)%28===0?open:closed);
const MATCH=['子丑','寅亥','卯戌','辰酉','巳申','午未'];
const G={비견:0,겁재:0,식신:1,상관:1,편재:2,정재:2,편관:3,정관:3,편인:4,정인:4};
const GROUPS=[
 {name:'비겁',easy:'내 방식대로',word:'내 방식대로 해내는 힘',strength:'누가 시켜서가 아니라 스스로 납득했을 때 힘이 나는 편이에요. 내 페이스를 지키면서 끝까지 해내요',tension:'도와달라고 해도 되는 순간에도 혼자 떠안거나, 다른 의견을 나를 평가하는 말처럼 느낄 때가 있어요',love:'가까운 사이에도 내 시간과 선택을 존중받고 싶어 해요. 취향이 다른 것과 마음이 식은 것은 다르다고 생각하면, 적당한 거리가 오히려 편해져요.',work:'같이 일할 때 내 역할과 결정 범위가 분명하면 마음이 편해요. 남과 비교하기보다 내 목표를 정해두는 게 잘 맞아요'},
 {name:'식상',easy:'표현하고 경험하며',word:'표현하고 직접 해보는 힘',strength:'생각을 말이나 행동으로 바로 옮기고, 일단 해보면서 길을 찾는 편이에요',tension:'마음이 앞서 말이 빨라지거나, 충분히 말했다고 생각해서 상대 반응을 놓칠 때가 있어요',love:'같이 웃고 이야기하고 뭔가 해보는 과정에서 마음을 확인해요. 반응이 적은 상대를 무심하다고 단정하기 전에, 표현 방식이 다른 건 아닌지 보면 좋아요.',work:'완벽한 계획을 기다리기보다, 작게라도 만들어서 반응을 받아보는 방식이 잘 맞아요'},
 {name:'재성',easy:'현실을 챙기며',word:'현실을 챙기고 이어가는 힘',strength:'막연한 가능성보다 실제로 되는 일과 눈에 보이는 결과를 챙기는 편이에요',tension:'해야 할 일과 약속을 챙기다가 내 감정을 뒤로 미루거나, 관계의 노력까지 손익처럼 따질 때가 있어요',love:'좋다는 말만큼 실제로 시간을 내고 약속을 지키는 행동을 중요하게 봐요. 해준 걸 하나씩 세고 있다면, 더 애쓰기보다 내가 뭘 바랐는지 말하는 편이 덜 지쳐요.',work:'시간과 돈을 어디에 쓸지 기준을 정하고, 시작한 일을 감당할 만한 크기로 나누는 게 잘 맞아요'},
 {name:'관성',easy:'책임을 지키며',word:'맡은 걸 지켜내는 힘',strength:'맡은 일을 끝까지 지키고, 관계든 일이든 일관된 기준을 세우는 편이에요',tension:'잘해야 한다는 부담에 쉬운 일에도 긴장하거나, 상대에게도 같은 기준을 기대할 때가 있어요',love:'관계가 어디로 가는지, 서로 약속을 지키는지에서 안정감을 느껴요. 다만 빠른 확답이 꼭 깊은 마음은 아니니, 말보다 행동도 함께 보면 좋아요.',work:'지킬 약속과 내려놓을 부담을 나누고, 책임 범위를 구체적으로 정해두면 편하게 일해요'},
 {name:'인성',easy:'이해하고 정리하며',word:'이해하고 마음을 정리하는 힘',strength:'겉말보다 왜 그런지 배경을 헤아리고, 충분히 이해한 뒤에 움직이는 편이에요',tension:'생각과 준비가 길어져 시작이 늦거나, 상대 말을 혼자 여러 번 곱씹을 때가 있어요',love:'함께 있는 시간의 양보다 내 마음을 이해받는 느낌을 중요하게 봐요. 다 정리한 뒤 말하려다 보면 상대는 거리를 느낄 수 있어요. 아직 잘 모르겠다는 마음부터 나눠도 충분해요.',work:'정보를 더 모으는 시간과 실제로 해보는 시간을 따로 정해두면 잘 맞아요'}
];
const DAY=[
 ['큰 나무','방향을 정하고 꾸준히 지켜가는','일의 의미와 관계의 원칙을 중요하게 여기는'],
 ['풀과 덩굴','주변을 살피며 유연하게 길을 찾는','분위기와 말투의 작은 변화를 세심하게 읽는'],
 ['햇살','마음을 밖으로 나누며 활기를 만드는','함께하는 사람과 경험을 넓혀가려는'],
 ['등불','가까운 곳을 깊고 오래 비추는','마음을 줄 대상과 일을 신중히 고르는'],
 ['큰 산','중심을 잡고 쉽게 흔들리지 않으려는','든든한 기반과 변함없는 태도를 중요하게 여기는'],
 ['밭의 흙','작은 일상을 세심하게 돌보는','사람의 필요를 알아보고 구체적으로 챙기는'],
 ['단단한 금속','기준을 분명히 하고 본질을 고르는','불분명한 상황보다 정리된 약속을 편안하게 느끼는'],
 ['다듬은 보석','작은 차이와 완성도를 알아보는','겉으로 드러내는 것보다 마음속 기준을 섬세하게 세우는'],
 ['큰 강','가능성을 넓히며 유연하게 흐르는','한 가지 답에 머물기보다 다른 관점을 함께 보는'],
 ['이슬과 빗물','조용히 관찰하고 깊이 스며드는','표현하지 않은 감정과 상황의 맥락을 곱씹는']
];
const SEASONS={
春:['봄','寅卯辰','새로 시작하고 자라나는 봄에 태어났어요. 생각을 현실로 키워가려는 마음과, 아직 열려 있는 가능성을 반기는 편이에요.','완성된 모습보다 앞으로 같이 자랄 수 있다는 느낌'],
夏:['여름','巳午未','기운이 바깥으로 활짝 피는 여름에 태어났어요. 혼자 생각만 하기보다 직접 겪고 사람들 반응을 통해 마음을 확인하는 편이에요.','마음을 나누고 함께 살아 있는 경험을 만드는 느낌'],
秋:['가을','申酉戌','거두고 고르는 가을에 태어났어요. 이것저것 벌이기보다 무엇을 남기고 어떤 사람에게 시간을 쓸지 고르는 편이에요.','말뿐인 가능성보다 실제로 확인되는 꾸준함'],
冬:['겨울','亥子丑','안으로 차분히 모으고 준비하는 겨울에 태어났어요. 겉으론 조용해 보여도 속으론 오래 살피고 다음을 준비하는 편이에요.','서두르지 않아도 이해받고 있다는 안정감']};
function relation(a,b){if(a===b)return 'same';if(MATCH.some(p=>p.includes(a)&&p.includes(b)))return 'combine';if(Math.abs(S.ZHI.indexOf(a)-S.ZHI.indexOf(b))===6)return 'clash';return 'none';}
function profile(r){const counts=[0,0,0,0,0];r.pillars.forEach((p,i)=>{if(!p)return;if(i!==1)counts[G[S.god(r.dayGan,p.gan)]]++;counts[G[S.god(r.dayGan,p.hidden[0])]]++;});const order=counts.map((n,i)=>({n,i})).sort((a,b)=>b.n-a.n||a.i-b.i),top=order.filter(x=>x.n===order[0].n).map(x=>x.i);const month=r.pillars[2].zhi,season=Object.values(SEASONS).find(s=>s[1].includes(month));const max=Math.max(...r.counts),dominant=r.counts.map((n,i)=>n===max?i:null).filter(i=>i!==null),missing=r.counts.map((n,i)=>n===0?i:null).filter(i=>i!==null);return {counts,top,main:GROUPS[top[0]],season,dominant,missing,day:DAY[S.GAN.indexOf(r.dayGan)],dayBranch:r.pillars[1].zhi};}
const chapter=(title,...paragraphs)=>({title,paragraphs});
function relationText(r,zhi,label){const p=profile(r),rel=relation(p.dayBranch,zhi),pair=ko(MATCH.find(pair=>pair.includes(p.dayBranch)&&pair.includes(zhi))||[p.dayBranch,zhi].sort((a,b)=>S.ZHI.indexOf(a)-S.ZHI.indexOf(b)).join(''));if(rel==='clash')return `이 시기엔 익숙했던 생활 리듬이나 관계 방식을 한 번 손볼 일이 생길 수 있어요. 이게 꼭 이별이나 나쁜 일을 뜻하진 않아요. 그동안 불편했던 연락 방식이나 약속을 그냥 두기보다, 뭘 바꾸면 편할지 이야기해보기 좋은 때예요.`;if(rel==='combine')return `이 시기엔 사람들과 잘 어울리고 서로 맞춰가기 편한 결이 보여요. 다만 꼭 특별한 인연이 생긴다는 뜻은 아니에요. 가까워질수록 서로의 생활과 거리를 존중하는지도 같이 챙기면 좋아요.`;if(rel==='same')return `이 시기엔 늘 하던 관계 방식과 생활 습관을 다시 돌아보게 돼요. 비슷한 장면에서 자꾸 서운하다면, 상대를 바꾸려 하기 전에 내가 말 안 하고 혼자 기대했던 게 뭔지 떠올려보면 좋아요.`;return `이 시기엔 눈에 띄는 큰 사건보다는 평소 흐름이 이어지는 편이에요. 특별한 신호를 찾기보다, ‘${p.season[3]}’을 중요하게 여기는 내 방식을 실제 관계 속에서 확인해보세요.`;}
const ELEMENT_LIFE=['자라고 뻗어나가는 기운','따뜻하게 드러내는 기운','안정되고 든든한 기운','단단하게 정리하는 기운','부드럽게 흐르는 기운'];
function balance(r,p){const ways=['새로운 일을 작게 시작하고 키워가는 모습','사람들 앞에서 생각과 마음을 나누는 모습','일상의 약속과 기반을 차근차근 챙기는 모습','복잡한 일을 정리하고 기준을 세우는 모습','여러 관점을 듣고 유연하게 방법을 찾는 모습'];const active=p.dominant.map(i=>ways[i]).join(', ');return `사주에 드러난 여러 기운을 함께 보면 ${active}이 눈에 들어와요. ${p.dominant.includes(r.dayElement)?'이런 역할이 내 평소 반응과도 닮아 있어 익숙한 방식을 꾸준히 이어가는 데 도움이 될 수 있어요.':'주변에서 기대하는 역할과 내가 편안하게 느끼는 방식 사이에 차이가 있을 수 있어요. 일을 잘해내는 것만큼 내게 맞는 속도도 함께 챙기면 좋아요.'}`;}

// 원본 문서 6.7의 오행별 직업군(참고용). 특정 직업을 정답으로 제시하지 않는다.
const ELEMENT_FIELD=[
 {name:'목',word:'키우고 가르치고 새로 만드는 일',fields:'교육·기획·디자인·출판·의료처럼 무언가를 자라게 하는 분야'},
 {name:'화',word:'드러내고 알리고 연결하는 일',fields:'미디어·마케팅·IT·서비스처럼 표현과 활기가 필요한 분야'},
 {name:'토',word:'중간에서 잇고 안정시키는 일',fields:'중개·건축·공공·상담처럼 신뢰와 꾸준함이 중요한 분야'},
 {name:'금',word:'정리하고 판단하고 다듬는 일',fields:'금융·회계·법무·기계처럼 기준과 정밀함이 필요한 분야'},
 {name:'수',word:'흐르게 하고 연구하고 소통하는 일',fields:'유통·무역·연구·여행처럼 이동과 사고의 폭이 넓은 분야'}
];
// 십성 그룹별 업무 성향(참고). 강약·용신 확정이 아니라 경향으로 서술.
const WORK_STYLE=[
 '스스로 납득한 방향에서 힘이 나는 편이라, 역할과 결정권이 분명한 자리에서 편하게 일해요',
 '생각을 만들고 표현하는 과정에서 힘이 나는 편이라, 결과물을 내보이고 반응을 주고받는 일에서 잘 맞아요',
 '현실적인 결과와 지속성을 챙기는 편이라, 자원과 시간을 관리하고 눈에 보이는 성과를 만드는 일에서 강점이 드러나요',
 '맡은 약속과 기준을 끝까지 지키는 편이라, 책임 범위가 또렷한 조직이나 역할에서 신뢰를 얻기 쉬워요',
 '배경과 이유를 충분히 이해한 뒤 움직이는 편이라, 깊이 파고들고 배우는 일에서 꾸준히 성장해요'
];
function career(r,p){const field=ELEMENT_FIELD[r.dayElement];return {title:'나에게 맞는 일과 돈 관리 방식',lead:`사주를 보면 ${p.main.strength}. 이런 성향이 일과 돈을 관리할 때 어떻게 나타날 수 있는지 풀어봤어요.`,chapters:[chapter('능력을 발휘하기 편한 방식',WORK_STYLE[p.top[0]]+'.',p.top.length>1?`여러 성향이 함께 나타나서 한 가지 역할만으로 나를 설명하기는 어려워요. ${p.top.slice(1).map(i=>WORK_STYLE[i]+'.').join(' ')}`:p.main.work+'.'),chapter('강점과 함께 챙길 보완점',p.main.strength+'.',p.main.tension+'. 바쁜 시기에는 내가 맡을 일과 도움을 받을 일을 미리 나누어두면 부담을 덜 수 있어요.'),chapter('돈을 벌고 관리하는 태도',p.counts[2]>0?'눈에 보이는 결과와 자원을 챙기는 성향을 돈 관리에서도 살려볼 수 있어요. 사고 싶은 것이 생기면 가격뿐 아니라 얼마나 자주 쓸지도 함께 생각하면 내 기준을 세우는 데 도움이 돼요.':'현재 확인된 정보만으로 돈을 다루는 성향을 단정하기는 어려워요. 수입과 고정 지출을 한곳에 적고, 자유롭게 쓸 금액을 따로 정해두는 방법을 참고할 수 있어요.'),chapter('일상에서 살려볼 방향',`${field.word}을 전통적인 참고 방향으로 살펴볼 수 있어요. ${field.fields}가 그 예예요. 직업을 바꾸는 결론으로 바로 이어가기보다, 지금 하는 일 안에서 관심이 가는 활동을 작게 경험해보는 편이 좋아요.`)]};}

function period(r,p,a,label,context){const group=GROUPS[G[a.ganGod]];const same=G[a.ganGod]===p.top[0];let repetition=same?`마침 평소 내가 잘 쓰는 ‘${p.main.word}’과 비슷한 흐름이에요. 익숙한 장점을 그대로 살리기 좋되, ${p.main.tension}. 비슷한 부담이 반복되는지만 가끔 점검하면 좋아요.`:`평소 익숙한 ‘${p.main.word}’에, 이번엔 ‘${group.word}’이라는 조금 다른 주제가 더해지는 때예요. 늘 하던 방식만으로 안 풀릴 땐 ${group.work}.`;return {title:a.theme[0],lead:`${particle(label,'은','는')} ‘${group.word}’이 중심 주제로 떠오르는 흐름이에요. 어떤 일이 정해져 있다기보다, 이런 결을 어떻게 다루면 좋을지 생각해보기 좋은 때예요.`,chapters:[chapter('이 시기에 읽히는 주제',a.theme[1]+' '+repetition),chapter('관계에서 나타날 수 있는 모습',relationText(r,a.zhi,label),a.theme[2]+' '+p.main.love),chapter('관심을 두거나 점검해볼 부분',`${group.work}. 한 해나 10년의 흐름이 내 선택을 대신해주진 않아요. 바꾸고 싶은 게 있다면 상대의 실제 행동과 지금 형편을 보고 작은 것부터 정해가는 편이 훨씬 도움이 돼요.`),...(context?[chapter('더 긴 흐름과 함께 보면',context)]:[])]};}
function build(r,f,cycleIndex){const p=profile(r),day=S.KO[r.dayGan]+'('+r.dayGan+')',others=p.top.map(i=>GROUPS[i].name).join('·'),month=S.KO[r.pillars[2].zhi];const current=f.daeun?.cycles.find(c=>c.current);const birthNote=r.input.unknown?'태어난 시간을 몰라서 시주를 제외하고 읽은 해설이에요. 시간이 확인되면 조금 더 또렷해지는 부분이 있어요.':'태어난 날을 중심으로, 한 가지 기운에만 기대지 않고 여러 결을 함께 보고 쓴 해설이에요.';
const secondary=p.counts.map((n,i)=>({n,i})).filter(x=>!p.top.includes(x.i)&&x.n>0).sort((a,b)=>b.n-a.n||a.i-b.i);
const personality={title:`${p.day[1]} 사람`,lead:`${p.day[0]}에 비유되는 결을 타고났어요. 한마디로 ${p.day[2]} 편이에요. 여기에 태어난 계절과 성향이 더해지면 나만의 색이 생겨요.`,chapters:[chapter('내가 중요하게 여기는 것',`${p.season[2]} ${p.main.strength}.`),chapter('자연스럽게 드러나는 강점',`${p.main.strength}.`,secondary.length?`이와 함께 이런 모습도 읽혀요. ${GROUPS[secondary[0].i].strength}.`:'여러 성향이 고르게 나타나 상황에 따라 강점을 달리 살릴 수 있어요.',p.top.length>1?`${p.top.map(i=>GROUPS[i].easy).join(', ')} 하는 결이 같이 있어서, 상황에 따라 다른 모습이 나와요. 회의에서는 꼼꼼하다가 친구들 사이에선 분위기를 띄우는 식으로요. 한 가지 모습으로 나를 가둘 필요는 없어요.`:`이 결이 꽤 또렷한 편이라, 평소엔 든든한 강점이 돼요. 상황에 맞게 조금씩 힘을 빼고 넣는 연습만 더하면 돼요.`),chapter('부담을 느끼기 쉬운 상황',`${p.main.tension}. 이럴 땐 혼자 애쓰지 말고, 지금 내가 좀 과하게 신경 쓰고 있다는 걸 알아차리는 것만으로도 한결 가벼워져요.`),chapter('나에게 맞는 균형 잡는 법',balance(r,p),`${p.main.work}. 그리고 ‘${p.season[3]}’을 내가 중요하게 여긴다는 걸 인정해주면, 뭘 좋아해야 하는지보다 어떤 순간에 편하고 불편한지를 더 쉽게 알 수 있어요.`,birthNote)]};
const annual=f.annual.map(a=>{const byCycle=f.daeun?.cycles.filter(c=>{const {from,to}=S.yearWindow(a.year);return c.from<to&&c.to>from;});const context=byCycle?.length?`${a.year}년 즈음은 지금 지나는 큰 흐름(${byCycle.map(c=>ko(c.gan+c.zhi)+' 시기').join(', ')})과 겹쳐요. 10년짜리 큰 흐름이 배경이라면 한 해는 그 안의 한 장면이에요. 둘이 비슷한 주제면 그만큼 또렷해지고, 다르면 두 가지를 조율하는 해가 돼요.`:null;return {...a,...period(r,p,a,`${a.year}년`,context)};});
const selected=f.daeun?.cycles[cycleIndex??f.daeun.cycles.findIndex(c=>c.current)]||f.daeun?.cycles[0];const daeun=selected?{...selected,...period(r,p,selected,`${ko(selected.gan+selected.zhi)} 시기`,`평소 내가 잘 쓰는 결은 ‘${p.main.easy}’예요. 이 10년을 볼 때도 그 바탕을 같이 생각하면 좋아요. 큰 흐름이 바뀐다고 타고난 성격이 사라지는 건 아니고, 익숙한 나를 새 환경에서 어떻게 쓸지 다시 맞춰보는 시간이에요.`)}:null;
const careerReport=career(r,p);
const summary=buildSummary(r,p);
const evidence=buildEvidence(r,p);
return {profile:p,summary,evidence,personality,love:Romance.build(r,f),career:careerReport,annual,daeun};}
// 일간별 한 단어 성향 키워드(일상어)
const DAY_KEYWORD=['곧은 심지','유연함','따뜻함','섬세함','든든함','살뜰함','단단함','섬세한 기준','넓은 시야','차분함'];
const GROUP_KEYWORD=['내 페이스','표현력','현실 감각','책임감','깊은 이해'];
const ELEMENT_KEYWORD=['성장','표현','안정','정리','소통'];
// ① 요약: 쉬운 핵심 문장 2~3개 + 일상어 키워드 최대 3개
function buildSummary(r,p){const day=DAY[S.GAN.indexOf(r.dayGan)];
 const kw=[DAY_KEYWORD[S.GAN.indexOf(r.dayGan)],GROUP_KEYWORD[p.top[0]]];const extra=p.dominant.length?ELEMENT_KEYWORD[p.dominant[0]]:null;if(extra&&!kw.includes(extra))kw.push(extra);const keywords=kw.slice(0,3);
 const lines=[`${day[0]}에 비유되는, ${day[2]} 사람이에요.`,`${p.main.strength}.`,r.input.unknown?`태어난 시간을 몰라서 시간과 상관없는 부분만 담았어요. 아래에서 성격·연애·일·시기를 더 자세히 볼 수 있어요.`:`아래에서 성격·연애·일과 재물·시기별 흐름을 하나씩 쉽게 풀어드릴게요.`];
 return {keywords,text:lines.join(' ')};}
// ③ 해석 근거: 각 분야가 실제로 사용한 원국 데이터를 분야별로 정리
function buildEvidence(r,p){const pillarGods=r.pillars.map((pl,i)=>pl?{label:['시주','일주','월주','년주'][i],gan:pl.gan,zhi:pl.zhi,ganGod:i===1?'일간(나)':S.god(r.dayGan,pl.gan),zhiGod:S.god(r.dayGan,pl.hidden[0])}:{label:['시주','일주','월주','년주'][i],empty:true});
 const groupCounts=[0,0,0,0,0];r.pillars.forEach((pl,i)=>{if(!pl)return;if(i!==1)groupCounts[G[S.god(r.dayGan,pl.gan)]]++;groupCounts[G[S.god(r.dayGan,pl.hidden[0])]]++;});
 return {
 personality:[`일간: ${S.KO[r.dayGan]}(${r.dayGan}) · ${S.ELEMENTS[r.dayElement].name}(${S.ELEMENTS[r.dayElement].han})`,`월지(계절): ${S.KO[r.pillars[2].zhi]}(${r.pillars[2].zhi})${p.season?' · '+p.season[0]:''}`,`자주 나타나는 십성 그룹: ${p.top.map(i=>GROUPS[i].name).join('·')}`,`표면 오행 분포: ${S.ELEMENTS.map((e,i)=>e.name+' '+r.counts[i]).join(', ')}`],
 love:[`일지(배우자궁): ${S.KO[r.pillars[1].zhi]}(${r.pillars[1].zhi})`,`관계 성향에 쓰인 주제: ${p.main.name}`,'연애 해설은 상대의 출생 정보 없이 ‘나의 관계 성향’으로만 읽었어요. 두 사람 궁합 계산이 아닙니다.'],
 career:[`일간 오행: ${S.ELEMENTS[r.dayElement].name}`,`십성 그룹별 개수(지지 본기 포함): 비겁 ${groupCounts[0]}, 식상 ${groupCounts[1]}, 재성 ${groupCounts[2]}, 관성 ${groupCounts[3]}, 인성 ${groupCounts[4]}`,'직업 분류는 원본 문서의 참고 기준이며 특정 직업을 정답으로 제시하지 않아요.'],
 pillarGods};}
const api={build,profile,relation,relationText};if(typeof module==='object'&&module.exports)module.exports=api;else root.SajuReport=api;
})(typeof globalThis==='object'?globalThis:this);
