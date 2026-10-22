import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SpiderHeroId } from '../types';
import { SPIDER_HEROES } from '../data/spiderHeroes';
import { soundEngine } from '../services/soundEngine';
import { Orbit } from 'lucide-react';

interface CosmicWeb3DProps {
  currentHeroId: SpiderHeroId;
  onSelectHero: (heroId: SpiderHeroId) => void;
  isSymbioteSurge: boolean;
}

interface NodeData {
  heroId: SpiderHeroId;
  earth: string;
  alias: string;
  color: string;
  position: THREE.Vector3;
}

export const CosmicWeb3D: React.FC<CosmicWeb3DProps> = ({
  currentHeroId,
  onSelectHero,
  isSymbioteSurge,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredHero, setHoveredHero] = useState<SpiderHeroId | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || 800;
    const height = 480;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isSymbioteSurge ? 0x05020c : 0x070914, 0.002);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 30, 180);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(isSymbioteSurge ? 0xa855f7 : 0x00b4d8, 2, 300);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const webGroup = new THREE.Group();
    scene.add(webGroup);

    const lineColor = isSymbioteSurge ? 0x7c3aed : 0x38bdf8;
    const webMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: isSymbioteSurge ? 0.35 : 0.25,
    });

    // Concentric web polygon rings
    for (let r = 1; r <= 6; r++) {
      const radius = r * 22;
      const points: THREE.Vector3[] = [];
      const segments = 16;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const wave = Math.sin(s * 2) * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * (radius + wave), Math.sin(theta) * (radius + wave), (r % 2 === 0 ? 5 : -5)));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      webGroup.add(new THREE.Line(ringGeo, webMaterial));
    }

    // Radial web spokes
    for (let s = 0; s < 12; s++) {
      const theta = (s / 12) * Math.PI * 2;
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(theta) * 145, Math.sin(theta) * 145, (s % 2 === 0 ? 12 : -12)),
      ];
      webGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), webMaterial));
    }

    // 8 Multiverse Dimensional Earth Nodes
    const heroesList: SpiderHeroId[] = [
      'spiderman',
      'miles',
      'gwen',
      'spider2099',
      'spidernoir',
      'venom',
      'carnage',
      'spiderpunk',
    ];

    const nodes: NodeData[] = heroesList.map((id, idx) => {
      const meta = SPIDER_HEROES[id];
      const angle = (idx / heroesList.length) * Math.PI * 2;
      const dist = 75 + (idx % 2 === 0 ? 15 : -10);
      const z = Math.sin(idx * 2) * 20;
      return {
        heroId: id,
        earth: meta.earthDesignation,
        alias: meta.alias,
        color: meta.primaryColor,
        position: new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle) * dist, z),
      };
    });

    const nodeMeshes: { mesh: THREE.Mesh; data: NodeData }[] = [];

    nodes.forEach((node) => {
      const isCurrent = node.heroId === currentHeroId;
      const nodeGeo = new THREE.SphereGeometry(isCurrent ? 7.5 : 5.5, 32, 32);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: isCurrent ? 1.4 : 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(node.position);
      webGroup.add(mesh);
      nodeMeshes.push({ mesh, data: node });

      if (isCurrent) {
        const haloGeo = new THREE.RingGeometry(9, 11, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(node.position);
        webGroup.add(halo);
      }
    });

    // Cosmic Particle Embers
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 400;
      posArray[i + 1] = (Math.random() - 0.5) * 300;
      posArray[i + 2] = (Math.random() - 0.5) * 300;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      color: isSymbioteSurge ? 0xa855f7 : 0x00f0ff,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Drag Rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        webGroup.rotation.y += deltaX * 0.005;
        webGroup.rotation.x += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const found = nodeMeshes.find((n) => n.mesh === intersects[0].object);
        if (found) {
          container.style.cursor = 'pointer';
          setHoveredHero(found.data.heroId);
          return;
        }
      }
      container.style.cursor = 'grab';
      setHoveredHero(null);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const found = nodeMeshes.find((n) => n.mesh === intersects[0].object);
        if (found) {
          soundEngine.playDimensionalWarp();
          onSelectHero(found.data.heroId);
        }
      }
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('click', onClick);

    let time = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.01;

      if (!isDragging) {
        webGroup.rotation.y += 0.002;
        webGroup.rotation.z = Math.sin(time * 0.5) * 0.05;
      }
      particles.rotation.y -= 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentHeroId, isSymbioteSurge, onSelectHero]);

  const activeHoverHero = hoveredHero ? SPIDER_HEROES[hoveredHero] : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#070914] p-6 sm:p-10 shadow-2xl relative overflow-hidden select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-4 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 mb-2">
            <Orbit className="w-3.5 h-3.5 animate-spin" />
            <span>THE WEB OF LIFE &amp; DESTINY // 3D REALITY CONSTELLATION</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-5xl text-white tracking-wide">
            EXPLORE THE <span className="text-hero-primary">MULTIVERSE</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Click and drag to rotate the 3D cosmic web. Click any reality orb to warp instantaneously!
          </p>
        </div>

        {activeHoverHero && (
          <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl flex items-center space-x-3 self-start md:self-auto">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: activeHoverHero.primaryColor }}
            />
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                {activeHoverHero.earthDesignation}
              </span>
              <span className="font-comic text-xl text-white tracking-wide">
                {activeHoverHero.alias}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white/10 text-cyan-300 px-2 py-1 rounded-lg">
              WARP NOW
            </span>
          </div>
        )}
      </div>

      <div
        ref={mountRef}
        className="relative w-full h-[480px] rounded-2xl overflow-hidden bg-[#03050B] border border-white/5 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
