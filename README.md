# LIMEN / Hành trình tám chương

Triển lãm 3D tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Một thế giới 3D duy nhất tiến hoá qua tám chương, không phải tám cảnh rời. Cùng một tập mảnh kim loại đi suốt hành trình: vành cổng đồng tâm mở thành xoắn khẩu độ, xoắn tách thành ba vỏ quỹ đạo, vỏ trải phẳng thành mặt sóng, sóng cuộn thành cụm cánh nở, cánh vỡ ra để hở một khoảng trời, mảnh vỡ về lại thành lưới cầu, rồi lưới khép thành một vành duy nhất đúng dấu hiệu nhận diện của trang.
- Chuyển chương là biến hình chứ không phải mờ đi hiện lại. Mỗi mảnh giữ nguyên danh tính từ chương đầu tới chương cuối; vị trí, hướng và tỉ lệ nội suy thẳng theo tiến độ cuộn.
- Mỗi chương đi qua ba pha thay vì đứng yên chờ chương sau. Pha tới đưa camera, ánh sáng và nền vào trạng thái của chương. Pha trải nghiệm là lúc chương nói hết điều nó muốn nói, và cảnh vẫn chuyển động ngay giữa lòng chương. Pha biến hình chiếm khoảng 60% cuối: chỉ tới đó hình khối và bố cục mới bắt đầu thành chương kế tiếp. Nhờ vậy bố cục của một chương còn nguyên đúng lúc camera dựng khung hình đắt nhất của nó.
- Camera là một công cụ kể chuyện, không phải giá đỡ cố định: tiến vào rất chậm ở Ngưỡng cửa, lách qua khe mở ở Khai mở, lùi ra thấy cả hệ ở Quỹ đạo, trôi ngang cùng dòng chảy ở Thủy triều, vòng và dâng lên ở Nở rộ, đi thẳng qua khoảng trống giữa các mảnh ở Phân rã, lùi thật xa rồi về giữa ở Hội tụ, và gần như đứng yên ở Dư âm.
- Ánh sáng có tính cách riêng từng chương: viền sáng mạnh trên nền tối ở Ngưỡng cửa, ánh sáng dồn vào bên trong khối ở Khai mở, đèn lạnh ở Quỹ đạo, ấm dần ở Nở rộ, chùm gắt tương phản cao ở Phân rã, nhiều nguồn nhập lại thành một ở Hội tụ, khuếch tán mềm ở Dư âm. Camera, đèn, sương và nền cùng đọc một bảng trạng thái mười sáu dòng nên không bao giờ lệch nhịp nhau.
- Nền là một môi trường sống, không phải ảnh tĩnh: sương của Ngưỡng cửa, tia sáng toả ra của Khai mở, trường sao và vệt quỹ đạo của Quỹ đạo, sóng của Thủy triều, bào tử của Nở rộ, đường nứt và mặt phẳng lệch sáng của Phân rã, đường sức xoắn vào tâm của Hội tụ, rồi lắng về gradient thuần ở Dư âm. Chuyển chương là nội suy tham số của nền chứ không phải hoán đổi lớp.
- Chương cuối gọi lại chương đầu: sương của Dư âm lấy từ đúng trường khí quyển đã dựng nên sương của Ngưỡng cửa, tint đèn quay về phía lạnh như lúc mở đầu, và sáu hạt sáng vẽ vòng elip của Quỹ đạo xuất hiện lại trong trật tự mới ở Hội tụ.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Tốc độ cuộn tác động ngược lại hình ảnh: cuộn nhanh thì góc nhìn dồn lại, đường nền giãn ra, sóng mạnh lên và khối xoay theo đà. Giá trị được kẹp chặt nên cảnh không vỡ khi cuộn rất nhanh.
- Con trỏ là một trường ảnh hưởng chứ không phải cần lái: ánh sáng dịch nhẹ ở Ngưỡng cửa, quầng trong khối đi theo ở Khai mở, trường quỹ đạo cong đi, mặt sóng gợn quanh con trỏ ở Thủy triều, cánh hướng về phía con trỏ ở Nở rộ, mảnh vỡ né ra ở Phân rã, tâm hút lệch đi ở Hội tụ, bụi trôi theo ở Dư âm. Biên độ giữ nhỏ để trang không biến thành một trò chơi.
- Chữ khổng lồ của mỗi chương nằm trong không gian chứ không dán lên nền: tám tốc độ trôi khác nhau tạo chiều sâu, chữ Quỹ đạo bị che dần về phía khối nên khối đọc ra là đứng trước chữ, chữ Khai mở giãn ra, chữ Phân rã tách đôi theo đường nứt, chữ Hội tụ khép lại, chữ Dư âm tan vào khí quyển. Toàn bộ vẫn là chữ DOM nên đọc được và nét.
- Chữ tiêu đề hiện lên theo từng dòng, nghiêng nhẹ trong không gian ba chiều rồi trở về phẳng.
- Điều hướng bên phải là một thanh hành trình tám nút: nút của chương đang mở nở rộng, đường tiến độ chạy dọc theo, rê chuột hoặc focus hiện số chương, tên chương và một dấu hiệu nhỏ riêng cho từng chương.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Thanh dưới cùng chỉ còn bốn thứ: chương đang mở, tiến độ, âm thanh và nút mở bảng Tùy chỉnh. Tạm dừng chuyển động, nhịp độ, xoay góc nhìn, giao diện sáng/tối, con trỏ tác động vào cảnh và giảm chuyển động nằm trong bảng đó. Bảng không khoá trang nên vẫn cuộn và xem cảnh đổi trong lúc chỉnh; đóng bằng Esc hoặc bấm ra ngoài, tiêu điểm quay lại đúng nút đã mở.
- Âm thanh là một cảnh âm generative, không phải một vòng nhạc lặp. Năm giọng dao động và một nguồn nhiễu chạy suốt hành trình; chương chỉ đổi tần số cắt, độ vang, mật độ hoà âm, sắc kim loại và chuyển động không gian: tiếng ngân trầm ở Ngưỡng cửa, hoà âm mở ra ở Khai mở, nhịp đập không gian ở Quỹ đạo, lớp sóng qua bộ lọc ở Thủy triều, hoà âm lớn dần ở Nở rộ, sắc kim loại vỡ hạt ở Phân rã, các mô típ nhập lại ở Hội tụ, đuôi vang dài rồi lặng ở Dư âm. Âm lượng tổng cố định khi đã bật; vào và ra bằng đường dốc, không có tiếng bụp. Mặc định tắt.
- Giao diện sáng/tối. Cảnh 3D đổi màu theo giao diện: nền, kim loại, viền sáng và bụi đều có bảng màu riêng cho từng chế độ. Chữ nền khổng lồ và màu thanh địa chỉ trôi theo tông của chương đang mở.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong bảng Tùy chỉnh. Chế độ này bỏ parallax, hiệu ứng bung mảnh, reveal và mọi tác động của con trỏ, rút quãng di chuyển camera còn 30%; khối đổi dứt điểm theo từng chương và cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Một canvas xuyên suốt, ba `InstancedMesh` luôn hiển thị: 110 phiến bo góc vát cạnh, 48 thanh lục giác và 22 hạt phát sáng. Ba vai trò này tồn tại ở cả tám chương nên mỗi instance giữ nguyên danh tính suốt hành trình, chuyển chương chỉ là nội suy vị trí, quaternion và tỉ lệ. Không cần chồng mờ hai khối, không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render. Ba draw call cố định, khoảng 16 nghìn tam giác, tổng số ma trận ghi mỗi khung hình là 180 và không đổi.

