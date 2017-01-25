Polymer({
  is: 'grouped-composite-chart',
  draw: function() {
    this.debounce('draw-debounce', () => {
      let xIndex = this.getInputsProperty('x');
      let yIndices = this.getInputsProperty('y');
      let yLine = this.getInputsProperty('z');
      let z = this.setLegendColor.bind(this);
      this.resize();
      // requireed indices not selected
      if (xIndex === -1 || !yIndices || yIndices.length < 1 || !this.source || this.source.length < 1) {
        console.warn('Fill all required inputs using drag and drop');
        return false;
      }

      let headers = this.externals.map(e => {
        return e.key;
      });

      // cloning the source to keep it intact
      let _src = JSON.parse(JSON.stringify(this.source));

      if (this.parentG) {
        this.parentG.html("");
      }

      let conf = this._conf(); // generate config
      let _isGrouped = false; // disable groupby z-input

      let myGroup = PolymerD3
        .groupingBehavior
        .group_by(yIndices, xIndex, yIndices,
          headers, conf.chartType, _isGrouped
        );
      let nChartConfig = this.chartConfig(conf, _src, myGroup.process);

      let stackData = myGroup.getStack();

      nChartConfig.stackDataLength = stackData.length;

      let translations = this._processors(nChartConfig);

      let layer = this.parentG.selectAll('.layer')
        .data(stackData)
        .enter().append('g')
        .attr('transform', translations.translate)
        .attr('class', 'layer')
        .style('fill', d => {
          // Logic to generate legends initialy
          let color = z(d);
          let keyPresent = false;
          this.legendSettings.colors.forEach((c) => {
            if (c.label == d.key) {
              color = c.color;
              keyPresent = true;
            }
          });
          // Create new entry if legend isn't present
          // TO do: remove &&d.key =>  something's wrong with generate stackData meathod
          // d.key comes as undefined check `PolymerD3.groupingBehavior`
          if (!keyPresent && d.key) {
            this.legendSettings.colors.push({
              color: color,
              label: d.key
            });
          }
          return color;
        })
        .attr('class', 'stroked-elem') // to set stroke
        .attr('data-legend', function(d) {
          return d.key;
        });
      // this.attachLegend(this.parentG);

      let rects = layer.selectAll('rect')
        .data(function(d) {
          return d.values;
        })
        .enter().append('rect')
        .attr('x', translations.rectX)
        .attr('y', translations.rectY)
        .attr('height', translations.rectHeight)
        .attr('width', translations.barWidth)
        // .attr('data-legend', translations.legendF)
        .attr('class', translations.classF);
      // to draw line chart
      if (yLine && yLine.length) {

        let lineData = this.source.map(row => ({
          x: row[xIndex],
          y: row[yLine[0]]
        }));

        let x = d3.scale.ordinal()
          .rangeRoundBands([0, this.chartWidth]);

        x.domain(lineData.map(d => d.x));

        let guide = d3.svg.line()
          .x(d => x(d.x))
          .y(d => yLineScale(d.y))
          .interpolate('basis');

        let yLineScale = conf.yAxisConf.scale;

        let yAxis2 = d3.svg.axis()
          .scale(yLineScale)
          .orient('right');

        let line = this.parentG.append('path')
          .datum(lineData)
          .attr('d', guide)
          .attr('class', 'line')
          .attr('transform', 'translate(' + (translations.barWidth() / 2) + ',' + 0 + ')');

        this.parentG.append('g')
          .attr('class', 'y-axis')
          .attr('transform', 'translate(' + [this.chartWidth, 0] + ')')
          .call(yAxis2)
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 4)
          .attr('dy', '-.71em')
          .style('text-anchor', 'end');
      }

      let htmlCallback = d => { // retained as arrow function to access `this.inputs[]`
        let str = '<table>' +
          '<tr>' +
          '<td>' + this.inputs[0].displayName + ':</td>' +
          '<td>' + d.x + '</td>' +
          '</tr>' +
          '<tr>' +
          '<td>' + this.inputs[1].displayName + ':</td>' +
          '<td>' + d.y + '</td>' +
          '</tr>' +
          '</table>';
        return str;
      };
      this.attachToolTip(this.parentG, rects, 'vertalBars', htmlCallback);

      this.attachLegend(this.parentG, this.legendSettings);
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

  _conf: function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let xObj = this.getInputsPropertyObj('x');
    let yObj = this.getInputsPropertyObj('y');
    let zGroup = this.getInputsProperty('z');

    let forcetToZero = true;

    // if (yIndices.length > 1 || zGroup.length) {
      // forcetToZero = true;
    // }

    return {
      stackIndex: xIndex,
      chartType: 'stack', //stack,group,diff,waterfall
      containsHeader: false,
      xheader: [xIndex],
      yOrign: 0,
      yheader: yIndices,
      width: this.chartWidth,
      height: this.chartHeight,
      xFormat: xObj.selectedObjs[0].type,
      yFormat: yObj.selectedObjs[0].type,
      xAlign: 'bottom',
      yAlign: 'left',
      xaxisType: 'ordinal',
      yaxisType: 'linear',
      parentG: this.parentG,
      forcetToZero: forcetToZero
    };
  },
  _processors: function(nChartConfig) {
    return {
      translate: (d, i) => {
        return 'translate(' + i * nChartConfig.getBarWidth() / nChartConfig.stackDataLength + ',0)';
      },
      barWidth: () => {
        return nChartConfig.getBarWidth() / nChartConfig.stackDataLength - 1;
      },
      rectX: (d) => {
        return nChartConfig.getX(d[0]);
      },
      rectY: (d) => {
        return nChartConfig.getY(d[1]);
      },
      rectHeight: (d) => {
        return nChartConfig.getBarHeight(d[1]);
      },
      legendF: (d, i, j) => {
        // console.log('d:' + d + ' i:' + i + ' j:' + j);
      }
    }
  }

});
