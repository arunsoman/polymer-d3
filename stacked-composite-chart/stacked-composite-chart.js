Polymer({
  is: 'stacked-composite-chart',
  draw: function() {
    this.debounce('draw-debounce', () => {
      const xInput = this.inputs[0].selectedValue;
      const yInputs = this.inputs[1].selectedValue;
      const yLine = this.inputs[2].selectedValue;
      let z = this.setLegendColor.bind(this);

      if (!xInput || !xInput.length || !yInputs || !yInputs.length) {
        console.warn('Fill all inputs');
        return false;
      }
      this.parentG.html('');

      const height = this.chartHeight;
      const width = this.chartWidth;

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
        .orient('right');

      // create layers
      let layers = d3.layout.stack()(yInputs.map(yInput => {
        return dataset.map(d => {
          return {x: d[xInput[0]], y: d[yInput]};
        });
      }));

      x.domain(layers[0].map(d => d.x));
      y.domain([0, d3.max(layers[layers.length - 1], d => d.y0 + d.y)]);

      let layer = this.parentG.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer')
        .style('fill', (d, i) => z(i));

      layer.selectAll('rect')
        .data(function(d) { return d; })
        .enter().append('rect')
        .attr('x', function(d) { return x(d.x); })
        .attr('y', function(d) { return y(d.y + d.y0); })
        .attr('height', function(d) { return y(d.y0) - y(d.y + d.y0); })
        .attr('width', x.rangeBand() - 1);

      this.parentG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      this.parentG.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + width + ',0)')
        .call(yAxis);

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
