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

app.post("/register", async (req, res) => {
    const id = await addUser(db, req.body.name, req.body.password);
    if (id >= 0) {
        res.render("index.ejs", {
            username: req.body.name,
            password: req.body.password
        });
    } else {
        console.log(id);
        res.render("users.ejs", {
            actionType: "Register",
            message: "The requested username was already in use.  Please try again."
        });
    }
});

app.post("/login", async (req, res) => {
    const pw = await getUserPassword(db, req.body.name);
    if (pw) {
        if (pw === req.body.password) {
            return res.render("index.ejs", {
                username: req.body.name,
                password: pw
            });
        }
    }

    res.render("users.ejs", {
        actionType: "Login",
        message: "The username and password were not matched.  Please try again.",
        username: "",
        password: ""
    });
});

app.post("/update", async (req, res) => {
    const pw = await getUserPassword(db, req.body.name);
    if (pw) {
        if (pw === req.body.password) {
            await updateUser(db, req.body.name, req.body.newPassword);
            return res.render("index.ejs", {
                username: req.body.name,
                password: pw,
                message: "The password was successfully updated."
            });
        }
    }

    res.render("users.ejs", {
        actionType: "Update",
        message: "The username and password were not matched.  Please try again."
    });
});    

app.get("/users/login", (req, res) => {
    res.render("users.ejs", {
        actionType: "Login",
    });    
});

app.get("/users/register", (req, res) => {
    res.render("users.ejs", {
        actionType: "Register",
    });
});

app.get("/users/update", (req, res) => {
    res.render("users.ejs", {
        actionType: "Update",
    });
});

app.get("/users/signout", (req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})