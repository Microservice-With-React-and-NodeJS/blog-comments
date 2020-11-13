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

//post req to handle incoming events
app.post("/events", (req, res) => {
  console.log("Received comment event:", req.body.type);
  //pull of the type and data properties from req.body
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    // pull out the comment that is stored inside data structure of commentsByPostId. reason : we need the right comment of right post and update the status property
    const { postId, id, status } = data;
    //get all the comments associated to that postId
    const comments = commentsByPostId[postId];
    //iterate through the comments array and find the one comment that needs to updated by status
    const comment = comments.find(comment => {
      return comment.id === id;
    });
    //got the specific comment, now update the status
    comment.status = status;
    //status updated! now tell other services that an update just occured
  }

  res.send({});
});

//listen to app
app.listen(4001, () => {
  console.log("Comments app listening on 4001!");
});
