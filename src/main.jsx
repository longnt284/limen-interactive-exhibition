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
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {chapters} from './chapters';
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
class Boundary extends Component{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="fallback" role="status">Cảnh 3D không khả dụng trên trình duyệt này. Hành trình nội dung vẫn tiếp tục.</div>:this.props.children}}
function App(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches),[paused,setPaused]=useState(false),[speed,setSpeed]=useState(1),[sound,setSound]=useState(false),[light,setLight]=useState(!matchMedia('(prefers-color-scheme: dark)').matches),[info,setInfo]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const signal=useRef({p:0,smooth:0,v:0,turn:0,intro:0,energy:0,focus:0,focusY:.52,invalidate:null}),pointer=useRef({x:0,y:0}),root=useRef(),audio=useRef(),dialog=useRef(),rail=useRef();
 useEffect(()=>{document.documentElement.dataset.theme=light?'light':'dark'},[light]);
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
   const fillTo=rail.current?gsap.quickTo(rail.current,'scaleY',{duration:.5,ease:'power2.out'}):null;
   ScrollTrigger.create({
    trigger:root.current,start:'top top',end:'bottom bottom',refreshPriority:-1,
    onRefresh:measure,
    onUpdate:self=>{
     const p=chapterAt(self.scroll());
     signal.current.p=p;signal.current.v=self.getVelocity();signal.current.invalidate?.();
     fillTo?.(p/(sections.length-1));
    },
   });
   measure();signal.current.p=chapterAt(scrollY);signal.current.smooth=signal.current.p;
   fillTo?.(signal.current.p/(sections.length-1));
   sections.forEach((section,i)=>{
    ScrollTrigger.create({trigger:section,start:'top 50%',end:'bottom 50%',onToggle:s=>{if(s.isActive)setActive(i)}});
    if(reduced)return;
    const lines=section.querySelectorAll('.chapter-copy h1 .line,.chapter-copy h2 .line');
    const detail=section.querySelectorAll('.chapter-copy .eyebrow,.chapter-copy p,.chapter-copy .text-link,.chapter-copy .chapter-caption');
    const word=section.querySelector('.chapter-word');
    if(i>0){
     gsap.fromTo(lines,{yPercent:46,opacity:0,rotationX:-32},{yPercent:0,opacity:1,rotationX:0,transformPerspective:560,transformOrigin:'50% 100%',stagger:.13,ease:'none',
      scrollTrigger:{trigger:section,start:'top 82%',end:'top 26%',scrub:.4}});
     gsap.fromTo(detail,{y:34,opacity:0},{y:0,opacity:1,stagger:.1,ease:'none',
      scrollTrigger:{trigger:section,start:'top 74%',end:'top 22%',scrub:.4}});
    }
    gsap.to(word,{yPercent:-26,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true}});
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
 async function toggleSound(){try{if(!audio.current){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();audio.current=ctx;const gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);audio.current.limenGain=gain;[110,164.81,220].forEach(f=>{const o=ctx.createOscillator();o.frequency.value=f;o.connect(gain);o.start()})}const gain=audio.current.limenGain;const now=audio.current.currentTime;if(sound){gain.gain.linearRampToValueAtTime(0,now+.6);setTimeout(()=>audio.current?.suspend().catch(()=>{}),650)}else{await audio.current.resume();gain.gain.setValueAtTime(0,audio.current.currentTime);gain.gain.linearRampToValueAtTime(.018,audio.current.currentTime+.9)}setSound(!sound)}catch{setSound(false)}}
 const line=t=><span className="line" key={t}><span className="line-in">{t}</span></span>;
 return <><a className="skip" href="#threshold">Đến hành trình</a>
  <div className="world" aria-hidden="true"><Boundary><Suspense fallback={<span className="loading">Đang mở không gian 3D…</span>}><Scene signal={signal} pointer={pointer} paused={paused} reduced={reduced} speed={speed} hidden={hidden} light={light}/></Suspense></Boundary></div>
  <header><a className="logo" href="#threshold" onClick={e=>{e.preventDefault();go(0)}} aria-label="Limen, về đầu hành trình">LIMEN</a><span className="header-note">An exhibition of<br/>impossible forms</span><div className="header-actions"><button onClick={()=>setInfo(true)}>Về triển lãm <ArrowUpRight/></button><button className="icon-button" aria-label={light?'Giao diện tối':'Giao diện sáng'} onClick={()=>setLight(!light)}>{light?<Moon/>:<Sun/>}</button></div></header>
  <nav className="chapter-nav" aria-label="Các chương triển lãm"><span className="nav-rail" aria-hidden="true"><span className="nav-rail-fill" ref={rail}/></span>{chapters.map((c,i)=><button key={c.id} onClick={()=>go(i)} aria-label={`Đến ${c.name}`} aria-current={active===i?'step':undefined}><span className="nav-label">{c.name}</span><span className="nav-tick"/></button>)}</nav>
  <main ref={root} id="journey">{chapters.map((c,i)=><section key={c.id} id={c.id} className={`chapter chapter-${i} ${c.side}`} aria-labelledby={`title-${c.id}`}><div className="chapter-word" aria-hidden="true">{c.en}</div><div className="chapter-inner"><div className="chapter-copy"><span className="eyebrow">{c.label}</span>{i===0?<h1 id={`title-${c.id}`}>{c.title.map(line)}</h1>:<h2 id={`title-${c.id}`}>{c.title.map(line)}</h2>}<p>{c.text}</p>{i===0?<button className="text-link" onClick={()=>go(1)}>Bắt đầu hành trình <ArrowRight/></button>:i===7?<button className="text-link" onClick={()=>go(0)}>Trải nghiệm lại <ArrowsClockwise/></button>:<span className="chapter-caption">{c.en} / {c.name}</span>}</div><p className="chapter-note">{c.note}</p>{i===7&&<div className="end-credit">Tạo nên từ hình học, ánh sáng và trí tưởng tượng.<br/>© 2026 LIMEN</div>}</div></section>)}</main>
  <div className="experience-bar"><div className="current-chapter" aria-live="polite"><span className="chapter-count">{String(active+1).padStart(2,'0')} / 08</span><span>{chapters[active].name}</span></div><div className="experience-controls"><button className="icon-button" aria-label={paused?'Tiếp tục chuyển động':'Tạm dừng chuyển động'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play/>:<Pause/>}</button><label className="speed">Nhịp độ<input aria-label="Nhịp độ chuyển động" type="range" min="0.3" max="2" step="0.1" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label><button className="icon-button" aria-label="Xoay góc nhìn" onClick={()=>{signal.current.turn+=Math.PI/6;signal.current.invalidate?.()}}><ArrowsClockwise/></button><button className="sound-button" aria-label={sound?'Tắt âm thanh':'Bật âm thanh'} aria-pressed={sound} onClick={toggleSound}>{sound?<SpeakerHigh/>:<SpeakerSlash/>}<span>Âm thanh {sound?'bật':'tắt'}</span></button></div></div>
  <dialog ref={dialog} aria-labelledby="about-title" onCancel={()=>setInfo(false)} onClose={()=>setInfo(false)} onClick={e=>{if(e.target===dialog.current)setInfo(false)}}><button className="close icon-button" aria-label="Đóng" onClick={()=>setInfo(false)}><X/></button><span className="eyebrow">VỀ TRIỂN LÃM</span><h2 id="about-title">Giữa hai thế giới.</h2><p>LIMEN là một triển lãm nghệ thuật số phi thương mại. Tám chương nối tiếp nhau, từ hình hài đầu tiên đến phân rã và tái sinh.</p><p>Cuộn để khám phá, hoặc dùng phím mũi tên lên xuống, Home và End để đi giữa các chương. Thanh điều hướng bên cạnh đưa thẳng tới một chương bất kỳ.</p><p>Mỗi chương có một khối hình riêng. Khi cuộn, khối đang hiển thị tan ra và dựng lại thành khối của chương kế tiếp.</p><p>Âm thanh tắt mặc định. Khi thiết bị yêu cầu giảm chuyển động, nội dung hiển thị trực tiếp và hình khối đổi theo từng chương.</p><label className="motion-option"><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Giảm chuyển động</label><button className="text-link" onClick={()=>setInfo(false)}>Trở lại hành trình <ArrowRight/></button></dialog>
 </>
}
createRoot(document.getElementById('root')).render(<App/>);
