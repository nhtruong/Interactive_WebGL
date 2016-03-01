/* global WebGLUtils */

"use strict";

var canvas;
var h,w;
var gl;
var program;
var points;
var edges = 8;
var ratio;
var size = 0.03;
var drawing, ctrlKey;
var ctrlPoint;
var brushPoint;
var offsetFunc = function(x,y){return vec2(x,y);};

window.onload = function(){   
    points = [];
    setUp();
    setInterval(render,25);
};

function setUp(){
    var canvas = $(setupCanvas()).focus();
    w = canvas.width();
    h = canvas.height();
    ratio = h/w;
    if(h > w) offsetFunc = function(x,y){y*=ratio; return vec2(x,y);};
    if(w > h) offsetFunc = function(x,y){x/=ratio; return vec2(x,y);};
    
    
    var point;
    canvas.mousedown(function(e){
        drawing = true;
        
    }).mousemove(function(e){
        if(!drawing && !ctrlKey) return;
        point = Window2Clip_Coordinate(e.offsetX,e.offsetY);
        if(ctrlKey) {
            if(ctrlPoint === undefined) 
                ctrlPoint = Window2Clip_Coordinate(e.offsetX,e.offsetY);
            else {
                size += (point[0] - ctrlPoint[0])/1000;
                if(size > 0.1) size = 0.1;
                if(size < 0.005) size = 0.005;
                $('#span_thickness').text((size*10).toFixed(2));
            }
        }
        else if(drawing) { 
            drawPolygon(point, size, edges);
        }
    }).mouseup(function(){
        drawing = false;
        console.log(points.length);
    }).keydown(function(e){
        ctrlKey = e.ctrlKey;
    }).keyup(function(e) {
        ctrlKey = e.ctrlKey;
        if(!ctrlKey) ctrlPoint = undefined;
    });
}

function Window2Clip_Coordinate(x,y) {
    x = -1 + 2 * x/w;
    y = -1 + 2 * (h-y)/h;
    return offsetFunc(x,y);
}
function setupCanvas(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    return canvas;
}

function distance(from,to){
    //return
}

function drawLine(from,to){
    
}
function drawBrushSize(){
    drawPolygon(ctrlPoint,size,20, brushPoint);
}
function drawPolygon(point, radius, edges) {
    var initVertex = vec2(point[0]+radius,point[1]);
    var angle = 360 / edges;
    var currVertex = initVertex;
    var nextVertex;
    for(var i = 1; i <= edges; i++, currVertex = nextVertex){
        nextVertex = i === edges ? initVertex : rotatePoint(currVertex,angle,point);
        drawTriangle(point, currVertex, nextVertex);
    }
}
function drawTriangle(a,b,c){
    points.push(a,b,c);
} 
function rotatePoint(point, angle,center) {
    center = center === undefined ? [0,0] : center;
    angle = angle === undefined ? 0 : angle;
    var x = point[0] - center[0];
    var y = point[1] - center[1];
    angle = radians(angle);
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var rx = (x*c - y*s) + center[0];
    var ry = (x*s + y*c) + center[1];
    return vec2(rx,ry);
}
function swingPoint(point,angle,scale,center){
    center = center === undefined ? [0,0] : center;
    scale = scale === undefined ? 1 : scale;
    angle = angle === undefined ? 0 : angle;
    var x = point[0] - center[0];
    var y = point[1] - center[1];
    angle = radians(angle);
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var rx = scale * (x*c - y*s) + center[0];
    var ry = scale * (x*s + y*c) + center[1];
    return vec2(rx,ry);
}
function divideTriangle( a, b, c, count ){
    // check for end of recursion
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
        --count;
        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
        divideTriangle( ab, bc, ac, count );
    }
}
function fillScreen(){
    var x = 1;
    var y = 1;
    if(ratio > 1) y *= ratio;
    if(ratio < 1) x /= ratio;
    var points = [vec2(-x,-y),vec2(-x,y),vec2(x,-y),vec2(x,y)];
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
}
var colorShift = 0;
var shift = 2*Math.PI / 600;
function render(){
    // Load Points Data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorShift += shift;
    var loc;
    loc = gl.getUniformLocation(program,"colorShift");
    gl.uniform1f(loc, colorShift);
    loc = gl.getUniformLocation(program,"ratio");
    gl.uniform1f(loc, ratio);
  
    
    
    
    // Start Drawing
    gl.clear( gl.COLOR_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    
    points.splice(0,Math.floor(points.length / 200000) * edges * 3);
}


