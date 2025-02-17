import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/styles";
import "./DpSlider.css";

const DpSlider = (props) => {
  const [sliderState, setSliderState] = useState(undefined);
  const theme = useTheme();
  const { selectedCategoricalRange, patientCountsByCategory } = props;
  const { minWidth, paddingRight, width } = props;

  const handleSliderChange = (sliderData) => {
    setSliderState(sliderData);
  };

  useEffect(() => {
    if (sliderState) {
      props.handleSliderChange(sliderState);
    }
  }, [sliderState]);

  const marks2 = {};
  let minSelectedInRange = 10000000000;
  let maxSelectedInRange = 0;
  patientCountsByCategory.map((item, index) => {
    marks2[index] = {
      label: item.category,
      style: { color: theme.palette.text.primary },
    };
    if (selectedCategoricalRange.indexOf(item.category) !== -1) {
      minSelectedInRange = Math.min(minSelectedInRange, index);
      maxSelectedInRange = Math.max(maxSelectedInRange, index);
    }
    return true;
  });
  const numItems = Object.keys(marks2).length;
  return (
    <div className={"slider-container no-select"} style={{ width: width }}>
      <Slider
        style={{
          width: width + "px",
        }}
        className={"bar-chart-filter-slider"}
        range
        min={0}
        max={patientCountsByCategory.length}
        defaultValue={[minSelectedInRange, maxSelectedInRange + 1]}
        onChange={(e) => handleSliderChange(e)}
        draggableTrack={true}
        included={true}
        dots={true}
        step={1}
      />
    </div>
  );
};

export default DpSlider;
