const parsePipeSeparatedFile = (content, sep) => {
  const lines = content.split("\n");
  const columnNames = lines[0].split(sep);
  return lines.slice(1).map((line) => {
    const values = line.split(sep);
    const obj = {};
    columnNames.forEach((col, index) => {
      obj[col] = values[index];
    });
    return obj;
  });
};

export default parsePipeSeparatedFile;
