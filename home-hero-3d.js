/**
 * Homepage Seoul × NEWON hero — one curtain-wall tower that grows upward.
 * Lobby stays fixed. Each business zone is clipped from the bottom of that
 * zone, so floors rise in place. Camera is framed for the finished tower.
 */
import * as THREE from "/vendor/three/three.module.min.js";

const MODULES = [
  { id: "consumer", name: "NEWON CONSUMER", num: "01", icon: "phone", terrace: true },
  { id: "ai", name: "NEWON AI", num: "02", icon: "nodes", terrace: false },
  { id: "lifestage", name: "LIFE STAGE", num: "03", icon: "people", terrace: true },
  { id: "ongil", name: "ONGIL", num: "04", icon: "heart", terrace: false },
  { id: "business", name: "NEWON BUSINESS", num: "05", icon: "bars", terrace: true },
  { id: "commerce", name: "NEWON COMMERCE", num: "06", icon: "bag", terrace: true, crown: true },
];

const WARM = 0xf0c48a;
const FLOORS = 8;
const FLOOR_H = 0.62;
const ZONE_H = FLOORS * FLOOR_H;
const BASE_H = 4.35;
const TOWER_W = 7.9;
const TOWER_D = 7.22;
const CORNER = 0.42;
const TWIST = 0.185;
const RING = 48;

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function isBuildPreview() {
  const q = new URLSearchParams(location.search);
  return q.get("nh3d") === "build" || q.get("hero3d") === "build";
}
function isLowEnd() {
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  return cores <= 4 || mem <= 4 || (touch && window.innerWidth < 720);
}
function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
function taperAt(i) {
  return 1 - i * 0.012;
}
function restY(i) {
  return BASE_H + i * ZONE_H;
}
function towerTop() {
  return BASE_H + MODULES.length * ZONE_H + 1.15;
}

function sampleRing(w, d, r, n) {
  const hw = w / 2;
  const hd = d / 2;
  r = Math.min(r, hw - 0.05, hd - 0.05);
  const sx = Math.max(0.01, w - 2 * r);
  const sz = Math.max(0.01, d - 2 * r);
  const arc = (Math.PI / 2) * r;
  const perim = 2 * sx + 2 * sz + 4 * arc;
  const pts = [];
  for (let i = 0; i < n; i++) {
    let dist = (i / n) * perim;
    let x;
    let z;
    let nx;
    let nz;
    if (dist <= sx) {
      x = -hw + r + dist;
      z = -hd;
      nx = 0;
      nz = -1;
    } else {
      dist -= sx;
      if (dist <= arc) {
        const a = -Math.PI / 2 + dist / r;
        x = hw - r + Math.cos(a) * r;
        z = -hd + r + Math.sin(a) * r;
        nx = Math.cos(a);
        nz = Math.sin(a);
      } else {
        dist -= arc;
        if (dist <= sz) {
          x = hw;
          z = -hd + r + dist;
          nx = 1;
          nz = 0;
        } else {
          dist -= sz;
          if (dist <= arc) {
            const a = dist / r;
            x = hw - r + Math.cos(a) * r;
            z = hd - r + Math.sin(a) * r;
            nx = Math.cos(a);
            nz = Math.sin(a);
          } else {
            dist -= arc;
            if (dist <= sx) {
              x = hw - r - dist;
              z = hd;
              nx = 0;
              nz = 1;
            } else {
              dist -= sx;
              if (dist <= arc) {
                const a = Math.PI / 2 + dist / r;
                x = -hw + r + Math.cos(a) * r;
                z = hd - r + Math.sin(a) * r;
                nx = Math.cos(a);
                nz = Math.sin(a);
              } else {
                dist -= arc;
                if (dist <= sz) {
                  x = -hw;
                  z = hd - r - dist;
                  nx = -1;
                  nz = 0;
                } else {
                  dist -= sz;
                  const a = Math.PI + dist / r;
                  x = -hw + r + Math.cos(a) * r;
                  z = -hd + r + Math.sin(a) * r;
                  nx = Math.cos(a);
                  nz = Math.sin(a);
                }
              }
            }
          }
        }
      }
    }
    pts.push({ x, z, nx, nz });
  }
  return pts;
}

