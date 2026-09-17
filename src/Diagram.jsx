import React,{useRef,useEffect,useMemo} from 'react';
import gsap from 'gsap';
import {CH,NODES,EDGES,W,DIRECTED,DASH,ZONE_A,STAGE,STAGE_NARROW,TINT,TEX,FIELD,LABELS,CARDS,PART0,layoutAt} from './diagram';

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt));
const step=(x,a,b)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const step5=(x,a,b)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*t*(t*(t*6-15)+10)};
const hsl=(h,s,l,a)=>`hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%${a===undefined?'':` / ${a.toFixed(2)}`})`;
// Cửa sổ easing riêng cho từng loại nút: ảnh dẫn trước, mốc và chấm theo sau một nhịp,
// nên bố cục mới hiện ra theo lớp thay vì nhảy cùng lúc.
const LEAD=[[0,1],[.06,.98],[.12,1],[.16,1]];
const KIND={image:0,mark:1,dot:2,card:3};
// Màn hẹp giữ nguyên bố cục nhưng hạ bớt lớp phụ để sơ đồ còn đọc được.
const NARROW=[1,.72,.5,.85];
// Bảng bố cục ghi tỉ lệ tương đối giữa các nút; hệ số này quy nó về cỡ đọc được trên màn hình.
const SCALE=[1.3,1.18,1,1];

const G=p=>({strokeLinecap:'round',fill:'none',stroke:'currentColor',vectorEffect:'non-scaling-stroke',...p});
const MOTIF=[
 <><circle cx="24" cy="24" r="16" {...G({strokeWidth:1.4})}/><circle cx="24" cy="24" r="10" {...G({strokeWidth:1.4})}/><circle cx="24" cy="24" r="4.4" className="d-hot" stroke="none" fill="currentColor"/><path d="M24 4v10M24 34v10" {...G({strokeWidth:1.2})}/></>,
 <><path d="M24 9l11 6.5v13L24 35l-11-6.5v-13z" {...G({strokeWidth:1.4})}/><path d="M24 15.5 35 15.5M24 15.5 18.5 28.5M24 15.5 29.5 28.5" {...G({strokeWidth:1.1})}/><circle cx="24" cy="22" r="3.2" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><ellipse cx="24" cy="24" rx="18" ry="7.5" {...G({strokeWidth:1.3,transform:'rotate(-22 24 24)'})}/><ellipse cx="24" cy="24" rx="18" ry="7.5" {...G({strokeWidth:1.3,transform:'rotate(38 24 24)'})}/><circle cx="24" cy="24" r="3.4" className="d-hot" stroke="none" fill="currentColor"/><circle cx="39" cy="18" r="2.4" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><path d="M5 20c5-8 9-8 14 0s9 8 14 0 9-8 10-4" {...G({strokeWidth:1.4})}/><path d="M5 29c5-8 9-8 14 0s9 8 14 0 9-8 10-4" {...G({strokeWidth:1.2,opacity:.65})}/><path d="M5 38c5-8 9-8 14 0s9 8 14 0 9-8 10-4" {...G({strokeWidth:1,opacity:.38})}/><circle cx="19" cy="16.5" r="2.6" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><path d="M24 42V24" {...G({strokeWidth:1.4})}/><ellipse cx="24" cy="16" rx="4.6" ry="9" {...G({strokeWidth:1.3})}/><ellipse cx="24" cy="16" rx="4.6" ry="9" {...G({strokeWidth:1.2,transform:'rotate(58 24 24)'})}/><ellipse cx="24" cy="16" rx="4.6" ry="9" {...G({strokeWidth:1.2,transform:'rotate(-58 24 24)'})}/><circle cx="24" cy="24" r="3" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><path d="M9 26 20 8l7 10z" {...G({strokeWidth:1.3})}/><path d="M25 39 34 22l7 9z" {...G({strokeWidth:1.3})}/><path d="M31 14l8 3-4 6z" {...G({strokeWidth:1.1,opacity:.6})}/><circle cx="17" cy="35" r="2.6" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><path d="M12 12h24v24H12z" {...G({strokeWidth:1.3})}/><path d="M12 24h24M24 12v24" {...G({strokeWidth:1})}/><circle cx="24" cy="24" r="2.6" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><circle cx="24" cy="24" r="9" {...G({strokeWidth:1.4})}/><path d="M24 7a17 17 0 0 1 14 8" {...G({strokeWidth:1.2})}/><circle cx="24" cy="24" r="2.8" className="d-hot" stroke="none" fill="currentColor"/></>,
 <><path d="M16 14l9 10-9 10M27 14l9 10-9 10" {...G({strokeWidth:1.5})}/></>,
 <><circle cx="24" cy="24" r="4" className="d-hot" stroke="none" fill="currentColor"/><circle cx="24" cy="24" r="11" {...G({strokeWidth:1.1,strokeDasharray:'3 4'})}/><path d="M24 6v4M42 24h-4M24 42v-4M6 24h4" {...G({strokeWidth:1.2})}/></>,
];
const CHAIN=EDGES.map((e,i)=>e.g===2?i:-1).filter(i=>i>=0);

