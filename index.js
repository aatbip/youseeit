const express = require('express');
//const router = express.Router();
const {spawn} = require('child_process');
const path = require('path');
const app = express(); 
const http = require('http'); 
const server = http.createServer(app);
//const server = http.createServer(app); 
const { Server } = require("socket.io");
const io = new Server(server); 
const https = require('https'); 

function runScript(){
  return spawn('python3', [
	 "-u",
    path.join(__dirname, 'stt_pos.py')
  ]);
}

function runScriptTrans(){
  return spawn('python3', [
	 "-u",
    path.join(__dirname, 'stt_posTrans.py')
  ]);
}
const subprocess = runScript()
const subprocessTrans = runScriptTrans()

// print output of script

app.get('/', (req,res) => {

	res.sendFile(__dirname + '/index.html');
});

//io.on('connection', (socket) => {
subprocessTrans.stdout.on('data', (data) => {
function sendMsg(socket, data)  {
        //console.log(myjson.Transcript);
        //console.log(myjson.Elements);
	mystr = data.toString(); 
	myjson = JSON.parse(data);
	data1 = myjson.Transcript; 
	socket.broadcast.emit('message', data1);
};
});
//});

//subprocess.stdout.on('data',(data) => {
//	sendMsg(socket,data)
//});

io.on('connection', (socket) => {
subprocessTrans.stdout.on('data', (data) => {
  //console.log(`data:${data.toString()}`);
	//socket.on('message', (data) => {
	
	mystr = data.toString(); 
	myjson = JSON.parse(data);
	data1 = myjson.Transcript;
	//socket.broadcast.emit('message', data1); 
        io.emit('message', data1.toString());
	});
});
//});

/////$$$$$%%%%%%-----BING API STARTS HERE-------$$$$$$%%%%%%%//////////////
let subscriptionKey = 'b978860b34b54f82b3ef1595e8f0cabd'
let host = 'api.bing.microsoft.com';
let path1 = '/v7.0/images/search';
io.on('connection', (socket, data) => { 
	subprocess.stdout.on('data', (data) => {
		mystr = data.toString();
		myjson = JSON.parse(data); 
		term = myjson.Elements;
		//if (typeof term1 !== "undefined") {
		//	term = term1
		//term1 = myjson.Elements2;
		//term = term.concat(' ',term1); 
let response_handler = function (response) {
    let body = '';
    response.on('data', function (d) {
        body += d;
    });
    response.on('end', function () {
        let imageResults = JSON.parse(body);
      if (imageResults.value.length === 0 || imageResults.value.length < 3) {
	      console.log("No results Found"); }
	    else {
         imageUrl1 = imageResults.value[0].thumbnailUrl;
  	imageUrl2 = imageResults.value[9].thumbnailUrl;
	//console.log(imageResults); 
	socket.broadcast.emit('message1', imageUrl1);
      io.emit('message1', imageUrl1);

	socket.broadcast.emit('message1', imageUrl2);
	    io.emit('message2', imageUrl2);

	socket.broadcast.emit('keywords', term);
      io.emit('keywords', term);
	    }
	    });
	
	console.log
    response.on('error', function (e) {
        console.log('Error: ' + e.message);
    });
};
let bing_image_search = function (search) {
	//if (term.isEmpty() == true) {
	//	console.log('no words');
	//}		else{
  console.log('Searching images for: ' + term);
  let request_params = {
        method : 'GET',
        hostname : host,
        path : path1 + '?q=' + encodeURIComponent(search),
        headers : {
            'Ocp-Apim-Subscription-Key' : subscriptionKey,
        }
    };
    let req = https.request(request_params, response_handler);
req.end();
}

if (subscriptionKey.length === 32) {
    bing_image_search(term);
} else {
    console.log('Invalid Bing Search API subscription key!');
    console.log('Please paste yours into the source code.');
}
//}
});
});


//$$$$$$$$%%%%%%%-----BING API ENDS HERE---------$$$$$$%%%%%%/////////////

server.listen(3000, () => {
  console.log('listening on *:3000');
});


//subprocess.stderr.on('data', (data) => {
//  console.log(`error:${data}`);
//});
//subprocess.on('close', () => {
//  console.log("Closed");
//});

//module.exports = router
 
