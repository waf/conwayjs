
// Provide drag and drop patterns for the user to play around with
function PatternManager(listElement) {
	var scope = this;
	this.currentPattern = {};
	var patterns = {
		"Glider":function(row,col) {
			return [[row,col+1],[row+1,col+2],[row+2,col],[row+2,col+1],[row+2,col+2]];
		},
		"Spaceship":function(row,col) {
			return [[row,col],[row,col+3],[row+1,col+4],[row+2,col],[row+2,col+4],[row+3,col+1],[row+3,col+2],[row+3,col+3],[row+3,col+4]];
		},
		"Firework":function(row,col) {
			return [[row,col+1],[row+1,col],[row+1,col+1],[row+1,col+2],[row+2,col],[row+2,col+2],[row+3,col+1]];
		},
		"Windmill":function(row,col) {
			return [[row,col],[row,col+1],[row,col+2],[row+1,col],[row+1,col+2],[row+2,col],[row+2,col+1],[row+2,col+2]];
		},
		"Queen Bee":function(row,col) {
			return [[row,col],[row,col+1],[row+1,col+2],[row+2,col+3],[row+3,col+3],[row+4,col+3],[row+5,col+2],[row+6,col+1],[row+6,col]];
		},
		"Pulsar":function(row,col) {
			return [[row,col+2],[row,col+3],[row,col+4],[row,col+8],[row,col+9],[row,col+10],
			[row+2,col],[row+2,col+5],[row+2,col+7],[row+2,col+12],
			[row+3,col],[row+3,col+5],[row+3,col+7],[row+3,col+12],
			[row+4,col],[row+4,col+5],[row+4,col+7],[row+4,col+12],
			[row+5,col+2],[row+5,col+3],[row+5,col+4],[row+5,col+8],[row+5,col+9],[row+5,col+10],
			[row+7,col+2],[row+7,col+3],[row+7,col+4],[row+7,col+8],[row+7,col+9],[row+7,col+10],
			[row+8,col],[row+8,col+5],[row+8,col+7],[row+8,col+12],
			[row+9,col],[row+9,col+5],[row+9,col+7],[row+9,col+12],
			[row+10,col],[row+10,col+5],[row+10,col+7],[row+10,col+12],
			[row+12,col+2],[row+12,col+3],[row+12,col+4],[row+12,col+8],[row+12,col+9],[row+12,col+10]];
		},
		"Rock":function(row,col) {
			return [[row,col],[row,col+1],[row+1,col],[row+1,col+1]];
		}
	};
	function init() {
		for(var patternName in patterns) {
			var patternItem = document.createElement("li");
			var patternPic = document.createElement("img");
			patternPic.src = "img/" + patternName + ".png";
			patternItem.onmousedown = selectPatternHandler(patterns[patternName]);
			patternItem.onclick = function() { alert("Drag and drop this pattern on to the canvas in the middle"); };
			patternItem.appendChild(patternPic);
			patternItem.innerHTML+=patternName;
			listElement.appendChild(patternItem);
		}
	}
	function selectPatternHandler(patternInstructions) {
		return function(e) {
			scope.currentPattern = patternInstructions;
			e.preventDefault();
			return false;
		};
	}
	init();
}

// initialize and display game of life.
function Simulation(canvas, patternMgr, gameSize, rule) {

	var spans = [];
	var mouseDown = false;
	var dragKills = false;
	var cellwidth = 10;
	var world;
	var intervalHandle;
	var scope = this;
	var size = gameSize;

	init();

	function init() {
		spans = [];
		canvas.innerHTML = "";
		cellwidth = (size > 50) ? 5 : 10;
		world = new GameOfLife(size,size,rule);
		display(world.getGrid());
	}

	this.resize = function(gameSize) {
		size = gameSize;
		init();
	}
	this.step = function() {
		world.step();
		display(world.getGrid());
	}
	this.loop = function() {
		intervalHandle = window.setInterval(function() { scope.step(); },100);
	}
	this.stop = function() {
		window.clearInterval(intervalHandle);
	}
	this.clear = function() {
		world.clear();
		display(world.getGrid());
	}
	// Given a 2D array of booleans, create an HTML representation of them
	// This is used to display the GoL state
	function display(grid) {
		var rows = grid.length;
		var cols = grid[0].length;

		//initialize GUI board, if it isn't already
		if(spans.length == 0) {
			for(var r = 0; r < rows; r++) {
				for(var c = 0; c < cols; c++) {
					var span = document.createElement("span");
					span.style.width = cellwidth + "px";
					span.style.height = cellwidth + "px";
					span.onmousedown=cellMouseDownHandler(span, r, c);
					span.onmouseup=cellMouseUpHandler(span, r, c);
					span.onmouseover=cellMouseOverHandler(span, r, c);
					canvas.appendChild(span);
				}
			}
			canvas.style.width = cols*cellwidth + "px";
			spans = document.getElementsByTagName("span");
		}
		//actually display the GoL state
		for(var row = 0; row < grid.length; row++) {
			for(var col = 0; col < grid[row].length; col++) {
				spans[row*rows+col].className = (grid[row][col]) ? "on" : "";
			}
		}
	}

	function cellMouseDownHandler(span,r,c) {
		return function(e) { 
			mouseDown = true;
			var span = e.currentTarget;
			span.className = ( span.className == "on" ) ? "" : "on";
			dragKills = span.className == "";
			world.toggleCell(r,c); 
			patternMgr.currentPattern = null;
			e.preventDefault();
			return false;
		};
	}
	function cellMouseUpHandler(span,r,c) {
		return function() { 
			if(patternMgr.currentPattern != null) {
				var cells = patternMgr.currentPattern(r,c);
				for(var cIndex in cells) {
					var coords = cells[cIndex];
					world.toggleCell(coords[0],coords[1]);
				}
			}
			mouseDown = false;
			display(world.getGrid());
		};
	}
	function cellMouseOverHandler(span,r,c) {
		return function(e) { 
			if(mouseDown) {
				var hoverspan = e.currentTarget;
				hoverspan.className = ( dragKills ) ? "" : "on";
				world.setCellAlive(r,c,!dragKills); 
			}
		};
	}
}
