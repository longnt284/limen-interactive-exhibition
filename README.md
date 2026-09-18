# LIMEN / Hành trình tám chương

Triển lãm 3D tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Mở trang là một tấm màn, không phải một màn hình trống. Màn mở đầu là HTML tĩnh với CSS nội tuyến trong `index.html`, nên nó vẽ ngay khi HTML về, trước cả chunk JS lẫn chunk CSS. Nó nhấc lên đúng lúc WebGL dựng xong context, không phải lúc chunk vừa tải; có đường lui bốn giây để trang không bao giờ kẹt sau tấm màn, và cảnh 3D hỏng thì nó nhấc lên ngay.
- Mỗi chương chia sẻ được. Mở `#bloom` là vào thẳng Nở rộ, và địa chỉ đi theo chương đang mở trong lúc cuộn. Hash được đọc ngay lúc nạp module rồi mới cho phép ghi đè, vì trình duyệt tự nhảy anchor trước khi React dựng section còn phép đo vị trí thì chỉ đúng sau khi font đã về.
- Một thế giới 3D duy nhất tiến hoá qua tám chương, không phải tám cảnh rời. Cùng một tập mảnh kim loại đi suốt hành trình: vành cổng đồng tâm mở thành xoắn khẩu độ, xoắn tách thành ba vỏ quỹ đạo, vỏ trải phẳng thành mặt sóng, sóng cuộn thành cụm cánh nở, cánh vỡ ra để hở một khoảng trời, mảnh vỡ về lại thành lưới cầu, rồi lưới khép thành một vành duy nhất đúng dấu hiệu nhận diện của trang.
- Chuyển chương là biến hình chứ không phải mờ đi hiện lại. Mỗi mảnh giữ nguyên danh tính từ chương đầu tới chương cuối; vị trí, hướng và tỉ lệ nội suy thẳng theo tiến độ cuộn.
- Mỗi chương đi qua ba pha thay vì đứng yên chờ chương sau. Pha tới đưa camera, ánh sáng và nền vào trạng thái của chương. Pha trải nghiệm là lúc chương nói hết điều nó muốn nói, và cảnh vẫn chuyển động ngay giữa lòng chương. Pha biến hình chiếm khoảng 60% cuối: chỉ tới đó hình khối và bố cục mới bắt đầu thành chương kế tiếp. Nhờ vậy bố cục của một chương còn nguyên đúng lúc camera dựng khung hình đắt nhất của nó.
- Camera là một công cụ kể chuyện, không phải giá đỡ cố định: tiến vào rất chậm ở Ngưỡng cửa, lách qua khe mở ở Khai mở, lùi ra thấy cả hệ ở Quỹ đạo, trôi ngang cùng dòng chảy ở Thủy triều, vòng và dâng lên ở Nở rộ, đi thẳng qua khoảng trống giữa các mảnh ở Phân rã, lùi thật xa rồi về giữa ở Hội tụ, và gần như đứng yên ở Dư âm.
- Mỗi chương có một nhiệt độ màu riêng, không chỉ một bố cục riêng. Biên độ lệch hue là 0,275 vòng, tức 165 độ: Ngưỡng cửa lam đêm, Khai mở về lại xanh lục gốc và bão hoà lên, Quỹ đạo lam lạnh và nhạt, Thủy triều lục lam bão hoà cao, Nở rộ hổ phách, Phân rã thép lạnh gần như rút hết bão hoà, Hội tụ ngả vàng trắng, Dư âm quay về phía lam của chương một. Xanh vẫn là trục: kim loại, màu nhấn và chữ nhận diện không đổi.
- Phần giao diện thở cùng nhịp màu đó. Nền trang, dải mờ của header, thanh dưới cùng, lớp scrim sau khối chữ và chữ khổng lồ đều đọc chung một bảng lệch màu với cảnh 3D, và chuyển chương là một lần chuyển màu 0,9 giây chứ không phải một cú nhảy bậc. Chữ, màu nhấn và đường kẻ giữ nguyên vì chúng đã được đo tương phản.
- Chữ luôn đọc được dù đứng trước khối nào. Một lớp scrim đi theo chính khối chữ làm mờ phần cảnh ngay sau nó, còn chữ khổng lồ vẫn nằm trên lớp scrim nên không bị làm mờ theo. Không đổ bóng lên từng ký tự, và không có cạnh cứng nào: bán kính gradient chạm 0 đúng ở mép hộp.
- Hai mặt chữ, hai vai. Archivo là grotesque đầu cắt phẳng, lo logo, tiêu đề và chữ khổng lồ. Manrope hình học mềm hơn, lo chữ nhỏ và giao diện. Cả hai đều có tập con tiếng Việt.
- Ánh sáng có tính cách riêng từng chương: viền sáng mạnh trên nền tối ở Ngưỡng cửa, ánh sáng dồn vào bên trong khối ở Khai mở, đèn lạnh ở Quỹ đạo, ấm dần ở Nở rộ, chùm gắt tương phản cao ở Phân rã, nhiều nguồn nhập lại thành một ở Hội tụ, khuếch tán mềm ở Dư âm. Camera, đèn, sương và nền cùng đọc một bảng trạng thái mười sáu dòng nên không bao giờ lệch nhịp nhau.
- Nền là một môi trường sống, không phải ảnh tĩnh: sương của Ngưỡng cửa, tia sáng toả ra của Khai mở, trường sao và vệt quỹ đạo của Quỹ đạo, sóng của Thủy triều, bào tử của Nở rộ, đường nứt và mặt phẳng lệch sáng của Phân rã, đường sức xoắn vào tâm của Hội tụ, rồi lắng về gradient thuần ở Dư âm. Chuyển chương là nội suy tham số của nền chứ không phải hoán đổi lớp.
- Chương cuối gọi lại chương đầu: sương của Dư âm lấy từ đúng trường khí quyển đã dựng nên sương của Ngưỡng cửa, tint đèn quay về phía lạnh như lúc mở đầu, và sáu hạt sáng vẽ vòng elip của Quỹ đạo xuất hiện lại trong trật tự mới ở Hội tụ.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Tốc độ cuộn tác động ngược lại hình ảnh: cuộn nhanh thì góc nhìn dồn lại, đường nền giãn ra, sóng mạnh lên và khối xoay theo đà. Giá trị được kẹp chặt nên cảnh không vỡ khi cuộn rất nhanh.
- Con trỏ là một trường ảnh hưởng chứ không phải cần lái: ánh sáng dịch nhẹ ở Ngưỡng cửa, quầng trong khối đi theo ở Khai mở, trường quỹ đạo cong đi, mặt sóng gợn quanh con trỏ ở Thủy triều, cánh hướng về phía con trỏ ở Nở rộ, mảnh vỡ né ra ở Phân rã, tâm hút lệch đi ở Hội tụ, bụi trôi theo ở Dư âm. Biên độ giữ nhỏ để trang không biến thành một trò chơi.
- Chữ khổng lồ của mỗi chương nằm trong không gian chứ không dán lên nền: tám tốc độ trôi khác nhau tạo chiều sâu, chữ Quỹ đạo bị che dần về phía khối nên khối đọc ra là đứng trước chữ, chữ Khai mở giãn ra, chữ Phân rã tách đôi theo đường nứt, chữ Hội tụ khép lại, chữ Dư âm tan vào khí quyển. Toàn bộ vẫn là chữ DOM nên đọc được và nét.
- Chữ tiêu đề hiện lên theo từng dòng, nghiêng nhẹ trong không gian ba chiều rồi trở về phẳng.
- Điều hướng bên phải là một thanh hành trình tám nút: nút của chương đang mở nở rộng, đường tiến độ chạy dọc theo, rê chuột hoặc focus hiện số chương, tên chương và một dấu hiệu nhỏ riêng cho từng chương.
- Nhảy chương có nhịp cố định. Cuộn mượt của trình duyệt đi hết 1,7 giây cho quãng chương 1 tới chương 8 và thời lượng do trình duyệt quyết; ở đây thời lượng kẹp trong 0,7–1,5 giây theo quãng đường, và một cú lăn chuột giữa chừng huỷ được nó.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Giao diện sáng/tối được nhớ lại giữa các lần vào. Một script nội tuyến chốt giao diện trước khung hình đầu tiên, nên màn mở đầu không nháy sai tông.
- Thanh dưới cùng chỉ còn bốn thứ: chương đang mở, tiến độ, âm thanh và nút mở bảng Tùy chỉnh. Tạm dừng chuyển động, nhịp độ, xoay góc nhìn, giao diện sáng/tối, con trỏ tác động vào cảnh và giảm chuyển động nằm trong bảng đó. Bảng không khoá trang nên vẫn cuộn và xem cảnh đổi trong lúc chỉnh; đóng bằng Esc hoặc bấm ra ngoài, tiêu điểm quay lại đúng nút đã mở.
- Âm thanh là một cảnh âm generative, không phải một vòng nhạc lặp. Năm giọng dao động và một nguồn nhiễu chạy suốt hành trình; chương chỉ đổi tần số cắt, độ vang, mật độ hoà âm, sắc kim loại và chuyển động không gian: tiếng ngân trầm ở Ngưỡng cửa, hoà âm mở ra ở Khai mở, nhịp đập không gian ở Quỹ đạo, lớp sóng qua bộ lọc ở Thủy triều, hoà âm lớn dần ở Nở rộ, sắc kim loại vỡ hạt ở Phân rã, các mô típ nhập lại ở Hội tụ, đuôi vang dài rồi lặng ở Dư âm. Âm lượng tổng cố định khi đã bật; vào và ra bằng đường dốc, không có tiếng bụp. Mặc định tắt.
- Giao diện sáng có bảng màu riêng, không phải bản đảo ngược của bảng tối. Hai bảng xoay về cùng một góc hue để một bảng lệch màu dùng chung được cho cả hai. Trên nền sáng, các lớp của nền trừ đi thay vì cộng vào, và hạt bụi chuyển sang pha trộn thường với màu tối: cộng dồn trên nền sáng chỉ đẩy mọi thứ về trắng và hạt bụi đọc ra thành tuyết rơi.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong bảng Tùy chỉnh. Chế độ này bỏ parallax, hiệu ứng bung mảnh, reveal và mọi tác động của con trỏ, rút quãng di chuyển camera còn 30%; khối đổi dứt điểm theo từng chương và cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Một canvas xuyên suốt, ba `InstancedMesh` luôn hiển thị: 110 phiến bo góc vát cạnh, 48 thanh lục giác và 22 hạt phát sáng. Ba vai trò này tồn tại ở cả tám chương nên mỗi instance giữ nguyên danh tính suốt hành trình, chuyển chương chỉ là nội suy vị trí, quaternion và tỉ lệ. Không cần chồng mờ hai khối, không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render. Ba draw call cố định, khoảng 16 nghìn tam giác, tổng số ma trận ghi mỗi khung hình là 180 và không đổi.

