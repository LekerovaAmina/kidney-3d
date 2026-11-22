// Процедурная геометрия почки (левая почка, вид спереди: ворота почки смотрят влево).
// Всё строится из одной функции контура "боба", поэтому части точно стыкуются друг с другом.
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const TAU = Math.PI * 2

/** Контур почки в плоскости XY. theta: 0..2π */
export function outline(theta) {
  const a = 0.62 * (1 + 0.05 * Math.sin(theta)) // верхний полюс чуть шире
  const b = 1.0
  let x = a * Math.cos(theta)
  const y = b * Math.sin(theta)
  // вдавление — ворота почки (hilum) на медиальной стороне
  const d = theta - Math.PI
  x += 0.3 * Math.exp(-(d * d) / (0.42 * 0.42))
  return new THREE.Vector2(x, y)
}

/** Центр почечной пазухи (синуса) */
export const SINUS = new THREE.Vector2(-0.12, 0)

const lerp2 = (a, b, t) => new THREE.Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
/** Точка на луче от синуса к контуру; t=0 — синус, t=1 — капсула */
export const radial = (theta, t) => lerp2(SINUS, outline(theta), t)

/** Внешняя оболочка почки (капсула).
 * Строится «кольцами» снизу вверх: каждое сечение — эллипс между левым и правым краем контура.
 * Полюса получаются на верхнем и нижнем концах почки, поэтому поверхность гладкая. */
export function makeShellGeometry(segA = 96, segV = 120) {
  const pos = []
  const uv = []
  const idx = []
  for (let j = 0; j <= segV; j++) {
    const v = j / segV
    const thR = -Math.PI / 2 + v * Math.PI
    const thL = Math.PI - thR
    const pr = outline(thR)
    const pl = outline(thL)
    const y = (pr.y + pl.y) / 2
    const cx = (pr.x + pl.x) / 2
    const hx = (pr.x - pl.x) / 2
    const hz = 0.34 * Math.pow(Math.max(0, 1 - y * y), 0.38)
    const hil = Math.exp(-(y * y) / 0.12) // область ворот
    for (let i = 0; i < segA; i++) {
      const a = (i / segA) * TAU
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      // к воротам почка тоньше
      const thin = 1 - 0.32 * Math.max(0, -ca) * hil
      const bump = 1 + 0.006 * Math.sin(a * 7 + y * 9) + 0.004 * Math.sin(a * 17 - y * 21)
      pos.push(cx + hx * ca, y, hz * sa * thin * bump)
      uv.push(i / segA, v)
    }
  }
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segA; i++) {
      const a = j * segA + i
      const b = j * segA + ((i + 1) % segA)
      const c = (j + 1) * segA + i
      const d = (j + 1) * segA + ((i + 1) % segA)
      idx.push(a, d, b, a, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Плоскость разреза (фронтальный срез) */
export function makeCutFaceGeometry() {
  const shape = new THREE.Shape()
  const N = 200
  for (let i = 0; i <= N; i++) {
    const p = outline((i / N) * TAU)
    if (i === 0) shape.moveTo(p.x, p.y)
    else shape.lineTo(p.x, p.y)
  }
  const g = new THREE.ShapeGeometry(shape, 1)
  // UV в диапазон 0..1 по габаритам
  const p = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) {
    uv.setXY(i, (p.getX(i) + 0.8) / 1.6, (p.getY(i) + 1.1) / 2.2)
  }
  return g
}

/** Текстура среза: зернистая кора с клубочками */
export function makeCortexTexture() {
  const S = 1024
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  const toPx = (x, y) => [((x + 0.8) / 1.6) * S, (1 - (y + 1.1) / 2.2) * S]
  ctx.fillStyle = '#7d2420'
  ctx.fillRect(0, 0, S, S)
  // зернистость
  for (let i = 0; i < 26000; i++) {
    const r = Math.random()
    ctx.fillStyle = r > 0.5 ? 'rgba(160,52,44,0.35)' : 'rgba(70,14,12,0.35)'
    ctx.fillRect(Math.random() * S, Math.random() * S, 2, 2)
  }
  // клубочки (почечные тельца) в корковом слое
  for (let i = 0; i < 1600; i++) {
    const th = Math.random() * TAU
    const t = 0.83 + Math.random() * 0.14
    const p = radial(th, t)
    const [px, py] = toPx(p.x, p.y)
    ctx.fillStyle = 'rgba(230,110,95,0.75)'
    ctx.beginPath()
    ctx.arc(px, py, 1.6 + Math.random() * 1.4, 0, TAU)
    ctx.fill()
  }
  // светлая линия капсулы
  ctx.strokeStyle = 'rgba(245,215,200,0.85)'
  ctx.lineWidth = 6
  ctx.beginPath()
  for (let i = 0; i <= 300; i++) {
    const p = outline((i / 300) * TAU)
    const [px, py] = toPx(p.x, p.y)
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
  }
  ctx.stroke()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Полосатая текстура пирамид (прямые канальцы и собирательные трубки) */
export function makePyramidTexture() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const ctx = c.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#c86a5c')
  grad.addColorStop(1, '#9b3a33')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 256)
  for (let x = 0; x < 64; x += 8) {
    ctx.fillStyle = 'rgba(90,20,18,0.45)'
    ctx.fillRect(x, 0, 3, 256)
    ctx.fillStyle = 'rgba(255,190,170,0.18)'
    ctx.fillRect(x + 4, 0, 1, 256)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(9, 3)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------- Пирамиды ----------
export const PYRAMID_COUNT = 8
const HILUM_GAP = 0.85
export const pyramidAngles = Array.from({ length: PYRAMID_COUNT }, (_, k) =>
  Math.PI + HILUM_GAP + (k * (TAU - 2 * HILUM_GAP)) / (PYRAMID_COUNT - 1)
)
// углы почечных столбов (между пирамидами)
export const columnAngles = pyramidAngles.slice(0, -1).map((a, k) => (a + pyramidAngles[k + 1]) / 2)

const APEX_T = 0.42
const BASE_T = 0.8

export function makePyramids() {
  return pyramidAngles.map((th, k) => {
    const A = radial(th, APEX_T)
    const B = radial(th, BASE_T)
    const L = A.distanceTo(B)
    const step = (TAU - 2 * HILUM_GAP) / (PYRAMID_COUNT - 1)
    const left = radial(th - step / 2, BASE_T)
    const right = radial(th + step / 2, BASE_T)
    const hw = left.distanceTo(right) * 0.36
    const s = new THREE.Shape()
    s.moveTo(-0.012, 0)
    s.quadraticCurveTo(-hw * 0.45, L * 0.45, -hw, L)
    s.quadraticCurveTo(0, L + hw * 0.32, hw, L)
    s.quadraticCurveTo(hw * 0.45, L * 0.45, 0.012, 0)
    s.quadraticCurveTo(0, -0.03, -0.012, 0)
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.035,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 24,
    })
    const dir = B.clone().sub(A)
    const rot = Math.atan2(dir.y, dir.x) - Math.PI / 2
    return { key: k, geo, position: [A.x, A.y, 0.004], rotation: rot, apex: A, theta: th }
  })
}

