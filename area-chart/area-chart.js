Polymer({
    is: 'area-chart',

    properties: {
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'x',
                txt: 'Pick a dimension',
                selectedValue: 2,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Group',
                selectedValue: [0],
                uitype: 'multi-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'z',
                txt: 'Pick a dimension',
                selectedValue: 1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
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
        isStack: {
            value : true,
            type: Boolean
        },
        isArea: {
            value : false,
            type: Boolean
        }
    },

    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },
    attached: function() {
        me = this;
        this._loadSingleCol();
        //this._loadMultiCol();
    },

    _callme: function(data) {
        me.source = data;
    },

    _loadMultiCol: function(){
        PolymerD3.fileReader("ms.csv", [1, 2, 3], [0], "%Y%m%d", this._callme);
      this.inputs[0].selectedValue = 0;
      this.inputs[0].name = 'time';
      this.inputs[1].selectedValue  = [1,2,3];
      this.inputs[1].name = ['New York','San Francisco', 'Austin']; 
      this.layers = undefined;
    },
    _loadSingleCol: function(){
        PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._callme, true);
        this.inputs[0].selectedValue = 2;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },

    draw: function() {
        me = this;
        var xIndex = this.getInputsProperty('x');
        var yIndices = this.getInputsProperty('y');
        var zIndex = this.getInputsProperty('z');
        if (xIndex == -1 || yIndices.length == 0) {
            return;
        }
        var data = this.source;
        var stats = PolymerD3.summarizeData(data, 
            xIndex, 'time', yIndices, 'number', 
            me.isStack, zIndex);
        var xBound = stats.getXDomain();
        var yBound = stats.getYDomain();

        var config = {'scaleType':"time", 
        'align':'h', 'format':'time', 'position':'bottom','domain':xBound};
        var xAxis = me.createAxis(config);

        config = {'scaleType':"linear", 
        'align':'v', 'format':'currency', 'position':'left','domain':[0, yBound[1]]};
          var yAxis = me.createAxis(config);

//        y.domain([0, maxY]);
        var y = yAxis.scale();
        var x = xAxis.scale();        
        var z = d3.scale.category10();

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) {
                return x(d[xIndex]);
            });
        if(me.isStack){
            area.y0(function(d) {
                return y(d.y0);
            })
            .y1(function(d) {
                return y(d.y0 + d.y);
            });
        }else{
            area.y0(function(d) {
                return y(0);
            })
            .y1(function(d) {
                return y(d.y);
            });
        };
        var line = d3.svg.line().interpolate("basis")
          .x( (d) => { 
            return x(d[xIndex]);
             })
          .y( (d) => { 
            return (me.isStack)?y(d.y+d.y0):y(d.y); 
          });

        var display = (this.isArea)?area:line;
        if(! me.layers){
            if(yIndices.length == 1){
                me.layers = this._drawSingleColArea(x,y,z,xIndex,yIndices,zIndex, display);
            }else{
                me.layers = this._drawMultiColArea(x,y,z,xIndex,yIndices,zIndex, display);
            }
        }
        var pathClass;
        if(me.isArea){
          pathClass= (me.isStack)?
                "layer stack":
                "layer unstack";
        }
        else{
            pathClass = "line";
        }
        this.parentG.selectAll(".layer")
            .data(me.layers)
            .enter().append("path")
            .attr("class", pathClass)
            .attr("d", function(d) {
                return display(d.values);
            })
            .style("fill", function(d, i) {
                return (me.isArea)?z(i):'none';
            })
            .style("stroke", function(d, i) {
                return (! me.isArea)?z(i):'none';
            }) ;
    },
    _drawSingleColArea: function(x,y,z, xIndex, yIndices, zIndex, display){
        me = this;
        var data = this.source;

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d[xIndex];
            })
            .y(function(d) {
                return d[yIndices[0]];
            });

        var nest = d3.nest()
            .key(function(d) {
                return d[zIndex];
            });

        var groupBy = nest.entries(data);
        var layers = stack(groupBy);
        return layers;

    },
    _drawMultiColArea: function(x,y,z, xIndex, yIndices, zIndex){
        me = this;
        var data = this.source;

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d;
            })
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });

        //var groupBy = nest.entries(data);
        var ds = [];
        yIndices.forEach((d)=>{
            var temp = [];
            me.source.forEach((s)=>{
                temp.push( [ s[xIndex], s[d] ])
            });
            ds.push(temp);
        })
        
        var layers = stack(ds);
        return layers;
    }
});