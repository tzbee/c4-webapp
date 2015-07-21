var GameRouter = Backbone.Router.extend({
	routes: {
		'': 'start',
		'local/:index': 'start',
		'online': 'startOnline'
	}
});

var gameRouter = new GameRouter();

gameRouter.on('route:start', function(index) {

	// Instantiate players

	var player1 = new HumanPlayer({
		index: 0
	});

	var player2 = new ExpertAIPlayer({
		index: 1
	});

	dispatcher.trigger('players:update', player1, player2);
	dispatcher.trigger('game:restart', parseInt(index));
});

gameRouter.on('route:startOnline', function() {
	console.log('Hello online!!');

	var socket = io();

	socket.on('onlineGame:ready', function(myIndex) {
		console.log('Online game ready, my index is ' + myIndex);

		var me = new LocalPlayer({
			socket: socket,
			index: myIndex
		});

		var himOrHer = new OnlinePlayer({
			socket: socket,
			index: myIndex === 0 ? 1 : 0
		});

		dispatcher.trigger('players:update', me, himOrHer);
		dispatcher.trigger('game:restart', 0);
	});
});

Backbone.history.start();