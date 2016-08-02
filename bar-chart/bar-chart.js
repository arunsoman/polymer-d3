Polymer({
    is: 'bar-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'x',
                txt: 'Pick a dimension',
                selectedValue: 0,
                selectedName: 'label',
                uitype: 'single-value'
            }, {
                input: 'y',
                txt: 'Pick measures',
                selectedValue: [],
                selectedName: [],
                uitype: 'multi-value'
            }, {
                input: 'chartType',
                txt: 'Grouped or stacked',
                uitype: 'dropDown',
                selectedValue: 0,
                selectedName: 'Grouped',
                observer: '_chartTypehanged',
                options: [{
                    key: 'Grouped',
                    value: 0
                }, {
                    key: 'Stacked',
                    value: 1
                }]
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: [{
                input: 'colorRange',
                txt: 'Color range',
                uitype: 'colorRangePicker',
                from: "#aad",
                to: "#556",
                notify: true,
                observer: '_colorRangeChanged'
            }]
        },
        hideSettings: true,
        data: String,
        external: Array,
        chart: Object
    },
    behaviors: [
        PolymerD3.sizing,
        PolymerD3.propertiesBehavior,
        PolymerD3.chartconfigObserver,
        PolymerD3.chartBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
    },

    _addToolTip: function() {
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + "</span>";
            });
        this.svg.call(tip);
        this.svg.on('mouseover', tip.show)
            .on('mouseout', tip.hide)

    },
    draw: function() {
        var n = 4, // number of layers
            m = 58, // number of samples per layer
            stack = d3.layout.stack(),
            layers = stack(d3.range(n).map(function() {
                return bumpLayer(m, .1);
            })),
            yGroupMax = d3.max(layers, function(layer) {
                return d3.max(layer, function(d) {
                    return d.y;
                });
            }),
            yStackMax = d3.max(layers, function(layer) {
                return d3.max(layer, function(d) {
                    return d.y0 + d.y;
                });
            });

        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangeRoundBands([0, width], .08);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([height, 0]);

        var color = d3.scale.linear()
            .domain([0, n - 1])
            .range([this.getSettingsPropertyObj('colorRange').to, this.getSettingsPropertyObj('colorRange').from]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");

        this.makeChartWrap();

        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var layer = this.svg.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) {
                return color(i);
            });

        var rect = layer.selectAll("rect")
            .data(function(d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function(d) {
                return x(d.x);
            })
            .attr("y", height)
            .attr("width", x.rangeBand())
            .attr("height", 0);

        rect.transition()
            .delay(function(d, i) {
                return i * 10;
            })
            .attr("y", function(d) {
                return y(d.y0 + d.y);
            })
            .attr("height", function(d) {
                if(y(d.y0) - y(d.y0 + d.y) < 0 ){
                    throw new Error("height for chart can't be negative", 'bar-chart.rect.transition(');
                }
                return y(d.y0) - y(d.y0 + d.y);
            });
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        function transitionGrouped() {
            y.domain([0, yGroupMax]);

            rect.transition()
                .duration(500)
                .delay(function(d, i) {
                    return i * 10;
                })
                .attr("x", function(d, i, j) {
                    return x(d.x) + x.rangeBand() / n * j;
                })
                .attr("width", x.rangeBand() / n)
                .transition()
                .attr("y", function(d) {
                    return y(d.y);
                })
                .attr("height", function(d) {
                    if(y(d.y0) - y(d.y0 + d.y) < 0 ){
                        throw new Error("height for chart can't be negative", 'bar-chart.transitionGrouped');
                    }
                    return height - y(d.y);
                });
        };

        function transitionStacked() {
            y.domain([0, yStackMax]);

            rect.transition()
                .duration(500)
                .delay(function(d, i) {
                    return i * 10;
                })
                .attr("y", function(d) {
                    return y(d.y0 + d.y);
                })
                .attr("height", function(d) {
                    if(y(d.y0) - y(d.y0 + d.y) < 0 ){
                        throw new Error("height for chart can't be negative", 'bar-chart.transitionStacked');
                    }
                    return y(d.y0) - y(d.y0 + d.y);
                })
                .transition()
                .attr("x", function(d) {
                    return x(d.x);
                })
                .attr("width", x.rangeBand());
        };
        // Inspired by Lee Byron's test data generator.
        function bumpLayer(n, o) {

            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }

            var a = [],
                i;
            for (i = 0; i < n; ++i) a[i] = o + o * Math.random();
            for (i = 0; i < 5; ++i) bump(a);
            return a.map(function(d, i) {
                return {
                    x: i,
                    y: Math.max(0, d)
                };
            });
        };
        return [transitionStacked, transitionGrouped];

    },

    _chartTypehanged: function() {
        if (his.settings[0].selectedValue === "Grouped") {
            this.chart['transitionGrouped']();
        } else {
            this.chart['transitionStacked']();
        }
    },

});
