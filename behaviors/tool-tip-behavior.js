PolymerD3.toolTipBehavior = {
    attachToolTip: (parentG, elem, customClass, htmlCallback) => {
        let tip = d3.tip()
            .attr('class', 'd3-tip '+ customClass)
            .offset([-8, 0])
            .html(htmlCallback);
        parentG.call(tip);

        elem.on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }
};
