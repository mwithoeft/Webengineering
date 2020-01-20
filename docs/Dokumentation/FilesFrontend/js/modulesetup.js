/**
 * @module ModuleSetup
 */

//Saves the current progress in the setupAll() function
let currentStep = -1;

//Saves the current progress in the installDatatemplates() function
let currentTemplate = -1;

//Array that stores the order of functions needing to be called in the setupAll() function
let setupStepQueue = [];

//Options variable to group easily customizable variables
let options = {
    datatemplates: [
        "de.fhbielefeld.scl.database.datatemplates.PVModulDatenblattType",
        "de.fhbielefeld.scl.database.datatemplates.PVServeDunkelkennlinienDeviceType",
        "de.fhbielefeld.scl.database.datatemplates.LaborHellkennlinienDeviceType",
        "de.fhbielefeld.scl.database.datatemplates.LaborDunkelkennlinienDeviceType",
        "de.fhbielefeld.scl.database.datatemplates.PVPMHellkennlinienDeviceType",
    ],
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

/**
 * Calls all setup functions in the order they appear in the setup explanation. Called from UI.
 */
function setupAll(){
    currentStep = 0;
    setupStepQueue = [installDatatemplates, dummyOoTypeCreate, createOoForModuleTypes];
    installDatatemplates();
}

/**
 * Initiates the next step in the setup, if it is not yet done
 */
function nextStep(){
    if(currentStep < setupStepQueue.length - 1){
        currentStep++;
        setupStepQueue[currentStep]();
    }
}

/**
 * Initiates the next datatemplate installation call, if it is not yet done
 */
function nextDatatemplate(){
    if(currentTemplate < options.datatemplates.length - 1){
        currentTemplate++;
        installDatatemplate(options.datatemplates[currentTemplate]);
    } else {
        nextStep();
    }
}

/**
 * Initiates the installation of all needed datatemplates. Called from UI.
 */
function installDatatemplates(){
    console.log("Installing datatemplates...");
    nextDatatemplate();
}

/**
 * Installs a single datatemplate by its fully qualified name
 * @param {string} templateName - The datatemplates name
 */
function installDatatemplate(templateName){
    remoteHandler.fetchGet("datatemplate/install", {name: templateName}, false).then(datatemplateModuleTypeCallback).catch(function (error) {
        UIkit.notification({
            message: 'Das Datentemplate >'+templateName+'< konnte nicht installiert werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
        
        nextDatatemplate();
    });
}

/**
 * Callback function after a datatemplate has been installed. Implicitly calls the
 * next datatemplate installation.
 * @param {object} data - The parsed JSON response returned from the server
 */
function datatemplateModuleTypeCallback(data){
    let infotext = 'Das Datentemplate wurde angelegt.';
    if (typeof data.warnings !== 'undefined' && typeof data.errors !== 'undefined') {
        infotext = 'Das Datentemplate ist bereits installiert.';
    }

    UIkit.notification({
        message: infotext,
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    
    nextDatatemplate();
}

/**
 * Starts a request to look for an existing dummy ObservedObjectType. Called from UI.
 */
function dummyOoTypeCreate(){
    console.log("Creating dummy oo type...");
    remoteHandler.fetchGet("observedobjecttype/getByName", {name: options.dummyObservedObjectType.name}, true).then(function(data){
        UIkit.notification({
            message: "Dummy ObservedObjectType existiert bereits",
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'success'
        });
        nextStep();
    }).catch(dummyOoTypeLookupCallback); //Error, da wir einen Fehler erwarten, wenn ein frischer Server den OoType nicht findet
}

/**
 * Callback function after the lookup for any existing dummy ObservedObjectType
 * successfully failed. Starts a request to create the dummy ObservedObjectType.
 * @param {object} error - The error information, unused
 */
function dummyOoTypeLookupCallback(error){
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

/**
 * Callback function after the dummy ObservedObjectType has been created.
 * @param {object} data - The parsed JSON response returned from the server
 */
function dummyOoTypeCreateCallback(data){
    UIkit.notification({
        message: "Dummy ObservedObjectType wurde angelegt",
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    nextStep();
}

/**
 * Starts a request to look for an existing ObservedObject used for storing
 * PVModulDatenblaetter. Called from UI.
 */
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

/**
 * Callback function after the lookup of any existing ObservedObjects used for
 * storing PVModulDatenblaetter. Starts a request to create a new ObservedObject
 * if no existing ones were found.
 * @param {object} data - The parsed JSON response returned from the server
 */
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

/**
 * Callback after the ObservedObject for the PVModulDatenblaetter has been
 * created.
 * @param {object} data - The parsed JSON response returned from the server
 */
function ooForModuleTypesCreateCallback(data){
    UIkit.notification({
        message: "ObservedObject für Modultypen wurde angelegt",
        timeout: SWAC_config.notifyDuration,
        pos: 'top-center',
        status: 'success'
    });
    nextStep();
}