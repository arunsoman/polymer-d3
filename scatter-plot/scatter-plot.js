//https://bl.ocks.org/mbostock/3887118
Polymer({
  is: 'scatter-plot',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
          input: 'x',
          txt: 'Pick a x',
          selectedValue: -1,
          uitype: 'single-value',
          notify: true,
      }, {
          input: 'y',
          txt: 'Pick y',
          selectedValue: -1,
          uitype: 'single-value',
          notify: true
      }, {
          input: 'z',
          txt: 'Pick dimension',
          selectedValue: -1,
          uitype: 'single-value',
          notify: true
        }]
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
    var me = this;

    if (me.getInputsProperty('x') === -1 
      || me.getInputsProperty('y') === -1 
      || me.getInputsProperty('z') === -1) {
      throw new Error('Input not selected');
    }
    var margin = me.getMargins();
    var width = me.getWidth() - margin.left - margin.right;
    var height = me.getHeight() - margin.top - margin.bottom;

    //To create new chart wrap
    me.makeChartWrap();
    var svg = me.svg;

    // add the graph canvas to the body of the webpage
    PolymerD3.setSvgArea(svg, width, height, margin);

    var g = me.svg.select('g');

    var xInput, yInput, zInput;

    me.external.forEach(function (anExternal) {
      if(me.getInputsProperty('x') === anExternal.value) {
        xInput = anExternal.key;
      } else if (me.getInputsProperty('y') === anExternal.value) {
        yInput = anExternal.key;
      } else if (me.getInputsProperty('z') === anExternal.value) {
        zInput = anExternal.key;
      }
    });

    var xAxis = me.createAxis("linear", 'h', 'number', 'bottom', xInput);
    var yAxis = me.createAxis('linear','v', 'number', 'left', yInput);
    // setup x
    var xValue = function(d) {return d[xInput];}, // data -> value
      xScale = xAxis.scale().range([0, width]), // value -> display
      xMap = function(d) {
        return xScale(xValue(d));
      }; // data -> display

    // setup y
    var yValue = function(d) { return d[yInput]; }, // data -> value
      yScale = yAxis.scale().range([height,0]), // value -> display 
      yMap = function(d) {return yScale(yValue(d)); }; // data -> display

    // setup fill color
    var cValue = function(d) { return d[zInput];},
        color = d3.scale.category10();

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
      var xExtend = d3.extend(data, xValue);
      var yExtend = d3.extend(data, yValue);

      xScale.domain([xExtend[0]-1, xExtend[1]+1]);
      yScale.domain([yExtend[0]-1, yExtend[1]+1]);
   
      // draw dots
      g.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { 
          return color(cValue(d));
        });
  }
});
