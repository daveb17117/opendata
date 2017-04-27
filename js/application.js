/*
Hilfreiches Video zur Map https://www.youtube.com/watch?v=G-VggTK-Wlg
 */
var i = 0;
$(document).ready(function () {
    // Responsiveness
    // http://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js

    d3.select("#d3-chart")
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform);
        }))
        .attr("viewBox", "0 0 960 500")
        .attr("id", "app")
        .classed("svg-content-responsive");

    var svg = d3.select("#app");

    /* ch.json wird in die Schlange eingereit. Sobald es geldaen ist,
    wird die methode reday ausgeführ (schönerr Code)
    */
    d3.queue()
        .defer(d3.json, "sources/ch.json")
        .await(ready);


    /* Laut https://github.com/interactivethings/swiss-maps
    ist die grösse der Map "Scaled and simplified to a size of 960 × 500 pixels"
    vielleicht können wir das ch.json noch selber generieren, da ich nicht weiss wie
    alt das es ist

    GeoTransform wird nicht mehr gebraucht, da nun das resizing über css läuft
    */
    var path = d3.geoPath()
        .projection(null);

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

/* Queries the ist-daten-history and calls the handleDate on the resulting JSON-file
 * @param query – The query to be made on the data set.
 * @param handleData – (name of) the function to be called
 * */
function query(query, handleData) {
    var data = $.param({
        dataset: 'ist-daten-history',
        rows: 10000,
        lang: 'de',
        q: query,
        facet: ['betriebstag', 'betreiber_id', 'produkt_id', 'linien_id', 'linien_text', 'verkehrsmittel_text',
            'faellt_aus_tf', 'bpuic', 'ab_prognose_status', 'diff_abfahrt', 'diff_ankunft', 'plan_aufenthalt',
            'ist_aufenthalt', 'ano3', 'ano1', 'ano2', 'ano_total', 'ankunftsverspatung', 'abfahrtsverspatung', 'name']
    }, true);

    $.ajax({
        url: 'https://data.sbb.ch/api/records/1.0/search/?',
        jsonp: 'callback',
        dataType: 'jsonp',
        data: data,
        // response is the resulting JSON file
        success: function (response) {
            handleData(response);
        }
    });
}

