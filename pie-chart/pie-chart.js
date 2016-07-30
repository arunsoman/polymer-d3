Polymer({
    is: 'pie-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'slice',
                txt: 'Pick a dimension',
                selectedValue: 0,
                selectedName: 'label',
                uitype: 'single-value'
            }, {
                input: 'sliceSize',
                txt: 'Pick a messure',
                selectedValue: 1,
                selectedName: 'count',
                uitype: 'single-value'
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: [{
                input: 'displayTxt',
                txt: 'Placement of lables',
                uitype: 'dropDown',
                selectedValue: Array,
                selectedName: Array,
                options: [{
                    key: 'None',
                    value: 0
                }, {
                    key: 'inside',
                    value: 1
                }, {
                    key: 'outside',
                    value: 2
                }]
            }, {
                input: 'innerRadius',
                txt: 'Inner radius',
                uitype: 'Number',
                selectedValue: 0
            },
            {
                input: 'height',
                txt: 'Height of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_heightChanged'
            },
            {
                input: 'width',
                txt: 'Width of the chart',
                uitype: 'Number',
                selectedValue: 300,
                notify: true,
                observer: '_widthChanged'
            }]
        },
        hideSettings: true,
        data: String,
        external:Array
    },
    _getHeight(){
        return this.settings[2].selectedValue;
    },
    _getWidth(){
        return this.settings[3].selectedValue;
    },
    _heightChanged: function(){
          this.svg.attr('height', height);
    },
    _widthChanged: function(){
        this.svg.attr('width', width);
    },
   
    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
        this.draw();
    },
    attached: function(){
        console.log("svg computed");
        var me = this;
        me.svg = d3.select('#chart')
          .append('svg')
          .append('g')
          .attr('transform', 'translate(' + (me._getWidth() / 2) + 
            ',' + (me._getHeight() / 2) + ')');

        me.tooltip = d3.select('#chart')
          .append('div')
          .attr('class', 'tooltip')        
          .append('div')
          .attr('class', me.inputs[0].selectedName)
          .append('div')
          .attr('class', me.inputs[1].selectedName)
          .append('div')
          .attr('class', 'percent');

    },

    draw: function(){
        'use strict';
        var me = this;
        var sliceHeader = this.inputs[0].selectedName;
        var sliceSizeHeader = this.inputs[1].selectedName;
        var radius = Math.min(me._getWidth(), me._getHeight()) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;
        var legendSpacing = 4;

        var color = d3.scaleOrdinal(d3.schemeCategory20b);

      
        var arc = d3.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.pie()
          .value(function(d) {
                return d[sliceSizeHeader]; 
            })
          .sort(null);

        
        var dataset = [];
        d3.csvParse(this.data, function(d) {
            d[sliceSizeHeader] = +d[sliceSizeHeader];
            d.emable = true;
            dataset.push(d);
        });

          var path = me.svg.selectAll('path')
            .data(pie(dataset))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d, i) { 
              return color(d.data[sliceHeader]); 
            })                                                        // UPDATED (removed semicolon)
            .each(function(d) { this._current = d; });                // NEW

          path.on('mouseover', function(d) {
            var total = d3.sum(dataset.map(function(d) {
              return (!d.enabled) ? d[sliceSizeHeader] : 0;                       // UPDATED
            }));
            var percent = Math.round(1000 * d.data[sliceSizeHeader] / total) / 10;
            me.tooltip.select('.label').html(d.data[sliceHeader]);
            me.tooltip.select('.count').html(d.data[sliceSizeHeader]); 
            me.tooltip.select('.percent').html(percent + '%'); 
            me.tooltip.style('display', 'block');
          });
          
          path.on('mouseout', function() {
            me.tooltip.style('display', 'none');
          });

          /* OPTIONAL 
          path.on('mousemove', function(d) {
            tooltip.style('top', (d3.event.pageY + 10) + 'px')
              .style('left', (d3.event.pageX + 10) + 'px');
          });
          */
            
          var legend = me.svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              var height = legendRectSize + legendSpacing;
              var offset =  height * color.domain().length / 2;
              var horz = -2 * legendRectSize;
              var vert = i * height - offset;
              return 'translate(' + horz + ',' + vert + ')';
            });

          legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)                                   
            .style('fill', color)
            .style('stroke', color)                                   // UPDATED (removed semicolon)
            .on('click', function(label) {                            // NEW
              var rect = d3.select(this);                             // NEW
              var enabled = true;                                     // NEW
              var totalEnabled = d3.sum(dataset.map(function(d) {     // NEW
                return (d.enabled) ? 1 : 0;                           // NEW
              }));                                                    // NEW
              
              if (rect.attr('class') === 'disabled') {                // NEW
                rect.attr('class', '');                               // NEW
              } else {                                                // NEW
                if (totalEnabled < 2) return;                         // NEW
                rect.attr('class', 'disabled');                       // NEW
                enabled = false;                                      // NEW
              }                                                       // NEW

              pie.value(function(d) {                                 // NEW
                if (d[sliceHeader] === sliceHeader) d.enabled = enabled;           // NEW
                return (d.enabled) ? d.count : 0;                     // NEW
              });                                                     // NEW

              path = path.data(pie(dataset));                         // NEW

              path.transition()                                       // NEW
                .duration(750)                                        // NEW
                .attrTween('d', function(d) {                         // NEW
                  var interpolate = d3.interpolate(this._current, d); // NEW
                  this._current = interpolate(0);                     // NEW
                  return function(t) {                                // NEW
                    return arc(interpolate(t));                       // NEW
                  };                                                  // NEW
                });                                                   // NEW
            });                                                       // NEW
            
          legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) { return d; });
      }
});