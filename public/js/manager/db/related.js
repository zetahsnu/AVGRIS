avgris.content.db.related = {
    main: $('.relatededitor'),
    rbody: $('#relatedBody'),
    rhead: $('#relatedHead'),
    container: $('#relatedContainer')
};

$(document).ready(function () {
    /**
     * Event
     * 關聯表 - 圖示點選
     */
    $('#related').click(function () {
        if (avgris.content.db.related.main.hasClass('showPanel')) {
            avgris.content.db.related.main.removeClass('showPanel');
        } else {
            avgris.content.main.find('.showPanel').removeClass('showPanel');
            avgris.content.db.related.main.addClass('showPanel');

            avgris.content.db.related.main.find('select').val('');
            avgris.content.db.related.container.hide();
            $('#related_column').data('related', 'none').attr('data-related', 'none');
        }
    });
    /**
     * Event
     * 關聯表 - 關閉視窗
     */
    $('#relatedclose').click(function () {
        avgris.content.db.related.main.removeClass('showPanel');
    });
    /**
     * Event
     * 關聯表 - 載入
     */
    $('#relatedLoad').click(function () {
        var self = $(this);
        var selected = $(':selected', self.prev('select'));
        var group = selected.closest('optgroup').data('group');
        var value = selected.val();

        avgris.content.db.related.rbody.empty();
        avgris.content.db.related.rhead.empty();
        avgris.content.db.related.container.hide();

        if (value !== '') {
            avgris.content.db.related.rbody.attr('data-dels', "[]").data('dels', []);

            $('#related_column').data('related', value.toUpperCase()).attr('data-related', value.toUpperCase());
            $('#relatedColumn').text(value.toUpperCase());

            self.append("<img src=" + config.base_url + "/public/images/ajax-loader.gif>");

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/getRelatedData/' + avgris.content.db.page,
                data: {RelatedData: {
                        data: value,
                        group: group
                    }},
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: 'Load Content Fail!<br>' + json.error,
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 1000
                    });
                } else {
                    avgris.content.db.related.rhead.html(json.rhead);
                    avgris.content.db.related.rbody.html(unescape(json.rbody));
                }

                self.children('img').remove();
                avgris.content.db.related.container.show('slow');

                config.xhr = null;
            });
        } else {
            $('#related_column').data('related', 'none').attr('data-related', 'none');

            noty({
                text: 'Please select one option to load!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 1000
            });
        }
    });
    /**
     * Event
     * 關聯表 - 子功能 - 新增
     */
    $('#opAdd').click(function () {
        var ths = avgris.content.db.related.rhead.find('tr th');
        var thLen = ths.length;
        var appStr = '<tr class=add><td><input type=checkbox></td>';
        var keys = [];

        ths.each(function (index) {
            if (index !== 0) {
                keys.push($(this).data('stype'));
            }
        });

        $.each(keys, function (index, value) {
            appStr += '<td style=\"width:calc((90% - ' + (thLen * 10) + 'px) / ' + (thLen - 1) + ')\"><input type=text placeholder=' + value + ' ' + ((index === 0) ? 'class=error' : '') + '></td>';
        });

        appStr += '</tr>';

        avgris.content.db.related.rbody.append(appStr);
    });
    /**
     * Event
     * 關聯表 - 子功能 - 刪除
     */
    $('#opDelete').click(function () {
        var trs = avgris.content.db.related.rbody.find('input:checked').closest('tr');
        var dels = avgris.content.db.related.rbody.data('dels') || [];

        $.each(trs, function () {
            var tr = $(this);

            if (typeof tr.data('pk') !== 'undefined') {
                dels.push(tr.data('pk'));
            }

            tr.remove();
        });

        if (dels.length > 0) {
            avgris.content.db.related.rbody.attr('data-dels', "[" + dels + "]").data('dels', dels);
        }
    });
    /**
     * Event
     * 關聯表 - 取消
     */
    $('#opCancel').click(function () {
        avgris.content.db.related.main.removeClass('showPanel');
    });
    /**
     * Event
     * 關聯表 - 確認
     */
    $('#opConfirm').click(function () {
        var errorLen = avgris.content.db.related.rbody.find('.error').length;

        if (errorLen > 0) {
            noty({
                text: "Something errors exist, Please fix!",
                layout: 'topCenter',
                type: 'error',
                timeout: 1000
            });

            return false;
        }

        var Related = {};
        var selected = $(':selected', $('#relatedLoad').prev('select'));
        var group = selected.closest('optgroup').data('group');

        Related.group = group;
        Related.delete = avgris.content.db.related.rbody.data('dels') || [];

        var adds = avgris.content.db.related.rbody.find('tr.add');
        var ths = avgris.content.db.related.rhead.find('th');
        var types = [];

        $.each(ths, function (index, value) {
            if (index !== 0) {
                types[index] = $(this).data('stype');
            }
        });

        var values = [];

        $.each(adds, function () {
            var add = $(this);

            if (add.find('.changed').length > 0) {
                var ivalue = {};

                $.each(types, function (index, value) {
                    if (index !== 0) {
                        ivalue[value] = add.find('td').eq(index).children().val();
                    }
                });

                values.push(ivalue);
            }
        });

        Related.add = values;

        var edits = avgris.content.db.related.rbody.find('tr').not('.add');

        values = [];

        $.each(edits, function () {
            var edit = $(this);

            if (edit.find('.changed').length > 0) {
                var ivalue = {};

                ivalue.PK = edit.data('pk');

                $.each(types, function (index, value) {
                    if (index !== 0) {
                        ivalue[value] = edit.find('td').eq(index).children().val();
                    }
                });

                values.push(ivalue);
            }
        });

        Related.edit = values;
        Related.column = $('#related_column').data('related');

        if (Related.delete.length === 0 && Related.add.length === 0 && Related.edit.length === 0) {
            noty({
                text: "You don't change anything!",
                layout: 'topCenter',
                type: 'warning',
                timeout: 1000
            });
        } else {
            avgris.content.main.addClass('loadingContent');

            noty({
                text: 'Do you want to do these operations?<br>add: ' + Related.add.length + ', edit: ' + Related.edit.length + ', delete: ' + Related.delete.length,
                layout: 'center',
                type: 'confirm',
                buttons: [
                    {addClass: 'button', text: 'Confirm', onClick: function ($noty) {
                            config.xhr !== null ? config.xhr.abort() : '';

                            $.ajax({
                                type: 'POST',
                                dataType: "json",
                                url: config.base_url + '/manager/updateRelatedData/' + avgris.content.db.page,
                                data: {RelatedData: Related},
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
        }
    });
    /**
     * Event
     * 關聯表 - 欄位是否有變動
     */
    avgris.content.db.related.rbody.on("keydown change", "tr td input[type=text]", function () {
        var self = $(this);
        var index = self.closest('tr').find('td').index($(this).parent());

        if (self.val() === '') {
            self.removeClass('changed');

            if (index === 1) {
                self.addClass('error');
            }
        } else {
            self.addClass('changed').removeClass('error');
        }
    });
});