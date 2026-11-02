# RA Discord Presence

Show the game you are playing on [RetroAchievements](https://retroachievements.org) as a Discord Rich Presence ("Playing ...") with the game title, icon, console, elapsed time and the live RetroAchievements Rich Presence text (level, lives, stage, etc.).

It works with **any emulator or frontend that reports to RetroAchievements, on PC or mobile** (RetroArch, PPSSPP, DuckStation and others). The script does not talk to the emulator at all: RetroAchievements already knows what you are playing, so it just reads that from the RA web API.

> Not affiliated with RetroAchievements or Discord.

## Why

Emulators on PC usually have their own Discord integration, but mobile emulators have none, and Discord on a phone cannot receive Rich Presence from third-party apps. This script runs on a PC and mirrors your RA activity to Discord, even if you are playing on your phone.

## How it works

1. Every 30 seconds it calls `API_GetUserSummary` and reads your latest Rich Presence message, its timestamp and the last game ID.
2. If the message is recent, it fetches the game title, console and icon with `API_GetGame` (cached per game).
3. It sets the Discord Rich Presence through the local Discord client (IPC).
4. If RA stops receiving updates for a few minutes (you closed the game), the presence is cleared.

## Requirements

- A PC with the **Discord desktop app** open (the browser version does not work)
- [Node.js](https://nodejs.org) 18 or newer
- A RetroAchievements account, with achievements/hardcore login enabled in your emulator
- Your RA **Web API key** (retroachievements.org > Settings > Keys)
- A Discord application of your own (see below)

## Setup

1. **Create a Discord application** at https://discord.com/developers/applications. Its name is what shows up as "Playing ...", so something like `RetroAchievements` works. Copy its **Application ID**.
2. Clone this repo and install dependencies:
   ```
   npm install
   ```
3. Edit `config.json` and fill it in:

   | Field | Description |
   | --- | --- |
   | `raUser` | Your RetroAchievements username |
   | `raApiKey` | Your RA Web API key |
   | `discordClientId` | The Application ID from step 1 |
   | `pollSeconds` | How often to check RA (default `30`) |
   | `activeWindowMinutes` | Minutes without an RA update before the presence is cleared (default `6`) |

4. Open Discord, then run:
   ```
   npm start
   ```
   Open a game in your emulator. The presence shows up after RA's next update, usually within 2 to 3 minutes.

**Never publish your API key.** If you plan to push changes to Git, keep your real values in a `config.local.json` instead (same format). The script reads it first and it is already in `.gitignore`, so it never gets committed. If a key leaks, generate a new one in your RA settings.

## Running without a terminal (Windows)

- `start.bat`: opens the script in a window, useful to see logs.
- `start-hidden.vbs`: runs it in the background with no window. To start with Windows, press `Win + R`, type `shell:startup`, and put a shortcut to this file there. To stop it, end the *Node.js JavaScript Runtime* task in Task Manager.

PowerShell may block `npm` ("running scripts is disabled"). Use `npm.cmd install` and `npm.cmd start`, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

## Notes and limitations

- RA only updates your status every couple of minutes, so there is a small delay when you start, switch or close a game.
- The game must have achievements/Rich Presence support on RA, and your emulator must be logged in.
- Discord's mobile app cannot receive this presence. The script has to run on a PC with Discord desktop open.
- The game title is sent as `details` with `statusDisplayType: 2`, so recent Discord versions show it in the member list. If yours does not, the title still shows on your profile card.
- Using your user token to set the status from a phone would break Discord's terms of service and is not supported here.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Could not connect to Discord` | Open the Discord desktop app first, and run both as the same user (not one as administrator) |
| Connected but nothing shows | Discord > Settings > Activity Privacy > enable "Share your detected activity" |
| Nothing detected | Open `https://retroachievements.org/API/API_GetUserSummary.php?z=USER&y=KEY&u=USER&g=0&a=0` (with your values) while playing and check that `RichPresenceMsg` and `RichPresenceMsgDate` are filled |
| Presence flickers on and off | Increase `activeWindowMinutes` (keep it at 4 or more) |

## License

MIT
