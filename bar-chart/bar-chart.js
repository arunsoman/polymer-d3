Polymer({
  is: 'bar-chart',
  properties: {
    title: '',
    inputs: {
      notify: true,
      type: Array,
      value: [{
        input: 'x',
        txt: 'Pick a dimension',
        selectedValue: [],
        scaleType: '',
        format:'',
        selectedObjs: [{
          key: 'state',
          value: '0'
        }],
        uitype: 'single-value',
        maxSelectableValues: 1
      }, {
        input: 'y',
        txt: 'Pick measures',
        selectedValue: [],
        format:'',
        scaleType: '',
        selectedObjs: [{
          key: 'Under Five Year',
          value: '1'
        }],
        uitype: 'multi-value',
        maxSelectableValues: 2
      }, {
        input: 'z',
        txt: 'Pick measures',
        selectedValue: [],
        format:'',
        scaleType: '',
        selectedObjs: [{
          key: 'Under Five Year',
          value: '1'
        }],
        uitype: 'multi-value',
        maxSelectableValues: 2
      }]
    },
    settings: {
      notify: true,
      type: Object,
      value: {}
    },
    hideSettings: true,
    source: Array,
    external: Array,
    chart: Object,
    dataMutated: false,    
    isStack: {
            value : false,
            type: Boolean
    },
    layers:{
      type: Object
    }

  },

  behaviors: [
    PolymerD3.chartBehavior
    // PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
    this.hideSettings = !this.hideSettings;
  },

    attached: function() {
        me = this;
        this._loadSingleCol();
        //this._loadMultiCol();
    },

    _callme: function(data) {
        me.source = data;
    },

    _loadMultiCol: function(){
        PolymerD3.fileReader("ms.csv", [1, 2, 3], [0], "%Y%m%d", this._callme);
      this.inputs[0].selectedValue = 0;
      this.inputs[0].name = 'time';
      this.inputs[1].selectedValue  = [1,2,3];
      this.inputs[1].name = ['New York','San Francisco', 'Austin']; 
      this.layers = undefined;
    },
    _loadSingleCol: function(){
        PolymerD3.fileReader('area.csv', [1], [2], "%m/%d/%y", this._callme, true);
        this.inputs[0].selectedValue = 2;
        this.inputs[1].selectedValue = [1];
        this.inputs[2].selectedValue = 0;
        this.layers = undefined;
    },
    draw: function(){
        me = this;
        var xIndex = this.getInputsProperty('x');
        var yIndices = this.getInputsProperty('y');
        var zIndex = this.getInputsProperty('z');
        if (xIndex == -1 || yIndices.length == 0) {
            return;
        }
        var data = this.source;
        var stats = PolymerD3.summarizeData(data, 
            xIndex, 'ordinal', yIndices, 'number', 
            me.isStack, zIndex);
        var xBound = stats.getXDomain();
        var yBound = stats.getYDomain();

        var config = {'scaleType':"time", 
        'align':'h', 'format':'time', 'position':'bottom','domain':xBound};
        var xAxis = me.createAxis(config);

        config = {'scaleType':"linear", 
        'align':'v', 'format':'currency', 'position':'left','domain':[0, yBound[1]]};
          var yAxis = me.createAxis(config);

//        y.domain([0, maxY]);
        var y = yAxis.scale();
        var x = xAxis.scale();        
        var z = d3.scale.category10();
        me.layers = stats.getStack();
        /*
        if(! me.layers){
            if(yIndices.length == 1){
                me.layers = this._getLayersSingleColArea(x,y,z,xIndex,yIndices,zIndex);
            }else{
                me.layers = this._getLayersMultiColArea(x,y,z,xIndex,yIndices,zIndex);
            }
        }
        */
        this._drawGroup(z);
    },
    _getLayersSingleColArea: function(x,y,z, xIndex, yIndices, zIndex){
        me = this;
        if(me.isStack)
        var data = this.source;

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d.values;
            })
            .x(function(d) {
                return d[xIndex];
            })
            .y(function(d) {
                return d[yIndices[0]];
            });

        var nest = d3.nest()
            .key(function(d) {
                return d[zIndex];
            });

        var groupBy = nest.entries(data);
        var layers = stack(groupBy);
        return layers;

    },
    _getLayersMultiColArea: function(x,y,z, xIndex, yIndices, zIndex){
        me = this;
        var data = this.source;

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) {
                return d;
            })
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });

        //var groupBy = nest.entries(data);
        var ds = [];
        yIndices.forEach((d)=>{
            var temp = [];
            me.source.forEach((s)=>{
                temp.push( [ s[xIndex], s[d] ])
            });
            ds.push(temp);
        })
        
        var layers = stack(ds);
        return layers;
    },
    _drawGroup: function(z){

      var sets = this.parentG.selectAll(".set") 
        .data(me.layers[0].values) 
        .enter()
        .append("g")
        .attr("class","set")
        .attr("transform",function(d,i){
             return "translate(" + xScale(i) + ",0)";
         });
        debugger;
      me.layers[0].values.forEach((dt,index) =>{
          var newData = [];
          me.layers.forEach((key, keyIndex)=>{newData.push()});
          sets.data(me.layers)
            .enter()
            .append("rect")
            .attr("class","local")
            .attr("width", xScale.rangeBand()/me.layers.length)
            .attr("y", function(d) {
                return yScale(d.local);
            })
            .attr("x", (d,i)=>{ return xScale.rangeBand()/2})
            .attr("height", function(d){
                return h - yScale(d.local);
            })
            .attr("fill", (d,i)=>{return z(i);})
      })
    },
});