function rotateY(x, z, rot) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  return { x: x * c + z * s, z: -x * s + z * c };
}

function loftSkin(opts) {
  const {
    w0,
    d0,
    r0,
    w1,
    d1,
    r1,
    height,
    levels,
    rot0,
    rot1,
    n = RING,
    y0 = 0,
  } = opts;
  const pos = [];
  const nrm = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= levels; i++) {
    const t = i / levels;
    const w = lerp(w0, w1, t);
    const d = lerp(d0, d1, t);
    const r = lerp(r0, r1, t);
    const rot = lerp(rot0, rot1, t);
    const y = y0 + t * height;
    const ring = sampleRing(w, d, r, n);
    for (let j = 0; j < n; j++) {
      const p = ring[j];
      const q = rotateY(p.x, p.z, rot);
      const nn = rotateY(p.nx, p.nz, rot);
      pos.push(q.x, y, q.z);
      nrm.push(nn.x, 0, nn.z);
      uv.push(j / n, t);
    }
  }
  for (let i = 0; i < levels; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      const c = (i + 1) * n + j;
      const d = (i + 1) * n + ((j + 1) % n);
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function loftCap(w, d, r, y, rot, n = RING) {
  const ring = sampleRing(w, d, r, n);
  const pos = [0, y, 0];
  const uv = [0.5, 0.5];
  const idx = [];
  for (let j = 0; j < n; j++) {
    const q = rotateY(ring[j].x, ring[j].z, rot);
    pos.push(q.x, y, q.z);
    uv.push(0.5 + ring[j].x / w, 0.5 + ring[j].z / d);
  }
  for (let j = 0; j < n; j++) {
    idx.push(0, j + 1, ((j + 1) % n) + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function officeTexture(seed, cols, rows) {
  const w = 768;
  const h = 1536;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, w, h);
  const cw = w / cols;
  const rh = h / rows;
  for (let row = 0; row < rows; row++) {
    ctx.fillStyle = "#1a2430";
    ctx.fillRect(0, row * rh, w, rh * 0.16);
    ctx.fillRect(0, row * rh + rh * 0.86, w, rh * 0.14);
    for (let col = 0; col < cols; col++) {
      const n = (col * 19 + row * 37 + seed * 11) % 10;
      const x = col * cw + cw * 0.14;
      const y = row * rh + rh * 0.2;
      const ww = cw * 0.72;
      const hh = rh * 0.62;
      if (n > 3) {
        const a = 0.45 + (n % 4) * 0.13;
        ctx.fillStyle = `rgba(255, 206, 140, ${a})`;
        ctx.fillRect(x, y, ww, hh);
        ctx.fillStyle = `rgba(255, 236, 200, ${a * 0.35})`;
        ctx.fillRect(x, y, ww, hh * 0.28);
      } else if (n === 2) {
        ctx.fillStyle = "rgba(150, 188, 210, 0.16)";
        ctx.fillRect(x, y, ww, hh);
      } else {
        ctx.fillStyle = "rgba(18, 28, 36, 0.95)";
        ctx.fillRect(x, y, ww, hh);
      }
    }
  }
  ctx.fillStyle = "rgba(170, 188, 204, 0.18)";
  for (let col = 0; col <= cols; col++) ctx.fillRect(col * cw - 1, 0, 2, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function drawIcon(ctx, kind, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (kind === "phone") {
    ctx.beginPath();
    ctx.roundRect(-s * 0.18, -s * 0.34, s * 0.36, s * 0.68, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, s * 0.24, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "nodes") {
    const pts = [
      [0, -s * 0.28],
      [-s * 0.26, s * 0.06],
      [s * 0.26, s * 0.06],
      [0, s * 0.3],
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    pts.slice(1).forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.moveTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.stroke();
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3.1, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (kind === "people") {
    ctx.beginPath();
    ctx.arc(-s * 0.14, -s * 0.16, s * 0.1, 0, Math.PI * 2);
    ctx.arc(s * 0.16, -s * 0.16, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s * 0.14, s * 0.22, s * 0.18, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.16, s * 0.22, s * 0.18, Math.PI, 0);
    ctx.stroke();
  } else if (kind === "heart") {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.28);
    ctx.bezierCurveTo(s * 0.42, 0.02, s * 0.28, -s * 0.32, 0, -s * 0.1);
    ctx.bezierCurveTo(-s * 0.28, -s * 0.32, -s * 0.42, 0.02, 0, s * 0.28);
    ctx.stroke();
  } else if (kind === "bars") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.2);
    ctx.lineTo(-s * 0.28, -s * 0.02);
    ctx.moveTo(-s * 0.08, s * 0.2);
    ctx.lineTo(-s * 0.08, -s * 0.22);
    ctx.moveTo(s * 0.12, s * 0.2);
    ctx.lineTo(s * 0.12, 0.02);
    ctx.moveTo(s * 0.32, s * 0.2);
    ctx.lineTo(s * 0.32, -s * 0.3);
    ctx.stroke();
  } else {
    ctx.strokeRect(-s * 0.16, -s * 0.06, s * 0.32, s * 0.28);
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.06);
    ctx.lineTo(0, -s * 0.28);
    ctx.lineTo(s * 0.2, -s * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}

function makeSign(mod) {
  const c = document.createElement("canvas");
  c.width = 1408;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 1408, 512);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "600 72px 'Noto Sans', system-ui, sans-serif";
  ctx.fillText(mod.num, 704, 118);
  ctx.font = "700 96px 'Noto Sans', system-ui, sans-serif";
  const parts = mod.name.split(" ");
  if (parts.length > 1) {
    ctx.fillText(parts[0], 704, 250);
    ctx.fillText(parts.slice(1).join(" "), 704, 360);
  } else {
    ctx.fillText(mod.name, 704, 292);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 2.32),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  );
  mesh.renderOrder = 3;
  return mesh;
}

function makeLobbySign() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 420;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 1024, 420);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 128px 'Noto Sans', system-ui, sans-serif";
  ctx.fillText("NEWON", 512, 200);
  ctx.font = "500 28px 'Noto Sans', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText("A BETTER TOMORROW FOR EVERYONE", 512, 268);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 2.2),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  );
  mesh.renderOrder = 3;
  return mesh;
}

function makeMats(_quality) {
  const metal = new THREE.MeshStandardMaterial({
    color: 0xb7c4d0,
    metalness: 0.82,
    roughness: 0.22,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x2c3640,
    metalness: 0.45,
    roughness: 0.46,
  });
  const slab = new THREE.MeshStandardMaterial({
    color: 0x1c262f,
    metalness: 0.12,
    roughness: 0.72,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xe2bc74,
    emissive: 0xd4a45a,
    emissiveIntensity: 0.82,
    metalness: 0.5,
    roughness: 0.28,
    toneMapped: false,
  });
  const plant = new THREE.MeshStandardMaterial({
    color: 0x1f4630,
    roughness: 0.9,
    metalness: 0,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x8ea8bb,
    metalness: 0.62,
    roughness: 0.1,
    transparent: true,
    opacity: 0.42,
    envMapIntensity: 1.55,
    depthWrite: true,
  });
  return { metal, darkMetal, slab, gold, plant, glass };
}

function bindClip(root, plane) {
  root.traverse((obj) => {
    if (obj.userData && obj.userData.noClip) return;
    if (!obj.material) return;
    const list = Array.isArray(obj.material) ? obj.material : [obj.material];
    list.forEach((m) => {
      m.clippingPlanes = [plane];
      m.clipShadows = true;
    });
  });
}

function addMullions(group, spec, mat, floors, quality) {
  const nCol = quality.low ? 14 : 22;
  const dummy = new THREE.Object3D();
  const geo = new THREE.BoxGeometry(0.05, FLOOR_H * 0.92, 0.068);
  const count = nCol * floors;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  let k = 0;
  for (let f = 0; f < floors; f++) {
    const t = (f + 0.5) / floors;
    const w = lerp(spec.w0, spec.w1, t);
    const d = lerp(spec.d0, spec.d1, t);
    const r = lerp(spec.r0, spec.r1, t);
    const rot = lerp(spec.rot0, spec.rot1, t);
    const y = spec.y0 + t * spec.height;
    const ring = sampleRing(w + 0.03, d + 0.03, r, nCol);
    ring.forEach((p) => {
      const q = rotateY(p.x, p.z, rot);
      const nn = rotateY(p.nx, p.nz, rot);
      dummy.position.set(q.x + nn.x * 0.02, y, q.z + nn.z * 0.02);
      dummy.rotation.set(0, Math.atan2(nn.x, nn.z) + rot, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(k++, dummy.matrix);
    });
  }
  mesh.instanceMatrix.needsUpdate = true;
  group.add(mesh);
}

function addSpandrels(group, spec, mat, floors, segs) {
  for (let f = 1; f < floors; f++) {
    const t = f / floors;
    const w = lerp(spec.w0, spec.w1, t);
    const d = lerp(spec.d0, spec.d1, t);
    const r = lerp(spec.r0, spec.r1, t);
    const rot = lerp(spec.rot0, spec.rot1, t);
    const y = spec.y0 + t * spec.height;
    const band = new THREE.Mesh(
      loftSkin({
        w0: w + 0.04,
        d0: d + 0.04,
        r0: r,
        w1: w + 0.04,
        d1: d + 0.04,
        r1: r,
        height: 0.07,
        levels: 1,
        rot0: rot,
        rot1: rot,
        n: segs,
        y0: y - 0.035,
      }),
      mat
    );
    group.add(band);
  }
}

function addGoldCove(group, w, d, r, y, rot, mat, n) {
  const band = new THREE.Mesh(
    loftSkin({
      w0: w + 0.06,
      d0: d + 0.06,
      r0: r,
      w1: w + 0.06,
      d1: d + 0.06,
      r1: r,
      height: 0.09,
      levels: 1,
      rot0: rot,
      rot1: rot,
      n,
      y0: y - 0.04,
    }),
    mat
  );
  group.add(band);
}

function addInnerFloors(group, spec, floors, slabMat, segs) {
  const inset = 0.28;
  for (let f = 1; f < floors; f++) {
    const t = f / floors;
    const w = lerp(spec.w0, spec.w1, t) - inset;
    const d = lerp(spec.d0, spec.d1, t) - inset;
    const r = Math.max(0.12, lerp(spec.r0, spec.r1, t) - 0.12);
    const rot = lerp(spec.rot0, spec.rot1, t);
    const y = spec.y0 + t * spec.height;
    const slab = new THREE.Mesh(loftCap(w, d, r, y, rot, segs), slabMat);
    group.add(slab);
  }
}

function addTrees(group, count, radiusX, radiusZ, y, rot, mat) {
  for (let i = 0; i < count; i++) {
    const tree = new THREE.Group();
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.17 + (i % 3) * 0.03, 8, 7), mat);
    canopy.scale.set(1, 0.82, 1);
    canopy.position.y = 0.2;
    tree.add(canopy);
    const a = (i / count) * Math.PI * 2 + 0.35;
    const q = rotateY(Math.cos(a) * radiusX, Math.sin(a) * radiusZ, rot);
    tree.position.set(q.x, y, q.z);
    group.add(tree);
  }
}

function placeSign(mesh, w, d, y, _rot) {
  mesh.position.set(0, y, d / 2 + 0.09);
  mesh.rotation.set(0, 0, 0);
}

function makeZone(mod, mats, quality, index, officeTex) {
  const group = new THREE.Group();
  const metal = mats.metal.clone();
  const darkMetal = mats.darkMetal.clone();
  const slab = mats.slab.clone();
  const gold = mats.gold.clone();
  const plant = mats.plant.clone();
  const zoneMats = { metal, darkMetal, slab, gold, plant, glass: mats.glass.clone() };
  const t0 = taperAt(index);
  const t1 = taperAt(index + 1);
  const spec = {
    w0: TOWER_W * t0,
    d0: TOWER_D * t0,
    r0: CORNER * t0,
    w1: TOWER_W * t1,
    d1: TOWER_D * t1,
    r1: CORNER * t1,
    height: ZONE_H,
    rot0: index * TWIST,
    rot1: (index + 1) * TWIST,
    y0: 0,
  };
  const segs = quality.low ? 24 : RING;
  const floors = quality.low ? 6 : FLOORS;
  const inner = {
    ...spec,
    w0: spec.w0 - 0.22,
    d0: spec.d0 - 0.22,
    w1: spec.w1 - 0.22,
    d1: spec.d1 - 0.22,
    r0: Math.max(0.12, spec.r0 - 0.1),
    r1: Math.max(0.12, spec.r1 - 0.1),
    height: spec.height - 0.08,
    y0: 0.04,
  };
  const coreMat = new THREE.MeshStandardMaterial({
    map: officeTex,
    emissiveMap: officeTex,
    emissive: 0xffffff,
    emissiveIntensity: 1.15,
    roughness: 0.78,
    metalness: 0.04,
  });
  const core = new THREE.Mesh(loftSkin({ ...inner, levels: floors, n: segs }), coreMat);
  group.add(core);
  const glass = zoneMats.glass;
  const skin = new THREE.Mesh(loftSkin({ ...spec, levels: floors, n: segs }), glass);
  skin.renderOrder = 1;
  group.add(skin);
  addInnerFloors(group, inner, floors, zoneMats.slab, quality.low ? 16 : 28);
  addMullions(group, spec, zoneMats.metal, floors, quality);
  addSpandrels(group, spec, zoneMats.metal, floors, segs);
  addGoldCove(group, spec.w0, spec.d0, spec.r0, 0.02, spec.rot0, zoneMats.gold, segs);
  addGoldCove(group, spec.w1, spec.d1, spec.r1, spec.height - 0.02, spec.rot1, zoneMats.gold, segs);
  if (mod.terrace) {
    const t = 0.94;
    const w = lerp(spec.w0, spec.w1, t);
    const d = lerp(spec.d0, spec.d1, t);
    const rot = lerp(spec.rot0, spec.rot1, t);
    const y = spec.height - 0.05;
    const spots = [rotateY(w * 0.4, d * 0.38, rot), rotateY(-w * 0.36, d * 0.34, rot)];
    spots.forEach((q) => {
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.09, 0.72), zoneMats.darkMetal);
      deck.position.set(q.x, y, q.z);
      deck.rotation.y = rot;
      group.add(deck);
      const planter = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.15, 0.4), zoneMats.slab);
      planter.position.set(q.x, y + 0.1, q.z);
      planter.rotation.y = rot;
      group.add(planter);
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 7), zoneMats.plant);
      canopy.scale.set(1.1, 0.8, 1);
      canopy.position.set(q.x, y + 0.32, q.z);
      group.add(canopy);
      const canopy2 = canopy.clone();
      canopy2.position.x += 0.18;
      canopy2.scale.set(0.8, 0.7, 0.8);
      group.add(canopy2);
    });
  }
  const crownH = mod.crown ? 0.95 : 0;
  if (mod.crown) {
    const cw = spec.w1 * 0.72;
    const cd = spec.d1 * 0.72;
    const cr = spec.r1 * 0.7;
    const pent = {
      w0: cw,
      d0: cd,
      r0: cr,
      w1: cw * 0.9,
      d1: cd * 0.9,
      r1: cr * 0.85,
      height: crownH,
      rot0: spec.rot1,
      rot1: spec.rot1 + 0.04,
      y0: spec.height,
      levels: 3,
      n: segs,
    };
    group.add(new THREE.Mesh(loftSkin(pent), glass));
    group.add(new THREE.Mesh(loftCap(cw * 0.92, cd * 0.92, cr, spec.height + crownH + 0.02, pent.rot1, segs), zoneMats.darkMetal));
    addGoldCove(group, cw, cd, cr, spec.height + 0.02, spec.rot1, zoneMats.gold, segs);
    addTrees(group, 8, cw * 0.22, cd * 0.18, spec.height + crownH + 0.12, spec.rot1, zoneMats.plant);
  }
  const dMid = (spec.d0 + spec.d1) / 2;
  const wMid = (spec.w0 + spec.w1) / 2;
  let sign = null;
  if (mod.sign !== false) {
    sign = makeSign(mod);
    sign.userData.noClip = true;
    sign.material.transparent = true;
    sign.material.opacity = 0;
    placeSign(sign, wMid, dMid, spec.height * 0.48, (spec.rot0 + spec.rot1) / 2);
    group.add(sign);
  }
  const light = new THREE.PointLight(WARM, 0, 10, 2);
  light.position.set(0, spec.height * 0.5, 0);
  group.add(light);
  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  bindClip(group, clipPlane);
  group.position.y = restY(index);
  group.visible = false;
  group.userData = {
    spec,
    sign,
    light,
    clipPlane,
    y0: restY(index),
    fullH: ZONE_H + crownH + 0.2,
    signAnchor: { x: 0, y: spec.height * 0.48, z: dMid / 2 + 0.12 },
    signOn: 0,
  };
  return group;
}

