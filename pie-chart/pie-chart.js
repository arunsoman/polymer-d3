Polymer({
    is: 'pie-chart',
    properties: {
        title: '',
        inputs: {
            notify: true,
            type: Array,
            value: [{
                input: 'slice',
                txt: '',
                selectedValue: Array,
                selectedName: Array,
                uitype: 'single-value'
            }, {
                input: 'sliceSize',
                txt: '',
                selectedValue: Array,
                selectedName: Array,
                uitype: 'single-value'
            }]
        },
        settings: {
            notify: true,
            type: Array,
            value: [{
                input: 'displayTxt',
                txt: '',
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
                txt: '',
                uitype: Number,
                selectedValue: 0
            }]
        }
    }
});