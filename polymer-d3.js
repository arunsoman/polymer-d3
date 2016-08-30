Polymer({

  is: 'polymer-d3',

  properties: {
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
          callBack: 'setGroupedSettings'
        }, {
          label: 'Waterfall Chart',
          icon: 'icons:accessibility',
          element: 'bar-chart',
          callBack: 'setWatefallSettings'
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
    selectedChart: {
      type: Object,
      value: () => { return {};}
    }
  },

});
