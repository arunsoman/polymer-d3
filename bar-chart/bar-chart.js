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
                input: 'height',
                txt: 'Height of the chart',
                uitype: 'Number',
                selectedValue: 500,
                notify: true,
                observer: '_areaChanged'
            }, {
                input: 'width',
                txt: 'Width of the chart',
                uitype: 'Number',
                selectedValue: 960,
                notify: true,
                observer: '_areaChanged'
            }, {
                input: 'marginTop',
                txt: 'Top  margin',
                uitype: 'Number',
                selectedValue: 40,
                notify: true,
                observer: '_marginChanged'
            }, {
                input: 'marginRight',
                txt: 'Right margin',
                uitype: 'Number',
                selectedValue: 10,
                notify: true,
                observer: '_marginChanged'
            }, {
                input: 'marginBottom',
                txt: 'Bottom margin',
                uitype: 'Number',
                selectedValue: 20,
                notify: true,
                observer: '_marginChanged'
            }, {
                input: 'marginLeft',
                txt: 'Left margin',
                uitype: 'Number',
                selectedValue: 10,
                notify: true,
                observer: '_marginChanged'
            },{
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
        chart: Object,
        svg:Object
    },
    _getMargin: function() {
        return {
            top: this.settings[2].selectedValue,
            right: this.settings[3].selectedValue,
            bottom: this.settings[4].selectedValue,
            left: this.settings[5].selectedValue
        }
    },
    _getHeight() {
        return this.settings[0].selectedValue;
    },
    _getWidth() {
        return this.settings[1].selectedValue;
    },
    _colorRangeChanged: function() {
        this.chart = this.draw();
    },
    _areaChanged: function() {
        this.chart = this.draw();
    },
    _marginChanged: function() {
        this.chart = this.draw();
    },
    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },
    attached: function() {
        this.svg = d3.select('#barChart').append("svg");
        this._addToolTip();
    },
    _addToolTip(){
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
          .html(function(d) {
            return "<strong>Frequency:</strong> <span style='color:red'>"  + "</span>";
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

        var margin = this._getMargin();
        var width = this._getWidth() - margin.left - margin.right;
        var height = this._getHeight() - margin.top - margin.bottom;

        var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangeRoundBands([0, width], .08);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([height, 0]);

        var color = d3.scale.linear()
            .domain([0, n - 1])
            .range([this.settings[6].to, this.settings[6].from]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");
        //this.$.barChart.innerHTML = '';
        this.svg .attr("width", width + margin.left + margin.right)
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

        var rect = layer.

        selectAll("rect")
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
            this.chart['transitionStacked']();;
        }
    }

});