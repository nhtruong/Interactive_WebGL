

/* global gl */

var circleRes = 60; // Must be Even for Spheres;
var shiftAngle = 360 / circleRes;

function bufferVertices(vertices){
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
}
function makeCube(mesh){
    var vertices = [];
    var a = vec4(+0.5, +0.5, -0.5);
    var b = vec4(-0.5, +0.5, -0.5);
    var c = vec4(-0.5, -0.5, -0.5);
    var d = vec4(+0.5, -0.5, -0.5);
    var e = vec4(+0.5, +0.5, +0.5);
    var f = vec4(-0.5, +0.5, +0.5);
    var g = vec4(-0.5, -0.5, +0.5);
    var h = vec4(+0.5, -0.5, +0.5);
    
    if(mesh === undefined || mesh === false) {
        vertices = vertices.concat(makePolygon(b,c,d,a));
        vertices = vertices.concat(makePolygon(a,e,f,b));
        vertices = vertices.concat(makePolygon(f,e,h,g));
        vertices = vertices.concat(makePolygon(d,c,g,h));
        vertices = vertices.concat(makePolygon(b,f,g,c));
        vertices = vertices.concat(makePolygon(e,a,d,h));
    } else{
        vertices.push(a,b,b,c,c,d,d,a);
        vertices.push(e,f,f,g,g,h,h,e);
        vertices.push(a,e,b,f,c,g,d,h);
    }
    return vertices;
}
function makeCone(mesh){
    if(mesh === undefined) mesh = false;
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var vertices = [];
    var base = [];
    var tip = vec4(0, 0.5, 0);
    var center = vec4(0, -0.5, 0);
    var curr = vec4(0.5, -0.5, 0);
    var next = vec4();
    for(var i = 0; i < circleRes; i++, curr = next){
        next = mult(mat4(curr),shiftMat)[0];
        if(mesh){
            vertices.push(curr,tip,curr,center,curr,next);
        }else{
            vertices.push(curr,tip,next);
            base.push(curr);
        }
    }
    if(!mesh) vertices = vertices.concat(makePolygon(base));
    return vertices;
}
function makeCylinder(mesh){
    if(mesh === undefined) mesh = false;
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var vertices = [];
    var base = [];
    var ceil = [];
    var centerTop = vec4(0, +0.5, 0);
    var centerBot = vec4(0, -0.5, 0);
    var currBot = vec4(0.5, -0.5, 0);
    var currTop = vec4(0.5, +0.5, 0);
    var nextBot, nextTop;
    for(var i = 0; i < circleRes; i++, currBot = nextBot, currTop = nextTop){
        nextBot = mult(mat4(currBot),shiftMat)[0];
        nextTop = mult(mat4(currTop),shiftMat)[0];
        if(mesh){
            vertices.push(currBot,nextBot,currTop,nextTop,currBot,currTop);
            vertices.push(currBot, centerBot, currTop, centerTop);
        }else{
            vertices.push(currBot,currTop,nextBot);
            vertices.push(currTop,nextTop,nextBot);
            base.push(currBot);
            ceil.push(currTop);
        }
    }
    if(!mesh){ 
        vertices = vertices.concat(makePolygon(base));
        vertices = vertices.concat(makePolygon(ceil));
    }
    return vertices;
}
function makeSphere(mesh){
    if(mesh === undefined) mesh = false;
    var shiftMatZ = rotate(shiftAngle,vec4(0,0,1000000));
    var shiftMatY = rotate(shiftAngle,vec4(0,1000000,0));
    var vertices = [];
    var currArc = []; 
    var nextArc = [];
    var curr = vec4(0, 0.5, 0);
    var next = vec4();
    
    currArc.push(curr);
    for(var i = 0; i < circleRes / 2; i++, curr = next){
        next = mult(mat4(curr),shiftMatZ)[0];
        currArc.push(next);
    }
    
    for(var i = 0; i < circleRes; i++, currArc = nextArc){
        nextArc = [];
        for(var j = 0; j < currArc.length; j++, curr = next) {
            curr = currArc[j];
            next = mult(mat4(curr),shiftMatY)[0];
            nextArc.push(next);
            if(mesh){ 
                vertices.push(curr,next);
                if(j !== 0) vertices.push(nextArc[j],nextArc[j-1]);
            };
            if(mesh) continue;
            if(j === 1)
                vertices.push(currArc[0],next,curr);
            else if(j === currArc.length - 1)
                vertices.push(currArc[j-1],nextArc[j-1],next);
            else if( j > 1 && j < currArc.length - 1 ){
                vertices.push(currArc[j-1],nextArc[j-1],currArc[j]);
                vertices.push(currArc[j],nextArc[j-1],nextArc[j]);
            }
        }
    }
    return vertices;
}
function Solid2Mesh(vertices) {
    var result = [];
    for(var i = 0; i < vertices.length-2; i+=3){
        result.push(
                vertices[i],vertices[i+1],
                vertices[i+1],vertices[i+2],
                vertices[i+2],vertices[i]);
    }
    return result;
}
function makePolygon(){
    if(arguments.length === 1)
        arguments = arguments[0];
    else
        arguments = Array.prototype.slice.call(arguments);
    var vertices = [];
    var pivot = arguments.shift();
    for(var i = 0; i < arguments.length - 1; i++)
        vertices.push(pivot,arguments[i],arguments[i+1]);
    return vertices;
}
function multi_multi(){
    arguments = Array.prototype.slice.call(arguments);
    var mat = mat4();
    for(var i = 0; i < arguments.length; i++)
        mat = mult(mat,arguments[i]);
    return mat;
}
function log(msg){
    console.log(msg);
}