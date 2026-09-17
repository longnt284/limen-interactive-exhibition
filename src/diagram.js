// Hệ sơ đồ kể chuyện. Mười sáu nút giữ nguyên danh tính suốt tám chương: chuyển chương là đổi bố cục
// của cùng một tập nút và cùng một tập đường nối, không phải thay sơ đồ này bằng sơ đồ khác.
// Toạ độ nằm trong khung vuông 0..100, khớp giữa viewBox của SVG và vị trí phần trăm của nút HTML.
export const CH = 8;

// motif là hình vẽ riêng của từng nút, cố định suốt hành trình để mắt nhận ra nút cũ ở chương mới.
// w là bề ngang nút tính theo phần trăm cạnh khung.
export const NODES = [
 {kind:'image',motif:0,w:24},
 {kind:'image',motif:1,w:18},
 {kind:'image',motif:2,w:18},
 {kind:'image',motif:3,w:18},
 {kind:'image',motif:4,w:18},
 {kind:'image',motif:5,w:18},
 {kind:'mark',motif:6,w:10},
 {kind:'mark',motif:7,w:10},
 {kind:'mark',motif:8,w:10},
 {kind:'mark',motif:9,w:10},
 {kind:'dot',w:3},{kind:'dot',w:3},{kind:'dot',w:3},{kind:'dot',w:3},
 {kind:'card',w:30},{kind:'card',w:30},
];
export const CORE = 0, PART0 = 1, MARK0 = 6, DOT0 = 10, CARD0 = 14;

// Sáu nhóm đường nối. Nhóm nào nặng ở chương nào do bảng W quyết định, nên cùng một đường
// mạnh lên ở chương này và mờ đi ở chương khác thay vì bị xoá rồi vẽ lại.
export const EDGES = [
 {a:0,b:1,g:0,c:.12},{a:0,b:2,g:0,c:-.12},{a:0,b:3,g:0,c:.12},{a:0,b:4,g:0,c:-.12},{a:0,b:5,g:0,c:.12},
 {a:1,b:2,g:1,c:.2},{a:2,b:3,g:1,c:.2},{a:3,b:4,g:1,c:.2},{a:4,b:5,g:1,c:.2},{a:5,b:1,g:1,c:.2},
 {a:0,b:1,g:2,c:.1},{a:1,b:6,g:2,c:.1},{a:6,b:2,g:2,c:-.1},{a:2,b:7,g:2,c:.1},
 {a:7,b:3,g:2,c:-.1},{a:3,b:8,g:2,c:.1},{a:8,b:4,g:2,c:-.1},{a:4,b:9,g:2,c:.1},{a:9,b:5,g:2,c:-.1},
 {a:0,b:6,g:3,c:.26},{a:0,b:7,g:3,c:-.26},{a:0,b:8,g:3,c:.26},{a:0,b:9,g:3,c:-.26},
 {a:10,b:11,g:4,c:0},{a:11,b:12,g:4,c:0},{a:12,b:13,g:4,c:0},{a:13,b:10,g:4,c:0},{a:0,b:10,g:4,c:0},{a:0,b:12,g:4,c:0},
 {a:14,b:0,g:5,c:.18},{a:15,b:0,g:5,c:-.18},
];
// Trọng số của sáu nhóm qua tám chương: nan hoa, vành, chuỗi dòng chảy, nhánh, lưới, dây neo thẻ.
export const W = [
 [.28,1,.9,.34,.78,.14,.86,.34],
 [.12,.3,.76,.2,.16,.06,.6,.52],
 [0,.14,.3,1,.56,.12,.5,.1],
 [.14,.34,.4,.2,1,.24,.46,.18],
 [.2,.1,.26,.14,.2,.34,.9,.3],
 [.4,.62,.3,.3,.62,.2,.5,.7],
];
// Mức hướng của chuỗi: chương nào có hạt chạy dọc đường dẫn và chạy mạnh tới đâu.
export const DIRECTED = [0,.18,.22,1,.8,.1,.42,.12];
// Mức đứt nét: chương Phân rã đẩy mọi đường nối thành nét gãy.
export const DASH = [.12,0,.08,0,0,1,.05,.22];
// Ba vùng nền mềm phía sau: quầng lõi, vùng cụm thành phần, khí quyển rộng.
export const ZONE_A = [
 [.85,.6,.5,.34,.55,.22,.7,1],
 [.14,.7,.62,.75,.8,.4,.85,.3],
 [.5,.45,.6,.5,.55,.72,.6,.8],
];
// Khung sơ đồ đặt ở phía đối diện phần chữ: [tâm ngang %, tâm dọc %, hệ số phóng].
export const STAGE = [
 [71,50,1],[29,50,.96],[72,49,.9],[28,50,1.02],[73,50,.98],[50,42,1.06],[30,50,.94],[50,40,.92],
];
export const STAGE_NARROW = [
 [50,29,1],[50,29,.98],[50,28,.94],[50,29,1],[50,30,.98],[50,27,1.02],[50,29,.96],[50,27,.94],
];
// Độ lệch hue và lum của tám chương. Nền CSS, chữ nền khổng lồ và cảnh 3D cùng đọc bảng này.
export const TINT = [[0,0],[3.6,2],[-5.4,.8],[-10.8,-1],[7.9,3],[-14.4,-2],[2.9,1],[0,5]];
// Ba lớp cấu trúc của nền: lưới, đường bình độ, ma trận chấm.
export const TEX = [
 [.1,.16,.55],[.22,.1,.5],[.3,.2,.7],[.16,.42,.5],[.24,.18,.6],[.08,.1,.85],[.42,.24,.45],[.12,.08,.35],
];
export const FIELD = {
 dark:{a:[163,22,10],b:[158,26,4],glow:[148,38,24],glowA:.32},
 light:{a:[96,14,93],b:[120,12,84],glow:[88,30,72],glowA:.3},
};

