PolymerD3.barChart.stacked = function(settings, conf) {
  let _conf = {
    stackIndex: settings.xIndex,
    chartType: 'stack', //stack,group,diff,waterfall
    containsHeader: true,
    xheader: [settings.xIndex],
    yOrign: 0,
    yheader: settings.yIndices,
    width: this.chartWidth,
    height: this.chartHeight,
    xFormat: 'time',
    yFormat: 'number',
    xAlign: 'bottom',
    yAlign: 'left',
    xaxisType: 'ordinal',
    yaxisType: 'linear',
    parentG: this.parentG
  };

  let _transformations = {
    translate = () => {
      return 'translate(0,0)';
    };
    barWidth = () => {
      return conf.getBarWidth() - 1;
    };
    rectX = (d) => {
      return conf.getX(d[0]);
    };
    rectY = (d) => {
      return conf.getY(d.y0 + d.y);
    };
    rectHeight = (d) => {
      return conf.getBarHeight(d.y);
    };
    legendF = (d, i, j) => {
      console.log('d:' + d + ' i:' + i + ' j:' + j);
    };
    break;
  };

  return {
    configuration: _conf,
    transformations: _transformations
  }
};
