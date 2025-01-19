namespace('Board',["Square"],({Square}) => {
    return function(props) {
        return (
            <div>
                {[0,1,2].map((row)=> {
                    return (
                        <div className="board-row">
                        {[0,1,2].map((col)=>{
                            let i = row * 3 + col;
                            return <Square value={props.squares[i]} onClick={() => props.onClick(i)}/>
                        })}
                        </div>);
                })}
            </div>
        );
    }
});