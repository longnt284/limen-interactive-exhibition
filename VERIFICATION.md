# Kiểm tra bản LIMEN 2.1

Lần kiểm tra gần nhất chạy trên Chromium headless (Playwright 1.56.1) với WebGL phần mềm SwiftShader.
Mốc so sánh là commit `d83b8b0`, tức bản đang chạy trước thay đổi này. Phép đo hiệu năng dựng lại bản
cũ trong một worktree riêng, phục vụ song song trên cổng khác và đo xen kẽ trong cùng một phiên trình duyệt.

## Đã kiểm tra

- Production build: PASS, Vite 7.3.6. Main JS 123.33 kB gzip, chunk Scene 235.37 kB gzip, CSS 4.20 kB gzip.
  So với bản trước: main +1.89 kB gzip do link sâu, màn mở đầu, bảng bề mặt và ScrollToPlugin; Scene +0.79 kB
  gzip do hộp sáng giả, lớp quầng và hai uniform của nền; CSS +0.56 kB gzip do lớp scrim và hệ chữ.
- Tải về thật, đo bằng `content-length` ở 1440x900: 8 yêu cầu, trong đó 4 file woff2 tổng 66.7 kB.
  Bản trước 10 yêu cầu và 6 file woff2 tổng 55.6 kB. Thêm hai tập con Archivo nhưng bỏ được nét 500 và 600
  của Manrope (không còn nơi nào dùng) và bỏ được tập latin-ext của Archivo: ròng +11.2 kB, ít hơn hai yêu cầu.
- Desktop 1440x900 và 1280x800, cả giao diện tối và sáng: cả 8 chương render, đúng 1 canvas và 8 section,
  `gl.getError()` trả 0, không lỗi console, không `pageerror`.
- Tương phản chữ: 12 vùng chữ x 8 chương x 2 giao diện, đo trên màu nền thật của từng chương sau khi
  bảng bề mặt đã đổi. **0 vùng trượt chuẩn WCAG AA.** Bản trước trượt 3 vùng ở giao diện sáng
  (`.chapter-caption`, `.chapter-count`, `.nav-index`, cùng ở tỉ lệ 4.35 trên ngưỡng 4.5).
- Link sâu: `#bloom` vào đúng 05/08 tại y=4500, `#fracture` vào đúng 06/08 tại y=5625, `#echo` vào đúng
  08/08 tại y=7875; hash giữ nguyên trong cả ba trường hợp. Bản trước cả ba đều dừng ở 01/08 với y=0.
- Địa chỉ đi theo chương: vào trang không có hash thì địa chỉ sạch; cuộn tới chương 4 thì địa chỉ thành
  `#tidal`; bấm nav tới chương 8 thì thành `#echo`.
- Tiến độ riêng của chương cuối: khoảng cuộn còn lại sau khi tới chương 8 là 450 px ở 1440x900 và 490 px ở
  390x844. Bản trước là **0 px ở 1440x900**, nghĩa là `tailAt()` luôn trả 0 và cả nhánh lắng dần của chương
  cuối không bao giờ chạy trên mọi màn hình cao hơn 780 px.
- Nhảy chương 01 tới 08: 1382 ms, đo tới lúc vị trí cuộn chạm mục tiêu trong sai số 2 px. Bản trước dùng
  cuộn mượt của trình duyệt: 1731 ms và không kiểm soát được thời lượng.
- Màn mở đầu: nhấc lên và bị gỡ khỏi DOM sau khi cảnh dựng xong; `data-ready` được đặt trên thẻ `html`.
- Lưu giao diện: chọn sáng trong bảng Tùy chỉnh, `localStorage` ghi `light`, tải lại trang thì `data-theme`
  vẫn là `light`.
- Mobile 390x844: không tràn ngang, không `pageerror`. Vùng chạm của nút chương là 44x44 px (bản trước
  31x29 px). Tên chương đang mở hiện trên thanh điều hướng (bản trước `opacity: 0` và chỉ hiện khi hover,
  nên trên cảm ứng không bao giờ hiện).
