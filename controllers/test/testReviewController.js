import { addUser, deleteUser } from "../userController.js";
import {
    getUserReviews,
    addReview,
    updateReview,
    deleteReview,
} from "../reviewController.js";
import pg from "pg";

async function test() {
    const db = new pg.Client({
        user: "postgres",
        host: "localhost",
        database: "booknotes",
        password: "Rocket222",
        port: 5432,
    });
    db.connect();

    let testUser = {
        username: "user001",
        password: "pass001",
    };

    let testReviews = [
        {
            title: "title001",
            author: "author001",
            notes: "notes001",
            rating: 1,
            lastUpdateDate: new Date(),
        },
        {
            title: "title002",
            author: "author002",
            notes: "notes002",
            rating: 2,
            lastUpdateDate: new Date(),
        },
    ];

    //add user
    const userId = await addUser(db, testUser.username, testUser.password);
    console.log("userId=" + userId);

    //add reviews
    for (let review of testReviews) {
        const id = await addReview(db, { userId: userId, ...review });
        if (id === -1) {
            process.exit();
        }
        console.log("added review with id:" + id);
        review.id = id;
    }

    //get reviews of user001
    let reviews = await getUserReviews(db, testUser.username);
    console.log(reviews);
    if (
        !reviews.find((x) => x.title === testReviews[0].title) ||
        !reviews.find((x) => x.title === testReviews[1].title)
    ) {
        console.error("Failed to get user reviews 1");
        process.exit();
    }

    //change details of a review of user001
    const newReview = {
        reviewId: reviews[0].id,
        notes: "notes101",
        rating: 11,
        lastUpdateDate: new Date(),
    };

    let res = await updateReview(db, newReview);
    if (!res) {
        console.error("Failed update review");
        process.exit();
    }

    //check content of the changed review
    reviews = await getUserReviews(db, testUser.username);
    const updatedReview = reviews.find((x) => x.title === testReviews[0].title);
    if (!updatedReview) {
        console.error("Failed to get user reviews 1");
        process.exit();
    }

    if (
        updatedReview.notes !== newReview.notes ||
        updatedReview.rating !== newReview.rating
    ) {
        console.error("Review not updated");
        process.exit();
    }

    //delete review001
    res = await deleteReview(db, testReviews[0].id);
    if (!res) {
        console.error("Failed delete review 1");
        process.exit();
    }

    //get reviews of user001
    reviews = await getUserReviews(db, testUser.username);
    if (reviews.length !== 1 || reviews[0].title !== "title002") {
        console.error("Something wrong in deleting review");
        process.exit();
    }

    //clean up all test reviews
    res = await deleteReview(db, testReviews[1].id);
    if (!res) {
        console.error("Failed delete review 2");
        process.exit();
    }

    //clean up test user
    res = await deleteUser(db, testUser.username);
    if (!res) {
        console.error("Failed delete user");
        process.exit();
    }

    db.end();
    console.log("Hooray.  Tests completed successfully");
}

test();
