import SqlHelper from 'mssql-by-steve';
import dotenv from 'dotenv';
dotenv.config();

SqlHelper.initialize({
    user: process.env.db_user || "",
    password: process.env.db_password || "",
    server: process.env.server || "",
    database: process.env.database || "",
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 10000,
    },
});


export default SqlHelper;