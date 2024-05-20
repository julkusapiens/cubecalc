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
    getRoot(){}

    /**
     * It returns left operand if any.
     * If there is no left operand it returns NullObject
     * @returns {null|Formula} the left operand if any.
     */
    getLeft(){}

    /**
     * It returns left operand if any.
     * If there is no left operand it returns NullObject.
     * If an operator is unary then it has no right operand.
     * @returns {null|Formula} the left operand if any.
     */
    getRight(){}

    /**
     * Generates a product term from a given assignment.
     * @param assignment {Object} an object representing a variable assignment (keys = variable names, values = boolean)
     * @returns {Formula} product term representing the given assignment
     */
    productTermFromAssignment(assignment) {
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
        return [
            ...(this.getLeft() ? this.getLeft().collectAtoms() : []),
            ...(this.getRight() ? this.getRight().collectAtoms() : [])
        ];
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
                const term = this.productTermFromAssignment(assignment);
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


    /**
     * @returns {Array<Formula>}
     */
    getDNFProductTerms() {
        const productTerms = [];

        generateAssignments(this.collectAtoms()).reduce((dnf, assignment) => {
            if (this.evaluate(assignment)) {
                const term = this.productTermFromAssignment(assignment);
                productTerms.push(term);
                return dnf ? new Or(dnf, term) : term;
            }
        }, null);

        return productTerms;
    }

    /**
     * Returns true if formula is atomic.
     * @returns {boolean} true if formula is atomic
     */
    isAtomic() {
        return this.getLeft() == null
            && this.getRight() == null;
    }

    /**
     * Determines the truth value of a given assignment recursively.
     * @param assignment {Object} an object representing a variable assignment (keys = variable names, values = truth values)
     */
    evaluate(assignment) {}

    toString() {
        return `${this.getLeft()} ${this.getRoot()} ${this.getRight()}`;
    }
}

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

export class Not extends Formula {
    #rightFormula;

    constructor(rightFormula) {
        super();
        this.#rightFormula = rightFormula;
    }

    getRoot() {
        return FORMULA_SYMBOLS.not;
    }

    getLeft() {
        return new Atom('');
    }

    getRight() {
        return this.#rightFormula;
    }

    evaluate(assignment) {
        return !this.getRight().evaluate(assignment);
    }
}

export class Or extends Formula {
    #leftFormula;
    #rightFormula;

    constructor(leftFormula, rightFormula) {
        super();
        this.#leftFormula = leftFormula;
        this.#rightFormula = rightFormula;
    }

    getRoot() {
        return FORMULA_SYMBOLS.or;
    }

    getLeft() {
        return this.#leftFormula;
    }

    getRight() {
        return this.#rightFormula;
    }

    evaluate(assignment) {
        return this.getLeft().evaluate(assignment) || this.getRight().evaluate(assignment);
    }
}

export class And extends Formula {
    #leftFormula;
    #rightFormula;

    constructor(leftFormula, rightFormula) {
        super();
        this.#leftFormula = leftFormula;
        this.#rightFormula = rightFormula;
    }

    getRoot() {
        return FORMULA_SYMBOLS.and;
    }

    getLeft() {
        return this.#leftFormula;
    }

    getRight() {
        return this.#rightFormula;
    }

    evaluate(assignment) {
        return this.getLeft().evaluate(assignment) && this.getRight().evaluate(assignment);
    }
}
