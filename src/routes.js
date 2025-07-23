// Material Dashboard 2 React layouts
// @mui icons
import Icon from "@mui/material/Icon";
import DeepPhe from "layouts/deepphe";
import PatientLayout from "layouts/patient";

const routes = [
  {
    type: "collapse",
    name: "DeepPhe",
    key: "deepphe",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/",
    component: <DeepPhe />,
  },
  {
    key: "patient",
    name: "Patient",
    type: "collapse",
    route: "/patient/:patientId",
    component: <PatientLayout />,
  },
];

export default routes;
