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
    getXlabels:()=>{
        var nest = d3.nest()
          .key(function(d) { return d[getX()];})
          .entries(data);
//        return _.toArray((d)=>{d.key})
    return ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

    },
    getYlabels:()=>{
        var nest = d3.nest()
          .key(function(d) { return d[getY()];})
          .entries(data);
//        return _.toArray((d)=>{d.key})
        return ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    },
    draw: function() {
        var me = this;
        var margin = this.getMargins();
        var width = this.getWidth() - margin.left - margin.right;
        var height = this.getHeight() - margin.top - margin.bottom;

        //To create new chart wrap
        this.makeChartWrap();

        //TODO change hardcoded values
        var
          gridSize = Math.floor(width / 24),
            legendElementWidth = gridSize * 2,
            buckets = 9,

        var svg = this.svg;///d3.select("#chart").append("svg")
            svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let yLabels = this.getYlabels();
        svg.selectAll(".yLabel")
            .data(yLabels)
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
                //TODO fix this
                return ((i >= 0 && i <= yLabels.length) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
            });

        let xLabels = this.getXlabels();
        svg.selectAll(".xLabel")
            .data(xLabels)
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
                //TODO Fix this
                return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
            });

            var colorScale  = d3.scale.linear()
              .domain([0,50,100])
              .range(["red", "yellow", "blue"]);;

            var cards = svg.selectAll(".hour")
                .data(data, function(d) {
                    //TODO change this to
                    return d[getX()] + ':' + d[getY()];
                });

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) {
                    return (d[getX()] - 1) * gridSize;
                })
                .attr("y", function(d) {
                    return (d[getY()]) * gridSize;
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
    }

});