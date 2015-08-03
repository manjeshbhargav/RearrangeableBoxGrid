(function () {
    var i = 0,
        boxInfo = [
            {
                title: 'Apple',
                logo: 'http://zankrank.com/u/9f369584-' +
                      'a289-48e4-8112-3f4b49b3c52d.png'
            },
            {
                title: 'New York Times',
                logo: 'http://www.androidguys.com/' +
                      'wp-content/uploads/2012/12/' +
                      'new_york_times_720.jpg'
            },
            {
                title: 'Nike',
                logo: 'http://zankrank.com/u/38565193-3dea-' +
                      '4be4-94c6-90f507b27dfb.jpg'
            }
        ];

    var boxFromTemplate = function (params) {
        var box = document.querySelector('.rbg-box-tmpl').cloneNode(true),
            logo = box.children[1],
            title = box.children[2];

        box.classList.remove('rbg-box-tmpl');
        box.classList.add('rbg-box');
        logo.src = params['logo'];
        title.innerHTML = params['title'];

        return box;
    };

    RBG.config({
        grid: document.getElementById('rbggrid'),
        gridL: 20,
        gridT: 50,
        gridH: 500,
        boxH: 150,
        boxG: 20,
        onAddBox: function () {
            RBG.addBox(boxFromTemplate(boxInfo[i % boxInfo.length]), '.close', {
                onDragStart: function () {
                    this.classList.add('rbg-drag');
                },
                onDragStop: function () {
                    this.classList.remove('rbg-drag');
                }
            });
            i = i + 1;
        }
    });

    for (var i = 0; i < boxInfo.length; i++) {
        RBG.addBox(boxFromTemplate(boxInfo[i]), '.close', {
            onDragStart: function () {
                this.classList.add('rbg-drag');
            },
            onDragStop: function () {
                this.classList.remove('rbg-drag');
            }
        });
    }
}());
