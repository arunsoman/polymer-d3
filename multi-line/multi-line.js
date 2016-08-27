Polymer({
    is: 'multi-line',
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
                selectedObjs: [],
                name:'',
                scaleType: '',
                format:'',

            }, {
                input: 'y',
                txt: 'Pick y',
                selectedValue: [],
                uitype: 'multi-value',
                notify: true,
                selectedObjs: [],
                name:'',
                scaleType: '',
                format:'',
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: []
        },
        hideSettings: true,
        source: [],
        external: Array,
        svg: Object
    },

    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    attached: function() {
      var me = this;
      var callback = function(data) {
          me.source = data;
      }
      PolymerD3.fileReader("ms.csv", [1, 2, 3], [0], "%Y%m%d", callback);
      this.inputs[0].selectedValue = 0;
      this.inputs[0].name = 'time';
      this.inputs[1].selectedValue  = [1,2,3];
      this.inputs[1].name = ['New York','San Francisco', 'Austin'];

      this.external = [ {'key':"Time", 'value':0, 'scaleType':'time', 'format':'time'},
       {'key':"New York", 'value':1, 'scaleType':'linear', 'format':'number'},
       {'key':"San Francisco", 'value':2, 'scaleType':'linear', 'format':'number'},
       {'key':"Austin", 'value':3, 'scaleType':'linear', 'format':'number'}];

    },

    draw: function() {
      var me = this;
      var xIndex = me.getInputsProperty('x');
      var yIndex = me.getInputsProperty('y');
      if ( xIndex === -1 || yIndex.length === 0) {
        throw new Error('Inputs not selected');
      }
      var data = this.source;
      var dataStat = PolymerD3.summarizeData(data, 0, 'time', [1,2,3], 'number', false);
      var xBound = dataStat.getXDomain();
      var yBound = dataStat.getYDomain();

      var config = {'scaleType':"time", 
        'align':'h', 'format':'time', 'position':'bottom','domain':xBound};
      var xAxis = me.createAxis(config);
      var x = xAxis.scale();

      config = {'scaleType':"linear", 
        'align':'v', 'format':'currency', 'position':'left','domain':[0, yBound[1]]};
      var yAxis = me.createAxis(config);
      var y = yAxis.scale();

      var color = d3.scale.category10();
      //z = d3.scale.ordinal(d3.schemeCategory10);
      
      var dataStruct = PolymerD3.rollupMultiValued(
        this.inputs[1].selectedValue, 
        this.inputs[1].name,
        xIndex, data);

      var line = d3.svg.line().interpolate("basis")
          .x( (d) => { 
            return x(d.x);
             })
          .y( (d) => { 
            return y(d.y); 
          });

      var aGroup = this.parentG.selectAll(".groups")
          .data(dataStruct)
          .enter().append("g")
          .attr("class", "groups");

      aGroup.append("path")
          .attr("class", "line")
          .attr("d", (d) => { 
            return line(d.values); 
          })
          .style("stroke", (d) => { 
            return color(d.id); 
          });

      aGroup.append("text")
          .datum((d) => {
              return {
                  id: d.id,
                  value: d.values[d.values.length - 1]
              };
          })
          .attr("transform", (d) => {
              return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")";
          })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text((d) => {
              return d.id;
          });
    }
});
