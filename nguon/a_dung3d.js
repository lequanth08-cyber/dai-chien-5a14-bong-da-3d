"use strict";
/* =====================================================================
   ĐẠI CHIẾN 5A1.4 – Bóng đá 3D 3 đấu 3 (kiểu Unmatched Ego 2)
   Một file HTML duy nhất. Dùng thư viện three.js (đã nhúng sẵn, không cần mạng).
   Mẹo cho bạn nhỏ: cứ thay các số ở phần HẰNG SỐ rồi tải lại trang để xem game đổi thế nào!
   ===================================================================== */

// ===================== HẰNG SỐ DỄ SỬA =====================
const SAN_DAI = 42;          // nửa chiều dài sân (mét): sân dài 84m (to hơn bản trước)
const SAN_RONG = 25;         // nửa chiều rộng sân: sân rộng 50m
const KHUNG_RONG = 5;        // nửa bề rộng khung thành
const KHUNG_CAO = 2.8;       // chiều cao khung thành
const KHUNG_SAU = 2.6;       // độ sâu của lưới
const BONG_R = 0.4;          // bán kính quả bóng
const TRONG_LUC = 15;        // trọng lực kéo bóng xuống
const TOC_DO_CO_BAN = 9;     // tốc độ chạy cơ bản (mét/giây)
const LUC_SUT_NHO = 17;      // lực sút khi chỉ bấm nhẹ
const LUC_SUT_LON = 38;      // lực sút khi giữ đủ lâu
const GIAY_GONG = 0.9;       // giữ chuột bao lâu thì đủ lực
const GIAY_HOI_CHIEU = 12;   // chiêu đặc trưng hồi lại sau bao nhiêu giây
const GIAY_THUC_TINH = 6;    // thời gian Thức tỉnh kéo dài
const CHAM_LAI_GIAY = 0.45;  // thời gian quay chậm khi sút mạnh
const NGHI_MAT_PHUT = 15;    // sau bao nhiêu phút chơi thì nhắc nghỉ mắt
const LIM_X = SAN_DAI - 0.8;  // cầu thủ không chạy quá giới hạn này (dọc)
const LIM_Z = SAN_RONG - 0.8; // (ngang)
const GK_X = SAN_DAI - 2.6;   // thủ môn đứng cách khung thành bao xa
const HE_SAN = SAN_DAI / 30;  // hệ số phóng to khoảng cách so với bản sân nhỏ
const SO_CHON = 6;            // 6 bạn đầu trong danh sách được chọn ở sảnh chờ
const MUC_KHO = {            // máy chơi giỏi hay dở (Dễ là mức mặc định, rất dễ thắng)
  de:  { phanUng: 0.4,  saiSut: 0.8,  cuopBong: 0.14, thuMonLoi: 0.62, toc: 0.72, banSut: 0.6 },
  vua: { phanUng: 0.26, saiSut: 0.42, cuopBong: 0.4,  thuMonLoi: 0.42, toc: 0.88, banSut: 0.8 },
  kho: { phanUng: 0.18, saiSut: 0.25, cuopBong: 0.65, thuMonLoi: 0.3,  toc: 0.95, banSut: 0.9 }
};
const MAU_GIAY = ['#ffffff', '#ffd23a', '#2de08a', '#ff5ac8'];

