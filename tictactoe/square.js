namespace('Square',() => {
   return function(props) {
       return <button className="square" onClick={props.onClick}>{props.value}</button>;
   }
});