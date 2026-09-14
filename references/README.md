# Thư viện tham khảo LIMEN

Khảo sát ngày 13/09/2026. Mã nguồn upstream nằm trong `repos/`, giữ nguyên giấy phép từng dự án. Không chạy script từ các repo tham khảo.

| Repository | Vai trò trong LIMEN |
| --- | --- |
| [three.js](https://github.com/mrdoob/three.js) | Runtime dựng hình, vật liệu kim loại, instancing |
| [drei](https://github.com/pmndrs/drei) | Runtime OrbitControls, Environment và Lightformer |
| [GSAP](https://github.com/greensock/GSAP) | Runtime chuyển tác phẩm và chữ |
| [Animate.css](https://github.com/animate-css/animate.css) | Thư viện hiệu ứng CSS tham khảo, chỉ nhập module nhỏ |
| [Vanta](https://github.com/tengbao/vanta) | Tham khảo nền WebGL tương tác; không khởi tạo thêm renderer |
| [3D developer portfolio](https://github.com/adrianhajdin/project_3D_developer_portfolio) | Tham khảo tổ chức React và canvas 3D |
| [img2threejs](https://github.com/img2threejs/img2threejs) | Tham khảo hướng hình học procedural; tác phẩm hiện tại do dự án tự tạo |
| [A-Frame](https://github.com/aframevr/aframe) | Lưu cho hướng phát triển WebXR |
| [diagram-design](https://github.com/cathrynlavery/diagram-design) | Lưu cho thiết kế sơ đồ biên tập |
| [Hyperframes](https://github.com/heygen-com/hyperframes) | Lưu cho khả năng xuất video HTML trong tương lai |
| [Trois](https://github.com/troisjs/trois) | Lưu cho nghiên cứu phiên bản Vue; không trộn Vue vào React |
| [GSAP skills](https://github.com/greensock/gsap-skills) | Tài liệu animation chính thức để tra cứu |

## Nghiên cứu thiết kế

- [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/): danh mục có Lusion v3 và Igloo Inc.
- [Lusion](https://lusion.co/): đã xem trang và ảnh chụp trình duyệt; dùng nội dung 3D cỡ lớn, điều hướng ít và bố cục chữ bất đối xứng. LIMEN áp dụng nguyên tắc tập trung vào vật thể, không sao chép tài sản của website.
- [Igloo Inc.](https://www.igloo.inc/): URL truy cập được nhưng công cụ trích xuất không trả nội dung; không dùng làm căn cứ cho mô tả kỹ thuật.

## Quyết định triển khai

Một canvas, không ảnh stock hoặc HDR tải từ CDN, không tài khoản hay API key. Ánh sáng studio được tạo cục bộ bằng Lightformer. Continuum dùng 180 instance chung geometry/material để hạn chế draw call. React Three Fiber 9 dùng React 19.2 vì peer dependency của phiên bản hiện tại không nhận React 19.3. Các framework thay thế được lưu tham khảo thay vì đưa cùng lúc vào bundle.

Giấy phép upstream vẫn áp dụng dù mục đích triển lãm phi thương mại. Không tuyên bố toàn bộ các thư viện có chung giấy phép.
