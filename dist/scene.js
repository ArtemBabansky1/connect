import * as THREE from 'three';
import { RoomEnvironment } from './assets/RoomEnvironment.js';

// Real WebGL sculpture. The generated artwork remains as the no-WebGL fallback.
const container = document.querySelector('.live-sculpture');
const canvas = document.querySelector('#sculpture');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
  camera.position.set(0, 0, 7.4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, .04);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff7e8, 0x92421e, 2));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(-3, 5, 6);
  scene.add(light);
  const group = new THREE.Group();
  scene.add(group);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xfc5b16, metalness: .12, roughness: .22, clearcoat: 1, clearcoatRoughness: .12 });
  const pale = new THREE.MeshPhysicalMaterial({ color: 0xffc397, metalness: .06, roughness: .25, clearcoat: 1 });
  const geometry = new THREE.TorusGeometry(.89, .28, 28, 88);
  const a = new THREE.Mesh(geometry, material);
  a.position.set(-.57, -.26, 0);
  a.rotation.set(.4, -.3, -.2);
  const b = new THREE.Mesh(geometry, pale);
  b.position.set(.62, .36, 0);
  b.rotation.set(1.02, .4, .4);
  group.add(a, b);
  group.rotation.set(.2, -.2, -.28);
  group.scale.setScalar(1.2);
  let visible = false, frame = 0, pointerX = 0, pointerY = 0;
  function render(time = 0) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (!reduced.matches) {
      group.rotation.y += ((-.2 + pointerX * .35) - group.rotation.y) * .045;
      group.rotation.x += ((.2 + pointerY * .2) - group.rotation.x) * .045;
      group.rotation.z = -.28 + Math.sin(time * .00035) * .08;
      group.position.y = Math.sin(time * .0007) * .07;
    }
    renderer.render(scene, camera);
    container.classList.add('is-ready');
    if (!reduced.matches) frame = requestAnimationFrame(render);
  }
  function start() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); }
  const resize = new ResizeObserver(() => {
    const width = container.clientWidth, height = container.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    start();
  });
  resize.observe(container);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start(); else { cancelAnimationFrame(frame); frame = 0; }
  });
  observer.observe(container);
  container.addEventListener('pointermove', event => {
    const rect = container.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - .5;
    pointerY = (event.clientY - rect.top) / rect.height - .5;
  }, {passive:true});
  container.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start();
  });
  reduced.addEventListener('change', start);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); container.classList.remove('is-ready'); cancelAnimationFrame(frame); frame = 0; });
} catch (error) {
  container.classList.remove('is-ready');
  renderer?.dispose();
  console.info('Using the static sculpture fallback.');
}
