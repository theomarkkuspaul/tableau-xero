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
      { id: "Date", dataType: tableau.dataTypeEnum.date}
      // ETC...
    ]

    var invoicesTable = {
      id: "Invoices",
      columns: invoicesCols
    }

    var contactsCols = [
      { id: "First Name", dataType: tableau.dataTypeEnum.string},
      { id: "Last Name", dataType: tableau.dataTypeEnum.string},
      { id: "Name", dataType: tableau.dataTypeEnum.string},
      { id: "Email", dataType: tableau.dataTypeEnum.string},
    ]

    var contactsTable = {
        id: "Contacts",
        columns: contactsCols
      }

      var paymentsCols = [
        { id: "Bank Amount", dataType: tableau.dataTypeEnum.float},
        { id: "Amount", dataType: tableau.dataTypeEnum.float},
        { id: "ID", dataType: tableau.dataTypeEnum.string}
      ]

      var paymentsTable = {
        id: "Payments",
        columns: paymentsCols,
      }

    // For the different endpoints you want to query from, make sure to define a new table, as displayed above.

    schemaCallback([accountsTable, invoicesTable, contactsTable, paymentsTable]);

  };

  myConnector.getData = function (table, doneCallback) {

    // HERE IS WHERE YOU MAKE API CALLS TO AWS API GATEWAY

    var apiGatewayEndpoint = "https://r3k6ja6cl0.execute-api.ap-southeast-2.amazonaws.com/Prod/xero" + window.location.search;

    $.getJSON(apiGatewayEndpoint, function(resp) {
        var tableData = [];
      debugger;

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
                "Date": new Date(inv.Date.toString())
              });

            });

          }

          else if (!!resp[i].Contacts) {

            resp[i].Contacts.forEach(function(con){

              tableData.push({
                "First Name": con.FirstName,
                "Last Name": con.LastName,
                "Email": con.EmailAddress,
                "Name": con.Name
              });

            });

          }

          else if (!!resp[i].Payments) {

            resp[i].Payments.forEach(function(pay){

              tableData.push({
                "Bank Amount": pay.BankAmount,
                "Amount": pay.Amount,
                "ID": pay.ID
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