$(document).ready(function () {

    $('#resetP').click(function () {
        var selector = $('#peopleselection option:selected');
        var id = selector.val();
        var name = selector.text();
        var password = $('#password').val();

        if (id !== '' && password !== '') {
            avgris.content.main.find('.ajaxload').css('display', 'inline-block');

            resetUserPassword(id, name, password);
        } else if (id === '') {
            noty({
                text: 'Please Select One Person!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000,
                maxVisible: 1
            });
        } else if (password === '') {
            noty({
                text: 'Please Enter New Password!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000,
                maxVisible: 1
            });
        }
    });

    function resetUserPassword(id, name, password) {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/resetUserPassword/' + id,
            data: {UserPassword: password},
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Reset Password Failed For ' + name + '!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 2000,
                    maxVisible: 1
                });
            } else {
                noty({
                    text: 'Reset Password Success For ' + name + '!',
                    layout: 'topCenter',
                    type: 'success',
                    timeout: 2000
                });
            }

            avgris.content.main.find('.ajaxload').css('display', 'none');
            
            config.xhr = null;
        }).fail(function (jqXHR) {
            console.log("resetUserPassword: " + jqXHR.statusText);
        });
    }
});