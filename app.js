// ***********************************************************
//      Core Node Modules
// ***********************************************************
const path = require('path');



// ***********************************************************
//      NPM Node Modules
// ***********************************************************
const express = require('express');
const mysql = require('mysql');



// ***********************************************************
//      Custom Node Modules
// ***********************************************************



// ***********************************************************
//      Setting up Node Server using ExpressJS
// ***********************************************************

const server = express();
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});


/* <-----  Returning a static page when the main url of the server is hit  -----> */
const pubDirPath = path.join(__dirname, 'public')
server.use(express.static(pubDirPath));


/* <-----  This code solved the issue when hitting the server from other location of the website
as our website is on in the public folder of the server directory  -----> */
let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    next();
}
server.use(allowCrossDomain);


/* <-----  
The code below is used to connect the server to a 
database server hosted locally on the same domain.  
-----> */
/* var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'metier'
}); */


/* <-----  The code below is used to connect the server to a database server remotely such as the one on Plesk.  -----> */
/* 
var connection = mysql.createConnection({
    host: 'metier.wmdd.ca',
    port: '3306',
    user: 'metier_admin_db',
    password: 'g55Svp~0',
    database: 'metier_db'
});
 */


/* <-----  
The code below is used to connect the server to the database server hosted on Plesk. Now, 
that database server is literally hosted on the same domain that is why 'localhost' works fine
for the key 'host' and no need to refer it to 'metier.wmdd.ca'.
-----> */
var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'metier_admin_db',
    password: 'g55Svp~0',
    database: 'metier_db'
});


/* <-----  Testing connection to Database Server at the start of Web Server  -----> */
connection.connect(function (error) {
    if (!!error) {
        console.log('Database Connection Error !!');
    } else {
        console.log('Database Connected');
    }
})



// ***********************************************************
//      Implementing different routes into our Server
// ***********************************************************

/* <-----  Route for the main server url (Not useful now as we are sending the static html page)  -----> */
server.get('', (req, res) => {

    /* res.send({
        apiCalled: "Main Server",
        message: "Api Call Successful"
    }); */

    connection.query('SELECT * FROM City', function (error, rows, fiels) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
        } else {
            console.log('Success\n');
            res.send(rows);
        }
    });

});


/* <-----  Route for '/jobs', requires a professionId, returns cities data with lat, lng, jobCounts  -----> */
server.get('/jobs', (req, res) => {

    /* res.send({
        apiCalled: "Jobs API",
        message: "Api Call Successful"
    }); */

    let professionId = req.query.professionId;
    if (!professionId) {
        res.send({
            error: 'You must provide a professionId'
        });
    } else {

        fetchRecordsForJobsInCities(professionId, (status, data) => {
            if (status === 'Error') {
                res.send({
                    error: 'Error in Database Query !!'
                })
            } else if (status === 'Success') {
                res.send({
                    data: data
                })
            }
        })
    }
});


/* <-----  Route for '/wages', requires a professionId, returns provinces data with average wages  -----> */
server.get('/wages', (req, res) => {

    let professionId = req.query.professionId;
    if (!professionId) {
        res.send({
            error: 'You must provide a professionId'
        });
    } else {

        fetchRecordsForWagesInProvinces(professionId, (status, data) => {
            if (status === 'Error') {
                res.send({
                    error: 'Error in Database Query !!'
                })
            } else if (status === 'Success') {
                res.send({
                    data: data
                });
            }
        });
    }
});


/* <-----  Route for '/jobCategoryList', returns list of job categories  -----> */
server.get('/jobCategoryList', (req, res) => {

    fetchRecordsForJobCategoryList((status, fetchedData) => {
        if (status === 'Error') {
            res.send({
                error: 'Error in Database Query !!'
            })
        } else if (status === 'Success') {
            res.send({
                data: fetchedData
            })
        }
    })
});


/* <-----  Route for '/blogs', returns list of blogs  -----> */
server.get('/blogs', (req, res) => {

    fetchRecordsForBlogsList((status, fetchedData) => {
        if (status === 'Error') {
            res.send({
                error: 'Error in Database Query !!'
            })
        } else if (status === 'Success') {
            res.send({
                data: fetchedData
            })
        }
    })
});


