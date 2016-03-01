/* global WebGLUtils, flatten */

"use strict";
var selected, hovered, selectedLight, hoveredLight;

var shapes = [];
window.onload = function(){
    setupCanvas();
    updateCanvas();
    shapes["Box"] = makeCube();
    shapes["Cone"] = makeCone();
    shapes["Cylinder"] = makeCylinder();
    shapes["Sphere"] = makeSphere();
    
    setupUI();
    
    $(window).resize(updateCanvas);
    requestAnimFrame(render);
};
var canvas, gl, program;
var vBuffer, nBuffer, tBuffer;
var loc_lightCount, loc_lightPosition, loc_shininess;
var loc_ambientProd, loc_diffuseProd, loc_specularProd;
var loc_modelMat, loc_normalMat, loc_invTransMat;
var loc_colorMode, loc_transMat, loc_position, loc_normal;
var loc_texCoor, loc_transparency, loc_transCoor,loc_image,loc_masking;
var loc__transparency, loc__transCoor,loc__invert,loc_invert;
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
    
    loc_texCoor = gl.getAttribLocation( program, "vTexCoor" );

    loc_transparency = gl.getUniformLocation( program, "transparency" );
    loc_transCoor = gl.getUniformLocation( program, "transCoor" );
    loc_image = gl.getUniformLocation( program, "fTexture" );
    
    loc_masking = gl.getUniformLocation( program, "fMasking" );
    loc__transparency = gl.getUniformLocation( program, "_transparency" );
    loc__transCoor = gl.getUniformLocation( program, "_transCoor" );
    loc__invert = gl.getUniformLocation( program, "_invert" );
    loc_invert = gl.getUniformLocation( program, "invert" );
    
    vBuffer = gl.createBuffer();
    nBuffer = gl.createBuffer();
    tBuffer = gl.createBuffer();
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
    
    $("#addLight").button().click(function () {
        if(lightCount >= 16) return;
        $("<div></div>").insertBefore($(this))
                .lightSelector().hide().slideDown()
                .find('.selector').click();
        updateLightCount();
    }).click().click().click();
    
    setupTextureUI();
    
    
    $(".control-panel").hide().delay(500).fadeIn(1000);
}
var lightCount;
function updateLightCount(){
    lightCount = $(".lightSource").length;
    gl.uniform1i(loc_lightCount, lightCount);
}

function bufferVertices(vertices, normals, coordinates){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.enableVertexAttribArray(loc_position);
    gl.vertexAttribPointer(loc_position, 4, gl.FLOAT, false, 0, 0 );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    if(normals === undefined) return;
    
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.enableVertexAttribArray(loc_normal);
    gl.vertexAttribPointer(loc_normal, 4, gl.FLOAT, false, 0, 0 );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    if(coordinates === undefined) return;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.enableVertexAttribArray(loc_texCoor);
    gl.vertexAttribPointer(loc_texCoor, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coordinates), gl.STATIC_DRAW );
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
        bufferVertices(shapeData.solid, shapeData.normals, shapeData.coordinates);
        $("div.figure").each(function () {
            var fig = $(this).data("custom-figSelector");
            if (fig.shape === shape)
                drawSolid(fig, count);
        });
    }
}


function applyMasking(filename) {
    var div = $("#mask");
    var wrapper = div.parent();
    var img = $("<img>");
    var height = 180;
    var filepath ="Images/"+filename;
    
    var maskingTexture = gl.createTexture();
    var masking = new Image();
    masking.src = filepath;
    masking.addEventListener('load', function () {
        gl.uniform1i(loc_masking, 1);
        gl.activeTexture(gl.TEXTURE1);
        
        gl.bindTexture(gl.TEXTURE_2D, maskingTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, masking);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
    
        img.attr("src", filepath);
        div.css("background-image", "url(\"" + filepath + "\")");
        height = wrapper.width() * img[0].height / img[0].width;
        wrapper.height(height);
        var margin = (wrapper.width() - wrapper.height()) / 2;
        wrapper.css("margin",margin+10+"px 0");
        configMasking(filename);
    });

}

