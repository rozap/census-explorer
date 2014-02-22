define([
	'underscore',
	'backbone',
], function(_, Backbone) {

	var AbstractCollection = Backbone.Collection.extend({

		initialize: function(opts) {
			_.extend(this, opts);
			this.listenTo(this, 'request', this._startLoad.bind(this));
			this.listenTo(this, 'error', this._endLoad.bind(this));
			this.listenTo(this, 'sync', this._endLoad.bind(this));
		},

		_startLoad: function() {
			this.dispatcher.trigger('load', this);
		},

		_endLoad: function() {
			this.dispatcher.trigger('done', this);
		}


	});



	return {
		AbstractCollection: AbstractCollection
	}

});