var LogView = Backbone.View.extend({
	initialize: function() {
		this.listenTo(dispatcher, 'turn:0:done', this.onTurnEnd);
		this.listenTo(dispatcher, 'turn:1:done', this.onTurnEnd);

		this.listenTo(dispatcher, 'win', this.onWin);

		this.listenTo(dispatcher, 'game:restart', this.onGameStart);
	},
	add: function(message, important, type) {
		important = important || false;

		$('.panel-content')
			.append(
				$('<div>', {
					class: 'log-entry' + (type ? ' log-' + type : ''),
					html: $(!important ? '<span>' : '<strong>', {
						class: 'log-entry-content',
						html: message
					})
				})
			)
			.scrollTop(300);
	},
	onTurnEnd: function(game, row, col) {
		var currentPlayer = game.get('players')[game.get('turn')];
		var playerName = currentPlayer.get('name');
		var playerType = currentPlayer.get('type');
		this.add(
			'<strong>' + playerName + '</strong>' + ' played ' + (col + 1),
			null,
			playerType
		);
	},
	onGameStart: function() {
		this.clear();
		this.add('Welcome', true);
	},
	clear: function() {
		$('.panel-content').empty();
	},
	onWin: function(index) {
		this.add('Player ' + (index + 1) + ' wins', true);
	}
});
