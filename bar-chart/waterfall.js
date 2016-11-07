PolymerD3.barChart.waterfall = function() {
  let _conf = function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let xObj = this.getInputsPropertyObj('x');
    let yObj = this.getInputsPropertyObj('y');
    return {
      stackIndex: xIndex,
      chartType: 'waterfall', //stack,group,diff,waterfall,heatmap
      containsHeader: false,
      xheader: [xIndex],
      yOrign: 0,
      yheader: yIndices,
      width: this.chartWidth,
      height: this.chartHeight,
      xFormat: 'string',
      yFormat: yObj.selectedObjs[0].type,
      xAlign: 'bottom',
      yAlign: 'left',
      xaxisType: 'ordinal',
      yaxisType: 'linear',
      parentG: this.parentG
    };
  };
  let _processors = function(nChartConfig) {
    return {
      translate: () => {
        return 'translate(0,0)';
      },
      barWidth: () => {
        return nChartConfig.getBarWidth() - 1;;
      },
      rectX: (d, i, j) => {
        return nChartConfig.getX(d[0]);
      },
      rectY: d => {
        if (d.y < 0) {
          return nChartConfig.getY(d.y0);
        }
        return nChartConfig.getY(d.y + d.y0);
      },
      rectHeight: d => {
        return nChartConfig.getBarHeight((d[1] < 0) ? -1 * (d[1]) : (d[1]));
      },
      legendF: (d, i, j) => {
        return d[0];
      }
    };
  };
  return {
    conf: _conf,
    processors: _processors
  }
};
