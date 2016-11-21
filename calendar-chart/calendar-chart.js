Polymer({
  is: 'calendar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'x',
          txt: 'Pick Date Field',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'Date',
          maxSelectableValues: 1
        }, {
          input: 'y',
          txt: 'Pick Value',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'Value',
          maxSelectableValues: 1
        }];
      }
    }
  },

  behaviors: [
    PolymerD3.chartBehavior
  ],

  chartHeightCb: function() {
    if (this.parentG) {
      let width = this._getWidth();
      let height = this._getHeight();
      let svg = d3.select(this).selectAll('svg')
      svg.attr('viewBox', '0 0 ' + (width + 50) +' ' + (height + 50) +'');
      this.draw();
      this.resize();
    }
  },

  draw: function() {
    // data coming to date field must be of type date
    this.debounce('calendarChartDrawDeounce', () => {
      let dateField = this.getInputsProperty('x');
      let valueField = this.getInputsProperty('y');

      if (dateField == null || valueField == null) {
        return false;
      }

      // to abstract out
      let width = 960;
      let height = 136;
      let cellSize = 17;

      let format = d3.time.format('%Y-%m-%d');

      let color = d3.scale.quantize()
          .domain([d3.min(this.source, d => d[valueField]), d3.max(this.source, d => d[valueField])])
          .range(d3.range(11).map(d => 'q' + d + '-11'));

      let wrapper = this.querySelector('.chartContainer');
      wrapper.innerHTML = '';
      let svg = d3.select(wrapper).selectAll('svg').attr('class', 'papparazzi')
          .data(d3.range(d3.min(this.source, d => d[0].getFullYear()), d3.max(this.source, d => d[0].getFullYear()) + 1))
        .enter().append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('class', 'RdYlGn')
          .append('g')
          .attr('transform', 'translate(' + ((width - cellSize * 53) / 2) + ',' + (height - cellSize * 7 - 1) + ')');

      svg.append('text')
          .attr('transform', 'translate(-6,' + cellSize * 3.5 + ')rotate(-90)')
          .style('text-anchor', 'middle')
          .text(function(d) { return d; });

      let rect = svg.selectAll('.day')
          .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append('rect')
          .attr('class', 'day')
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('x', function(d) { return d3.time.weekOfYear(d) * cellSize; })
          .attr('y', function(d) { return d.getDay() * cellSize; })
          .datum(format);

      rect.append('title')
          .text(function(d) { return d; });

      svg.selectAll('.month')
          .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append('path')
          .attr('class', 'month')
          .attr('d', monthPath);

      let data = d3.nest() // reurns data in the format [{date: value}]
        // assumes d[dateField is date]
        .key(function(d) { return format(d[dateField]); })
        .rollup(function(d) {
          // donot miss d[0]
          return d[0][valueField];
        })
        .map(this.source);

      rect.filter(function(d) { return d in data; })
          .attr('class', function(d) {
            return 'day ' + color(data[d]);
          })
        .select('title')
          .text(function(d) { return d + ': ' + data[d]; });

      function monthPath(t0) {
        let t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
            d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
        return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize
            + 'H' + w0 * cellSize + 'V' + 7 * cellSize
            + 'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize
            + 'H' + (w1 + 1) * cellSize + 'V' + 0
            + 'H' + (w0 + 1) * cellSize + 'Z';
      }


    }, 400);
    //me.makeChartWrap();
  }
});
