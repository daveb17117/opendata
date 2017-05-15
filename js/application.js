var geojson,
    metadata,
    tileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution = 'Map data: <a href="http://openstreetmap.org">OSM</a>',
    rmax = 30, //Maximum radius for cluster pies
    map = L.map('map').setView([46.6, 8.1], 8);

//Add basemap
L.tileLayer(tileServer, {attribution: tileAttribution, maxZoom: 15}).addTo(map);

// Gets all Trainstations
query('didok-liste', 500, '', [], '', function (data) {
    geojson = data.records;
    // Inject Type for L.geojson to work
    geojson.forEach(function (element){element.type = 'Feature'});
    var markers = L.geoJson(geojson).addTo(map);
    map.fitBounds(markers.getBounds());
});



/* Queries the ist-daten-history and calls the handleDate on the resulting JSON-file
 * @param query – The query to be made on the data set.
 * @param handleData – (name of) the function to be called
 * */
function query(dataset, rows, query, facet, refine, handleData) {
    var data = $.param({
        dataset: dataset,
        rows: rows,
        lang: 'de',
        q: query,
        facet: facet,
        refine: refine,
        apikey: '7598831a268919cfd9ec4cc8cdfd5293cf312113773e60d5d459f2e1'
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