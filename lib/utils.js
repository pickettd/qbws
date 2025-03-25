module.exports = {
  makeJsonFromQBXML: function (msgVal) {
    // msgVal is the object you received from QBXML
    const { ReportRet } = msgVal;

    // Extract column descriptions and data rows
    const colDesc = ReportRet.ColDesc;
    const dataRows = ReportRet.ReportData.DataRow;

    // Build a mapping from column ID to header name
    const headerMap = colDesc.reduce((acc, col) => {
      const colID = col["@colID"];
      // Use the '@value' from ColTitle if available; otherwise, fall back to ColType or a generic name.
      const header =
        (col.ColTitle && col.ColTitle["@value"]) ||
        col.ColType ||
        `Column${colID}`;
      acc[colID] = header;
      return acc;
    }, {});

    // Create a new JSON array with one object per data row
    const jsonRows = dataRows.map((row) => {
      // Initialize the row with all columns set to an empty string (or null if preferred)
      const rowObj = Object.keys(headerMap).reduce((obj, colID) => {
        const header = headerMap[colID];
        obj[header] = ""; // default value; change to null if desired
        return obj;
      }, {});

      // Populate available data for the row
      row.ColData.forEach((colData) => {
        const colID = colData["@colID"];
        const header = headerMap[colID] || `Column${colID}`;
        rowObj[header] = colData["@value"];
      });
      if (rowObj["Blank"] === "") {
        delete rowObj["Blank"];
      }
      return rowObj;
    });

    // Print the resulting JSON (can later be converted to CSV)
    console.log("In makeJsonFromQBXML, total rows is", jsonRows.length);
    console.log(
      "In makeJsonFromQBXML, first row is",
      JSON.stringify(jsonRows[0], null, 2)
    );
    return jsonRows;
  },
};
