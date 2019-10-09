avgris.content.db.importor = $('.import');

$(document).ready(function () {
    /**
     * Event
     * 匯入 - 確認
     */
    $('#importConfirm .confirm').click(function () {
        var tempname = avgris.content.db.importor.find('.file').data('tempname');

        if (typeof tempname !== 'undefined') {
            avgris.content.main.addClass('loadingContent');

            var method = $('input[name=method]:checked').val();

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/import/' + avgris.content.db.page,
                data: {
                    import:
                            {
                                tempname: tempname,
                                method: method
                            }
                },
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                avgris.content.main.removeClass('loadingContent');
                
                if (json.error) {
                    noty({
                        text: "Import Failed!!!<br>" + json.error,
                        type: 'error'
                    });
                } else {
                    noty({
                        text: "Import Success!!!<br>Will reload page.",
                        type: 'success',
                        timeout: 3000
                    });
                    
                    $('a[data-request=' + avgris.content.db.page + ']').click().children('span.total').html(json.total);
                }

                config.xhr = null;
            }).fail(function (jqXHR) {
                console.log("import: " + jqXHR.statusText);
            });
        } else {
            noty({
                text: 'Please Upload Excel File Before Confirm!',
                layout: 'topCenter',
                type: 'error',
                timeout: 2000
            });
        }
    });
    /**
     * Event
     * 匯入 - 上傳Excel
     */
    $('#importuploader').submit(function (e) {
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
            beforeSend: xlsxBeforeSubmit,
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();
                //Upload progress
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with upload progress
                        $('#loading-progress-import').val(percentComplete);
                    }
                }, false);
                //Download progress
                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with download progress
                        $('#loading-progress-import').val(percentComplete);
                    }
                }, false);

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Upload Excel File Failed!',
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 1000
                });
            } else {
                var fsize = $('#importInput')[0].files[0].size; //get file size
                var fname = $('#importInput')[0].files[0].name;

                avgris.content.db.importor.find('.file').data('tempname', json.temp_name).attr('data-tempname', json.temp_name).append('<div>Upload Success, File size: ' + (fsize / 1000) + 'k, File name: ' + fname + '</div>');
            }

            $('#submit-btn-import').show(); //hide submit button
            $('#loading-progress-import').hide(); //hide submit button
            $('#importInput').val('');

            config.xhr = null;
        });

        return false;
    });
    /**
     * Function
     * 匯入 - 上傳前檢查Excel
     * @returns {Boolean}
     */
    function xlsxBeforeSubmit() {
        //check whether browser fully supports all File API
        if (window.File && window.FileReader && window.FileList && window.Blob)
        {
            if (!$('#importInput').val()) //check empty input filed
            {
                noty({
                    text: 'Please Select One xlsx File To Upload!',
                    layout: 'topCenter',
                    type: 'warning',
                    timeout: 2000
                });

                return false;
            }

            var fsize = $('#importInput')[0].files[0].size; //get file size
            var ftype = $('#importInput')[0].files[0].type; // get file type
            //allow only valid image file types 
            switch (ftype)
            {
                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    break;
                default:
                    noty({
                        text: ftype + ' Unsupported file type, only xlsx extention!',
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 2000
                    });

                    return false;
            }
            //Allowed file size is less than 1 MB (1048576)
            if (fsize > 20971520)
            {
                noty({
                    text: (fsize / 1000) + 'kb Too big excel file! <br />Please reduce the size of your excel file.',
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 3000
                });

                return false;
            }

            $('#submit-btn-import').hide(); //hide submit button
            $('#loading-progress-import').show(); //hide submit button
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
    /**
     * Event
     * 匯入 - 圖示點選
     */
    $('#import').click(function () {
        if (avgris.content.db.importor.hasClass('showPanel')) {
            avgris.content.db.importor.removeClass('showPanel');
        } else {
            avgris.content.main.find('.showPanel').removeClass('showPanel');
            avgris.content.db.importor.addClass('showPanel');
        }
    });
    /**
     * Event
     * 匯入 - 關閉視窗
     */
    $('#importConfirm .cancel, #importclose').click(function () {
        avgris.content.db.importor.removeClass('showPanel');
    });
});