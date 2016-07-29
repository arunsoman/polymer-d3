polymer({
    id: 'pie',
    properties: {
        title: '',
        inputs: [{
            input: 'slice',
            txt: '',
            index: Array,
            name: [],
            type: 'single-value'
        }, {
            input: 'sliceSize',
            txt: '',
            index: Array,
            name: [],
            type: 'single-value'
        }],
        settings: {
            displayTxt: {
                txt: '',
                type: 'dropDown',
                selectedValue: 0,
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
            },
            innerRadius: {
                txt: '',
                type: Number,
                value: 0
            },
            mouseOver: {
                txt: '',
                type: Object
            }
        }
    }
});