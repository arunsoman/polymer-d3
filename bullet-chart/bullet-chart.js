Polymer({
    is: 'bullet-chart',
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
            value: []
        },
        hideSettings: true,
        data: String,
        external: Array
    },
    behaviors: [
        PolymerD3.chartBehavior,
        PolymerD3.colorPickerBehavior
    ],

    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.draw();
    },
    
    attached: function() {
        this.draw();
    },

    draw: function() {
        var me = this;
        var margin = {
                top: 5,
                right: 40,
                bottom: 20,
                left: 120
            },
            width = 960 - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

        var chart = d3.bullet()
            .width(width)
            .height(height);

        d3.json("bullets.json", function(error, data) {
            if (error) throw error;

            me.svg.data(data)
                .attr("class", "bullet")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(chart);

            var title = me.svg.append("g")
                .style("text-anchor", "end")
                .attr("transform", "translate(-6," + height / 2 + ")");

            title.append("text")
                .attr("class", "title")
                .text(function(d) {
                    return d.title;
                });

            title.append("text")
                .attr("class", "subtitle")
                .attr("dy", "1em")
                .text(function(d) {
                    return d.subtitle;
                });
        });
    }
});