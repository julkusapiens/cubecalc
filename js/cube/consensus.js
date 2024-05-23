export const NOT_CANCELED = -1;

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
export class Consensus {
    #consensusTable = [];

    constructor(...cubes) {
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

    /**
     * Applies the consensus algorithm on given cubes.
     * @returns {Array<Object>} consensus table of all treated cubes
     */
    consensus() {
        let globalPointer = 0;
        let nextNumber = this.#consensusTable.length + 1;

        /**
         * Processes the consensus between the global cube and a local cube.
         * @param {number} globalPointer the index of the global cube in the consensus table
         * @param {number} localPointer the index of the local cube in the consensus table
         */
        const processConsensus = (globalPointer, localPointer) => {
            let localCube = this.#consensusTable[localPointer].cube;
            let globalCube = this.#consensusTable[globalPointer].cube;

            // Check if local and global cubes have complementary digits and consensus
            if (!localCube.hasComplementaryDigitWith(globalCube) ||
                !localCube.hasConsensusWith(globalCube)) {
                return;
            }

            let consensusCube = localCube.getConsensusWith(globalCube);

            // Determine if consensusCube itself is covered by previous cubes
            let cancelled = this.#consensusTable.findIndex(
                element => element.cancelled === NOT_CANCELED && element.cube.covers(consensusCube)
            );

            cancelled = cancelled === -1 ? NOT_CANCELED : cancelled;
            let canceledBy = cancelled === NOT_CANCELED ? nextNumber++ : NOT_CANCELED;

            // Everything covered by consensusCube is cancelled
            if (cancelled === NOT_CANCELED) {
                this.#consensusTable.forEach(element => {
                    if (element.cancelled === NOT_CANCELED && consensusCube.covers(element.cube)) {
                        element.cancelled = canceledBy;
                    }
                });
            }

            this.#consensusTable.push({
                formedBy: [globalPointer + 1, localPointer + 1],
                cube: consensusCube,
                cancelled: cancelled,
            });
        };

        // Iterate through the consensus table with globalPointer
        while (globalPointer < this.#consensusTable.length - 1) {
            if (this.#consensusTable[globalPointer].cancelled === NOT_CANCELED) {
                // Iterate through previous entries with localPointer
                for (let localPointer = globalPointer - 1; localPointer >= 0; localPointer--) {
                    if (this.#consensusTable[localPointer].cancelled === NOT_CANCELED) {
                        processConsensus(globalPointer, localPointer);
                    }
                }
            }
            globalPointer++;
        }

        return this.#consensusTable;
    }
}

