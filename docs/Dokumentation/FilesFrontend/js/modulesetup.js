/**
 * @module ModuleSetup
 */

let currentStep = -1;
let setupStepQueue = [];

let options = {
    datatemplate1: "de.fhbielefeld.scl.database.datatemplates.PVModulDatenblattType",
    datatemplate2: "de.fhbielefeld.scl.database.datatemplates.PVServeDunkelkennlinienDeviceType",
    dummyObservedObjectType: {
        name: "Dummy ObservedObjectTypeTest",
        description: "Dummy Typ um Kennlinienspeicherung fuer ModulTypen zu erlauben",
    },
    moduleTypeObservedObject: {
        name: "PVModuleTypes",
        description: "ObservedObject um PV Modultypen zu erfassen",
        type: "ref://observedobjecttype/get/1",
        typeName: "PVModulDatenblatt",
    },
};

function setupAll(){
    currentStep = 0;
    setupStepQueue = [installDatatemplates, dummyOoTypeCreate, createOoForModuleTypes];
    installDatatemplates();
}
function nextStep(){
    if(currentStep < setupStepQueue.length - 1){
        currentStep++;
        setupStepQueue[currentStep]();
    }
}

function installDatatemplates(){
    console.log("Installing datatemplates...");
    remoteHandler.fetchGet("datatemplate/install", {name: options.datatemplate1}, false).then(datatemplateModuleTypeCallback).catch(function (error) {
        UIkit.notification({
            message: 'Das Datentemplate >'+templateName+'< konnte nicht installiert werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
    });
}
function datatemplateModuleTypeCallback(data){
    let infotext = 'Das Datentemplate wurde angelegt.';
    if (typeof data.warnings !== 'undefined') {
        infotext = 'Das Datentemplate ist bereits installiert.';
    }

    UIkit.notification({
        message: infotext,
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    
    remoteHandler.fetchGet("datatemplate/install", {name: options.datatemplate2}, false).then(datatemplateKennlinienCallback).catch(function (error) {
        UIkit.notification({
            message: 'Das Datentemplate >'+templateName+'< konnte nicht installiert werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
    });
}
function datatemplateKennlinienCallback(data){
    let infotext = 'Das Datentemplate wurde angelegt.';
    if (typeof data.warnings !== 'undefined') {
        infotext = 'Das Datentemplate ist bereits installiert.';
    }

    UIkit.notification({
        message: infotext,
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    
    nextStep();
}

function dummyOoTypeCreate(){
    console.log("Creating dummy oo type...");
    remoteHandler.fetchGet("observedobjecttype/getByName", {name: options.dummyObservedObjectType.name}, false).then(function(data){
        UIkit.notification({
            message: "Dummy ObservedObjectType existiert bereits",
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'success'
        });
        nextStep();
    }).catch(dummyOoTypeLookupCallback);
}
function dummyOoTypeLookupCallback(error){ //Error, da wir einen Fehler erwarten, wenn ein frischer Server den OoType nicht findet
    console.log("Dummy ObservedObjectType not found, creating...");
    let data = {
        name: options.dummyObservedObjectType.name,
        description: options.dummyObservedObjectType.description,
    };
    remoteHandler.fetchPost("observedobjecttype/create", data, false).then(dummyOoTypeCreateCallback).catch(function (error) {
        console.log("Could not create dummy oo type:");
        console.log(error);
        UIkit.notification({
            message: 'Dummy ObservedObjectType konnte nicht angelegt werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
        nextStep();
    });
}
function dummyOoTypeCreateCallback(data){
    UIkit.notification({
        message: "Dummy ObservedObjectType wurde angelegt",
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    nextStep();
}

function createOoForModuleTypes(){
    console.log("Creating Oo for module types...");
    remoteHandler.fetchGet("observedobject/listForTypename", {typename: options.moduleTypeObservedObject.typeName}, false).then(ooForModuleTypesListCallback).catch(function(error){
        UIkit.notification({
            message: 'ObservedObject für Modultypen konnte nicht angelegt werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
        nextStep();
    });
}
function ooForModuleTypesListCallback(data){
    console.log("Got list of oos for module types, checking list...");
    console.log(data);
    
    if(data.list.length === 0){
        console.log("Did not find oo for module types");
        let sendData = {
            name: options.moduleTypeObservedObject.name,
            description: options.moduleTypeObservedObject.description,
            type: options.moduleTypeObservedObject.type,
        };
        remoteHandler.fetchPost("observedobject/create", sendData, false).then(ooForModuleTypesCreateCallback).catch(function (error) {
            console.log("Could not create oo for module types:");
            console.log(error);
            UIkit.notification({
                message: 'ObservedObject für Modultypen konnte nicht angelegt werden. ' + error,
                timeout: SWAC_config.notifyDuration,
                pos: 'top-center',
                status: 'error'
            });
            nextStep();
        });
    } else {
        UIkit.notification({
            message: "ObservedObject für Modultypen existiert bereits",
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'success'
        });
    }
    
    nextStep();
}
function ooForModuleTypesCreateCallback(data){
    UIkit.notification({
        message: "ObservedObject für Modultypen wurde angelegt",
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    nextStep();
}