// ===================== CỬA HÀNG (xu kiếm được khi chơi, không dùng tiền thật) =====================
const XU_BAN_DAU = 60;                                             // xu có sẵn khi chơi lần đầu
const XU_THUONG = { ban: 10, kienTao: 5, thang: 40, hoa: 15, thua: 5, mvp: 20 };   // thưởng sau mỗi trận
const GIA_NGAU_NHIEN = 30;                                         // giá "Thử vận may": luôn nhận một chiêu mới chưa có
// 10 chiêu bấm Q. Mỗi bạn có sẵn chiêu riêng của mình (không mất xu), muốn chiêu khác thì mua ở cửa hàng.
const CHIEU_KHO = [
  { ma: 'sam', icon: '⚡', ten: 'Sút Sấm Sét', mt: 'Cú sút kế tiếp cực mạnh, có tia chớp xanh.', gia: 60 },
  { ma: 'cong', icon: '🌈', ten: 'Xoáy Cong', mt: 'Cú sút kế tiếp bay cong như cầu vồng.', gia: 50 },
  { ma: 'xuyen', icon: '🎯', ten: 'Sút Xuyên Phá', mt: 'Cú sút kế tiếp xuyên qua mọi hậu vệ, chỉ thủ môn chạm được.', gia: 90 },
  { ma: 'toc', icon: '👟', ten: 'Tăng Tốc', mt: 'Chạy nhanh hơn rất nhiều trong 4 giây.', gia: 50 },
  { ma: 'luot', icon: '💨', ten: 'Lướt Gió', mt: 'Lao vọt về phía trước, xuyên qua mọi người.', gia: 60 },
  { ma: 'khien', icon: '🛡', ten: 'Khiên Sắt', mt: 'Không bị tắc bóng và đẩy lùi đối thủ xung quanh.', gia: 70 },
  { ma: 'tay', icon: '🧤', ten: 'Bàn Tay Thép', mt: 'Tay dài gấp đôi và chạy nhanh hơn trong 4 giây (hợp với thủ môn).', gia: 40 },
  { ma: 'nam', icon: '🧲', ten: 'Nam Châm', mt: 'Trong 4 giây, bóng ở gần tự lăn về chân bạn.', gia: 80 },
  { ma: 'dongbang', icon: '❄', ten: 'Đóng Băng', mt: 'Mọi đối thủ quanh bạn đứng im 2 giây.', gia: 100 },
  { ma: 'ma', icon: '👻', ten: 'Bóng Ma', mt: 'Trong 3 giây đối thủ không tắc được bạn và không đuổi theo bạn.', gia: 110 }
];
// 4 kiểu Thức tỉnh (bấm F khi thanh năng lượng đầy). "lua" có sẵn.
const THUC_TINH_KHO = [
  { ma: 'lua', icon: '🔥', ten: 'Bão Lửa', mt: 'Chạy nhanh hơn, mọi cú sút đều là Siêu sút bốc lửa.', gia: 0 },
  { ma: 'bang', icon: '🧊', ten: 'Băng Giá', mt: 'Đối thủ đến gần bị chậm đi một nửa, không ai tắc được bạn, sút vẫn là Siêu sút.', gia: 160 },
  { ma: 'loc', icon: '🌪', ten: 'Lốc Xoáy', mt: 'Siêu sút bay cong dữ dội, rất khó bắt.', gia: 150 },
  { ma: 'chop', icon: '💫', ten: 'Tia Chớp', mt: 'Chạy nhanh gấp rưỡi và lách liên tục không cần chờ hồi.', gia: 200 }
];

