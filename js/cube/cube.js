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
     * Constructs a cube from a given assignment.
     * ex. {'x': true, 'y': false, 'z': undefined} returns (1, 0, -)
     * @param assignment {Object} assignment to construct the cube from
     * @returns {Cube} cube from given assignment
     */
    static fromAssignment(assignment) {
        const mapValue = (v) => {
            if (v === true) return 1;
            if (v === false) return 0;
            return null;
        };
        return new Cube(...Object.values(assignment).map(mapValue));
    }

    /**
     * Constructs an assignment from this cube.
     * If a component is null, it is not represented in the assignment.
     * @param variableNames variable names for cube components
     * @returns {Object} assignment representing this cube
     */
    toAssignment(variableNames) {
        if (variableNames.length !== this.getLength()) {
            throw new Error('Not enough/ too many variable names.');
        }
        return variableNames.reduce((accAssignment, variableName, index) => {
            if (this.cube[index] === null) {
                return { ...accAssignment };
            }
            return {
                ...accAssignment,
                [variableName]: this.cube[index],
            };
        }, {});
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
     * Returns true if the two cubes differ in at least one numeric component.
     * @param otherCube cube to be compared against
     * @returns {boolean} true if the two cubes differ in at least one numeric component
     */
    hasComplementaryDigitWith(otherCube) {
        return this.cube.some((digit, i) =>
            (digit === 1 && otherCube.cube[i] === 0) ||
            (digit === 0 && otherCube.cube[i] === 1));
    }

    /**
     * Checks if this cube can form a consensus with the given cube.
     * @param {Cube} otherCube the cube to compare with
     * @returns {boolean} true if the cubes can form a consensus, false otherwise
     */
    hasConsensusWith(otherCube) {
        const differences = this.cube.reduce((count, digit, index) => {
            return count + ((digit !== otherCube.cube[index] && digit !== null && otherCube.cube[index] !== null) ? 1 : 0);
        }, 0);
        return differences <= 1;
    }

    /**
     * Generates the consensus cube from this cube and the given cube.
     * @param {Cube} otherCube the cube to generate consensus with
     * @returns {Cube} the consensus cube
     */
    getConsensusWith(otherCube) {
        const consensus = this.cube.map((digit, i) => {
            if (digit === otherCube.cube[i]) {
                return digit;
            } else if (digit !== otherCube.cube[i] && digit !== null && otherCube.cube[i] !== null) {
                return null;
            } else {
                return digit ?? otherCube.cube[i];
            }
        });
        return new Cube(...consensus);
    }

    /**
     * Returns true if the given cube is covered by this cube.
     * @param otherCube {Cube} cube to be examined
     * @returns {boolean} true if the given cube is covered by this cube
     */
    covers(otherCube) {
        for (let i = 0; i < Math.min(this.cube.length, otherCube.cube.length); i++) {
            if (this.cube[i] !== null && this.cube[i] !== otherCube.cube[i]) return false;
        }
        return true;
    }

    getLength() {
        return this.cube.length;
    }

    toString() {
        return `(${this.cube.map(value => value === null ? '-' : value).join(',')})`;
    }

    equals(otherCube) {
        return this.cube.length === otherCube.getLength()
            && this.cube.every((value, index) => value === otherCube.cube[index]);
    }
}
