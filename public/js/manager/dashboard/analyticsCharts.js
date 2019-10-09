// Load the Visualization API and the piechart package.
google.load('visualization', '1', {'packages': ['corechart', 'table']});

// Set a callback to run when the Google Visualization API is loaded.
google.setOnLoadCallback(drawChart);


// Callback that creates and populates a data table, 
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {
    config.xhr !== null ? config.xhr.abort() : '';

    $.ajax({
        url: config.base_url + '/manager/getDashboard',
        dataType: "json",
        async: true,
        data: {ajax: true},
        xhr: function ()
        {
            var xhr = new window.XMLHttpRequest();

            config.xhr = xhr;

            return xhr;
        }
    }).done(function (json) {
        $('.sessions').text(json.total_sessions);
        $('.users').text(json.total_users);

        triggerEvent();

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Month');
        data.addColumn('number', 'Visitors per month');
        data.addColumn('number', 'Sessions per month');

        $.each(json.group_month, function (index, value) {
            var date_string = value[0].toString();
            json.group_month[index][0] = new Date(date_string.substring(0, 4), parseInt(date_string.substring(4, 6)) - 1);
        });

        data.addRows(json.group_month);

        var formatter = new google.visualization.DateFormat({pattern: 'yyyy/MM'});
        formatter.format(data, 0);

        // Set chart options
        var options = {
            title: 'Session & Visitors with per month',
            width: 640,
            height: '100%',
            legend: 'none',
            hAxis: {
                title: 'month',
                titleTextStyle: {
                    color: '#333'
                }
            },
            vAxis: {
                title: 'total',
                titleTextStyle: {
                    color: '#333'
                }
            }};

        // Instantiate and draw our chart, passing in some options.
        var chart_month = new google.visualization.AreaChart(document.getElementById('chart_month'));
        chart_month.draw(data, options);

        var chart_month_detail = new google.visualization.Table(document.getElementById('chart_month_detail'));
        chart_month_detail.draw(data, options);

        // Create the data table.
        data = new google.visualization.DataTable();
        data.addColumn('date', 'Day');
        data.addColumn('number', 'Visitors per day');
        data.addColumn('number', 'Sessions per day');

        $.each(json.group_day, function (index, value) {
            var date_string = value[0].toString();
            var now = new Date();
            var day = now.getDate();
            json.group_day[index][0] = new Date(now.getFullYear(), day >= date_string ? now.getMonth() : now.getMonth() - 1, date_string);
        });

        data.addRows(json.group_day);

        formatter = new google.visualization.DateFormat({pattern: 'MM/d'});
        formatter.format(data, 0);

        data.sort({column: 0, asc: true});

        // Set chart options
        options = {
            title: 'Session & Visitors with per day',
            width: 640,
            height: '100%',
            legend: 'none',
            hAxis: {
                title: 'day',
                titleTextStyle: {
                    color: '#333'
                }
            },
            vAxis: {
                title: 'total',
                titleTextStyle: {
                    color: '#333'
                }
            }};

        // Instantiate and draw our chart, passing in some options.
        var chart_day = new google.visualization.AreaChart(document.getElementById('chart_day'));
        chart_day.draw(data, options);

        var chart_day_detail = new google.visualization.Table(document.getElementById('chart_day_detail'));
        chart_day_detail.draw(data, options);

        avgris.content.main.perfectScrollbar();
    }).fail(function (jqXHR) {
        console.log("getDashboard: " + jqXHR.statusText);
        noty({
            text: 'Load Dashboard Failed, try again?',
            layout: 'center',
            type: 'confirm',
            buttons: [
                {addClass: 'button', text: 'Retry', onClick: function ($noty) {
                        drawChart();
                        $noty.close();
                    }
                },
                {addClass: 'button', text: 'Cancel', onClick: function ($noty) {
                        $noty.close();
                    }
                }
            ]
        });
    });
}

function triggerEvent() {
    $('.sessions,.users').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 6000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}