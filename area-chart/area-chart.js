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
                selectedObjs: [],
                uitype: 'single-value',
                tickFormat: 'Tabbrweekday'
            }, {
                input: 'y',
                txt: 'Group',
                selectedValue: [0],
                selectedObjs: [],
                uitype: 'multi-value',
                tickFormat: 'number'
            }, {
                input: 'z',
                txt: 'Pick a dimension',
                selectedValue: 1,
                selectedObjs: [],
                uitype: 'single-value',
                tickFormat: 'number'
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

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.chart = this.draw();
    },
    attached: function() {
        me = this;

        function callme(data) {
            me.source = data;
        }
        PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", callme);
    },

    draw: function() {
        var xIndex = this.getInputsProperty('x');
        var yIndices = this.getInputsProperty('y');
        var zIndex = this.getInputsProperty('z');
        if (xIndex == -1 || yIndices.length == 0) {
            return;
        }
        if (yIndices.length == 1) {
            this.drawStack(xIndex, yIndices, zIndex);
        }
    },
    drawStack: function(xIndex, yIndices, zIndex) {
        var data = this.source;
        var xBound = d3.extent(this.source, function(row) {
            return row[xIndex];
        });
         //Set X Axis at Bottom
        var xAxis = me.createAxis("linear", 'h', 'time', 'bottom');
          // Sets Y axis at right
          var yAxis = me.createAxis('linear','v', 'currency', 'left');

        var x = xAxis.scale().domain(xBound);
        this.applyTimeTickFormate(xAxis, xBound);
        var y = yAxis.scale();
        var groupYsum = d3.nest().key(function(d) {
            return d[yIndices[0]];
        }).rollup(function(d) {
            return d3.sum(d, function(g) {
                return g[zIndex];
            });
        }).entries(data);
        var maxY = d3.sum(groupYsum, function(g) {
            return g.values;
        });
        y.domain([0, maxY]);

        var z = d3.scale.category20c();

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d[xIndex];
            })
            .y(function(d) {
                return d[zIndex];
            });


        var nest = d3.nest()
            .key(function(d) {
                return d[yIndices];
            });

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) {
                return x(d[2]);
            })
            .y0(function(d) {
                return y(d.y0);
            })
            .y1(function(d) {
                return y(d.y0 + d.y);
            });

        var layers = stack(nest.entries(data));

        this.parentG.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) {
                return area(d.values);
            })
            .style("fill", function(d, i) {
                return z(i);
            });
    }
});