Polymer({
  is: 'bar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'x',
        txt: 'Pick a dimension',
        selectedValue: 0,
        selectedName: 'label',
        uitype: 'single-value'
      }, {
        input: 'y',
        txt: 'Pick measures',
        selectedValue: [2, 1],
        selectedName: [],
        uitype: 'multi-value'
      }, {
        input: 'chartType',
        txt: 'Grouped or stacked',
        uitype: 'dropDown',
        selectedValue: 0,
        selectedName: 'Grouped',
        observer: '_chartTypehanged',
        options: [{
          key: 'Grouped',
          value: 0
        }, {
          key: 'Stacked',
          value: 1
        }]
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

  _addToolTip: function() {
    this.tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return '<strong>Frequency:</strong> <span style=\'color:red\'>' + '</span>';
      });
    this.svg.call(this.tip);
    this.svg.selectAll('.layer')
      .selectAll('rect')
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);
  },

  draw: function() {

    var parseDate = d3.time.format('%m/%Y').parse;
    var me = this;
    var margin = this.getMargins();
    var width = this.getWidth() - margin.left - margin.right;
    var height = this.getHeight() - margin.top - margin.bottom;

    // Selects stack of elements as Y-Axis
    var selected = this.getInputsProperty('y');

    // X axis
    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width]);

    // Y Axis
    var y = d3.scale.linear()
      .rangeRound([height, 0]);

    // Colors
    var z = d3.scale.category10();

    //Set X Axis at Bottom
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    // Sets Y axis at right
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    // Parent SVG
    var svg = this.svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Sets data source
    var src = me.source;

    if (!src) {
      console.warn('Data source empty');
      return false;
    }

    // Create layers based on stack
    // Parses the data as : {x: '',y: '',y0: ''}
    var layers = d3.layout.stack()(selected.map(function(c) {
      return src.map(function(d) {
        return {
          x: d[me.getInputsProperty('x')],
          y: d[c]
        };
      });
    }));

    //Draws the chart with newly mapped data
    x.domain(layers[0].map(function(d) {
      return d.x;
    }));

    y.domain([0, d3.max(layers[layers.length - 1], function(d) {
      return d.y0 + d.y;
    })]).nice();

    var layer = svg.selectAll('.layer')
      .data(layers)
      .enter().append('g')
      .attr('class', 'layer')
      .style('fill', function(d, i) {
        return z(i);
      });

    layer.selectAll('rect')
      .data(function(d) {
        return d;
      })
      .enter().append('rect')
      .attr('x', function(d) {
        return x(d.x);
      })
      .attr('y', function(d) {
        return y(d.y + d.y0);
      })
      .attr('height', function(d) {
        return y(d.y0) - y(d.y + d.y0);
      })
      .attr('width', x.rangeBand() - 1);

    svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(' + width + ',0)')
      .call(yAxis);
  }
});
