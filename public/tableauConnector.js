(function () {

  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {
    // console.log(tableau);

    var cols = [
        { id: "Name", dataType : tableau.dataTypeEnum.string }
        // { id: "Last Name", dataType: tableau.dataTypeEnum.string },
        // { id: "Email", dataType: tableau.dataTypeEnum.string }
    ];

     var tableInfo = {
        id : "TestAPIGateway",
        columns : cols
    };

    schemaCallback([tableInfo]);

  }

  myConnector.getData = function (table, doneCallback) {

    $.getJSON("https://0yi66j7xag.execute-api.ap-southeast-2.amazonaws.com/Test/test?accountName=yes", function(resp) {

        var orgs = resp.Organisations;
        console.log(orgs);
        tableData = [];

        // Iterate over the JSON object
        for (var i = 0, len = orgs.length; i < len; i++) {
          console.log(orgs[i].Name);
            tableData.push({
                "Name": orgs[i].Name
            });
        }

        table.appendRows(tableData);
        doneCallback();

        });
  }
      tableau.registerConnector(myConnector);

  $(document).ready(function () {
    $("#submitButton").click(function () {
        tableau.connectionName = "Connect Tableau to Xero";
        tableau.submit();
    });

})
})();