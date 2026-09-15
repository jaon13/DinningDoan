<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  /** @type {HTMLDivElement} */
  let container;

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    // Tablet/mobile: no WebGL — calm CSS only
    if (reduced || isMobile || !container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x121215, 0.045);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0.35, 0.15, 6.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });

    // —— Brass material (why Three.js: real metal response to light) ——
    const brass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#b8922f'),
      metalness: 1,
      roughness: 0.28,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      reflectivity: 0.9,
      envMapIntensity: 1,
      transparent: true,
      opacity: 0.92
    });
    const brassSoft = brass.clone();
    brassSoft.roughness = 0.42;
    brassSoft.opacity = 0.55;

    // Soft studio environment via PMREM from a simple scene gradient
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.add(new THREE.AmbientLight(0xffe6b0, 0.8));
    const envLight = new THREE.DirectionalLight(0xfff0d0, 1.2);
    envLight.position.set(2, 3, 1);
    envScene.add(envLight);
    const envLight2 = new THREE.DirectionalLight(0x6a7a90, 0.35);
    envLight2.position.set(-2, -1, -2);
    envScene.add(envLight2);
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // —— Quiet brass fixture: nested rings + stem (bar pendant vibe) ——
    const fixture = new THREE.Group();
    fixture.position.set(1.55, 0.35, 0);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.018, 16, 96),
      brass
    );
    ring.rotation.x = Math.PI / 2.15;

    const ringInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.012, 12, 80),
      brassSoft
    );
    ringInner.rotation.x = Math.PI / 2.4;
    ringInner.rotation.z = 0.4;

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 1.8, 12),
      brassSoft
    );
    stem.position.y = 1.35;

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 24, 24),
      brass
    );
    cap.position.y = 0.05;
    cap.scale.set(1, 0.7, 1);

    // Warm bulb glow (emissive core — light that materials react to)
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffe2a8,
      emissive: new THREE.Color('#d4af37'),
      emissiveIntensity: 1.4,
      roughness: 0.6,
      metalness: 0
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), bulbMat);
    bulb.position.y = -0.02;

    fixture.add(stem, ring, ringInner, cap, bulb);
    scene.add(fixture);

    // Thin second ring in depth for parallax layering
    const farRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.008, 12, 100),
      brassSoft.clone()
    );
    farRing.material.opacity = 0.22;
    farRing.position.set(-1.8, -0.4, -1.2);
    farRing.rotation.x = Math.PI / 2.6;
    farRing.rotation.y = 0.35;
    scene.add(farRing);

    // Lights that make metal read as metal
    const ambient = new THREE.AmbientLight(0x1a1a22, 0.55);
    scene.add(ambient);

    const key = new THREE.PointLight(0xffd089, 18, 12, 2);
    key.position.set(1.55, 0.4, 1.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x8890a0, 0.55);
    fill.position.set(-4, 2, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xd4af37, 0.45);
    rim.position.set(3, -1, -4);
    scene.add(rim);

    let w = 1;
    let h = 1;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let scrollT = 0;
    let raf = 0;
    let running = true;
    const t0 = performance.now();

    const resize = () => {
      w = container.clientWidth || 1;
      h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const onPointer = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      const hero = container.parentElement;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const view = window.innerHeight || 1;
      scrollT = Math.min(Math.max(-rect.top / (rect.height * 0.85), 0), 1);
      // Fade fixture as user leaves hero
      container.style.opacity = String(0.95 * (1 - scrollT * 0.85));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running) return;

      const t = (performance.now() - t0) / 1000;
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;

      // Very slow, calm motion — not floating chaos
      fixture.rotation.y = Math.sin(t * 0.12) * 0.08 + mx * 0.18;
      fixture.rotation.x = Math.cos(t * 0.1) * 0.04 + my * 0.1;
      ringInner.rotation.z = 0.4 + t * 0.05;
      farRing.rotation.z = t * 0.03;

      // Light follows cursor gently — metal specular shifts
      key.position.x = 1.55 + mx * 0.55;
      key.position.y = 0.4 - my * 0.35;
      key.intensity = 16 + Math.sin(t * 0.7) * 1.2;
      bulbMat.emissiveIntensity = 1.2 + Math.sin(t * 0.7) * 0.15;

      camera.position.x = 0.35 + mx * 0.22;
      camera.position.y = 0.15 - my * 0.12 + scrollT * 0.35;
      camera.position.z = 6.2 + scrollT * 0.8;
      camera.lookAt(0.6, 0.1, 0);

      renderer.render(scene, camera);
    };

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      envTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  });
</script>

<div
  bind:this={container}
  class="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
  style="opacity: 0.95; mix-blend-mode: screen;"
  aria-hidden="true"
></div>