// 10 cầu thủ của hai lớp. 6 bạn đầu chọn được ở sảnh chờ, 4 bạn còn lại do máy điều khiển.
// vt: tm = thủ môn, hv = hậu vệ, tdao = tiền đạo. Muốn sửa chỉ số, tên, màu tóc... cứ sửa ở đây.
// 6 chỉ số (1-10): toc = Tốc độ, sut = Sút, pn = Phòng thủ, chuyen = Chuyền, re = Rê bóng, the = Thể lực
const NHAN_VAT = [
  { id: 'ebuka', ten: 'Ebuka', lop: '5A1.4', vai: 'Tiền đạo · Đội trưởng', vt: 'tdao', so: 10, toc: 9, sut: 9, pn: 6, chuyen: 8, re: 9, the: 9, da: 0xb98660, mauToc: 0x0e0e12, kieuToc: 'tron', mau: '#ff7a3a', anh: true, anhDa: 0x8e5d3e,
    mota: 'Đội trưởng toàn diện: chạy nhanh, rê bóng khéo và sút rất căng. Ngôi sao của lớp 5A1.4!',
    chieu: { ma: 'sam', ten: 'Sút Sấm Sét', mt: 'Cú sút kế tiếp cực mạnh, có tia chớp xanh.' } },
  { id: 'nho', ten: 'Nho', lop: '5A1.4', vai: 'Thủ môn', vt: 'tm', so: 1, toc: 6, sut: 5, pn: 9, chuyen: 7, re: 4, the: 8, da: 0xefc8a2, mauToc: 0x15151a, kieuToc: 'tron', mau: '#9a5cff', anh: true, anhDa: 0xdcae8a,
    mota: 'Thủ môn bình tĩnh, bắt bóng chắc tay và luôn động viên cả đội.',
    chieu: { ma: 'tay', ten: 'Bàn Tay Thép', mt: 'Tay dài gấp đôi và chạy nhanh hơn trong 4 giây.' } },
  { id: 'quocbao', ten: 'Quốc Bảo', lop: '5A1.4', vai: 'Hậu vệ', vt: 'hv', so: 4, toc: 6, sut: 6, pn: 9, chuyen: 7, re: 5, the: 8, da: 0xf6d3b5, mauToc: 0x101014, kieuToc: 'maibang', mau: '#3a8bff',
    mota: 'Hậu vệ vững như bức tường, ít ai qua được cậu ấy.',
    chieu: { ma: 'khien', ten: 'Khiên Sắt', mt: 'Không bị tắc bóng và đẩy lùi đối thủ xung quanh.' } },
  { id: 'hieu', ten: 'Hiếu', lop: '5A2.4', vai: 'Tiền đạo', vt: 'tdao', so: 8, toc: 8, sut: 7, pn: 6, chuyen: 8, re: 8, the: 9, da: 0xd9a273, mauToc: 0x2a1a0e, kieuToc: 'xoan', mau: '#25c47a',
    mota: 'Tiền đạo chạy không biết mệt, rê bóng rất khéo. Chọn Hiếu bạn sẽ đá cho lớp 5A2.4.',
    chieu: { ma: 'toc', ten: 'Tăng Tốc', mt: 'Chạy nhanh hơn rất nhiều trong 4 giây.' } },
  { id: 'vinhnhat', ten: 'Vinh Nhật', lop: '5A1.4', vai: 'Hậu vệ', vt: 'hv', so: 6, toc: 7, sut: 7, pn: 8, chuyen: 8, re: 6, the: 7, da: 0xedc09a, mauToc: 0x4a2a16, kieuToc: 'renguoi', mau: '#ffb02e',
    mota: 'Hậu vệ thông minh, chuyền chuẩn và hay đá những quả bóng xoáy đẹp mắt.',
    chieu: { ma: 'cong', ten: 'Xoáy Cong', mt: 'Cú sút kế tiếp bay cong như cầu vồng.' } },
  { id: 'cacao', ten: 'Cacao', lop: '5A1.4', vai: 'Tiền đạo', vt: 'tdao', so: 7, toc: 9, sut: 8, pn: 4, chuyen: 6, re: 9, the: 7, da: 0xe6b58e, mauToc: 0x120c06, kieuToc: 'tron', mau: '#ff5a9a', anh: true, anhDa: 0xd9a47c,
    mota: 'Tiền đạo nhanh như gió, thích lướt qua hàng thủ đối phương.',
    chieu: { ma: 'luot', ten: 'Lướt Gió', mt: 'Lao vọt về phía trước, xuyên qua mọi người.' } },
  { id: 'natnam', ten: 'Nhật Nam', lop: '5A2.4', vai: 'Tiền đạo', vt: 'tdao', so: 9, toc: 7, sut: 7, pn: 5, chuyen: 6, re: 7, the: 7, da: 0xf2cba5, mauToc: 0x20140c, kieuToc: 'tron', mau: '#38c6d9',
    mota: '', chieu: { ma: 'luot', ten: 'Lướt Gió', mt: '' } },
  { id: 'quangminh', ten: 'Quang Minh', lop: '5A2.4', vai: 'Hậu vệ', vt: 'hv', so: 5, toc: 6, sut: 5, pn: 8, chuyen: 6, re: 5, the: 7, da: 0xe4b48c, mauToc: 0x181818, kieuToc: 'maibang', mau: '#e0c040',
    mota: '', chieu: { ma: 'khien', ten: 'Khiên Sắt', mt: '' } },
  { id: 'thien', ten: 'Thiên', lop: '5A2.4', vai: 'Hậu vệ', vt: 'hv', so: 3, toc: 7, sut: 5, pn: 7, chuyen: 7, re: 6, the: 8, da: 0xeec29b, mauToc: 0x2b1a10, kieuToc: 'nhon', mau: '#8a7bff',
    mota: '', chieu: { ma: 'toc', ten: 'Tăng Tốc', mt: '' } },
  { id: 'thiennhan', ten: 'Thiện Nhân', lop: '5A2.4', vai: 'Thủ môn', vt: 'tm', so: 12, toc: 5, sut: 4, pn: 8, chuyen: 6, re: 4, the: 7, da: 0xf0c49d, mauToc: 0x111111, kieuToc: 'renguoi', mau: '#ff8a5a',
    mota: '', chieu: { ma: 'tay', ten: 'Bàn Tay Thép', mt: '' } }
];
// Hai đội, mỗi đội 5 cầu thủ (số là vị trí trong danh sách NHAN_VAT ở trên)
const DOI_LOP = { '5A1.4': [1, 2, 4, 0, 5], '5A2.4': [9, 7, 8, 3, 6] };   // 5A1.4: thủ môn Nho, hậu vệ Quốc Bảo + Vinh Nhật, tiền đạo Ebuka + Cacao

