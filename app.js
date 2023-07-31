require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://" + process.env.ADMIN + ":" + process.env.PASSW + "@cluster0.wjkouan.mongodb.net/todoDB");

////////////// TUTORIAL LIST COLLECTION /////////////

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

////////////////// LISTS COLLECTION /////////////////////
const listSchema = new mongoose.Schema({
    name: String,
    task: [taskSchema]
});

const List = mongoose.model("list", listSchema);

///////////////// MAIN ROUTE / TUTORIAL PAGE ////////////////
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
});

app.post("/tutorial", (req, res) => {
    const newTask = req.body.newTask;

    let addTask = new Task({
        name: newTask
    });

    addTask.save();
    setTimeout(() => {
        res.redirect("/");
    }, 250);
});


////////////////// CUSTOM LISTS ////////////////

app.route("/:listName")
    .get(async (req, res) => {
        let listName = req.params.listName;

        await List.findOne({ name: listName }).then((result) => {
            if (result) {
                res.render("list", { listTitle: listName, tasks: result.task });
            } else {
                console.log("No document found for listName: " + listName);
            }
        }).catch((err) => {
            console.log(err);
        })
    })
    .post((req, res) => {
        let listName = req.params.listName;
        const newTask = req.body.newTask;

        let addTask = new Task({
            name: newTask
        });

        List.findOne({ name: listName }).then((result) => {
            if (result) {
                result.task.push(addTask);
                result.save();
            } else {
                console.log("List not found " + listName);
            }
        })
        setTimeout(() => {
            res.redirect("/" + listName);
        }, 250);
    })



app.post("/delete", (req, res) => {
    // const listTitle = req.params.listTitle;
    const deleteTaskId = req.body.deleteTaskId;

    // List.findOneAndUpdate({ name: listTitle }, { $pull: { tasks: { _id: deleteTaskId } } }).then(() => {
    //     console.log("Checked Item Successfully Removed")
    // }).catch((err) => { console.log(err) });
    // res.redirect("/" + listTitle);

    Task.findByIdAndDelete(deleteTaskId).then(() => {
        console.log("Item successfully deleted");
    }).catch((err) => {
        console.log(err);
    });

    res.redirect("/");
})

app.all("*", (req, res) => {
    res.status(404).render("error");
})

app.listen(3000, function () {
    console.log("Server started on port 3000");
});