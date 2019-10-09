$(document).ready(function () {
    /**
     * Event
     * thead checkbox 全選功能
     */
    $('#check_all').click(function () {
        if ($(this).prop('checked')) {
            avgris.content.db.databody.find('input[type=checkbox]').prop('checked', true).closest('tr').addClass('checked');
        } else {
            avgris.content.db.databody.find('input[type=checkbox]').prop('checked', false).closest('tr').removeClass('checked');
        }
    });
    /**
     * Event
     * 刪除所勾選的項目
     */
    $('#delete').click(function () {
        avgris.content.main.addClass('loadingContent');

        noty({
            text: 'Do you want to delete selected row?',
            layout: 'center',
            type: 'confirm',
            buttons: [
                {addClass: 'button', text: 'Delete', onClick: function ($noty) {
                        var len = avgris.content.db.databody.find('input:checked').length;
                        var pks = [];

                        avgris.content.db.databody.find('tr.checked').each(function () {
                            pks.push($(this).children('td[title]:eq(0)').text());
                        });

                        var datapks = {};

                        datapks[avgris.content.db.datahead.find('span[data-type]:eq(0)').text()] = pks;

                        $noty.close();

                        $.ajax({
                            type: 'POST',
                            dataType: "json",
                            url: config.base_url + '/manager/deleteTableData/' + avgris.content.db.page,
                            data: {TableData: datapks}
                        }).done(function (json) {
                            if (json.error) {
                                noty({
                                    text: "Delete Failed!!!<br>" + json.error,
                                    type: 'error',
                                    timeout: 2000
                                });
                            } else {
                                avgris.content.db.databody.find('tr.checked').remove();

                                $('#total').html((parseInt($('#total').text()) - len));
                                $('a[data-request=' + avgris.content.db.page + ']').children('span.total').html((parseInt($('a[data-request=' + avgris.content.db.page + ']').children('span.total').text()) - len));

                                noty({
                                    text: "You deleted " + len + " rows",
                                    type: 'success',
                                    timeout: 2000
                                });
                            }

                            avgris.content.main.removeClass('loadingContent');

                            config.xhr = null;
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
    });
});    