// Nhãn theo từng chương. Cùng một nút mang tên khác nhau khi vai trò của nó trong câu chuyện đổi.
export const LABELS = [
 {0:'Ngưỡng',6:'Trước',8:'Sau'},
 {0:'Lõi',1:'Khẩu độ',2:'Chiều sâu',3:'Bề mặt',4:'Khe hở',5:'Ánh sáng'},
 {0:'Tâm điểm',1:'Quỹ đạo gần',2:'Lực hút',3:'Quỹ đạo xa',4:'Khoảng trống',5:'Nhịp lệch'},
 {0:'Nguồn',1:'Dâng',2:'Đỉnh',3:'Rút',4:'Lắng',5:'Trôi',6:'01',7:'02',8:'03',9:'04'},
 {0:'Thân',1:'Rẽ nhánh',2:'Điều kiện',3:'Tầng nở',4:'Chọn hướng',5:'Kết nhánh'},
 {0:'Khoảng trống',1:'Rời ra',2:'Lệch trục',3:'Vỡ nhịp',4:'Chưa thành hình',5:'Tự do'},
 {0:'Trật tự mới',1:'Cấu trúc',2:'Liên kết',3:'Nhịp chung',4:'Biên hệ',5:'Dấu vết'},
 {0:'LIMEN'},
];
// Hai thẻ ghi chú: [nhãn nhỏ, câu, độ hiện]. Rỗng nghĩa là thẻ nằm ngoài chương đó.
export const CARDS = [
 [['01 · CONTINUUM','Tám chương là tám bố cục của cùng một hệ hình.'],null],
 [['02 · APERTURE','Một khối duy nhất tách thành năm thành phần đọc được.'],null],
 [['03 · ORBIT','Quan hệ chính nối về tâm, quan hệ phụ chạy vòng ngoài.'],['KHOẢNG CÁCH','Không chạm nhau vẫn chuyển động cùng nhau.']],
 [['04 · TIDAL','Quan hệ duỗi thành một dòng chảy có hướng.'],['NHỊP','Bốn điểm dừng chia dòng thành bốn quãng.']],
 [['05 · BLOOM','Dòng chảy rẽ nhánh: mỗi nhánh là một lựa chọn.'],['TIÊU CHÍ','Nhánh nào giữ được nhịp thì nở tiếp.']],
 [['06 · FRACTURE','Liên kết đứt nét, tâm để trống một khoảng trời.'],null],
 [['07 · CONVERGENCE','Mọi mảnh đã đi qua trở lại trong một lưới duy nhất: năm thành phần, bốn mốc, một tâm.'],null],
 [null,['08 · AFTERGLOW','Cả hệ khép lại thành một vành duy nhất.']],
];

