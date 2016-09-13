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
          callBack: 'initStackedBarChart'
        }, {
          label: 'Grouped Bar Chart',
          icon: 'icons:cloud-circle',
          element: 'bar-chart',
          callBack: 'initGroupedBarChart'
        }, {
          label: 'Waterfall Chart',
          icon: 'icons:accessibility',
          element: 'bar-chart',
          callBack: 'initWaterfallChart'
        }, {
          label: 'Difference',
          icon: 'icons:rowing',
          element: 'bar-chart',
          callBack: 'initDiffrenceChart'
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
    selectedChartObj: {
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
    },
    // Data
    source: {
      type: Array,
      value: () => {return [];}
    },

    // settings
    settings: {
      type: Array,
      value: () => {return [];}
    },

    // State container
    stateContainer: {
      type: Object,
      value: () => {return {};}
    },

    editMode: {
      type: Boolean,
      value: true
    },
    legendSettingsFlag: {
      type: Boolean,
      value: false
    }
  },

  observers: [
    '_selectedChanged(selectedChart)',
    '_inputsChanged(inputs.*)',
    '_settingsChanged(settings.*)',
    '_modeObserver(editMode)'
  ],

  listeners: {
    'legend-clicked': 'legendClicked'
  },

  legendClicked: function(e) {
    this.set('legendSettingsFlag', true);
  },

  _modeObserver: function(editMode) {
    if (!editMode) {
      this.set('settingsVisible', false);
    }
  },

  _inputsChanged: function(i) {
    if (this.selectedChart && this.selectedChart.element) {
      this.$$(this.selectedChart.element).draw();
    }
  },

  _settingsChanged: function(setting) {
    // figureout a way to parse Object that has changed from path
    // And run the callBack in that object
    if (setting.path !== 'settings') {
      this.debounce('settignsChangedDebounce', () => {
        var changed = PolymerD3.utilities.parsePath(setting.path, setting.base);
        if (changed.callBack) {
          changed.callBack.call(this.selectedChartObj);
        } else {
          this.selectedChartObj.resize();
        }
      }, 200);
    }
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
      this.set('settings', elem.area);
      this.set('inputs', elem.inputs);
      this.set('selectedChartObj', elem);
      elem.set('source', this.source);
      this.set('legendSettings', elem.legendSettings);
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

  // Bootstraps element as per mode(view/edit)
  bootstrapCharts: function(config) {
    // data and externals are always required
    this.set('externals', config.externals);
    this.set('source', config.source);
    if (config.mode === 'create') {
      // Fresh Polymer d3
      this.set('editMode', true);
    } else {
      this.set('selectedChart', config.selectedChart);
      this.set('settings', config.settings);
      this.set('inputs', config.inputs);
      if (config.mode === 'edit') {
        // Edit mode settings
        this.set('editMode', true);
      } else {
        this.set('editMode', false);
      }
      // To set inputs to selected chart manually
      this.selectedChartObj.set('inputs', config.inputs);
      this.selectedChartObj.draw();
    }
  }
});
