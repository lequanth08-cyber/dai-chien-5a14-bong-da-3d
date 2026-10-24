# Đại Chiến 5A1.4 – Bóng đá 3D

Game bóng đá 5 đấu 5 chạy trên trình duyệt, đồ họa 3D, làm cho học sinh lớp 5. Hai đội là hai lớp 5A1.4 và 5A2.4, chọn nhân vật ở sảnh chờ, chơi được trên máy tính và iPhone cầm ngang.

**Chơi trên mạng:** https://bongda.22.id.vn

## Đội hình

| Lớp 5A1.4 | Lớp 5A2.4 |
|---|---|
| Nho (thủ môn) | Thiện Nhân (thủ môn) |
| Quốc Bảo, Vinh Nhật (hậu vệ) | Quang Minh, Thiên (hậu vệ) |
| Ebuka, Cacao (tiền đạo) | Hiếu, Nhật Nam (tiền đạo) |

Mỗi cầu thủ có 6 chỉ số: Tốc độ, Sút, Phòng thủ, Chuyền, Rê bóng, Thể lực. Chuyền làm bóng đi nhanh và đón đúng hướng chạy; Rê bóng giúp giữ bóng chạy nhanh hơn, khó bị tắc hơn và lách hồi nhanh hơn; Thể lực làm thanh Thức tỉnh đầy nhanh hơn và tắc bóng hồi nhanh hơn.

## Cửa hàng

Sau mỗi trận bạn nhận xu (thắng 40, hòa 15, thi đấu 5, mỗi bàn 10, mỗi kiến tạo 5, MVP 20). Xu chỉ kiếm được bằng cách chơi, không mua bằng tiền thật. Ở sảnh chờ bấm **Cửa hàng** để:

- Mua chiêu (phím Q, nút CHIÊU): 10 chiêu như Sút Sấm Sét, Xoáy Cong, Sút Xuyên Phá, Tăng Tốc, Lướt Gió, Khiên Sắt, Bàn Tay Thép, Nam Châm, Đóng Băng, Bóng Ma. Mỗi bạn luôn có sẵn chiêu riêng của mình.
- Mua kiểu Thức tỉnh (phím F, nút THỨC TỈNH), 13 kiểu: Bão Lửa (có sẵn), Băng Giá, Lốc Xoáy, Tia Chớp, Xe Đạp Chổng Ngược (mọi cú sút thành móc bóng lộn nhào), Rainbow (phím Cách hất cầu vồng qua đầu rồi bóng rơi lại chân), Vô-lê Trên Không (sút được bóng đang bay cao), Xoáy Góc Xa (tự ngắm góc xa và xoáy), Mu Bàn Chân (sút căng không cần gồng), La Croqueta và Elastico (phím R thành động tác qua người làm hậu vệ đứng hình), Đỡ Bóng Biến Hướng (nhận bóng là vọt đi ngay), Đỡ Bóng Siêu Cấp (bóng dính chân, không ai tắc được).

Tắc bóng (Shift hoặc nút TẮC) trượt dài khoảng 7 m, chỉnh ở `GIAY_TRUOT_TAC` và `TOC_TRUOT_TAC`.
- **Thử vận may** (15 xu): luôn nhận một chiêu mới chưa có, không bao giờ trượt. Khi đã có đủ chiêu, nút này chọn ngẫu nhiên một chiêu để dùng, miễn phí.

Giá và phần thưởng chỉnh ở `CHIEU_KHO`, `THUC_TINH_KHO`, `XU_THUONG` trong `nguon/a_dung3d.js`.

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
