// ===================== MÔ HÌNH NHÂN VẬT =====================
// Dùng lại hình khối giống nhau để máy điện thoại đỡ nặng
const _kho = new Map();
function G(lop) { const a = Array.prototype.slice.call(arguments, 1), k = a.join(","); let m = _kho.get(lop); if (!m) { m = new Map(); _kho.set(lop, m); } let g = m.get(k); if (!g) { g = new lop(...a); m.set(k, g); } return g; }
function con(cha, o) { cha.add(o); return o; }   // thêm vật con rồi trả về chính vật đó
// ===== Khuôn mặt bằng ảnh thật (chỉ Nho): dán ảnh lên một chỏm cầu phía trước đầu =====
const _anhTex = {};   // mỗi bạn có ảnh riêng, tạo một lần rồi dùng lại
function layAnhMat(id) {
  if (_anhTex[id]) return _anhTex[id];
  const c = document.createElement("canvas"); c.width = c.height = 192;
  const tex = _anhTex[id] = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const im = new Image();
  im.onload = () => {
    const g = c.getContext("2d"); g.clearRect(0, 0, 192, 192); g.drawImage(im, 0, 0, 192, 192);
    g.globalCompositeOperation = "destination-in";            // làm mờ viền tròn cho hòa vào đầu
    const m = ANH_MASK[id];
    g.save(); g.translate(m[0], m[1]); g.scale(m[2], 1);             // vùng bầu dục ôm khuôn mặt, bỏ nền xung quanh
    const gr = g.createRadialGradient(0, 0, m[3] * 0.7, 0, 0, m[3]); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(0.75, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(-130, -130, 260, 260); g.restore(); tex.needsUpdate = true;
  };
  im.src = ANH[id]; return tex;
}
function taoKhuonMat(id) {
  const R = 0.508, a = 1.05, b = 1.0;
  const geo = new THREE.SphereGeometry(R, 36, 28, Math.PI / 2 - a, 2 * a, Math.PI / 2 - b, 2 * b);
  const pos = geo.attributes.position, uv = geo.attributes.uv, rc = R * Math.sin(a);
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (2 * rc), 0.5 + (pos.getY(i) - 0.02) / (2 * rc));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: layAnhMat(id), transparent: true, color: 0xf4f4f4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
}
const hinhTru = (r1, r2, h, n) => G(THREE.CylinderGeometry, r1, r2, h, n || 14);
function matLieu(mau, rough) { return new THREE.MeshStandardMaterial({ color: mau, roughness: rough == null ? 0.65 : rough }); }

function taoToc(kieu, mauToc) {
  const g = new THREE.Group(), m = matLieu(mauToc, 0.85);
  const them = (geo, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; g.add(o); return o; };
  switch (kieu) {
    case 'nhon':   // tóc nhọn như gai
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = 0.27; them(G(THREE.ConeGeometry, 0.13, 0.5, 8), Math.sin(a) * r, 0.4, Math.cos(a) * r * 0.9 - 0.03, Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); }
      them(G(THREE.ConeGeometry, 0.17, 0.62, 8), 0, 0.5, 0);
      them(G(THREE.SphereGeometry, 0.485, 20, 12, 0, 6.283, 0, 1.15), 0, 0.02, -0.02);
      break;
    case 'tron':   // tóc tròn như cái bát
      them(G(THREE.SphereGeometry, 0.5, 22, 14, 0, 6.283, 0, 1.75), 0, 0.03, -0.03);
      break;
    case 'maibang': // mái bằng
      them(G(THREE.SphereGeometry, 0.49, 22, 14, 0, 6.283, 0, 1.4), 0, 0.03, -0.04);
      them(G(THREE.BoxGeometry, 0.74, 0.17, 0.16), 0, 0.26, 0.4);
      break;
    case 'xoan':   // tóc xoăn bằng nhiều quả cầu nhỏ
      them(G(THREE.SphereGeometry, 0.48, 18, 10, 0, 6.283, 0, 1.2), 0, 0.03, -0.04);
      for (let i = 0; i < 16; i++) { const a = i * 2.4, b = 0.25 + (i % 4) * 0.2, r = 0.38 * Math.cos(b); them(G(THREE.SphereGeometry, 0.17, 8, 8), Math.sin(a) * r, 0.1 + Math.sin(b) * 0.38, Math.cos(a) * r - 0.04); }
      break;
    case 'renguoi': // rẽ ngôi, lọn tóc nghiêng
      them(G(THREE.SphereGeometry, 0.49, 22, 14, 0, 6.283, 0, 1.5), 0, 0.03, -0.05);
      them(G(THREE.BoxGeometry, 0.5, 0.15, 0.2), -0.18, 0.3, 0.33, 0.15, 0, 0.45);
      them(G(THREE.BoxGeometry, 0.5, 0.15, 0.2), 0.2, 0.3, 0.33, 0.15, 0, -0.45);
      break;
    case 'bandau': { // tóc ngắn + băng đô
      them(G(THREE.SphereGeometry, 0.485, 22, 14, 0, 6.283, 0, 1.25), 0, 0.03, -0.03);
      const b = new THREE.Mesh(G(THREE.TorusGeometry, 0.46, 0.055, 8, 28), matLieu(0xff3a6a, 0.5));
      b.rotation.x = Math.PI / 2; b.position.y = 0.17; g.add(b); break;
    }
  }
  g.traverse(o => { o.castShadow = true; });
  return g;
}