// ===================== KHỞI TẠO THREE =====================
const canvas = document.getElementById('c');
const CAM_UNG = (window.matchMedia && matchMedia('(pointer:coarse)').matches);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !CAM_UNG, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CAM_UNG ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070d2a);
scene.fog = new THREE.Fog(0x070d2a, 100, 280);
const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 400);
const $ = (id) => document.getElementById(id);

function canvasTex(w, h, ve, lap) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  ve(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  if (lap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
function ngauNhien(a, b) { return a + Math.random() * (b - a); }
function kep(v, a, b) { return v < a ? a : v > b ? b : v; }
function noi(a, b, t) { return a + (b - a) * t; }
function gocChenh(a, b) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

// ===================== ÁNH SÁNG =====================
scene.add(new THREE.HemisphereLight(0xbcd2ff, 0x2a4a2a, 0.85));
const anhMat = new THREE.DirectionalLight(0xfff4e0, 0.95);
anhMat.position.set(18, 40, 16);
anhMat.castShadow = true;
anhMat.shadow.mapSize.set(CAM_UNG ? 1024 : 2048, CAM_UNG ? 1024 : 2048);
anhMat.shadow.camera.left = -26; anhMat.shadow.camera.right = 26;
anhMat.shadow.camera.top = 26; anhMat.shadow.camera.bottom = -26;
anhMat.shadow.camera.near = 5; anhMat.shadow.camera.far = 90;
anhMat.shadow.bias = -0.0006;
scene.add(anhMat); scene.add(anhMat.target);
const anhPhu = new THREE.DirectionalLight(0x9ec8ff, 0.4);   // đèn phụ lạnh từ phía sau cho nhân vật có viền sáng
anhPhu.position.set(-30, 22, -20); scene.add(anhPhu);

// ===================== SÂN CỎ =====================
function taoSan() {
  const PX = 14, MX = 10, MZ = 8;                       // MX, MZ = lề cỏ nằm ngoài vạch
  const WM = 2 * (SAN_DAI + MX), HM = 2 * (SAN_RONG + MZ);
  const tex = canvasTex(WM * PX, HM * PX, (g, W, H) => {
    const X = (x) => (x + SAN_DAI + MX) * PX, Z = (z) => (z + SAN_RONG + MZ) * PX;
    g.fillStyle = '#1f6b2c'; g.fillRect(0, 0, W, H);
    const nSoc = 14, rs = 2 * SAN_DAI / nSoc;
    for (let i = 0; i < nSoc; i++) {                    // sọc cỏ sáng tối
      g.fillStyle = i % 2 ? '#2a8238' : '#237531';
      g.fillRect(X(-SAN_DAI + i * rs), Z(-SAN_RONG), rs * PX + 1, 2 * SAN_RONG * PX);
    }
    g.fillStyle = '#17501f';                            // viền ngoài tối hơn
    g.fillRect(0, 0, W, Z(-SAN_RONG)); g.fillRect(0, Z(SAN_RONG), W, H - Z(SAN_RONG));
    g.fillRect(0, 0, X(-SAN_DAI), H); g.fillRect(X(SAN_DAI), 0, W - X(SAN_DAI), H);
    g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.strokeRect(X(-SAN_DAI), Z(-SAN_RONG), 2 * SAN_DAI * PX, 2 * SAN_RONG * PX);
    g.beginPath(); g.moveTo(X(0), Z(-SAN_RONG)); g.lineTo(X(0), Z(SAN_RONG)); g.stroke();
    g.beginPath(); g.arc(X(0), Z(0), 6 * PX, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(X(0), Z(0), 5, 0, 7); g.fill();
    for (const s of [-1, 1]) {
      const x0 = s * SAN_DAI;
      g.strokeRect(s < 0 ? X(x0) : X(x0 - 9), Z(-11), 9 * PX, 22 * PX);          // vòng cấm
      g.strokeRect(s < 0 ? X(x0) : X(x0 - 3.5), Z(-6), 3.5 * PX, 12 * PX);       // khu 5m
      g.beginPath(); g.arc(X(s * (SAN_DAI - 7)), Z(0), 5, 0, 7); g.fill();       // chấm phạt đền
      g.beginPath(); g.arc(X(s * (SAN_DAI - 7)), Z(0), 5 * PX, s < 0 ? -0.9 : Math.PI - 0.9, s < 0 ? 0.9 : Math.PI + 0.9); g.stroke();
    }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(WM, HM), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  scene.add(m);
  const nen = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x0d1630, roughness: 1 }));
  nen.rotation.x = -Math.PI / 2; nen.position.y = -0.05; scene.add(nen);
}

// ===================== BIỂN QUẢNG CÁO =====================
function taoBang() {
  const tex = canvasTex(1024, 64, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#0a2a8a'); gr.addColorStop(.5, '#1558e0'); gr.addColorStop(1, '#0a2a8a');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.font = 'italic 900 40px Arial'; g.textBaseline = 'middle';
    g.fillText('LỚP 5A1.4   ★   ĐẠI CHIẾN BÓNG ĐÁ   ★   CỐ LÊN!   ★', 20, 34);
    g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
  }, true);
  tex.repeat.set(2, 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const them = (w, x, z, ry) => {
    const t2 = tex.clone(); t2.needsUpdate = true; t2.repeat.set(w / 30, 1);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, 0.25), new THREE.MeshBasicMaterial({ map: t2 }));
    b.position.set(x, 0.5, z); b.rotation.y = ry; scene.add(b);
  };
  them(2 * SAN_DAI + 1, 0, -SAN_RONG - 0.6, 0);
  them(2 * SAN_DAI + 1, 0, SAN_RONG + 0.6, 0);
  const seg = SAN_RONG - KHUNG_RONG - 0.6;
  for (const s of [-1, 1]) for (const t of [-1, 1]) them(seg, s * (SAN_DAI + 0.6), t * (KHUNG_RONG + 0.6 + seg / 2), Math.PI / 2);
}

