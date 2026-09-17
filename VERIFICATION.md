# Kiểm tra bản thế giới 3D liên tục

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 118.95 kB gzip, chunk Scene 232.74 kB gzip, CSS 3.10 kB gzip. Chunk Scene tăng 3.2 kB gzip so với bản trước, do `Shape` và `ExtrudeGeometry` dùng để dựng phiến bo góc vát cạnh.
- Desktop 1440 x 900, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas và 8 section, console không có lỗi.
- Duyệt cả 8 chuyển cảnh theo hai chiều bằng bàn phím: xuôi 01 đến 08, ngược 08 về 01, mỗi bước báo đúng số chương. Không có bước nhảy hình.
- Dừng giữa hai chương: cuộn tới điểm giữa section 3 và 4, cảnh giữ nguyên trạng thái nội suy, không giật về một trong hai đầu.
- Cuộn rất nhanh: nhảy thẳng xuống đáy rồi về đầu, sau đó 14 lần lăn 3000px liên tiếp. Trạng thái cảnh vẫn đúng chương, WebGL context không mất.
- Đổi kích thước cửa sổ khi đang chạy: 1440x900 xuống 900x640 rồi lên 1680x1000. Không lỗi, không tràn ngang.
- Đổi giao diện khi đang chạy: nền 3D, màu kim loại, viền sáng, bụi, chữ nền khổng lồ và thẻ `theme-color` đều đổi theo.
- Mobile 390 x 844: cả 8 chương báo đúng số thứ tự, không chương nào tràn ngang, khối nằm trên phần chữ.
- Giảm chuyển động: chọn lần lượt cả 8 chương. Mỗi chương đến đúng vị trí top 0 và mọi `.chapter-copy` đạt opacity 1.
- Rò rỉ tài nguyên: 4 lượt cuộn xuôi ngược trọn trang. `usedJSHeapSize` giữ nguyên 12 MB trước và sau, `gl.getError()` trả 0, context không mất.
- Hiệu năng so sánh: dựng lại bản HEAD cũ, phục vụ song song và đo cùng điều kiện, cùng kịch bản cuộn 200 khung hình, 3 lần mỗi bản, lấy trung vị của 3 lần. Bản cũ trung vị 85.7 ms và p95 95.9 ms; bản mới trung vị 85.6 ms và p95 96.1 ms. Chênh lệch nằm trong khoảng dao động giữa các lần đo của cùng một bản.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Con số 85.6 ms ở trên là trần của trình dựng hình phần mềm trong container, không phải hiệu năng thực tế của trang. Trình dựng hình phần mềm bão hoà ở mức này với cả hai bản nên phép đo chỉ chứng minh bản mới không tốn thêm, không đo được biên hiệu năng thật của các lớp nền mới.
- Điểm Lighthouse.
- Trình duyệt Safari và Firefox.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ; chỉ giữ ràng buộc three r162, tránh render target và giữ shader trong phạm vi GLSL ES 1.0.

## Lỗi đã sửa trong lần này

- `Object3D.lookAt` trên một `Object3D` rời không hoạt động: hàm này đọc vị trí từ `matrixWorld`, mà `matrixWorld` của đối tượng chưa có cha luôn là ma trận đơn vị, nên vị trí đọc ra luôn là gốc toạ độ và mọi phần tử nhận cùng một hướng cố định. Bố cục chương 7 của bản cũ vì vậy không hề quay mặt về tâm như ý định. Nay tự dựng quaternion từ `Matrix4.lookAt` với vị trí thật.
- Lớp lưới sàn phối cảnh sinh moiré thành các dải sáng lớn cắt ngang màn hình khi vạch dồn lại gần đường chân trời. Nay tắt hẳn lớp này trước ngưỡng dồn vạch và giảm biên độ.
- Đường mạng của chương Quỹ đạo quá dày và chạy hết bề ngang nên đọc ra như tia sáng thay vì đường dữ liệu. Nay mỏng hơn, mờ hơn và tắt dần ở hai mép.

## Thay đổi có chủ ý, không phải lỗi

- Chuyển cảnh không còn chồng mờ hai khối. Ba vai trò hình học hiển thị liên tục ở cả tám chương nên mỗi phần tử biến hình thẳng từ bố cục này sang bố cục kế tiếp.
- Hiệu ứng bung mảnh giữa hai chương giảm từ hệ số 0.82 xuống 0.42 vì nó không còn phải che chỗ chuyển khối, chỉ còn nhiệm vụ cho thấy các mảnh tự sắp xếp lại.

Bản trước lưu ở archive/single-gallery. 12 repo tiếp tục giữ trong references/repos; Hyperframes còn một số media LFS dưới dạng pointer như đã ghi nhận ở bản trước.
