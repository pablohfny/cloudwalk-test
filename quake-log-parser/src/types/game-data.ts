export class GameData {
    total_kills: number = 0;
    players: string[] = [];
    kills: Map<string, number> = new Map();
    kills_by_means: Map<string, number> = new Map();
    
    constructor(args: GameData) {
        Object.assign(this, args);
    }
}