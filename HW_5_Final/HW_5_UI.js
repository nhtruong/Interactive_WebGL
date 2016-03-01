/* global loc_colorMode, gl, loc_transMat, shapes, viewMat */
$.widget("custom.figSelector", {
    options:{
        label: "Figure",
        transMat: mat4(),
        select: function(){},
        delete: function(){}
    },
    _create: function(){
        var self = this;
        this.aniToggle = $("<button>").addClass("play_pause")
                .button({text:false, icons: {primary: "ui-icon-pause"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "Play") {
                        options = {label: "Pause", icons: {primary: "ui-icon-pause"}};
                        self.panel.find(".ds_wrapper").dancingSlider("startDancing");
                    } else {
                        options = {label: "Play", icons: {primary: "ui-icon-play"}};
                        self.panel.find(".ds_wrapper").dancingSlider("stopDancing");
                    }
                    $(this).button("option", options);
                });
        this.selector = $("<button>").addClass("selector")
                .text(this.options.label).button()
                .click(function(){self.options.select();
                    if(selected === self) {
                        selected = undefined;
                        $(this).removeClass("selected");
                        self.panel.fadeOut(500);
                        self.material.fadeOut(500);
                        return;
                    }
                    $("button.selected").removeClass("selected");
                    $(this).addClass("selected");
                    selected = self;
                    self.showPanels();
                });
        this.deleter = $("<button>").addClass("deleter")
                .button({icons: {primary: "ui-icon-trash"},text: false})
                .click(function(){self.options.delete();
                    self.element.slideUp(function(){
                        self.material.slideUp();
                        self.panel.slideUp(function(){$(this).remove();});
                        self.element.figSelector("destroy").remove();
                        ;});
                });
        this.element.addClass("figure")
                .hover(function(){hovered = self;},
                        function(){hovered = undefined;})
                .append(this.aniToggle,this.selector,this.deleter);
        
        this.setupTransformPanel();
        this.setupMaterialPanel();
        this.updateShape();
    },
    getTransMat: function(){
        var rotateX = this.panel.find("#rotateX").dancingSlider("value");
        var rotateY = this.panel.find("#rotateY").dancingSlider("value");
        var rotateZ = this.panel.find("#rotateZ").dancingSlider("value");
        var scaleX = this.panel.find("#scaleX").dancingSlider("value")/100;
        var scaleY = this.panel.find("#scaleY").dancingSlider("value")/100;
        var scaleZ = this.panel.find("#scaleZ").dancingSlider("value")/100;
        var translateX = this.panel.find("#translateX").dancingSlider("value")/50-0.5;
        var translateY = this.panel.find("#translateY").dancingSlider("value")/50;
        var translateZ = this.panel.find("#translateZ").dancingSlider("value")/50;
        
        return  multi_multi(
                translate(translateX,translateY,translateZ)
                ,rotate(rotateX,[1,0,0])
                ,rotate(rotateY,[0,1,0])
                ,rotate(rotateZ,[0,0,1])
                ,scalem(scaleX,scaleY,scaleZ)
        );
    },
    getMaterial: function(){
        var shininess = 100/this.material.find("#shininess").dancingSlider("value");
        
        var abimientR = this.material.find("#ambientR").dancingSlider("value")/100;
        var abimientG = this.material.find("#ambientG").dancingSlider("value")/100;
        var abimientB = this.material.find("#ambientB").dancingSlider("value")/100;
        
        var diffuseR = this.material.find("#diffuseR").dancingSlider("value")/100;
        var diffuseG = this.material.find("#diffuseG").dancingSlider("value")/100;
        var diffuseB = this.material.find("#diffuseB").dancingSlider("value")/100;
        
        var specularR = this.material.find("#specularR").dancingSlider("value")/100;
        var specularG = this.material.find("#specularG").dancingSlider("value")/100;
        var specularB = this.material.find("#specularB").dancingSlider("value")/100;
        
        ;
        var ambient = vec4(abimientR, abimientG, abimientB);
        var diffuse = vec4(diffuseR, diffuseG, diffuseB);
        var specular = vec4(specularR, specularG, specularB);
        
        return {shininess:shininess, ambient:ambient, diffuse:diffuse, specular:specular};
    },
    updateShape: function(shape){
        var shapeSel = this.material.find("#shape");
        var shapeOps = this.material.find("#shape option");
        if(shape === undefined) {
            var shapesCount = shapeOps.length;
            shape = shapeOps[rand(0, shapesCount - 1, true)];
            shape = $(shape).attr("value");
            shapeSel.val(shape);
        }
        this.shape = shape;
        this.selector.text(shape.toUpperCase());
        this.solidNodesCount = shapes[shape].solid.length;
        this.meshNodesCount = shapes[shape].mesh.length;
        shapeSel.val(shape);
        return this;
    },
    setupTransformPanel: function(){
        var self = this;
        this.panel = $("<div></div>").addClass("panel").appendTo("#div-rightParams");
        addSlider2Div(this.panel,"rotateX",{
            label:"Rotate X",
            unit:"deg",
            step:0.2,
            min:-180,
            max:180,
            danceFloor:true,
            flip_chance:0.9,
            speed_scale: rand(-0.6,0.0),
            precision: 0
        },true);
        addSlider2Div(this.panel,"rotateY",{
            label:"Rotate Y",
            unit:"deg",
            step:0.2,
            min:-180,
            max:180,
            danceFloor:true,
            flip_chance:0.9,
            speed_scale:rand(-0.9,0.0),
            precision: 0
        },true);
        addSlider2Div(this.panel,"rotateZ",{
            label:"Rotate Z",
            unit:"deg",
            step:0.2,
            min:-180,
            max:180,
            danceFloor:true,
            flip_chance:0.9,
            speed_scale:rand(-0.6,0.0),
            precision: 0
        },true);
        this.panel.append($("<div>").height(20));
        addSlider2Div(this.panel,"scaleX",{
            label:"Scale X",
            unit:"%",
            step:0.5,
            min:1,
            max:300,
            danceFloor:true,
            range_values: [90,300],
            focus_values: [150,250],
            flip_chance:0.2,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        addSlider2Div(this.panel,"scaleY",{
            label:"Scale Y",
            unit:"%",
            step:0.5,
            min:1,
            max:300,
            danceFloor:true,
            range_values: [90,300],
            focus_values: [150,250],
            flip_chance:0.2,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        addSlider2Div(this.panel,"scaleZ",{
            label:"Scale Z",
            unit:"%",
            step:0.5,
            min:1,
            max:300,
            danceFloor:true,
            range_values: [90,300],
            focus_values: [150,250],
            flip_chance:0.2,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        this.panel.append($("<div>").height(20));
        addSlider2Div(this.panel,"translateX",{
            label:"Translate X",
            unit:"",
            step:0.1,
            min:-250,
            max:250,
            danceFloor:true,
            range_values: [-250,250],
            focus_values: [-250,250],
            flip_chance:0.5,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        addSlider2Div(this.panel,"translateY",{
            label:"Translate Y",
            unit:"",
            step:0.1,
            min:-200,
            max:200,
            danceFloor:true,
            range_values: [-190,190],
            focus_values: [-150,150],
            flip_chance:0.5,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        addSlider2Div(this.panel,"translateZ",{
            label:"Translate Z",
            unit:"",
            step:0.1,
            min:-300,
            max:200,
            danceFloor:true,
            range_values: [-250,200],
            focus_values: [-200,175],
            flip_chance:0.4,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        
        this.panel.find("#rotateX, #rotateY, #rotateZ").dancingSlider("enableCyclic");
        
        
        this.panel.hide();
    },
    setupMaterialPanel: function(){
        var self = this;
        this.material = $("<div>").addClass("matPanel").appendTo("#div-leftParams");
        
        addSlider2Div(this.material,"shininess",{
            label:"Shininess",
            unit:"",
            step:0.1,
            min:1,
            max:10,
            value: rand[2,6],
            danceFloor:false,
            precision: 0
        },false);
        this.material.append($("<div>").height(20));
        addSlider2Div(this.material,"ambientR",{
            label:"Ambient R",
            unit:"%",
            labelColor: "#F72F2F",
            step:1,
            min:0,
            max:100,
            value: rand(0,70),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"ambientG",{
            label:"Ambient G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(0,70),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"ambientB",{
            label:"Ambient B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(0,70),
            danceFloor:false,
            precision: 0
        },false);
        this.material.append($("<div>").height(10));
        addSlider2Div(this.material,"diffuseR",{
            label:"Diffuse R",
            unit:"%",
            labelColor: "#F72F2F",
            step:1,
            min:0,
            max:100,
            value: rand(50,90),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"diffuseG",{
            label:"Diffuse G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(50,90),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"diffuseB",{
            label:"Diffuse B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(50,90),
            danceFloor:false,
            precision: 0
        },false);
        this.material.append($("<div>").height(10));
        addSlider2Div(this.material,"specularR",{
            label:"Specular R",
            labelColor: "#F72F2F",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(70,100),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"specularG",{
            label:"Specular G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(70,100),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.material,"specularB",{
            label:"Specular B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(70,100),
            danceFloor:false,
            precision: 0
        },false);
        
        
        var selectShapes = $("<select></select>").attr("id","shape")
                .change(function(){self.updateShape($(this).val());})
                .prependTo(this.material);
        for(var shape in shapes) 
            selectShapes.append($("<option>").text(shape).val(shape));
        
        this.material.hide();
    },
    showPanels: function(){
        $(".panel, .matPanel, .colPanel").not(this.material).slideUp(700);
        this.panel.slideDown(600);
        this.material.slideDown(600);
    }
});

$.widget("custom.lightSelector", {
    options:{
        label: "Light",
        transMat: mat4(),
        select: function(){},
        delete: function(){}
    },
    _create: function(){
        var self = this;
        this.aniToggle = $("<button>").addClass("play_pause")
                .button({text:false, icons: {primary: "ui-icon-pause"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "Play") {
                        options = {label: "Pause", icons: {primary: "ui-icon-pause"}};
                        self.panel.find(".ds_wrapper").dancingSlider("startDancing");
                    } else {
                        options = {label: "Play", icons: {primary: "ui-icon-play"}};
                        self.panel.find(".ds_wrapper").dancingSlider("stopDancing");
                    }
                    $(this).button("option", options);
                });
        this.selector = $("<button>").addClass("selector")
                .text(this.options.label).button()
                .click(function(){self.options.select();
                    if(selected === self) {
                        selected = undefined;
                        $(this).removeClass("selected");
                        self.panel.fadeOut(500);
                        self.colPanel.fadeOut(500);
                        return;
                    }
                    $("button.selected").removeClass("selected");
                    $(this).addClass("selected");
                    selected = self;
                    self.showPanels();
                });
        this.deleter = $("<button>").addClass("deleter")
                .button({icons: {primary: "ui-icon-trash"},text: false})
                .click(function(){self.options.delete();
                    self.element.slideUp(function(){
                        self.panel.slideUp(function(){$(this).remove();});
                        self.element.lightSelector("destroy").remove();
                        updateLightCount();
                        ;});
                });
        this.element.addClass("lightSource")
                .hover(function(){hoveredLight = self;},
                        function(){hoveredLight = undefined;})
                .append(this.aniToggle,this.selector,this.deleter);
        
        this.setupPositionPanel();
        this.setupColorPanel();
        
    },
    setupPositionPanel: function() {
        var self = this;
        this.panel = $("<div></div>").addClass("panel").appendTo("#div-rightParams");
        addSlider2Div(this.panel,"distance",{
            label:"Light Distance",
            unit:"",
            step:0.005,
            min:0,
            max:3,
            danceFloor:true,
            range_values: [0, 2.5],
            focus_values: [0.5, 1.5],
            flip_chance:0.5,
            precision: 2
        },true);
        addSlider2Div(this.panel,"positionX",{
            label:"Position X",
            unit:"",
            step:0.005,
            min:-2,
            max:2,
            danceFloor:true,
            flip_chance:0.9,
            precision: 2
        },true);
        addSlider2Div(this.panel,"positionY",{
            label:"Position Y",
            unit:"",
            step:0.005,
            min:-2,
            max:2,
            danceFloor:true,
            flip_chance:0.9,
            precision: 2
        },true);
        addSlider2Div(this.panel,"positionZ",{
            label:"Position Z",
            unit:"",
            step:0.005,
            min:-2,
            max:2,
            range_values: [-1, 2],
            focus_values: [-0.5, 2],
            danceFloor:true,
            flip_chance:0.75,
            precision: 2
        },true);
        this.panel.hide();
    },
    setupColorPanel: function(){
        var self = this;
        this.colPanel = $("<div></div>").addClass("colPanel").appendTo("#div-leftParams");
        
        this.colPanel.append($("<div>").height(5));
        addSlider2Div(this.colPanel,"ambientR",{
            label:"Light Ambient R",
            unit:"%",
            labelColor: "#F72F2F",
            step:1,
            min:0,
            max:100,
            value: rand(0,10),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"ambientG",{
            label:"Light Ambient G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(0,10),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"ambientB",{
            label:"Light Ambient B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(0,10),
            danceFloor:false,
            precision: 0
        },false);
        this.colPanel.append($("<div>").height(10));
        addSlider2Div(this.colPanel,"diffuseR",{
            label:"Light Diffuse R",
            unit:"%",
            labelColor: "#F72F2F",
            step:1,
            min:0,
            max:100,
            value: rand(5,30),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"diffuseG",{
            label:"Light Diffuse G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(5,30),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"diffuseB",{
            label:"Light Diffuse B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(5,30),
            danceFloor:false,
            precision: 0
        },false);
        this.colPanel.append($("<div>").height(10));
        addSlider2Div(this.colPanel,"specularR",{
            label:"Light Specular R",
            labelColor: "#F72F2F",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(50,70),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"specularG",{
            label:"Light Specular G",
            labelColor: "#00AF01",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(50,70),
            danceFloor:false,
            precision: 0
        },false);
        addSlider2Div(this.colPanel,"specularB",{
            label:"Light Specular B",
            labelColor: "#0079FF",
            unit:"%",
            step:1,
            min:0,
            max:100,
            value: rand(50,70),
            danceFloor:false,
            precision: 0
        },false);
        
        this.colPanel.hide();
    },
    getData: function(){
        
        var distance = this.panel.find("#distance").dancingSlider("value");
        var positionX = this.panel.find("#positionX").dancingSlider("value")*100;
        var positionY = this.panel.find("#positionY").dancingSlider("value")*100;
        var positionZ = this.panel.find("#positionZ").dancingSlider("value")*100;
        
        var abimientR = this.colPanel.find("#ambientR").dancingSlider("value")/100;
        var abimientG = this.colPanel.find("#ambientG").dancingSlider("value")/100;
        var abimientB = this.colPanel.find("#ambientB").dancingSlider("value")/100;
        
        var diffuseR = this.colPanel.find("#diffuseR").dancingSlider("value")/100;
        var diffuseG = this.colPanel.find("#diffuseG").dancingSlider("value")/100;
        var diffuseB = this.colPanel.find("#diffuseB").dancingSlider("value")/100;
        
        var specularR = this.colPanel.find("#specularR").dancingSlider("value")/100;
        var specularG = this.colPanel.find("#specularG").dancingSlider("value")/100;
        var specularB = this.colPanel.find("#specularB").dancingSlider("value")/100;
        
        
        var position = vec4(positionX*distance, positionY*distance, positionZ*distance, 1);
        var ambient = vec4(abimientR, abimientG, abimientB);
        var diffuse = vec4(diffuseR, diffuseG, diffuseB);
        var specular = vec4(specularR, specularG, specularB);
        
        return {position:position, ambient:ambient, diffuse:diffuse, specular:specular};
    },
    showPanels: function() {
        $(".panel, .matPanel, .colPanel").not(this.material).slideUp(700);
        this.panel.slideDown(600);
        this.colPanel.slideDown(600);
    }
});