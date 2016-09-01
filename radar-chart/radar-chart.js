Polymer({
  is: 'radar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'slice',
        txt: 'Pick a dimension',
        selectedValue: 0,
        selectedName: 'label',
        uitype: 'single-value'
      }, {
        input: 'sliceSize',
        txt: 'Pick a messure',
        selectedValue: 1,
        selectedName: 'count',
        uitype: 'single-value'
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: [{
        input: 'displayTxt',
        txt: 'Placement of lables',
        uitype: 'dropDown',
        selectedValue: Array,
        selectedName: Array,
        options: [{
            key: 'None',
            value: 0
        }, {
            key: 'inside',
            value: 1
        }, {
            key: 'outside',
            value: 2
        }]
      }, {
        input: 'innerRadius',
        txt: 'Inner radius',
        uitype: 'Number',
        selectedValue: 0
      }]
    },
    hideSettings: true,
    source: {
      type: Array,
      value: []
    },
    external: Array,
    svg: Object
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },
  
  attached: function() {
    this.draw();
  },

  draw: function() {

var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
          
      ////////////////////////////////////////////////////////////// 
      ////////////////////////// Data ////////////////////////////// 
      ////////////////////////////////////////////////////////////// 

      var data = [
            [//iPhone
            ["Battery Life",0.22],
            ["Brand",0.28],
            ["Contract Cost",0.29],
            ["Design And Quality",0.17],
            ["Have Internet Connectivity",0.22],
            ["Large Screen",0.02],
            ["Price Of Device",0.21],
            ["To Be A Smartphone",0.50]      
            ],[//Samsung
            ["Battery Life",0.27],
            ["Brand",0.16],
            ["Contract Cost",0.35],
            ["Design And Quality",0.13],
            ["Have Internet Connectivity",0.20],
            ["Large Screen",0.13],
            ["Price Of Device",0.35],
            ["To Be A Smartphone",0.38]
            ],[//Nokia Smartphone
            ["Battery Life",0.26],
            ["Brand",0.10],
            ["Contract Cost",0.30],
            ["Design And Quality",0.14],
            ["Have Internet Connectivity",0.22],
            ["Large Screen",0.04],
            ["Price Of Device",0.41],
            ["To Be A Smartphone",0.30]
            ]
          ];
      ////////////////////////////////////////////////////////////// 
      //////////////////// Draw the Chart ////////////////////////// 
      ////////////////////////////////////////////////////////////// 

      var color = d3.scale.ordinal()
        .range(["#EDC951","#CC333F","#00A0B0"]);
        
      var radarChartOptions = {
        w: this.chartWidth,
        h: this.chartHeight,
        margin: this.getMargins(),
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
      };
      //Call function to draw the Radar chart
      PolymerD3.RadarChart(".radarChart", data, radarChartOptions, this);
  }
});