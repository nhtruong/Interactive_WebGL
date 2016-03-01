function setupTextureUI() {
    $("#transparency, #_transparency").dancingSlider({
        label: "Transparency",
        unit:"%",
        min: 0,
        max: 100,
        step: 0.5,
        range_values: [0, 90],
        focus_values: [0, 80],
        value: 0,
        flip_chance:0.3,
        precision: 1,
        danceFloor: true
    });
    
    $("#rotate, #_rotate").dancingSlider({
        label: "Rotate",
        unit:"deg",
        min: 0,
        max: 360,
        step: 0.5,
        value: 0,
        precision: 1,
        flip_chance:1,
        danceFloor: true
    });
    $("#repeatX, #_repeatX").dancingSlider({
        label: "Repeat X",
        unit:"times",
        min: 1,
        max: 10,
        step: 0.01,
        value: 1,
        range_values: [1, 8],
        focus_values: [2, 6],
        flip_chance:0.5,
        precision: 2,
        danceFloor: true
    });
    $("#repeatY, #_repeatY").dancingSlider({
        label: "Repeat Y",
        unit:"times",
        min: 1,
        max: 10,
        step: 0.01,
        value: 1,
        range_values: [1, 8],
        focus_values: [2, 6],
        flip_chance:0.5,
        precision: 2,
        danceFloor: true
    });
    $("#offsetX, #_offsetX").dancingSlider({
        label: "Offset X",
        
        unit: "%",
        min: 0,
        max: 100,
        step: 0.2,
        value: 0,
        precision: 1,
        flip_chance:1,
        danceFloor: true
    });
    $("#offsetY, #_offsetY").dancingSlider({
        label: "Offset Y",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.2,
        value: 0,
        precision: 1,
        flip_chance:1,
        danceFloor: true
    });
    
    
    $("#invert, #_invert").dancingSlider({
        label: "Inversion",
        unit: "%",
        min: 0,
        max: 100,
        step: 0.2,
        value: 0,
        precision: 1,
        flip_chance:1,
        danceFloor: true
    });
    
    $("#offsetX, #_offsetX , #offsetY, #_offsetY, #rotate, #_rotate").dancingSlider("enableCyclic");
    
    $("#texture select").change(function(){
        applyTexture($(this).val());
    }).change();
    
    $("#masking select").change(function(){
        applyMasking($(this).val());
    });
}

function configTexture(filename) {
    var shapes = ["Cylinder","Sphere","Cone","Box"];
    
    var transparency = 10;
    var invert = 0;
    var repeatX = 1;
    var repeatY = 1;
    var offsetX = 0;
    var offsetY = 0;
    var rotate = 0;
    
    var transparency_Speed = false;
    var repeatX_Speed = false;
    var repeatY_Speed = false;
    var offsetX_Speed = false;
    var offsetY_Speed = false;
    var rotate_Speed = false;
    
    
    if(filename === "Flag_Rainbow.png") {
        shapes = ["Cylinder","Sphere","Cone"];
        $("#masking select").val("Mask_Zebra.png").change();
        offsetY_Speed = 0.15;
    }else if( filename === "Pattern_BlackAndYellow.jpg") {
        shapes = ["Sphere"];
        $("#masking select").val("BW_Earth.jpg").change();
        transparency = 5;
        invert = 100;
        repeatX = 4;
        repeatY = 2;
        offsetX_Speed = 0.25;
    }else if( filename === "Earth_Satellite.jpg") {
        $("#masking select").val("Specular.png").change();
        shapes = ["Sphere"];
        transparency = 0;
        offsetX_Speed = 0.05;
    }else if( filename === "Pattern_FourColumns.jpg") {
        $("#masking select").val("BW_Hex.png").change();
        shapes = ["Sphere","Cone","Sphere","Cone","Cylinder"];
        offsetX_Speed = -0.7;
        offsetY_Speed = -0.6;
    }else if( filename === "GrayBricks.jpg") {
        $("#masking select").val("Masking_HexagonWire.jpg").change();
        shapes = ["Cylinder"];
        transparency = 10;
        repeatX = 3;
        offsetY_Speed = -0.6;
    }else if( filename === "SilverBricks.jpg") {
        $("#masking select").val("Pattern_BlackCells.jpg").change();
        shapes = ["Cylinder","Sphere"];
        repeatX = 2;
        repeatY = 2;
        transparency_Speed = 0.1;
    }else if( filename === "SoccerBall.jpg") {
        $("#masking select").val("Blank.jpg").change();
        shapes = ["Sphere"];
        transparency = 0;
        offsetX_Speed = 0.;
    }else if( filename === "Universe.png") {
        $("#masking select").val("Masking_Squares.jpg").change();
        shapes = ["Cone","Cone","Sphere"];
        transparency = 10;
        offsetX_Speed = -0.8;
    }else if( filename === "TriangleQuilts.jpg") {
       $("#masking select").val("Blank.jpg").change();
    }else if( filename === "Blank.jpg") {
       $("#masking select").val("BW_Mask.jpg").change();
       shapes = ["Cone","Cylinder","Sphere"];
       transparency = 0;
       invert = 100;
    }
    
    
    var len = shapes.length;
    var figs = $("div.figure");
    for(var i = 0; i < figs.length; i++) {
        var fig = $(figs[i]).data("custom-figSelector");
        var shape = shapes[i%len];
        fig.updateShape(shape);
        fig.panel.find("#scaleX, #scaleY, #scaleZ").dancingSlider("stopDancing");
        fig.panel.find("#scaleX, #scaleY, #scaleZ").dancingSlider("value",250);
            
    }
    
    
    $("#transparency, #repeatX, #repeatY, #offsetX, #offsetY, #rotate")
            .dancingSlider("stopDancing");
    if(transparency_Speed!==false) $("#transparency").dancingSlider("startDancing", transparency_Speed);
    if(repeatX_Speed!==false) $("#repeatX").dancingSlider("startDancing", repeatX_Speed);
    if(repeatY_Speed!==false) $("#repeatY").dancingSlider("startDancing", repeatY_Speed);
    if(offsetX_Speed!==false) $("#offsetX").dancingSlider("startDancing", offsetX_Speed);
    if(offsetY_Speed!==false) $("#offsetY").dancingSlider("startDancing", offsetY_Speed);
    if(rotate_Speed!==false) $("#rotate").dancingSlider("startDancing", rotate_Speed);
    
    
    $("#transparency").dancingSlider("value",transparency);
    $("#invert").dancingSlider("value",invert);
    $("#repeatX").dancingSlider("value",repeatX);
    $("#repeatY").dancingSlider("value",repeatY);
    $("#offsetX").dancingSlider("value",offsetX);
    $("#offsetY").dancingSlider("value",offsetY);
    $("#rotate").dancingSlider("value",rotate);
}

