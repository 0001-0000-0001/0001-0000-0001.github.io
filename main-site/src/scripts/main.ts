import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* 

----------------- Property Declarations ------------------------

*/

let scene : THREE.Scene | null = null;

// Camera
let camera : THREE.PerspectiveCamera | null = null;
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 3;

// Light
let light : THREE.DirectionalLight | null = null;
const lightColor = 0xfefefe;
const lightInten = 1;

let renderer : THREE.WebGLRenderer | null = null;
let timer : THREE.Timer | null = null;

// Mesh
let cube : THREE.Mesh | null = null;
let cubeMat = new THREE.MeshPhongMaterial(
	{
		color: 0x0f0f0f,
		specular: 0xfefefe,
		shininess: 10,
	}
)
const bW = 1;
const bH = 1;
const bD = 1;
const boxGeo = new THREE.BoxGeometry(bW, bH, bD);

let controls : OrbitControls | null = null;
let isInteracting : boolean = false;
var waitDuration = 3;
var endTime = 0;

function main() {

	/*

	---------------- Lifecycle ------------------

	*/

	function init() {
		// Get canvas and create renderer
		const canvas = document.querySelector('#cube');
		if (canvas == null){
			console.error("canvas is null");
			return;
		}
		renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, canvas});
		renderer.setClearColor(0x000000, 0);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Camera
		camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.z = 2;

		// Scene
		scene = new THREE.Scene();

		// Light
		light = new THREE.DirectionalLight(lightColor, lightInten);
		light.position.set(camera.position.x, camera.position.y, camera.position.z);

		scene.add(light);

		// Cube mesh
		cube = new THREE.Mesh(boxGeo, cubeMat);
		scene.add(cube);

		// Controls
		controls = new OrbitControls(camera, renderer.domElement);

		controls.cursorStyle = 'grab';
		// Disable undesired controls
		controls.enablePan = false;
		controls.enableZoom = false;
		// Auto Rotate Camera around target
		controls.autoRotate = true;
		controls.autoRotateSpeed = -0.5;

		controls.update();
	}

	init();

	/* 
	
	------------------- Event Connections -------------------

	*/

	const cntlStart = 'start';
	const cntlEnd = 'end';

	// On interaction, stop rotation
	controls?.addEventListener(cntlStart, (event) => {
		// Stop rotation
		if (controls == null) return;
		controls.autoRotate = false;
		if (timer == null){
			timer = new THREE.Timer();
		}
		timer.update();
		isInteracting = true;
	});

	controls?.addEventListener(cntlEnd, (event) => {
		if (timer == null) return;
		endTime = timer.getElapsed();
		isInteracting = false;
	});

	/* 
	
	------------------- Main Loop -------------------

	*/

	// Render with animation
	function animate() {
		// Pre Checks
		if (camera == null || controls == null || renderer == null || scene == null) return;

		// Update Timer
		var currentTime = 0;
		if (timer !== null){
			timer.update();
			currentTime = timer.getElapsed();
		}

		// Check if resize
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer?.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		// Update controls and set light pos to current camera pos
		if (timer !== null && (!isInteracting) && (currentTime > endTime + waitDuration)){
			controls.autoRotate = true;
			timer.dispose();
			timer = null;
			currentTime = 0;
			endTime = 0;
		}
		
		controls.update();
		light?.position.set(camera.position.x, camera.position.y, camera.position.z);

			renderer.render(scene, camera);

			requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
}

main();

/*

---------------------- Utils -------------------------

*/

// Check canvas size against render size
function resizeRenderToDisplaySize(renderer : THREE.WebGLRenderer, maxPixelCount=3840*2160) {
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

