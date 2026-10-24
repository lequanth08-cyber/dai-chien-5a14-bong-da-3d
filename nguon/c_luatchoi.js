// ===================== DỰNG THẾ GIỚI =====================
taoSan(); taoBang(); taoKhungThanh(1); taoKhungThanh(-1); taoKhanDai();

// ===================== TRẠNG THÁI CHUNG =====================
let tt = 'sanh', ttTruoc = 'choi';     // sanh, ghep, nhapsan, demnguoc, choi, ghiban, replay, chuyensan, tamdung, ketqua
const CH = { nv: 0, kho: 'de', gio: 180, mung: 'nhay', giay: 0 };   // cấu hình người chơi chọn
try { const l = JSON.parse(localStorage.getItem('ego3d_cfg2') || 'null'); if (l && typeof l === 'object') Object.assign(CH, l); } catch (e) { }
if (!(CH.nv >= 0 && CH.nv < SO_CHON)) CH.nv = 0;
if (!MUC_KHO[CH.kho]) CH.kho = 'de';
function luuCH() { try { localStorage.setItem('ego3d_cfg2', JSON.stringify(CH)); } catch (e) { } }
let tongGiayChoi = 0, daNhacMat = false, gioThuc = 0;

const B = { x: 0, y: BONG_R, z: 0, vx: 0, vy: 0, vz: 0, chu: null, cong: 0, congT: 0, sieu: false, daThu: false, cuoiCham: null, passer: null, passerT: 0, nhan: null, quayX: 0, quayZ: 0, xuyen: false };
let CT = [], NG = null;                 // CT = 6 cầu thủ, NG = cầu thủ của người chơi
const diem = [0, 0];
let thoiGian = 180, vang = false, doiTran = null, ghibanT = 0, chuyenSanT = 0, demT = 0, nhapSanT = 0, doiBatDau = 0;
let chamT = 0, rung = 0, zoom = 1, soi = 0, chopT = 0, vuaGhi = null;
const REC = []; let replayI = 0, replayLen = 0, replayBuf = null;

// ===================== SẢNH CHỜ 3D =====================
const nhomSanh = new THREE.Group(); scene.add(nhomSanh);
const bucMat = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.4, 40), matLieu(0x1a2250, 0.4)); bucMat.position.y = 0.2; bucMat.receiveShadow = true; nhomSanh.add(bucMat);
const bucVong = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.07, 8, 60), new THREE.MeshBasicMaterial({ color: 0x59d0ff })); bucVong.rotation.x = Math.PI / 2; bucVong.position.y = 0.42; nhomSanh.add(bucVong);
const chum = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.6, 11, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x59b8ff, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
chum.position.y = 6; nhomSanh.add(chum);
const sanhMH = [], sanhP = [];
NHAN_VAT.slice(0, SO_CHON).forEach((nv, i) => {
  const mh = taoMoHinh(nv, nv.vt === 'tm' ? 0xffd23a : 0x2a7bff, nv.vt === 'tm' ? 0x222a44 : 0xffffff, nv.vt === 'tm' ? 0xffd23a : 0x2a7bff, nv.vt === 'tm', MAU_GIAY[CH.giay] || '#fff', false);
  mh.goc.scale.setScalar(1.6); mh.goc.position.y = 0.4; mh.goc.visible = false; mh.nhan.visible = false;
  nhomSanh.add(mh.goc); sanhMH.push(mh);
  sanhP.push({ mh, x: 0, z: 0, ang: 0, phase: 0, spd: 0, kick: 0, truot: 0, dive: 0, diveDir: 1, stun: 0, giu: 0, mung: null, mungT: 0, ny: 0, xoayNguoi: 0 });
});
let sanhPop = 0, sanhMungT = 0;

// Hình tròn đại diện cho cầu thủ (Nho dùng ảnh thật)
function avatarHTML(nv) {
  return '<div class="avatar" style="background:' + (nv.anh ? '#fff url(' + ANH[nv.id] + ') center/cover' : nv.mau) + '">' + (nv.anh ? '' : nv.ten.charAt(0)) + '</div>';
}
function toast(chu, ms) {
  const e = $('toast'); e.textContent = chu; e.classList.add('hien'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('hien'), ms || 3200);
}
function chonNV(i, khongAm) {
  i = (i + SO_CHON) % SO_CHON; CH.nv = i; luuCH();
  const nv = NHAN_VAT[i];
  sanhMH.forEach((m, k) => { m.goc.visible = (k === i); });
  $('nvTen').textContent = nv.ten; $('nvVaiTro').textContent = nv.vai; $('nvSo').textContent = '#' + nv.so; $('nvLop').textContent = 'Lớp ' + nv.lop;
  for (const [id, v] of [['Toc', nv.toc], ['Sut', nv.sut], ['Pn', nv.pn], ['Ch', nv.chuyen], ['Re', nv.re], ['The', nv.the]]) { $('b' + id).style.width = (v * 10) + '%'; $('v' + id).textContent = v; }
  $('nvMoTa').textContent = nv.mota; $('chieuTen').textContent = nv.chieu.ten; $('chieuMt').textContent = nv.chieu.mt;
  document.querySelectorAll('.the').forEach((e, k) => e.classList.toggle('dang', k === i));
  sanhPop = 0.5; chopT = 0.35; sanhMungT = 0;
  if (!khongAm) { moAmThanh(); tieng('chon'); }
}
function dungSanh() {
  const the = $('theNV');
  NHAN_VAT.slice(0, SO_CHON).forEach((nv, i) => {
    const d = document.createElement('div'); d.className = 'the';
    d.innerHTML = avatarHTML(nv) + nv.ten;
    d.onclick = () => chonNV(i); the.appendChild(d);
  });
  const g = $('chonGiay');
  MAU_GIAY.forEach((m, i) => { const b = document.createElement('button'); b.className = 'mauGiay'; b.style.background = m; b.onclick = () => { CH.giay = i; luuCH(); capMauGiay(); moAmThanh(); tieng('ting'); }; g.appendChild(b); });
  const nhom = (id, khoa, kieu) => {
    const hang = $(id);
    const dat = () => hang.querySelectorAll('.chon').forEach(b => b.classList.toggle('dang', String(CH[khoa]) === b.dataset.v));
    hang.querySelectorAll('.chon').forEach(b => b.onclick = () => { CH[khoa] = kieu ? kieu(b.dataset.v) : b.dataset.v; luuCH(); dat(); moAmThanh(); tieng('ting'); if (khoa === 'mung') sanhMungT = 1.4; });
    dat();
  };
  nhom('chonKho', 'kho'); nhom('chonGio', 'gio', Number); nhom('chonMung', 'mung');
  capMauGiay();
  $('muiTrai').onclick = () => chonNV(CH.nv - 1); $('muiPhai').onclick = () => chonNV(CH.nv + 1);
  $('nutTim').onclick = () => { tuBatToanManHinh(); moAmThanh(); tieng('coi'); $('iosTip').classList.remove('hien'); batDauGhep(); };
  $('nutAm').onclick = () => { tatAm = !tatAm; try { localStorage.setItem('ego3d_tat', tatAm ? '1' : '0'); } catch (e) { } $('nutAm').textContent = tatAm ? '🔇' : '🔊'; moAmThanh(); };
  $('nutAm').textContent = tatAm ? '🔇' : '🔊';
  $('nutToan').onclick = toanManHinh; $('nutHD').onclick = () => hienHuongDan(true);
  $('hdDong').onclick = () => hienHuongDan(false);
  $('dungToan').onclick = toanManHinh; $('dungHD').onclick = () => hienHuongDan(true);
  if (window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone)) { $('nutToan').style.display = 'none'; $('dungToan').style.display = 'none'; }
  chonNV(CH.nv, true); goiYiOS();
}
function capMauGiay() {
  document.querySelectorAll('.mauGiay').forEach((b, i) => b.classList.toggle('dang', i === CH.giay));
  sanhMH.forEach(m => m.giayMat.color.set(MAU_GIAY[CH.giay]));
}
// Toàn màn hình (iPhone Safari không cho phép nên hướng dẫn "Thêm vào Màn hình chính")
function toanManHinh() {
  const d = document, el = d.documentElement;
  try {
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) { toast('Trên iPhone: bấm nút Chia sẻ, rồi chọn "Thêm vào Màn hình chính" để chơi toàn màn hình nhé!', 6000); return; }
    const kq = fn.call(el);
    if (kq && kq.then) kq.then(() => { try { screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }).catch(() => { toast('Trình duyệt này không cho bật toàn màn hình.'); });
  } catch (e) { toast('Trình duyệt này không cho bật toàn màn hình.'); }
}
// Nhận biết iPhone/iPad (Safari và Chrome trên iPhone đều không cho bật toàn màn hình bằng mã)
const LA_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const dangFull = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
const cheDoApp = () => (window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)) || navigator.standalone === true;
// Tự bật toàn màn hình ngay khi người chơi chạm hoặc bấm (Chrome, Edge, Android). Phải gọi trong lúc đang chạm thì trình duyệt mới cho.
function tuBatToanManHinh() {
  if (LA_IOS || dangFull() || cheDoApp()) return;
  const el = document.documentElement, fn = el.requestFullscreen || el.webkitRequestFullscreen; if (!fn) return;
  try { const kq = fn.call(el, { navigationUI: 'hide' }); if (kq && kq.catch) kq.catch(() => { }); } catch (e) { }
}
function khoaNgang() { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }
document.addEventListener('fullscreenchange', () => { if (dangFull()) khoaNgang(); setTimeout(resize, 120); setTimeout(resize, 600); });
document.addEventListener('webkitfullscreenchange', () => { setTimeout(resize, 120); setTimeout(resize, 600); });
function goiYiOS() {           // iPhone: nhắc "Thêm vào Màn hình chính" hai lần đầu
  if (!LA_IOS || cheDoApp()) return;
  let n = 0; try { n = +localStorage.getItem('ego3d_ios') || 0; } catch (e) { }
  if (n >= 2) return;
  $('iosTip').classList.add('hien');
  $('iosTipDong').onclick = () => { $('iosTip').classList.remove('hien'); try { localStorage.setItem('ego3d_ios', n + 1); } catch (e) { } };
}
function hienHuongDan(bat) {
  $('huongDanLop').classList.toggle('hien', bat);
  if (bat) { $('hdCam').style.display = DV.camUng ? 'block' : 'none'; $('hdPhim').style.display = DV.camUng ? 'none' : 'block'; }
}

