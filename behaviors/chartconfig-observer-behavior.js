PolymerD3.chartconfigObserver = {
  observers: [ '_inputsWatcher(inputs.*)', '_sourceWatcher(source.*)'],

  _settingsWatcher: function() {
    throw Error('method not implemented yet');
  },

  _inputsWatcher: function(inputs) {
    let me = this;
    // To avoid calling draw on initation
    if (inputs.path === 'inputs') {
      return;
    }
    me.draw();
  },

  // Draw when datasource is avialable
  _sourceWatcher: function(source) {
    var me = this;
    if (source.path === 'source') {
      me.draw();
    }
  },
  addLegend: function(domain, color){
   // draw legend
    var legend = this.parentG.selectAll(".legend")
      .data(domain)
    //.data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { 
        return "translate(0," + i * 20 + ")"; 
      });

    // draw legend colored rectangles
    legend.append("rect")
      .attr("x", this.chartWidth - 18)
      .attr("width", 18)
      .attr("height", 18)
      //TODO where did the color came from ?
      .style("fill", color);

    // draw legend text
    legend.append("text")
      .attr("x", this.chartWidth - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { 
        return d;
      });
  }
};