Tám bố cục của cả ba vai trò tính trước một lần khi mount. Bảng `KEYS` 16×22 số giữ camera, mục tiêu nhìn, FOV, vị trí, cường độ và tint đèn, biên sương và bốn tham số màu nền. Mỗi chương chiếm hai dòng, một cho lúc vừa tới và một cho lúc chương nói hết điều nó muốn nói, nên cảnh vẫn chuyển động ngay giữa lòng một chương. Mỗi khung hình nội suy bảng này một lần rồi phát cho camera, đèn, `THREE.Fog` và nền. Màu nền dựng từ bảng màu thương hiệu bằng độ lệch HSL chứ không phải danh sách mã màu rời, nên cả hai giao diện luôn đồng bộ.

Nền là một quad toàn màn hình, và ở đây có một bài học đáng ghi lại. Bản dựng đầu tiên viết mỗi chương một khối `if` riêng trong fragment shader, tin rằng trọng số là uniform thì nhánh không phân kỳ. Đo thật thì thấy trình biên dịch shader gộp phẳng các nhánh đó: cả tám khối chạy trên mọi điểm ảnh ở mọi chương, và giá khung hình tăng khoảng 40% so với bản cũ, đều nhau ở cả tám chương. Bản hiện tại bỏ hẳn cấu trúc nhánh. Nền chỉ còn ba nguyên thủy — một trường hạt và hai họ đường — cộng vài số vô hướng; danh tính của từng chương nằm ở tham số chứ không ở việc khối nào được chạy. Bảng `ENVS` 8×25 số giữ các tham số ấy và chuyển chương nội suy thẳng trên bảng, nên nền của chương này biến dần thành nền chương sau thay vì bị hoán đổi. Giá cố định, không phụ thuộc vị trí cuộn, và thấp hơn bản cũ.

