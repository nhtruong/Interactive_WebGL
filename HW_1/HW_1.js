/* global WebGLUtils */

"use strict";

var canvas;
var gl;
var program;
var points;
var satelite;

var tesselation;
var rotation;
var theta;
var edges;
var width;
var rate;
var twistX;
var twistY;
var displacementX;
var displacementY;
var convexity;
var origin;

window.onload = function init()
{
    drawFrame();
};

function drawFrame(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    points = [];
    tesselation = $('#sld_tessellation').slider('value');
    rotation = $('#sld_rotation').slider('value');
    theta = $('#sld_angle').slider('value');
    edges = $('#sld_polygon').slider('value');
    width = $('#sld_width').slider('value')/100;
    rate = $('#sld_rate').slider('value')/100;
    twistX = $('#sld_twistX').slider('value')/200;
    twistY = $('#sld_twistY').slider('value')/200;
    displacementX = $('#sld_displacementX').slider('value')/100;
    displacementY = $('#sld_displacementY').slider('value')/100;
    convexity = $('#sld_convexity').slider('value')/100;
    origin = vec2(0,0);
   
    makePolygon(origin, rotation,width, edges, convexity, tesselation);
    
    
    var sat_tesselation = $('#sat_tessellation').slider('value');
    var sat_edges = $('#sat_polygon').slider('value');
    var sat_count = $('#sat_count').slider('value');
    var sat_rotation = $('#sat_rotation').slider('value');
    var sat_angle = $('#sat_angle').slider('value');
    var sat_width = $('#sat_width').slider('value')/120;
    var sat_convexity = $('#sat_convexity').slider('value')/100;
    var sat_height = $('#sat_height').slider('value')/100;
    
    var angle = 360 / sat_count;
    var center = [sat_height,0];
    
    for(var i = 0; i < sat_count; i++) {
        origin = swingPoint(center, angle * i + sat_angle, 1, vec2(0.0,0.0));
        makePolygon(origin, sat_rotation,sat_width, sat_edges, sat_convexity, sat_tesselation);
    }
    
    
    render();
}

function makePolygon(center, rotation, width, edges, convexity, count){
    edges *= 2;
    var initialVertex = swingPoint(vec2(center[0],width+center[1]), rotation,1, center);
    var angle = 360 / edges;
    var currVertex = initialVertex;
    var nextVertex;
    var scale;
    convexity = convexity * Math.cos(radians(angle));
    for(var i=1; i<= edges;i++, currVertex = nextVertex){
        scale = i % 2 === 0 ? 1/convexity : convexity;
        nextVertex = i === edges ? initialVertex : swingPoint(currVertex,angle,scale,center);
        divideTriangle(center, currVertex, nextVertex, count);
    }
}

// Move a point by rotating and scaling its vector
function swingPoint(point,angle,scale,center){
    center = typeof center === 'undefined' ? [0,0] : center;
    var x = point[0] - center[0];
    var y = point[1] - center[1];
    angle = radians(angle);
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var rx = scale * (x*c - y*s) + center[0];
    var ry = scale * (x*s + y*c) + center[1];
    return vec2(rx,ry);
}

function clonePoints(objs, angle, scale, center) {
    
    for(var i = 0; i < objs.length; i++) {
        points.push( swingPoint(objs[i],angle,scale,center));
    }
}
function triangle( a, b, c ){
    points.push( a, b, c );

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
function render(){
    // Load Points Data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Load uniform values into the GPU
    
        
    var displacement = vec2(displacementX,displacementY);
    var twistCenter = vec2(twistX,twistY);
    
    var loc;
    loc = gl.getUniformLocation(program,"uTheta");
    gl.uniform1f(loc, theta);
    loc = gl.getUniformLocation(program,"uRate");
    gl.uniform1f(loc, rate);
    loc = gl.getUniformLocation(program,"uWidth");
    gl.uniform1f(loc, width);
    loc = gl.getUniformLocation(program,"uDisplacement");
    gl.uniform1fv(loc,displacement,0,2);
    loc = gl.getUniformLocation(program,"uTwistCenter");
    gl.uniform1fv(loc,twistCenter,0,2);
    
    gl.clear( gl.COLOR_BUFFER_BIT);
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
