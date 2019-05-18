var io;
var activeUsers = [];

module.exports = function(http) {
	io = require('socket.io')(http);

	io.on('connection', function(socket) {
		if (!maxUsersReached()) addUser(socket);
		if (maxUsersReached()) sendGameReady();

		socket.on('disconnect', function() {
			removeUser(socket);
		});

		socket.on('played', function(move) {
			console.log('Player ' + move.index + ' played ' + move.col);

			var opponentSocket = getOpponentOf(move.index);

			opponentSocket.emit('played', move);
		});
	});
};

function getOpponentOf(index) {
	return activeUsers[index === 0 ? 1 : 0];
}

function addUser(socket) {
	activeUsers.push(socket);
	socket.emit('inPlay', activeUsers.indexOf(socket));
}

function removeUser(socket) {
	activeUsers.splice(activeUsers.indexOf(socket), 1);
	updateUserIndexes();
}

function updateUserIndexes() {
	activeUsers.forEach(function(socket) {
		socket.emit('indexUpdated', activeUsers.indexOf(socket));
	});
}

function sendGameReady() {
	activeUsers.forEach(function(socket) {
		socket.emit('onlineGame:ready', getUserIndex(socket));
	});
}

function getUserIndex(socket) {
	return activeUsers.indexOf(socket);
}

function maxUsersReached() {
	return activeUsers.length >= 2;
}
