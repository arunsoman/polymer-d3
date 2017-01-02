Polymer({
  is: 'pareto-chart',
  draw: function() {
    this.debounce('draw-debounce', () => {
      const x = this.inputs[0].selectedValue;
      const yBar = this.inputs[1].selectedValue;
      const yLine = this.inputs[2].selectedValue;
      let z = this.setLegendColor.bind(this);
      if (!x || !x.length || !yBar || !yBar.length) {
        console.warn('Fill all inputs');
        return false;
      }
      // to create a clone of this.source
      // to do => data formatting
      let dataset = this.source.slice(0);
      let totalAmount = 0;
      for(var i = 0; i < dataset.length; i++){
        dataset[i][yBar[0]] = +dataset[i][yBar[0]];
        totalAmount += dataset[i][yBar[0]];
        if(i > 0){
          dataset[i]['CumulativeAmount'] = dataset[i][yBar[0]] + dataset[i-1].CumulativeAmount;
        }else{
          dataset[i]['CumulativeAmount'] = dataset[i][yBar[0]];
        }
      }
      //now calculate cumulative % from the cumulative amounts & total, round %
      for(var i = 0; i < dataset.length; i++){
        dataset[i]['CumulativePercentage'] = (dataset[i]['CumulativeAmount'] / totalAmount);
        dataset[i]['CumulativePercentage'] = parseFloat(dataset[i]['CumulativePercentage'].toFixed(2));
      }


      // generic function to map a property from a row(array of arrays)
      function retriveProperty(row, property) {
        return row[property];
      }

      function mapX(row) { // extracts x pop from each row
        return retriveProperty(row, x[0]);
      }

      function mapYBar(row) { // extracts yBar prop from each row
        return retriveProperty(row, yBar[0]);
      }

      function mapYLine(row) { // extracts yLine prop from each row
        return retriveProperty(row, 'CumulativePercentage');
      }

      //Axes and scales
      let xScale = d3.scale.ordinal().rangeRoundBands([0, this.chartWidth], 0.1);
      xScale.domain(dataset.map(mapX));

      let yhist = d3.scale.linear()
        .domain([0, d3.max(dataset, mapYBar)])
        .range([this.chartHeight, 0]);

      let ycum = d3.scale.linear()
        .domain([0, d3.max(dataset, mapYLine)])
        .range([this.chartHeight, 0]);

      let xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

      let yAxis = d3.svg.axis()
                    .scale(yhist)
                    .orient('left');

      let yAxis2 = d3.svg.axis()
                     .scale(ycum)
                     .orient('right');

      //Draw histogram
      let bar = this.parentG.selectAll('.bar')
                    .data(dataset)
                    .enter().append('g')
                    .attr('class', 'bar')
                    .style('fill', d => {
                      // Logic to generate legends initialy !! Must Refactor !!
                      if (typeof(d.fill) == 'function') { // since d is an array, this breaks fillcolor function
                        d.fill = null;
                      }
                      var color = z(d);
                      var key = this.inputs[0].selectedObjs[0].key;
                      d.key = key; // to short circuit fill color logic
                      var keyPresent = false;
                      this.legendSettings.colors.forEach((c) => {
                        if (c.label == key) {
                          color = c.color;
                          keyPresent = true;
                        }
                      });
                      if (!keyPresent && key) {
                        this.legendSettings.colors.push({
                          color: color,
                          label: key
                        });
                      }
                      return color;
                    })
                    .attr('class', 'stroked-elem') // to set stroke
                    .attr('data-legend', d => this.inputs[0].selectedObjs[0].key );

      bar.append('rect')
          .attr('x', d => xScale(d[x[0]]))
          .attr('width', xScale.rangeBand())
          .attr('y', d => yhist(d[yBar[0]]))
          .attr('height', d => this.chartHeight - yhist(d[yBar[0]]));

      //Draw CDF line
      let guide = d3.svg.line()
                    .x(d => xScale(d[x[0]]))
                    .y(d => ycum(d['CumulativePercentage']))
                    .interpolate('basis');

      let line = this.parentG.append('path')
                    .datum(dataset)
                    .attr('transform', 'translate(' + [xScale.rangeBand() / 2, 0] + ')')
                    .attr('d', guide)
                    .attr('class', 'line');

      //Draw axes
      this.parentG.append('g')
          .attr('class', 'x-axis')
          .attr('transform', 'translate(0,' + this.chartHeight + ')')
          .call(xAxis);

      this.parentG.append('g')
          .attr('class', 'y-axis')
          .call(yAxis)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Amount');

      this.parentG.append('g')
          .attr('class', 'y-axis')
          .attr('transform', 'translate(' + [this.chartWidth, 0] + ')')
          .call(yAxis2)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 4)
          .attr('dy', '-.71em')
          .style('text-anchor', 'end')
          .text('Cumulative %');

      var htmlCallback = d => { // retained as arrow function to access `this.inputs[]`
        return str = '<table>' +
          '<tr>' +
          '<td>' + this.inputs[0].displayName + ':</td>' +
          '<td>' + (d[0]) + '</td>' +
          '</tr>' +
          '<tr>' +
          '<td>' + this.inputs[1].displayName + ':</td>' +
          '<td>' + (d[1]) + '</td>' +
          '</tr>'
          '</table>';
      };
      this.attachToolTip(this.parentG, bar, 'vertalBars', htmlCallback);

      this.attachLegend(this.parentG);

    }, 500);
  },

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
          maxSelectableValues: 2,
          supportedType: ''
        }, {
          input: 'z',
          txt: 'Pick Z',
          selectedValue: [],
          format: '',
          scaleType: '',
          selectedObjs: [],
          uitype: 'multi-value',
          displayName: 'myZAxis',
          maxSelectableValues: 2,
          supportedType: ''
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

  xAxisRotationCb: function() {
    if (this.parentG) {
        let xAxis = this.parentG.select('.x-axis');
        let xAxisCommander = this.attach(xAxis);
        let toRotate = this._getAreaObj('xAxisRotation').selectedValue;
        let textAnchor = toRotate > 0 ? 'start': 'end';
        this.attach(xAxis).tickRotation.rotateTicks(toRotate, textAnchor);
    }
  },

  yAxisRotationCb: function() {
    if (this.parentG) {
      let yAxis = this.parentG.select('.y-axis');
      let yAxisCommander = this.attach(yAxis);
      let toRotate = this._getAreaObj('yAxisRotation').selectedValue;
      let textAnchor = 'end';
      this.attach(yAxis).tickRotation.rotateTicks(toRotate, textAnchor);
    }
  },

  strokeWidthCb: function() {
    let stroke = this.getAreaProperty('strokeWidth');
    let strokedElems = this.querySelectorAll('.stroked-elem');
    [].forEach.call(strokedElems, se => {
      se.style['stroke-width'] = stroke ? stroke.selectedValue + 'px' : 0;
    });
  },
});
