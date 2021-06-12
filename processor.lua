AddEventHandler('onClientMapStart', function()
  Citizen.Trace("PGN Death: Disabling the autospawn.")
  exports.spawnmanager:spawnPlayer() -- Ensure player spawns into server.
  Citizen.Wait(2500)
  exports.spawnmanager:setAutoSpawn(false)
  Citizen.Trace("PGN Death: Autospawn is disabled.")
end)

AddEventHandler('onResourceStart', function(resourceName)
  if GetCurrentResourceName() == resourceName then
    Citizen.Trace("PGN Death: Disabling the autospawn.")
    exports.spawnmanager:spawnPlayer() -- Ensure player spawns into server.
    Citizen.Wait(2500)
    exports.spawnmanager:setAutoSpawn(false)
    Citizen.Trace("PGN Death: Autospawn is disabled.")
  end
end)