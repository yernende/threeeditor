import * as THREE from 'three';
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import { addModel, removeModel } from "../model/index.js";
import { renderer, scene, camera, viewport } from '../init/three.js';

const gui = new GUI();

export const guiOptions = {
  mode: 'Object Mode',
  showNormals: false,
  addCube: () => {
    addModel(new THREE.BoxGeometry());
  },
  addSphere: () => {
    addModel(new THREE.SphereGeometry());
  },
  addPyramid: () => {
    addModel(new THREE.TetrahedronGeometry());
  },
  clear: () => {
    while (scene.children.length > 0) {
      removeModel(scene.children[0]);
    }
  }
};

gui.add(guiOptions, 'addCube').name('add cube');
gui.add(guiOptions, 'addSphere').name('add sphere');
gui.add(guiOptions, 'addPyramid').name('add pyramid');
gui.add(guiOptions, 'clear').name('clear');

gui.add(guiOptions, 'mode', ['Object Mode', 'Edit Mode']).onChange(() => {
  for (let model of scene.children) {
    updateControlsVisibility(model);
  }
});

gui.add(guiOptions, 'showNormals').name('show normals').onChange(() => {
  for (let model of scene.children) {
    updateNormalsVisibility(model);
  }
});

export function updateControlsVisibility(model) {
  model.children[1].visible = guiOptions.mode == 'Edit Mode';
  model.children[2].visible = guiOptions.mode == 'Edit Mode';
  model.children[2].userData.controls.enabled = guiOptions.mode == 'Edit Mode';
}

export function updateNormalsVisibility(model) {
  model.children[3].visible = guiOptions.showNormals;
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('contextmenu', (event) => {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(
    scene.children.map((object) => object.children[0]).concat(scene.children.map((object) => object.children[2]))
  );

  if (intersects.length > 0) {
    if (intersects[0].object instanceof THREE.Sprite) {
      return;
    }

    let positionArray = intersects[0].object.geometry.attributes.position.array;
    let { face, point } = intersects[0];

    // Remove one triangle from the geometry and add three new, so the positions array becomes 18 coordinates bigger
    // (in non-indexed BufferGeometry every triangle uses 9 coordinates)
    let newPositionArray = new Float32Array(positionArray.length + 18);

    let removedTriangleStartIndex = face.a * 3;
    let removedTriangleEndIndex = face.a * 3 + 9;

    newPositionArray.set(positionArray.subarray(0, removedTriangleStartIndex), 0);
    newPositionArray.set(positionArray.subarray(removedTriangleEndIndex), removedTriangleStartIndex);

    newPositionArray.set(positionArray.subarray(face.a * 3, face.a * 3 + 3), positionArray.length - 9);
    newPositionArray.set(positionArray.subarray(face.b * 3, face.b * 3 + 3), positionArray.length - 6);
    newPositionArray.set([point.x, point.y, point.z], positionArray.length - 3);

    newPositionArray.set(positionArray.subarray(face.b * 3, face.b * 3 + 3), positionArray.length);
    newPositionArray.set(positionArray.subarray(face.c * 3, face.c * 3 + 3), positionArray.length + 3);
    newPositionArray.set([point.x, point.y, point.z], positionArray.length + 6);

    newPositionArray.set(positionArray.subarray(face.c * 3, face.c * 3 + 3), positionArray.length + 9);
    newPositionArray.set(positionArray.subarray(face.a * 3, face.a * 3 + 3), positionArray.length + 12);
    newPositionArray.set([point.x, point.y, point.z], positionArray.length + 15);

    const geometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(newPositionArray, 3);

    geometry.setAttribute('position', positionAttribute);
    geometry.computeVertexNormals();

    if (guiOptions.mode == 'Edit Mode') {
      renderer.domElement.style.cursor = 'pointer';
    }

    removeModel(intersects[0].object.parent);
    addModel(geometry);
  }
});
