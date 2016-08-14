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
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'subtitle',
                txt: 'Subtitle',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 2
            }, {
                input: 'range1',
                txt: 'Range1',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'range2',
                txt: 'Range2',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'range3',
                txt: 'Range3',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'measure1',
                txt: 'Measure 1',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'measure2',
                txt: 'Measure 2',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
                maxSelectableValues: 1
            }, {
                input: 'marker',
                txt: 'Marker',
                selectedValue: -1,
                uitype: 'single-value',
                selectedObjs: [],
                scaleType: '',
                format: '',
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
    attached: function() {
        me = this;

        function callme(data) {
            me.source = data;
        }
        PolymerD3.fileReader('bullets.csv', [2,3,4,5,6,7], [], undefined, callme);
        me.inputs[0].selectedValue = 0;
        me.inputs[1].selectedValue = 1;
        me.inputs[2].selectedValue = 2;
        me.inputs[3].selectedValue = 3;
        me.inputs[4].selectedValue = 4;
        me.inputs[5].selectedValue = 5;
        me.inputs[6].selectedValue = 6;
        me.inputs[7].selectedValue = 7;
    },


    _toggleView: function() {
        this.hideSettings = !this.hideSettings;
    },

    draw: function() {
        var me = this;
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
        
        me._prepareData();
        var bulletHeight = (this.chartHeight / me.data.length) - margin.top;
        var chart = d3.bullet()
            .width(this.chartWidth)
            .height(bulletHeight);

        // To remove previously initialized SVG
        // Bullet chart needs 5 svg elems, previous elements causes some problems in  rendering

        shift = function(charts) {
          var scale = d3.scale.linear();
          scale.range([0, me.chartHeight]);
          scale.domain([0, charts]);
          var bI = 0; var tI = 0; var sI = 0;
          return (type)=>{
            var m = {
             'bullet':scale(bI++),
             'title':scale(tI++)
           }
           console.log("tI" + tI +": "+type + " bI:" + bI);
           return m[type];
          };
        }(me.data.length);

        translateBulletG = function(){
          var tt = shift('bullet');
          str = "translate(" + 0 + "," + tt + ")";
          console.log("tt= >" + str + "<" + tt);
          return str;
        }
        translateTitleG = function(){
         var tt = shift('title');
          str = "translate(" + 0 + "," + tt + ")";
          console.log("titleG= >" + str + "<" + tt);
          return str; 
        }

        var bulletSVG = this.parentG.selectAll('g').data(me.data);
            
        bulletSVG.enter()
            .append("g")
            .attr("class", "bulletG")
            .attr('transform', translateBulletG)
            .append("svg")
            .attr("class", "bullet")
            .call(chart);

        var title = bulletSVG.enter()
            .append("g")
            .style("text-anchor", "end")
            .attr("class", "titleG")
            .attr("transform", translateTitleG);

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

        bulletSVG.exit().remove();
    },

    _prepareData: function() {
        var me = this;
        if (!me.sourceChanged) {
            me.source.forEach(function(d) {
                var temp = {};

                var ranges = [];
                ranges.push(+d[me.getInputsProperty('range1')]);
                ranges.push(+d[me.getInputsProperty('range2')]);
                ranges.push(+d[me.getInputsProperty('range3')]);

                var measures = [];

                measures.push(+d[me.getInputsProperty('measure1')]);
                measures.push(+d[me.getInputsProperty('measure2')]);

                var markers = [];
                markers.push(+d[me.getInputsProperty('marker')]);

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