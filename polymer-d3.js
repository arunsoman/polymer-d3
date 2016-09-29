Polymer({

  is: 'polymer-d3',

  properties: {
    // List of available charts
    availableCharts: {
      type: Array,
      value: () => {
        return [{
          label: 'Stacked Bar Chart',
          icon: 'editor:insert-chart',
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
    },
    legendSettings: {
      type: Object,
      value: () => {return {};}
    }
  },

  observers: [
    '_selectedChanged(selectedChart)',
    '_inputsChanged(inputs.*)',
    '_modeObserver(editMode)',
    '_legendSettingsObs(legendSettings.*)'
  ],

  listeners: {
    'legend-clicked': 'legendClicked'
  },

  // Listens to changes in legend settings and changes fill colors
  _legendSettingsObs: function(legendSettings) {
    this.debounce('legendSettingsDebounce', () => {
      if (legendSettings.path === 'legendSettings.colors') {
        this.selectedChartObj.redrawLegends();
      }
    }, 200);
  },

  // Gets notified when legends are clicked
  legendClicked: function() {
    this.set('legendSettingsFlag', true);
    this.async(() => {
      // Initiates configurator
      var configElem = this.$$('legends-component');
      if (configElem) {
        configElem.initConfigurator();
      }
    });
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

  _selectedChanged: function(selectedChart) {
    console.log(this);
    let elem;
    this.set('settingsVisible', true);
    if (selectedChart && !PolymerD3.utilities.isEmptyObject(selectedChart)) {
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
      this._mergeSettings(this.settings, elem.area);
      this.set('settings', elem.area);
      this.set('inputs', elem.inputs);
      this.set('selectedChartObj', elem);
      elem.set('source', this.source);
      elem.set('externals', this.externals);
      this.set('legendSettings', elem.legendSettings);
    } else {
      console.info('Empyt Object');
    }
  },

  _mergeSettings: function(from, to) {
    let mergeSettings = this._persistData('input', 'selectedValue');
    mergeSettings(from, to);
  },

  // Creates a utility function that
  // copies valueToChange from 'from' to 'to', both are array of objects
  // identifier is the key which uniquely identifies objects
  _persistData: function(identifier, valeToChange) {
    return (from, to) => {
      from.forEach(f => {
        // Short circuits to.loop
        // http://stackoverflow.com/a/2641374/5154397
        to.some(t => {
          if (t[identifier] == f[identifier]) {
            t[valeToChange] = f[valeToChange];
            return true;
          }
        });
      });
    }
  },

  check: function() {
    console.log(this);
  },

  showInputSettings: function() {
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
      // Find why legend settings has to added twice
      this.set('legendSettings', config.legendSettings);
      this.selectedChartObj.set('legendSettings', config.legendSettings);
      // To set inputs to selected chart manually
      this.selectedChartObj.set('inputs', config.inputs);
      this.selectedChartObj.draw();
    }
  }
});
