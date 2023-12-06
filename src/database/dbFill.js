const { hashSync } = require("bcrypt");
const {getClient} = require("./dbSetup");
const bcrypt = require("bcrypt");

async function fillDb() {
    const pgClient = getClient()
    try {
        const query = {
            name: 'fetch-admin',
            text: `SELECT * FROM users WHERE username = $1`,
            values: ['admin']
        };
        const res = await pgClient.query(query)
        if (res.rows.length === 0) {
            const password = await bcrypt.hash('admin', 10);
            const query = {
                name: 'insert-admin',
                text: `INSERT INTO users (username, password, role) VALUES ($1, $2, 'admin')`,
                values: ['admin', password]
            };
            await pgClient.query(query)
            console.log("Default admin inserted");
        } else {
            console.log("Default admin already exists");
        }

    } catch (error) {
        console.error("Error fillDb:", error.message);
    }
}

module.exports = {fillDb};