export default function Diagram({signal,reduced,paused,light,hidden,speed}){
 const field=useRef(),stage=useRef(),nodeEl=useRef([]),frameEl=useRef([]),labelEl=useRef([]),cardEl=useRef([]),
       edgeEl=useRef([]),pulseEl=useRef([]),zoneEl=useRef([]);
 const view=useRef({w:0,h:0,box:0,narrow:false}),live=useRef({p:0,t:0,chapter:-1,vel:0}),
       cacheEdge=useRef(EDGES.map(()=>-1)),cacheField=useRef({});
 const pos=useMemo(()=>NODES.map(()=>({x:50,y:50,s:1,a:1})),[]);
 const tmp=useMemo(()=>({A:{x:0,y:0,s:1,a:1},B:{x:0,y:0,s:1,a:1}}),[]);
 const state=useRef({reduced,paused,light,hidden,speed});
 state.current={reduced,paused,light,hidden,speed};

 useEffect(()=>{
  const measure=()=>{
   view.current.w=innerWidth;view.current.h=innerHeight;
   view.current.box=stage.current?.clientWidth||1;
   view.current.narrow=innerWidth<700;
  };
  measure();
  const ro=new ResizeObserver(measure);
  if(stage.current)ro.observe(stage.current);
  addEventListener('resize',measure);
  live.current.p=clamp(signal.current.p,0,CH-1);
  return()=>{ro.disconnect();removeEventListener('resize',measure)};
 },[signal]);

 // Chữ trên nhãn và thẻ chỉ đổi khi chương làm tròn đổi, không đụng tới DOM mỗi khung hình.
 const writeText=c=>{
  const set=LABELS[c]||{};
  for(let i=0;i<NODES.length;i++){
   const el=labelEl.current[i];
   if(el)el.textContent=set[i]||'';
  }
  for(let k=0;k<2;k++){
   const card=CARDS[c][k],el=cardEl.current[k];
   if(el&&card){el[0].textContent=card[0];el[1].textContent=card[1]}
  }
 };

 useEffect(()=>{
  const tick=(_,delta)=>{
   const st=state.current;
   if(st.hidden||!stage.current)return;
   const dt=Math.min(delta/1000,.05),L=live.current,s=signal.current,V=view.current;
   const raw=clamp(s.p,0,CH-1),target=st.reduced?Math.round(raw):raw;
   const prev=L.p;
   L.p=st.reduced?target:damp(L.p,target,5.5,dt);
   L.vel=damp(L.vel,Math.min(Math.abs(L.p-prev)/Math.max(dt,.001)/9,1),4,dt);
   if(!st.paused&&!st.reduced)L.t+=dt*st.speed;
   const p=L.p,a=Math.floor(p),b=Math.min(a+1,CH-1),f=st.reduced?0:clamp(p-a,0,1);
   const chapter=Math.round(p);
   if(chapter!==L.chapter){L.chapter=chapter;writeText(chapter)}

   // Khung nhìn: sơ đồ trôi sang phía đối diện phần chữ và đổi cỡ như một cú lia máy.
   const frame=V.narrow?STAGE_NARROW:STAGE,ease=step5(f,0,1);
   const sx=lerp(frame[a][0],frame[b][0],ease),sy=lerp(frame[a][1],frame[b][1],ease),
         sk=lerp(frame[a][2],frame[b][2],ease)*(1-L.vel*.03);
   stage.current.style.transform=`translate3d(${(sx/100*V.w).toFixed(1)}px,${(sy/100*V.h).toFixed(1)}px,0) translate(-50%,-50%) scale(${sk.toFixed(4)})`;
   const unit=V.box*sk/100;

   // Bung nhẹ giữa hai chương: các nút dịch ra khỏi tâm rồi về, đủ để thấy chúng tự sắp xếp lại.
   const burst=st.reduced?0:Math.pow(Math.sin(Math.PI*f),1.7)*1.9*(1+L.vel*.5);
   const drift=st.paused||st.reduced?0:1;
   // Chữ chú giải lặng đi giữa hai chương: nhãn đổi nội dung và thẻ đổi chỗ đúng lúc không ai đọc chúng.
   const annot=st.reduced?1:1-Math.pow(Math.sin(Math.PI*f),1.1)*.92;
   for(let i=0;i<NODES.length;i++){
    const kind=KIND[NODES[i].kind],win=LEAD[kind],mix=step(f,win[0],win[1]);
    const A=layoutAt(a,i,tmp.A),B=layoutAt(b,i,tmp.B),P=pos[i];
    P.x=lerp(A.x,B.x,mix);P.y=lerp(A.y,B.y,mix);
    P.s=lerp(A.s,B.s,mix)*SCALE[kind];P.a=lerp(A.a,B.a,mix)*(V.narrow?NARROW[kind]:1)*(kind===3?annot:1);
    if(burst>.001||drift){
     const ph=i*1.7,dx=P.x-50,dy=P.y-50,len=Math.hypot(dx,dy)||1;
     P.x+=dx/len*burst*(.5+(i%5)*.2)+Math.sin(L.t*.5+ph)*.55*drift;
     P.y+=dy/len*burst*(.5+(i%5)*.2)+Math.cos(L.t*.42+ph)*.5*drift;
    }
    const el=nodeEl.current[i];if(!el)continue;
    el.style.transform=`translate3d(${(P.x*unit).toFixed(2)}px,${(P.y*unit).toFixed(2)}px,0) translate(-50%,-50%)`;
    el.style.opacity=P.a.toFixed(3);
    const fr=frameEl.current[i];
    if(fr&&kind<2)fr.style.transform=`scale(${P.s.toFixed(3)})`;
    const lb=labelEl.current[i];
    if(lb)lb.style.opacity=(P.a*annot*step(P.s,.34,.7)).toFixed(3);
   }

   // Vùng nền mềm bám theo chính cụm nút, nên không bao giờ lệch khỏi bố cục đang chạy.
   let cx=0,cy=0,rad=0;
   for(let i=PART0;i<PART0+5;i++){cx+=pos[i].x;cy+=pos[i].y}
   cx/=5;cy/=5;
   for(let i=PART0;i<PART0+5;i++)rad=Math.max(rad,Math.hypot(pos[i].x-cx,pos[i].y-cy));
   const zone=[[pos[0].x,pos[0].y,26+pos[0].s*16,26+pos[0].s*16],[cx,cy,rad+16,rad*.8+14],[50,50,62,52]];
   for(let z=0;z<3;z++){
    const el=zoneEl.current[z];if(!el)continue;
    el.setAttribute('cx',zone[z][0].toFixed(1));el.setAttribute('cy',zone[z][1].toFixed(1));
    el.setAttribute('rx',zone[z][2].toFixed(1));el.setAttribute('ry',zone[z][3].toFixed(1));
    // Giao diện sáng chỉ cần một nửa độ đậm, nếu không quầng nền đọc ra như vết bẩn thay vì vùng sáng.
    el.setAttribute('opacity',(lerp(ZONE_A[z][a],ZONE_A[z][b],ease)*(st.light?.42:1)).toFixed(3));
   }

   const dashW=lerp(DASH[a],DASH[b],ease),dir=lerp(DIRECTED[a],DIRECTED[b],ease);
   for(let e=0;e<EDGES.length;e++){
    const edge=EDGES[e],el=edgeEl.current[e];if(!el)continue;
    const row=W[edge.g],w=lerp(row[a],row[b],ease)*Math.min(pos[edge.a].a,pos[edge.b].a);
    if(w<.012){
     if(cacheEdge.current[e]!==0){el.setAttribute('opacity','0');cacheEdge.current[e]=0}
     continue;
    }
    cacheEdge.current[e]=1;
    const A=pos[edge.a],B=pos[edge.b],dx=B.x-A.x,dy=B.y-A.y;
    const qx=(A.x+B.x)/2-dy*edge.c,qy=(A.y+B.y)/2+dx*edge.c;
    el.setAttribute('d',`M${A.x.toFixed(2)} ${A.y.toFixed(2)}Q${qx.toFixed(2)} ${qy.toFixed(2)} ${B.x.toFixed(2)} ${B.y.toFixed(2)}`);
    el.setAttribute('opacity',w.toFixed(3));
    // Đường tự vẽ theo tiến độ, và gãy thành nét đứt khi chương Phân rã tới gần.
    const len=(Math.hypot(qx-A.x,qy-A.y)+Math.hypot(B.x-qx,B.y-qy)+Math.hypot(dx,dy))/2*unit;
    const draw=st.reduced?1:step(w,.02,.6),n=1+dashW*5;
    el.setAttribute('stroke-dasharray',`${(draw*len/n).toFixed(1)} ${(((1-draw)*len+dashW*len*.5)/n+.01).toFixed(1)}`);
   }

   for(let k=0;k<CHAIN.length;k++){
    const el=pulseEl.current[k];if(!el)continue;
    const edge=EDGES[CHAIN[k]],w=lerp(W[2][a],W[2][b],ease)*dir;
    if(w<.02){el.setAttribute('opacity','0');continue}
    const A=pos[edge.a],B=pos[edge.b],dx=B.x-A.x,dy=B.y-A.y;
    const qx=(A.x+B.x)/2-dy*edge.c,qy=(A.y+B.y)/2+dx*edge.c;
    const u=st.reduced?.5:(L.t*.17+k*.11)%1,v=1-u;
    const px=v*v*A.x+2*v*u*qx+u*u*B.x,py=v*v*A.y+2*v*u*qy+u*u*B.y;
    const tx=2*v*(qx-A.x)+2*u*(B.x-qx),ty=2*v*(qy-A.y)+2*u*(B.y-qy);
    el.setAttribute('transform',`translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(Math.atan2(ty,tx)*57.2958).toFixed(1)})`);
    el.setAttribute('opacity',(w*(st.reduced?.8:Math.sin(u*Math.PI))).toFixed(3));
   }

   // Nền nhiều lớp đọc cùng bảng chương với sơ đồ, nên màu và hoạ tiết luôn đổi cùng nhịp.
   const pal=FIELD[st.light?'light':'dark'],T=TINT,tex=TEX;
   const dh=lerp(T[a][0],T[b][0],ease),dl=lerp(T[a][1],T[b][1],ease);
   const grid=lerp(tex[a][0],tex[b][0],ease),topo=lerp(tex[a][1],tex[b][1],ease),dots=lerp(tex[a][2],tex[b][2],ease);
   const c=cacheField.current;
   if(Math.abs((c.h??99)-dh)>.05||Math.abs((c.l??99)-dl)>.05||c.light!==st.light){
    c.h=dh;c.l=dl;c.light=st.light;
    const F=field.current;
    F.style.setProperty('--f-a',hsl(pal.a[0]+dh,pal.a[1],pal.a[2]+dl));
    F.style.setProperty('--f-b',hsl(pal.b[0]+dh,pal.b[1],pal.b[2]+dl*.7));
    F.style.setProperty('--f-glow',hsl(pal.glow[0]+dh,pal.glow[1],pal.glow[2]+dl*.5,pal.glowA));
   }
   if(Math.abs((c.g??9)-grid)>.005||Math.abs((c.t??9)-topo)>.005||Math.abs((c.d??9)-dots)>.005||Math.abs((c.x??99)-sx)>.2){
    c.g=grid;c.t=topo;c.d=dots;c.x=sx;
    const F=field.current;
    F.style.setProperty('--grid',grid.toFixed(3));
    F.style.setProperty('--topo',topo.toFixed(3));
    F.style.setProperty('--dots',dots.toFixed(3));
    F.style.setProperty('--shift',`${((sx-50)*.18).toFixed(2)}%`);
    F.style.setProperty('--glow-x',`${sx.toFixed(1)}%`);
    F.style.setProperty('--rise',`${(-p*1.1).toFixed(2)}%`);
   }
  };
  gsap.ticker.add(tick);
  tick(0,16);
  return()=>gsap.ticker.remove(tick);
 },[signal]);

 return <>
  <div className="field" ref={field} aria-hidden="true"><i className="field-grid"/><i className="field-topo"/><i className="field-dots"/></div>
  <div className="diagram" aria-hidden="true">
   <div className="d-stage" ref={stage}>
    <svg className="d-links" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
     <defs>
      <radialGradient id="d-zone"><stop offset="0%" stopColor="var(--d-zone)" stopOpacity=".5"/><stop offset="65%" stopColor="var(--d-zone)" stopOpacity=".14"/><stop offset="100%" stopColor="var(--d-zone)" stopOpacity="0"/></radialGradient>
     </defs>
     <g className="d-zones">{[0,1,2].map(z=><ellipse key={z} ref={el=>{zoneEl.current[z]=el}} cx="50" cy="50" rx="30" ry="30" fill="url(#d-zone)" opacity="0"/>)}</g>
     <g className="d-edges">{EDGES.map((e,i)=><path key={i} ref={el=>{edgeEl.current[i]=el}} className={`d-edge d-g${e.g}`} opacity="0"/>)}</g>
     <g className="d-pulses">{CHAIN.map((e,k)=><path key={k} ref={el=>{pulseEl.current[k]=el}} className="d-pulse" d="M-.8 -.85L1.15 0L-.8 .85z" opacity="0"/>)}</g>
    </svg>
    {NODES.map((n,i)=>{
     const card=i>=14;
     return <div key={i} className={`d-node d-${n.kind}`} ref={el=>{nodeEl.current[i]=el}} style={{width:`${n.w}%`}}>
      {card
       ? <div className="d-frame"><span className="d-eyebrow" ref={el=>{cardEl.current[i-14]=cardEl.current[i-14]||[];cardEl.current[i-14][0]=el}}/><span className="d-text" ref={el=>{cardEl.current[i-14]=cardEl.current[i-14]||[];cardEl.current[i-14][1]=el}}/></div>
       : n.kind==='dot'
        ? <span className="d-frame"/>
        : <><span className="d-frame" ref={el=>{frameEl.current[i]=el}}><svg className="d-art" viewBox="0 0 48 48">{MOTIF[n.motif]}</svg></span><span className="d-label" ref={el=>{labelEl.current[i]=el}}/></>}
     </div>;
    })}
   </div>
  </div>
 </>;
}
