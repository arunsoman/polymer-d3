Polymer({
  is: 'zeppelin-cacher',
  properties: {
    crossfilterApi: {
      type: String
    },
    threshold: {
      type: Number,
      default: 1000
    }
  }
});