Bụi khí quyển là một `Points` đổi hành vi theo chương ngay trong vertex shader, CPU không đụng tới từng hạt; ở đây trọng số từng chương vẫn dùng được vì phép tính nằm trên 520 đỉnh chứ không phải mỗi điểm ảnh. Viền sáng trên kim loại được thêm vào `MeshStandardMaterial` qua `onBeforeCompile`; không dùng postprocessing và không tạo render target.

Con trỏ được đổi về hệ toạ độ của nhóm bằng một tia từ camera cắt mặt phẳng đi qua tâm nhóm, nên trường ảnh hưởng vẫn đúng chỗ khi nhóm đã xoay. Phép tính này chỉ chạy khi chương hiện tại thật sự có trường ảnh hưởng.

Cảnh âm đọc đúng tiến độ đã làm mượt của phần hình theo nhịp 180ms, không theo từng khung hình: âm thanh chỉ cần đi đúng đường cong. Đuôi vang dựng từ nhiễu tắt dần theo hàm mũ nên không thêm tài nguyên mạng nào. Toàn bộ đồ thị âm thanh chỉ dựng khi người xem bật tiếng lần đầu.

Giới hạn DPR 1.25 và dùng hệ đèn trực tiếp để giảm shader/render-target. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn. Dưới 700px giảm số hạt bụi còn một nửa, bớt một tầng nhiễu khí quyển, hạ trọng số lưới và đường mạng, đồng thời lùi camera và mở FOV để khung hình vừa màn hình dọc.

Three.js được khóa ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Canvas tự chọn context phù hợp; nếu WebGL thực sự không khả dụng hoặc context bị mất, giao diện dùng một hình thái CSS thay thế thay vì để trống màn hình, và tự khôi phục khi context quay lại.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên khối 3D khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển, bảng Tùy chỉnh, chữ trong không gian, bàn phím và ScrollTrigger.
- `src/Scene.jsx`: hình học, vật liệu, bảng trạng thái cảnh, camera, ánh sáng, sương, nền, bụi và trường con trỏ.
- `src/sound.js`: cảnh âm generative tám chương.
- `src/style.css`: responsive, màu và lớp hiển thị (world 1, nội dung 2, header 3, điều khiển 4, skip link 6, dialog top layer).
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
