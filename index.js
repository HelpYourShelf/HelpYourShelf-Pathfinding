/**
* 
* @param {number} rows The number of rows you want in your matrix, it (obviously) needs to be greater than 0 
* @param {number} columns The number of columns you want in your matrix, it (obviously) needs to be greater than 0 
* @param {number} emptyRow The index of the row where a block will be empty, starts at 0   i.e : 1 would be row 2 etc
* @param {number} emptyColumn The index of the column where a block will be empty, starts at 0   i.e : 1 would be column 2 etc
* @param {boolean} log Alows you to enable logging when creating a matrix, it's useful for debugging
*/
class Matrix{ 
    constructor(rows, columns, emptyRow, emptyColumn, log = false) {
        this.rows = rows;
        this.columns = columns;
        this.emptyRow = emptyRow;
        this.emptyColumn = emptyColumn;
        this.mat = Array.from({length:this.rows},(_val1,i1)=>Array.from({length:this.columns},(_val2,i2)=>i1*this.columns+i2+1));
        this.mat[emptyRow][emptyColumn] = 0;
        if (log) {
        console.log("Successfully created a " + this.rows + " * " + this.columns + " Matrix. The empty box is the one at " + this.zero);
        console.log(this.mat.join('\r\n'));
        }
    }

    /**
     * Returns the number of row in this matrix
     * @returns {number}
     */
    get rowCount() {
        return this.rows;
    }

    /**
     * Returns the number of columns in this matrix
     * @returns {number}
     */
    get columnCount() {
        return this.columns;
    }

    /**
     * This method returns the instanciated matrix so you can use the array of array somewhere else
     * @returns {Matrix} Returns the instanciated matrix so you can use the array of array somewhere else
     */
    get getmatrix() { 
        return this.mat;
    }

    /**
     *
     * @returns {Array} An array containing the row where the empty cell is at index 0 and the column at index 1
     */
    get zero() {
        return [this.emptyRow, this.emptyColumn];
    }
    
    /**
     * This methods allows you to switch the empty cell position by providing the index of the new empty row and column
     * @param {number} row Index of the new empty row
     * @param {number} col Index of the new empty column
     */
    setZero(row, col) { 
        [this.mat[this.zero[0]][this.zero[1]], this.mat[row][col]] = [this.mat[row][col], 0 ];
        this.emptyRow = row;
        this.emptyColumn = col;
    }

    /**
     * This methods returns the possible positions that the empty cell can go to, it returns it as an object like so "name of the move" : boolean
     * @returns {Object}
     */
    get moves() {
        return { "right" : this.mat[this.zero[0]][this.zero[1]+1] ? true: false,
                  "left" : this.mat[this.zero[0]][this.zero[1]-1] ? true : false,
                  "up"   : this.mat[this.zero[0]-1] ? true: false,
                  "down" : this.mat[this.zero[0]+1] ? true : false,
                }
    }

    /**
     * This method alows you to find the position of any box in the matrix
     * @param {number} box the id of the box you want to find
     * @returns {Array}
     */
    getBoxPos(box) {
        for(let r = 0; r < this.rowCount; r++) {
            for(let c = 0; c < this.columnCount; c++) {
                if(this.mat[r][c] == box) {
                    return [r,c];
                }
            }
        }
    }
}

/**
 * This class alows you to find a path between to position by moving the empty cell as in a sliding puzzle (or taquin game)
 * @param {Matrix} matrix the matrix where you will be pathfinding 
 * @param {number} x index of the column from which we are starting
 * @param {number} y index of the row from which we are starting
 * @param {number} destinationX index of the objective column
 * @param {number} destinationY index of the objective row
 */