function makeBase(mats, quality, officeTex) {
  const group = new THREE.Group();
  const segs = quality.low ? 24 : RING;
  const spec = {
    w0: 10.7,
    d0: 9.58,
    r0: 0.7,
    w1: TOWER_W,
    d1: TOWER_D,
    r1: CORNER,
    height: BASE_H,
    rot0: 0,
    rot1: 0.03,
    y0: 0,
  };
  const inner = {
    ...spec,
    w0: spec.w0 - 0.28,
    d0: spec.d0 - 0.28,
    w1: spec.w1 - 0.22,
    d1: spec.d1 - 0.22,
    height: spec.height - 0.12,
    y0: 0.08,
  };
  const coreMat = new THREE.MeshStandardMaterial({
    map: officeTex,
    emissiveMap: officeTex,
    emissive: 0xffffff,
    emissiveIntensity: 1.15,
    roughness: 0.78,
    metalness: 0.04,
  });
  group.add(new THREE.Mesh(loftSkin({ ...inner, levels: 5, n: segs }), coreMat));
  const glass = mats.glass.clone();
  if (glass.transmission !== undefined) glass.transmission = quality.physical ? 0.46 : 0;
  glass.opacity = 0.42;
  const skin = new THREE.Mesh(loftSkin({ ...spec, levels: 5, n: segs }), glass);
  skin.renderOrder = 1;
  group.add(skin);
  addInnerFloors(group, inner, 5, mats.slab, quality.low ? 16 : 28);
  addMullions(group, spec, mats.metal, 5, quality);
  addSpandrels(group, spec, mats.metal, 5, segs);
  const plinth = new THREE.Mesh(loftCap(spec.w0 + 0.85, spec.d0 + 0.75, spec.r0 + 0.08, 0.04, 0, segs), mats.darkMetal);
  group.add(plinth);
  addGoldCove(group, spec.w1, spec.d1, spec.r1, spec.height - 0.02, spec.rot1, mats.gold, segs);
  addTrees(group, 10, spec.w1 * 0.32, spec.d1 * 0.28, spec.height + 0.18, spec.rot1, mats.plant);
  const sign = makeLobbySign();
  placeSign(sign, spec.w0, spec.d0, spec.height * 0.42, 0.015);
  group.add(sign);
  const glow = new THREE.PointLight(WARM, 2.1, 16, 2);
  glow.position.set(0, spec.height * 0.4, spec.d0 * 0.12);
  group.add(glow);
  return group;
}

