# Kiểm tra bản LIMEN 2.0

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.
Mọi phép so sánh dưới đây lấy mốc là commit `1746c39`, tức bản đang chạy trước thay đổi này.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 121.44 kB gzip, chunk Scene 234.58 kB gzip, CSS 3.64 kB gzip. So với bản trước: main tăng 2.49 kB gzip do bảng Tùy chỉnh, hệ chữ trong không gian và `src/sound.js`; chunk Scene tăng 1.84 kB gzip do bảng `KEYS` 16 dòng, bảng `ENVS` và trường con trỏ.
- Desktop 1440 x 900, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas và 8 section, console không có lỗi.
- Duyệt cả 8 chuyển cảnh theo hai chiều bằng bàn phím: xuôi 01 đến 08, ngược 08 về 01, mỗi bước báo đúng số chương. Không có bước nhảy hình.
- Dừng giữa hai chương: cuộn tới điểm giữa section 3 và 4, cảnh giữ nguyên trạng thái nội suy, không giật về một trong hai đầu.
- Cuộn rất nhanh: nhảy thẳng xuống đáy rồi về đầu, sau đó 14 lần lăn 3000px liên tiếp. Trạng thái cảnh vẫn đúng chương, WebGL context không mất, `gl.getError()` trả 0.
- Đổi kích thước cửa sổ khi đang chạy: 1440x900 xuống 900x640 rồi lên 1680x1000. Không lỗi, không tràn ngang.
- Bảng Tùy chỉnh: mở bằng nút, tiêu điểm tự vào điều khiển đầu tiên, Esc đóng và trả tiêu điểm về đúng nút đã mở, bấm ra ngoài cũng đóng. Từng mục pause, nhịp độ, xoay góc nhìn, giao diện, con trỏ và giảm chuyển động đều đổi trạng thái đúng.
- Đổi giao diện khi đang chạy: nền 3D, màu kim loại, viền sáng, bụi, chữ nền khổng lồ và thẻ `theme-color` đều đổi theo.
- Âm thanh: bật, đi qua một chương khác, rồi tắt. `aria-pressed` đúng ở cả ba bước, không lỗi console, không tiếng bụp khi vào và ra.
- Mobile 390 x 844: cả 8 chương báo đúng số thứ tự, không chương nào tràn ngang, khối nằm trên phần chữ. Mobile ngang 844 x 390 cũng không tràn.
- Giảm chuyển động: chọn lần lượt cả 8 chương. Mỗi chương đến đúng vị trí top 0 và mọi `.chapter-copy` đạt opacity 1.
- Rò rỉ tài nguyên: 4 lượt cuộn xuôi ngược trọn trang. `usedJSHeapSize` giữ nguyên 14 MB trước và sau, `gl.getError()` trả 0, context không mất.
- Hiệu năng: dựng lại bản `1746c39`, phục vụ song song và đo cùng điều kiện. Kịch bản cuộn 200 khung hình trọn trang, 3 lần mỗi bản, lấy trung vị. Bản cũ trung vị 118.7 ms và p95 132.6 ms; bản mới trung vị 107.3 ms và p95 121.8 ms. Đo tĩnh tại 16 điểm (đầu và giữa mỗi chương) cho kết quả tương tự: bản mới ngang hoặc nhỉnh hơn ở 15 điểm.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Con số trên là trần của trình dựng hình phần mềm trong container, không phải hiệu năng thực tế của trang. Phép đo chỉ chứng minh bản mới không tốn thêm so với bản cũ trong cùng điều kiện.
- Điểm Lighthouse.
- Trình duyệt Safari và Firefox. Cảnh âm dùng `StereoPannerNode`, `ConvolverNode` và `BiquadFilterNode`; mã có nhánh dự phòng khi thiếu `createStereoPanner` nhưng chưa chạy thử trên WebKit thật.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ; chỉ giữ ràng buộc three r162, tránh render target và giữ shader trong phạm vi GLSL ES 1.0.

## Lỗi đã phát hiện và sửa trong lần này

- Nhánh `if` trong fragment shader nền không hề được bỏ qua. Bản dựng đầu tiên viết mỗi chương một khối `if` riêng, tin rằng trọng số là uniform thì nhánh sẽ rẻ. Đo thật cho thấy giá khung hình tăng đều khoảng 40% ở cả tám chương, kể cả chương chỉ có một lớp đang bật: trình biên dịch gộp phẳng các nhánh và chạy hết. Nền được viết lại thành ba nguyên thủy có tham số, không còn nhánh nào theo chương.
- `atan` nhảy bậc ở trục ±pi. Tần số góc là số nội suy nên hiếm khi là số nguyên, và chỗ nhảy bậc hiện ra thành một đường thẳng cắt ngang nền, thấy rõ nhất ở chương Khai mở. Nay tắt đường đi trong khoảng 6 độ quanh trục.
- Pha biến hình bắt đầu quá sớm. Bản trước nội suy hình khối và bố cục thẳng theo tiến độ cuộn, nên ở giữa chương khối đã đi được nửa đường sang chương sau và bố cục lệch khỏi khung hình mà camera vừa dựng. Nay hình khối giữ nguyên danh tính của chương suốt 40% đầu rồi mới biến hình.

## Thay đổi có chủ ý, không phải lỗi

- Sương của Dư âm lấy từ cùng một trường khí quyển với sương của Ngưỡng cửa thay vì một lớp nhiễu riêng chậm hơn. Vừa rẻ hơn một nửa số phép sin trên mỗi điểm ảnh, vừa đúng ý đồ gọi lại chương đầu: đó là cùng một khí quyển chứ không phải một hiệu ứng giống nhau.
- Tầng nhiễu khí quyển thứ hai bị bỏ ở mọi máy, không chỉ máy yếu. Tám môi trường mới đã cung cấp đủ kết cấu, giữ lại tầng này chỉ tốn thêm bốn phép sin trên mỗi điểm ảnh.
- Chương Phân rã ở giữa chương tốn thêm khoảng 13% thời gian khung hình so với bản cũ, do camera đi vào giữa vành vỡ nên khối chiếm gần hết khung hình. Đây là khung hình đắt nhất của cả trang và cũng là điểm nhấn thị giác chính, nên giữ nguyên.
- Nút đổi giao diện sáng/tối rời khỏi header và vào bảng Tùy chỉnh, cùng pause, nhịp độ, xoay góc nhìn, con trỏ và giảm chuyển động. Thanh dưới cùng chỉ còn chương, tiến độ, âm thanh và nút mở bảng. Không điều khiển nào bị bỏ.
- Chữ khổng lồ vẫn là chữ DOM. Hiệu ứng chiều sâu làm bằng tốc độ trôi khác nhau, mask và tách đôi bằng `clip-path`, không dùng `filter: blur` vì giá của nó trên khối chữ cỡ 20vw không xứng với hiệu quả, và không chuyển chữ thành mesh 3D vì sẽ mất khả năng đọc và độ nét.