// ===================== KHUNG THÀNH + LƯỚI =====================
const luoiList = [];
function taoKhungThanh(s) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xf2f6ff, roughness: 0.3, metalness: 0.4 });
  const cot = (z) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, KHUNG_CAO, 12), mat); c.position.set(0, KHUNG_CAO / 2, z); c.castShadow = true; g.add(c); };
  cot(-KHUNG_RONG); cot(KHUNG_RONG);
  const xa = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, KHUNG_RONG * 2 + 0.22, 12), mat);
  xa.rotation.x = Math.PI / 2; xa.position.set(0, KHUNG_CAO, 0); xa.castShadow = true; g.add(xa);
  const luoiTex = canvasTex(128, 128, (c) => {
    c.clearRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3;
    c.strokeRect(0, 0, 128, 128);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(128, 128); c.moveTo(128, 0); c.lineTo(0, 128); c.lineWidth = 1.6; c.stroke();
  }, true);
  const mk = (w, h, px, py, pz, ry, rx) => {
    const t = luoiTex.clone(); t.needsUpdate = true; t.repeat.set(w / 0.5, h / 0.5);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.9 }));
    m.position.set(px, py, pz); m.rotation.y = ry || 0; m.rotation.x = rx || 0; g.add(m); return m;
  };
  const sau = mk(KHUNG_RONG * 2, KHUNG_CAO, KHUNG_SAU, KHUNG_CAO / 2, 0, Math.PI / 2);
  mk(KHUNG_SAU, KHUNG_CAO, KHUNG_SAU / 2, KHUNG_CAO / 2, -KHUNG_RONG, 0);
  mk(KHUNG_SAU, KHUNG_CAO, KHUNG_SAU / 2, KHUNG_CAO / 2, KHUNG_RONG, 0);
  mk(KHUNG_SAU, KHUNG_RONG * 2, KHUNG_SAU / 2, KHUNG_CAO, 0, 0, Math.PI / 2);
  g.position.x = s * SAN_DAI; if (s < 0) g.rotation.y = Math.PI;
  scene.add(g);
  luoiList.push({ sau, g, s, rung: 0 });
}

