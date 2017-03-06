(function () {

  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {

    //THIS IS WHERE YOU ADD FIELDS
    var accountsCols = [
        { id: "Account Name", dataType: tableau.dataTypeEnum.string },
        { id: "Bank Account Number", dataType: tableau.dataTypeEnum.string},
        { id: "Code", dataType: tableau.dataTypeEnum.string},
    // Etc...
    ];

    var accountsTable = {
      id: "Accounts",
      columns: accountsCols
    }


    var invoicesCols = [
      { id: "Invoice ID", dataType: tableau.dataTypeEnum.string},
      { id: "Total", dataType: tableau.dataTypeEnum.string},
      // ETC...
    ]

    var invoicesTable = {
      id: "Invoices",
      columns: invoicesCols
    }

    // For the different endpoints you want to query from, make sure to define a new table, as displayed above.

    schemaCallback([accountsTable, invoicesTable]);

  };

  myConnector.getData = function (table, doneCallback) {

    // HERE IS WHERE YOU MAKE API CALLS TO AWS API GATEWAY

    var apiGatewayEndpoint = "https://r3k6ja6cl0.execute-api.ap-southeast-2.amazonaws.com/Prod/xero" + window.location.search;

    $.getJSON(apiGatewayEndpoint, function(resp) {

        var tableData = [];

        // Iterate over the JSON response
        for (var i = 0, len = resp.length; i < len; i++) {

          if (!!resp[i].Accounts) {

            resp[i].Accounts.forEach(function(acc){
              tableData.push({
                "Account Name": acc.Name,
                "Bank Account Number": acc.BankAccountNumber,
                "Code": acc.Code,
              });

            });

          }

          else if (!!resp[i].Invoices){

            resp[i].Invoices.forEach(function(inv){

              tableData.push({
                "Invoice ID": inv.InvoiceID,
                "Total": inv.Total,
              });

            });

          }

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