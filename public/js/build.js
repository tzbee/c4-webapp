var Player = Backbone.Model.extend({
	initialize: function() {
		this.listenTo(dispatcher, 'turn:' + this.get('index'), this.onTurn);
	}
});;Array.prototype.clone = function() {
	var arr = [],
		i;
	for (i = 0; i < this.length; i++) {
		arr[i] = this[i].slice();
	}
	return arr;
};

var AICache = function() {
	this.cache = {};

	this.add = function(hash, value) {
		this.cache[hash] = value;
	};

	this.get = function(hash) {
		var value = this.cache[hash];
		return value === null || value === undefined ? null : value;
	};

	this.clear = function() {
		this.cache = {};
	};
};

var ExpertAIPlayer = Player.extend({
	type: 'ai',
	depth: 8,
	initialize: function()  {
		Player.prototype.initialize.call(this);

		this.set({
			opponentIndex: this.get('index') === 0 ? 1 : 0,
			cache: new AICache(),
			boardController: new Board()
		});
	},
	onTurn: function(game) {
		dispatcher.trigger('loading:start');
		var gameId = game.get('id');
		this.getNextMove(game.get('board'), function(nextMove) {
			dispatcher.trigger('loading:stop');
			dispatcher.trigger('play', nextMove, this, gameId);
		}.bind(this));
	},
	getNextMove: function(boardController, cb) {
		var boardCopy = boardController.get('board').clone();
		this.get('cache').clear();

		setTimeout(function() {
			this.minimax(boardCopy, true, this.depth, -9000, 9000);
			var choice = this.get('choice');
			cb(choice);
		}.bind(this), 100);
	},
	minimax: function(board, maximize, depth, alpha, beta) {
		var aiToken = this.get('index'),
			opponentIndex = this.get('opponentIndex'),
			currentToken = maximize ? aiToken : opponentIndex,
			boardController = this.get('boardController'),
			cache = this.get('cache'),
			legalMoves, legalMove, legalMovesCopy, boardCopy, choice,
			v, i, childNodeValue, hash;

		boardController.set({
			board: board
		});

		if (depth === 0 || boardController.checkWin(aiToken) || boardController.checkWin(opponentIndex) || boardController.isFullBoard()) {
			return this.evaluate(boardController, depth, currentToken);
		}

		legalMoves = boardController.getLegalMoves();

		this.sortMoves(legalMoves);

		legalMovesCopy = legalMoves.slice();

		if (maximize) {
			v = -9000;

			for (i = 0; i < legalMovesCopy.length; i++) {
				legalMove = legalMovesCopy[i];

				boardCopy = board.clone();

				boardController.set({
					board: boardCopy
				});

				boardController.play(legalMove, currentToken);

				hash = boardController.hash();
				childNodeValue = cache.get(hash);

				if (childNodeValue !== null) {
					if (childNodeValue > v) {
						v = childNodeValue;
						choice = legalMove;
					}

					alpha = Math.max(alpha, v);

					if (beta <= alpha) {
						this.set({
							choice: choice
						});

						return v;
					}

					legalMoves.splice(legalMoves.indexOf(legalMove), 1);
				}
			}

			for (i = 0; i < legalMoves.length; i++) {
				legalMove = legalMoves[i];

				boardCopy = board.clone();

				boardController.set({
					board: boardCopy
				});

				boardController.play(legalMove, currentToken);

				hash = boardController.hash();
				childNodeValue = cache.get(hash);

				if (childNodeValue === null) {
					childNodeValue = this.minimax(boardCopy, !maximize, depth - 1, alpha, beta);
					cache.add(hash, childNodeValue);
				}

				if (childNodeValue > v) {
					v = childNodeValue;
					choice = legalMove;
				}

				alpha = Math.max(alpha, v);

				if (beta <= alpha) {
					break;
				}
			}

			this.set({
				choice: choice
			});

			return v;

		} else {
			v = 9000;

			for (i = 0; i < legalMovesCopy.length; i++) {
				legalMove = legalMovesCopy[i];

				boardCopy = board.clone();

				boardController.set({
					board: boardCopy
				});

				boardController.play(legalMove, currentToken);

				hash = boardController.hash();
				childNodeValue = cache.get(hash);

				if (childNodeValue !== null) {
					if (childNodeValue < v) {
						v = childNodeValue;
						choice = legalMove;
					}

					beta = Math.min(beta, v);

					if (beta <= alpha) {
						this.set({
							choice: choice
						});

						return v;
					}

					legalMoves.splice(legalMoves.indexOf(legalMove), 1);
				}
			}

			for (i = 0; i < legalMoves.length; i++) {
				legalMove = legalMoves[i];

				boardCopy = board.clone();

				boardController.set({
					board: boardCopy
				});

				boardController.play(legalMove, currentToken);

				hash = boardController.hash();
				childNodeValue = cache.get(hash);

				if (childNodeValue === null) {
					childNodeValue = this.minimax(boardCopy, !maximize, depth - 1, alpha, beta);
					cache.add(hash, childNodeValue);
				}

				if (childNodeValue < v) {
					v = childNodeValue;
					choice = legalMove;
				}

				beta = Math.min(beta, v);

				if (beta <= alpha) {
					break;
				}
			}

			this.set({
				choice: choice
			});

			return v;
		}
	},
	sortMoves: function(moves) {
		moves.sort(function(a, b) {
			if (a === 3) return -1;
			if (b === 3) return 1;

			if (a === 4 || a === 2) return -1;
			if (b === 4 || b === 2) return 1;

			if (a === 5 || a === 1) return -1;
			if (b === 5 || b === 1) return 1;

			else return -1;
		});
	},
	evaluate: function(board, depth, currentToken) {
		var aiToken = this.get('index'),
			opponentIndex = this.get('opponentIndex'),
			aiHasWon = board.checkWin(aiToken),
			opponentHasWon = board.checkWin(opponentIndex),
			depthModifier = currentToken === aiToken ? -depth : depth,
			chainModifier = board.getNbChains(aiToken);

		if (aiHasWon) return (1000 + depthModifier * 10 + (chainModifier * 3));
		else if (opponentHasWon) return (-1000 + depthModifier * 10 + (chainModifier * 3));
		else return (chainModifier * 3) + depthModifier;
	}
});;var HumanPlayer = Player.extend({
	onTurn: function(game) {
		dispatcher.trigger('game:enable');

		this.listenTo(dispatcher, 'tile:click', function(col) {
			dispatcher.trigger('play', col, this, game.get('id'));
			dispatcher.trigger('game:disable');
			this.stopListening(dispatcher, 'tile:click');
		}.bind(this));
	}
});;var Board = Backbone.Model.extend({
	defaults: {
		nbRows: 6,
		nbCols: 7
	},
	initialize: function() {
		this.initBoard(this.get('nbRows'), this.get('nbCols'));
	},
	initBoard: function(nbRows, nbCols) {
		var board = [];

		for (var row = 0; row < nbRows; row++) {
			board.push([]);
		}

		for (row = 0; row < board.length; row++) {
			for (var col = 0; col < nbCols; col++) {
				board[row].push(-1);
			}
		}

		this.set({
			board: board
		});
	},
	clear: function() {
		var board = this.get('board');
		for (var row = 0; row < board.length; row++) {
			for (var col = 0; col < board[row].length; col++) {
				board[row][col] = -1;
			}
		}
	},
	play: function(col, value) {
		var row = this.findHighestEmptyTile(col);
		if (row === -1) throw new Error('Cannot play at this position');
		this.get('board')[row][col] = value;
		return [row, col];
	},
	findHighestEmptyTile: function(col) {
		var board = this.get('board'),
			currentRow = -1;

		for (var row = 0; row < board.length; row++) {
			if (board[row][col] === -1) {
				currentRow = row;
			} else {
				break;
			}
		}

		return currentRow;
	},
	getLegalMoves: function() {
		var legalMoves = [];

		for (var col = 0; col < this.get('nbCols'); col++) {
			if (this.findHighestEmptyTile(col) !== -1) legalMoves.push(col);
		}

		return legalMoves;
	},
	isFullBoard: function() {
		for (var col = 0; col < this.get('nbCols'); col++) {
			if (this.findHighestEmptyTile(col) !== -1) return false;
		}
		return true;
	},
	isValidMove: function(col) {
		return this.findHighestEmptyTile(col) !== -1;
	},
	checkWin: function(value) {
		var chain = 0,
			row, col, k, diagCol,

			board = this.get('board'),
			nbRows = this.get('nbRows'),
			nbCols = this.get('nbCols');

		// Check rows
		for (row = 0; row < board.length; row++) {
			for (col = 0; col < board[row].length; col++) {
				if (board[row][col] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) {
					return true;
				}
			}
			chain = 0;
		}

		// Check cols
		for (col = 0; col < board[0].length; col++) {
			for (row = 0; row < board.length; row++) {

				if (board[row][col] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) return true;

			}
			chain = 0;
		}

		// Check diag1
		for (row = 0; row < nbRows; row++) {

			k = 0;
			while (row + k < nbRows && k < nbCols) {

				if (board[row + k][k] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) return true;

				k++;
			}

			chain = 0;
		}


		// Check diag2
		for (row = 0; row < nbRows; row++) {

			k = 0;
			while (row - k >= 0 && k < nbCols) {

				if (board[row - k][k] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) return true;

				k++;
			}

			chain = 0;
		}

		// Check diag1
		for (row = 0; row < nbRows; row++) {

			k = 0;
			diagCol = nbCols - 1;

			while (row + k < nbRows && diagCol - k >= 0) {

				if (board[row + k][diagCol - k] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) return true;

				k++;
			}

			chain = 0;
		}


		// Check diag2
		for (row = 0; row < nbRows; row++) {

			k = 0;
			diagCol = nbCols - 1;

			while (row - k >= 0 && diagCol - k >= 0) {

				if (board[row - k][diagCol - k] === value) {
					chain++;
				} else {
					chain = 0;
				}

				if (chain === 4) return true;

				k++;
			}

			chain = 0;
		}

		return false;
	},
	getNbChains: function(value) {
		var chain = 0;
		var nbRows = this.get('nbRows');
		var nbCols = this.get('nbCols');
		var board = this.get('board');

		for (var row = 0; row < nbRows; row++) {
			for (var col = 0; col < nbCols; col++) {
				for (var k = 0; k < 4; k++) {

					if (row + k < nbRows) {
						if (board[row + k][col] !== -1) {
							if (board[row + k][col] === value) chain++;
							else if (board[row + k][col] !== value) chain--;
						}
					}

					if (col + k < nbCols) {
						if (board[row][col + k] !== -1) {
							if (board[row][col + k] === value) chain++;
							else if (board[row][col + k] !== value) chain--;
						}
					}

					if (col + k < nbCols && row + k < nbRows) {
						if (board[row + k][col + k] !== -1) {
							if (board[row + k][col + k] === value) chain++;
							else if (board[row + k][col + k] !== value) chain--;
						}
					}

					if (col - k >= 0 && row + k < nbRows) {
						if (board[row + k][col - k] !== -1) {
							if (board[row + k][col - k] === value) chain++;
							else if (board[row + k][col - k] !== value) chain--;
						}
					}
				}
			}
		}

		return chain;
	},
	getTile: function(row, col) {
		return this.get('board')[row][col];
	},
	hash: function() {
		var c;
		return this.get('board').reduce(function(hash, row) {
			hash += row.reduce(function(hash, n) {
				c = n === -1 ? 'x' : n;
				hash += c;
				return hash;
			}, '');
			return hash;
		}, '');
	}
});;var Game = Backbone.Model.extend({
	defaults: {
		turn: 0,
		board: new Board(),
		id: 0
	},
	initialize: function() {
		this.listenTo(dispatcher, 'game:start', this.start);
		this.listenTo(dispatcher, 'game:restart', this.restart);
		this.listenTo(dispatcher, 'view:updated', this.onPlayed);
		this.listenTo(dispatcher, 'play', this.play);
		this.listenTo(dispatcher, 'view:resized', function() {
			dispatcher.trigger('game:update', this.get('board'));
		}.bind(this));
	},
	nextPlayer: function() {
		this.set({
			turn: this.get('turn') === 0 ? 1 : 0
		});
	},
	onPlayed: function() {
		setTimeout(function()  {
			var board = this.get('board');
			var index = this.get('turn');

			if (board.checkWin(index)) {
				dispatcher.trigger('win', index);
				dispatcher.trigger('game:disable');
			} else {
				this.nextPlayer();
				dispatcher.trigger('turn:' + this.get('turn'), this);
			}
		}.bind(this), 0);
	},
	restart: function(firstPlayer) {
		this.get('board').clear();
		dispatcher.off('tile:click');

		this.set({
			id: this.get('id') + 1
		});

		dispatcher.trigger('loading:stop', firstPlayer);
		dispatcher.trigger('game:start', firstPlayer);
	},
	start: function(firstPlayer) {
		dispatcher.trigger('game:init', this.get('board'));

		this.set({
			turn: firstPlayer === 0 || firstPlayer === 1 ? firstPlayer : 0
		});

		dispatcher.trigger('turn:' + this.get('turn'), this);
	},
	play: function(col, player, gameId)  {
		setTimeout(function()  {
			var board = this.get('board');
			var index = player.get('index');

			// Check if col is playable
			if (!board.isValidMove(col)) return;

			// Check if it's current player turn
			if (index !== this.get('turn')) return;

			if (this.get('id') !== gameId) return;

			var move = board.play(col, index);

			dispatcher.trigger('played', board, move[0], col, index);
		}.bind(this), 0);
	}
});
;var tokens = ['red', 'yellow'];

