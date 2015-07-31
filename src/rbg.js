(function (scope) {
    scope['RBG'] = scope['RBG'] || (function () {
        var M = {},
            boxes = [],
            grid = null,
            gridL = 0,
            gridT = 0,
            gridW = 0,
            gridH = 0,
            boxW = 200,
            boxH = 200,
            boxG = 5;

        var css = function (ele, cssObj) {
            for (var s in cssObj) {
                if (cssObj.hasOwnProperty(s)) {
                    ele.style[s] = cssObj[s];
                }
            }
        };

        var Box = function (view, cbs) {
            var pos = boxes.length,
                self = this,
                maxCols = Math.floor(grid.clientWidth / (boxW + boxG));

            if (!view) {
                throw 'Box(): No view assigned to the box';
            }
            else {
                cbs = cbs || {};
                cbs['onDrag'] = cbs['onDrag'] || function (e) {};
                cbs['onDragStart'] = cbs['onDragStart'] || function (e) {};
                cbs['onDragStop'] = cbs['onDragStop'] || function (e) {};

                css(view, {
                    position: 'absolute',
                    display: 'inline-block',
                    zIndex: '1000',
                    transition: 'left 0.2s linear, top 0.2s linear'
                });

                view.style.width = boxW + 'px';
                view.style.height = boxH + 'px';
                grid.appendChild(view);

                Object.defineProperty(this, 'mLeft', {
                    get: function () {
                        return parseInt(this.mView.style.left, 10);
                    },
                    set: function (val) {
                        this.mView.style.left = val + 'px';
                    }
                });
                Object.defineProperty(this, 'mTop', {
                    get: function () {
                        return parseInt(this.mView.style.top, 10);
                    },
                    set: function (val) {
                        this.mView.style.top = val + 'px';
                    }
                });
                Object.defineProperty(this, 'mPos', {
                    get: function () {
                        return pos;
                    },
                    set: function (val) {
                        pos = val;
                        this.reposition();
                    }
                });

                this.mView = view;
                this.mDeltaX = 0;
                this.mDeltaY = 0;
                this.mLeft = ((pos % maxCols) * (boxW + boxG));
                this.mTop = (Math.floor(pos / maxCols) * (boxH + boxG));

                this.mOnMouseMove = function (e) {
                    self.drag(e);
                    cbs['onDrag'].apply(self.mView, [e]);
                };
                view.addEventListener('mousedown', function (e) {
                    self.dragstart(e);
                    cbs['onDragStart'].apply(self.mView, [e]);
                });
                view.addEventListener('mouseup', function (e) {
                    self.dragstop(e);
                    cbs['onDragStop'].apply(self.mView, [e]);
                });
            }
        };

        Box.prototype = {
            reposition: function () {
                var maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    pos = this.mPos;

                this.mLeft = ((pos % maxCols) * (boxW + boxG));
                this.mTop = (Math.floor(pos / maxCols) * (boxH + boxG));
            },
            dragstart: function (e) {
                var view = this.mView;

                css(view, {
                    zIndex: '2000',
                    transition: 'none'
                });

                view.style.transform = 'scale(0.95)';
                view.addEventListener('mousemove', this.mOnMouseMove);
                this.mDeltaX = e.clientX + gridL - this.mLeft,
                this.mDeltaY = e.clientY + gridT - this.mTop;
            },
            dragstop: function (e) {
                var view = this.mView,
                    maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    coords = [this.mLeft, this.mTop],
                    pos = Math.floor(coords[0] / (boxW + boxG) + 0.5) +
                          Math.floor(coords[1] / (boxH + boxG) + 0.5) *
                          maxCols;

                css(view, {
                    zIndex: '1000',
                    transition: 'left 0.2s linear, top 0.2s linear'
                });

                pos = Math.max(0, pos);
                pos = Math.min(boxes.length - 1, pos);
                view.style.transform = '';
                view.removeEventListener('mousemove', this.mOnMouseMove);
                this.mPos = pos;
            },
            drag: function (e) {
                var box = this.mView,
                    maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    coords = [(e.clientX + gridL - this.mDeltaX),
                              (e.clientY + gridT - this.mDeltaY)],
                    pos = Math.floor(coords[0] / (boxW + boxG) + 0.5) +
                          Math.floor(coords[1] / (boxH + boxG) + 0.5) *
                          maxCols,
                    curPos = this.mPos;

                pos = Math.max(0, pos);
                pos = Math.min(boxes.length - 1, pos);

                if (pos > curPos) {
                    for (var i = 0; i < boxes.length; i++) {
                        if (boxes[i] === this) {
                            boxes[i].mPos = pos;
                        }
                        else if (boxes[i].mPos >= curPos &&
                                 boxes[i].mPos <= pos) {
                            boxes[i].mPos = boxes[i].mPos - 1;
                        }
                    }
                }
                else if (pos < curPos) {
                    for (var i = 0; i < boxes.length; i++) {
                        if (boxes[i] === this) {
                            boxes[i].mPos = pos;
                        }
                        else if (boxes[i].mPos <= curPos &&
                                 boxes[i].mPos >= pos) {
                            boxes[i].mPos = boxes[i].mPos + 1;
                        }
                    }
                }

                this.mLeft = coords[0];
                this.mTop = coords[1];
            }
        };

        M.config = function (config) {
            config = config || {};
            grid = config.grid || document.body;
            boxW = config.boxW || boxW;
            boxH = config.boxH || boxH;
            boxG = config.boxG || boxG;
            gridL = config.gridL || gridL;
            gridT = config.gridT || gridT;
            gridW = config.gridW || (innerWidth - 2*gridL);
            gridH = config.gridH || (innerHeight - 2*gridT);

            css(grid, {
                position: 'absolute',
                left: gridL + 'px',
                top: gridT + 'px',
                width: gridW + 'px',
                height: gridH + 'px',
                webkitUserSelect: 'none'
            });

            window.addEventListener('resize', function () {
                gridW = config.gridW || (innerWidth - 2*gridL);
                gridH = config.gridH || (innerHeight - 2*gridT);

                css(grid, {
                    width: gridW + 'px',
                    height: gridH + 'px'
                });

                for (var i = 0; i < boxes.length; i++) {
                    boxes[i].reposition();
                }
            });
        };

        M.addBox = function (view, cbs) {
            boxes.push(new Box(view, cbs));
        };

        return M;
    }());
}(window));