// ---------- Трубки (сосуды, чашечки, мочеточник) ----------
const v3 = (p, z = 0) => new THREE.Vector3(p.x, p.y, z)

function tube(points, radius, tubular = 48, radial = 12) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal')
  return { geo: new THREE.TubeGeometry(curve, tubular, radius, radial, false), curve }
}

function sample(curve, n = 120) {
  return curve.getSpacedPoints(n)
}

/** Чашечки, лоханка, мочеточник */
export function makeCollectingSystem(pyramids) {
  const Z = 0.08
  const pelvis = new THREE.Vector3(-0.2, 0.0, Z)
  const groups = { upper: [], middle: [], lower: [] }
  pyramids.forEach((p) => {
    const y = p.apex.y
    if (y > 0.18) groups.upper.push(p)
    else if (y < -0.18) groups.lower.push(p)
    else groups.middle.push(p)
  })
  const cups = []
  const minorTubes = []
  const majorTubes = []
  const urinePaths = []

  // мочеточник
  const ureterPts = [
    pelvis.clone(),
    new THREE.Vector3(-0.33, -0.1, Z),
    new THREE.Vector3(-0.45, -0.35, Z * 0.6),
    new THREE.Vector3(-0.42, -0.9, 0),
    new THREE.Vector3(-0.3, -1.5, 0),
    new THREE.Vector3(-0.28, -2.3, 0),
  ]
  const ureter = tube(ureterPts, 0.045, 90, 14)
  const ureterSamples = sample(ureter.curve, 120)

  Object.values(groups).forEach((list) => {
    if (!list.length) return
    const avg = list.reduce((acc, p) => acc.add(p.apex), new THREE.Vector2()).multiplyScalar(1 / list.length)
    const major = v3(lerp2(new THREE.Vector2(pelvis.x, pelvis.y), avg, 0.5), Z)
    const mt = tube([major, v3(lerp2(new THREE.Vector2(pelvis.x, pelvis.y), avg, 0.25), Z), pelvis.clone()], 0.055, 24, 12)
    majorTubes.push(mt.geo)
    list.forEach((p) => {
      const dir = new THREE.Vector2(SINUS.x - p.apex.x, SINUS.y - p.apex.y).normalize()
      const cupPos = new THREE.Vector2(p.apex.x + dir.x * 0.035, p.apex.y + dir.y * 0.035)
      cups.push({ position: [cupPos.x, cupPos.y, Z], rotation: Math.atan2(-dir.y, -dir.x) - Math.PI / 2 })
      const startPt = v3(new THREE.Vector2(cupPos.x + dir.x * 0.05, cupPos.y + dir.y * 0.05), Z)
      const mid = startPt.clone().lerp(major, 0.5)
      const t = tube([startPt, mid, major.clone()], 0.028, 20, 10)
      minorTubes.push(t.geo)
      // путь мочи: малая чашечка → большая → лоханка → мочеточник
      const path = [...sample(t.curve, 20), ...sample(mt.curve, 20), ...ureterSamples]
      urinePaths.push(path)
    })
  })

  return {
    cups,
    minorGeo: mergeGeometries(minorTubes),
    majorGeo: mergeGeometries(majorTubes),
    ureterGeo: ureter.geo,
    pelvis,
    urinePaths,
  }
}