const INTRO = 0.08;
const ZONE_SPAN = 0.12;
const HOLD = 0.2;

function zoneGrow(progress, i) {
  return clamp((progress - (INTRO + i * ZONE_SPAN)) / ZONE_SPAN, 0, 1);
}

function applyGrowth(modules, progress) {
  modules.forEach((m, i) => {
    const t = zoneGrow(progress, i);
    m.visible = t > 0.001;
    m.position.set(0, m.userData.y0, 0);
    m.rotation.set(0, 0, 0);
    m.scale.set(1, 1, 1);
    const revealY = m.userData.y0 + m.userData.fullH * t;
    m.userData.clipPlane.normal.set(0, -1, 0);
    m.userData.clipPlane.constant = revealY;
    const signOn = clamp((t - 0.72) / 0.2, 0, 1);
    m.userData.signOn = signOn;
    if (m.userData.sign) {
      m.userData.sign.visible = false;
      m.userData.sign.material.opacity = 0;
    }
    if (m.userData.light) m.userData.light.intensity = 0.55 * t;
  });
}

function fitCamera(camera, width, height) {
  const sizeY = towerTop();
  const sizeX = 10.75;
  const mobile = width < 900;
  const fov = mobile ? 36 : 30;
  camera.fov = fov;
  camera.aspect = Math.max(0.5, width / Math.max(1, height));
  const vFov = (fov * Math.PI) / 180;
  const pad = mobile ? 1.62 : 1.42;
  const distH = (sizeY * pad * 0.5) / Math.tan(vFov * 0.5);
  const hFov = 2 * Math.atan(Math.tan(vFov * 0.5) * camera.aspect);
  const distW = (sizeX * (mobile ? 1.82 : 1.48) * 0.5) / Math.tan(hFov * 0.5);
  const z = Math.max(distH, distW, 52);
  const lookY = sizeY * 0.52;
  camera.position.set(0, lookY + sizeY * 0.03, z);
  camera.near = 0.5;
  camera.far = Math.max(280, z * 8);
  camera.lookAt(0, lookY, 0);
  camera.updateProjectionMatrix();
}

