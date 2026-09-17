# Kiểm tra bản điện ảnh đa chất liệu

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 121.95 kB gzip, chunk Scene 232.81 kB gzip, CSS 3.87 kB gzip. So với bản trước: main JS tăng 3.00 kB gzip do `Stage.jsx` và `artwork.jsx`, CSS tăng 0.77 kB gzip, chunk Scene gần như không đổi. Không thêm dependency nào.
- Desktop 1440 x 900, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas, 8 section, 8 cảnh sân khấu và 24 SVG, console không có lỗi.
- Duyệt cả 8 chuyển cảnh theo hai chiều bằng bàn phím: xuôi 02 đến 08, ngược 07 về 01, mỗi bước báo đúng số chương.
- Cửa sổ hiển thị của sân khấu: ở mỗi chương chỉ cảnh đang mở có opacity khác 0, hai cảnh kề mang lớp `is-live`, các cảnh còn lại `visibility: hidden`.
- Dừng giữa hai chương: cuộn tới điểm giữa section 3 và 4, cả ba mặt phẳng lẫn khối 3D giữ nguyên trạng thái nội suy, không giật về một trong hai đầu.
- Cuộn rất nhanh: nhảy thẳng xuống đáy rồi về đầu, sau đó 14 lần lăn 3000px liên tiếp. Vẫn đúng chương 08, `gl.getError()` trả 0, WebGL context không mất, vẫn đúng 1 canvas.
- Đổi kích thước cửa sổ khi đang chạy: 1440x900 xuống 900x640, lên 1680x1000, xuống 390x844 rồi về 1440x900. Không lỗi, tràn ngang 0px.
- Đổi giao diện khi đang chạy: nền 3D, màu kim loại, viền sáng, bụi, chữ nền khổng lồ, thẻ `theme-color` và biến `--art` của tác phẩm SVG đều đổi theo (tối `hsl(78 62% 77%)`, sáng `hsl(88 44% 31%)`).
- Mobile 390 x 844: cả 8 chương báo đúng số thứ tự, không chương nào tràn ngang. Tác phẩm về giữa nửa trên, mặt phẳng gần tắt hẳn, màn che đổ từ đáy lên, vân hạt không chạy animation.
- Giảm chuyển động bật từ hộp Về triển lãm rồi chọn lần lượt cả 8 chương: mỗi chương đến đúng vị trí top 0, mọi `.chapter-copy` đạt opacity 1, đúng một cảnh sân khấu mang `is-now` và hiện ở mức `--pow` của chương đó. `data-motion` trên `html` chuyển sang `reduced`.
- Rò rỉ tài nguyên: 4 lượt cuộn xuôi ngược trọn trang. `usedJSHeapSize` 14.2 MB trước, 11.4 MB sau (thu hồi rác), `gl.getError()` trả 0, `isContextLost()` false.
- Hiệu năng so sánh: dựng lại bản HEAD cũ, phục vụ song song và đo cùng điều kiện, cùng kịch bản cuộn 200 khung hình, 3 lần mỗi bản, lấy trung vị của 3 lần, tắt khoá vsync để số đo phản ánh khối lượng công việc thật. Bản cũ trung vị 112.2 ms và p95 131.5 ms; bản mới trung vị 131.8 ms và p95 152.9 ms. Bản mới tốn thêm khoảng 20 ms mỗi khung hình trong điều kiện này.
- Bóc tách phần tốn thêm bằng cách tắt lần lượt từng lớp trên chính bản mới (trung vị, ms, gốc 132.9): tắt toàn bộ sân khấu và lớp phim còn 110.8; tắt vân hạt còn 125.3; tắt SVG còn 125.4; tắt mặt phẳng giữa còn 126.7; đóng băng transform còn 129.2; tắt mặt phẳng gần còn 130.5; tắt mặt phẳng xa còn 131.0; tắt màn che còn 131.6. Chi phí trải đều chứ không dồn vào một lớp nào.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Các con số trên là trần của trình dựng hình phần mềm trong container, nơi mọi lượt tô và mọi lượt ghép lớp đều chạy bằng CPU. Đây chính là phần mà GPU thật làm rẻ nhất, nên 20 ms chênh lệch ở đây không suy ra được 20 ms trên máy người dùng. Phép đo chỉ chứng minh lớp mới có chi phí thật và cho biết chi phí đó nằm ở đâu, không đo được biên hiệu năng thực tế.
- Điểm Lighthouse.
- Trình duyệt Safari và Firefox. `mask-image` của mặt phẳng giữa có kèm tiền tố `-webkit-`; `contain: layout paint` và `visibility` là tính năng cũ nên rủi ro thấp, nhưng chưa chạy thử trên hai trình duyệt này.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ; chỉ giữ ràng buộc three r162, tránh render target và giữ shader trong phạm vi GLSL ES 1.0.

## Việc đã xử lý trong lần này

- Bản nháp đầu đóng khung tác phẩm thành một tấm thẻ chữ nhật xoay nhẹ, cạnh cứng và trường màu quá dày làm cả trang ngả một sắc xanh phẳng. Nay trường màu mỏng đi và mặt phẳng giữa có mặt nạ mềm nên tác phẩm tan vào nền.
- Chú thích nhỏ gắn theo tấm tác phẩm đụng vào `.chapter-note` ở vài chương và lặp lại nội dung đã có ở thanh dưới, nên đã bỏ hẳn.
- Mảnh cắt của chương sau ở chương Quỹ đạo chạm vào dòng eyebrow, ở chương Phân rã nằm sau dòng tiêu đề. Đã dời vị trí của cả hai.
- Chữ của chương đi qua dưới header lấp ló cạnh logo ở các vị trí cuộn giữa chương. Gradient của header nay che kín 46% chiều cao trước khi trong dần.
- Nền cũ gần như cùng một độ sáng ở cả tám chương. Cột biên sương và cột độ sáng nền của bảng `STATES` được viết lại theo đường cong cảm xúc, và vignette trong shader được làm sâu hơn.

## Thay đổi có chủ ý, không phải lỗi

- Khối 3D nhỏ lại, lùi vào chiều sâu và dịch về phía có chữ. Đây là chuyển vai: khối 3D thành kiến trúc nền, tác phẩm SVG thành chủ thể thị giác. Toàn bộ cơ chế biến hình, bảng trạng thái và điều khiển giữ nguyên.
- Chữ tiêu đề bỏ hiệu ứng nghiêng trong không gian ba chiều và mờ dần, thay bằng mặt nạ cắt đúng chiều cao dòng. Đệm `.18em` giữ dấu tiếng Việt khỏi bị cắt, lề âm `.36em` bù lại nên nhịp dòng không đổi.
- Số hạt bụi khí quyển giảm từ 520 xuống 400 trên desktop và từ 260 xuống 190 trên mobile, vì bầu khí quyển nay còn được lớp DOM gánh một phần.
