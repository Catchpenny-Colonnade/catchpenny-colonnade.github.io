namespace("sprocket.SprocketDefs", {}, () => {
  return function(props) {
    return <svg width="0" height="0">
      <defs>
        <g id="base">
          <g transform="translate(-110,-120)">
            <path className="pale" d="M593.1,381.9c0,106.3-61.9,192.5-220.9,192.5c-159,0-220.9-86.2-220.9-192.5c0-106.3,61.9-192.5,220.9-192.5
              C531.2,189.4,593.1,275.6,593.1,381.9z"/>
            <path className="ears" d="M599.9,185.9c-12.6-12.6-111.4-39.5-161.3,9.4c95.5,18.3,141.5,77.5,152.1,151.7
              C639.3,297,612.5,198.5,599.9,185.9z M144.5,185.9C132,198.5,105.2,297,153.8,347c10.5-74.1,56.6-133.4,152.1-151.7
              C255.9,146.4,157.1,173.3,144.5,185.9z"/>
            <path className="shade" d="M578.2,207.6c-10.2-6.9-68.8-19.5-104.7-3.1c57.8,19.9,92.4,58.2,108.5,105.9
              C597,274.7,585,217.6,578.2,207.6z M166.2,207.6c-6.8,10-18.8,67.1-3.9,102.8c16.1-47.7,50.7-86,108.5-105.9
              C235.1,188.1,176.4,200.7,166.2,207.6z"/>
            <path className="shade" d="M343.3,190.5c-11.1,0.8-21.7,2.1-31.7,3.8v54.3c0,8.8,7.1,15.9,15.9,15.9c8.8,0,15.9-7.1,15.9-15.9V190.5z
                M372.2,281.4c8.8,0,15.9-7.1,15.9-15.9v-75.7c-5.2-0.2-10.5-0.3-15.9-0.3c-5.4,0-10.7,0.1-15.9,0.3v75.7
              C356.4,274.3,363.5,281.4,372.2,281.4z M372.2,411.4c-16.5,0-30,5.1-30,9.5c0,7.1,20.8,22.5,30,22.5s30-15.4,30-22.5
              C402.2,416.4,388.7,411.4,372.2,411.4z M401.1,190.5v58c0,8.8,7.1,15.9,15.9,15.9c8.8,0,15.9-7.1,15.9-15.9v-54.3
              C422.8,192.5,412.2,191.3,401.1,190.5z"/>
            <path className="dark" d="M236.3,477.3l-50.7,13.6c-5.7,1.5-9,7.3-7.5,13c1.5,5.7,7.3,9,13,7.5l50.7-13.6c5.7-1.5,9-7.3,7.5-13
              C247.8,479.2,242,475.8,236.3,477.3z M241.8,444l-50.7-13.6c-5.7-1.5-11.5,1.8-13,7.5c-1.5,5.7,1.8,11.5,7.5,13l50.7,13.6
              c5.7,1.5,11.5-1.8,13-7.5C250.9,451.3,247.5,445.5,241.8,444z M558.8,490.9l-50.7-13.6c-5.7-1.5-11.5,1.8-13,7.5
              c-1.5,5.7,1.8,11.5,7.5,13l50.7,13.6c5.7,1.5,11.5-1.8,13-7.5C567.9,498.2,564.5,492.4,558.8,490.9z M508.1,464.5l50.7-13.6
              c5.7-1.5,9-7.3,7.5-13c-1.5-5.7-7.3-9-13-7.5L502.6,444c-5.7,1.5-9,7.3-7.5,13C496.6,462.7,502.4,466,508.1,464.5z"/>
          </g>
        </g>
        { /** mouth */ }
        <path id="teeth-smile" className="white" d="M372.2,532c-75.4,0-104.5-39.7-104.5-59.9c0-5.5,4.5-10,10-10h189c5.5,0,10,4.5,10,10C476.7,492.2,447.6,532,372.2,532z" transform="translate(-110,-120)"/>
        <path id="teeth-frown" className="white" d="M372.2,458.1c67.4,0,94.5,39.8,94.5,59.9c0,5.5-4.5,10-10,10.0h-169.0c-5.5,0-10-4.5-10-10.0C277.7,497.9,304.9,458.1,372.2,458.1z" transform="translate(-110,-120)"></path>
        <circle id="gasp" className="dark" cx="372.3" cy="494.3" r="47.6" transform="translate(-110,-120)"/>
        <ellipse id="wide-open" className="dark" cx="372.3" cy="494.3" ry="47.6" rx="95.2" transform="translate(-110,-120)"/>
        <path id="closed-smile" className="dark"
          d="M372.3,529.0c-53.7,0-85.7-24.1-99.9-38.4c-5.8-5.9-5.8-15.4,0.1-21.2c5.9-5.8,15.4-5.8,21.2,0.1c13.4,13.5,37.9,29.5,78.6,29.5c40.7,0,65.2-16.1,78.6-29.5c5.8-5.9,15.3-5.9,21.2-0.1c5.9,5.8,5.9,15.3,0.1,21.2C457.9,504.9,426,529,372.3,529.0z" transform="translate(-110,-120)"></path>
        <g id="closed-frown" transform="translate(0,750) scale(1,-1)">
          <use href="#closed-smile"/>
        </g>
        <path id="open-frown" className="dark" d="M372.2,458.1c67.4,0,94.5,39.8,94.5,59.9c0,5.5-4.5,10-10,10.0h-169.0c-5.5,0-10-4.5-10-10.0C277.7,497.9,304.9,458.1,372.2,458.1z" transform="translate(-110,-120)"></path>
        <path id="open-smile" className="dark" d="M372.3,535.0c-75.4,0-104.5-39.7-104.5-59.9c0-5.5,4.5-10,10-10.0h189.0c5.5,0,10,4.5,10,10.0C476.8,495.2,447.7,535,372.3,535.0z" transform="translate(-110,-120)"></path>
        <path id="thin-lipped" className="dark" d="M426.9,507.0h-109.0c-8.3,0-15-6.7-15-15.0c0-8.3,6.7-15,15-15.0h109.0c8.3,0,15,6.7,15,15.0C441.9,500.3,435.2,507,426.9,507.0z" transform="translate(-110,-120)"></path>
        { /** eyes */ }
        <path id="left-eye" className="dark" d="M279.1,372.2c0-19.2-15.5-34.7-34.7-34.7c-19.2,0-34.7,15.5-34.7,34.7c0,19.2,15.5,34.7,34.7,34.7
          C263.5,406.9,279.1,391.4,279.1,372.2z" transform="translate(-110,-120)"/>
        <path id="right-eye" className="dark" d="M534.8,372.2c0-19.2-15.5-34.7-34.7-34.7c-19.2,0-34.7,15.5-34.7,34.7c0,19.2,15.5,34.7,34.7,34.7
          C519.2,406.9,534.8,391.4,534.8,372.2z" transform="translate(-110,-120)"/>
        <g id="eyes">
          <use href="#left-eye"/>
          <use href="#right-eye"/>
        </g>
        <g id="left-angry-eye">
          <path className="dark"
            d="M266.7,381.7l-59.8-34.5c-7.2-4.1-9.6-13.3-5.5-20.5c4.1-7.2,13.3-9.6,20.5-5.5l59.8,34.5c7.2,4.1,9.6,13.3,5.5,20.5C283.1,383.4,273.9,385.9,266.7,381.7z" transform="translate(-110,-135)"></path>
          <use href="#left-eye" x="10"/>
        </g>
        <g id="right-angry-eye">
          <path className="dark"
            d="M537.5,347.2l-59.8,34.5c-7.2,4.1-16.3,1.7-20.5-5.5c-4.1-7.2-1.7-16.3,5.5-20.5l59.8-34.5c7.2-4.1,16.3-1.7,20.5,5.5C547.1,333.9,544.6,343.1,537.5,347.2z" transform="translate(-110,-135)"></path>
          <use href="#right-eye" x="-10"/>
        </g>
        <g id="angry-eyes">
          <use href="#left-angry-eye"/>
          <use href="#right-angry-eye"/>
        </g>
        <g id="closed-eyes">
          <path className="dark"
            d="M274.2,379.5h-59.5c-8.3,0-15-6.7-15-15.0s6.7-15,15-15.0H274.2c8.3,0,15,6.7,15,15.0S282.4,379.5,274.2,379.5z" transform="translate(-100,-120)"></path>
          <path className="dark"
            d="M529.9,379.5h-59.5c-8.3,0-15-6.7-15-15.0s6.7-15,15-15.0h59.5c8.3,0,15,6.7,15,15.0S538.2,379.5,529.9,379.5z" transform="translate(-120,-120)"></path>
        </g>
        <g id="dollar-eyed">
          <path className="green"
            d="M238.8,435.7v-19.2c-13.5-0.6-26.6-4.2-34.3-8.7l6.1-23.6c8.5,4.6,20.4,8.9,33.5,8.9c11.5,0,19.4-4.4,19.4-12.5c0-7.7-6.5-12.5-21.4-17.6c-21.6-7.3-36.3-17.4-36.3-36.9c0-17.8,12.5-31.7,34.1-35.9v-19.2h19.8v17.8c13.5,0.6,22.6,3.4,29.3,6.7l-5.9,22.8c-5.2-2.2-14.5-6.9-29.1-6.9c-13.1,0-17.4,5.7-17.4,11.3c0,6.7,7.1,10.9,24.2,17.4c24,8.5,33.7,19.6,33.7,37.7c0,18-12.7,33.3-35.9,37.3v20.6H238.8z" transform="translate(-110,-120)"></path>
          <path className="green"
            d="M484.2,435.7v-19.2c-13.5-0.6-26.6-4.2-34.3-8.7l6.1-23.6c8.5,4.6,20.4,8.9,33.5,8.9c11.5,0,19.4-4.4,19.4-12.5c0-7.7-6.5-12.5-21.4-17.6c-21.6-7.3-36.3-17.4-36.3-36.9c0-17.8,12.5-31.7,34.1-35.9v-19.2h19.8v17.8c13.5,0.6,22.6,3.4,29.3,6.7l-5.9,22.8c-5.2-2.2-14.5-6.9-29.1-6.9c-13.1,0-17.4,5.7-17.4,11.3c0,6.7,7.1,10.9,24.2,17.4c24,8.5,33.7,19.6,33.7,37.7c0,18-12.7,33.3-35.9,37.3v20.6H484.2z" transform="translate(-110,-120)"></path>
        </g>
        <g id="wide-eyed">
          <path id="left-eye-white" className="white"
            d="M314.4,353.3c0-38.7-31.3-70-70-70.0c-38.7,0-70,31.3-70,70.0c0,38.7,31.3,70,70,70.0C283.1,423.3,314.4,392,314.4,353.3z" transform="translate(-100,-120)"></path>
          <path id="right-eye-white" className="white"
            d="M570.1,353.3c0-38.7-31.3-70-70-70.0c-38.7,0-70,31.3-70,70.0s31.3,70,70,70.0C538.8,423.3,570.1,392,570.1,353.3z" transform="translate(-120,-120)"></path>
          <use href="#left-eye" x="10" y="-15"/>
          <use href="#right-eye" x="-10" y="-15"/>
        </g>
        <path id="left-flat-eyebrow" className="dark"
          d="M278.9,363.4h-69.0c-8.3,0-15-6.7-15-15.0c0-8.3,6.7-15,15-15.0h69.0c8.3,0,15,6.7,15,15.0C293.9,356.7,287.2,363.4,278.9,363.4z" transform="translate(-110,-120)"></path>
        <path id="right-flat-eyebrow" className="dark"
          d="M534.6,363.4h-69.0c-8.3,0-15-6.7-15-15.0c0-8.3,6.7-15,15-15.0h69.0c8.3,0,15,6.7,15,15.0C549.6,356.7,542.9,363.4,534.6,363.4z" transform="translate(-110,-120)"></path>
        <g id="left-mellow-eye">
          <use href="#left-flat-eyebrow"/>
          <use href="#left-eye" x="5"/>
        </g>
        <g id="right-mellow-eye">
          <use href="#right-flat-eyebrow"/>
          <use href="#right-eye" x="-5"/>
        </g>
        <g id="mellow-eyed">
          <use href="#left-mellow-eye"/>
          <use href="#right-mellow-eye"/>
        </g>
        <g id="left-raised-eye">
          <use href="#left-flat-eyebrow" y="-25"/>
          <use href="#left-eye" x="10"/>
        </g>
        <g id="right-raised-eye">
          <use href="#right-flat-eyebrow" y="-25"/>
          <use href="#right-eye" x="-10"/>
        </g>
        <g id="raised-eyes">
          <use href="#left-raised-eye"/>
          <use href="#right-raised-eye"/>
        </g>
        <g id="left-blink-eye" transform="translate(24,510) scale(0.45,-0.7)">
          <use href="#closed-smile" className="dark thick-dark"/>
        </g>
        <g id="right-blink-eye" transform="translate(264,510) scale(0.45,-0.7)">
          <use href="#closed-smile" className="dark thick-dark"/>
        </g>
        <g id="blink-eyes">
          <use href="#left-blink-eye"/>
          <use href="#right-blink-eye"/>
        </g>
        <g id="heart-eyes">
          <path className="heart-red"
            d="M552.5,341.1c0-14.5-11.8-26.3-26.3-26.3c-14.5,0-26.3,11.7-26.3,26.2c-0.1-14.5-11.8-26.2-26.3-26.2c-14.5,0-26.3,11.8-26.3,26.3c0,39,52.4,68.8,52.6,68.9C499.9,410,552.5,380,552.5,341.1z" transform="translate(-125,-120)"></path>
          <path className="heart-red"
            d="M297.1,341.1c0-14.5-11.8-26.3-26.3-26.3c-14.5,0-26.3,11.7-26.3,26.2c-0.1-14.5-11.8-26.2-26.3-26.2c-14.5,0-26.3,11.8-26.3,26.3c0,39,52.4,68.8,52.6,68.9C244.5,410,297.1,380,297.1,341.1z" transform="translate(-95,-120)"></path>
        </g>
        <g id="left-sad-eye">
          <path className="dark"
            d="M281.9,347.2l-59.8,34.5c-7.2,4.1-16.3,1.7-20.5-5.5c-4.1-7.2-1.7-16.3,5.5-20.5l59.8-34.5c7.2-4.1,16.3-1.7,20.5,5.5C291.5,333.9,289,343.1,281.9,347.2z" transform="translate(-110,-120)"></path>
          <use href="#left-eye" x="15"/>
        </g>
        <g id="right-sad-eye">
          <path className="dark"
            d="M522.6,381.7l-59.8-34.5c-7.2-4.1-9.6-13.3-5.5-20.5c4.1-7.2,13.3-9.6,20.5-5.5l59.8,34.5c7.2,4.1,9.6,13.3,5.5,20.5C538.9,383.4,529.7,385.9,522.6,381.7z" transform="translate(-110,-120)"></path>
          <use href="#right-eye" x="-15"/>
        </g>
        <g id="sad-eyes">
          <use href="#left-sad-eye"/>
          <use href="#right-sad-eye"/>
        </g>
        <g id="sad-wink-left">
          <use href="#left-blink-eye"/>
          <use href="#right-sad-eye"/>
        </g>
        <g id="sad-wink-right">
          <use href="#left-sad-eye"/>
          <use href="#right-blink-eye"/>
        </g>
        <g id="angry-raised-left">
          <use href="#left-raised-eye"/>
          <use href="#right-angry-eye"/>
        </g>
        <g id="angry-raised-right">
          <use href="#left-angry-eye"/>
          <use href="#right-raised-eye"/>
        </g>
        <g id="mellow-raised-left">
          <use href="#left-raised-eye"/>
          <use href="#right-mellow-eye"/>
        </g>
        <g id="mellow-raised-right">
          <use href="#left-mellow-eye"/>
          <use href="#right-raised-eye"/>
        </g>
        <g id="mellow-wink-left">
          <use href="#left-blink-eye"/>
          <use href="#right-mellow-eye"/>
        </g>
        <g id="mellow-wink-right">
          <use href="#left-mellow-eye"/>
          <use href="#right-blink-eye"/>
        </g>
        <g id="side-eyed-right">
          <use href="#left-flat-eyebrow"/>
          <use href="#right-flat-eyebrow"/>
          <use href="#eyes" x="15"/>
        </g>
        <g id="side-eyed-left">
          <use href="#left-flat-eyebrow"/>
          <use href="#right-flat-eyebrow"/>
          <use href="#eyes" x="-15"/>
        </g>
        { /** add-ons */ }
        <path id="sweat" className="water-blue"
          d="M249.8,260.8c0,32.6-26.5,59.1-59.1,59.1c-32.6,0-59.1-26.5-59.1-59.1c0-54.5,59.1-91.9,59.1-91.9S249.8,206.3,249.8,260.8z" transform="translate(-110,-120)"></path>
        <path id="right-tear" className="water-blue"
          d="M590.2,438.5c5.2,19.4-6.3,39.4-25.7,44.6c-19.4,5.2-39.4-6.3-44.6-25.7c-8.7-32.4,20.5-64.1,20.5-64.1S581.5,406,590.2,438.5z" transform="translate(-110,-120)"></path>
        <path id="left-tear" className="water-blue"
          d="M154.3,438.5c-5.2,19.4,6.3,39.4,25.7,44.6c19.4,5.2,39.4-6.3,44.6-25.7c8.7-32.4-20.5-64.1-20.5-64.1S163,406,154.3,438.5z" transform="translate(-110,-120)"></path>
        <g id="tears">
          <use href="#left-tear"/>
          <use href="#right-tear"/>
        </g>
        <path id="tongue" className="tongue-red"
          d="M428,513.4c0-5.4-4.3-9.7-9.7-9.7l-92,0.0c-5.4,0-9.7,4.3-9.7,9.7V576.0c0,30.8,24.9,55.7,55.7,55.7s55.7-24.9,55.7-55.7V513.4z" transform="translate(-110,-130)"></path>
      </defs>
    </svg>
  }
});