// ===================== GHÉP TRẬN (giả lập các bạn vào phòng) =====================
let doiA = [], doiB = [], tenA = '', tenB = '', ghepId = 0;
function chiaDoi() {       // bạn chọn ai thì đá cho lớp của người đó, lớp kia là đối thủ
  tenA = NHAN_VAT[CH.nv].lop; tenB = tenA === '5A1.4' ? '5A2.4' : '5A1.4';
  doiA = [CH.nv].concat(DOI_LOP[tenA].filter(i => i !== CH.nv)); doiB = DOI_LOP[tenB].slice();
}
function chiaVai(ds) {     // mỗi đội: 1 thủ môn + hậu vệ + tiền đạo; làn (-1 trái, 0 giữa, 1 phải) chia theo số người
  const tm = ds.find(i => NHAN_VAT[i].vt === 'tm');
  const hv = ds.filter(i => NHAN_VAT[i].vt === 'hv'), td = ds.filter(i => NHAN_VAT[i].vt === 'tdao');
  const lan = (n, k) => n === 1 ? 0 : n === 2 ? (k ? 1 : -1) : [-1, 1, 0][k % 3];
  return [{ idx: tm, vt: 'tm', lane: 0 }]
    .concat(hv.map((i, k) => ({ idx: i, vt: 'hv', lane: lan(hv.length, k) })))
    .concat(td.map((i, k) => ({ idx: i, vt: 'tdao', lane: lan(td.length, k) })));
}
function oGhep(i, cho) {
  const nv = NHAN_VAT[i];
  return cho ? '<div class="o cho"><div class="avatar" style="background:#334">?</div>Đang vào phòng…</div>'
    : '<div class="o">' + avatarHTML(nv) + nv.ten + '<span class="tick">✓</span></div>';
}
function batDauGhep() {
  chiaDoi(); tt = 'ghep'; hienLop(['ghep']); const id = ++ghepId;
  $('ghepSan').textContent = ''; $('ghepTieu').textContent = 'Đang ghép trận…'; $('ghepVong').style.display = 'block';
  $('tenDoiX').textContent = 'Lớp ' + tenA; $('tenDoiD').textContent = 'Lớp ' + tenB;
  const x = [oGhep(doiA[0])], d = [];
  const lam = () => { $('slotX').innerHTML = [0, 1, 2, 3, 4].map(k => x[k] || oGhep(0, true)).join(''); $('slotD').innerHTML = [0, 1, 2, 3, 4].map(k => d[k] || oGhep(0, true)).join(''); };
  lam();
  const thuTu = [['d', 0], ['x', 1], ['d', 1], ['x', 2], ['d', 2], ['x', 3], ['d', 3], ['x', 4], ['d', 4]];
  thuTu.forEach((t, k) => setTimeout(() => {
    if (id !== ghepId || tt !== 'ghep') return;
    if (t[0] === 'x') x[t[1]] = oGhep(doiA[t[1]]); else d[t[1]] = oGhep(doiB[t[1]]);
    lam(); tieng('ting');
  }, 600 + k * 420));
  const xong = 600 + 9 * 420;
  setTimeout(() => { if (id !== ghepId || tt !== 'ghep') return; $('ghepVong').style.display = 'none'; $('ghepTieu').textContent = 'Đủ 10 người!'; $('ghepSan').textContent = 'TRẬN ĐẤU SẴN SÀNG'; tieng('ban'); }, xong + 200);
  setTimeout(() => { if (id !== ghepId || tt !== 'ghep') return; vaoSan(); }, xong + 1700);
}

// ===================== TẠO TRẬN =====================
function taoTran() {
  for (const p of CT) scene.remove(p.mh.goc);
  CT = [];
  const them = (doi, v, minh) => {
    const nv = NHAN_VAT[v.idx], tm = v.vt === 'tm';
    const mauDoi = doi === 0 ? 0x2a7bff : 0xee3d48;
    const ao = tm ? (doi === 0 ? 0xffd23a : 0x30d080) : mauDoi;
    const mh = taoMoHinh(nv, ao, tm ? 0x222a44 : 0xffffff, tm ? ao : mauDoi, tm, minh ? MAU_GIAY[CH.giay] : '#ffffff', minh);
    scene.add(mh.goc);
    const p = {
      doi, nv, idx: v.idx, vt: v.vt, lane: v.lane, nguoi: minh, mh, x: 0, z: 0, vx: 0, vz: 0, ang: 0, phase: Math.random() * 6, spd: 0,
      kick: 0, truot: 0, dive: 0, diveDir: 1, stun: 0, gong: 0, nhanCd: 0, tacCd: 0, chieuCd: 0, tt: 0, nang: 0, lachCd: 0, xoayCd: 0, xoayAnim: 0,
      buff: { sam: 0, tay: 0, khien: 0, toc: 0, cong: 0, xuyen: 0 }, giu: 0, giuHold: 0, coBongT: 0, mung: null, mungT: 0, ny: 0, xoayNguoi: 0,
      dashT: 0, dashX: 0, dashZ: 0, dashV: 0, tacXong: false, auraT: 0, sx: 0, sz: 0, tx0: 0, tz0: 0, tk: { ban: 0, kt: 0, cuop: 0, cuu: 0 },
      ai: { t: Math.random() * 0.2, tx: 0, tz: 0, act: null }
    };
    CT.push(p); return p;
  };
  chiaVai(doiA).forEach(v => them(0, v, v.idx === CH.nv));
  chiaVai(doiB).forEach(v => them(1, v, false));
  NG = CT.find(p => p.nguoi);
  diem[0] = diem[1] = 0; thoiGian = CH.gio; vang = false; REC.length = 0;
  datViTri(0); datBong();
}
function datBong() { B.x = B.z = 0; B.y = BONG_R; B.vx = B.vy = B.vz = 0; B.chu = null; B.cong = B.congT = 0; B.sieu = false; B.xuyen = false; B.daThu = false; B.nhan = null; B.passer = null; B.cuoiCham = null; }
function datViTri(doiBD) {
  doiBatDau = doiBD;
  for (const p of CT) {
    const dir = p.doi === 0 ? 1 : -1, la = p.doi === doiBD; let x, z;
    if (p.vt === 'tm') { x = -dir * GK_X; z = 0; }
    else if (p.vt === 'hv') { x = -dir * (la ? 17 : 23); z = p.lane * 10; }
    else if (la && p.lane < 0) { x = -dir * 1.6; z = 0.6; }
    else { x = -dir * (la ? 9 : 11); z = p.lane * 8; }
    p.tx0 = x; p.tz0 = z; p.sx = p.x; p.sz = p.z;
  }
}
function vaoSan() {            // bắt đầu cảnh nhập sân
  taoTran(); nhomSanh.visible = false;
  for (const p of CT) { p.x = p.sx = p.tx0 * 0.7; p.z = p.sz = SAN_RONG - 1; p.ang = p.doi === 0 ? Math.PI / 2 : -Math.PI / 2; p.vx = p.vz = 0; }
  tt = 'nhapsan'; nhapSanT = 0; camMoi = true; zoom = 1; hienLop(['hud', 'cam']); capNhatHUD(true); luuCH();
  $('giaiDoan').textContent = 'GIAO HỮU'; $('tenLopX').textContent = tenA; $('tenLopD').textContent = tenB; tieng('coi');
  hienGoiY();
}
function chayVaoViTri(u, dt) {
  const e = u < 1 ? (1 - Math.pow(1 - u, 2)) : 1;
  for (const p of CT) {
    const dx = noi(p.sx, p.tx0, e) - p.x, dz = noi(p.sz, p.tz0, e) - p.z;
    p.spd = u < 1 ? Math.min(8, Math.hypot(dx, dz) / Math.max(dt, 0.001)) : 0;
    p.x += dx; p.z += dz; p.phase += p.spd * dt * 1.25;
    if (u < 1 && p.spd > 1) p.ang = Math.atan2(dx, dz); else p.ang = p.doi === 0 ? Math.PI / 2 : -Math.PI / 2;
  }
}

// ===================== ĐIỀU KHIỂN: BÀN PHÍM, CHUỘT, CẢM ỨNG =====================
const DV = { phim: {}, joy: { on: false, x: 0, y: 0, id: -1 }, mx: 0, mz: 0, chuot: false, camUng: CAM_UNG, gong: false, xung: {}, ndc: { x: 0, y: 0 } };
function layXung() { const x = DV.xung; DV.xung = {}; return x; }
const rc = new THREE.Raycaster();
function capNhatChuot() {
  rc.setFromCamera(DV.ndc, camera);
  const o = rc.ray.origin, d = rc.ray.direction;
  if (d.y < -0.01) { const t = -o.y / d.y; DV.mx = o.x + d.x * t; DV.mz = o.z + d.z * t; }
}
window.addEventListener('keydown', (e) => {
  moAmThanh();
  const c = e.code;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) e.preventDefault();
  if (e.repeat) { DV.phim[c] = true; return; }
  DV.phim[c] = true;
  if (tt === 'sanh') { if (c === 'ArrowLeft') chonNV(CH.nv - 1); else if (c === 'ArrowRight') chonNV(CH.nv + 1); else if (c === 'Enter' || c === 'Space') $('nutTim').click(); return; }
  if (c === 'Space') DV.xung.hat = true;
  if (c === 'ShiftLeft' || c === 'ShiftRight') DV.xung.tac = true;
  if (c === 'KeyQ') DV.xung.chieu = true;
  if (c === 'KeyF' || c === 'KeyC') DV.xung.tt = true;
  if (c === 'KeyR') DV.xung.lach = true;
  if (c === 'KeyT') DV.xung.xoay = true;
  if (c === 'KeyK') DV.xung.chuyen = true;
  if (c === 'KeyJ') DV.gong = true;
  if (c === 'Escape' || c === 'KeyP') tamDung();
  if (c === 'KeyM') $('nutAm').click();
});
window.addEventListener('keyup', (e) => { DV.phim[e.code] = false; if (e.code === 'KeyJ' && DV.gong) { DV.gong = false; DV.xung.tha = true; } });
function nhaHet() { DV.phim = {}; if (DV.gong) { DV.gong = false; } DV.joy.on = false; DV.joy.x = DV.joy.y = 0; $('joyGoc').style.display = 'none'; }
window.addEventListener('blur', () => { nhaHet(); if (['choi', 'demnguoc', 'nhapsan'].includes(tt)) tamDung(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { nhaHet(); if (['choi', 'demnguoc', 'nhapsan'].includes(tt)) tamDung(); } });
window.addEventListener('contextmenu', e => e.preventDefault());
['gesturestart', 'gesturechange', 'dblclick'].forEach(n => document.addEventListener(n, e => e.preventDefault()));
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  DV.chuot = true; DV.ndc.x = e.clientX / innerWidth * 2 - 1; DV.ndc.y = -(e.clientY / innerHeight) * 2 + 1;
});
canvas.addEventListener('pointerdown', (e) => {
  moAmThanh();
  if (e.pointerType !== 'mouse') return;
  DV.chuot = true; DV.ndc.x = e.clientX / innerWidth * 2 - 1; DV.ndc.y = -(e.clientY / innerHeight) * 2 + 1;
  if (tt === 'sanh') return;
  if (e.button === 0) DV.gong = true; else if (e.button === 2) DV.xung.chuyen = true;
});
window.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' && e.button === 0 && DV.gong) { DV.gong = false; DV.xung.tha = true; } });
// vuốt ngang ở sảnh chờ để đổi nhân vật
let vuotX = null;
canvas.addEventListener('pointerdown', (e) => { if (tt === 'sanh') vuotX = e.clientX; });
window.addEventListener('pointerup', (e) => { if (tt === 'sanh' && vuotX !== null) { const dx = e.clientX - vuotX; if (Math.abs(dx) > 40) chonNV(CH.nv + (dx < 0 ? 1 : -1)); } vuotX = null; });

