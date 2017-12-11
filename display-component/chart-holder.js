import './chart-selector.js';
import '../behaviors/redux-mixins-behavior.js';
import {Element} from "../node_modules/@polymer/polymer/polymer-element.js";

class chartHolder extends ReduxMixinBehavior(Element) {
  static get template() {
    return `
  <template is="dom-if" if="{{settingsVisible}}">
    <div class="tool-bar">
      <chart-selector activate-import="[[activateImport]]" charts="[[availableCharts]]" selected="{{selectedChart}}" paragraph-id="[[paragraphId]]"></chart-selector>
    </div>
  </template>
  <div class="chartHolder" id="chartHolder"></div>
`;
  }

  static get is(){return 'chart-holder'}
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
          },{
            label: 'Bar',
            icon: 'chart:composite-stacked',
            element: 'bar-chart'
          }, {
            label: 'Stacked Bar',
            icon: 'chart:stacked-bar-chart',
            element: 'stacked-bar-chart',
          }, {
            label: 'Grouped Bar',
            icon: 'chart:grouped-bar-chart',
            element: 'grouped-bar-chart',
          }, {
            label: 'Waterfall',
            icon: 'chart:waterfall-chart',
            element: 'waterfall-chart',
          }, {
            label: 'Difference',
            icon: 'chart:difference-chart',
            element: 'difference-chart',
          }, {
            label: 'Pie',
            icon: 'chart:pieChart',
            element: 'pie-chart',
          }, {
            label: 'Heat Map',
            icon: 'chart:heatMap',
            element: 'heat-map',
          }, {
            label: 'Area',
            icon: 'chart:area-chart',
            element: 'area-chart',
          }, {
            label: 'Sankey',
            icon: 'chart:sankey-chart',
            element: 'sankey-chart',
          }, {
            label: 'Radar',
            icon: 'chart:radar-chart',
            element: 'radar-chart',
            // callBack: 'radar'
          }, {
            label: 'Scatter Plot',
            icon: 'chart:scatter-plot',
            element: 'scatter-plot'
          }, {
            label: 'Calendar View',
            icon: 'chart:calendar-chart',
            element: 'calendar-chart'
          }, {
            label: 'Pareto',
            icon: 'chart:pareto-chart',
            element: 'pareto-chart'
          },{
            label: 'Horizontal',
            icon: 'chart:horizontal-bar',
            element: 'horizontal-chart'
          }, {
            label: 'Box plot',
            icon: 'chart:box-plot-chart',
            element: 'box-plot'
          }, {
            label: 'Bullet',
            icon: 'chart:bullet-chart',
            element: 'bullet-chart'
          }, {
            label: 'Word cloud',
            icon: 'chart:word-cloud-icon',
            // icon: 'chart:word-cloud',
            element: 'word-cloud'
          }, {
            label: 'Composite',
            icon: 'icons:dashboard',
            element: 'composite-canvas'
          }];
        }
      }
    },
    activateImport:{
      type:Boolean,
      value:false
    },
    // Object desctibing selected chart type
    selectedChart: {
      type: Object,
      value: () => {}
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
      value: () => {}
    },
    paragraphId:{
      type:String
    }
  }
}

  static get actions() {
    return {}
  }

  constructor(){
    super();
  }
  connectedCallback(){
    super.connectedCallback()
  }
  static get observers(){
    return[
    '_selectedChanged(selectedChart)'
    ]
  }

  // on selected chart changed
  // is also used to draw first chart
  _selectedChanged(selectedChart) {
    let getparagraphId = this.uuid?this.uuid.split("@")[0]:this.paragraphId
    if(selectedChart && getparagraphId){
      let elem;
      this.$.chartHolder.innerHTML = '';
      if(selectedChart.element){
        elem = PolymerD3.utilities.attachElement.call(
          this,
          selectedChart.element,
          '.chartHolder',
          getparagraphId,
          selectedChart.icon
          );
        this.selectedChartObj = elem;
        this.selectedChartObj.chartInfo = this.selectedChart;
      }
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
    this.set('editMode', true);
  }

  // retrives current state of chart-holder
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

window.customElements.define(chartHolder.is,chartHolder)
