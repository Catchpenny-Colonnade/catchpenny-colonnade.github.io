namespace('minesweeper.DigitalDisplay',{},() => {
    const digit = {
        dim:[10,16],
        horiz:{
            points:[[4,1],[6,1],[7,2],[6,3],[4,3],[3,2]],
            offsets:[[0,0],[0,6],[0,12]]
        },
        vert:{
            points:[[1,4],[1,6],[2,7],[3,6],[3,4],[2,3]],
            offsets:[[0,0],[0,6],[6,0],[6,6]]
        },
        digitOffsets:{
            "0":{
                horiz:[0,2],
                vert:[0,1,2,3]
            },
            "1":{
                horiz:[],
                vert:[2,3]
            },
            "2":{
                horiz:[0,1,2],
                vert:[1,2]
            },
            "3":{
                horiz:[0,1,2],
                vert:[2,3]
            },
            "4":{
                horiz:[1],
                vert:[0,2,3]
            },
            "5":{
                horiz:[0,1,2],
                vert:[0,3]
            },
            "6":{
                horiz:[0,1,2],
                vert:[1,2,3]
            },
            "7":{
                horiz:[0],
                vert:[2,3]
            },
            "8":{
                horiz:[0,1,2],
                vert:[0,1,2,3]
            },
            "9":{
                horiz:[0,1],
                vert:[0,2,3]
            }
        }
    }
    const defaultBgColor = "#900";
    const defaultDispColor = "#f00";
    const drawPoly = function(direction, offsetIndex, charIndex, dispColor) {
        const { points, offsets } = digit[direction];
        const [ offX, offY ] = offsets[offsetIndex];
        const charOff = charIndex * digit.dim[0];
        const polyPoints = points.map(([x,y]) => [ x + offX + charOff, y + offY ]);
        return <polygon points={ polyPoints } stroke="none" fill={ dispColor || defaultDispColor}/>;
    }
    return function({ value, digitCount, bgColor, dispColor }) {
        let valueStr = value.toString();
        if (digitCount < valueStr.length) {
            valueStr = valueStr.slice(valueStr.length - digitCount);
        } else {
            valueStr = "0".repeat(Math.max(0,digitCount - valueStr.length)) + valueStr;
        }
        const digits = valueStr.split("");
        const [ width, height ] = digit.dim;
        const totalWidth = width * digitCount;
        return <div style={{height: "2em"}}>
            <svg width="100%" height="100%" viewBox={`0 0 ${totalWidth} ${height}`}>
                <rect width={totalWidth} height={height} stroke="none" fill={bgColor || defaultBgColor}/>
                { digits.map((d,index) => {
                    const { horiz, vert } = digit.digitOffsets[d]
                    return <>
                        { horiz.map((i) => drawPoly("horiz", i, index, dispColor)) }
                        { vert.map((i) => drawPoly("vert", i, index, dispColor)) }
                    </>;
                }) }
            </svg>
        </div>
    }
});