Tám bố cục của cả ba vai trò tính trước một lần khi mount. Bảng `KEYS` 16×22 số giữ camera, mục tiêu nhìn, FOV, vị trí, cường độ và tint đèn, biên sương và bốn tham số màu nền. Mỗi chương chiếm hai dòng, một cho lúc vừa tới và một cho lúc chương nói hết điều nó muốn nói, nên cảnh vẫn chuyển động ngay giữa lòng một chương. Mỗi khung hình nội suy bảng này một lần rồi phát cho camera, đèn, `THREE.Fog` và nền. Màu nền dựng từ bảng màu thương hiệu bằng độ lệch HSL chứ không phải danh sách mã màu rời, nên cả hai giao diện luôn đồng bộ.

Nền là một quad toàn màn hình, và ở đây có một bài học đáng ghi lại. Bản dựng đầu tiên viết mỗi chương một khối `if` riêng trong fragment shader, tin rằng trọng số là uniform thì nhánh không phân kỳ. Đo thật thì thấy trình biên dịch shader gộp phẳng các nhánh đó: cả tám khối chạy trên mọi điểm ảnh ở mọi chương, và giá khung hình tăng khoảng 40% so với bản cũ, đều nhau ở cả tám chương. Bản hiện tại bỏ hẳn cấu trúc nhánh. Nền chỉ còn ba nguyên thủy — một trường hạt và hai họ đường — cộng vài số vô hướng; danh tính của từng chương nằm ở tham số chứ không ở việc khối nào được chạy. Bảng `ENVS` 8×25 số giữ các tham số ấy và chuyển chương nội suy thẳng trên bảng, nên nền của chương này biến dần thành nền chương sau thay vì bị hoán đổi. Giá cố định, không phụ thuộc vị trí cuộn, và thấp hơn bản cũ.

