import {And, Atom, Not, Or} from "./formula.js";

/*
Parsing Grammar:
E -> T | E or T
T -> F | T and F
F -> F | not F | ( E )

Exp -> Term RExp
RExp -> or Exp | ε
Term -> Fac RTerm
RTerm -> and Term | ε
Fac -> not Fac | ( Exp ) | z
 */

/**
 * Class to parse logical formulae.
 */
export class FormulaParser {
    /**
     * Constructs a FormulaParser instance.
     * @param {string} input the input string to parse
     */
    constructor(input) {
        this.input = input;
        this.lookahead = this.next();
    }

    /**
     * Retrieves the next token from the input using RegExp.exec().
     * @returns {null|string} the next token, or null if end of input
     */
    next() {
        const pattern = /^\s*(\bnot\b|\bor\b|\band\b|\(|\)|\btrue\b|\bfalse\b|\w+|\S)/;
        const match = pattern.exec(this.input);

        if (match) {
            this.input = this.input.slice(match[0].length);
            return match[1];
        } else {
            return null;
        }
    }

    /**
     * Matches the expected token with the current lookahead token.
     * Advances to the next token if matched.
     * @param {string} expected he expected token
     * @throws {Error} if the expected token does not match the lookahead token
     */
    match(expected) {
        if (this.lookahead === expected) {
            this.lookahead = this.next();
        } else {
            throw new Error(`Unexpected token: expected ${expected}, got ${this.lookahead}`);
        }
    }

    /**
     * Parses an expression.
     * @returns {Formula} the parsed expression
     */
    parseExp() {
        let term = this.parseTerm();
        if (this.lookahead === 'or') {
            this.match('or');
            let exp = this.parseExp();
            return new Or(term, exp);
        } else {
            return term;
        }
    }

    /**
     * Parses a term.
     * @returns {Formula} the parsed term
     */
    parseTerm() {
        let fac = this.parseFac();
        if (this.lookahead === 'and') {
            this.match('and');
            let term = this.parseTerm();
            return new And(fac, term);
        } else {
            return fac;
        }
    }

    /**
     * Parses a factor.
     * @returns {Formula} the parsed factor
     */
    parseFac() {
        if (this.lookahead === 'not') {
            this.match('not');
            let fac = this.parseFac();
            return new Not(fac);
        } else if (this.lookahead === '(') {
            this.match('(');
            let exp = this.parseExp();
            this.match(')');
            return exp;
        } else {
            let literal = this.lookahead;
            this.match(literal);
            return new Atom(literal);
        }
    }

    /**
     * Parses the input string.
     * @returns {Formula} the parsed formula
     * @throws {Error} if there are unexpected tokens at the end of the input
     */
    parse() {
        let result = this.parseExp();
        if (this.lookahead != null) {
            throw new Error(`Unexpected token at end of input: ${this.lookahead}`);
        }
        return result;
    }
}
