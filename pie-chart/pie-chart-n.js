class pieChart extends Polymer.mixinBehaviors([],ReduxMixin(chartMixin(Polymer.Element))){
  static get is(){return"pie-chart"}



}
customElements.define(pieChart.is, pieChart)
