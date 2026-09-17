# LIMEN / Hành trình tám chương

Triển lãm số tương tác phi thương mại bằng tiếng Việt. Tám chương nối tiếp trên một trang cuộn: Ngưỡng cửa, Khai mở, Quỹ đạo, Thủy triều, Nở rộ, Phân rã, Hội tụ và Dư âm.

Trang là một trải nghiệm điện ảnh đa chất liệu: tác phẩm đồ hoạ vector, chữ khổ lớn, bố cục biên tập, khí quyển shader và chiều sâu 2.5D cùng chạy theo một tiến độ cuộn. Khối 3D vẫn ở đó nhưng là kiến trúc nền của thế giới, không còn là món đồ trưng bày chính.

## Chạy

```bash
npm install
npm run dev
```

`npm run build` tạo bản tĩnh trong `dist/`. `npm run preview` xem bản production. Bản triển khai: https://limen-interactive-exhibition.vercel.app/.

## Trải nghiệm

- Ba mặt phẳng chiều sâu cho mỗi chương, xếp giữa lớp WebGL và lớp chữ. Mặt xa là tác phẩm của chương trước được phóng rất lớn rồi tan đi: người xem vừa bay xuyên qua nó nên nó trở thành môi trường của chương này. Mặt giữa là tác phẩm của chương này, mở từ một lát cắt hẹp ra tràn khung rồi vượt qua người xem. Mặt gần là một mảnh cắt của chương sau, trôi nhanh nhất, báo trước điều sắp tới. Vì vậy mọi khung hình đều mang dấu vết của chương trước và mầm của chương sau.
- Chuyển chương không phải mờ đi hiện lại mà là ống kính đi xuyên qua tác phẩm. Cửa sổ cắt co giãn không đều còn tác phẩm bên trong giãn nghịch đúng bằng đó, nên khuôn cắt đổi mà tỉ lệ tác phẩm không méo.
- Tám tác phẩm sinh tại chỗ bằng SVG, không ảnh ngoài và không tài sản nhị phân: vành cổng đồng tâm, cánh khẩu độ, ba vòng quỹ đạo nghiêng, mười bảy đường đồng mức, năm cánh nở, vành mảnh vỡ hở giữa, lưới cầu hội tụ và một vành duy nhất. Mỗi tác phẩm dùng đúng phép ẩn dụ của khối 3D cùng chương nên hai lớp đọc ra là một thế giới.
- Bố cục biên tập: chữ ở bên nào thì tác phẩm dồn về phía đối diện, khối 3D lùi về phía có chữ và nằm sau dòng tiêu đề. Một màn che đổ đúng nửa khung có chữ, nên nội dung luôn nằm trên vùng tối nhất.
- Chữ tiêu đề trượt ra từ sau một mặt nạ cắt đúng chiều cao dòng. Chữ nền khổng lồ trôi chậm nhất và thu nhẹ lại, đóng vai lớp sâu nhất của khung hình.
- Một lớp vân hạt phủ lên cả chữ lẫn hình, nên tám chương đọc ra cùng một chất liệu.
- Một thế giới 3D duy nhất tiến hoá qua tám chương, không phải tám cảnh rời. Cùng một tập mảnh kim loại đi suốt hành trình: vành cổng đồng tâm mở thành xoắn khẩu độ, xoắn tách thành ba vỏ quỹ đạo, vỏ trải phẳng thành mặt sóng, sóng cuộn thành cụm cánh nở, cánh vỡ ra để hở một khoảng trời, mảnh vỡ về lại thành lưới cầu, rồi lưới khép thành một vành duy nhất đúng dấu hiệu nhận diện của trang.
- Chuyển chương là biến hình chứ không phải mờ đi hiện lại. Mỗi mảnh giữ nguyên danh tính từ chương đầu tới chương cuối; vị trí, hướng và tỉ lệ nội suy thẳng theo tiến độ cuộn.
- Camera, ánh sáng, sương và nền đổi cùng nhịp với hình khối vì cả bốn cùng đọc một bảng trạng thái tám dòng: camera lùi ra ở Quỹ đạo, đi cùng dòng chảy ở Thủy triều, dâng lên ở Nở rộ, mở rộng ở Hội tụ rồi về giữa ở Dư âm.
- Nền là một hệ nhiều lớp thay vì một ảnh tĩnh: gradient theo chương, khí quyển nhiễu chậm, lưới sàn phối cảnh, đường mạng, vệt hướng, sóng nở, nhiễu phân rã và môi trường tối giản ở chương cuối. Các lớp chồng lấn dài nên không có điểm bật tắt.
- Nền và độ hiện diện của sân khấu cùng mang một đường cong cảm xúc: khép và tối ở Ngưỡng cửa, mở dần, rộng và sáng nhất ở Phân rã, rồi lắng lại ở Dư âm. Màu đi theo một cung duy nhất khai báo ở `ARC`, dùng chung cho tác phẩm SVG, chữ nền khổng lồ và tông cảnh 3D.
- Cuộn tự nhiên theo hai chiều. Tiến độ cuộn được làm mượt bằng bộ giảm chấn theo thời gian thực, nên chuyển động không giật theo từng nấc lăn chuột.
- Tốc độ cuộn tác động ngược lại hình ảnh: cuộn nhanh thì góc nhìn dồn lại, vệt nền kéo dài và khối xoay theo đà. Giá trị được kẹp chặt nên cảnh không vỡ khi cuộn rất nhanh.
- Chữ tiêu đề hiện lên theo từng dòng, nghiêng nhẹ trong không gian ba chiều rồi trở về phẳng.
- Điều hướng bên phải đưa trực tiếp tới một trong tám chương, kèm thanh tiến độ chạy theo vị trí cuộn.
- Bàn phím: mũi tên lên/xuống và Page Up/Page Down đi từng chương, Home về chương đầu, End tới chương cuối.
- Tạm dừng vòng xoay tự động, đổi nhịp độ, xoay góc nhìn, bật/tắt âm thanh (âm thanh vào và ra bằng đường dốc, không có tiếng bụp).
- Giao diện sáng/tối. Cảnh 3D đổi màu theo giao diện: nền, kim loại, viền sáng và bụi đều có bảng màu riêng cho từng chế độ. Chữ nền khổng lồ và màu thanh địa chỉ trôi theo tông của chương đang mở.
- Giảm chuyển động tự động theo thiết bị hoặc bật trong hộp Về triển lãm. Chế độ này bỏ parallax, hiệu ứng bung mảnh và reveal, rút quãng di chuyển camera còn 30%; khối đổi dứt điểm theo từng chương và cuộn tức thì khi chọn chương. Sân khấu 2.5D cũng ngừng chạy theo cuộn và chỉ đổi dứt điểm theo chương đang mở, giữ nguyên bố cục và độ đọc.