function bindSigns(root, camera, canvas, modules) {
  const signs = root.querySelectorAll("[data-nh3d-sign]");
  if (!signs.length || !camera || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const Vec = camera.position.constructor;
  const v = new Vec();
  signs.forEach((el) => {
    const i = Number(el.getAttribute("data-nh3d-sign"));
    const m = modules[i];
    if (!m) return;
    const on = m.visible ? m.userData.signOn || 0 : 0;
    el.classList.toggle("is-on", on > 0.04);
    el.style.opacity = String(on);
    if (on <= 0.04) return;
    const a = m.userData.signAnchor || { x: 0, y: ZONE_H * 0.48, z: TOWER_D * 0.5 };
    v.set(a.x, m.position.y + a.y, a.z).project(camera);
    const x = (v.x * 0.5 + 0.5) * rect.width;
    const y = (-v.y * 0.5 + 0.5) * rect.height;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  });
}

function bindOverlay(root, progress) {
  const hint = root.querySelector("[data-nh3d-hint]");
  const lockup = root.querySelector("[data-nh3d-lockup]");
  const complete = progress >= 1 - HOLD;
  root.classList.toggle("is-complete", complete);
  root.classList.toggle("is-scrolled", progress > 0.04);
  if (hint) hint.style.opacity = String(clamp(1 - progress / 0.08, 0, 1));
  if (lockup) lockup.classList.toggle("is-on", progress < 0.05);
  root.classList.toggle("is-intro", progress < 0.05);
  let mobileLabel = "";
  root.querySelectorAll("[data-nh3d-dot]").forEach((el) => {
    const i = Number(el.getAttribute("data-nh3d-dot"));
    const t = zoneGrow(progress, i);
    el.classList.toggle("is-on", t > 0 && t < 0.999);
    el.classList.toggle("is-done", t >= 0.999);
    if (t > 0.22) mobileLabel = `${MODULES[i].num}  ${MODULES[i].name}`;
  });
  const mobileName = root.querySelector("[data-nh3d-mobile-name]");
  if (mobileName) {
    mobileName.textContent = mobileLabel;
    mobileName.classList.toggle("is-on", Boolean(mobileLabel));
  }
}

function readProgress(track) {
  const rect = track.getBoundingClientRect();
  const total = Math.max(1, track.offsetHeight - window.innerHeight);
  return clamp(-rect.top / total, 0, 1);
}

function makeEnv(renderer) {
  try {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 512, 256);
    g.addColorStop(0, "#4e6a88");
    g.addColorStop(0.42, "#f2c17a");
    g.addColorStop(0.7, "#c97a4a");
    g.addColorStop(1, "#1d2834");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
    pmrem.dispose();
    return env;
  } catch {
    return null;
  }
}

