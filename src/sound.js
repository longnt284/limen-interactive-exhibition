// Cảnh âm generative, không phải một vòng nhạc lặp. Năm giọng dao động đứng yên suốt hành trình,
// cùng một nguồn nhiễu; chương chỉ đổi tần số cắt, độ vang, mật độ hoà âm, sắc kim loại và chuyển động không gian.
// Cách này giữ đúng nguyên tắc liên tục của phần hình: âm của chương này tan vào âm của chương sau,
// không có đoạn nào tắt hẳn rồi mở lại. Âm lượng tổng cố định khi đã bật, chỉ có màu âm thay đổi.
const VOICES=[55,82.41,110,164.81,220],DETUNE=[0,-4,3,-6,5];
// cut | wet | noise | panRate | panDepth | cutLfo | năm mức hoà âm
const CH=[
 {cut: 320,wet:.30,noise:0,  rate:.05,depth:.12,lfo: 30,v:[1,  .55,.22,0,  0  ]}, // 01 tiếng ngân trầm
 {cut: 900,wet:.40,noise:0,  rate:.07,depth:.20,lfo: 60,v:[.75,.45,.60,.42,.16]}, // 02 hoà âm mở ra
 {cut: 700,wet:.34,noise:.02,rate:.16,depth:.55,lfo: 90,v:[.65,.30,.50,.30,.20]}, // 03 nhịp đập trong không gian
 {cut: 480,wet:.45,noise:.05,rate:.09,depth:.30,lfo:260,v:[.90,.50,.32,.18,0  ]}, // 04 lớp sóng qua bộ lọc
 {cut:1250,wet:.40,noise:0,  rate:.06,depth:.18,lfo: 70,v:[.60,.50,.62,.50,.34]}, // 05 hoà âm lớn dần
 {cut:2200,wet:.28,noise:.34,rate:.22,depth:.45,lfo:180,v:[.42,.30,.35,.22,.30]}, // 06 sắc kim loại vỡ hạt
 {cut:1100,wet:.44,noise:.10,rate:.08,depth:.22,lfo: 80,v:[.70,.50,.50,.42,.28]}, // 07 các mô típ nhập lại
 {cut: 420,wet:.62,noise:0,  rate:.03,depth:.10,lfo: 20,v:[.50,.30,.18,.08,0  ]}, // 08 đuôi vang dài rồi lặng
];
const MASTER=.022,GLIDE=.4;
const lerp=(a,b,t)=>a+(b-a)*t;
// Đuôi vang dựng từ nhiễu tắt dần theo hàm mũ. Rẻ hơn tải một file phòng vang và không thêm tài nguyên mạng.
function impulse(ctx,seconds){
 const len=Math.floor(ctx.sampleRate*seconds),buf=ctx.createBuffer(2,len,ctx.sampleRate);
 for(let c=0;c<2;c++){
  const data=buf.getChannelData(c);
  for(let i=0;i<len;i++){const t=i/len;data[i]=(Math.random()*2-1)*Math.pow(1-t,2.6)*(1-t*.2)}
 }
 return buf;
}
function noiseBuffer(ctx,seconds){
 const len=Math.floor(ctx.sampleRate*seconds),buf=ctx.createBuffer(1,len,ctx.sampleRate);
 const data=buf.getChannelData(0);
 let last=0;
 for(let i=0;i<len;i++){last=(last+(Math.random()*2-1)*.35)*.86;data[i]=last}
 return buf;
}
export function createSoundscape(){
 const Ctx=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
 if(!Ctx)return null;
 let ctx;
 try{ctx=new Ctx()}catch{return null}
 const master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=CH[0].cut;filter.Q.value=.7;
 const dry=ctx.createGain();dry.gain.value=.85;
 const wet=ctx.createGain();wet.gain.value=CH[0].wet;
 const verb=ctx.createConvolver();verb.buffer=impulse(ctx,3.4);
 const bus=ctx.createGain();bus.gain.value=1;
 bus.connect(filter);
 if(pan){filter.connect(pan);pan.connect(dry);pan.connect(wet)}
 else{filter.connect(dry);filter.connect(wet)}
 dry.connect(master);wet.connect(verb);verb.connect(master);
 const gains=VOICES.map((f,i)=>{
  const osc=ctx.createOscillator();
  osc.type=i>2?'triangle':'sine';
  osc.frequency.value=f;osc.detune.value=DETUNE[i];
  const g=ctx.createGain();g.gain.value=CH[0].v[i]*.32;
  osc.connect(g);g.connect(bus);osc.start();
  return g;
 });
 // Nguồn nhiễu đi qua bộ lọc dải hẹp cho ra sắc kim loại của chương Phân rã, im lặng ở các chương khác.
 const noise=ctx.createBufferSource();noise.buffer=noiseBuffer(ctx,4);noise.loop=true;
 const band=ctx.createBiquadFilter();band.type='bandpass';band.frequency.value=1200;band.Q.value=14;
 const noiseGain=ctx.createGain();noiseGain.gain.value=0;
 noise.connect(band);band.connect(noiseGain);noiseGain.connect(bus);noise.start();
 const bandLfo=ctx.createOscillator();bandLfo.frequency.value=.13;
 const bandDepth=ctx.createGain();bandDepth.gain.value=620;
 bandLfo.connect(bandDepth);bandDepth.connect(band.frequency);bandLfo.start();
 const cutLfo=ctx.createOscillator();cutLfo.frequency.value=.08;
 const cutDepth=ctx.createGain();cutDepth.gain.value=CH[0].lfo;
 cutLfo.connect(cutDepth);cutDepth.connect(filter.frequency);cutLfo.start();
 const panLfo=ctx.createOscillator();panLfo.frequency.value=CH[0].rate;
 const panDepth=ctx.createGain();panDepth.gain.value=CH[0].depth;
 if(pan){panLfo.connect(panDepth);panDepth.connect(pan.pan)}
 panLfo.start();
 let on=false,closed=false;
 const ramp=(param,value)=>{if(!closed)param.setTargetAtTime(value,ctx.currentTime,GLIDE)};
 return {
  // Đặt trạng thái theo tiến độ cuộn thật, dạng số thực, nên chuyển chương là trộn hai bảng chứ không nhảy nấc.
  set(p){
   if(closed)return;
   const t=Math.min(Math.max(p,0),CH.length-1),a=Math.floor(t),b=Math.min(a+1,CH.length-1),f=t-a;
   const A=CH[a],B=CH[b];
   ramp(filter.frequency,lerp(A.cut,B.cut,f));
   ramp(cutDepth.gain,lerp(A.lfo,B.lfo,f));
   ramp(wet.gain,lerp(A.wet,B.wet,f));
   ramp(dry.gain,1-lerp(A.wet,B.wet,f)*.55);
   ramp(noiseGain.gain,lerp(A.noise,B.noise,f)*.16);
   ramp(panLfo.frequency,lerp(A.rate,B.rate,f));
   if(pan)ramp(panDepth.gain,lerp(A.depth,B.depth,f));
   for(let i=0;i<gains.length;i++)ramp(gains[i].gain,lerp(A.v[i],B.v[i],f)*.32);
  },
  async start(){
   if(closed)return false;
   await ctx.resume();
   master.gain.cancelScheduledValues(ctx.currentTime);
   master.gain.setValueAtTime(master.gain.value,ctx.currentTime);
   master.gain.linearRampToValueAtTime(MASTER,ctx.currentTime+1.2);
   on=true;
   return true;
  },
  stop(){
   if(closed)return;
   master.gain.cancelScheduledValues(ctx.currentTime);
   master.gain.setValueAtTime(master.gain.value,ctx.currentTime);
   master.gain.linearRampToValueAtTime(0,ctx.currentTime+.9);
   on=false;
   setTimeout(()=>{if(!closed&&!on)ctx.suspend().catch(()=>{})},950);
  },
  close(){
   if(closed)return;
   closed=true;
   [noise,bandLfo,cutLfo,panLfo].forEach(n=>{try{n.stop()}catch{}});
   ctx.close().catch(()=>{});
  },
 };
}