Bụi khí quyển là một `Points` đổi hành vi theo chương ngay trong vertex shader, CPU không đụng tới từng hạt; ở đây trọng số từng chương vẫn dùng được vì phép tính nằm trên 520 đỉnh chứ không phải mỗi điểm ảnh. Viền sáng trên kim loại được thêm vào `MeshStandardMaterial` qua `onBeforeCompile`; không dùng postprocessing và không tạo render target.

Con trỏ được đổi về hệ toạ độ của nhóm bằng một tia từ camera cắt mặt phẳng đi qua tâm nhóm, nên trường ảnh hưởng vẫn đúng chỗ khi nhóm đã xoay. Phép tính này chỉ chạy khi chương hiện tại thật sự có trường ảnh hưởng.

Cảnh âm đọc đúng tiến độ đã làm mượt của phần hình theo nhịp 180ms, không theo từng khung hình: âm thanh chỉ cần đi đúng đường cong. Đuôi vang dựng từ nhiễu tắt dần theo hàm mũ nên không thêm tài nguyên mạng nào. Toàn bộ đồ thị âm thanh chỉ dựng khi người xem bật tiếng lần đầu.

Kim loại có một môi trường để phản chiếu mà không cần envMap. Bốn đèn trực tiếp không đủ: thiếu phản chiếu thì phiến đọc ra là nhựa xám. `onBeforeCompile` thêm một hộp sáng giả tra cứu bằng pháp tuyến trong hệ toạ độ khung nhìn — trời ở trên, sàn ở dưới, một dải sáng hẹp ở ngang tầm mắt — và chính dải chân trời đó là thứ mắt đọc ra là bề mặt bóng. Hai màu của hộp sáng đi theo môi trường từng chương nên phản chiếu đổi màu cùng lúc với nền. `PMREMGenerator` cho kết quả đúng hơn nhưng cần render target, mà cả trang được dựng trên cam kết không tạo render target nào.

