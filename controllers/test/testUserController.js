import {
    getUserPassword,
    getUserIdPassword,
    addUser,
    updateUser,
    deleteUser,
} from "../userController.js";
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

    let testUsers = [
        {
            username: "user001",
            password: "pass001",
        },
        {
            username: "user002",
            password: "pass002",
        },
    ];

    //add users
    for (const user of testUsers) {
        const id = await addUser(db, user.username, user.password);
        if (id === -1) {
            process.exit();
        }
        console.log("added user with id:" + id);
    }

    //get id and password of user001
    let data = await getUserIdPassword(db, testUsers[0].username);
    if (!data || data[0] <= 0 || data[1] !== testUsers[0].password) {
        console.error("Problem in test on getUserIdPassword");
        process.exit();
    }

    //get password of user001
    let pw = await getUserPassword(db, testUsers[0].username);
    if (pw !== testUsers[0].password) {
        console.error("Password mismatched 1");
        process.exit();
    }

    //change password on user001
    const newPass = "pass101";
    let res = await updateUser(db, testUsers[0].username, newPass);
    if (!res) {
        console.error("Failed update user");
        process.exit();
    }

    //check password of user001
    pw = await getUserPassword(db, testUsers[0].username);
    if (pw !== newPass) {
        // console.log(pw);
        console.error("Password mismatched 2");
        process.exit();
    }

    //delete user001
    res = await deleteUser(db, testUsers[0].username);
    if (!res) {
        console.error("Failed delete user 1");
        process.exit();
    }

    //get password of deleted user001
    pw = await getUserPassword(db, testUsers[0].username);
    if (pw !== "") {
        console.log(pw);
        console.error("Password mismatched 3");
        process.exit();
    }

    //clean up all test users
    res = await deleteUser(db, testUsers[1].username);
    if (!res) {
        console.error("Failed delete user 2");
        process.exit();
    }
    db.end();

    console.log("Hooray.  Tests completed successfully");
}

test();