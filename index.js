import express from "express";
import pg from "pg";
import { addUser, updateUser, getUserPassword } from "./controllers/userController.js";
import { addReview } from "./controllers/reviewController.js";

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
            res.render("reviews.ejs", {
                actionType: "Add",
                username: req.body.username,
                password: req.body.password
            });
            break;

        default:
            res.sendStatus(404).send("Invalid actionType received:" + req.body.actionType);
    }
});

/* users routes */
app.post("/register", async (req, res) => {
    const id = await addUser(db, req.body.username, req.body.password);
    if (id >= 0) {
        res.render("index.ejs", {
            username: req.body.username,
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
    const pw = await getUserPassword(db, req.body.username);
    if (pw) {
        if (pw === req.body.password) {
            return res.render("index.ejs", {
                username: req.body.username,
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
    const pw = await getUserPassword(db, req.body.username);
    if (pw) {
        if (pw === req.body.password) {
            await updateUser(db, req.body.username, req.body.newPassword);
            return res.render("index.ejs", {
                username: req.body.username,
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

/* reviews routes */
app.post("/reviews/add", async (req, res) => {
    const data = await getUserIdPassword(db, req.body.username);
    if (data) {
        if (data[1] === req.body.password) {
            const review = {
                userId: data[0],
                title: req.body.title,
                author: req.body.author,
                notes: req.body.notes,
                rating: req.body.rating,
                lastUpdateDate: new Date()
            }
            const id = await addReview(db, review);
            if (id) {
                reviews = [review, ...reviews];
                return res.render("index.ejs", {
                    message: "Your review has been successfully added."
                });
            }
        }
    }

    res.render("index.ejs", {
        message: "Problem encountered in adding the review.\n  Please try again later."
    });
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})