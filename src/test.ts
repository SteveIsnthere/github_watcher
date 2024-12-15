import SqlHelper from "./db";

// a test query to see if the connection is working
SqlHelper.executeQuery('Text', `
    SELECT *
    FROM Users
`, []).then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});