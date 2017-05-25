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
$('#title').css('opacity','1');
$('#closetitle').on('click',function () {
    $('#title').css('opacity','0');
    setTimeout(function () {
      $('#title').hide().css('z-index','-1');
    },1000);
});
