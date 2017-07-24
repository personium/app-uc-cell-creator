/**
 * Personium
 * Copyright 2016 FUJITSU LIMITED
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Replace the "***" with a valid Personium domain name
 */
var deployedDomainName = "***";

/*
 * Replace the "***" with a valid cell name where this service is running.
 */
var deployedCellName = "***";


/* 
 * Set up necessary URLs for this service.
 * Current setup procedures only support creating a cell within the same Personium server.
 */
var rootUrl = ["https://", deployedDomainName, "/"].join("");
var targetRootUrl = rootUrl;
var serviceCellUrl = [rootUrl, deployedCellName, "/"].join("");
var createCellApiUrl = [serviceCellUrl, "__/unitService/user_cell_create"].join("");

i18n
//    .use(i18nextXHRBackend)
//    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng: 'en',
        debug: true,
        backend: {
            // load from i18next-gitbook repo
        loadPath: './locales/{{lng}}/translation.json',
        crossDomain: true
        }
    }, function(err, t) {
        $("title").i18n();
        $(".i18n").i18n();
    });

$(document).ready(function() {
    $("#register").prop("disabled", true);
});

function checkCellExis() {
    var cellName = $("#iCellName").val();
    if (cellName) {
        getCell(cellName).done(function(data, status, xhr) {
            $("#iCellNameMsg").html(i18n.t("create_form.msg.error.cell_already_exist"));
        }).fail(function(data) {
            $("#iCellNameMsg").html("");
            checkInput("iCellName", "iCellNameMsg");
        });
    } else {
        $("#register").prop("disabled", true);
    }
}

function checkInput(id, msgId) {
    validateCheck(id, msgId);
    var cellName = $("#iCellName").val();
    var accName = $("#iAccName").val();
    var accPass = $("#iAccPw").val();
    var cellMsg = $("#iCellNameMsg").html();
    var accNMsg = $("#iAccNameMsg").html();
    var accPMsg = $("#iAccPwMsg").html();
    if (!cellName || !accName || !accPass || cellMsg || accNMsg || accPMsg) {
        $("#register").prop("disabled", true);
        $("#register").removeClass("login_btn");
        $("#register").removeClass("login_btn_b");
        $("#register").toggleClass("login_btn_b");
    } else {
        $("#register").prop("disabled", false);
        $("#register").removeClass("login_btn");
        $("#register").removeClass("login_btn_b");
        $("#register").toggleClass("login_btn");
    }
}

function createCell() {
    createCellAPI().done(function(data) {
        setMainBoxACL(data.access_token).done(function(data) {
            displaySuccessMsg(i18n.t("create_form.msg.info.cell_created"));
        }).fail(function(data) {
            displaySuccessMsg(i18n.t("create_form.msg.info.private_profile_cell_created"));
        });
    }).fail(function(data) {
        displayFailureMsg(i18n.t("create_form.msg.error.fail_to_create_cell"));
    });
}

function displaySuccessMsg(msg) {
    $("#dispMsg").removeClass("errorMsg")
                 .addClass("successMsg")
                 .html(msg)
                 .show();
}

function displayFailureMsg(msg) {
    $("#dispMsg").removeClass("successMsg")
                 .addClass("errorMsg")
                 .html(msg)
                 .show();
}

function validateCheck(displayNameID, formFieldMsgId) {
    var displayName = $("#" + displayNameID).val();
    var MINLENGTH = 1;
    var MAXLENGTH = 128;
    var allowedLetters = /^[0-9a-zA-Z-_]+$/;
    var lenDisplayName = displayName.length;

    $("#" + formFieldMsgId).empty();
    if(lenDisplayName < MINLENGTH || displayName == undefined || displayName == null || displayName == "") {
        $("#" + formFieldMsgId).html(i18n.t("create_form.validate.warning.less_minimum_length", { value: MINLENGTH}));
        return false;
    }

    return isCellNameValid(displayName, formFieldMsgId);
};

function isCellNameValid(str, formFieldMsgId) {
    var validCellName = /^([a-zA-Z0-9]([a-zA-Z0-9\-\_]){0,127})?$/g;
    var MAXLENGTH = 128;
    var multibyteChar = /[^\x00-\x7F]+/g;
    var startWithAllowedSymbols = /^[-_]/;
    if (str.match(validCellName)) {
        // cell name is valid
        return true;
    } else if (str.length > MAXLENGTH) {
        $("#" + formFieldMsgId).html(i18n.t("create_form.validate.warning.exceed_maximum_length", { value: MAXLENGTH}));
        return false;
    } else if (str.match(multibyteChar)) {
        $("#" + formFieldMsgId).html(i18n.t("create_form.validate.warning.multibyte_not_allowed"));
        return false;
    } else if (str.match(startWithAllowedSymbols)) {
        $("#" + formFieldMsgId).html(i18n.t("create_form.validate.warning.cannot_start_with_symbol"));
        return false;
    } else {
        $("#" + formFieldMsgId).html(i18n.t("create_form.validate.warning.unsupported_symbols"));
        return false;
    }
};

function createCellAPI() {
    return $.ajax({
        type:"POST",
        url: createCellApiUrl, // unitService engine URL (where this service is deployed)
        data: {
            'cellName':$("#iCellName").val(),
            'accName':$("#iAccName").val(),
            'accPass':$("#iAccPw").val()
        },
        headers: {
            'Accept':'application/json'
        }
    });
}

function setMainBoxACL(token) {
    var cellName = $("#iCellName").val();
    return $.ajax({
        type: "ACL",
        url: targetRootUrl + cellName + "/__/", // Target Personium URL (can be another Personium server)
        data: "<?xml version=\"1.0\" encoding=\"utf-8\" ?><D:acl xmlns:p=\"urn:x-personium:xmlns\" xmlns:D=\"DAV:\" xml:base=\"" + rootUrl + cellName + "/__role/__/\"><D:ace><D:principal><D:all/></D:principal><D:grant><D:privilege><p:read/></D:privilege></D:grant></D:ace></D:acl>",
        headers: {
            'Accept':'application/json',
            'Authorization':'Bearer ' + token
        }
    });
}

function getCell(cellName) {
    return $.ajax({
        type: "GET",
        url: targetRootUrl + cellName + "/", // Target Personium URL (can be another Personium server)
        headers:{
            'Accept':'application/xml'
        }
    });
}
