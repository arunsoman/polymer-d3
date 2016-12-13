Polymer({
  is: 'grouped-composite-chart',
    draw: function() {
    this.debounce('draw-debounce', () => {
      const xInput = this.inputs[0].selectedValue;
      const yInputs = this.inputs[1].selectedValue;
      const yLine = this.inputs[2].selectedValue;
      let z = this.setLegendColor.bind(this);
      this.resize();
      if (!xInput || !xInput.length || !yInputs || !yInputs.length) {
        console.warn('Fill all inputs');
        return false;
      }
      this.parentG.html('');

      const height = this.chartHeight;
      const width = this.chartWidth;

      function mapYLine(row) { // extracts yLine prop from each row
        return row[yLine[0]];
      }

      function mapXValue(row) { // extracts x prop from each row
        return row[xInput[0]];
      }
      // to do: format and beautify data
      let dataset = this.source.slice(0);

      var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

      var x1 = d3.scale.ordinal();

      var y = d3.scale.linear()
        .range([height, 0]);

      var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

      let headers = this.externals.map(e => {
        return e.key;
      });

      x0.domain(dataset.map(function(d) { return d[0]; }));
      // change dataset
      x1.domain(dataset).rangeRoundBands([0, x0.rangeBand()]);
      y.domain([0, d3.max(dataset, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

      this.parentG.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.chartHeight + ")")
          .call(xAxis);

      this.parentG.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Population");

      var state = this.parentG.selectAll(".state")
          .data(data)
        .enter().append("g")
          .attr("class", "state")
          .attr("transform", function(d) { return "translate(" + x0(d.State) + ",0)"; });

      state.selectAll("rect")
          .data(function(d) { return d.ages; })
        .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { return x1(d.name); })
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return this.chartHeight - y(d.value); })
          .style("fill", function(d) { return color(d.name); });



      // to draw line chart
      if (yLine && yLine.length) {

        let lineData = this.source.map(row => ({x: mapXValue(row), y: mapYLine(row)}));
        console.log(lineData);

        let guide = d3.svg.line()
          .x(d => x(d.x))
          .y(d => yLineScale(d.y))
          .interpolate('basis');

        let yLineScale = d3.scale.linear()
          .domain([0, d3.max(lineData, row => row.y )])
          .range([height, 0]);

        let yAxis2 = d3.svg.axis()
         .scale(yLineScale)
         .orient('right');

        let line = this.parentG.append('path')
          .datum(lineData)
          .attr('d', guide)
          .attr('class', 'line');
      }

      var htmlCallback = d => { // retained as arrow function to access `this.inputs[]`
        var str = '<table>' +
          '<tr>' +
          '<td>' + this.inputs[0].displayName + ':</td>' +
          '<td>' + d.x + '</td>' +
          '</tr>' +
          '<tr>' +
          '<td>' + this.inputs[1].displayName + ':</td>' +
          '<td>' + d.y + '</td>' +
          '</tr>' +
          '</table>';
        return str;
      };
      this.attachToolTip(this.parentG, rects, 'vertalBars', htmlCallback);

      this.attachLegend(this.parentG);
    }, 500);
  },

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
          maxSelectableValues: 2,
          supportedType: ''
        }, {
          input: 'z',
          txt: 'Pick Z',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myZAxis',
          maxSelectableValues: 2,
          supportedType: ''
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

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.chartConfigCbBehavior
  ]
});
