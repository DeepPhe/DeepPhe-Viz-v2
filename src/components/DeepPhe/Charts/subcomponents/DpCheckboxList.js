import Grid from "@mui/material/Grid";
import SwitchControl from "./controls/SwitchControl";
import React, { useEffect } from "react";
import ListItem from "@mui/material/ListItem";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import { FormControlLabel } from "@mui/material";

function DpCheckboxList(props) {
  const [definition, setDefinition] = React.useState(props.definition);

  const getCheckboxName = (checkbox) => {
    return definition.fieldName + "_" + checkbox.name + "_checkbox";
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
