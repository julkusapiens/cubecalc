import {FORMULA_SYMBOLS} from "./formulaSymbols.js";

/**
 * Generates all possible assignments for a given set of atoms.
 * @param atoms {Array<string>} an array of atoms
 * @returns {Array<Object>} an array of objects, where each object represents a unique assignment of truth values to the atoms
 */
const generateAssignments = (atoms) => {
    let assignments = [];
    let numAssignments = Math.pow(2, atoms.length);

    for (let i = 0; i < numAssignments; i++) {
        let assignment = {};
        for (let j = 0; j < atoms.length; j++) {
            assignment[atoms[j]] = !!(i & (1 << j));
        }
        assignments.push(assignment);
    }

    return assignments;
}

/**
 * Abstract class for formulae.
 *
 * @abstract
 */
export class Formula {

    /**
     * Returns the name of the operator or the name of the atom.
     * @returns {string} the name of the operator or the name of the atom.
     */
    getRoot(){ /* overridden in concrete implementations */ }

    /**
     * It returns left operand if any.
     * If there is no left operand it returns NullObject
     * @returns {null|Formula} the left operand if any.
     */
    getLeft(){ /* overridden in concrete implementations */ }

    /**
     * It returns left operand if any.
     * If there is no left operand it returns null.
     * If an operator is unary then it has no right operand.
     * @returns {null|Formula} the left operand if any.
     */
    getRight(){ /* overridden in concrete implementations */ }

    /**
     * Determines the truth value of a given assignment recursively.
     * @param assignment {Object} an object representing a variable assignment (keys = variable names, values = truth values)
     * @returns {boolean} the truth value of the formula
     */
    evaluate(assignment) { /* overridden in concrete implementations */ }

    /**
     * Returns true if formula is atomic.
     * @returns {boolean} true if formula is atomic
     */
    isAtomic() {
        return this.getLeft() == null
            && this.getRight() == null;
    }

    /**
     * Returns all assignments that evaluate to true.
     * @returns {Array<Object>} all assignments that evaluate to true
     */
    getAllTrueAssignments() {
        return generateAssignments(this.collectAtoms()).filter(a => this.evaluate(a));
    }

    /**
     * Returns a formula in DNF from a list of cubes.
     * @param variableNames {Array<string>} variable names for cube components
     * @param cubes {Cube} list of cubes (product terms) to construct the formula of
     * @returns {Formula} formula in DNF from a list of cubes
     */
    static formulaFromCubes(variableNames, ...cubes) {
        if (!cubes.every(c => c.getLength() === cubes[0].getLength())) {
            throw new Error('All cubes must have same number of components.');
        }
        let assignments = cubes.map(c => c.toAssignment(variableNames));
        let productTerms = assignments.map(a => Formula.productTermFromAssignment(a));
        let result = productTerms[0];
        for (let i = 1; i < productTerms.length; i++) {
            result = new Or(result, productTerms[i]);
        }
        return result;
    }

    /**
     * Generates a product term from a given assignment.
     * @param assignment {Object} an object representing a variable assignment (keys = variable names, values = boolean)
     * @returns {Formula} product term representing the given assignment
     */
    static productTermFromAssignment(assignment) {
        return Object.entries(assignment).reduce((productTerm, [variable, value]) => {
            const term = value ? new Atom(variable) : new Not(new Atom(variable));
            return productTerm ? new And(productTerm, term) : term;
        }, null);
    }

    /**
     * Collects all atoms (variables) used in the formula.
     * @returns {Array<string>} an array of all atoms used in the formula
     */
    collectAtoms() {
        if (this.isAtomic() && this.getRoot() !== '') {
            return [this.getRoot()];
        }
        return Array.from(new Set([
            ...(this.getLeft() ? this.getLeft().collectAtoms() : []),
            ...(this.getRight() ? this.getRight().collectAtoms() : [])
        ]));
    }

    /**
     * Converts the formula into its disjunctive normal form (DNF).
     * @returns {Formula} the DNF of the formula
     */
    getDNF() {
        const atoms = this.collectAtoms();
        const assignments = generateAssignments(atoms);
        let productTerms = new Map();
        for (let assignment of assignments) {
            if (this.evaluate(assignment)) {
                const term = Formula.productTermFromAssignment(assignment);
                productTerms.set(term.toString(), term);
            }
        }
        if (productTerms.size === 0) {
            return null;
        }
        let dnf = Array.from(productTerms.values());
        let result = dnf[0];
        for (let i = 1; i < dnf.length; i++) {
            result = new Or(result, dnf[i]);
        }
        return result;
    }

    toString() {
        return `${this.getLeft()} ${this.getRoot()} ${this.getRight()}`;
    }
}

/**
 * This class represents a logical literal.
 */
export class Atom extends Formula {
    #variable = "";

    constructor(variable) {
        super();
        this.#variable = variable;
    }

    getRoot() {
        return this.#variable;
    }

    getLeft() {
        return null;
    }

    getRight() {
        return null;
    }

    evaluate(assignment) {
        return assignment[this.getRoot()];
    }

    toString() {
        return this.#variable;
    }
}

class UnaryFormula extends Formula {
    #rightFormula;

    constructor(rightFormula) {
        super();
        this.#rightFormula = rightFormula;
    }

    getLeft() {
        return new Atom('');
    }

    getRight() {
        return this.#rightFormula;
    }
}

class BinaryFormula extends Formula {
    #leftFormula;
    #rightFormula;

    constructor(leftFormula, rightFormula) {
        super();
        this.#leftFormula = leftFormula;
        this.#rightFormula = rightFormula;
    }

    getLeft() {
        return this.#leftFormula;
    }

    getRight() {
        return this.#rightFormula;
    }
}

/**
 * This class represents the logical NOT.
 */
export class Not extends UnaryFormula {
    getRoot() {
        return FORMULA_SYMBOLS.not;
    }

    evaluate(assignment) {
        return !this.getRight().evaluate(assignment);
    }
}

/**
 * This class represents the logical OR.
 */
export class Or extends BinaryFormula {
    getRoot() {
        return FORMULA_SYMBOLS.or;
    }

    evaluate(assignment) {
        return this.getLeft().evaluate(assignment) || this.getRight().evaluate(assignment);
    }
}

/**
 * This class represents the logical AND.
 */
export class And extends BinaryFormula {
    getRoot() {
        return FORMULA_SYMBOLS.and;
    }

    evaluate(assignment) {
        return this.getLeft().evaluate(assignment) && this.getRight().evaluate(assignment);
    }
}
