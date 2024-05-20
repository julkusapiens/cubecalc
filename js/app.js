import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Cube3, TRIPLES} from "./cube3.js";
import {CubeMesh} from "./cubeMesh.js";

'use strict';

const backgroundImagePath = 'img/sky.png';
const canvasSize = 600;
const cubeSize = 2.5;
const idleSpeed = 0.003;
const minDistance = 0.5;
const maxDistance = 6;
const cubeMaterialParameters = {
    color: 0xffffff,
    wireframe: false,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
};
const edgeMaterialParameters = {
    color: 0x000000
};
const labelFontStyle = '100px monospace';

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load(backgroundImagePath, (texture) => scene.background = texture);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(canvasSize, canvasSize);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;
//controls.minPolarAngle = Math.PI / 2;
//controls.maxPolarAngle = Math.PI / 2;

const cube = new CubeMesh(cubeSize, cubeMaterialParameters, edgeMaterialParameters, labelFontStyle);
cube.addToScene(scene);

camera.position.z = 5;

function render() {
  renderer.render(scene, camera);
  cube.get().rotation.y += idleSpeed;
  requestAnimationFrame(render);
}
render();

cube.addLabel(TRIPLES[0][1]);
cube.addLabel(TRIPLES[1][0]);
cube.removeLabel(TRIPLES[0][1], scene);
