import React, { useEffect, useRef, useState } from "react";

const CustomXAxisTick = ({ x, y, payload }) => {
  const textRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);

  // Measure the text width once the component mounts or payload changes.
  useEffect(() => {
    if (textRef.current) {
      debugger;
      const bbox = textRef.current.getBBox();
      setTextWidth(bbox.width);
    }
  }, [payload.value]);

  return (
    // Translate the <g> element by the measured text width
    <g transform={`translate(${x + textWidth}, ${y})`}>
      <text
        ref={textRef}
        transform="rotate(45)"
        textAnchor="start"
        dominantBaseline="hanging"
        style={{ fontSize: 55 }}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default CustomXAxisTick;
