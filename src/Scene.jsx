import React,{useMemo,useRef,useEffect,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
const COUNT=180;
// One mesh for the entire journey; no model loading at chapter boundaries.
function makeForms(){
 const d=new THREE.Object3D();
 return Array.from({length:8},(_,chapter)=>Array.from({length:COUNT},(_,i)=>{
  const t=i/COUNT*Math.PI*2;
  d.position.set(0,0,0);d.rotation.set(0,0,0);d.scale.set(1,1,1);
  if(chapter===0){d.position.set(1.65*Math.cos(t),1.65*Math.sin(t),0);d.rotation.z=t;d.rotateY(t*1.5);d.scale.set(.8,.024,.68)}
  if(chapter===1){const r=.45+1.7*i/COUNT,a=t*3;d.position.set(r*Math.cos(a),r*Math.sin(a),(i/COUNT-.5)*1.4);d.rotation.set(.4,a*.3,a);d.scale.set(.65,.026,.36)}
  if(chapter===2){const ring=Math.floor(i/30),a=i%30/30*Math.PI*2,r=1.2+ring*.12;d.position.set(r*Math.cos(a),r*Math.sin(a)*Math.cos(ring*.42),r*Math.sin(a)*Math.sin(ring*.42));d.rotation.set(ring*.42,0,a);d.scale.set(.05,.34,.05)}
  if(chapter===3){const x=(i%18-8.5)*.23,z=(Math.floor(i/18)-4.5)*.3;d.position.set(x,Math.sin(x*1.6+z)*.65,z);d.rotation.set(0,0,Math.cos(x*1.6+z)*.4);d.scale.set(.055,.5+Math.sin(x+z)*.24,.065)}
  if(chapter===4){const petal=Math.floor(i/30),u=i%30/29,a=petal*Math.PI/3+u*.7,r=.45+Math.sin(u*Math.PI)*1.7;d.position.set(r*Math.cos(a),r*Math.sin(a),Math.cos(u*Math.PI)*.65);d.rotation.set(u*1.4,petal*.5,a);d.scale.set(.6,.026,.32)}
  if(chapter===5){const r=1.1+((i*37)%101)/101*1.9,a=i*2.39996,y=1-2*(i+.5)/COUNT;d.position.set(r*Math.sqrt(1-y*y)*Math.cos(a),r*y,r*Math.sqrt(1-y*y)*Math.sin(a));d.rotation.set(i*.72,i*.31,i*.57);d.scale.set(.12+(i%5)*.06,.04,.3)}
  if(chapter===6){const y=1-2*(i+.5)/COUNT,a=i*2.39996,r=1.65;d.position.set(r*Math.sqrt(1-y*y)*Math.cos(a),r*y,r*Math.sqrt(1-y*y)*Math.sin(a));d.lookAt(0,0,0);d.scale.set(.24,.035,.32)}
  if(chapter===7){d.position.set(1.65*Math.cos(t),1.65*Math.sin(t),0);d.rotation.set(0,t*.5,t);d.scale.set(.12,.034,.38)}
  return {p:d.position.clone(),q:d.quaternion.clone(),s:d.scale.clone()};
 }));
}
function Forms({signal,paused,reduced,speed,pointer}){
 const mesh=useRef(),group=useRef(),time=useRef(0),{size,invalidate}=useThree();
 const forms=useMemo(makeForms,[]),d=useMemo(()=>new THREE.Object3D(),[]);
 useEffect(()=>{const color=new THREE.Color();for(let i=0;i<COUNT;i++){color.set(i%13===0?'#d4eba8':'#c1cfc5');mesh.current.setColorAt(i,color)}mesh.current.instanceColor.needsUpdate=true},[]);
 useEffect(()=>{signal.current.invalidate=invalidate;return()=>{signal.current.invalidate=null}},[invalidate,signal]);
 useFrame((_,dt)=>{
  const p=THREE.MathUtils.clamp(signal.current.p,0,7),a=reduced?Math.round(p):Math.floor(p),b=Math.min(a+1,7),mix=reduced?0:THREE.MathUtils.smoothstep(p-a,.06,.94);
  if(!paused&&!reduced)time.current+=Math.min(dt,.04)*speed;
  for(let i=0;i<COUNT;i++){d.position.lerpVectors(forms[a][i].p,forms[b][i].p,mix);d.quaternion.slerpQuaternions(forms[a][i].q,forms[b][i].q,mix);d.scale.lerpVectors(forms[a][i].s,forms[b][i].s,mix);d.updateMatrix();mesh.current.setMatrixAt(i,d.matrix)}
  mesh.current.instanceMatrix.needsUpdate=true;
  const shifts=[1.65,-1.75,1.65,-1.7,1.65,0,-1.7,0];
  group.current.position.x=size.width<700?0:THREE.MathUtils.lerp(shifts[a],shifts[b],mix);
  group.current.position.y=size.width<700?.85:0;
  group.current.scale.setScalar(size.width<700?.64:.9);
  group.current.rotation.set(.22+(!paused&&!reduced?pointer.current.y*.12:0),-.3+(reduced?a:p)*.38+time.current*.08+signal.current.turn,-.2+(!paused&&!reduced?pointer.current.x*.1:0));
 });
 return <group ref={group}><instancedMesh ref={mesh} args={[null,null,COUNT]} frustumCulled={false}><boxGeometry args={[1,1,1]}/><meshStandardMaterial metalness={.72} roughness={.3}/></instancedMesh></group>
}
function SceneFallback(){return <div className="model-fallback"><div className="model-fallback-form"/><span>Không thể khởi tạo WebGL trên thiết bị này</span></div>}
export default function Scene(props){
 const [contextLost,setContextLost]=useState(false);
 if(contextLost)return <SceneFallback/>;
 return <Canvas fallback={<SceneFallback/>} frameloop={props.paused||props.reduced||props.hidden?'demand':'always'} dpr={[1,1.25]} camera={{position:[0,0,8.5],fov:42}} gl={{alpha:false,antialias:true,powerPreference:'default',failIfMajorPerformanceCaveat:false}} onCreated={({gl})=>gl.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setContextLost(true)},{once:true})}>
  <color attach="background" args={['#263a31']}/>
  <ambientLight intensity={.4} color="#e5ede7"/>
  <hemisphereLight args={['#eef5ef','#17271f',1.15]}/>
  <directionalLight position={[4,6,5]} intensity={2.2} color="#f6fff7"/>
  <directionalLight position={[-4,-2,3]} intensity={1.35} color="#d0e99d"/>
  <Forms {...props}/>
 </Canvas>
}

