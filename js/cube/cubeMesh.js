import * as THREE from 'three';
import {Cube3} from "./cube3.js";
import {idleSpeed} from "../app.js";

/**
 * This class wraps a three.js cube mesh and adds functionality for labels.
 */
export class CubeMesh {
    #cube;
    #cubeSize;
    #labels = {};
    #faceNumberToCube = [
        new Cube3(1,null,null),
        new Cube3(0,null,null),
        new Cube3(null,1,null),
        new Cube3(null,0,null),
        new Cube3(null,null,1),
        new Cube3(null,null,0)
    ];
    #rotationSpeed = idleSpeed;
    // default face color in HSV speichern

    #labelFontStyle;

    /**
     * Constructs a new cube mesh.
     * @param size {number} side length of the cube
     * @param cubeMaterialParams {Object} material of the non-colored cube faces
     * @param edgeMaterialParams {Object} material of the edges
     * @param labelFontStyle {string} font style of the labels
     */
    constructor(size, cubeMaterialParams, edgeMaterialParams, labelFontStyle) {
        this.#cubeSize = size;
        this.#labelFontStyle  = labelFontStyle;

        const cubeGeometry = new THREE.BoxGeometry(this.#cubeSize, this.#cubeSize, this.#cubeSize);
        const cubeMaterial = [
            new THREE.MeshBasicMaterial(cubeMaterialParams),
            new THREE.MeshBasicMaterial(cubeMaterialParams),
            new THREE.MeshBasicMaterial(cubeMaterialParams),
            new THREE.MeshBasicMaterial(cubeMaterialParams),
            new THREE.MeshBasicMaterial(cubeMaterialParams),
            new THREE.MeshBasicMaterial(cubeMaterialParams)
        ];
        cubeMaterial.forEach(material => material.side = THREE.DoubleSide);

        const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
        const edgesMaterial = new THREE.LineBasicMaterial(edgeMaterialParams);

        this.#cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const cubeEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

        this.#cube.add(cubeEdges);
    }

    /**
     * Adds the cube to a given scene.
     * @param scene scene where the cube should be added to
     */
    addToScene(scene) {
        scene.add(this.#cube);
    }

    hasLabel(cube3) {
        return this.#labels.hasOwnProperty(cube3);
    }

    /**
     *
     * @param cube3 {Cube3}
     */
    addLabel(cube3) {
        if (!this.#labels.hasOwnProperty(cube3)) {
            const textTexture = new THREE.CanvasTexture(cube3.toCanvas(cube3, this.#labelFontStyle));
            const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture });
            const sprite = new THREE.Sprite(spriteMaterial);
            this.#cube.add(sprite);
            sprite.position.set(...cube3.get3DPosition(this.#cubeSize));

            let faceIndex = this.#faceNumberToCube.findIndex(c => c.equals(cube3));
            if (faceIndex >= 0) {
                this.#cube.material[faceIndex].color.setHSL(...rgbToHsl(...cube3.getColor()));
            }

            this.#labels[cube3] = sprite.uuid;
        }
    }

    /**
     *
     * @param cube3 {Cube3}
     */
    removeLabel(cube3) {
        if (this.#labels.hasOwnProperty(cube3)) {
            const sprite = this.#cube.getObjectsByProperty('uuid', this.#labels[cube3])[0];
            sprite.material.dispose();
            sprite.geometry.dispose();
            this.#cube.remove(sprite);

            let faceIndex = this.#faceNumberToCube.findIndex(c => c.toString() === cube3.toString());
            if (faceIndex >= 0) {
                this.#cube.material[faceIndex].color.setHSL(0, 1, 1);
            }

            delete this.#labels[cube3];
        }
    }

    removeAllLabels() {
        Object.keys(this.#labels).forEach(cube3 => this.removeLabel(cube3));
    }

    toggleRotation() {
        if (this.#rotationSpeed > 0) {
            this.#rotationSpeed = 0;
        } else {
            this.#rotationSpeed = idleSpeed;
        }
    }

    spinAnimation() {
        const initialSpeed = this.#rotationSpeed;
        const maxSpeed = 3;
        const duration = 750;

        let startTime = null;

        const animate = (time) => {
            if (!startTime) startTime = time;
            const elapsed = time - startTime;

            const t = Math.min(elapsed / duration, 1);
            this.#rotationSpeed = initialSpeed + (maxSpeed - initialSpeed) * 0.1 * (1 - Math.cos(2 * Math.PI * t));

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                this.#rotationSpeed = initialSpeed;
            }
        };

        requestAnimationFrame(animate);
    }

    getRotationSpeed() {
        return this.#rotationSpeed;
    }

    get() {
        return this.#cube;
    }
}

/**
 * Thanks to: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @returns {Array<number>}           The HSL representation
 */
function rgbToHsl(r, g, b) {
    (r /= 255); (g /= 255); (b /= 255);
    const vMax = Math.max(r, g, b), vMin = Math.min(r, g, b);
    let h, s, l = (vMax + vMin) / 2;

    if (vMax === vMin) {
        return [0, 0, l]; // achromatic
    }

    const d = vMax - vMin;
    s = l > 0.5 ? d / (2 - vMax - vMin) : d / (vMax + vMin);
    if (vMax === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (vMax === g) h = (b - r) / d + 2;
    if (vMax === b) h = (r - g) / d + 4;
    h /= 6;

    return [h, s, l];
}