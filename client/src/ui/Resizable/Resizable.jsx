import { Resizer } from "./Resizer"
import './Resizable.scss'
import { useState } from "react";

export function Resizable({ children, defaultHeight = 300 }) {
  const [height, setHeight] = useState(defaultHeight);
  return (
    <>
      <div style={{ height: height }}>
        <Resizer setHeight={setHeight} height={height}>
          <div className="resizer"></div>
        </Resizer>
        {children}
      </div>
    </>
  )
}