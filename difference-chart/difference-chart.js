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
                selectedValue: 0,
                selectedName: 'date',
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Pick measure 1',
                selectedValue: 0,
                selectedName: 'New York',
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'z',
                txt: 'Pick measure 2',
                selectedValue: 0,
                selectedName: 'San Francisco',
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

    draw: function() {
        var me = this;
        var xName = this.inputs[0].selectedName;
        var y1Name = this.inputs[1].selectedName;
        var y2Name = this.inputs[2].selectedName;

        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;

        var parseDate = d3.time.format("%Y%m%d").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.area()
            .interpolate("basis")
            .x(function(d) {
                return x(d[xName]);
            })
            .y(function(d) {
                return y(d[y1Name]);
            });

        var area = d3.svg.area()
            .interpolate("basis")
            .x(function(d) {
                return x(d[xName]);
            })
            .y1(function(d) {
                return y(d[y1Name]);
            });

        me.svg
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var data = me.source;
            if (data) {
               data.forEach(function(d) {
                d[xName] = parseDate(d[0]);
                d[y1Name] = +d[1];
                d[y2Name] = +d[2];
            });

            x.domain(d3.extent(data, function(d) {
                return d[xName];
            }));

            y.domain([
                d3.min(data, function(d) {
                    return Math.min(d[1], d[2]);
                }),
                d3.max(data, function(d) {
                    return Math.max(d[1], d[2]);
                })
            ]);

            me.svg.datum(data);

            me.svg.append("clipPath")
                .attr("id", "clip-below")
                .append("path")
                .attr("d", area.y0(height));

            me.svg.append("clipPath")
                .attr("id", "clip-above")
                .append("path")
                .attr("d", area.y0(0));

            me.svg.append("path")
                .attr("class", "area above")
                .attr("clip-path", "url(#clip-above)")
                .attr("d", area.y0(function(d) {
                    return y(d[2]);
                }));

            me.svg.append("path")
                .attr("class", "area below")
                .attr("clip-path", "url(#clip-below)")
                .attr("d", area);

            me.svg.append("path")
                .attr("class", "line")
                .attr("d", line);

            me.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            me.svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Temperature (ºF)"); 
            }
        // d3.tsv("data.tsv", function(error, data) {
        //     if (error) throw error;

        //     data.forEach(function(d) {
        //         d[xName] = parseDate(d[xName]);
        //         d[y1Name] = +d[y1Name];
        //         d[y2Name] = +d[y2Name];
        //     });

        //     x.domain(d3.extent(data, function(d) {
        //         return d[xName];
        //     }));

        //     y.domain([
        //         d3.min(data, function(d) {
        //             return Math.min(d[y1Name], d[y2Name]);
        //         }),
        //         d3.max(data, function(d) {
        //             return Math.max(d[y1Name], d[y2Name]);
        //         })
        //     ]);

        //     me.svg.datum(data);

        //     me.svg.append("clipPath")
        //         .attr("id", "clip-below")
        //         .append("path")
        //         .attr("d", area.y0(height));

        //     me.svg.append("clipPath")
        //         .attr("id", "clip-above")
        //         .append("path")
        //         .attr("d", area.y0(0));

        //     me.svg.append("path")
        //         .attr("class", "area above")
        //         .attr("clip-path", "url(#clip-above)")
        //         .attr("d", area.y0(function(d) {
        //             return y(d[y2Name]);
        //         }));

        //     me.svg.append("path")
        //         .attr("class", "area below")
        //         .attr("clip-path", "url(#clip-below)")
        //         .attr("d", area);

        //     me.svg.append("path")
        //         .attr("class", "line")
        //         .attr("d", line);

        //     me.svg.append("g")
        //         .attr("class", "x axis")
        //         .attr("transform", "translate(0," + height + ")")
        //         .call(xAxis);

        //     me.svg.append("g")
        //         .attr("class", "y axis")
        //         .call(yAxis)
        //         .append("text")
        //         .attr("transform", "rotate(-90)")
        //         .attr("y", 6)
        //         .attr("dy", ".71em")
        //         .style("text-anchor", "end")
        //         .text("Temperature (ºF)");
        // });

    }

});