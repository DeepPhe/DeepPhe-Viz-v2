import Slider from "rc-slider";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/styles";
import "./DpSlider.css";

const DpSlider = ({
  fieldName,
  categoricalRange,
  abbrevCategories,
  handleSliderChangeExternal,
  paddingRight,
  patientCountsByCategory,
  selectedCategoricalRange,
  minWidth,
  width,
}) => {
  const theme = useTheme();
  const [marks, setMarks] = useState(undefined);

  const handleSliderChangeInternal = (sliderData) => {
    handleSliderChangeExternal(sliderData);
  };

  useEffect(() => {
    if (patientCountsByCategory !== undefined) {
      let newMarks = {};
      patientCountsByCategory.forEach((item, index) => {
        newMarks[index] = {
          label: item.category,
          style: { color: theme.palette.text.primary },
        };
      });
      setMarks(newMarks);
    }
  }, [patientCountsByCategory]);

  const marks2 = {};

  if (marks === undefined) {
    return "...";
  } else
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
          defaultValue={[0, patientCountsByCategory.length]}
          onChange={(e) => handleSliderChangeInternal(e)}
          draggableTrack={true}
          included={true}
          dots={true}
          step={1}
        />
      </div>
    );
};
export default DpSlider;
