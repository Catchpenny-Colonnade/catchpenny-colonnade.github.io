namespace("sprocket.SprocketFace", {}, () => {
  const dim = {
    w: 525,
    h: 525
  }
  return function(props) {
    return <div title={props.label} className={`emoji-${props.emojiScale} m-2`}>
      <svg width="100%" height="100%" viewBox={`0 0 ${dim.w} ${dim.h}`}>
        <rect width={dim.w} height={dim.h} rx="100" ry="100" fill={props.bgColor} stroke="black" strokeWidth="10" />
        <use href="#base" />
        { props.refs.map(href => <use href={`#${href}`} />) }
      </svg>
    </div>;
  }
});