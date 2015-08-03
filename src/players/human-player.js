var HumanPlayer = Player.extend({
	type:'human',
	onTurn: function(game) {
		dispatcher.trigger('game:enable');

		this.listenTo(dispatcher, 'tile:click', function(col) {
			dispatcher.trigger('play', col, this.get('index'), game.get('id'));
			dispatcher.trigger('game:disable');
			this.stopListening(dispatcher, 'tile:click');
		}.bind(this));
	}
});