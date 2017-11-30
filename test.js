import './behaviors/colorpicker-behavior.js';
import './behaviors/chart-behavior.js';
import './bar-chart/bar-chart.js';
import './pie-chart/pie-chart.js';
import './waterfall-chart/waterfall-chart.js';
import './difference-chart/difference-chart.js';
import './bullet-chart/bullet-chart.js';
import './scatter-plot/scatter-plot.js';
import './namespace.js';
const $_documentContainer = document.createElement('div');
$_documentContainer.setAttribute('style', 'display: none;');
$_documentContainer.innerHTML = `<title>Document</title><bar-chart edit-mode="true"></bar-chart><bar-chart edit-mode="true"></bar-chart>`;
document.head.appendChild($_documentContainer);
var bar = document.querySelector('bar-chart');
bar.external = [{
  key: 'state',
  value: '0'
}, {
  key: 'Under Five Year',
  value: '1'
}, {
  key: 'Over five Year',
  value: '2'
}];
bar.source = [
  ['CA', 2704659, 4499890, 'A'],
  ['TX', 2027307, 3277946, 'B'],
  ['NY', 1208495, 2141490, 'C'],
  ['FL', 1140516, 1938695, 'D'],
  ['IL', 894368, 1558919, 'E']
];
