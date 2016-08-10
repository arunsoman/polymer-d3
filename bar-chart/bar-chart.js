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
        selectedValue: [],
        selectedObjs: [],
        selectedName: 'label',
        uitype: 'single-value',
        maxSelectableValues: 1
      }, {
        input: 'y',
        txt: 'Pick measures',
        selectedValue: [],
        selectedObjs: [],
        selectedName: [],
        uitype: 'multi-value',
        maxSelectableValues: 2
      }]
    },
    settings: {
      notify: true,
      type: Object,
      value: {}
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false
  },

  attached: function() {
    this.settings = {
      //Temporary hack for rendering chart type using <display-component>
      chartType: [{
        input: 'chartType',
        txt: 'Grouped or stacked',
        uitype: 'dropDown',
        selectedValue: 1,
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
    }
    this.set('settings.area', this.area);
  },

  behaviors: [
    PolymerD3.chartBehavior
    // PolymerD3.colorPickerBehavior
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
    var width = this._getWidth();
    var height = this._getHeight();

    //To create new chart wrap
    this.makeChartWrap();

    // Selects stack of elements as Y-Axis
    var selected = me.getInputsProperty('y');
    var selectedX = me.getInputsProperty('x');

    if (!selected || !selectedX || selected.length === 0 || selectedX.length === 0) {
      console.warn('No inputs selected');
      return false;
    }

    // Colors : http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d
    var z = d3.scale.category10();

    // Sets data source
    var src = me.source;

    if (!src) {
      console.warn('Data source empty');
      return false;
    }
   
    groupedChart();

    function stackedChart() {

      //Set X Axis at Bottom
      var xAxis = me.createAxis('category', false, undefined)
        .orient('bottom');

      // Sets Y axis at right
      var yAxis = me.createAxis('linear', false, 'number')
        .orient('left');

      // X axis
      var x = xAxis.scale();

      // Y Axis
      var y = yAxis.scale();

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

      var layer = me.svg.select('g').selectAll('.layer')
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
          return (y(d.y0) - y(d.y + d.y0));
        })
        .attr('width', x.rangeBand() - 1);
      me.alignAxis(xAxis, 'bottom');
      me.alignAxis(yAxis, 'left');
    }

    function groupedChart() {
      // Generates new mapped array and find yMax
      var mapped = [];
      var yMax = 0;
      selected.forEach(function(s) {
        var arr = src.map(function(arr) {
          if (yMax < arr[s] ) {
            yMax = arr[s];
          }
          return arr[s];
        });
        mapped.push(arr);
      });

      var xAxis = me.createAxis('category', false, undefined)
        .orient('bottom');

      var yAxis = me.createAxis('linear', false, undefined)
        .orient('left');


      // Y Axis
      var y = yAxis.scale()
        .domain([0, yMax])
        .rangeRound([height - (margin.top + margin.bottom), 0]);

      // X axis
      var x0 = xAxis.scale()
          .domain(d3.range(src.length))
          .rangeBands([0, width - (margin.left + margin.right)], .2);

      var x1 = d3.scale.ordinal()
          .domain(d3.range(me.getInputsProperty('y').length))
          .rangeBands([0, x0.rangeBand()]);

      // Color
      var z = d3.scale.category10();


      // var svg = me.svg
      //     .attr('width', width + margin.left + margin.right)
      //     .attr('height', height + margin.top + margin.bottom)
      //     .append('svg:g')
      //     .attr('transform',
      //       'translate(' + margin.left + ',' + margin.top + ')'
      //     );

      // svg.append('g')
      //     .attr('class', 'y axis')
      //     .call(yAxis);

      // svg.append('g')
      //     .attr('class', 'x axis')
      //     .attr('transform', 'translate(0,' + height + ')')
      //     .call(xAxis);

      me.alignAxis(xAxis, 'bottom');
      me.alignAxis(yAxis, 'left');

      var g = me.svg.select('g');

      g.append('g').selectAll('g')
        .data(mapped)
        .enter().append('g')
        .style('fill', function(d, i) {
          return z(i);
        })
        .attr('transform', function(d, i) {
          return 'translate(' + x1(i) + ',0)';
        })
        .selectAll('rect')
        .data(function(d) {
          return d;
        })
        .enter().append('rect')
        .attr('width', x1.rangeBand())
        .attr('height', y)
        .attr('x', function(d, i) {
          return x0(i);
        })
        .attr('y', function(d) {
          return (height - (margin.top + margin.bottom)) - y(d);
        });
    }
  }
});
