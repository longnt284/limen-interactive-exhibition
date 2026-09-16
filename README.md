# LIMEN / Hành trình tám chương

Triển lãm 3D tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Mỗi chương có một khối hình riêng: phiến, lăng trụ lục giác, thanh bo tròn, trụ tròn, đĩa thấu kính, mảnh tứ diện, khối hai mươi mặt và vòng xuyến. Khi cuộn, khối đang hiển thị tan ra thành bụi kim loại rồi dựng lại thành khối của chương kế tiếp.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Tốc độ cuộn tác động ngược lại hình ảnh: cuộn nhanh thì góc nhìn dồn lại, nền sáng lên và khối xoay theo đà.
- Chữ tiêu đề hiện lên theo từng dòng, nghiêng nhẹ trong không gian ba chiều rồi trở về phẳng.
- Điều hướng bên phải đưa trực tiếp tới một trong tám chương, kèm thanh tiến độ chạy theo vị trí cuộn.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Tạm dừng vòng xoay tự động, đổi nhịp độ, xoay góc nhìn, bật/tắt âm thanh (âm thanh vào và ra bằng đường dốc, không có tiếng bụp).
- Giao diện sáng/tối. Cảnh 3D đổi màu theo giao diện: nền, kim loại, viền sáng và bụi đều có bảng màu riêng cho từng chế độ.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong hộp Về triển lãm. Chế độ này bỏ parallax, hiệu ứng tan rã và reveal; khối đổi dứt điểm theo từng chương và cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Một canvas xuyên suốt. Tám `InstancedMesh`, mỗi khối 180 phần tử, dùng chung một material. Tại mọi thời điểm chỉ tối đa hai khối được vẽ; các khối còn lại đặt `visible = false` nên không tốn draw call. Trạng thái hình học tính trước một lần; vị trí, quaternion và tỉ lệ nội suy theo tiến độ cuộn. Không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render.

Nền là một quad toàn màn hình với shader gradient, quầng sáng và nhiễu phim; bụi là một `Points` được đẩy hoàn toàn bằng uniform thời gian nên CPU không phải cập nhật từng hạt mỗi khung hình. Viền sáng trên kim loại được thêm vào `MeshStandardMaterial` qua `onBeforeCompile`, không dùng postprocessing và không tạo render target.

Giới hạn DPR 1.25 và dùng hệ đèn trực tiếp để giảm shader/render-target. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn.

Three.js được khóa ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Canvas tự chọn context phù hợp; nếu WebGL thực sự không khả dụng hoặc context bị mất, giao diện dùng một hình thái CSS thay thế thay vì để trống màn hình, và tự khôi phục khi context quay lại.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên khối 3D khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển, bàn phím và ScrollTrigger.
- `src/Scene.jsx`: hình học, vật liệu, nền, bụi và biến hình 3D.
- `src/style.css`: responsive, màu và lớp hiển thị (world 1, nội dung 2, header 3, điều khiển 4, skip link 6, dialog top layer).
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
