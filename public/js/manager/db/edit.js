$(document).ready(function () {
    /**
     * Event
     * 編輯器 - seeddist PAY_TERM 欄位選擇
     */
    avgris.content.db.editor.main.find('div[data-type=PAY_TERM] select').change(function () {
        var value = $(this).val();

        if (value !== 'Internal transfer') {
            avgris.content.db.editor.main.find('div[data-type=PAYTERM_INTE_PRONO]').hide().find('input').val('');
        } else {
            avgris.content.db.editor.main.find('div[data-type=PAYTERM_INTE_PRONO]').show();
        }
    });
    /**
     * Event
     * 編輯器 - 階層選單按鈕
     */
    avgris.content.db.editor.main.find('button.searchGroup').click(function () {
        var self = $(this);
        var status = self.data('status');
        var sGs = $('button.searchGroup');
        var index = sGs.index(self);

        if (status === 'selection') {
            self.prev().show('slow').focus();
            self.data('status', 'cancel').attr('data-status', 'cancel');
        } else if (status === 'cancel') {
            self.prev().hide().val('');

            if (index === 0) {
                self.data('status', 'selection').attr('data-status', 'selection');
            }
        } else if (status === 'confirm') {
            for (var i = index; i >= 0; i--) {
                var value = sGs.eq(i).prev().children(':selected').text();

                sGs.eq(i).prev().prev().val(value).addClass('changed');
            }

            for (var j = (index + 1); j <= 3; j++) {
                sGs.eq(j).prev().prev().val('').removeClass('changed');
            }

            sGs.data('status', 'cancel').attr('data-status', 'cancel').click();
        }
    });
    /**
     * Event
     * 編輯器 - 階層選單
     */
    avgris.content.db.editor.main.find('select.related').change(function () {
        var self = $(this);
        var selectRs = $('select.related');
        var index = selectRs.index(self);
        var next = selectRs.eq(index + 1);

        if (self.val() !== '') {
            self.next().data('status', 'confirm').attr('data-status', 'confirm');

            for (var i = (index + 1); i <= 3; i++) {
                selectRs.eq(i).empty().hide().next().data('status', 'cancel').attr('data-status', 'cancel');
            }

            if (next.length > 0) {
                var filters = {};

                if (index === 2) {
                    selectRs.each(function () {

                        if ($(this).val() !== '' && $(this).is(':visible')) {
                            filters[$(this).closest('[data-type]').data('type')] = $(this).children(':selected').text();
                        }
                    });
                } else {
                    selectRs.each(function () {
                        if ($(this).val() !== '' && $(this).is(':visible')) {
                            filters[$(this).closest('[data-type]').data('type')] = $(this).val();
                        }
                    });
                }

                next.show('slow').focus();

                $.ajax({
                    type: 'POST',
                    dataType: "json",
                    url: config.base_url + '/manager/getFullList',
                    data: {FullList: filters}
                }).done(function (json) {
                    if (json.error) {
                        next.empty().append("<option value=\"\" selected>Load fail</option>");

                        noty({
                            text: "Load list fail!<br>" + json.error,
                            layout: 'topCenter',
                            type: 'error',
                            timeout: 3000
                        });
                    } else {
                        next.empty().append("<option value=\"\" selected>* " + next.parent().parent().data('type') + " *</option>");

                        if (Object.keys(json.options).length > 0) {
                            var keys = Object.keys(json.options[0]);

                            $.each(json.options, function (index, value) {
                                if (value[keys[0]] !== null) {
                                    next.append("<option value=" + value[keys[0]] + ">" + value[keys[0]] + "</option>")
                                }
                            });
                        }
                    }

                    config.xhr = null;
                }).fail(function (jqXHR) {
                    console.log("getFullList: " + jqXHR.statusText);
                });
            }
        } else {
            for (var i = (index + 1); i <= 3; i++) {
                selectRs.eq(i).empty().hide().next().data('status', 'cancel').attr('data-status', 'cancel');
            }
        }
    });
    /**
     * Event
     * 編輯器 - 轉換所輸入的SISN
     */
    avgris.content.db.editor.main.find('div[data-type=SISN] input').bind('keyup change', function () {
        var self = $(this);
        var value = self.val();
        var len = value.length;
        var input = avgris.content.db.editor.main.find('div[data-type=VINO] input');

        if (len <= 6 && len > 0) {
            switch (len) {
                case 1:
                    value = '00000' + value;
                    break;
                case 2:
                    value = '0000' + value;
                    break;
                case 3:
                    value = '000' + value;
                    break;
                case 4:
                    value = '00' + value;
                    break;
                case 5:
                    value = '0' + value;
                    break;
            }

            self.removeClass('error');
            input.removeClass('error').addClass('changed');
        } else {
            value = '';

            self.addClass('error');
            input.addClass('error').removeClass('changed');
        }

        input.val('VI' + value);
    });
    /**
     * Event
     * 編輯器 - 搜尋VINO的輸入框
     */
    $('#searchVINO').click(function () {
        var self = $(this);
        var status = self.data('status');
        var iVINO = $('#inputVINO');

        if (status === 'search') {
            iVINO.show("slow").focus().val('');
            self.data('status', 'cancel').attr('data-status', 'cancel');
        } else {
            iVINO.hide().val('');
            self.data('status', 'search').attr('data-status', 'search');
        }
    });
    /**
     * autocomplete外掛
     * 選擇passport的VINO
     */
    $('#inputVINO').autocomplete({
        type: 'POST',
        serviceUrl: config.base_url + '/manager/autoComplete/',
        onSearchStart: function () {
            $('#searchVINO').addClass('loadVINO');
        },
        onSelect: function (suggestion) {
            $('#disVINO').val(suggestion.value).addClass('changed').removeClass('error');
            $('#inputVINO').hide().val('');
            $('#searchVINO').data('status', 'search').attr('data-status', 'search');

            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/getPasInfo/' + suggestion.value
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: 'Search VINO Failed!<br>' + json.error,
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 4000,
                        maxVisible: 1
                    });
                } else {
                    $.each(json.data[0], function (index, value) {
                        avgris.content.db.editor.main.find('[data-type=' + index + ']').children(':eq(1)').children(':eq(0)').val(value);
                    })
                }

                config.xhr = null;
            });
        },
        onSearchComplete: function () {
            $('#searchVINO').removeClass('loadVINO');
        }
    });
    /**
     * Event
     * 編輯器 - 搜尋Country資料
     */
    avgris.content.db.editor.main.find('div[data-type=COUNTRY] select').change(function () {
        if ($(this).val() !== '') {
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/getCountry',
                data: {Country: $(this).val()}
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: "Get country data fail!<br>" + json.error,
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 3000
                    });

                    avgris.content.db.editor.main.find('div[data-type=ORIGCTY],div[data-type=REGION]').find('input').val('');
                } else {
                    $.each(json.country, function (index, value) {
                        avgris.content.db.editor.main.find('div[data-type=' + index + ']').find('input').val(value);
                    });
                }

                config.xhr = null;
            }).fail(function (jqXHR) {
                console.log("getCountry: " + jqXHR.statusText);
            });
        } else {
            avgris.content.db.editor.main.find('div[data-type=ORIGCTY],div[data-type=REGION]').find('input').val('');
        }
    });
    /**
     * Event
     * 編輯器 - 上傳圖片
     */
    $('#uploader').submit(function (e) {
        e.preventDefalut;

        var formData = new FormData($(this)[0]);

        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: $(this).attr('action') + avgris.content.db.page,
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: beforeSubmit,
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();
                //Upload progress
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with upload progress
                        $('#loading-progress').val(percentComplete);
                    }
                }, false);
                //Download progress
                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with download progress
                        $('#loading-progress').val(percentComplete);
                    }
                }, false);

                config.xhr = xhr;

                return xhr;
            },
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Upload Image File Failed!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 1000
                });
            } else {
                var canvas = document.getElementById("after");
                var context = canvas.getContext('2d');

                context.clearRect(0, 0, canvas.width, canvas.height);

                var imageObj = new Image();

                imageObj.src = config.base_url + '/app/pictures/' + avgris.content.db.page + '/' + json.tempfilename;
                imageObj.onload = function () {
                    context.drawImage(imageObj, canvas.width / 2 - imageObj.width / 2, canvas.height / 2 - imageObj.height / 2);
                };

                canvas.setAttribute("data-tempName", json.tempfilename);

                $('#loading-progress').val(0);
            }

            $('#submit-btn').show(); //hide submit button
            $('#loading-progress').hide(); //hide submit button
            $('#imageInput').val('');

            config.xhr = null;
        });

        return false;
    });
    /**
     * Function
     * 上傳前檢查圖片
     * @returns {Boolean}
     */
    function beforeSubmit() {
        //check whether browser fully supports all File API
        if (window.File && window.FileReader && window.FileList && window.Blob)
        {
            if (!$('#imageInput').val()) //check empty input filed
            {
                noty({
                    text: 'Please Select One Image To Upload!',
                    layout: 'topCenter',
                    type: 'warning',
                    timeout: 2000
                });
                return false;
            }

            var fsize = $('#imageInput')[0].files[0].size; //get file size
            var ftype = $('#imageInput')[0].files[0].type; // get file type
            //allow only valid image file types 
            switch (ftype)
            {
                case 'image/jpeg':
                case 'image/pjpeg':
                    break;
                default:
                    noty({
                        text: ftype + ' Unsupported file type!',
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 2000
                    });
                    return false;
            }
            //Allowed file size is less than 1 MB (1048576)
            if (fsize > 1048576)
            {
                noty({
                    text: (fsize / 1000) + 'kb Too big Image file! <br />Please reduce the size of your photo using an image editor.',
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 3000
                });

                return false;
            }

            $('#submit-btn').hide(); //hide submit button
            $('#loading-progress').show(); //hide submit button
        }
        else
        {
            noty({
                text: 'Please upgrade your browser, because your current browser lacks some new features we need!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 1000
            });

            return false;
        }
    }
});