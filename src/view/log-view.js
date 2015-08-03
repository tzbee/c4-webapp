var LogView = Backbone.View.extend({
	initialize: function() {
		this.listenTo(dispatcher, 'turn:0:done', this.onTurnEnd);
		this.listenTo(dispatcher, 'turn:1:done', this.onTurnEnd);

		this.listenTo(dispatcher, 'win', this.onWin);

		this.listenTo(dispatcher, 'game:restart', this.onGameStart);
	},
	add: function(message, important) {
		important = important || false;

		$('.panel-content').append($('<div>', {
			class: 'log-entry',
			html: $(!important ? '<span>' : '<strong>', {
				class: 'log-entry-content',
				html: message
			})
		})).scrollTop(300);
	},
	onTurnEnd: function(game, row, col) {
		this.add('Played ' + (col + 1));
	},
	onGameStart: function() {
		this.clear();
		this.add('Welcome', true);
	},
	clear: function() {
		$('.panel-content').empty();
	},
	onWin: function(index) {
		this.add('Player ' + index + ' wins', true);
	}
});