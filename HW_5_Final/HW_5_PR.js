/* global gl */

function makeCube(){
    var shapeData = {solid:[], normals:[], mesh:[], coordinates:[]
    , normalType:"centric"};
    var a = vec4(+0.5, +0.5, +0.5);
    var b = vec4(+0.5, -0.5, +0.5);
    var c = vec4(-0.5, -0.5, +0.5);
    var d = vec4(-0.5, +0.5, +0.5);
    
    var e = vec4(+0.5, +0.5, -0.5);
    var f = vec4(+0.5, -0.5, -0.5);
    var g = vec4(-0.5, -0.5, -0.5);
    var h = vec4(-0.5, +0.5, -0.5);
    
    var TR = [1,1];
    var BR = [1,0];
    var TL = [0,1];
    var BL = [0,0];
    
            
    
    makePolygon(shapeData, a, b, c, d);
    shapeData.coordinates.push(TR, BR, BL);
    shapeData.coordinates.push(TR, BL, TL);
    
    makePolygon(shapeData, a, e, f, b);
    shapeData.coordinates.push(TR, TL, BL);
    shapeData.coordinates.push(TR, BL, BR);
    
    makePolygon(shapeData, b, f, g, c);
    shapeData.coordinates.push(BR, TR, TL);
    shapeData.coordinates.push(BR, TL, BL);
    
    
    makePolygon(shapeData, c, g, h, d);
    shapeData.coordinates.push(BL, BR, TR);
    shapeData.coordinates.push(BL, TR, TL);
    
    makePolygon(shapeData, d, h, e, a);
    shapeData.coordinates.push(TL, BL, BR);
    shapeData.coordinates.push(TL, BR, TR);
    
    
    makePolygon(shapeData, h, g, f, e);
    shapeData.coordinates.push(TR, BR, BL);
    shapeData.coordinates.push(TR, BL, TL);
    
    return shapeData;
}
function makeCone(){
    var shapeData = {solid:[], normals:[], mesh:[], coordinates:[]
        , normalType: " "};
    var circleRes = 100; 
    var shiftAngle = 360 / circleRes;
    
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var tip = vec4(0, 0.5, 0);
    var center = vec4(0, -0.5, 0);
    var curr = vec4(0.5, -0.5, 0);
    var next;
    
    var chopRatio = 1/100;
    var shiftX = 1 / circleRes;
    var currChop = vec4(0.5 * chopRatio, 0.5 - 1 * chopRatio, 0);
    var chopY = chopRatio;
    var currX = 1   ;
    var nextChop, nextX;
    
    for(var i = 0; i < circleRes; i++, curr = next, currChop = nextChop, currX = nextX){
        next = mult(mat4(curr),shiftMat)[0];
        nextChop = mult(mat4(currChop),shiftMat)[0];
        nextX = currX - shiftX;
        makePolygon(shapeData, currChop,tip,nextChop);
        shapeData.coordinates.push([currX,chopY], [currX-shiftX/2,0], [nextX,chopY]);
        
        makePolygon(shapeData, curr, currChop, next);
        shapeData.coordinates.push([currX,1], [currX,chopY], [nextX,1]);
        
        makePolygon(shapeData, currChop, nextChop, next);
        shapeData.coordinates.push([currX,chopY], [nextX,chopY], [nextX,1]);
        
        makePolygon(shapeData, curr,next,center);
        shapeData.coordinates.push([currX,1], [nextX,1], [currX-shiftX/2,0]);
    }
    return shapeData;
}
function makeCylinder(){
    var shapeData = {solid:[], normals:[], mesh:[], coordinates:[]
        , normalType: " "};
    var circleRes = 128; 
    var shiftAngle = 360 / circleRes ;
    var shiftMat = rotate(shiftAngle,vec4(0,1000000,0));
    var centerTop = vec4(0, +0.5, 0);
    var centerBot = vec4(0, -0.5, 0);
    var currBot = vec4(0.5, -0.5, 0);
    var currTop = vec4(0.5, +0.5, 0);
    var nextBot, nextTop;
    
    var shiftCoor = 1/circleRes;
    var currCoor = 0;
    var nextCoor;
    var top = 1, bot = 0;
    
    for(var i = 0; i < circleRes; i++, currBot = nextBot, currTop = nextTop, currCoor = nextCoor){
        nextBot = mult(mat4(currBot), shiftMat)[0];
        nextTop = mult(mat4(currTop), shiftMat)[0];
        nextCoor = currCoor + shiftCoor;
        makePolygon(shapeData, currBot, currTop, nextBot);
        makePolygon(shapeData, currTop, nextTop, nextBot);
        makePolygon(shapeData, currBot, nextBot, centerBot);
        makePolygon(shapeData, currTop, centerTop, nextTop);
        
        shapeData.coordinates.push([currCoor,bot], [currCoor,top], [nextCoor,bot]);
        shapeData.coordinates.push([currCoor,top], [nextCoor,top], [nextCoor,bot]);
        shapeData.coordinates.push([currCoor,bot], [nextCoor,bot], [currCoor+shiftCoor/2,1]);
        shapeData.coordinates.push([currCoor,top], [currCoor+shiftCoor/2,0], [nextCoor,top]);
    }
    return shapeData;
}
function makeSphere(){
    var shapeData = {solid:[], normals:[], mesh:[], coordinates:[]
        , normalType: "centric"};
    var circleRes = 40; 
    var shiftAngle = 360 / circleRes;
    
    var shiftMatZ = rotate(shiftAngle,vec4(0,0,1000000));
    var shiftMatY = rotate(shiftAngle,vec4(0,1000000,0));
    var currArc = []; 
    var nextArc = [];
    var curr = vec4(0, -0.5, 0);
    var next = vec4();
    
    var shiftX = 1/circleRes;
    var shiftY = 1/(circleRes/2);
    var currX = 0;
    var currY = 0;
    var nextX, nextY;
    
    currArc.push(curr);
    for(var i = 0; i < circleRes / 2; i++, curr = next){
        next = mult(mat4(curr),shiftMatZ)[0];
        currArc.push(next);
    }
    
    for(var i = 0; i < circleRes ; i++, currArc = nextArc, currX = nextX){
        nextArc = [];
        nextX = currX + shiftX;
        currY = -shiftY;
        for(var j = 0; j < circleRes / 2 + 1; j++, curr = next, currY = nextY) {
            curr = currArc[j];
            next = mult(mat4(curr),shiftMatY)[0];
            nextArc.push(next);
            nextY = currY + shiftY;
            if(j === 1){
                makePolygon(shapeData, currArc[0], next, curr);
                shapeData.coordinates.push([currX+0.5*shiftX,currY], [nextX,nextY], [currX,nextY]);
            }
            else if(j === currArc.length - 1){
                makePolygon(shapeData, currArc[j-1], nextArc[j-1], next);
                shapeData.coordinates.push([currX,currY], [nextX,currY], [currX+0.5*shiftX,nextY]);
            }
            else if( j > 1 && j < currArc.length - 1 ){
                makePolygon(shapeData, currArc[j-1], nextArc[j-1], curr);
                shapeData.coordinates.push([currX,currY], [nextX,currY], [currX,nextY]);
                
                makePolygon(shapeData, curr, nextArc[j-1], next);
                shapeData.coordinates.push([currX,nextY], [nextX,currY], [nextX,nextY]);
            }
        }
    }
    
    return shapeData;
}





function planeNormal(a,b,c) {
    var t1 = subtract(b, c);
    var t2 = subtract(a, c);
    var n = cross(t2, t1);
    return vec4(n[0],n[1],n[2],0);
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