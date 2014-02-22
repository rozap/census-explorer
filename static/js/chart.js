define([
	'underscore',
	'backbone',
	'd3',
	'tip',
	'collections',

	'text!pops.json',
	'text!templates/chart-view.html',
], function(_, Backbone, d3, tip, Collections, Populations, ChartViewTemplate) {


	var Dataset = Collections.AbstractCollection.extend({
		initialize: function(opts) {
			Collections.AbstractCollection.prototype.initialize.call(this, opts);
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

		events: {
			'click .raw-data': 'raw',
			'click .normalize-pops': 'normalizePops'
		},

		_normalPops: false,

		initialize: function(opts) {
			_.extend(this, opts);
			this.ds = new Dataset(opts);
			this.listenTo(this.ds, 'sync', this.render);
			this.statePops = JSON.parse(Populations);
			this.ds.fetch();
		},

		render: function() {
			this.$el.html(this.template({
				_: _,
				ds: this.ds,
				formatJSON: this.formatJSON,
				isNormal: this._normalPops
			}));

			this.postRender();
		},

		formatJSON: function(obj) {
			json = JSON.stringify(obj, undefined, 4);
			result = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			return result.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
				var cls = 'number';
				if (/^"/.test(match)) {
					if (/:$/.test(match)) {
						cls = 'key';
					} else {
						cls = 'string';
					}
				} else if (/true|false/.test(match)) {
					cls = 'boolean';
				} else if (/null/.test(match)) {
					cls = 'null';
				}
				return '<span class="' + cls + '">' + match + '</span>';
			});
		},

		raw: function() {
			var $r = this.$el.find('#raw-data');
			if ($r.is(':visible')) {
				$r.hide();
			} else {
				$r.show();
			}
		},

		normalizePops: function() {
			this._normalPops = !this._normalPops;
			this.render();
		},

		adaptData: function(yAxis) {
			var that = this;
			var data = _.compact(this.ds.map(function(row) {
				var value = parseInt(row.get(that.varname));
				if (that._normalPops) {
					var cname = row.get('NAME').toUpperCase().replace(' ', '');
					value = value / that.statePops[cname]
				}

				//ensure we don't screw things up by return NaN
				if (_.isNaN(value)) return null;

				return {
					'state': row.get('NAME'),
					'value': value
				}
			}));


			if (this._normalPops) {
				var sum = _.reduce(data.map(function(row) {
					return row.value
				}), function(left, right) {
					return left + right;
				}, 0);

				data = data.map(function(row) {
					row.value = row.value / sum;
					return row;
				});


				var formatPercent = d3.format(".0%");
				yAxis.tickFormat(formatPercent);
			}

			return data;

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
			var data = this.adaptData(yAxis);
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