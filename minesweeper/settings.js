namespace("minesweeper.Settings",{},() => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { 
                width: 0, 
                height: 0, 
                count: 0
            };
            this.onClose = props.onClose;
            props.setOnOpen(({ width, height, count }) => {
                this.setState({ width, height, count })
            });
        }
        input(field,label) {
            return <div className="input-group p-3">
                <label htmlFor={field} className="input-group-text">{label}</label>
                <input
                    id={field}
                    type="number"
                    className="form-control"
                    min={1}
                    style={{width: "2em"}}
                    value={ this.state[field] }
                    onChange={(e) => {
                        const update = {};
                        update[field] = parseInt(e.target.value);
                        this.setState(update);
                    }}
                />
            </div>;
        }
        render() {
            return <div className="d-flex flex-column p-3">
                { this.input('width',"Width:") }
                { this.input('height',"Height:") }
                { this.input('count',"Count:") }
                <div className="d-flex justify-content-end p-3">
                    <button className="btn btn-success m-2" onClick={() => { this.onClose(this.state); }}>Confirm</button>
                    <button className="btn btn-danger m-2" onClick={() => { this.onClose(); }}>Cancel</button>
                </div>
            </div>;
        }
    }
})