(function () {

  var myConnector = tableau.makeConnector();

  myConnector.getSchema = function (schemaCallback) {

    //THIS IS WHERE YOU ADD FIELDS
    var accountsCols = [
        { id: "Account_Name",        dataType: tableau.dataTypeEnum.string},
        { id: "Bank_Account_Number", dataType: tableau.dataTypeEnum.string},
        { id: "Type",                dataType: tableau.dataTypeEnum.string},
        { id: "Status",              dataType: tableau.dataTypeEnum.string},
        { id: "Code",                dataType: tableau.dataTypeEnum.string},
        { id: "Description",         dataType: tableau.dataTypeEnum.string},
        { id: "Tax_Type",            dataType: tableau.dataTypeEnum.string},
        { id: "Account_ID",          dataType: tableau.dataTypeEnum.string},
        { id: "Updated_at",          dataType: tableau.dataTypeEnum.date},
        { id: "Account_Class",       dataType: tableau.dataTypeEnum.string},
    // Etc...
    ];

    var accountsTable = {
      id: "Accounts",
      columns: accountsCols
    }


    var invoicesCols = [
      { id: "InvoiceID",     dataType: tableau.dataTypeEnum.float},
      { id: "SubTotal",      dataType: tableau.dataTypeEnum.float},
      { id: "Total",          dataType: tableau.dataTypeEnum.string},
      { id: "Reference",      dataType: tableau.dataTypeEnum.string},
      { id: "Date",           dataType: tableau.dataTypeEnum.date},
      { id: "InvoiceNumber", dataType: tableau.dataTypeEnum.string},
      { id: "AmountDue",     dataType: tableau.dataTypeEnum.string},
      { id: "AmountPaid",    dataType: tableau.dataTypeEnum.string},
      { id: "Status",         dataType: tableau.dataTypeEnum.string},
      // ETC...
    ]

    var invoicesTable = {
      id: "Invoices",
      columns: invoicesCols
    }

    var contactsCols = [
      { id: "FirstName",           dataType: tableau.dataTypeEnum.string},
      { id: "LastName",            dataType: tableau.dataTypeEnum.string},
      { id: "Name",                 dataType: tableau.dataTypeEnum.string},
      { id: "Email",                dataType: tableau.dataTypeEnum.string},
      { id: "MobileNumber",        dataType: tableau.dataTypeEnum.string},
      { id: "BankAccountDetails", dataType: tableau.dataTypeEnum.string},
      { id: "TaxNumber",           dataType: tableau.dataTypeEnum.string},
      // { id: "Balances",             dataType: tableau.dataTypeEnum.string},
      { id: "Accounts_Payable_Outstanding",     dataType: tableau.dataTypeEnum.float},
      { id: "Accounts_Payable_Overdue",     dataType: tableau.dataTypeEnum.float},
      { id: "Accounts_Receivable_Outstanding",  dataType: tableau.dataTypeEnum.float},
      { id: "Accounts_Receivable_Overdue",  dataType: tableau.dataTypeEnum.float},
      { id: "DefaultCurrency",     dataType: tableau.dataTypeEnum.string},
    ]

    var contactsTable = {
        id: "Contacts",
        columns: contactsCols,
      }

    var paymentsCols = [
        { id: "BankAmount",   dataType: tableau.dataTypeEnum.float},
        { id: "Amount",        dataType: tableau.dataTypeEnum.float},
        { id: "ID",            dataType: tableau.dataTypeEnum.string},
        { id: "Reference",     dataType: tableau.dataTypeEnum.string},
        { id: "Status",        dataType: tableau.dataTypeEnum.string},
        { id: "CurrencyRate", dataType: tableau.dataTypeEnum.string},
        { id: "PaymentType",  dataType: tableau.dataTypeEnum.string},
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

      if (table.tableInfo.id == "Accounts") {
        for (var i = 0, len = resp.length; i < len; i++) {

          if (!!resp[i].Accounts) {

            // Dates are returned a bit weird.
            // Convert it to JS date object

            resp[i].Accounts.forEach(function(acc){

            var isoDate = parseInt(acc.UpdatedDateUTC.replace(/\/Date\(([-\d]+).*$/, "$1"));
            var updated = new Date(isoDate).toString();

              tableData.push({
                "Account_Name": acc.Name,
                "Bank_Account_Number": acc.BankAccountNumber,
                "Code": acc.Code,
                "Status": acc.Status,
                "Description": acc.Description,
                "Tax_Type": acc.TaxType,
                "Type": acc.Type,
                "Account_ID": acc.AccountID,
                "Account_Class": acc.Class,
                "Updated_at": updated,
              });
            });
          }
        }
      }

      // where the table schema is for invoices
      if (table.tableInfo.id == "Invoices") {

        // Iterate through response of all xero data
        for (var i = 0, len = resp.length; i < len; i++) {

          // find object which has the Invoice data
          if (!!resp[i].Invoices){

            // iterate through collection of invoices
            resp[i].Invoices.forEach(function(inv){

              // Dates are returned a bit weird.
              // Convert it to a JS date object
              var isoDate = parseInt(inv.Date.replace(/\/Date\(([-\d]+).*$/, "$1"));
              var date = new Date(isoDate).toString();

              tableData.push({
                "InvoiceID": inv.InvoiceID,
                "SubTotal": inv.SubTotal,
                "Total": inv.Total,
                "Reference": inv.Reference,
                "InvoiceNumber": inv.InvoiceNumber,
                "AmountDue": inv.AmountDue,
                "AmountPaid": inv.AmountPaid,
                "Status": inv.Status,
                "Date": date,
              });

            });
          }
        }
      }

      if (table.tableInfo.id == "Contacts") {
        for (var i = 0, len = resp.length; i < len; i++) {

          if (!!resp[i].Contacts) {
            debugger
            resp[i].Contacts.forEach(function(con){

              // Some contacts do not have Balances.
              // I'm declaring the accounts balances here so I can give default values for the contacts that don't have balances.
              // The code will break without it.

              var accPayOut, accPayOvr, accRecOut, accRecOvr;

              if (con.Balances) {

                // Accounts Payable Outstanding
              if (con.Balances.AccountsPayable.Outstanding) {
                accPayOut = con.Balances.AccountsPayable.Outstanding;
              } else {
                accPayOut = null;
              }

              // Accounts Payable Overdue
              if (con.Balances.AccountsPayable.Overdue) {
                accPayOvr = con.Balances.AccountsPayable.Overdue;
              } else {
                accPayOvr = null;
              }

                // Accounts Receivable Outstanding
              if (con.Balances.AccountsReceivable.Outstanding) {
                accRecOut = con.Balances.AccountsReceivable.Outstanding;
              } else {
                accRecOut = null;
              }

                // Accounts Receivable Overdue
              if (con.Balances.AccountsReceivable.Overdue) {
                accRecOvr = con.Balances.AccountsReceivable.Overdue;
              } else {
                accRecOvr = null;
              }
              }
              else {
                accPayOut, accPayOvr, accRecOut, accRecOvr = null;
              }

              tableData.push({
                "FirstName": con.FirstName,
                "LastName": con.LastName,
                "Email": con.EmailAddress,
                "Name": con.Name,
                "MobileNumber": con.Phones[3].PhoneNumber,
                "Accounts_Payable_Outstanding": accPayOut,
                "Accounts_Payable_Overdue": accPayOvr,
                "Accounts_Receivable_Outstanding": accRecOut,
                "Accounts_Receivable_Overdue": accRecOvr,
                "DefaultCurrency": con.DefaultCurrency,
                "TaxNumber": con.TaxNumber,
                "BankAccountDetails": con.BankAccountDetails,
              });

            });

          }
        }
      }


      if (table.tableInfo.id == "Payments") {
        for (var i = 0, len = resp.length; i < len; i++) {

        if (!!resp[i].Payments) {

            resp[i].Payments.forEach(function(pay){

              tableData.push({
                "BankAmount": pay.BankAmount,
                "Amount": pay.Amount,
                "ID": pay.PaymentID,
                "Reference": pay.Reference,
                "Status": pay.Status,
                "PaymentType": pay.PaymentType,
                "CurrencyRate": pay.CurrencyRate,
              });

            });

          }
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