/** Сосудистое дерево: почечная артерия/вена → сегментарные → междолевые → дуговые → междольковые */
export function makeVessels(kind) {
  const isArtery = kind === 'artery'
  const Z = isArtery ? 0.045 : 0.022
  const yOff = isArtery ? 0.14 : 0.3
  const r0 = isArtery ? 0.055 : 0.07
  const hilum = new THREE.Vector3(-0.34, yOff, Z)
  const hub = new THREE.Vector3(-0.17, yOff * 0.7, Z)
  const trunkPts = [new THREE.Vector3(-2.3, yOff + 0.22, Z * 0.5), new THREE.Vector3(-1.2, yOff + 0.12, Z), hilum, hub]
  const trunk = tube(trunkPts, r0, 60, 16)
  const trunkSamples = sample(trunk.curve, 70)

  const branchGeos = []
  const fineGeos = []
  const paths = []
  const angOff = isArtery ? -0.05 : 0.05
  columnAngles.forEach((th0, k) => {
    const th = th0 + angOff
    const start = v3(radial(th, 0.32), Z)
    const cmj = v3(radial(th, BASE_T + 0.02), Z) // кортико-медуллярная граница
    const seg = tube([hub.clone(), hub.clone().lerp(start, 0.5).add(new THREE.Vector3(0, 0, 0.01)), start], 0.024, 16, 8)
    const inter = tube([start, v3(radial(th, 0.55), Z), cmj], 0.017, 24, 8)
    branchGeos.push(seg.geo, inter.geo)
    // дуговые артерии — вдоль основания пирамид
    const arcPtsL = []
    const arcPtsR = []
    for (let s = 0; s <= 8; s++) {
      arcPtsL.push(v3(radial(th - (s / 8) * 0.3, BASE_T + 0.02), Z))
      arcPtsR.push(v3(radial(th + (s / 8) * 0.3, BASE_T + 0.02), Z))
    }
    const arcL = tube(arcPtsL, 0.013, 16, 6)
    const arcR = tube(arcPtsR, 0.013, 16, 6)
    fineGeos.push(arcL.geo, arcR.geo)
    // междольковые — к поверхности коры
    for (let s = -2; s <= 2; s++) {
      const a = th + s * 0.12
      const it = tube([v3(radial(a, BASE_T + 0.02), Z), v3(radial(a, 0.9), Z), v3(radial(a + 0.02, 0.96), Z)], 0.006, 8, 5)
      fineGeos.push(it.geo)
    }
    const side = k % 2 ? arcR : arcL
    const path = [...trunkSamples, ...sample(seg.curve, 14), ...sample(inter.curve, 22), ...sample(side.curve, 16)]
    paths.push(isArtery ? path : path.slice().reverse())
  })
  return {
    trunkGeo: trunk.geo,
    branchGeo: mergeGeometries(branchGeos),
    fineGeo: mergeGeometries(fineGeos),
    paths,
  }
}

/** Надпочечник (левый — полулунной формы) */
export function makeAdrenalGeometry() {
  const s = new THREE.Shape()
  const N = 40
  for (let i = 0; i <= N; i++) {
    const t = Math.PI * 0.15 + (i / N) * Math.PI * 0.85
    const x = Math.cos(t) * 0.42
    const y = Math.sin(t) * 0.3
    i ? s.lineTo(x, y) : s.moveTo(x, y)
  }
  for (let i = N; i >= 0; i--) {
    const t = Math.PI * 0.15 + (i / N) * Math.PI * 0.85
    s.lineTo(Math.cos(t) * 0.36, Math.sin(t) * 0.12 - 0.02)
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 5,
    curveSegments: 30,
  })
  g.translate(0, 0, -0.06)
  return g
}

/** Чашечка-«бокал», охватывающая сосочек пирамиды */
export function makeCupGeometry() {
  const pts = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    pts.push(new THREE.Vector2(0.022 + 0.062 * Math.pow(t, 0.7), -0.055 + t * 0.095))
  }
  return new THREE.LatheGeometry(pts, 24)
}
