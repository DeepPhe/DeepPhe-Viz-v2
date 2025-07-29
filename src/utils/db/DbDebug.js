import { DEEPPHE_STORE } from "./DbConsts";

const logFirstTenLines = async (db) => {
  const tx = db.transaction(DEEPPHE_STORE, "readonly");
  const store = tx.objectStore(DEEPPHE_STORE);
  const allItems = await store.getAll();
  const firstTenItems = allItems.slice(0, 10);
  firstTenItems.forEach((item, index) => {
    //console.log(`Line ${index + 1}:`, item);
  });
};

const writeAsCSV = (allAttributesArray) => {
  let str = "";
  for (const key in allAttributesArray) {
    str += key + "|" + allAttributesArray[key].join("|") + "\n";
  }
  console.log(str);
};

export { logFirstTenLines, writeAsCSV };
