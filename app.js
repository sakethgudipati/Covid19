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
  response.send(stateArray);
});

//API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const dbQuery = `
    SELECT *
    FROM state
    WHERE state_id = ${stateId};`;

  const resp = await db.get(dbQuery);
  response.send(resp);
});

//API 3

app.post("/districts/", async (request, response) => {
  const districtDetails = {
    districtName: "Bagalkot",
    stateId: 3,
    cases: 2323,
    cured: 2000,
    active: 315,
    deaths: 8,
  };

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

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
  response.send(res);
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
  const districtDetails = {
    districtName: "Nadia",
    stateId: 3,
    cases: 9628,
    cured: 6524,
    active: 3000,
    deaths: 104,
  };
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
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

app.get("/stats/", async (request, response) => {
  const dbQuery = `
    SELECT *
    FROM stats`;
  const a = await db.all(dbQuery);
  response.send(a);
});
