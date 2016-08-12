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
      }]
    },
    hideSettings: true,
    source: {
      type: Array,
      value: []
    },
    external: Array,
    svg: Object
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },
  
  attached: function() {
        me = this;
        //TODO remove this 
        this.inputs[0].selectedValue = 0;
        this.inputs[1].selectedValue = 3;
        function callme(data) {
            me.source = data;
            me.draw()
        }
        PolymerD3.fileReader('cereal-small.csv', [this.inputs[1].selectedValue], [], undefined, callme, true);
    },

  draw: function() {
    var me = this;
    //me.makeChartWrap();
    var slice = this.inputs[0].selectedValue;
    var sliceSize = this.inputs[1].selectedValue;

    var width = this.chartWidth,
      height = this.chartHeight,
      radius = Math.min(width, height) / 2;
    var innerRadius = 10; //me.getSettingsProperty("innerRadius");
    
    var color = d3.scale.category20c();

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(innerRadius);

    var labelArc = d3.svg.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d[sliceSize];
      });

    this.parentG.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = this.parentG.selectAll(".arc")
      .data(pie(me.source))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) {
        return color(d.data[slice]);
      });

    g.append("text")
      .attr("transform", function(d) {
        return "translate(" + labelArc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data[slice];
      });
  }
});