- Thẻ chia sẻ: 15 thẻ `og:*` và `twitter:*`, có `canonical`, có `noscript`, có `robots.txt`, `sitemap.xml`
  và ảnh `og.jpg` 1200x630 nặng 70.8 kB. Bản trước: 0 thẻ, không canonical, không noscript, không robots.
- Giảm chuyển động: tải với `prefers-reduced-motion: reduce`, cả 8 `.chapter-copy` đạt opacity 1, không lỗi.
- Rò rỉ tài nguyên: sau khi duyệt hết 8 chương, `usedJSHeapSize` 10 MB, `gl.getError()` trả 0, context không mất.
- Hiệu năng, đo A/B xen kẽ, 3 lượt mỗi bản, 50 khung hình tại mỗi chương, lấy trung vị:
  **bản cũ 74.0 ms, bản mới 77.6 ms, tức chậm hơn 4.9%.** Chênh lệch đều ở cả tám chương (+3 đến +5 ms).
  Đo riêng phần quầng sáng bằng cách tắt nó khi đang chạy: 77.9 ms bật so với 77.0 ms tắt, tức quầng
  chiếm khoảng 0.9 ms. Phần còn lại là hộp sáng giả trong fragment shader của kim loại.

## Chưa kiểm tra

- Số FPS trên GPU thật hoặc thiết bị vật lý. Con số trên là trần của trình dựng hình phần mềm trong
  container. SwiftShader là bộ dựng chạy trên CPU nên nó phóng đại giá của phép tính trên mỗi điểm ảnh:
  4.9% ở đây không nói được gì chắc chắn về giá của hộp sáng giả trên phần cứng thật.
- Điểm Lighthouse, và LCP trên mạng thật. FCP và LCP đo được là 124 ms nhưng đó là localhost không có độ trễ mạng.
- Trình duyệt Safari và Firefox. Cảnh âm dùng `StereoPannerNode`, `ConvolverNode` và `BiquadFilterNode`;
  mã có nhánh dự phòng khi thiếu `createStereoPanner` nhưng chưa chạy thử trên WebKit thật.
- `@property` để nội suy biến màu tuỳ chỉnh. Có mặt trên Chromium đang đo; trên trình duyệt không hỗ trợ
  thì màu vẫn đúng, chỉ nhảy bậc thay vì chuyển dần.
- Đường dẫn WebGL 1 thật sự trên phần cứng cũ; chỉ giữ ràng buộc three r162, tránh render target và giữ
  shader trong phạm vi GLSL ES 1.0.

## Lỗi đã phát hiện và sửa trong lần này

- Link sâu chưa bao giờ hoạt động. Trình duyệt nhảy anchor trước khi React dựng section nên luôn dừng ở
  chương 1, và `go()` không ghi hash nên cũng không chia sẻ được chương nào. Sửa xong lại lộ ra lỗi thứ hai:
  hiệu ứng đồng bộ địa chỉ chạy lần đầu khi chương đang mở vẫn là 01 và xoá sạch hash trước khi nó được đọc.
  Nay hash được đọc ngay lúc nạp module và hiệu ứng đồng bộ bị khoá cho tới khi link sâu đã xử lý xong.
- Chương cuối không bao giờ lắng xuống trên desktop. `.chapter:last-child` cao đúng 100dvh, nên
  `document.scrollHeight - innerHeight` bằng đúng vị trí của section cuối và `tailAt()` luôn trả 0 với
  mọi viewport cao hơn `min-height` 780 px. Nay chương cuối cao 150dvh.
- Lớp scrim đầu tiên có cạnh cứng. `radial-gradient(118% 132% ...)` và `radial-gradient(82% 74% ...)` có
  bán kính lớn hơn hộp, nên ở mép hộp gradient vẫn còn màu và lớp scrim đọc ra là một hình chữ nhật dán
  lên cảnh, cắt ngang khối 3D ở chương Phân rã và Dư âm. Nay ellipse là 50%/50% đặt giữa hộp, chạm 0 đúng
  ở bốn mép; hai bố cục căn đáy dùng dải dọc cộng mặt nạ ngang, cả hai đều chạm 0 ở mép.
