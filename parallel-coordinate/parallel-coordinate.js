Polymer({
    is: 'parallel-coordinate',
    properties: {
        title: '',
        data: String,
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'sliceSize',
                txt: 'Pick a messure',
                selectedValue: Array,
                selectedName: Array,
                uitype: 'multiple-value'
            }]
        },
        settings: {
            type: Array,
            value: []
        },
        hideSettings: true
    },
    behaviors: [
        PolymerD3.chartBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.draw();
    },
    draw: function() {
        var me = this;
        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;

        var x = d3.scale.ordinal().rangePoints([0, width], 1),
            y = {},
            dragging = {};

        var line = d3.svg.line(),
            axis = d3.svg.axis().orient("left"),
            background,
            foreground;

        me.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("cars.csv", function(error, cars) {

            // Extract the list of dimensions and create a scale for each.
            x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
                return d != "name" && (y[d] = d3.scale.linear()
                    .domain(d3.extent(cars, function(p) {
                        return +p[d];
                    }))
                    .range([height, 0]));
            }));

            // Add grey background lines for context.
            background = me.svg.append("g")
                .attr("class", "background")
                .selectAll("path")
                .data(cars)
                .enter().append("path")
                .attr("d", this.path);

            // Add blue foreground lines for focus.
            foreground = me.svg.append("g")
                .attr("class", "foreground")
                .selectAll("path")
                .data(cars)
                .enter().append("path")
                .attr("d", this.path);

            // Add a group element for each dimension.
            var g = me.svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function(d) {
                    return "translate(" + x(d) + ")";
                })
                .call(d3.behavior.drag()
                    .origin(function(d) {
                        return {
                            x: x(d)
                        };
                    })
                    .on("dragstart", function(d) {
                        dragging[d] = x(d);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function(d) {
                        dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                        foreground.attr("d", this.path);
                        dimensions.sort(function(a, b) {
                            return this.position(a) - this.position(b);
                        });
                        x.domain(dimensions);
                        g.attr("transform", function(d) {
                            return "translate(" + this.position(d) + ")";
                        })
                    })
                    .on("dragend", function(d) {
                        delete dragging[d];
                        this.transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                        this.transition(foreground).attr("d", this.path);
                        background
                            .attr("d", this.path)
                            .this.transition()
                            .delay(500)
                            .duration(0)
                            .attr("visibility", null);
                    }));

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function(d) {
                    d3.select(this).call(axis.scale(y[d]));
                })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function(d) {
                    return d;
                });

            // Add and store a brush for each axis.
            g.append("g")
                .attr("class", "brush")
                .each(function(d) {
                    d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", this.brushstart).on("brush", this.brush));
                })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);
        });

        position = function(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    };

    transition= function(g) {
        return g.transition().duration(500);
    };

    // Returns the path for a given data point.
    path=function(d) {
        return line(dimensions.map(function(p) {
            return [this.position(p), y[p](d[p])];
        }));
    };

    brushstart= function() {
        d3.event.sourceEvent.stopPropagation();
    };

    // Handles a brush event, toggling the display of foreground lines.
    brush= function() {
        var actives = dimensions.filter(function(p) {
                return !y[p].brush.empty();
            }),
            extents = actives.map(function(p) {
                return y[p].brush.extent();
            });
        foreground.style("display", function(d) {
            return actives.every(function(p, i) {
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
        });
    };
    }
    
});