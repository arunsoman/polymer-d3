var chartConfig = (conf, data, rowCallback) => {
    var xConf = {
        dataIndex: conf.xheader,
        domain: null,
        range: [0, conf.width],
        scale: null,
        axis: null,
        axisType: conf.xaxisType,
        xFormat: conf.xFormat,
        xAlign: conf.xAlign
    };
    var yConf = {
        dataIndex: conf.yheader,
        domain: null,
        range: [conf.height, 0],
        scale: null,
        axis: null,
        axisType: conf.yaxisType,
        yFormat: conf.yFormat,
        yAlign: conf.yAlign
    };
    var height = conf.height;
    var width = conf.width;
    var stackIndex = conf.stackIndex;
    var nonOrdinal = (index) => {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var map = d3.map();

        var group ={
            process: (datum) => {
                if (max < datum[index[0]]) {
                    max = datum[index[0]];
                }
                if (min > datum[index[0]]) {
                    min = datum[index[0]];
                }
            },
            getDomain: () => {
                return [(min <0)?min:0, max];
            }
        };
        var stack ={
            process: (datum) => {
                var stackKey = datum[stackIndex];
                var counter = map.get(stackKey);
                if(!counter){
                    counter = 0;
                }
                counter += datum[index[0]];
                map.set(stackKey, counter);
            },
            getDomain: () => {
                var dom = d3.extent(map.values());
                if(dom[0]> 0 ){
                    dom[0] = 0;
                }
                return dom;
            }
        };
        return(stackIndex) ? stack : group;
    };
    var findOrdinalFromHeader = (index) => {
        var myset = null;
        return {
            process: (aRow) => {
                if (myset == null) {
                    myset = aRow.filter((d, i) => {
                        return index.includes(i);
                    });
                }
            },
            getDomain: () => {
                return myset;
            }
        };
    };
    var findOrdinalFromCol = (index) => {
        var myset = [];
        return {
            process: (aRow) => {
                var aStr = aRow[index[0]].toString();
                if(myset.filter((p)=>{return p.toString() == aStr}).length == 0){
                    myset.push(aRow[index[0]]);
                }
            },
            getDomain: () => {
                return myset;
            }
        };
    };
    var computex;
    var computey;
    if (conf.containsHeader) {
        var header;
        header = data.shift();
        if (xConf.axisType == 'ordinal' && conf.xheader.length > 1) {
            computex = findOrdinalFromHeader(conf.xheader);
            computex.process(header);
        }
        if (yConf.axisType == 'ordinal' && conf.yheader.length > 1) {
            computey = findOrdinalFromHeader(conf.yheader);
            computey.process(header);
        }
    }
    if (!computex) {
        computex = (xConf.axisType == 'ordinal') ? findOrdinalFromCol(conf.xheader) : nonOrdinal(conf.xheader);
    }
    if (!computey) {
        computey = (yConf.axisType == 'ordinal') ? findOrdinalFromCol(conf.yheader) : nonOrdinal(conf.yheader);
    }
    data.forEach((aRow) => {
        computex.process(aRow);
        computey.process(aRow);
        if (rowCallback) {
            rowCallback(aRow);
        }
    });
    xConf.domain = computex.getDomain();
    yConf.domain = computey.getDomain();
    var _scaleFactory = (config) => {
        var barPadding = (!config.barPadding) ? .1 : config.barPadding;
        var align = config.align;
        if (!align) {
            throw new Error('config.align not defined values {v,h}');
        }
        var format = config.format;
        if (!format) {
            throw new Error('config.format undefined values{number, currency, percent, time, ordinal}');
        }
        var map = {
            'linear': d3.scale.linear()
                .range(((align === 'right') || (align === 'left')) ? 
                    [height, 0] : [0, width]),
            'time': d3.time.scale()
                .range(((align === 'right') || (align === 'left')) ? 
                    [height, 0] : [0, width]),
            'ordinal': d3.scale.ordinal()
                .rangeRoundBands(((align === 'right') || (align === 'left')) ? 
                    [height, 0] : [0, width], barPadding)
        };
        var scale = map[config.scaleType];
        try {
            scale.nice();
        } catch (error) {
            if (!scale) {
                throw 'invalid scaleType [' + config.scaleType + ']';
            }
        }
        if (config.domain) scale.domain(config.domain);
        return scale;
    };
    var _createAxisGroup = (config) => {
        if (!config.align) {
            throw new Error("config.align undefined, can't create axisGroup");
        }
        var axisG = conf.parentG.append('g');
        axisG.attr('class', config.align + ' axis');
        switch (config.align) {
        case 'top':
            break;
        case 'left':
            break;
        case 'right':
            axisG.attr('transform', 'translate(' + width + ', 0)');
            break;
        case 'bottom':
            axisG.attr('transform', 'translate(0,' + height + ')');
            break;
        }
        return axisG;
    };
    var _createAxis = (config) => {
        if (!config.align) {
            throw new Error("config.align undefined, can't create d3 axis");
        }
        var axis = d3.svg.axis().orient(config.align);
        return axis;
    };
    var _formateAxis = (config) => {
        if (!config.format) {
            throw new Error('config.format undefined values{number, currency, percent, time}');
        }
        if (config.format) {
            switch (config.format) {
            case 'number':
                return (d3.format('.2s'));
            case 'currency':
                return (d3.format('$.2s'));
            case 'percent':
                return (d3.format('.0%'));
            case 'string':
                return (d, i) => {
                    if (config.dataType === 'data') {
                        var dd = new Date(d);
                        return d3.time.format('%d-%b-%y')(dd);
                    } else return d;
                };
            case 'time':
                if (config.domain) {
                    var bound = config.domain;
                    if (d3.timeYear.count(bound[0], bound[1]) < 10) {
                        if (d3.timeMonth.count(bound[0], bound[1]) < 10) {
                            if (d3.timeWeek.count(bound[0], bound[1]) < 10) {
                                //todo
                                if (d3.timeDay.count(bound[0], bound[1]) < 10) {
                                    if (d3.timeHour.count(bound[0], bound[1]) < 240) {
                                        if (((d3.time.format('%H:%M')(bound[0])) === '00:00') && ((d3.time.format('%H:%M')(bound[1])) === '00:00')) {
                                            return (d3.time.format('%d-%b'));
                                        } else {
                                            return (d3.time.format('%a-%I-%M'));
                                        }
                                    } else {
                                        return (d3.time.format('%d-%b'));
                                    }
                                } else {
                                    return (d3.time.format('%d-%b'));
                                }
                            }
                        } else {
                            return (d3.time.format('%a-%b'));
                        }
                    } else {
                        return (d3.time.format('%b-%Y'));
                    }
                }
                return null;
            }
        }
    };
    var _createXAxis = () => {
        var config = {
            domain: xConf.domain,
            format: xConf.xFormat,
            align: xConf.xAlign,
            scaleType: xConf.axisType
        };
        xConf.scale = _scaleFactory(config);
        xConf.axis = _createAxis(config);
        var axisG = _createAxisGroup(config);
        xConf.axis.tickFormat(_formateAxis(config));
        xConf.axis.scale(xConf.scale);
        axisG.call(xConf.axis);
    };
    var _createYAxis = () => {
        var config = {
            domain: yConf.domain,
            format: yConf.yFormat,
            align: yConf.yAlign,
            scaleType: yConf.axisType
        };
        yConf.scale =_scaleFactory(config);
        yConf.axis = _createAxis(config);
        var axisG = _createAxisGroup(config);
        yConf.axis.tickFormat(_formateAxis(config));
        yConf.axis.scale(yConf.scale);
        axisG.call(yConf.axis);
    };
    _createXAxis();
    _createYAxis();
    console.log('xd:' + xConf.domain + ' yd:' + yConf.domain);
    return {
        getChartHeight: () => {
            return height;
        },
        getChartWidth: () => {
            return width;
        },
        getX: (x) => {
            return xConf.scale(x);
        },
        getY: (y) => {
            return yConf.scale(y);
        },
        getBarHeight: (h) => {
            switch (yConf.axisType) {
            case 'ordinal':
                return yConf.scale.rangeBand();
            default:
                return height - yConf.scale(h);
            }
        },
        getBarWidth: (w) => {
            switch (xConf.axisType) {
            case 'ordinal':
                return xConf.scale.rangeBand();
            default:
                return xConf.scale(w);
            }
        },
    };
};