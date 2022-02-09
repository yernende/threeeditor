import 'normalize.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';

import { renderer, scene, camera } from './init/three.js';
import './init/ui.js';

camera.position.z = 3;

const controls = new OrbitControls(camera, renderer.domElement);

controls.mouseButtons = {
  MIDDLE: THREE.MOUSE.ROTATE
}

window.addEventListener("resize", (event) => {
  camera.aspect = viewport.offsetWidth / viewport.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
});

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

(function animate() {
  requestAnimationFrame(animate);

  stats.begin();
  renderer.render(scene, camera);
  stats.end();
})();
