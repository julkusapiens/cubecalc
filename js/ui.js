import {myCube} from "./app.js";
import {
    CONSENSUS_TABLE_DIV,
    FORMULA_DNF,
    FORMULA_INPUT,
    FORMULA_MINIMAL, FORMULA_REPR,
    FORMULA_SUBMIT,
    ROTATION_TOGGLE
} from "./domElements.js";
import {Formula} from "./booleanLogic/formula.js";
import {FormulaParser} from "./booleanLogic/formulaParser.js";
import {Cube} from "./cube/cube.js";
import {Cube3} from "./cube/cube3.js";
import {Consensus, NOT_CANCELED} from "./cube/consensus.js";

const toggleDisable = (e) => {
    e.hasAttribute('disabled') ? e.removeAttribute('disabled') : e.setAttribute('disabled', '');
};

const formatFormula = (atoms, formula, inline = true, prefix='') => {
    const content = `f(${atoms.join(', ')})=${formula}`;
    return inline ? `\\(${prefix} ${content}\\)` : `$$${prefix} ${content}$$`;
}

const highlightCube = (cube3) => {
    myCube.hasLabel(cube3) ? myCube.removeLabel(cube3) : myCube.addLabel(cube3);
}

export const toggleAnimation = () => {
    toggleDisable(ROTATION_TOGGLE);

    const oldSymbol = ROTATION_TOGGLE.children[0].innerText;
    myCube.toggleRotation();
    ROTATION_TOGGLE.children[0].innerText = oldSymbol === 'pause'
        ? 'play_arrow' : 'pause';

    toggleDisable(ROTATION_TOGGLE);
};

export const treatFormula = (e) => {
    e.preventDefault();
    myCube.removeAllLabels();
    toggleDisable(FORMULA_INPUT); toggleDisable(FORMULA_SUBMIT);

    const userInput = FORMULA_INPUT.value;
    const treatedUserInput = userInput.trim();

    const formulaParser = new FormulaParser(treatedUserInput);
    let userFormula;
    let userFormulaDNF;
    let dnfOutput;

    try {
        userFormula = formulaParser.parse();
        userFormulaDNF = userFormula.getDNF();
        dnfOutput = userFormulaDNF.toString();
    } catch (e) {
        FORMULA_REPR.innerText = e.toString();
        toggleDisable(FORMULA_INPUT); toggleDisable(FORMULA_SUBMIT);
        return;
    }

    let literals = userFormula.collectAtoms();
    let allTrueAssignments = userFormulaDNF.getAllTrueAssignments();
    let productTermCubes = allTrueAssignments.map(a =>
        (literals.length === 3 ? Cube3 : Cube).fromAssignment(a)
    );
    let consensusTableObj = new Consensus(...productTermCubes).consensus();
    let minimalFormulaCubes = consensusTableObj
        .filter(row => row.cancelled === NOT_CANCELED)
        .map(row => row.cube);
    let minimalFormula = Formula.formulaFromCubes(literals, ...minimalFormulaCubes);

    FORMULA_REPR.innerText = formatFormula(literals, userFormula, true, 'Input:');
    FORMULA_DNF.innerText = '';
    if (userFormula.toString() !== dnfOutput) {
        FORMULA_DNF.innerText = formatFormula(literals, dnfOutput, true, 'DNF:');
    }
    buildConsensusTable(consensusTableObj);
    FORMULA_MINIMAL.innerText = formatFormula(literals, minimalFormula, false);

    MathJax.typeset();

    toggleDisable(FORMULA_INPUT); toggleDisable(FORMULA_SUBMIT);
};

const buildConsensusTable = (consensusTableObj) => {
    const consensusTableHTML = document.createElement('table');
    consensusTableHTML.id = 'consensusTable';
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
            `\\(${index + 1}\\)`,
            `\\(${tableEntry.formedBy.join(', ')}\\)`,
            `\\(${tableEntry.cube}\\)`,
            tableEntry.cancelled < 0 ? '' : `\\(\\subseteq ${tableEntry.cancelled}\\)`
        ].forEach(field => {
            let td = document.createElement('td');
            td.textContent = field;
            tr.appendChild(td);
        });
        tableBodyHTML.appendChild(tr);

        if (tableEntry.cube instanceof Cube3) {
            if (tableEntry.cancelled === NOT_CANCELED) {
                myCube.addLabel(tableEntry.cube);
            }
            tr.addEventListener('click', () => highlightCube(tableEntry.cube));
        }
    });

    CONSENSUS_TABLE_DIV.innerText = '';
    CONSENSUS_TABLE_DIV.appendChild(consensusTableHTML);
};