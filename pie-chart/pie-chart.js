Polymer({
    id: 'pie-chart',
    properties: {
        title: '',
        inputs: [{
            input: 'slice',
            txt: '',
            selectedValue: Array,
            selectedName: Array,
            type: 'single-value'
        }, {
            input: 'sliceSize',
            txt: '',
            selectedValue: Array,
            selectedName: Array,
            type: 'single-value'
        }],
        settings: [{
            input: 'displayTxt',
            txt: '',
            type: 'dropDown',
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
            txt: '',
            type: Number,
            selectedValue: 0
        }]
    }
});