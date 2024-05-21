/**
 * This class models the consensus algorithm.
 * It represents the lines in the table as objects:
 * {
 *     formedBy : Array,
 *     cube : Cube,
 *     cancelled : number,
 * }
 *
 * inspired by https://martin-thoma.com/das-consensus-verfahren/
 */
const NOT_CANCELED = -1;

export class Consensus {
    #consensusTable = [];

    constructor(...cubes) {
        console.log(cubes);
        const uniformLength = cubes[0].getLength();

        for (let cube of cubes) {
            if (cube.getLength() !== uniformLength) {
                throw new Error('All cubes must have the same size.');
            }
            this.#consensusTable.push({
                formedBy: [],
                cube: cube,
                cancelled: NOT_CANCELED
            });
        }
    }

    consensus() {
        let globalPointer = 1;
        let nextNumber = this.#consensusTable.length + 1;

        while (globalPointer !== (this.#consensusTable.length - 1)) {
            if (this.#consensusTable[globalPointer].cancelled !== NOT_CANCELED) {
                globalPointer += 1;
                continue;
            }

            for (let localPointer = globalPointer - 1; localPointer >= 0; localPointer--) {
                let localCube = this.#consensusTable[localPointer].cube;
                let globalCube = this.#consensusTable[globalPointer].cube;

                if (this.#consensusTable[localPointer].cancelled !== NOT_CANCELED ||
                    !localCube.hasComplementaryDigitWith(globalCube) ||
                    !localCube.hasConsensusWith(globalCube)) {
                    continue;
                }
                let consensusCube = localCube.getConsensusWith(globalCube);

                // Determine if consensusCube itself is covered:
                // let cancelled = this.consensusIsIncludedIn(consensusCube);
                let cancelled = this.#consensusTable
                        .findIndex(element => element.cancelled === NOT_CANCELED && element.cube.covers(consensusCube))
                    ?? NOT_CANCELED;
                let canceledBy = cancelled === NOT_CANCELED ? nextNumber++ : NOT_CANCELED;

                // Everything covered by consensusCube is canceled:
                if (cancelled === NOT_CANCELED) {
                    for (let element of this.#consensusTable) {
                        if (element.cancelled === NOT_CANCELED && consensusCube.covers(element.cube)) {
                            element.cancelled = canceledBy;
                        }
                    }
                }

                this.#consensusTable.push({
                    formedBy: [this.#consensusTable[globalPointer].number, this.#consensusTable[localPointer].number],
                    cube: consensusCube,
                    cancelled: cancelled,
                });
            }
            globalPointer += 1;
        }
        console.log(this.#consensusTable);
    }

    // consensusIsIncludedIn(consensus) {
    //     for (let i = 0; i < this.#consensusTable.length; i++) {
    //         let element = this.#consensusTable[i];
    //         if (element.cancelled === NOT_CANCELED && element.cube.covers(consensus)) {
    //             return i;
    //         }
    //     }
    //     return NOT_CANCELED;
    // }
}

