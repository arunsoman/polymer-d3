Polymer({
  is: 'area-chart',

  properties: {
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'slice',
        txt: 'Pick a dimension',
        selectedValue: 0,
        selectedName: 'label',
        uitype: 'single-value',
        tickFormat: 'Tabbrweekday'
      }, {
        input: 'sliceSize',
        txt: 'Pick a messure',
        selectedValue: 1,
        selectedName: 'count',
        uitype: 'single-value',
        tickFormat: 'number'
      }]
    },
    external: Array,
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    source: {
      type: Array,
      value: [],
      notify: true
    }
  },

  behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

  _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },

    draw: function() {
      var me = this;
      var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      var parseDate = d3.time.format("%d-%b-%y").parse;

      var x = d3.time.scale()
          .range([0, width]);

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom").tickFormat(PolymerD3.utilities._formater(this.inputs[0].tickFormat));

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left").tickFormat(PolymerD3.utilities._formater(this.inputs[1].tickFormat));

      var area = d3.svg.area()
          .x(function(d) { return x(d[0]); })
          .y0(height)
          .y1(function(d) { return y(d[1]); });

          this.svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var data = me.source;
      var xtickVals = [];
      if (data) {
        data.forEach(function(d) {
          d[0] = parseDate(d[0]);
          d[1] = +d[1];
          xtickVals.push(d[0]);
        });
        //this has to be more sofisticated than this
        xAxis.tickValues(xtickVals);

        x.domain(d3.extent(data, function(d) { return d[0]; }));
        y.domain([0, d3.max(data, function(d) { return d[1]; })]);

        this.svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        this.svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Price ($)");
      }

      // d3.tsv("area.tsv", function(error, data) {
      //   if (error) throw error;

      //   data.forEach(function(d) {
      //     d.date = parseDate(d.date);
      //     d.close = +d.close;
      //   });

      //   x.domain(d3.extent(data, function(d) { return d.date; }));
      //   y.domain([0, d3.max(data, function(d) { return d.close; })]);

      //   svg.append("path")
      //       .datum(data)
      //       .attr("class", "area")
      //       .attr("d", area);

      //   svg.append("g")
      //       .attr("class", "x axis")
      //       .attr("transform", "translate(0," + height + ")")
      //       .call(xAxis);

      //   svg.append("g")
      //       .attr("class", "y axis")
      //       .call(yAxis)
      //     .append("text")
      //       .attr("transform", "rotate(-90)")
      //       .attr("y", 6)
      //       .attr("dy", ".71em")
      //       .style("text-anchor", "end")
      //       .text("Price ($)");
      // });
    }
});