Hai mươi hai hạt phát sáng có thêm một lớp quầng: mỗi hạt một tấm phẳng luôn quay mặt về camera, vẽ một vệt sáng cộng dồn, dùng lại đúng ma trận của hạt nên không bao giờ lệch. Một draw call, và tấm phẳng tắt hẳn khi quầng mờ dưới ngưỡng thấy được. Đây là chỗ đứng của bloom mà không phải trả giá của bloom.

Chỉ hai tập con của Archivo được khai báo. Gói `@fontsource` khai báo ba, và latin-ext được khai báo sau vietnamese với dải mã phủ U+1EF2-1EFF, tức đúng chữ "ỹ" trong "Quỹ đạo", nên trình duyệt tải thêm 32 kB chỉ vì một ký tự mà tập vietnamese đã có. Manrope cũng rút còn nét 400: Archivo đã nhận logo, tiêu đề và chữ khổng lồ. Một plugin Vite đọc tên file đã hash từ bundle và chèn `rel=preload` cho đúng bốn tập con vẽ màn hình đầu.

Ngưỡng 700px được đo lại khi cửa sổ đổi kích thước. Bản trước đọc bề rộng đúng một lần lúc mount, nên xoay tablet thì bố cục đổi mà số hạt bụi và trọng số nền vẫn giữ mức của hướng cũ.

Giới hạn DPR 1.25 và dùng hệ đèn trực tiếp để giảm shader/render-target. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn. Dưới 700px giảm số hạt bụi còn một nửa, bớt một tầng nhiễu khí quyển, hạ trọng số lưới và đường mạng, đồng thời lùi camera và mở FOV để khung hình vừa màn hình dọc.

Three.js được khóa ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Canvas tự chọn context phù hợp; nếu WebGL thực sự không khả dụng hoặc context bị mất, giao diện dùng một hình thái CSS thay thế thay vì để trống màn hình, và tự khôi phục khi context quay lại.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên khối 3D khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển, bảng Tùy chỉnh, chữ trong không gian, bàn phím và ScrollTrigger.
- `src/Scene.jsx`: hình học, vật liệu, bảng trạng thái cảnh, camera, ánh sáng, sương, nền, bụi và trường con trỏ.
- `src/sound.js`: cảnh âm generative tám chương.
- `src/archivo.css`: hai tập con của mặt chữ hiển thị.
- `src/style.css`: responsive, màu, lớp scrim và lớp hiển thị (world 1, nội dung 2, header 3, điều khiển 4, skip link 6, màn mở đầu 9, dialog top layer).
- `index.html`: thẻ chia sẻ, dữ liệu có cấu trúc, màn mở đầu tĩnh và nội dung dự phòng khi không có JavaScript.
- `public/`: `robots.txt`, `sitemap.xml` và ảnh chia sẻ `og.jpg`.
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
