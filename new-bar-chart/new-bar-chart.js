(function() {
  //State, Under 5 Years, 5 to 13 Years, 14 to 17 Years, 18 to 24 Years, 25 to 44 Years, 45 to 64 Years, 65 Years and Over
  Polymer({
    is: 'new-bar-chart',

    properties: {
      title: '',
      inputs: {
        notify: true,
        type: Array,
        value: () => {
          return [{
            input: 'x',
            txt: 'Pick a dimension',
            selectedValue: 0,
            scaleType: '',
            format:'',
            selectedObjs: [{
              key: 'state',
              value: '0'
            }],
            uitype: 'single-value',
            maxSelectableValues: 1
          }, {
            input: 'y',
            txt: 'Pick measures',
            selectedValue: [1, 2],
            format:'',
            scaleType: '',
            selectedObjs: [{
              key: 'Under Five Year',
              value: '1'
            }],
            uitype: 'multi-value',
            maxSelectableValues: 2
          }, {
            input: 'z',
            txt: 'Pick z',
            selectedValue: [1, 2],
            format:'',
            scaleType: '',
            selectedObjs: [{
              key: 'Under Five Year',
              value: '1'
            }],
            uitype: 'multi-value',
            maxSelectableValues: 2
          }];
        }
      },
      settings: {
        notify: true,
        type: Object,
        value: () => {
          return {};
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
      }
    },

    behaviors: [
      PolymerD3.chartBehavior
    ],

    attached: function() {
      this._loadSingleCol()
      // PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
    },

    _setSource: function(data) {
      this.source = data;
    },

    _loadSingleCol: function(){
      PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._setSource.bind(this), true);
      this.inputs[0].selectedValue = 2;
      this.inputs[1].selectedValue = [1];
      this.inputs[2].selectedValue = 0;
      this.layers = undefined;
    },
    draw: function() {
      let xIndex = this.getInputsProperty('x');
      let yIndices = this.getInputsProperty('y');
      let z = d3.scale.category10();
      let data = this.source;
      var me = this;

      // requireed indices not selected
      if (xIndex === -1 || !yIndices || yIndices.length < 1 || !data) {
        return false;
      }

      var conf = {
        containsHeader: true,
        xheader : [2],
        yheader : [1],
        width: 700,
        height: 300,
        xFormat: 'string',
        yFormat: 'number',
        xAlign: 'bottom',
        yAlign:'left',
        xaxisType: 'ordinal',
        yaxisType: 'linear',
        parentG: me.parentG
      };

      var nChartConfig = chartConfig(conf, this.source);

      let summarised = PolymerD3
        .summarizeData(data, xIndex, 'ordinal', yIndices, 'number', this.isStacked, this.inputs[2].selectedValue);
      let yBound = summarised.getYDomain();
      let xBound = summarised.getXDomain();

      const xConf = {
        'scaleType': 'category',
        'align': 'h',
        'format': 'time',
        'position': 'bottom',
        'domain': xBound
      };

      const yConf = {
        'scaleType': 'linear',
        'align': 'v',
        'format': 'currency',
        'position': 'left',
        'domain': [0, yBound[1]]
      };

      let yAxis = this.createAxis(yConf);
      let xAxis = this.createAxis(xConf);
      let stack = summarised.getStack();

      let layer = this.parentG.selectAll('.layer')
        .data(stack)
        .enter().append('g')
        .attr('class', 'layer')
        .style('fill', function(d, i) {
          return z(i);
        });

      layer.selectAll('rect')
        .data(function(d) {
          return d;
        })
        .enter().append('rect')
        .attr('x', function(d) {
          return xAxis.scale()(d[0]);
        })
        .attr('y', function(d) {
          return yAxis.scale()(d.y + d.y0);
        })
        .attr('height', function(d) {
          return (yAxis.scale()(d.y0) - yAxis.scale()(d.y + d.y0));
        })
        .attr('width', xAxis.scale().rangeBand() - 1);
    }
  });
})();
