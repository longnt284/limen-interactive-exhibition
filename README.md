# LIMEN / Hành trình tám chương

Triển lãm 3D tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

## Chạy

```powershell
cd C:\Users\Admins\Claudd\.local\bin\limen
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Phiên xem trước hiện tại: http://127.0.0.1:5184/.

## Trải nghiệm

- Cuộn tự nhiên theo hai chiều; vật thể biến hình liên tục, bố cục chữ chuyển trái/phải và xuất hiện theo nhịp cuộn.
- Điều hướng bên phải đưa trực tiếp tới một trong tám chương.
- Tạm dừng vòng xoay tự động, đổi nhịp độ, xoay góc nhìn, bật/tắt âm thanh.
- Giao diện sáng/tối, bố cục mobile, điều khiển bàn phím.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong hộp Về triển lãm. Chế độ này bỏ parallax/reveal, đổi hình thái theo chương và dùng cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Một canvas xuyên suốt, một InstancedMesh với 180 phần tử và geometry/material dùng chung. Các trạng thái hình học tính trước, vị trí/quaternion/tỉ lệ nội suy theo tiến độ ScrollTrigger. Không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render. Giới hạn DPR 1.4 và environment 64 px. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển và ScrollTrigger.
- `src/Scene.jsx`: hình học và biến hình 3D.
- `src/style.css`: responsive, màu và lớp hiển thị (world 1, nội dung 2, header 3, điều khiển 4, skip link 6, dialog top layer).
- `archive/single-gallery`: bản nguồn ba tác phẩm trước khi mở rộng.
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn. Website chạy local, chưa xuất bản công khai.
