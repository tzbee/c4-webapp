var GameRouter = Backbone.Router.extend({
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