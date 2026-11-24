import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColorEnvironment } from 'three/examples/jsm/environments/ColorEnvironment.js';

/* 

----------------- Property Declarations ------------------------

*/

let scene : THREE.Scene | null = null;

// Camera
let camera : THREE.PerspectiveCamera | null = null;
const camPos = new THREE.Vector3(0, 0, 4);
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 10;

// Light
let light : THREE.PointLight | null = null;
const lightColor = 0xce9e00;
const lightInten = 10;

let renderer : THREE.WebGLRenderer | null = null;
const timer = new THREE.Timer()

// Menu Mesh
const loader = new GLTFLoader();
let menuCube : THREE.Group | null = null;

// Animations
let mixer : THREE.AnimationMixer | null = null;
let clips : THREE.AnimationClip[] | null = null;

// Interaction
let controls : OrbitControls | null = null;
let isInteracting : boolean = false;
const waitDuration = 3;
var endTime = 0;

// Raycasts
let centerRay : THREE.Raycaster | null = null; // For cube animation
let centerPos = new THREE.Vector2(0, 0);

let raycast : THREE.Raycaster | null = null; // For user interaction
let mousePos = new THREE.Vector2(0, 0);

// let rayVisualizer : THREE.ArrowHelper | null = null; // DEBUG ONLY

function main() {

	/*

	---------------- Lifecycle ------------------

	*/

	async function init() {
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
		camera.position.set(camPos.x, camPos.y, camPos.z);

		// Scene
		scene = new THREE.Scene();
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		scene.environment = pmremGenerator.fromScene(new ColorEnvironment( 0x202020 )).texture;

		
		// Light
		light = new THREE.PointLight(lightColor, lightInten);
		light.position.set(camera.position.x, camera.position.y, camera.position.z);

		scene.add(light);

		// Load and add Menu Cube
		try {
			const gltf = await loader.loadAsync('/assets/models/WebsiteMenuCube.glb');
			menuCube = gltf.scene;
			mixer = new THREE.AnimationMixer(menuCube);
			clips = gltf.animations;
			scene.add(menuCube);
		} catch (error){
			console.log(error);
		}

		// ------------------------------ TEST ANIMATIONS ------------------------------------

		// PLAY ALL
		clips?.forEach(function(clip) {
			console.log(clip);
			playAnimation(clip);
		});

		// PLAY ONE
		// if (clips != null) {
		// 	const i = clips[0];
		// 	playAnimation(i);
		// }

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

		/* 
		
		------------------- Event Connections -------------------

		*/

		//----------------- Mouse movement
		document.addEventListener('mousemove', (event) => {
			event.preventDefault();
			mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
			mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
		});

		// ---------------- Camera grab/move 'start' and 'end'

		// On interaction, stop rotation
		controls?.addEventListener('start', () => {
			// Stop rotation, create timer, set interaction bool
			if (controls == null) return;
			controls.autoRotate = false;

			timer.update();
			isInteracting = true;
		});

		controls?.addEventListener('end', () => {
			// Set end interaction time and set interaction bool
			if (timer == null) return;
			endTime = timer.getElapsed();
			isInteracting = false;
		});

		// Raycasts
		centerRay = new THREE.Raycaster(camera.position);
		raycast = new THREE.Raycaster(camera.position);

		animate();
	}

	init();

	/* 
	
	------------------- Main Loop -------------------

	*/

	// Render with animation
	function animate() {
		// Pre Checks
		if (
			camera == null || 
			controls == null || 
			renderer == null || 
			scene == null ||
			menuCube == null
		) return;

		// Update Time
		var currentTime = 0;
		let deltaSeconds : number = 0;

		timer.update();
		currentTime = timer.getElapsed();
		deltaSeconds = timer.getDelta();

		// Update Mixer
		mixer?.update(deltaSeconds);

		// Check if resize
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer?.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		// Update controls and set light pos to current camera pos
		if (timer !== null && (!isInteracting) && (currentTime > endTime + waitDuration)){
			controls.autoRotate = true;
			// timer.dispose();
			// timer = null;
			currentTime = 0;
			endTime = 0;
		}
		
		controls.update();
		light?.position.set(camera.position.x, camera.position.y, camera.position.z);
		light?.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

		// Center Ray for Cube Animations
		centerRay?.setFromCamera(centerPos, camera);
		const centerInter = centerRay?.intersectObject(menuCube);

		if (centerInter != null && centerInter.length > 0){
			const hit = centerInter[0];
			// console.log("Center Inter: ", hit);
		}

		// Interaction Ray
		raycast?.setFromCamera(mousePos, camera);
		const interac = raycast?.intersectObject(menuCube);

		if (interac != null && interac.length > 0){
			const hit = interac[0];
			// console.log("Interac: ", hit);
		}
		
		renderer.render(scene, camera);

		requestAnimationFrame(animate);
	}
}

main();

/*

---------------------- Animations -------------------------

*/

function playAnimation(clip : THREE.AnimationClip) {
	const action = mixer?.clipAction(clip);
	if (action == null) return;
	action.setLoop(THREE.LoopOnce, 1);
	action.clampWhenFinished = true;
	action.play();
}

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

