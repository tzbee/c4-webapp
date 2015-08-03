var ChoiceView = Backbone.View.extend({
	iconMap: {
		human: 'fa fa-user',
		ai: 'fa fa-laptop'
	},
	initialize: function() {
		$('.player-icon', this.getChoiceBox(0)).css('color', colors[tokens[0]]);
		$('.player-icon', this.getChoiceBox(1)).css('color', colors[tokens[1]]);

		this.listenTo(dispatcher, 'turn:0', function() {
			this.switchTurnTo(0);
		}.bind(this));

		this.listenTo(dispatcher, 'turn:1', function() {
			this.switchTurnTo(1);
		}.bind(this));

		this.listenTo(dispatcher, 'players:update', this.update);
		this.listenTo(dispatcher, 'players:update', this.update);
	},
	events: {
		'click .start-button.index-0': 'player0Starts',
		'click .start-button.index-1': 'player1Starts'
	},
	update: function(player1, player2) {
		this.updatePlayer(player1);
		this.updatePlayer(player2);
	},
	updatePlayer: function(player) {
		var playerType = player.type,
			playerIndex = player.get('index'),
			playerName = player.get('name') || 'NONAME',
			$choiceBox = this.getChoiceBox(playerIndex),
			$playerIcon = $('.player-icon', $choiceBox),
			$playerName = $('.player-name', $choiceBox);

		$playerIcon.addClass(this.iconMap[playerType]);
		$playerName.html(playerName);
	},
	player0Starts: function() {
		this.playerStarts(0);
	},
	player1Starts: function() {
		this.playerStarts(1);
	},
	playerStarts: function(index) {
		dispatcher.trigger('game:restart', index);
	},
	getChoiceBox: function(index) {
		return $('.choice.index-' + index);
	},
	switchTurnTo: function(index) {
		$('.choice-container.index-' + (index === 0 ? 1 : 0)).removeClass('active');
		$('.choice-container.index-' + index).addClass('active');
	}
});