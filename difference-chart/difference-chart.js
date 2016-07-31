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
                notify: true,
            }, {
                input: 'y',
                txt: 'Pick measure 1',
                selectedValue: 0,
                selectedName: 'New York',
                uitype: 'single-value',
                notify: true
            }, {
                input: 'z',
                txt: 'Pick measure 2',
                selectedValue: 0,
                selectedName: 'San Francisco',
                uitype: 'single-value',
                notify: true
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
            }, {
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
        svg: Object 
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
        svg = d3.select("#chartHolder").append("svg");
    },

    draw: function() {
        var me = this ;
        var xName = this.inputs[0].selectedName;
        var y1Name = this.inputs[1].selectedName;
        var y2Name = this.inputs[2].selectedName;

        console.log(this.inputs[0].selectedValue);
        console.log(this.inputs[0].selectedName);
        console.log(this.inputs[1].selectedValue);
        console.log(this.inputs[1].selectedName);
        console.log(this.inputs[2].selectedValue);
        console.log(this.inputs[2].selectedName);

        var margin = this._getMargin();
        var width = this._getWidth() - margin.left - margin.right;
        var height = this._getHeight() - margin.top - margin.bottom;

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

        svg 
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.tsv("data.tsv", function(error, data) {
            if (error) throw error;

            data.forEach(function(d) {
                d[xName] = parseDate(d[xName]);
                d[y1Name] = +d[y1Name];
                d[y2Name] = +d[y2Name];
            });

            x.domain(d3.extent(data, function(d) {
                return d[xName];
            }));

            y.domain([
                d3.min(data, function(d) {
                    return Math.min(d[y1Name], d[y2Name]);
                }),
                d3.max(data, function(d) {
                    return Math.max(d[y1Name], d[y2Name]);
                })
            ]);

            svg.datum(data);

            svg.append("clipPath")
                .attr("id", "clip-below")
                .append("path")
                .attr("d", area.y0(height));

            svg.append("clipPath")
                .attr("id", "clip-above")
                .append("path")
                .attr("d", area.y0(0));

            svg.append("path")
                .attr("class", "area above")
                .attr("clip-path", "url(#clip-above)")
                .attr("d", area.y0(function(d) {
                    return y(d[y2Name]);
                }));

            svg.append("path")
                .attr("class", "area below")
                .attr("clip-path", "url(#clip-below)")
                .attr("d", area);

            svg.append("path")
                .attr("class", "line")
                .attr("d", line);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Temperature (ºF)");
        });

    }

});