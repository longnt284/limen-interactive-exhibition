# LIMEN / Hành trình tám chương

Triển lãm 3D tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Một thế giới 3D duy nhất tiến hoá qua tám chương, không phải tám cảnh rời. Cùng một tập mảnh kim loại đi suốt hành trình: vành cổng đồng tâm mở thành xoắn khẩu độ, xoắn tách thành ba vỏ quỹ đạo, vỏ trải phẳng thành mặt sóng, sóng cuộn thành cụm cánh nở, cánh vỡ ra để hở một khoảng trời, mảnh vỡ về lại thành lưới cầu, rồi lưới khép thành một vành duy nhất đúng dấu hiệu nhận diện của trang.
- Chuyển chương là biến hình chứ không phải mờ đi hiện lại. Mỗi mảnh giữ nguyên danh tính từ chương đầu tới chương cuối; vị trí, hướng và tỉ lệ nội suy thẳng theo tiến độ cuộn.
- Camera, ánh sáng, sương và nền đổi cùng nhịp với hình khối vì cả bốn cùng đọc một bảng trạng thái tám dòng: camera lùi ra ở Quỹ đạo, đi cùng dòng chảy ở Thủy triều, dâng lên ở Nở rộ, mở rộng ở Hội tụ rồi về giữa ở Dư âm.
- Nền là một hệ nhiều lớp thay vì một ảnh tĩnh: gradient theo chương, khí quyển nhiễu chậm, lưới sàn phối cảnh, đường mạng, vệt hướng, sóng nở, nhiễu phân rã và môi trường tối giản ở chương cuối. Các lớp chồng lấn dài nên không có điểm bật tắt.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Tốc độ cuộn tác động ngược lại hình ảnh: cuộn nhanh thì góc nhìn dồn lại, vệt nền kéo dài và khối xoay theo đà. Giá trị được kẹp chặt nên cảnh không vỡ khi cuộn rất nhanh.
- Chữ tiêu đề hiện lên theo từng dòng, nghiêng nhẹ trong không gian ba chiều rồi trở về phẳng.
- Điều hướng bên phải đưa trực tiếp tới một trong tám chương, kèm thanh tiến độ chạy theo vị trí cuộn.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Tạm dừng vòng xoay tự động, đổi nhịp độ, xoay góc nhìn, bật/tắt âm thanh (âm thanh vào và ra bằng đường dốc, không có tiếng bụp).
- Giao diện sáng/tối. Cảnh 3D đổi màu theo giao diện: nền, kim loại, viền sáng và bụi đều có bảng màu riêng cho từng chế độ. Chữ nền khổng lồ và màu thanh địa chỉ trôi theo tông của chương đang mở.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong hộp Về triển lãm. Chế độ này bỏ parallax, hiệu ứng bung mảnh và reveal, rút quãng di chuyển camera còn 30%; khối đổi dứt điểm theo từng chương và cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Một canvas xuyên suốt, ba `InstancedMesh` luôn hiển thị: 110 phiến bo góc vát cạnh, 48 thanh lục giác và 22 hạt phát sáng. Ba vai trò này tồn tại ở cả tám chương nên mỗi instance giữ nguyên danh tính suốt hành trình, chuyển chương chỉ là nội suy vị trí, quaternion và tỉ lệ. Không cần chồng mờ hai khối, không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render. Ba draw call cố định, khoảng 16 nghìn tam giác, tổng số ma trận ghi mỗi khung hình là 180 và không đổi.

Tám bố cục của cả ba vai trò tính trước một lần khi mount. Bảng `STATES` 8×21 số giữ camera, mục tiêu nhìn, FOV, vị trí và cường độ đèn, biên sương và bốn tham số màu nền; mỗi khung hình nội suy một lần rồi phát cho camera, đèn, `THREE.Fog` và nền. Màu nền dựng từ bảng màu thương hiệu bằng độ lệch HSL chứ không phải danh sách mã màu rời, nên cả hai giao diện luôn đồng bộ.

Nền là một quad toàn màn hình. Sáu lớp môi trường nằm chung một fragment shader và bật tắt bằng trọng số uniform tính từ tiến độ cuộn, nên nhánh `if` không phân kỳ giữa các pixel và không tốn thêm draw call. Bụi khí quyển là một `Points` đổi hành vi theo chương ngay trong vertex shader, CPU không đụng tới từng hạt. Viền sáng trên kim loại được thêm vào `MeshStandardMaterial` qua `onBeforeCompile`; không dùng postprocessing và không tạo render target.

Giới hạn DPR 1.25 và dùng hệ đèn trực tiếp để giảm shader/render-target. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn. Dưới 700px giảm số hạt bụi còn một nửa, bớt một tầng nhiễu khí quyển, hạ trọng số lưới và đường mạng, đồng thời lùi camera và mở FOV để khung hình vừa màn hình dọc.

Three.js được khóa ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Canvas tự chọn context phù hợp; nếu WebGL thực sự không khả dụng hoặc context bị mất, giao diện dùng một hình thái CSS thay thế thay vì để trống màn hình, và tự khôi phục khi context quay lại.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên khối 3D khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển, bàn phím và ScrollTrigger.
- `src/Scene.jsx`: hình học, vật liệu, bảng trạng thái cảnh, camera, ánh sáng, sương, nền và bụi.
- `src/style.css`: responsive, màu và lớp hiển thị (world 1, nội dung 2, header 3, điều khiển 4, skip link 6, dialog top layer).
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
