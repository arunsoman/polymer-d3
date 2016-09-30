Polymer({
  is: 'pie-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: () => {
        return [{
          input: 'slice',
          txt: 'Pick a dimension',
          selectedValue: null,
          selectedObjs: [],
          selectedName: 'label',
          uitype: 'single-value',
          maxSelectableValues: 1
        }, {
          input: 'sliceSize',
          txt: 'Pick a mesaure',
          selectedValue: null,
          selectedObjs: [],
          selectedName: 'count',
          uitype: 'single-value',
          maxSelectableValues: 1
        }];
      }
    },
    // settings: {
    //   notify: true,
    //   type: Array,
    //   value: [{
    //     input: 'displayTxt',
    //     txt: 'Placement of lables',
    //     uitype: 'dropDown',
    //     selectedValue: Array,
    //     selectedName: Array,
    //     options: [{
    //         key: 'None',
    //         value: 0
    //     }, {
    //         key: 'inside',
    //         value: 1
    //     }, {
    //         key: 'outside',
    //         value: 2
    //     }]
    //   }, {
    //     input: 'innerRadius',
    //     txt: 'Inner radius',
    //     uitype: 'Number',
    //     selectedValue: 0
    //   }]
    // },
  },

  behaviors: [
    PolymerD3.chartBehavior
  ],

  draw: function() {
    this.debounce('pieChartDrawDeounce', () => {
      let slice = this.inputs[0].selectedValue;
      let sliceSize = this.inputs[1].selectedValue;
      // if slice exists, it would be an array
      if (!slice || !sliceSize) {
        return false;
      }
      slice = slice[0];
      sliceSize = sliceSize[0];

      let width = this.chartWidth,
        height = this.chartHeight,
        radius = Math.min(width, height) / 2;
      let innerRadius = 10; //me.getSettingsProperty("innerRadius");

      let color = d3.scale.category20c();

      let arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(innerRadius);

      let labelArc = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

      let pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
          return d[sliceSize];
        });

      this.parentG.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      let me = this;
      let g = this.parentG.selectAll(".arc")
        .data(pie(me.source))
        .enter().append("g")
        .attr("class", "arc");

      g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {
          return color(d.data[slice]);
        });

      g.append("text")
        .attr("transform", function(d) {
          return "translate(" + labelArc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .text(function(d) {
          return d.data[slice];
        });
    }, 400);
    //me.makeChartWrap();
  }
});