function createScene(canvas, quality) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.aa,
    powerPreference: quality.low ? "low-power" : "high-performance",
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = quality.shadows;
  if (quality.shadows) renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.4, 420);

  scene.add(new THREE.HemisphereLight(0xf0ddc4, 0x1a242c, 0.72));
  scene.add(new THREE.AmbientLight(0xa8bdd0, 0.42));
  const sun = new THREE.DirectionalLight(0xffd4a0, 1.35);
  sun.position.set(12, 24, 46);
  sun.castShadow = quality.shadows;
  if (quality.shadows) {
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 8;
    sun.shadow.camera.far = 160;
    sun.shadow.camera.left = -32;
    sun.shadow.camera.right = 32;
    sun.shadow.camera.top = 48;
    sun.shadow.camera.bottom = -16;
  }
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x8eb0d0, 0.38);
  fill.position.set(-24, 12, 16);
  scene.add(fill);

  const env = makeEnv(renderer);
  if (env) scene.environment = env;
  const mats = makeMats(quality);
  const officeA = officeTexture(3, 14, 16);
  const officeB = officeTexture(7, 12, 10);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(8.3, 40),
    new THREE.MeshBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0.28, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  scene.add(shadow);

  const tower = new THREE.Group();
  tower.position.set(0, 0, 0);
  tower.add(makeBase(mats, quality, officeB));
  const modules = MODULES.map((mod, i) => {
    const m = makeZone(mod, mats, quality, i, officeA);
    tower.add(m);
    return m;
  });
  applyGrowth(modules, 0);
  scene.add(tower);
  window.__NH3D = { camera, tower, modules, renderer };
  return { renderer, scene, camera, tower, modules };
}

