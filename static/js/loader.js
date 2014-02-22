define([], function() {


	var Loader = function(dispatcher) {
		dispatcher.on('load', function() {
			$('#indef-load').slideDown();
		});

		dispatcher.on('done', function() {
			$('#indef-load').slideUp();
		});

	}


	return {
		Loader: Loader
	}


});