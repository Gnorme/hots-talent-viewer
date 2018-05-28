var player = document.getElementById("player");
var block = document.getElementById("Talent");
player.removeEventListener("mouseover", ViewerMouseOver, false);
player.removeEventListener("mousemove", ViewerMouseMove, false);
player.removeEventListener("mouseout", ViewerMouseOut, false);
block.remove();