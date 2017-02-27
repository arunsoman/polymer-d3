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
        selectedValue: [],
        selectedObjs: [],
        selectedName: 'label',
        uitype: 'single-value',
        displayName: 'Diamension',
        maxSelectableValues: 1
      }, {
        input: 'y',
        txt: 'Pick a mesaure',
        selectedValue: [],
        selectedObjs: [],
        selectedName: 'count',
        uitype: 'single-value',
        displayName: 'Value',
        maxSelectableValues: 10
      }, {
        input: 'z',
        txt: 'Group By',
        selectedValue: [],
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

  loadFromMultiCol: function(xIndex, yIndices, source) {
    let data = yIndices.map(yIndex => {
      return source.map(row => {
        return {
          axis: row[xIndex.value],
          value: row[yIndex.value],
          segment: yIndex.key
        }
      });
    });
    return data;
  },

  loadFromGroup: function(groupIndex, yIndices, source) {
    let data = source.map(row => {
      let segment = row[groupIndex.value];
      return yIndices.map(yIndex => {
        return {
          axis: yIndex.key,
          value: row[yIndex.value],
          segment: segment
        }
      });
    });
    return data;
  },

  draw: function() {
    this.debounce('radarDrawDebounce', () => {
      this.xIndex = this.getInputsProperty('x');
      this.yIndex = this.getInputsProperty('y');
      this.zIndex = this.getInputsProperty('z');

      if((this.xIndex == null && this.zIndex == null) || !this.yIndex.length) {
        return false;
      }

      let yObj = this.getInputsPropertyObj('y').selectedObjs;
      if (this.zIndex == null) {
        let xObj = this.getInputsPropertyObj('x').selectedObjs[0];
        this.data = this.loadFromMultiCol(xObj, yObj, this.source);
      } else {
        let zObj = this.getInputsPropertyObj('z').selectedObjs[0];
        this.data = this.loadFromGroup(zObj, yObj, this.source);
      }
      this.parentG.html('');
      let color = d3.scale.ordinal()
        .range(this.defaultColors);

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