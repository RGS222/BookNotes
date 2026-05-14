import express from "express";
import pg from "pg";
import { addUser, updateUser, getUserPassword } from "./controllers/userController.js";

const app = express();
const port = 3000;


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booknotes",
    password: "Rocket222",
    port: 5432
})
db.connect();

let reviews = [];

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {
        reviews: reviews,
    });
});

app.post("/", (req, res) => {
    switch (req.body.actionType) {
        case "Register":
        case "Login":
        case "Update":
            res.render("users.ejs", {
                actionType: req.body.actionType,
            });
            break;

        case "addreview":
            res.render("review.ejs", {
                add: "true",
            });
            break;

        default:
            res.sendStatus(404).send("Invalid actionType received:" + req.body.actionType);
    }
});

app.post("/register", (req, res) => {
    const id = addUser(db, req.body.name, req.body.password);
    if (id >= 0) {
        res.render("index.ejs", {
            user: req.body.name
        });
    } else {
        res.render("users.ejs", {
            actionType: "Register",
            message: "The requested username was already in use.  Please try again."
        });
    }
});

app.post("/login", (req, res) => {
    const pw = getUserPassword(db, req.body.name);
    if (pw) {
        if (pw === req.body.password) {
            res.render("index.ejs", {
                user: req.body.name
            });
            return res.send("Success");
        }
    }

    res.render("users.ejs", {
        actionType: "Login",
        message: "The username and password were not matched.  Please try again."
    });
});

app.post("/update", (req, res) => {
    const pw = getUserPassword(db, req.body.name);
    if (pw) {
        if (pw === req.body.password) {
            updateUser(db, req.body.name, req.body.newPassword);
            res.render("index.ejs", {
                user: req.body.name,
                message: "The password was successfully updated."
            });
            return res.send("Success");
        }
    }

    res.render("users.ejs", {
        actionType: "Update",
        message: "The username and password were not matched.  Please try again."
    });
});    

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})