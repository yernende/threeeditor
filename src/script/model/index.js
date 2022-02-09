import * as THREE from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

import { renderer, scene, camera, viewport } from '../init/three.js';
import { gui, updateControlsVisibility, updateNormalsVisibility } from '../init/ui.js';
import { DragControls } from '../controls/DragControls.js';
import { findUniqueVertices } from "./findUniqueVertices.js";
import { generateHandle } from "./generateHandle.js";

const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
const meshMaterial = new THREE.MeshMatcapMaterial({ color: 0x3CBEFF, side: THREE.DoubleSide });

export function addModel(geometry) {
  if (geometry.index !== null) {
    geometry = geometry.toNonIndexed();
  }

  const model = new THREE.Group();
  const handles = new THREE.Group();

  model.add(new THREE.Mesh(geometry, meshMaterial));
  model.add(new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMaterial));
  model.add(handles);

  const uniqueVertices = findUniqueVertices(model.children[0], model.children[1]);

  for (let vertex of uniqueVertices) {
    const handle = generateHandle(...vertex.coords);
    handle.userData.vertex = vertex;

    handles.add(handle);
  }

  handles.userData.controls = new DragControls(handles.children, camera, renderer.domElement, [model.children[0]]);

  handles.userData.controls.addEventListener('drag', (event) => {
    for (let index of event.object.userData.vertex.meshIndices) {
      model.children[0].geometry.attributes.position.array[index] = event.object.position.x;
      model.children[0].geometry.attributes.position.array[index + 1] = event.object.position.y;
      model.children[0].geometry.attributes.position.array[index + 2] = event.object.position.z;
    }

    for (let index of event.object.userData.vertex.wireframeIndices) {
      model.children[1].geometry.attributes.position.array[index] = event.object.position.x;
      model.children[1].geometry.attributes.position.array[index + 1] = event.object.position.y;
      model.children[1].geometry.attributes.position.array[index + 2] = event.object.position.z;
    }

    model.children[0].geometry.attributes.position.needsUpdate = true;
    model.children[0].geometry.computeVertexNormals();
    model.children[1].geometry.attributes.position.needsUpdate = true;
    model.children[1].geometry.computeVertexNormals();
    model.children[3].update();
  });

  const helper = new VertexNormalsHelper( model.children[0], 2, 0x00ff00, 1 );
  model.add(helper);

  updateControlsVisibility(model);
  updateNormalsVisibility(model);

  scene.add(model);
}

export function removeModel(entity) {
  entity.children[0].geometry.dispose();
  entity.children[1].geometry.dispose();
  entity.children[3].geometry.dispose();
  entity.children[3].material.dispose();

  for (let handle of entity.children[2].children) {
    handle.geometry.dispose();
  }

  scene.remove(entity);
}
