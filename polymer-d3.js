Polymer({

  is: 'polymer-d3',

  properties: {
    // List of available charts
    availableCharts: {
      type: Array,
      value: () => {
        return [{
          label: 'Stacked Bar Chart',
          icon: 'icons:accessibility',
          element: 'bar-chart',
          callBack: 'setStackedSettings'
        }, {
          label: 'Grouped Bar Chart',
          icon: 'icons:cloud-circle',
          element: 'bar-chart',
          callBack: 'initGroupedBarChart'
        }, {
          label: 'Waterfall Chart',
          icon: 'icons:accessibility',
          element: 'bar-chart',
          callBack: 'setWatefallSettings'
        }, {
          label: 'Difference',
          icon: 'icons:rowing',
          element: 'bar-chart',
          callBack: 'setDiffrenceSettings'
        }, {
          label: 'Pie Chart',
          icon: 'icons:content-cut',
          element: 'pie-chart',
          callBack: 'setPieSettings'
        }, {
          label: 'Heat Map',
          icon: 'icons:bug-report',
          element: 'bar-chart',
          callBack: 'setHeatMapSettings'
        }, {
          label: 'Area Chart',
          icon: 'icons:dns',
          element: 'area-chart',
          callBack: 'setAreaSettings'
        }, {
          label: 'Sankey Chart',
          icon: 'icons:check-circle',
          element: 'sankey-chart',
          callBack: 'setSankeySettings'
        }];
      }
    },
    // Object desctibing selected chart type
    selectedChart: {
      type: Object,
      value: () => { return {};}
    },
    // Flag to display settngs components
    settingsVisible: {
      type: Boolean,
      value: false
    },
    // Inputs
    externals: {
      type: Array,
      value: () => { return [];}
    },
    inputs: {
      type:Array,
      notify: true,
      value: () => {return [];}
    }
  },

  observers: ['_selectedChanged(selectedChart)', '_inputsChanged(inputs.*)'],

  _inputsChanged: function(i) {
    this.debounce('inputschangedebounce', () => {
      if (this.selectedChart && this.selectedChart.draw) {
        this.$$(selectedChart).draw();
      }
    }, 100);
  },

  _selectedChanged: function(selectedChart) {
    console.log(this);
    let elem;
    this.set('settingsVisible', true);
    if (!PolymerD3.utilities.isEmptyObject(selectedChart)) {
      this.$$('.chartHolder').innerHTML = '';
      elem = PolymerD3.utilities.attachElement.call(
        this,
        selectedChart.element,
        '.chartHolder',
        selectedChart.callBack
      );
      // Data and headers(externals) should come from parent
      // and should be set to new child element
      // elem.set('source');
      // elem.set('externals');

      // Gets settings object from newly attached chart
      this.set('settings', elem.settngs);
      this.set('inputs', elem.inputs);
    } else {
      console.info('Empyt Object');
    }
  },

  check: function() {
    console.log(this);
  },

  showSettings: function() {
    this.set('settingsVisible', !this.settingsVisible);
  },

  attached: function() {
    // Experimental to create a single change manager
    // to handle deep data mutations
    this.async(() => {
      this.addEventListener('dataMutated', this._dataMutated.bind(this));
    })
  },

  _dataMutated: function(e) {
    console.log(e);
  }

});
