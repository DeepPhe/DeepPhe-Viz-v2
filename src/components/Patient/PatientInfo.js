class Documents {
  constructor(json) {
    this.json = json["documents"];
  }

  getDocumentIds() {
    return this.json.map((doc) => doc.id);
  }

  getDocumentById(id) {
    return this.json.find((doc) => doc.id === id);
  }
}
