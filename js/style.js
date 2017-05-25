/* Makes the map responsive */
var mapmargin = 50;
$('#map').css("height", ($(window).height()));
$(window).on("resize", resize);
resize();
function resize() {
    var map = $('#map');
    map.css("height", ($(window).height()));
}


/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

/* Title Transition */
$('#closetitle').on('click',function () {
    $('#titlediv').css('font-size', '0.1em');
    setTimeout(function () {
        $('#title').hide();
    }, 300);
});
