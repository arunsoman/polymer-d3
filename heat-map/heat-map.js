Polymer({
    is: 'heat-map',
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
                selectedValue: 0,
                uitype: 'single-value',
                notify: true
            }, {
                input: 'z',
                txt: 'Pick count',
                selectedValue: 0,
                uitype: 'single-value',
                notify: true
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: []
        },
        hideSettings: true,
        data: String,
        external: Array,
        svg: Object
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],
    draw: function() {
        var me = this;
        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;

        //To create new chart wrap
        this.makeChartWrap();
        var legendElementWidth = gridSize * 2,

          gridSize = Math.floor(width / 24),
            buckets = 9,
            //colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"], // alternatively colorbrewer.YlGnBu[9]
            days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

        var svg = this.svg;///d3.select("#chart").append("svg")
            svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var dayLabels = svg.selectAll(".dayLabel")
            .data(days)
            .enter().append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return i * gridSize;
            })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function(d, i) {
                return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
            });

        var timeLabels = svg.selectAll(".timeLabel")
            .data(times)
            .enter().append("text")
            .text(function(d) {
                return d;
            })
            .attr("x", function(d, i) {
                return i * gridSize;
            })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) {
                return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
            });

        d3.tsv('data1.tsv',
            function(d) {
                return {
                    day: +d.day,
                    hour: +d.hour,
                    value: +d.value
                };
            },
            function(error, data) {
                var colorScale  = d3.scale.linear()
                  .domain([0,50,100])
                  .range(["red", "yellow", "blue"]);;

                var cards = svg.selectAll(".hour")
                    .data(data, function(d) {
                        return d.day + ':' + d.hour;
                    });

                cards.append("title");

                cards.enter().append("rect")
                    .attr("x", function(d) {
                        return (d.hour - 1) * gridSize;
                    })
                    .attr("y", function(d) {
                        return (d.day - 1) * gridSize;
                    })
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("class", "hour bordered")
                    .attr("width", gridSize)
                    .attr("height", gridSize);
                  //  .style("fill", colors[0]);

                cards.transition().duration(1000)
                    .style("fill", function(d) {
                      console.log("value:"+d.value +" scale:"+colorScale(d.value));
                        return colorScale(d.value);
                    });

                cards.select("title").text(function(d) {
                    return d.value;
                });

                cards.exit().remove();

                // var legend = svg.selectAll(".legend")
                //     .data([0].concat(colorScale.quantiles()), function(d) {
                //         return d;
                //     });

                // legend.enter().append("g")
                //     .attr("class", "legend");

                // legend.append("rect")
                //     .attr("x", function(d, i) {
                //         return legendElementWidth * i;
                //     })
                //     .attr("y", height)
                //     .attr("width", legendElementWidth)
                //     .attr("height", gridSize / 2)
                //     .style("fill", function(d, i) {
                //         return colors[i];
                //     });

                // legend.append("text")
                //     .attr("class", "mono")
                //     .text(function(d) {
                //         return "≥ " + Math.round(d);
                //     })
                //     .attr("x", function(d, i) {
                //         return legendElementWidth * i;
                //     })
                //     .attr("y", height + gridSize);

                // legend.exit().remove();

            });

    }

});