//Genère le fichier Json dans le 'div' précedemment vide
var a = document.getElementById("download");
a.onclick = function() {
    //variables pour les champs fixent
    var name = document.getElementById('nom').value;
    var verbose = $("#verbose").is(":checked");
    var led = $("#led").is(":checked");
    var watchdog = $("#watchdog").is(":checked");
    var debugSerial = $("#debug").is(":checked");

    var type = document.getElementById('typenet').value;
    var devEUI = document.getElementById('deveui').value;
    var appEUI = document.getElementById('appeui').value;
    var appKey = document.getElementById('appkey').value;
    var periodSec = parseInt(document.getElementById('periodsec').value);
    var dataRate = parseInt(document.getElementById('datarate').value);
    var useAdaptativeDataRate = $("adaptData").is(":checked");

    var syncGPS = $("syncGPS").is(":checked");
    var syncGPSTimeoutSec = parseInt(document.getElementById('timeout').value);
    var syncPeriodSec = parseInt(document.getElementById('syncperiodsec').value);
    //récupère la date en entié puis la sépare
    var date = document.getElementById('datePicker').value.split('-');
    var year = parseInt(date[0]);
    if(isNaN(year)) year=0;

    var month = parseInt(date[1]);
    if(isNaN(month)) month=0;

    var day = parseInt(date[2]);
    if(isNaN(day)) day=0;

    //récupère le moment exact puis le sépare
    var moment = document.getElementById("settime").value.split(':');
    var hours = parseInt(moment[0]);
    if(isNaN(hours)) hours=0;

    var minutes = parseInt(moment[1]);
    if(isNaN(minutes)) minutes=0;

    var seconds = parseInt(moment[2]);
    if(isNaN(seconds)) seconds=0;

    //Section de vérification
    var imperatif = document.getElementsByClassName("imp");

    for(var i=0; i<imperatif.length; i++){
        var pere = $(imperatif[i]).parent().parent();
        var pereclass = $(pere).find(':input').attr('class');
        var aVerifier = translateName($(pere).find(':input').val());

        $(pere).css('background-color', 'rgb(255, 255, 255)');
        $(pere).css('color', 'black');

        if(pereclass == undefined || pereclass == "more15"){
            if($(pere).parent().css('display') != 'none' && (aVerifier == '' || aVerifier == undefined)){
                return Alert("Un champ n'est pas remplis", pere);
            }
            else if(aVerifier.length > 15 && pereclass != "more15"){
                return Alert("Un champ est trop long (15 caractères maximum)", pere);
            }
        }
        else if(pereclass.split(' ')[0] == "hexa"){
            if(/^[a-fA-F0-9]+$/.test(aVerifier) == false){
                return Alert("Ce champ doit être en hexadecimal", pere);
            }
            else if(pereclass.split(' ')[1] == 'h8' && aVerifier.length != 16){
                return Alert("Cet identifiant n'est pas valide (trop court ou trop long)", pere);
            }
            else if(pereclass.split(' ')[1] == 'h16' && aVerifier.length != 32){
                return Alert("Cet identifiant n'est pas valide (trop court ou trop long)", pere);
            }
        }
    }

    var INTs = document.getElementsByClassName("INT");
    var ints = [];

    for(var i=0; i<INTs.length; i++){

        $($(INTs[i]).parent()).css('background-color', 'rgb(255, 255, 255)');
        $($(INTs[i]).parent()).css('color', 'black');

        var val = $(INTs[i]).val();
        if(val != undefined && val != ''){
            for(var j=0; j<val.length; j++){
                ints.push(val[j]);
            }
        }
        else{
            return Alert("Ce champ ne peut être vide", $(INTs[i]).parent());
        }
    }
/*
    var imperatifInt = document.getElementsByClassName("impInt");

    for(var i=0; i<imperatifInt.length; i++){
        
        $($(imperatifInt[i]).parent()).css('background-color', 'rgb(255, 255, 255)');
        $($(imperatifInt[i]).parent()).css('color', 'black');

        var val = $(imperatifInt[i]).val();
        if(val != undefined && val != ''){
            for(var j=0; j<val.length; j++){
                if($.inArray(val[j], ints) == -1){
                    return Alert("<b>"+val[j]+" </b> n'est pas renseigné dans la liste d'intérruption", $(imperatifInt[i]).parent());
                }
            }
        }
    }
*/
    //Fin de la vérification


    var obj = {"name": name, 
                "verbose": verbose,
                "led": led,
                "watchdog": watchdog,
                "debugSerial": debugSerial,
                "network": {
                    "type": type,
                    "devEUI": devEUI,
                    "appEUI": appEUI,
                    "appKey": appKey,
                    "periodSec": periodSec,
                    "dataRate": dataRate,
                    "useAdaptativeDataRate": useAdaptativeDataRate
                },
                "time": {
                    "syncGPS": syncGPS,
                    "syncGPSTimeoutSec": syncGPSTimeoutSec,
                    "syncPeriodSec": syncPeriodSec,
                    "manualUTC": {
                        "year": year,
                        "month": month,
                        "day": day,
                        "hours": hours,
                        "minutes": minutes,
                        "seconds": seconds
                    }
                }
            };

    //Remplis la liste d'interuption
    var inters = document.getElementsByClassName("interupt");
    if(inters.length>0){
        obj["interruptions"] = [];
        for(var i=0; i<inters.length; i++){
            var intname = $(inters[i]).find('#intname').val();
            var intdeb = parseInt($(inters[i]).find('#intdeb').val());

            if(intname.length < 2){
                intname = translateName(intname);
                obj["interruptions"].push({"name": intname, "debounceMs": intdeb});
            }
            else{
                var tempobj = [];
                for(var j=0; j<intname.length; j++){
                    var real = translateName(intname[j]);
                    tempobj.push(real);
                }
                obj["interruptions"].push({"names": tempobj, "debounceMs": intdeb});
            }
        }
    }

    //Remplis les sensors
    var sens = document.getElementsByClassName("sens");
    if(sens.length>0){
        obj["sensors"] = [];
        for(var i=0; i<sens.length; i++){
            var sensname = $(sens[i]).find('#sensname').val();
            var senstype = translateName($(sens[i]).find('#senstype').val());
            var sensperiod = parseInt($(sens[i]).find('#sensperiod').val());
            var sensint = $(sens[i]).find('#sensint').val();
            var senssend = $(sens[i]).find('#senssend').is(":checked");
            var sensalarm = $(sens[i]).find('#sensalarm').is(":checked"); 
            
            if(senstype == "RainGaugeContact"){
                var senstickint = translateName($(sens[i]).find("#tickInterrupt").val());
                var senstickdeb = $(sens[i]).find("#tickDebounceMs").val();
                var sensrainpertick = parseInt($(sens[i]).find('#rainMMPerTick').val());

                var tempobj = {"name": sensname,
                                "type": senstype,
                                "periodSec": sensperiod,
                                "tickInterrupt": senstickint,
                                "tickDebounceMs": senstickdeb,
                                "rainMMPerTick": sensrainpertick,
                                "sendOnInterrupt": senssend
                                };
            }
            else{
                var tempobj = {"name": sensname,
                                "type": senstype,
                                "periodSec": sensperiod,
                                "sendOnInterrupt": senssend
                                };
            }
            
            if(sensalarm){
                var alarmset = $(sens[i]).find('#alarmset').is(":checked");
                var alarmcleared = $(sens[i]).find('#alarmcleared').is(":checked");

                tempobj["alarm"] = {"sendOnAlarmSet": alarmset,
                                    "sendOnAlarmCleared": alarmcleared
                                    };

                if(senstype == "SHT35"){
                    var humhighset = parseInt($(sens[i]).find('#humidityHighSetPercent').val());
                    var humhighclear = parseInt($(sens[i]).find('#humidityHighClearPercent').val());
                    var humlowset = parseInt($(sens[i]).find('#humidityLowSetPercent').val());
                    var humlowclear = parseInt($(sens[i]).find('#humidityLowClearPercent').val());

                    var temphighset = parseInt($(sens[i]).find('#temperatureHighSetDegC').val());
                    var temphighclear = parseInt($(sens[i]).find('#temperatureHighClearDegC').val());
                    var templowset = parseInt($(sens[i]).find('#temperatureLowSetDegC').val());
                    var templowclear = parseInt($(sens[i]).find('#temperatureLowClearDegC').val());

                    tempobj["alarm"].humidityHighSetPercent = humhighset;
                    tempobj["alarm"].humidityHighClearPercent = humhighclear;
                    tempobj["alarm"].humidityLowSetPercent = humlowset;
                    tempobj["alarm"].humidityLowClearPercent = humlowclear;

                    tempobj["alarm"].temperatureHighSetDegC = temphighset;
                    tempobj["alarm"].temperatureHighClearDegC = temphighclear;
                    tempobj["alarm"].temperatureLowSetDegC = templowset;
                    tempobj["alarm"].temperatureLowClearDegC = templowclear;
                }
                else if(senstype == "LPS25"){
                    var presshigh = parseInt($(sens[i]).find('#highThresholdHPa').val());
                    var presslow = parseInt($(sens[i]).find('#lowThresholdHPa').val());

                    tempobj["alarm"].highThresholdHPa = presshigh;
                    tempobj["alarm"].lowThresholdHPa = presslow;
                }
                else if(senstype == "OPT3001"){
                    var lumhigh = parseInt($(sens[i]).find('#highLimitLux').val());
                    var lumlow = parseInt($(sens[i]).find('#lowLimitLux').val());

                    tempobj["alarm"].highLimitLux = lumhigh;
                    tempobj["alarm"].lowLimitLux = lumlow;
                }
                else if(senstype == "LIS3DH"){
                    var detection = $(sens[i]).find('#motionDetection').is(":checked");

                    tempobj["alarm"].motionDetection = detection;
                }
                else if(senstype == "RainGaugeContact"){
                    var rainhigh = parseInt($(sens[i]).find('#thresholdSetMMPerMinute').val());
                    var rainlow = parseInt($(sens[i]).find('#thresholdClearMMPerMinute').val());

                    tempobj["alarm"].thresholdSetMMPerMinute = rainhigh;
                    tempobj["alarm"].thresholdClearMMPerMinute = rainlow;
                }
            }

            if(sensint.length > 0){
                if(sensint.length < 2){
                    tempobj["interruptChannel"] = translateName(sensint);
                }
                else{
                    var tempints = [];
                    for(var j=0; j<sensint.length; j++){
                        var tempreal = translateName(sensint[j]);
                        tempints.push(tempreal);
                    }
                    tempobj["interruptChannels"] = tempints;
                }
            }

            obj["sensors"].push(tempobj);
        }
    }

    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));

    $("#generatedLink").remove();
    $('<a id="generatedLink" href="data:' + data + '" download="config.json">Télécharger JSON</a>').appendTo('#container');
    //return false;
}