// --- cảm ứng: cần điều khiển + nút ---
function batCamUng() { DV.camUng = true; document.body.classList.add('cam'); }
if (CAM_UNG) batCamUng();
window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { batCamUng(); tuBatToanManHinh(); } }, true);
(function () {
  const vung = $('joyVung'), goc = $('joyGoc'), nut = $('joyNut');
  const bk = () => Math.min(innerWidth * 0.01, innerHeight * 0.018) * 6.5;
  let cx = 0, cy = 0;
  vung.addEventListener('pointerdown', (e) => {
    if (DV.joy.id >= 0) return; e.preventDefault(); vung.setPointerCapture(e.pointerId); moAmThanh();
    DV.joy.id = e.pointerId; DV.joy.on = true; cx = e.clientX; cy = e.clientY;
    const r = vung.getBoundingClientRect(); goc.style.display = 'block'; goc.style.left = (cx - r.left) + 'px'; goc.style.top = (cy - r.top) + 'px'; nut.style.transform = 'translate(0,0)';
  });
  vung.addEventListener('pointermove', (e) => {
    if (e.pointerId !== DV.joy.id) return;
    let dx = e.clientX - cx, dy = e.clientY - cy; const R = bk(), d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    nut.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    let x = dx / R, y = dy / R; if (Math.hypot(x, y) < 0.15) { x = y = 0; }
    DV.joy.x = x; DV.joy.y = y;
  });
  const het = (e) => { if (e.pointerId !== DV.joy.id) return; DV.joy.id = -1; DV.joy.on = false; DV.joy.x = DV.joy.y = 0; goc.style.display = 'none'; };
  vung.addEventListener('pointerup', het); vung.addEventListener('pointercancel', het);
  const nutCam = (id, giu, thaFn) => {
    const el = $(id); let pid = -1;
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); if (pid >= 0) return; pid = e.pointerId; el.setPointerCapture(pid); el.classList.add('an'); moAmThanh(); giu(); });
    const xong = (e) => { if (e.pointerId !== pid) return; pid = -1; el.classList.remove('an'); if (thaFn) thaFn(); };
    el.addEventListener('pointerup', xong); el.addEventListener('pointercancel', xong);
  };
  nutCam('cSut', () => { DV.gong = true; }, () => { if (DV.gong) { DV.gong = false; DV.xung.tha = true; } });
  nutCam('cChuyen', () => { DV.xung.chuyen = true; });
  nutCam('cTac', () => { DV.xung.tac = true; });
  nutCam('cChieu', () => { DV.xung.chieu = true; });
  nutCam('cTT', () => { DV.xung.tt = true; });
  nutCam('cLach', () => { DV.xung.lach = true; });
})();

function huongNgam(p, ix, iz) {
  const mv = Math.hypot(ix, iz);
  if (DV.chuot && !DV.camUng) { const dx = DV.mx - p.x, dz = DV.mz - p.z, d = Math.hypot(dx, dz); if (d > 0.8) return { x: dx / d, z: dz / d }; }
  if (mv > 0.2) return { x: ix / mv, z: iz / mv };
  return { x: Math.sin(p.ang), z: Math.cos(p.ang) };
}
function nguoiBuoc(p, xung) {
  let ix = 0, iz = 0; const k = DV.phim;
  if (k.KeyA || k.ArrowLeft) ix -= 1; if (k.KeyD || k.ArrowRight) ix += 1; if (k.KeyW || k.ArrowUp) iz -= 1; if (k.KeyS || k.ArrowDown) iz += 1;
  if (DV.joy.on) { ix = DV.joy.x; iz = DV.joy.y; }
  const a = huongNgam(p, ix, iz);
  const inp = { ix, iz, gong: DV.gong, tha: xung.tha, chuyen: xung.chuyen, tac: xung.tac, chieu: xung.chieu, tt: xung.tt, lach: xung.lach, xoay: xung.xoay, hat: xung.hat, aimX: a.x, aimZ: a.z };
  if (DV.gong) inp.facing = Math.atan2(a.x, a.z);
  return inp;
}

// ===================== HÀNH ĐỘNG CỦA CẦU THỦ =====================
function manh(p) { return p.doi === 0 ? 1 : -1; }   // hướng tấn công: đội 0 đá sang +x
function nhanBong(p) {
  if (B.chu && B.chu !== p && B.chu.vt === 'tm') B.chu.giuHold = 0;
  B.chu = p; B.nhan = null; B.daThu = false; B.congT = 0; B.sieu = false; B.xuyen = false; p.coBongT = 0; p.giuHold = 0;
  if (B.cuoiCham && B.cuoiCham !== p && B.cuoiCham.doi !== p.doi) { /* cướp được bóng từ đối thủ */ }
  B.cuoiCham = p;
}
function sut(p, dx, dz, luc, loai) {
  const m = Math.hypot(dx, dz) || 1; dx /= m; dz /= m;
  const dirG = manh(p); let sieu = false, cong = 0;
  if (p.buff.sam > 0) { sieu = true; p.buff.sam = 0; }
  let xuyen = false; if (p.buff.xuyen > 0 && loai !== 'hat') { xuyen = true; p.buff.xuyen = 0; }
  if (p.tt > 0) sieu = true;
  if (p.buff.cong > 0) { p.buff.cong = 0; cong = 10 * (Math.abs(p.z) < 1.5 ? (Math.random() < .5 ? 1 : -1) : (-Math.sign(p.z * dx) || 1)); }
  let ax = dx, az = dz;
  const gx = dirG * SAN_DAI, ex = gx - p.x, ez = -p.z, dg = Math.hypot(ex, ez) || 1;
  if (loai !== 'hat' && dg < 58 && (dx * ex + dz * ez) / dg > 0.74) {       // hỗ trợ ngắm: kéo về góc xa thủ môn
    const gk = CT.find(q => q.doi !== p.doi && q.vt === 'tm');
    const gz = (gk ? (gk.z >= 0 ? -1 : 1) : 1) * (KHUNG_RONG - 1.1) * Math.min(1, 0.5 + luc);
    let bx = gx - p.x, bz = gz - p.z; const bm = Math.hypot(bx, bz) || 1; bx /= bm; bz /= bm;
    const he = p.nguoi ? 0.92 : 1; ax = noi(dx, bx, he); az = noi(dz, bz, he); const am = Math.hypot(ax, az) || 1; ax /= am; az /= am;
  }
  if (!p.nguoi) { const a = (Math.random() - .5) * 2 * (p.doi === 0 ? 0.3 : MUC_KHO[CH.kho].saiSut) * 0.55, c = Math.cos(a), s = Math.sin(a); const nx = ax * c - az * s, nz = ax * s + az * c; ax = nx; az = nz; }
  let sp = noi(LUC_SUT_NHO, LUC_SUT_LON, luc) * (0.85 + p.nv.sut * 0.025); if (sieu) sp *= 1.3;
  let vy = loai === 'hat' ? 8.8 : 0.8 + luc * 4.2;
  if (loai === 'hat') sp = 12 + luc * 3;
  B.chu = null; B.vx = ax * sp; B.vz = az * sp; B.vy = vy; B.cong = cong; B.congT = cong ? 1.25 : 0; B.sieu = sieu; B.xuyen = xuyen; B.daThu = false; B.nhan = null;
  if (xuyen) { songXungKich(B.x, 0.12, B.z, 0xc48fff, 3.5, 0.6); for (let i = 0; i < 16; i++) hat(B.x, 0.6, B.z, ngauNhien(-5, 5), ngauNhien(0, 4), ngauNhien(-5, 5), 0xd9a6ff, 0.5, 0.5, 0, 0); chopT = Math.max(chopT, 0.35); }
  B.cuoiCham = p; p.nhanCd = 0.4; p.kick = 0.3; p.ang = Math.atan2(ax, az); p.nang = Math.min(100, p.nang + 4);
  B.x = p.x + ax * 0.9; B.z = p.z + az * 0.9; if (B.y < 0.5) B.y = 0.5;
  // hiệu ứng sút
  const cung = luc > 0.6 || sieu;
  tieng(sieu ? 'sam' : cung ? 'sutManh' : 'sut');
  songXungKich(B.x, 0.12, B.z, sieu ? 0x6ab8ff : 0xffffff, 1.2 + luc * 2.6, 0.55);
  toaHat(B.x, 0.5, B.z, 8 + (luc * 20) | 0, sieu ? 0x80d0ff : 0xfff2b0, 3 + luc * 8, 0.55, 0.7, 0, 0);
  if (sieu) { for (let i = 0; i < 14; i++) hat(B.x, 0.6, B.z, ngauNhien(-6, 6), ngauNhien(0, 5), ngauNhien(-6, 6), 0xffee70, 0.5, 0.5, 0, 0); chopT = Math.max(chopT, 0.55); }
  if (p.nguoi || cung) rung = Math.max(rung, 0.25 + luc * 0.45 + (sieu ? 0.3 : 0));
  if (cung) { chamT = CHAM_LAI_GIAY; zoom = 0.72; }
}
function chuyen(p, dx, dz) {
  if (B.chu !== p) return;
  const m = Math.hypot(dx, dz) || 1; dx /= m; dz /= m;
  let best = null, bs = 0.3;
  for (const q of CT) {
    if (q === p || q.doi !== p.doi) continue;
    const ex = q.x - p.x, ez = q.z - p.z, d = Math.hypot(ex, ez); if (d < 2.5) continue;
    const c = (ex * dx + ez * dz) / d, s = c + (1 - Math.min(1, d / 45)) * 0.35 + (q.vt === 'tm' ? -0.7 : 0);
    if (c > 0.3 && s > bs) { bs = s; best = q; }
  }
  let tx, tz;
  if (best) { const d = Math.hypot(best.x - p.x, best.z - p.z), tl = d / 16, dc = 0.35 + p.nv.chuyen * 0.05; tx = best.x + best.vx * tl * dc; tz = best.z + best.vz * tl * dc; }
  else { tx = p.x + dx * 14; tz = p.z + dz * 14; }
  const ex = tx - p.x, ez = tz - p.z, d = Math.hypot(ex, ez) || 1, sp = Math.min(28, 10 + d * 0.9) * (0.82 + p.nv.chuyen * 0.03);
  B.chu = null; B.vx = ex / d * sp; B.vz = ez / d * sp; B.vy = d > 16 ? 4 : 0.6; B.cong = B.congT = 0; B.sieu = false; B.daThu = false;
  B.nhan = best; B.cuoiCham = p; B.passer = p; B.passerT = 3.5;
  p.nhanCd = 0.35; p.kick = 0.3; p.ang = Math.atan2(ex, ez); p.nang = Math.min(100, p.nang + 8);
  B.x = p.x + ex / d * 0.9; B.z = p.z + ez / d * 0.9;
  tieng('chuyen'); toaHat(B.x, 0.3, B.z, 6, 0xcfe8ff, 3, 0.4, 0.5, 0, 0);
}
function hatBong(p, dx, dz) {
  if (B.chu !== p || p.hatCd > 0) return; p.hatCd = 0.8;
  sut(p, dx, dz, 0.45, 'hat'); tieng('chuyen');
}
function tac(p) {
  if (p.tacCd > 0 || p.stun > 0 || p.truot > 0 || p.dashT > 0) return;
  if (B.chu === p) return;
  p.tacCd = (p.nguoi ? 0.7 : 1.0) - p.nv.the * 0.02; p.truot = 0.38; p.tacXong = false; p.dashX = Math.sin(p.ang); p.dashZ = Math.cos(p.ang); p.dashV = 13;
  tieng('tac'); toaHat(p.x, 0.2, p.z, 6, 0xb8e0a0, 2.4, 0.5, 0.8, 0, 0);
}
function xetTac(p) {          // kiểm tra tắc bóng khi đang trượt
  if (p.tacXong) return;
  const fx = Math.sin(p.ang), fz = Math.cos(p.ang);
  const o = B.chu;
  if (o && o.doi !== p.doi && o.vt !== 'tm') {
    const dx = o.x - p.x, dz = o.z - p.z, d = Math.hypot(dx, dz);
    if (d < (p.nguoi ? 2.3 : 1.7) && (dx * fx + dz * fz) / (d || 1) > (p.nguoi ? -0.2 : 0.1)) {
      p.tacXong = true;
      const khoeA = p.nguoi ? 0.95 : MUC_KHO[CH.kho].cuopBong * (0.45 + p.nv.pn * 0.05) + 0.25;
      if (o.buff.khien > 0 || o.dashT > 0 || Math.random() > khoeA - o.nv.pn * 0.006 - o.nv.re * 0.016) { p.stun = p.nguoi ? 0.3 : 0.6; tieng('nay'); return; }
      B.chu = null; B.vx = fx * 7 + o.vx * 0.3; B.vz = fz * 7 + o.vz * 0.3; B.vy = 2.2; B.daThu = false; B.cuoiCham = p; B.passer = null;
      o.stun = 0.55; o.nhanCd = 0.5; o.coBongT = 0; p.nhanCd = 0.15; p.tk.cuop++; p.nang = Math.min(100, p.nang + 15);
      toaHat(o.x, 0.9, o.z, 14, 0xffffff, 5, 0.45, 0.6, 0, 0); songXungKich(o.x, 0.1, o.z, 0xaaffcc, 1.8, 0.4); tieng('tac');
      if (p.nguoi) rung = Math.max(rung, 0.2);
      return;
    }
  }
  if (!B.chu) {      // cắt bóng đang lăn
    const dx = B.x - p.x, dz = B.z - p.z, d = Math.hypot(dx, dz);
    if (d < 1.5 && B.y < 1) { p.tacXong = true; B.vx = fx * 9; B.vz = fz * 9; B.vy = 1.5; B.cuoiCham = p; B.daThu = false; B.nhan = null; tieng('chuyen'); }
  }
}
function lach(p, ix, iz) {
  if (p.lachCd > 0 || p.stun > 0 || p.truot > 0 || p.dashT > 0) return;
  p.lachCd = 3.3 - p.nv.re * 0.12; let m = Math.hypot(ix, iz);
  if (m < 0.2) { ix = Math.sin(p.ang); iz = Math.cos(p.ang); m = 1; }
  p.dashX = ix / m; p.dashZ = iz / m; p.dashV = 22; p.dashT = 0.2; tieng('chuyen');
  toaHat(p.x, 0.3, p.z, 8, 0xffffff, 3, 0.4, 0.6, 0, 0);
}
function xoay(p) {
  if (p.xoayCd > 0 || p.stun > 0 || p.truot > 0) return;
  p.xoayCd = 6; p.xoayAnim = 0.45; tieng('chieu'); songXungKich(p.x, 0.1, p.z, 0xffd870, 3.8, 0.5);
  for (const q of CT) {
    if (q.doi === p.doi) continue; const d = Math.hypot(q.x - p.x, q.z - p.z);
    if (d < 3.4 && q.buff.khien <= 0 && q.dashT <= 0) { q.stun = 0.85; if (B.chu === q) { B.chu = null; B.vx = (q.x - p.x) / d * 6; B.vz = (q.z - p.z) / d * 6; B.vy = 2; B.daThu = false; } }
  }
}
function thucTinh(p) {
  if (p.nang < 100 || p.tt > 0) return;
  p.tt = GIAY_THUC_TINH; p.nang = 0; tieng('sam'); chopT = 0.8; rung = Math.max(rung, 0.5);
  songXungKich(p.x, 0.1, p.z, 0xffc84a, 5, 0.8); songXungKich(p.x, 0.1, p.z, 0x6ab8ff, 3, 0.6);
  toaHat(p.x, 1, p.z, 40, 0xffe070, 9, 0.9, 0.9, 0, 0);
  if (p.nguoi) thongBao('THỨC TỈNH!', true);
}
function dungChieu(p) {
  if (p.chieuCd > 0 || p.stun > 0) return;
  p.chieuCd = GIAY_HOI_CHIEU; const ma = p.nv.chieu.ma; tieng('chieu');
  songXungKich(p.x, 0.1, p.z, 0xcf9bff, 2.4, 0.5);
  if (ma === 'sam') p.buff.sam = 10;
  else if (ma === 'tay') p.buff.tay = 4;
  else if (ma === 'xuyen') p.buff.xuyen = 10;
  else if (ma === 'toc') p.buff.toc = 4;
  else if (ma === 'cong') p.buff.cong = 10;
  else if (ma === 'khien') {
    p.buff.khien = 3.5; songXungKich(p.x, 0.1, p.z, 0x7ac8ff, 5, 0.6);
    for (const q of CT) {
      if (q.doi === p.doi) continue; const dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
      if (d < 4.6 && q.dashT <= 0) { q.stun = 0.7; q.vx = dx / (d || 1) * 10; q.vz = dz / (d || 1) * 10; if (B.chu === q) { B.chu = null; B.vx = dx / (d || 1) * 6; B.vz = dz / (d || 1) * 6; B.vy = 2; B.daThu = false; } }
    }
    rung = Math.max(rung, 0.4);
  }
  else if (ma === 'luot') { let ix = Math.sin(p.ang), iz = Math.cos(p.ang); p.dashX = ix; p.dashZ = iz; p.dashV = 30; p.dashT = 0.26; }
  if (p.nguoi) { const e = $('nangCh'); e.textContent = ''; }
}

