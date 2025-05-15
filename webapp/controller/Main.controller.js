sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "sap/ui/core/format/DateFormat",
    'sap/ui/comp/library',
    'sap/ui/model/type/String',
    'sap/m/Token'
], (Controller, ODataModel, Filter, FilterOperator, JSONModel, MessageBox, DateFormat, compLibrary, TypeString, Token) => {
    "use strict";

    return Controller.extend("com.sap.lh.mr.zpowerfactornoneng.controller.Main", {
        onInit() {
            const oView = this.getView();
            oView.setModel(new JSONModel({
                rowMode: "Fixed"
            }), "ui");
        },
        onSearch: function () {
            debugger;
            const oView = this.getView();            
            var aFilter = [];
            
            var aTokensRateCategory = this.getView().byId("idRateCategory").getTokens();
            var idRateCategoryFrm = "";
            if (aTokensRateCategory.length === 0) {
                idRateCategoryFrm = this.getView().byId("idRateCategory").getValue();
                if (idRateCategoryFrm !== "") {
                    aFilter.push(new Filter("RateCategory", FilterOperator.EQ, idRateCategoryFrm));
                }
                
            }
            else if (aTokensRateCategory.length === 1) {
                idRateCategoryFrm = aTokensRateCategory[0].getText();
                idRateCategoryFrm = idRateCategoryFrm.replace("=", "");
                aFilter.push(new Filter("RateCategory", FilterOperator.EQ, idRateCategoryFrm));
            }
            else if (aTokensRateCategory.length === 2) {
                //return MessageBox.error("Select only one RateCategory...");
                var idRateCategoryFrm1 = aTokensRateCategory[0].getText();
                idRateCategoryFrm1 = idRateCategoryFrm1.replace("=", "");
                var idRateCategoryFrm2 = aTokensRateCategory[1].getText();
                idRateCategoryFrm2 = idRateCategoryFrm2.replace("=", "");
                aFilter.push(new Filter("RateCategory", FilterOperator.BT, idRateCategoryFrm1, idRateCategoryFrm2));

            }
            else if (aTokensRateCategory.length > 2) {
                //return MessageBox.error("Select only one RateCategory...");               
                for (let i = 0; i <= aTokensRateCategory.length - 1; i++) {
                    idRateCategoryFrm = aTokensRateCategory[i].getText();
                    idRateCategoryFrm = idRateCategoryFrm.replace("=", "");
                    aFilter.push(new Filter("RateCategory", FilterOperator.EQ, idRateCategoryFrm));
                }
            }
            
            
            var aTokensInstallation = this.getView().byId("idInstallation").getTokens();
            var installation = "";
            if (aTokensInstallation.length === 0) {                
                installation = this.getView().byId("idInstallation").getValue();
                if (installation !== "") {
                    aFilter.push(new Filter("Installation", FilterOperator.EQ, installation));
                }
            }
            else if (aTokensInstallation.length === 1) {
                installation = aTokensProfileRole[0].getText();
                installation = installation.replace("=", "");
                aFilter.push(new Filter("Installation", FilterOperator.EQ, installation));
            }
            else if (aTokensInstallation.length === 2) {
                //return MessageBox.error("Select only one profileRole...");
                var installation1 = aTokensInstallation[0].getText();
                installation1 = installation1.replace("=", "");
                var installation2 = aTokensInstallation[1].getText();
                installation2 = installation2.replace("=", "");
                aFilter.push(new Filter("Installation", FilterOperator.BT, installation1, installation2));

            }
            else if (aTokensInstallation.length > 2) {
                //return MessageBox.error("Select only one profileRole...");               
                for (let i = 0; i <= aTokensInstallation.length - 1; i++) {
                    installation = aTokensInstallation[i].getText();
                    installation = profileRole.replace("=", "");
                    aFilter.push(new Filter("Installation", FilterOperator.EQ, installation));
                }
            }
            if(aTokensRateCategory.length === 0 && aTokensInstallation.length === 0 && idRateCategoryFrm === "" && installation === "")
            {
                return MessageBox.error("Either Rate category or Installation is mandatory...");
            }
            var oDateRangeSelection = this.getView().byId("billingPeriodRange");
            var oStartDate = oDateRangeSelection.getDateValue();  // Start Date
            var oEndDate = oDateRangeSelection.getSecondDateValue();  // End Date
            if (oStartDate && oEndDate) {
                var startMonth = (oStartDate.getMonth() + 1).toString().padStart(2, '0');
                var startYear = oStartDate.getFullYear().toString();

                var endMonth = (oEndDate.getMonth() + 1).toString().padStart(2, '0');
                var endYear = oEndDate.getFullYear().toString();
            }
            else{
                return MessageBox.error("Period is mandatory...");
            }

            var pfDeviation = this.getView().byId("idPFDeviation").getValue();
            
            // Filter for the selected range (from start month-year to end month-year)
            aFilter.push(new Filter("BillingPeriodMonth", FilterOperator.BT, startMonth, endMonth));
            aFilter.push(new Filter("BillingPeriodYear", FilterOperator.BT, startYear, endYear));
            aFilter.push(new Filter("Deviation", FilterOperator.EQ, pfDeviation));
            
            var oModel = this.getOwnerComponent().getModel();
            var oJsonModel = new sap.ui.model.json.JSONModel();
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading Data",
                text: "Please wait..."
            });
            oBusyDialog.open();
            //var oTable = this.getView().byId("tblPowerFactor");
            oModel.read("/PwrFactorValSet", {
                filters: aFilter,
                success: function (response) {
                    debugger;
                    oBusyDialog.close();
                    if(response.results.length>0)
                    {
                        oJsonModel.setData(response.results);
                        oView.byId("tblPowerFactor").setModel(oJsonModel, "NonEngModel");
                    }
                    else if(response.results.length === 0){
                        return MessageBox.error("There are no records..");
                    }
                },
                error: (oError) => {
                    oBusyDialog.close();
                    return MessageBox.error("Error:", oError);
                }
            });
        },
        onRateCateVHRequest: function () {
            this._oRateCategoryMultiInput = this.byId("idRateCategory");
            this.loadFragment({
                name: "com.sap.lh.mr.zpowerfactornoneng.fragment.ratecat"
            }).then(function (oDialog) {
                this._oRateCategoryDialog = oDialog;
                this.getView().addDependent(oDialog);
                oDialog.setRangeKeyFields([{
                    label: "Rate Category",
                    key: "RateCategory",
                    type: "string",
                    typeInstance: new TypeString({}, { maxLength: 10 })
                }]);
                oDialog.setTokens(this._oRateCategoryMultiInput.getTokens());
                oDialog.open();
            }.bind(this));
        },
        onRateCateVHOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            this._oRateCategoryMultiInput.setTokens(aTokens);
            this._oRateCategoryDialog.close();
        },
        onRateCateVHCancelPress: function () {
            this._oRateCategoryDialog.close();
        },
        onRateCateVHAfterClose: function () {
            this._oRateCategoryDialog.destroy();
        },
        onInstallVHRequested:function(){
            this._oInstallationMultiInput = this.byId("idInstallation");
            this.loadFragment({
                name: "com.sap.lh.mr.zpowerfactornoneng.fragment.installation"
            }).then(function (oDialog) {
                this._oInstallationDialog = oDialog;
                this.getView().addDependent(oDialog);
                oDialog.setRangeKeyFields([{
                    label: "Installation",
                    key: "Installation",
                    type: "string",
                    typeInstance: new TypeString({}, { maxLength: 10 })
                }]);
                oDialog.setTokens(this._oInstallationMultiInput.getTokens());
                oDialog.open();
            }.bind(this));
        },
        onInstallVHOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            this._oInstallationMultiInput.setTokens(aTokens);
            this._oInstallationDialog.close();
        },
        onInstallVHCancelPress: function () {
            this._oInstallationDialog.close();
        },
        onInstallVHAfterClose: function () {
            this._oInstallationDialog.destroy();
        },
    });
});