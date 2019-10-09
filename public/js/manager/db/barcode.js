avgris.content.db.barcode = {
    main: $('.barcode')
};

$(document).ready(function () {
    /**
     * ScannerDetection插件
     */
    $(document).scannerDetection({
        timeBeforeScanTest: 200, // wait for the next character for upto 200ms
        startChar: [120], // Prefix character for the cabled scanner (OPL6845R)
        endChar: [13], // be sure the scan is complete if key 13 (enter) is detected
        avgTimeByChar: 40, // it's not a barcode if a character takes longer than 40ms
        onComplete: function (barcode, qty) {
            $("#scan_log").append('<div class=barcode_line><div>' + barcode + '</div></div>');
            var scrollHeight = document.getElementById('scan_log').scrollHeight;
            $("#scan_log").animate({scrollTop: scrollHeight}, '1000', 'swing');

            var vi_full = barcode.split(" ");
            var vis = vi_full[0];

            var vi = vis.substr(0, 8);
            var variant = vis.substr(8, 1) === '-' ? vis.substr(9, vis.length - 9) : vis.substr(8, vis.length - 8);

            if ($('#barcode_' + vi + "_" + variant).length === 0) {
                $('#barcode_counter').append('<div class=barcode_counter_line><div id=scaned_' + vi + '_' + variant + '><span class=number_label>' + ($('.number_label').length + 1) + '</span>' + vi + (variant === '' ? '' : '(' + variant + ')') + '&nbsp;:&nbsp;<input id=barcode_' + vi + '_' + variant + ' type=number min=1 value=1>&nbsp;Live&nbsp;:&nbsp;<span class=live_value><img src=' + config.base_url + '/public/images/ajax-loader.gif></span><span class=\"barcode_line_remove button\" title=Remove>Remove</span></div></div>');

                $.ajax({
                    type: 'POST',
                    url: config.base_url + '/manager/getInvMT',
                    dataType: "json",
                    data: {MT: [vi, variant]}
                }).done(function (json) {
                    if (json.error) {
                        noty({
                            text: 'Load MT value fail!',
                            layout: 'topCenter',
                            type: 'error',
                            timeout: 3000
                        });

                        $('#scaned_' + vi + '_' + variant).find('.live_value').html('null');

                        return false;
                    }

                    if (json.live_total) {
                        $('#scaned_' + vi + '_' + variant).data('pk', json.live_total['IDNO']).find('.live_value').html(json.live_total['MT']);
                        $('#barcode_' + vi + '_' + variant).attr('max', json.live_total['MT']);
                    } else {
                        noty({
                            text: 'There is no match VINO to load MT value!',
                            layout: 'topCenter',
                            type: 'warning',
                            timeout: 1000
                        });

                        $('#scaned_' + vi + '_' + variant).find('.live_value').html('null');
                    }
                }).fail(function (jqXHR) {
                    console.log("getInvMT: " + jqXHR.statusText);
                });
            } else {
                var max = $('#barcode_' + vi + '_' + variant).attr('max');

                if ((parseInt($('#barcode_' + vi + '_' + variant).val()) + 1) <= max) {
                    $('#barcode_' + vi + '_' + variant).val(parseInt($('#barcode_' + vi + '_' + variant).val()) + 1);
                }
            }
        } // main callback function	
    });
    /**
     * Event
     * barcode - 確認
     */
    $('#barcodeConfirm .confirm').click(function () {
        var total = avgris.content.db.barcode.main.find('#barcode_counter .barcode_counter_line');

        var MT = {};

        var values = [];
        $.each(total, function (index, value) {
            if ($.isNumeric($(value).find('.live_value').text())) {
                var ivalues = {};
                ivalues.IDNO = $(value).children().data('pk');
                ivalues.MT = $(value).find('.live_value').text() - $(value).find('input').val();

                values.push(ivalues);
            }
        });

        MT.changed = values;

        if (MT.changed.length > 0) {
            noty({
                text: 'Do you want to do these operations?<br>change: ' + MT.changed.length,
                layout: 'center',
                type: 'confirm',
                buttons: [
                    {addClass: 'button', text: 'Confirm', onClick: function ($noty) {
                            config.xhr !== null ? config.xhr.abort() : '';

                            $.ajax({
                                type: 'POST',
                                dataType: "json",
                                url: config.base_url + '/manager/updateTableData/' + avgris.content.db.page,
                                data: {TableData: MT},
                                xhr: function ()
                                {
                                    var xhr = new window.XMLHttpRequest();

                                    config.xhr = xhr;

                                    return xhr;
                                }
                            }).done(function (json) {
                                $noty.close();

                                if (json.error) {
                                    noty({
                                        text: "Operation fail!<br>" + json.error,
                                        layout: 'topCenter',
                                        type: 'error',
                                        timeout: 3000
                                    });
                                } else {
                                    noty({
                                        text: "Operation success!",
                                        layout: 'topCenter',
                                        type: 'success',
                                        timeout: 1000
                                    });
                                }

                                avgris.content.main.removeClass('loadingContent');
                                avgris.content.db.barcode.main.removeClass('showPanel');

                                $('#scan_log').html('');
                                $('#barcode_counter').html('');

                                config.xhr = null;
                            }).fail(function (jqXHR) {
                                $noty.close();
                                avgris.content.main.removeClass('loadingContent');

                                console.log("updateRelatedData: " + jqXHR.statusText);
                            });
                        }
                    },
                    {addClass: 'button', text: 'Cancel', onClick: function ($noty) {
                            avgris.content.main.removeClass('loadingContent');

                            $noty.close();
                        }
                    }
                ]
            });
        } else {
            noty({
                text: "You don't change anything!",
                layout: 'topCenter',
                type: 'warning',
                timeout: 1000
            });
        }
    });
    /**
     * Event
     * barcode - 圖示點選
     */
    $('#barcode').click(function () {
        if (avgris.content.db.barcode.main.hasClass('showPanel')) {
            avgris.content.db.barcode.main.removeClass('showPanel');

            $('#scan_log').html('');
            $('#barcode_counter').html('');
        } else {
            avgris.content.main.find('.showPanel').removeClass('showPanel');
            avgris.content.db.barcode.main.addClass('showPanel');
        }
    });
    /**
     * Event
     * barcode - 關閉視窗
     */
    $('#barcodeConfirm .cancel, #barcodeclose').click(function () {
        avgris.content.db.barcode.main.removeClass('showPanel');

        $('#scan_log').html('');
        $('#barcode_counter').html('');
    });
    /**
     * Event
     * barcode - 刪除已掃描項目
     */
    avgris.content.db.barcode.main.on('click', '.barcode_line_remove', function () {
        var self = $(this);

        self.closest('.barcode_counter_line').remove();

        $.each($('.barcode_counter_line'), function (index, value) {
            $(this).find('.number_label').html((index + 1));
        });
    });
    /**
     * Event
     * barcode - 設定最大值
     */
    avgris.content.db.barcode.main.on('change keyup', 'input', function () {
        var self = $(this);
        var max = self.attr('max');

        if (self.val() > max) {
            self.val(max);
        }
    });
});