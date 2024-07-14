# Cloudwalk Quake3 Log Report Script

Implemented a script that reads a quake log, prints a report in the console and saves the report folder inside the project root. per match as follows:

```json
"game_1": {
"total_kills": 45,
"players": ["Dono da bola", "Isgalamido", "Zeh"],
"kills": {
  "Dono da bola": 5,
  "Isgalamido": 18,
  "Zeh": 20
  },
"kills_by_means": {
    "MOD_TRIGGER_HURT": 10,
    "MOD_RAILGUN": 5,
    "MOD_ROCKET": 10,
    "MOD_SHOTGUN": 5,
    "MOD_MACHINEGUN": 5,
    "MOD_FALLING": 5
    ...
    }
}
```

## Running the Script

```bash
1. Install Dependencies
$ npm install

1. Build the script
$ npm run build

2. Run the script
# Without File Path
$ node dist/index.js  

# Informing File Path in console
$ node dist/index.js --file <path_to_log_file>
```
