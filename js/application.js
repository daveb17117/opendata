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

    
});

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