// ===================== CẬP NHẬT MỘT CẦU THỦ =====================
const DEM_GIAM = ['kick', 'truot', 'dive', 'stun', 'nhanCd', 'tacCd', 'chieuCd', 'tt', 'lachCd', 'xoayCd', 'hatCd', 'dashT', 'xoayAnim', 'auraT'];
function apDung(p, inp, h) {
  for (const k of DEM_GIAM) if (p[k] > 0) p[k] = Math.max(0, p[k] - h);
  for (const k in p.buff) if (p.buff[k] > 0) p.buff[k] = Math.max(0, p.buff[k] - h);
  if (p.giu > 0) p.giu = Math.max(0, p.giu - h);
  const diChoi = (tt === 'choi');
  if (!diChoi) { inp = { ix: 0, iz: 0 }; }
  const khoa = p.stun > 0;
  if (khoa) { inp.ix = inp.iz = 0; inp.gong = inp.tha = inp.chuyen = inp.tac = inp.chieu = inp.tt = inp.lach = inp.xoay = inp.hat = false; }
  // ôm bóng của thủ môn
  if (B.chu === p && p.vt === 'tm') { p.giu = 0.2; p.giuHold += h; }
  // gồng sút
  if (inp.gong && !khoa) p.gong = Math.min(GIAY_GONG, p.gong + h); else if (!inp.gong && !inp.tha) p.gong = Math.max(0, p.gong - h * 4);
  if (inp.tha) { const l = Math.max(0.2, p.gong / GIAY_GONG); thaSut(p, inp, l); p.gong = 0; }
  if (inp.chuyen) chuyen(p, inp.aimX, inp.aimZ);
  if (inp.hat) hatBong(p, inp.aimX, inp.aimZ);
  if (inp.tac) tac(p);
  if (inp.chieu) dungChieu(p);
  if (inp.tt) thucTinh(p);
  if (inp.lach) lach(p, inp.ix, inp.iz);
  if (inp.xoay) xoay(p);
  p.xoayNguoi = p.xoayAnim > 0 ? (1 - p.xoayAnim / 0.45) * Math.PI * 2 : 0;
  if (p.truot > 0) xetTac(p);
  if (B.chu === p && diChoi) p.coBongT += h;
  // tốc độ
  let vmax = TOC_DO_CO_BAN * (0.75 + p.nv.toc * 0.05);
  if (!p.nguoi && p.doi === 1) vmax *= MUC_KHO[CH.kho].toc;   // chỉ đội đối thủ bị chậm đi ở mức dễ
  if (p.nguoi) vmax *= 1.06;
  if (p.tt > 0) vmax *= 1.22; if (p.buff.toc > 0) vmax *= 1.55; if (p.buff.tay > 0) vmax *= 1.2;
  if (B.chu === p) vmax *= 0.86 + p.nv.re * 0.012; if (p.gong > 0.05) vmax *= 0.8; if (p.giu > 0) vmax *= 0.5;
  let ix = inp.ix, iz = inp.iz; const mm = Math.hypot(ix, iz); if (mm > 1) { ix /= mm; iz /= mm; }
  let tx = ix * vmax, tz = iz * vmax, kk = 11;
  if (p.dashT > 0) { tx = p.dashX * p.dashV; tz = p.dashZ * p.dashV; kk = 40; }
  else if (p.truot > 0) { tx = p.dashX * p.dashV * (p.truot / 0.38); tz = p.dashZ * p.dashV * (p.truot / 0.38); kk = 25; }
  else if (p.stun > 0) { tx = tz = 0; kk = 6; }
  const k = Math.min(1, h * kk); p.vx += (tx - p.vx) * k; p.vz += (tz - p.vz) * k;
  p.x = kep(p.x + p.vx * h, -LIM_X, LIM_X); p.z = kep(p.z + p.vz * h, -LIM_Z, LIM_Z);
  p.spd = Math.hypot(p.vx, p.vz); p.phase += p.spd * h * 1.25;
  if (p.stun <= 0 && p.dashT <= 0 && p.truot <= 0 && diChoi) {
    let muc = null; if (inp.facing !== undefined) muc = inp.facing; else if (mm > 0.15) muc = Math.atan2(ix, iz);
    if (muc !== null) p.ang -= gocChenh(p.ang, muc) * Math.min(1, h * 14);
  }
  // hào quang
  if (p.tt > 0 || p.buff.toc > 0 || p.buff.khien > 0 || p.buff.sam > 0 || p.buff.cong > 0 || p.buff.tay > 0 || p.buff.xuyen > 0) {
    if (Math.random() < h * 40) {
      const mau = p.tt > 0 ? (Math.random() < .5 ? 0xffc84a : 0x6ab8ff) : p.buff.khien > 0 ? 0x7ac8ff : p.buff.toc > 0 ? 0x7dffa0 : p.buff.tay > 0 ? 0xff9a3a : p.buff.xuyen > 0 ? 0xc48fff : 0xffee70;
      hat(p.x + ngauNhien(-.4, .4), ngauNhien(0.1, 1.8), p.z + ngauNhien(-.4, .4), ngauNhien(-.5, .5), ngauNhien(1.5, 3.5), ngauNhien(-.5, .5), mau, 0.5, 0.7, 0.1, 0);
    }
  }
  if (p.mung) { p.mungT += h; if (p.mung === 'nhay') p.ny = Math.abs(Math.sin(p.mungT * 8)) * 0.9; else if (p.mung === 'xoay') { p.xoayNguoi = p.mungT * 12; p.ny = Math.abs(Math.sin(p.mungT * 5)) * 0.4; } else if (p.mung === 'truot') { p.ny = 0; } } else p.ny = 0;
  // năng lượng
  if (diChoi && B.chu === p && p.spd > 3) p.nang = Math.min(100, p.nang + h * (p.nguoi ? 9 : 5) * (0.6 + p.nv.the * 0.06));
  if (p.dive > 0) p.vx *= 0.98;
}
function thaSut(p, inp, l) {
  if (B.chu === p) sut(p, inp.aimX, inp.aimZ, l);
  else {
    const d = Math.hypot(B.x - p.x, B.z - p.z);
    if (!B.chu && d < 1.7 && B.y < 1.4) sut(p, inp.aimX, inp.aimZ, l); else p.kick = 0.3;
  }
}
function tachNguoi() {
  for (let i = 0; i < CT.length; i++) for (let j = i + 1; j < CT.length; j++) {
    const a = CT[i], b = CT[j]; if (a.dashT > 0 || b.dashT > 0 || a.truot > 0 || b.truot > 0) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
    if (d < 1.0 && d > 0.001) { const o = (1.0 - d) / 2, nx = dx / d, nz = dz / d; a.x = kep(a.x - nx * o, -LIM_X, LIM_X); a.z = kep(a.z - nz * o, -LIM_Z, LIM_Z); b.x = kep(b.x + nx * o, -LIM_X, LIM_X); b.z = kep(b.z + nz * o, -LIM_Z, LIM_Z); }
  }
}

