PolymerD3.colorPickerBehavior = {
  properties: {
    color: {
      type: Array,
      value: [{
          input: 'colorRange',
          txt: 'Color range',
          uitype: 'colorRangePicker',
          from: "#aad",
          to: "#556",
          notify: true,
          observer: '_colorRangeChanged'
      }]
      },
      // pointer: this.area,
  },
  attached: function() {
      PolymerD3.utilities.merge.apply(this, ['settings', 'color']);
  }
};
