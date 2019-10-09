$(document).ready(function () {
    var i = 0;
    var speed = 15000;
    var sliderdata = ['one', 'two', 'three', 'four'];
    var introduction = ["<h1>Genetic Resources and Seed Unit</h1><p>Initially, AVRDC’s genebank collection only addressed specific needs of crop breeders. Gradually it grew into a multiple-use collection for research and development at the global level. The large number of vegetable species (438) now included in AVRDC’s genebank collection enables us not only to conserve, explore and utilize vegetable biodiversity, but also to contribute to the diversification of vegetable production systems and consumption patterns in the developing world.</p>",
        "<h1>Keeping the collection safe</h1><p>A new seed storage facility was completed in 2010 to provide a safe storage environment for AVRDC’s extensive germplasm collection. The floor of the facility has been substantially raised above ground to protect the collection from flooding and other natural disasters. The Center concluded a black-box arrangement for safety backup of its most valuable germplasm with the Nordic Genetic Resource Center in Norway and the genebank of the National Agrobiodiversity Center of the Rural Development Administration (RDA) in South Korea.</p>",
        "<h1>Germplasm regeneration</h1><p>Seeds in storage will lose viability or their quantity will become depleted over time. It is therefore imperative that seeds in storage are replenished to ensure the continued conservation of germplasm materials and their distribution to users worldwide. AVRDC’s regeneration program aims to maximize seed production, minimize regeneration cycles, maintain the genetic integrity of the population and maximize seed quality.</p>",
        "<h1>Germplasm characterization</h1><p>Germplasm characterization is the recording of characters or traits that are highly heritable or can be easily seen and are expressed in all environments. Characterization is a common responsibility of genebank curators;  AVGRIS makes the easy and quick discrimination between accessions or phenotypes possible.</p>"];

    var slider;

    function sliders() {
        slider = setTimeout(function () {
            changeSlider();
            sliders();
            i++;
        }, speed);
    }

    function changeSlider() {
        i = sliderdata.length > i ? i < 0 ? 3 : i : 0;

        $("#header_image").css("background-image", "url('" + config.base_url + "/public/images/header/slider/" + sliderdata[i] + ".jpg')");
        $('#introduction').html(introduction[i]);
    }

    function getSessions() {
        $.ajax({
            url: config.base_url + '/index/getSessions',
            dataType: "json",
            async: true,
            data: {ajax: true}
        }).done(function(data){
            $('#counter_value').html(data.counter_value);
        });
    }

    $('.arrow_left').click(function () {
        clearTimeout(slider);
        i--;
        changeSlider();
        sliders();
    });

    $('.arrow_right').click(function () {
        clearTimeout(slider);
        i++;
        changeSlider();
        sliders();
    });

    changeSlider();
    sliders();
    getSessions();
});