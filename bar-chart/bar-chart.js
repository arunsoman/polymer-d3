// Initializes barchart into namespace
PolymerD3.barChart = {};

Polymer({
  is: 'bar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'x',
          txt: 'Pick a dimension',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'myXAxis',
          maxSelectableValues: 1
        }, {
          input: 'y',
          txt: 'Pick measures',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myYAxis',
          maxSelectableValues: 2
        }, {
          input: 'z',
          txt: 'Pick z',
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

  behaviors: [
    PolymerD3.chartBehavior
  ],

  attached: function() {
    'use strict';
    // this._loadDiffdata();
    //  this._loadHeatmap();
    // this._loadWaterfall();
    // this._loadSingleCol();
    // PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
  },

  draw: function() {
    'use strict';
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let zGroup = this.getInputsProperty('z');
    let z = d3.scale.category10();
    // To make sure that data is intact
    let data = PolymerD3.utilities.clone(this.source);
    var me = this;
    // requireed indices not selected
    if (xIndex === -1 || !yIndices || yIndices.length < 1 || !data ||
      PolymerD3.utilities.isEmptyObject(this.configurator || data.length < 1)
    ) {
      return false;
    }
    // Experimental: Debounce draw, to avoid getting called multiple times
    this.debounce('darwDebounce', () => {
      if (this.parentG) {
        this.parentG.html("");
      }
      var conf = this.configurator.conf.call(this);

      var myGroup = PolymerD3
        .groupingBehavior
        .group_by(
          yIndices.length === 1 ? [zGroup] : yIndices,
          xIndex, yIndices, this.source[0]
        );
      var nChartConfig = this
        .chartConfig(conf, this.source, myGroup.process);

      let stackData = myGroup.getStack();

      // Temporary hack to pass stackData's length to processor
      nChartConfig.stackDataLength = stackData.length;

      // For waterfall chart
      if (conf.chartType === 'waterfall') {
        var group = myGroup.getGroups();
        nChartConfig.setYDomain([0, group[group.length - 1].values[0].y0]);
        nChartConfig.setXDomain('Total');

        // To replicate each element in stackData
        let total = {
          key: 'total',
          values: [
            ['total', stackData[stackData.length - 1].values[0][1]]
          ]
        };
        total.values[0].y = (stackData[stackData.length - 1].values[0].y + stackData[stackData.length - 1].values[0].y0);
        total.values[0].y0 = 0;
        stackData.push(total);
        // Replication - end
      }
      var translations = this.configurator.processors(nChartConfig);

      var htmlCallback;
      htmlCallback = d => {
        var str = '<table>' +
          '<tr>' +
          '<td>' + this.inputs[0].displayName + ':</td>' +
          '<td>' + nChartConfig.formatX(d[0]) + '</td>' +
          '</tr>' +
          '<tr>' +
          '<td>' + this.inputs[1].displayName + ':</td>' +
          '<td>' + nChartConfig.formatY(d[1]) + '</td>' +
          '</tr>' +
          '</table>';
        return str;
      };

      let layer = this.parentG.selectAll('.layer')
        .data(stackData)
        .enter().append('g')
        .attr('transform', translations.translate)
        .attr('class', 'layer')
        .style('fill', function(d, i) {
          return z(i);
        })
        .attr('data-legend', function(d, i, j) {
          return d.key;
        });
      this.attachLegend(this.parentG);

      var rects = layer.selectAll('rect')
        .data(function(d) {
          return d.values;
        })
        .enter().append('rect')
        .attr('x', translations.rectX)
        .attr('y', translations.rectY)
        .attr('height', translations.rectHeight)
        .attr('width', translations.barWidth)
        // .attr('data-legend', translations.legendF)
        .attr('class', translations.classF);

      this.attachToolTip(this.parentG, rects, 'vertalBars', htmlCallback);
      this.attachLegend(this.parentG);
      if (conf.chartType === 'heatmap') {
        var color = d3.scale.linear()
          .domain(d3.extent(stackData.map((aobj) => {
            return aobj.key;
          })))
          .range(['white', 'red'])
          .interpolate(d3.interpolateLab);
        rects.style('fill', (d, i, j) => {
          return color(stackData[j].key);
        });
      }
    }, 500);
  },

  initGroupedBarChart: function() {
    this.set('configurator', new PolymerD3.barChart.grouped());
  },

  initStackedBarChart: function() {
    this.set('configurator', new PolymerD3.barChart.stacked());
  },

  initWaterfallChart: function() {
    this.set('configurator', new PolymerD3.barChart.waterfall());
  },

  initDiffrenceChart: function() {
    this.set('configurator', new PolymerD3.barChart.difference());
  },

  initHeatMap: function() {
    this.set('configurator', new PolymerD3.barChart.heatMap());
  }
});
