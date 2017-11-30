const chartInitialState = {
    data:{},
    charts:{},
    commonsettings:{}
}

const chartAppReducer = (state, action) => {
    state = state || chartInitialState
    let chartObj = {
        data:chartDataReducer(state.data,action),
        charts: chartReducer(state.charts, action),
        commonsettings: chartCommonSettings(state.commonsettings,action)
    }
    return chartObj
}

const chartReducer = (state, action) =>{
    switch (action.type) {
        case 'ADD_CHART':
            return Object.assign({},state,{[action.value.id]:action.value})
        case 'UPDATE_CHART':
            if(!state[action.value.id]){
              return Object.assign({},state,{[action.value.id]:action.value})
            }else{
              return state;
            }
        case 'ADD_UPDATE_CHART_INPUTS':
          return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
            state[action.value.uuid],{
              inputs:Object.assign({},state[action.value.uuid].inputs,{
                [action.value.objKey]:action.value.input
              })
            })})
        case 'REMOVE_CHART_INPUTS':
          return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
            state[action.value.uuid],{
              inputs:Object.assign({},Object.keys(state[action.value.uuid].inputs).reduce((prev,next)=>{
                if(next!=action.value.objKey){
                  prev[next]=state[action.value.uuid].inputs[next]
                }
                return prev
              },{}))
            })})
        case 'UPDATE_SETTINGS':
          return Object.assign({},state,{
            [action.value.id]:Object.assign({},state[action.value.id],{
              settings: action.value.settings
            }
            )})
        case 'UPDATE_CHART_LEGENDS':
            return Object.assign({},state,{
            [action.value.id]:Object.assign({},state[action.value.id],{
              chartkeys: Object.assign({},state[action.value.id].nodes,action.value.nodes)
            })
          })
          // case 'ADD_UPDATE_COMPOSITE_CHART_DATA':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       compositeChartData:action.value.chartData
          //     })})
          // case 'COMPOSITE_SPLIT_AREA_CHK':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       layoutAreaChk:action.value.layoutAreaChk
          //     })})
          // case 'CHART_AVAILABLE_MODAL_CHK':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       chartAvailableModalChk:action.value.chartAvailableModalChk
          //     })})
          // case 'CURRENT_NESTED_OBJ':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       currentNestedObj:action.value.currentNestedObj
          //     })})

          // case 'COMP_CHART_UUID_CHK':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       compChartUUIDChk:action.value.compChartUUIDChk
          //     })})
          // case 'UPDATE_READ_ONLY':
          //   return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
          //     state[action.value.uuid],{
          //       readOnly:action.value.readOnly
          //     })})
          case 'CURRENT_CHART_DELETED':
            delete state[action.value.uuid]
            // return state
            return  Object.assign({},state)
          case 'ADD_COMP_REFRENCE_SRC':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                refrenceSrc:action.value.refrenceSrc
              })})
          case 'COMP_FILTER_CHK':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                compfilterChk:action.value.compfilterChk
              })})
            case 'COMP_FILTER_GBL_CHK':
              return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
                state[action.value.uuid],{
                  compfilterGblChk:action.value.compfilterGblChk
                })})

          case 'ADD_FILTER_IDX':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                filterIdx:action.value.filterIdx
              })})
          case 'ADD_REFRENCE_IDS_GBL':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                refIds:action.value.refIds
              })})
          case 'ADD_FILTER_IDX_GBL':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                filterIdxGbl:action.value.filterIdxGbl
              })})
          case 'COMP_FILTER_KEYS':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                filterKeys:action.value.filterKeys
              })})
          case 'COMP_FILTER_DBL_CLICK':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                dblClick:action.value.dblClick
              })})
          case 'COMP_FILTER_RELOAD':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                filterReload:action.value.filterReload
              })})
          case 'COMP_FILTER_LAST_ACTIVATED':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                lastFilterActivated:action.value.lastFilterActivated
              })})
          case 'COMP_AXIS_XYZ':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                itemXYZ:action.value.itemXYZ
              })})
          case 'IS_COMPOSITE_CHART':
            return  Object.assign({},state,{isCompsiteChart:action.value.isCompsiteChart})
          case 'NEW_ITEM_CHK':
            return  Object.assign({},state,{newItemChk:action.value.newItemChk})
          case 'UPDATE_LAYOUT_ITEM':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                layoutData:action.value.layoutData
              })})
          case 'CHART_BOX_DELETED':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                deleteTrigger:action.value.deleteTrigger
              })})
          case 'CHART_RE_DRAW':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                chartReDraw:action.value.chartReDraw
              })})

          case 'COMP_CHART_RE_LOAD':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                compChartReload:action.value.compChartReload
              })})

          case 'CHART_INDEX_UPDATE':
            return  Object.assign({},state,{[action.value.uuid]:Object.assign({},
              state[action.value.uuid],{
                chartIndex:action.value.chartIndex
              })})
          case 'UPDATE_LEGEND':
            debugger;

        default:
            return state;
    }
}

const chartDataReducer = (state,action)=>{
  switch(action.type){
    case"UPDATE_EXTERNALS":
      return Object.assign({},state,{
        [action.value.id]:Object.assign({},state[action.value.id],{externals:action.value.externals})
      });
    case"UPDATE_SOURCE":
      return Object.assign({},state,{
        [action.value.id]:Object.assign({},state[action.value.id],{source:action.value.source})
      });
      case 'EXPORT_FILTER_DATA':
        return  Object.assign({},state,{[action.value.id]:Object.assign({},
          state[action.value.id],{
            exportFilterData:action.value.exportFilterData
          })})
    default:
        return state;
  }
}
const chartCommonSettings = (state,action)=>{
  switch(action.type){
    case "ADD_COMMON_SETTINGS":
      return Object.assign({},state,{commonsettings:action.value.settings});
    default:
      return state;
  }
}

// const store = Redux.createStore(chartAppReducer)

const chartStore = Redux.createStore(  chartAppReducer,  chartInitialState,
  Redux.compose(window.devToolsExtension ? window.devToolsExtension() : v => v)
);

ReduxMixinBehavior = PolymerRedux(chartStore)
