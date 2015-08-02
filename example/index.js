(function () {
    RBG.config({
        grid: document.getElementById('rbggrid'),
        gridL: 20,
        gridT: 50,
        gridH: 500,
        boxH: 150,
        boxG: 20
    });

    for (var i = 0; i < 10; i++) {
        var box = document.createElement('div');
        box.align = 'center';
        box.classList.add('rbg-box');
        box.innerHTML = '<div class="close"><strong>&times;</strong></div>' +
                        '<img src="http://www.androidguys.com/' +
                        'wp-content/uploads/2012/12/' +
                        'new_york_times_720.jpg" draggable="false">' +
                        '<span>' + i + '</span>';
        RBG.addBox(box, '.close', {
            onDragStart: function () {
                this.classList.add('rbg-drag');
            },
            onDragStop: function () {
                this.classList.remove('rbg-drag');
            }
        });
    }
}());
