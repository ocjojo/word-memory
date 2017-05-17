var MAX_WORDS = 20;
var words = [];

$(document).ready(function(){
    //hide the input field and add change handler
    $("#file").hide().change(function(e){
        var file = e.target.files;
        if(file.length > 0) {
            var reader = new FileReader();
            //when the file was read create a new game
            reader.onload = function(e) {
                words = e.target.result.split("\n");
                new Game();
            };
            //read the text file
            reader.readAsText(file[0]);
        }
    });
    //add click handler to description that triggers the input
    $("p").click(function(e){
       $("#file").click(); 
    });

    var readmeLoaded = false;
    $('#readme-container').click(function(){
        if($('#readme-container .content').toggle().is(':hidden') || readmeLoaded) return;

        $.ajax('https://api.github.com/repos/ocjojo/word-memory/readme', {
            headers: {          
                Accept: "application/vnd.github.VERSION.html" 
            }
        }).then(function(html){
            $('#readme-container .content').html(html);
            readmeLoaded = true;
        });
    });
});

var Game = function() {
    //the number of word pairs
    var wordPairs = words.length;
    //the id for a word is counted up continuously
    //max num is wordPairs - 1 
    var num = 0;
    // store the tiles temporarily until they are added to dom
    var tiles = [];
    $("body").html('<div id="game"></div>');
    //create tiles for word pairs
    while(words.length > 0) {
        tile(num++, words[0]);
        words.splice(0, 1);
    }
    //add the tiles randomly to document
    var i = 1;
    while(tiles.length > 0) {
        //random index
        var index = Math.floor(Math.random() * tiles.length);
        tiles[index].appendTo('#game').prepend(i++);
        //remove element from words
        tiles.splice(index, 1);
    }
    //add click handler to the tiles
    $(".tile").click(function(e){
        flip(e.currentTarget.id);
    });
    //flip the tile with specified id
    var flipped = [];
    function flip(id) {
        //return if the tile is out
        if(tile(id).hasClass('out')) {
            return;
        }
        //if already flipped do nothing
        if(flipped[0] != id && flipped[1] != id) {
            //if 2 tiles are flipped, but not the clicked, turn the other two first
            if(flipped.length > 1) {
                while(flipped.length > 0) {
                    toggle(flipped.pop());
                }
            }
            //flip the clicked tile
            flipped.push(id);
            toggle(id);
        }
    }
    //toggle the tile with ID
    function toggle(id) {
        tile(id).toggle();
        checkPair();
    }
    //check if a match was found
    function checkPair() {
        if(flipped.length > 1) {
            if(flipped[0] % wordPairs == flipped[1] % wordPairs) {
                out();
            }
        }
    }
    //take the flipped words out of the game
    function out(){
        while(flipped.length > 0) {
            tile(flipped.pop()).addClass('out').append('<div></div>');
        }
    }
    //create a pair of tiles with an id and a word pair or return the tile with id
    function tile(id, word) {
        if(typeof word !== "undefined") {
            var w = word.split(";");
            for(var i = 0; i < 2; i++) {
                 var newTile = $('<div class="tile" id="' + (id + i * wordPairs) + '"></div>');
                $('<div>' + w[i] + '</div>').appendTo(newTile).hide();
                tiles.push(newTile);
            }
        } else {
            return $("#" + id + " > div");
        }
    }
};
