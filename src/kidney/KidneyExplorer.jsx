import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import KidneyModel from './KidneyModel.jsx'
import { PART_ORDER } from '../data/parts.js'
import { useT } from '../i18n.jsx'

// На узких экранах (телефон) отодвигаем камеру, чтобы почка помещалась целиком
function ResponsiveCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    const dist = aspect < 1.1 ? 5.1 * Math.min(1.9, 1.15 / aspect) : 5.1
    camera.position.setLength(dist)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

export default function KidneyExplorer() {
  const t = useT()
  const PARTS = t.PARTS
  const E = t.ui.explorer
  const [cut, setCut] = useState(false)
  const [flow, setFlow] = useState(true)
  const [labels, setLabels] = useState(() => typeof window === 'undefined' || window.innerWidth > 680)
  const [rotate, setRotate] = useState(true)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [buildKey, setBuildKey] = useState(0)
  const [step, setStep] = useState(null)

  const startBuild = () => {
    setCut(true)
    setSelected(null)
    setBuildKey(Date.now())
  }
  const onBuildStep = useCallback((s) => {
    if (s === undefined) return
    setStep(s)
    if (s) setSelected(s.part)
  }, [])

  const info = selected ? PARTS[selected] : null

  // 3D рисуется только когда блок виден — экономит батарею телефона
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 })
    if (wrapRef.current) io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="explorer">
      <div className="explorer-canvas" ref={wrapRef} style={{ cursor: hovered ? 'pointer' : 'grab' }}>
        <Canvas
          shadows
          frameloop={visible ? 'always' : 'never'}
          dpr={[1, 2]}
          camera={{ position: [0.15, 0.1, 5.1], fov: 38 }}
          gl={{ localClippingEnabled: true, antialias: true, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => { gl.localClippingEnabled = true }}
          onPointerMissed={() => setSelected(null)}
        >
          <ResponsiveCamera />
          <color attach="background" args={['#120a0b']} />
          <fog attach="fog" args={['#120a0b', 6, 12]} />
          <ambientLight intensity={0.35} />
          <hemisphereLight args={['#ffe6dc', '#2a1214', 0.6]} />
          <directionalLight position={[3, 4, 5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-4, 1, -3]} intensity={1.2} color="#7fa0ff" />
          <pointLight position={[0, -2, 3]} intensity={6} color="#ff8a70" distance={8} />
          <Suspense fallback={null}>
            <KidneyModel
              parts={PARTS}
              cut={cut}
              flow={flow}
              labels={labels && !step}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
              buildKey={buildKey}
              onBuildStep={onBuildStep}
            />
          </Suspense>
          <ContactShadows position={[0, -2.15, 0]} opacity={0.5} scale={8} blur={2.6} far={3} color="#000" />
          <OrbitControls
            enablePan={false}
            minDistance={2.2}
            maxDistance={8}
            autoRotate={rotate && !selected}
            autoRotateSpeed={0.8}
            target={[0, -0.05, 0]}
          />
        </Canvas>

        {step && (
          <div className="build-caption" key={step.part}>
            <span className="dot" style={{ background: PARTS[step.part].color }} />
            {t.BUILD_TEXT[step.part]}
          </div>
        )}

        <div className="explorer-toolbar">
          <button className={'tbtn primary'} onClick={startBuild}>{E.build}</button>
          <button className={'tbtn' + (cut ? ' on' : '')} onClick={() => setCut((v) => !v)}>
            {cut ? E.whole : E.cut}
          </button>
          <button className={'tbtn' + (flow ? ' on' : '')} onClick={() => setFlow((v) => !v)}>{E.flow}</button>
          <button className={'tbtn' + (labels ? ' on' : '')} onClick={() => setLabels((v) => !v)}>{E.labels}</button>
          <button className={'tbtn' + (rotate ? ' on' : '')} onClick={() => setRotate((v) => !v)}>{E.rotate}</button>
        </div>
        <div className="explorer-hint">{E.hint}</div>
      </div>

      <aside className="explorer-panel">
        <div className="parts-list">
          {PART_ORDER.map((id) => (
            <button
              key={id}
              className={'part-chip' + (selected === id ? ' active' : '')}
              style={{ '--c': PARTS[id].color }}
              onClick={() => {
                setSelected(id)
                if (!['capsule', 'artery', 'vein', 'adrenal', 'ureter'].includes(id)) setCut(true)
              }}
            >
              <i />
              {PARTS[id].name.split(' — ')[0]}
            </button>
          ))}
        </div>
        <div className="part-info" key={selected || 'none'}>
          {info ? (
            <>
              <div className="part-kicker" style={{ color: info.color }}>● {info.short}</div>
              <h3>{info.name}</h3>
              <p>{info.text}</p>
              <ul>
                {info.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="part-kicker">{E.emptyKicker}</div>
              <h3>{E.emptyTitle}</h3>
              <p>
                {E.emptyText[0]}<b>{E.emptyText[1]}</b>{E.emptyText[2]}<b>{E.emptyText[3]}</b>{E.emptyText[4]}
              </p>
              <ul className="legend">
                {E.legend.map((l, i) => (
                  <li key={l}><i style={{ background: ['#ff6b5e', '#8fb0ff', '#fff2a8'][i] }} /> {l}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
