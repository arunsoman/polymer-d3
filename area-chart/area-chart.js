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
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Group',
                selectedValue: [0],
                uitype: 'multi-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'z',
                txt: 'Pick a dimension',
                selectedValue: 1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
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
            value: true,
            type: Boolean
        },
        isArea: {
            value: true,
            type: Boolean
        },
        chartType:{
            value:'diff', // or 'area'
            type: String
        }
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],
    _toggleView: function() {
        "use strict";
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },
    attached: function() {
        "use strict";
        this._loadDiff();
        //this._loadSingleCol();
        //this._loadMultiCol();
    },
    _callme: function(data) {
        "use strict";
        this.source = data;
    },
    _loadMultiCol: function() {
        // Altered @param -> `callback`
        // For setting right value for `this`
        "use strict";
        PolymerD3.fileReader("ms.csv", [1, 2, 3], [0], "%Y%m%d", this._callme.bind(this));
        this.inputs[0].selectedValue = 0;
        this.inputs[0].name = 'time';
        this.inputs[1].selectedValue = [1, 2, 3];
        this.inputs[1].name = ['New York', 'San Francisco', 'Austin'];
        this.layers = undefined;
    },
    _loadSingleCol: function() {
        "use strict";
        PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._callme.bind(this), true);
        this.inputs[0].selectedValue = 2;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },
    _loadDiff: function() {
        "use strict";
        PolymerD3.fileReader('data-diff-chart.csv', [1,2], [0], "%Y%m%d", this._callme.bind(this), true);
        this.inputs[0].selectedValue = 0;
        this.inputs[1].selectedValue = [1,2];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },
    draw: function() {
        "use strict";
        var me = this;
        var xIndex = this.getInputsProperty('x');
        var yIndices = this.getInputsProperty('y');
        var zIndex = this.getInputsProperty('z');
        if (xIndex === -1 || yIndices.length === 0) {
            return;
        }
        var conf = {
            stackIndex: xIndex,
            containsHeader: true,
            xheader: [0],
            yheader: [1,2],
            width: this.chartWidth,
            height: this.chartHeight,
            xFormat: 'time',
            yOrigin:0,
            yFormat: 'number',
            xAlign: 'bottom',
            yAlign: 'left',
            xaxisType: 'time',
            yaxisType: 'linear',
            parentG: me.parentG
        };
        let myGroup = PolymerD3.groupingBehavior.group_by(yIndices.length === 1 ? 
            [zIndex] : yIndices, xIndex, yIndices, this.source[0]);
        let cc = PolymerD3.chartConfigBehavior.chartConfig(conf, this.source,
            myGroup.process);
        let stack = myGroup.getStack();
        var drawArea = ()=>{
            var z = d3.scale.category10();
            var pathClass;
            let getY0;
            let getY1;
            if(me.isStack){
                getY1 = (d)=> {
                    return cc.getY(d.y0 + d.y);};
                getY0 = (d)=> {
                    return cc.getY(d.y0);};
            }else{
                getY1 = (d)=> {
                    return cc.getY(d.y);};
                getY0 = ()=> {
                    return cc.getY(0);};
            }
            var area = d3.svg.area()
                .interpolate("cardinal")
                .x((d)=> {return cc.getX(d[0]);})
                .y0(getY0)
                .y1(getY1);

            var line = d3.svg.line().interpolate("basis")
                .x((d) => { return cc.getX(d[0]); } )
                .y((d) => { return cc.getY((me.isStack) ? (d.y + d.y0) : (d.y)); });
            
            var display = (this.isArea) ? area : line;
            if (me.isArea) {
                pathClass = (me.isStack) ?
                    "layer stack" :
                    "layer unstack";
            } else {
                pathClass = "line";
            }
            this.parentG.selectAll(".layer")
                .data(stack)
                .enter().append("path")
                .attr("class", pathClass)
                .attr("d", function(d) {
                    return display(d.values);
                })
                .style("fill", function(d, i) {
                    return (me.isArea) ? z(i) : 'none';
                })
                .style("stroke", function(d, i) {
                    return (!me.isArea) ? z(i) : 'none';
               });
        };
        var drawDiff=()=>{
            //http://jsfiddle.net/hrabinowitz/aZZSF/49/
            var stackUtil ={
                X:  (i)=>{return stack[0].values[i][0];},
                Y1: (i)=>{return stack[0].values[i][1];},
                Y2: (i)=>{return stack[1].values[i][1];},
            };
            var line1 = d3.svg.area()
                .interpolate("linear")
                .x(function(d,i) { return cc.getX(stackUtil.X(i)); })
                .y(function(d,i) { return cc.getY(stackUtil.Y1(i)); });

            var line2 = d3.svg.area()
                .interpolate("linear")
                .x(function(d,i) { return cc.getX(stackUtil.X(i)); })
                .y(function(d, i) { return cc.getY(stackUtil.Y2(i)); });

            var area = d3.svg.area()
                .interpolate("linear")
                .x(function(d,i) { return cc.getX(stackUtil.X(i)); })
                .y1(function(d,i) { return cc.getY(stackUtil.Y1(i)); });

            var renderDiff= ()=>{
              this.parentG.datum(stack[0].values);
              this.parentG.append("clipPath")
                  .attr("id", "clip-below")
                  .append("path")
                  .attr("d", area.y0(this.chartHeight));

              this.parentG.append("clipPath")
                  .attr("id", "clip-above")
                  .append("path")
                  .attr("d", area.y0(0));
              
              this.parentG.append("path")
                  .attr("class", "area above")
                  .attr("clip-path", "url(#clip-above)")
                  .attr("d", area.y0(function(d, i) {
                    return cc.getY(stackUtil.Y2(i)); }));
              this.parentG.append("path")
                  .attr("class", "area below")
                  .attr("clip-path", "url(#clip-below)")
                  .attr("d", area);
              this.parentG.append("path")
                  .attr("class", "line1")
                  .attr("d", line1);
              this.parentG.append("path")
                  .attr("class", "line2")
                  .attr("d", line2);
            };
            renderDiff();
        };
        if(this.chartType === 'diff'){
            drawDiff();
        }
        else{
            drawArea();
        }
    },

});