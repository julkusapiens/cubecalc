import {myCube} from "./app.js";
import {
    CONSENSUS_TABLE_DIV,
    FORMULA_DNF,
    FORMULA_INPUT,
    FORMULA_MINIMAL,
    FORMULA_SUBMIT,
    ROTATION_TOGGLE
} from "./domElements.js";
import {FormulaParser} from "./booleanLogic/formulaParser.js";
import {Cube3} from "./cube3.js";
import {Cube} from "./cube.js";
import {Consensus} from "./consensus.js";
import {Formula} from "./booleanLogic/formula.js";

const toggleDisable = (e) => {
    e.hasAttribute('disabled') ? e.removeAttribute('disabled') : e.setAttribute('disabled', '');
};

const highlightCube = (cube3) => {
    myCube.hasLabel(cube3) ? myCube.removeLabel(cube3) : myCube.addLabel(cube3);
}

export const toggleAnimation = () => {
    toggleDisable(ROTATION_TOGGLE);

    const oldSymbol = ROTATION_TOGGLE.innerText;
    myCube.toggleRotation();
    ROTATION_TOGGLE.innerText = oldSymbol === '⏸' ? '▶' : '⏸';

    toggleDisable(ROTATION_TOGGLE);
};

export const treatFormula = (e) => {
    e.preventDefault();
    myCube.removeAllLabels();
    toggleDisable(FORMULA_INPUT); toggleDisable(FORMULA_SUBMIT);

    const userInput = FORMULA_INPUT.value;
    const treatedUserInput = userInput.trim();
    const formulaParser = new FormulaParser(treatedUserInput);
    let userFormulaDNF;
    let dnfOutput;
    try {
        let userFormula = formulaParser.parse();
        userFormulaDNF = userFormula.getDNF();
        dnfOutput = userFormulaDNF.toString();
    } catch (e) {
        dnfOutput = e.toString();
    }
    FORMULA_DNF.innerText = `DNF: \\(f(${userFormulaDNF.collectAtoms().join(', ')})=${dnfOutput}\\)`;

    let allTrueAssignments = userFormulaDNF.getAllTrueAssignments();
    let literals = Object.keys(allTrueAssignments[0]);
    let numberOfLiterals = literals.length;
    let productTermCubes = allTrueAssignments.map(a =>
        (numberOfLiterals === 3 ? Cube3 : Cube).fromAssignment(a)
    );
    let consensusTableObj = new Consensus(...productTermCubes).consensus();
    buildConsensusTable(consensusTableObj);

    let minimalFormulaCubes = consensusTableObj
        .filter(row => row.cancelled < 0) // cancelled = -1 means not cancelled
        .map(row => row.cube);
    let minimalFormula = Formula.formulaFromCubes(literals, ...minimalFormulaCubes);

    FORMULA_MINIMAL.innerText = `$$f(${userFormulaDNF.collectAtoms().join(', ')})=${minimalFormula}$$`;

    MathJax.typeset();

    toggleDisable(FORMULA_INPUT); toggleDisable(FORMULA_SUBMIT);
};

const buildConsensusTable = (consensusTableObj) => {
    const consensusTableHTML = document.createElement('table');
    const tableHeaderHTML = document.createElement('thead');
    const tableBodyHTML = document.createElement('tbody');
    const tableHeaderRowHTML = document.createElement('tr');

    consensusTableHTML.appendChild(tableHeaderHTML);
    consensusTableHTML.appendChild(tableBodyHTML);
    tableHeaderHTML.appendChild(tableHeaderRowHTML);

    ['#', 'Formed By', 'Cube', 'Covered By'].forEach(column => {
        let th = document.createElement('th');
        th.textContent = column;
        tableHeaderRowHTML.appendChild(th);
    });

    myCube.spinAnimation();

    consensusTableObj.forEach((tableEntry, index) => {
        let tr = document.createElement('tr');
        [
            index + 1,
            tableEntry.formedBy,
            `\\(${tableEntry.cube}\\)`,
            tableEntry.cancelled < 0 ? '' : `\\(\\subseteq ${tableEntry.cancelled}\\)`
        ].forEach(field => {
            let td = document.createElement('td');
            td.textContent = field;
            tr.appendChild(td);
        });
        tableBodyHTML.appendChild(tr);

        if (tableEntry.cube instanceof Cube3) {
            if (tableEntry.cancelled < 0) {
                myCube.addLabel(tableEntry.cube);
            }
            tr.addEventListener('click', () => highlightCube(tableEntry.cube));
        }
    });

    CONSENSUS_TABLE_DIV.innerText = '';
    CONSENSUS_TABLE_DIV.appendChild(consensusTableHTML);
};