function taoNhan(chu, mau) {   // tên bay trên đầu
  const t = canvasTex(256, 64, (g, w, h) => {
    g.font = '900 38px "Segoe UI",Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(chu, w / 2, h / 2 + 2);
    g.fillStyle = mau; g.fillText(chu, w / 2, h / 2 + 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
  s.scale.set(2.6, 0.65, 1); s.renderOrder = 10; return s;
}

// Dựng một cầu thủ: nv = nhân vật; mauAo/mauQuan/mauTat = màu đồ; tm = thủ môn; minh = là người chơi
function taoMoHinh(nv, mauAo, mauQuan, mauTat, tm, mauGiay, minh) {
  const goc = new THREE.Group();          // nhóm gốc: vị trí + hướng
  const than = new THREE.Group(); goc.add(than);   // nhóm thân: nghiêng, nảy
  const da = matLieu(nv.da, 0.7), ao = matLieu(mauAo, 0.55), quan = matLieu(mauQuan, 0.6), tat = matLieu(mauTat, 0.7);
  const giay = matLieu(new THREE.Color(mauGiay || '#ffffff'), 0.4);
  const chuyen = {};
  const mk = (geo, mat, x, y, z) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; return o; };
  // chân (trục xoay ở hông)
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * 0.2, 0.82, 0);
    pv.add(mk(hinhTru(0.17, 0.15, 0.34), quan, 0, -0.14, 0));
    pv.add(mk(hinhTru(0.11, 0.1, 0.34), da, 0, -0.4, 0));
    pv.add(mk(hinhTru(0.13, 0.12, 0.28), tat, 0, -0.56, 0));
    pv.add(mk(G(THREE.BoxGeometry, 0.22, 0.14, 0.38), giay, 0, -0.74, 0.07));
    than.add(pv); chuyen[s < 0 ? 'chanT' : 'chanP'] = pv;
  }
  // thân
  than.add(mk(hinhTru(0.4, 0.34, 0.84, 18), ao, 0, 1.22, 0));
  con(than, mk(G(THREE.SphereGeometry, 0.4, 16, 10), ao, 0, 1.64, 0)).scale.set(1, 0.45, 0.85);
  con(than, mk(G(THREE.SphereGeometry, 0.34, 16, 10), quan, 0, 0.82, 0)).scale.set(1, 0.5, 0.9);
  // số áo ở lưng
  const so = new THREE.Mesh(G(THREE.PlaneGeometry, 0.56, 0.56), new THREE.MeshBasicMaterial({
    transparent: true, depthWrite: false, map: canvasTex(64, 64, (g) => { g.font = '900 52px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 5; g.strokeText(nv.so, 32, 36); g.fillText(nv.so, 32, 36); })
  }));
  so.position.set(0, 1.28, -0.39); so.rotation.y = Math.PI; than.add(so);
  // tay
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * 0.5, 1.56, 0);
    pv.add(mk(hinhTru(0.12, 0.11, 0.3), ao, 0, -0.1, 0));
    pv.add(mk(hinhTru(0.085, 0.075, 0.36), da, 0, -0.38, 0));
    pv.add(mk(G(THREE.SphereGeometry, tm ? 0.15 : 0.1, 10, 8), tm ? matLieu(0xff7a1a, 0.5) : da, 0, -0.6, 0));
    than.add(pv); chuyen[s < 0 ? 'tayT' : 'tayP'] = pv;
  }
  // đầu to kiểu hoạt hình
  const dau = new THREE.Group(); dau.position.y = 2.12; than.add(dau); chuyen.dau = dau;
  const dauMesh = mk(G(THREE.SphereGeometry, 0.5, 24, 18), nv.anh ? new THREE.MeshBasicMaterial({ color: nv.anhDa }) : da, 0, 0, 0); dau.add(dauMesh);
  const trang = matLieu(0xffffff, 0.3), den = matLieu(0x111111, 0.3);
  if (nv.anh) dau.add(taoKhuonMat(nv.id));
  else for (const s of [-1, 1]) {
    con(dau, mk(G(THREE.SphereGeometry, 0.115, 12, 10), trang, s * 0.19, 0.04, 0.42)).scale.set(1, 1.15, 0.6);
    dau.add(mk(G(THREE.SphereGeometry, 0.065, 10, 8), den, s * 0.19, 0.03, 0.475));
    con(dau, mk(G(THREE.BoxGeometry, 0.17, 0.035, 0.04), den, s * 0.2, 0.2, 0.44)).rotation.z = -s * 0.12;
    const ma = mk(G(THREE.CircleGeometry, 0.07, 10), matLieu(0xff8a8a, 0.9), s * 0.32, -0.13, 0.4); ma.rotation.y = s * 0.7; ma.castShadow = false; dau.add(ma);
  }
  if (!nv.anh) { const cuoi = new THREE.Mesh(G(THREE.TorusGeometry, 0.1, 0.022, 6, 14, Math.PI), den);
  cuoi.position.set(0, -0.14, 0.47); cuoi.rotation.z = Math.PI; cuoi.rotation.y = 0; dau.add(cuoi); }
  dau.add(taoToc(nv.kieuToc, nv.mauToc));
  // nhãn tên + vòng chân
  const nhan = taoNhan(nv.ten, minh ? '#ffe36a' : '#ffffff'); nhan.position.y = 3.35; goc.add(nhan);
  if (minh) {
    const vong = new THREE.Mesh(G(THREE.RingGeometry, 0.75, 0.95, 32), new THREE.MeshBasicMaterial({ color: 0xffe36a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
    vong.rotation.x = -Math.PI / 2; vong.position.y = 0.04; goc.add(vong); chuyen.vong = vong;
    const mui = new THREE.Mesh(G(THREE.ConeGeometry, 0.28, 0.5, 4), new THREE.MeshBasicMaterial({ color: 0xffe36a }));
    mui.rotation.x = Math.PI; mui.position.y = 2.95; goc.add(mui); chuyen.mui = mui; nhan.position.y = 3.65;
  }
  chuyen.than = than; chuyen.giayMat = giay; chuyen.goc = goc; chuyen.nhan = nhan;
  return chuyen;
}

// ===================== QUẢ BÓNG =====================
const bongMesh = new THREE.Mesh(G(THREE.SphereGeometry, BONG_R, 24, 16), new THREE.MeshStandardMaterial({
  roughness: 0.4, map: canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#16181f';
    for (let i = 0; i < 12; i++) { const x = (i % 6) * 46 + (i > 5 ? 23 : 0) + 18, y = i > 5 ? 90 : 38; g.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283 - 1.57; g.lineTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17); } g.fill(); }
  })
}));
bongMesh.castShadow = true; scene.add(bongMesh);
const bongQuang = new THREE.Sprite(new THREE.SpriteMaterial({ map: texTron, color: 0xffa030, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
bongQuang.scale.set(3, 3, 1); scene.add(bongQuang);
const veTrail = [];  // vệt bóng
for (let i = 0; i < 14; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texTron, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.visible = false; scene.add(s); veTrail.push(s);
}
// mũi tên ngắm trên sân
const muiNgam = new THREE.Mesh(G(THREE.PlaneGeometry, 1, 1), new THREE.MeshBasicMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.9,
  map: canvasTex(64, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,240,120,.95)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w - 4, 70); g.lineTo(w * .68, 70); g.lineTo(w * .68, h); g.lineTo(w * .32, h); g.lineTo(w * .32, 70); g.lineTo(4, 70); g.closePath(); g.fill();
  })
}));
muiNgam.rotation.x = -Math.PI / 2; muiNgam.visible = false; muiNgam.renderOrder = 5; scene.add(muiNgam);

