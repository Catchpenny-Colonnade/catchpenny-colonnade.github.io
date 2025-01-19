(function(){
  window.Deck = {
    getSVGSchematic:function() {
      return {
        "suitIcons": {
          "C": "M 3 0 h 2 l 1 1 v 2 l -1 1 h 2 l 1 1 v 2 l -1 1 h -1 l -1 -1 l 1 3 h -4 l 1 -3 l -1 1 h -1 l -1 -1 v -2 l 1 -1 h 2 l -1 -1 v -2 z",
          "D": "M 4 0 l 4 5 l -4 5 l -4 -5 z",
          "H": "M 2 0 l 2 2 l 2 -2 l 2 2 v 3 l -4 5 l -4 -5 v -3 z",
          "S": "M 4 0 l 4 5 v 2 l -1 1 h -1 l -1 -1 l 1 3 h -4 l 1 -3 l -1 1 h -1 l -1 -1 v -2 z"
        },
        "suitColors": {
          "C": "#000",
          "D": "#f00",
          "H": "#f00",
          "S": "#000"
        },
        "rankChars": {
          "2": "M 2 0 h 4 l 2 2 v 4 l -2 2 h -4 v 2 h 6 v 2 h -8 v -4 l 2 -2 h 4 v -4 h -4 v 2 h -2 v -2 z",
          "3": "M 2 0 h 4 l 2 2 v 8 l -2 2 h -4 l -2 -2 v -2 h 2 v 2 h 4 v -3 h -2 v -2 h 2 v -3 h -4 v 2 h -2 v -2 z",
          "4": "M 5 0 h 2 v 6 h 1 v 2 h -1 v 4 h -2 v -4 h -5 v -2 z m 0 3 l -3 3 h 3 z",
          "5": "M 0 0 h 8 v 2 h -6 v 2 h 4 l 2 2 v 4 l -2 2 h -4 l -2 -2 v -2 h 2 v 2 h 4 v -4 h -6 z",
          "6": "M 2 0 h 4 l 2 2 v 2 h -2 v -2 h -4 v 3 h 4 l 2 2 v 3 l -2 2 h -4 l -2 -2 v -8 z m 0 7 v 3 h 4 v -3 z",
          "7": "M 0 0 h 8 v 4 l -3 3 v 5 h -2 v -6 l 3 -3 v -1 h -6 z",
          "8": "M 2 0 h 4 l 2 2 v 3 l -1 1 l 1 1 v 3 l -2 2 h -4 l -2 -2 v -3 l 1 -1 l -1 -1 v -3 z m 0 2 v 2 l 1 1 h 2 l 1 -1 v -2 z m 0 6 v 2 h 4 v -2 l -1 -1 h -2 z",
          "9": "M 6 12 h -4 l -2 -2 v -2 h 2 v 2 h 4 v -3 h -4 l -2 -2 v -3 l 2 -2 h 4 l 2 2 v 8 z m 0 -7 v -3 h -4 v 3 z",
          "10": [
            "M 0 0 h 2 v 12 h -2 v -12 z",
            "M 6 0 h 2 l 2 2 v 8 l -2 2 h -2 l -2 -2 v -8 z m 0 2 v 8 h 2 v -8 z"
          ],
          "J": "M 0 0 h 8 v 10 l -2 2 h -4 l -2 -2 v -3 h 2 v 3 h 4 v -8 h -6 z",
          "Q": "M 2 0 h 4 l 2 2 v 6 l -1 1 l 1 1 v 2 h -2 v -2 h -4 l -2 -2 v -6 z m 0 2 v 6 h 4 v -6 z",
          "K": "M 0 0 h 2 v 5 l 4 -5 h 2 l -4 5 l 4 7 h -2 l -3 -5 h -1 v 5 h -2 z",
          "A": "M 2 0 h 4 l 2 2 v 10 h -2 v -5 h -4 v 5 h -2 v -10 z m 0 2 v 3 h 4 v -3 z"
        },
        "specials": {
          "J": "M 4 0 h 1 v 2 l 2 -2 l 1 2 v 3 l -1 2 l -2 -2 v 7 h -1 v -8 h -2 v -1 h 2 z",
          "K": [
            "M 1 2 l 2 3 l 2 -3 l 2 3 l 2 -3 v 7 h -8 z",
            "M 1 0 l 1 1 l -1 1 l -1 -1 z",
            "M 5 0 l 1 1 l -1 1 l -1 -1 z",
            "M 9 0 l 1 1 l -1 1 l -1 -1 z",
            "M 1 10 h 8 v 2 h -8 v -2 z"
          ],
          "Q": [
            "M 1 0 l 2 3 l 2 -3 l 2 3 l 2 -3 v 10 h -8 z",
            "M 1 11 h 8 v 1 h -8 v -1 z"
          ]
        },
        "rankLayouts": {
          "A": [3.5,[14.5,26.5]],
          "K": [2.5,[16,29]],
          "Q": [2.5,[16,29]],
          "J": [2.5,[16,29]],
          "2": [1.5,[22.5,11],[22.5,11,true]],
          "3": [1.5,[22.5,11],[22.5,36.5],[22.5,11,true]],
          "4": [1.5,[16,11],[29,11],[16,11,true],[29,11,true]],
          "5": [1.5,[16,11],[29,11],[22.5,36.5],[16,11,true],[29,11,true]],
          "6": [1.5,[16,11],[29,11],[16,36.5],[16,36.5],[29,36.5],[16,11,true],[29,11,true]],
          "7": [1.2,[16,11],[31.4,11],[23.7,24.5],[16,38],[31.4,38],[16,11,true],[31.4,11,true]],
          "8": [1.2,[16,11],[31.4,11],[23.7,24.5],[16,38],[31.4,38],[16,11,true],[31.4,11,true],[23.7,24.5,true]],
          "9": [0.9,[17,11],[32.8,11],[17,30],[32.8,30],[24.9,39.5],[17,11,true],[32.8,11,true],[17,30,true],[32.8,30,true]],
          "10": [0.9,[17,11],[32.8,11],[17,30],[24.9,20.5],[32.8,30],[17,11,true],[32.8,11,true],[24.9,20.5,true],[17,30,true],[32.8,30,true]]
        },
        "frames": {
          "suit": [8,10],
          "rank": [10,12],
          "special": [10,12],
          "card": [57,88]
        },
        "templates": {
          "cardFrame": {
            "$params": [],
            "$xml": [
              'g',
              { 'id': "cardFrame" },
              [ "rect", { "x": 1.5, "y": 1.5, "width": 54, "height": 85, "fill": "#fff" } ],
              [ "path", { "d": "M 2 0 h 53 l 2 2 v 84 l -2 2 h -53 l -2 -2 v -84 z m 0 2 v 84 h 53 v -84 z" } ]
            ]
          },
          "ghostCard":{
            "$params":["suit","suitColor"],
            "$xml":[
              "g",
              { "id": "ghost${$args.suit}"},
              [ "rect", { "x":1.5, "y":1.5, "width":54, "height":85, "fill": "#35654d" }],
              [ "path", {
                "d": "M 2 0 h 53 l 2 2 v 84 l -2 2 h -53 l -2 -2 v -84 z m 0 2 v 84 h 53 v -84 z",
                "fill":"none","stroke":"${$args.suitColor}","stroke-width":1.5,"stroke-dasharray": 2
              }],
              [ "use", {
                "xlink:href":"#suit${$args.suit}","transform":"translate(14.5,26.5) scale(3.5)","fill":"none","stroke":"${$args.suitColor}","stroke-width":0.75,"stroke-dasharray": 0.25
              }]
            ]
          },
          "emptyPile":{
            "$params":[],
            "$xml":[
              "g",
              { "id": "emptyPile"},
              [ "rect", { "x":1.5, "y":1.5, "width":54, "height":85, "fill": "#35654d" }],
              [ "path", {
                "d": "M 2 0 h 53 l 2 2 v 84 l -2 2 h -53 l -2 -2 v -84 z m 0 2 v 84 h 53 v -84 z","fill":"none","stroke":"lightgrey","stroke-width":1.5,"stroke-dasharray": 2
              }]
            ]
          },
          "backBG": {
            "$params":[],
            "$xml":[
              'pattern',
              { 'id': "backbg", 'viewBox':"0,0,2,2", "x":6.5, "y":6, "width": 16, "height": 16, "patternUnits": "userSpaceOnUse" },
              [ "path", { "d": "M 0 0 h 1 l -1 1 z m 0 2 l 2 -2 v 1 l -1 1 z", "style": "fill: #00f" } ]
            ]
          },
          "back": {
            "$params":[],
            "$xml":[
              'g',
              { 'id': 'cardBack' },
              [ "use", { "xlink:href": "#cardFrame" } ],
              [ "rect", { "x": 7, "y": 7, "width": 43, "height": 74, "fill": "url(#backbg)" } ],
              [ "rect", { "x": 7, "y": 7, "width": 43, "height": 74, "style": "fill: none; stroke: #00f; stroke-width: 2px" } ]
            ]
          },
          "symbol": {
            "$params": ["id","width","height","paths"],
            "$xml":[
              "symbol",
              {
                "id": "${$args.id}",
                "width": "${$args.width}",
                "height": "${$args.height}",
              },
              [
                "$for",
                { "$each": "paths", "$as": "path" },
                [ "path", { "d": "${ $args.path }" } ]
              ]
            ]
          },
          "index": {
            "$params": ["rank","suit"],
            "$xml": [
              "symbol",
              { "id": "index${$args.rank}${$args.suit}" },
              [ "use", { "xlink:href": "#rank${$args.rank}", "x": 6, "y": 6 } ],
              [ "use", { "xlink:href": "#suit${$args.suit}", "x": 6, "y": 20 } ]
            ]
          },
          "card": {
            "$params": ["rank","suit","suitColor","rotate","scale","isFaceCard","rankLayouts","buildTransform"],
            "$xml": [
              "g",
              { "id": "card${$args.rank}${$args.suit}" },
              [ "use", { "xlink:href": "#cardFrame" } ],
              [ "g", { "style": "fill: ${$args.suitColor};" },
                [ "use", { "xlink:href": "#index${$args.rank}${$args.suit}" } ],
                [ "use", { "xlink:href": "#index${$args.rank}${$args.suit}", "transform": "${$args.rotate}" } ],
                [
                  "$for",
                  { "$each": "rankLayouts", "$as": "rankLayout" },
                  [
                    "use",
                    {
                      "xlink:href": "${$args.isFaceCard?('#special'+$args.rank):('#suit'+$args.suit)}",
                      "transform": "${$args.buildTransform($args.rankLayout,$args.rank,$args.suit,$args.scale)}"
                    }
                  ]
                ]
              ]
            ]
          }
        }
      };
    }
  };
})();