## Hiệu năng và cấu trúc

Sân khấu 2.5D là DOM thuần: 8 cảnh, mỗi cảnh 3 mặt phẳng, tổng 24 SVG dựng một lần khi mount. Ở bất kỳ vị trí cuộn nào cũng chỉ tối đa hai cảnh phải dựng hình: cảnh ngoài phạm vi bị ẩn hẳn bằng `visibility`, còn cảnh trong phạm vi nhưng đã mờ hết thì GSAP `autoAlpha` tự đặt `visibility: hidden`. Mỗi cảnh chạy đúng một timeline gắn một `ScrollTrigger`, chỉ động vào `transform` và `opacity`. Màn che chỉ phủ đúng nửa khung có chữ nên bớt một lượt tô toàn màn hình mỗi khung hình; vignette nằm sẵn trong shader nền nên không lặp lại ở lớp DOM.

Vì tác phẩm là SVG sinh tại chỗ nên lớp tự sự vẫn đầy đủ khi WebGL không khả dụng, và không có tài sản nhị phân nào phải tải.

Một canvas xuyên suốt, ba `InstancedMesh` luôn hiển thị: 110 phiến bo góc vát cạnh, 48 thanh lục giác và 22 hạt phát sáng. Ba vai trò này tồn tại ở cả tám chương nên mỗi instance giữ nguyên danh tính suốt hành trình, chuyển chương chỉ là nội suy vị trí, quaternion và tỉ lệ. Không cần chồng mờ hai khối, không tải mô hình giữa các chương, không chặn wheel/touch, không đặt React state trong vòng render. Ba draw call cố định, khoảng 16 nghìn tam giác, tổng số ma trận ghi mỗi khung hình là 180 và không đổi.

Tám bố cục của cả ba vai trò tính trước một lần khi mount. Bảng `STATES` 8×21 số giữ camera, mục tiêu nhìn, FOV, vị trí và cường độ đèn, biên sương và bốn tham số màu nền; mỗi khung hình nội suy một lần rồi phát cho camera, đèn, `THREE.Fog` và nền. Màu nền dựng từ bảng màu thương hiệu bằng độ lệch HSL chứ không phải danh sách mã màu rời, nên cả hai giao diện luôn đồng bộ.

Nền là một quad toàn màn hình. Sáu lớp môi trường nằm chung một fragment shader và bật tắt bằng trọng số uniform tính từ tiến độ cuộn, nên nhánh `if` không phân kỳ giữa các pixel và không tốn thêm draw call. Bụi khí quyển là một `Points` đổi hành vi theo chương ngay trong vertex shader, CPU không đụng tới từng hạt. Viền sáng trên kim loại được thêm vào `MeshStandardMaterial` qua `onBeforeCompile`; không dùng postprocessing và không tạo render target.

Giới hạn DPR 1.25 và dùng hệ đèn trực tiếp để giảm shader/render-target. Dùng render theo yêu cầu khi dừng, giảm motion hoặc tab ẩn. Dưới 700px giảm số hạt bụi còn một nửa, bớt một tầng nhiễu khí quyển, hạ trọng số lưới và đường mạng, đồng thời lùi camera và mở FOV để khung hình vừa màn hình dọc.

Three.js được khóa ở r162 để hỗ trợ cả WebGL 1 và WebGL 2. Canvas tự chọn context phù hợp; nếu WebGL thực sự không khả dụng hoặc context bị mất, giao diện dùng một hình thái CSS thay thế thay vì để trống màn hình, và tự khôi phục khi context quay lại.

Tiến độ chương được tính từ vị trí thật của từng section thay vì giả định mọi section cao bằng nhau, nên khối 3D khớp với nội dung trên cả mobile và màn hình thấp.

- `src/chapters.js`: nội dung tám chương.
- `src/main.jsx`: bố cục, điều khiển, bàn phím, ScrollTrigger và hệ chuyển cảnh không gian.
- `src/artwork.jsx`: tám tác phẩm SVG và cung màu `ARC` dùng chung cho cả trang.
- `src/Stage.jsx`: bố cục biên tập, ba mặt phẳng chiều sâu và màn che đọc của tám chương.
- `src/Scene.jsx`: hình học, vật liệu, bảng trạng thái cảnh, camera, ánh sáng, sương, nền và bụi.
- `src/style.css`: responsive, màu và lớp hiển thị (world và sân khấu 1, nội dung và lớp phim 2, header 3, điều khiển 4, skip link 6, dialog top layer).
- `references/repos`: 12 repo tham khảo, không đưa vào bundle. Manifest commit ở `references/repositories.json`.

Xem `VERIFICATION.md` để biết phạm vi kiểm thử và giới hạn.