// ===================== HOẠT HÌNH CẦU THỦ =====================
// p cần có: x,z,ang,phase,spd,kick,truot,dive,diveDir,ny (nhảy), nghieng, xoayNguoi, mung ('nhay'|'xoay'|'truot'|null), mungT
function veNguoi(p) {
  const m = p.mh, tr = Math.min(1, p.spd / 7);
  m.goc.position.set(p.x, p.ny || 0, p.z);
  m.goc.rotation.set(0, p.ang + (p.xoayNguoi || 0), 0);
  const s = Math.sin(p.phase);
  let chanT = s * 0.95 * tr, chanP = -s * 0.95 * tr, tayT = -s * 0.8 * tr, tayP = s * 0.8 * tr, ngha = 0.1 * tr, tayZ = 0.08;
  let thanY = Math.abs(Math.sin(p.phase)) * 0.09 * tr, nghZ = 0;
  if (p.kick > 0) { const u = 1 - p.kick / 0.3; chanP = u < 0.4 ? 0.9 * (u / 0.4) : -1.5 * (1 - (u - 0.4) / 0.6) + 0.1; ngha = 0.25; tayT = -1.1 * Math.sin(u * 3); }
  if (p.truot > 0) { chanT = -1.5; chanP = 0.3; ngha = -0.9; thanY = -0.35; tayT = tayP = -1.2; tayZ = 0.9; }
  if (p.dive > 0) { const u = Math.sin((1 - p.dive / 0.55) * 3.14); nghZ = -p.diveDir * 1.15 * u; thanY = 0.5 * u; tayT = tayP = 3.0 * u; tayZ = 0.3; }
  if (p.stun > 0) { ngha = 0.2; tayT = tayP = -0.3; chanT = chanP = 0; tayZ = 0.6 + Math.sin(p.phase * 3) * 0.2; }
  if (p.giu > 0) { tayT = tayP = -1.6; tayZ = 0.2; }
  if (p.lonT > 0) { const u = 1 - p.lonT / 0.65; ngha = -u * Math.PI * 2; chanP = -1.3; chanT = 0.9; tayT = tayP = 2.6; tayZ = 0.6; thanY = 0; }
  else if (p.nhayT > 0) { const u = 1 - p.nhayT / 0.5; chanT = -0.6; chanP = 1.2 - u * 2.2; ngha = 0.3; tayT = tayP = 1.6; tayZ = 0.5; }
  if (p.mung) {
    if (p.mung === 'nhay') { tayT = tayP = 3.0; tayZ = 0.5; chanT = Math.sin(p.mungT * 14) * 0.5; chanP = -chanT; }
    else if (p.mung === 'xoay') { tayT = tayP = 2.8; tayZ = 1.1; }
    else if (p.mung === 'truot') { chanT = -0.5; chanP = -0.5; ngha = -1.1; thanY = -0.45; tayT = tayP = 2.2; tayZ = 0.5; }
  }
  m.than.rotation.x = ngha; m.than.rotation.z = nghZ; m.than.position.y = thanY;
  m.chanT.rotation.x = chanT; m.chanP.rotation.x = chanP;
  m.tayT.rotation.x = tayT; m.tayP.rotation.x = tayP; m.tayT.rotation.z = tayZ; m.tayP.rotation.z = -tayZ;
  m.dau.rotation.y = Math.sin(p.phase * 0.5) * 0.06;
  if (m.mui) m.mui.position.y = 2.95 + Math.sin(performance.now() / 180) * 0.12;
}
