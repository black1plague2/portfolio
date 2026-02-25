import { useEffect, useRef } from 'react';

export default function AuroraCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    let renderer; let scene; let camera; let mesh; let frameId;
    let width = 0; let height = 0;
    let cleanup = () => {};

    const init = async () => {
      const THREE = await import('three');
      if (!mountRef.current) return;

      width = mountRef.current.clientWidth;
      height = mountRef.current.clientHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
      camera.position.set(0, 0, 8);

      const geometry = new THREE.PlaneGeometry(14, 10, 80, 80);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b8895d'),
        emissive: new THREE.Color('#7d4034'),
        metalness: 0.15,
        roughness: 0.4,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -0.6;
      scene.add(mesh);

      const lightWarm = new THREE.PointLight(0xf0cc50, 1.4, 40);
      lightWarm.position.set(6, 6, 6);
      scene.add(lightWarm);
      const lightDeep = new THREE.PointLight(0x7d4034, 1.1, 40);
      lightDeep.position.set(-6, -3, 4);
      scene.add(lightDeep);

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const time = performance.now() * 0.0015;
        const position = geometry.attributes.position;
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          const wave = Math.sin(x * 0.8 + time) * 0.08 + Math.cos(y * 1.2 + time * 1.2) * 0.08;
          position.setZ(i, wave);
        }
        position.needsUpdate = true;
        mesh.rotation.z += 0.0008;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!mountRef.current) return;
        width = mountRef.current.clientWidth;
        height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', handleResize);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    };

    init();
    return () => cleanup();
  }, []);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0" />;
}
