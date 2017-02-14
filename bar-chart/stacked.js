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
        let xIndex = chart.getInputsProperty('x');
        if (data.length) {
          targetElem.classed('opacity-none', !targetElem.classed('opacity-none'));
          chart.fire('TOGGLE', {toggle: 'ON', chart: chart, element: e.target, filter: function(row) {
            var selected = [];
            d3.select(chart).selectAll('.opacity-none').each(s => {
              selected.push(s[0]);
            });
            return (selected.indexOf(row[xIndex]) != -1);
          }});
        }
      }
    });
    let chartContainer = chart.querySelector('.chartContainer');
    chart.scrollVal = 0; // variable that ditactes filterPadding
    chartContainer.addEventListener('wheel', e => {
      function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
      }
      window.onwheel = preventDefault; // disables window scroll
      // debounces scroll events
      chart.debounce('scrollDebounce', () => {
        window.onwheel = null; // enable windw scroll
        if (e.deltaY > 0) { // filter padding mustn't be less than 0
          (chart.scrollVal > 0) ? chart.scrollVal -= 1 : chart.scrollVal = 0;
        } else {
          chart.scrollVal += 1;
        }
        let xIndex = chart.getInputsProperty('x');
        let padding = chart.scrollVal;
        // creates a filtered domain
        let fileredDomain = chart.source.filter((row, index) => {
          return (index >= padding && index < (chart.source.length - padding))
        }).map(row => row[xIndex]);

        // add class to filtered elements
        let rects = d3.select(chart).selectAll('.stacked-rect');
        [].forEach.call(rects[0], rect => {
          let elem = d3.select(rect);
          let data = elem.data();
          if (data != null && fileredDomain.indexOf(data[0][xIndex]) != -1) {
            elem.classed('opacity-none', true);
          } else {
            elem.classed('opacity-none', false);
          }
        });

        chart.fire('TOGGLE', {toggle: 'ON', chart: chart, element: e.target, filter: function(row, index) {
          return (fileredDomain.indexOf(row[xIndex]) != -1);
        }});
        console.log('scroll re-enabled');
      }, 500);
    });
  }

  return {
    conf: _conf,
    processors: _processors
  }
};
