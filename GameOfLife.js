/*
 * Game of Life framework
 * Constructor accepts a RuleFunction of the following format:
 *   RuleFunction(boolean ThisCellIsAlive, boolean[] NeighborCellsAreAlive)
 */
function GameOfLife(numRows,numCols,RuleFunction) {
	//Create a 1-cell-wide buffer around the board. 
	// This buffer will only consist of dead cells, and is used for
	// cells that would otherwise lie on the border.
	var bufferWidth = 1;
	var bufferedRowCount = numRows + bufferWidth*2;
	var bufferedColCount = numCols + bufferWidth*2;
	var state; //2D array, populated by init();

	//Cell class
	function Cell(alive) {
		this.alive = alive;
	}

	function init() {
		state = Array(bufferedRowCount);
		for(var row = 0; row < bufferedRowCount; row++) {
			state[row] = new Array(bufferedColCount);
			for(var col = 0; col < bufferedColCount; col++) {
				state[row][col] = new Cell(false);
			}
		}
	}
	init();

	//clear the state state - all cells are dead
	this.clear = function() {
		for(var row = 0; row < bufferedRowCount; row++) {
			for(var col = 0; col < bufferedColCount; col++) {
				state[row][col].alive = false;
			}
		}
	}

	function isInBufferArea(row,col) {
		return row < bufferWidth || row > numRows || col < bufferWidth || col > numCols;
	}

	this.step = function() {
		var next = Array(bufferedRowCount); //'next' is the evolved state, based on the current state 
		for(var row = 0; row < bufferedRowCount; row++) {
			next[row] = new Array(bufferedColCount);
			for(var col = 0; col < bufferedColCount; col++) {
				if(isInBufferArea(row,col))
				{
					//cells in the buffer are always dead
					next[row][col] = new Cell(false);
				} else {
					//calculate this cell's status via the passed in RuleFunction
					var neighbors = [state[row-1][col-1].alive,state[row-1][col].alive,state[row-1][col+1].alive,
									state[row][col-1].alive,state[row][col+1].alive,
									state[row+1][col-1].alive,state[row+1][col].alive,state[row+1][col+1].alive];
					next[row][col] = new Cell(RuleFunction(state[row][col].alive,neighbors));
				}
			}
		}
		state = next;
	}

	this.toggleCell = function(row,col) {
		row+=bufferWidth;
		col+=bufferWidth;
		state[row][col].alive = !state[row][col].alive;
	}
	this.setCellAlive = function(row,col,alive) {
		row+=bufferWidth;
		col+=bufferWidth;
		state[row][col].alive = alive;
	}

	// return a 2D array of booleans representing the cells' statuses
	this.getGrid = function() {
		//don't return the dead buffer cells
		var grid = new Array(numRows);
		for(var row = 0; row < numRows; row++) {
			grid[row] = new Array(numCols);
			for(var col = 0; col < numCols; col++) {
				grid[row][col] = state[row+bufferWidth][col+bufferWidth].alive;
			}
		}
		return grid;
	}
	this.clear();
}
