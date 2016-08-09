Polymer({
  is: 'waterfall-chart',

  properties: {
    inputs: {
      notify: true,
      type: Array,
      value: [{
          input: 'x',
          txt: 'Pick a dimension',
          selectedValue: -1,
          
          uitype: 'single-value'
      }, {
          input: 'y',
          txt: 'Pick measures',
          selectedValue: -1,
          uitype: 'single-value'
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    hideSettings: true,
    source: {
      type: Array,
      value: [],
      notify: true
    },
    external: Array,
    chart: Object,
    svg:Object,
    sourceMutated: false
  },

  behaviors: [
    PolymerD3.chartBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

  _addToolTip(){
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Name:</strong> <span style='color:red'>"  + "</span>";
      });       
    this.svg.call(tip);
    this.svg
      .selectAll('.bar')
      .selectAll('rect')
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  },

  draw: function() {
    var me = this;
    if (me.getInputsProperty('x') === -1 || me.getInputsProperty('y') === -1) {
      return;
    } 
    
    var margin = me.getMargins();
    var width = me.getWidth() - margin.left - margin.right;
    var height = me.getHeight() - margin.top - margin.bottom;
    var padding = 0.3;

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], padding);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(function(d) { return PolymerD3.utilities._formatNumber(d); });

    me.makeChartWrap();

    me.svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var data = me.source;
   
    
    var meta = me.formatData();
    var startIndex = meta[0];
    var endIndex = meta[1];
    var classIndex = meta[2];
    x.domain(data.map(function(d) { return d[me.getInputsProperty('x')]; }));
    y.domain([0, d3.max(data, function(d) { return d[endIndex]; })]);

    me.svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    me.svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis);

    var bar = me.svg.selectAll(".bar")
      .data(data)
      .enter().append("g")
        .attr("class", function(d) { return "bar " + d[classIndex] })
        .attr("transform", function(d) { return "translate(" + x(d[me.getInputsProperty('x')]) + ",0)"; });

    bar.append("rect")
        .attr("y", function(d) { return y( Math.max(d[startIndex], d[endIndex]) ); })
        .attr("height", function(d) { return Math.abs( y(d[startIndex]) - y(d[endIndex]) ); })
        .attr("width", x.rangeBand());

    bar.append("text")
        .attr("x", x.rangeBand() / 2)
        .attr("y", function(d) { return y(d[endIndex]) + 5; })
        .attr("dy", function(d) { return ((d[classIndex]=='negative') ? '-' : '') + ".75em" })
        .text(function(d) { return PolymerD3.utilities._formater('currency')(d[endIndex] - d[startIndex]);});

    bar.filter(function(d) { return d.class != "total" }).append("line")
        .attr("class", "connector")
        .attr("x1", x.rangeBand() + 5 )
        .attr("y1", function(d) { return y(d[endIndex]) } )
        .attr("x2", x.rangeBand() / ( 1 - padding) - 5 )
        .attr("y2", function(d) { return y(d[endIndex]) } );

    me._addToolTip();
  },

  formatData: function() {
    var me = this;
    var data = me.source;
    var startIndex;
    var endIndex;
    var classIndex;
    if (!me.sourceMutated) {
      data.forEach(function(dataum) {
        dataum[me.getInputsProperty('y')] = + dataum[me.getInputsProperty('y')];
        startIndex = dataum.push(0)-1;
        endIndex = dataum.push(0)-1;
        classIndex = dataum.push(0)-1;
      });
      var cumulative = 0;
      for (var i = 0; i < data.length; i++) {
        data[i][startIndex] = cumulative;
        cumulative += data[i][me.getInputsProperty('y')];
        data[i][endIndex] = cumulative;
        data[i][classIndex] = ( data[i][me.getInputsProperty('y')] >= 0 ) ? 'positive' : 'negative'
      }
      data.push(['Total',cumulative, 0,  cumulative,'total' ]);
      me.sourceMutated = true;
      return [ startIndex, endIndex, classIndex];
    }
    return [ data.length-3, data.length-2, data.length-1];
  }
});
