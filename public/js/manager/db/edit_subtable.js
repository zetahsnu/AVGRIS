$(document).ready(function () {
    var addTr_temp;
    /**
     * Event
     * 編輯器 - Subtable - 新增動作
     */
    avgris.content.db.editor.main.find('div.subTable button[data-op=add]').click(function () {
        var self = $(this);

        if (avgris.content.db.editor.subTable.sbody.find('tr').length === 0) {
            avgris.content.db.editor.subTable.sbody.empty();
        }

        if (typeof addTr_temp === 'undefined') {
            self.append("<img src=" + config.base_url + "/public/images/ajax-loader.gif>");

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/getSubtableAddTr/' + avgris.content.db.page,
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: "Load new add line fail!<br>" + json.error,
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 3000
                    });
                } else {
                    addTr_temp = json.html;

                    avgris.content.db.editor.subTable.sbody.append(addTr_temp);
                }

                self.children('img').remove();

                config.xhr = null;
            }).fail(function (jqXHR) {
                console.log("getSubtableAddTr: " + jqXHR.statusText);
            });
        } else {
            avgris.content.db.editor.subTable.sbody.append(addTr_temp);
        }
    });
    /**
     * Event
     * 編輯器 - Subtable - 刪除動作
     */
    avgris.content.db.editor.main.find('div.subTable button[data-op=delete]').click(function () {
        var trs = avgris.content.db.editor.subTable.main.find('input:checked').closest('tr');
        var dels = avgris.content.db.editor.subTable.sbody.data('dels') || [];

        $.each(trs, function () {
            var tr = $(this);

            if (typeof tr.data('pk') !== 'undefined') {
                dels.push(tr.data('pk'));
            }

            tr.remove();
        });

        if (dels.length > 0) {
            avgris.content.db.editor.subTable.sbody.attr('data-dels', "[" + dels + "]").data('dels', dels);
        }
    });
    /**
     * Event
     * 編輯器 - 顯示Subtable 並顯示資料
     */
    avgris.content.db.editor.main.find('button.loadSubtable').click(function () {
        var model = $('#model');
        var self = $(this);

        avgris.content.db.editor.subTable.sbody.data('dels', []).attr('data-dels', '[]');
        avgris.content.db.editor.main.find('.subTableArea').show();

        if (model.data('model') === 'edit') {
            avgris.content.db.editor.subTable.sbody.html("<img src=" + config.base_url + "/public/images/ajax-loader.gif>");

            var pkN = avgris.content.db.editor.main.find('div.subTable').data('spk');
            var data = {};
            var pk = {};

            pk[pkN] = avgris.content.db.editor.main.find('div[data-type=' + pkN + ']').children(':eq(1)').children(':eq(0)').val();

            data.pk = pk;

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/getOtherRelatedTable/' + avgris.content.db.page,
                data: {OtherRelatedTable: data},
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: "Load subTable data fail!<br>" + json.error,
                        layout: 'topCenter',
                        type: 'error',
                        timeout: 3000
                    });
                } else {
                    avgris.content.db.editor.subTable.sbody.html(json.html);

                    self.data('total', ' (' + json.total + ')').attr('data-total', ' (' + json.total + ')');
                }

                config.xhr = null;
            }).fail(function (jqXHR) {
                console.log("getOtherRelatedTable: " + jqXHR.statusText);
            });
        }
    });
    /**
     * Event
     * 編輯器 - 檢查Subtable 欄位的值
     */
    avgris.content.db.editor.subTable.sbody.on("keydown change", "tr td input", function () {
        var self = $(this);

        self.addClass('changed');
    });

    avgris.content.db.editor.subTable.sbody.on("change", "tr td select", function () {
        var self = $(this);

        if (self.val() !== '') {
            self.addClass('changed');
        } else {
            self.removeClass('changed');
        }
    });
});