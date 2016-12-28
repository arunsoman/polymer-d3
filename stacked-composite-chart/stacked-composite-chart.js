Polymer({
  is: 'stacked-composite-chart',
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

      let x = d3.scale.ordinal()
        .rangeRoundBands([0, width]);

      let y = d3.scale.linear()
        .rangeRound([height, 0]);

      let xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

      let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

      let headers = this.externals.map(e => {
        return e.key;
      });
      // create layers
      let layers = d3.layout.stack()(yInputs.map(yInput => {
        let layer = dataset.map(d => ({x: mapXValue(d), y: d[yInput]}));
        layer.key = headers[yInput];
        return layer;
      }));

      x.domain(layers[0].map(d => d.x));
      y.domain([0, d3.max(layers[layers.length - 1], d => d.y0 + d.y)]);

      let layer = this.parentG.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer')
        .style('fill', (d, i) => {
          // Logic to generate legends initialy
          let color = z(d);
          let keyPresent = false;
          this.legendSettings.colors.forEach(c => {
            if (c.label == d.key) {
              color = c.color;
              keyPresent = true;
            }
          });
          // Create new entry if legend isn't present
          // TO do: remove &&d.key =>  something's wrong with generate stackData meathod
          // d.key comes as undefined check `PolymerD3.groupingBehavior`
          if (!keyPresent && d.key) {
            this.legendSettings.colors.push({
              color: color,
              label: d.key
            });
          }
          return color;
        })
        .attr('class', 'stroked-elem') // to set stroke
        .attr('data-legend', function(d) {
          return d.key;
        });;

      let rects = layer.selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('x', d => x(d.x))
        .attr('y', d => (y(d.y + d.y0)))
        .attr('height', d => (y(d.y0) - y(d.y + d.y0)))
        .attr('width', x.rangeBand() - 1);

      this.parentG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      this.parentG.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + 0 + ',0)')
        .call(yAxis);

      // to draw line chart
      if (yLine && yLine.length) {

        let lineData = this.source.map(row => ({x: mapXValue(row), y: mapYLine(row)}));

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
          .attr('class', 'line')
          .attr('transform', 'translate(' + ((x.rangeBand() - 1) / 2) + ',' + 0 + ')');
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
