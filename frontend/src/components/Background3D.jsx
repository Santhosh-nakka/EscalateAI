import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05030a, 0.035);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2, 16);

    // ---------- Lights ----------
    scene.add(new THREE.AmbientLight(0x140f24, 0.7));
    const rimLight = new THREE.DirectionalLight(0x6a5a9a, 0.4);
    rimLight.position.set(-5, 10, 5);
    scene.add(rimLight);

    const cursorLight = new THREE.PointLight(0xffe8c0, 1.6, 11, 2);
    cursorLight.position.set(0, 2, 6);
    scene.add(cursorLight);

    // ---------- Helpers ----------
    function makeSoftCircleTexture(color) {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    function makeRockTexture() {
      const size = 256;
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0c0a14';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const r = 2 + Math.random() * 10;
        const shade = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.3)';
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, shade);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    }

    // ---------- Cave floor ----------
    const floorMat = new THREE.MeshStandardMaterial({ map: makeRockTexture(), roughness: 0.85, metalness: 0.08, color: 0x1a1428 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.5;
    scene.add(floor);

    // looming cave wall silhouettes in the far background
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0a0712, roughness: 1 });
    function buildWallChunk(x, y, z, scale) {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), wallMat);
      mesh.position.set(x, y, z);
      mesh.scale.set(scale * (1.6 + Math.random()), scale * (1.2 + Math.random() * 0.6), scale);
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      scene.add(mesh);
    }
    for (let i = 0; i < 10; i++) {
      buildWallChunk((Math.random() - 0.5) * 60, -2 + Math.random() * 10, -30 - Math.random() * 25, 4 + Math.random() * 5);
    }

    // ---------- Crystal clusters ----------
    const gemPalette = [
      { hue: 0x9a5cff, name: 'amethyst' },
      { hue: 0x4fe0a8, name: 'emerald' },
      { hue: 0x4fa8ff, name: 'sapphire' },
      { hue: 0xff6fa8, name: 'rose' },
      { hue: 0xffc85c, name: 'citrine' }
    ];

    function buildShard(radiusBase, height, hue) {
      const geo = new THREE.CylinderGeometry(radiusBase * 0.12, radiusBase, height, 6);
      const mat = new THREE.MeshStandardMaterial({
        color: hue, transparent: true, opacity: 0.72, roughness: 0.15, metalness: 0.25,
        emissive: hue, emissiveIntensity: 0.55
      });
      return new THREE.Mesh(geo, mat);
    }

    function buildCrystalCluster(x, z, hue, scale, hanging) {
      const group = new THREE.Group();
      const floorY = -3.5;
      group.position.set(x, hanging ? 4.2 : floorY, z);
      if (hanging) group.rotation.z = Math.PI;
      group.scale.setScalar(scale);

      const shardCount = 4 + Math.floor(Math.random() * 3);
      const shards = [];
      for (let i = 0; i < shardCount; i++) {
        const h = 1.2 + Math.random() * 1.8;
        const shard = buildShard(0.28 + Math.random() * 0.18, h, hue);
        shard.position.set((Math.random() - 0.5) * 0.6, h / 2, (Math.random() - 0.5) * 0.6);
        shard.rotation.y = Math.random() * Math.PI * 2;
        shard.rotation.x = (Math.random() - 0.5) * 0.25;
        shard.rotation.z = (Math.random() - 0.5) * 0.25;
        group.add(shard);
        shards.push({
          shard,
          baseEmissive: 0.55,
          homePos: shard.position.clone(),
          homeRot: shard.rotation.clone(),
          breakDir: new THREE.Vector3((Math.random() - 0.5), 0.5 + Math.random() * 0.7, (Math.random() - 0.5)).normalize(),
          breakDist: 0.7 + Math.random() * 1.1,
          phase: Math.random() * Math.PI * 2
        });
      }

      // glow halo
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeSoftCircleTexture(`#${new THREE.Color(hue).getHexString()}`),
        color: hue, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      glow.scale.setScalar(4.5);
      glow.position.y = 1.2;
      group.add(glow);

      const glowLight = new THREE.PointLight(hue, 0.9, 7, 2);
      glowLight.position.y = 1;
      group.add(glowLight);

      scene.add(group);
      let sparkle = 0;

      return {
        group, shards, glow, glowLight,
        update(t, cursorWorld) {
          const worldPos = new THREE.Vector3();
          group.getWorldPosition(worldPos);
          const dist = worldPos.distanceTo(cursorWorld);
          const near = THREE.MathUtils.clamp(1 - dist / 6, 0, 1);
          sparkle += (near - sparkle) * (near > sparkle ? 0.18 : 0.045);

          shards.forEach((s, i) => {
            s.shard.material.emissiveIntensity = s.baseEmissive + sparkle * 2.2 + Math.sin(t * 3 + i) * 0.05;

            const jitter = new THREE.Vector3(
              Math.sin(t * 1.4 + s.phase),
              Math.cos(t * 1.7 + s.phase * 1.3),
              Math.sin(t * 1.1 + s.phase * 0.8)
            ).multiplyScalar(0.08 * sparkle);
            s.shard.position.copy(s.homePos).addScaledVector(s.breakDir, s.breakDist * sparkle).add(jitter);

            s.shard.rotation.x = s.homeRot.x + Math.sin(t * 2 + s.phase) * 0.5 * sparkle;
            s.shard.rotation.y = s.homeRot.y + sparkle * 1.1 + Math.sin(t * 0.8 + s.phase) * 0.2 * sparkle;
            s.shard.rotation.z = s.homeRot.z + Math.cos(t * 1.6 + s.phase) * 0.5 * sparkle;
          });
          glow.material.opacity = 0.3 + sparkle * 0.55 + Math.sin(t * 1.5) * 0.04;
          glow.scale.setScalar(4.5 + sparkle * 3.2);
          glowLight.intensity = 0.8 + sparkle * 2.8;
        }
      };
    }

    const clusters = [];
    const positions = [
      [-6, -2, 0.9], [5.5, -4, 0.8], [-2.5, -8, 1.1], [3, -10, 0.7],
      [-8.5, -12, 1.3], [7.5, -14, 0.9], [0, -16, 1.5], [-4, -18, 0.8],
      [6, -19, 1.0], [-9, -6, 0.6],
      [10, -6, 1.0], [-12, -9, 0.8], [12, -12, 0.7], [-11, -16, 1.1],
      [9, -17, 0.9], [-2, -3, 0.6], [2.5, -2, 0.7], [-13, -3, 0.9],
      [13, -8, 0.8], [-6.5, -20, 1.0], [4.5, -21, 0.9], [0, -22, 1.2],
      [-9, -1, 0.5], [8, -1.5, 0.6],
      [-20, -7, 1.0], [20, -9, 0.9], [-22, -13, 0.8], [22, -15, 1.0],
      [-19, -19, 0.7], [19, -20, 0.9], [-24, -5, 0.6], [24, -6, 0.7],
      [-17, -2, 0.5], [17, -3, 0.6]
    ];
    positions.forEach(([x, z, scale], i) => {
      const hue = gemPalette[i % gemPalette.length].hue;
      clusters.push(buildCrystalCluster(x, z, hue, scale, false));
    });
    const hangingPositions = [
      [-3, -5, 0.7], [4, -9, 0.6], [-6, -15, 0.8], [7, -18, 0.7],
      [-10, -10, 0.6], [2, -13, 0.5], [10, -4, 0.6],
      [-18, -8, 0.6], [18, -12, 0.7]
    ];
    hangingPositions.forEach(([x, z, scale], i) => {
      const hue = gemPalette[(i + 2) % gemPalette.length].hue;
      clusters.push(buildCrystalCluster(x, z, hue, scale, true));
    });

    const heroA = buildCrystalCluster(-3, -4, gemPalette[0].hue, 1.8, false);
    const heroB = buildCrystalCluster(3.5, -6, gemPalette[3].hue, 1.5, false);
    clusters.push(heroA, heroB);

    // ---------- Floating light motes ----------
    const moteCount = window.innerWidth < 640 ? 150 : 400;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    const motePhase = new Float32Array(moteCount);
    const moteSpeed = new Float32Array(moteCount);
    const moteSize = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      motePos[i*3]   = (Math.random() - 0.5) * 40;
      motePos[i*3+1] = -3 + Math.random() * 12;
      motePos[i*3+2] = (Math.random() - 0.5) * 10 - Math.random() * 25;
      motePhase[i] = Math.random() * Math.PI * 2;
      moteSpeed[i] = 0.6 + Math.random() * 1.6;
      moteSize[i] = 1.2 + Math.random() * 2.0;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(motePhase, 1));
    moteGeo.setAttribute('aSpeed', new THREE.BufferAttribute(moteSpeed, 1));
    moteGeo.setAttribute('aSize', new THREE.BufferAttribute(moteSize, 1));
    const moteMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aSize;
        uniform float uTime;
        varying float vTwinkle;
        void main() {
          vTwinkle = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
          vec3 pos = position;
          pos.y += sin(uTime * aSpeed * 0.5 + aPhase) * 0.6;
          pos.x += cos(uTime * aSpeed * 0.3 + aPhase) * 0.4;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * vTwinkle * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, d) * vTwinkle * 0.8;
          gl_FragColor = vec4(0.85, 0.75, 1.0, alpha);
        }
      `
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    // ---------- Mouse tracking ----------
    const raycaster = new THREE.Raycaster();
    const raycastMouse = new THREE.Vector2();
    const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 9);
    const cursorWorld = new THREE.Vector3(0, 1, -9);
    const mouseTarget = { x: 0, y: 0 };
    let mouseCurrent = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;

      raycastMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      raycastMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(raycastMouse, camera);
      const hit = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(cursorPlane, hit)) {
        cursorWorld.copy(hit);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const orbSmoothed = cursorWorld.clone();
    const clock = new THREE.Clock();
    let animationFrameId;

    function animate() {
      const t = clock.getElapsedTime();
      moteMat.uniforms.uTime.value = t;

      orbSmoothed.lerp(cursorWorld, 0.15);
      cursorLight.position.copy(orbSmoothed);
      const flicker = 0.92 + Math.sin(t * 9) * 0.05 + Math.sin(t * 5.3) * 0.03;
      cursorLight.intensity = 1.7 * flicker;

      clusters.forEach((c) => c.update(t, orbSmoothed));

      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;
      camera.position.x = mouseCurrent.x * 2.5 + Math.sin(t * 0.04) * 1.5;
      camera.position.y = 2 - mouseCurrent.y * 1.4;
      camera.lookAt(0, -0.5, -8);

      renderer.render(scene, camera);
      if (!prefersReduced) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      // Basic cleanup
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 35%, #0a0614 0%, #030207 65%, #000000 100%)',
        pointerEvents: 'none' // We don't want the canvas intercepting clicks meant for the app
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
