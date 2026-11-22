import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  makeShellGeometry, makeCutFaceGeometry, makeCortexTexture, makePyramidTexture, makePyramids,
  makeCollectingSystem, makeVessels, makeAdrenalGeometry, makeCupGeometry, radial, outline, SINUS,
} from './geometry.js'
import { PARTS, BUILD_STEPS, BUILD_DURATION } from '../data/parts.js'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const easeOutBack = (x) => {
  const c1 = 1.4, c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const stepOf = (part) => BUILD_STEPS.find((s) => s.part === part)

const CUT_OPEN = 0.48 // плоскость отсечения выше почки = разреза нет

export default function KidneyModel({ cut, flow, labels, selected, hovered, onSelect, onHover, buildKey, onBuildStep }) {
  // ---------- геометрия (строится один раз) ----------
  const data = useMemo(() => {
    const pyramids = makePyramids()
    return {
      shell: makeShellGeometry(),
      cutFace: makeCutFaceGeometry(),
      cortexTex: makeCortexTexture(),
      pyrTex: makePyramidTexture(),
      pyramids,
      collect: makeCollectingSystem(pyramids),
      artery: makeVessels('artery'),
      vein: makeVessels('vein'),
      adrenal: makeAdrenalGeometry(),
      cup: makeCupGeometry(),
      sinusGeo: (() => {
        const g = new THREE.CircleGeometry(1, 48)
        g.scale(0.19, 0.4, 1)
        return g
      })(),
    }
  }, [])

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), CUT_OPEN), [])

  // ---------- материалы ----------
  const mats = useMemo(() => {
    const m = {
      capsule: new THREE.MeshPhysicalMaterial({
        color: '#a63a33', roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.4,
        sheenColor: new THREE.Color('#ff9a8a'), side: THREE.DoubleSide, clippingPlanes: [plane],
      }),
      cortex: new THREE.MeshStandardMaterial({ map: data.cortexTex, roughness: 0.75 }),
      medulla: new THREE.MeshPhysicalMaterial({ map: data.pyrTex, roughness: 0.5, clearcoat: 0.3 }),
      minor: new THREE.MeshPhysicalMaterial({ color: PARTS.minor.color, roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide }),
      major: new THREE.MeshPhysicalMaterial({ color: PARTS.major.color, roughness: 0.35, clearcoat: 0.6 }),
      pelvis: new THREE.MeshPhysicalMaterial({ color: PARTS.pelvis.color, roughness: 0.35, clearcoat: 0.6 }),
      ureter: new THREE.MeshPhysicalMaterial({ color: PARTS.ureter.color, roughness: 0.4, clearcoat: 0.5 }),
      artery: new THREE.MeshPhysicalMaterial({ color: PARTS.artery.color, roughness: 0.3, clearcoat: 0.9 }),
      vein: new THREE.MeshPhysicalMaterial({ color: PARTS.vein.color, roughness: 0.3, clearcoat: 0.9 }),
      adrenal: new THREE.MeshPhysicalMaterial({ color: PARTS.adrenal.color, roughness: 0.6, clearcoat: 0.3 }),
      sinus: new THREE.MeshStandardMaterial({ color: PARTS.sinus.color, roughness: 0.9 }),
    }
    Object.values(m).forEach((mat) => { mat.emissive = new THREE.Color('#ffffff'); mat.emissiveIntensity = 0 })
    return m
  }, [data, plane])

  // ---------- refs ----------
  const r = useRef({})
  const set = (key) => (el) => { r.current[key] = el }
  const pyrRefs = useRef([])
  const cupRefs = useRef([])
  const cutZ = useRef(CUT_OPEN)
  const build = useRef({ start: null, active: false, lastStep: -1 })
  const sel = useRef(selected)
  const hov = useRef(hovered)
  sel.current = selected
  hov.current = hovered

  useEffect(() => {
    if (buildKey) build.current = { start: null, active: true, lastStep: -1 }
  }, [buildKey])

  // Капсула: при разрезе лучи не должны «цепляться» за отрезанную половину
  useEffect(() => {
    const mesh = r.current.shell
    if (!mesh) return
    mesh.raycast = function (raycaster, intersects) {
      const tmp = []
      THREE.Mesh.prototype.raycast.call(this, raycaster, tmp)
      tmp.forEach((i) => { if (i.point.z <= plane.constant + 0.002) intersects.push(i) })
    }
  }, [plane])

  // ---------- частицы кровотока и мочи ----------
  const flowSys = useMemo(() => {
    const mk = (paths, count, speed) => {
      const items = Array.from({ length: count }, (_, i) => ({
        path: paths[i % paths.length],
        offset: Math.random(),
        speed: speed * (0.8 + Math.random() * 0.4),
      }))
      return items
    }
    return {
      artery: mk(data.artery.paths, 140, 0.09),
      vein: mk(data.vein.paths, 140, 0.07),
      urine: mk(data.collect.urinePaths, 90, 0.06),
    }
  }, [data])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const drawRange = (geo, p) => {
    const n = geo.index ? geo.index.count : geo.attributes.position.count
    geo.setDrawRange(0, Math.floor((n * clamp01(p)) / 3) * 3)
  }

  useFrame(({ clock }, delta) => {
    const now = clock.elapsedTime
    // --- построение ---
    const b = build.current
    let el = Infinity
    if (b.active) {
      if (b.start === null) b.start = now
      el = now - b.start
      const idx = BUILD_STEPS.findIndex((s) => el >= s.t0 && el < s.t1)
      if (idx !== b.lastStep) {
        b.lastStep = idx
        onBuildStep?.(idx >= 0 ? BUILD_STEPS[idx] : el >= BUILD_DURATION - 1 ? null : undefined)
      }
      if (el > BUILD_DURATION) {
        b.active = false
        onBuildStep?.(null)
      }
    }
    const P = (part) => {
      const s = stepOf(part)
      return clamp01((el - s.t0) / (s.t1 - s.t0))
    }

    // --- плоскость разреза ---
    const target = cut || b.active ? 0 : CUT_OPEN
    cutZ.current += (target - cutZ.current) * Math.min(1, delta * 2.6)
    if (Math.abs(target - cutZ.current) < 0.0005) cutZ.current = target
    plane.constant = cutZ.current
    const opened = 1 - cutZ.current / CUT_OPEN // 0..1

    // --- капсула / кора / пазуха ---
    const pc = P('capsule')
    const sc = easeOutBack(pc) || 0.0001
    ;['shell', 'cutFace', 'sinus'].forEach((k) => {
      const m = r.current[k]
      if (!m) return
      m.visible = pc > 0
      m.scale.setScalar(Math.max(sc, 0.0001))
    })
    if (r.current.cutFace) r.current.cutFace.visible = pc > 0 && opened > 0.02
    if (r.current.sinus) r.current.sinus.visible = pc > 0 && opened > 0.02

    // --- пирамиды ---
    const s = stepOf('medulla')
    pyrRefs.current.forEach((m, k) => {
      if (!m) return
      const p = clamp01((el - s.t0 - k * 0.2) / 0.6)
      m.visible = p > 0
      m.scale.setScalar(Math.max(easeOutBack(p), 0.0001))
    })
    // --- чашечки ---
    const sm = stepOf('minor')
    cupRefs.current.forEach((m, k) => {
      if (!m) return
      const p = clamp01((el - sm.t0 - k * 0.1) / 0.4)
      m.visible = p > 0
      m.scale.setScalar(Math.max(easeOutBack(p), 0.0001))
    })
    drawRange(data.collect.minorGeo, P('minor'))
    drawRange(data.collect.majorGeo, P('major'))
    const pp = P('pelvis')
    if (r.current.pelvis) {
      r.current.pelvis.visible = pp > 0
      r.current.pelvis.scale.set(0.15, 0.2, 0.07).multiplyScalar(Math.max(easeOutBack(pp), 0.0001))
    }
    drawRange(data.collect.ureterGeo, P('ureter'))
    ;['artery', 'vein'].forEach((k) => {
      const p = P(k)
      drawRange(data[k].trunkGeo, p * 3)
      drawRange(data[k].branchGeo, p * 3 - 1)
      drawRange(data[k].fineGeo, p * 3 - 2)
    })
    const pa = P('adrenal')
    if (r.current.adrenal) {
      r.current.adrenal.visible = pa > 0
      r.current.adrenal.position.y = 0.9 + (1 - easeInOut(pa)) * 1.2
    }

    // --- подсветка выбранной / наведённой части ---
    const pulse = 0.18 + Math.sin(now * 4) * 0.08
    Object.entries(mats).forEach(([id, mat]) => {
      let target = 0
      if (sel.current === id) target = pulse
      else if (hov.current === id) target = 0.12
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * 0.25
    })

    // --- частицы ---
    const updateFlow = (mesh, items, visible) => {
      if (!mesh) return
      mesh.visible = visible
      if (!visible) return
      items.forEach((it, i) => {
        const t = (it.offset + now * it.speed) % 1
        const pts = it.path
        const f = t * (pts.length - 1)
        const i0 = Math.floor(f)
        const a = pts[i0]
        const c = pts[Math.min(i0 + 1, pts.length - 1)]
        dummy.position.lerpVectors(a, c, f - i0)
        dummy.position.z += 0.012
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    const flowOn = flow && !b.active
    updateFlow(r.current.flowArtery, flowSys.artery, flowOn)
    updateFlow(r.current.flowVein, flowSys.vein, flowOn)
    updateFlow(r.current.flowUrine, flowSys.urine, flowOn && opened > 0.9)
  })

  // ---------- события ----------
  const ev = (id) => ({
    onPointerOver: (e) => { e.stopPropagation(); onHover(id) },
    onPointerOut: (e) => { e.stopPropagation(); onHover(null) },
    onClick: (e) => { e.stopPropagation(); onSelect(id) },
  })

  const isCut = cut
  const labelAnchors = useMemo(() => {
    const pyr = data.pyramids[2]
    const pyrMid = radial(pyr.theta, 0.6)
    const cup = data.collect.cups[0]
    return [
      { id: 'capsule', pos: [outline(0.35).x + 0.05, outline(0.35).y, 0.12], ext: true },
      { id: 'cortex', pos: [radial(-0.75, 0.93).x, radial(-0.75, 0.93).y, 0.03] },
      { id: 'medulla', pos: [pyrMid.x, pyrMid.y, 0.06] },
      { id: 'minor', pos: cup.position },
      { id: 'pelvis', pos: [-0.2, 0.02, 0.14] },
      { id: 'sinus', pos: [SINUS.x - 0.05, SINUS.y - 0.3, 0.02] },
      { id: 'ureter', pos: [-0.33, -1.4, 0.05], ext: true },
      { id: 'artery', pos: [-1.2, 0.27, 0.08], ext: true },
      { id: 'vein', pos: [-1.4, 0.55, 0.05], ext: true },
      { id: 'adrenal', pos: [-0.05, 1.22, 0.1], ext: true },
    ]
  }, [data])

  return (
    <group position={[0.5, 0.1, 0]}>
      {/* Капсула (внешняя оболочка) */}
      <mesh ref={set('shell')} geometry={data.shell} material={mats.capsule} castShadow {...ev('capsule')} />

      {/* Плоскость разреза: кора */}
      <mesh ref={set('cutFace')} geometry={data.cutFace} material={mats.cortex} position={[0, 0, 0.001]} {...ev('cortex')} />
      {/* Почечная пазуха с жиром */}
      <mesh ref={set('sinus')} geometry={data.sinusGeo} material={mats.sinus} position={[SINUS.x - 0.04, SINUS.y, 0.003]} {...ev('sinus')} />

      {/* Пирамиды */}
      {data.pyramids.map((p, k) => (
        <group key={p.key} position={p.position} rotation={[0, 0, p.rotation]}>
          <mesh ref={(el) => (pyrRefs.current[k] = el)} geometry={p.geo} material={mats.medulla} {...ev('medulla')} />
        </group>
      ))}

      {/* Малые чашечки */}
      {data.collect.cups.map((c, k) => (
        <group key={k} position={c.position} rotation={[0, 0, c.rotation]}>
          <mesh ref={(el) => (cupRefs.current[k] = el)} geometry={data.cup} material={mats.minor} {...ev('minor')} />
        </group>
      ))}
      <mesh geometry={data.collect.minorGeo} material={mats.minor} {...ev('minor')} />
      <mesh geometry={data.collect.majorGeo} material={mats.major} {...ev('major')} />
      <mesh ref={set('pelvis')} position={data.collect.pelvis} material={mats.pelvis} {...ev('pelvis')}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <mesh geometry={data.collect.ureterGeo} material={mats.ureter} {...ev('ureter')} />

      {/* Сосуды */}
      {['artery', 'vein'].map((k) => (
        <group key={k} {...ev(k)}>
          <mesh geometry={data[k].trunkGeo} material={mats[k]} />
          <mesh geometry={data[k].branchGeo} material={mats[k]} />
          <mesh geometry={data[k].fineGeo} material={mats[k]} />
        </group>
      ))}

      {/* Надпочечник */}
      <mesh ref={set('adrenal')} geometry={data.adrenal} material={mats.adrenal} position={[-0.1, 0.9, 0]} rotation={[0, 0, 0.18]} scale={0.8} castShadow {...ev('adrenal')} />

      {/* Частицы: эритроциты в артерии, кровь в вене, моча */}
      <instancedMesh ref={set('flowArtery')} args={[null, null, flowSys.artery.length]} frustumCulled={false}>
        <sphereGeometry args={[0.016, 8, 6]} />
        <meshBasicMaterial color="#ff6b5e" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={set('flowVein')} args={[null, null, flowSys.vein.length]} frustumCulled={false}>
        <sphereGeometry args={[0.016, 8, 6]} />
        <meshBasicMaterial color="#8fb0ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={set('flowUrine')} args={[null, null, flowSys.urine.length]} frustumCulled={false}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshBasicMaterial color="#fff2a8" toneMapped={false} />
      </instancedMesh>

      {/* Подписи */}
      {labels &&
        labelAnchors
          .filter((l) => isCut || l.ext)
          .map((l) => (
            <Html key={l.id} position={l.pos} center zIndexRange={[20, 0]}>
              <button
                className={'k-label' + (selected === l.id ? ' active' : '')}
                style={{ '--c': PARTS[l.id].color }}
                onClick={() => onSelect(l.id)}
              >
                {PARTS[l.id].name.split(' — ')[0]}
              </button>
            </Html>
          ))}
    </group>
  )
}
