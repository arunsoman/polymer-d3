PolymerD3.barChart.heatMap = function() {
  let _conf = function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    return {
      stackIndex: xIndex,
      chartType: 'heatmap', //stack,group,diff,waterfall,heatmap
      containsHeader: false,
      xheader: [xIndex],
      yOrign: 0,
      yheader: yIndices,
      width: this.chartWidth,
      height: this.chartHeight,
      xFormat: 'time',
      yFormat: 'string',
      xAlign: 'bottom',
      yAlign: 'left',
      xaxisType: 'ordinal',
      yaxisType: 'ordinal',
      parentG: this.parentG
    };
  };
  let _processors = function(nChartConfig) {
    return {
      translate: () => {
        return 'translate(0,0)';
      },
      barWidth: () => {
        return nChartConfig.getBarWidth() - 1;
      },
      rectX: d => {
        return nChartConfig.getX(d[0]);
      },
      rectY: d => {
        return nChartConfig.getY(d.y);
      },
      rectHeight: () => {
        return nChartConfig.getBarHeight();
      },
      legendF: (d, i, j) => {
        // console.log('d:' + d + ' i:' + i + ' j:' + j);
      }
    }
  };
  return {
    conf: _conf,
    processors: _processors
  }
};
