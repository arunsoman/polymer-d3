PolymerD3.barChart.stacked = function() {
  let _conf = function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    var xObj = this.getInputsPropertyObj('x');
    var yObj = this.getInputsPropertyObj('y');
    return {
      stackIndex: xIndex,
      chartType: 'stack', //stack,group,diff,waterfall
      containsHeader: true,
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
      parentG: this.parentG
    };
  };

  let _processors = (conf) => {
    return {
      translate: () => {
        return 'translate(0,0)';
      },
      barWidth: () => {
        return conf.getBarWidth() - 1;
      },
      rectX: (d) => {
        return conf.getX(d[0]);
      },
      rectY: (d) => {
        return conf.getY(d.y0 + d.y);
      },
      rectHeight: (d) => {
        return conf.getBarHeight(d.y);
      },
      legendF: (d, i, j) => {
        console.log('d:' + d + ' i:' + i + ' j:' + j);
      }
    }
  };

  return {
    conf: _conf,
    processors: _processors
  }
};