/* <-----  Route for '/blogs/blog', requires a blogId, returns data for a particular blog  -----> */
server.get('/blogs/blog', (req, res) => {

    let blogID = req.query.blogId;
    if (!blogID) {
        res.send({
            error: 'You must provide a Blog ID'
        });
    } else {

        fetchRecordsForBlogData(blogID, (status, fetchedData) => {
            if (status === 'Error') {
                res.send({
                    error: 'Error in Database Query !!'
                })
            } else if (status === 'Success') {
                res.send({
                    data: fetchedData
                })
            }
        })
    }
});


/* <-----  Route for '/defaultHomeDataUrl', returns data for the heatmap on home page  -----> */
server.get('/defaultHomeDataUrl', (req, res) => {

    fetchRecordsForDefaultMapData((status, fetchedData) => {
        if (status === 'Error') {
            res.send({
                error: 'Error in Database Query !!'
            })
        } else if (status === 'Success') {
            res.send({
                data: fetchedData
            })
        }
    })
});



// ***********************************************************
//      Database Query Functions 
// ***********************************************************

/* <-----  Function to fetch job counts of 3 related professions for heat map on home page  -----> */
const fetchRecordsForDefaultMapData = (callback) => {

    let queryString = `SELECT City.City_Name, City.Lat, City.Lng, Job_Category_City_Link.Number_Of_Job FROM City, Job_Category_City_Link WHERE City.City_ID = Job_Category_City_Link.City_ID AND Category_ID IN (1, 4, 26) AND Number_Of_Job > 0`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
        } else {
            console.log('Default Map Data Database Query Successful');
            // console.log(rows);
            callback('Success', rows);
        }
    });
}


/* <-----  Function to fetch job category list from the database  -----> */
const fetchRecordsForJobCategoryList = (callback) => {

    let queryString = `SELECT * FROM Job_Category`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
        } else {
            console.log('Job Category List Database Query Successful');
            // console.log(rows);
            callback('Success', rows);
        }
    });
}


/* <-----  Function to fetch number of jobs for a particular profession in different cities (with lat, lng)  -----> */
const fetchRecordsForJobsInCities = (professionId, callback) => {

    let queryString = `SELECT City.City_Name, City.Lat, City.Lng, Job_Category_City_Link.Number_Of_Job FROM City, Job_Category_City_Link WHERE City.City_ID = Job_Category_City_Link.City_ID AND Job_Category_City_Link.Category_ID = ${professionId} AND Number_Of_Job > 0`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
            // return 'Error in database query';
        } else {
            console.log('Jobs Data Database Query Successful');
            // console.log(rows);
            callback('Success', rows);
            // return rows;
        }
    });
}


/* <-----  Function to fetch average wages in different provinces for a particular profession  -----> */
const fetchRecordsForWagesInProvinces = (professionId, callback) => {

    let queryString = `SELECT Province_Code, Province_Name, Wage.Average_Wage FROM Province, Wage, Job_Category WHERE Province.Province_ID = Wage.Province_ID AND Wage.Job_Category_ID = Job_Category.Category_ID And Job_Category_ID = ${professionId}`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
        } else {
            console.log('Wages Data Database Query Successful');
            callback('Success', rows);
        }
    });
}


/* <-----  Function to fetch list of blogs from the database  -----> */
const fetchRecordsForBlogsList = (callback) => {

    let queryString = `SELECT Blog_ID, Blog_Title, Blog_Description, Blog_Date, Blog_Image_Thumbnail_Link, Blog_Type FROM Blog ORDER BY Blog_Date DESC`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
        } else {
            console.log('Blogs List Database Query Successful');
            callback('Success', rows);
        }
    });
}


/* <-----  Function to fetch blog data for a particular blog by blogID  -----> */
const fetchRecordsForBlogData = (blogID, callback) => {

    let queryString = `SELECT * FROM Blog WHERE Blog_ID = ${blogID}`;

    connection.query(queryString, function (error, rows, fields) {
        if (!!error) {
            console.log('Error in database query\n');
            console.log(error);
            callback('Error', null);
        } else {
            console.log('Single Blog Database Query Successful');
            callback('Success', rows);
        }
    });
}