define(['jquery', 'TUtils', 'SynchronousManager', 'objects/robot/Robot', 'objects/maze/Maze'], function($, TUtils, SynchronousManager, Robot, Maze) {
    /**
     * Defines Builder, inherited from Robot.
     * It's a robot which can deposit tiles.
     * @exports Builder
     */
    var Builder = function() {
        // build maze before calling constructor in order to have builder drawn over the maze
        this.maze = new Maze();
        Robot.call(this, "builder", false);
        this.synchronousManager = new SynchronousManager();
        this.gObject.synchronousManager = this.synchronousManager;
        var gObject = this.gObject;
    };

    Builder.prototype = Object.create(Robot.prototype);
    Builder.prototype.constructor = Builder;
    Builder.prototype.className = "Builder";

    var graphics = Builder.prototype.graphics;

    Builder.prototype.gClass = graphics.addClass("TRobot", "TBuilder", {
        init: function(props, defaultProps) {
            this._super(TUtils.extend({
            }, props), defaultProps);
        },
        getGridX:function() {
            return this.p.gridX;
        },
        getGridY:function() {
            return this.p.gridY;
        }
    });
    
    /*
     * Put a ground at given location
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildGround = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        }
        this.maze._buildGround(x,y);
    };
    

    /*
     * Build an entrance at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildEntrance = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        }
        this.maze._buildEntrance(x,y);
    };
    
    /*
     * Build a door at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildDoor = function(x,y) {
        this._buildEntrance(x,y);
    };
    
    /*
     * Build an exit at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildExit = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        }
        this.maze._buildExit(x,y);
    };
    
    /*
     * Build a wall at current location 
     * If no location given, use current location
     * @param {Integer} x
     * @param {Integer} y
     */
    Builder.prototype._buildWall = function(x,y) {
        if (typeof x === 'undefined') {
            x = this.gObject.getGridX();
            y = this.gObject.getGridY();
        }
        this.maze._buildWall(x,y);
    };
    
    /**
     * Set a new tile image. There can be many tiles.
     * Its value in the structure will depend of the moment where it is added :
     * The first time added will have the value "1", the second "2", etc...
     * @param {String} imageName    Image's name used for tiles
     */
    Builder.prototype._addTile = function(imageName) {
        this.maze._addTile(imageName);
    };
    
    /**
     * Add a new row, starting from Builder's location
     * Builder goes down one tile afterwards, in order to allow several calls
     * @param {String} imageName    Image's name used for tiles
     */
    Builder.prototype._addRow = function() {
        var row;
        if (arguments.length === 1 && TUtils.checkArray(arguments[0])) {
            row = arguments[0];
        } else {
            row = arguments;
        }
        this.maze._setRow(this.gObject.getGridX(), this.gObject.getGridY(), row);
        this._moveDownward();
    };
    
    Builder.prototype.deleteObject = function() {
        this.maze.deleteObject();
        this.maze = undefined;
        Robot.prototype.deleteObject.call(this);
    };    
    
    return Builder;
});
