(function () {

  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {

    //THIS IS WHERE YOU ADD FIELDS
    var cols = [
        { id: "Name", dataType: tableau.dataTypeEnum.string }
    ];

     var tableInfo = {
        id : "TestAPIGateway",
        columns : cols
    };

    schemaCallback([tableInfo]);

  }

  myConnector.getData = function (table, doneCallback) {

    // HERE IS WHERE YOU MAKE API CALLS TO AWS API GATEWAY

    $.getJSON("https://0yi66j7xag.execute-api.ap-southeast-2.amazonaws.com/Test/test?accountName=yes", function(resp) {

        var accounts = resp.Accounts;

        tableData = [];

        // Iterate over the JSON object
        for (var i = 0, len = accounts.length; i < len; i++) {
            tableData.push({
                "Name": accounts[i].Name
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