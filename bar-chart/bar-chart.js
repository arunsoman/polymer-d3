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
        selectedObjs: [{
          key: 'state',
          value: '0'
        }],
        selectedName: 'label',
        uitype: 'single-value',
        maxSelectableValues: 1
      }, {
        input: 'y',
        txt: 'Pick measures',
        selectedValue: [],
        selectedObjs: [{
          key: 'Under Five Year',
          value: '1'
        }],
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
    console.info('Ready');
    var me = this;
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
    //todo bind it on this.parentG
    /*
    this.svg.call(this.tip);
    this.svg.selectAll('.layer')
      .selectAll('rect')
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide);
    */
  },

  draw: function() {

    var me = this;
    
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
   
    stackedChart();

    function stackedChart() {
//scaleType, align, format, position, barPadding, label, domain){
      //Set X Axis at Bottom
      xDomain = src.map(function(d){return d[selectedX];});
      var xAxis = me.createAxis({'scaleType':"category", 
        'align':'h', 'format':'category', 'position':'bottom','domain':xDomain});

      // Sets Y axis at right
      yDomain = d3.max(src, function(d){
        var temp ;
        selected.forEach(function(d2){
          temp += d[d2];
        });
        return temp;
      });
      
      var yAxis = me.createAxis({'scaleType':'linear', 
        'align':'v', 'format':'number', 'position':'left', 'domain':yDomain});

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

      var x = xAxis.scale();
      var y = yAxis.scale();

      //Draws the chart with newly mapped data
      x.domain(layers[0].map(function(d) {
        console.log("print domain " + d.x);
        return d.x;
      }));

      y.domain([0, d3.max(layers[layers.length - 1], function(d) {
        return d.y0 + d.y;
      })]).nice();

      var layer = me.parentG.selectAll('.layer')
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
      // me.alignAxis(xAxis, 'bottom');
      // me.alignAxis(yAxis, 'left');
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

      //Set X Axis at Bottom
      var xAxis = this.createAxis("category", 'h', 'category');

      // Sets Y axis at right
      var yAxis = this.createAxis('linear','v', 'number');

      // Y Axis
      var y = yAxis.scale()
        .domain([0, yMax]);

      // X axis
      var x0 = xAxis.scale()
          .domain(d3.range(src.length));

      var x1 = d3.scale.ordinal()
          .domain(d3.range(me.getInputsProperty('y').length))
          .rangeBands([0, x0.rangeBand()]);

      // Color
      var z = d3.scale.category10();

      this.parentG.selectAll('g')
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
          return this.dhartHeight - y(d);
        });
    }
  }
});
