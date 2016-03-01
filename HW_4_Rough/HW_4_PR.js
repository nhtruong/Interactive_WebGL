/* global gl */

function makeCube(){
    var shapeData = {solid:[], normals:[], mesh:[]};
    var a = vec4(+0.5, +0.5, -0.5);
    var b = vec4(-0.5, +0.5, -0.5);
    var c = vec4(-0.5, -0.5, -0.5);
    var d = vec4(+0.5, -0.5, -0.5);
    var e = vec4(+0.5, +0.5, +0.5);
    var f = vec4(-0.5, +0.5, +0.5);
    var g = vec4(-0.5, -0.5, +0.5);
    var h = vec4(+0.5, -0.5, +0.5);
    
    makePolygon(shapeData, b, c, d, a);
    makePolygon(shapeData, a, e, f, b);
    makePolygon(shapeData, f, e, h, g);
    makePolygon(shapeData, d, c, g, h);
    makePolygon(shapeData, b, f, g, c);
    makePolygon(shapeData, e, a, d, h);
    
    return shapeData;
}
function makeCone(){
    var shapeData = {solid:[], normals:[], mesh:[]
        , normalType: " "};
    var circleRes = 100; 
    var shiftAngle = 360 / circleRes;
    
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var tip = vec4(0, 0.5, 0);
    var center = vec4(0, -0.5, 0);
    var curr = vec4(0.5, -0.5, 0);
    var next = vec4();
    for(var i = 0; i < circleRes; i++, curr = next){
        next = mult(mat4(curr),shiftMat)[0];
        makePolygon(shapeData, curr,tip,next);
        makePolygon(shapeData, curr,next,center);
    }
    return shapeData;
}
function makeCylinder(){
    var shapeData = {solid:[], normals:[], mesh:[]
        , normalType: " "};
    var circleRes = 128; 
    var shiftAngle = 360 / circleRes;
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var centerTop = vec4(0, +0.5, 0);
    var centerBot = vec4(0, -0.5, 0);
    var currBot = vec4(0.5, -0.5, 0);
    var currTop = vec4(0.5, +0.5, 0);
    var nextBot, nextTop;
    for(var i = 0; i < circleRes; i++, currBot = nextBot, currTop = nextTop){
        nextBot = mult(mat4(currBot), shiftMat)[0];
        nextTop = mult(mat4(currTop), shiftMat)[0];
        makePolygon(shapeData, currBot, currTop, nextBot);
        makePolygon(shapeData, currTop, nextTop, nextBot);
        makePolygon(shapeData, currBot, nextBot, centerBot);
        makePolygon(shapeData, currTop, centerTop, nextTop);
    }
    return shapeData;
}
function makeSphere(){
    var shapeData = {solid:[], normals:[], mesh:[], normalType: "centric"};
    var circleRes = 50; 
    var shiftAngle = 360 / circleRes;
    
    var shiftMatZ = rotate(shiftAngle,vec4(0,0,1000000));
    var shiftMatY = rotate(shiftAngle,vec4(0,1000000,0));
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

            if(j === 1){
                makePolygon(shapeData, currArc[0], next, curr);
            }
            else if(j === currArc.length - 1){
                makePolygon(shapeData, currArc[j-1], nextArc[j-1], next);
            }
            else if( j > 1 && j < currArc.length - 1 ){
                makePolygon(shapeData, currArc[j-1], nextArc[j-1], currArc[j]);
                makePolygon(shapeData, currArc[j], nextArc[j-1], nextArc[j]);
            }
        }
    }
    
    return shapeData;
}





function planeNormal(a,b,c) {
    var t1 = subtract(b, c);
    var t2 = subtract(a, c);
    var n = cross(t2, t1);
    return normalize(vec4(n[0],n[1],n[2], 0),true);
}

function originNormal(a) {
    return normalize(vec4(a[0],a[1],a[2], 0),true);
}

function makeTriangle(shapeData, a, b, c, skipNormal){
   
    shapeData.solid.push(a, b, c);
    shapeData.mesh.push(a, b, b, c, c, a);
    
    if(skipNormal === true) return;
    var n;
    if(shapeData.normalType === "centric") {
        n = originNormal(a);
        shapeData.normals.push(n);
        n = originNormal(b);
        shapeData.normals.push(n);
        n = originNormal(c);
        shapeData.normals.push(n);
    } else {
        n = planeNormal(a,b,c);
        shapeData.normals.push(n, n, n);
    }
}
function makePolygon(shapeData){
    if(arguments.length < 4) return;
    
    arguments = Array.prototype.slice.call(arguments); // convert to array
    arguments.shift(); // remove shapeData from the array
    
    var pivot = arguments.shift();
    for(var i = 0; i < arguments.length - 1; i++) {
            makeTriangle(shapeData, pivot, arguments[i], arguments[i + 1]);
    }
}

function multi_multi(){
    arguments = Array.prototype.slice.call(arguments);
    var mat = mat4();
    for(var i = 0; i < arguments.length; i++)
        mat = mult(mat,arguments[i]);
    return mat;
}

function log(msg){
    //console.log(log.caller.name);
    console.log(msg);
}