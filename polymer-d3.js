Polymer({

  is: 'polymer-d3',

  properties: {
    availableCharts: {
      type: Array,
      value: () => {
        return [{
          label: 'Stacked Bar Chart',
          icon: 'icons:accessibility'
        }, {
          label: 'Grouped Bar Chart',
          icon: 'icons:cloud-circle'
        }, {
          label: 'Waterfall Chart',
          icon: 'icons:accessibility'
        }, {
          label: 'Pie Chart',
          icon: 'icons:content-cut'
        }, {
          label: 'Heat Map',
          icon: 'icons:bug-report'
        }, {
          label: 'Area Chart',
          icon: 'icons:dns'
        }, {
          label: 'Sankey Chart',
          icon: 'icons:check-circle'
        },];
      }
    }
  },

});