// ===================== BÓNG =====================
function buocBong(h) {
  if (B.chu) {
    const p = B.chu, f = 0.95, tx = p.x + Math.sin(p.ang) * f, tz = p.z + Math.cos(p.ang) * f;
    const k = Math.min(1, h * 20); B.x += (tx - B.x) * k; B.z += (tz - B.z) * k;
    B.y = BONG_R + (p.vt === 'tm' && p.giuHold > 0 ? 0.9 : Math.abs(Math.sin(p.phase)) * 0.14 * Math.min(1, p.spd / 6));
    B.vx = p.vx; B.vz = p.vz; B.vy = 0; B.quayX += p.vz * h * 2; B.quayZ -= p.vx * h * 2; return;
  }
  B.vy -= TRONG_LUC * h;
  if (B.congT > 0) { B.congT -= h; const sp = Math.hypot(B.vx, B.vz); if (sp > 2) { B.vx += -B.vz / sp * B.cong * h; B.vz += B.vx / sp * B.cong * h; } }
  B.x += B.vx * h; B.y += B.vy * h; B.z += B.vz * h;
  if (B.y < BONG_R) {
    B.y = BONG_R;
    if (B.vy < -2.5) { B.vy = -B.vy * 0.6; if (B.vy > 3) tieng('nay'); } else B.vy = 0;
    const ms = Math.exp(-0.9 * h); B.vx *= ms; B.vz *= ms; if (Math.hypot(B.vx, B.vz) < 0.15) { B.vx = B.vz = 0; B.xuyen = false; }
  } else { const kh = Math.exp(-0.06 * h); B.vx *= kh; B.vz *= kh; }
  B.quayX += B.vz * h * 2.6; B.quayZ -= B.vx * h * 2.6;
  if (B.passerT > 0) B.passerT -= h;
  // hàng rào hai bên
  const ZL = SAN_RONG + 0.35 - BONG_R;
  if (B.z > ZL) { B.z = ZL; B.vz = -Math.abs(B.vz) * 0.7; if (Math.abs(B.vz) > 3) tieng('nay'); }
  if (B.z < -ZL) { B.z = -ZL; B.vz = Math.abs(B.vz) * 0.7; if (Math.abs(B.vz) > 3) tieng('nay'); }
  // hai đầu sân + trong khung thành
  const trongMieng = Math.abs(B.z) < KHUNG_RONG - 0.1 && B.y < KHUNG_CAO - 0.05;
  const XL = SAN_DAI + 0.4 - BONG_R;
  if (Math.abs(B.x) > SAN_DAI - 0.01 && trongMieng) {
    const s = Math.sign(B.x), sau = SAN_DAI + KHUNG_SAU - BONG_R;
    if (Math.abs(B.x) > sau) { B.x = s * sau; B.vx = -s * Math.abs(B.vx) * 0.18; B.vz *= 0.5; B.vy *= 0.5; }
    const zl = KHUNG_RONG - BONG_R;
    if (Math.abs(B.z) > zl) { B.z = Math.sign(B.z) * zl; B.vz *= -0.3; B.vx *= 0.7; }
    if (B.y > KHUNG_CAO - BONG_R) { B.y = KHUNG_CAO - BONG_R; B.vy = -Math.abs(B.vy) * 0.3; }
  } else if (Math.abs(B.x) > XL && Math.abs(B.x) > SAN_DAI - 0.01 && !(Math.abs(B.z) < KHUNG_RONG - 0.1 && B.y < KHUNG_CAO + 0.5)) {
    B.x = Math.sign(B.x) * XL; B.vx = -Math.sign(B.x) * Math.abs(B.vx) * 0.65; if (Math.abs(B.vx) > 3) tieng('nay');
  }
  // cột dọc và xà ngang
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const dx = B.x - sx * SAN_DAI, dz = B.z - sz * KHUNG_RONG, d = Math.hypot(dx, dz);
    if (d < BONG_R + 0.11 && B.y < KHUNG_CAO) {
      const nx = dx / (d || 1), nz = dz / (d || 1), vn = B.vx * nx + B.vz * nz;
      if (vn < 0) { B.vx -= 1.7 * vn * nx; B.vz -= 1.7 * vn * nz; B.x = sx * SAN_DAI + nx * (BONG_R + 0.12); B.z = sz * KHUNG_RONG + nz * (BONG_R + 0.12); tieng('xa'); toaHat(B.x, B.y, B.z, 10, 0xffffff, 4, 0.4, 0.5, 0, 0); rung = Math.max(rung, 0.25); }
    }
  }
  for (const sx of [-1, 1]) if (Math.abs(B.z) < KHUNG_RONG + 0.1 && Math.abs(B.x - sx * SAN_DAI) < BONG_R + 0.11 && Math.abs(B.y - KHUNG_CAO) < BONG_R + 0.11) {
    const arriba = B.y >= KHUNG_CAO; B.vy = (arriba ? 1 : -1) * Math.abs(B.vy) * 0.6 + (arriba ? 1 : -1) * 1; B.vx *= 0.65;
    B.y = KHUNG_CAO + (arriba ? 1 : -1) * (BONG_R + 0.12); B.daThu = true; tieng('xa'); toaHat(B.x, B.y, B.z, 12, 0xffffff, 4, 0.4, 0.5, 0, 0); rung = Math.max(rung, 0.3);
  }
}
function xuLyBong(h) {
  // thủ môn cứu thua
  for (const g of CT) {
    if (g.vt !== 'tm' || B.chu || B.daThu || tt !== 'choi') continue;
    const side = g.doi === 0 ? -1 : 1, sp = Math.hypot(B.vx, B.vz);
    if (B.vx * side < 3 || sp < 7) continue;
    const d = Math.hypot(B.x - g.x, B.z - g.z), reach = 1.5 + (g.buff.tay > 0 ? 1.7 : 0) + (g.nguoi ? 0.4 : 0);
    if (d < reach && B.y < 3.1) {
      B.daThu = true; g.dive = 0.55; g.diveDir = Math.sign(B.z - g.z) || 1;
      const loi = g.nguoi ? 0.12 : (g.doi === 0 ? 0.28 : MUC_KHO[CH.kho].thuMonLoi) * (B.sieu ? 1.5 : 1) * (1.25 - g.nv.pn * 0.05);
      if (Math.random() < loi) continue;
      g.tk.cuu++; g.nang = Math.min(100, g.nang + 15); tieng('cuu'); songXungKich(B.x, B.y, B.z, 0xffffff, 1.6, 0.4); toaHat(B.x, B.y, B.z, 16, 0xfff2b0, 6, 0.5, 0.7, 0, 0);
      if (sp < 18 && Math.random() < 0.65) { nhanBong(g); }
      else { B.vx = -B.vx * 0.35; B.vz = (g.z >= B.z ? -1 : 1) * ngauNhien(4, 9); B.vy = ngauNhien(3, 6); B.sieu = false; B.congT = 0; B.cuoiCham = g; }
      if (g.doi === 0) thongBao('CỨU THUA!', true, 900);
    }
  }
  // nhặt bóng
  if (B.chu) return;
  let tot = null, td = 99;
  for (const p of CT) {
    if (p.stun > 0 || p.nhanCd > 0 || p.truot > 0 || p.dive > 0.3) continue;
    const d = Math.hypot(B.x - p.x, B.z - p.z), reach = p.vt === 'tm' ? 1.35 : (p.nguoi ? 1.35 : 0.95);
    if (d < reach && B.y < 1.35 && d < td) {
      if (Math.hypot(B.vx, B.vz) > 22 && p.vt !== 'tm') continue;
      if (B.xuyen && p.vt !== 'tm' && Math.hypot(B.vx, B.vz) > 6) continue;   // bóng xuyên phá: chỉ thủ môn chạm được
      td = d; tot = p;
    }
  }
  if (tot) nhanBong(tot);
}

