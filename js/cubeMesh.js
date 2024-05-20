import * as THREE from 'three';

/**
 * This class wraps a three.js cube mesh and adds functionality for labels.
 */
export class CubeMesh {
    #cube;
    #cubeSize;
    #labels = {};

    #labelFontStyle;

    constructor(size, cubeMaterialParams, edgeMaterialParams, labelFontStyle) {
        this.#cubeSize = size;
        this.#labelFontStyle  = labelFontStyle;

        const cubeGeometry = new THREE.BoxGeometry(this.#cubeSize, this.#cubeSize, this.#cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial(cubeMaterialParams);

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

    addLabel(cubeTriple) {
        if (!this.#labels.hasOwnProperty(cubeTriple)) {
            const textTexture = new THREE.CanvasTexture(cubeTriple.toCanvas(cubeTriple, this.#labelFontStyle));
            const spriteMaterial = new THREE.SpriteMaterial({ map: textTexture });
            const sprite = new THREE.Sprite(spriteMaterial);
            this.#cube.add(sprite);
            sprite.position.set(...cubeTriple.get3DPosition(this.#cubeSize));

            this.#labels[cubeTriple] = sprite.uuid;
        }
    }

    removeLabel(cubeTriple, scene) {
        if (this.#labels.hasOwnProperty(cubeTriple)) {
            const sprite = this.#cube.getObjectsByProperty('uuid', this.#labels[cubeTriple])[0];
            sprite.material.dispose();
            sprite.geometry.dispose();
            this.#cube.remove(sprite);
        }
    }

    get() {
        return this.#cube;
    }
}