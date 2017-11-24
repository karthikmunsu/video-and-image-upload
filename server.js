// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
var mysql = require('mysql');
var firebase = require("firebase");
const testFolder = '/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/';

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "fleet123",
  database: "crowdhere"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



//firebase configuration
 var config = {
    apiKey: "AIzaSyA8w0eWOImCc8avQp9LNStOOVjSlokZMkA",
    authDomain: "nodejs-crowdhere.firebaseapp.com",
    databaseURL: "https://nodejs-crowdhere.firebaseio.com",
    projectId: "nodejs-crowdhere",
    storageBucket: "nodejs-crowdhere.appspot.com",
    messagingSenderId: "785429721248"
  };
  firebase.initializeApp(config);

// Get our API routes
const api = require('./server/routes/api');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our api routes
app.use('/api', api);


//set File upload
//app.use(fileUpload());

// to set limit of the file upload
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

// Catch all other routes and return the index file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});



// for creating the tables in mysql
app.get('/create_table', function(req, res) {
 var sql = "CREATE TABLE users (email varchar(50) primary key, password varchar(15))";
 con.query(sql, function(err) {
   if(err) 
     console.log('users table already exists...')
 })
 res.write("user table & templates table created!");
 res.end();
})


// signup api
app.get('/signup',function(req, res) {
firebase.auth().createUserWithEmailAndPassword(req.query.email, req.query.password).then(function(data){
  res.status(200).send({message: "user created sucessfully"});
  res.end()
}).catch(function(error) {
  res.status(500).send(error);
  res.end()
});
 
})

//login api
app.get('/login', function(req, res){
  firebase.auth().signInWithEmailAndPassword(req.query.email, req.query.password).then(function(data){
res.status(200).send(data);
 res.end()
}).catch(function(error) {
  res.status(500).send(error);
 res.end()
  });
})


//forget username api
app.get('/forget', function(req, res){
firebase.auth().sendPasswordResetEmail(req.query.email).then(function(data){
res.status(200).send(data);
 res.end()
}).catch(function(error){
  res.status(500).send(error);
 res.end()
})
})

//viewing the images.
app.get('/img', function(req, res) {
var filenames = new Array();
fs.readdir(testFolder, (err, files) => {
  files.forEach(file => {
filenames.push(file);
  });
res.send(filenames);
})
  //res.sendFile('/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/*.jpg')
})


app.get('/imgfile', function(req, res) {
  res.sendFile('/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/'+req.query.image);
})

//post request for uploading the images
app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  //let file_ext = (req.files.sampleFile).split('.');
	//console.log(file_ext);
console.log(sampleFile.name);
 
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/'+sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);
 
    res.send('File uploaded!');
  });
});

//get request for uploading the videos
app.get('/video', function(req, res) {
  const path = '/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/SampleVideo_1280x720_2mb.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
