Polymer({
  is: 'bar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'x',
        txt: 'Pick a dimension',
        selectedValue: 0,
        selectedName: 'label',
        uitype: 'single-value'
      }, {
        input: 'y',
        txt: 'Pick measures',
        selectedValue: [1, 2],
        selectedName: [],
        uitype: 'multi-value'
      }, {
        input: 'chartType',
        txt: 'Grouped or stacked',
        uitype: 'dropDown',
        selectedValue: 0,
        selectedName: 'Grouped',
        observer: '_chartTypehanged',
        options: [{
          key: 'Grouped',
          value: 0
        }, {
          key: 'Stacked',
          value: 1
        }]
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

  _addToolTip: function() {
    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>" + "</span>";
      });
    this.svg.call(this.tip);
    this.svg.selectAll('.layer')
      .selectAll('rect')
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);
  },

  /*draw: function() {
      var me = this;
      var n = this.getInputsProperty('y').length; // number of layers
      var m = this.source.length; // number of samples per layer
      var stack = d3.layout.stack();
      var layers = stack(me.source);
      var yGroupMax = d3.max(layers, function(array) {
        return d3.max(array.filter(function(value) {
          return typeof value === "number";
        }));
      });
      var yStackMax = d3.max(layers, function(layer) {
          var sum = 0;
          var elems = me.getInputsProperty('y');
          elems.forEach(function(array) {
              sum += layer[array];
          });
          layer.push(sum);
          return sum;

      });

      var margin = this.getMargins();
      var width = this.getWidth() - margin.left - margin.right;
      var height = this.getHeight() - margin.top - margin.bottom;

      var x = d3.scale.ordinal()
          .domain(d3.range(m))
          .rangeRoundBands([0, width], .08);

      var y = d3.scale.linear()
          .domain([0, yStackMax])
          .range([height, 0]);

      var color = d3.scale.linear()
          .domain([0, n - 1])
          .range([this.getSettingsPropertyObj('colorRange').to, this.getSettingsPropertyObj('colorRange').from]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .tickSize(0)
          .tickPadding(6)
          .orient("bottom");

      this.makeChartWrap();

      this.svg.attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var layer = this.svg.selectAll(".layer")
          .data(layers)
          .enter().append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) {
              return color(i);
          });

      var rect = layer.selectAll("rect")
          .data(function(d) {
              console.log(me, 'barchart');
              return d;
          })
          .enter().append("rect")
          .attr("x", function(d) {
              return x(d[me.getInputsProperty('x')]);
          })
          .attr("y", height)
          .attr("width", x.rangeBand())
          .attr("height", 0);

      rect.transition()
          .delay(function(d, i) {
              return i * 10;
          })
          .attr("y", function(d) {
              var elems = me.getInputsProperty('y');
              var sum = 0;
              elems.forEach(function(e) {
                  sum += d[e];
              });
              return y(sum);
          })
          .attr("height", function(d) {
              if(y(d[me.getInputsProperty('y')[0]]) - y(d[d.length - 1]) < 0 ){
                  throw new Error("height for chart can't be negative", 'bar-chart.rect.transition(');
              }
              return y(d[me.getInputsProperty('y')[0]]) - y(d[d.length - 1]);
          });
      this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      function transitionGrouped() {
          y.domain([0, yGroupMax]);

          rect.transition()
              .duration(500)
              .delay(function(d, i) {
                  return i * 10;
              })
              .attr("x", function(d, i, j) {
                  return x(d[me.getInputsProperty('x')]) + x.rangeBand() / n * j;
              })
              .attr("width", x.rangeBand() / n)
              .transition()
              .attr("y", function(d) {
                  return y(d[me.getInputsProperty('y')[0]]);
              })
              .attr("height", function(d) {
                  if(y(d[me.getInputsProperty('y')[0]]) - y(d[d.length - 1]) < 0){
                      throw new Error("height for chart can't be negative", 'bar-chart.transitionGrouped');
                  }
                  return height - y(d[me.getInputsProperty('y')[0]]);
              });
      };

      function transitionStacked() {
          y.domain([0, yStackMax]);

          rect.transition()
              .duration(500)
              .delay(function(d, i) {
                  return i * 10;
              })
              .attr("y", function(d) {
                  return y(d[d.length - 1]);
              })
              .attr("height", function(d) {
                  if(y(d[me.getInputsProperty('y')[0]]) - y(d[d.length - 1]) < 0){
                      throw new Error("height for chart can't be negative", 'bar-chart.transitionStacked');
                  }
                  return y(d[me.getInputsProperty('y')[0]]) - y(d[d.length - 1]);
              })
              .transition()
              .attr("x", function(d) {
                  return x(d[me.getInputsProperty('x')]);
              })
              .attr("width", x.rangeBand());
      };
      this._addToolTip();
      return [transitionStacked, transitionGrouped];

  },*/

  draw: function() {
    // var causes = ["wounds", "other", "disease"];

    var parseDate = d3.time.format("%m/%Y").parse;
    var me = this;
    var margin = this.getMargins();
    var width = this.getWidth() - margin.left - margin.right;
    var height = this.getHeight() - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width]);

    var y = d3.scale.linear()
      .rangeRound([height, 0]);

    var z = d3.scale.category10();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right");

    var svg = this.svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var src = me.source;


    var layers = d3.layout.stack()(causes.map(function(c) {
      return src.map(function(d) {
        return {
          x: d[0],
          y: d[1]
        };
      });
    }));

    x.domain(layers[0].map(function(d) {
      return d.x;
    }));

    y.domain([0, d3.max(layers[layers.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) {
        return z(i);
      });

    layer.selectAll("rect")
      .data(function(d) {
        return d;
      })
      .enter().append("rect")
      .attr("x", function(d) {
        return x(d.x);
      })
      .attr("y", function(d) {
        return y(d.y + d.y0);
      })
      .attr("height", function(d) {
        return y(d.y0) - y(d.y + d.y0);
      })
      .attr("width", x.rangeBand() - 1);

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);


  }
});
