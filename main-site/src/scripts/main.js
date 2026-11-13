import * as THREE from 'three';

// Get canvas and create renderer
const canvas = document.querySelector('#cube');
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, canvas});
renderer.setClearColor(0x000000, 0);

// Camera
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

// Light
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-2, 1, 4);

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

// Render with animation
function render(time) {
	time *= 0.0001;

	if (resizeRenderToDisplaySize(renderer)){
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}

	cube.rotation.y = time;
	cube.rotation.x = -time;

	renderer.render(scene, camera);

	requestAnimationFrame(render);
}

requestAnimationFrame(render);
