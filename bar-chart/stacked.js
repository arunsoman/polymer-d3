PolymerD3.barChart.stacked = function(chart) {
  const STACK_CLASS = 'stacked-rect';
  let _conf = function() {
    let xIndex = this.getInputsProperty('x');
    let yIndices = this.getInputsProperty('y');
    let xObj = this.getInputsPropertyObj('x');
    let yObj = this.getInputsPropertyObj('y');
    let zGroup = this.getInputsProperty('z');

    let forcetToZero = false;

    // if (yIndices.length > 1 || zGroup.length) {
      forcetToZero = true;
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
        // console.log('d:' + d + ' i:' + i + ' j:' + j);
      },
      classF: () => STACK_CLASS
    }
  };

  if (chart) {
    chart.addEventListener('tap', e => {
      console.log(e);
      let targetElem = d3.select(e.target);
      // logic for basic bar chart
      if (targetElem.classed(STACK_CLASS)) {
        let data = targetElem.data();
        if (data.length) {
          targetElem.classed('opacity-none', !targetElem.classed('opacity-none'));
          chart.fire('TOGGLE', {toggle: 'ON', chart: chart, element: e.target, filter: function(row) {
            var selected = [];
            d3.select(chart).selectAll('.opacity-none').each(s => {
              selected.push(s[0]);
            });
            return (selected.indexOf(row[0]) != -1);
          }});
        }
      }

    });
  }

  return {
    conf: _conf,
    processors: _processors
  }
};
