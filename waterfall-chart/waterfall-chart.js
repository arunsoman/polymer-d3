Polymer({
  is: 'waterfall-chart',
  behaviors: [
    PolymerD3.chartBehavior
  ],
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'x',
          txt: 'Pick Dimension',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'myXAxis',
          maxSelectableValues: 1
        }, {
          input: 'y',
          txt: 'Pick Measures',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myYAxis',
          maxSelectableValues: 2
        }, {
          input: 'z',
          txt: 'Pick Z',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myZAxis',
          maxSelectableValues: 2
        }];
      }
    },
    settings: {
      notify: true,
      type: Object,
      value: () => {
        return [];
      }
    },
    chartType: {
      type: Object,
      value: () => {
        return [];
      }
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false,
    isStacked: {
      type: Boolean,
      value: true
    },
    configurator: {
      type: Object,
      value: function() {
        return {};
      }
    }
  },
  draw: function() {
    var me = this;
    // Experimental: Debounce draw, to avoid getting called multiple times
    this.debounce('drawDebounce', () => {

      let xIndex = this.getInputsProperty('x');
      let yIndices = this.getInputsProperty('y');
      let zGroup = this.getInputsProperty('z');
      let z = this.setLegendColor.bind(this);
      this.resize();
      // requireed indices not selected
      if (xIndex === -1 || !yIndices || yIndices.length < 1 || !this.source || this.source.length < 1) {
        return false;
      }

      var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        padding = 0.3;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], padding);

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(function(d) {
          return d;
        });

      // var chart = this.parentG.attr("width", width + margin.left + margin.right)
      //   .attr("height", height + margin.top + margin.bottom)
      //   .append("g")
      //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      let headers = this.externals.map(e => {
        return e.key;
      });
      if (this.parentG) {
        this.parentG.html("");
      }
      var cumulative = 0;
      for (var i = 0; i < this.source.length; i++) {
        this.source[i].start = cumulative;
        cumulative += this.source[i][yIndices[0]];
        this.source[i].end = cumulative;
        this.source[i].class = ( this.source[i][yIndices[0]] >= 0 ) ? 'positive' : 'negative'
      }
      this.source.push({
        name: 'Total',
        end: cumulative,
        start: 0,
        class: 'total'
      });

      x.domain(this.source.map(function(d) {
        return d[xIndex];
      }));
      y.domain([0, d3.max(this.source, function(d) {
        return d.end;
      })]);

      this.parentG.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      this.parentG.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      var bar = this.parentG.selectAll(".bar")
        .data(this.source)
        .enter().append("g")
        .attr("class", function(d) {
          return "bar " + d.class })
        .attr("transform", function(d) {
          return "translate(" + x(d[xIndex]) + ",0)";
        });

      bar.append("rect")
        .attr("y", function(d) {
          return y( Math.max(d.start, d.end) );
        })
        .attr("height", function(d) {
          return Math.abs( y(d.start) - y(d.end) );
        })
        .attr("width", x.rangeBand());

      bar.append("text")
        .attr("x", x.rangeBand() / 2)
        .attr("y", function(d) {
          return y(d.end) + 5;
        })
        .attr("dy", function(d) {
          return ((d.class=='negative') ? '-' : '') + ".75em"
        })
        .text(function(d) {
          return d.end - d.start
        });

      bar.filter(function(d) {
        return d.class != "total" }).append("line")
        .attr("class", "connector")
        .attr("x1", x.rangeBand() + 5 )
        .attr("y1", function(d) {
          return y(d.end)
        } )
        .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
        .attr("y2", function(d) {
          return y(d.end)
        } )

    }, 500);
  }
});
