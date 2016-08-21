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
      dataMutated: false
    },

    behaviors: [
      PolymerD3.chartBehavior
    ],

    attached: function() {
      PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
    },

    _setSource: function(data) {
      this.source = data;
    },

    draw: function() {

      let xIndex = this.getInputsProperty('x');
      let yIndices = this.getInputsProperty('y');
      let data = this.source;

      // requireed indices not selected
      if (xIndex === -1 || !yIndices || yIndices.length < 1 || !data) {
        return false;
      }

      let summarised = PolymerD3
        .summarizeData(data, xIndex, 'string', yIndices, 'number', true, undefined);
      let yBound = summarised.getYDomain();
      let xBound = summarised.getXDomain();

      const xConf = {
        'scaleType': 'category',
        'align': 'h',
        'format': 'category',
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
    }
  });
})();
