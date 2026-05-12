export async function getUserReviews(db, name) {
    const query = "SELECT getUserReviews($1)";
    const values = [name];
    let toReturn = [];
    try {
        const res = await db.query(query, values);
        if (res.rows) {
            res.rows
                .flatMap((x) => Object.values(x))
                .forEach((row) => {
                    row = row.slice(1, -1);
                    console.log(row);
                    const items = row.split(",");
                    toReturn.push({
                        id: parseInt(items[0]),
                        userId: parseInt(items[1]),
                        title: items[2],
                        author: items[3],
                        notes: items[4],
                        rating: parseInt(items[5]),
                        lastUpdateDate: new Date(items[6]),
                    });
                });
        }
        return toReturn;
    } catch (err) {
        console.error("Error executing function getUserReviews:", err);
        return null;
    }
}

export async function addReview(db, review) {
    // Pass NULL as a placeholder for the OUT parameter
    const query = "CALL addReview($1, $2, $3, $4, $5, $6, NULL)";
    const values = [
        review.userId,
        review.title,
        review.author,
        review.notes,
        review.rating,
        review.lastUpdateDate,
    ];

    try {
        console.log("review.userId=" + review.userId);
        const res = await db.query(query, values);
        // The OUT parameter values are returned in the first row
        return res.rows[0].returnid;
    } catch (err) {
        console.error("Error executing procedure addReview:", err);
        return -1;
    }
}

export async function updateReview(db, review) {
    const query = "CALL updateReview($1, $2, $3, $4)";
    const values = [
        review.reviewId,
        review.notes,
        review.rating,
        review.lastUpdateDate,
    ];

    try {
        const res = await db.query(query, values);
        return true;
    } catch (err) {
        console.error("Error executing procedure updateReview:", err);
        return false;
    }
}

export async function deleteReview(db, reviewId) {
    const query = "CALL deleteReview($1)";
    const values = [reviewId];

    try {
        const res = await db.query(query, values);
        return true;
    } catch (err) {
        console.error("Error executing procedure deleteReview:", err);
        return false;
    }
}
