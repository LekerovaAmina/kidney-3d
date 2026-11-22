import { Suspense, useState, useCallback, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import KidneyModel from './KidneyModel.jsx'
import { PARTS, PART_ORDER } from '../data/parts.js'

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
            {step.text}
          </div>
        )}

        <div className="explorer-toolbar">
          <button className={'tbtn primary'} onClick={startBuild}>▶ Построить почку</button>
          <button className={'tbtn' + (cut ? ' on' : '')} onClick={() => setCut((v) => !v)}>
            {cut ? 'Целая почка' : 'Разрез'}
          </button>
          <button className={'tbtn' + (flow ? ' on' : '')} onClick={() => setFlow((v) => !v)}>Кровоток</button>
          <button className={'tbtn' + (labels ? ' on' : '')} onClick={() => setLabels((v) => !v)}>Подписи</button>
          <button className={'tbtn' + (rotate ? ' on' : '')} onClick={() => setRotate((v) => !v)}>Вращение</button>
        </div>
        <div className="explorer-hint">Крутите мышью / пальцем · колесо — масштаб · нажмите на любую часть</div>
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
              <div className="part-kicker">Левая почка · вид спереди</div>
              <h3>Выберите часть почки</h3>
              <p>
                Нажмите на любую структуру на модели или в списке выше. Включите <b>«Разрез»</b>, чтобы заглянуть
                внутрь, или запустите <b>«Построить почку»</b> — модель соберётся слой за слоем.
              </p>
              <ul className="legend">
                <li><i style={{ background: '#ff6b5e' }} /> артериальная кровь (к почке)</li>
                <li><i style={{ background: '#8fb0ff' }} /> венозная кровь (от почки)</li>
                <li><i style={{ background: '#fff2a8' }} /> моча (в разрезе)</li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
