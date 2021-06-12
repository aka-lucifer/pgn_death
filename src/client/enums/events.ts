export enum Events {
    // CitizenFX Events
    gameEventTriggered = "gameEventTriggered",
    entityCreated = "entityCreated",
    entityCreating = "entityCreating",
    entityRemoved = "entityRemoved",
    resourceListRefreshed = "onResourceListRefresh",
    resourceStart = "onResourceStart",
    resourceStarting = "onResourceStarting",
    resourceStop = "onResourceStop",
    serverResourceStart = "onServerResourceStart",
    serverResourceStop = "onServerResourceStop",
    playerConnecting = "playerConnecting",
    playerEnteredScope = "playerEnteredScope",
    playerLeftScope = "playerLeftScope",
    playerJoining = "playerJoining",
    playerDropped = "playerDropped",
    onClientMapStart = "onClientMapStart",

    // Base Events
    playerDied = "baseevents:onPlayerDied",
    playerKilled = "baseevents:onPlayerKilled",
    playerWasted = "baseevents:onPlayerWasted",
    enteringVehicle = "baseevents:enteringVehicle",
    enteringAborted = "baseevents:enteringAborted",
    enteredVehicle = "baseevents:enteredVehicle",
    leftVehicle = "baseevents:leftVehicle"
 }