define([
	'underscore',
	'backbone',
	'd3',
	'tip',

	'text!templates/chart-view.html',
], function(_, Backbone, d3, tip, ChartViewTemplate) {


	var Dataset = Backbone.Collection.extend({
		initialize: function(opts) {
			_.extend(this, opts);
			if (!this.varname) throw new Error('No varname');
			if (!this.dataset) throw new Error('No Dataset');
			if (!this.id) throw new Error('No id');

		},

		url: function() {
			return '/api/1/' + this.dataset + '/' + this.varname + '/' + this.id;
		},

		parse: function(resp) {
			this.meta = resp[this.dataset].meta;
			return resp[this.dataset].data;
		},
	})


	var Chart = Backbone.View.extend({

		el: '#results',
		template: _.template(ChartViewTemplate),

		initialize: function(opts) {
			_.extend(this, opts);


			this.ds = new Dataset(opts);
			this.listenTo(this.ds, 'sync', this.render);
			this.ds.fetch();
		},

		render: function() {
			this.$el.html(this.template({
				_: _,
				ds: this.ds
			}));

			this.postRender();
		},

		postRender: function() {
			var that = this;

			var margin = {
				top: 20,
				right: 20,
				bottom: 30,
				left: 80
			},
				width = this.$el.width() - margin.left - margin.right,
				height = this.$el.width() / 1.5 - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1);

			var y = d3.scale.linear()
				.range([height, 0]);

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					return "<strong>" + d.state + ":</strong> <span>" + d.value + "</span>";
				})

			var svg = d3.select("#chart-el").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			svg.call(tip);



			var data = this.ds.map(function(row) {
				return {
					'state': row.get('NAME'),
					'value': parseInt(row.get(that.varname))
				}
			})
			data.sort(function(a, b) {
				return a.value > b.value ? -1 : 1;
			})


			x.domain(data.map(function(d) {
				return d.state;
			}));
			y.domain([0, d3.max(data, function(d) {
				return d.value;
			})]);


			svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("value");

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) {
					return x(d.state);
				})
				.attr("width", x.rangeBand())
				.attr("y", function(d) {
					return y(d.value);
				})
				.attr("height", function(d) {
					return height - y(d.value);
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide)

		}



	});



	return {
		Chart: Chart
	}

});