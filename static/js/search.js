define([
	'underscore',
	'backbone',


	'text!templates/search-view.html',
], function(_, Backbone, SearchViewTemplate) {


	var Results = Backbone.Collection.extend({
		url: function() {
			return '/api/1/search' + this._params();
		},

		setTerm: function(term) {
			this._term = term;
			return this;
		},

		_params: function() {
			return '?q=' + this._term;
		},

		parse: function(resp) {
			return resp.search;
		},
	})


	var Search = Backbone.View.extend({

		el: '#results',
		template: _.template(SearchViewTemplate),
		selected: -1,



		initialize: function() {
			console.log("init");

			this.results = new Results();
			this.listenTo(this.results, 'sync', this.render, this);

			$('.ds-search').on('keyup', this.onKey.bind(this));
			$('.ds-search').on('keyup', _.debounce(this.search.bind(this), 300));
		},


		render: function() {
			this.$el.html(this.template({
				_: _,
				results: this.results
			}));
		},



		onDown: function(e) {
			this.selected++;
			this._setSelection();
		},

		onUp: function(e) {
			this.selected--;
			this._setSelection();
		},

		onSelect: function(e) {
			this.$el.find('li.result-item.active a.result-link')[0].click();
		},

		_setSelection: function() {
			if (this.selected < 0) this.selected = this.results.length - 1;
			this.selected = this.selected % this.results.length;
			this.$el.find('li.result-item.active').removeClass('active');
			$(this.$el.find('li.result-item')[this.selected]).addClass('active');
		},

		onKey: function(e) {
			console.log(e.keyCode);
			e.keyCode === 40 && this.onDown(e);
			e.keyCode === 38 && this.onUp(e);
			e.keyCode === 13 && this.onSelect(e);
		},

		search: function(e) {
			var term = $(e.currentTarget).val();
			if (term.length > 1 && this._term !== term) {
				//do the search
				this.results.setTerm(term).fetch();
				this._term = term;
			}
		},



	});



	return {
		Search: Search
	}

});