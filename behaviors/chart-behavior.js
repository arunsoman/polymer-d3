import './chartconfig-observer-behavior.js';
import './chart-config-behavior.js';
import './legend-behavior.js';
import './tool-tip-behavior.js';
import './draggable-behavior.js';
import './draggable-svg-behavior.js';
import './chart-config-cb-behaviour.js';
PolymerD3.chartBehavior = [
  PolymerD3.chartConfigBehavior,
  PolymerD3.chartconfigObserver,
  PolymerD3.toolTipBehavior,
  PolymerD3.legendBehavior,
  PolymerD3.draggableBehavior,
  PolymerD3.draggableSvgBehavior
];
