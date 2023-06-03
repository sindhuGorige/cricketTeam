const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id='${playerId}';`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});
app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { player_name, jersey_number, role } = playersDetails;
  const addPlayerQuery = `insert into cricket_team (player_name,jersey_number,role)
    values('${player_name}','${jersey_number}','${role}');`;
  //   const dbResponse = await db.run(addPlayerQuery);
  //   const player_id = dbResponse.lastID;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const updateQuery = `update cricket_team set player_name='${player_name}',
                                                    jersey_number='${jersey_number}',
                                                    role='${role}'
                                                    where player_id='${playerId}';`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayersQuery = `delete from cricket_team where player_id='${playerId}';`;
  await db.run(deletePlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
