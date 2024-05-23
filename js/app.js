import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {CubeMesh} from "./cube/cubeMesh.js";
import {FORMULA_INPUT_FORM, ROTATION_TOGGLE} from "./domElements.js";
import {toggleAnimation, treatFormula} from "./ui.js";

'use strict';

export const idleSpeed = 0.003;
const backgroundImagePath = 'img/sky.png';
const canvasSize = 500;
const cubeSize = 2.5;
const minDistance = 0.5;
const maxDistance = 6;
const cubeMaterialParameters = {
    color: 'white',
    wireframe: false,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
};
const edgeMaterialParameters = {
    color: 0x516b85
};
const labelFontStyle = '100px monospace';
// Thanks to https://stackoverflow.com/questions/29884485/threejs-canvas-size-based-on-container
const resizeCanvas = () => {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
};

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load(backgroundImagePath, (texture) => scene.background = texture);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.querySelector('canvas'),
});
renderer.setSize(canvasSize, canvasSize);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;
/*
Control user turning capabilities:
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
 */

export const myCube = new CubeMesh(cubeSize, cubeMaterialParameters, edgeMaterialParameters, labelFontStyle);
myCube.addToScene(scene);

camera.position.z = 5;

function render() {
    resizeCanvas();
    myCube.get().rotation.y += myCube.getRotationSpeed();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.addEventListener('DOMContentLoaded', () => {
    render();
    FORMULA_INPUT_FORM.addEventListener('submit', treatFormula);
    ROTATION_TOGGLE.addEventListener('click', toggleAnimation);
});
