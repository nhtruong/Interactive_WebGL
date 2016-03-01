
function rand(from,to,whole){
    result = Math.random() * (to-from) + from;
    if(whole === true)
        result = Math.round(result);
    return result;
}

$.widget("custom.dancingSlider", {
    options:{
        label: "Label:",
        labelColor: "black",
        labelWeight: "bold",
        margin_top: "5",
        unit: "",
        
        range: false,
        min: 0,
        max: 100,
        step: 1,
        
        danceFloor: false,
        flip_prob: 0.5
    },
    _create: function(){
        var self = this;
        if(this.options.value === undefined) {
            this.options.value = rand(this.options.min,this.options.max);
        }
        if(this.options.precision === undefined)
            this.options.precision = this.options.step < 1  
                ? Math.abs(Math.floor(Math.log10(this.options.step)))
                : this.options.precision = 0;
        this.element.addClass('ds_wrapper')
                .prepend($("<div class='ds_cushion'>&nbsp</div>"));
        this.label = $("<div class='ds_label'></div>")
                .css("color",this.options.labelColor)
                .css("font-weight",this.options.labelWeight)
                .html(this.options.label);
        this.text = $("<input class='ds_text' type='text'/>").change(function(event,ui){
            self.value($(this).val());
        }).keydown(function(event){
            if(event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
                //var step = (self.options.max - self.options.min) / 1000;
                //step = Math.ceil(step/self.options.step) * self.options.step;
                var step = self.options.step;
                if(event.keyCode === 40) 
                    self.value(Number($(this).val())-step);
                else 
                    self.value(Number($(this).val())+step);
            }
        }).click(function(event){
            event.preventDefault();
            $(this).select();
        });
        this.unit = $("<span class='ds_unit'></span>").html(this.options.unit);
        this.slider = $("<div class='ds_slider'></div>").slider({
            range: this.options.range,
            min: this.options.min,
            max: this.options.max,
            value: this.options.value,
            step: this.options.step,
            slide: function(event,ui){
               self.value(ui.value);
            }
        });
        
        this.meter = $("<div class='ds_meter'></div>").append(this.text,this.unit);
        this.element
            .append($("<div></div>").append(this.label,this.meter))
            .append($("<div style='clear:both;'></div>"))
            .append($("<div></div>").append(this.slider))
            .append($("<div style='clear:both;'></div>"));
        
        
        if(this.options.danceFloor)
            this.setupDanceFloor();
        else
            this.element.css("margin-top",this.options.margin_top +"px");
        self.updateLayout();
        self.updateMeter();
    },
    value: function(value,updateText){
        if ( value === undefined ) return this.options.value;
        if(isNaN(value)) return false;
        value = this.options.step < 1 ? Number(value) : Math.round(Number(value));
        if(value > this.options.max) value = this.options.max;
        if(value < this.options.min) value = this.options.min;
        this.options.value = value;
        this.updateMeter();
    },
    updateMeter: function(){
        var value = this.options.value.toFixed(this.options.precision);
        this.slider.slider('value',value);
        this.text.val(value);
    },
    updateLayout: function(){
        var wrapper_width = this.element.width();
        var font_size = Math.floor(Math.pow(1.15,wrapper_width / 100) * 10);
        this.element.find('.ds_slider').outerWidth(wrapper_width - 25);
        this.text.width(wrapper_width / 5).css('font-size',font_size+'px');
        this.element.css('font-size',font_size+'px');
    },
    setupDanceFloor: function(){
        var self = this;
        this.floor = $("<div class='ds_floor'></div>").appendTo(this.element).hide();
        this.floor_range = $("<div class='ds_slider'></div>").slider({
            range: true,
            min: this.options.min ,
            max: this.options.max ,
            step: this.options.step,
            values: this.options.range_values === undefined ? [this.options.min, this.options.max] : this.options.range_values,
            slide: function(event, ui){
                var center_values = self.floor_center.slider("values");
                if(ui.values[0] > center_values[0]) {
                    center_values[0] = ui.values[0];
                    if(ui.values[0] > center_values[1])
                        center_values[1] = ui.values[0];
                }
                if(ui.values[1] < center_values[1]) {
                    center_values[1] = ui.values[1];
                    if(ui.values[1] < center_values[0])
                        center_values[0] = ui.values[1];
                }
                self.floor_center.slider("values", center_values);
            },
            stop: function(){self.setupDance();}
        });
        this.floor_center = $("<div class='ds_slider'></div>").slider({
            range: true,
            min: this.options.min ,
            max: this.options.max ,
            step: this.options.step,
            values: this.options.focus_values === undefined ? [this.options.min, this.options.max] : this.options.focus_values,
            slide: function(event, ui){
                var range_values = self.floor_range.slider("values");
                if(ui.values[0] < range_values[0]) {
                    range_values[0] = ui.values[0];
                }
                if(ui.values[1] > range_values[1]) {
                    range_values[1] = ui.values[1];
                }
                self.floor_range.slider("values", range_values);
            },
            stop: function(){self.setupDance();}
        });
        this.floor_flip = $("<div class='ds_slider'></div>").slider({
            range: false,
            min: 0 ,
            max: 1,
            step: 0.01,
            value: this.options.flip_chance === undefined ? 0.75 : this.options.flip_chance,
            stop: function(){self.setupDance();}
        });
        this.floor_speed = $("<div class='ds_slider'></div>").slider({
            range: false,
            min: this.options.step >= 1 ? 0.5/this.options.step-0.99:-1 ,
            max: 1,
            step: 0.01,
            value: this.options.speed_scale === undefined ? 0 : this.options.speed_scale,
            slide: function(){self.setupDance();}
        });
        this.floor
            .append($("<div style='clear:both;height:0px;'>&nbsp</div>"))
            .append($("<div title='Animation Range'></div>").append(this.floor_range))
            .append($("<div style='clear:both;height:0px;'>&nbsp</div>"))
            .append($("<div title='Focus Range'></div>").append(this.floor_center))
            .append($("<div style='clear:both;height:0px;'>&nbsp</div>"))
            .append($("<div title='Focus Strength'></div>").append(this.floor_flip))
            .append($("<div style='clear:both;height:10px;'>&nbsp</div>"))
            .append($("<div title='Animation Speed'></div>").append(this.floor_speed))
            .append($("<div style='clear:both;height:10px;'>&nbsp</div>"));
        
        this.floor_control = $("<span class='ds_toggle' style='float:left;position:relative;bottom:3px;'/></span>")
                .button({text: false,label:"Animation Panel",icons: {primary: "ui-icon-circlesmall-plus"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "Animation Panel"){  
                        options = {label: "hide",icons: { primary: "ui-icon-circlesmall-minus"}};
                        self.floor.slideDown();
                        self.element.add(self.text).addClass('ds_show',400);
                        self.element.find(".ds_cushion").slideDown(400);
                    }else {  
                        options = {label: "Animation Panel",icons: {primary: "ui-icon-circlesmall-plus"}};
                        self.floor.slideUp();
                        self.element.add(self.text).removeClass('ds_show',400);
                        self.element.find(".ds_cushion").slideUp(400);
                    }
                    $(this).button( "option", options );
                    self.setupDance();
                    $(this).blur();
                }).insertAfter(this.label);
        
        this.floor_enabled = $("<button class='ds_toggle'/>")
                .button({text: false,label:"play",icons: {primary: "ui-icon-play"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "play")  options = {label: "pause",icons: { primary: "ui-icon-pause"}};
                    else                            options = {label: "play",icons: {primary: "ui-icon-play"}};
                    $(this).button( "option", options );
                    self.setupDance();
                }).insertAfter(this.slider);
        this.floor_cyclic = $("<button class='ds_toggle'/>")
                .button({text: false,label:"acyclic",icons: {primary: "ui-icon-transfer-e-w"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "cyclic")    options = {label: "acyclic",icons: { primary: "ui-icon-transfer-e-w"}};
                    else                                options = {label: "cyclic",icons: {primary: "ui-icon-refresh"}};
                    $(this).button( "option", options );
                    self.setupDance();
                }).insertAfter(this.floor_range);
        this.floor_focus = $("<button class='ds_toggle'/>")
                .button({text: false,label:"inner",icons: {primary: "ui-icon-bullet"}})
                .click(function () {
                    var options;
                    if ($(this).text() === "inner")    options = {label: "outer",icons: { primary: "ui-icon-radio-off"}};
                    else if($(this).text() === "outer") options = {label: "none",icons: {primary: "ui-icon-cancel"}};
                    else                                options = {label: "inner",icons: {primary: "ui-icon-bullet"}};
                    $(this).button( "option", options );
                    self.setupDance();
                }).insertAfter(this.floor_center);
        
        this.setupDance();
    },
    setupDance: function(){
        var speed = this.floor_speed.slider('value');
        if(speed === 0) speed = this.options.step;
        else if(speed < 0) speed = this.options.step * (1+speed);
        else if(speed > 0) speed = this.options.step * speed * 10;
        this.options.speed = speed;
        this.options.floor_min = this.floor_range.slider('values')[0];
        this.options.floor_max = this.floor_range.slider('values')[1];
        this.options.center_min = this.floor_center.slider('values')[0];
        this.options.center_max = this.floor_center.slider('values')[1];
        this.options.dancing = this.floor_enabled.text() === 'pause';
        this.options.cyclic = this.floor_cyclic.text() === 'cyclic';
        this.options.focus = this.floor_focus.text();
        this.options.changed = false;
        this.options.increment =  this.options.increment === undefined 
            ? (Math.random() > 0.5 ? this.options.speed : -this.options.speed) 
            : this.options.increment > 0 ? speed : -speed;
        this.direction();
    },
    startDancing: function(speed_scale){
      if(speed_scale !== undefined) this.floor_speed.slider('value',speed_scale) ;
      if(this.options.danceFloor === false) return;
      var options = {label: "pause",icons: { primary: "ui-icon-pause"}};
      this.floor_enabled.button( "option", options );
      this.setupDance();
    },
    stopDancing: function(){
      if(this.options.danceFloor === false) return;
      var options = {label: "play",icons: { primary: "ui-icon-play"}};
      this.floor_enabled.button( "option", options );
      this.setupDance();
    },
    enableCyclic: function(){
      var options = {label: "cyclic",icons: {primary: "ui-icon-refresh"}};
      this.floor_cyclic.button( "option", options );
      this.setupDance();
    },
    dance: function(){
        if(!this.options.dancing) return;
        this.options.increment = this.direction(this.options.changed);
        var val;
        val = this.options.value;
        var before = (val > this.options.center_min && val < this.options.center_max);
        this.value(val + this.options.increment);
        val = this.options.value;
        var after = (val > this.options.center_min && val < this.options.center_max);
        this.options.changed = this.options.changed ? false : before !== after;
        
    },
    direction: function(changed){
        changed = this.options.changed;
        var val = this.options.value;
        var speed = this.options.speed;
        var MAX = this.options.floor_max;
        var MIN = this.options.floor_min;
        var max = this.options.center_max;
        var min = this.options.center_min;
        var cyclic = this.options.cyclic;
        var focus = this.options.focus;
        var increment = this.options.increment;
        var flipped = Math.random() <= this.floor_flip.slider('value');
        
        if(val <= MIN){
            if(cyclic && flipped) {this.value(MAX); return -speed;}
            else return speed;}
        
        if(val >= MAX){
            if(cyclic && flipped) {this.value(MIN); return speed;}
            else return -speed;}
        
        if(!changed || !flipped) return increment;
        
        if(focus === 'inner'){
            if(val <= min) {return speed;}
            if(val >= max) {return -speed;}
        }
        
        if(focus === 'outer')
            return (val - min < max - val) ? -speed : speed;
        
        return increment;  
    }
});

function addSlider2Div(div,id,params,startDancing) {
    if(typeof div === "string") div = $("#"+div);
    var slider =  $("<div></div>").attr("id",id);
    div.append(slider);
    slider.dancingSlider(params);
    if(startDancing === true)
        slider.dancingSlider("startDancing");
}