/**
 * @module ModuleDetail
 */
var kennlinienOOid = 0;
var dummy_type_id = 0;
var kennlinien = [];
var active_kennlinie = [];
var active_kennlinie_index = 0;
var module_name = "";
var kennlinien_types = [];
var kennlinien_types_data = [];

//Gets the Dummy Type Id
$.ajax({
    method: "GET",
    url: '/SmartMonitoringBackend/observedobjecttype/getByName?name=Dummy ObservedObjectTypeTest'
}).always(function (msg) {
    dummy_type_id = msg.id;
});

 $(document).ready(function() {
    loadKennlinien();
 });
 
 /**
  * Returns the Dataset ID from the URL Search Parameters.
  * @param {String} param
  */
function getQueryParam(param) {
    urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
dataset = getQueryParam('id');

//Gets the module name
$.ajax({
    method: "GET",
    url: '/SmartMonitoringBackend/data/getSet?ooid=1&dataset=' + dataset 
}).always(function(msg) {
    module_name = msg.list[0].modul;
});

/**
 * After selecting a curve entry from the select box, this function is called
 * to redirect the user to the DataUpload site with the specified OOID.
 */
function redirectToDataUpload(){
    var e = document.getElementById("id_select");
    var dataset_id = e.options[e.selectedIndex].value;
    window.location.href='/SmartMonitoring/sites/dataupload.html?id=' + dataset_id;
}

/**
 * Gets the DescribedObservedObject (the curves that are referenced by the 
 * selected module) and saves the ID of it.
 */
function loadKennlinien() {
    console.log("loadKennlinien()");

    $.ajax({
        method: "GET",
        url: '/SmartMonitoringBackend/observedobjectjoindataset/listForDescribingObservedObjectAndDataSet?ooid=1&dataset=' + dataset
        
    }).always(function (msg) {
        var c_index = msg.list[0].describedObservedObject.match(/\d+/g);
        kennlinienOOid = c_index[0];
        readKennlinien();
    });
}

/**
 * Gets the curve data and saves the different curve types.
 */
function readKennlinien() {
    var kennlinien_id = 0;
    $.ajax({
        method: "GET",
        url: '/SmartMonitoringBackend/observedobject/listChilds?parent_id=' + kennlinienOOid + '&recursive=false' 
    }).always(function (msg) {
        console.log("readKennlinien()");
        kennlinien_types = msg.list;

        for(let i = 0; i < kennlinien_types.length; i++) {
            kennlinien_id = msg.list[i].id;
            $.ajax({
                method: "GET",
                url: '/SmartMonitoringBackend/data/getSets?ooid=' + kennlinien_id 
            }).always(function (data){
                saveData(data.list);
            });
        }
    });
}

/**
 * Initiates the curve upload to the module.
 */
function uploadKennlinie() {
    console.log("uploadKennlinie()");
    remoteHandler.fetchGet("observedobjectjoindataset/listForDescribingObservedObjectAndDataSet", {ooid: 1, dataset: dataset}, false)
            .then(listForDescribingObservedObject_callback).catch(function (error) {
       UIkit.notification({
            message: 'Keine Verbindung vorhanden' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
    });
}

/**
 * Callback function from listing the DescribedObservedObjects. If the list does
 * not contain any entries, a new ObservedObject is created to save the curve data in.
 * If there are entries, the IDs of the DescribedObservedObjects will be shown
 * in the SelectBox of the PopUp Window to upload a new curve.
 * @param {type} data is the list of DescribedObservedObjects
 */
function listForDescribingObservedObject_callback(data) {
    console.log("listForDescribingObservedObject_callback()");
    
    if(data.list.length === 0) {
        //Wenn keine Liste vorhanden, wird ObservedObjectType Dummy erstellt
        remoteHandler.fetchPost("observedobject/create", {name: module_name + "_Kennlinien_" + dataset, 
            description: "Observed Object zum Speichern von Kennlinien, die zu einem Modultyp gehören.", 
            type: "ref://observedobjecttype/get/"+dummy_type_id, dataCapture: true}, false)
                .then(createDummy_callback).catch(function (error) {
        });
    }
    else {
        addKOOIdToSelectBox();
    }
}

/**
 * Callback function from creating the dummy. The ID of the newly created 
 * ObservedObject is saved.
 * @param {type} data
 */
function createDummy_callback(data) {
    console.log("createDummy_callback()");
    kennlinienOOid = data.id;
    //Verbindung von Modul zu Kennlinien erstellen
    remoteHandler.fetchPost("observedobjectjoindataset/create", 
        {describedObservedObject: data.id, describingObservedObject: 1, dataset: dataset}, false)
        .then(createDescribedOO_callback).catch(function (error) {
    });
}

/**
 * Callback function from creating the DescribedObservedObject. The current module
 * now references the curve dummy ObservedObject.
 * @param {type} data
 */
function createDescribedOO_callback(data) {
    console.log("createDescribedOO_callback()");
    addKOOIdToSelectBox();
}

/**
 * Converts the curve data and saves it, so it can be displayed in the chart.
 * @param {type} list
 */
function saveData(list) {
    var kennlinie = [];
    var kennlinien = [];
    for(let j = 0; j < list.length; j++) {
        for (let i = 1; i <= 250; i++) {
            let select_i = "I" + i;
            let select_u = "U" + i;
            if (list[j][select_u] !== null && list[j][select_i] !== null) {
                kennlinie.push({
                    id: i,
                    u: list[j][select_u],
                    i: list[j][select_i],
                    p: list[j][select_u] * list[j][select_i]
                });
            }
        }
        kennlinien.push(kennlinie);
        kennlinie = [];
    }
    kennlinien_types_data.push(kennlinien);
    active_kennlinie = kennlinien[active_kennlinie_index];
}

/**
 * Displays the dataset of the next curve in the list.
 */
function nextKennlinie() {
    if(++active_kennlinie_index > kennlinien.length) {
        active_kennlinie_index = 0;
    }
    active_kennlinie = kennlinien[active_kennlinie_index];
    document.getElementById("chart_example").swac_comp.drawCharts();
}

/**
 * Displays the dataset of the previous characteristic curve in the list.
 */
function prevKennlinie() {
    if(--active_kennlinie_index < 0) {
        active_kennlinie_index = kennlinien.length - 1;
    }
    active_kennlinie = kennlinien[active_kennlinie_index];
    document.getElementById("chart_example").swac_comp.drawCharts();
}

/**
 * Displays the dataset of the first curve in the list of unilluminated
 * characteristic curves.
 */
function activateDunkelkennlinien() {
   for(let i = 0; i < kennlinien_types.length; i++) {
        if(kennlinien_types[i].name === "PVServe Dunkelkennlinien") {
            kennlinien = kennlinien_types_data[i];
        }
    }
    if(kennlinien === undefined){
        active_kennlinie = [];
    }
    else{
        active_kennlinie = kennlinien[active_kennlinie_index];
    }
    document.getElementById("chart_example").swac_comp.drawCharts();
}

/**
 * Displays the dataset of the first curve in the list of illuminated
 * characteristic curves.
 */
function activateHellkennlinien() {
    for(let i = 0; i < kennlinien_types.length; i++) {
        if(kennlinien_types[i].name === "PVPM Hellkennlinien") {
            kennlinien = kennlinien_types_data[i];
        }
    }
    active_kennlinie = kennlinien[active_kennlinie_index];
    console.log(active_kennlinie);
    if(kennlinien === undefined){
    active_kennlinie = [];
    }
    else{
        active_kennlinie = kennlinien[active_kennlinie_index];
        console.log(active_kennlinie);
    }    
    document.getElementById("chart_example").swac_comp.drawCharts();
}

/**
 * Adds another curve entry to the select box for the curve upload.
 */
function addKOOIdToSelectBox() {
        var c = document.createElement("option");
        c.text = kennlinienOOid;
        var e = document.getElementById("id_select");
        e.options.add(c,1);
}

chart_example_options = {};
chart_example_options.xAxisAttrName = 'u';
chart_example_options.yAxis1AttrName = 'i';
chart_example_options.yAxis2AttrName = 'p';
chart_example_options.plugins = new Map();
chart_example_options.plugins.set('barchart', {
    active: false
});
chart_example_options.plugins.set('piechart', {
    active: false
});
chart_example_options.plugins.set('table', {
    active: false
});
chart_example_options.plugins.set('linechart', {
    active: true,
    options : {
        lineconfigs : [
            {
                fill: false,
                borderColor: '#6495ED',
                backgroundColor: '#6495ED',
                lineTension: 0
            },
           {
                fill: false,
                borderColor: '#9F9F9F',
                backgroundColor: '#9F9F9F',
                lineTension: 0
           }
        ]
    }
});
