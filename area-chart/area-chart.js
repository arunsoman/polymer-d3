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
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'y',
                txt: 'Group',
                selectedValue: [0],
                uitype: 'multi-value',
                selectedObjs: [],
                scaleType: '',
                format:'',
                maxSelectableValues: 1
            }, {
                input: 'z',
                txt: 'Pick a dimension',
                selectedValue: 1,
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
        var dataSummary = d3.nest().key((d) => { return d[xIndex];})
                    .rollup( (d) => 
                    { 
                        return d3.sum(d, g => {return g[zIndex];});
                    })
                    .entries(data);
        var xBound = d3.extent(dataSummary, (d) => {
                    return new Date(d.key);
                });
        var yBound = d3.extent(dataSummary, (d) => {
                    return d.values;
                });

        var config = {'scaleType':"time", 
        'align':'h', 'format':'time', 'position':'bottom','domain':xBound};
        var xAxis = me.createAxis(config);

        config = {'scaleType':"linear", 
        'align':'v', 'format':'currency', 'position':'left','domain':[0, yBound[1]]};
          var yAxis = me.createAxis(config);

//        y.domain([0, maxY]);
        var y = yAxis.scale();
        var x = xAxis.scale();        
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