import React from "react";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";

export default function CancerAndTumorSummaryView({...rest}) {

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={8}>
                    <CancerAndTumorSummary/>
                </GridItem>
            </GridContainer>
        </div>
    );
}
