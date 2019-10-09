var avgris = {
    content: {
        main: $('#mainContent')
    },
    menu: {
        main: $('.menu_wrap'),
        top: $('#topMenu'),
        bottom: $('#bottomMenu'),
        button: $('#open_menu')
    }
};

$(document).ready(function () {
    /**
     * perfectScrollbar插件
     */
    avgris.content.main.perfectScrollbar();
    avgris.menu.bottom.perfectScrollbar();
    /**
     * 切換選單顯示
     */
    $('.hamburger_menu').click(function () {
        if (avgris.content.main.hasClass('showmenu')) {
            avgris.content.main.removeClass('showmenu');
            avgris.menu.button.removeClass('showmenu');

            avgris.menu.main.css('opacity', '0');
        } else {
            avgris.content.main.addClass('showmenu');
            avgris.menu.button.addClass('showmenu');

            avgris.menu.main.css('opacity', '1');
        }
    });
    /**
     * 點擊內容panel隱藏選單
     */
    avgris.content.main.click(function (e) {
        var self = $(this);

        if (self.hasClass('showmenu')) {
            self.removeClass('showmenu');
            avgris.menu.button.removeClass('showmenu');

            avgris.menu.main.css('opacity', '0');
        }
    });
    /**
     * 點擊子目錄隱藏選單
     */
    $('ul.level_two li > a').click(function () {
        var self = $(this);

        avgris.content.main.removeClass('showmenu');
        avgris.menu.button.removeClass('showmenu');

        avgris.menu.main.css('opacity', '0');

        avgris.menu.bottom.find('.active').removeClass('active');

        self.addClass('active');

        avgris.content.main.addClass('loadingContent');
        getRequestPage(self.data('request'), self.attr('title'));
    });
    /**
     * 如果有子目錄則顯示子目錄，沒有則顯示內容
     * 如果有其它開起子目錄，則關閉。
     */
    $('ul.level_one > li > a').click(function () {
        avgris.menu.bottom.perfectScrollbar('update');

        var self = $(this);
        var i = $('ul.level_one > li > a').index(self);

        if (self.has('span').length > 0) {
            var two = self.parent().children('.level_two');
            var height = two.css('max-height');

            two.css('max-height', height !== '0px' ? '0px' : '4096px');
            height !== '0px' ? self.children('.collspan').html('&#43;') : self.children('.collspan').html('&#8722;');

            $('ul.level_one > li').each(function (index) {
                if (i !== index) {
                    $(this).children('.level_two').css('max-height', '0px');
                    $(this).children('a').children('.collspan').html('&#43;');
                }
            });

            avgris.menu.bottom.animate({scrollTop: 0}, '1000', 'swing');
        } else {
            avgris.content.main.removeClass('showmenu');
            avgris.menu.button.removeClass('showmenu');

            avgris.menu.bottom.find('.active').removeClass('active');

            self.addClass('active');

            avgris.content.main.addClass('loadingContent');
            getRequestPage(self.data('request'), self.attr('title'));
        }
    });

    $('#logout').click(function () {
        logout();
    });

    function logout() {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            type: 'POST',
            dataType: "json",
            url: config.base_url + '/manager/logout',
            data: {logout: true},
            async: false,
            xhr: function ()
            {
                var xhr = new window.XMLHttpRequest();

                config.xhr = xhr;

                return xhr;
            }
        }).done(function (json) {
            if (json.status) {
                noty({
                    text: 'Logout Success!<br>Will turn in 3 seconds',
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
                    text: 'Logout Failed!',
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 4000,
                    maxVisible: 1
                });
            }

            config.xhr = null;
        });
    }

    function getRequestPage(page, fullname) {
        config.xhr !== null ? config.xhr.abort() : '';

        $.ajax({
            beforeSend: function () {
                avgris.content.main.append("<p data-value='0%'></p>");
                if (page === 'assign' || page === 'changeP' || page === 'resetP') {
                    loadcssfile(config.base_url + '/public/css/manager/' + page + '.css');
                } else if (page !== 'index') {
                    loadcssfile(config.base_url + '/public/css/manager/db.css');
                }
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
            url: config.base_url + '/manager/getPage/' + page,
            data: {RequestPage: true}
        }).done(function (json) {
            if (json.error) {
                noty({
                    text: fullname + ' Loads Content Fail!<br>' + json.error,
                    layout: 'topCenter',
                    type: 'error',
                    timeout: 4000
                });
            } else {
                avgris.content.main.html(json.html);

                noty({
                    text: fullname + ' Loads Content Success!',
                    layout: 'topCenter',
                    type: 'success',
                    timeout: 2000
                });
            }

            avgris.content.main.removeClass('loadingContent');

            config.xhr = null;
        }).fail(function (jqXHR) {
            console.log("getRequestPage - " + page + ": " + jqXHR.statusText);
        });
    }
});

function loadcssfile(filename) {
    if ($("link[href='" + filename + "']").length === 0) {
        var fileref = document.createElement("link");

        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);

        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }
}