Polymer({
  is: 'radar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'x',
        txt: 'Pick a dimension',
        selectedValue: 0,
        selectedName: 'label',
        uitype: 'single-value'
      }, {
        input: 'y',
        txt: 'Pick a messure',
        selectedValue: [1],
        selectedName: 'count',
        uitype: 'single-value'
      },{
        input: 'z',
        txt: 'Pick a group',
        selectedValue: [2],
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
    PolymerD3.fileReader.call(this,'radar-chart/data1.csv', [1], [], undefined, this.callme, true);

  },
  callme(d){
    this.source = d;
    let yIndices = this.getInputsProperty('y');
    this.data = this.loadFromGroup(yIndices);
    this.draw();
  },
  loadFromMultiCol: function(yIndices){
    let xIndex = this.getInputsProperty('x');
  //  let zGroup = this.getInputsProperty('z');

    var headers = this.source[0];
    var data = [];
    for(var i = 1; i < this.source.length; i++){
      var data1 = [];
      for(var j = 0; j <yIndices.length; j++){
        var tA= [];
        tA.push(headers[yIndices[j]]);
        tA.push(this.source[i][j]);
        tA.push(this.source[i][xIndex]);
        data1.push(tA);
      }
      data.push(data1);
    }
    return data;
  },
  loadFromGroup: function(yIndices){
    let xIndex = this.getInputsProperty('x');
    //let yIndices = this.getInputsProperty('y');
    let zGroup = this.getInputsProperty('z');
    this.source.shift();
    var layers = d3.nest()
    .key((d)=>{console.log(d[zGroup]);return d[zGroup];})
    .entries(this.source);
    var data  = [];
    layers.forEach((element)=>{
      var data1 = [];
      element.values.forEach((value)=>{
        data1.push([value[xIndex],value[yIndices[0]], value[zGroup]]);
      });
      data.push(data1);
    });
    return data;
  },

  draw: function() {
      if(this.data === undefined)
        return;
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
      PolymerD3.RadarChart( this.data, radarChartOptions, this);
  }
});