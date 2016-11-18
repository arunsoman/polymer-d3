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
          txt: 'Pick dimension',
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
      notify: true,
      type: Array,
      value: []
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

  draw: function() {
    let me = this;
    this.debounce('drawDebounce', () => {
      // reads x, y & z index
      let x = this.getInputsProperty('x');
      let y = this.getInputsProperty('y');
      let z = this.getInputsProperty('z');

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

        // draw dots
        this.parentG.selectAll('.dot')
          .data(me.source)
          .enter().append('circle')
          .attr('class', 'dot')
          .attr('r', 3.5)
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
