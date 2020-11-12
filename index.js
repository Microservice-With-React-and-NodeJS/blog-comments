//require express
const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");

//create app
const app = express();
app.use(bodyParser.json());

const commentsByPostId = {};

//create routes
app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id]);
});

app.post("/posts/:id/comments", (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || []; //give the array if there is any or give emty array if undefined
  commentsByPostId.push({ id: commentId, content });

  commentsByPostId[req.params.id] = comments;
  res.status(201).send(comments);
});

//listen to app
app.listen(4000, () => {
  console.log("Comments app listening on 4001!");
});