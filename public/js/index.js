// ***********************************************************
//      This file is to test the connection from the static
//      page which is served when main url is hit
//     (used during start of production, not of much use now)
// ***********************************************************

/* <-----  Testing for JS Connection with Index Page  -----> */
console.log('JS is connected');


const jobsApiUrl = '/jobs';
const wagesApiUrl = '/wages';
const blogsApiUrl = '/blogs';
const singleBlogApiUrl = 'blogs/blog';


const sendReqBtn = document.getElementById('sendReq');

sendReqBtn.addEventListener('click', () => {

    let professionID = document.getElementById('profession').value;
    let urlString = getApiUrlForJobsWithProfessionID(professionID);
    // let urlString = getApiUrlForWagesWithProfessionID(professionID);
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            console.log(responseData);
        });
    });
});


function getApiUrlForJobsWithProfessionID(professionId) {
    let apiUrl = getBaseUrl();
    apiUrl += jobsApiUrl;
    apiUrl += `?professionId=${professionId}`;
    console.log('Url: ' + apiUrl);

    return apiUrl;
}


function getApiUrlForWagesWithProfessionID(professionId) {
    let apiUrl = getBaseUrl();
    apiUrl += wagesApiUrl;
    apiUrl += `?professionId=${professionId}`;
    console.log('Url: ' + apiUrl);

    return apiUrl;
}


const getBaseUrl = () => {
    return 'http://localhost:3000';
}