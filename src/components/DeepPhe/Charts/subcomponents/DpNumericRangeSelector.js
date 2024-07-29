import React, { useEffect, useState } from "react";
import Slider from "rc-slider";
import { ChangeResult } from "multi-range-slider-react";
import { useTheme } from "@mui/styles";
import DpFilterBox from "./DpFilterBox";

function DpNumericRangeSelector(props) {
  const [definition, setDefinition] = useState(props.definition);
  const [updated = true, setUpdated] = useState(true);

  const broadcastUpdate = (definition) => {
    props.broadcastUpdate(definition);
  };

  const handleRangeChange = (range: ChangeResult) => {
    definition.selectedNumericRange.min = range[0];
    definition.selectedNumericRange.max = range[1];
    setDefinition(definition);
    setUpdated(false);
  };

  const handleSwitchUpdate = (definition) => {
    setDefinition(definition);
    setUpdated(false);
  };

  useEffect(() => {
    setUpdated(true);
    broadcastUpdate(definition);
  }, [definition]);

  const selectedNumericRange = definition.selectedNumericRange;
  const DpNumericRangeSelectorDefinition = definition.numericRangeSelectorDefinition;
  let marks = {};
  const minSelectedInRange = selectedNumericRange.min;
  const maxSelectedInRange = selectedNumericRange.max;
  const markStep =
    (DpNumericRangeSelectorDefinition.max - DpNumericRangeSelectorDefinition.min) / 10;

  marks = {
    40: "40",
    45: "45",
    50: "50",
    55: "55",
    60: "60",
    65: "65",
    70: "70",
  };
  const theme = useTheme();

  const getChart = (definition) => {};

  const getSlider = (definition) => {
    return (
      <Slider
        range
        min={DpNumericRangeSelectorDefinition.min}
        max={DpNumericRangeSelectorDefinition.max + 1}
        defaultValue={[minSelectedInRange, maxSelectedInRange]}
        onChange={(e) => handleRangeChange(e)}
        draggableTrack={true}
        pushable={true}
        dots={false}
        included={true}
        marks={marks}
        step={DpNumericRangeSelectorDefinition.step}
      />
    );
  };

  return (
    <React.Fragment>
      <DpFilterBox definition={definition} fullWidth={props.fullWidth} />

      {/*<SwitchControl broadcastUpdate={handleSwitchUpdate} definition={definition} />*/}
    </React.Fragment>
  );
}

export default DpNumericRangeSelector;
