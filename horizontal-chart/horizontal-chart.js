Polymer({
  is: 'horizontal-chart',

  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'domain',
          txt: 'Domain Axis',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'myXAxis',
          maxSelectableValues: 1
        }, {
          input: 'range',
          txt: 'Range Axis',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myYAxis',
          maxSelectableValues: 5,
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
  ],

  draw: function() {
    this.debounce('draw-debounce', () => {
      let domainIndex = this.getInputsProperty('domain');
      let rangeIndices = this.getInputsProperty('range');
      let z = this.setLegendColor.bind(this);
      this.resize();
      // requireed indices not selected
      if (domainIndex === -1 || !rangeIndices || rangeIndices.length < 1 || !this.source || this.source.length < 1) {
        console.warn('Fill all required inputs using drag and drop');
        return false;
      }

      let headers = this.externals.map(e => {
        return e.key;
      });

      if (this.parentG) {
        this.parentG.html("");
      }

      let stackedData = d3.layout.stack()(rangeIndices.map(group => {
        return this.source.map(row => {
          return {
            x: row[domainIndex],
            y: row[group]
          }
        });
      }));

      // Inverting stacked data
      stackedData = stackedData.map((group, index) => {
        return {
          key: headers[rangeIndices[index]],
          data: group.map(row => {
            return {
              x: row.y,
              y: row.x,
              x0: row.y0
            }
          })
        };
      });

      debugger;
      // calculates max of range
      let maxRange = d3.max(stackedData, group => {
        return d3.max(group, data => {
          return data.x + data.x0;
        });
      });

      // to calculate domain
      let domainSet = this.source.map(row => row[domainIndex]);

      let rangeScale = d3.scale.linear()
        .domain([0, maxRange])
        .range([0, this.chartWidth]); // range is plotted on x-axis

      let domainScale = d3.scale.ordinal()
        .domain(domainSet)
        .range([0, this.chartHeight]); // domain is ploted on y-axis

      let domainAxis = d3.svg.axis()
        .scale(domainScale)
        .orient('left');

      let rangeAxis = d3.svg.axis()
        .scale(rangeScale)
        .orient('bottom');

      let  groups = this.parentG.selectAll('g')
        .data(stackedData)
        .enter()
        .append('g')
        .style('fill', (d, i) => {
          return '#f00';
        });

      let rects = groups.selectAll('rect')
        .data(function (d) {
          return d.data;
        })
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return rangeScale(d.x0);
        })
        .attr('y', function (d, i) {
          return domainScale(d.y);
        })
        .attr('height', function (d) {
          return domainScale.rangeBand();
        })
        .attr('width', function (d) {
          return rangeScale(d.y);
        });
      console.dir(stackedData, maxRange);

    }, 500);
  }
});
