(function ($) {
    /**
     * 清除陣列數值
     * @param {type} deleteValue
     * @returns {Array.prototype}
     */
    Array.prototype.clean = function (deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    var url = location.href.replace(config.base_url, '').split('/').clean("");//分割網址   
    var view = url[0];
    var category = url[1];//分類    
    var subcategory = category === 'characterization' ? url[2] : '';//子分類 
    var firstLetter = subcategory === '' ? category : subcategory;

    var pager = $('#stick');
    var pos = pager.position();

    showExitFilters();
    showExitOrders();

    $("[name='GENUS']").change(function () {
        $("[name='SPECIES']").children().remove();
        $("[name='SPECIES']").parent().next().children('a').css('display', 'none');

        $("[name='SUBTAXA']").children().remove();
        $("[name='SUBTAXA']").parent().next().children('a').css('display', 'none');

        if ($(this).val() !== '') {
            getList('SPECIES', {
                filters: 'genus=' + $(this).val() + ','
            });
        }

        $(this).parent().next().children('a').css('display', 'block');
    });

    $("[name='SPECIES']").change(function () {
        $("[name='SUBTAXA']").children().remove();
        $("[name='SUBTAXA']").parent().next().children('a').css('display', 'none');

        if ($(this).val() !== '') {
            if (subcategory !== '') {
                getList('SUBTAXA', {
                    filters: 'species=' + $(this).val() + ','
                });
            } else {
                $("[name='GENUS']").parent().next().children('a').css('display', 'none');

                getList('SUBTAXA', {
                    filters: 'genus=' + $("[name='GENUS']").val() + ',species=' + $(this).val() + ','
                });
            }
        }

        $(this).parent().next().children('a').css('display', 'block');
    });

    $("[name='SUBTAXA']").change(function () {
        if ($(this).val() !== '') {
            $("[name='SPECIES']").parent().next().children('a').css('display', 'none');
            $(this).parent().next().children('a').css('display', 'block');
        }
    });

    /**
     * 定住換頁條
     */
    $(window).scroll(function () {
        $('#dataView').floatThead('reflow');
        var windowpos = $(this).scrollTop();
        if (windowpos >= pos.top) {
            pager.addClass("stick");
        } else {
            pager.removeClass("stick");
        }
    });

    /**
     * thead插件
     */
    $('#dataView').floatThead({
        top: 32,
        position: 'fixed'
    });

    /**
     * 分頁條插件
     */
    $('.pagination').jqPagination({
        link_string: config.base_url + '/' + view + '/' + category + '/' + (subcategory === '' ? '' : subcategory + '/') + '{page_number}',
        max_page: $('.pagination input[data-max-page]').data('max-page'),
        current_page: category === 'characterization' ? url[3] ? url[3] > $('.pagination input[data-max-page]').data('max-page') ? $('.pagination input[data-max-page]').data('max-page') : url[3] : 1 : url[2] ? url[2] > $('.pagination input[data-max-page]').data('max-page') ? $('.pagination input[data-max-page]').data('max-page') : url[2] : 1,
        paged: function (page) {
            if (!config.async) {
                getPart(page);
            }
        }
    });

    $('.other_filters h3').click(function () {
        var self = $(this);

        if (self.next().css('display') == 'table') {
            self.next().css('display', 'none').siblings('table').css('display', 'none');
        } else {
            self.next().css('display', 'table').siblings('table').css('display', 'none');
        }

        $('#dataView').floatThead('reflow');
    });

    /**
     * 顯示過濾選項
     */
    $('#add_filters').click(function (e) {
        e.preventDefalut;

        $('#dataView').floatThead('reflow');

        if ($('#options').css('display') === 'none') {
            $('#options').css('display', 'block');
        } else {
            $('#options').css('display', 'none');
        }

        pos = pager.position();
    });

    /**
     * 重置按鈕
     */
    $('#reset_filters').click(function (e) {
        e.preventDefalut;

        setCookie(firstLetter + 'filters', '', -1);
        setCookie(firstLetter + 'orders', '', -1);

        $("span[name='filter']").remove();
        $('#dataorder th[data-order]').removeAttr('data-order');

        getPart();

        noty({
            text: 'Reset success!',
            layout: 'topCenter',
            type: 'success',
            timeout: 2000
        });
    });

    /**
     * 點下新增時
     */
    $("a[name='add_filters']").click(function () {
        var self = $(this);
        var name = self.parent().prev().prev().text();
        var input = self.parent().prev().children();
        var value = input.length > 1 ? input.val() + input.next().val() : input.val().trim();
        var type = input.attr('name');

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

        if ($("[name='GENUS']") !== 'undefinded') {
            var gen = $("[name='GENUS']");
            var gen_val = gen.val();
            var gen_name = gen.parent().prev().text();
        }

        if (type === 'SPECIES') {
            if (gen.length > 0) {
                $("<span class='list' name='filter' title='click to remove' data-type='GENUS' data-value=\"" + gen_val + "\">" + gen_name + ':' + gen_val + "<span class='tag_remove'>&#215;</span></span>").insertBefore('#add_filters');
            }
        } else if (type === 'SUBTAXA') {
            if (gen.length > 0) {
                $("<span class='list' name='filter' title='click to remove' data-type='GENUS' data-value=\"" + gen_val + "\">" + gen_name + ':' + gen_val + "<span class='tag_remove'>&#215;</span></span>").insertBefore('#add_filters');
            }

            var spe = $("[name='SPECIES']");
            var spe_val = spe.val();
            var spe_name = spe.parent().prev().text();

            $("<span class='list' name='filter' title='click to remove' data-type='SPECIES' data-value=\"" + spe_val + "\">" + spe_name + ':' + spe_val + "<span class='tag_remove'>&#215;</span></span>").insertBefore('#add_filters');
        }

        if (type === 'GENUS' || type === 'SPECIES' || type === 'SUBTAXA') {
            if (subcategory !== '') {
                $("[name='SPECIES']").parent().next().children('a').css('display', 'block').parent().prev().children().val('');
            } else {
                $("[name='GENUS']").parent().next().children('a').css('display', 'block').parent().prev().children().val('');
                $("[name='SPECIES']").parent().next().children('a').css('display', 'none').parent().prev().children().children().remove();
            }
            $("[name='SUBTAXA']").parent().next().children('a').css('display', 'none').parent().prev().children().children().remove();
        } else {
            input.length > 1 ? input.next().val('') : input.val('');
        }

        $("<span class='list' name='filter' title='click to remove' data-type='" + type + "' data-value=\"" + value + "\">" + name + ':' + value + "<span class='tag_remove'>&#215;</span></span>").insertBefore('#add_filters');

        setCookie(firstLetter + 'filters', getFilters(), 1);

        getPart();

        setFiltersAction();
    });

    /**
     * 每頁顯示幾行
     */
    $('#perLow').change(function () {
        var value = $(this).val();

        setCookie('perPageRow', value, 1);

        getPart();
    });

    /**
     * 新增排序
     */
    $('#dataorder th[data-type]').click(function () {
        var order = $(this).attr('data-order') || $(this).data('order');
        $('#dataorder th[data-order]').data('order', '').removeAttr('data-order');
        if (typeof order === 'undefined') {
            $(this).data('order', 'ASC').attr('data-order', 'ASC');
        } else if (order === 'ASC') {
            $(this).data('order', 'DESC').attr('data-order', 'DESC');
        } else {
            $(this).data('order', 'ASC').attr('data-order', 'ASC');
        }

        setCookie(firstLetter + 'orders', getOrders(), 1);

        getPart();
    });

    /**
     * 設定過濾選項動作
     * @returns {undefined}
     */
    function setFiltersAction() {
        $("span[name='filter']").click(function () {
            $(this).remove();

            setCookie(firstLetter + 'filters', getFilters(), 1);

            getPart();
        });
    }

    /**
     * 取得部分內容
     * @returns {undefined}
     */
    function getPart(page) {
        $('#target').loadingOverlay();

        if (!config.async) {
            config.async = true;
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: config.base_url + '/' + view + '/' + category + '/' + (subcategory === '' ? '' : subcategory + '/') + (page ? page : '1'),
                data: {part: '1'}
            }).done(function (json) {
                var max_show = getCookie('perPageRow') === null ? 20 : getCookie('perPageRow');
                var pages = Math.ceil(json.total / max_show);

                $('#databody').empty().html(json.data);
                $('#min').text((json.offset - 1) * max_show + 1);
                $('#max').text((((json.offset - 1) * 1 + 1) * max_show > json.total) ? json.total : ((json.offset - 1) * 1 + 1) * max_show);
                $('#total').text(json.total);

                if (!page) {
                    $('.pagination').jqPagination('option', 'current_page', 1);
                    setCookie(firstLetter + 'page', JSON.stringify({page: page}), 1);
                } else {
                    setCookie(firstLetter + 'page', JSON.stringify({page: page}), page);
                }

                $('.pagination').jqPagination('option', 'max_page', pages === 0 ? 1 : pages);

                $('#dataView').floatThead('reflow');

                config.async = false;
                $('#target').loadingOverlay('remove');
            });
        }
    }

    /**
     * 取得單一欄位值
     * @param {type} column
     * @param {type} filter
     * @returns {undefined}
     */
    function getList(column, filter) {
        $('#target').loadingOverlay();

        if (!config.async) {
            config.async = true;
            $("[name='" + column + "']").html("<option value=''>Loading...</option>");
            $.ajax({
                type: 'POST',
                url: config.base_url + '/' + view + '/listColumn/' + (subcategory === '' ? category : subcategory) + '/' + column,
                data: filter
            }).done(function (data) {
                var json = JSON.parse(data);
                $("[name='" + column + "']").html(json.data);

                $('#target').loadingOverlay('remove');
                config.async = false;
            });
        }
    }

    /**
     * 取得過濾內容
     * @returns {String}
     */
    function getFilters() {
        var filters = {};

        $("span[name='filter']").each(function () {
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
     * 取得排序內容
     * @returns {String}
     */
    function getOrders() {
        var orders = {};
        $('#dataorder th[data-order]').each(function () {
            if (typeof orders[$(this).data('type')] !== 'undefined') {
                orders[$(this).data('type')].push($(this).data('order'));
            } else {
                orders[$(this).data('type')] = [$(this).data('order')];
            }
        });
        
        return JSON.stringify(orders);
    }

    /**
     * 顯示已設定過濾
     * @returns {undefined}
     */
    function showExitFilters() {
        var filters = JSON.parse(getCookie(firstLetter + 'filters') || '{}');

        if (Object.keys(filters).length > 0) {
            $.each(filters, function (fkey, values) {
                $.each(values, function (vkey, value) {
                    var name = $('[name=' + fkey + ']').parent().prev().text();
                    $("<span class='list' name='filter' title='click to remove' data-type='" + fkey + "' data-value='" + value + "'>" + name + ':' + value + "<span class='tag_remove'>&#215;</span></span>").insertBefore('#add_filters');
                });
            });
            setFiltersAction();
        }
    }

    /**
     * 顯示已設排序
     * @returns {undefined}
     */
    function showExitOrders() {
        var orders = JSON.parse(getCookie(firstLetter + 'orders') || '{}');

        if (Object.keys(orders).length > 0) {
            $.each(orders, function (okey, values) {
                $.each(values, function (vkey, value) {
                    $('#dataorder th[data-type=' + okey + ']').attr('data-order', value);
                });
            });
        }
    }

    /**
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

    $('.floatThead-floatContainer').css('overflow', 'visible');
})(jQuery);