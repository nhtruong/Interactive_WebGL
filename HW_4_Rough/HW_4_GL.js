/* global WebGLUtils, flatten */

"use strict";
var selected, hovered, selectedLight, hoveredLight;

var shapes = [];
window.onload = function(){
    setupCanvas();
    updateCanvas();
    shapes["box"] = makeCube();
    shapes["cone"] = makeCone();
    shapes["cylinder"] = makeCylinder();
    shapes["sphere"] = makeSphere();
    
    setupUI();
    
    test();
    
    $(window).resize(updateCanvas);
    requestAnimFrame(render);
};

function test(){

    
}

var canvas, gl, program;
var vBuffer, nBuffer;
var loc_lightCount, loc_lightPosition, loc_shininess;
var loc_ambientProd, loc_diffuseProd, loc_specularProd;
var loc_modelMat, loc_normalMat, loc_invTransMat;
var loc_colorMode, loc_transMat, loc_position, loc_normal;
function setupCanvas(){
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert( "WebGL isn't available" ); }
    gl.clearColor( 1, 1, 1, 1 );
    gl.enable(gl.DEPTH_TEST);
    gl.polygonOffset(1.0, 2);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    loc_lightCount = gl.getUniformLocation( program, "lightCount" );
    loc_shininess = gl.getUniformLocation( program, "shininess" );
    loc_lightPosition = gl.getUniformLocation( program, "lightPosition" );
    loc_ambientProd = gl.getUniformLocation( program, "ambientProd" );
    loc_diffuseProd = gl.getUniformLocation( program, "diffuseProd" );
    loc_specularProd = gl.getUniformLocation( program, "specularProd" );
    
    loc_modelMat = gl.getUniformLocation( program, "modelMat" );
    loc_normalMat = gl.getUniformLocation( program, "normalMat" );
    
    loc_colorMode = gl.getUniformLocation( program, "colorMode" );
    loc_invTransMat = gl.getUniformLocation( program, "invTransMat" );
    loc_transMat = gl.getUniformLocation( program, "transMat" );
    loc_position = gl.getAttribLocation( program, "vPosition" );
    loc_normal = gl.getAttribLocation( program, "vNormal" );
    
    vBuffer = gl.createBuffer();
    nBuffer = gl.createBuffer();
}

var aspect, viewMat, projectionMat, modelMat, normalMat;
function updateCanvas(){
    var dispWidth = $(window).innerWidth();
    var dispHeight = $(window).outerHeight();
    canvas.width = dispWidth;
    canvas.height = dispHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    aspect = canvas.clientWidth/canvas.clientHeight;
    projectionMat = perspective(50, aspect , 1, 100);
    modelMat = lookAt([0,0,12], [0,0,0] , [0,1,0]);
    viewMat = mult(projectionMat, modelMat);
    
    normalMat = normalMatrix(viewMat,true);
    
    gl.uniformMatrix4fv(loc_modelMat, false, flatten(modelMat));
    gl.uniformMatrix3fv(loc_normalMat, false, flatten(normalMat));
}

function setupUI() {
    
    $("#addFigure").button().click(function () {
        $("<div></div>").insertBefore($(this))
                .figSelector().hide().slideDown()
                .find('.selector').click();
    }).click().click().click().click().click().click();
    
   
    $($("div.figure")[0]).data("custom-figSelector").updateShape("sphere");
    $($("div.figure")[1]).data("custom-figSelector").updateShape("cylinder");
    $($("div.figure")[2]).data("custom-figSelector").updateShape("cone");
    $($("div.figure")[3]).data("custom-figSelector").updateShape("sphere");
    $($("div.figure")[4]).data("custom-figSelector").updateShape("cylinder");
    $($("div.figure")[5]).data("custom-figSelector").updateShape("cone");
    
    $("#addLight").button().click(function () {
        if(lightCount >= 16) return;
        $("<div></div>").insertBefore($(this))
                .lightSelector().hide().slideDown()
                .find('.selector').click();
        updateLightCount();
    }).click().click();
    
    $(".control-panel").hide().delay(500).fadeIn(1000);
}
var lightCount;
function updateLightCount(){
    lightCount = $(".lightSource").length;
    gl.uniform1i(loc_lightCount, lightCount);
}

function bufferVertices(vertices, normals){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.vertexAttribPointer(loc_position, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(loc_position);
    
    if(normals === undefined) return;
    
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    gl.vertexAttribPointer(loc_normal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(loc_normal);
}

var lightPosition, lightAmbient, lightDiffuse, lightSpecular;
function createLights() {
    lightPosition = []; lightAmbient = []; lightDiffuse = []; lightSpecular = [];

    $("div.lightSource").each(function () {
        var light = $(this).data("custom-lightSelector").getData();
        lightPosition.push(light.position);
        lightAmbient.push(light.ambient);
        lightDiffuse.push(light.diffuse);
        lightSpecular.push(light.specular);
    });
    if(lightCount > 0)
        gl.uniform4fv(loc_lightPosition, flatten(lightPosition));
}

function drawSolid(fig,count) {
    var colorMode;
    if (fig === hovered)colorMode = 1;
    else colorMode = 0;
    gl.uniform1i(loc_colorMode, colorMode);
    
    var transMat = mult(viewMat, fig.getTransMat());
    gl.uniformMatrix4fv(loc_transMat, false, flatten(transMat));
    
    var material = fig.getMaterial();
    var ambientProd = [];
    var diffuseProd = [];
    var specularProd = [];
    for(var i = 0; i < lightCount; i++) {
        ambientProd.push(mult(lightAmbient[i], material.ambient));
        diffuseProd.push(mult(lightDiffuse[i], material.diffuse));
        specularProd.push(mult(lightSpecular[i], material.specular));
    }
    
    if(lightCount > 0) {
        gl.uniform4fv(loc_ambientProd, flatten(ambientProd));
        gl.uniform4fv(loc_diffuseProd, flatten(diffuseProd));
        gl.uniform4fv(loc_specularProd, flatten(specularProd));
        gl.uniform1f(loc_shininess, material.shininess);
    }
    gl.drawArrays(gl.TRIANGLES, 0, count);
}
function drawShapes(){
    for(var shape in shapes) {
        var shapeData = shapes[shape];
        var count = shapeData.solid.length;
        bufferVertices(shapeData.solid, shapeData.normals);
        $("div.figure").each(function () {
            var fig = $(this).data("custom-figSelector");
            if (fig.shape === shape)
                drawSolid(fig, count);
        });
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
    createLights();
    drawShapes();
    requestAnimFrame(render);
}


