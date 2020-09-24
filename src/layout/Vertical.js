import React from 'react'

const Vertical = (props) => (
  <div className={props.className} data-flex-splitter-vertical style={props.style}>
    {props.children}
  </div>
)

export default Vertical
