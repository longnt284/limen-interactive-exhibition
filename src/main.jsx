import React,{Suspense,lazy,useState,useEffect,useRef,Component} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowUpRight} from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import {ArrowRight} from '@phosphor-icons/react/dist/csr/ArrowRight';
import {Pause} from '@phosphor-icons/react/dist/csr/Pause';
import {Play} from '@phosphor-icons/react/dist/csr/Play';
import {SpeakerHigh} from '@phosphor-icons/react/dist/csr/SpeakerHigh';
import {SpeakerSlash} from '@phosphor-icons/react/dist/csr/SpeakerSlash';
import {Sun} from '@phosphor-icons/react/dist/csr/Sun';
import {Moon} from '@phosphor-icons/react/dist/csr/Moon';
import {X} from '@phosphor-icons/react/dist/csr/X';
import {ArrowsClockwise} from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import {FadersHorizontal} from '@phosphor-icons/react/dist/csr/FadersHorizontal';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {chapters} from './chapters';
import {createSoundscape} from './sound';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/vietnamese-400.css';
import '@fontsource/manrope/vietnamese-500.css';
import '@fontsource/manrope/vietnamese-600.css';
import './style.css';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
const Scene=lazy(()=>import('./Scene'));
// h,s,l,alpha của chữ nền cho mỗi giao diện; TINT là độ lệch hue/lum của tám chương, khớp với bảng trạng thái trong Scene.
const DISPLAY={dark:[118,10,49,.17],light:[105,15,47,.15]};
const TINT=[[0,0],[3.6,2],[-5.4,.8],[-10.8,-1],[7.9,3],[-14.4,-2],[2.9,1],[0,5]];
// Chữ khổng lồ trôi mỗi chương một tốc độ khác nhau. Chênh lệch tốc độ chính là thứ tạo ra chiều sâu:
// Ngưỡng cửa gần như đứng yên phía sau, Phân rã trượt nhanh nhất.
const DRIFT=[-14,-22,-30,-24,-18,-34,-26,-12];
const SPLIT=[5,6];
class Boundary extends Component{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="fallback" role="status">Cảnh 3D không khả dụng trên trình duyệt này. Hành trình nội dung vẫn tiếp tục.</div>:this.props.children}}
function App(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches),[paused,setPaused]=useState(false),[speed,setSpeed]=useState(1),[sound,setSound]=useState(false),[light,setLight]=useState(!matchMedia('(prefers-color-scheme: dark)').matches),[info,setInfo]=useState(false),[hidden,setHidden]=useState(document.hidden),[panel,setPanel]=useState(false),[pointerOn,setPointerOn]=useState(true);
 const signal=useRef({p:0,smooth:0,tail:0,tailSmooth:0,v:0,turn:0,invalidate:null}),pointer=useRef({x:0,y:0}),root=useRef(),audio=useRef(),dialog=useRef(),rail=useRef(),bar=useRef(),panelRef=useRef(),panelButton=useRef();
 useEffect(()=>{document.documentElement.dataset.theme=light?'light':'dark'},[light]);
 // Giao diện đọc cùng nhịp màu với cảnh 3D: chữ nền khổng lồ và thanh địa chỉ trôi theo tông của chương đang mở.
 useEffect(()=>{
  const [h,s,l,alpha]=DISPLAY[light?'light':'dark'],[dh,dl]=TINT[active];
  document.documentElement.style.setProperty('--display',`hsl(${h+dh} ${s}% ${l+dl}% / ${alpha})`);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content',light?'#dce3db':'#111c1b');
 },[active,light]);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(mq.matches);const visibility=()=>setHidden(document.hidden);mq.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);return()=>{mq.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{const move=e=>{pointer.current.x=e.clientX/innerWidth*2-1;pointer.current.y=e.clientY/innerHeight*2-1};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);
 // Fonts change text metrics, so trigger positions are only final once they land.
 useEffect(()=>{document.fonts?.ready.then(()=>ScrollTrigger.refresh()).catch(()=>{})},[]);
 useEffect(()=>{
  const ctx=gsap.context(()=>{
   const sections=gsap.utils.toArray('.chapter');
   let tops=[];
   const measure=()=>{const y=scrollY;tops=sections.map(s=>s.getBoundingClientRect().top+y)};
   // Section heights are not uniform (mobile, short viewports), so map scroll through the real offsets.
   const chapterAt=y=>{
    if(tops.length<2)return 0;
    if(y<=tops[0])return 0;
    for(let i=0;i<tops.length-1;i++)if(y<tops[i+1])return i+(y-tops[i])/(tops[i+1]-tops[i]);
    return tops.length-1;
   };
   // Chương cuối không có chương sau để nội suy tới, nên nó có tiến độ riêng. Cảnh dùng giá trị này để
   // lắng dần qua suốt màn cuối thay vì đứng yên ngay lúc vừa tới.
   const tailAt=y=>{
    const last=tops[tops.length-1],maxY=document.documentElement.scrollHeight-innerHeight;
    return maxY>last+1?Math.min(1,Math.max(0,(y-last)/(maxY-last))):0;
   };
   const fillTo=rail.current?gsap.quickTo(rail.current,'scaleY',{duration:.5,ease:'power2.out'}):null;
   const barTo=bar.current?gsap.quickTo(bar.current,'scaleX',{duration:.5,ease:'power2.out'}):null;
   ScrollTrigger.create({
    trigger:root.current,start:'top top',end:'bottom bottom',refreshPriority:-1,
    onRefresh:measure,
    onUpdate:self=>{
     const y=self.scroll(),p=chapterAt(y);
     signal.current.p=p;signal.current.tail=tailAt(y);signal.current.v=self.getVelocity();signal.current.invalidate?.();
     fillTo?.(p/(sections.length-1));
     barTo?.(self.progress);
    },
   });
   measure();signal.current.p=chapterAt(scrollY);signal.current.smooth=signal.current.p;
   signal.current.tail=tailAt(scrollY);signal.current.tailSmooth=signal.current.tail;
   fillTo?.(signal.current.p/(sections.length-1));
   sections.forEach((section,i)=>{
    ScrollTrigger.create({trigger:section,start:'top 50%',end:'bottom 50%',onToggle:s=>{if(s.isActive)setActive(i)}});
    if(reduced)return;
    const lines=section.querySelectorAll('.chapter-copy h1 .line,.chapter-copy h2 .line');
    const detail=section.querySelectorAll('.chapter-copy .eyebrow,.chapter-copy p,.chapter-copy .text-link,.chapter-copy .chapter-caption');
    const word=section.querySelector('.chapter-word');
    const pieces=section.querySelectorAll('.word-piece');
    if(i>0){
     gsap.fromTo(lines,{yPercent:46,opacity:0,rotationX:-32},{yPercent:0,opacity:1,rotationX:0,transformPerspective:560,transformOrigin:'50% 100%',stagger:.13,ease:'none',
      scrollTrigger:{trigger:section,start:'top 82%',end:'top 26%',scrub:.4}});
     gsap.fromTo(detail,{y:34,opacity:0},{y:0,opacity:1,stagger:.1,ease:'none',
      scrollTrigger:{trigger:section,start:'top 74%',end:'top 22%',scrub:.4}});
    }
    gsap.to(word,{yPercent:DRIFT[i],ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true}});
    const through={trigger:section,start:'top 70%',end:'bottom 30%',scrub:.5};
    // Chữ chịu đúng chuyện đang xảy ra với hình khối: Khai mở giãn ra, Nở rộ lớn lên,
    // Phân rã tách đôi theo đường nứt, Hội tụ khép lại, Dư âm tan vào khí quyển.
    if(i===1)gsap.fromTo(word,{letterSpacing:'-.075em'},{letterSpacing:'-.028em',ease:'none',scrollTrigger:through});
    if(i===4)gsap.fromTo(word,{scale:1},{scale:1.07,transformOrigin:'0% 50%',ease:'none',scrollTrigger:through});
    if(i===5&&pieces.length)gsap.fromTo(pieces,{xPercent:0,yPercent:0},{xPercent:idx=>idx?-3.4:3.4,yPercent:idx=>idx?1.2:-1.2,ease:'none',scrollTrigger:through});
    if(i===6&&pieces.length)gsap.fromTo(pieces,{xPercent:idx=>idx?2.8:-2.8,yPercent:idx=>idx?-1:1},{xPercent:0,yPercent:0,ease:'none',scrollTrigger:through});
    if(i===7)gsap.fromTo(word,{opacity:1,scale:1,letterSpacing:'-.075em'},{opacity:.28,scale:1.12,letterSpacing:'-.02em',transformOrigin:'0% 50%',ease:'none',
     scrollTrigger:{trigger:section,start:'top 60%',end:'bottom bottom',scrub:.6}});
   });
  },root);
  return()=>ctx.revert();
 },[reduced]);
 useEffect(()=>{
  if(reduced)return;
  const ctx=gsap.context(()=>{
   gsap.from('header > *',{y:-26,opacity:0,duration:1,stagger:.1,ease:'power3.out',delay:.15});
   gsap.from('.chapter-0 .chapter-copy .line',{yPercent:58,opacity:0,duration:1.25,stagger:.12,ease:'power3.out',delay:.35});
   gsap.from('.chapter-0 .chapter-copy .eyebrow,.chapter-0 .chapter-copy p,.chapter-0 .chapter-copy .text-link',{y:26,opacity:0,duration:1,stagger:.1,ease:'power3.out',delay:.75});
   gsap.from('.experience-bar,.chapter-nav',{opacity:0,duration:1.1,ease:'power2.out',delay:1});
  });
  return()=>ctx.revert();
 },[reduced]);
 useEffect(()=>{if(info)dialog.current?.showModal();else if(dialog.current?.open)dialog.current.close()},[info]);
 useEffect(()=>()=>{audio.current?.close()},[]);
 // Bảng tùy chỉnh không khoá trang: người xem vẫn cuộn được khi đang chỉnh. Đóng bằng Esc hoặc bấm ra ngoài,
 // và tiêu điểm quay lại đúng nút đã mở nó.
 useEffect(()=>{
  if(!panel)return;
  panelRef.current?.querySelector('button,input')?.focus();
  const key=e=>{if(e.key==='Escape'){e.stopPropagation();setPanel(false);panelButton.current?.focus()}};
  const out=e=>{if(!panelRef.current?.contains(e.target)&&!panelButton.current?.contains(e.target))setPanel(false)};
  document.addEventListener('keydown',key,true);
  document.addEventListener('pointerdown',out);
  return()=>{document.removeEventListener('keydown',key,true);document.removeEventListener('pointerdown',out)};
 },[panel]);
 function go(i){document.getElementById(chapters[i].id)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})}
 useEffect(()=>{
  const key=e=>{
   if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey)return;
   const tag=document.activeElement?.tagName;
   if(dialog.current?.open||tag==='INPUT'||tag==='TEXTAREA'||document.activeElement?.isContentEditable)return;
   const step=n=>{e.preventDefault();go(Math.min(chapters.length-1,Math.max(0,active+n)))};
   if(e.key==='ArrowDown'||e.key==='PageDown')step(1);
   else if(e.key==='ArrowUp'||e.key==='PageUp')step(-1);
   else if(e.key==='Home'){e.preventDefault();go(0)}
   else if(e.key==='End'){e.preventDefault();go(chapters.length-1)}
  };
  window.addEventListener('keydown',key);
  return()=>window.removeEventListener('keydown',key);
 },[active,reduced]);
 // Cảnh âm đọc đúng tiến độ đã làm mượt của phần hình, nhịp 180ms. Không đặt React state trong vòng render,
 // cũng không chạy theo từng khung hình: âm thanh chỉ cần đi đúng đường cong, không cần đúng từng khung.
 useEffect(()=>{
  if(!sound)return;
  const tick=()=>{const s=signal.current;audio.current?.set(s.invalidate?s.smooth:s.p)};
  tick();
  const id=setInterval(tick,180);
  return()=>clearInterval(id);
 },[sound]);
 async function toggleSound(){
  try{
   if(!audio.current){audio.current=createSoundscape();if(!audio.current){setSound(false);return}}
   if(sound){audio.current.stop();setSound(false)}
   else{const ok=await audio.current.start();setSound(!!ok)}
  }catch{setSound(false)}
 }
 const line=t=><span className="line" key={t}><span className="line-in">{t}</span></span>;
 const word=(c,i)=>SPLIT.includes(i)
  ?<div className="chapter-word split" aria-hidden="true">{c.en}<span className="word-piece word-top">{c.en}</span><span className="word-piece word-bottom">{c.en}</span></div>
  :<div className="chapter-word" aria-hidden="true">{c.en}</div>;
 return <><a className="skip" href="#threshold">Đến hành trình</a>
  <div className="world" aria-hidden="true"><Boundary><Suspense fallback={<span className="loading">Đang mở không gian 3D…</span>}><Scene signal={signal} pointer={pointer} pointerOn={pointerOn} paused={paused} reduced={reduced} speed={speed} hidden={hidden} light={light}/></Suspense></Boundary></div>
  <header><a className="logo" href="#threshold" onClick={e=>{e.preventDefault();go(0)}} aria-label="Limen, về đầu hành trình">LIMEN</a><span className="header-note">An exhibition of<br/>impossible forms</span><div className="header-actions"><button onClick={()=>setInfo(true)}>Về triển lãm <ArrowUpRight/></button></div></header>
  <nav className="chapter-nav" aria-label="Các chương triển lãm"><span className="nav-rail" aria-hidden="true"><span className="nav-rail-fill" ref={rail}/></span>{chapters.map((c,i)=><button key={c.id} onClick={()=>go(i)} aria-label={`Đến chương ${i+1}, ${c.name}`} aria-current={active===i?'step':undefined}><span className="nav-label"><span className="nav-index">{String(i+1).padStart(2,'0')}</span>{c.name}<span className="nav-cue" data-cue={i} aria-hidden="true"/></span><span className="nav-tick"/></button>)}</nav>
  <main ref={root} id="journey">{chapters.map((c,i)=><section key={c.id} id={c.id} className={`chapter chapter-${i} ${c.side}`} aria-labelledby={`title-${c.id}`}>{word(c,i)}<div className="chapter-inner"><div className="chapter-copy"><span className="eyebrow">{c.label}</span>{i===0?<h1 id={`title-${c.id}`}>{c.title.map(line)}</h1>:<h2 id={`title-${c.id}`}>{c.title.map(line)}</h2>}<p>{c.text}</p>{i===0?<button className="text-link" onClick={()=>go(1)}>Bắt đầu hành trình <ArrowRight/></button>:i===7?<button className="text-link" onClick={()=>go(0)}>Trải nghiệm lại <ArrowsClockwise/></button>:<span className="chapter-caption">{c.en} / {c.name}</span>}</div><p className="chapter-note">{c.note}</p>{i===7&&<div className="end-credit">Tạo nên từ hình học, ánh sáng và trí tưởng tượng.<br/>© 2026 LIMEN</div>}</div></section>)}</main>
  <div className="experience-bar">
   <span className="bar-progress" aria-hidden="true"><span className="bar-progress-fill" ref={bar}/></span>
   <div className="current-chapter" aria-live="polite"><span className="chapter-count">{String(active+1).padStart(2,'0')} / 08</span><span>{chapters[active].name}</span></div>
   <div className="experience-controls">
    <button className="sound-button" aria-label={sound?'Tắt âm thanh':'Bật âm thanh'} aria-pressed={sound} onClick={toggleSound}>{sound?<SpeakerHigh/>:<SpeakerSlash/>}<span>Âm thanh {sound?'bật':'tắt'}</span></button>
    <button ref={panelButton} className="panel-button" aria-expanded={panel} aria-controls="experience-settings" onClick={()=>setPanel(v=>!v)}><FadersHorizontal/><span>Tùy chỉnh</span></button>
   </div>
   {panel&&<div className="settings-panel" id="experience-settings" ref={panelRef} role="group" aria-label="Tùy chỉnh trải nghiệm">
    <span className="eyebrow">TÙY CHỈNH TRẢI NGHIỆM</span>
    <div className="settings-row"><span>Chuyển động</span><button className="settings-toggle" aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play/>:<Pause/>}{paused?'Đang dừng':'Đang chạy'}</button></div>
    <label className="settings-row"><span>Nhịp độ</span><input aria-label="Nhịp độ chuyển động" type="range" min="0.3" max="2" step="0.1" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label>
    <div className="settings-row"><span>Góc nhìn</span><button className="settings-toggle" onClick={()=>{signal.current.turn+=Math.PI/6;signal.current.invalidate?.()}}><ArrowsClockwise/>Xoay một nhịp</button></div>
    <div className="settings-row"><span>Giao diện</span><button className="settings-toggle" aria-pressed={light} onClick={()=>setLight(v=>!v)}>{light?<Moon/>:<Sun/>}{light?'Đang sáng':'Đang tối'}</button></div>
    <label className="settings-row check"><input type="checkbox" checked={pointerOn} onChange={e=>setPointerOn(e.target.checked)}/> Con trỏ tác động vào cảnh</label>
    <label className="settings-row check"><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Giảm chuyển động</label>
   </div>}
  </div>
  <dialog ref={dialog} aria-labelledby="about-title" onCancel={()=>setInfo(false)} onClose={()=>setInfo(false)} onClick={e=>{if(e.target===dialog.current)setInfo(false)}}><button className="close icon-button" aria-label="Đóng" onClick={()=>setInfo(false)}><X/></button><span className="eyebrow">VỀ TRIỂN LÃM</span><h2 id="about-title">Giữa hai thế giới.</h2><p>LIMEN là một triển lãm nghệ thuật số phi thương mại. Tám chương nối tiếp nhau, từ hình hài đầu tiên đến phân rã và tái sinh.</p><p>Cuộn để khám phá, hoặc dùng phím mũi tên lên xuống, Home và End để đi giữa các chương. Thanh điều hướng bên cạnh đưa thẳng tới một chương bất kỳ.</p><p>Mỗi chương là một thế giới riêng: hình khối, camera, ánh sáng, nền và âm thanh cùng biến đổi theo một trạng thái duy nhất. Không có chương nào bắt đầu lại từ đầu, chương sau luôn hình thành từ vật liệu của chương trước.</p><p>Âm thanh tắt mặc định. Pause, nhịp độ, giao diện và giảm chuyển động nằm trong bảng Tùy chỉnh ở thanh dưới cùng.</p><button className="text-link" onClick={()=>setInfo(false)}>Trở lại hành trình <ArrowRight/></button></dialog>
 </>
}
createRoot(document.getElementById('root')).render(<App/>);
