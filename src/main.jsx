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
const Scene=lazy(()=>import('./Scene'));
class Boundary extends Component{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div className="fallback" role="status">Cảnh 3D không khả dụng trên trình duyệt này. Hành trình nội dung vẫn tiếp tục.</div>:this.props.children}}
function App(){
 const [active,setActive]=useState(0),[reduced,setReduced]=useState(matchMedia('(prefers-reduced-motion: reduce)').matches),[paused,setPaused]=useState(false),[speed,setSpeed]=useState(1),[sound,setSound]=useState(false),[light,setLight]=useState(!matchMedia('(prefers-color-scheme: dark)').matches),[info,setInfo]=useState(false),[hidden,setHidden]=useState(document.hidden);
 const signal=useRef({p:0,turn:0,invalidate:null}),pointer=useRef({x:0,y:0}),root=useRef(),audio=useRef(),dialog=useRef();
 useEffect(()=>{document.documentElement.dataset.theme=light?'light':'dark'},[light]);
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(mq.matches);const visibility=()=>setHidden(document.hidden);mq.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);return()=>{mq.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{const move=e=>{pointer.current.x=e.clientX/innerWidth*2-1;pointer.current.y=e.clientY/innerHeight*2-1};window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);
 useEffect(()=>{
  const ctx=gsap.context(()=>{
   const sections=gsap.utils.toArray('.chapter');
   gsap.fromTo(signal.current,{p:0},{p:7,ease:'none',onUpdate:()=>signal.current.invalidate?.(),scrollTrigger:{trigger:root.current,start:'top top',end:'bottom bottom',scrub:reduced?true:.65,invalidateOnRefresh:true}});
   sections.forEach((section,i)=>{
    ScrollTrigger.create({trigger:section,start:'top 50%',end:'bottom 50%',onToggle:s=>{if(s.isActive)setActive(i)}});
    if(!reduced){
     const copy=section.querySelector('.chapter-copy'),word=section.querySelector('.chapter-word');
     if(i>0)gsap.fromTo(copy,{y:75,opacity:0},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:section,start:'top 80%',end:'top 20%',scrub:true}});
     gsap.to(word,{yPercent:-25,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true}});
    }
   });
  },root);
  return()=>ctx.revert();
 },[reduced]);
 useEffect(()=>{if(info)dialog.current?.showModal();else dialog.current?.close()},[info]);
 useEffect(()=>()=>{audio.current?.close()},[]);
 function go(i){document.getElementById(chapters[i].id)?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'})}
 async function toggleSound(){try{if(!audio.current){const ctx=new AudioContext();audio.current=ctx;const gain=ctx.createGain();gain.gain.value=.018;gain.connect(ctx.destination);[110,164.81,220].forEach(f=>{const o=ctx.createOscillator();o.frequency.value=f;o.connect(gain);o.start()})}if(sound)await audio.current.suspend();else await audio.current.resume();setSound(!sound)}catch{setSound(false)}}
 return <><a className="skip" href="#threshold">Đến hành trình</a>
  <div className="world" aria-hidden="true"><Boundary><Suspense fallback={<span className="loading">Đang mở không gian 3D…</span>}><Scene signal={signal} pointer={pointer} paused={paused} reduced={reduced} speed={speed} hidden={hidden}/></Suspense></Boundary></div>
  <header><a className="logo" href="#threshold" onClick={e=>{e.preventDefault();go(0)}} aria-label="Limen, về đầu hành trình">LIMEN</a><span className="header-note">An exhibition of<br/>impossible forms</span><div className="header-actions"><button onClick={()=>setInfo(true)}>Về triển lãm <ArrowUpRight/></button><button className="icon-button" aria-label={light?'Giao diện tối':'Giao diện sáng'} onClick={()=>setLight(!light)}>{light?<Moon/>:<Sun/>}</button></div></header>
  <nav className="chapter-nav" aria-label="Các chương triển lãm">{chapters.map((c,i)=><button key={c.id} onClick={()=>go(i)} aria-label={`Đến ${c.name}`} aria-current={active===i?'step':undefined}><span className="nav-label">{c.name}</span><span className="nav-tick"/></button>)}</nav>
  <main ref={root} id="journey">{chapters.map((c,i)=><section key={c.id} id={c.id} className={`chapter chapter-${i} ${c.side}`} aria-labelledby={`title-${c.id}`}><div className="chapter-word" aria-hidden="true">{c.en}</div><div className="chapter-inner"><div className="chapter-copy"><span className="eyebrow">{c.label}</span>{i===0?<h1 id={`title-${c.id}`}>{c.title.map(t=><span key={t}>{t}</span>)}</h1>:<h2 id={`title-${c.id}`}>{c.title.map(t=><span key={t}>{t}</span>)}</h2>}<p>{c.text}</p>{i===0?<button className="text-link" onClick={()=>go(1)}>Bắt đầu hành trình <ArrowRight/></button>:i===7?<button className="text-link" onClick={()=>go(0)}>Trải nghiệm lại <ArrowsClockwise/></button>:<span className="chapter-caption">{c.en} / {c.name}</span>}</div><p className="chapter-note">{c.note}</p>{i===7&&<div className="end-credit">Tạo nên từ hình học, ánh sáng và trí tưởng tượng.<br/>© 2026 LIMEN</div>}</div></section>)}</main>
  <div className="experience-bar"><div className="current-chapter" aria-live="polite"><span className="chapter-count">{String(active+1).padStart(2,'0')} / 08</span><span>{chapters[active].name}</span></div><div className="experience-controls"><button className="icon-button" aria-label={paused?'Tiếp tục chuyển động':'Tạm dừng chuyển động'} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?<Play/>:<Pause/>}</button><label className="speed">Nhịp độ<input aria-label="Nhịp độ chuyển động" type="range" min="0.3" max="2" step="0.1" value={speed} onChange={e=>setSpeed(Number(e.target.value))}/></label><button className="icon-button" aria-label="Xoay góc nhìn" onClick={()=>{signal.current.turn+=Math.PI/6;signal.current.invalidate?.()}}><ArrowsClockwise/></button><button className="sound-button" aria-label={sound?'Tắt âm thanh':'Bật âm thanh'} aria-pressed={sound} onClick={toggleSound}>{sound?<SpeakerHigh/>:<SpeakerSlash/>}<span>Âm thanh {sound?'bật':'tắt'}</span></button></div></div>
  <dialog ref={dialog} aria-labelledby="about-title" onCancel={()=>setInfo(false)} onClick={e=>{if(e.target===dialog.current)setInfo(false)}}><button className="close icon-button" aria-label="Đóng" onClick={()=>setInfo(false)}><X/></button><span className="eyebrow">VỀ TRIỂN LÃM</span><h2 id="about-title">Giữa hai thế giới.</h2><p>LIMEN là một triển lãm nghệ thuật số phi thương mại. Tám chương nối tiếp nhau, từ hình hài đầu tiên đến phân rã và tái sinh.</p><p>Cuộn để khám phá. Dùng thanh điều hướng bên cạnh để đến một chương, hoặc dừng chuyển động tự động để quan sát lâu hơn.</p><p>Âm thanh tắt mặc định. Khi thiết bị yêu cầu giảm chuyển động, nội dung hiển thị trực tiếp và hình khối đổi theo từng chương.</p><label className="motion-option"><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Giảm chuyển động</label><button className="text-link" onClick={()=>setInfo(false)}>Trở lại hành trình <ArrowRight/></button></dialog>
 </>
}
createRoot(document.getElementById('root')).render(<App/>);

