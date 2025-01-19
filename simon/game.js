(function(){
    let ceottk = [["D", 4], ["E", 4], ["C", 4], ["C", 3], ["G", 3]];
    let applyProperties = function(from,to) {
        Object.entries(from).forEach(([k,v]) => {
            to[k] = v;
        });
        return to;
    }
    let playBeeps = function(beeper,sequence,defaults) {
        let args = {};
        let first = sequence[0];
        let next = sequence.slice(1);
        if ((typeof first) === 'number') {
            first = { frequency: first };
        }
        applyProperties(first,args);
        applyProperties(defaults,args);
        if (sequence.length > 1) {
            args.callback = (() => {
                playBeeps(beeper,next,defaults);
            });
        }
        if (args.after) {
            let callback = args.callback;
            args.callback = (() => {
                args.after();
                callback();
            });
        }
        if (sequence.length > 1 && (typeof args.rest)=== 'number' && args.rest > 0) {
            let callback = args.callback;
            args.callback = (() => { setTimeout(callback,args.rest * 1000); });
        }
        if (args.before) { args.before(); }
        beeper.beep(args);
    };
    let config = {
        tones: { green: 415, red: 310, yellow: 252, blue: 209 },
        loserTone:{
            frequency: 42,
            duration: 1.5
        },
        inGameTimeOut:(3 * 60),
        victoryTone: { // after each level is completed, use last color
            delay: 0.8,
            times: [ 0.02, 0.07, 0.07, 0.07, 0.07, 0.07 ],
            rest: 0.02
        },
        finalVictory:{ // after final level
            duration: 0.1,
            rest: 0.02,
            order: [ "red", "yellow", "blue", "green" ],
            steps: [{
                tone: "${config.tones[color]}",
                count: 14,
            },{
                tone: "${config.loserTone.frequency}",
                count: 8
            }]
        },
        sequence: {
            maxLength: 31,
            rest: 0.05,
            difficulties: [
                {
                    minLength: 1,
                    maxLength: 5,
                    duration: 0.42
                },
                {
                    minLength: 6,
                    maxLength: 13,
                    duration: 0.32
                },
                {
                    minLength: 14,
                    maxLength: 31,
                    duration: 0.22
                },
            ]
        }
    }
    config.difficulties = config.sequence.difficulties.reduce((out,{minLength,maxLength,duration}) => {
        for (let i = minLength; i <= maxLength; i++) {
            out[i] = duration;
        }
        return out;
    }, {});
    config.finalVictory.sequence = (function(){
        return config.finalVictory.steps.reduce((out,{ tone, count },index) => {
            return out.concat("?".repeat(count).split("").map(() => {
                return { tone, index };
            }));
        }, []).map(({ tone, index }, seqIndex) => {
            let color = config.finalVictory.order[seqIndex % 4];
            let frequency = eval('`' + tone + '`');
            return { frequency, color, index };
        });
    })();
    window.init = function() {
        let beeper = new Beeper({type:"triangle",volume:1})
        let gameState = {
            status: "open",
            rects:{},
            links:{}
        };
        let resetToOpen = function() {
            delete gameState.sequence;
            delete gameState.step;
            gameState.status = 'open';
        }
        let timeouter = new Timeouter(config.inGameTimeOut * 1000,() => {
            alert("Game has timed out! You lose!");
            resetToOpen();
        });
        let activate = function(color) {
            gameState.rects[color].classList.add("active");
        }
        let deactivate = function(color) {
            gameState.rects[color].classList.remove("active");
        }
        let pressColor = function(color) {
            gameState.stopBeep = beeper.startBeep({ frequency: config.tones[color] });
            activate(color);
        }
        let releaseColor = function(color) {
            deactivate(color);
            gameState.stopBeep();
        }
        let buildBeepArgsFrom = function(color,obj) {
            obj = obj || {};
            return applyProperties(obj,{
                frequency: config.tones[color],
                before: () => { activate(color); },
                after: () => { deactivate(color); }
            });
        }
        let victory = function(color,callback) {
            let rest = config.victoryTone.rest;
            playBeeps(beeper,config.victoryTone.times.map((duration) => buildBeepArgsFrom(color,{ duration })),{ rest, callback });
        }
        let finalVictory = function() {
            let { duration, rest } = config.finalVictory;
            let callback = (() => {
                alert("YOU'VE BEATEN SIMON! YOU WIN!");
                resetToOpen();
            });
            playBeeps(beeper,config.finalVictory.sequence.map(({ frequency, color, index }) => buildBeepArgsFrom(color, { frequency })),{ duration, rest, callback });
        }
        let stepSequence = function() {
            if (gameState.sequence.length >= config.sequence.maxLength) {
                timeouter.clear();
                finalVictory();
            } else {
                gameState.status = "show";
                gameState.sequence.push(Object.keys(config.tones)[Math.floor(4 * Math.random())]);
                alert("Level " + gameState.sequence.length + ", pay attention to the pattern ...");
                playBeeps(beeper,gameState.sequence.map((color) => buildBeepArgsFrom(color)),{
                    duration: config.difficulties[gameState.sequence.length],
                    rest: config.sequence.rest,
                    callback: () => {
                        timeouter.reset();
                        gameState.status = "play";
                        gameState.step = 0;
                        alert("Can you repeat the pattern?");
                    }
                });
            }
        }
        let validateChoice = function(color) {
            gameState.status = "validating";
            if (color !== gameState.sequence[gameState.step]) {
                resetToOpen();
            } else {
                gameState.step++;
                if (gameState.step >= gameState.sequence.length) {
                    victory(color,() => {
                        stepSequence();
                    });
                } else {
                    gameState.status = "play";
                }
            }
        }
        let startNewGame = function() {
            console.log("start game");
            playBeeps(beeper, ceottk.map(note => HertzDonut.apply(null,note)),{
                duration: 0.5,
                callback: () => {
                    gameState.sequence = [];
                    stepSequence();
                }
            });
        }
        let select = function(color) {
            if (gameState.status === "open" || gameState.status === "play") {
                pressColor(color);
            }
        }
        let deselect = function(color) {
            if (gameState.status === "open") {
                releaseColor(color);
            } else if (gameState.status === "play") {
                releaseColor(color);
                validateChoice(color);
            }
        }
        Object.keys(config.tones).forEach((colorName) => {
            let linkId = colorName + "Link";
            let linkElement = document.getElementById(linkId);
            gameState.links[colorName] = linkElement;
            gameState.rects[colorName] = document.getElementById(colorName);
            linkElement.addEventListener("mousedown", () => { select(colorName); });
            linkElement.addEventListener("mouseup", () => { deselect(colorName); });
        });
        document.getElementById("bgLink").addEventListener("dblclick", () => {
            if (gameState.status === "open" && confirm("Start New Game?")) {
                startNewGame();
            }
        });
    }
})()