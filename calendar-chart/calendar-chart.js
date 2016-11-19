Polymer({
  is: 'pie-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'slice',
          txt: 'Pick a date dimension',
          selectedValue: null,
          selectedObjs: [],
          selectedName: 'label',
          uitype: 'single-value',
          displayName: 'Diamension',
          maxSelectableValues: 1
        }, {
          input: 'sliceSize',
          txt: 'Pick a mesaure',
          selectedValue: null,
          selectedObjs: [],
          selectedName: 'count',
          uitype: 'single-value',
          displayName: 'Value',
          maxSelectableValues: 1
        }
        ];
      }
    },
    area: {
      type: Array,
      value: () => {
        return [{
          input: 'height',
          txt: 'Height of the chart',
          uitype: 'Number',
          selectedValue: 500,
          callBack: 'chartHeightCb'
        }, {
          input: 'width',
          txt: 'Width of the chart',
          uitype: 'Number',
          selectedValue: 960
        }, {
          input: 'marginTop',
          txt: 'Top  margin',
          uitype: 'Number',
          selectedValue: 40
        }, {
          input: 'marginRight',
          txt: 'Right margin',
          uitype: 'Number',
          selectedValue: 10
        }, {
          input: 'marginBottom',
          txt: 'Bottom margin',
          uitype: 'Number',
          selectedValue: 20
        }, {
          input: 'marginLeft',
          txt: 'Left margin',
          uitype: 'Number',
          selectedValue: 50
        }
        ];
      }
    }
  },

  behaviors: [
    PolymerD3.chartBehavior
  ],

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

  draw: function() {
    this.debounce('pieChartDrawDeounce', () => {
      let slice = this.inputs[0].selectedValue;
      let sliceSize = this.inputs[1].selectedValue;
      // if slice exists, it would be an array
      if (!slice || !sliceSize) {
        return false;
      }
      slice = slice[0];
      sliceSize = sliceSize[0];

      let width = this.chartWidth,
        height = this.chartHeight,
        radius = Math.min(width, height) / 2;
      let innerRadius = this.area[6].selectedValue;


    }, 400);
    //me.makeChartWrap();
  }
});
