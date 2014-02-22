define([
	'underscore',
	'backbone',
	'search',
	'chart',
	'loader'
], function(_, Backbone, Search, Chart, Loader) {

	var Router = Backbone.Router.extend({

		routes: {
			'dataset/:dataset/:varname/:id': 'chart',
			'/*': 'home'
		},

		initialize: function() {
			this.dispatcher = _.clone(Backbone.Events);
			new Loader.Loader(this.dispatcher);
		},

		_initSearchView: function() {
			if (this._search) {
				this._search.render();
			};
			this._search = new Search.Search({
				dispatcher: this.dispatcher
			});
		},

		home: function() {
			this._initSearchView();
		},

		chart: function(dataset, varname, id) {
			this._initSearchView();
			if (this._chart) {
				this._chart.destroy();
			}
			this._chart = new Chart.Chart({
				dataset: dataset,
				varname: varname,
				id: id,
				dispatcher: this.dispatcher
			});
		}

	});



	return {
		Router: Router
	}

});