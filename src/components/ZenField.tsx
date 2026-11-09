'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ZenField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.z = 6

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const count = 1800
    const positions = new Float32Array(count * 3)
    const original = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 1.62 + (Math.random() - 0.5) * 0.14
      const drift = (Math.random() - 0.5) * 0.38
      const i3 = i * 3
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = Math.sin(angle) * radius
      positions[i3 + 2] = drift
      original[i3] = positions[i3]
      original[i3 + 1] = positions[i3 + 1]
      original[i3 + 2] = positions[i3 + 2]
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0x30332d,
      size: 0.018,
      transparent: true,
      opacity: 0.58,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.x = -0.12
    scene.add(points)

    const centerGeometry = new THREE.SphereGeometry(0.045, 20, 20)
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xb84d32 })
    const center = new THREE.Mesh(centerGeometry, centerMaterial)
    scene.add(center)

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let pointerX = 0
    let pointerY = 0
    let targetX = 0
    let targetY = 0
    let frame = 0
    let sized = false
    let disposed = false

    const onPointer = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0 || motion.matches) return
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.6
      targetY = -((event.clientY - rect.top) / rect.height - 0.5) * 0.6
    }

    const onLeave = () => {
      targetX = 0
      targetY = 0
    }

    const clock = new THREE.Clock()
    const animate = () => {
      if (disposed || !sized || motion.matches) {
        frame = 0
        return
      }
      const t = clock.getElapsedTime()
      pointerX += (targetX - pointerX) * 0.035
      pointerY += (targetY - pointerY) * 0.035
      points.rotation.z = t * 0.018
      points.rotation.y = pointerX * 0.3
      points.rotation.x = -0.12 + pointerY * 0.22

      const array = geometry.attributes.position.array as Float32Array
      for (let i = 0; i < array.length; i += 3) {
        const phase = i * 0.013
        const breath = 1 + Math.sin(t * 0.72 + phase) * 0.006
        array[i] = original[i] * breath
        array[i + 1] = original[i + 1] * breath
      }
      geometry.attributes.position.needsUpdate = true
      center.scale.setScalar(1 + Math.sin(t * 1.1) * 0.16)
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }

    const syncMotion = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (disposed || !sized) return
      if (motion.matches) renderer.render(scene, camera)
      else animate()
    }

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      sized = width > 0 && height > 0
      if (sized) {
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      syncMotion()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    mount.addEventListener('pointermove', onPointer)
    mount.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)
    motion.addEventListener('change', syncMotion)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      mount.removeEventListener('pointermove', onPointer)
      mount.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
      motion.removeEventListener('change', syncMotion)
      geometry.dispose()
      material.dispose()
      centerGeometry.dispose()
      centerMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="zen-field" aria-hidden="true" />
}
