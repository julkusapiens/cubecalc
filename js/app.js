import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Cube} from "./cube.js";
import {Cube3, TRIPLES} from "./cube3.js";
import {CubeMesh} from "./cubeMesh.js";
import {Formula, Atom, And, Or, Not} from "./booleanLogic/formula.js";
import {FormulaParser} from "./booleanLogic/formulaParser.js";
import {Consensus} from "./consensus.js";
import {PREVIEW_3D, ROTATION_TOGGLE} from "./domElements.js";
import {toggleAnimation} from "./ui.js";

'use strict';

const backgroundImagePath = 'img/sky.png';
const canvasSize = 500;
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
//PREVIEW_3D.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;
//controls.minPolarAngle = Math.PI / 2;
//controls.maxPolarAngle = Math.PI / 2;

const cube = new CubeMesh(cubeSize, cubeMaterialParameters, edgeMaterialParameters, labelFontStyle);
cube.addToScene(scene);

camera.position.z = 5;

function render() {
    resizeCanvas();
    cube.get().rotation.y += idleSpeed;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
render();

window.addEventListener('DOMContentLoaded', () => {
    ROTATION_TOGGLE.addEventListener('click', toggleAnimation);
});


// cube.addLabel(TRIPLES[0][1]);
// cube.addLabel(TRIPLES[1][0]);
// cube.removeLabel(TRIPLES[0][1], scene);
//
// let c = new Cube(1,0,null);
// let a1 = new Cube(1,null,1);
// let b1 = new Cube(null,1,1);
// let a2 = new Cube(0,null,0);
// let b2 = new Cube(null,null,0);
// let a3 = new Cube(0,null,1);
// let b3 = new Cube(null,null,0);
// console.log(c.getCoveredCubes());
// console.log(c.covers(new Cube(0,0,0)));
// console.log(c.covers(new Cube(1,0,1)));
// console.log("***********************************");
// console.log(a1.intersect(b1));
// console.log(a2.intersect(b2));
// console.log(a3.intersect(b3));
//
// console.log("***********************************");
//
// let formula = new And(new Atom('x'), new Or(new Atom('y'), new Not(new Atom('z'))));
// let assignment = { 'x': true, 'y': false, 'z': true };
// console.log(formula.toString());
// console.log(formula.evaluate(assignment));
// console.log(formula.collectAtoms());
// console.log(formula.getAllTrueAssignments());
//
// let parser = new FormulaParser("x and y or not y and z");
// let f = parser.parse();
// console.log(f);
// console.log(f.toString());
// console.log(f.getDNF());
// console.log(f.getDNF().toString());
// console.log(f.getAllTrueAssignments());
// let allTrueAssignment = f.getAllTrueAssignments();
// console.log(Object.values(allTrueAssignment));
// console.log(Cube3.fromAssignment(allTrueAssignment[0]));
// let con = new Consensus(
//     Cube3.fromAssignment(allTrueAssignment[3]),
//     Cube3.fromAssignment(allTrueAssignment[0]),
//     Cube3.fromAssignment(allTrueAssignment[2]),
//     Cube3.fromAssignment(allTrueAssignment[1])
// );
//
// // let con = new Consensus(
// //     new Cube(null,0,0,null),
// //     new Cube(null,0,1,1),
// //     new Cube(0,1,0,0)
// // );
// console.log(con.consensus());