// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');


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


//viewing the images.
app.get('/img', function(req, res) {
  res.sendFile('/home/karthik/Documents/karthik/chrome_server/crowdhere_testing/uploaded_images/meena.jpg')
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
