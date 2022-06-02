const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const app = express();
app.use(express.json());
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team ORDER BY player_id;
    `;
  let players1 = await db.all(getPlayersQuery);
  response.send(players1);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};
    `;
  let player = await db.get(query);
  response.send(player);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const query = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
    `;
  const dbResponse = await db.run(query);
  const playerId = dbResponse.lastId;
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName, jerseyNumber, role } = request.body;
  let query = `
    UPDATE cricket_team
    SET 
        player_id=${playerId},
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
    
    WHERE
    player_id=${playerId};
    `;
  await db.run(query);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
