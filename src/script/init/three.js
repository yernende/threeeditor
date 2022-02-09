import * as THREE from 'three';

export const viewport = document.getElementById("viewport");

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, viewport.offsetWidth / viewport.offsetHeight, 0.1, 1000);

export const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(viewport.offsetWidth, viewport.offsetHeight);
viewport.appendChild(renderer.domElement);
