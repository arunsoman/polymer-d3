//https://bl.ocks.org/mbostock/3887118
Polymer({
  is: 'scatter-plot',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'x',
          txt: 'Pick a x',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1,
        }, {
          input: 'y',
          txt: 'Pick y',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
        }, {
          input: 'z',
          txt: 'Group',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
        }, {
          input: 's',
          txt: 'Size',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
        }];
      }
    },
    settings: {
      type: Array,
      notify: true,
      value: () => {
        return [];
      }
    },
    area: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'height',
          txt: 'Height of the chart',
          uitype: 'Number',
          selectedValue: 500,
          callBack: 'chartHeightCb'
        }, {
          input: 'width',
          txt: 'Width of the chart',
          uitype: 'Number',
          selectedValue: 960
        }, {
          input: 'marginTop',
          txt: 'Top  margin',
          uitype: 'Number',
          selectedValue: 40
        }, {
          input: 'marginRight',
          txt: 'Right margin',
          uitype: 'Number',
          selectedValue: 10
        }, {
          input: 'marginBottom',
          txt: 'Bottom margin',
          uitype: 'Number',
          selectedValue: 20
        }, {
          input: 'marginLeft',
          txt: 'Left margin',
          uitype: 'Number',
          selectedValue: 50
        }, {
          input: 'strokeWidth',
          txt: 'Stroke Width',
          uitype: 'Number',
          selectedValue: 0,
          callBack: 'strokeWidthCb'
        }, {
          input: 'xAxisRotation',
          txt: 'Rotate X-Axis Tick',
          uitype: 'sliderInput',
          selectedValue: 0,
          min: -90,
          max: 90,
          step: 15,
          callBack: 'xAxisRotationCb'
        }, {
          input: 'yAxisRotation',
          txt: 'Rotate Y-Axis Tick',
          uitype: 'sliderInput',
          selectedValue: 0,
          min: -60,
          max: 60,
          step: 12,
          callBack: 'yAxisRotationCb'
        }, {
          input: 'opacity',
          txt: 'Opacity',
          uitype: 'Number',
          selectedValue: 1,
          callBack: 'opacityCb'
        }];
      }
    },
    hideSettings: true,
    data: String,
    external: Array,
    svg: Object
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  opacityCb: function() {
    this.parentG.selectAll('.dot')
      .style('opacity', this._getAreaObj('opacity').selectedValue);
  },

  draw: function() {
    let me = this;
    this.debounce('drawDebounce', () => {
      // reads x, y & z index
      let x = this.getInputsProperty('x');
      let y = this.getInputsProperty('y');
      let z = this.getInputsProperty('z');
      let group = this.getInputsProperty('s');

      // donot attempt to draw if x or y is empty
      if (x == null || y == null) {
        return false
      }

      // let xDomain = d3.extent(this.source, d => d[x]);
      // let yDomain = d3.extent(this.source, d => d[y]);

      // clears the chart's inner SVGs
      if (this.parentG) {
        this.parentG.html("");
      }

      // creating config
      let xObj = this.getInputsPropertyObj('x');
      let yObj = this.getInputsPropertyObj('y');
      let config = {
        stackIndex: undefined,
        chartType: 'group',
        containsHeader: false,
        xheader: [x],
        yOrign: 0,
        yheader: [y],
        width: this.chartWidth,
        height: this.chartHeight,
        xFormat: xObj.selectedObjs[0].type,
        yFormat: yObj.selectedObjs[0].type,
        xAlign: 'bottom',
        yAlign: 'left',
        xaxisType: 'ordinal',
        yaxisType: 'linear',
        parentG: this.parentG,
        forcetToZero: true
      };

      color = d3.scale.category10();

      // groping and creating axis
      let headers = this.externals.map(e => e.key);
      let myGroup = PolymerD3
        .groupingBehavior
        .group_by(
          [y], x, [y], headers, config.chartType
        );
      let nChartConfig = this.chartConfig(config, this.source, myGroup.process);

      // add the tooltip area to the webpage
      var tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

      let radiusScale;

      if (group) { // if grouped a linear scale is used to calculate radius of circle
        const radiusRange = [3.5, 10];
        const radiusDomain = me.source.map(row => row[group]);
        radiusScale = d3.scale.linear()
          .domain(radiusDomain)
          .range(radiusRange);
      } else { // radius is always 3 units
        radiusScale = () => 3;
      }

      function getRadius(row) {
        return radiusScale(row[group]);
      }
        // draw dots
        this.parentG.selectAll('.dot')
          .data(me.source)
          .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', getRadius)
          .attr('cx', (c)=>{
                return nChartConfig.getX(c[x]);
            })
          .attr('cy', (c)=>{
              return nChartConfig.getY(c[y]);
            })
          .style('fill', function(d) {
            return color(d[1]);
          });

    }, 500);
  }
});
