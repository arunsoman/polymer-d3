PolymerD3.axisBehavior = {
    attach: axis => {
        return {
            tickRotation:{
                tickRotation:0,
                rotateTicks: (degree, ta) => {
                    let textAnchor = ta || 'middle';
                    if (degree !== undefined) {
                        window.tickRotation = degree;
                    }
                    axis.selectAll('text')
                        .attr('transform', 'rotate(' + window.tickRotation + ')')
                        .attr("text-anchor", textAnchor)
                        .style("text-anchor", "");
                    return window.tickRotation;
                }
            },
            title: {
                axisTitle:null,
                axisTitleX:0,
                axisTitleY:0,
                axisTitleRotation:0,
                placeTitle: (title, x, y, degree) => {
                    window.axisTitle = (title === undefined) ? window.axisTitle : title;
                    window.axisTitleX = (x === undefined) ? window.axisTitleX : x;
                    window.axisTitleY = (y === undefined) ? window.axisTitleY : y;
                    window.axisTitleRotation = (degree === undefined) ? window.axisTitleRotation : degree;

                    var axisTitleG = axis.selectAll('.axis-title');
                    var axisTitleGUpdate = axisTitleG.data([1]);
                    var axisTitleGEnter = axisTitleGUpdate.enter().append('g').attr('class','axis-title');
                    axisTitleGEnter
                        .append('text').attr("text-anchor", "middle")
                        .attr("transform",
                            "translate(" + window.axisTitleX + "," + window.axisTitleY + ") rotate(" + window.axisTitleRotation + ')')
                        .text(window.axisTitle);
                    axisTitleGUpdate.selectAll('g').selectAll('text')
                                          .attr("transform",
                            "translate(" + window.axisTitleX + "," + window.axisTitleY + ") rotate(" + window.axisTitleRotation + ')')
                        .text(window.axisTitle);
                }
            },
            axisVisibility:{
                isAxisHidden: true,
                toggleAxisDisplay:() => {
                    window.isAxisHidden = !window.isAxisHidden;
                    return window.isAxisHidden;
                }
            }
        };
    },
};
