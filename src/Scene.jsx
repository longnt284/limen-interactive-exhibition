import React,{useMemo,useRef,useEffect,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
const CHAPTERS=8,PLATES=110,STRUTS=48,NODES=22,TAU=Math.PI*2;
const {clamp,lerp,smoothstep,smootherstep,damp}=THREE.MathUtils;
// Ba vai trò hình học tồn tại xuyên suốt tám chương, không chương nào tắt vai trò nào.
// Nhờ vậy mỗi instance giữ nguyên danh tính từ đầu tới cuối: chuyển chương là biến hình, không phải mờ đi hiện lại.
// lead = cửa sổ biến hình riêng. Cả ba cửa sổ đều bắt đầu muộn: khối giữ nguyên hình của chương hiện tại
// suốt pha tới và pha trải nghiệm, chỉ biến hình ở pha cuối. Mảng chính dẫn trước, thanh nối và hạt nhấn theo sau.
const MORPH=.4;
const ROLES=[
 {n:PLATES,burst:1,   lead:[MORPH,1]},
 {n:STRUTS,burst:1.3, lead:[MORPH+.05,.98]},
 {n:NODES, burst:.75, lead:[MORPH+.1,1]},
];
const PALETTE={
 dark :{bg:'#111c1b',bottom:'#08100e',top:'#22382e',glow:'#3e6f50',rim:'#cfe9a0',rimStrength:.62,accent:'#d0e99d',
        metal:'#c2d0c6',metalAlt:'#d4eba8',strut:'#93a79a',dust:'#cde79f',dustOpacity:.8,emissive:.55,
        ambient:.4,hemiSky:'#eef5ef',hemiGround:'#17271f',hemi:1.15,key:2.2,keyColor:'#f6fff7',fill:1.35,fillColor:'#d0e99d'},
 light:{bg:'#dce3db',bottom:'#c2d1bd',top:'#f1f4ee',glow:'#ffffff',rim:'#ffffff',rimStrength:.34,accent:'#4f702d',
        metal:'#71877a',metalAlt:'#54742f',strut:'#5d7568',dust:'#77906c',dustOpacity:.42,emissive:.3,
        ambient:.72,hemiSky:'#ffffff',hemiGround:'#8fa48d',hemi:1.25,key:2.5,keyColor:'#ffffff',fill:1.05,fillColor:'#aecb84'},
};
// Một bảng trạng thái duy nhất cho cả camera, đèn, sương và nền. Cuộn nội suy thẳng trên bảng này.
// Mỗi chương có HAI hàng: hàng chẵn là lúc chương vừa tới, hàng lẻ là lúc chương nói hết điều nó muốn nói.
// Vì vậy cảnh vẫn chuyển động ngay giữa lòng một chương chứ không đứng yên chờ chương sau, và ba pha
// tới / trải nghiệm / biến hình nối nhau liên tục: đi từ hàng lẻ của chương này sang hàng chẵn của chương kế.
// 0 cx 1 cy 2 cz | 3 tx 4 ty 5 tz | 6 fov | 7 kx 8 ky 9 kz | 10 key 11 fill 12 ambient 13 rim
// 14 fogBack 15 fogDepth | 16 hue 17 sat 18 lum 19 glow | 20 emissive | 21 tint đèn (+ lạnh, − ấm)
const SN=22;
const KEYS=[
 // 01 Ngưỡng cửa: đứng xa, viền sáng mạnh, nền tối, rồi tiến vào rất chậm.
 [ 0.00, 0.05, 9.60,  0.00, 0.00, 0.00, 40,  5, 6, 4, 0.80,0.62,0.74,1.50, 4.6,10.0,  0.000,0.94,-0.055,0.55,1.00, 0.35],
 [ 0.00, 0.02, 7.90,  0.00, 0.00, 0.00, 42,  5, 5, 4, 0.92,0.70,0.82,1.42, 4.0, 9.2,  0.004,0.98,-0.040,0.70,1.10, 0.28],
 // 02 Khai mở: ánh sáng chuyển vào bên trong khối, camera tới sát rồi lách một phần qua khe mở.
 [-0.35, 0.10, 7.40,  0.10, 0.00,-0.20, 45,  6, 3, 4, 0.80,1.10,0.94,1.28, 3.6, 8.4,  0.012,1.06, 0.010,1.05,1.35, 0.10],
 [-0.55, 0.06, 5.60,  0.15, 0.00,-0.55, 49,  7, 2, 3, 0.60,1.48,1.05,1.20, 2.6, 7.6,  0.018,1.12, 0.048,1.45,1.80,-0.05],
 // 03 Quỹ đạo: lùi ra thấy cả hệ, đèn lạnh lại, thêm một nhịp trượt ngang.
 [ 0.20, 0.28, 9.60,  0.00, 0.05, 0.00, 41,  3, 7, 6, 1.00,0.95,0.94,1.06, 5.0,12.0, -0.014,0.98,-0.010,0.72,1.15, 0.62],
 [ 1.05, 0.38,10.60,  0.42, 0.02, 0.00, 39,  1, 7, 7, 1.12,0.80,0.86,1.02, 5.8,13.4, -0.020,0.94,-0.020,0.62,1.05, 0.78],
 // 04 Thủy triều: hạ xuống ngang mặt sóng rồi trôi ngang, camera và mục tiêu đi cùng nhau nên bố cục giữ nguyên.
 [-0.25,-0.18, 8.30,  0.00,-0.12, 0.00, 46, -2, 5, 6, 1.00,1.16,1.04,0.96, 3.4, 8.2, -0.028,1.02,-0.008,0.95,1.00, 0.30],
 [-1.25,-0.34, 7.10, -1.05,-0.20, 0.00, 49, -4, 3, 6, 0.96,1.30,1.10,0.90, 3.0, 7.4, -0.036,1.06,-0.016,1.05,1.00, 0.18],
 // 05 Nở rộ: ánh sáng ấm lên, camera vòng nhẹ và dâng theo cụm cánh.
 [ 0.20, 0.72, 9.10,  0.00, 0.28, 0.00, 43,  3, 7, 3, 1.16,0.96,1.08,1.10, 4.4,10.2,  0.018,1.08, 0.024,1.15,1.25,-0.45],
 [ 0.85, 1.45, 8.40,  0.20, 0.55, 0.00, 44,  5, 9, 2, 1.26,0.88,1.14,1.16, 4.0, 9.4,  0.026,1.12, 0.036,1.30,1.40,-0.62],
 // 06 Phân rã: tương phản cao, chùm sáng gắt, rồi camera đi thẳng qua khoảng trống giữa các mảnh.
 [ 0.00, 0.22, 9.20,  0.00, 0.02, 0.00, 45,  6, 2, 5, 0.88,1.30,0.82,1.40, 3.8, 8.0, -0.038,0.92,-0.034,0.80,1.55, 0.50],
 [ 0.00, 0.16, 4.00,  0.00, 0.00,-0.60, 50,  7, 1, 3, 0.74,1.52,0.70,1.62, 2.4, 8.6, -0.050,0.86,-0.048,0.72,1.85, 0.66],
 // 07 Hội tụ: lùi thật xa trước, các nguồn sáng còn rời nhau, rồi về giữa và hợp thành một nguồn.
 [-0.75, 0.24,11.60,  0.00, 0.00, 0.00, 40, -5, 5, 4, 1.02,1.10,0.96,1.12, 5.6,14.2,  0.002,1.00, 0.000,0.88,1.20, 0.30],
 [ 0.00, 0.14, 8.60,  0.00, 0.00, 0.00, 42,  0, 6, 6, 1.14,0.92,1.02,1.20, 5.0,13.0,  0.010,1.04, 0.014,1.10,1.30, 0.06],
 // 08 Dư âm: gần như không còn chuyển động, sáng khuếch tán, tint hơi lạnh trở lại đúng như chương một.
 [ 0.00, 0.10, 9.00,  0.00, 0.00, 0.00, 41,  0, 4, 7, 0.92,1.02,1.20,0.92, 5.2,13.4,  0.000,0.88, 0.044,1.15,0.92, 0.12],
 [ 0.00, 0.06, 8.80,  0.00, 0.00, 0.00, 41,  1, 5, 6, 0.86,0.96,1.22,0.96, 5.0,13.2, -0.002,0.84, 0.052,1.02,0.86, 0.20],
];
// Bố cục: chữ bên nào thì khối dồn về phía đối diện. Hai chương căn đáy được nâng lên để không đè chữ.
const SHIFT=[1.65,-1.75,1.6,-1.7,1.6,0,-1.7,.5],LIFT=[0,0,0,0,-.1,.35,0,.65];
// Con trỏ là một trường ảnh hưởng, không phải cần lái. Dương là đẩy ra, âm là hút vào.
const PFIELD=[.10,.18,.30,.34,-.30,.85,-.55,.22],RIPPLE=[0,0,0,1,0,0,0,0];
// Danh tính môi trường của tám chương, viết bằng tham số của ba nguyên thủy trong shader nền.
// Chuyển chương nội suy thẳng trên bảng này, nên nền của chương này biến dần thành nền chương sau.
//  0 cỡ ô 1 ngưỡng mật độ 2 biên độ hạt 3 trôi | 4 tần góc 5 tần bán kính 6 hướng x 7 hướng y
//  8 tốc độ 9 độ sắc 10 biên độ 11 tần số uốn | 12..18 họ đường thứ hai (không có uốn)
// 19 lệch sáng mặt phẳng 20 lắng về gradient 21 sương 22 lõi sáng 23 quầng nền 24 bán kính hạt
const BN=25;
const ENVS=[
 // 01 Ngưỡng cửa: khoảng tối sâu, chỉ có sương. Không hạt, không đường.
 [ 9,1.10,0.00, 0.000,  0, 0, 0.0,0.0,  0.000,  2.0,0.00,0.0,   0,  0,  0.0,0.0,  0.000,  2.0,0.00,  0.00,0.00,0.17,0.02,0.16, 0.22],
 // 02 Khai mở: tia sáng toả ra từ tâm, thêm vòng sáng nở dần, lõi sáng mạnh.
 [ 9,1.10,0.00, 0.000,  7, 5, 0.0,0.0, -0.900,  3.0,0.26,0.0,   0, 14,  0.0,0.0, -0.500,  4.0,0.07,  0.00,0.00,0.05,0.18,0.52, 0.22],
 // 03 Quỹ đạo: trường sao thưa ở chiều sâu và vài vệt quỹ đạo đồng tâm.
 [ 9,0.78,0.40, 0.020,  0,26, 0.0,0.0, -0.060,  6.0,0.09,0.0,   0,  0,  0.0,0.0,  0.000,  2.0,0.00,  0.00,0.00,0.03,0.00,0.26, 0.16],
 // 04 Thủy triều: hai hệ sóng ngang chồng nhau, hệ thứ nhất còn bị uốn theo trục dọc.
 [16,1.10,0.00, 0.000,  0, 0, 6.0,0.0,  0.420,  2.5,0.26,3.0,   0,  0,  9.5,2.6, -0.310,  2.0,0.10,  0.00,0.00,0.05,0.00,0.30, 0.22],
 // 05 Nở rộ: bào tử phát sáng trôi lên trong một trường mềm.
 [22,0.72,0.42, 0.220,  0, 0, 0.0,0.0,  0.000,  2.0,0.00,0.0,   0,  0,  0.0,0.0,  0.000,  2.0,0.00,  0.00,0.00,0.11,0.05,0.32, 0.30],
 // 06 Phân rã: hai họ đường nứt sắc cắt qua nền, nền tách thành mặt phẳng lệch sáng, bụi mịn bay.
 [22,0.90,0.22,-0.140,  0, 0,13.0, 9.0, 0.020, 90.0,0.45,1.4,  0,  0, -9.0,15.0,-0.015,75.0,0.34,  0.16,0.00,0.02,0.00,0.18, 0.18],
 // 07 Hội tụ: hai họ đường sức xoắn ngược chiều nhau về một tâm đang sáng dần.
 [22,1.10,0.00, 0.000,  5, 9, 0.0,0.0, -0.300,  5.0,0.24,0.0,   3, -6,  0.0,0.0,  0.180,  6.0,0.12,  0.00,0.00,0.04,0.12,0.34, 0.24],
 // 08 Dư âm: đường và hạt tắt hết, nền lắng về gradient thuần, còn đúng lớp sương của chương một.
 [22,1.10,0.00, 0.000,  0, 0, 0.0,0.0,  0.000,  2.0,0.00,0.0,   0,  0,  0.0,0.0,  0.000,  2.0,0.00,  0.00,0.80,0.11,0.04,0.30, 0.24],
];
const _m=new THREE.Matrix4(),_up=new THREE.Vector3(0,1,0),_t=new THREE.Vector3(),_v=new THREE.Vector3(),_yA=new THREE.Vector3(0,1,0);
// Object3D.lookAt đọc matrixWorld, mà matrixWorld của một Object3D rời luôn là ma trận đơn vị nên vị trí đọc ra là gốc toạ độ.
// Tự dựng quaternion để mặt phẳng thật sự hướng vào tâm.
function face(d,x,y,z){_t.set(x,y,z);_m.lookAt(_t,d.position,_up);d.quaternion.setFromRotationMatrix(_m)}
function along(d,x,y,z){_v.set(x,y,z);if(_v.lengthSq()<1e-9)_v.set(0,1,0);_v.normalize();d.quaternion.setFromUnitVectors(_yA,_v)}
function bump(p,c,w){return smoothstep(1-Math.abs(p-c)/w,0,1)}
// 01 Ngưỡng cửa: ba vành đồng tâm, một cánh cổng nhìn chính diện.
// 02 Khai mở: vành tháo ra thành xoắn ốc mở về chiều sâu, từng phiến nghiêng như lá khẩu độ.
// 03 Quỹ đạo: xoắn ốc tách thành ba vỏ nghiêng, phiến quay mặt về tâm.
// 04 Thủy triều: vỏ trải phẳng thành mặt sóng, phiến nằm ngang theo độ dốc sóng.
// 05 Nở rộ: mặt sóng cuộn thành năm cánh mọc từ một thân.
// 06 Phân rã: cánh vỡ ra thành vỏ rỗng, giữa để trống một khoảng trời.
// 07 Hội tụ: mảnh vỡ về lại một lưới cầu đều đặn, trật tự mới chứ không phải hình cũ.
// 08 Dư âm: lưới khép thành một vành duy nhất, đúng dấu hiệu nhận diện của trang.
function plateAt(c,i,d){
 const k=i%3,u=Math.floor(i/3),n=37,t=u/n,a=t*TAU;
 if(c===0){const ang=a+k*.09,r=1.12+k*.4;
  d.position.set(r*Math.cos(ang),r*Math.sin(ang),(k-1)*.12);
  d.rotation.set(0,0,ang+Math.PI/2);d.scale.set(.185+k*.05,.085,.05)}
 else if(c===1){const ang=t*TAU*1.15+k*.52,r=.7+t*1.3+k*.17;
  d.position.set(r*Math.cos(ang),r*Math.sin(ang),(t-.34)*2.7+k*.12);
  d.rotation.set(0,0,ang+Math.PI/2);d.rotateX(.62*t);d.scale.set(.2,.075,.055)}
 else if(c===2){const tilt=k*.72,R=1.52+k*.3,ang=a+k*.4,pv=R*Math.sin(ang);
  d.position.set(R*Math.cos(ang),pv*Math.cos(tilt),pv*Math.sin(tilt));
  face(d,0,0,0);d.scale.set(.26,.105,.045)}
 else if(c===3){const col=i%11,row=Math.floor(i/11),x=(col-5)*.38,z=(row-4.5)*.36,w=x*1.2+z*.72;
  d.position.set(x,Math.sin(w)*.52,z);
  d.rotation.set(-Math.PI/2,0,0);d.rotateX(Math.cos(w)*.45);d.rotateY(Math.sin(z*.9)*.3);
  d.scale.set(.32,.28,.035)}
 else if(c===4){const petal=i%5,uu=Math.floor(i/5)/21,ang=petal/5*TAU+uu*.75,r=.3+Math.sin(uu*Math.PI*.85)*1.5;
  d.position.set(r*Math.cos(ang),-.75+uu*2,r*Math.sin(ang));
  d.rotation.set(0,-ang,0);d.rotateX(-Math.PI/2+uu*1.5);
  d.scale.set(.3*(1-uu*.5),.26*(1-uu*.42),.03)}
 // Vành vỡ chứ không phải vỏ cầu đặc: giữa phải thật sự trống để đọc ra "một khoảng trời ở giữa",
 // và để camera đi lọt qua đúng khoảng đó ở giữa chương.
 else if(c===5){const band=i%4,seed=(i*37%101)/101,ang=i*2.39996,R=1.5+band*.36+seed*.22;
  d.position.set(R*Math.cos(ang),R*Math.sin(ang),(seed-.5)*1.6);
  d.rotation.set(0,0,ang+Math.PI/2);d.rotateX((seed-.5)*1.9);d.rotateY((seed-.5)*1.5);
  d.scale.set(.28,.22,.035)}
 else if(c===6){const band=i%5,uu=Math.floor(i/5)/22,ang=uu*TAU+band*.32,phi=(band+.5)/5*Math.PI,R=1.72,sp=Math.sin(phi);
  d.position.set(R*sp*Math.cos(ang),R*Math.cos(phi),R*sp*Math.sin(ang));
  face(d,0,0,0);d.scale.set(.27,.185,.045)}
 else{const ang=a+(k===1?Math.PI/n:k===2?Math.PI/n*.5:0),R=k<2?2.04:1.28;
  d.position.set(R*Math.cos(ang),R*Math.sin(ang),k===1?.08:0);
  d.rotation.set(0,0,ang+Math.PI/2);d.scale.set(.3,k<2?.1:.055,.045)}
}
function strutAt(c,i,d){
 const m=i%16,b=Math.floor(i/16),t=m/16,a=t*TAU;
 if(c===0){const len=.56+b*.06,ang=a+b*.13,r=.36+len/2;
  d.position.set(r*Math.cos(ang),r*Math.sin(ang),(b-1)*.2);
  along(d,Math.cos(ang),Math.sin(ang),0);d.scale.set(.05,len,.05)}
 else if(c===1){const ang=t*TAU*1.15+b*.52,r=.74+t*1.3+b*.19;
  d.position.set(r*Math.cos(ang),r*Math.sin(ang),(t-.34)*2.7);
  along(d,-Math.sin(ang),Math.cos(ang),.42);d.scale.set(.04,.46,.04)}
 else if(c===2){const tilt=b*.72,R=1.66+b*.3,ang=a+b*.4,tv=Math.cos(ang);
  d.position.set(R*Math.cos(ang),R*Math.sin(ang)*Math.cos(tilt),R*Math.sin(ang)*Math.sin(tilt));
  along(d,-Math.sin(ang),tv*Math.cos(tilt),tv*Math.sin(tilt));d.scale.set(.035,.58,.035)}
 else if(c===3){const lane=i%8,seg=Math.floor(i/8),z=(lane-3.5)*.5,x=(seg-2.5)*.68,w=x*1.2+z*.72;
  d.position.set(x,Math.sin(w)*.52+.18,z);
  along(d,1,Math.cos(w)*.55,0);d.scale.set(.03,.64,.03)}
 else if(c===4){
  if(i<6){d.position.set(0,(i+.5)/6*2-1.1,0);along(d,0,1,0);d.scale.set(.075,.34,.075)}
  else{const j=i-6,petal=j%5,lvl=Math.floor(j/5),ang=petal/5*TAU+lvl*.2,rr=.26+lvl*.17;
   d.position.set(rr*Math.cos(ang),-.66+lvl*.26,rr*Math.sin(ang));
   along(d,Math.cos(ang)*.8,1,Math.sin(ang)*.8);d.scale.set(.035,.36,.035)}}
 else if(c===5){const seed=(i*53%97)/97,ang=i*2.39996,R=1.9+seed*1.1;
  d.position.set(R*Math.cos(ang),R*Math.sin(ang),(seed-.5)*2);
  along(d,Math.sin(i*1.7),Math.cos(i*2.3),Math.sin(i*3.1));d.scale.set(.03,.44,.03)}
 else if(c===6){const band=i%4,uu=Math.floor(i/4)/12,ang=uu*TAU,phi=(band+.5)/4*Math.PI,R=1.88,sp=Math.sin(phi);
  d.position.set(R*sp*Math.cos(ang),R*Math.cos(phi),R*sp*Math.sin(ang));
  along(d,-Math.sin(ang),0,Math.cos(ang));d.scale.set(.032,.52*Math.max(sp,.3),.032)}
 else{const ang=i/STRUTS*TAU,r=1.62;
  d.position.set(r*Math.cos(ang),r*Math.sin(ang),0);
  along(d,Math.cos(ang),Math.sin(ang),0);d.scale.set(.026,.17,.026)}
}
function nodeAt(c,i,d){
 const ang=i*2.39996;
 d.rotation.set(i*.7+c*.2,i*1.3+c*.3,i*.4);
 if(c===0){const y=1-2*(i+.5)/NODES,rr=Math.sqrt(Math.max(0,1-y*y)),R=.3;
  d.position.set(R*rr*Math.cos(ang),R*y,R*rr*Math.sin(ang));d.scale.setScalar(i%5===0?.15:.085)}
 else if(c===1){const t=i/NODES;
  d.position.set(.2*Math.cos(t*11),.2*Math.sin(t*11),(t-.38)*3.1);d.scale.setScalar(i%5===0?.14:.075)}
 // Sáu hạt đầu của Quỹ đạo vẽ một vòng elip nghiêng. Hội tụ dùng lại đúng mô típ đó ở bán kính lớn hơn,
 // nên người xem gặp lại một hình quen thuộc trong trật tự mới.
 else if(c===2){
  if(i<6){const o=i/6*TAU;d.position.set(1.95*Math.cos(o),1.95*Math.sin(o)*.62,1.95*Math.sin(o)*.78);d.scale.setScalar(.19)}
  else{const y=1-2*(i-5.5)/17,rr=Math.sqrt(Math.max(0,1-y*y)),R=2.55;
   d.position.set(R*rr*Math.cos(ang),R*y,R*rr*Math.sin(ang));d.scale.setScalar(.07)}}
 else if(c===3){const t=i/NODES,x=(t-.5)*3.6,z=Math.sin(t*7.2)*1.3;
  d.position.set(x,Math.sin(x*1.2+z*.72)*.52+.3,z);d.scale.setScalar(i%4===0?.14:.075)}
 else if(c===4){const petal=i%5,lvl=Math.floor(i/5),o=petal/5*TAU+lvl*.28,r=1.25-lvl*.12;
  d.position.set(r*Math.cos(o),.35+lvl*.34,r*Math.sin(o));d.scale.setScalar(lvl===0?.17:.085)}
 else if(c===5){const R=2.3+(i*29%13)/13*.9;
  d.position.set(R*Math.cos(ang),R*Math.sin(ang),((i*17%7)/7-.5)*1.8);d.scale.setScalar(i%5===0?.13:.07)}
 else if(c===6){
  if(i<6){const o=i/6*TAU+.3;d.position.set(2.5*Math.cos(o),2.5*Math.sin(o)*.5,2.5*Math.sin(o)*.86);d.scale.setScalar(.16)}
  else{const y=1-2*(i-5.5)/17,rr=Math.sqrt(Math.max(0,1-y*y)),R=2.95;
   d.position.set(R*rr*Math.cos(ang),R*y,R*rr*Math.sin(ang));d.scale.setScalar(.065)}}
 else{
  if(i===0){d.position.set(0,0,0);d.scale.setScalar(.22)}
  else{const r=.5+(i*29%13)/13*.52;
   d.position.set(r*Math.cos(ang),r*Math.sin(ang),((i*17%7)/7-.5)*.3);d.scale.setScalar(.055+(i*11%5)/5*.04)}}
}
const PLACE=[plateAt,strutAt,nodeAt];
// Tám bố cục của cả ba vai trò, tính trước một lần. dir là trục để mảnh bung ra giữa hai chương.
function makeForms(){
 const d=new THREE.Object3D(),out=new THREE.Vector3();
 return ROLES.map((role,r)=>Array.from({length:CHAPTERS},(_,c)=>Array.from({length:role.n},(_,i)=>{
  d.position.set(0,0,0);d.rotation.set(0,0,0);d.quaternion.set(0,0,0,1);d.scale.set(1,1,1);
  PLACE[r](c,i,d);
  out.copy(d.position);
  if(out.lengthSq()<1e-6)out.set(Math.cos(i*2.4),Math.sin(i*1.7),Math.cos(i*3.1));
  return {p:d.position.clone(),q:d.quaternion.clone(),s:d.scale.clone(),dir:out.normalize().clone()};
 })));
}
// Phiến bo góc và vát cạnh, chuẩn hoá về khối đơn vị để giá trị scale trong bố cục là kích thước thật.
function plateGeometry(){
 const w=.5,r=.12,s=new THREE.Shape();
 s.moveTo(-w+r,-w);s.lineTo(w-r,-w);s.quadraticCurveTo(w,-w,w,-w+r);
 s.lineTo(w,w-r);s.quadraticCurveTo(w,w,w-r,w);
 s.lineTo(-w+r,w);s.quadraticCurveTo(-w,w,-w,w-r);
 s.lineTo(-w,-w+r);s.quadraticCurveTo(-w,-w,-w+r,-w);
 const g=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:1,curveSegments:2,steps:1});
 g.center();g.scale(1/1.12,1/1.12,1/.62);
 return g;
}
function makeMaterial(theme,kind){
 const m=new THREE.MeshStandardMaterial(kind==='node'
  ?{color:theme.metalAlt,metalness:.3,roughness:.34,flatShading:true,emissive:new THREE.Color(theme.rim),emissiveIntensity:theme.emissive}
  :kind==='strut'?{color:theme.strut,metalness:.55,roughness:.45,flatShading:true}
  :{metalness:.74,roughness:.27,flatShading:true});
 const k=kind==='node'?1.5:kind==='strut'?.7:1;
 m.userData.rim={uRim:{value:new THREE.Color(theme.rim)},uRimPower:{value:2.6},uRimStrength:{value:theme.rimStrength*k},uRimBase:k};
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,m.userData.rim);
  s.fragmentShader=s.fragmentShader
   .replace('#include <common>','#include <common>\nuniform vec3 uRim;uniform float uRimPower;uniform float uRimStrength;')
   .replace('#include <opaque_fragment>','float fres=pow(1.0-saturate(dot(normalize(normal),normalize(vViewPosition))),uRimPower);\noutgoingLight+=uRim*fres*uRimStrength;\n#include <opaque_fragment>');
 };
 return m;
}
const BACKDROP_VERT='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}';
// Nền không phải tám lớp bật tắt theo chương. Trình biên dịch shader gộp phẳng nhánh if, nên tám khối
// điều kiện vẫn chạy trên mọi điểm ảnh ở mọi chương và giá nhân lên theo số lớp. Ở đây nền chỉ có ba
// nguyên thủy: một trường hạt và hai họ đường, cộng vài số vô hướng. Danh tính của từng chương nằm ở
// tham số, không ở việc có chạy hay không. Nhờ vậy giá cố định, và chuyển chương là nội suy tham số
// chứ không phải hoán đổi lớp: hạt đổi mật độ, đường đổi hướng và độ sắc, sương đổi biên độ.
const BACKDROP_FRAG=`
uniform vec3 uTop,uBottom,uGlow;uniform float uTime,uAspect,uEnergy,uVel,uGlowBase;
uniform vec2 uFocus;uniform vec4 uF,uL1a,uL1b,uL2a,uL2b,uX;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 uv=vUv;
 vec2 p=(uv-uFocus)*vec2(uAspect,1.0);
 float d=length(p);
 vec3 grad=mix(uBottom,uTop,smoothstep(0.0,1.0,uv.y));
 vec3 col=grad;
 col+=uGlow*(1.0-smoothstep(0.0,0.95,d))*uGlowBase;
 float atmo=noise(vec2(uv.x*2.1+uTime*0.035,uv.y*1.5-uTime*0.022));
 col+=uGlow*atmo*0.30*(1.0-smoothstep(0.1,1.25,d))*uEnergy;
 // Sương của Ngưỡng cửa và Dư âm, lõi sáng của Khai mở và Hội tụ. Cùng một trường khí quyển, đổi biên độ.
 col+=uGlow*smoothstep(0.34,0.82,atmo)*uX.z*(1.0-smoothstep(0.2,1.2,d));
 col+=uGlow*(1.0-smoothstep(0.0,0.55,d))*uX.w;
 // Trường hạt: sao ở chiều sâu của Quỹ đạo, bào tử của Nở rộ, bụi của Phân rã. Ngưỡng ô quyết định mật độ.
 vec2 fp=p*uF.x+vec2(0.0,-uTime*uF.w);
 vec2 fi=floor(fp),ff=fract(fp)-0.5;
 vec2 jit=(vec2(hash(fi+3.0),hash(fi+11.0))-0.5)*0.7;
 col+=uGlow*smoothstep(uL2b.w,0.0,length(ff-jit))*step(uF.y,hash(fi))*uF.z;
 // Hai họ đường. Cùng một công thức cho tia Khai mở, vệt quỹ đạo, sóng Thủy triều, đường nứt Phân rã
 // và đường sức Hội tụ: chỉ khác tần số góc, tần số bán kính, hướng, tốc độ và độ sắc.
 float ang=atan(p.y,p.x);
 // atan nhảy bậc ở trục ±pi. Tần số góc là số nội suy nên hiếm khi là số nguyên, và chỗ nhảy bậc đó
 // hiện ra thành một đường thẳng cắt ngang nền. Tắt đường đi trong khoảng 6 độ quanh trục để không thấy mối nối.
 float seam=smoothstep(1.0,0.965,abs(ang)*0.3183);
 float ph1=ang*uL1a.x+d*(uL1a.y+uVel*6.0)+p.x*uL1a.z+p.y*uL1a.w+uTime*uL1b.x;
 float w1=sin(ph1+sin(p.y*uL1b.w-uTime*0.21)*1.2)*0.5+0.5;
 col+=uGlow*pow(w1,uL1b.y)*uL1b.z*seam*(1.0-smoothstep(0.25,1.30,d))*(1.0+uVel*0.8);
 float ph2=ang*uL2a.x+d*uL2a.y+p.x*uL2a.z+p.y*uL2a.w+uTime*uL2b.x;
 col+=uGlow*pow(sin(ph2)*0.5+0.5,uL2b.y)*uL2b.z*seam*(1.0-smoothstep(0.30,1.35,d));
 // Phân rã còn tách nền thành các mặt phẳng lệch sáng. Dùng lại pha của họ đường thứ hai, không thêm phép sin.
 col*=1.0+(fract(ph2*0.159)-0.5)*uX.x;
 // Dư âm lắng về lại gradient thuần: độ phức tạp của môi trường giảm dần thay vì tắt đi.
 col=mix(col,mix(col,grad,0.55),uX.y);
 col*=1.0-0.4*smoothstep(0.32,1.2,length((uv-0.5)*vec2(uAspect,1.0)));
 col+=(hash(uv*vec2(1733.0,1097.0)+fract(uTime)*19.0)-0.5)*0.009;
 gl_FragColor=vec4(col,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function Backdrop({env}){
 const {size}=useThree();
 const uniforms=useMemo(()=>({uTop:{value:new THREE.Color()},uBottom:{value:new THREE.Color()},uGlow:{value:new THREE.Color()},
  uTime:{value:0},uAspect:{value:1},uEnergy:{value:0},uVel:{value:0},uGlowBase:{value:.3},
  uFocus:{value:new THREE.Vector2(.5,.52)},
  uF:{value:new THREE.Vector4()},uL1a:{value:new THREE.Vector4()},uL1b:{value:new THREE.Vector4()},
  uL2a:{value:new THREE.Vector4()},uL2b:{value:new THREE.Vector4()},uX:{value:new THREE.Vector4()}}),[]);
 useFrame((_,dt)=>{
  const s=Math.min(dt,.05),b=env.bg;
  uniforms.uTime.value+=s;
  uniforms.uAspect.value=size.width/size.height;
  uniforms.uTop.value.copy(env.top);uniforms.uBottom.value.copy(env.bottom);uniforms.uGlow.value.copy(env.glow);
  uniforms.uEnergy.value=damp(uniforms.uEnergy.value,.35+env.energy*.9,3,s);
  uniforms.uVel.value=env.vel;
  uniforms.uFocus.value.set(.5+env.focus*.5/Math.max(uniforms.uAspect.value,.2),env.focusY);
  uniforms.uF.value.set(b[0],b[1],b[2],b[3]);
  uniforms.uL1a.value.set(b[4],b[5],b[6],b[7]);
  uniforms.uL1b.value.set(b[8],b[9],b[10],b[11]);
  uniforms.uL2a.value.set(b[12],b[13],b[14],b[15]);
  uniforms.uL2b.value.set(b[16],b[17],b[18],b[24]);
  uniforms.uX.value.set(b[19],b[20],b[21],b[22]);
  uniforms.uGlowBase.value=b[23];
 });
 return <mesh renderOrder={-1} frustumCulled={false}>
  <planeGeometry args={[2,2]}/>
  <shaderMaterial uniforms={uniforms} vertexShader={BACKDROP_VERT} fragmentShader={BACKDROP_FRAG} depthTest={false} depthWrite={false}/>
 </mesh>;
}
// Bụi khí quyển đổi hành vi theo chương ngay trong vertex shader: co vào lõi, bung ra theo tia, quay quanh trục,
// trôi ngang, dâng lên, vỡ ra, hội tụ rồi lắng lại. CPU không đụng tới từng hạt.
const DUST_VERT=`
uniform float uTime,uSize,uPixelRatio,uVel;uniform vec2 uPointer;uniform vec4 uM1,uM2;
attribute float aSeed;varying float vAlpha;
void main(){
 vec3 q=position;
 float s=aSeed;
 float calm=1.0-(uM2.w+uM1.x*0.6)*0.45;
 q.x+=sin(uTime*0.17+s*6.283)*0.6*calm;
 q.y+=cos(uTime*0.12+s*4.11)*0.45*calm;
 q.z+=sin(uTime*0.09+s*2.73)*0.55*calm;
 q*=mix(1.0,0.74,uM1.x);
 q*=mix(1.0,0.86,uM2.w);
 q*=mix(1.0,0.80,uM2.z);
 q+=normalize(q+vec3(0.001))*(uM2.y*1.3+uM1.y*1.6);
 q.z+=uM1.y*1.1;
 float oa=uTime*0.05*uM1.z;
 q=vec3(q.x*cos(oa)-q.z*sin(oa),q.y*mix(1.0,1.16,uM1.z),q.x*sin(oa)+q.z*cos(oa));
 float ph=fract(s*3.17+uTime*0.05*(1.0+uVel*1.5));
 float travel=max(uM1.w,uM2.x);
 q.x=mix(q.x,(ph-0.5)*15.0,uM1.w);
 q.y=mix(q.y,ph*7.0-2.4,uM2.x);
 vec2 toP=q.xy-uPointer*vec2(5.2,3.4);
 q.xy+=normalize(toP+vec2(0.001))*(uM2.w*0.9+uM2.y*0.7)/(1.0+dot(toP,toP)*0.22);
 vec4 mv=modelViewMatrix*vec4(q,1.0);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=uSize*uPixelRatio*(1.0/max(-mv.z,0.1))*(0.55+s)*(1.0+uVel*0.6*uM1.w);
 vAlpha=(0.2+0.6*s)*mix(1.0,smoothstep(0.0,0.07,ph)*smoothstep(1.0,0.93,ph),travel);
}`;
const DUST_FRAG=`
uniform vec3 uColor;uniform float uOpacity;varying float vAlpha;
void main(){
 float d=length(gl_PointCoord-0.5);
 if(d>0.5)discard;
 gl_FragColor=vec4(uColor,smoothstep(0.5,0.0,d)*vAlpha*uOpacity);
 #include <colorspace_fragment>
}`;
function Atmosphere({theme,env,still,low}){
 const {viewport}=useThree();
 const count=low?260:520;
 const geo=useMemo(()=>{
  const g=new THREE.BufferGeometry(),pos=new Float32Array(count*3),seed=new Float32Array(count);
  for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*16;pos[i*3+1]=(Math.random()-.5)*11;pos[i*3+2]=(Math.random()-.5)*9-1;seed[i]=Math.random()}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
  return g;
 },[count]);
 const uniforms=useMemo(()=>({uTime:{value:0},uSize:{value:26},uPixelRatio:{value:1},uVel:{value:0},uPointer:{value:new THREE.Vector2()},
  uColor:{value:new THREE.Color()},uOpacity:{value:0},uM1:{value:new THREE.Vector4()},uM2:{value:new THREE.Vector4()}}),[]);
 useEffect(()=>{uniforms.uColor.value.set(theme.dust)},[theme,uniforms]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 useFrame((_,dt)=>{
  const s=Math.min(dt,.05);
  if(!still)uniforms.uTime.value+=s;
  uniforms.uPixelRatio.value=viewport.dpr;
  uniforms.uVel.value=env.vel;
  uniforms.uPointer.value.set(env.px,env.py);
  uniforms.uM1.value.fromArray(env.l1);uniforms.uM2.value.fromArray(env.l2);
  uniforms.uOpacity.value=damp(uniforms.uOpacity.value,theme.dustOpacity*env.intro,2.5,s);
 });
 return <points frustumCulled={false}>
  <primitive object={geo} attach="geometry"/>
  <shaderMaterial uniforms={uniforms} vertexShader={DUST_VERT} fragmentShader={DUST_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending}/>
 </points>;
}
function Forms({signal,paused,reduced,speed,pointer,pointerOn,theme,still,env,low}){
 const group=useRef(),key=useRef(),fill=useRef(),amb=useRef(),meshes=useRef([]);
 const time=useRef(0),spin=useRef(0),vel=useRef(0),shift=useRef(0);
 const {size,invalidate,camera,scene}=useThree();
 const forms=useMemo(makeForms,[]);
 const geometries=useMemo(()=>[plateGeometry(),new THREE.CylinderGeometry(.5,.5,1,6,1),new THREE.IcosahedronGeometry(.5,0)],[]);
 const materials=useMemo(()=>[makeMaterial(theme,'plate'),makeMaterial(theme,'strut'),makeMaterial(theme,'node')],[]);
 const d=useMemo(()=>new THREE.Object3D(),[]);
 const cur=useMemo(()=>new Float64Array(SN),[]);
 const scratch=useMemo(()=>({q:new THREE.Quaternion(),pos:new THREE.Vector3(),dir:new THREE.Vector3(),tgt:new THREE.Vector3(),ray:new THREE.Vector3(),hit:new THREE.Vector3(),fwd:new THREE.Vector3()}),[]);
 const base=useMemo(()=>({top:new THREE.Color(theme.top),bottom:new THREE.Color(theme.bottom),glow:new THREE.Color(theme.glow),
  key:new THREE.Color(theme.keyColor),fill:new THREE.Color(theme.fillColor)}),[theme]);
 const axes=useMemo(()=>ROLES.map(role=>Array.from({length:role.n},(_,i)=>new THREE.Vector3(Math.sin(i*1.7),Math.cos(i*2.3),Math.sin(i*3.1)).normalize())),[]);
 const seeds=useMemo(()=>ROLES.map(role=>Array.from({length:role.n},(_,i)=>((i*53)%97)/97)),[]);
 useEffect(()=>{
  const color=new THREE.Color(),plates=meshes.current[0];
  if(plates){
   for(let i=0;i<PLATES;i++){color.set(i%13===0?theme.metalAlt:theme.metal);plates.setColorAt(i,color)}
   if(plates.instanceColor)plates.instanceColor.needsUpdate=true;
  }
  materials[1].color.set(theme.strut);
  materials[2].color.set(theme.metalAlt);materials[2].emissive.set(theme.rim);
  materials.forEach(m=>m.userData.rim.uRim.value.set(theme.rim));
  invalidate();
 },[theme,materials,invalidate]);
 useEffect(()=>()=>{geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())},[geometries,materials]);
 useEffect(()=>{signal.current.invalidate=invalidate;return()=>{signal.current.invalidate=null}},[invalidate,signal]);
 useFrame((_,raw)=>{
  if(!group.current)return;
  const dt=Math.min(raw,.05),s=signal.current;
  env.intro=reduced||still?1:Math.min(1,env.intro+dt/1.5);
  const target=clamp(s.p,0,CHAPTERS-1);
  s.smooth=still?target:damp(s.smooth,target,5.5,dt);
  s.tailSmooth=still?s.tail:damp(s.tailSmooth,s.tail,4,dt);
  const p=s.smooth,a=reduced?Math.round(p):Math.floor(p),b=Math.min(a+1,CHAPTERS-1);
  const frac=reduced?0:clamp(p-a,0,1);
  vel.current=damp(vel.current,clamp(Math.abs(s.v)/2600,0,1),4,dt);
  const ease=1-Math.pow(1-env.intro,3);
  // Mỗi chương chia ba pha: tới, trải nghiệm, rồi biến hình. morph là pha thứ ba, bắt đầu muộn nên
  // hình khối và bố cục giữ nguyên danh tính của chương đủ lâu trước khi bắt đầu thành chương kế.
  const morph=reduced?0:smoothstep(frac,MORPH,1);
  // Bung nhẹ đúng lúc đang biến hình để thấy các mảnh tự sắp xếp lại, không dùng để che chuyển cảnh.
  const burst=reduced?0:Math.max(Math.pow(Math.sin(Math.PI*morph),1.6)*.42,1-ease)*(1+vel.current*.3);
  const live=paused||reduced?0:1;
  const touch=pointerOn?live:0;
  if(live)time.current+=dt*speed;
  spin.current=damp(spin.current,s.v/9000,3,dt);
  s.v=still?0:s.v*Math.exp(-6*dt);
  const narrow=size.width<700;
  // Khối đặt trước, con trỏ đọc sau: cần ma trận thế giới mới nhất để đổi vị trí con trỏ về hệ toạ độ của nhóm.
  const wanted=narrow?0:lerp(SHIFT[a],SHIFT[b],morph);
  shift.current=still?wanted:damp(shift.current,wanted,6,dt);
  group.current.position.set(shift.current,(narrow?.85:0)+lerp(LIFT[a],LIFT[b],morph),0);
  group.current.scale.setScalar((narrow?.6:.86)*lerp(.82,1,ease));
  group.current.rotation.set(.2+pointer.current.y*.12*touch,
   -.28+(reduced?a:p)*.3+time.current*.07+s.turn+spin.current,
   -.16+pointer.current.x*.1*touch+spin.current*.25);
  group.current.updateMatrixWorld();
  // Con trỏ thành một điểm thật trong hệ toạ độ của nhóm: bắn tia từ camera qua con trỏ, cắt mặt phẳng
  // đi qua tâm nhóm và vuông góc hướng nhìn. Nhờ vậy trường ảnh hưởng vẫn đúng chỗ khi nhóm đã xoay.
  let pmx=0,pmy=0;
  const field=lerp(PFIELD[a],PFIELD[b],morph)*touch,rip=lerp(RIPPLE[a],RIPPLE[b],morph)*touch;
  if(Math.abs(field)>.001||rip>.001){
   scratch.ray.set(pointer.current.x,-pointer.current.y,.5).unproject(camera).sub(camera.position).normalize();
   camera.getWorldDirection(scratch.fwd);
   scratch.hit.setFromMatrixPosition(group.current.matrixWorld).sub(camera.position);
   const denom=scratch.ray.dot(scratch.fwd);
   const dist=Math.abs(denom)<1e-4?8:scratch.hit.dot(scratch.fwd)/denom;
   scratch.hit.copy(camera.position).addScaledVector(scratch.ray,clamp(dist,.5,40));
   group.current.worldToLocal(scratch.hit);
   pmx=scratch.hit.x;pmy=scratch.hit.y;
  }
  for(let r=0;r<ROLES.length;r++){
   const mesh=meshes.current[r];if(!mesh)continue;
   const role=ROLES[r],A=forms[r][a],B=forms[r][b],blend=smoothstep(frac,role.lead[0],role.lead[1]);
   for(let i=0;i<role.n;i++){
    const seed=seeds[r][i],push=burst*role.burst*(.3+seed*.7);
    scratch.pos.lerpVectors(A[i].p,B[i].p,blend);
    scratch.dir.lerpVectors(A[i].dir,B[i].dir,blend);
    d.position.copy(scratch.pos).addScaledVector(scratch.dir,push);
    if(field!==0||rip>.001){
     const dx=d.position.x-pmx,dy=d.position.y-pmy,dd=dx*dx+dy*dy;
     if(field!==0){const inv=field/(1.6+2*dd);d.position.x+=dx*inv;d.position.y+=dy*inv}
     if(rip>.001)d.position.z+=Math.sin(Math.sqrt(dd)*3.2-time.current*2.4)*.16*rip/(1+dd*.7);
    }
    d.quaternion.slerpQuaternions(A[i].q,B[i].q,blend);
    if(burst>.001){scratch.q.setFromAxisAngle(axes[r][i],burst*1.1*(.3+seed*.8));d.quaternion.premultiply(scratch.q)}
    const breathe=1+Math.sin(time.current*.7+seed*TAU)*.02*live;
    d.scale.lerpVectors(A[i].s,B[i].s,blend).multiplyScalar(ease*breathe*(1-burst*.18));
    d.updateMatrix();mesh.setMatrixAt(i,d.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
  // Camera, đèn, sương và nền cùng đọc một bảng trạng thái nên chúng luôn đổi đồng bộ với hình khối.
  // Chỉ số chạy trên bảng đôi: p*2 đi qua cả hàng chẵn lẫn hàng lẻ, còn chương cuối dùng thêm tiến độ
  // riêng của chính nó để lắng dần thay vì đứng yên ngay khi vừa tới.
  const kf=reduced?a*2:clamp(p*2+(p>=CHAPTERS-1?s.tailSmooth:0),0,KEYS.length-1);
  const ka=Math.min(Math.floor(kf),KEYS.length-1),kb=Math.min(ka+1,KEYS.length-1),kt=smootherstep(kf-ka,0,1);
  const A=KEYS[ka],B=KEYS[kb];
  for(let j=0;j<SN;j++)cur[j]=lerp(A[j],B[j],kt);
  if(reduced)for(let j=0;j<7;j++)cur[j]=KEYS[0][j]+(cur[j]-KEYS[0][j])*.3;
  const px=pointer.current.x*.42*touch,py=-pointer.current.y*.28*touch;
  camera.position.x=damp(camera.position.x,cur[0]+px,4,dt);
  camera.position.y=damp(camera.position.y,cur[1]+py,4,dt);
  camera.position.z=damp(camera.position.z,cur[2]+(narrow?1.7:0)+burst*.5+vel.current*.4,4,dt);
  scratch.tgt.set(cur[3],cur[4]+(narrow?.6:0),cur[5]);
  camera.lookAt(scratch.tgt);
  const fov=cur[6]+(narrow?4:0)+vel.current*3.5-burst*1.2;
  if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix()}
  key.current.position.set(cur[7],cur[8],cur[9]);
  key.current.intensity=theme.key*cur[10];
  fill.current.intensity=theme.fill*cur[11];
  amb.current.intensity=theme.ambient*cur[12];
  // Tint đổi tính cách của đèn: dương kéo về phía lạnh, âm kéo về phía ấm. Trắng thuần không có sắc độ
  // để dịch nên phải thêm cả độ bão hoà, nếu không đổi hue sẽ không thấy gì.
  const tint=cur[21],mag=Math.abs(tint);
  key.current.color.copy(base.key).offsetHSL(tint*.11,mag*.13,-mag*.02);
  fill.current.color.copy(base.fill).offsetHSL(tint*.08,mag*.10,0);
  for(const m of materials)m.userData.rim.uRimStrength.value=theme.rimStrength*m.userData.rim.uRimBase*cur[13];
  materials[2].emissiveIntensity=theme.emissive*cur[20];
  const sat=(cur[17]-1)*.25;
  env.top.copy(base.top).offsetHSL(cur[16],sat,cur[18]);
  env.bottom.copy(base.bottom).offsetHSL(cur[16],sat,cur[18]*.7);
  env.glow.copy(base.glow).offsetHSL(cur[16],sat*1.2,cur[18]*.5).multiplyScalar(cur[19]);
  if(scene.fog){
   const cd=camera.position.length();
   scene.fog.color.copy(env.bottom).lerp(env.top,.45);
   scene.fog.near=Math.max(.1,cd-cur[14]);
   scene.fog.far=cd+cur[15];
  }
  // Nền đọc theo cùng đường cong pha với hình khối, không theo tiến độ cuộn thô: môi trường của chương
  // giữ nguyên suốt pha tới và pha trải nghiệm, chỉ biến dần sang môi trường chương sau ở pha biến hình.
  const EA=ENVS[a],EB=ENVS[b];
  for(let j=0;j<BN;j++)env.bg[j]=lerp(EA[j],EB[j],morph);
  // Chương cuối còn tiến độ riêng để tiếp tục lắng xuống sau khi đã tới.
  if(p>=CHAPTERS-1)env.bg[20]=Math.max(env.bg[20],s.tailSmooth*.85);
  if(low){env.bg[2]*=.7;env.bg[10]*=.75;env.bg[18]*=.75}
  // Lớp bụi vẫn đọc theo trọng số từng chương: phép tính nằm ở vertex shader, 520 đỉnh, không phải mỗi điểm ảnh.
  const wp=a+morph;
  for(let c=0;c<4;c++)env.l1[c]=bump(wp,c,1.15);
  for(let c=0;c<3;c++)env.l2[c]=bump(wp,c+4,1.15);
  env.l2[3]=Math.max(bump(wp,7,1.5),s.tailSmooth*.9);
  if(low){env.l1[2]*=.55;env.l2[1]*=.7}
  env.vel=vel.current;
  env.energy=vel.current+burst*.35;
  env.focus=(narrow?0:shift.current/4.2)+pointer.current.x*.06*touch;
  env.focusY=(narrow?.68:.52)-pointer.current.y*.03*touch;
  env.px=pointer.current.x*touch;env.py=-pointer.current.y*touch;
 });
 return <>
  <ambientLight ref={amb} intensity={theme.ambient} color="#e5ede7"/>
  <hemisphereLight args={[theme.hemiSky,theme.hemiGround,theme.hemi]}/>
  <directionalLight ref={key} position={[4,6,5]} intensity={theme.key} color={theme.keyColor}/>
  <directionalLight ref={fill} position={[-4,-2,3]} intensity={theme.fill} color={theme.fillColor}/>
  <group ref={group}>
   {ROLES.map((role,r)=><instancedMesh key={r} ref={el=>{meshes.current[r]=el}} args={[null,null,role.n]} frustumCulled={false} material={materials[r]}>
    <primitive object={geometries[r]} attach="geometry"/>
   </instancedMesh>)}
  </group>
 </>;
}
function SceneFallback(){return <div className="model-fallback"><div className="model-fallback-form"/><span>Không thể khởi tạo WebGL trên thiết bị này</span></div>}
export default function Scene(props){
 const [contextLost,setContextLost]=useState(false);
 const theme=PALETTE[props.light?'light':'dark'];
 const still=props.paused||props.reduced||props.hidden;
 const low=typeof window!=='undefined'&&window.innerWidth<700;
 // Trạng thái môi trường dùng chung, cấp phát một lần. Forms ghi, Backdrop và Atmosphere đọc trong cùng khung hình.
 const env=useMemo(()=>({top:new THREE.Color(),bottom:new THREE.Color(),glow:new THREE.Color(),
  l1:[0,0,0,0],l2:[0,0,0,0],bg:new Float64Array(BN),vel:0,energy:0,focus:0,focusY:.52,px:0,py:0,intro:0}),[]);
 useEffect(()=>{if(contextLost){const id=setTimeout(()=>setContextLost(false),1200);return()=>clearTimeout(id)}},[contextLost]);
 if(contextLost)return <SceneFallback/>;
 return <Canvas fallback={<SceneFallback/>} frameloop={still?'demand':'always'} dpr={[1,1.25]} camera={{position:[0,0,9.6],fov:40}}
  gl={{alpha:false,antialias:true,powerPreference:'default',failIfMajorPerformanceCaveat:false}}
  onCreated={({gl})=>{
   const onLost=event=>{event.preventDefault();setContextLost(true)};
   gl.domElement.addEventListener('webglcontextlost',onLost);
   gl.domElement.addEventListener('webglcontextrestored',()=>setContextLost(false));
  }}>
  <color attach="background" args={[theme.bg]}/>
  <fog attach="fog" args={[theme.bg,4,18]}/>
  <Forms {...props} theme={theme} still={still} env={env} low={low}/>
  <Backdrop env={env}/>
  <Atmosphere theme={theme} env={env} still={still} low={low}/>
 </Canvas>;
}
