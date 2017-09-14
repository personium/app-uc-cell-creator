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
var HomeApplication = {
    cellUrl: "https://demo.personium.io/HomeApplication/",
    disabledList: ["App"],
    defaultProfileUrl: function() {
        return this.cellUrl + '__/defaultProfile.json';
    },
    barfilePath: function() {
        return this.cellUrl + '__/HomeApplication.bar';
    },
    targetBoxPath: function() {
        return targetRootUrl + $("#cell_name").val() + '/io_personium_demo_HomeApplication/';
    },
    loginUrl: function() {
        return targetRootUrl + $("#cell_name").val() + '/io_personium_demo_HomeApplication/src/login.html';
    },
    enableInstall: function() {
        return !(_.contains(this.disabledList, $("#cell_type").val()));
    },
    installHomeApplicationBox: function(token) {
        var oReq = new XMLHttpRequest(); // binary
        oReq.open("GET", this.barfilePath());
        oReq.responseType = "arraybuffer";
        oReq.setRequestHeader("Content-Type", "application/zip");
        oReq.onload = function(e) {
            var arrayBuffer = oReq.response;
            var view = new Uint8Array(arrayBuffer);
            var blob = new Blob([view], {"type":"application/zip"});
            $.ajax({
                type: "MKCOL",
                url: HomeApplication.targetBoxPath(),
                data: blob,
                processData: false,
                headers: {
                    'Authorization':'Bearer ' + token, // createCellAPI's token
                    'Content-type':'application/zip'
                }
            }).done(function(data) {
                // domesomething
            }).fail(function(data) {
                var res = JSON.parse(data.responseText);
                alert("An error has occurred.\n" + res.message.value);
            });
        }
        oReq.send();
    }
};

/*
 * The followings should be shared among applications and/or within the same application.
 */
$(document).ready(function() {
    i18next
        .use(i18nextXHRBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            debug: true,
            backend: {
                // load from i18next-gitbook repo
                loadPath: './locales/{{lng}}/translation.json',
                crossDomain: true
            }
        }, function(err, t) {
            initJqueryI18next();
            
            // define your own additionalCallback for each App/screen
            if ((typeof additionalCallback !== "undefined") && $.isFunction(additionalCallback)) {
                additionalCallback();
            }

            updateContent();
        });
});

/*
 * Need to move to a function to avoid conflicting with the i18nextBrowserLanguageDetector initialization.
 */
initJqueryI18next = function() {
    // for options see
    // https://github.com/i18next/jquery-i18next#initialize-the-plugin
    jqueryI18next.init(i18next, $, {
        useOptionsAttr: true
    });
}

updateContent = function() {
    // start localizing, details:
    // https://github.com/i18next/jquery-i18next#usage-of-selector-function
    $('[data-i18n]').localize();
}

var validator = null;
var jqueryValidateMessage_ja = "https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.17.0/localization/messages_ja.js";

additionalCallback = function() {
    appendCommonDialog();
    
    disableCreateBtn();

    configureJQueryValidation();
};

configureJQueryValidation = function() {
    createExtraRules();

    switch(i18next.language) {
    case "ja":
    case "ja-JP":
        $.getScript(jqueryValidateMessage_ja, function() {
            configureTarget();
        });
        break;
    default:
        configureTarget();
    }
};

configureTarget = function() {
    validator = $("form").validate({
        rules: {
            cell_name: {
                required: true,
                cellName: true,
                rangelength: [1, 128]
            },
            admin_name: {
                required: true,
                adminName: true,
                rangelength: [1, 128]
                
            },
            password: {
                required: true,
                adminPassword: true,
                rangelength: [6, 32]
            },
            confirm_password: {
                required: true,
                equalTo: "#password",
                adminPassword: true,
                rangelength: [6, 32]
            }
        },
        errorPlacement: function(error, element) {
            element.parent().find('.errorMsg').html($(error));
        },
        // get called whenever a field is invalid
        highlight: function(element, errorClass) {
            console.log("inside highlight " + $(element).attr("id"));
            disableCreateBtn();
        },
        // get called whenever a field becomes valid
        unhighlight: function(element, errorClass) {
            console.log("inside unhighlight " + $(element).attr("id"));
            checkInput();
        },
        // get called when submit button is clicked and values are invalid
        invalidHandler: function(event, validator) {
            var errors = validator.numberOfInvalids();
            console.log("invalidHandler:There are " + errors + " errors!");
            checkInput();
        },
        submitHandler: function(form) {
            console.log("submitHandler");
            createCell();
            return false;
        }
    });
};

