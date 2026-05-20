import express from "express";
import pg from "pg";
import { addUser, updateUser, getUserPassword, getUserIdPassword } from "./controllers/userController.js";
import { addReview, getAllReviews } from "./controllers/reviewController.js";
import { getBookCoverUrl } from "./openLibraryApi.js"

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

app.get("/", async (req, res) => {
    reviews = await getAllReviews(db);
    // console.log("reviews=" + reviews);
    if (reviews) {
        for (let i = 0; i < reviews.length; i++) {
            reviews[i].coverUrl = await getBookCoverUrl(reviews[i].title, reviews[i].author);
            reviews[i].isOwned = false;
            // console.log(reviews[i]);
        }
    }

    res.render("index.ejs", {
        reviews: reviews
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

app.post("/addreview", async (req, res) => {
    const pw = await getUserPassword(db, req.body.username);
    if (pw) {
        if (pw === req.body.password) {
            return res.render("reviews.ejs", {
                actionType: "Add",
                username: req.body.username,
                password: req.body.password
            });
        }
    }

    res.render("users.ejs", {
        actionType: "Login",
        message: "The username and password were not matched.  Please login before adding a new review.",
        username: "",
        password: ""
    });    
});

/* users routes */
app.post("/register", async (req, res) => {
    const id = await addUser(db, req.body.username, req.body.password);
    if (id >= 0) {
        res.render("index.ejs", {
            username: req.body.username,
            password: req.body.password,
            reviews: reviews
        });
    } else {
        // console.log(id);
        res.render("users.ejs", {
            actionType: "Register",
            message: "The requested username was already in use.  Please try again."
        });
    }
});

app.post("/login", async (req, res) => {
    const idPw = await getUserIdPassword(db, req.body.username);
    if (idPw) {
        if (idPw[1] === req.body.password) {
            if (reviews) {
                for (let i = 0; i < reviews.length; i++) {
                    reviews[i].isOwned = reviews[i].userId === idPw[0];
                }
            }

            return res.render("index.ejs", {
                username: req.body.username,
                password: idPw[1],
                reviews: reviews,
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
                message: "The password was successfully updated.",
                reviews: reviews
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
                review.id = id;
                review.coverUrl = getBookCoverUrl(review.title, review.author);
                reviews = [review, ...reviews];
                return res.render("index.ejs", {
                    username: req.body.username,
                    password: req.body.password,
                    message: "Your review has been successfully added.",
                    reviews: reviews,
                });
            }
        }
    }

    res.render("index.ejs", {
        username: req.body.username,
        password: req.body.password,
        message:
            "Problem encountered in adding the review.\n  Please try again later.",
        reviews: reviews,
    });
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})