import React, { useMemo } from "react";
import { extractCombinations, UpSetJS } from "@upsetjs/react";

function UpsetFilter({ uniquePatientIds, patientArrays }) {
  function getSetsForPatentArrays() {
    return uniquePatientIds.map((patientId) => {
      const set = [];
      Object.keys(patientArrays).forEach((key) => {
        if (patientArrays[key].includes(patientId)) {
          if (key.includes("CANCER")) {
            set.push(key);
          }
        }
      });
      return { name: patientId, sets: set };
    });
  }

  const sets2 = getSetsForPatentArrays();
  const elems = useMemo(() => sets2, []);
  const { sets, combinations } = useMemo(() => extractCombinations(elems), [elems]);

  const [selection, setSelection] = React.useState(null);
  return (
    <UpSetJS
      sets={sets}
      combinations={combinations}
      width={1000}
      height={1000}
      selection={selection}
      onHover={setSelection}
    />
  );
}

export default UpsetFilter;