// ===================== KHÁN ĐÀI + ĐÈN PHA + BẦU TRỜI =====================
let dongNguoi = null; const nguoiXem = [];
function taoKhanDai() {
  const mauKhan = new THREE.MeshStandardMaterial({ color: 0x1b2447, roughness: 0.9 });
  const mauMep = new THREE.MeshStandardMaterial({ color: 0x2c3a6e, roughness: 0.8 });
  const bac = (cx, cz, dai, huong) => {   // 4 tầng khán đài
    for (let i = 0; i < 4; i++) {
      const cao = 1.3 * (i + 1), sau = 3;
      const b = new THREE.Mesh(new THREE.BoxGeometry(huong === 'x' ? dai : sau, cao, huong === 'x' ? sau : dai), i % 2 ? mauKhan : mauMep);
      const off = 1 + i * sau + sau / 2;
      b.position.set(huong === 'x' ? cx : cx + Math.sign(cx) * off, cao / 2, huong === 'x' ? cz + Math.sign(cz) * off : cz);
      b.receiveShadow = true; scene.add(b);
    }
  };
  bac(0, SAN_RONG + 1.2, 2 * SAN_DAI + 26, 'x'); bac(0, -SAN_RONG - 1.2, 2 * SAN_DAI + 26, 'x');
  bac(SAN_DAI + 3, 0, 2 * SAN_RONG + 12, 'z'); bac(-SAN_DAI - 3, 0, 2 * SAN_RONG + 12, 'z');
  // khán giả bằng InstancedMesh
  const mauAo = [0xff5a5a, 0x4aa0ff, 0xffd23a, 0x5aff9a, 0xffffff, 0xff8ad8, 0xff9a3a];
  const toa = [];
  for (let i = 0; i < 4; i++) {
    const cao = 1.3 * (i + 1), off = 1 + i * 3 + 1.5;
    for (let k = -(SAN_DAI + 12); k <= SAN_DAI + 12; k += 1.25) {
      toa.push([k, cao, SAN_RONG + 1.2 + off - 0.4]);
      toa.push([k + .6, cao, -(SAN_RONG + 1.2 + off - 0.4)]);
    }
    for (let k = -(SAN_RONG + 4); k <= SAN_RONG + 4; k += 1.25) {
      toa.push([SAN_DAI + 3 + off - 0.4, cao, k]); toa.push([-(SAN_DAI + 3 + off - 0.4), cao, k + .6]);
    }
  }
  const nm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.95, 0.45), new THREE.MeshStandardMaterial({ roughness: 0.8 }), toa.length);
  const mau = new THREE.Color();
  toa.forEach((p, i) => {
    mau.setHex(mauAo[(Math.random() * mauAo.length) | 0]).multiplyScalar(ngauNhien(0.55, 1));
    nm.setColorAt(i, mau); nguoiXem.push({ x: p[0], y: p[1] + 0.5, z: p[2], pha: Math.random() * 6.28 });
  });
  nm.instanceColor.needsUpdate = true; dongNguoi = nm; scene.add(nm);
  // đèn pha 4 góc
  const tru = new THREE.MeshStandardMaterial({ color: 0x555d77, roughness: 0.6 });
  const den = new THREE.MeshBasicMaterial({ color: 0xfffbe8 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 26, 8), tru); t.position.set(sx * (SAN_DAI + 16), 13, sz * (SAN_RONG + 12)); scene.add(t);
    const bangDen = new THREE.Mesh(new THREE.BoxGeometry(7, 3.4, 0.5), den);
    bangDen.position.set(sx * (SAN_DAI + 16), 27, sz * (SAN_RONG + 12)); bangDen.lookAt(0, 8, 0); scene.add(bangDen);
    const quang = new THREE.Sprite(new THREE.SpriteMaterial({ map: texTron, color: 0xfff2c0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.75 }));
    quang.scale.set(20, 20, 1); quang.position.copy(bangDen.position); scene.add(quang);
    // chùm sáng mờ từ đèn pha rọi xuống sân
    const dich = new THREE.Vector3(sx * 8, 0, sz * 5), huong = dich.clone().sub(bangDen.position), dai = huong.length(); huong.normalize();
    const chum = new THREE.Mesh(new THREE.ConeGeometry(15, dai, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    chum.position.copy(bangDen.position).addScaledVector(huong, dai / 2);
    chum.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), huong); scene.add(chum);
  }
  // bầu trời có sao
  const sky = new THREE.Mesh(new THREE.SphereGeometry(220, 24, 12), new THREE.MeshBasicMaterial({
    side: THREE.BackSide, fog: false,
    map: canvasTex(512, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02051a'); gr.addColorStop(.55, '#0c1a4e'); gr.addColorStop(1, '#2a3a86');
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff';
      for (let i = 0; i < 160; i++) { g.globalAlpha = Math.random() * .8; g.fillRect(Math.random() * w, Math.random() * h * .6, 1.5, 1.5); }
    })
  }));
  scene.add(sky);
}
function capNhatDongNguoi(t, soi) {
  if (!dongNguoi) return;
  const m = new THREE.Matrix4();
  for (let i = 0; i < nguoiXem.length; i++) {
    const n = nguoiXem[i];
    m.makeTranslation(n.x, n.y + Math.abs(Math.sin(t * (3 + soi * 5) + n.pha)) * (0.05 + soi * 0.4), n.z);
    dongNguoi.setMatrixAt(i, m);
  }
  dongNguoi.instanceMatrix.needsUpdate = true;
}

