var LocalPlayer = Player.extend({
	onTurn: function(game) {
		dispatcher.trigger('game:enable');

		this.listenTo(dispatcher, 'tile:click', function(col) {
			dispatcher.trigger('play', col, this.get('index'), game.get('id'));
			dispatcher.trigger('game:disable');
			this.stopListening(dispatcher, 'tile:click');
		}.bind(this));
	},
	onEndTurn: function(game, row, col) {
		console.log('Turn ' + this.get('index') + ' is done, col ' + col + ' was played');
		var socket = this.get('socket');

		socket.emit('played', {
			index: this.get('index'),
			board: game.get('board').get('board'),
			gameId: game.get('id'),
			col: col
		});
	}
});

var OnlinePlayer = Player.extend({
	onTurn: function(game) {
		var socket = this.get('socket');

		socket.on('played', function(move) {
			console.log('player ' + move.index + ' played ' + move.col);
			dispatcher.trigger('play', move.col, move.index, move.gameId);
		});
	},
	onEndTurn: function(game, row, col) {
		var socket = this.get('socket');
		socket.off('played');
	}
});