function applyTexture(filename) {
    var div = $("#image");
    var wrapper = div.parent();
    var img = $("<img>");
    var height = 180;
    var filepath ="Images/"+filename;
    
    
    
    var imageTexture = gl.createTexture();
    var image = new Image();
    image.src = filepath;
    
    image.addEventListener('load', function () {
        gl.uniform1i(loc_image, 0);
        gl.activeTexture(gl.TEXTURE0);
        
        gl.bindTexture(gl.TEXTURE_2D, imageTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        
        img.attr("src",filepath);
        div.css("background-image","url(\""+filepath+"\")");
        height = wrapper.width() * img[0].height / img[0].width;
        wrapper.height(height);
        var margin = (wrapper.width() - wrapper.height()) / 2;
        wrapper.css("margin",margin+10+"px 0");
        
        configTexture(filename);
    });
    
    
    
}
function updateTexture(){
    var transparency = $("#transparency").dancingSlider("value")/100;
    var repeatX = $("#repeatX").dancingSlider("value");
    var repeatY = $("#repeatY").dancingSlider("value");
    var offsetX = $("#offsetX").dancingSlider("value") / 100;
    var offsetY = $("#offsetY").dancingSlider("value") / 100;
    var rotateDeg = $("#rotate").dancingSlider("value");
    var invert = $("#invert").dancingSlider("value") / 100; 
    var rotate = radians(rotateDeg);
    
    var s = Math.sin(rotate);
    var c = Math.cos(rotate);
    rotate = mat3(
            vec3(c, s, 0),
            vec3(-s, c, 0),
            vec3(0, 0, 1)      
        );
    var transCoor = mat3(
            vec3(repeatX,   0,          offsetX),
            vec3(0,         repeatY,    offsetY),
            vec3(0,         0,          1       )      
        );
    transCoor = mult(rotate,transCoor);
    
    gl.uniform1f(loc_transparency, transparency);
    gl.uniform1f(loc_invert, invert);
    gl.uniformMatrix3fv(loc_transCoor, false, flatten(transCoor));
    
    var img = $("#image");
    var width = img.width() / repeatX;
    var height = img.height() / repeatY;
    img.css("opacity",1-transparency)
        .css("background-size", width/3+"px " + height/3 + "px")
        .css("background-position", offsetX * width / 3 + "px " + offsetY *height / 3 + "px")
        .css("-o-transform","rotate("+rotateDeg+"deg)")
        .css("-moz-transform","rotate("+rotateDeg+"deg)")
        .css("-webkit-transform","rotate("+rotateDeg+"deg)")
        .css("-ms-transform","rotate("+rotateDeg+"deg)")
        .css("transform","rotate("+rotateDeg+"deg)")
        .css("-webkit-filter","invert("+invert*100+"%)")
        .css("filter","invert("+invert*100+"%)");

    
    var _transparency = $("#_transparency").dancingSlider("value")/100;    
    var _repeatX = $("#_repeatX").dancingSlider("value");
    var _repeatY = $("#_repeatY").dancingSlider("value");
    var _rotateDeg = $("#_rotate").dancingSlider("value");
    var _offsetX = $("#_offsetX").dancingSlider("value") / 100;
    var _offsetY = $("#_offsetY").dancingSlider("value") / 100;
    var _invert = $("#_invert").dancingSlider("value") / 100; 
    var rotate = radians(_rotateDeg);
    
    var s = Math.sin(rotate);
    var c = Math.cos(rotate);
    rotate = mat3(
            vec3(c, s, 0),
            vec3(-s, c, 0),
            vec3(0, 0, 1)      
        );
    var _transCoor = mat3(
            vec3(_repeatX,   0,          _offsetX),
            vec3(0,         _repeatY,    _offsetY),
            vec3(0,         0,          1       )   
        );
    _transCoor = mult(rotate,_transCoor);
    
    var mask = $("#mask");
    var _width = mask.width() / _repeatX;
    var _height = mask.height() / _repeatY;

    
    gl.uniform1f(loc__transparency, _transparency);
    gl.uniform1f(loc__invert, _invert);
    gl.uniformMatrix3fv(loc__transCoor, false, flatten(_transCoor));
    
    mask.css("opacity",1-_transparency)
            .css("background-size", _width/3+"px " + _height/3 + "px")
            .css("background-position", _offsetX * _width / 3 + "px " + _offsetY * _height / 3 + "px")
            .css("-o-transform","rotate("+_rotateDeg+"deg)")
            .css("-moz-transform","rotate("+_rotateDeg+"deg)")
            .css("-webkit-transform","rotate("+_rotateDeg+"deg)")
            .css("-ms-transform","rotate("+_rotateDeg+"deg)")
            .css("transform","rotate("+_rotateDeg+"deg)")
            .css("-webkit-filter","invert("+_invert*100+"%)")
            .css("filter","invert("+_invert*100+"%)");
    
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
    updateTexture();
    requestAnimFrame(render);
}


