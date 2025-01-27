const parsePipeSeparatedFile = (content) => {
  const lines = content.split("\n");
  const columnNames = lines[0].split("|");
  return lines.slice(1).map((line) => {
    const values = line.split("|");
    const obj = {};
    columnNames.forEach((col, index) => {
      obj[col] = values[index];
    });
    return obj;
  });
};

export default parsePipeSeparatedFile;
