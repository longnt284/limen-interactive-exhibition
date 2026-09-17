# Kiểm tra bản sơ đồ kể chuyện

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 124.88 kB gzip, chunk Scene 232.74 kB gzip, CSS 4.26 kB gzip. So với bản trước: main tăng 5.9 kB gzip (hệ sơ đồ), CSS tăng 1.2 kB gzip, chunk Scene không đổi.
- Desktop 1440 x 900, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas, 16 nút và 31 đường nối, console không có lỗi.
- Duyệt cả 8 chương theo hai chiều: xuôi 01 đến 08, ngược 08 về 01, mỗi bước báo đúng số chương. Vị trí nút ở cùng một chương lệch tối đa 5.5 px giữa hai chiều, đúng bằng biên độ trôi nhẹ theo thời gian; không có trạng thái kẹt giữa chừng.
- Bố cục thật sự tái tổ chức chứ không đứng yên: quãng dịch trung bình của một nút giữa hai chương kề nhau thấp nhất là 46 px.
- Số đường nối đang hiện theo từng chương: 12, 24, 31, 31, 31, 25, 31, 22. Chương mở đầu và chương kết thưa nhất, đúng ý đồ.
- Dừng giữa hai chương: cảnh giữ nguyên trạng thái nội suy, chữ chú giải mờ hẳn ở điểm giữa nên nhãn đổi nội dung mà không thấy giật chữ.
- Cuộn rất nhanh: 14 lần lăn 3000 px xuôi rồi 14 lần 2000 px ngược. Trạng thái vẫn đúng chương, khung sơ đồ vẫn cập nhật, WebGL context không mất.
- Đổi kích thước khi đang chạy: 1440x900 xuống 900x640 rồi lên 1680x1000. Không lỗi, không tràn ngang.
- Đổi giao diện khi đang chạy: biến nền CSS, màu sơ đồ, quầng vùng nền và lớp 3D đều đổi theo.
- Mobile 390 x 844: cả 8 chương báo đúng số thứ tự, sơ đồ nằm trên phần chữ, không chương nào tràn ngang.
- Giảm chuyển động: chọn lần lượt cả 8 chương. Mỗi chương đến đúng vị trí top 0, mọi `.chapter-copy` đạt opacity 1, sơ đồ đứng ở đúng bố cục từng chương và animation trôi của lớp nền tắt hẳn.
- Rò rỉ tài nguyên: 4 lượt cuộn xuôi ngược trọn trang. `usedJSHeapSize` giữ nguyên 13.6 MB trước và sau, context không mất.
- Hiệu năng: cùng kịch bản cuộn 200 khung hình, 3 lần mỗi bản, lấy trung vị của 3 lần. Bản cũ (1746c39, chỉ có 3D) trung vị 117.3 ms và p95 130.2 ms; bản mới trung vị 56.7 ms và p95 70.4 ms.
- Phân tích chi phí từng lớp trên cùng máy: đủ lớp 131.9 ms, tắt hoạ tiết nền 128.2 ms, tắt toàn bộ nền CSS 123.4 ms, tắt sơ đồ 130.8 ms, tắt lớp 3D 25.0 ms. Lớp 3D chiếm gần như toàn bộ chi phí, nên nó được hạ tỉ lệ điểm ảnh xuống 0.55 ở chế độ khí quyển; đó là nguồn của mức cải thiện ở trên.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Mọi con số ở trên đo bằng trình dựng hình phần mềm trong container: hữu ích để so sánh giữa hai bản và giữa các lớp, không phải hiệu năng thực tế của trang.
- Điểm Lighthouse.
- Trình duyệt Safari và Firefox. Lớp nền dùng `mask-image` có tiền tố `-webkit-`; `aspect-ratio`, `clamp` và `ResizeObserver` đều nằm trong phạm vi hỗ trợ của các bản Safari và Firefox hiện hành nhưng chưa chạy thử trên máy thật.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ.
- Đọc bằng trình đọc màn hình: sơ đồ đặt `aria-hidden` như lớp 3D trước đây, toàn bộ nội dung vẫn nằm trong phần chữ của từng chương.

## Thay đổi có chủ ý, không phải lỗi

- Lớp 3D không còn là nhân vật chính: nó nhỏ lại còn 46%, lùi thêm 2.6 đơn vị, chỉ còn 30% độ đục ở giao diện tối và 26% ở giao diện sáng, dựng hình ở tỉ lệ điểm ảnh 0.55. Khối vẫn biến hình theo đủ tám chương như cũ.
- Nếu WebGL hỏng, lớp 3D biến mất lặng lẽ thay vì hiện thông báo. Sơ đồ và nội dung không phụ thuộc vào nó nên không còn gì để báo.
- Chương Hội tụ chỉ còn một thẻ chú giải. Vành hội tụ chiếm trọn khung nên thẻ thứ hai luôn đè lên nhãn của thành phần phía dưới; câu của nó được gộp vào thẻ thứ nhất.
- Chữ chú giải (nhãn nút và thẻ) mờ đi ở đoạn giữa hai chương. Đây là lớp chú giải, không phải cấu trúc sơ đồ; các nút và đường nối vẫn biến hình liên tục.

Bản trước lưu ở archive/single-gallery. 12 repo tiếp tục giữ trong references/repos; Hyperframes còn một số media LFS dưới dạng pointer như đã ghi nhận ở bản trước.
