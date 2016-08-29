Polymer({
    is: 'bar-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: () => {
                "use strict";
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
                    displayName:'myXAxis',
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
                    displayName:'myYAxis',
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
                    displayName:'myZAxis',
                    maxSelectableValues: 2
                }];
            }
        },
        settings: {
            notify: true,
            type: Object,
            value: () => {
                "use strict";
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
        "use strict";
        this._loadDiffdata();
        //  this._loadHeatmap();
        //this._loadWaterfall();
        //this._loadSingleCol();
            // PolymerD3.fileReader('bar-data.csv', [1, 2, 3, 4, 5, 6, 7], [], undefined, this._setSource.bind(this));
    },

    _setSource: function(data) {
        "use strict";
        this.source = data;
    },
    _loadDiffdata: function() {
        "use strict";
        PolymerD3.fileReader('diff-small.csv', [1,2], [0], '%Y%m%d', this._setSource.bind(this), true);
        this.inputs[0].selectedValue = 0;
        this.inputs[1].selectedValue = [1,2];
        //this.inputs[2].selectedValue = 2;
        this.layers = undefined;
    },
    _loadHeatmap: function() {
        "use strict";
        PolymerD3.fileReader('heatmap.csv', [2], [0], '%Y-%m-%d', this._setSource.bind(this), true);
        this.inputs[0].selectedValue = 0;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 2;
        this.layers = undefined;
    },
    _loadWaterfall: function() {
        "use strict";
        PolymerD3.fileReader('waterfall.csv', [1], [], undefined, this._setSource.bind(this), true);
        this.inputs[0].selectedValue = 0;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },
    _loadSingleCol: function() {
        "use strict";
        PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._setSource.bind(this), true);
        this.inputs[0].selectedValue = 2;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },
    draw: function() {
        "use strict";
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

        var conf = {//for water fall load waterfall file
            stackIndex: xIndex,
            chartType: 'waterfall', //stack,group,diff,waterfall,heatmap
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
        
        var conf = {//for heatmap 
            stackIndex: xIndex,
            chartType: 'heatmap', //stack,group,diff,waterfall,heatmap
            containsHeader: true,
            xheader: [xIndex],
            yOrign: 0,
            yheader: yIndices,
            width: this.chartWidth,
            height: this.chartHeight,
            xFormat: 'time',
            yFormat: 'string',
            xAlign: 'bottom',
            yAlign: 'left',
            xaxisType: 'ordinal',
            yaxisType: 'ordinal',
            parentG: me.parentG
        };
        */
        var conf = {//for diff 
            stackIndex: xIndex,
            chartType: 'diff', //stack,group,diff,waterfall,heatmap
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


        var myGroup = PolymerD3.groupingBehavior.group_by(yIndices.length === 1 ? [zGroup] : yIndices, xIndex, yIndices, this.source[0]);
        var nChartConfig = PolymerD3.chartConfigBehavior.chartConfig(conf, this.source, myGroup.process);
        let stackData = myGroup.getStack();

        var translate = null;
        var barWidth = null;
        var rectHeight = null;
        var rectY = null;
        var rectX = null;
        var classF = null;
        var htmlCallback;
        var legendF = null;
        htmlCallback = (d) =>{
                var str = '<table>'+
                '<tr>'+
                '<td>'+this.inputs[0].displayName+':</td>'+
                '<td>'+nChartConfig.formatX(d[0])+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>'+this.inputs[1].displayName+':</td>'+
                '<td>'+nChartConfig.formatY(d[1])+'</td>'+
                '</tr>'+
                '</table>';
                return str;
            };
        switch (conf.chartType) {
        case 'heatmap':
            htmlCallback = (d, i, j) =>{
                var str = '<table>'+
                '<tr>'+
                '<td>'+this.inputs[0].displayName+':</td>'+
                '<td>'+nChartConfig.formatX(d[0])+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>'+this.inputs[1].displayName+':</td>'+
                '<td>'+nChartConfig.formatY(d[1])+'</td>'+
                '</tr>'+
                '<tr>'+
                '<td>'+this.inputs[1].displayName+':</td>'+
                '<td>'+nChartConfig.formatY(stackData[j].key)+'</td>'+
                '</tr>'+
                '</table>';
                return str;
            };
            translate = () => {
                return 'translate(0,0)';
            };
            barWidth = () => {
                return  nChartConfig.getBarWidth() - 1 ;
            };
            rectX = (d) => {
                return nChartConfig.getX(d[0]);
            };
            rectY = (d) => {
                return nChartConfig.getY( d.y);
            };
            rectHeight = ()=> {
                return nChartConfig.getBarHeight();
            };
        break;
        case 'waterfall':
            var group = myGroup.getGroups();
            nChartConfig.setYDomain([0,group[group.length-1].values[0].y0]);
            nChartConfig.setXDomain('Total');

            // To replicate each element in stackData
            let total = {
                key: 'total',
                values: [['total',stackData[stackData.length-1].values[0][1]]]
            };
            total.values[0].y = (stackData[stackData.length-1].values[0].y + stackData[stackData.length-1].values[0].y0);
            total.values[0].y0 = 0;
            stackData.push(total);
            // Replication - end

            translate = () => {
                return 'translate(0,0)';
            };
            barWidth = () => {
                return  nChartConfig.getBarWidth() - 1 ;
            };
            rectX = (d,i, j) => {
                return j*( nChartConfig.getBarWidth() - 1 );
            };
            rectY = (d) => {
              if( d.y  < 0){
                return nChartConfig.getY(d.y0);
              }
              return nChartConfig.getY(d.y + d.y0);
            };
            rectHeight = (d)=> {
              return nChartConfig.getBarHeight(( d.y < 0)? -1*(d.y): (d.y));
            };
            legendF = (d,i,j)=>{
                console.log('d:'+d+' i:'+i + ' j:'+ j);
                return d[0];
            };
        break;
        case 'stack':
            translate = () => {
                return 'translate(0,0)';
            };
            barWidth = () => {
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
            legendF = (d,i,j)=>{
                console.log('d:'+d+' i:'+i + ' j:'+ j);
            };
        break;
        case 'diff':
            translate = () => {
                return 'translate(0,0)';
            };
            barWidth = (d, i, j) => {
                return (j === 1)? (nChartConfig.getBarWidth()/2 - 1):
                (nChartConfig.getBarWidth() - 1) ;
            };
            rectX = (d, i, j) => {
                return (j === 0)? nChartConfig.getX(d[0]):
                nChartConfig.getX(d[0])+nChartConfig.getBarWidth()/4 ;
            };
            rectY = (d) => {
                return nChartConfig.getY(d[1]);
            };
            rectHeight = (d)=> {
                return nChartConfig.getBarHeight(d[1]);
            };
            classF = (d, i, j) => {
                return (j === 0)?'diff1':
                'diff2' ;
            };
            legendF = (d,i,j)=>{
                console.log('d:'+d+' i:'+i + ' j:'+ j+ ' stackData:' + stackData[j].key);
                return d[0];
            };
        break;
        case 'group':
            translate = (d, i) => {
                return 'translate(' + i * nChartConfig.getBarWidth() / stackData.length + ',0)';
            };
            barWidth = () => {
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
            legendF = (d,i,j)=>{
                console.log('d:'+d+' i:'+i + ' j:'+ j);
            };
        break;
        default:
            throw Error('conf.chartType can have one among stack,group,diff');
        }

        let layer = this.parentG.selectAll('.layer')
            .data(stackData)
            .enter().append('g')
            .attr('transform', translate)
            .attr('class', 'layer')
            .style('fill', function(d, i) {
                return z(i);
            });
        this.attachLegend(this.parentG);

        var rects = layer.selectAll('rect')
            .data(function(d) {
                return d.values;
            })
            .enter().append('rect')
            .attr('x', rectX)
            .attr('y', rectY)
            .attr('height', rectHeight)
            .attr('width', barWidth)
            .attr("data-legend",legendF)
            .attr('class', classF);

        this.attachToolTip(this.parentG, rects, 'vertalBars' ,htmlCallback);

        if(conf.chartType === 'heatmap'){
          var color =d3.scale.linear()
            .domain(d3.extent(stackData.map((aobj)=>{return aobj.key;})))
            .range(["white", "red"])
            .interpolate(d3.interpolateLab);
          rects.style('fill', (d, i, j) => {
            return color(stackData[j].key);
            });
        }
    }
});
