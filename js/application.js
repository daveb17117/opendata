/*
Hilfreiches Video zur Map https://www.youtube.com/watch?v=G-VggTK-Wlg
 */
var i = 0;
$(document).ready(function () {
    var width = 900;
    var height = 500;

    var svg = d3.select("#d3-chart").append("svg")
        .attr("height", height)
        .attr("width", width);

    /* ch.json wird in die Schlange eingereit. Sobald es geldaen ist,
    wird die methode reday ausgeführ (schönerr Code)
    */
    d3.queue()
        .defer(d3.json, "sources/ch.json")
        .await(ready);


    /* Laut https://github.com/interactivethings/swiss-maps
    ist die grösse der Map "Scaled and simplified to a size of 960 × 500 pixels"
    vielleicht könne wir das ch.json noch selber generieren, da ich nicht weiss wie
    alt dass es ist

    Hier habe ich als Projection einen geoTransform eingebaut, weil unsere Daten schon projeziert wurden
    (als referenz siehe github page)
    Der geoTransform skaliert einfach die Map
    */
    var scale = 0.5;
    var projection = d3.geoTransform({
        point: function (x,y) {
            this.stream.point(scale *x,scale * y);
        }
    });

    var path = d3.geoPath()
        .projection(projection);

    // Wird nach laden des ch.json ausgeführt
    function ready(error, data) {
        // Kantone werden aus dem File geladen
        var cantons = topojson.feature(data, data.objects.cantons).features;
        // Und zum svg hinzugefügt, WICHTIG: dass attr "d" muss dabei sein, damit die Pfade gezeichent werden
        // Mit der Klasse Kanton, kann der Style verändert werden
        svg.selectAll(".canton").data(cantons)
            .enter().append("path")
            .attr("class", "canton")
            .attr("d", path);
    }

});

function query(query, handleData) {
    var data = $.param({
        dataset: 'ist-daten-history',
        rows: 10000,
        lang: 'de',
        q: '',
        facet: ['betriebstag', 'betreiber_id', 'produkt_id', 'linien_id', 'linien_text', 'verkehrsmittel_text',
            'faellt_aus_tf', 'bpuic', 'ab_prognose_status', 'diff_abfahrt', 'diff_ankunft', 'plan_aufenthalt',
            'ist_aufenthalt', 'ano3', 'ano1', 'ano2', 'ano_total', 'ankunftsverspatung', 'abfahrtsverspatung', 'name']
    }, true);

    $.ajax({
        url: 'https://data.sbb.ch/api/records/1.0/search/?',
        jsonp: 'callback',
        dataType: 'jsonp',
        data: data,
        success: function (response) {
            handleData(response);
        }
    });
}

