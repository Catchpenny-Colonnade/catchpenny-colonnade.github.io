(function(){
    let suits = [ "C", "D", "H", "S" ];
    let ranks = [ "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K" ];
    let splitCard = function(card) {
        let lastIndex = card.length - 1;
        let suit = card.charAt(lastIndex);
        return [card.slice(0,lastIndex),suit];
    }
    let buildBuildTransform = function(rotate) {
        return function([x,y,rotateQ],rank,suite,scale) {
            return `${ rotateQ ? rotate + ' ' : '' }translate( ${ x }, ${ y } ) scale( ${ scale } )`;
        };
    };
    let buildDefs = function(schematic) {
        let { templates } = schematic;
        templates = Object.entries(templates).reduce((out,[k,v]) => {
            out[k] = new JsXTemplate(v);
            return out;
        }, {});
        let [ cardWidth, cardHeight ] = schematic.frames.card;
        let rotate = `rotate( 180, ${ cardWidth / 2 }, ${ cardHeight / 2 } )`;
        let buildTransform = buildBuildTransform(rotate);
        let defs = ['defs'];
        defs = defs.concat(templates.cardFrame.press()).concat(templates.backBG.press()).concat(templates.back.press()).concat(templates.emptyPile.press());
        Object.entries(schematic.suitIcons).forEach(([suit,path]) => {
            let [ width, height ] = schematic.frames.suit;
            defs = defs.concat(templates.symbol.press(`suit${suit}`,width,height,[path]));
            defs = defs.concat(templates.ghostCard.press(suit,schematic.suitColors[suit]));
        });
        Object.entries(schematic.rankChars).forEach(([rank,paths]) => {
            paths = Array.isArray(paths) ? paths : [paths];
            let [ width, height ] = schematic.frames.rank;
            defs = defs.concat(templates.symbol.press(`rank${rank}`, width, height, paths));
        });
        Object.entries(schematic.specials).forEach(([rank,paths]) => {
            paths = Array.isArray(paths) ? paths : [paths];
            let [ width, height ] = schematic.frames.special;
            defs = defs.concat(templates.symbol.press(`special${rank}`, width, height, paths));
        });
        ranks.forEach((rank) => {
            let layouts = schematic.rankLayouts[rank];
            let scale = layouts[0];
            layouts = layouts.slice(1);
            let isFaceCard = !!(schematic.specials[rank]);
            suits.forEach((suit) => {
                defs = defs.concat(templates.index.press(rank,suit)).concat(templates.card.press(rank,suit,
                    schematic.suitColors[suit],rotate,
                    scale,isFaceCard,layouts,buildTransform));
            });
        });
        let defssvg = [ 'svg', { width: 0, height: 0 }, defs ];
        return new jHiccup(defssvg).toString();
    }
    let useCard = function(cardId,addlAttrs) {
        addlAttrs = addlAttrs || {};
        let attrs = Object.entries(addlAttrs).reduce((out,[k,v]) => {
            out[k] = v;
            return out;
        },{});
        attrs["xlink:href"] = `#${cardId}`;
        return [ "use", attrs ];
    }
    let buildCardId = function(rank,suit) {
        return `card${rank}${suit}`;
    }
    let useCardTpl = function(rank,suit) {
        return useCard(buildCardId(rank,suit),{ class:"cardFace" });
    }
    let useGhostCard = function(suit) {
        return useCard(`ghost${suit}`,{ class:"ghostCard" });
    }
    let useEmptyPile = function() {
        return useCard("emptyPile",{ class:"emptyPile" });
    }
    let useCardBack = function() {
        return useCard("cardBack",{ class:"cardBack" });
    }
    window.DeckedOut = function(schematic){
        let defs = buildDefs(schematic);
        this.getDefs = function(){
            return defs;
        };
        this.getSuits = function(){
            return suits;
        };
        this.getRanks = function(){
            return ranks;
        };
        this.useCardBack = useCardBack;
        this.useEmptyPile = useEmptyPile;
        this.useGhostCard = useGhostCard;
        this.useCard = function(card) {
            let [ rank, suit ] = splitCard(card);
            return useCardTpl(rank, suit);
        };
    }
})();