avgris.content.db.exportor = $('.export');

$(document).ready(function () {
    $('#export_selector').click(function(){
        var is_checked = $(this).prop('checked');
        
        if(is_checked){
            avgris.content.db.exportor.find('.columns input[type=checkbox]').prop('checked', true);
        }else{
            avgris.content.db.exportor.find('.columns input[type=checkbox]').prop('checked', false);
        }
    });
    /**
     * Event
     * 匯出 - 圖示點選
     */
    $('#export').click(function () {
        if (avgris.content.db.exportor.hasClass('showPanel')) {
            avgris.content.db.exportor.removeClass('showPanel');
        } else {
            avgris.content.main.find('.showPanel').removeClass('showPanel');
            avgris.content.db.exportor.addClass('showPanel');
        }
    });
    /**
     * Event
     * 匯出 - 關閉視窗
     */
    $('#exportConfirm .cancel, #exportclose').click(function () {
        avgris.content.db.exportor.removeClass('showPanel');
    });
    /**
     * Event
     * 匯出 - 確認
     */
    $('#exportConfirm .confirm').click(function () {
        if ($('#total').text() !== '0') {
            var columns = [];
            var selections = avgris.content.db.exportor.find('.columns input[type=checkbox]:checked');

            $.each(selections, function () {
                var column = $(this).next().next();

                columns.push(column.text());
            });

            if (columns.length > 0) {
                avgris.content.main.addClass('loadingContent');

                var xhr = new XMLHttpRequest();

                xhr.open("POST", config.base_url + "/manager/export/" + avgris.content.db.page, true);
                xhr.responseType = "arraybuffer";

                xhr.onload = function () {
                    var filename = "";
                    var disposition = xhr.getResponseHeader('Content-Disposition');

                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);

                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }

                    var type = xhr.getResponseHeader('Content-Type');
                    var blob = new Blob([xhr.response], {type: type});

                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) {
                            // use HTML5 a[download] attribute to specify filename
                            var a = document.createElement("a");
                            // safari doesn't support this yet
                            if (typeof a.download === 'undefined') {
                                window.location = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                            }
                        } else {
                            window.location = downloadUrl;
                        }

                        setTimeout(function () {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100); // cleanup
                    }
                    
                    avgris.content.main.removeClass('loadingContent');
                    
                    config.xhr = null;
                };

                xhr.send(JSON.stringify(columns));
                
                config.xhr = xhr;
            } else {
                noty({
                    text: "You don't select any column to export!",
                    layout: 'topCenter',
                    type: 'warning',
                    timeout: 2000
                });
            }
        } else {
            noty({
                text: 'There is no record to export!',
                layout: 'topCenter',
                type: 'error',
                timeout: 2000
            });
        }
    });
});