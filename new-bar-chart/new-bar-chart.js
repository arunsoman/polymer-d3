(function() {
    //State, Under 5 Years, 5 to 13 Years, 14 to 17 Years, 18 to 24 Years, 25 to 44 Years, 45 to 64 Years, 65 Years and Over
    Polymer({
        is: 'new-bar-chart',

        properties: {
            title: '',
            inputs: {
                notify: true,
                type: Array,
                value: () => {
                    return [{
                        input: 'x',
                        txt: 'Pick a dimension',
                        selectedValue: 0,
                        scaleType: '',
                        format: '',
                        selectedObjs: [{
                            key: 'state',
                            value: '0'
                        }],
                        uitype: 'single-value',
                        maxSelectableValues: 1
                    }, {
                        input: 'y',
                        txt: 'Pick measures',
                        selectedValue: [1, 2],
                        format: '',
                        scaleType: '',
                        selectedObjs: [{
                            key: 'Under Five Year',
                            value: '1'
                        }],
                        uitype: 'multi-value',
                        maxSelectableValues: 2
                    }, {
                        input: 'z',
                        txt: 'Pick z',
                        selectedValue: [1, 2],
                        format: '',
                        scaleType: '',
                        selectedObjs: [{
                            key: 'Under Five Year',
                            value: '1'
                        }],
                        uitype: 'multi-value',
                        maxSelectableValues: 2
                    }];
                }
            },
            settings: {
                notify: true,
                type: Object,
                value: () => {
                    return {};
                }
            },
            hideSettings: true,
            source: Array,
            external: Array,
            chart: Object,
            dataMutated: false,
            isStacked: {
                type: Boolean,
                value: true
            }
        },

        behaviors: [
            PolymerD3.chartBehavior
        ],

        attached: function() {
            this._loadWaterfall();
            //this._loadSingleCol();
                // PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
        },

        _setSource: function(data) {
            this.source = data;
        },
        _loadWaterfall: function() {
            PolymerD3.fileReader('waterfall.csv', [1], [], undefined, this._setSource.bind(this), true);
            this.inputs[0].selectedValue = 0;
            this.inputs[1].selectedValue = [1];
            this.inputs[2].selectedValue = 0;
            this.layers = undefined;
        },
        _loadSingleCol: function() {
            PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._setSource.bind(this), true);
            this.inputs[0].selectedValue = 2;
            this.inputs[1].selectedValue = [1];
            this.inputs[2].selectedValue = 0;
            this.layers = undefined;
        },
        draw: function() {
            let xIndex = this.getInputsProperty('x');
            let yIndices = this.getInputsProperty('y');
            let zGroup = this.getInputsProperty('z');
            let z = d3.scale.category10();
            let data = this.source;
            var me = this;

            // requireed indices not selected
            if (xIndex === -1 || !yIndices || yIndices.length < 1 || !data) {
                return false;
            }
/*
            var conf = {
                stackIndex: xIndex,
                chartType: 'stack', //stack,group,diff,waterfall
                containsHeader: true,
                xheader: [xIndex],
                yOrign: 0,
                yheader: yIndices,
                width: this.chartWidth,
                height: this.chartHeight,
                xFormat: 'time',
                yFormat: 'number',
                xAlign: 'bottom',
                yAlign: 'left',
                xaxisType: 'ordinal',
                yaxisType: 'linear',
                parentG: me.parentG
            };
 */
            var conf = {//for water fall load waterfall file
                stackIndex: xIndex,
                chartType: 'waterfall', //stack,group,diff,waterfall
                containsHeader: true,
                xheader: [xIndex],
                yOrign: 0,
                yheader: yIndices,
                width: this.chartWidth,
                height: this.chartHeight,
                xFormat: 'string',
                yFormat: 'number',
                xAlign: 'bottom',
                yAlign: 'left',
                xaxisType: 'ordinal',
                yaxisType: 'linear',
                parentG: me.parentG
            }; 
            var myGroup = group_by(yIndices.length == 1 ? [zGroup] : yIndices, xIndex, yIndices);
            var nChartConfig = chartConfig(conf, this.source, myGroup.process);
            var stackData = myGroup.getStack();

            var translate = null;
            var barWidth = null;
            var rectHeight = null;
            var rectY = null;
            var rectX = null;
            switch (conf.chartType) {
            case 'waterfall':
                var group = myGroup.getGroups();
                nChartConfig.setYDomain([0,group[group.length-1].values[0].y0]);
                nChartConfig.setXDomain('Total');
                stackData.push({key:'total', 
                  values:['total',stackData[stackData.length-1].values[0][1]], 
                  y:(stackData[stackData.length-1].values[0].y + stackData[stackData.length-1].values[0].y0), 
                  y0:0});
                translate = (d, i) => {
                    return 'translate(0,0)';
                };
                barWidth = (d, i) => {
                    return  nChartConfig.getBarWidth() - 1 ;
                };
                rectX = (d,i, j) => {
                    return j*( nChartConfig.getBarWidth() - 1 );
                };
                rectY = (d) => {
                  if( d.y  < 0){
                    return nChartConfig.getY(d.y0 ); 
                  }
                  return nChartConfig.getY(d.y0 + d.y);
                };
                rectHeight = (d)=> {
                  return nChartConfig.getBarHeight(( d.y <0)? -1*(d.y0 ):(d.y0 ) );
                };
                break;
            case 'stack':
                translate = (d, i) => {
                    return 'translate(0,0)';
                };
                barWidth = (d, i) => {
                    return  nChartConfig.getBarWidth() - 1 ;
                };
                rectX = (d) => {
                    return nChartConfig.getX(d[0]);
                };
                rectY = (d) => {
                    return nChartConfig.getY(d.y0 + d.y);
                };
                rectHeight = (d)=> {
                    return nChartConfig.getBarHeight(d.y);
                };
                break;
            case 'diff':
                translate = (d, i) => {
                    return 'translate(0,0)';
                };
                barWidth = (d, i) => {
                    return  nChartConfig.getBarWidth() - 1 ;
                };
                rectX = (d) => {
                    return nChartConfig.getX(d[0]);
                };
                rectY = (d) => {
                    return nChartConfig.getY(d[1]);
                };
                rectHeight = (d)=> {
                    return nChartConfig.getBarHeight(d[1]);
                }; 
                break;
            case 'group':
                translate = (d, i) => {
                    return 'translate(' + i * nChartConfig.getBarWidth() / stackData.length + ',0)';
                };
                barWidth = (d, i) => {
                    return  nChartConfig.getBarWidth() / stackData.length - 1;
                };
                rectX = (d) => {
                    return nChartConfig.getX(d[0]);
                };
                rectY = (d) => {
                    return nChartConfig.getY(d[1]);
                };
                rectHeight = (d)=> {
                    return nChartConfig.getBarHeight(d[1]);
                };
                break;
            default:
                throw Error("conf.chartType can have one among stack,group,diff");
            }

            let layer = this.parentG.selectAll('.layer')
                .data(stackData)
                .enter().append('g')
                .attr('transform', translate)
                .attr('class', 'layer')
                .style('fill', function(d, i) {
                    return z(i);
                });
            
            layer.selectAll('rect')
                .data(function(d) {
                    return d.values;
                })
                .enter().append('rect')
                .attr('x', rectX)
                .attr('y', rectY)
                .attr('height', rectHeight)
                .attr('width', barWidth);
        }
    });
})();