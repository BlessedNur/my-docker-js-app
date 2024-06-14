const express = require("express");
const path = require("path");
const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile-picture", function (req, res) {
  const img = fs.readFileSync(path.join(__dirname, "images/anonymous-guy-wallpaper1.jpg"));
  res.writeHead(200, { "Content-Type": "image/jpg" });
  res.end(img, "binary");
});

const mongoUrlLocal = "mongodb://admin:password@localhost:27017";
const mongoUrlDocker = "mongodb://admin:password@mongodb:27017";
const mongoUrl =
  process.env.DOCKER_ENV === "docker" ? mongoUrlDocker : mongoUrlLocal;

const mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const databaseName = "my-db";

app.post("/update-profile", function (req, res) {
  const userObj = req.body;
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) throw err;
    const db = client.db(databaseName);
    userObj["userid"] = 1;
    const myquery = { userid: 1 };
    const newvalues = { $set: userObj };
    db.collection("users").updateOne(
      myquery,
      newvalues,
      { upsert: true },
      function (err, res) {
        if (err) throw err;
        client.close();
      }
    );
  });
  res.send(userObj);
});

app.get("/get-profile", function (req, res) {
  let response = {};
  MongoClient.connect(mongoUrl, mongoClientOptions, function (err, client) {
    if (err) throw err;
    const db = client.db(databaseName);
    const myquery = { userid: 1 };
    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();
      res.send(response ? response : {});
    });
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
