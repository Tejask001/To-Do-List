const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB");

const taskSchema = new mongoose.Schema({
    name: String
});

const Task = mongoose.model("Task", taskSchema);

const tut1 = new Task({
    name: "Click the + button to add Task"
});

const tut2 = new Task({
    name: "Click the checkbox to delete a Task"
});

const tutorialItems = [tut1, tut2];


app.get("/", (req, res) => {
    Task.find().then((tasks) => {
        if (tasks.length === 0) {
            //collection empty i.e. no tasks so add tutorial tasks
            Task.insertMany(tutorialItems);
            res.redirect("/");
        } else {
            //collection has tasks so show them, render the page
            res.render("tutorial", { tasks: tasks });
        }
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/today", (req, res) => {
    let day = date.getDate();
    setTimeout(() => {
        res.render("list", { listTitle: day });
    }, 200);
})


app.post("/tutorial", (req, res) => {
    const newTask = req.body.newTask;

    let addTask = new Task({
        name: newTask
    });

    addTask.save();
    setTimeout(() => {
        res.redirect("/");
    }, 250);
})


app.all("*", (req, res) => {
    res.status(404).render("error");
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});