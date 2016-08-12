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

  attached: function() {
        me = this;
        function callme(data) {
            me.source = data;
        }
        PolymerD3.fileReader('cereal.csv', [4,5], [], undefined, callme, true);
        this.inputs[0].selectedValue = 4; 
        this.inputs[1].selectedValue = 5;
        this.inputs[2].selectedValue = 1;
    },

  draw: function() {
    var me = this;

    if (me.getInputsProperty('x') === -1 
      || me.getInputsProperty('y') === -1 
      || me.getInputsProperty('z') === -1) {
      throw new Error('Input not selected');
    }
var x=  me.getInputsProperty('x');
      var y =  me.getInputsProperty('y') ; 
    var z = me.getInputsProperty('z');
    var xInput, yInput, zInput;

     var xDomain = d3.extent(me.source, (d) => {
                    return (d[x]);
                });
        var yDomain = d3.extent(me.source, (d) => {
                    return d[y];
                });

    var config = {'scaleType':"linear", 
        'align':'h', 'format':'number', 'position':'bottom','domain':xDomain};
    var xAxis = me.createAxis(config);
    var xScale = xAxis.scale();

    config = {'scaleType':"linear", 
        'align':'v', 'format':'number', 'position':'left','domain':[yDomain[1] , yDomain[0]]};
    var yAxis = me.createAxis(config);
    var yScale = yAxis.scale();
    
    color = d3.scale.category10();

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
      
      // draw dots
      this.parentG.selectAll(".dot")
        .data(me.source)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", (c)=>{
              return xScale(c[x]);
          })
        .attr("cy", (c)=>{
            return yScale(c[y]);
          })
        .style("fill", function(d) { 
          return color(d[1]);
        });
  }
});
