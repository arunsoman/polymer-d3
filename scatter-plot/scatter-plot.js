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

    // setup x
    var xValue = function(d) {
        return d[xInput];
      }, // data -> value
      xScale = d3
        .scale
        .linear()
        .range([0, width]), // value -> display
      xAxis = PolymerD3.axis('number')
        .scale(xScale)
        .orient("bottom"),
      xMap = function(d) {
        return xScale(xValue(d));
      }; // data -> display

    // setup y
    var yValue = function(d) { 
      return d[yInput];
      }, // data -> value
      yScale = d3.scale
        .linear()
        .range([height,0]), // value -> display
      yAxis = PolymerD3
        .axis('number')
        .scale(yScale)
        .orient("left"),
      yMap = function(d) {
        return yScale(yValue(d));
      }; // data -> display

    // setup fill color
    var cValue = function(d) { return d[zInput];},
        color = d3.scale.category10();

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // load data
    d3.csv("cereal.csv", function(error, data) {

      // change string (from CSV) into number format
      data.forEach(function(d) {
        d.Calories = +d.Calories;
        d["Protein (g)"] = +d["Protein (g)"];
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      g.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text(xInput);

      // y-axis
      g.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yInput);

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

      // draw legend
      var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { 
          return "translate(0," + i * 20 + ")"; 
        });

      // draw legend colored rectangles
      legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

      // draw legend text
      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { 
          return d;
        })
      });

  }
});
