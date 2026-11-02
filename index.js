const fs = require("fs");
const path = require("path");
const { Client } = require("@xhayper/discord-rpc");

// config.local.json (git-ignored) overrides config.json if present
function loadConfig() {
  for (const name of ["config.local.json", "config.json"]) {
    const file = path.join(__dirname, name);
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
      } catch (err) {
        console.error(`${name} is not valid JSON: ${err.message}`);
        process.exit(1);
      }
    }
  }
  console.error("config.json not found next to index.js.");
  process.exit(1);
}
const config = loadConfig();
const { raUser, raApiKey, discordClientId } = config;
if (!raUser || !raApiKey || !discordClientId || /YOUR_/.test(raUser + raApiKey + discordClientId)) {
  console.error("config.json still has placeholder values. Edit it and fill in raUser, raApiKey and discordClientId.");
  process.exit(1);
}
const pollSeconds = config.pollSeconds || 30;
const activeWindowMinutes = config.activeWindowMinutes || 6;

const client = new Client({ clientId: discordClientId });
let ready = false;
let currentGameId = null;
let startedAt = null;
let cleared = true;

async function fetchSummary() {
  const url =
    "https://retroachievements.org/API/API_GetUserSummary.php" +
    `?z=${encodeURIComponent(raUser)}&y=${encodeURIComponent(raApiKey)}` +
    `&u=${encodeURIComponent(raUser)}&g=0&a=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RA API returned ${res.status}`);
  return res.json();
}

function isRecent(raw) {
  if (!raw || typeof raw !== "string") return false;
  const date = new Date(raw.replace(" ", "T") + "Z"); // RA timestamps are UTC
  return Date.now() - date.getTime() < activeWindowMinutes * 60 * 1000;
}

const gameCache = new Map();
async function fetchGame(id) {
  if (gameCache.has(id)) return gameCache.get(id);
  const url =
    "https://retroachievements.org/API/API_GetGame.php" +
    `?z=${encodeURIComponent(raUser)}&y=${encodeURIComponent(raApiKey)}` +
    `&i=${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`RA API (game) returned ${res.status}`);
  const game = await res.json();
  gameCache.set(id, game);
  return game;
}

async function clearPresence() {
  if (cleared) return;
  await client.user?.clearActivity();
  cleared = true;
  currentGameId = null;
  console.log("Stopped playing, presence cleared.");
}

async function tick() {
  if (!ready) return;
  try {
    const data = await fetchSummary();
    const playing =
      data.LastGameID &&
      data.RichPresenceMsg &&
      isRecent(data.RichPresenceMsgDate);

    if (!playing) return clearPresence();

    const game = await fetchGame(data.LastGameID);

    if (currentGameId !== data.LastGameID) {
      currentGameId = data.LastGameID;
      startedAt = new Date();
    }

    const activity = {
      // With statusDisplayType = 2, Discord shows "details" (the game title)
      // in the member list instead of the app name.
      details: game.Title,
      state: data.RichPresenceMsg.slice(0, 128),
      largeImageKey: "https://media.retroachievements.org" + game.ImageIcon,
      largeImageText: `${game.Title} (${game.ConsoleName})`,
      startTimestamp: startedAt,
      statusDisplayType: 2,
      buttons: [
        {
          label: "RetroAchievements profile",
          url: `https://retroachievements.org/user/${raUser}`,
        },
      ],
    };

    await client.user?.setActivity(activity);
    cleared = false;
    console.log(`Playing: ${game.Title} (${game.ConsoleName})`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

client.on("ready", () => {
  ready = true;
  console.log(`Connected to Discord as ${client.user?.username}`);
  tick();
  setInterval(tick, pollSeconds * 1000);
});

client.login().catch((err) => {
  console.error("Could not connect to Discord (is the desktop app open?):", err.message);
  process.exit(1);
});
