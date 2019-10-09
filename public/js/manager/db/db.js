avgris.content.db = {
    page: $('#page').data('page'),
    editor: {
        main: $('.dbeditor'),
        subTable: {
            main: $('.dbeditor').find('table.subTable'),
            sbody: $('.dbeditor').find('table.subTable tbody'),
            shead: $('.dbeditor').find('table.subTable thead')
        }
    },
    aside: $('.dbaside'),
    datahead: $('#datahead'),
    databody: $('#databody')
};

$(document).ready(function () {
    var pined = false;
    var changed_colum = []; //紀錄有改變大小的索引th
    var resizeTimer = []; //欄位的setTimeout

    showExitFilters();
    showExitOrders();
    //綁定perfectScrollbar插件
    avgris.content.db.aside.perfectScrollbar();
    avgris.content.db.databody.perfectScrollbar();
    //destroy perfectScrollbar
    avgris.content.main.perfectScrollbar().perfectScrollbar('destroy');

    [].slice.call(document.querySelectorAll('.tabs')).forEach(function (el) {
        new CBPFWTabs(el);
    });

    /**
     * jqPagination插件
     */
    $('.pagination').jqPagination({
        link_string: config.base_url + '/manager/getTableData/{page_number}',
        max_page: $('.pagination input[data-max-page]').data('max-page'),
        current_page: 1,
        paged: function (page) {
            if (config.xhr === null) {
                avgris.content.db.aside.removeClass('showaside');
                avgris.content.db.editor.main.removeClass('showPanel');
                getPart(page);
            }
        }
    });
    /**
     * Event
     * 刷新頁面
     */
    $('#refresh').click(function () {
        $('a[data-request=' + avgris.content.db.page + ']').click();
    });
    /**
     * Event
     * 過濾器 - 階層選項
     */
    $('#GENUS').change(function () {
        $('#SPECIES').children().remove();
        $('#SPECIES').parent().next().css('display', 'none');

        $('#SUBTAXA').children().remove();
        $('#SUBTAXA').parent().next().css('display', 'none');

        if ($(this).val() !== '') {
            getList('SPECIES', {
                filters: 'genus=' + $(this).val() + ','
            });
        }

        $(this).parent().next().css('display', 'inline-block');
    });
    /**
     * Event
     * 過濾器 - 階層選項
     */
    $('#SPECIES').change(function () {
        $('#SUBTAXA').children().remove();
        $('#SUBTAXA').parent().next().css('display', 'none');

        if ($(this).val() !== '') {
            var index = $('.level_two:eq(0)').children().index($('a[data-request=' + avgris.content.db.page).parent());

            if (index > 2 && index < 60) {
                getList('SUBTAXA', {
                    filters: 'species=' + $(this).val() + ','
                });
            } else {
                $('#GENUS').parent().next().css('display', 'none');

                getList('SUBTAXA', {
                    filters: 'genus=' + $('#GENUS').val() + ',species=' + $(this).val() + ','
                });
            }
        }

        $(this).parent().next().css('display', 'inline-block');
    });
    /**
     * Event
     * 過濾器 - 階層選項
     */
    $('#SUBTAXA').change(function () {
        if ($(this).val() !== '') {
            $('#SPECIES').parent().next().css('display', 'none');
            $(this).parent().next().css('display', 'inline-block');
        }
    });

    /**
     * Event
     * 過濾器 - 點下新增時
     */
    avgris.content.db.aside.find("button[name='add_filters']").click(function () {
        var self = $(this);
        var input = self.prev().children();
        var value = input.val();
        var type = input.attr('id');
        var parent = self.parent();

        //TODO 檢查文字
        if (!value && input.prop("tagName") != 'SELECT') {
            noty({
                text: 'Please enter any words!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000
            });

            return false;
        } else if (!value && input.prop("tagName") == 'SELECT') {
            noty({
                text: 'Please select any item!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000
            });

            return false;
        }

        var value2 = type === 'SHIP_DATE' ? input.next().val() : '';

        if (value2 !== '') {
            if (value2 <= value) {
                noty({
                    text: "Invalid Date<br>The end date you entered occurs before the start date.",
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 1000
                });
                return false;
            } else {
                value += '~' + value2;
            }
        }

        if ($('#GENUS') !== 'undefinded') {
            var gen = $('#GENUS');
            var gen_val = gen.val();
        }

        if (type === 'SPECIES') {
            if (gen.length > 0) {
                $("<div class='filters' name='filter' title='click to remove' data-type='GENUS' data-value=\"" + gen_val + "\">" + gen_val + "<span>&#215;</span></span>").insertAfter(gen.closest('div'));
            }
        } else if (type === 'SUBTAXA') {
            if (gen.length > 0) {
                $("<div class='filters' name='filter' title='click to remove' data-type='GENUS' data-value=\"" + gen_val + "\">" + gen_val + "<span>&#215;</span></span>").insertAfter(gen.closest('div'));
            }

            var spe = $('#SPECIES');
            var spe_val = spe.val();

            $("<div class='filters' name='filter' title='click to remove' data-type='SPECIES' data-value=\"" + spe_val + "\">" + spe_val + "<span>&#215;</span></span>").insertAfter(spe.closest('div'));
        }

        if (type === 'GENUS' || type === 'SPECIES' || type === 'SUBTAXA') {
            var index = $('.level_two:eq(0)').children().index($('a[data-request=' + avgris.content.db.page).parent());

            if (index > 3 && index < 60) {
                $('#SPECIES').parent().next().css('display', 'inline-block').prev().children().val('');
            } else {
                $('#GENUS').parent().next().css('display', 'inline-block').prev().children().val('');
                $('#SPECIES').parent().next().css('display', 'none').prev().children().children().remove();
            }
            $('#SUBTAXA').parent().next().css('display', 'none').prev().children().children().remove();
        } else {
            input.val('').next().val('');
        }

        $("<div class='filters' name='filter' title='click to remove' data-type='" + type + "' data-value=\"" + value + "\">" + value + "<span>&#215;</span></span>").insertAfter(parent);

        setCookie(avgris.content.db.page + 'filters_manager', getFilters(), 1);
        getPart();
        setFiltersAction();
    });
    /**
     * Event
     * 顯示 SubTable 資料
     */
    avgris.content.db.databody.on('click', 'tr td button.view_detail', function () {
        var self = $(this);
        var row_tr = self.closest('tr');
        var index = row_tr.index();
        var subTable_view = avgris.content.db.databody.find('tr').siblings('div.subTable_view');

        subTable_view.remove();

        if (subTable_view.data('index') != index) {
            $("<div class='subTable_view' data-index='" + index + "'><img src=" + config.base_url + "/public/images/ajax-loader.gif></div>").insertAfter(row_tr);
            subTable_view = avgris.content.db.databody.find('tr').siblings('div.subTable_view');

            var pkN = avgris.content.db.editor.main.find('.subTable').data('spk');
            var data = {};
            var pk = {};
            var th_index = avgris.content.db.datahead.find('span[data-type=' + pkN + ']').closest('th').index();

            pk[pkN] = row_tr.children(':eq(' + th_index + ')').children('.row').text();

            data.pk = pk;
            data.view = true;

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
                },
            }).done(function (json) {
                if (json.total > 0) {
                    var table = $("<div class='css_table'></div>");

                    table.append(json.html_head).append(json.html_body);
                    subTable_view.html(table);
                } else {
                    subTable_view.html(json.html_body);
                }

                config.xhr = null;
            });
        }
    });
    /**
     * Event
     * 重置按鈕
     */
    $('#pageReset').click(function (e) {
        e.preventDefalut;

        setCookie(avgris.content.db.page + 'filters_manager', '', -1);
        setCookie(avgris.content.db.page + 'orders_manager', '', -1);
        setCookie('manager_perPageRow', 20, 1);

        avgris.content.db.aside.find("div[name='filter']").remove();
        avgris.content.db.datahead.find('th span[data-order]').removeAttr('data-order');
        $('#perShow').val(20);

        getPart();
    });
    /**
     * Event
     * 新增排序
     */
    avgris.content.db.datahead.find('th span[data-type]').click(function () {
        var self = $(this);
        var order = self.attr('data-order') || self.data('order');

        avgris.content.db.datahead.find('th span[data-type]').data('order', '').removeAttr('data-order');

        if (typeof order === 'undefined') {
            self.data('order', 'ASC').attr('data-order', 'ASC');
        } else if (order === 'ASC') {
            self.data('order', 'DESC').attr('data-order', 'DESC');
        } else {
            self.data('order', 'ASC').attr('data-order', 'ASC');
        }

        setCookie(avgris.content.db.page + 'orders_manager', getOrders(), 1);
        getPart();
    });
    /**
     * Event
     * window視窗大小變更，更新捲動軸
     */
    $(window).resize(function () {
        avgris.content.db.databody.perfectScrollbar('update');
    });
    /**
     * Live Event
     * 資料行選擇新增class樣式
     */
    avgris.content.db.databody.on('click', 'tr', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
    });
    /**
     * Live Event
     * 編輯資料行
     */
    avgris.content.db.databody.on('dblclick', 'tr', function () {
        var model = $('#model');
        model.data('model', 'edit').attr('data-model', 'edit');

        avgris.content.db.editor.main.addClass('showPanel');
        ResetDBEditor();

        var self = $(this);
        var therow = {};
        var cells = avgris.content.db.datahead.find('th .cell');

        self.find('td .row').each(function (index, value) {
            if (cells.eq(index).text() !== '') {
                therow[cells.eq(index).text()] = $(value).text();
            }
        });

        $.each(therow, function (index, value) {
            avgris.content.db.editor.main.find('[data-type=' + index + ']').children(':eq(1)').children(':eq(0)').val(value).removeClass('changed error');

            if (index === 'PAY_TERM') {
                avgris.content.db.editor.main.find('[data-type=' + index + '] select').change().removeClass('changed');
            }
        });

        if (typeof therow['IDNO'] !== 'undefined' && $('canvas').length > 0) {
            checkPhotoExist(therow['IDNO'])
        }
    });
    /**
     * Event
     * tbody checkbox 勾選改變狀態
     */
    avgris.content.db.databody.on('change', 'input[type=checkbox]', function () {
        var self = $(this);

        if (self.prop('checked')) {
            self.closest('tr').addClass('checked');
        } else {
            self.closest('tr').removeClass('checked');
        }
    });
    /**
     * Event
     * 水平捲動tbody變更thead位置
     */
    avgris.content.db.databody.scroll(function () {
        var let = $(this).scrollLeft();
        var top = $(this).scrollTop();
        var pinedwidth = 0;

        if (pined) {
            pinedwidth = avgris.content.db.datahead.find('th.pined .cell').width() + 21;
            avgris.content.db.databody.find('td.pined').css('margin-top', (-top) + 'px');
        }

        avgris.content.db.datahead.css('left', (-let + pinedwidth) + 'px');
    });
    /**
     * Event
     * 關閉編輯器
     */
    $('#editorclose, #editorConfirm .cancel').click(function () {
        avgris.content.db.editor.main.removeClass('showPanel');

        config.xhr !== null ? config.xhr.abort() : '';

        if (typeof $('#after').data('tempname') !== 'undefined') {
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/manager/deleteTempPicture/' + avgris.content.db.page,
                data: {tempname: $('#after').data('tempname')},
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    console.log(json.error);
                } else {
                    console.log('Temp picture delete success!!');
                }
                config.xhr = null;
            });
        }
    });
    /**
     * Event
     * 編輯器 - 確認按鈕
     */
    $('#editorConfirm .confirm').click(function () {
        var model = $('#model').data('model');

        if (model === 'edit') {
            var changedColumn = {};

            avgris.content.db.editor.main.find('div[data-type] .changed').each(function () {

                changedColumn[$(this).closest('div[data-type]').data('type')] = $(this).val();
            });

            if ($.isEmptyObject(changedColumn) && typeof $('#after').data('tempname') === 'undefined' && typeof avgris.content.db.editor.subTable.sbody.data('dels') === 'undefined' && avgris.content.db.editor.subTable.sbody.find('tr input.changed').length === 0) {
                noty({
                    text: "You don't change any!",
                    layout: 'topCenter',
                    type: 'warning',
                    timeout: 1000
                });

                return false;
            }

            if (avgris.content.db.editor.main.find('.error').length > 0) {
                noty({
                    text: "Invalid Date<br>The end date you entered occurs before the start date.",
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 1000
                });

                return false;
            }

            if (!$.isEmptyObject(changedColumn)) {
                changedColumn[avgris.content.db.datahead.find('th .cell [data-type]:eq(0)').text()] = avgris.content.db.databody.find('tr.selected').children('[title]:eq(0)').attr('title');
            }

            var updateData = {};

            avgris.content.main.addClass('loadingContent');

            updateData.changed = [changedColumn];

            if (typeof $('#after').data('tempname') != 'undefined') {
                updateData.pictureTempName = $('#after').data('tempname');

                var pk = {};

                pk.IDNO = avgris.content.db.databody.find('tr.selected').children('[title]:eq(0)').attr('title');

                updateData.pk = pk;
            }

            if (avgris.content.db.editor.subTable.main.length > 0) {
                var otherRelated = {};

                otherRelated.delete = avgris.content.db.editor.subTable.sbody.data('dels');

                var adds = avgris.content.db.editor.subTable.sbody.find('tr.add');
                var ths = avgris.content.db.editor.subTable.shead.find('th');
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

                otherRelated.add = values;

                var edits = avgris.content.db.editor.subTable.sbody.find('tr').not('.add');

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

                otherRelated.edit = values;

                var pk = avgris.content.db.editor.main.find('div.subTable').data('spk');
                var pks = {};

                pks[pk] = avgris.content.db.editor.main.find('div[data-type=' + pk + '] input').val();

                otherRelated.column = pks;
                updateData.otherChanged = otherRelated;
            }

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                data: {TableData: updateData},
                url: config.base_url + '/manager/updateTableData/' + avgris.content.db.page,
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: 'Update Table Data Fail!<br>' + json.error,
                        type: 'error',
                        maxVisible: 1
                    });
                } else {
                    avgris.content.db.databody.find('.selected').addClass('changed');

                    var keys = Object.keys(changedColumn);
                    var indexs = [];

                    $.each(keys, function (index, value) {
                        var span = avgris.content.db.datahead.find("th .cell span[data-type='" + value + "']");
                        var obj = {};

                        obj.value = changedColumn[value];
                        obj.index = avgris.content.db.datahead.find('th .cell span').index(span);

                        indexs.push(obj);
                    });

                    $.each(indexs, function (index, value) {
                        avgris.content.db.databody.find('.selected').children('td').eq(value.index).attr('title', value.value).addClass('changed').children('.row').text(value.value);
                    });

                    noty({
                        text: 'Change Success!',
                        type: 'success',
                        timeout: 2000
                    });
                }

                avgris.content.db.editor.main.removeClass('showPanel');
                avgris.content.main.removeClass('loadingContent');

                config.xhr = null;
            });
        } else if (model === 'add') {
            var changedColumn = {};

            avgris.content.db.editor.main.find('div[data-type] .changed').each(function () {
                changedColumn[$(this).closest('div[data-type]').data('type')] = $(this).val();
            });

            if ($.isEmptyObject(changedColumn) && typeof $('#after').data('tempname') === 'undefined' && typeof avgris.content.db.editor.subTable.sbody.data('dels') === 'undefined' && avgris.content.db.editor.subTable.sbody.find('tr.add input.changed').length < 2) {
                noty({
                    text: 'Please Enter Data!',
                    layout: 'topCenter',
                    type: 'warning',
                    timeout: 1000
                });

                return false;
            }

            if (avgris.content.db.editor.main.find('.error').length > 0) {
                noty({
                    text: "You need to enter right data info into red border input!",
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 1000
                });

                return false;
            }

            var addData = {};

            avgris.content.main.addClass('loadingContent');

            addData.changed = [changedColumn];
            addData.pk = avgris.content.db.datahead.find('th .cell [data-type]:eq(0)').text();
            addData.pictureTempName = $('#after').data('tempname');

            if (avgris.content.db.editor.subTable.main.length > 0) {
                var otherRelated = {};
                var adds = avgris.content.db.editor.subTable.sbody.find('tr.add');
                var ths = avgris.content.db.editor.subTable.shead.find('th');
                var types = [];

                $.each(ths, function (index) {
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

                otherRelated.add = values;

                var pk = avgris.content.db.editor.main.find('div.subTable').data('spk');
                var pks = {};

                pks[pk] = avgris.content.db.editor.main.find('div[data-type=' + pk + '] input').val();

                otherRelated.column = pks;
                addData.otherChanged = otherRelated;
            }

            config.xhr !== null ? config.xhr.abort() : '';

            $.ajax({
                type: 'POST',
                dataType: "json",
                data: {TableData: addData},
                url: config.base_url + '/manager/insertTableData/' + avgris.content.db.page,
                xhr: function ()
                {
                    var xhr = new window.XMLHttpRequest();

                    config.xhr = xhr;

                    return xhr;
                }
            }).done(function (json) {
                if (json.error) {
                    noty({
                        text: 'Add Data Fail!<br>' + json.error,
                        type: 'error',
                        maxVisible: 1
                    });
                } else {
                    $(json.html).insertBefore('#databody tr:first').addClass('added');

                    $('#total').html((parseInt($('#total').text()) + 1));
                    $('a[data-request=' + avgris.content.db.page + ']').children('span.total').html((parseInt($('a[data-request=' + avgris.content.db.page + ']').children('span.total').text()) + 1));

                    noty({
                        text: 'Add Success!',
                        type: 'success',
                        timeout: 1000
                    });
                }

                avgris.content.db.editor.main.removeClass('showPanel');
                avgris.content.main.removeClass('loadingContent');

                config.xhr = null;
            });
        }
    });
    /**
     * 初始化tbody資料大小
     */
    avgris.content.db.datahead.find('th .cell').each(function (index) {
        var self = $(this);

        ResizeColumn(self, index, false);
    });
    /**
     * Special Event
     * 變更欄位大小，改變tbody寬度
     */
    avgris.content.db.datahead.find('th .cell').resize(function () {
        var self = $(this);
        var index = avgris.content.db.datahead.find('th .cell').index(self);

        clearTimeout(resizeTimer[index]);

        var isPined = self.parent('th').hasClass('pined');

        if (typeof self.next('.line').get(0) === 'undefined') {
            $("<div class='line' />").insertAfter(self);
        }

        resizeTimer[index] = setTimeout(function () {
            ResizeColumn(self, index, isPined);
        }, 200);
    });
    /**
     * Event
     * 釘選欄位功能
     * @type Boolean|Boolean|Boolean
     */
    avgris.content.db.datahead.find('.pin').click(function () {
        var self = $(this);
        var index = avgris.content.db.datahead.find('.pin').index(self);
        var isPined = self.parent('th').hasClass('pined');

        if (!isPined) {
            var wasPinedW = 0;

            if (pined) {
                wasPinedW = avgris.content.db.datahead.find('th.pined .cell').width() + 21;
            }

            avgris.content.db.datahead.find('th').siblings().removeClass('pined').eq(index).addClass('pined');
            avgris.content.db.databody.find('tr').each(function () {
                $(this).children('td.pined').removeClass('pined');
                $(this).children('td').eq(index).addClass('pined');
            });

            var pinedwidth = avgris.content.db.datahead.find('th .cell').eq(index).width() + 21;
            var ctheadleft = parseInt(avgris.content.db.datahead.css('left'), 10);
            var top = avgris.content.db.databody.scrollTop();

            avgris.content.db.datahead.css('left', ctheadleft - wasPinedW + pinedwidth);
            avgris.content.db.databody.css('left', pinedwidth);
            avgris.content.db.databody.find('td.pined').css('margin-top', (-top) + 'px');

            pined = true;
        } else {
            pined = false;

            self.parent('th').removeClass('pined');

            avgris.content.db.databody.find('tr').each(function () {
                $(this).children('td.pined').removeClass('pined');
            });

            avgris.content.db.databody.css('left', 0);

            var ctheadleft = parseInt(avgris.content.db.datahead.css('left'), 10);

            avgris.content.db.datahead.css('left', ctheadleft - avgris.content.db.datahead.find('th:eq(' + index + ') .cell').width() - 21);
        }
    });
    /**
     * Event
     * 每頁顯示多少行
     */
    $('#perShow').change(function () {
        var value = $(this).val();

        setCookie('manager_perPageRow', value, 1);
        getPart();
    });
    /**
     * Event
     * 顯示過濾器
     */
    $('#search').click(function () {
        avgris.content.db.aside.hasClass('showaside') ? avgris.content.db.aside.removeClass('showaside') : avgris.content.db.aside.addClass('showaside');
    });
    /**
     * Event
     * 過濾器的關閉按鈕
     */
    $('#asideclose').click(function () {
        avgris.content.db.aside.removeClass('showaside');
    });
    /**
     * 編輯視窗 - 欄位綁定change Event
     */
    avgris.content.db.editor.main.find('[data-type]').each(function () {
        var self = $(this);
        var type = self.data('type');
        var filters = ['SISN', 'VINO', 'IDNO'];

        self.children(':eq(1)').children(':eq(0)').change(function () {
            var iself = $(this);

            iself.addClass('changed');

            if (iself.val() === '' && $.inArray(type, filters) >= 0) {
                iself.addClass('error');
            } else {
                iself.removeClass('error');
            }
        });
    });
    /**
     * Event
     * 顯示編輯視窗 - 編輯
     */
    $('#edit').click(function () {
        if (typeof avgris.content.db.databody.find('.selected').get(0) !== 'undefined') {
            var model = $('#model');

            if (model.data('model') === 'edit') {
                avgris.content.db.editor.main.hasClass('showPanel') ? avgris.content.db.editor.main.removeClass('showPanel') : avgris.content.db.editor.main.addClass('showPanel');
            } else {
                model.data('model', 'edit').attr('data-model', 'edit');

                if (!avgris.content.db.editor.main.hasClass('showPanel')) {
                    avgris.content.main.find('.showPanel').removeClass('showPanel');
                    avgris.content.db.editor.main.addClass('showPanel');
                }
            }

            ResetDBEditor();

            var therow = {};
            var cells = avgris.content.db.datahead.find('th .cell');

            avgris.content.db.databody.find('.selected .row').each(function (index, value) {
                if (cells.eq(index).text() !== '') {
                    therow[cells.eq(index).text()] = $(value).text();
                }
            });

            $.each(therow, function (index, value) {
                avgris.content.db.editor.main.find('[data-type=' + index + ']').children(':eq(1)').children(':eq(0)').val(value).removeClass('changed error');

                if (index === 'PAY_TERM') {
                    avgris.content.db.editor.main.find('[data-type=' + index + '] select').change().removeClass('changed');
                }
            });

            if (typeof therow['IDNO'] !== 'undefined' && $('canvas').length > 0) {
                checkPhotoExist(therow['IDNO']);
            }
        } else {
            noty({
                text: 'Please Select One Row To Edit!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 1000
            });
        }
    });
    /**
     * Event
     * 顯示編輯視窗 - 新增
     */
    $('#add').click(function () {
        var model = $('#model');

        if (model.data('model') === 'add') {
            avgris.content.db.editor.main.hasClass('showPanel') ? avgris.content.db.editor.main.removeClass('showPanel') : avgris.content.db.editor.main.addClass('showPanel');
        } else {
            model.data('model', 'add').attr('data-model', 'add');

            if (!avgris.content.db.editor.main.hasClass('showPanel')) {
                avgris.content.main.find('.showPanel').removeClass('showPanel');
                avgris.content.db.editor.main.addClass('showPanel');
            }
        }

        ResetDBEditor();
    });
    /**
     * Function
     * 重置編輯器狀態
     * @returns {undefined}
     */
    function ResetDBEditor() {
        avgris.content.db.editor.main.find('[data-type]').each(function () {
            var self = $(this);
            var type = self.data('type');

            if (type === 'SISN' || type === 'VINO' || type === 'IDNO') {
                self.children(':eq(1)').children(':eq(0)').val('').removeClass('changed').addClass('error');
            } else {
                self.children(':eq(1)').children(':eq(0)').val('').removeClass('changed error');
            }
        });

        avgris.content.db.editor.main.find('.subTableArea').hide().find('tbody').empty();
        avgris.content.db.editor.main.find('.loadSubtable').data('total', '').attr('data-total', '');

        var canvas = document.getElementById("before");

        if (canvas !== null) {
            var context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        canvas = document.getElementById("after");

        if (canvas !== null) {
            var context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        $('#after').removeData('tempname').removeAttr('data-tempname');
    }
    /**
     * Function
     * 調整欄位大小
     * @param {type} target
     * @param {type} index
     * @returns {undefined}
     */
    function ResizeColumn(target, index, isPined) {
        var width = target.width();
        var trd = avgris.content.db.databody.find('tr:eq(0) td:eq(' + index + ') .row');
        var trd_width = trd.width();

        if (trd_width !== width) {
            if ($.inArray(index, changed_colum) === -1) {
                changed_colum.push(index);
            }

            avgris.content.db.databody.find('tr').each(function () {
                var self = $(this);
                var tdslen = self.children('td').length;

                if ((index + 1) <= tdslen) {
                    self.find("td:eq(" + index + ")").css('min-width', width + 'px');
                    self.find("td:eq(" + index + ") .row").css('max-width', width + 'px');
                }
            });

            if (pined && isPined) {
                var ctheadleft = parseInt(avgris.content.db.datahead.css('left'), 10);

                avgris.content.db.datahead.css('left', ctheadleft + (width - trd_width));

                var ctbodyleft = parseInt(avgris.content.db.databody.css('left'), 10);

                avgris.content.db.databody.css('left', ctbodyleft + (width - trd_width));
            }

            if (width === 100) {
                changed_colum.pop(index);
            }
        }

        target.next('.line').remove();

        avgris.content.db.databody.perfectScrollbar('update');
    }
    /**
     * Function
     * 檢查圖片是否存在
     * @param {type} idno
     * @returns {undefined}
     */
    function checkPhotoExist(idno) {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            url: config.base_url + '/manager/checkPhotoExist/' + avgris.content.db.page + '/' + idno,
            type: 'POST',
            dataType: "json",
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            },
        }).done(function (json) {
            var canvas = document.getElementById("before");

            if (canvas !== null) {
                $('#target_before').loadingOverlay();

                var context = canvas.getContext('2d');

                context.clearRect(0, 0, canvas.width, canvas.height);

                if (json.status) {
                    var imageObj = new Image();

                    imageObj.src = config.base_url + '/app/pictures/' + avgris.content.db.page + '/' + idno + '.jpg';

                    imageObj.onload = function () {
                        context.drawImage(imageObj, canvas.width / 2 - imageObj.width / 2, canvas.height / 2 - imageObj.height / 2);
                        $('#target_before').loadingOverlay('remove');
                    };
                } else {
                    $('#target_before').loadingOverlay('remove');

                    context.font = "60px Georgia";
                    context.fillText("NO", 150, 140);
                    context.font = "60px Georgia";
                    context.fillText("IMAGE", 100, 210);
                }
            }

            config.xhr = null;
        });
    }
    /**
     * Function
     * 取得部分內容
     * @returns {undefined}
     */
    function getPart(page) {
        config.xhr !== null ? config.xhr.abort() : '';

        avgris.content.main.addClass('loadingContent');

        $.ajax({
            beforeSend: function () {
                avgris.content.main.append("<p data-value='0%'></p>");
            },
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();
                //Upload progress
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with upload progress
                        $('p[data-value]').attr('data-value', percentComplete + '%');
                    }
                }, false);
                //Download progress
                xhr.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded / evt.total * 100);
                        //Do something with download progress
                        $('p[data-value]').attr('data-value', percentComplete + '%');
                    }
                }, false);

                config.xhr = xhr;

                return xhr;
            },
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/getTableData/' + (page ? page : '1'),
            data: {submit: 1, requestTable: avgris.content.db.page}
        }).done(function (json) {
            var max_show = getCookie('manager_perPageRow') === null ? 20 : getCookie('manager_perPageRow');
            var pages = Math.ceil(json.total / max_show);

            avgris.content.db.databody.html(json.html);

            $('#min').text((json.offset - 1) * max_show + 1);
            $('#max').text((((json.offset - 1) * 1 + 1) * max_show > json.total) ? json.total : ((json.offset - 1) * 1 + 1) * max_show);
            $('#total').text(json.total);

            avgris.content.db.databody.perfectScrollbar('update');

            if (!page) {
                $('.pagination').jqPagination('option', 'current_page', 1);
                page = 1;
            }

            if ($('.pagination').jqPagination('option', 'max_page') !== pages) {
                $('.pagination').jqPagination('option', 'max_page', pages === 0 ? 1 : pages);
            }

            $.each(changed_colum, function (index, value) {
                index = value;

                var width = avgris.content.db.datahead.find('th .cell').eq(index).width();

                avgris.content.db.databody.find('tr').each(function () {
                    var iself = $(this);
                    var tdslen = iself.children('td').length;

                    if ((index + 1) <= tdslen) {
                        iself.find("td:eq(" + index + ")").css('min-width', width + 'px')
                        iself.find("td:eq(" + index + ") .row").css('max-width', width + 'px');
                    }
                });
            });

            if (pined) {
                var index = avgris.content.db.datahead.find('th').index(avgris.content.db.datahead.find('th.pined'));

                avgris.content.db.databody.find('tr').each(function () {
                    $(this).children('td').eq(index).addClass('pined');
                });

                var top = avgris.content.db.databody.scrollTop();

                avgris.content.db.databody.find('td.pined').css('margin-top', (-top) + 'px');
            }

            avgris.content.main.removeClass('loadingContent');

            noty({
                text: 'Page ' + page + ' Loads Success!',
                layout: 'topCenter',
                type: 'success',
                timeout: 1000
            });

            config.xhr = null;
        });
    }
    /**
     * Function
     * 取得單一欄位值
     * @param {type} column
     * @param {type} filter
     * @returns {undefined}
     */
    function getList(column, filter) {
        config.xhr !== null ? config.xhr.abort() : '';

        $("#" + column).html("<option value=''>Loading...</option>");

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/listColumn/' + avgris.content.db.page + '/' + column,
            data: filter,
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.error) {
                $("#" + column).html(json.error);
            } else {
                $("#" + column).html(json.data);
            }

            config.xhr = null;
        });
    }

    /**
     * Function
     * 顯示已設定過濾
     * @returns {undefined}
     */
    function showExitFilters() {
        var filters = JSON.parse(getCookie(avgris.content.db.page + 'filters_manager') || '{}');

        if (Object.keys(filters).length > 0) {
            $.each(filters, function (fkey, values) {
                $.each(values, function (vkey, value) {
                    var target = avgris.content.db.aside.find('[id=' + fkey + ']').parent().parent();

                    $("<div class='filters' name='filter' title='click to remove' data-type='" + fkey + "' data-value='" + value + "'>" + value + "<span>&#215;</span></span>").insertAfter(target);
                });
            });

            setFiltersAction();
        }
    }

    /**
     * Function
     * 顯示已設排序
     * @returns {undefined}
     */
    function showExitOrders() {
        var orders = JSON.parse(getCookie(avgris.content.db.page + 'orders_manager') || '{}');

        if (Object.keys(orders).length > 0) {
            $.each(orders, function (okey, values) {
                $.each(values, function (vkey, value) {
                    avgris.content.db.databody.find('th span[data-type=' + okey + ']').attr('data-order', value);
                });
            });
        }
    }

    /**
     * Function
     * 取得過濾內容
     * @returns {String}
     */
    function getFilters() {
        var filters = {};

        avgris.content.db.aside.find("div[name='filter']").each(function () {
            var self = $(this);

            if (typeof filters[self.data('type')] !== 'undefined') {
                filters[self.data('type')].push(self.data('value'));
            } else {
                filters[self.data('type')] = [self.data('value')];
            }
        });

        return JSON.stringify(filters);
    }
    /**
     * Function
     * 設定過濾選項動作
     * @returns {undefined}
     */
    function setFiltersAction() {
        avgris.content.db.aside.find("div[name='filter']").click(function () {
            $(this).remove();

            setCookie(avgris.content.db.page + 'filters_manager', getFilters(), 1);

            getPart();
        });
    }
    /**
     * Function
     * 取得排序內容
     * @returns {String}
     */
    function getOrders() {
        var orders = {};

        avgris.content.db.datahead.find('th span[data-order]').each(function () {
            var self = $(this);

            if (typeof orders[self.data('type')] !== 'undefined') {
                orders[self.data('type')].push(self.data('order'));
            } else {
                orders[self.data('type')] = [self.data('order')];
            }
        });

        return JSON.stringify(orders);
    }
    /**
     * Function
     * 取得Cookie內容
     * @param {type} name
     * @returns {unresolved}
     */
    function getCookie(cname) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + cname + "=");
        return parts.length == 2 ? parts.pop().split(";").shift() : null;
    }
    /**
     * Function
     * 設定Cookie內容
     * @param {type} cname
     * @param {type} cvalue
     * @param {type} exdays
     * @returns {undefined}
     */
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();

        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

        var expires = "expires=" + d.toUTCString();

        document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
    }
});