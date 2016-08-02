Polymer({
  is: 'waterfall-chart',

  properties: {
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
          selectedValue: [],
          selectedName: [],
          uitype: 'multi-value'
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    hideSettings: true,
    data: String,
    external: Array,
    chart: Object,
    svg:Object
  },

  behaviors: [
      PolymerD3.sizing,
      PolymerD3.propertiesBehavior,
      PolymerD3.chartconfigObserver,
      PolymerD3.chartBehavior
  ],

  applyStyle: function() {
    this.scopeSubtree(this.$.chart, true);
  },

  _getMargin: function() {
    return {
        top: this.settings[2].selectedValue,
        right: this.settings[3].selectedValue,
        bottom: this.settings[4].selectedValue,
        left: this.settings[5].selectedValue
      }
    },

    _getHeight() {
      return this.settings[0].selectedValue;
    },

    _getWidth() {
      return this.settings[1].selectedValue;
    },

    _areaChanged: function() {
      this.chart = this.draw();
    },

    _marginChanged: function() {
      this.chart = this.draw();
    },

    _toggleView: function() {
      this.hideSettings = !this.hideSettings;
      this.chart = this.draw();
    },

    // attached: function() {
    //   this.svg = d3.select('#waterfallChart').append("svg");
    //   // this._addToolTip();
    // },
    
    _addToolTip(){
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<strong>Name:</strong> <span style='color:red'>"  + "</span>";
          });       
        this.svg.call(tip);
        this.svg
          .selectAll('.bar')
          .selectAll('rect')
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
    },

    draw: function() {
      var me = this;
      var margin = me._getMargin();
      var width = me._getWidth() - margin.left - margin.right;
      var height = me._getHeight() - margin.top - margin.bottom;
      var padding = 0.3;

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
        .tickFormat(function(d) { return dollarFormatter(d); });

      me.makeChartWrap();

      me.svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      d3.csv("profit.csv", type, function(error, data) {

        // Transform data (i.e., finding cumulative values and total) for easier charting
        var cumulative = 0;
        for (var i = 0; i < data.length; i++) {
          data[i].start = cumulative;
          cumulative += data[i].value;
          data[i].end = cumulative;

          data[i].class = ( data[i].value >= 0 ) ? 'positive' : 'negative'
        }
        data.push({
          name: 'Total',
          end: cumulative,
          start: 0,
          class: 'total'
        });

        x.domain(data.map(function(d) { return d.name; }));
        y.domain([0, d3.max(data, function(d) { return d.end; })]);

        me.svg
          .append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        me.svg
          .append("g")
          .attr("class", "y axis")
          .call(yAxis);

        var bar = me.svg.selectAll(".bar")
          .data(data)
          .enter().append("g")
            .attr("class", function(d) { return "bar " + d.class })
            .attr("transform", function(d) { return "translate(" + x(d.name) + ",0)"; });

        bar.append("rect")
            .attr("y", function(d) { return y( Math.max(d.start, d.end) ); })
            .attr("height", function(d) { return Math.abs( y(d.start) - y(d.end) ); })
            .attr("width", x.rangeBand());

        bar.append("text")
            .attr("x", x.rangeBand() / 2)
            .attr("y", function(d) { return y(d.end) + 5; })
            .attr("dy", function(d) { return ((d.class=='negative') ? '-' : '') + ".75em" })
            .text(function(d) { return dollarFormatter(d.end - d.start);});

        bar.filter(function(d) { return d.class != "total" }).append("line")
            .attr("class", "connector")
            .attr("x1", x.rangeBand() + 5 )
            .attr("y1", function(d) { return y(d.end) } )
            .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
            .attr("y2", function(d) { return y(d.end) } )
      });

      this._addToolTip();

      function type(d) {
        d.value = +d.value;
        return d;
      }

      function dollarFormatter(n) {
        n = Math.round(n);
        var result = n;
        if (Math.abs(n) > 1000) {
          result = Math.round(n/1000) + 'K';
        }
        return '$' + result;
      }
    }
});