createExtraRules = function() {
    $.validator.addMethod("cellName", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,127}$/.test(value);
    }, i18next.t("create_form.msg.info.cellName"));
    $.validator.addMethod("adminName", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9][a-zA-Z0-9-_!$*=^`{|}~.@]{0,127}$/.test(value);
    }, i18next.t("create_form.msg.info.adminName"));
    $.validator.addMethod("adminPassword", function(value, element) {
        return this.optional(element) || /^[a-zA-Z0-9-_]{0,}$/.test(value);
    }, i18next.t("create_form.msg.info.adminPassword"));
};

verifyCellName = function() {
    console.log("verifyCellName");
    if ($("#cell_name").valid()) {
        checkCellExis();
    }
};

function checkCellExis() {
    console.log("checkCellExis");
    var cellName = $("#cell_name").val();
    if (cellName) {
        getCell(cellName).done(function(data, status, xhr) {
            showErrorsCellName();
            disableCreateBtn();
        }).fail(function(data) {
            $("#cell_name_error_msg").empty();
            checkInput();
        });
    } else {
        disableCreateBtn();
    }
}

/*
 * Need to tell jQuery Validation that the field is invalid so that
 * validator.numberOfInvalids() can return the correct count.
 */
showErrorsCellName = function() {
    validator.invalid.cell_name = true;
    validator.showErrors({
        "cell_name": i18next.t("create_form.msg.error.cell_already_exist")
    });
};

function checkInput() {
    var someFieldsMissingValue = _.some(
        $("form input"),
        function(aDom) { 
            return _.isEmpty($(aDom).val());
        }
    );
    var someErrors = validator.numberOfInvalids();
    if (someFieldsMissingValue || someErrors > 0) {
        disableCreateBtn();
    } else {
        enableCreateBtn();
    }
}

function enableCreateBtn() {
    $("#register")
        .prop("disabled", false);
}

function disableCreateBtn() {
    $("#register")
        .prop("disabled", true);
}

function createCell() {
    createCellAPI().done(function(data) {
        let access_token = data.access_token;
        let cellProfileUrl = [
            targetRootUrl,
            $("#cell_name").val(),
            '/__/profile.json'
        ].join("");
        setMainBoxACL(access_token).done(function() {
            openCommonDialog('resultDialog.title', 'create_form.msg.info.cell_created');
        }).fail(function() {
            openCommonDialog('resultDialog.title', 'create_form.msg.info.private_profile_cell_created');
        }).always(function() {
            $('<input>', {
                value: $("#cell_name").val(),
                readonly: true
            }).appendTo("#modal-common .modal-body");

            uploadDefaultProfile(access_token, HomeApplication.defaultProfileUrl(), cellProfileUrl);

            if (HomeApplication.enableInstall()) {
                HomeApplication.installHomeApplicationBox(access_token);
                $("#modal-common .modal-body").append($(createQRCodeImg(HomeApplication.loginUrl())));
            };
        });
    }).fail(function() {
        displayFailureMsg(i18next.t("create_form.msg.error.fail_to_create_cell"));
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

function createCellAPI() {
    return $.ajax({
        type:"POST",
        url: createCellApiUrl, // unitService engine URL (where this service is deployed)
        data: {
            'cellName':$("#cell_name").val(),
            'accName':$("#admin_name").val(),
            'accPass':$("#password").val()
        },
        headers: {
            'Accept':'application/json'
        }
    });
}

function setMainBoxACL(token) {
    var cellName = $("#cell_name").val();
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

uploadDefaultProfile = function(token, defaultProfileUrl, cellProfileUrl) {
    getProfile(defaultProfileUrl).done(function(profData){
        let cellProfile = $.extend(
            true,
            profData,
            {
                "CellType": $("#cell_type").val()
            }
        );

        $.ajax({
            type: "PUT",
            url: cellProfileUrl,
            data: JSON.stringify(cellProfile),
            headers: {'Accept':'application/json',
                      'Authorization':'Bearer ' + token}
        })
    });
};

getProfile = function(url) {
    return $.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        headers: {'Accept':'application/json'}
    });
};

createQRCodeImg = function(url) {
    let googleAPI = 'https://chart.googleapis.com/chart?cht=qr&chs=177x177&chl=';
    let qrURL = googleAPI + url;
    let aDiv = $('<div>').append(
        '<br>',
        $('<img>', {
            src: qrURL,
            alt: url,
            style: 'width: 200px; height: 200px'
        })
    );
    return aDiv;
};

appendCommonDialog = function() {
    var html = [
        '<div id="modal-common" class="modal fade" role="dialog" data-backdrop="static">',
            '<div class="modal-dialog">',
                '<div class="modal-content">',
                    '<div class="modal-header login-header">',
                        '<h4 class="modal-title"></h4>',
                    '</div>',
                    '<div class="modal-body"></div>',
                    '<div class="modal-footer">',
                        '<button type="button" class="btn btn-primary" id="b-common-ok" data-i18n="btnOk">OK</button>',
                    '</div>',
               '</div>',
           '</div>',
        '</div>'
    ].join("");
    $("body").append(html);
    $('#b-common-ok').on('click', function() { 
        closeTab();
    });
};

openCommonDialog = function(title_key, message_key) {
    $("#modal-common .modal-title")
        .attr('data-i18n', title_key);

    $("#modal-common .modal-body")
        .attr('data-i18n', '[html]' + message_key);

    $("#modal-common")
        .localize()
        .modal('show');
};

/*
 * clean up data and close tab/window
 */
closeTab = function() {
    // define your own cleanupData for each App/screen
    if ((typeof cleanUpData !== "undefined") && $.isFunction(cleanUpData)) {
        cleanUpData();
    }
    $("#modal-common .modal-body").empty();
    $("#modal-common").modal('hide');
};
