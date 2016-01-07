// Images are all 42px x 42px
// and they are "inside" small imaginary
// boxes which are 50px x 50px

var game = document.getElementById('game')
var gameBounds = game.getBoundingClientRect()

var images = []
var maxRows = Math.ceil(game.height/50.0) + 1
var rows = []


for(var i = 0; i < 5; i += 1){
    images.push(new Image())
    images[-1].src = 'tile' + i + 'png'
    images[-1].className = "tile"
}

/*
var new_row = function(){
    var game_bounds = game.getBoundingClientRect()
    var nums = new Uint8Array(5)
    window.crypto.getRandomValues(nums)
    return nums.map(function(val, i, nums){
	var new_image = images[i % 5].cloneNode(true)
	// the 3 is to make up for the (50px - 42px)/2
	new_image.style.top = game_bounds.bottom + 3
	new_image.style.left = game_bounds.left + i*50 + 3
	new_image.style.transition = "transform 1s linear"
	new_image.style.transform = "translateY(-100%)"
	return setInterval(function(){}
    })
    
*/
