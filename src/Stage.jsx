import React from 'react';
import {chapters} from './chapters';
import {Artwork,tones} from './artwork';
// Sân khấu 2.5D: ba mặt phẳng chiều sâu cho mỗi chương, nằm giữa lớp WebGL và lớp chữ.
// far  = tác phẩm của chương TRƯỚC, phóng rất lớn và tan dần. Người xem vừa bay xuyên qua nó nên nó thành môi trường của chương này.
// mid  = tác phẩm của chương NÀY, mở từ một lát cắt hẹp ra tràn khung.
// near = một mảnh cắt của chương SAU, trôi nhanh nhất, báo trước điều sắp tới.
// Nhờ vậy mỗi khung hình luôn mang dấu vết của chương trước và mầm của chương sau.
// x,y là tâm tác phẩm theo phần trăm khung nhìn; s là cạnh theo vmin; r là độ nghiêng.
// Chữ ở bên nào thì tác phẩm dồn về phía đối diện; hai chương căn đáy thì tác phẩm lên nửa trên.
// p là độ hiện diện tối đa của cả cảnh. Đây là đường cong cảm xúc của lớp DOM:
// khép và tối ở Ngưỡng cửa, mở dần, mạnh nhất ở Phân rã, rồi lắng lại ở Dư âm.
const COMPOSE=[
 {x:72,y:47,s:62,r:-3, nx:21,ny:76,ns:19,nr:6,  p:.64},
 {x:28,y:44,s:70,r:4,  nx:77,ny:73,ns:17,nr:-7, p:.78},
 {x:74,y:52,s:64,r:-7, nx:30,ny:25,ns:20,nr:9,  p:.82},
 {x:27,y:50,s:72,r:5,  nx:75,ny:78,ns:18,nr:-5, p:.88},
 {x:73,y:46,s:60,r:-2, nx:22,ny:71,ns:21,nr:7,  p:.92},
 {x:50,y:33,s:76,r:0,  nx:12,ny:22,ns:17,nr:-9, p:1},
 {x:28,y:49,s:68,r:6,  nx:79,ny:27,ns:19,nr:5,  p:.88},
 {x:50,y:35,s:56,r:0,  nx:84,ny:63,ns:15,nr:-4, p:.72},
];
// Màn che đọc: đổ về đúng phía đang đặt chữ để tác phẩm không bao giờ tranh chấp với nội dung.
// Hộp màn che chỉ chiếm 62% khung theo đúng hướng đó, phần còn lại không cần tô.
const SCRIM={
 left :{'--dir':'to right','--sr':'38%'},
 right:{'--dir':'to left', '--sl':'38%'},
 center:{'--dir':'to top', '--st':'38%'},
 final:{'--dir':'to top',  '--st':'38%'},
};
export default function Stage({light}){
 const dark=!light;
 return <div className="stage" aria-hidden="true">
  {chapters.map((c,i)=>{
   const L=COMPOSE[i];
   return <div className="stage-scene" key={c.id}
    style={{...tones(dark,i),'--pow':L.p,'--x':`${L.x}%`,'--y':`${L.y}%`,'--s':`${L.s}vmin`,'--r':`${L.r}deg`,
     '--nx':`${L.nx}%`,'--ny':`${L.ny}%`,'--ns':`${L.ns}vmin`,'--nr':`${L.nr}deg`,...SCRIM[c.side]}}>
    <div className="plate plate-far"><div className="plate-art"><Artwork i={i+7} k={`f${i}`}/></div></div>
    <div className="plate plate-mid"><div className="plate-window"><div className="plate-art"><Artwork i={i} k={`m${i}`}/></div></div></div>
    <div className="plate plate-near"><div className="plate-window"><div className="plate-art"><Artwork i={i+1} k={`n${i}`}/></div></div></div>
    <div className="scrim"/>
   </div>;
  })}
 </div>;
}
