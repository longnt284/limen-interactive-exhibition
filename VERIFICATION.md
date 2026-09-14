# Kiểm tra bản tám chương

- Production build: PASS, Vite 7.3.6; main JS ~118 kB gzip, scene lazy load ~264 kB gzip.
- Trình duyệt desktop: cảnh 3D render, thao tác wheel chuyển Ngưỡng cửa sang Khai mở; dùng điều hướng tới Thủy triều và các chương tiếp theo.
- Có đúng 8 section và 1 canvas.
- Mobile 390 x 844: không tràn ngang (content 375 px), vật thể phía trên và nội dung phía dưới, thanh điều khiển nằm trong viewport.
- Giảm chuyển động: bật checkbox trong dialog, chọn lần lượt cả 8 chương. Mỗi chương đến đúng vị trí top 0 và copy opacity 1.
- Màn cuối: Dư âm hiển thị, có nút Trải nghiệm lại, thanh tiến trình 08 / 08.
- Console production: kiểm tra cuối trong trình duyệt, không có lỗi ghi nhận.
- Không đo FPS trên thiết bị vật lý hoặc điểm Lighthouse. Lần cài Lighthouse trước bị lỗi thiếu bộ nhớ Windows; không suy diễn điểm hiệu năng.

Bản trước lưu ở archive/single-gallery. 12 repo tiếp tục giữ trong references/repos; Hyperframes còn một số media LFS dưới dạng pointer như đã ghi nhận ở bản trước.
