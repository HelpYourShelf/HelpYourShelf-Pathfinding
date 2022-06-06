import cloneDeep from 'lodash.clonedeep';
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
        //Setting each property to it's desired value
        this.rows = rows;
        this.columns = columns;
        this.emptyRow = emptyRow;
        this.emptyColumn = emptyColumn;

        //Creating a complex array containing the right number of row and column
        this.matrix = Array.from({ length: this.rows }, (_val1, i1) => Array.from({ length: this.columns }, (_val2, i2) => i1 * this.columns + i2 + 1));

        //Setting the empty box position
        this.matrix[emptyRow][emptyColumn] = 0;
        
        //Enabeling logging to the console
        if (log) { 
            console.log("Successfully created a " + this.rows + " * " + this.columns + " Matrix. The empty box is the one at " + this.emptyRow + " " + this.emptyColumn);
            console.log(this.matrix.join('\r\n'));
        }
    }

    /**
     * Permutes the emtpy box position with another box
     * @param {number} row Index of the new empty row
     * @param {number} col Index of the new empty column
     * @returns {Matrix} Returns the new Matrix state
     */
    setEmptyPosition(row, col) {

        //Parallel affectation working 2023, it's ugly, unreadable but at least it works :D
        [this.matrix[this.emptyRow][this.emptyColumn], this.matrix[row][col]] = [this.matrix[row][col], 0];
        this.emptyRow = row;
        this.emptyColumn = col;

        //Returns the object
        return this;
    }

    /**
     * Returns the possible moves of the empty box
     * @returns {Object} Format of this object : "name of the move" : boolean
     */
    get possibleMoves() {
        return {
            "right": this.matrix[this.emptyRow][this.emptyColumn + 1] ? true : false,
            "left": this.matrix[this.emptyRow][this.emptyColumn - 1] ? true : false,
            "up": this.matrix[this.emptyRow - 1] ? true : false,
            "down": this.matrix[this.emptyRow + 1] ? true : false,
        }
    }

    /**
     * Finds the postion of a box inside of the Matrix
     * @param {number} box ID of the box 
     * @returns {Array} Contains the row and column of the box you're searching for like so : [0] is the row index and [1] is the column index
     */
    getBoxPos(box) {

        //This search process is not the best, I could use some Binary search but I think that it's not necessary in this kind of library
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
 * @param {Matrix} matrix A matrix object, created using the Matrix class 
 * @param {number} boxID A number corresponding to the box that you want to move
 * @param {number} destinationRow index of the destination Row
 * @param {number} destinationColumn index of the destination Column
 */
class Pathfinder {
    constructor(mat, boxID, destinationRow, destinationColumn, log = false) {
        
        //Setting each property to it's value
        this.matrix = mat;
        this.boxID = boxID
        this.currentRow = this.matrix.getBoxPos(boxID)[0];
        this.currentColumn = this.matrix.getBoxPos(boxID)[1];
        this.destinationRow = destinationRow;
        this.destinationColumn = destinationColumn;
        this.log = log;

        //Enabeling logging to the console
        if (log) {
            console.log("Moving the box number " + boxID + " to box number " + this.matrix.matrix[destinationRow][destinationColumn]);
            console.log("Distance between current position and the objective is about " + this.hscore(this.currentRow, this.currentColumn).toFixed(2) + " box");
        }
        this.solve();
    }

    /**
     * Calculates an estimated distance between a current postion and desired position
     * @param {number} row Row from where to calculate
     * @param {number} column Column from where to calculate
     * @returns {number} Distance between the current position of the moving box and the targeted position
     */
    hscore(row, column) {
        //Pythagoras theorema goes brrr
        return Math.sqrt(Math.pow(row - this.destinationRow, 2)
            + Math.pow(column - this.destinationColumn, 2))
    }

    /**
     * Creates an object that contains somes properties that a move need
     * @param {String} name Name of the move, not that useful, it just makes it more readeable by humans
     * @param {Matrix} preMat State of the matrix before the move
     * @param {Matrix} postMat State of the matrix after the move
     * @param {number} score Estimated distance to objective (see hscore method just above) + gscore (cost to reach this move)
     * @returns {Object} A movement object, required for A*  algorithm
     */
    createMove(name,oppositeName, preMat, postMat, score) {
        return {
            name: name,
            oppositeName: oppositeName,
            preMat: preMat,
            postMat: postMat,
            score: score,
        }
    }

    /**
     * Solves the problem defined by instanciating the class
     */
    solve() {
        //Creating some variables that are needed later
        let gscore = 0;
        let possibleMove = [];
        let moveHistory = [];
        //The cloneDeep function requires the use of Lodash since I didn't know how to do without it
        let tempMatrix = cloneDeep(this.matrix); 

        //Testing if it has reached the desired position
        while (this.matrix.matrix[this.destinationRow][this.destinationColumn] != this.boxID) { 
            possibleMove = [];
            gscore++;

            //Iterating trhough available moves
            for (let move in this.matrix.possibleMoves) {
                //Testing if move is really possible
                if (this.matrix.possibleMoves.hasOwnProperty(move) && this.matrix.possibleMoves[move]) {

                    //Ok, I admit, this is ugly 
                    switch (move) {

                        case "right":
                            tempMatrix = cloneDeep(this.matrix);
                            possibleMove.push(this.createMove(
                                "RIGHT",
                                "LEFT",
                                this.matrix,
                                tempMatrix.setEmptyPosition(this.matrix.emptyRow, this.matrix.emptyColumn + 1),
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        
                        case "left":
                            tempMatrix = cloneDeep(this.matrix);
                            possibleMove.push(this.createMove(
                                "LEFT",
                                "RIGHT",
                                this.matrix,
                                tempMatrix.setEmptyPosition(this.matrix.emptyRow, this.matrix.emptyColumn - 1),
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        
                        case "up":
                            tempMatrix = cloneDeep(this.matrix);
                            possibleMove.push(this.createMove(
                                "UP",
                                "DOWN",
                                this.matrix,
                                tempMatrix.setEmptyPosition(this.matrix.emptyRow - 1, this.matrix.emptyColumn),
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                        
                        case "down":
                            tempMatrix = cloneDeep(this.matrix);
                            possibleMove.push(this.createMove(
                                "DOWN",
                                "UP",
                                this.matrix,
                                tempMatrix.setEmptyPosition(this.matrix.emptyRow + 1, this.matrix.emptyColumn),
                                gscore + this.hscore(tempMatrix.getBoxPos(this.boxID)[0], tempMatrix.getBoxPos(this.boxID)[1])
                            ));
                            break;
                    }
                }
            }

            //Sorting available moves by score (ascending). Lower is better
            possibleMove.sort((_a, _b) => parseFloat(_a.score) - parseFloat(_b.score));

            
            moveHistory.push(possibleMove[0]);

            if(gscore > 1) {
                if(moveHistory[gscore-1].oppositeName === possibleMove[0].name) {
                    moveHistory.pop();
                    moveHistory.push(possibleMove[1]);
                    this.matrix = possibleMove[1].postMat;
                }else {
                    this.matrix = possibleMove[0].postMat;
                    
                }
            } else {
                moveHistory.push(possibleMove[0]);
                this.matrix = possibleMove[0].postMat;
            }
            this.currentRow = this.matrix.getBoxPos(this.boxID)[0];
            this.currentColumn = this.matrix.getBoxPos(this.boxID)[1];

            
            if(this.log) {
                console.log("************ BEST MOVE IS " + possibleMove[0].name + " ************");
                console.log("It had a score of " + possibleMove[0].score);
                console.log("current matrix state : \n" + this.matrix.matrix.join('\r\n'));
                console.log("This was move number " + gscore );
            }

            //Preventing bugs where it would run forever
            if (gscore >= 15) {
                console.log("Didn't work ");
                return;
            }
        }
        console.log("SUCCESS ! ");
        return moveHistory;
    }
}