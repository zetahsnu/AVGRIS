$(document).ready(function () {

    $('#changeP').click(function () {

        var oldpas = $('#oldpassword').val();
        var newpas = $('#newpassword').val();
        var cnewpas = $('#cnewpassword').val();

        if (newpas !== cnewpas) {
            noty({
                text: 'New Password Confirms Error!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000,
                maxVisible: 1
            });
        } else if (oldpas === '' || newpas === '' || cnewpas === '') {
            noty({
                text: 'Please Enter The Password!',
                layout: 'topCenter',
                type: 'warning',
                timeout: 2000,
                maxVisible: 1
            });
        } else {
            $('.ajaxload').css('display', 'inline-block');
            changeUserPassword(oldpas, newpas);
        }
    });

    function changeUserPassword(oldpas, newpas) {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/changeUserPassword/',
            data: {UserPassword: true, oldpas: oldpas, newpas: newpas},
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Change Password Failed!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 2000,
                    maxVisible: 1
                });
            } else {
                noty({
                    text: 'Change Password Success!<br>It Will need to relogin.',
                    layout: 'topCenter',
                    type: 'success',
                    timeout: 2000
                });
                setTimeout(function () {
                    window.location = config.base_url + '/manager';
                }, 2000);
            }

            $('.ajaxload').css('display', 'none');

            config.xhr = null;
        }).fail(function (jqXHR) {
            console.log("changeUserPassword: " + jqXHR.statusText);
        });
    }
});






