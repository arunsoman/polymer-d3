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
        selectedValue: null,
        selectedObjs: [],
        selectedName: 'label',
        uitype: 'single-value',
        displayName: 'Diamension',
        maxSelectableValues: 1
      }, {
        input: 'y',
        txt: 'Pick a mesaure',
        selectedValue: null,
        selectedObjs: [],
        selectedName: 'count',
        uitype: 'single-value',
        displayName: 'Value',
        maxSelectableValues: 2
      }, {
        input: 'z',
        txt: 'Group By',
        selectedValue: null,
        selectedObjs: [],
        selectedName: 'count',
        uitype: 'single-value',
        displayName: 'Group By',
        maxSelectableValues: 1
      }]
    },
    hideSettings: true,
    source: {
      type: Array,
      value: []
    },
    external: Array,
    svg: Object,
    settings: {
      notify: true,
      type: Object,
      value: () => {
        return [];
      }
    }
  },

  behaviors: [
    PolymerD3.chartBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

  init: function() {
    this.data = this.loadFromGroup(this.yIndex);
  },

  loadFromMultiCol: function(yIndices) {
    let headers = this.source[0];
    let data = [];
    for(let i = 1; i < this.source.length; i++){
      let data1 = [];
      for(let j = 0; j <yIndices.length; j++){
        let tA= [];
        tA.push(headers[yIndices[j]]);
        tA.push(this.source[i][j]);
        tA.push(this.source[i][this.xIndex]);
        data1.push(tA);
      }
      data.push(data1);
    }
    return data;
  },

  loadFromGroup: function(yIndices) {
    let layers = d3.nest()
      .key(d => d[this.zIndex])
      .entries(this.source);

    let data  = [];

    layers.forEach((element)=>{
      let data1 = [];
      element.values.forEach(value => {
        data1.push([value[this.xIndex],value[yIndices[0]], value[this.zIndex]]);
      });
      data.push(data1);
    });

    return data;
  },

  draw: function() {
    this.debounce('radarDrawDebounce', () => {
      this.xIndex = this.getInputsProperty('x');
      this.yIndex = this.getInputsProperty('y');
      this.zIndex = this.getInputsProperty('z');

      if(this.xIndex == null || this.yIndex == null || this.zIndex == null) {
        return false;
      }

      this.init();
      this.parentG.html('');
      let color = d3.scale.ordinal()
        .range(['#EDC951','#CC333F','#00A0B0']);

      let radarChartOptions = {
        w: this.chartWidth,
        h: this.chartHeight,
        margin: this.getMargins(),
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
      };

      //Call function to draw the Radar chart
      PolymerD3.RadarChart(this.data, radarChartOptions, this);
    }, 500);
  }
});