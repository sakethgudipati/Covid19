const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

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

//API 1

app.get("/states/", async (request, response) => {
  const dbQuery = `
    SELECT *
    FROM state;
  `;

  const stateArray = await db.all(dbQuery);
  response.send(
    stateArray.map((eachArray) => ({
      stateId: eachArray.state_id,
      stateName: eachArray.state_name,
      population: eachArray.population,
    }))
  );
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `
    SELECT *
    FROM state
    WHERE state_id = ${stateId};`;

  const stateArray = await db.get(dbQuery);
  response.send({
    stateId: stateArray.state_id,
    stateName: stateArray.state_name,
    population: stateArray.population,
  });
});

//API 3

app.post("/districts/", async (request, response) => {
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = request.body;

  const dbQuery = `
    INSERT INTO
        district(district_name,state_id,cases,cured,active,deaths)
    VALUES
        (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
        );
    `;
  const res = db.run(dbQuery);
  response.send("District Successfully Added");
});

//API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const dbQuery = `
    SELECT *
    FROM district
    WHERE district_id = ${districtId};`;

  const res = await db.get(dbQuery);
  response.send({
    districtId: res.district_id,
    districtName: res.district_name,
    stateId: res.state_id,
    cases: res.cases,
    cured: res.cured,
    active: res.active,
    deaths: res.deaths,
  });
});

//API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const dbQuery = `
    DELETE FROM
        district
    WHERE 
        district_id = ${districtId};`;

  await db.run(dbQuery);
  response.send("District Removed");
});

//API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const dbQuery = `
    UPDATE 
        district
    SET
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
    WHERE
        district_id = ${districtId};
    `;

  const dbResponse = await db.run(dbQuery);
  response.send("District Details Updated");
});

//API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `
    SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
    FROM 
        district
    WHERE 
        state_id = ${stateId};
  `;
  const stats = await db.get(dbQuery);

  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const dbQuery = `
    SELECT state_id
    FROM district
    WHERE district_id = ${districtId};
    `;
  const res = await db.get(dbQuery);
  const stateId = res.state_id;

  const dbQuery2 = `
  SELECT 
    state_name
  FROM 
    state
  WHERE
    state_id = ${stateId};`;

  const resp = await db.get(dbQuery2);
  response.send({
    stateName: resp.state_name,
  });
});

module.exports = app;
