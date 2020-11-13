//require express
const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

//create app
const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

//create routes
app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || []; //give the array if there is any or give emty array if undefined
  comments.push({ id: commentId, content, status: "pending" }); //actual comment

  commentsByPostId[req.params.id] = comments;

  //emit event whenever something interesting happening
  //axios
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending"
    }
  });

  res.status(201).send(comments);
});

app.post("/events", (req, res) => {
  console.log("Received comment event:", req.body.type);
  res.send({});
});

//listen to app
app.listen(4001, () => {
  console.log("Comments app listening on 4001!");
});
