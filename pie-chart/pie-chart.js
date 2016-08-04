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

  _parseData(){
    var me = this;
    me.newData =[];
    me.source.forEach(function(d) {
      d[me.getInputsProperty('sliceSize')] = +d[me.getInputsProperty('sliceSize')];
      me.newData.push(d);
    });
  },

  draw: function() {
    var me = this;
    me.makeChartWrap();
    var sliceHeader = this.inputs[0].selectedName;
    var sliceSizeHeader = this.inputs[1].selectedName;
    var donutWidth = 75;
    var legendRectSize = 18;
    var legendSpacing = 4;
    var width = this.getWidth(),
      height = this.getHeight(),
      radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()//this  needs to change, its hardcoded 
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var labelArc = d3.svg.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

    me._parseData();

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d[me.getInputsProperty('sliceSize')];
        // return d[sliceSizeHeader];
      });

    this.svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    me.gWrap = me.svg.select("g");

    var g = me.gWrap.selectAll(".arc")
      .data(pie(me.newData))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) {
        return color(d.data[me.getInputsProperty('slice')]);
        // return color(d.data[sliceHeader]);
      });

    g.append("text")
      .attr("transform", function(d) {
        return "translate(" + labelArc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data[me.getInputsProperty('slice')];
        // return d.data[sliceHeader]+":" + d.data[sliceSizeHeader];
      });
  }
});