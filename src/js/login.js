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
var domainName = "***";

/*
 * Replace the "***" with a valid Cell name where this service is running.
 */
var unitAdminCellName = "***";


// Set up necessary URLs for this service.
var rootUrl = ["https://", domainName, "/"].join();
var serviceCell = [rootUrl, unitAdminCellName, "/"].join();

$(document).ready(function() {
    $("#register").prop("disabled", true);
});

function checkCellExis() {
    var cellName = $("#iCellName").val();
    if (cellName) {
        getCell(cellName).done(function(data, status, xhr) {
            $("#iCellNameMsg").html("既に存在します。");
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
            displaySuccessMsg('セルを作成しました。');
        }).fail(function(data) {
            displaySuccessMsg('セルの作成に成功しました。プロフィールは非公開です。');
        });
    }).fail(function(data) {
        displayFailureMsg('セル作成に失敗しました。');
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

function validateCheck(displayNameID, displayNameSpan) {
    var displayName = $("#" + displayNameID).val();
    var MINLENGTH = 1;
    var MAXLENGTH = 128;
    var letters = /^[一-龠ぁ-ゔ[ァ-ヴー々〆〤0-9０-９a-zA-ZＡ-Ｚ-_]+$/;
    var specialchar = /^[-_]/;
    var allowedLetters = /^[0-9a-zA-Z-_]+$/;
    var lenDisplayName = displayName.length;
    document.getElementById(displayNameSpan).innerHTML = "";
    if(lenDisplayName < MINLENGTH || displayName == undefined || displayName == null || displayName == "") {
        document.getElementById(displayNameSpan).innerHTML =  "入力して下さい。";
        return false;
    } else if (lenDisplayName >= MAXLENGTH) {
        document.getElementById(displayNameSpan).innerHTML = "128文字以下で入力して下さい。";
        return false;
    } else if (lenDisplayName != 0 && !(displayName.match(letters))){
        document.getElementById(displayNameSpan).innerHTML = "特殊文字は“-”と“_”のみ使用出来ます。";
        return false;
    } else if (lenDisplayName != 0 && !(displayName.match(allowedLetters))) {
        document.getElementById(displayNameSpan).innerHTML = "全角文字は使用出来ません。";
        return false;
    } else if(lenDisplayName != 0 && displayName.match(specialchar)){
        document.getElementById(displayNameSpan).innerHTML = "特殊文字で始めることは出来ません。";
        return false;
    }
    return true;
};

function createCellAPI() {
    return $.ajax({
        type:"POST",
        url: serviceCell + "__/unitService/user_cell_create",
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
        url: rootUrl + cellName + "/__/",
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
        url: rootUrl + cellName + "/",
        headers:{
            'Accept':'application/xml'
        }
    });
}
