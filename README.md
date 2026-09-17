# LIMEN / Hành trình tám chương

Triển lãm số tương tác phi thương mại bằng tiếng Việt. Tám màn hình nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

Câu chuyện được kể bằng một sơ đồ thị giác duy nhất tiến hoá theo cuộn: nút hình ảnh, mốc, thẻ chú giải và các đường nối. Lớp 3D vẫn còn nhưng đã lùi về sau làm khí quyển nền.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Một sơ đồ duy nhất đi suốt tám chương. Mười sáu nút (một lõi, năm thành phần hình ảnh, bốn mốc, bốn chấm, hai thẻ chú giải) và ba mươi mốt đường nối tồn tại ở cả tám chương; mỗi chương chỉ là một bố cục khác của cùng tập nút đó.
- Chuyển chương là tái tổ chức, không phải mờ đi hiện lại. Vị trí, tỉ lệ, độ hiện của từng nút và trọng số của từng đường nối nội suy thẳng theo tiến độ cuộn: lõi tách thành năm thành phần, thành phần vào quỹ đạo, quỹ đạo duỗi thành dòng chảy có hướng, dòng chảy rẽ nhánh, nhánh văng ra biên, mảnh vỡ trở về thành lưới, lưới khép thành một vành duy nhất.
- Đường nối tự vẽ theo trọng số của chương, gãy thành nét đứt ở chương Phân rã, và có hạt chạy dọc đường dẫn ở những chương mang tính dòng chảy.
- Nhãn của nút đổi theo chương: cùng một nút mang tên khác khi vai trò của nó trong câu chuyện đổi. Chữ chú giải lặng đi ở đoạn giữa hai chương, nên nội dung đổi đúng lúc không ai đọc chúng.
- Khung sơ đồ luôn nằm ở phía đối diện phần chữ và đổi cỡ theo chương, như một cú lia máy. Trên màn hẹp, sơ đồ chuyển lên phần trên và các lớp phụ giảm độ hiện.
- Nền là bốn lớp: chuyển màu theo chương, lưới và ma trận chấm, đường bình độ, rồi các vùng sáng mềm bám theo chính cụm nút đang chạy. Cả bốn cùng đọc một bảng chương với sơ đồ nên luôn đổi cùng nhịp.
- Lớp 3D giữ nguyên toàn bộ nhịp biến hình cũ nhưng nhỏ lại, lùi xa và chỉ còn một phần ba độ đục, đóng vai trò khí quyển phía sau sơ đồ.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Điều hướng bên phải đưa trực tiếp tới một trong tám chương, kèm thanh tiến độ chạy theo vị trí cuộn.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Tạm dừng vòng xoay tự động, đổi nhịp độ, xoay góc nhìn, bật/tắt âm thanh (âm thanh vào và ra bằng đường dốc, không có tiếng bụp).
- Giao diện sáng/tối. Sơ đồ, nền và lớp 3D đều có bảng màu riêng cho từng chế độ; chữ nền khổng lồ và màu thanh địa chỉ trôi theo tông của chương đang mở.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong hộp Về triển lãm. Chế độ này bỏ parallax, hiệu ứng bung nút và reveal; sơ đồ đứng yên ở đúng bố cục của từng chương và cuộn tức thì khi chọn chương.

## Hiệu năng và cấu trúc

Sơ đồ là dữ liệu, không phải tám tệp hình. `src/diagram.js` giữ danh sách nút, danh sách đường nối, trọng số sáu nhóm đường qua tám chương và hàm `layoutAt(chương, nút)` trả về toạ độ trong khung vuông 0..100. `src/Diagram.jsx` chạy một vòng lặp duy nhất trên `gsap.ticker`: mỗi khung hình nó nội suy bố cục giữa hai chương kề rồi ghi thẳng vào DOM, không đặt React state và không dựng lại cây.

Mỗi khung hình ghi khoảng 200 thuộc tính: nút đổi `transform` và `opacity`, đường nối đổi `d`, `opacity` và `stroke-dasharray`. Đường nối có trọng số dưới 0.012 bị bỏ qua hẳn nên các chương thưa chỉ tốn một phần. Chiều dài đường dùng để vẽ dần được tính xấp xỉ từ ba đoạn của đường bậc hai, không gọi `getTotalLength` nên không ép trình duyệt tính lại bố cục. Cỡ khung và cỡ khung nhìn lấy một lần qua `ResizeObserver`; chữ trên nhãn và thẻ chỉ đổi khi chương làm tròn đổi.

Toạ độ nút HTML và `viewBox` của SVG dùng chung một hệ 0..100 trên một khung vuông, nên đường nối luôn cắm đúng tâm nút mà không cần đo vị trí thật của phần tử. Nét vẽ dùng `vector-effect: non-scaling-stroke` để độ dày không đổi khi khung phóng to thu nhỏ.

Nền là bốn lớp CSS cố định, đổi bằng biến CSS đặt trên chính phần tử nền chứ không phải trên `:root`, nên mỗi lần đổi chỉ làm mất hiệu lực bốn phần tử. Giá trị chỉ ghi khi vượt ngưỡng thay đổi.

Lớp 3D giữ nguyên ba `InstancedMesh` và bảng trạng thái cũ, nhưng ở chế độ khí quyển thì dựng hình ở tỉ lệ điểm ảnh 0.55, tắt một tầng nhiễu khí quyển và giảm nửa số hạt bụi. Đây là khoản tốn kém nhất của trang: đo trên trình dựng hình phần mềm, tắt riêng lớp 3D đưa thời gian một khung hình từ 132 ms xuống 25 ms, còn sơ đồ chỉ chiếm khoảng 1 ms và nền CSS khoảng 8 ms. Nhờ hạ tỉ lệ điểm ảnh, bản mới chạy nhanh hơn bản chỉ có 3D trước đây: trung vị 56.7 ms so với 117.3 ms.

Three.js vẫn khoá ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Nếu WebGL không khả dụng hoặc context bị mất, lớp 3D biến mất lặng lẽ và sơ đồ cùng nội dung vẫn kể trọn câu chuyện.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên sơ đồ khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/diagram.js`: nút, đường nối, trọng số, nhãn, thẻ, bảng nền và bố cục tám chương của sơ đồ.
- `src/Diagram.jsx`: hình vẽ của từng nút, vòng lặp cuộn, vẽ đường nối và điều khiển lớp nền.
- `src/main.jsx`: bố cục, điều khiển, bàn phím và ScrollTrigger.
- `src/Scene.jsx`: lớp 3D khí quyển — hình học, vật liệu, bảng trạng thái cảnh, camera, ánh sáng, sương, nền và bụi.
- `src/style.css`: responsive, màu và lớp hiển thị (nền 0, khí quyển 3D 1, sơ đồ 2, chữ 3, header 4, điều khiển 5, skip link 6, dialog top layer).
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
