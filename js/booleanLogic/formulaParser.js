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

export class FormulaParser {
    constructor(input) {
        this.input = input;
        this.lookahead = this.next();
    }

    next() {
        let match = this.input.match(/^(\s*(\bnot\b|\bor\b|\band\b|\(|\)|\btrue\b|\bfalse\b|\w+)|\s*(.))/);
        if (match) {
            this.input = this.input.slice(match[0].length);
            return match[2] || match[3];
        } else {
            return null;
        }
    }

    match(expected) {
        if (this.lookahead === expected) {
            this.lookahead = this.next();
        } else {
            throw new Error(`Unexpected token: expected ${expected}, got ${this.lookahead}`);
        }
    }

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

    parse() {
        let result = this.parseExp();
        if (this.lookahead != null) {
            throw new Error(`Unexpected token at end of input: ${this.lookahead}`);
        }
        return result;
    }
}
