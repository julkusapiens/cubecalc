/**
 * This class represents a 3-cube in cube calculus.
 */
export class Cube3 {
    /**
     * Constructs a new cube.
     * Only 0 (negated variable) and 1 (plain variable) are valid values.
     * Up to two parameters may be null to show their absence from the product term.
     * @param x first variable of the cube
     * @param y second variable of the cube
     * @param z third variable of the cube
     */
    constructor(x, y, z) {
        this.x = this.#normalize(x);
        this.y = this.#normalize(y);
        this.z = this.#normalize(z);
    }

    #normalize(v) {
        switch (v) {
            case 0:
                return 0
            case 1:
                return 1
            default:
                return null;
        }
    }

    /**
     * Returns a color of the cube based on the structure of the variable term.
     * More 1 = more red, more 0 = more blue.
     * @returns {string} rgb color string
     */
    getColor() {
        const nullCount = [this.x, this.y, this.z].filter(v => v === null).length;
        const zeroCount = [this.x, this.y, this.z].filter(v => v === 0).length;
        const oneCount = [this.x, this.y, this.z].filter(v => v === 1).length;

        const red = Math.round(oneCount / 3 * 255);
        const blue = Math.round(zeroCount / 3 * 255);
        const white = Math.round(nullCount / 3 * 255);

        return `rgb(${red + white}, ${white}, ${blue + white})`;
    }

    getContrastColor() {
        const color = this.getColor();
        const rgb = color.match(/\d+/g).map(Number);

        const brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000);

        return brightness > 0 ? 'black' : 'white';
    }

    /**
     * Returns the position of the cube in a 3-dimensional environment.
     * @param environmentSize size of the 3-dimensional environment
     * @returns {(number|number)[]} x y and z position
     */
    get3DPosition(environmentSize) {
        const size = environmentSize / 2;
        return [
            this.x === null ? 0 : (this.x === 0 ? -size : size),
            this.y === null ? 0 : (this.y === 0 ? -size : size),
            this.z === null ? 0 : (this.z === 0 ? -size : size)
        ];
    }

    /**
     * Returns a canvas of the string representation of the cube.
     * It is used in a 3-dimensional environment.
     * @param environmentSize size of the 3-dimensional environment
     * @param fontStyle string like '100px monospace'
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

        textContext.fillStyle = this.getColor();
        textContext.fillRect(0, textCanvas.width / 5, textCanvas.width, textCanvas.height / 3);
        textContext.fillStyle = this.getContrastColor();
        textContext.font = fontStyle;
        textContext.fillText(textRepresentation, 0 ,170);

        return textCanvas;
    }

    toString() {
        return `(${this.x === null ? '-' : this.x},${this.y === null ? '-' : this.y},${this.z === null ? '-' : this.z})`;
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
];