var colors = {
	red: '#DD2222',
	yellow: '#DDDD22',
	maskBlue: '#222266'
};
;var BoardView = Backbone.View.extend({
	enabled: false,
	tokens: tokens,
	initialize: function() {
		this.ctx = this.el.getContext('2d');
		this.bgColor = $('body').css('backgroundColor');

		window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};

		this.listenTo(dispatcher, 'played', function(board, row, col, value) {
			this.update(board, row, col, value, function() {
				dispatcher.trigger('view:updated');
			});
		}.bind(this));

		this.listenTo(dispatcher, 'game:init', this.initBoard);

		this.listenTo(dispatcher, 'game:enable', function() {
			this.enabled = true;
		}.bind(this));

		this.listenTo(dispatcher, 'game:disable', function() {
			this.enabled = false;
		}.bind(this));

		window.onresize = function() {
			dispatcher.trigger('view:resized');
		};

		this.listenTo(dispatcher, 'game:update', function(board) {
			this.initBoard(board);
		}.bind(this));
	},
	initBoard: function(board) {
		var self = this;

		var $parent = this.$el.parent();

		this.width = $parent.width();
		this.height = this.width * 6 / 7;

		this.$el.attr('width', this.width);
		this.$el.attr('height', this.height);

		this.tileWidth = this.width / board.get('nbCols');
		this.tileHeight = this.height / board.get('nbRows');

		this.holeRadius = this.tileWidth * 0.3;
		this.pieceRadius = this.holeRadius + 1;

		// Cache some drawings

		this.redPieceCanvas = this.renderOffScreen(this.pieceRadius * 2, this.pieceRadius * 2, function(ctx) {
			self.drawPiece(ctx, self.pieceRadius, colors.red);
		});

		this.yellowPieceCanvas = this.renderOffScreen(this.pieceRadius * 2, this.pieceRadius * 2, function(ctx) {
			self.drawPiece(ctx, self.pieceRadius, colors.yellow);
		});

		this.maskCache = this.renderOffScreen(this.width, this.height, function(ctx) {
			self.renderMask(ctx, board, self.holeRadius, colors.maskBlue);
		});

		this.render(board);

		// Temporary canvas cache
		this.canvasCache = this.renderOffScreen(this.width, this.height);
	},
	renderOffScreen: function(width, height, renderer) {
		var offScreenCanvas = document.createElement('canvas');
		offScreenCanvas.width = width;
		offScreenCanvas.height = height;
		if (renderer) renderer(offScreenCanvas.getContext('2d'));
		return offScreenCanvas;
	},
	render: function(board) {
		var ctx = this.ctx;
		var pieceRadius = this.pieceRadius;
		var tileSize = this.tileWidth;
		var row, col;
		var nbRows = board.get('nbRows');
		var nbCols = board.get('nbCols');

		ctx.fillStyle = this.bgColor;
		ctx.fillRect(0, 0, this.width, this.height);

		for (row = 0; row < nbRows; row++) {
			for (col = 0; col < nbCols; col++) {
				var piece = board.getTile(row, col);
				if (piece !== -1) {
					var token = this.tokens[piece];
					var pos = (tileSize - (pieceRadius * 2)) / 2;

					ctx.drawImage(token === 'red' ? this.redPieceCanvas : token === 'yellow' ? this.yellowPieceCanvas : null, col * tileSize + pos, row * tileSize + pos);
				}
			}
		}

		ctx.drawImage(this.maskCache, 0, 0);
	},
	renderMask: function(ctx, board, holeRadius, color) {
		var nbCols = board.get('nbCols'),
			nbRows = board.get('nbRows'),
			tileSize = this.tileWidth,
			maskWidth = this.width,
			maskHeight = this.height,
			row, col,
			pos = (tileSize - (holeRadius * 2)) / 2 + holeRadius;

		ctx.save();

		ctx.fillStyle = color;
		ctx.beginPath();

		for (row = 0; row < nbRows; row++) {
			for (col = 0; col < nbCols; col++) {
				ctx.moveTo(col * tileSize + pos, row * tileSize + pos);
				ctx.arc(col * tileSize + pos, row * tileSize + pos, holeRadius, 0, 2 * Math.PI);
			}
		}

		ctx.rect(maskWidth, 0, -maskWidth, maskHeight);
		ctx.fill();

		ctx.restore();
	},
	events: {
		'click': 'onTileClick'
	},
	drawPiece: function(ctx, radius, color) {
		ctx.save();

		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
		ctx.fill();

		ctx.restore();
	},
	onTileClick: function(e) {
		if (!this.enabled) return;

		var x = this.getMousePos(this.el, e)[0];
		var col = Math.floor(x / this.tileWidth);

		dispatcher.trigger('tile:click', col);
	},
	getMousePos: function(canvas, e) {
		var rect = canvas.getBoundingClientRect();

		var x = e.clientX - rect.left;
		var y = e.clientY - rect.top;

		return [x, y];
	},
	getPieceBuffer: function(value) {
		return value === 0 ? this.redPieceCanvas : value === 1 ? this.yellowPieceCanvas : null;
	},
	startAnimation: function(ctx, board, row, col, value, done) {
		var tileSize = this.tileWidth,
			pieceRadius = this.pieceRadius,
			posOffset = (tileSize - (pieceRadius * 2)) / 2,
			x = col * tileSize + posOffset,
			destinationY = row * tileSize + posOffset,
			startingY = -2 * pieceRadius,
			image = value === 0 ? this.redPieceCanvas : this.yellowPieceCanvas,
			self = this,
			requestAnimationFrame = window.requestAnimationFrame,
			tmpCtx,
			nbRows = board.get('nbRows'),
			nbCols = board.get('nbCols'),
			lastTime,
			speed = this.width / 150,
			tokenCanvas = this.renderOffScreen(this.width, this.height, function(ctx) {
				for (var r = 0; r < nbRows; r++) {
					for (var c = 0; c < nbCols; c++) {
						if (row === r && col === c) continue;

						var piece = board.getTile(r, c);
						if (piece !== -1) {
							ctx.drawImage(self.getPieceBuffer(piece), tileSize * c + posOffset, tileSize * r + posOffset);
						}
					}
				}
			});

		lastTime = Date.now();
		(function animate(currentY, dt) {
			if (currentY > destinationY) currentY = destinationY;

			tmpCtx = self.canvasCache.getContext('2d');

			tmpCtx.fillStyle = self.bgColor;
			tmpCtx.fillRect(0, 0, self.width, self.height);
			tmpCtx.drawImage(tokenCanvas, 0, 0);
			tmpCtx.drawImage(image, x, currentY);
			tmpCtx.drawImage(self.maskCache, 0, 0);

			self.drawCanvas(self.canvasCache, self.el);

			if (currentY < destinationY) {
				requestAnimationFrame(function() {
					animate(currentY + speed * dt, Date.now() - lastTime);
					lastTime = Date.now();
				});
			} else {
				done();
			}
		})(startingY, 0);
	},
	drawCanvas: function(canvas, targetCanvas) {
		targetCanvas.getContext('2d').drawImage(canvas, 0, 0);
	},
	update: function(board, row, col, value, done) {
		this.startAnimation(this.ctx, board, row, col, value, done);
	}
});;var ChoiceView = Backbone.View.extend({
	initialize: function() {
		$('.choiceItem.humanFirst').css('color', colors.red);
		$('.choiceItem.computerFirst').css('color', colors.yellow);
	},
	events: {
		'click .humanFirst': 'humanStart',
		'click .computerFirst': 'computerStart'
	},
	humanStart: function() {
		dispatcher.trigger('game:restart', 0);
	},
	computerStart: function() {
		dispatcher.trigger('game:restart', 1);
	}
});;var ResultView = Backbone.View.extend({
	resultBoxClass: 'result',
	loadingBoxClass: 'loading',
	tokens: tokens,
	initialize: function() {
		var $resultBox = $('<span>', {
			class: this.resultBoxClass,
			css: {
				visibility: 'hidden'
			}
		});

		var $loadingBox = $('<span>', {
			class: this.loadingBoxClass,
			html: 'Loading..',
			css: {
				visibility: 'hidden'
			}
		});

		this.$el.html($resultBox.add($loadingBox));

		this.listenTo(dispatcher, 'win', this.update);
		this.listenTo(dispatcher, 'loading:start', this.startLoading);
		this.listenTo(dispatcher, 'loading:stop', this.stopLoading);
		this.listenTo(dispatcher, 'game:restart', this.onRestart);
	},
	update: function(winnerIndex) {
		var winner = this.tokens[winnerIndex];
		var $resultBox = $('.' + this.resultBoxClass);
		if (winner) {
			$resultBox.addClass(winner).html('Winner is ' + winner);
			this.show($resultBox);
		}
	},
	onRestart: function() {
		$('.' + this.resultBoxClass).empty();
	},
	startLoading: function() {
		this.show($('.' + this.loadingBoxClass));
	},
	stopLoading: function() {
		this.hide($('.' + this.loadingBoxClass));
	},
	hide: function(element) {
		element.css('visibility', 'hidden');
	},
	show: function(element) {
		element.css('visibility', 'visible');
	}
});;var dispatcher = _.clone(Backbone.Events);

// Instantiate model

var game = new Game();

// Instantiate players

var player1 = new HumanPlayer({
	index: 0
});

var player2 = new ExpertAIPlayer({
	index: 1
});

// Instantiate views

var boardView = new BoardView({
	el: $('#gameCanvas')
});

var resultView = new ResultView({
	el: $('.sideBox')
});

var choiceView = new ChoiceView({
	el: $('.choiceBox')
});;var GameRouter = Backbone.Router.extend({
	routes: {
		"": "start",
		"local/:index": "start",
		"online":"startOnline"
	}
});

var gameRouter = new GameRouter();

gameRouter.on('route:start', function(index) {
	dispatcher.trigger('game:restart', parseInt(index));
});

gameRouter.on('route:startOnline', function() {
	console.log('Hello online!!');
});

Backbone.history.start();