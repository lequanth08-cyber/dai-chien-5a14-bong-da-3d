# Đại Chiến 5A1.4 – Bóng đá 3D

Game bóng đá 5 đấu 5 chạy trên trình duyệt, đồ họa 3D, làm cho học sinh lớp 5. Hai đội là hai lớp 5A1.4 và 5A2.4, chọn nhân vật ở sảnh chờ, chơi được trên máy tính và iPhone cầm ngang.

**Chơi trên mạng:** https://bongda.22.id.vn

## Đội hình

| Lớp 5A1.4 | Lớp 5A2.4 |
|---|---|
| Quốc Bảo (thủ môn) | Thiện Nhân (thủ môn) |
| Vinh Nhật (hậu vệ) | Quang Minh, Thiên (hậu vệ) |
| Ebuka, Nho, Cacao (tiền đạo) | Hiếu, Nhật Nam (tiền đạo) |

Mỗi cầu thủ có 6 chỉ số: Tốc độ, Sút, Phòng thủ, Chuyền, Rê bóng, Thể lực. Chuyền làm bóng đi nhanh và đón đúng hướng chạy; Rê bóng giúp giữ bóng chạy nhanh hơn, khó bị tắc hơn và lách hồi nhanh hơn; Thể lực làm thanh Thức tỉnh đầy nhanh hơn và tắc bóng hồi nhanh hơn.

**Chơi ngay:** mở file `ego3d.html` bằng trình duyệt. Không cần cài đặt, không cần mạng, vì thư viện three.js đã nhúng sẵn trong file.

## Cách chơi

| Máy tính | Điện thoại |
|---|---|
| WASD hoặc mũi tên: chạy | Kéo ngón tay nửa trái màn hình: chạy |
| Giữ chuột trái rồi thả: sút | Giữ nút SÚT rồi thả |
| Chuột phải: chuyền | Nút CHUYỀN |
| Shift: tắc bóng | Nút TẮC |
| Q: chiêu riêng, F: Thức tỉnh | Nút CHIÊU, THỨC TỈNH |
| Cách: hất bóng, R: lách, T: xoay người, Esc: tạm dừng | Nút LÁCH |

Trên iPhone, bấm Chia sẻ rồi chọn "Thêm vào Màn hình chính" để chơi toàn màn hình.

## Sửa game

Mã nguồn nằm trong thư mục `nguon/`. Muốn đổi chỉ số nhân vật, tên, màu tóc, tốc độ, độ khó thì sửa các hằng số ở đầu `nguon/a_dung3d.js`, rồi ghép lại:

```bash
cd nguon
node build.js
```

Lệnh trên tạo lại `ego3d.html` ở thư mục ngoài. Muốn xem thử qua máy chủ nhỏ trên cổng 5612:

```bash
node nguon/serve.mjs
```

| Tệp | Nội dung |
|---|---|
| `khung.html` | Giao diện (sảnh chờ, HUD, nút cảm ứng) |
| `a_dung3d.js` | Hằng số, danh sách nhân vật, sân, khán đài, hiệu ứng, âm thanh |
| `b_nhanvat.js` | Mô hình nhân vật, quả bóng, hoạt hình |
| `c_luatchoi.js` | Luật chơi, máy điều khiển, sảnh chờ, ghép trận, replay, kết quả |
| `d_anh.js` | Ảnh khuôn mặt Nho, Cacao, Ebuka (nhúng dạng base64) |
| `three.min.js` | Thư viện three.js r128 (giấy phép MIT) |

## Lưu ý về ảnh

Các tệp `nguon/d_anh.js`, `nguon/mat_*.jpg` và `ego3d.html` chứa ảnh khuôn mặt thật của các bạn học sinh. Chỉ để kho này ở chế độ riêng tư (private) và không chia sẻ ra ngoài khi chưa được gia đình đồng ý. Muốn chia sẻ công khai, hãy xóa ảnh trong `d_anh.js` (đặt `nv.anh` thành `false` cho các nhân vật trong `a_dung3d.js`) rồi build lại.

## Chưa có

Luân lưu, giải đấu nhiều trận, chơi online thật. Các bạn "vào phòng" ở sảnh chờ là giả lập. Chưa thử trên iPhone thật.
