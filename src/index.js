var dispatcher = _.clone(Backbone.Events);

// Instantiate model

var game = new Game();

// Instantiate views

var boardView = new BoardView({
	el: $('#gameCanvas')
});

var resultView = new ResultView({
	el: $('.sideBox')
});

var choiceView = new ChoiceView({
	el: $('.choiceBox')
});