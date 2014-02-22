define([], function() {


	var Loader = function(dispatcher) {
		dispatcher.on('load', function() {
			console.log('down')
			$('#indef-load').slideDown();
		});

		dispatcher.on('done', function() {
			console.log('up');
			$('#indef-load').slideUp();
		});

	}


	return {
		Loader: Loader
	}


});