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
            {axis:"Battery Life",value:0.22},
            {axis:"Brand",value:0.28},
            {axis:"Contract Cost",value:0.29},
            {axis:"Design And Quality",value:0.17},
            {axis:"Have Internet Connectivity",value:0.22},
            {axis:"Large Screen",value:0.02},
            {axis:"Price Of Device",value:0.21},
            {axis:"To Be A Smartphone",value:0.50}      
            ],[//Samsung
            {axis:"Battery Life",value:0.27},
            {axis:"Brand",value:0.16},
            {axis:"Contract Cost",value:0.35},
            {axis:"Design And Quality",value:0.13},
            {axis:"Have Internet Connectivity",value:0.20},
            {axis:"Large Screen",value:0.13},
            {axis:"Price Of Device",value:0.35},
            {axis:"To Be A Smartphone",value:0.38}
            ],[//Nokia Smartphone
            {axis:"Battery Life",value:0.26},
            {axis:"Brand",value:0.10},
            {axis:"Contract Cost",value:0.30},
            {axis:"Design And Quality",value:0.14},
            {axis:"Have Internet Connectivity",value:0.22},
            {axis:"Large Screen",value:0.04},
            {axis:"Price Of Device",value:0.41},
            {axis:"To Be A Smartphone",value:0.30}
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