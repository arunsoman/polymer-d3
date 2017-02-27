Polymer({

  is: 'composite-canvas',

  properties: {
    source: {
      type: Array,
      value: () => {
        return []
      }
    },
    externals: {
      type: Array,
      value: () => {
        return []
      }
    },
    charts: {
      type: Array,
      value: () => []
    },
    // The query that run at paragraph,
    // to be used for generating query
    // donot modify
    pargraphQuery: {
      type: String,
      // default value for testing
      value: 'select * from demoTable'
    },

    // working copy of paragraphQuery
    _pargraphQuery: {
      type: String
    },

    // zeppelin noteBook at which para runs
    notebookId: {
      type: String
    },

    // url to connect to backend query executer
    crossfilterExternal: {
      type: String,
      value: 'http://192.168.14.81:8082/api.json'
    },
    // threshold that is used to check if query should go to crossfilter or backend
    crossfilterThreshold: {
      type: Number,
      value: 1000
    },
    // no: resources in filtered list
    sourceVolume: {
      type: Number
    },
    lastModifiedBy: {
      type: String
    }
  },

  listeners: {
    'TOGGLE': 'toggleData',
    'RESET': 'resetCharts'
  },

  behaviors: [
    PolymerD3.chartDataManagerBehavior
  ],

  observers: [
    'pargraphQueryChanged(pargraphQuery)'
  ],

  pargraphQueryChanged: function(query) {
    this.set('_pargraphQuery', query);
  },

  attached: function() {
    this.async(() => {
      this.set('sourceVolume', this.source.length);
      // select and register chart
      let barChart = this.querySelector('bar-chart');
      barChart.initStackedBarChart();
      let boxPlot = this.querySelector('box-plot');
      let scatterPlot = this.querySelector('radar-chart');
      this.registerChart(boxPlot);
      this.registerChart(barChart);
      this.registerChart(scatterPlot);
      this._sourceDimension = crossfilter(this.source).dimension(r => r);
      var processed = this.initCharts([boxPlot, scatterPlot, barChart], {
        dimension: this._sourceDimension,
        externals: this.externals,
        lastModifiedBy: null
      }, arr => arr);
      this.charts = processed.charts;
      this._sourceDimension = processed.newDimension;
    });
  },

  toggleData: function(e) {
    console.log(e.detail.filter);
    if (!e.detail.chart) {
      console.warn('Event source couldn\'t be identified');
      return false;
    }
    let otherCharts = this.charts.filter(chart => chart.chartId !=  e.detail.chart.chartId);
    // runs cookQueries @ charts with cookQueryFunction
    let queries = this.charts.filter(chart => chart.cookQuery).map(chart => chart.cookQuery());
    let processed = this.initCharts(otherCharts, {
      externals: this.externals,
      dimension: this._sourceDimension,
      lastModifiedBy: e.detail.chart.chartId,
      queries: queries
    }, e.detail.filter);
    this._sourceDimension = processed.newDimension;
  },

  resetAllCharts: function() {
    this.initCharts(this.charts, {
      externals: this.externals,
      dimension: this._sourceDimension
    }, arr => arr);
    this.charts.forEach(chart => chart.draw());
  },

  // register chart to chart-array
  registerChart: function(chart) {
    // search a list of available charts, push only if isn't present
    let chartIds = this.charts.map(chart => chart.id);
    if (chartIds.indexOf(chart.chartId) == -1) {
      chart.chartId = PolymerD3.utilities.getUUID();
      if (chart.attachListeners) { // goo to have: check if attachListeners is a function
        chart.attachListeners();
      }
      this.charts.push(chart);
    } else {
      console.warn('Chart already present');
    }
  },

  // removes chart form chart array
  deRegisterChart: function(chart) {
    var indexToRem;
    this.charts.forEach((c, i) => {
      if (c.chartId == chart.chartId) {
        indexToRem = i;
      }
    });
    if (indexToRem != null) {
      this.splice('charts', indexToRem, 1);
    }
  },

  initCharts: function(chartArr, config, filter) {
    let processor;
    if (!config.queries) {
      config.queries = [];
    }

    // function combineWith(index, str, prefix) {
    function combineWith(finalStr, str, index, prefix) {
      if (index == 0) {
        prefix = ''
      };
      return finalStr + ' ' + prefix + ' ' + str + ' ';
    }

    // function combineWithAnd(index, str) {
    function combineWithAnd(finalStr, str, index) {
      return combineWith(finalStr, str, index, 'AND');
    }

    // function combineWithOr(index, str) {
    function combineWithOr(finalStr, str, index) {
      return combineWith(finalStr, str, index, 'OR');
    }

    let newQuery = config.queries.filter(query => query.length).reduce((finalQuery, queryArr, index) => {
      if (queryArr.length) {
        return combineWithAnd(finalQuery, '(' + queryArr.reduce(combineWithOr, '') + ')', index);
      } else {
        return combineWithAnd(finalQuery, '', 0);
      }
    }, '');

    this._pargraphQuery = this.paragraphQuery + ' ' + newQuery;

    if (this.sourceVolume < this.crossfilterThreshold) {
      processor = this.$['cf-fe'];
    } else {
      processor = this.$['cf-be'];
      // move logic to crossfilter backend
    }
    this.lastModifiedBy = config.lastModifiedBy;
    processor.processData(filter, config.dimension).then(d => {
      console.log(d);
    });

    // move to processData by frontend
    let _source = config.dimension.filter(filter).top(Infinity);
    this.set('sourceVolume', _source.length);
    let charts = chartArr.map(chart => {
      chart.editMode = true;
      chart.source = _source;
      chart.externals = config.externals;
      return chart;
    });
    return {
      charts: charts,
      newDimension: config.dimension
    };
  },

  remTwoRows: function() {
    this.resetAllCharts();
  }
});
