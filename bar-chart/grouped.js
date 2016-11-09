PolymerD3.barChart.grouped = function() {
  let _conf = function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let xObj = this.getInputsPropertyObj('x');
    let yObj = this.getInputsPropertyObj('y');
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
      forcetToZero: true
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
