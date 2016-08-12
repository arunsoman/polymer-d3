Polymer({
    is: 'difference-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'x',
                txt: 'Pick a dimension',
                selectedValue: -1,
                selectedName: 'date',
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Pick measure 1',
                selectedValue: -1,
                selectedName: 'New York',
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'z',
                txt: 'Pick measure 2',
                selectedValue: -1,
                selectedName: 'San Francisco',
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
        source: {
            type: Array,
            value: [],
            notify: true
        },
        hideSettings: true,
        data: String,
        external: Array
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        // this.chart = this.draw();
    },
    attached: function() {
        me = this;

        function callme(data) {
            me.source = data;
        }
        PolymerD3.fileReader('data-diff-chart.csv', [1, 2], [0], "%Y%m%d", callme);
        // this.imputs[0].selectedValue = 0;
        // this.imputs[1].selectedValue = 1;
        // this.imputs[2].selectedValue = 2;
    },

    draw: function() {
        var me = this;
        var x0 = 0; //this.inputs[0].selectedValue;
        var y0 = 1; //this.inputs[1].selectedValue;
        var y1 = 2; //this.inputs[2].selectedValue;


        var dataSummary = d3.nest().rollup((k) => {
            //console.log(d);
            return {
                'xBound': d3.extent(k, (d) => {
                    return d[x0]
                }),
                'yMin': d3.min(k, (d) => {
                    return Math.min(d[y0], d[y1])
                }),
                'yMax': d3.max(k, (d) => {
                    return Math.max(d[y0], d[y1])
                })
            }
        }).entries(me.source);

        var config = {
            'scaleType': "time",
            'align': 'h',
            'format': 'time',
            'position': 'bottom',
            'domain': dataSummary.xBound
        };
        var xAxis = me.createAxis(config);
        var x = xAxis.scale();

        config = {
            'scaleType': "linear",
            'align': 'v',
            'format': 'currency',
            'position': 'left',
            'domain': [0, dataSummary.yMax]
        };
        var yAxis = me.createAxis(config);
        var y = yAxis.scale();

        var line = d3.svg.area()
            .interpolate("basis")
            .x((d) => {
                return x(d[x0]);
            })
            .y((d) => {
                return y(d[y1]);
            });

        var area = d3.svg.area()
            .interpolate("basis")
            .x((d) => {
                return x(d[x0]);
            })
            .y1((d) => {
                return y(d[y1]);
            });

        var cc = me.parentG.append('g');
        cc.datum(me.source);

        cc.append("clipPath")
            .attr("id", "clip-below")
            .append("path")
            .attr("d", area.y0(this.chartHeight));

        cc.append("clipPath")
            .attr("id", "clip-above")
            .append("path")
            .attr("d", area.y0(0));

        cc.append("path")
            .attr("class", "area above")
            .attr("clip-path", "url(#clip-above)")
            .attr("d", area.y0(function(d) {
                return y(d[2]);
            }));

        cc.append("path")
            .attr("class", "area below")
            .attr("clip-path", "url(#clip-below)")
            .attr("d", area);

        cc.append("path")
            .attr("class", "line")
            .attr("d", line);
        /*
                    me.parentG.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + this.chartHeight + ")")
                        .call(xAxis);

                    me.parentG.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Temperature (ºF)"); 
          */
    }

});