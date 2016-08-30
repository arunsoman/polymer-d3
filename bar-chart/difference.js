PolymerD3.barChart.difference = function() {
  let _conf = function(config) {
    return {
      // for diff
      stackIndex: config.xIndex,
      chartType: 'diff', // stack,group,diff,waterfall,heatmap
      containsHeader: true,
      xheader: [config.xIndex],
      yOrign: 0,
      yheader: config.yIndices,
      width: config.chartWidth,
      height: config.chartHeight,
      xFormat: 'time',
      yFormat: 'number',
      xAlign: 'bottom',
      yAlign: 'left',
      xaxisType: 'ordinal',
      yaxisType: 'linear',
      parentG: config.parentG
    };
  };
  let _processors = function(settings) {
    return {
      translate: () => {
        return 'translate(0,0)';
      },
      barWidth: (d, i, j) => {
        return (j === 1) ? (settings.getBarWidth() / 2 - 1) :
          (settings.getBarWidth() - 1);
      },
      rectX: (d, i, j) => {
        return (j === 0) ? settings.getX(d[0]) :
          settings.getX(d[0]) + settings.getBarWidth() / 4;
      },
      rectY: (d) => {
        return settings.getY(d[1]);
      },
      rectHeight: (d) => {
        return settings.getBarHeight(d[1]);
      },
      classF: (d, i, j) => {
        return (j === 0) ? 'diff1' :
          'diff2';
      },
      legendF: (d, i, j) => {
        return d[0];
      },
    }
  };
  return {
    conf: _conf,
    processors: _processors
  }
};
