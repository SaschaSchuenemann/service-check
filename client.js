var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var url = require('url');
 
var port = 8080;

function returnStatus(response,color){
  fs.readFile("/pictures/" + color + ".png", function(error, content) {
    if (error) {
      response.writeHead(500);
      if (["green","yellow","red"].includes(color) ) {
        response.end('Sorry, color '+color+' not available\n');
      } else {
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
      response.end(); 
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}

// check query for color code matchings and update colorCodes object accordingly
function updateColorCodes(query,colorCodes){
  if ( query["green"] != null )
    colorCodes.green = query["green"].split(",");
  if ( query["yellow"] != null )
    colorCodes.yellow = query["yellow"].split(",");
}

// default mapping of response codes to colors, can be changed at request time
var colorCodes = {};
colorCodes.green = ["200"];
colorCodes.yellow = ["401","403","404"];
 
var s = http.createServer();
s.on('request', function(request, response) {
  console.log(request.method);
  console.log(request.headers);
  console.log(request.url);
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var requestedUrl = query["url"];
  contentType = 'image/png';



  // reset defaults on each request
  colorCodes.green = ["200"];
  colorCodes.yellow = ["401","403","404"];
  var color = "red";

  updateColorCodes(query,colorCodes);

  // choose appropriate module according to url protocol
  var requestHandler = http;

  // we need to check for requestedUrl = null incase it was not defined or a favicon is requested
  if ( (requestedUrl == null) ||  (!requestedUrl.startsWith("http")) )
    returnStatus(response,"red");
  else {
    if (requestedUrl.startsWith("https"))
      requestHandler = https;

    requestHandler.get(requestedUrl, (resp) => {
      let data = '';
     
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
     
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        statusCode = resp.statusCode
        if (colorCodes.yellow.includes(statusCode.toString()) )
          color = "yellow"
        if (colorCodes.green.includes(statusCode.toString()) )
          color = "green"
        returnStatus(response,color);

      });
    }).on("error", (err) => {
      returnStatus(response,"red");
    });
  };
});
 
s.listen(port);
console.log('Browse to http://127.0.0.1:' + port);
