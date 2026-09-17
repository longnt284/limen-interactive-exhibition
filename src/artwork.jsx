import React from 'react';
// Tác phẩm của tám chương, sinh tại chỗ bằng SVG. Không ảnh ngoài, không CDN, không tài sản nhị phân.
// Mỗi tác phẩm dùng chung một ngôn ngữ: một trường màu mềm ở dưới, một lớp nét mảnh ở trên, vài khối đặc làm điểm nhấn.
// Phép ẩn dụ của từng tác phẩm khớp với hình khối 3D cùng chương, nên hai lớp đọc ra là một thế giới.
const V=120,C=60,RAD=Math.PI/180;
const at=(r,deg)=>[C+r*Math.cos(deg*RAD),C+r*Math.sin(deg*RAD)];
const pt=(r,deg)=>{const[x,y]=at(r,deg);return `${x.toFixed(2)} ${y.toFixed(2)}`};
// LCG gieo cố định: bố cục ngẫu nhiên nhưng không đổi giữa các lần dựng, nên tác phẩm luôn giống nhau.
function rng(seed){let s=(seed*2654435761)>>>0||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
// Cung màu tám chương: lệch hue và lum trên màu nhấn của giao diện. Cùng một cung với chữ nền khổng lồ và tông cảnh 3D.
export const ARC=[[0,0],[4,2],[-6,1],[-11,-1],[8,3],[-15,-2],[3,1],[0,5]];
const BASE={dark:{h:78,s:62,l:77},light:{h:88,s:44,l:31}};
export function tones(dark,i){
 const b=BASE[dark?'dark':'light'],[dh,dl]=ARC[i],h=b.h+dh,l=b.l+dl;
 return{'--art':`hsl(${h} ${b.s}% ${l}%)`,
  '--art-hi':`hsl(${h} ${Math.min(94,b.s+16)}% ${Math.min(93,l+14)}%)`,
  '--art-deep':`hsl(${h-8} ${Math.max(14,b.s-32)}% ${dark?Math.max(8,16+dl):Math.max(17,l-13)}%)`};
}
// Trường màu nền của mọi tác phẩm. Đây là phần "chất liệu": không nét, chỉ ánh sáng và độ sâu.
function Wash({k,cx='44%',cy='38%',r='78%'}){
 return <>
  <defs><radialGradient id={`w${k}`} cx={cx} cy={cy} r={r}>
   <stop offset="0" stopColor="var(--art-hi)" stopOpacity=".36"/>
   <stop offset=".46" stopColor="var(--art)" stopOpacity=".08"/>
   <stop offset="1" stopColor="var(--art-deep)" stopOpacity=".1"/>
  </radialGradient></defs>
  <rect width={V} height={V} fill={`url(#w${k})`}/>
 </>;
}
// 01 Ngưỡng cửa: ba vành đồng tâm hở một cung, một khe sáng dọc xuyên qua tâm.
function A0({k}){
 return <>
  <Wash k={k} cx="50%" cy="46%"/>
  <defs><linearGradient id={`b${k}`} x1="0" y1="0" x2="0" y2="1">
   <stop offset="0" stopColor="var(--art-hi)" stopOpacity="0"/>
   <stop offset=".5" stopColor="var(--art-hi)" stopOpacity=".8"/>
   <stop offset="1" stopColor="var(--art-hi)" stopOpacity="0"/>
  </linearGradient></defs>
  <g fill="none" stroke="var(--art)" strokeLinecap="round">
   {[52,41.5,31,20.5].map((r,i)=><circle key={i} cx={C} cy={C} r={r} strokeWidth={2.6-i*.45} opacity={.26+i*.14}
    strokeDasharray={`${(2*Math.PI*r*.71).toFixed(1)} ${(2*Math.PI*r).toFixed(1)}`} transform={`rotate(${-62+i*11} ${C} ${C})`}/>)}
  </g>
  <rect x={C-1.1} y="12" width="2.2" height="96" fill={`url(#b${k})`}/>
  <circle cx={C} cy={C} r="6.4" fill="var(--art-hi)" opacity=".62"/>
 </>;
}
// 02 Khai mở: chín cánh khẩu độ xoay mở, để lộ một lõi sáng.
function A1({k}){
 const n=9;
 return <>
  <Wash k={k} cx="52%" cy="44%"/>
  <circle cx={C} cy={C} r="19" fill="var(--art-hi)" opacity=".34"/>
  <g stroke="var(--art)" strokeWidth=".85" fill="var(--art)" fillOpacity=".08" strokeLinejoin="round">
   {Array.from({length:n},(_,i)=>{const a=i*(360/n)-96;
    return <path key={i} opacity={.34+(i%3)*.09}
     d={`M${pt(17,a)} L${pt(49,a+7)} A49 49 0 0 1 ${pt(49,a+33)} L${pt(17,a+25)} Z`}/>;})}
  </g>
  <g fill="none" stroke="var(--art-hi)" strokeWidth=".7" opacity=".5">
   <path d={Array.from({length:46},(_,j)=>`${j?'L':'M'}${pt(9+j*.95,j*17)}`).join('')}/>
  </g>
 </>;
}
// 03 Quỹ đạo: ba vòng nghiêng khác trục, các hạt đi trên đường riêng quanh một tâm chung.
function A2({k}){
 const rings=[[48,17,-26],[41,30,21],[52,11,66]],r=rng(3);
 return <>
  <Wash k={k} cx="40%" cy="42%"/>
  <g fill="none" stroke="var(--art)">
   {rings.map(([rx,ry,rot],i)=><ellipse key={i} cx={C} cy={C} rx={rx} ry={ry} strokeWidth={.9-i*.12}
    opacity={.62-i*.12} transform={`rotate(${rot} ${C} ${C})`}/>)}
  </g>
  <g fill="var(--art-hi)">
   {rings.flatMap(([rx,ry,rot],i)=>Array.from({length:4},(_,j)=>{
    const a=r()*360,c=Math.cos(rot*RAD),s=Math.sin(rot*RAD),x=rx*Math.cos(a*RAD),y=ry*Math.sin(a*RAD);
    return <circle key={`${i}-${j}`} cx={C+x*c-y*s} cy={C+x*s+y*c} r={j?1.5:2.8} opacity={j?.5:.85}/>;}))}
  </g>
  <circle cx={C} cy={C} r="4.2" fill="var(--art-hi)" opacity=".7"/>
 </>;
}
// 04 Thủy triều: mười bảy đường đồng mức của một mặt nước vừa chuyển mình.
function A3({k}){
 return <>
  <Wash k={k} cx="46%" cy="62%" r="86%"/>
  <g fill="none" stroke="var(--art)" strokeLinecap="round">
   {Array.from({length:17},(_,i)=>{const y=14+i*5.6,amp=2.4+Math.sin(i*.72)*2.6;
    const d=Array.from({length:22},(_,j)=>{const x=-6+j/21*132;
     return `${j?'L':'M'}${x.toFixed(1)} ${(y+Math.sin(j*.52+i*.64)*amp).toFixed(2)}`}).join('');
    return <path key={i} d={d} strokeWidth={.5+(i%3)*.22} opacity={.22+.38*Math.sin(i/16*Math.PI)}/>;})}
  </g>
 </>;
}
// 05 Nở rộ: năm cánh mọc từ một thân, trật tự hình học mang dáng sự sống.
function A4({k}){
 const P='M0 34 C-26 12,-30 -26,0 -46 C30 -26,26 12,0 34 Z';
 return <>
  <Wash k={k} cx="50%" cy="40%"/>
  <g transform={`translate(${C} 54)`}>
   {Array.from({length:5},(_,i)=><path key={i} d={P} transform={`rotate(${i*72}) scale(${1-i%2*.14})`}
    fill="var(--art)" fillOpacity=".09" stroke="var(--art)" strokeWidth=".8" opacity={.5+(i%2)*.24}/>)}
   {Array.from({length:5},(_,i)=><path key={`v${i}`} d="M0 30 L0 -40" transform={`rotate(${i*72})`}
    fill="none" stroke="var(--art-hi)" strokeWidth=".45" opacity=".42"/>)}
  </g>
  <path d={`M${C} 92 L${C} 112`} stroke="var(--art)" strokeWidth="1.5" opacity=".5"/>
  <circle cx={C} cy="54" r="3.4" fill="var(--art-hi)" opacity=".8"/>
 </>;
}
// 06 Phân rã: vành mảnh vỡ bung ra, giữa để trống thật sự một khoảng trời.
function A5({k}){
 const r=rng(11);
 return <>
  <defs><radialGradient id={`s${k}`} cx="50%" cy="48%" r="46%">
   <stop offset="0" stopColor="var(--art-hi)" stopOpacity=".62"/>
   <stop offset="1" stopColor="var(--art-hi)" stopOpacity="0"/>
  </radialGradient></defs>
  <Wash k={k} cx="50%" cy="50%" r="94%"/>
  <rect width={V} height={V} fill={`url(#s${k})`}/>
  <g>
   {Array.from({length:26},(_,i)=>{const a=i*(360/26)+r()*9,rr=33+r()*19,w=4+r()*8,h=3+r()*7,[x,y]=at(rr,a);
    return <rect key={i} x={-w/2} y={-h/2} width={w} height={h} rx=".8"
     transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${(a+70+(r()-.5)*70).toFixed(1)})`}
     fill="var(--art)" fillOpacity={.1+r()*.22} stroke="var(--art)" strokeWidth=".5" opacity={.4+r()*.5}/>;})}
  </g>
 </>;
}
// 07 Hội tụ: mảnh vỡ về lại một lưới cầu đều đặn. Trật tự mới, không phải hình cũ.
function A6({k}){
 const n=44,pts=Array.from({length:n},(_,i)=>{const y=1-2*(i+.5)/n,rr=Math.sqrt(Math.max(0,1-y*y)),a=i*137.508;
  return [C+44*rr*Math.cos(a*RAD),C+44*y,rr]});
 return <>
  <Wash k={k} cx="48%" cy="44%"/>
  <g fill="none" stroke="var(--art)" strokeWidth=".45" opacity=".55">
   {pts.map(([x,y],i)=>{const o=[i+1,i+7,i+12].filter(j=>j<n);
    return o.map(j=><line key={`${i}-${j}`} x1={x.toFixed(2)} y1={y.toFixed(2)} x2={pts[j][0].toFixed(2)} y2={pts[j][1].toFixed(2)}/>)})}
  </g>
  <g fill="var(--art-hi)">{pts.map(([x,y,rr],i)=><circle key={i} cx={x.toFixed(2)} cy={y.toFixed(2)} r={1+rr*1.1} opacity={.32+rr*.5}/>)}</g>
 </>;
}
// 08 Dư âm: một vành duy nhất và quầng sáng của nó. Đúng dấu hiệu nhận diện của trang.
function A7({k}){
 return <>
  <defs><radialGradient id={`h${k}`} cx="50%" cy="50%" r="50%">
   <stop offset=".42" stopColor="var(--art-hi)" stopOpacity="0"/>
   <stop offset=".62" stopColor="var(--art-hi)" stopOpacity=".3"/>
   <stop offset="1" stopColor="var(--art-hi)" stopOpacity="0"/>
  </radialGradient></defs>
  <Wash k={k} cx="50%" cy="50%" r="70%"/>
  <rect width={V} height={V} fill={`url(#h${k})`}/>
  <circle cx={C} cy={C} r="34" fill="none" stroke="var(--art)" strokeWidth="2.4" opacity=".8"/>
  <circle cx={C} cy={C} r="46" fill="none" stroke="var(--art)" strokeWidth=".5" opacity=".34"/>
  <path d={`M8 ${C} L${C-40} ${C}`} stroke="var(--art)" strokeWidth=".6" opacity=".4"/>
  <path d={`M${C+40} ${C} L112 ${C}`} stroke="var(--art)" strokeWidth=".6" opacity=".4"/>
 </>;
}
const ART=[A0,A1,A2,A3,A4,A5,A6,A7];
export function Artwork({i,k}){
 const A=ART[((i%8)+8)%8];
 return <svg className="art" viewBox={`0 0 ${V} ${V}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><A k={k}/></svg>;
}
