define([
	'underscore',
	'backbone',
	'search',
	'chart'
], function(_, Backbone, Search, Chart) {

	var Router = Backbone.Router.extend({

		routes: {
			'dataset/:dataset/:varname/:id': 'chart',
			'/*': 'home'
		},

		initialize: function() {
			this.dispatcher = _.clone(Backbone.Events);
		},

		_initSearchView: function() {
			if (this._search) return;
			this._search = new Search.Search({
				dispatcher: this.dispatcher
			});
		},

		home: function() {
			this._initSearchView();
		},

		chart: function(dataset, varname, id) {
			this._initSearchView();
			if (this._chart) this._chart.stopListening();
			this._chart = new Chart.Chart({
				dataset: dataset,
				varname: varname,
				id: id
			});
		}

	});



	return {
		Router: Router
	}

});