async function initHero(root) {
  const canvas = root.querySelector("[data-nh3d-canvas]");
  const track = root.querySelector("[data-nh3d-track]");
  const fallback = root.querySelector("[data-nh3d-fallback]");
  if (!canvas || !track) return;
  const preview = isBuildPreview();
  const reduce = prefersReducedMotion();
  if (preview) root.classList.add("is-build-preview");
  if (!canWebGL()) {
    if (fallback) fallback.hidden = false;
    canvas.remove();
    bindOverlay(root, 1);
    return;
  }
  const low = isLowEnd();
  const aa = false;
  const quality = {
    low,
    aa,
    shadows: !low && window.innerWidth >= 900,
    physical: false,
  };
  const { renderer, scene, camera, modules } = createScene(canvas, quality);

  let width = 0;
  let height = 0;
  function resize() {
    const stage = root.querySelector("[data-nh3d-stage]");
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    if (w === width && h === height) return;
    width = w;
    height = h;
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1 : w < 720 ? 1.25 : 1.55);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    fitCamera(camera, w, h);
  }
  resize();

  let target = preview || reduce ? 1 : 0;
  let current = target;
  let raf = 0;
  let last = performance.now();
  let visible = true;

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const delta = target - current;
    const k = Math.abs(delta) > 0.08 ? 0.58 : 0.22;
    current += delta * (1 - Math.pow(1 - k, dt * 60));
    if (Math.abs(target - current) < 0.0004) current = target;
    applyGrowth(modules, current);
    bindOverlay(root, current);
    bindSigns(root, camera, canvas, modules);
    renderer.setViewport(0, 0, width, height);
    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(frame);
  }
  function requestFrame() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }
  function onScroll() {
    target = preview || reduce ? 1 : readProgress(track);
    requestFrame();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    resize();
    onScroll();
    requestFrame();
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) requestFrame();
    },
    { threshold: 0.01 }
  ).observe(root);
  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
    if (visible) requestFrame();
  });
  onScroll();
  requestFrame();
}

function boot() {
  window.__NH3D_BUILD = "s3d53";
  const root = document.querySelector("#home #top[data-nh3d]");
  if (!root) return;
  initHero(root).catch(() => {
    const fallback = root.querySelector("[data-nh3d-fallback]");
    const canvas = root.querySelector("[data-nh3d-canvas]");
    if (fallback) fallback.hidden = false;
    if (canvas) canvas.remove();
    bindOverlay(root, 1);
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
