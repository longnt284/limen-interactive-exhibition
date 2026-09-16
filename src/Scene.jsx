import React,{useMemo,useRef,useEffect,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
const COUNT=180,CHAPTERS=8,DUST=520;
const {clamp,lerp,smoothstep,damp}=THREE.MathUtils;
// Every chapter owns a different geometry; k rescales the shared layout to suit it.
const BODIES=[
 {make:()=>new THREE.BoxGeometry(1,1,1),k:[1,1,1]},
 {make:()=>new THREE.CylinderGeometry(.5,.5,1,6,1),k:[1,3.2,1]},
 {make:()=>new THREE.CapsuleGeometry(.5,1,3,8),k:[2.6,.62,2.6]},
 {make:()=>new THREE.CylinderGeometry(.5,.5,1,14,1),k:[2.2,1,2.2]},
 {make:()=>new THREE.SphereGeometry(.5,14,9),k:[1,4.4,1]},
 {make:()=>new THREE.TetrahedronGeometry(.62),k:[1.45,5.4,1.15]},
 {make:()=>new THREE.IcosahedronGeometry(.55,0),k:[1.15,4.2,1.15]},
 {make:()=>new THREE.TorusGeometry(.38,.14,5,12),k:[3.4,10,1.6]},
];
const PALETTE={
 dark :{bg:'#111c1b',bottom:'#08100e',top:'#22382e',glow:'#3e6f50',rim:'#cfe9a0',rimStrength:.62,
        metal:'#c2d0c6',metalAlt:'#d4eba8',dust:'#cde79f',dustOpacity:.8,
        ambient:.4,hemiSky:'#eef5ef',hemiGround:'#17271f',hemi:1.15,key:2.2,keyColor:'#f6fff7',fill:1.35,fillColor:'#d0e99d'},
 light:{bg:'#dce3db',bottom:'#c2d1bd',top:'#f1f4ee',glow:'#ffffff',rim:'#ffffff',rimStrength:.34,
        metal:'#71877a',metalAlt:'#54742f',dust:'#77906c',dustOpacity:.42,
        ambient:.72,hemiSky:'#ffffff',hemiGround:'#8fa48d',hemi:1.25,key:2.5,keyColor:'#ffffff',fill:1.05,fillColor:'#aecb84'},
};
// Eight precomputed layouts: position, rotation, scale plus a scatter axis per instance.
function makeForms(){
 const d=new THREE.Object3D(),out=new THREE.Vector3();
 return Array.from({length:CHAPTERS},(_,chapter)=>Array.from({length:COUNT},(_,i)=>{
  const t=i/COUNT*Math.PI*2;
  d.position.set(0,0,0);d.rotation.set(0,0,0);d.scale.set(1,1,1);
  if(chapter===0){d.position.set(1.65*Math.cos(t),1.65*Math.sin(t),0);d.rotation.z=t;d.rotateY(t*1.5);d.scale.set(.8,.024,.68)}
  if(chapter===1){const r=.45+1.7*i/COUNT,a=t*3;d.position.set(r*Math.cos(a),r*Math.sin(a),(i/COUNT-.5)*1.4);d.rotation.set(.4,a*.3,a);d.scale.set(.65,.026,.36)}
  if(chapter===2){const ring=Math.floor(i/30),a=i%30/30*Math.PI*2,r=1.2+ring*.12;d.position.set(r*Math.cos(a),r*Math.sin(a)*Math.cos(ring*.42),r*Math.sin(a)*Math.sin(ring*.42));d.rotation.set(ring*.42,0,a);d.scale.set(.05,.34,.05)}
  if(chapter===3){const x=(i%18-8.5)*.23,z=(Math.floor(i/18)-4.5)*.3;d.position.set(x,Math.sin(x*1.6+z)*.65,z);d.rotation.set(0,0,Math.cos(x*1.6+z)*.4);d.scale.set(.055,.5+Math.sin(x+z)*.24,.065)}
  if(chapter===4){const petal=Math.floor(i/30),u=i%30/29,a=petal*Math.PI/3+u*.7,r=.45+Math.sin(u*Math.PI)*1.7;d.position.set(r*Math.cos(a),r*Math.sin(a),Math.cos(u*Math.PI)*.65);d.rotation.set(u*1.4,petal*.5,a);d.scale.set(.6,.026,.32)}
  if(chapter===5){const r=.95+((i*37)%101)/101*1.35,a=i*2.39996,y=1-2*(i+.5)/COUNT;d.position.set(r*Math.sqrt(1-y*y)*Math.cos(a),r*y+.34,r*Math.sqrt(1-y*y)*Math.sin(a));d.rotation.set(i*.72,i*.31,i*.57);d.scale.set(.12+(i%5)*.06,.04,.3)}
  if(chapter===6){const y=1-2*(i+.5)/COUNT,a=i*2.39996,r=1.65;d.position.set(r*Math.sqrt(1-y*y)*Math.cos(a),r*y,r*Math.sqrt(1-y*y)*Math.sin(a));d.lookAt(0,0,0);d.scale.set(.24,.035,.32)}
  if(chapter===7){d.position.set(1.65*Math.cos(t),1.65*Math.sin(t),0);d.rotation.set(0,t*.5,t);d.scale.set(.12,.034,.38)}
  const k=BODIES[chapter].k;
  out.copy(d.position);
  if(out.lengthSq()<1e-6)out.set(Math.cos(i*2.4),Math.sin(i*1.7),Math.cos(i*3.1));
  return {p:d.position.clone(),q:d.quaternion.clone(),s:new THREE.Vector3(d.scale.x*k[0],d.scale.y*k[1],d.scale.z*k[2]),dir:out.clone().normalize()};
 }));
}
function makeMaterial(theme){
 const m=new THREE.MeshStandardMaterial({metalness:.74,roughness:.27,flatShading:true});
 m.userData.rim={uRim:{value:new THREE.Color(theme.rim)},uRimPower:{value:2.6},uRimStrength:{value:theme.rimStrength}};
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,m.userData.rim);
  s.fragmentShader=s.fragmentShader
   .replace('#include <common>','#include <common>\nuniform vec3 uRim;uniform float uRimPower;uniform float uRimStrength;')
   .replace('#include <opaque_fragment>','float fres=pow(1.0-saturate(dot(normalize(normal),normalize(vViewPosition))),uRimPower);\noutgoingLight+=uRim*fres*uRimStrength;\n#include <opaque_fragment>');
 };
 return m;
}
const BACKDROP_VERT='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}';
const BACKDROP_FRAG=`
uniform vec3 uTop,uBottom,uGlow;uniform float uTime,uAspect,uEnergy;uniform vec2 uFocus;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 uv=vUv;
 vec3 col=mix(uBottom,uTop,smoothstep(0.0,1.0,uv.y));
 vec2 p=(uv-uFocus)*vec2(uAspect,1.0);
 float d=length(p);
 col+=uGlow*(1.0-smoothstep(0.0,0.95,d))*0.5;
 float n=noise(vec2(uv.x*2.1+uTime*0.05,uv.y*1.5-uTime*0.03));
 float n2=noise(vec2(uv.x*4.7-uTime*0.04,uv.y*3.1+uTime*0.02));
 col+=uGlow*(n*0.55+n2*0.3)*0.26*(1.0-smoothstep(0.1,1.25,d))*uEnergy;
 col*=1.0-0.4*smoothstep(0.32,1.2,length((uv-0.5)*vec2(uAspect,1.0)));
 col+=(hash(uv*vec2(1733.0,1097.0)+fract(uTime)*19.0)-0.5)*0.009;
 gl_FragColor=vec4(col,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
function Backdrop({theme,signal}){
 const {size}=useThree();
 const uniforms=useMemo(()=>({uTop:{value:new THREE.Color()},uBottom:{value:new THREE.Color()},uGlow:{value:new THREE.Color()},
  uTime:{value:0},uAspect:{value:1},uEnergy:{value:0},uFocus:{value:new THREE.Vector2(.5,.52)}}),[]);
 useEffect(()=>{uniforms.uTop.value.set(theme.top);uniforms.uBottom.value.set(theme.bottom);uniforms.uGlow.value.set(theme.glow)},[theme,uniforms]);
 useFrame((_,dt)=>{
  uniforms.uTime.value+=Math.min(dt,.05);
  uniforms.uAspect.value=size.width/size.height;
  uniforms.uEnergy.value=damp(uniforms.uEnergy.value,.35+signal.current.energy*.9,3,Math.min(dt,.05));
  uniforms.uFocus.value.set(.5+signal.current.focus*.5/Math.max(uniforms.uAspect.value,.2),signal.current.focusY);
 });
 return <mesh renderOrder={-1} frustumCulled={false}>
  <planeGeometry args={[2,2]}/>
  <shaderMaterial uniforms={uniforms} vertexShader={BACKDROP_VERT} fragmentShader={BACKDROP_FRAG} depthTest={false} depthWrite={false}/>
 </mesh>;
}
const DUST_VERT=`
uniform float uTime,uSize,uPixelRatio;attribute float aSeed;varying float vAlpha;
void main(){
 vec3 q=position;
 q.x+=sin(uTime*0.17+aSeed*6.283)*0.6;
 q.y+=cos(uTime*0.12+aSeed*4.11)*0.45;
 q.z+=sin(uTime*0.09+aSeed*2.73)*0.55;
 vec4 mv=modelViewMatrix*vec4(q,1.0);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=uSize*uPixelRatio*(1.0/max(-mv.z,0.1))*(0.55+aSeed);
 vAlpha=0.2+0.6*aSeed;
}`;
const DUST_FRAG=`
uniform vec3 uColor;uniform float uOpacity;varying float vAlpha;
void main(){
 float d=length(gl_PointCoord-0.5);
 if(d>0.5)discard;
 gl_FragColor=vec4(uColor,smoothstep(0.5,0.0,d)*vAlpha*uOpacity);
 #include <colorspace_fragment>
}`;
function Dust({theme,signal,still}){
 const {viewport}=useThree();
 const geo=useMemo(()=>{
  const g=new THREE.BufferGeometry(),pos=new Float32Array(DUST*3),seed=new Float32Array(DUST);
  for(let i=0;i<DUST;i++){pos[i*3]=(Math.random()-.5)*16;pos[i*3+1]=(Math.random()-.5)*11;pos[i*3+2]=(Math.random()-.5)*9-1;seed[i]=Math.random()}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
  return g;
 },[]);
 const uniforms=useMemo(()=>({uTime:{value:0},uSize:{value:26},uPixelRatio:{value:1},uColor:{value:new THREE.Color()},uOpacity:{value:0}}),[]);
 useEffect(()=>{uniforms.uColor.value.set(theme.dust)},[theme,uniforms]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 useFrame((_,dt)=>{
  if(!still)uniforms.uTime.value+=Math.min(dt,.05);
  uniforms.uPixelRatio.value=viewport.dpr;
  uniforms.uOpacity.value=damp(uniforms.uOpacity.value,theme.dustOpacity*signal.current.intro,2.5,Math.min(dt,.05));
 });
 return <points frustumCulled={false}>
  <primitive object={geo} attach="geometry"/>
  <shaderMaterial uniforms={uniforms} vertexShader={DUST_VERT} fragmentShader={DUST_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending}/>
 </points>;
}
function Forms({signal,paused,reduced,speed,pointer,theme,still}){
 const group=useRef(),meshes=useRef([]),time=useRef(0),spin=useRef(0),vel=useRef(0),shift=useRef(0);
 const {size,invalidate,camera}=useThree();
 const forms=useMemo(makeForms,[]);
 const geometries=useMemo(()=>BODIES.map(b=>b.make()),[]);
 const material=useMemo(()=>makeMaterial(theme),[]);
 const d=useMemo(()=>new THREE.Object3D(),[]);
 const scratch=useMemo(()=>({q:new THREE.Quaternion(),axis:new THREE.Vector3(),pos:new THREE.Vector3(),dir:new THREE.Vector3()}),[]);
 const axes=useMemo(()=>Array.from({length:COUNT},(_,i)=>new THREE.Vector3(Math.sin(i*1.7),Math.cos(i*2.3),Math.sin(i*3.1)).normalize()),[]);
 const seeds=useMemo(()=>Array.from({length:COUNT},(_,i)=>((i*53)%97)/97),[]);
 useEffect(()=>{
  const color=new THREE.Color();
  meshes.current.forEach(mesh=>{
   if(!mesh)return;
   for(let i=0;i<COUNT;i++){color.set(i%13===0?theme.metalAlt:theme.metal);mesh.setColorAt(i,color)}
   if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  });
  material.userData.rim.uRim.value.set(theme.rim);
  material.userData.rim.uRimStrength.value=theme.rimStrength;
  invalidate();
 },[theme,material,invalidate]);
 useEffect(()=>()=>{geometries.forEach(g=>g.dispose());material.dispose()},[geometries,material]);
 useEffect(()=>{signal.current.invalidate=invalidate;return()=>{signal.current.invalidate=null}},[invalidate,signal]);
 useFrame((state,raw)=>{
  const dt=Math.min(raw,.05),s=signal.current;
  s.intro=reduced||still?1:Math.min(1,s.intro+dt/1.5);
  const target=clamp(s.p,0,CHAPTERS-1);
  s.smooth=still?target:damp(s.smooth,target,5.5,dt);
  const p=s.smooth,a=reduced?Math.round(p):Math.floor(p),b=Math.min(a+1,CHAPTERS-1);
  const frac=reduced?0:clamp(p-a,0,1),mix=smoothstep(frac,.06,.94);
  vel.current=damp(vel.current,clamp(Math.abs(s.v)/2600,0,1),4,dt);
  const ease=1-Math.pow(1-s.intro,3);
  const burst=reduced?0:Math.max(Math.pow(Math.sin(Math.PI*frac),1.35)*.82,1-ease)*(1+vel.current*.35);
  const fadeA=a===b?1:1-smoothstep(frac,.3,.68),fadeB=a===b?0:smoothstep(frac,.32,.7);
  if(!paused&&!reduced)time.current+=dt*speed;
  spin.current=damp(spin.current,s.v/9000,3,dt);
  s.v=still?0:s.v*Math.exp(-6*dt);
  for(let m=0;m<CHAPTERS;m++){
   const mesh=meshes.current[m];if(!mesh)continue;
   const fade=Math.max(m===a?fadeA:0,m===b?fadeB:0)*ease;
   if(fade<=.002){mesh.visible=false;continue}
   mesh.visible=true;
   const A=forms[a],B=forms[b];
   for(let i=0;i<COUNT;i++){
    const seed=seeds[i],push=burst*(.34+seed*.66);
    scratch.pos.lerpVectors(A[i].p,B[i].p,mix);
    scratch.dir.lerpVectors(A[i].dir,B[i].dir,mix);
    d.position.copy(scratch.pos).addScaledVector(scratch.dir,push);
    d.quaternion.slerpQuaternions(A[i].q,B[i].q,mix);
    if(burst>.001){scratch.q.setFromAxisAngle(axes[i],burst*1.5*(.35+seed*.8));d.quaternion.premultiply(scratch.q)}
    d.scale.lerpVectors(A[i].s,B[i].s,mix).multiplyScalar(fade*(1-burst*.24));
    d.updateMatrix();mesh.setMatrixAt(i,d.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
  const narrow=size.width<700;
  const shifts=[1.65,-1.75,1.65,-1.7,1.65,0,-1.7,0];
  const wanted=narrow?0:lerp(shifts[a],shifts[b],mix);
  shift.current=still?wanted:damp(shift.current,wanted,6,dt);
  group.current.position.x=shift.current;
  group.current.position.y=narrow?.85:0;
  group.current.scale.setScalar((narrow?.64:.9)*lerp(.82,1,ease));
  const drift=!paused&&!reduced?1:0;
  group.current.rotation.set(.22+pointer.current.y*.12*drift,
   -.3+(reduced?a:p)*.38+time.current*.08+s.turn+spin.current,
   -.2+pointer.current.x*.1*drift+spin.current*.25);
  s.focus=narrow?0:shift.current/4.2;
  s.focusY=narrow?.68:.52;
  s.energy=vel.current+burst*.35;
  const fov=42+vel.current*4.5-burst*1.5;
  const z=8.5-lerp(0,.55,ease)+burst*.6+vel.current*.35;
  camera.position.x=damp(camera.position.x,pointer.current.x*.45*drift,4,dt);
  camera.position.y=damp(camera.position.y,-pointer.current.y*.3*drift,4,dt);
  camera.position.z=damp(camera.position.z,z,4,dt);
  camera.lookAt(0,narrow?.6:0,0);
  if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix()}
 });
 return <group ref={group}>
  {BODIES.map((_,i)=><instancedMesh key={i} ref={el=>{meshes.current[i]=el}} args={[null,null,COUNT]} frustumCulled={false} visible={false} material={material}>
   <primitive object={geometries[i]} attach="geometry"/>
  </instancedMesh>)}
 </group>;
}
function SceneFallback(){return <div className="model-fallback"><div className="model-fallback-form"/><span>Không thể khởi tạo WebGL trên thiết bị này</span></div>}
export default function Scene(props){
 const [contextLost,setContextLost]=useState(false);
 const theme=PALETTE[props.light?'light':'dark'];
 const still=props.paused||props.reduced||props.hidden;
 useEffect(()=>{if(contextLost){const id=setTimeout(()=>setContextLost(false),1200);return()=>clearTimeout(id)}},[contextLost]);
 if(contextLost)return <SceneFallback/>;
 return <Canvas fallback={<SceneFallback/>} frameloop={still?'demand':'always'} dpr={[1,1.25]} camera={{position:[0,0,8.5],fov:42}}
  gl={{alpha:false,antialias:true,powerPreference:'default',failIfMajorPerformanceCaveat:false}}
  onCreated={({gl})=>{
   const onLost=event=>{event.preventDefault();setContextLost(true)};
   gl.domElement.addEventListener('webglcontextlost',onLost);
   gl.domElement.addEventListener('webglcontextrestored',()=>setContextLost(false));
  }}>
  <color attach="background" args={[theme.bg]}/>
  <Backdrop theme={theme} signal={props.signal}/>
  <ambientLight intensity={theme.ambient} color="#e5ede7"/>
  <hemisphereLight args={[theme.hemiSky,theme.hemiGround,theme.hemi]}/>
  <directionalLight position={[4,6,5]} intensity={theme.key} color={theme.keyColor}/>
  <directionalLight position={[-4,-2,3]} intensity={theme.fill} color={theme.fillColor}/>
  <Forms {...props} theme={theme} still={still}/>
  <Dust theme={theme} signal={props.signal} still={still}/>
 </Canvas>;
}