const RAD = Math.PI / 180;
function polar(o, cx, cy, r, deg, s, a){
 const t = deg * RAD;
 o.x = cx + r * Math.cos(t); o.y = cy + r * Math.sin(t); o.s = s; o.a = a;
 return o;
}
function at(o, x, y, s, a){o.x = x; o.y = y; o.s = s; o.a = a; return o}
// Đường sóng của chương Thuỷ triều, dùng chung cho nút và cho thứ tự các mốc trên dòng chảy.
function wave(o, t, s, a, dy){
 return at(o, 9 + t * 82, 50 + Math.sin(t * 5.6 + .4) * 16 + (dy || 0), s, a);
}
const FLOW = [.03,.14,.35,.56,.77,.96,.24,.45,.66,.87];

// 01 Ngưỡng cửa: một lõi chính diện, mọi thứ khác còn là bóng mờ ngoài rìa.
// 02 Khai mở: lõi tách thành năm thành phần mở theo hình quạt.
// 03 Quỹ đạo: năm thành phần vào hai vành, nối về tâm và nối vòng quanh.
// 04 Thuỷ triều: vành duỗi thẳng thành một dòng chảy có hướng qua bốn mốc.
// 05 Nở rộ: dòng chảy rẽ nhánh từ một thân, mỗi nhánh có một mốc kiểm.
// 06 Phân rã: mọi nút văng ra biên, tâm để trống, đường nối đứt nét.
// 07 Hội tụ: tất cả trở lại thành một lưới đều, thêm bốn mốc ở vòng ngoài.
// 08 Dư âm: lưới khép thành một vành quanh lõi, đúng dấu hiệu nhận diện của trang.
export function layoutAt(c, i, o){
 const part = i - PART0, mark = i - MARK0, dot = i - DOT0, card = i - CARD0;
 if(c === 0){
  if(i === CORE) return at(o, 50, 47, 1, 1);
  if(part >= 0 && part < 5) return polar(o, 50, 47, 34, -90 + part * 72, .36, .3);
  if(mark >= 0 && mark < 4) return polar(o, 50, 47, 44, 45 + mark * 90, .5, .22);
  if(dot >= 0 && dot < 4) return polar(o, 50, 47, 24, 20 + dot * 90, 1, .3);
  return card === 0 ? at(o, 20, 15, 1, .9) : at(o, 80, 86, 1, 0);
 }
 if(c === 1){
  if(i === CORE) return at(o, 50, 50, .52, 1);
  if(part >= 0 && part < 5) return polar(o, 50, 50, 30 + (part % 2) * 5, -140 + part * 62, .58, 1);
  if(mark >= 0 && mark < 4) return polar(o, 50, 50, 42, -110 + mark * 70, .46, .55);
  if(dot >= 0 && dot < 4) return polar(o, 50, 50, 16, 45 + dot * 90, 1, .5);
  return card === 0 ? at(o, 20, 14, 1, 1) : at(o, 80, 86, 1, 0);
 }
 if(c === 2){
  if(i === CORE) return at(o, 50, 50, .6, 1);
  if(part >= 0 && part < 3) return polar(o, 50, 50, 25, -90 + part * 120, .5, 1);
  if(part === 3) return polar(o, 50, 50, 41, -25, .46, 1);
  if(part === 4) return polar(o, 50, 50, 41, 205, .46, 1);
  if(mark >= 0 && mark < 4) return polar(o, 50, 50, 45, 15 + mark * 90, .44, .6);
  if(dot >= 0 && dot < 4) return polar(o, 50, 50, 33, 60 + dot * 90, 1, .45);
  return card === 0 ? at(o, 20, 84, 1, .8) : at(o, 80, 15, 1, .7);
 }
 if(c === 3){
  if(i === CORE) return wave(o, FLOW[0], .62, 1, 0);
  if(part >= 0 && part < 5) return wave(o, FLOW[part + 1], .6, 1, 0);
  if(mark >= 0 && mark < 4) return wave(o, FLOW[mark + 6], .44, .85, -11);
  if(dot >= 0 && dot < 4) return wave(o, .18 + dot * .22, 1, .5, 10);
  return card === 0 ? at(o, 21, 17, 1, .75) : at(o, 79, 82, 1, .65);
 }
 if(c === 4){
  if(i === CORE) return at(o, 50, 85, .5, 1);
  if(part >= 0 && part < 5) return polar(o, 50, 84, 41, -158 + part * 34, .5, 1);
  if(mark >= 0 && mark < 4) return polar(o, 50, 84, 22, -142 + mark * 38, .38, .85);
  if(dot >= 0 && dot < 4) return polar(o, 50, 84, 53, -140 + dot * 40, 1, .5);
  return card === 0 ? at(o, 20, 19, 1, .95) : at(o, 80, 21, 1, .8);
 }
 if(c === 5){
  if(i === CORE) return at(o, 68, 29, .5, .45);
  if(part >= 0 && part < 5) return polar(o, 50, 50, 38 + ((part * 37) % 11) / 11 * 10, -104 + part * 74 + (part % 2 ? 14 : -10), .42, .8);
  if(mark >= 0 && mark < 4) return polar(o, 50, 50, 47, 32 + mark * 95, .36, .5);
  if(dot >= 0 && dot < 4) return polar(o, 50, 50, 30 + dot * 7, 8 + dot * 84, 1, .6);
  // Thẻ ghi chú đứng giữa khoảng trống vừa mở ra, đúng chỗ mọi nút vừa rời đi.
  return card === 0 ? at(o, 50, 49, 1, .85) : at(o, 80, 84, 1, 0);
 }
 if(c === 6){
  if(i === CORE) return at(o, 50, 52, .78, 1);
  if(part >= 0 && part < 5) return polar(o, 50, 52, 30, -90 + part * 72, .5, 1);
  if(mark >= 0 && mark < 4) return polar(o, 50, 52, 46, -54 + mark * 72, .42, .8);
  if(dot >= 0 && dot < 4) return at(o, dot === 0 || dot === 3 ? 25 : 75, dot < 2 ? 25 : 79, 1, .7);
  // Vành hội tụ chiếm trọn khung nên chương này chỉ giữ một thẻ, đặt ngoài vành.
  return card === 0 ? at(o, 20, 15, 1, .95) : at(o, 86, 40, 1, 0);
 }
 if(i === CORE) return at(o, 50, 48, .85, 1);
 if(part >= 0 && part < 5) return polar(o, 50, 48, 32, -90 + part * 72, .3, .55);
 if(mark >= 0 && mark < 4) return polar(o, 50, 48, 43, -45 + mark * 90, .32, .3);
 if(dot >= 0 && dot < 4) return polar(o, 50, 48, 32, -54 + dot * 90, 1, .4);
 return card === 0 ? at(o, 20, 14, 1, 0) : at(o, 50, 88, 1, .95);
}