- Một bảng lệch màu không dùng chung được cho hai giao diện. Bảng tối có hue gốc quanh 150–175 độ, bảng
  sáng quanh 108 độ, nên cùng một độ lệch −96 độ cho ra hổ phách ở giao diện tối và hồng ở giao diện sáng.
  Nay bảng sáng được xoay về cùng góc hue với bảng tối.
- Hạt bụi và các lớp của nền cộng dồn trên nền sáng chỉ đẩy mọi thứ về trắng. Bào tử của chương Nở rộ đọc
  ra thành tuyết rơi. Nay giao diện sáng dùng hệ số âm cho các lớp cộng dồn của nền và pha trộn thường với
  hạt bụi màu tối; lõi sáng giữa khung hình vẫn dương nhưng yếu hơn.
- Dải mờ của header quá ngắn. Tiêu đề chương cắt ngang chữ LIMEN ở mọi chương khi cuộn. Nay dải đặc phủ
  trọn dòng logo rồi mới mở dần.

## Thay đổi có chủ ý, không phải lỗi

- Chậm hơn 4.9% dưới SwiftShader là giá của hộp sáng giả trên kim loại, và đây là đánh đổi có chủ ý.
  Trước đó phiến kim loại chỉ có bốn đèn trực tiếp và không có gì để phản chiếu, nên trên ảnh chụp chúng
  đọc ra là nhựa xám. Giá nằm ở phép tính trên mỗi điểm ảnh, tức đúng chỗ mà bộ dựng hình chạy trên CPU
  đắt nhất và GPU thật rẻ nhất.
- Lớp scrim nằm dưới chữ khổng lồ chứ không nằm trên. Ban đầu nó nằm trên và làm mờ luôn chữ khổng lồ,
  mất một lớp của tác phẩm. Chữ khổng lồ là nội dung, không phải nền: scrim chỉ có việc làm mờ khối 3D.
- Chương Nở rộ bị hạ bão hoà và độ sáng so với bản nháp đầu. Bản nháp đẩy hue −96 độ cùng lúc với bão hoà
  1.45 và độ sáng +0.048, kết quả là một mảng mù tạt phẳng chiếm cả khung hình. Hổ phách phải là ánh nến
  trong phòng tối, không phải một nền vàng.
- Chương Dư âm được nâng cường độ đèn và viền sáng. Bản nháp để nó mờ tới mức không còn đọc ra vành tròn
  nhận diện của trang, tức mất luôn ý "chương cuối gọi lại chương đầu".
- Không dùng `PMREMGenerator` dù nó cho phản chiếu đúng hơn hộp sáng giả: nó cần render target, mà cả
  trang được dựng trên cam kết không tạo render target nào để giữ tương thích GPU.
- Không thêm bloom. Hai mươi hai tấm quầng cộng dồn cho đúng thứ cần ở đúng chỗ cần với giá 0.9 ms đo được,
  còn một lượt postprocessing phải trả giá trên toàn khung hình và cần render target.
- Chữ khổng lồ vẫn là chữ DOM. Hiệu ứng chiều sâu làm bằng tốc độ trôi khác nhau, mask và tách đôi bằng
  `clip-path`, không dùng `filter: blur` vì giá của nó trên khối chữ cỡ 20vw không xứng với hiệu quả, và
  không chuyển chữ thành mesh 3D vì sẽ mất khả năng đọc và độ nét.
- Nền vẫn không có nhánh `if` theo chương. Bản dựng đầu của LIMEN 2.0 viết mỗi chương một khối `if` và đo
  thật cho thấy trình biên dịch shader gộp phẳng các nhánh: cả tám khối chạy trên mọi điểm ảnh ở mọi chương
  và giá khung hình tăng khoảng 40%. Danh tính của từng chương vì vậy nằm ở tham số, không ở việc khối nào
  được chạy.