// ===================== HẠT SÁNG, VÒNG SÓNG, ÂM THANH =====================
const texTron = canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
});
const texVuong = canvasTex(16, 16, (g) => { g.fillStyle = '#fff'; g.fillRect(2, 2, 12, 12); });
const hatSang = [], hatThuong = [];
function taoHo(so, sang) {
  const ds = sang ? hatSang : hatThuong;
  for (let i = 0; i < so; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sang ? texTron : texVuong, transparent: true, depthWrite: false, blending: sang ? THREE.AdditiveBlending : THREE.NormalBlending }));
    s.visible = false; scene.add(s); ds.push({ s, song: 0, tong: 1, vx: 0, vy: 0, vz: 0, tl: 0, k0: 1, k1: 0 });
  }
}
taoHo(420, true); taoHo(160, false);
let conHatSang = 0, conHatThuong = 0;
// Bắn một hạt. opt: {mau, song, k0, k1, tl (trọng lực), vx,vy,vz, thuong:true là hạt thường (giấy)}
function hat(x, y, z, vx, vy, vz, mau, song, k0, k1, tl, thuong) {
  const ds = thuong ? hatThuong : hatSang;
  for (let t = 0; t < ds.length; t++) {
    const h = ds[thuong ? (conHatThuong = (conHatThuong + 1) % ds.length) : (conHatSang = (conHatSang + 1) % ds.length)];
    if (h.song > 0) continue;
    h.song = h.tong = song; h.vx = vx; h.vy = vy; h.vz = vz; h.tl = tl || 0; h.k0 = k0; h.k1 = k1;
    h.s.position.set(x, y, z); h.s.material.color.set(mau); h.s.visible = true; h.s.scale.set(k0, k0, 1);
    return h;
  }
}
function capNhatHat(dt) {
  for (const ds of [hatSang, hatThuong]) for (const h of ds) {
    if (h.song <= 0) continue;
    h.song -= dt;
    if (h.song <= 0) { h.s.visible = false; continue; }
    h.vy -= h.tl * dt; h.s.position.x += h.vx * dt; h.s.position.y += h.vy * dt; h.s.position.z += h.vz * dt;
    if (h.s.position.y < 0.05 && h.tl > 0) { h.s.position.y = 0.05; h.vy *= -0.3; h.vx *= .7; h.vz *= .7; }
    const u = 1 - h.song / h.tong, k = noi(h.k0, h.k1, u);
    h.s.scale.set(k, k, 1); h.s.material.opacity = Math.min(1, h.song / h.tong * 1.6);
  }
}
function toaHat(x, y, z, n, mau, v, song, k0, k1, tl) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, b = Math.random() * 3.14 - 0.3, sp = ngauNhien(0.3, 1) * v;
    hat(x, y, z, Math.cos(a) * Math.cos(b) * sp, Math.sin(b) * sp + v * .2, Math.sin(a) * Math.cos(b) * sp, mau, ngauNhien(song * .6, song), k0, k1, tl || 0);
  }
}
const vongList = [];
for (let i = 0; i < 8; i++) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); vongList.push({ m, song: 0, tong: 1, rmax: 1 });
}
let conVong = 0;
function songXungKich(x, y, z, mau, rmax, song) {
  const v = vongList[conVong = (conVong + 1) % vongList.length];
  v.song = v.tong = song || 0.6; v.rmax = rmax; v.m.position.set(x, y, z); v.m.material.color.set(mau); v.m.visible = true;
}
function capNhatVong(dt) {
  for (const v of vongList) {
    if (v.song <= 0) continue; v.song -= dt;
    if (v.song <= 0) { v.m.visible = false; continue; }
    const u = 1 - v.song / v.tong, r = Math.max(0.01, v.rmax * (1 - Math.pow(1 - u, 3)));
    v.m.scale.set(r, r, 1); v.m.material.opacity = (1 - u) * 0.9;
  }
}

