import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get canvas and create renderer
const canvas = document.querySelector('#cube');
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, canvas});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Camera
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

// Scene
const scene = new THREE.Scene();

// Light
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(camera.position.x, camera.position.y, camera.position.z);

scene.add(light);

// Box geo and mat
const bW = 1;
const bH = 1;
const bD = 1;
const geometry = new THREE.BoxGeometry(bW, bH, bD);
const material = new THREE.MeshPhongMaterial({color: 0x0d9945});

// Cube mesh
const cube = new THREE.Mesh(geometry, material);
// Init cube position
// cube.rotation.x = 0.30;
// cube.rotation.y = -0.35;
scene.add(cube);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Interaction events
var timer = null;
var startTime = 0;
const cntlStart = 'start';
var waitDuration = 3;
const cntlEnd = 'end';
var endTime = 0;

controls.cursorStyle = 'grab';
// Disable undesired controls
controls.enablePan = false;
controls.enableZoom = false;
// Auto Rotate Camera around target
controls.autoRotate = true;
controls.autoRotateSpeed = -0.5;

controls.update();

// -------------------------------- Lifecycle -------------------------------

// Render with animation
function render() {
  // Update Timer

  // Check if resize
	if (resizeRenderToDisplaySize(renderer)){
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

  // Update controls and set light pos to current camera pos
  if (timer !== null) console.log("MEEP MORP");
  controls.update();
  light.position.set(camera.position.x, camera.position.y, camera.position.z);

	renderer.render(scene, camera);

	requestAnimationFrame(render);
}

requestAnimationFrame(render);

// ----------------- Utils -------------------------

// Check canvas size against render size
function resizeRenderToDisplaySize(renderer, maxPixelCount=3840*2160) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  let width  = Math.floor( canvas.clientWidth  * pixelRatio );
  let height = Math.floor( canvas.clientHeight * pixelRatio );
  const pixelCount = width * height;
  const renderScale = pixelCount > maxPixelCount ? Math.sqrt(maxPixelCount / pixelCount) : 1;
  width = Math.floor(width * renderScale);
  height = Math.floor(height * renderScale);

  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// ---------------- Event Callbacks ------------------

// On interaction, stop rotation
controls.addEventListener(cntlStart, (event) => {
  // Stop rotation
  controls.autoRotate = false;
  //TODO: Set start time
  
});

controls.addEventListener(cntlEnd, (event) => {
  //TODO: Set end time
});