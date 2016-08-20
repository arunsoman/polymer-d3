(function() {
  //State, Under 5 Years, 5 to 13 Years, 14 to 17 Years, 18 to 24 Years, 25 to 44 Years, 45 to 64 Years, 65 Years and Over
  Polymer({
    is: 'new-bar-chart',

    properties: {
      title: '',
      inputs: {
        notify: true,
        type: Array,
        value: function() {
          return [{
            input: 'x',
            txt: 'Pick a dimension',
            selectedValue: [],
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
            selectedValue: [],
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
        value: function() {
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
    }
  });
})();
