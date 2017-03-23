/*
Draw the d3 chart
*/
var i = 0;
$(document).ready(function(){
    var width = $('#d3-chart').width();
    var height = 500;
    var svg = d3.select('#d3-chart').append('svg')
        .attr('width', width)
        .attr('height', height).on("ontouchstart" in document ? "touchmove" : "mousemove", particle);

    var data = $.param({
        dataset: 'ist-daten-history',
        rows: 10000,
        lang: 'de',
        q: '',
        facet: ['betriebstag','betreiber_id','produkt_id','linien_id','linien_text','verkehrsmittel_text',
            'faellt_aus_tf','bpuic','ab_prognose_status','diff_abfahrt','diff_ankunft','plan_aufenthalt',
            'ist_aufenthalt','ano3','ano1','ano2','ano_total','ankunftsverspatung','abfahrtsverspatung','name']
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
});

function handleData(data) {

}

function particle() {
  var m = d3.mouse(this);
  d3.select(this).insert("circle")
      .attr("cx", m[0])
      .attr("cy", m[1])
      .attr("r", 1e-6)
      .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
      .style("stroke-opacity", 1)
    .transition()
      .duration(2000)
      .ease(Math.sqrt)
      .attr("r", 100)
      .style("stroke-opacity", 1e-6)
      .remove();

  d3.event.preventDefault();
}