# Kiểm tra bản tám chương

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 118.74 kB gzip, chunk Scene 229.54 kB gzip, CSS 3.10 kB gzip.
- Desktop 1440 x 900, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas và 8 section, console không có lỗi.
- Đổi giao diện khi đang chạy: nền 3D, màu kim loại, viền sáng và bụi đổi theo. Không còn cảnh dải header/footer sáng nằm trên nền canvas tối như bản trước.
- Bàn phím: mũi tên xuống đi lần lượt 02 → 08, Home về 01, End tới 08.
- Thanh tiến độ điều hướng đạt `scaleY(1)` ở cuối hành trình.
- Giảm chuyển động: chọn lần lượt cả 8 chương. Mỗi chương đến đúng vị trí top 0, `.chapter-copy` opacity 1 và mọi dòng tiêu đề opacity 1.
- Mobile 390 x 844: không tràn ngang, cả 8 chương báo đúng số thứ tự tại đầu mỗi section, thanh điều khiển nằm trong viewport.
- Viewport thấp 1280 x 560: cả 8 chương báo đúng số thứ tự. Đây là trường hợp bản trước bị lệch vì giả định mọi section cao bằng nhau.
- Hiệu năng so sánh: dựng lại bản HEAD cũ và đo cùng điều kiện, cùng một kịch bản cuộn 200 khung hình. Trung vị 63.6 ms (bản cũ) so với 63.9 ms (bản mới), p95 87.7 ms so với 91.0 ms. Các tính năng mới không làm chậm thêm.
- Favicon nhúng inline; request `/favicon.ico` 404 ở bản trước đã hết.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Con số 63.9 ms ở trên là trần của trình dựng hình phần mềm trong container, không phải hiệu năng thực tế của trang.
- Điểm Lighthouse.
- Trình duyệt Safari và Firefox.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ; chỉ giữ ràng buộc three r162 và tránh render target.

## Lỗi đã sửa trong lần này

- Giao diện sáng hỏng: nền canvas cố định ở `#263a31` trong khi header, thanh điều khiển và chữ dùng bảng màu sáng, nên chữ tối nằm trên nền xanh đậm. Nay cảnh 3D có bảng màu riêng cho từng giao diện.
- Tiến độ chương giả định mọi section cao bằng nhau, sai trên mobile (118dvh so với 110dvh ở chương cuối) và khi viewport thấp làm `min-height` chặn lại. Nay tính từ offset thật của từng section.
- `/favicon.ico` 404 mỗi lần tải trang.
- `animate.css` khai báo trong dependencies nhưng không nơi nào import; đã gỡ khỏi `package.json`, vẫn giữ trong `references/repos` để tham khảo.
- README nói có điều khiển bàn phím nhưng không có handler nào; nay đã thêm thật.
- Context WebGL mất là mất vĩnh viễn, không xử lý `webglcontextrestored`; nay tự khôi phục.
- Âm thanh bật/tắt đột ngột ở biên độ đầy; nay vào và ra bằng đường dốc.
- ScrollTrigger không refresh sau khi font tải xong và không đặt `ignoreMobileResize`, dễ lệch mốc khi thanh địa chỉ mobile co lại.

Bản trước lưu ở archive/single-gallery. 12 repo tiếp tục giữ trong references/repos; Hyperframes còn một số media LFS dưới dạng pointer như đã ghi nhận ở bản trước.
