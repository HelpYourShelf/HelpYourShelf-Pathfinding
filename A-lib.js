/**
* 
* @param {number} rows The number of rows you want in your matrix, it (obviously) needs to be greater than 0 
* @param {number} columns The number of columns you want in your matrix, it (obviously) needs to be greater than 0 
* @param {number} emptyRow The index of the row where a block will be empty, starts at 0   i.e : 1 would be row 2 etc
* @param {number} emptyColumn The index of the column where a block will be empty, starts at 0   i.e : 1 would be column 2 etc
* @param {boolean} log Alows you to enable logging when creating a matrix, it's useful for debugging
*/
class Matrix {
    constructor(rows = 3, columns = 3, emptyRow = 1, emptyColumn = 1, log = false) {
        this.rows = rows;
        this.columns = columns;
        this.emptyRow = emptyRow;
        this.emptyColumn = emptyColumn;
        this.matrix = Array.from({ length: this.rows }, (_val1, i1) => Array.from({ length: this.columns }, (_val2, i2) => i1 * this.columns + i2 + 1));
        this.matrix[emptyRow][emptyColumn] = 0;
        if (log) {
            console.log("Successfully created a " + this.rows + " * " + this.columns + " Matrix. The empty box is the one at " + this.emptyRow + " " + this.emptyColumn);
            console.log(this.matrix.join('\r\n'));
        }
    }

    /**
     * This methods allows you to switch the empty cell position by providing the index of the new empty row and column
     * @param {number} row Index of the new empty row
     * @param {number} col Index of the new empty column
     * @returns {Matrix} Returns the new Matrix state
     */
    setEmptyPosition(row, col) {
        [this.matrix[this.emptyRow][this.emptyColumn], this.matrix[row][col]] = [this.matrix[row][col], 0];
        this.emptyRow = row;
        this.emptyColumn = col;
        return this;
    }

    /**
     * This methods returns the possible positions that the empty cell can go to, it returns it as an object like so "name of the move" : boolean
     * @returns {Object}
     */
    get possibleMoves() {
        return {
            "right": this.matrix[this.emptyRow][this.emptyColumn + 1] ? true : false,
            "left": this.matrix[this.emptyRow][this.emptyColumn - 1] ? true : false,
            "up": this.matrix[this.emptyRow - 1] ? true : false,
            "down": this.matrix[this.emptyColumn + 1] ? true : false,
        }
    }

    /**
     * This method alows you to find the position of any box in the matrix
     * @param {number} box the id of the box you want to find
     * @returns {Array} Contains the row and column of the box you're searching for like so : [0] is the row index and [1] is the column index
     */
    getBoxPos(box) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.columns; c++) {
                if (this.matrix[r][c] == box) {
                    return [r, c];
                }
            }
        }
    }
}

/**
 * This class alows you to find a path between to position by moving the empty box as in a sliding puzzle using A* Algorithm
 * @param {Matrix} matrix The matrix where you will be pathfinding 
 * @param {number} boxID The ID of the box that you want to move
 * @param {number} destinationRow index of the destination Row
 * @param {number} destinationColumn index of the destination Column
 */
class Pathfinder {
    constructor(mat, boxID, destinationRow, destinationColumn) {
        this.matrix = mat;
        this.boxID = boxID
        this.currentRow = this.matrix.getBoxPos(boxID)[0];
        this.currentColumn = this.matrix.getBoxPos(boxID)[1];
        this.destinationRow = destinationRow;
        this.destinationColumn = destinationColumn;
        console.log("Moving the box number " + boxID + " to box number " + this.matrix.matrix[destinationRow][destinationColumn]);
        console.log("Distance between current position and the objective is about " + this.hscore(this.currentRow, this.currentColumn).toFixed(2) + " box");
        this.solve();
    }

    /**
     * @param {number} row Row from where to calculate
     * @param {number} column Column form where to calculate
     * @returns {number} Distance between the current position of the moving box and the targeted position
     */
    hscore(row, column) {
        return Math.sqrt(Math.pow(row - this.destinationRow, 2)
            + Math.pow(column - this.destinationColumn, 2))
    }

    /**
     * This method creates an object that contains everything that a move needs
     * @param {String} name Name of the move, not that useful, it just makes it more readeable by humans
     * @param {Matrix} preMat State of the matrix before the move
     * @param {Matrix} postMat State of the matrix after the move
     * @param {number} score f score of this move (distance to objective + cost )
     * @returns {Object} A movement object, required for A*  algorithm
     */
    createMove(name, preMat, postMat, score) {
        return {
            name: name,
            preMat: preMat,
            postMat: postMat,
            score: score,
        }
    }


    /**
     * This method solves the problmen that you defined by instanciating the class
     */
    solve() {
        let gscore = 0;
        let possibleMove = [];
        let tempMatrix = this.matrix.clone();
        while (this.matrix.matrix[this.destinationRow][this.destinationColumn] != this.boxID) {
            gscore++;
            possibleMove = [];
            for (let move in this.matrix.possibleMoves) {
                if (this.matrix.possibleMoves.hasOwnProperty(move) && this.matrix.possibleMoves[move] == true) {
                    switch (move) {
                        default:
                            tempMatrix = this.matrix;
                        case "right":
                            tempMatrix = tempMatrix.setEmptyPosition(this.matrix.emptyRow, this.matrix.emptyColumn + 1);
                            possibleMove.push(this.createMove(
                                "RIGHT",
                                this.matrix,
                                tempMatrix,
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        case "left":
                            tempMatrix = tempMatrix.setEmptyPosition(this.matrix.emptyRow, this.matrix.emptyColumn - 1);
                            possibleMove.push(this.createMove(
                                "LEFT",
                                this.matrix,
                                tempMatrix,
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        case "up":
                            tempMatrix = tempMatrix.setEmptyPosition(this.matrix.emptyRow - 1, this.matrix.emptyColumn);
                            possibleMove.push(this.createMove(
                                "UP",
                                this.matrix,
                                tempMatrix,
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        case "down":
                            tempMatrix = tempMatrix.setEmptyPosition(this.matrix.emptyColumn + 1, this.matrix.emptyColumn);
                            possibleMove.push(this.createMove(
                                "DOWN",
                                this.matrix,
                                tempMatrix,
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                    }
                }
            }
            possibleMove.sort((_a, _b) => parseFloat(_a.score) - parseFloat(_b.score));
            /*for(let k in possibleMove) {
                console.log(possibleMove[k].postMat);
            }*/
            console.log(" aa" + possibleMove[0].postMat.matrix.join('\r\n'));
            this.matrix = possibleMove[0].postMat;
            this.currentRow = this.matrix.getBoxPos(this.boxID)[0];
            this.currentColumn = this.matrix.getBoxPos(this.boxID)[1];
            console.log("************ BEST MOVE IS " + possibleMove[0].name + " ************");
            console.log("current matrix state : \n" + this.matrix.matrix.join('\r\n'));
            console.log("This was move number " + gscore)
            break;
            if (gscore >= 15) {
                console.log("Didn't work ");
                break;
            }
        }
    }
}

let tester = new Pathfinder(new Matrix(3, 3, 1, 0, true), 1, 2, 0);