Polymer({
  is: 'bullet-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
          input: 'title',
          txt: 'Title',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      },  {
          input: 'subtitle',
          txt: 'Subtitle',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 2
      },  {
          input: 'range1',
          txt: 'Range1',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      },  {
          input: 'range2',
          txt: 'Range2',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      },  {
          input: 'range3',
          txt: 'Range3',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      }, {
          input: 'measure1',
          txt: 'Measure 1',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      },  {
          input: 'measure2',
          txt: 'Measure 2',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      },  {
          input: 'marker',
          txt: 'Marker',
          selectedValue: -1,
          uitype: 'single-value',
          selectedObjs: [],
          scaleType: '',
          format:'',
          maxSelectableValues: 1
      }]
    },
    settings: {
      notify: true,
      type: Array,
      value: []
    },
    hideSettings: true,
    source: {
      type: Array,
      value: []
    },
    data: {
      type: Array,
      value: []
    },
    external: Array,
    svg: Object,
    sourceChanged: false
  },

  behaviors: [
    PolymerD3.chartBehavior,
    PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

  draw: function() {
    var me = this;
    me.makeChartWrap();
    if (me.getInputsProperty('title') === -1 ||
     me.getInputsProperty('range1') === -1 ||
     me.getInputsProperty('range2') === -1 ||
     me.getInputsProperty('range3') === -1 ||
     me.getInputsProperty('measure1') === -1 ||
     me.getInputsProperty('measure2') === -1 ||
      me.getInputsProperty('marker') === -1) {
      throw new Error('Inputs not selected');
    }

    var margin = me.getMargins();
    var width = me.getWidth() - margin.left - margin.right;
    var height = me.getHeight() - margin.top - margin.bottom;

    me._prepareData();
    var bulletHeight = (height / me.data.length) - margin.top;
    var chart = d3.bullet()
      .width(width)
      .height(bulletHeight);

    // To remove previously initialized SVG
    // Bullet chart needs 5 svg elems, previous elements causes some problems in  rendering

    me.chartWrap[0][0].removeChild(me.chartWrap[0][0].firstChild);

   var q = me
      .chartWrap
      .selectAll("svg")
      .data(me.data)
      .enter()
      .append("svg")
      .attr("class", "bullet")
      .attr("width", width + margin.left + margin.right)
      .attr("height", bulletHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(chart);

    me.svg = me.chartWrap.selectAll('svg');
    
    var g = me.svg.select('g');

    var title = g.append("g")
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + bulletHeight / 2 + ")");

    title.append("text")
      .attr("class", "title")
      .text(function(d) {
          return d.title;
      });

    title.append("text")
        .attr("class", "subtitle")
        .attr("dy", "1em")
        .text(function(d) {
            return d.subtitle;
        });

  },

  _prepareData: function() {
    var me = this;
    if (!me.sourceChanged) {
      me.source.forEach(function(d) {
        var temp = {};
        
        var ranges = [];
        ranges.push(+ d[me.getInputsProperty('range1')]);
        ranges.push(+ d[me.getInputsProperty('range2')]);
        ranges.push(+ d[me.getInputsProperty('range3')]);

        var measures = [];

        measures.push(+ d[me.getInputsProperty('measure1')]);
        measures.push(+ d[me.getInputsProperty('measure2')]);

        var markers = [];
        markers.push(+ d[me.getInputsProperty('marker')]);

        temp.title = d[me.getInputsProperty('title')];
        temp.subtitle = d[me.getInputsProperty('subtitle')];
        temp.ranges = ranges;
        temp.measures = measures;
        temp.markers = markers;
        me.data.push(temp);
      });
      me.sourceChanged = true;
    }
    
  }
});