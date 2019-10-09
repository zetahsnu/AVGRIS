$(document).ready(function () {

    avgris.content.main.perfectScrollbar();

    $('#reset').click(function (e) {
        e.preventDefalut;

        var id = avgris.content.main.find('.open').data('id');

        avgris.content.main.find("input[id*='" + id + "']:checked").prop('checked', false);
        $('#counter_' + id).text('0');
    });

    $('#update').click(function (e) {
        e.preventDefalut;

        var id = avgris.content.main.find('.open').data('id');

        var selected = $("input[id*='" + id + "']:checked");
        var len = selected.length;
        var tables = '';
        var name = $('.open').data('name');

        $.each(selected, function (i) {
            len === (i + 1) ? tables += $(this).val() : tables += $(this).val() + ',';
        });

        avgris.content.main.find('.open .ajaxload').css('display', 'inline-block');

        updateUserTables(id, tables, name);
    });

    avgris.content.main.find('input[type=checkbox]').change(function () {
        var id = $(this).attr('id').split('_')[1];
        var selected = avgris.content.main.find("input[id*='" + id + "']:checked");
        var len = selected.length;

        $('#counter_' + id).text(len);
    });

    function updateUserTables(id, tables, name) {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/updateUserTables/' + id,
            data: {UserTables: tables},
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Update Tables Failed For ' + name + '!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 2000,
                    maxVisible: 1
                });
            } else {
                noty({
                    text: 'Update Tables Success For ' + name + '!',
                    layout: 'topCenter',
                    type: 'success',
                    timeout: 2000
                });
            }

            $('.open .ajaxload').css('display', 'none');
            
            config.xhr = null;
        }).fail(function (jqXHR) {
            console.log("updateUserTables: " + jqXHR.statusText);
        });
    }

    $('#sidemenu a').on('click', function (e) {
        e.preventDefault();

        var self = $(this);

        if (self.hasClass('open')) {
            // do nothing because the link is already open
        } else {
            var oldcontent = $('#sidemenu a.open').attr('href');
            var newcontent = self.attr('href');

            $(oldcontent).fadeOut('fast', function () {
                $(newcontent).fadeIn().removeClass('hidden');
                $(oldcontent).addClass('hidden');
            });


            $('#sidemenu a').removeClass('open');
            self.addClass('open');
        }
    });
});
