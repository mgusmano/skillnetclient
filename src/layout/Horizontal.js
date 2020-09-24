import React from 'react'

const Horizontal = (props) => (
  <div data-flex-splitter-horizontal style={{flex: 'auto', display:'flex', flexDirection:'row'}}>
    {props.children}
  </div>
)

export default Horizontal
