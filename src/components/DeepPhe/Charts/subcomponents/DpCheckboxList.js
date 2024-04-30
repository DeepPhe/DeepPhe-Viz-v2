import Grid from "@mui/material/Grid";
import React, { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import { FormControlLabel } from "@mui/material";
import HSBar from "react-horizontal-stacked-bar-chart";
import "./DpCheckboxList.css";

function DpCheckboxList(props) {
  const [definition, setDefinition] = React.useState(props.definition);

  const getCheckboxName = (checkbox) => {
    return definition.fieldName + "_" + checkbox.name + "_checkbox";
  };

  const getCheckboxTotalPatients = (checkbox, globalPatientCountsForCategories) => {
    let idx = globalPatientCountsForCategories.findIndex((category) => {
      return category.category === checkbox.name;
    });
    return globalPatientCountsForCategories[idx].count;
  };

  const getTotalPatients = (globalPatientCountsForCategories) => {
    let count = 0;
    globalPatientCountsForCategories.forEach((category) => {
      count = count + category.count;
    });
    return count;
  };

  const handleCheckUpdate = (event) => {
    const checkboxLabel = event.target.labels[0].innerText;
    const idx = definition.checkboxes.findIndex((x) => x.name === checkboxLabel);
    definition.checkboxes[idx].checked = event.target.checked;
    setDefinition({ ...definition });
  };

  useEffect(() => {
    props.broadcastUpdate(definition);
  }, [definition]);

  return (
    <React.Fragment>
      <Grid item md={7} className="filter-inner-container no_padding_grid">
        <div className={"slider-container"}>
          <List key={props.key + "list"}>
            {definition.checkboxes.map((checkbox, index) => {
              return (
                <ListItem
                  key={getCheckboxName(checkbox) + "list_item"}
                  className="checkbox-list-item"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={checkbox.checked}
                        size={"small"}
                        id={getCheckboxName(checkbox)}
                        checked={checkbox.checked}
                        onChange={handleCheckUpdate}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                    label={checkbox.name}
                  />
                  <div className={"checkbox-bar"}>
                    <HSBar
                      height={15}
                      showTextIn
                      outlineWidth={0.0}
                      outlineColor="black"
                      id="new_id"
                      fontColor="white"
                      data={[
                        {
                          name: checkbox.name,
                          value: getCheckboxTotalPatients(
                            checkbox,
                            definition.globalPatientCountsForCategories
                          ),
                          color: "blue",
                        },
                        {
                          name: "",
                          value:
                            getTotalPatients(definition.globalPatientCountsForCategories) -
                            getCheckboxTotalPatients(
                              checkbox,
                              definition.globalPatientCountsForCategories
                            ),
                          color: "red",
                        },
                      ]}
                      onClick={(e) => console.log(e.bar)}
                    />
                  </div>
                </ListItem>
              );
            })}
          </List>
        </div>
      </Grid>
    </React.Fragment>
  );
}

export default DpCheckboxList;
