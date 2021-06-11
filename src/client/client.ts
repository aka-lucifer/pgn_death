import { Game, VehicleSeat } from "fivem-js";
import { Events } from "./enums/events";
import * as Utils from "./utils";
import Config from "../configs/client.json";
import { AnimType } from "./enums/animType";
import { MenuManager } from "./managers/menu";
import { Menu } from "./models/menu/menu";

let deathTick = -1;
let lastAnim;
let pedVeh;

export class Client {
    constructor() {
        // Events
        on(Events.playerDied, this.ProcessDeath);
        on(Events.playerKilled, this.ProcessDeath);
        
        // Handles Reviving
        RegisterKeyMapping("+revive_player", "Revive yourself", "keyboard", "E");
        RegisterCommand("+revive_player", this.Revive.bind(this), false);
        
        // Handles Respawning
        RegisterKeyMapping("+respawn_player", "Respawn yourself", "keyboard", "R");
        RegisterCommand("+respawn_player", this.Respawn.bind(this), false);
    }

    // Methods
    public async Setup(): Promise<void> {
        // Decors
        DecorRegister("PLAYER_DEAD", 3);

        // Animations
        await Utils.LoadAnim("dead");
        await Utils.LoadAnim("veh@low@front_ps@idle_duck");
    }

    private Revive(): void {
        if (DecorGetBool(Game.PlayerPed.Handle, "PLAYER_DEAD")) {
            Utils.Invincible(false);
            NetworkResurrectLocalPlayer(Game.PlayerPed.Position.x, Game.PlayerPed.Position.y, Game.PlayerPed.Position.z, Game.PlayerPed.Heading, true, false);
            DecorSetBool(Game.PlayerPed.Handle, "PLAYER_DEAD", false);
            if (deathTick > -1) {
                clearTick(deathTick);
                deathTick = -1;
            }
            pedVeh = null;
        }
    }

    private Respawn(): void {
        if (DecorGetBool(Game.PlayerPed.Handle, "PLAYER_DEAD")) {
            const respawnMenu = new Menu("Respawn Menu", GetCurrentResourceName(), "middle-right");
            const positions = Config.respawnPositions;
            for (let i = 0; i < positions.length; i++) {
                respawnMenu.Button(positions[i].label, async() => {
                    await Utils.Fade();
                    Utils.Invincible(false);
                    NetworkResurrectLocalPlayer(positions[i].x, positions[i].y, positions[i].z, positions[i].heading, true, false);
                    DecorSetBool(Game.PlayerPed.Handle, "PLAYER_DEAD", false);
                    if (deathTick > -1) {
                        clearTick(deathTick);
                        deathTick = -1;
                    }
                    pedVeh = null;

                    respawnMenu.Close();
                    await Utils.Delay(200);
                    DoScreenFadeIn(3000);
                })
            }

            respawnMenu.Open();
        }
    }

    // Events
    private async ProcessDeath(typeOrId: number, deathData: any[]): Promise<void> {
        await Utils.Fade();

        Utils.showNotification(`~g~E - Revive\n\n~o~R - Respawn`);
        deathTick = setTick(async() => {
            if (!DecorGetBool(Game.PlayerPed.Handle, "PLAYER_DEAD")) {
                if (Game.PlayerPed.isDead()) {
                    if (Game.PlayerPed.isInVehicle) {
                        pedVeh = Game.PlayerPed.CurrentVehicle;
                    }

                    if (pedVeh) {
                        while (GetEntitySpeed(Game.PlayerPed.Handle) > 0.5 || IsPedRagdoll(Game.PlayerPed.Handle)) {
                            await Utils.Delay(10);
                        }

                        lastAnim = AnimType.Vehicle;
                        PlayAnim(lastAnim);
                    } else {
                        lastAnim = AnimType.Floor;
                        PlayAnim(lastAnim);
                    }
                } else {
                    if (deathTick > -1) {
                        clearTick(deathTick);
                        deathTick = -1;
                    }
                }
            } else {
                if (Game.PlayerPed.isDead()) {
                    DecorSetBool(Game.PlayerPed.Handle, "PLAYER_DEAD", true);
                } else {
                    if (!IsPedInAnyVehicle(Game.PlayerPed.Handle, false)) {
                        if (!IsEntityPlayingAnim(Game.PlayerPed.Handle, "dead", "dead_a", 3)) {
                            PlayAnim(lastAnim);
                        }
                    } else {
                        if (!IsEntityPlayingAnim(Game.PlayerPed.Handle, "veh@low@front_ps@idle_duck", "sit", 3)) {
                            PlayAnim(lastAnim);
                        }
                    }

                    if (Utils.invincible) Utils.Invincible(false);
                }

                if (Game.PlayerPed.isInVehicle) {
                    for (let i = 0; i < Config.disabledControls.length; i++) {
                        DisableControlAction(0, Config.disabledControls[i], true);
                    }
                }
            }
        })
    }
}

const client = new Client();
export const menuManager = new MenuManager(client);

setImmediate(async() => {
    await client.Setup();
})

function PlayAnim(type: AnimType): void {
    if (type == AnimType.Floor) {
        const animLoaded = HasAnimDictLoaded("dead");
        if (animLoaded) {
            DecorSetBool(Game.PlayerPed.Handle, "PLAYER_DEAD", true);
            NetworkResurrectLocalPlayer(Game.PlayerPed.Position.x, Game.PlayerPed.Position.y, Game.PlayerPed.Position.z, Game.PlayerPed.Heading, true, false);
            TaskPlayAnim(Game.PlayerPed.Handle, "dead", "dead_a", 1.0, 1.0, -1, 14, 0, false, false, false);
            setTimeout(() => {
                const playingAnim = IsEntityPlayingAnim(Game.PlayerPed.Handle, "dead", "dead_a", 3);
                if (playingAnim) {
                    DoScreenFadeIn(3000);
                    Utils.Invincible(true);
                }
            }, 0);        
        }
    } else if (type == AnimType.Vehicle) {
        const animLoaded = HasAnimDictLoaded("veh@low@front_ps@idle_duck");
        if (animLoaded) {
            DecorSetBool(Game.PlayerPed.Handle, "PLAYER_DEAD", true);
            NetworkResurrectLocalPlayer(Game.PlayerPed.Position.x, Game.PlayerPed.Position.y, Game.PlayerPed.Position.z, Game.PlayerPed.Heading, true, false);
            TaskWarpPedIntoVehicle(Game.PlayerPed.Handle, GetPlayersLastVehicle(), VehicleSeat.Driver);  
            TaskPlayAnim(Game.PlayerPed.Handle, "veh@low@front_ps@idle_duck", "sit", 2.0, 2.0, -1, 51, 0, false, false, false);
            setTimeout(() => {
                const playingAnim = IsEntityPlayingAnim(Game.PlayerPed.Handle, "veh@low@front_ps@idle_duck", "sit", 3);
                if (playingAnim) {
                    DoScreenFadeIn(3000);
                    Utils.Invincible(true);
                }
            }, 0);        
        }
    }
}