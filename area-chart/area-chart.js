Polymer({
    is: 'area-chart',
    properties: {
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'x',
                txt: 'Pick a dimension',
                selectedValue: [],
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Group',
                selectedValue: [],
                uitype: 'multi-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 4
            }, /* {
                input: 'z',
                txt: 'Pick a dimension',
                selectedValue: 1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            } */]
        },
        settings: {
            notify: true,
            type: Object,
            value: () => {
                return [];
            }
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
            value:'area', // or 'diff'
            type: String
        }
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.chartConfigCbBehavior
    ],
    draw: function() {
        var me = this;
        this.debounce('darwDebounce', () => {
            var xIndex = this.getInputsProperty('x');
            var yIndices = this.getInputsProperty('y');
            if (xIndex === -1 || !yIndices || yIndices.length < 1 || !this.source || this.source.length < 1 ) {
                return false;
            }
            if (this.parentG) {
                this.parentG.html('');
            }
            let xObj = this.getInputsPropertyObj('x');
            let yObj = this.getInputsPropertyObj('y');
            let z = this.setLegendColor.bind(this);
            var conf = {
                stackIndex: xIndex,
                containsHeader: false,
                forcetToZero: true,
                xheader: [this.getInputsProperty('x')],
                yheader: this.getInputsProperty('y'),
                width: this.chartWidth,
                height: this.chartHeight,
                yOrigin:0,
                xFormat: xObj.selectedObjs[0].type,
                yFormat: yObj.selectedObjs[0].type,
                xAlign: 'bottom',
                yAlign: 'left',
                xaxisType: 'ordinal',
                yaxisType: 'linear',
                parentG: me.parentG
            };
            let myGroup = PolymerD3.groupingBehavior.group_by(yIndices.length === 1 ?
                [yIndices] : yIndices, xIndex, yIndices, this.source[0]);
            let cc = this.chartConfig(conf, this.source, myGroup.process);
            let stack = myGroup.getStack();
            var drawArea = ()=>{
                var z = d3.scale.category10();
                var pathClass;
                let getY0;
                let getY1;
                if(me.isStack) {
                    // Syntax for shorter arrow functions
                    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions#Shorter_functions
                    getY1 = d => cc.getY(d.y0 + d.y);
                    getY0 = d => cc.getY(d.y0);
                } else {
                    getY1 = d => cc.getY(d.y);
                    getY0 = ()=> cc.getY(0);
                }
                var area = d3.svg.area()
                    .interpolate("cardinal")
                    .x(d => cc.getX(d[0]))
                    .y0(getY0)
                    .y1(getY1);

                var line = d3.svg.line().interpolate("basis")
                    .x(d => cc.getX(d[0]))
                    .y(d => cc.getY((me.isStack) ? (d.y + d.y0) : (d.y)));

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
                    .attr("d", d => display(d.values))
                    .style("fill", (d, i) => {
                        let color = z(d);
                        let keyPresent = false;
                        me.legendSettings.colors.forEach(c => {
                            if (c.label == d.key) {
                                color = c.color;
                                keyPresent = true;
                            }
                        });
                        if (!keyPresent && d.key) {
                            me.legendSettings.colors.push({
                                color: color,
                                label: d.key
                            });
                        }
                        return color;
                    })
                    .attr('data-legend', function(d) {
                        return d.key;
                    })
                    .attr('class', 'stroked-elem')
                    .attr('transform', 'translate(' + (cc.getBarWidth() / 2) + ',' + 0 + ')');
                    // .style("stroke", (d, i) => (!me.isArea) ? z(i) : 'none');
            };
            var drawDiff=()=>{
                //http://jsfiddle.net/hrabinowitz/aZZSF/49/
                var stackUtil ={
                    X:  i => stack[0].values[i][0],
                    Y1: i => stack[0].values[i][1],
                    Y2: i => stack[1].values[i][1],
                };
                var line1 = d3.svg.area()
                    .interpolate("linear")
                    .x((d, i) => cc.getX(stackUtil.X(i)))
                    .y((d, i) => cc.getY(stackUtil.Y1(i)));

                var line2 = d3.svg.area()
                    .interpolate("linear")
                    .x((d, i) => cc.getX(stackUtil.X(i)))
                    .y((d, i) => cc.getY(stackUtil.Y2(i)));

                var area = d3.svg.area()
                    .interpolate("linear")
                    .x((d, i) => cc.getX(stackUtil.X(i)))
                    .y1((d, i) => cc.getY(stackUtil.Y1(i)));

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
            } else {
                drawArea();
            }
            this.attachLegend(this.parentG);
        }, 500);
    },
    strokeWidthCb: function() {
        let stroke = this.getAreaProperty('strokeWidth');
        let strokedElems = this.querySelectorAll('.stroked-elem');
        [].forEach.call(strokedElems, se => {
            se.style['stroke-width'] = stroke ? stroke.selectedValue + 'px' : 0;
        });
    }
});
