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

  behaviors: [
    PolymerD3.chartBehavior
  ],

  xAxisRotationCb: function() {
    if (this.parentG) {
        let xAxis = this.parentG.select('.x-axis');
        let xAxisCommander = this.attach(xAxis);
        let toRotate = this._getAreaObj('xAxisRotation').selectedValue;
        let textAnchor = toRotate > 0 ? 'start': 'end';
        this.attach(xAxis).tickRotation.rotateTicks(toRotate, textAnchor);
    }
  },

  yAxisRotationCb: function() {
    if (this.parentG) {
      let yAxis = this.parentG.select('.y-axis');
      let yAxisCommander = this.attach(yAxis);
      let toRotate = this._getAreaObj('yAxisRotation').selectedValue;
      let textAnchor = 'end';
      this.attach(yAxis).tickRotation.rotateTicks(toRotate, textAnchor);
    }
  },

  chartHeightCb: function() {
    if (this.parentG) {
      let width = this._getWidth();
      let height = this._getHeight();
      let svg = d3.select(this).selectAll('svg')
      svg.attr('viewBox', '0 0 ' + (width + 50) +' ' + (height + 50) +'');
      this.draw();
      this.resize();
    }
  },

  attached: function() {
    // this._loadDiffdata();
    //  this._loadHeatmap();
    // this._loadWaterfall();
    // this._loadSingleCol();
    // PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
  },

  draw: function() {
    var me = this;
    // Experimental: Debounce draw, to avoid getting called multiple times
    this.debounce('darwDebounce', () => {
      let xIndex = this.getInputsProperty('x');
      let yIndices = this.getInputsProperty('y');
      let zGroup = this.getInputsProperty('z');
      let z = this.setLegendColor.bind(this);
      this.resize();
      // requireed indices not selected
      if (xIndex === -1 || !yIndices || yIndices.length < 1 || !this.source ||
        PolymerD3.utilities.isEmptyObject(this.configurator) || this.source.length < 1
      ) {
        return false;
      }
      let headers = this.externals.map(e => {
        return e.key;
      });
      if (this.parentG) {
        this.parentG.html("");
      }
      var conf = this.configurator.conf.call(this);

      // cloning the source to keep it intact
      let _src = JSON.parse(JSON.stringify(this.source));

      // for waterfall chart
      if (conf.chartType === 'waterfall') {
        let sum = 0;
        _src.forEach(value =>  {
          sum += value[yIndices[0]];
        });
        var total = {};
        total[xIndex] = 'Total';
        total[yIndices[0]] = sum;
        _src.push(total);
      }

      var myGroup = PolymerD3
        .groupingBehavior
        .group_by(
          yIndices.length === 1 ? [zGroup] : yIndices,
          xIndex, yIndices, headers
        );
      var nChartConfig = this
        .chartConfig(conf, _src, myGroup.process);

      let stackData = myGroup.getStack();

      // Temporary hack to pass stackData's length to processor
      nChartConfig.stackDataLength = stackData.length;

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
        .style('fill', function(d) {
          // Logic to generate legends initialy
          var color = z(d);
          var keyPresent = false;
          me.legendSettings.colors.forEach((c) => {
            if (c.label == d.key) {
              color = c.color;
              keyPresent = true;
            }
          });
          // Create new entry if legend isn't present
          // TO do: remove &&d.key =>  something's wrong with generate stackData meathod
          // d.key comes as undefined check `PolymerD3.groupingBehavior`
          if (!keyPresent && d.key) {
            me.legendSettings.colors.push({
              color: color,
              label: d.key
            });
          }
          return color;
        })
        .attr('data-legend', function(d) {
          return d.key;
        });
      // this.attachLegend(this.parentG);

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