// ===================== MÁY ĐIỀU KHIỂN (AI) =====================
function gan(p, ds) { let b = null, bd = 1e9; for (const q of ds) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; b = q; } } return b; }
function nuaNha(dir, x) { return dir > 0 ? Math.min(x, 8) : Math.max(x, -8); }   // hậu vệ không chạy quá xa sang sân đối phương
function aiQuyet(p, kho) {
  const dir = manh(p), A = p.ai, chu = B.chu, coBong = chu === p, taGiu = chu && chu.doi === p.doi, dichGiu = chu && chu.doi !== p.doi;
  const di = (x, z) => { A.tx = kep(x, -LIM_X, LIM_X); A.tz = kep(z, -LIM_Z, LIM_Z); };
  const nhaX = -dir * SAN_DAI, K = HE_SAN, lane = p.lane || 0;
  if (p.vt === 'tm') {
    const hx = -dir * GK_X, zl = KHUNG_RONG - 0.8;
    if (coBong) { di(p.x, p.z); return; }
    const toiGan = !chu && Math.abs(B.x - hx) < 12 && Math.hypot(B.vx, B.vz) < 6;
    if (toiGan) di(B.x, B.z);
    else if (dichGiu && Math.abs(chu.x - hx) < 15) di(hx + dir * 3, kep(chu.z * 0.45, -zl, zl));
    else di(hx, kep(B.z * 0.4, -zl, zl));
    if (p.chieuCd <= 0 && !coBong && Math.hypot(B.vx, B.vz) > 15 && B.vx * dir < 0 && Math.abs(B.x - hx) < 18) A.act = { k: 'chieu' };
    return;
  }
  const tdao = p.vt === 'tdao';
  const ban = CT.filter(q => q.doi === p.doi && q.vt !== 'tm'), doiThu = CT.filter(q => q.doi !== p.doi);
  if (coBong) {
    const gx = dir * SAN_DAI, dg = Math.hypot(gx - p.x, p.z);
    let dich = null, od = 99; for (const q of doiThu) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < od) { od = d; dich = q; } }
    let tz = p.z * 0.6; if (dich && od < 6 && dich.vt !== 'tm') tz = p.z + (p.z >= dich.z ? 1 : -1) * 7;
    di(gx - dir * 3, tz);
    if (p.tt <= 0 && p.nang >= 100 && dg < 30 * K) A.act = { k: 'tt' };
    else if (p.chieuCd <= 0) {
      const ma = p.nv.chieu.ma;
      if ((ma === 'sam' || ma === 'cong' || ma === 'xuyen') && dg < 24 * K) A.act = { k: 'chieu' };
      else if ((ma === 'toc' || ma === 'luot') && dg > 14 * K && od > 3) A.act = { k: 'chieu' };
      else if (ma === 'khien' && od < 3.5) A.act = { k: 'chieu' };
    }
    if (!A.act) {
      const tam = (tdao ? 18 : 13) * K;
      if (p.coBongT > 0.35 && dg < tam && Math.abs(p.z) < SAN_RONG * 0.75 && Math.random() < 0.8 * kho.banSut) A.act = { k: 'sut', luc: ngauNhien(0.55, 1) };
      else if (dg < 22 * K && p.coBongT > 0.6 && Math.random() < 0.06 * kho.banSut) A.act = { k: 'sut', luc: ngauNhien(0.7, 1) };
      else if ((od < 3 && p.coBongT > 0.45) || p.coBongT > 2.4 || (!tdao && p.coBongT > 1 && (p.x * dir) < 0)) {
        let q = null, bs = -1e9;
        for (const t of ban) {
          if (t === p) continue; let tr = 99; for (const z of doiThu) tr = Math.min(tr, Math.hypot(z.x - t.x, z.z - t.z));
          const sc = (t.x - p.x) * dir + tr * 1.2; if (sc > bs && tr > 3.5) { bs = sc; q = t; }
        }
        if (q) A.act = { k: 'chuyen', q };
      }
    }
    return;
  }
  if (taGiu) {                       // đồng đội có bóng: chạy chỗ trống
    const t = chu;
    if (tdao) di(t.x + dir * 12, Math.abs(t.z) > 12 ? -Math.sign(t.z) * 7 : lane * 10);
    else di(nuaNha(dir, t.x - dir * 9), lane * 11 + t.z * 0.2);
    return;
  }
  if (dichGiu) {                     // đối thủ có bóng: người gần nhất áp sát, người thứ hai chặn đường
    const xep = ban.slice().sort((a, b) => Math.hypot(a.x - chu.x, a.z - chu.z) - Math.hypot(b.x - chu.x, b.z - chu.z)), hang = xep.indexOf(p);
    const d = Math.hypot(chu.x - p.x, chu.z - p.z);
    if (hang === 0 || d < 5) di(chu.x + chu.vx * 0.25, chu.z + chu.vz * 0.25);
    else if (hang === 1 && p.vt === 'hv') di(noi(chu.x, nhaX, 0.3), noi(chu.z, 0, 0.4));
    else if (tdao) di(noi(chu.x, 0, 0.5), lane * 10);
    else di(nuaNha(dir, noi(chu.x, nhaX, 0.45)), lane * 10 + chu.z * 0.3);
    return;
  }
  const duoi = ban.filter(q => !q.nguoi), gn = gan(B, duoi.length ? duoi : ban);     // bóng tự do
  if (gn === p || B.nhan === p) di(B.x + B.vx * 0.3, B.z + B.vz * 0.3);
  else if (tdao) di(B.x + dir * 10, B.z * 0.4 + lane * 10);
  else di(nuaNha(dir, B.x - dir * 9), B.z * 0.5 + lane * 10);
}
function aiBuoc(p, h) {
  const kho = MUC_KHO[CH.kho], A = p.ai, inp = { ix: 0, iz: 0 };
  A.t -= h; if (A.t <= 0) { A.t = (p.doi === 0 ? 0.22 : kho.phanUng) * ngauNhien(0.8, 1.2); aiQuyet(p, kho); }
  const dx = A.tx - p.x, dz = A.tz - p.z, d = Math.hypot(dx, dz);
  if (d > 0.5) { const k = Math.min(1, d / 2.5); inp.ix = dx / d * k; inp.iz = dz / d * k; }
  if (p.stun > 0) return inp;
  const a = A.act;
  if (a) {
    A.act = null; const dir = manh(p);
    if (a.k === 'sut' && B.chu === p) { const gx = dir * SAN_DAI; sut(p, gx - p.x, -p.z * 0.8 + ngauNhien(-1.5, 1.5), a.luc); }
    else if (a.k === 'chuyen' && B.chu === p) chuyen(p, a.q.x - p.x, a.q.z - p.z);
    else if (a.k === 'chieu') dungChieu(p);
    else if (a.k === 'tt') thucTinh(p);
  }
  if (B.chu === p && p.vt === 'tm' && p.giuHold > 0.9) {       // thủ môn thả bóng
    const q = gan(p, CT.filter(z => z.doi === p.doi && z.vt !== 'tm'));
    if (q) { if (Math.random() < 0.5) chuyen(p, q.x - p.x, q.z - p.z); else hatBong(p, q.x - p.x, q.z - p.z); }
    else hatBong(p, manh(p), 0);
  }
  // tắc bóng (không tắc ngay khi người chơi vừa nhận bóng, để bé kịp xoay xở)
  if (B.chu && B.chu.doi !== p.doi && p.vt !== 'tm' && p.tacCd <= 0 && !(B.chu.nguoi && B.chu.coBongT < 1.0)) {
    const d2 = Math.hypot(B.chu.x - p.x, B.chu.z - p.z);
    if (d2 < 1.9 && Math.random() < h * 2.6 * kho.cuopBong) { p.ang = Math.atan2(B.chu.x - p.x, B.chu.z - p.z); tac(p); }
  }
  return inp;
}

// ===================== VÒNG VẬT LÝ =====================
function buocVatLy(h, xung) {
  for (const p of CT) {
    let inp;
    if (tt === 'choi') inp = p.nguoi ? nguoiBuoc(p, xung) : aiBuoc(p, h); else inp = { ix: 0, iz: 0 };
    apDung(p, inp, h);
    if (tt === 'choi' && p.nguoi) xung = {};
  }
  tachNguoi(); buocBong(h); xuLyBong(h);
  if (tt === 'choi') kiemTraBan();
}
function kiemTraBan() {
  if (B.chu) return;
  if (Math.abs(B.z) < KHUNG_RONG - 0.15 && B.y < KHUNG_CAO - 0.1) {
    if (B.x > SAN_DAI + 0.05) ghiBan(0); else if (B.x < -SAN_DAI - 0.05) ghiBan(1);
  }
}

// ===================== BÀN THẮNG, REPLAY, GIAO BÓNG =====================
function thongBao(chu, nho, ms) {
  const e = $('thongBao'); e.textContent = chu; e.className = ''; void e.offsetWidth; e.className = 'no' + (nho ? ' nho' : '');
  clearTimeout(thongBao.t); thongBao.t = setTimeout(() => { e.className = ''; }, ms || 1800);
}
function ghiBan(doi) {
  tt = 'ghiban'; ghibanT = 0; diem[doi]++; const ai = B.cuoiCham;
  vuaGhi = { doi, ten: ai ? ai.nv.ten : '' };
  if (ai && ai.doi === doi) {
    ai.tk.ban++; ai.nang = Math.min(100, ai.nang + 30);
    if (B.passer && B.passer !== ai && B.passer.doi === doi && B.passerT > 0) B.passer.tk.kt++;
  }
  for (const p of CT) {
    if (p.doi === doi) { p.mung = (p === ai) ? (p.nguoi ? CH.mung : ['nhay', 'xoay', 'truot'][(Math.random() * 3) | 0]) : 'nhay'; p.mungT = 0; if (p.mung === 'truot') { p.dashX = Math.sin(p.ang); p.dashZ = Math.cos(p.ang); } }
  }
  luoiList.forEach(l => { if (l.s === (doi === 0 ? 1 : -1)) l.rung = 1; });
  soi = 1; rung = 0.7; chopT = 0.7; chamT = 0.6; zoom = 0.7; tieng('ban');
  thongBao('VÀO!' + (ai && ai.doi === doi ? '' : ''), false, 2300);
  const gx = (doi === 0 ? 1 : -1) * (SAN_DAI + 1);
  for (let i = 0; i < 150; i++) hat(gx + ngauNhien(-3, 3), ngauNhien(3, 8), ngauNhien(-8, 8), ngauNhien(-3, 3), ngauNhien(0, 7), ngauNhien(-4, 4), [0xff5a5a, 0x4aa0ff, 0xffd23a, 0x5aff9a, 0xff8ad8, 0xffffff][i % 6], ngauNhien(1.8, 3.2), 0.5, 0.5, 9, true);
  toaHat(B.x, B.y, B.z, 30, 0xffe070, 8, 0.8, 0.9, 0, 0);
  capNhatHUD(true);
}
function chupREC() {
  const s = { b: [B.x, B.y, B.z, B.quayX, B.quayZ], p: CT.map(p => [p.x, p.z, p.ang, p.phase, p.spd, p.kick, p.dive, p.diveDir, p.truot, p.ny, p.xoayNguoi, p.mung ? p.mung : 0, p.mungT, p.giu, p.stun]) };
  REC.push(s); if (REC.length > 190) REC.shift();
}
function batDauReplay() {
  replayBuf = REC.slice(-150); replayLen = replayBuf.length; replayI = 0; tt = 'replay';
  $('xemLai').style.display = 'block'; chopT = 0.5; zoom = 1; chamT = 0;
}
function phatReplay(dt) {
  replayI += dt * 60 * 0.6;
  const i = Math.min(replayLen - 1, replayI | 0), s = replayBuf[i];
  B.x = s.b[0]; B.y = s.b[1]; B.z = s.b[2]; B.quayX = s.b[3]; B.quayZ = s.b[4]; B.chu = null;
  CT.forEach((p, k) => { const a = s.p[k]; p.x = a[0]; p.z = a[1]; p.ang = a[2]; p.phase = a[3]; p.spd = a[4]; p.kick = a[5]; p.dive = a[6]; p.diveDir = a[7]; p.truot = a[8]; p.ny = a[9]; p.xoayNguoi = a[10]; p.mung = a[11] || null; p.mungT = a[12]; p.giu = a[13]; p.stun = a[14]; });
  if (replayI >= replayLen + 20) { $('xemLai').style.display = 'none'; ketThucDiem(); }
}
function ketThucDiem() {
  const het = (thoiGian <= 0) || vang;
  if (vang) { ketThuc(); return; }
  if (thoiGian <= 0) { if (diem[0] === diem[1]) { batVang(); return; } ketThuc(); return; }
  giaoBong(1 - vuaGhi.doi);
}
function batVang() {
  vang = true; thoiGian = 60; giaoBong(Math.random() < 0.5 ? 0 : 1); $('giaiDoan').textContent = 'BÀN THẮNG VÀNG'; thongBao('BÀN THẮNG VÀNG!', true, 2200); tieng('coiDai');
}
function giaoBong(doiBD) {
  for (const p of CT) { p.mung = null; p.mungT = 0; p.ny = 0; p.stun = 0; p.truot = 0; p.dashT = 0; p.dive = 0; p.gong = 0; p.giu = 0; p.vx = p.vz = 0; p.xoayNguoi = 0; p.ai.act = null; }
  datBong(); datViTri(doiBD); tt = 'chuyensan'; chuyenSanT = 0; chamT = 0; zoom = 1; vuaGhi = null; capNhatHUD(true);
}

