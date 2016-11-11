Polymer({
  is: 'sankey-chart',
  properties: {
      title: '',
      inputs: {
          notify: true,
          type: Array,
          value: () => {
            return [{
              input: 'source',
              txt: 'Pick Source',
              selectedValue: [],
              scaleType: '',
              format: '',
              selectedObjs: [],
              uitype: 'single-value',
              displayName: 'Source',
              maxSelectableValues: 1
            }, {
              input: 'destination',
              txt: 'Pick Destination',
              selectedValue: [],
              format: '',
              scaleType: '',
              selectedObjs: [],
              uitype: 'multi-value',
              displayName: 'Destination',
              maxSelectableValues: 1
            }, {
              input: 'count',
              txt: 'Pick Count',
              selectedValue: [],
              format: '',
              scaleType: '',
              selectedObjs: [],
              uitype: 'multi-value',
              displayName: 'Count',
              maxSelectableValues: 1
            }, {
              input: 'units',
              txt: 'Enter Count',
              selectedValue: ['widget'],
              format: '',
              scaleType: '',
              selectedObjs: [],
              uitype: 'multi-value',
              displayName: 'Units',
              maxSelectableValues: 1
            }];
          }
      },
      settings: {
          notify: true,
          type: Array,
          value: []
      },
      source: {
        type: Array,
        value: [],
        notify: true
      },
      dataMutated: false,
      hideSettings: true,
      data: String,
      external: Array
  },
  behaviors: [
      PolymerD3.chartBehavior,
      PolymerD3.colorPickerBehavior
  ],

  _toggleView: function() {
      this.hideSettings = !this.hideSettings;
      this.chart = this.draw();
  },

  _createNodesAndLinks: function(){
    if(!this.dataMutated){
      var sourceIndex = this.getInputsProperty('source');
      var destinationIndex = this.getInputsProperty('destination');
      var countIndex = this.getInputsProperty('count');
      this.graph = {
        "nodes" : [],
        "links" : []
      };
      var graph = this.graph;

      this.source.forEach(function (d) {
        graph.nodes.push({ "name": d[sourceIndex] });
        graph.nodes.push({ "name": d[destinationIndex] });
        graph.links.push({ "source": d[sourceIndex],
                           "target": d[destinationIndex],
                           "value": d[countIndex] });
       });
      // return only the distinct / unique nodes
       graph.nodes = d3.keys(d3.nest()
         .key(function (d) { return d.name; })
         .map(graph.nodes));

       // loop through each link replacing the text with its index from node
       graph.links.forEach(function (d, i) {
         graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
         graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
       });

       //now loop through each nodes to make nodes an array of objects
       // rather than an array of strings
       graph.nodes.forEach(function (d, i) {
         graph.nodes[i] = { "name": d };
       });
       this.dataMutated = true;
    }
  },
  draw: function () {
    this.debounce('drawDebounce', () => {
      // Sankey mapper function gets overflowed in this condition
      if (this.getInputsProperty('source') === this.getInputsProperty('destination')) {
        return;
      }
      if (this.getInputsProperty('source') == null || this.getInputsProperty('destination') == null ||
        this.getInputsProperty('count') == null) {
        return false;
      }
      // this.makeChartWrap();
      this._createNodesAndLinks();
      var me = this;
      var units = this.getInputsProperty('units');
      var formatNumber = d3.format(",.0f");// zero decimal places
      var format = function(d) {
        return formatNumber(d) + " " + units;
      };
      var color = d3.scale.category20();

        var margin = this.getMargins();
        var width = this.chartWidth;
        var height = this.chartHeight;
        var sankey = d3.sankey(me).nodeWidth(36)
            .nodePadding(40)
            .size([width, height]);

        var path = sankey.link();

        sankey.nodes(this.graph.nodes)
            .links(this.graph.links)
            .layout(32);

        // add in the links
        var link = this.parentG.append("g").selectAll(".link")
            .data(this.graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

        // add the link titles
        link.append("title")
            .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value); });

        // add in the nodes
        var node = this.parentG.append("g").selectAll(".node")
            .data(this.graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function() {
                this.parentNode.appendChild(this); })
            .on("drag", dragmove));

      // add the rectangles for the nodes
        node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
          return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) {
          return d3.rgb(d.color).darker(2); })
            .append("title")
      .text(function(d) {
          return d.name + "\n" + format(d.value); });

      // add in the title for the nodes
        node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

      // the function for moving the nodes
        function dragmove(d) {
            d3.select(this).attr("transform", "translate(" + d.x + "," + ( d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    }, 500);
  }
});