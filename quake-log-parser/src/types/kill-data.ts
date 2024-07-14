export class KillData {
    killerId: number;
    victimId: number;
    weaponId: number;

    constructor(args: KillData) {
        Object.assign(this, args);
    }
}