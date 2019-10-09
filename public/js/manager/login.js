$(document).ready(function () {

    $(".username").focus(function () {
        $(".user-icon").css("left", "-48px");
    });
    $(".username").blur(function () {
        $(".user-icon").css("left", "0px");
    });

    $(".password").focus(function () {
        $(".pass-icon").css("left", "-48px");
    });
    $(".password").blur(function () {
        $(".pass-icon").css("left", "0px");
    });

    $('.cancel').click(function () {
        location.href = config.base_url;
    });

    $("input[name='submit']").click(function () {
        var username = $(".username").val(),
                password = $(".password").val();

        if (username === '' || password === '') {
            return false;
        }

        var submits = {
            login: {
                username: username,
                password: password
            }
        }

        $('#ajaxload').css('display', 'inline-block');

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/login',
            data: submits
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: 'Verification Failed!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error'
                });
            } else if (json.status) {
                noty({
                    text: 'Verification Success!<br>Will turn in 3 seconds.',
                    layout: 'topCenter',
                    type: 'success'
                });
                setTimeout(function () {
                    window.location = config.base_url + '/manager';
                }, 3000);
            } else {
                $('#wrapper').animate({"left": "+=50px"}, 150)
                        .animate({"left": "-=100px"}, 100)
                        .animate({"left": "+=100px"}, 100)
                        .animate({"left": "-=50px"}, 150);
                noty({
                    text: 'Verification Failed!',
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 4000,
                    maxVisible: 1
                });
            }

            $('#ajaxload').css('display', 'none');
        });
    });
});