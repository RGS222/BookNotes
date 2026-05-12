export async function getUserPassword(db, name) {
    // Pass NULL as a placeholder for the OUT parameter
    const query = "CALL getUserPassword($1, NULL)";
    const values = [name];

    try {
        const res = await db.query(query, values);
        // The OUT parameter values are returned in the first row
        if (res.rows[0].pass) {
            return res.rows[0].pass;
        } else {
            return "";
        }
    } catch (err) {
        console.error("Error executing procedure getUserPassword:", err);
        return null;
    }
}

export async function addUser(db, name, pass) {
    // Pass NULL as a placeholder for the OUT parameter
    const query = "CALL addUser($1, $2, NULL)";
    const values = [name, pass];

    try {
        const res = await db.query(query, values);
        // The OUT parameter values are returned in the first row
        return res.rows[0].returnid;
    } catch (err) {
        console.error("Error executing procedure addUser:", err);
        return -1;
    }
}

export async function updateUser(db, name, newPassword) {
    // Pass NULL as a placeholder for the OUT parameter
    const query = "CALL updateUser($1, $2)";
    const values = [name, newPassword];

    try {
        const res = await db.query(query, values);
        // The OUT parameter values are returned in the first row
        return true;
    } catch (err) {
        console.error("Error executing procedure updateUser:", err);
        return false;
    }
}

export async function deleteUser(db, name) {
    const query = "CALL deleteUser($1)";
    const values = [name];

    try {
        const res = await db.query(query, values);
        return true;
    } catch (err) {
        console.error("Error executing procedure deleteUser:", err);
        return false;
    }
}