// ===================== KẾT THÚC TRẬN =====================
function ketThuc() {
  tt = 'ketqua'; hienLop(['ketQuaLop']); tieng('coiDai');
  const kq = diem[0] > diem[1] ? 'THẮNG' : diem[0] < diem[1] ? 'THUA' : 'HÒA';
  $('ketQuaHop').scrollTop = 0;
  setTimeout(() => tieng(kq === 'THẮNG' ? 'thang' : 'ting'), 400);
  const diemMVP = p => p.tk.ban * 6 + p.tk.kt * 3 + p.tk.cuop + p.tk.cuu * 2 + (p.doi === (diem[0] > diem[1] ? 0 : 1) && diem[0] !== diem[1] ? 2 : 0);
  let mvp = CT[0]; for (const p of CT) if (diemMVP(p) > diemMVP(mvp)) mvp = p;
  const mau = kq === 'THẮNG' ? '#ffe36a' : kq === 'HÒA' ? '#cfe0ff' : '#ff9aa4';
  const hang = CT.slice().sort((a, b) => a.doi - b.doi).map(p => '<tr' + (p === mvp ? ' class="mvp"' : '') + '><td style="text-align:left">' + (p === mvp ? '⭐ ' : '') + p.nv.ten + (p.nguoi ? ' (bạn)' : '') + '</td><td style="color:' + (p.doi ? '#ff7a84' : '#6aa8ff') + '">' + (p.doi ? tenB : tenA) + '</td><td>' + p.tk.ban + '</td><td>' + p.tk.kt + '</td><td>' + p.tk.cuop + '</td><td>' + p.tk.cuu + '</td></tr>').join('');
  let nhacMat = tongGiayChoi >= NGHI_MAT_PHUT * 60 ? '<p style="color:#ffd23a;font-weight:800;font-size:calc(var(--u)*1.7)">👀 Bạn đã chơi khá lâu rồi. Hãy nghỉ mắt, nhìn xa một lúc nhé!</p>' : '';
  if (nhacMat) tongGiayChoi = 0;
  let ky = 0; try { ky = +localStorage.getItem('ego3d_thang') || 0; if (kq === 'THẮNG') { ky++; localStorage.setItem('ego3d_thang', ky); } } catch (e) { }
  $('ketQuaHop').innerHTML = '<div class="ketQuaTo chu3d" style="color:' + mau + '">' + kq + '!</div><div class="diemTo">' + diem[0] + ' – ' + diem[1] + '</div>' +
    '<div style="font-size:calc(var(--u)*1.8);margin-bottom:.4em">MVP trận đấu: <b style="color:#ffe36a">' + mvp.nv.ten + '</b>' + (ky ? ' · Số trận thắng của bạn: ' + ky : '') + '</div>' +
    '<table id="bangKQ" class="ket10"><tr><th style="text-align:left">Cầu thủ</th><th>Lớp</th><th>Bàn</th><th>Kiến tạo</th><th>Cướp</th><th>Cản phá</th></tr>' + hang + '</table>' + nhacMat +
    '<button class="nutLon vang" id="kqLai">Chơi lại</button><button class="nutLon" id="kqVe">Về sảnh</button>';
  $('kqLai').onclick = () => { moAmThanh(); tieng('coi'); batDauGhep(); };
  $('kqVe').onclick = () => veSanh();
  soi = kq === 'THẮNG' ? 1 : 0.2;
}
function veSanh() { ghepId++; tt = 'sanh'; nhomSanh.visible = true; hienLop(['sanh']); for (const p of CT) p.mh.goc.visible = false; B.chu = null; chonNV(CH.nv, true); tieng('ting'); }

// ===================== TẠM DỪNG =====================
function tamDung(chu) {
  if (!['choi', 'demnguoc', 'nhapsan', 'chuyensan'].includes(tt)) return;
  ttTruoc = tt; tt = 'tamdung'; hienLop(['hud', 'cam', 'dungLop']); nhaHet();
  $('dungTieu').textContent = chu ? 'Nghỉ mắt nhé!' : 'Tạm dừng';
  $('dungChu').textContent = chu || 'Bấm "Chơi tiếp" khi bạn sẵn sàng.';
}
$('nutDung').onclick = () => { moAmThanh(); tamDung(); };
$('dungTiep').onclick = () => { if (tt !== 'tamdung') return; tt = ttTruoc; hienLop(['hud', 'cam']); };
$('dungVe').onclick = () => veSanh();
function hienLop(ds) {
  for (const id of ['sanh', 'ghep', 'hud', 'cam', 'ketQuaLop', 'dungLop']) $(id).classList.toggle('hien', ds.includes(id));
  if (!ds.includes('hud')) { $('thongBao').className = ''; $('xemLai').style.display = 'none'; $('gongBar').style.display = 'none'; }
}

// ===================== HUD =====================
let hudCu = '';
function capNhatHUD(ep) {
  const t = Math.max(0, Math.ceil(thoiGian)), mm = (t / 60) | 0, ss = t % 60;
  const dk = diem[0] + ':' + diem[1] + ':' + t;
  if (ep || dk !== hudCu) { hudCu = dk; $('diemX').textContent = diem[0]; $('diemD').textContent = diem[1]; $('dongHo').textContent = mm + ':' + (ss < 10 ? '0' : '') + ss; }
  if (NG) {
    $('nangTen').textContent = NG.nv.ten + ' · ' + NG.nv.vai;
    $('nangTTi').style.width = (NG.tt > 0 ? NG.tt / GIAY_THUC_TINH * 100 : NG.nang) + '%';
    $('nangTT').classList.toggle('day', NG.nang >= 100 && NG.tt <= 0);
    const cs = NG.chieuCd > 0 ? 'hồi ' + Math.ceil(NG.chieuCd) + ' giây' : 'SẴN SÀNG';
    $('nangCh').textContent = NG.nang >= 100 && NG.tt <= 0 ? '⚡ THỨC TỈNH sẵn sàng (F)' : 'Chiêu ' + NG.nv.chieu.ten + ': ' + cs;
    const hoi = document.querySelector('#cChieu .hoi'); if (hoi) hoi.style.height = (NG.chieuCd / GIAY_HOI_CHIEU * 100) + '%';
    $('cTT').classList.toggle('san', NG.nang >= 100 && NG.tt <= 0);
  }
}

// ===================== BẢN ĐỒ NHỎ, MŨI TÊN CHỈ BÓNG, GỢI Ý =====================
const radarC = $('radar'), radarG = radarC.getContext('2d'); let radarK = 0;
function capNhatRadar() {
  const W = radarC.width, H = radarC.height, mx = (x) => (x / SAN_DAI * 0.5 + 0.5) * (W - 16) + 8, mz = (z) => (z / SAN_RONG * 0.5 + 0.5) * (H - 16) + 8;
  radarG.clearRect(0, 0, W, H);
  radarG.fillStyle = 'rgba(30,120,50,.75)'; radarG.fillRect(8, 8, W - 16, H - 16);
  radarG.strokeStyle = 'rgba(255,255,255,.7)'; radarG.lineWidth = 2; radarG.strokeRect(8, 8, W - 16, H - 16);
  radarG.beginPath(); radarG.moveTo(W / 2, 8); radarG.lineTo(W / 2, H - 8); radarG.stroke();
  radarG.beginPath(); radarG.arc(W / 2, H / 2, 14, 0, 7); radarG.stroke();
  for (const p of CT) {
    radarG.fillStyle = p.doi === 0 ? '#4a95ff' : '#ff5a64'; radarG.beginPath(); radarG.arc(mx(p.x), mz(p.z), p.nguoi ? 7 : 5, 0, 7); radarG.fill();
    if (p.nguoi) { radarG.strokeStyle = '#ffe36a'; radarG.lineWidth = 3; radarG.stroke(); }
  }
  radarG.fillStyle = '#fff'; radarG.beginPath(); radarG.arc(mx(B.x), mz(B.z), 4, 0, 7); radarG.fill();
}
function capNhatMuiBong() {
  const e = $('muiBong');
  if (tt !== 'choi') { e.style.display = 'none'; return; }
  ndc3.set(B.x, B.y, B.z).project(camera);
  const ngoai = ndc3.z > 1 || Math.abs(ndc3.x) > 0.95 || ndc3.y > 0.9 || ndc3.y < -0.9;
  if (!ngoai) { e.style.display = 'none'; return; }
  let x = ndc3.x, y = ndc3.y; if (ndc3.z > 1) { x = -x; y = -y; }
  const m = Math.max(Math.abs(x) / 0.88, Math.abs(y) / 0.78, 0.001); x /= m; y /= m;
  e.style.display = 'block'; e.style.left = ((x * 0.5 + 0.5) * innerWidth - 0) + 'px'; e.style.top = ((-y * 0.5 + 0.5) * innerHeight) + 'px';
  e.style.transform = 'translate(-50%,-50%) rotate(' + Math.atan2(-y, x) + 'rad)';
}
let goiYT = 0;
function hienGoiY() {
  let n = 0; try { n = +localStorage.getItem('ego3d_goiy') || 0; localStorage.setItem('ego3d_goiy', n + 1); } catch (e) { }
  goiYT = n < 3 ? 16 : 5;
  $('goiY').textContent = DV.camUng ? 'Kéo cần bên trái để chạy · Giữ nút SÚT rồi thả để sút · CHUYỀN cho bạn cùng đội'
    : 'WASD chạy · Giữ chuột trái rồi thả để SÚT · Chuột phải CHUYỀN · Shift TẮC · Q chiêu · F Thức tỉnh';
}

// ===================== CAMERA =====================
const tamNhin = new THREE.Vector3(), vtCam = new THREE.Vector3(); let camX = 0, camZ = 0, camMoi = true;
function datCamera(dt, che) {
  const asp = innerWidth / innerHeight, ak = Math.max(1, 1.75 / asp);
  let px, py, pz, lx, ly, lz;
  if (che === 'sanh') {
    const a = Math.sin(gioThuc * 0.4) * 0.4, kc = ak > 1.1 ? 1.15 : 1;
    px = Math.sin(a) * 10.5 * kc; py = 3.6; pz = Math.cos(a) * 10.5 * kc; lx = 0; ly = 2.5; lz = 0;
  } else if (che === 'nhapsan') {
    const u = Math.min(1, nhapSanT / 2.4), e = 1 - Math.pow(1 - u, 3);
    px = noi(-62, 0, e); py = noi(26, 26, e); pz = noi(38, 30, e); lx = noi(0, 0, e); ly = 0; lz = 0;
  } else if (che === 'replay') {
    const s = vuaGhi ? vuaGhi.doi === 0 ? 1 : -1 : 1;
    px = s * 24 + (B.x - s * 24) * 0.3; py = 7; pz = 24; lx = B.x * 0.85 + s * 4; ly = 1; lz = B.z * 0.7;
  } else if (che === 'ketqua') {
    px = Math.sin(gioThuc * 0.15) * 62; py = 26; pz = Math.cos(gioThuc * 0.15) * 62; lx = 0; ly = 0; lz = 0;
  } else {
    let fx, fz;
    if (che === 'ghiban' && vuaGhi) { fx = B.x * 0.5 + (vuaGhi.doi === 0 ? 1 : -1) * 10; fz = B.z * 0.4; }
    else if (NG && B.chu === NG) { fx = NG.x; fz = NG.z; }
    else { fx = NG ? noi(B.x, NG.x, 0.35) : B.x; fz = NG ? noi(B.z, NG.z, 0.35) : B.z; }
    fx = kep(fx, -(SAN_DAI - 9), SAN_DAI - 9); fz *= 0.5;
    const k = 1 - Math.exp(-dt * 5);
    if (camMoi) { camX = fx; camZ = fz; camMoi = false; } else { camX += (fx - camX) * k; camZ += (fz - camZ) * k; }
    const rong = (asp > 1.9 ? 0.86 : 1) * (DV.camUng ? 0.9 : 1), Z = zoom * ak * rong; px = camX; py = 21 * zoom * Math.min(ak, 1.3) * rong; pz = camZ + 24 * Z; lx = camX; ly = 0.4; lz = camZ - 1;
  }
  vtCam.set(px, py, pz);
  if (che !== 'sanh' && che !== 'ketqua' && che !== 'nhapsan' && che !== 'replay') camera.position.lerp(vtCam, 1 - Math.exp(-dt * 9)); else camera.position.copy(vtCam);
  tamNhin.lerp(new THREE.Vector3(lx, ly, lz), che === 'choi' || che === 'ghiban' ? 1 - Math.exp(-dt * 9) : 1);
  const r = rung; if (r > 0) camera.position.add(new THREE.Vector3(ngauNhien(-r, r), ngauNhien(-r, r), ngauNhien(-r, r)).multiplyScalar(0.5));
  camera.lookAt(tamNhin);
  anhMat.position.set(tamNhin.x + 18, 40, tamNhin.z + 16); anhMat.target.position.set(tamNhin.x, 0, tamNhin.z);
}

