/* global WebGLUtils */

"use strict";

var canvas;
var aspect;
var gl;
var program;
var loc_colorMode;
var loc_transMat;
var loc_position;
var fig;
var viewMat;
var cubeSolid, cubeMesh, cubes = [];
var shapes = [];
var selected, hovered;
var drawMode = "draw_both";

window.onload = function(){
    setupCanvas();
    updateCanvas();
    shapes["box"] = {solid: makeCube(), mesh: makeCube(true)};
    shapes["cone"] = {solid: makeCone(), mesh: makeCone(true)};
    shapes["cylinder"] = {solid: makeCylinder(), mesh: makeCylinder(true)};
    shapes["sphere"] = {solid: makeSphere(), mesh: makeSphere(true)};
    
    setupUI();
    $(window).resize(updateCanvas);
    requestAnimFrame(render);
};

function updateCanvas(){
    var dispWidth = $(window).innerWidth();
    var dispHeight = $(window).outerHeight();
    canvas.width = dispWidth;
    canvas.height = dispHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    aspect = canvas.clientWidth/canvas.clientHeight;
    viewMat = mult(perspective(50, aspect , 1, 100), lookAt([0,0,10], [0,0,0] , [0,1,0]));
}

function setupCanvas(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert( "WebGL isn't available" ); }
    gl.clearColor( 1, 1, 1, 1 );
    gl.enable(gl.DEPTH_TEST);
    //gl.polygonOffset(1.0, 2);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    loc_transMat = gl.getUniformLocation( program, "transMat" );
    loc_colorMode = gl.getUniformLocation( program, "colorMode" );
    loc_position = gl.getAttribLocation( program, "vPosition" );
    
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer(loc_position, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(loc_position);
}
function setupUI() {
    
    $(".adder").button().click(function () {
        $("<div></div>").insertBefore($(this))
                .figSelector().hide().slideDown()
                .find('.selector').click();
    }).click().click().click().click();
    
    $(".control-panel").hide();
    $($("div.figure")[0]).data("custom-figSelector").updateShape("box");
    $($("div.figure")[1]).data("custom-figSelector").updateShape("cone");
    $($("div.figure")[2]).data("custom-figSelector").updateShape("cylinder");
    $($("div.figure")[3]).data("custom-figSelector").updateShape("sphere");
    
    
    $("#drawMode").buttonset().find("input").click(function(){
        drawMode = $(this).attr('id');
    });
    $(".control-panel").delay(500).fadeIn(1000);
}

function drawShapes(){
    $("div.figure").each(function(){
            $(this).data("custom-figSelector").updateTransMat();
        });
    for(var shape in shapes) {
        if (drawMode === "draw_both" || drawMode === "draw_solid") {
            bufferVertices(shapes[shape].solid);
            $("div.figure").each(function () {
                var fig = $(this).data("custom-figSelector");
                if (fig.shape !== shape)
                    return;
                fig.solid();
            });
        }
        if (drawMode === "draw_both" || drawMode === "draw_mesh") {
            bufferVertices(shapes[shape].mesh);
            $("div.figure").each(function () {
                var fig = $(this).data("custom-figSelector");
                if (fig.shape !== shape)
                    return;
                fig.mesh();
            });
        }
    }
}

var prevTime = 0;
var frames = 0;
var FPS;
function render(time){
    frames++;
    if(time-prevTime > 500) {
        FPS = frames/(time-prevTime) * 1000;
        FPS = FPS.toFixed(2);
        $("#FPS").text(FPS);
        prevTime = time;
        frames = 0;
    }
    gl.clear( gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    $(".ds_wrapper").dancingSlider("dance");
    drawShapes();
    requestAnimFrame(render);
}


