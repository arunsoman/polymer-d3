/*

Accepts data in the format:
  Q1,Q2,Q3,Q4
  20000,15000,8000,20000
  9879,9323,3294,5629
  5070,9395,17633,5752
  7343,8675,12121,7557
  9136,5354,4319,5125
  7943,6725,18712,5116
  4000,7446,16754,8905
  10546,10899,17270,5828
  9385,9365,13676,6014
  8669,8238,6587,5995

where, Q1, Q2, Q3 and Q4 are plotted at xaxix
*/
Polymer({
  is: 'box-plot',

  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'x',
          txt: 'Pick Dimension',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'myXAxis',
          maxSelectableValues: 1
        }, {
          input: 'y',
          txt: 'Pick Measures',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myYAxis',
          maxSelectableValues: 2
        }];
      }
    },
    settings: {
      notify: true,
      type: Object,
      value: () => {
        return [];
      }
    },
    chartType: {
      type: Object,
      value: () => {
        return [];
      }
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false,
    isStacked: {
      type: Boolean,
      value: true
    },
    configurator: {
      type: Object,
      value: function() {
        return {};
      }
    }
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.chartConfigCbBehavior
  ],

  draw: function() {
    // find maximum in an array of arrays
    function findMax(arr) {
      return d3.max(arr, innerArray => d3.max(innerArray[1]));
    }
    function findMin(arr) {
      return d3.min(arr, innerArray => d3.min(innerArray[1]));
    }

    this.debounce('drawDebounce', () => {
      let usableCols = this.externals.filter(external => external.type == 'Number');

      // creates box plot data structure
      // boxplot = [[x1, d1], [x2, d2] ... [xn, dn]]
      // d1 = [val1, val2 ... valn] + quartiles
      let boxPlotData = usableCols.map(col => {
        let node = [col.key, this.source.map(row => PolymerD3.utilities.truncateFloat(row[col.value]))];
        return node;
      });

      let margin = this.getMargins();

      let max = findMax(boxPlotData);
      let min = findMin(boxPlotData);

      let chart = d3.box()
        .whiskers(iqr(1.5))
        .height(this.chartHeight)
        .domain([min, max])
        .showLabels(true);

      // the x-axis
      let x = d3.scale.ordinal()
        .domain(usableCols.map(col => col.key))
        .rangeRoundBands([0, this.chartWidth], 0.7, 0.3);

      let xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

      // the y-axis
      let y = d3.scale.linear()
        .domain([min, max])
        .range([this.chartHeight, 0]);

      let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

      // draw the boxplots
      this.parentG.selectAll('.box')
        .data(boxPlotData)
        .enter().append('g')
        .attr('transform', function(d) {
          return 'translate(' + x(d[0]) + ',' + margin.top + ')';
        })
        .call(chart.width(x.rangeBand()));

      this.parentG.attr('class', 'box');

      // draw y axis
      this.parentG.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .append('text') // and text1
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('font-size', '16px')
        .text('Revenue in €');

      // draw x axis
      this.parentG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + (this.chartHeight) + ')')
        .call(xAxis)
        .append('text') // text label for the x axis
        .attr('x', (this.chartWidth / 2))
        .attr('y', 10)
        .attr('dy', '.71em');

    }, 500);

    // Returns a function to compute the interquartile range.
    function iqr(k) {
      return function(d, i) {
        var q1 = d.quartiles[0],
          q3 = d.quartiles[2],
          iqr = (q3 - q1) * k,
          i = -1,
          j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
      };
    }
  }
});