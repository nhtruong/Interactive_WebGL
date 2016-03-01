
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
                        return;
                    }
                    $("button.selected").removeClass("selected");
                    $(this).addClass("selected");
                    selected = self;
                    self.showPanel();
                });
        this.deleter = $("<button>").addClass("deleter")
                .button({icons: {primary: "ui-icon-trash"},text: false})
                .click(function(){self.options.delete();
                    self.element.slideUp(function(){
                        self.panel.slideUp(function(){$(this).remove();});
                        self.element.figSelector("destroy").remove();
                        ;});
                });
        this.element.addClass("figure")
                .hover(function(){hovered = self;},
                        function(){hovered = undefined;})
                .append(this.aniToggle,this.selector,this.deleter);
        
        this.setupPanel();
        this.updateShape();
    },
    solid: function(){
        if(this === selected) colorMode = 2;
        else if(this === hovered) colorMode = 4;
        else colorMode = 0;
        gl.uniform1i(loc_colorMode,colorMode);
        gl.uniformMatrix4fv(loc_transMat, false, flatten(this.transMat));
        gl.drawArrays(gl.TRIANGLES, 0, this.solidNodesCount);
        return this;
    },
    mesh: function(){
        if(this === selected) colorMode = 3;
        else if(this === hovered) colorMode = 5;
        else colorMode = 1;
        gl.uniform1i(loc_colorMode,colorMode);
        gl.uniformMatrix4fv(loc_transMat, false, flatten(this.transMat));
        gl.drawArrays(gl.LINES, 0, this.meshNodesCount);
        return this;
    },
    updateTransMat: function(){
        var rotateX = this.panel.find("#rotateX").dancingSlider("value");
        var rotateY = this.panel.find("#rotateY").dancingSlider("value");
        var rotateZ = this.panel.find("#rotateZ").dancingSlider("value");
        var scaleX = this.panel.find("#scaleX").dancingSlider("value")/100;
        var scaleY = this.panel.find("#scaleY").dancingSlider("value")/100;
        var scaleZ = this.panel.find("#scaleZ").dancingSlider("value")/100;
        var translateX = this.panel.find("#translateX").dancingSlider("value")/50;
        var translateY = this.panel.find("#translateY").dancingSlider("value")/50;
        var translateZ = this.panel.find("#translateZ").dancingSlider("value")/50;
        
        this.transMat = multi_multi(viewMat
                ,translate(translateX,translateY,translateZ)
                ,rotate(rotateX,[1,0,0])
                ,rotate(rotateY,[0,1,0])
                ,rotate(rotateZ,[0,0,1])
                ,scalem(scaleX,scaleY,scaleZ)
        );
        return this;
    },
    updateShape: function(shape){
        if(shape === undefined) {
            var shapesCount = this.panel.find("#shape option").length;
            shape = this.panel.find("#shape option")[rand(0, shapesCount - 1, true)];
            shape = $(shape).attr("value");
            this.panel.find("#shape").val(shape);
        }
        this.shape = shape;
        this.selector.text(shape.toUpperCase());
        this.solidNodesCount = shapes[shape].solid.length;
        this.meshNodesCount = shapes[shape].mesh.length;
        this.panel.find("#shape").val(shape);
        return this;
    },
    setupPanel: function(){
        var self = this;
        this.panel = $("<div></div>").addClass("panel");
        $("#left-panel").append(this.panel);
        addSlider2Div(this.panel,"rotateX",{
            label:"Rotate X",
            unit:"deg",
            step:0.2,
            min:-180,
            max:180,
            danceFloor:true,
            flip_chance:0.9,
            speed_scale: rand(-0.5,0.2),
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
            speed_scale:rand(-0.5,0.2),
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
            speed_scale:rand(-0.5,0.2),
            precision: 0
        },true);
        this.panel.append("<br/>");
        addSlider2Div(this.panel,"scaleX",{
            label:"Scale X",
            unit:"%",
            step:0.5,
            min:1,
            max:300,
            danceFloor:true,
            range_values: [10,300],
            focus_values: [100,250],
            flip_chance:0.5,
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
            range_values: [10,300],
            focus_values: [100,250],
            flip_chance:0.5,
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
            range_values: [10,300],
            focus_values: [100,250],
            flip_chance:0.5,
            speed_scale:rand(-0.7,0.1),
            precision: 0
        },true);
        this.panel.append("<br/>");
        addSlider2Div(this.panel,"translateX",{
            label:"Translate X",
            unit:"",
            step:0.1,
            min:-300,
            max:300,
            danceFloor:true,
            range_values: [-290,290],
            focus_values: [-275,275],
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
            focus_values: [-175,175],
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
        
        $("<select></select>").attr("id","shape")
                .append("<option value='box'>Box</option>")
                .append("<option value='cone'>Cone</option>")
                .append("<option value='cylinder'>Cylinder</option>")
                .append("<option value='sphere'>Sphere</option>")
                .change(function(){self.updateShape($(this).val());})
                .prependTo(this.panel);
        
        this.panel.hide();
        this.showPanel();
    },
    showPanel: function(){
        $(".panel").not(this.panel).slideUp(800);
        this.panel.slideDown(800);
    }
});