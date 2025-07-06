import React from 'react';
import { Svg, Path, G } from 'react-native-svg';

const CommentIcon = (props) => (
  <Svg width={props.size || 22} height={props.size || 22} viewBox="0 0 24 24" fill="none" {...props}>
    <G id="style=stroke">
      <G id="comment">
        {/* This is the single, clean path for the icon's shape. */}
        <Path
          id="vector (Stroke)"
          d="M1.236 11.103C1.236 5.361 6.075 0.764 11.986 0.764c2.256 0 4.346.659 6.087 1.822 2.813 1.846 4.663 4.965 4.663 8.517 0 3.103-1.417 5.878-3.664 7.758.095.117.197.246.299.383.208.28.43.608.602.94.162.314.329.72.329 1.133 0 .695-0.415 1.233-0.892 1.543-0.479.311-1.107.457-1.72.329-1.213-.253-2.71-.71-3.886-1.095-.592-.194-1.11-.373-1.48-.503-.185-.065-.334-.118-.436-.155l-.036-.013c-3.37.04-6.383-1.488-8.302-3.871C2.102 15.724 1.236 13.506 1.236 11.103z"
          fill={props.color || '#657786'}
        />
      </G>
    </G>
  </Svg>
);

export default CommentIcon;