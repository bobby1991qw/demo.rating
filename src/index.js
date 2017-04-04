import Rating from './Rating';

var r = new Rating(document.getElementById('canvas'));

r.start();


document.getElementById('qw').addEventListener('click', function() {
    r.start();
})