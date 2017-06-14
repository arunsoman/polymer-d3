"use strict";

class polymerD3 extends Polymer.mixinBehaviors([],Polymer.Element) {
  static get is(){return 'polymer-d3'}
  static get properties(){
    return{
      availableCharts: {
        type: Array,
        value: function() {
          // This list if used when available charts aren' fed from zeppelin-viewer
          // Callback defined in charts and are called after the chart is initated
          // using PolymerD3.utilities.attachElement
          // examples => @{{this._selectedChanged}}
          // barchart.js@{{initStackedBarChart}}
          if (!this.availableCharts) {
            return [{
              label: 'Table',
              icon: 'chart:table-icon',
              element: 'polymerd3-table',
              callBack: 'initTable'
            }, {
              label: 'Stacked Bar Chart',
              icon: 'chart:stacked-bar-chart',
              element: 'bar-chart',
              callBack: 'initStackedBarChart'
            }, {
              label: 'Grouped Bar Chart',
              icon: 'chart:grouped-bar-chart',
              element: 'bar-chart',
              callBack: 'initGroupedBarChart'
            }, {
              label: 'Waterfall Chart',
              icon: 'chart:waterfall-chart',
              element: 'bar-chart',
              callBack: 'initWaterfallChart'
            }, {
              label: 'Difference',
              icon: 'chart:difference-chart',
              element: 'bar-chart',
              callBack: 'initDiffrenceChart'
            }, {
              label: 'Pie Chart',
              icon: 'chart:pieChart',
              element: 'pie-chart',
              callBack: 'setPieSettings'
            }, {
              label: 'Heat Map',
              icon: 'chart:heatMap',
              element: 'bar-chart',
              callBack: 'initHeatMap'
            }, {
              label: 'Area Chart',
              icon: 'chart:area-chart',
              element: 'area-chart',
              callBack: 'setAreaSettings'
            }, {
              label: 'Sankey Chart',
              icon: 'chart:sankey-chart',
              element: 'sankey-chart',
              callBack: 'setSankeySettings'
            }, {
              label: 'Radar Chart',
              icon: 'chart:radar-chart',
              element: 'radar-chart',
              // callBack: 'radar'
            }, {
              label: 'Scatter Plot Chart',
              icon: 'chart:scatter-plot',
              element: 'scatter-plot'
            }, {
              label: 'Calendar View Chart',
              icon: 'chart:calendar-chart',
              element: 'calendar-chart'
            }, {
              label: 'Pareto Chart',
              icon: 'chart:pareto-chart',
              element: 'pareto-chart'
            }, {
              label: 'Stacked Composite Chart',
              icon: 'chart:composite-stacked',
              element: 'stacked-composite-chart'
            }, {
              label: 'Grouped Composite Chart',
              icon: 'chart:composite-grouped',
              element: 'grouped-composite-chart'
            }, {
              label: 'Horizontal Chart',
              icon: 'chart:horizontal-bar',
              element: 'horizontal-chart'
            }, {
              label: 'Box plot',
              icon: 'chart:calendar-chart',
              element: 'box-plot'
            }, {
              label: 'Composite Canvas',
              icon: 'icons:dashboard',
              element: 'composite-canvas'
            }];
          }
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
        value: false
      },
      legendSettingsFlag: {
        type: Boolean,
        value: false
      },
      legendSettings: {
        type: Object,
        value: () => {return {};}
      }
    }
  }

  static get observers(){
    return[
      '_selectedChanged(selectedChart)',
      '_inputsChanged(inputs.*)',
      '_modeObserver(editMode)',
    ]
  }

  // edit mode
  _modeObserver (editMode) {
    if (!editMode) {
      if (this.selectedChartObj && this.selectedChartObj.extractData) {
        this.selectedChartObj.viewMode = true;
      }
      this.set('settingsVisible', false);
    } else {
      if (this.selectedChartObj && this.selectedChartObj.extractData) {
        this.selectedChartObj.viewMode = false;
      }
    }
  }

  // on inputs change
  _inputsChanged(i) {
    if (this.selectedChart && this.selectedChart.element) {
      this.$$(this.selectedChart.element).draw();
    }
  }

  // on selected chart changed
  // is also used to draw first chart
  _selectedChanged(selectedChart) {
    let elem;
    if (this.selectedChartObj && !PolymerD3.utilities.isEmptyObject(this.selectedChartObj)) {
      this.selectedChartObj.chartInfo.settings = this.selectedChartObj.extractData();
    }
    this.set('settingsVisible', true);
    if (selectedChart && !PolymerD3.utilities.isEmptyObject(selectedChart)) {
      this.$$('.chartHolder').innerHTML = '';

      elem = PolymerD3.utilities.attachElement.call(
        this,
        selectedChart.element,
        '.chartHolder',
        selectedChart.callBack
      );
      elem.set('source', this.source);
      elem.set('externals', this.externals);

      this.selectedChartObj = elem;
      this.selectedChartObj.chartInfo = this.selectedChart;
      if (selectedChart.settings) {
        elem.setData(selectedChart.settings);
      }
      this.async(() => {
        elem.set('editMode', this.editMode);
      });
    }
  }

  // might be dead code
  // not deleted because this is a good utility to merge two objects
  _mergeSettings(from, to) {
    let mergeSettings = this._persistData('input', 'selectedValue');
    mergeSettings(from, to);
  }

  // Creates a utility function that
  // copies valueToChange from 'from' to 'to', both are array of objects
  // identifier is the key which uniquely identifies objects
  _persistData(identifier, valeToChange) {
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
  }

  showInputSettings() {
    if (this.selectedChartObj) {
      this.selectedChartObj.toggleSettingsVisibility();
    }
  }

  // Bootstraps element as per mode(view/edit)
  // This meathod avoids crazy rwo-way binding side effects
  bootstrapCharts(config) {
    // data and externals are always required
    this.set('externals', config.externals);
    this.set('source', config.source);
    if (config.availableCharts) {
      // to support new charts added to polymer-d3
      // if a chart is avaiable in polymer d3, but wasn't avaiable in config stored at backend, this function fixes it
      let cookedAvailableCharts = PolymerD3.utilities.compareAndMerge(config.availableCharts, this.availableCharts, elem => {
        let avaiable = false;
        for ( let i = 0; i < config.availableCharts.length; i++) {
          if (config.availableCharts[i].label == elem.label) {
            avaiable = true;
          }
        }
        return !avaiable;
      });
      this.availableCharts = cookedAvailableCharts;
    }
    if (config.mode == 'view') {
      this.set('editMode', false);
      this.set('selectedChart', config.selectedChart);
      this.set('settings', config.settings);
      this.set('inputs', config.inputs);
    } else if (config.mode === 'create') {
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
      this.async(() => {
        this.selectedChartObj.chartInfo.settings = this.selectedChartObj.extractData();
        // gives color to selected chart
        if(!this.editMode){
          this.$$('chart-selector').setSelectedChart('[title="' + config.selectedChart.label +'"]');
        }
      }, 500);
    }
  }

  // retrives current state of polymer-d3
  // is used to save data back to zeppelin
  getSettings() {
    var selectedChart = this.selectedChart;
    selectedChart.settings = this.selectedChartObj.extractData();
    return {
      selectedChart: selectedChart,
      availableCharts: this.availableCharts
    };
  }

}

customElements.define(polymerD3.is,polymerD3)
