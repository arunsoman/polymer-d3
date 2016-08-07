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
                selectedValue: 0,
                uitype: 'single-value',
                notify: true,
            }, {
                input: 'y',
                txt: 'Pick y',
                selectedValue: [1, 2, 3],
                uitype: 'multi-value',
                notify: true
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
            me.draw();
        }
        PolymerD3.fileReader("ms.csv", [1, 2, 3], [0], "%Y%m%d", callback);
    },
    draw: function() {
        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;
        var svg = this.svg;
        PolymerD3.setSvgArea (svg, width, height, margin);
        this.makeChartWrap();
        
 
        //var parseTime = d3.timeParse("%Y%m%d");
        var xAxis = PolymerD3.axis('time', 'Tabbrmonth');
        var yAxis = PolymerD3.axis('number').orient("left");
        var x = xAxis.scale().range([0, width]),
            y = yAxis.scale().range([height, 0]),
            color = d3.scale.category10();
        //z = d3.scale.ordinal(d3.schemeCategory10);

        var line = d3.svg.line().interpolate("basis")
            .x(function(d) {
                return x(d[0]);
            })
            .y(function(d) {
                return y(d[1]);
            });

        var data = this.source;

//load this from input
        var yHeaders = [
            ["New York", 1],
            ["San Francisco", 2],
            ["Austin", 3]
        ];
        //load this from input
        var xHeader = ['date', 0];
        
        var cities = yHeaders.map(function(aRow) {
            return {
                id: aRow[0],
                values: function() {
                    var tArray = []
                    data.map(function(d) {
                        tArray.push([d[xHeader[1]], d[aRow[1]]]);
                    });
                    return tArray;
                }()
            };
        });

        x.domain(d3.extent(data, function(d) {
            return d[xHeader[1]];
        }));

        y.domain([
            d3.min(cities, function(c) {
                return d3.min(c.values, function(d) {
                    return d[1];
                });
            }),
            d3.max(cities, function(c) {
                return d3.max(c.values, function(d) {
                    return d[1];
                });
            })
        ]);

        color.domain(cities.map(function(c) {
            return c.id;
        }));

       svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

       svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .text("Temperature, ºF");

        var city =svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function(d) {
                return line(d.values);
            })
            .style("stroke", function(d) {
                return color(d.id);
            });

        city.append("text")
            .datum(function(d) {
                return {
                    id: d.id,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("transform", function(d) {
                return "translate(" + x(d.value[0]) + "," + y(d.value[1]) + ")";
            })
            .attr("x", 3)
            .attr("dy", "0.35em")
            .style("font", "10px sans-serif")
            .text(function(d) {
                return d.id;
            });
    }
});