// ===================== VÒNG LẶP CHÍNH =====================
let tCuoi = performance.now(), aimAn = 0;
const ndc3 = new THREE.Vector3();
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); window.addEventListener('orientationchange', () => setTimeout(resize, 200)); resize();

function vong(now) {
  requestAnimationFrame(vong);
  let dt = Math.min(0.05, (now - tCuoi) / 1000); tCuoi = now; gioThuc += dt;
  capNhatHat(dt); capNhatVong(dt);
  if (chopT > 0) { chopT = Math.max(0, chopT - dt * 2.2); $('chop').style.opacity = Math.min(0.85, chopT); }
  if (rung > 0) rung = Math.max(0, rung - dt * 1.6);
  if (zoom < 1 && tt !== 'sanh') zoom = Math.min(1, zoom + dt * 0.7);
  soi = Math.max(0, soi - dt * 0.25);
  for (const l of luoiList) { if (l.rung > 0) { l.rung = Math.max(0, l.rung - dt * 1.1); l.sau.position.x = KHUNG_SAU + Math.sin(l.rung * 36) * 0.3 * l.rung; } }
  if (Math.floor(gioThuc * 30) !== vong.k) { vong.k = Math.floor(gioThuc * 30); capNhatDongNguoi(gioThuc, soi); }

  if (tt === 'sanh' || tt === 'ghep') {
    sanhPop = Math.max(0, sanhPop - dt);
    const m = sanhMH[CH.nv], p = sanhP[CH.nv];
    p.ang = Math.sin(gioThuc * 0.9) * 0.6 + 0.2; p.phase = gioThuc * 2; p.spd = 0;
    if (sanhMungT > 0) { sanhMungT -= dt; p.mung = CH.mung; p.mungT += dt; p.ny = p.mung === 'nhay' ? Math.abs(Math.sin(p.mungT * 8)) * 0.9 : 0; p.xoayNguoi = p.mung === 'xoay' ? p.mungT * 12 : 0; }
    else { p.mung = null; p.mungT = 0; p.ny = 0; p.xoayNguoi = 0; }
    veNguoi(p); m.goc.position.y = 0.4 + (p.ny || 0) * 1.6;
    const pp = 1 + Math.sin(Math.min(1, sanhPop * 2) * Math.PI) * 0.18; m.goc.scale.setScalar(1.6 * pp);
    bucVong.rotation.z = gioThuc; chum.material.opacity = 0.09 + Math.sin(gioThuc * 2) * 0.03;
    bongMesh.position.set(2.9, BONG_R + 0.4 + Math.abs(Math.sin(gioThuc * 3)) * 1.3, 1.6); bongMesh.rotation.x += dt * 3;
    datCamera(dt, 'sanh');
  } else {
    // ----- các trạng thái trong trận -----
    if (tt === 'nhapsan') {
      nhapSanT += dt; chayVaoViTri(Math.min(1, nhapSanT / 2.2), dt);
      if (nhapSanT >= 2.6) { tt = 'demnguoc'; demT = 0; demSo = 4; }
    } else if (tt === 'demnguoc') {
      chayVaoViTri(1, dt); demT += dt;
      const so = 3 - Math.floor(demT);
      if (so !== demSo && so >= 1) { demSo = so; const e = $('demNguoc'); e.textContent = so; e.className = ''; void e.offsetWidth; e.className = 'dap'; tieng('dem'); }
      if (demT >= 3) { tt = 'choi'; tieng('coiDai'); thongBao('BẮT ĐẦU!', true, 900); }
    } else if (tt === 'chuyensan') {
      chuyenSanT += dt; chayVaoViTri(Math.min(1, chuyenSanT / 1.4), dt);
      if (chuyenSanT >= 1.7) { tt = 'choi'; tieng('coi'); }
    } else if (tt === 'choi' || tt === 'ghiban') {
      let ts = chamT > 0 ? 0.35 : 1; if (tt === 'ghiban') ts = Math.min(ts, 0.7);
      if (chamT > 0) chamT -= dt;
      const dtg = dt * ts;
      if (tt === 'choi') {
        thoiGian -= dtg; tongGiayChoi += dt;
        if (thoiGian <= 0 && !vang) { thoiGian = 0; if (diem[0] === diem[1]) batVang(); else ketThuc(); }
        else if (thoiGian <= 0 && vang) { thoiGian = 0; ketThuc(); }
        if (tt === 'choi' && !daNhacMat && tongGiayChoi >= NGHI_MAT_PHUT * 60) { daNhacMat = true; tongGiayChoi = 0; tamDung('Bạn đã chơi 15 phút. Hãy nhìn ra xa 20 giây rồi chơi tiếp nhé!'); }
      } else { ghibanT += dt; if (ghibanT > 2.1) batDauReplay(); }
      if (tt === 'choi' || tt === 'ghiban') {
        capNhatChuot();
        const n = Math.max(1, Math.ceil(dtg / (1 / 90))), h = dtg / n; let xung = layXung();
        for (let i = 0; i < n; i++) { buocVatLy(h, xung); xung = {}; if (tt !== 'choi' && tt !== 'ghiban') break; }
        if (tt === 'choi' || (tt === 'ghiban' && ghibanT < 1.4)) chupREC();
      }
    } else if (tt === 'replay') { phatReplay(dt); }
    else if (tt === 'ketqua') { for (const p of CT) { p.spd = 0; } }
    // vẽ cầu thủ
    for (const p of CT) {
      if (tt === 'ghiban' || tt === 'choi') { if (p.mung === 'truot' && p.mungT < 1.1) { p.x += p.dashX * 6 * Math.max(0, 1 - p.mungT) * dt; p.z += p.dashZ * 6 * Math.max(0, 1 - p.mungT) * dt; } }
      veNguoi(p);
      p.mh.nhan.visible = p.nguoi || Math.hypot(p.x - B.x, p.z - B.z) < 24;
      if (p.mh.vong) p.mh.vong.rotation.z += dt;
    }
    if (tt === 'ketqua') { const k = diem[0] > diem[1] ? 0 : 1; if (diem[0] !== diem[1]) for (const p of CT) { if (p.doi === k) { p.mung = 'nhay'; p.mungT += dt; p.ny = Math.abs(Math.sin(p.mungT * 8)) * 0.8; } } }
    // quả bóng + hiệu ứng
    bongMesh.position.set(B.x, B.y, B.z); bongMesh.rotation.set(B.quayX, 0, B.quayZ);
    const sp = Math.hypot(B.vx, B.vz) + Math.abs(B.vy);
    if (!B.chu && (tt === 'choi' || tt === 'ghiban') && sp > 12) {
      if (B.xuyen) { toaHat(B.x, B.y, B.z, 2, 0xc48fff, 2.2, 0.35, 0.6, 0, 0); }
      if (B.sieu) { toaHat(B.x, B.y, B.z, 2, 0x80d0ff, 2.2, 0.35, 0.6, 0, 0); if (Math.random() < 0.5) hat(B.x + ngauNhien(-.5, .5), B.y + ngauNhien(-.5, .5), B.z + ngauNhien(-.5, .5), 0, 0, 0, 0xffffff, 0.12, 0.9, 0.2, 0); }
      else if (sp > 22) hat(B.x, B.y, B.z, 0, 0.5, 0, 0xffe0a0, 0.28, 0.7, 0.1, 0);
    }
    bongQuang.position.set(B.x, B.y, B.z); bongQuang.material.opacity = (B.sieu && !B.chu) ? 0.8 : 0; bongQuang.material.color.set(0x70c8ff);
    for (const s of veTrail) s.visible = false;
    // mũi tên ngắm + thanh gồng
    const hien = NG && tt === 'choi' && (NG.gong > 0.02 || (B.chu === NG && !DV.camUng && DV.chuot));
    if (hien) {
      const a = huongNgam(NG, DV.joy.x, DV.joy.y), len = 2.5 + (NG.gong / GIAY_GONG) * 7;
      muiNgam.visible = true; muiNgam.rotation.order = 'YXZ'; muiNgam.rotation.set(-Math.PI / 2, Math.atan2(-a.x, -a.z), 0);
      muiNgam.position.set(NG.x + a.x * (len / 2 + 0.7), 0.07, NG.z + a.z * (len / 2 + 0.7)); muiNgam.scale.set(1 + NG.gong, len, 1);
      muiNgam.material.opacity = B.chu === NG ? 0.45 + NG.gong * 0.5 : 0.25;
    } else muiNgam.visible = false;
    const gb = $('gongBar');
    if (NG && tt === 'choi' && NG.gong > 0.03) {
      ndc3.set(NG.x, 3.4, NG.z).project(camera); gb.style.display = 'block';
      gb.style.left = ((ndc3.x * 0.5 + 0.5) * innerWidth) + 'px'; gb.style.top = ((-ndc3.y * 0.5 + 0.5) * innerHeight) + 'px';
      $('gongI').style.width = (NG.gong / GIAY_GONG * 100) + '%';
    } else gb.style.display = 'none';
    if (tt !== 'ketqua') capNhatHUD(false);
    if ((radarK++ & 1) === 0) capNhatRadar();
    capNhatMuiBong();
    if (tt === 'choi' && goiYT > 0) { goiYT -= dt; $('goiY').style.opacity = goiYT > 0 ? 1 : 0; } else if (tt !== 'choi' && tt !== 'demnguoc' && tt !== 'nhapsan') $('goiY').style.opacity = 0;
    datCamera(dt, tt === 'tamdung' ? ttTruoc : tt);
  }
  renderer.render(scene, camera);
}
let demSo = 4;
dungSanh(); hienLop(['sanh']);
camera.position.set(0, 3.6, 10.5); tamNhin.set(0, 2.5, 0);
requestAnimationFrame(vong);
window.__ego = { get tt() { return tt; }, get CT() { return CT; }, B, diem, CH, DV, batDauGhep, vaoSan, ketThuc, get thoiGian() { return thoiGian; }, set thoiGian(v) { thoiGian = v; }, sut, chuyen, dungChieu, tac, get NG() { return NG; }, NHAN_VAT, chonNV, camera, scene, renderer, get vang() { return vang; } };
