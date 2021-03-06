/* Queries the sbb api and calls the handleData on the resulting JSON-file
 * @param query – The query to be made on the data set.
 * @param handleData – (name of) the function to be called
 * */
function query(dataset, rows, query, facet, refine, handleData) {
    // Create Object for querystring creation
    var dataobject = {
        dataset: dataset,
        rows: rows,
        lang: 'de',
        q: query,
        facet: facet,
        apikey: '7598831a268919cfd9ec4cc8cdfd5293cf312113773e60d5d459f2e1'
    };

    // Add refines (needs to be a javascript object)
    // example: {tunummer: 1}
    for (var propertyName in refine) {
        if (refine.hasOwnProperty(propertyName)) {
            dataobject['refine.' + propertyName] = refine[propertyName];

        }
    }

    // Builds Querystring
    var data = $.param(dataobject, true);

    // Makes request for data
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

/**
 * Creates a trainstation.json file (not working in PHPStorm)
 */
function fetch() {
    // Fetch Data if not already fetched. This should happen one time daily
// Trainstations
    query('didok-liste', 2000, '', [], {tunummer: 1}, function (data) {
        geojson = data.records;
        // Inject Type for L.geojson to work
        geojson.forEach(
            function (element) {
                element.type = 'Feature';
            });
        $.post("json.php", {json: JSON.stringify(geojson)}).done(function (data) {
            console.log(data);
        });
        /*        $.ajax({
         type: "POST",
         url: "json.php",
         data: {
         json: JSON.stringify(geojson)
         },
         success: function (response) {
         alert(response);
         }
         });*/
    });

// Ist-Daten (Vortag)


// Ist-Daten history
}