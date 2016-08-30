PolymerD3.barChart.grouped = function() {
  let _conf = function(settings) {
    return {
      stackIndex: settings.xIndex,
      chartType: 'stack', //stack,group,diff,waterfall
      containsHeader: true,
      xheader: [settings.xIndex],
      yOrign: 0,
      yheader: settings.yIndices,
      width: settings.chartWidth,
      height: settings.chartHeight,
      xFormat: 'time',
      yFormat: 'number',
      xAlign: 'bottom',
      yAlign: 'left',
      xaxisType: 'ordinal',
      yaxisType: 'linear',
      parentG: settings.parentG
    };
  };
  let _processors = function(nChartConfig) {
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
  };
  return {
    conf: _conf,
    processors: _processors
  }
};
