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
          txt: 'Coloumns',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'coloumn',
          maxSelectableValues: 8
        }, {
          input: 'y',
          txt: 'Group By',
          selectedValue: [],
          scaleType: '',
          format: '',
          selectedObjs: [],
          uitype: 'single-value',
          displayName: 'coloumn',
          maxSelectableValues: 1
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

      let usableCols = this.inputs[0].selectedObjs.filter(external => external.type == 'Number');
      let group = this.inputs[1].selectedObjs;

      if (!usableCols || !usableCols.length) {
        return false;
      }
      let _src = this.source.slice();
      let boxPlotData;
      // creates box plot data structure
      // boxplot = [[x1, d1], [x2, d2] ... [xn, dn]]
      // d1 = [val1, val2 ... valn] + quartiles
      if (group.length) {
        // transpose data
        usableCols = _src.map(row => row[group[0].value]);
        boxPlotData = usableCols.map((col, index) => {
          let node = [col, _src[index].filter((cell, index) => {
            return index != group[0].value;
          })]
          return node;
        });
      } else {
        boxPlotData = usableCols.map(col => {
          let node = [col.key, _src.map(row => PolymerD3.utilities.truncateFloat(row[col.value]))];
          return node;
        });
      }

      let margin = this.getMargins();

      let max = findMax(boxPlotData);
      let min = findMin(boxPlotData);


      // init colors, if not present
      let z = this.setLegendColor.bind(this);
      this.legendSettings.colors = usableCols.map((col, index) => {
        let current = this.legendSettings.colors ? this.legendSettings.colors[index]: {};
        if (!current) { current = {}}
        return {
          // generate color from default pallete
          color: current.color ? current.color: this.defaultColors[Math.floor(Math.random() * 9) + 0],
          label: col.key
        }
      });

      // todo: format later
      function formatNumber(d) {
        if (d < 1000) {
          return d;
        }
        d = d3.format('s')(d);
        let sufix = d.slice(-1);
        let num = parseFloat(d.slice(0, d.length)).toFixed(2);
        return  num + sufix;
      }
      this.parentG.html('');
      // the x-axis
      let x = d3.scale.ordinal()
        .domain(boxPlotData.map(col => col[0]))
        .rangeRoundBands([0, this.chartWidth], 0.7, 0.3);

      let xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

      // the y-axis
      let y = d3.scale.linear()
        .domain([min, max])
        .range([this.chartHeight, 0]);

      let chart = d3.box({
          y: y,
          formatNumber: formatNumber
        })
        .whiskers(iqr(1.5))
        .height(this.chartHeight)
        .domain([min, max])
        .showLabels(true);

      let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

      // draw the boxplots
      this.parentG.selectAll('.box')
        .data(boxPlotData)
        .enter().append('g')
        .attr('transform', function(d) {
          return 'translate(' + x(d[0]) + ',' + 0 + ')';
        })
        .attr('class', 'box-g')
        .attr('data-legend', d => d[0])
        .style('fill', d => {
          let color;
          this.legendSettings.colors.forEach(legend => {
            if (legend.label == d[0]) {
              color = legend.color;
            }
          });
          return color;
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
        .style('font-size', '16px');

      // draw x axis
      this.parentG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + (this.chartHeight) + ')')
        .call(xAxis)
        .append('text') // text label for the x axis
        .attr('x', (this.chartWidth / 2))
        .attr('y', 10)
        .attr('dy', '.71em');

      this.attachLegend(this.parentG, this.legendSettings);

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