class Pathfinder{ 
    constructor(matrix, x, y, destinationX, destinationY) {
        this.matrix = matrix;
        this.x = x;
        this.y = y;
        this.destinationX = destinationX;
        this.destinationY = destinationY;
        this.gscore = 0;
        this.boxNumber = this.matrix.getmatrix[this.y][this.x];
        this.possibleMove = [];
        this.moveHistory = [];
        console.log("Moving the box number " + this.matrix.getmatrix[this.y][this.x] + " to box number " + this.matrix.getmatrix[this.destinationY][this.destinationX]);
        console.log("Distance between current position and the objective is about " + this.hscore(this.y, this.x).toFixed(2) + " box");
        this.solve();
    }

    /**
     * @param {number} y Current row from where to calculate
     * @param {number} x Current column form where to calculate
     * @returns {number} Distance between the 2 positions in the array
     */
    hscore(y,x) { 
        return Math.sqrt(Math.pow(x - this.destinationX ,2)
                         + Math.pow(y - this.destinationY ,2))
    }

    /**
     * This method creates an object that contains everything that a move needs
     * @param {String} moveName Name of the move, not that useful, it just makes it more readeable by humans
     * @param {Matrix} preMat State of the matrix before the move
     * @param {Matrix} postMat State of the matrix after the move
     * @param {number} f f score of this move (distance to objective + cost )
     * @returns {Object} A movement object, required for A*  algorithm
     */
    createMove(moveName, preMat, postMat, f) {
        return {name : moveName,
                preMat : preMat,
                postMat : postMat,
                score : f,
            }
    }


    /**
     * This method solves the problmen that you defined by instanciating the class
     * 
     */
    solve(){
        while(this.matrix.getmatrix[this.y][this.x] != this.matrix.getmatrix[this.destinationY][this.destinationX]) {
            this.gscore++;
            for(let key in this.matrix.moves) {
                if(this.matrix.moves.hasOwnProperty(key) && this.matrix.moves[key] == true) {;
                    switch(key) {
                        case "right" :
                            this.possibleMove.push(this.createMove(
                                "right",
                                this.matrix.getmatrix,
                                new Matrix(this.matrix.rowCount, this.matrix.columnCount, this.matrix.zero[0], this.matrix.zero[1]+1),
                                this.gscore+this.hscore(this.y, this.x)
                            ));
                            break;
                        case "left" :
                            this.possibleMove.push(this.createMove(
                                "left",
                                this.matrix.getmatrix,
                                new Matrix(this.matrix.rowCount, this.matrix.columnCount, this.matrix.zero[0], this.matrix.zero[1]-1),
                                this.gscore+this.hscore(this.y, this.x)
                            ));
                            break;
                        case "up" : 
                        this.possibleMove.push(this.createMove(
                            "up",
                            this.matrix.getmatrix,
                            new Matrix(this.matrix.rowCount, this.matrix.columnCount, this.matrix.zero[0]+1, this.matrix.zero[1]),
                            this.gscore+this.hscore(this.y, this.x)
                        ));
                            break;
                        case "down":
                            this.possibleMove.push(this.createMove(
                                "down",
                                this.matrix.getmatrix,
                                new Matrix(this.matrix.rowCount, this.matrix.columnCount, this.matrix.zero[0]-1, this.matrix.zero[1]),
                                this.gscore+this.hscore(this.y, this.x)
                            ));
                            break;
                    }
                    
                }
            }
            this.possibleMove.sort((_a,_b) => parseFloat(_a.score) - parseFloat(_b.score));
            this.moveHistory.push(this.possibleMove[0]);
            this.matrix = this.possibleMove[0].postMat;
            this.y = this.matrix.getBoxPos(this.boxNumber)[0];
            this.x = this.matrix.getBoxPos(this.boxNumber)[1];
            console.log("***MOVE NUMBER " + this.gscore + " *** \n" + "Moving the empty box " + this.possibleMove[0].name + " was the best choice (score of " + this.possibleMove[0].score +" ), current matrix state : \n" + this.matrix.getmatrix.join('\r\n'));
            console.log("The box that we are moving is now at index " + this.y + " " + this.x);
            console.log("************************************************************************");
            this.possibleMove = [];
        }
    }
}

let test = new Matrix(3,3,1,1, true);
let oui = new Pathfinder(test, 0,0, 2, 0);