namespace("segments.Display", {
  "common.Sets":"Sets"
}, ({ Sets }) => {
  const segmentSpecs = {
    dim:[10,16],
    horizontal:[[4,1],[6,1],[7,2],[6,3],[4,3],[3,2]],
    vertical:[[1,4],[1,6],[2,7],[3,6],[3,4],[2,3]]
  }
  const allSegments = {
    "top": {
      orientation: "horizontal",
      offset: [0,0]
    },
    "middle": {
      orientation: "horizontal",
      offset: [0,6]
    },
    "bottom": {
      orientation: "horizontal",
      offset: [0,12]
    },
    "topLeft": {
      orientation: "vertical",
      offset: [0,0]
    },
    "topRight": {
      orientation: "vertical",
      offset: [6,0]
    },
    "bottomLeft": {
      orientation: "vertical",
      offset: [0,6]
    },
    "bottomRight": {
      orientation: "vertical",
      offset: [6,6]
    }
  };
  const segmentsByDigit = [
    ["top","topLeft","topRight","bottomLeft","bottomRight","bottom"],
    ["topRight","bottomRight"],
    ["top","topRight","middle","bottomLeft","bottom"],
    ["top","topRight","middle","bottomRight","bottom"],
    ["topLeft","topRight","middle","bottomRight"],
    ["top","topLeft","middle","bottomRight","bottom"],
    ["top","topLeft","middle","bottomLeft","bottomRight","bottom"],
    ["top","topRight","bottomRight"],
    ["top","topLeft","topRight","middle","bottomLeft","bottomRight","bottom"],
    ["top","topLeft","topRight","middle","bottomRight"],
  ].map(segmentList => Object.keys(allSegments).reduce((outval, name) => {
    outval[name] = (segmentList.indexOf(name) > -1);
    return outval;
  }, {}));
  const { parseTransitionKey, buildTransitionKey } = (function(){
    const transitionKeyDelimiter = "->";
    return {
      buildTransitionKey: (i,j) => [i,j].join(transitionKeyDelimiter),
      parseTransitionKey: (key) => key.split(transitionKeyDelimiter).map(digit => parseInt(digit))
    }
  })();
  const transitions = (function() {
    const allSegmentsList = Object.keys(allSegments);
    const outval = segmentsByDigit.reduce((acc, segments, i) => {
      for(var j = i + 1; j < segmentsByDigit.length; j++) {
        const otherSegments = segmentsByDigit[j];
        const transitions = {}
        const remove = allSegmentsList.filter(name => segments[name] && !otherSegments[name]);
        if (remove.length > 0) {
          transitions.remove = remove;
        }
        const add = allSegmentsList.filter(name => !segments[name] && otherSegments[name]);
        if (add.length > 0) {
          transitions.add = add;
        }
        acc[buildTransitionKey(i,j)] = transitions;
      }
      return acc;
    }, {});
    const toReverse = Object.keys(outval);
    const allTransitions = toReverse.reduce((acc, key) => {
      const [ i , j ] = parseTransitionKey(key);
      const { add, remove } = outval[key];
      const transitions = {}
      if ((remove || []).length > 0) {
        transitions.add = remove;
      }
      if ((add || []).length > 0) {
        transitions.remove = add;
      }
      acc[buildTransitionKey(j,i)] = transitions;
      return acc;
    }, outval);
    Object.entries(allTransitions).forEach(([key, transition]) => {
      const add = (transition.add || []);
      const remove = (transition.remove || []);
      transition.wholeMoves = Math.min(add.length, remove.length);
      const diff = add.length - remove.length;
      if (diff > 0) {
        transition.surplus = diff;
      } else if (diff < 0) {
        transition.deficit = Math.abs(diff);
      }
    })
    return allTransitions;
  })();
  console.log({ transitions });
  const getAllowableMoveCounts = function(allowableMoveCounts) {
    switch(typeof allowableMoveCounts) {
      case "number":
        return {
          addCount: allowableMoveCounts,
          removeCount: allowableMoveCounts
        };
      case "object":
        return {
          addCount: (allowableMoveCounts.addCount || 0),
          removeCount: (allowableMoveCounts.removeCount || 0)
        }
      default:
        throw typeof allowableMoveCounts;
    }
  }
  const getTransitionSets = function(number, allowableMoveCounts) {
    const { addCount, removeCount } = getAllowableMoveCounts(allowableMoveCounts);
    const digits = number.toString().split("").map(digit => parseInt(digit));
    const allTransitionKeys = Object.keys(transitions);
    const transitionKeysByDigit = digits.reduce((outval, digit) => {
      var keys = allTransitionKeys.filter(key => {
        const [i, _] = parseTransitionKey(key);
        return i == digit;
      });
      outval[digit] = keys.filter(key => {
        const { wholeMoves, deficit, surplus } = transitions[key];
        return (wholeMoves + (deficit || 0) <= removeCount) && (wholeMoves + (surplus || 0) <= addCount);
      });
      return outval;
    }, {});
    // 1. get power set of digits
    return Sets.powerSet(digits).filter(set => set.length > 0).reduce((acc,set) => {
      const setKey = set.join("");
      const transitionList = [[]];
      set.forEach(digit => {
        const transitionKeys = transitionKeysByDigit[digit];
        const tempList = Array.from(transitionList);
        transitionList.splice(0,transitionList.length);
        transitionKeys.forEach((key) => {
          tempList.forEach((temp) => {
            transitionList.push(temp.concat([key]));
          });
        });
      });
      const filteredTransitionList = transitionList.filter(transitionSet => {
        var { wholeMoves, deficit, surplus } = transitionSet.reduce((outval, transitionKey) => {
          const transition = transtions[transitionKey];
          ["wholeMoves", "deficit", "surplus"].forEach(prop => {
            outval[prop] = outval[prop] + transition.prop
          })
          return outval;
        }, { wholeMoves, deficit, surplus });
      // 2. iterate thru power sets to find combinations which equal allowable move count
        return (wholeMoves + (deficit || 0) == removeCount) && (wholeMoves + (surplus || 0) == addCount);
      });
      if( filteredTransitionList.length > 0) {
        // 3. map transition sets to numerical values
        acc[setKey] = filteredTransitionList
      }
    }, {});
    // 4. return map
  }
  const displayDefs = function() {
    const segmentNames = Object.keys(allSegments);
    return <svg width="0" height="0">
      <defs>
        { segmentNames.map(name => {
          const { orientation, offset } = allSegments[name];
          const [ offX, offY ] = offset
          const points = segmentSpecs[orientation];
          return <g id={name}>
            <polygon points={points.map(([x,y]) => `${ x + offX },${ y + offY }`).join(" ")}/>
          </g>;
        })}
      </defs>
    </svg>
  }
  const display = function(props){
    const [ dimX, dimY ] = segmentSpecs.dim;
    const segmentNames = Object.keys(allSegments);
    return <svg width="100%" height="100%" viewBox={`0 0 ${dimX} ${dimY}`}>
      { segmentNames.map(name => {
        const hasSegment = (segmentsByDigit[props.digit][name]);
        if (props.onClick) {
          return <a href="#" onClick={() => props.onClick(name)}>
            <use href={`#${name}`} fill={hasSegment?props.activeColor:props.passiveColor}/>
          </a>
        } else {
          return <use href={`#${name}`} fill={hasSegment?props.activeColor:props.passiveColor}/>
        }
      })}
    </svg>;
  }
  display.Defs = displayDefs
  return display;
});