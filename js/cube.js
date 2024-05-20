/**
 * This class represents an n-cube in cube calculus.
 */
export class Cube {
    cube = [];

    /**
     * Constructs a new cube.
     * Only 0 (negated variable) and 1 (plain variable) are valid values.
     * Up to two parameters may be null to show their absence from the product term.
     */
    constructor(...args) {
        this.cube = args.map(v => {
            switch (v) {
                case 0:
                    return 0
                case 1:
                    return 1
                default:
                    return null;
            }
        });
    }

    /**
     * Returns the resulting cube after component-wise addition with the given cube.
     * @param otherCube {Cube} cube to be added
     * @returns {Cube} resulting cube after component-wise addition
     */
    add(otherCube) {
        const addComponents = (a, b) => {
            if (a === null) return b;
            if (b === null || a === b) return a;
            return null;
        };
        return new Cube(
            this.cube.map((value, index) => addComponents(value, otherCube.cube[index]))
        );
    }

    /**
     * Returns true if the given cube is covered by this cube.
     * @param otherCube {Cube} cube to be examined
     * @returns {boolean} true if the given cube is covered by this cube
     */
    covers(otherCube) {
        return Array.from(this.getCoveredCubes().values()).some(cube => cube.equals(otherCube));
    }

    /**
     * Returns a set of all cubes of the same size covered by this cube.
     * @returns {Set<Cube>} all cubes of the same size covered by this cube
     */
    getCoveredCubes() {
        const coveredCubes = new Set();
        const addCube = (cubeArray) => {
            const cube = new Cube(...cubeArray);
            coveredCubes.add(cube);
        };

        const generateCubes = (index, currentCube) => {
            if (index === this.cube.length) {
                addCube(currentCube);
                return;
            }
            if (this.cube[index] === null) {
                generateCubes(index + 1, [...currentCube, 0]);
                generateCubes(index + 1, [...currentCube, 1]);
            } else {
                generateCubes(index + 1, [...currentCube, this.cube[index]]);
            }
        };

        generateCubes(0, []);

        return coveredCubes;
    }

    /**
     * Returns the intersection with the given cube.
     * @param otherCube {Cube} cube to be intersected with this cube
     * @returns {undefined|Cube} intersection if it exists else undefined
     */
    intersect(otherCube) {
        const intersectComponents = (a ,b) => {
            if ((a === 1 && (b === 1 || b === null))
                || (b === 1 && (a === 1 || a === null))) return 1;
            if ((a === 0 && (b === 0 || b === null))
                || (b === 0 && (a === 0 || a === null))) return 0;
            if (a === null && b === null) return null;
            return undefined;
        };

        const intersection = this.cube.map((value, index) => intersectComponents(value, otherCube.cube[index]));

        return intersection.includes(undefined) ? undefined : new Cube(...intersection);
    }

    toString() {
        return `(${this.cube.map(value => value === null ? '-' : value).join(',')})`;
    }

    equals(otherCube) {
        return this.cube.length === otherCube.cube.length
            && this.cube.every((value, index) => value === otherCube.cube[index]);
    }
}
