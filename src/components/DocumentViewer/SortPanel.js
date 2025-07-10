import GridItem from "../Grid/GridItem";
import React, { useState } from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Divider from "@mui/material/Divider";
import GridContainer from "../Grid/GridContainer";

export function SortPanel(props) {
    const { filteredConcepts, setFilteredConcepts } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [sortType, setSortType] = useState('Alphabetically'); // Example state

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function sortMentions(method) {
        const conceptsCopy = [...filteredConcepts];
        // console.log(method);

        if (conceptsCopy.length > 0) {
            conceptsCopy.sort((a, b) => {
                if (method === 'Alphabetically') {
                    return a.preferredText.toLowerCase().localeCompare(b.preferredText.toLowerCase());
                } else if (method === 'Confidence') {
                    return b.confidence - a.confidence;
                }
                else if(method === 'Semantic Group') {
                    return a.dpheGroup.toLowerCase().localeCompare(b.dpheGroup.toLowerCase()); // Sort by dphegroup alphabetically
                }
                else
                {
                    return 0;
                }
            });

            setFilteredConcepts(conceptsCopy);
        }
    }

    const handleSortChange = (method) => {
        setSortType(method);
        sortMentions(method);
        handleClose();
    };

    return (
        <GridContainer xs={12} style={{ display: 'flex' , height: '100%' }}>
            <GridItem xs={4}>
                <Button
                    id="demo-customized-button"
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    variant="contained"
                    onClick={handleClick}
                    endIcon={<KeyboardArrowDownIcon style={{ fill: 'white' }} />}
                    style={{ margin: 'auto', marginTop: '15px', display: "flex", padding: "6px", marginBottom: '15px',
                        float: 'left', fontFamily: "Monaco, monospace", fontSize: "17px", fontWeight: "bold"}}
                >
                    Sort Concepts
                </Button>

                <Menu
                    id="demo-customized-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleSortChange('Alphabetically')}>
                        Alphabetically
                    </MenuItem>
                    <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                    <MenuItem onClick={() => handleSortChange('Semantic Group')}>
                        Semantic Group
                    </MenuItem>
                    <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                    <MenuItem onClick={() => handleSortChange('Confidence')}>
                        Confidence
                    </MenuItem>
                </Menu>
            </GridItem>
            {/*<Divider xs={1} orientation="vertical" flexitem sx={{ background: 'black', borderBottomWidth: 2}} />*/}
            <GridItem xs={8} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <b className="SortTitle" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
                    : {sortType}
                </b>
            </GridItem>
        </GridContainer>
    );
}
