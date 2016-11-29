PolymerD3.barChart.heatMap = function() {
  let _conf = function() {
    // Abstarct this part
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let xObj = this.getInputsPropertyObj('x');
    let yObj = this.getInputsPropertyObj('y');
    return {
      stackIndex: xIndex,
      chartType: 'heatmap', //stack,group,diff,waterfall,heatmap
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
      yaxisType: 'ordinal',
      parentG: this.parentG,
      barInnerPadding: 0
    };
  };
  let _processors = function(nChartConfig) {
    return {
      translate: () => {
        return 'translate(0,0)';
      },
      barWidth: () => {
        return nChartConfig.getBarWidth();
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