function configMasking(filename) {
    
    var transparency = 0;
    var invert = 0;
    var repeatX = 1;
    var repeatY = 1;
    var offsetX = 0;
    var offsetY = 0;
    var rotate = 0;
    
    var transparency_Speed = false;
    var repeatX_Speed = false;
    var repeatY_Speed = false;
    var offsetX_Speed = false;
    var offsetY_Speed = false;
    var rotate_Speed = false;
    
    
    if(filename === "Masking_SpiralDots.jpg") {
        transparency = 40;
        repeatX = 5;
        repeatY = 2;
        offsetY_Speed = 0.3;
    }else if( filename === "Mask_Zebra.png") {
       transparency = 70;
       rotate = 48;
       offsetX_Speed = 0.2;
    }else if( filename === "Masking_HexagonWire.jpg") {
       transparency = 40;
       repeatX = 5;
       repeatY = 2;
       transparency_Speed = 0.2;
    }else if( filename === "Masking_Quilt.jpg") {
       transparency = 20;
       repeatX = 2;
    }else if( filename === "Masking_Squares.jpg") {
       transparency = 60;
       repeatX = 2;
       offsetX_Speed = -0.5;
       offsetY_Speed= -0.4;
    }else if( filename === "Flag_Rainbow.png") {
       transparency = 10;
       invert = 100;
       rotate = 90;
    }else if( filename === "Pattern_BlackCells.jpg") {
       transparency = 20;
       repeatX = 2;
    }else if( filename === "BW_Hex.png") {
       repeatX = 3;
       repeatY = 2;
       offsetY = 50;
    }else if( filename === "SilverBricks.jpg") {
       transparency = 10;
    }
    else if( filename === "BW_Mask.jpg") {
       invert = 100;
       repeatX = 5;
       repeatY = 3;
       offsetY_Speed = 0.3;
    }
    else if( filename === "BW_Star.png") {
       repeatX = 6;
       repeatY = 3;
    }
    else if( filename === "Specular.png") {
       offsetX_Speed = 0.15;
       offsetY_Speed = 0.3;
       transparency = 35;
    }
    else if( filename === "BW_Earth.jpg") {
       invert = 100;
    }
    else if( filename === "") {
       
    }
    else if( filename === "") {
       
    }
    
    $("#_transparency, #_repeatX, #_repeatY, #_offsetX, #_offsetY, #_rotate")
            .dancingSlider("stopDancing");
    if(transparency_Speed!==false) $("#_transparency").dancingSlider("startDancing", transparency_Speed);
    if(repeatX_Speed!==false) $("#_repeatX").dancingSlider("startDancing", repeatX_Speed);
    if(repeatY_Speed!==false) $("#_repeatY").dancingSlider("startDancing", repeatY_Speed);
    if(offsetX_Speed!==false) $("#_offsetX").dancingSlider("startDancing", offsetX_Speed);
    if(offsetY_Speed!==false) $("#_offsetY").dancingSlider("startDancing", offsetY_Speed);
    if(rotate_Speed!==false) $("#_rotate").dancingSlider("startDancing", rotate_Speed);
    
    
    $("#_transparency").dancingSlider("value",transparency);
    $("#_invert").dancingSlider("value",invert);
    $("#_repeatX").dancingSlider("value",repeatX);
    $("#_repeatY").dancingSlider("value",repeatY);
    $("#_offsetX").dancingSlider("value",offsetX);
    $("#_offsetY").dancingSlider("value",offsetY);
    $("#_rotate").dancingSlider("value",rotate);
}