Polymer({
    is: 'pie-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'slice',
                txt: 'Pick a dimension',
                selectedValue: 0,
                selectedName: 'label',
                uitype: 'single-value'
            }, {
                input: 'sliceSize',
                txt: 'Pick a messure',
                selectedValue: 1,
                selectedName: 'count',
                uitype: 'single-value'
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: [{
                input: 'displayTxt',
                txt: 'Placement of lables',
                uitype: 'dropDown',
                selectedValue: Array,
                selectedName: Array,
                options: [{
                    key: 'None',
                    value: 0
                }, {
                    key: 'inside',
                    value: 1
                }, {
                    key: 'outside',
                    value: 2
                }]
            }, {
                input: 'innerRadius',
                txt: 'Inner radius',
                uitype: 'Number',
                selectedValue: 0
            }, {
                input: 'height',
                txt: 'Height of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_heightChanged'
            }, {
                input: 'width',
                txt: 'Width of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_widthChanged'
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
        data: {
          type: String,
          notify: true,
          value: "",
          observer: '_parseData'
        },
        external: Array,
        svg: Object
    },
    observers: ['_settingsWatcher(settings.*)', '_inputsWatcher(inputs.*)'],


    _settingsWatcher: function(settings) {
        if (settings.path === 'settings') {
            return
        }
        this.draw();
    },
    getBeh: function() {
       return this; 
    },
    _inputsWatcher: function(inputs) {
        if (inputs.path === 'inputs') {
            return
        }
        this.draw();
    },

    _getHeight() {
        return this.settings[2].selectedValue;
    },
    _getWidth() {
        return this.settings[3].selectedValue;
    },
    // _heightChanged: function() {
    //   console.log('New height' + height);
    //     this.draw();
    // },
    // _widthChanged: function() {
    //     console.log('New width' + width);
    //     this.draw();
    // },

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.draw();
    },
    attached: function() {
        console.log("svg computed");
        var me = this;
        me.svg = d3.select('#chart')
            .append('svg')
            .append('g')
            .attr('transform', 'translate(' + (me._getWidth() / 2) +
                ',' + (me._getHeight() / 2) + ')');

        me.tooltip = d3.select('#chart')
            .append('div')
            .attr('class', 'tooltip')
            .append('div')
            .attr('class', me.inputs[0].selectedName)
            .append('div')
            .attr('class', me.inputs[1].selectedName)
            .append('div')
            .attr('class', 'percent');

    },
    _parseData(){
      console.log("data parsed");
        this.newData =[];
        me = this;
        d3.csv.parse(this.data, function(d){
            d[me.sliceSizeHeader] = +d[me.sliceSizeHeader];
            me.newData.push(d);
          });
    },
    draw: function() {
        'use strict';
        var me = this;
        var sliceHeader = this.inputs[0].selectedName;
        var sliceSizeHeader = this.inputs[1].selectedName;
        var donutWidth = 75;
        var legendRectSize = 18;
        var legendSpacing = 4;
        var width = this._getWidth(),
            height = this._getHeight(),
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()//this  needs to change, its hardcoded 
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

        var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var labelArc = d3.svg.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d[sliceSizeHeader];
            });

            this.svg.attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var g = this.svg.selectAll(".arc")
                .data(pie(me.newData))
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function(d) {
                    return color(d.data[sliceHeader]);
                });

            g.append("text")
                .attr("transform", function(d) {
                    return "translate(" + labelArc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.data[sliceHeader]+":" + d.data[sliceSizeHeader];
                });
        }
});