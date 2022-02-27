class Matrix{
    constructor(rows, columns, emptyRow, emptyColumn) {
        this.rows = rows;
        this.columns = columns;
        this.emptyRow = emptyRow;
        this.emptyColumn = emptyColumn;
        this.mat = Array.from({length:this.rows},(_val1,i1)=>Array.from({length:this.columns},(_val2,i2)=>i1*this.columns+i2+1));
        this.mat[emptyRow][emptyColumn] = 0;
    }

    get getMatrix() {
        return this.mat;
    }

    get getZero() {
        return [this.emptyRow, this.emptyColumn];
    }

    setZero(row, col) {
        [this.mat[this.getZero[0]][this.getZero[1]], this.mat[row][col]] = [this.mat[row][col], 0 ];
        this.emptyRow = row;
        this.emptyColumn = col;
    }

    getMoves() {
        
    }
}

let test = new Matrix(3,3,1,1);
console.log(test.getMatrix)
test.setZero(2,1);
console.log(test.getMatrix);