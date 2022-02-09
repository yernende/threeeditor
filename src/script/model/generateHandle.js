import * as THREE from 'three';

const canvas = document.createElement('canvas');
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.arc(32, 32, 32, 0, 2 * Math.PI, false);
ctx.fillStyle = 'white';
ctx.fill();

const texture = new THREE.Texture(canvas);
texture.needsUpdate = true;

const spriteMaterial = new THREE.SpriteMaterial({
  map: texture,
  sizeAttenuation: false
});

export function generateHandle(x, y, z) {
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.04, 0.04, 0.04);
  sprite.position.set(x, y, z);
  return sprite;
}
