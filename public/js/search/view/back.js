$(document).ready(function () {
    $('#return_back').click(function () {
        var cur_url = window.location.href;
        var pre_url = document.referrer;

        var a = cur_url.split('/');

        var re = new RegExp(a[a.length - 2] + "page=([^;]+)");
        var value = re.exec(document.cookie);
        var page = JSON.parse((value != null) ? value[1] : null || '{}');

        if (a[5] == 'characterization') {
            window.location.href = config.base_url + "/search/characterization/" + a[6] + '/' + (Object.keys(page).length > 0 ? page.page : '');
        } else {
            window.location.href = config.base_url + "/search/" + a[5] + '/' + (Object.keys(page).length > 0 ? page.page : '');
        }
    });
});