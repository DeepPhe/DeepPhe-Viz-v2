/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import {createBrowserHistory} from "history";
import {BrowserRouter, Redirect, Route, Router, Switch} from "react-router-dom";
import "assets/css/deepphe.css";
// core components
import Deepphe from "layouts/deepphe.js";
// import RTL from "layouts/RTL.js";
import "assets/css/font-awesome.min.css";
import "assets/css/material-dashboard-react.css?v=1.9.0";

import "assets/css/normalize.css";

import Patient from "./views/Patient/Patient";
import CancerAndTumorSummaryView from "./views/Summaries/CancerAndTumorSummaryView";
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import {createTheme, CssBaseline, ThemeProvider} from "@material-ui/core";

const hist = createBrowserHistory();


const themeDark = createTheme({
    palette: {
        background: {
            default: "#f5f5f5",
            secondary:"#333"
        },
        text: {
            primary: "#ffffff"
        },

    },

    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontSize: 26,
        htmlFontSize: 26
    }
});

// class DebugRouter extends BrowserRouter {
//     constructor(props){
//         super(props);
//         console.log('initial history is: ', JSON.stringify(this.history, null,2))
//         this.history.listen((location, action)=>{
//             console.log(
//                 `The current URL is ${location.pathname}${location.search}${location.hash}`
//             )
//             console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null,2));
//         });
//     }
// }

ReactDOM.render(
    <Router history={hist}>
        <ThemeProvider theme={themeDark}>
            <CssBaseline/>
            <Switch>
                <Route exact path="/deepphe/dashboard" component={Deepphe}/>
                <Route exact path="/deepphe/patient/:patientId/cancerAndTumorSummary" component={CancerAndTumorSummaryView}/>
                {/*<Route path="/patient/:patientId/timeline" component={TimelineView}/>*/}
                <Route exact path="/deepphe/patient/:patientId" component={Patient}/>

                <Redirect from="/" to="/deepphe/dashboard" />
            </Switch>
        </ThemeProvider>
    </Router>
    ,
    document.getElementById("root")
);


