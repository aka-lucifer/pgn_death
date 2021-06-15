import { Game, Ped } from "fivem-js";

// Variables
let blackedOut = false;
export let invincible = false;

/**
 * @param reference Title for organisation logs
 * @param message Log message
*/

onNet("logMessage", Log);

export function Log(reference: string, message: string): void {
  console.log(`[^2LOG^7]\t[^2${reference}^7] ${message}`);
}

/**
 * @param reference Title for organisation logs
 * @param message Inform message
*/
export function Inform(reference: string, message: string): void {
  console.log(`[^5INFORM^7]\t[^5${reference}^7] ${message}`);
}

/**
 * @param reference Title for organisation logs
 * @param message Warn message
*/
export function Warn(reference: string, message: string): void {
  console.log(`[^3WARNING^7]\t[^3${reference}^7] ${message}`);
}

/**
 * @param reference Title for organisation logs
 * @param message Error message
*/
export function Error(reference: string, message: string): void {
  console.log(`[^8ERROR^7]\t[^8${reference}^7] ${message}`);
}

/**
 * 
 * @param ms Time in milliseconds
 * @returns Waits a specified amount of time in milliseconds
 */
 export function Delay(ms : number) : Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function Fade(): Promise<void> {
  if (!blackedOut) {
    blackedOut = true;
    DoScreenFadeOut(0);
    while (!IsScreenFadedOut()) {
      await Delay(0);
    }
    blackedOut = false;
  }
}

export function Invincible(newValue: boolean) {
  const ped = Game.PlayerPed.Handle;

  if (newValue) {
    SetEntityProofs(PlayerPedId(), true, true, true, true, true, true, true, true)
    SetPedCanRagdoll(PlayerPedId(), false)
    // SetEntityInvincible(ped, true)
    // SetPlayerInvincible(PlayerId(), true)
    // SetPedCanRagdoll(ped, false)
    // ClearPedBloodDamage(ped)
    // ResetPedVisibleDamage(ped)
    // ClearPedLastWeaponDamage(ped)
    // SetEntityProofs(ped, true, true, true, true, true, true, true, true)
    // SetEntityOnlyDamagedByPlayer(ped, false)
    // SetEntityCanBeDamaged(ped, false)
    invincible = true
  } else {
    SetEntityProofs(PlayerPedId(), false, false, false, false, false, false, false, false)
    SetPedCanRagdoll(PlayerPedId(), true)
    invincible = false
  }
}

// Animations
export async function LoadAnim(animDict: string): Promise<boolean> {
	if (HasAnimDictLoaded(animDict)) {
    return true
  }
	
  RequestAnimDict(animDict);
	const currTime = GetGameTimer();
  let timedOut = false;

  do {
    await Delay(10);
    if ((GetGameTimer() - currTime) >= 5000) {
      Error("LoadAnim", `Timeout requesting anim [${animDict}] failed after 5 seconds!`);
      timedOut = true;
      break;
    }
  } while (!HasAnimDictLoaded(animDict));

  if (timedOut) {
    return false;
  }

	return true
}

/**
 * 
 * @param min Minimum number
 * @param max Maximum number
 * @returns Random number between the minimum and maximum number
 */
 export function Random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 
 * @param notificationMessage The message on the notification.
 * @param flashNotification If the notification should flash or not
 * @param saveToBrief No idea.
 * @param hudColorIndex Some colour bullshit.
 */
 export function showNotification(notificationMessage: string, flashNotification: boolean = false, saveToBrief: boolean = false, hudColorIndex: number = 0) {
	const notify = `${GetCurrentResourceName()}-${Random(1, 9999)}:notification`;
	AddTextEntry(notify, `[~y~PGN Death~w~]\n\n${notificationMessage}`)
	BeginTextCommandThefeedPost(notify)
	if (hudColorIndex) { ThefeedNextPostBackgroundColor(hudColorIndex) }
	EndTextCommandThefeedPostTicker(flashNotification || false, saveToBrief || true)
}

export function createUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
 });
}