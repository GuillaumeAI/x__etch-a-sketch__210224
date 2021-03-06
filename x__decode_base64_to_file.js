'use strict';
// node v8.11.3
const Buffer = require('safer-buffer').Buffer;
const path = require('path');
const fs = require('fs');


var args = process.argv.slice(2);


var jsonFile = args[0];
var target = args[1];
var jsonData;
var stylizedImage;

//encode_base64('ddr.jpg');

fs.readFile(jsonFile, 'utf8', function (err, data) {
    if (err) throw err;
    // console.log(data);
    jsonData = JSON.parse(data);
    var tmp = jsonData.stylizedImage;

    
    stylizedImage = tmp
    .replace(/^data:image\/png;base64,/, "")
    .replace(/^data:image\/jpeg;base64,/, "")
    
    ;

   decode_base64(stylizedImage, target);

   // fs.writeFileSync(target, buff);
    console.log("should have written:" + target);
    

  });







/**
 * @param  {string} filename
 */
 function encode_base64(filename) {
    fs.readFile(path.join(__dirname, '/', filename), function(error, data) {
      if (error) {
        throw error;
      } else {
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        // console.log('Base64 ' + filename + ': ' + base64);
        return base64;
      }
    });
  }

  /**
   * @param  {string} base64str
   * @param  {string} filename
   */
  function decode_base64(base64str, filename) {
    let buf = Buffer.from(base64str, 'base64');
  
    fs.writeFileSync( filename, buf);

  }
  