// --- Âm thanh bằng Web Audio (không dùng tệp ngoài) ---
let ac = null, nhieuBuf = null, tatAm = false;
try { tatAm = localStorage.getItem('ego3d_tat') === '1'; } catch (e) { }
function moAmThanh() {
  try {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      nhieuBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = nhieuBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}
function nhieu(dur, f0, f1, vol, loai, q, tre) {
  if (!ac || tatAm) return;
  const t = ac.currentTime + (tre || 0), s = ac.createBufferSource(); s.buffer = nhieuBuf; s.loop = true;
  const f = ac.createBiquadFilter(); f.type = loai || 'lowpass'; f.Q.value = q || 1;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.05);
}
function song(f0, f1, dur, vol, loai, tre) {
  if (!ac || tatAm) return;
  const t = ac.currentTime + (tre || 0), o = ac.createOscillator(); o.type = loai || 'sine';
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
function tieng(ten) {
  switch (ten) {
    case 'sut': nhieu(0.14, 1400, 200, 0.5); song(190, 60, 0.12, 0.5); break;
    case 'sutManh': nhieu(0.26, 2400, 150, 0.7); song(150, 40, 0.22, 0.7); nhieu(0.5, 600, 80, 0.3, 'lowpass', 1, 0.05); break;
    case 'chuyen': nhieu(0.1, 900, 200, 0.28); song(220, 120, 0.08, 0.3); break;
    case 'tac': nhieu(0.18, 1800, 300, 0.5, 'bandpass', 1.2); break;
    case 'nay': song(210, 90, 0.07, 0.18); break;
    case 'xa': song(1100, 900, 0.5, 0.35, 'triangle'); song(1650, 1500, 0.4, 0.2, 'triangle'); nhieu(0.1, 5000, 800, 0.3); break;
    case 'cuu': nhieu(0.12, 1000, 200, 0.5); song(120, 70, 0.14, 0.5); break;
    case 'coi': for (let i = 0; i < 3; i++) { song(2850, 2900, 0.18, 0.22, 'sine', i * 0.24); song(2900, 2800, 0.18, 0.1, 'square', i * 0.24); } break;
    case 'coiDai': song(2850, 2900, 0.9, 0.25, 'sine'); song(2900, 2850, 0.9, 0.1, 'square'); break;
    case 'ban': nhieu(1.8, 500, 1500, 0.35, 'bandpass', 0.8); [523, 659, 784, 1046].forEach((f, i) => song(f, f, 0.3, 0.22, 'triangle', 0.1 + i * 0.12)); break;
    case 'ting': song(1320, 1320, 0.25, 0.22, 'triangle'); song(1980, 1980, 0.2, 0.12, 'triangle', 0.05); break;
    case 'chon': nhieu(0.18, 3000, 400, 0.3, 'bandpass', 2); song(660, 990, 0.12, 0.2, 'triangle'); break;
    case 'sam': nhieu(0.9, 500, 60, 0.9); song(70, 30, 0.8, 0.8); nhieu(0.25, 6000, 800, 0.5, 'highpass'); break;
    case 'chieu': song(300, 1200, 0.3, 0.3, 'sawtooth'); nhieu(0.3, 800, 3000, 0.25, 'bandpass', 1.5); break;
    case 'dem': song(880, 880, 0.18, 0.28, 'triangle'); break;
    case 'thang': [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => song(f, f, 0.3, 0.22, 'triangle', i * 0.16)); break;
  }
}
