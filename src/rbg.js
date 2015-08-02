(function (scope) {
    scope['RBG'] = scope['RBG'] || (function () {
        var M = {},
            // Array of boxes
            boxes = [],
            // Grid container element
            grid = null,
            // Box array container element
            ctr = null,
            // Grid left position
            gridL = 0,
            // Grid top position
            gridT = 0,
            // Grid width
            gridW = 0,
            // Grid height
            gridH = 0,
            // Box width
            boxW = 200,
            // Box height
            boxH = 200,
            // Gap between boxes
            boxG = 5;

        // Apply css style specified in 'cssObj' to the element 'ele'.
        var css = function (ele, cssObj) {
            for (var s in cssObj) {
                if (cssObj.hasOwnProperty(s)) {
                    ele.style[s] = cssObj[s];
                }
            }
        };

        // Class associated with each box element.
        // view - HTML element for the box.
        // cbs - Callbacks for drag events.
        // cbs = {
        //    onDragStart: function (e) {...},
        //    onDragStop: function (e) {...},
        //    onDrag: function (e) {...}
        // }
        var Box = function (view, cbs) {
            var pos = boxes.length,
                self = this,
                maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                nRows = Math.ceil((boxes.length + 1) / maxCols);

            if (!view) {
                throw 'Box(): No view assigned to the box';
            }
            else if (!grid) {
                throw 'Box(): Grid element has not been configured';
            }
            else {
                cbs = cbs || {};
                cbs['onDrag'] = cbs['onDrag'] || function (e) {};
                cbs['onDragStart'] = cbs['onDragStart'] || function (e) {};
                cbs['onDragStop'] = cbs['onDragStop'] || function (e) {};

                // Apply box style to the view.
                css(view, {
                    position: 'absolute',
                    display: 'inline-block',
                    zIndex: '1000',
                    transition: 'left 0.2s linear, top 0.2s linear'
                });

                // Apply box width and height.
                view.style.width = boxW + 'px';
                view.style.height = boxH + 'px';

                // Resize the container to fit the new box.
                css(ctr, {
                    width: (maxCols * (boxW + boxG)) + 'px',
                    height: (nRows * (boxH + boxG)) + 'px'
                });
                // Add the new box to the container.
                ctr.appendChild(view);

                // Bind the 'mLeft' property to the box style's
                // 'left' value.
                Object.defineProperty(this, 'mLeft', {
                    get: function () {
                        return parseInt(this.mView.style.left, 10);
                    },
                    set: function (val) {
                        this.mView.style.left = val + 'px';
                    }
                });
                // Bind the 'mTop' property to the box style's
                // 'top' value.
                Object.defineProperty(this, 'mTop', {
                    get: function () {
                        return parseInt(this.mView.style.top, 10);
                    },
                    set: function (val) {
                        this.mView.style.top = val + 'px';
                    }
                });
                // Reposition the box everytime the value of 'mPos' changes.
                Object.defineProperty(this, 'mPos', {
                    get: function () {
                        return pos;
                    },
                    set: function (val) {
                        pos = val;
                        this.reposition();
                    }
                });
                // The view associated with the box.
                this.mView = view;
                // The x-axis distance b/w mouse position and box's left edge.
                this.mDeltaX = 0;
                // The y-axis distance b/w mouse position and box's top edge.
                this.mDeltaY = 0;
                // Left position of the box.
                this.mLeft = 0;
                // Top position of the box.
                this.mTop = 0;
                // Linear position of the box.
                this.mPos = pos;
                // Mouse move callback (call onDrag()).
                this.mOnMouseMove = function (e) {
                    self.drag(e);
                    cbs['onDrag'].apply(self.mView, [e]);
                };
                // Mosedown callback (call onDragStart())
                view.addEventListener('mousedown', function (e) {
                    self.dragstart(e);
                    cbs['onDragStart'].apply(self.mView, [e]);
                });
                // Mouseup callback (call onDragStop())
                view.addEventListener('mouseup', function (e) {
                    self.dragstop(e);
                    cbs['onDragStop'].apply(self.mView, [e]);
                });
            }
        };

        // Box methods.
        Box.prototype = {
            // Reposition the box based on it's linear position.
            reposition: function () {
                var maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    pos = this.mPos;

                this.mLeft = ((pos % maxCols) * (boxW + boxG));
                this.mTop = (Math.floor(pos / maxCols) * (boxH + boxG));
            },
            // Event handler for drag start.
            dragstart: function (e) {
                var view = this.mView;
                // Increase z-index so that the dragged box is always on
                // top of other boxes.
                css(view, {zIndex: '2000', transition: 'none'});
                // Slightly shrink the dragged box for 'press' effect.
                view.style.transform = 'scale(0.95)';
                // Add event handler for 'mousemove' to make the box
                // follow the mouse pointer.
                view.addEventListener('mousemove', this.mOnMouseMove);
                // Record the distance between the left top corner and the
                // mouse pointer.
                this.mDeltaX = e.clientX + gridL - this.mLeft,
                this.mDeltaY = e.clientY + gridT - this.mTop;
            },
            // Event handler for drag stop.
            dragstop: function (e) {
                var view = this.mView,
                    maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    coords = [this.mLeft, this.mTop],
                    pos = Math.floor(coords[0] / (boxW + boxG) + 0.5) +
                          Math.floor(coords[1] / (boxH + boxG) + 0.5) *
                          maxCols;

                css(view, {transition: 'left 0.2s linear, top 0.2s linear'});
                // Decrease the z-index to its original value.
                setTimeout(function () { css(view, {zIndex: '1000'}); }, 200);
                // Determine the new position of the dragged box.
                pos = Math.max(0, pos);
                pos = Math.min(boxes.length - 1, pos);
                // Remove the 'mousemove' event listener as the box is no
                // longer being dragged.
                view.style.transform = '';
                view.removeEventListener('mousemove', this.mOnMouseMove);
                this.mPos = pos;
            },
            // Event handler for drag.
            drag: function (e) {
                var box = this.mView,
                    maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    nRows = Math.ceil(boxes.length / maxCols),
                    coords = [(e.clientX + gridL - this.mDeltaX),
                              (e.clientY + gridT - this.mDeltaY)],
                    curPos = this.mPos,
                    pos;
                // Determine the new coordinates of the left top corner
                // of the box.
                coords[0] = Math.max(coords[0], 0);
                coords[0] = Math.min(coords[0], (maxCols - 1) * (boxW + boxG));
                coords[1] = Math.max(coords[1], 0);
                coords[1] = Math.min(coords[1], (nRows - 1) * (boxH + boxG));
                // Determine the new linear position of the box.
                pos = Math.floor(coords[0] / (boxW + boxG) + 0.5) +
                      Math.floor(coords[1] / (boxH + boxG) + 0.5) *
                      maxCols;
                pos = Math.max(0, pos);
                pos = Math.min(boxes.length - 1, pos);
                // If it's new position is greater than it's current position,
                // then move all the boxes between it's old and new positions
                // left by one position.
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
                // If it's new position is lesser than it's current position,
                // then move all the boxes between it's old and new positions
                // right by one position.
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
                // Assign the new coordinates to the 'mLeft' and 'mTop'
                // properties.
                this.mLeft = coords[0];
                this.mTop = coords[1];
            }
        };
        // Configure the grid, container and box dimensions.
        M.config = function (config) {
            config = config || {};
            grid = config.grid;
            ctr = grid.children[0];
            boxW = config.boxW || boxW;
            boxH = config.boxH || boxH;
            boxG = config.boxG || boxG;
            gridL = config.gridL || gridL;
            gridT = config.gridT || gridT;
            gridW = config.gridW || (innerWidth - 2*gridL);
            gridH = config.gridH || (innerHeight - 2*gridT);

            if (!grid) {
                throw('RBG.config(): Grid must specified.');
            }
            else if (!ctr) {
                throw('RBG.config(): Grid must have a box container div.');
            }
            else {
                // Add grid styling.
                css(grid, {
                    position: 'absolute',
                    left: gridL + 'px',
                    top: gridT + 'px',
                    width: gridW + 'px',
                    height: gridH + 'px',
                    webkitUserSelect: 'none',
                    mozUserSelect: 'none',
                    overflow: 'auto'
                });
                // Add box container styling.
                css(ctr, {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '0',
                    height: '0'
                });
                // On window resize, resize the grid, the box container,
                // and reposition the boxes.
                window.addEventListener('resize', function () {
                    var maxCols,
                        nRows;
                    // Determine the new dimensions of the grid.
                    gridW = config.gridW || (innerWidth - 2*gridL);
                    gridH = config.gridH || (innerHeight - 2*gridT);
                    // Set the new grid dimensions.
                    css(grid, {
                        width: gridW + 'px',
                        height: gridH + 'px'
                    });
                    // Determine the new dimensions of the box container.
                    maxCols = Math.floor(grid.clientWidth / (boxW + boxG)),
                    nRows = Math.ceil(boxes.length / maxCols);
                    // Set the new box container dimensions.
                    css(ctr, {
                        width: (maxCols * (boxW + boxG)) + 'px',
                        height: (nRows * (boxH + boxG)) + 'px'
                    });
                    // Reposition the boxes to fit in the resized
                    // box container and grid.
                    for (var i = 0; i < boxes.length; i++) {
                        boxes[i].reposition();
                    }
                });
            }
        };
        // Add a new box to the grid. 'cbs' is the set of callbacks for
        // the drag, dragstart, and dragstop events.
        M.addBox = function (view, cbs) {
            boxes.push(new Box(view, cbs));
        };

        return M;
    }());
}(window));
