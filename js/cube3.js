import {Cube} from "./cube.js";

/**
 * This class represents a 3-cube in cube calculus.
 */
export class Cube3 extends Cube {
    /**
     * Constructs a new 3-cube.
     * @param x {null|number} first variable of the cube
     * @param y {null|number} second variable of the cube
     * @param z {null|number} third variable of the cube
     */
    constructor(x, y, z) {
        super(x, y, z);
    }

    /**
     * Constructs a 3-cube from a given assignment.
     * @param assignment {Object} assignment to construct the cube from
     * @returns {null|Cube3} 3-cube from given assignment
     */
    static fromAssignment(assignment) {
        const assignmentValues = Object.values(assignment);
        switch (assignmentValues.length) {
            case 3:
                return new Cube3(...assignmentValues.map(v => v === true ? 1 : v === false ? 0 : null));
            case 2:
                return new Cube3(null, ...assignmentValues.map(v => v === true ? 1 : v === false ? 0 : null));
            case 1:
                return new Cube3(null, null, ...assignmentValues.map(v => v === true ? 1 : v === false ? 0 : null));
            default:
                return null;
        }
    }

    getConsensusWith(otherCube) {
        const consensusCube = super.getConsensusWith(otherCube);
        if (!consensusCube.getLength() === 3) {
            throw new Error('Consensus must match my size (3).');
        }
        return new Cube3(...consensusCube.cube);
    }

    /**
     * Returns a color of the cube based on the structure of the variable term.
     * More 1 = more red, more 0 = more blue.
     * @returns {Array} rgb color values
     */
    getColor() {
        const nullCount = this.cube.filter(v => v === null).length;
        const zeroCount = this.cube.filter(v => v === 0).length;
        const oneCount = this.cube.filter(v => v === 1).length;

        const red = Math.round(oneCount / 3 * 255);
        const blue = Math.round(zeroCount / 3 * 255);
        const white = Math.round(nullCount / 3 * 255);

        return [red + white, white, blue + white];
    }

    /**
     * Returns the position of the cube in a 3-dimensional environment.
     * @param environmentSize {number} size of the 3-dimensional environment
     * @returns {(number|number)[]} x y and z position
     */
    get3DPosition(environmentSize) {
        const size = environmentSize / 2;
        return [
            this.cube[0] === null ? 0 : (this.cube[0] === 0 ? -size : size),
            this.cube[1] === null ? 0 : (this.cube[1] === 0 ? -size : size),
            this.cube[2] === null ? 0 : (this.cube[2] === 0 ? -size : size)
        ];
    }

    /**
     * Returns a canvas of the string representation of the cube.
     * It is used in a 3-dimensional environment.
     * @param environmentSize {number} size of the 3-dimensional environment
     * @param fontStyle {string} string like '100px monospace'
     * @returns {HTMLCanvasElement} canvas of the string representation of the cube
     */
    toCanvas(environmentSize, fontStyle) {
        const textRepresentation = this.toString();

        const textCanvas = document.createElement('canvas');
        const textContext = textCanvas.getContext('2d');
        textContext.font = fontStyle;

        const textMetrics = textContext.measureText(textRepresentation);
        const textSize = textMetrics.width;

        textCanvas.width = textSize;
        textCanvas.height = textSize;

        textContext.fillStyle = `rgb(${this.getColor().join(', ')})`;
        textContext.fillRect(0, textCanvas.width / 5, textCanvas.width, textCanvas.height / 3);
        textContext.fillStyle = 'black';
        textContext.font = fontStyle;
        textContext.fillText(textRepresentation, 0 ,170);

        return textCanvas;
    }
}

/**
 * All valid 3-cubes in cube calculus.
 * The index of the outer array represents their dimension.
 * @type {Cube3[][]}
 */
export const TRIPLES = [
    [
        new Cube3(0,0,0),
        new Cube3(0,0,1),
        new Cube3(0,1,0),
        new Cube3(0,1,1),
        new Cube3(1,0,0),
        new Cube3(1,0,1),
        new Cube3(1,1,0),
        new Cube3(1,1,1)
    ],
    [
        new Cube3(null,0,0),
        new Cube3(null,0,1),
        new Cube3(null,1,0),
        new Cube3(null,1,1),
        new Cube3(0,null,0),
        new Cube3(0,null,1),
        new Cube3(1,null,0),
        new Cube3(1,null,1),
        new Cube3(0,0,null),
        new Cube3(0,1,null),
        new Cube3(1,0,null),
        new Cube3(1,1,null)
    ],
    [
        new Cube3(0,null,null),
        new Cube3(1,null,null),
        new Cube3(null,0,null),
        new Cube3(null,1,null),
        new Cube3(null,null,0),
        new Cube3(null,null,1)
    ],
    [
        new Cube3(null,null,null)
    ]
];