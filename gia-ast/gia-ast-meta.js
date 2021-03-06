#!/usr/bin/env node
'use strict';


const giaenc = require("gia-lib-encoding-base64");



//dihostname
const http = require('http');
const https = require('https');

const axios = require('axios').default;
var path = require('path');

const Buffer = require('safer-buffer').Buffer;
const fs = require('fs');
const tempfile = require('tempfile');
const sharp = require('sharp');


var args = process.argv.slice(2);



if (args[0] == "--help" || args[0] == "-h" || args[0] == "-help" || args[0] == "--h" || !args[0] || !args[1]) {
  console.log(`
-------------------------------------
AST Web API Stylizer CLI Wrapper
by Guillaume D-Isabelle, 2021
Version 0.2.4
--------------------------------------
-------------HELP----------------------
Stylize an image using the Web API.

Synopsis:  
gia-ast <IMAGE-FILENAME> <ModelID> [x1] [x2] [x3] -a
 
-a  Auto suffix using x1,x2,x3...

usage : 
gia-ast mycontent.jpg 91
gia-ast mycontent.jpg 01
gia-ast mycontent.jpg 12 1280 2048 -1 -a

------------------------------
  `);
  if (!args[0] || !args[1]) console.log("MISSING ARGUMENTS");

  process.exit(1);

}


//----for later

// const yargs = require('yargs');
// var ver = yargs.version();

// var appStartMessage = 
// `Multi platform Contact Sheet maker
// By Guillaume Descoteaux-Isabelle, 2020-2021
// version ${ver}
// ----------------------------------------`;
// //const { argv } = require('process');
// //const { hideBin } = require('yargs/helpers')
// const argv = yargs(process.argv)

// .scriptName("gis-csm")
// .usage(appStartMessage)
//     // .command('serve [port]', 'start the server', (yargs) => {
//     //   yargs
//     //     .positional('f', {
//     //       describe: 'port to bind on',
//     //       type:'string',
//     //       default: 5000
//     //     })
//     // }, (argv) => {
//     //   if (argv.verbose) console.info(`start server on :${argv.port}`)
//     //   //serve(argv.port)
//     //   console.log("test");
//     //   console.info(`start server on :${argv.port}`)
//     // })
//     .option('file', {
//       alias: 'f',
//       type: 'string',
//       description: 'Specify the file out'
//     })
//     .option('directory', {
//       alias: 'd',
//       type: 'boolean',
//       default:false,
//       description: 'Name the output using current Basedirname'
//     }).usage(`gis-csm -d --label  # Assuming this file in directory: vm_s01-v01_768x___285k.jpg
//     # will extract 285 and add that instead of filename`)
//     .option('verbose', {
//       alias: 'v',
//       default:false,
//       type: 'boolean',
//       description: 'Run with verbose logging'
//     })
//     .option('label', {
//       alias: 'l',
//       type: 'boolean',
//       default:false,
//       description: 'Label using last digit in filename (used for parsing inference result that contain checkpoint number)'
//     })
//   .argv;


//-----------

var config = null;

const envListHelp = `
vi ~/.bash_env
export asthostname="orko.guillaumeisabelle.com"
export astoutsuffix="__stylized__"
export astportbase=90
export astcallprotocol="http"
export astcallmethod="stylize"
`;

try {
  //console.log("Do we have a dot env ??");
  var tst = require('dotenv').config()
  if (tst.parsed) {
    //console.log("We do :)");
    config = new Object()
    var { asthostname, astoutsuffix, astportbase, astcallprotocol, astcallmethod, astdebug, astsavemeta, astusemetasvr, astmetaportnum, astappendmodelid } = tst.parsed;

    config.hostname = asthostname; config.outsuffix = astoutsuffix; config.portbase = astportbase; config.callmethod = astcallmethod; config.callprotocol = astcallprotocol; 
    config.debug = astdebug == "true"; config.savemeta = astsavemeta == "true";
    config.usemetasvr = astusemetasvr == "true"; config.metaportnum = astmetaportnum;
    config.appendmodelid = astappendmodelid == "true";
    config.src = ".env";
    
    //Taking Env var if commented or absent from .env
    if (!astoutsuffix) config.outsuffix = process.env.astoutsuffix;
  }
  
  
} catch (error) {
  console.log("An error with .env");
  console.log("Hum, it might not be good, make sure you have one : cp env_sample .env ; vi .env");

 }

//console.log(config);
//process.exit(1);


try {
  //@a Init if we did not had a .env
  if (config == null) {
    config = require('./config');

    config.src = "config";
  }


} catch (error) {




  // console.error("config.js NOT FOUND.  ");
  //console.log("Read from ENV VAR");
  try {
    config = new Object();
    var envErr = 0;

    //----grab-the-env

    if (process.env.asthostname)
      config.hostname = process.env.asthostname;
    else envErr++;
    if (process.env.astoutsuffix)
      config.outsuffix = process.env.astoutsuffix;
    else envErr++;
    if (process.env.astportbase)
      config.portbase = process.env.astportbase;
    else envErr++;
    if (process.env.astcallprotocol)
      config.callprotocol = process.env.astcallprotocol;
    else envErr++;
    if (process.env.astcallmethod)
      config.callmethod = process.env.astcallmethod;
    else envErr++;
    config.src = "var";
    if (envErr > 0) {
      console.log("Env require setup");
      console.log(envListHelp);
    }

    //----grab-the-env

  } catch (error) {
    console.error("Require config.js or env var to be set");
    console.log(envListHelp);
    process.exit(1);

  }
}


// Lets do the work


var stylizedImage;
var imgFile = args[0];
var x1, x2, x3 = -1;
var xname = "";
var autosuffix = false;
var ext = path.extname(imgFile);
var imgFileBasename = path.basename(imgFile);
var imgFileNameOnly = imgFileBasename.replace(ext, "");


var resizeSwitch = false;
var targetResolutionX = 768; //DEPRECATING
// if (args[2]) {
//   resizeSwitch = true;
//   targetResolutionX = Number(args[2]);
// }

if (args[2]) { x1 = Number(args[2]); } else x1 = -1
if (args[3]) { x2 = Number(args[3]); } else x2 = -1
if (args[4]) { x3 = Number(args[4]); } else x3 = -1

var autosuffixSuffix = "__";
if (args[5] && args[5] == "-a") { autosuffix = true; } else autosuffix = false;
if (args[6]) { autosuffixSuffix = args[6]; }

// console.log(`
// x1:${x1}
// x2:${x2}
// x3:${x3}
// `);
//process.exit(1);

//ModelID is related to a port will use
var modelid = args[1];
var targetOutput = imgFileNameOnly + config.outsuffix + modelid + ext;

if (autosuffix) {
  var x1str = x1 != -1 ? x1 + "x" : "";
  var x2str = x2 != -1 ? x2 + "x" : "";
  var x3str = x3 != -1 ? x3 + "x" : "";
  if (x3 == -1) x2str = x2;
  xname = x1str + x2str + x3str;
  targetOutput = imgFileNameOnly + "__" + xname + autosuffixSuffix + modelid + ext;
}

//console.log("TargetOutput: " + targetOutput);
var portnum = config.portbase + modelid;

const callurl = config.callprotocol + "://" + config.hostname + ":" + portnum + "/" + config.callmethod.replace("/", "");
const callurlmeta = config.callprotocol + "://" + config.hostname + ":" + config.metaportnum + "/" + portnum + ".json";




console.log("Processing: " + imgFile + " at port :" + portnum);

/*
//Use later to resized the image if switch used
sharp('input.jpg')
  .rotate()
  .resize(200)
  .jpeg({ mozjpeg: true })
  .toBuffer()
  .then( data => { ... })
  .catch( err => { ... });
  */
//  doWeResize(imgFile, config, portnum, callurl, callurlmeta,targetOutput, resizeSwitch, targetResolutionX);
doTheWork(imgFile, config, portnum, callurl, callurlmeta, targetOutput, x1, x2, x3, autosuffix);




/**
 * 
 * DEPRECATED 
 * @param {*} imgFile 
 * @param {*} config 
 * @param {*} portnum 
 * @param {*} callurl 
 * @param {*} targetOutput 
 * @param {*} resizeSwitch 
 * @param {*} targetResolutionX 
 */
function doWeResize(imgFile, config, portnum, callurl, callurlmeta, targetOutput, resizeSwitch = false, targetResolutionX = 512) {

  if (resizeSwitch) {
    var tfile = tempfile('.jpg');
    //console.log("Tempfile:" + tfile);

    sharp(imgFile)
      .resize(targetResolutionX)
      .toFile(tfile, (err, info) => {
        if (err) console.error(err);
        //console.log(info);
        console.log("A resized contentImage should be available at that path :\n    feh " + tfile
          + "  \n     with resolution : " + targetResolutionX);
        // process.exit(1); 
        doTheWork(tfile, config, portnum, callurl, targetOutput);
      });
  } else  //no resize command
  {
    console.log("Normal mode");
    doTheWork(imgFile, config, portnum, callurl, callurlmeta, targetOutput, x1, x2, x3);
  }


}


function doTheWork(cFile, config, portnum, callurl, callurlmeta, targetOutput, x1 = -1, x2 = -1, x3 = -1, autosuffix = false) {
  try {

    var data = giaenc.
      encFileToJSONStringifyBase64PropWithOptionalResolutions(cFile, "contentImage", x1, x2, x3);
    // if (x1 != -1) data.x1= x1;
    // if (x2 != -1) data.x2= x2;
    // if (x3 != -1) data.x3= x3;

    //console.log(data);
    //var unparsedData = JSON.parse(data);

    //---------------------

    const options = {
      hostname: config.hostname,
      port: portnum,
      path: config.callmethod,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      responseType: 'json',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })

    };

    const optionsMeta = {
      hostname: config.hostname,
      port: 8999,
      path: portnum + ".json",
      method: 'GET',
      responseType: 'json',
      httpsAgent: new https.Agent({ rejectUnauthorized: false })

    };
    console.log("Calling : " + config.hostname + ":" + portnum);

    axios.post(callurl, data, options)
      .then(function (response) {
        // var d = JSON.parse(response);
        var { data } = response;
        var { stylizedImage } = data;


        //---import
        // decode_base64_to_file(stylizedImage, targetOutput);
        if (config.debug ) fs.writeFileSync("__stylizedImage.json", JSON.stringify(data));

        if (!config.usemetasvr) {
          saveStylizedResult(stylizedImage,data, targetOutput, config);
        }
        else {
          //@a CHG the output using a Call to meta server
         if (config.debug) console.log("Calling Meta: " + callurlmeta);

          axios.get(callurlmeta, optionsMeta)
            .then(function (metaResp) {
              var metadata = metaResp.data;
              //console.log(metadata);
              var { checkpointno, svrtype, PASS1IMAGESIZE, PASS2IMAGESIZE, PASS3IMAGESIZE, modelname, fname, containername, containertag, mtype } = metaResp.data;
              var xtraModelID= config.appendmodelid ? "__" + modelid: "" ;

              var mtag = `${fname}_${xname}-${svrtype}__${checkpointno}k`;

              targetOutput = (imgFileNameOnly 
              + "__"
              + modelid 
              + "_"
               + mtag
               + xtraModelID
               + ext).replace("_-","_") 
               ;
              // targetOutput = imgFileNameOnly + "__" + mtag + autosuffixSuffix + modelid + ext;
              //process.exit(1);
              saveStylizedResult(stylizedImage,data, targetOutput, config,metadata);

            })
            .catch(function (errMeta) {
              console.log("There was error with meta server (your file might save right anyway");
              console.log(errMeta.message);
              console.log("---------arrrr 3 (meta)");

              saveStylizedResult(stylizedImage, targetOutput, config);
            });

          //@a then save result
          // saveStylizedResult(stylizedImage, targetOutput, config);
        }




        //console.log(stylizedImage);
      })
      .catch(function (err) {
        console.log("There was error");
        console.log(err.message);
        console.log("---------arrrr 2");
      });


    //-----------------------


  } catch (error) {
    console.log("something went wrong: ");
    console.log(error);
    console.log(error.message);
    console.log("---------arrrr 1");
  }
}


function saveStylizedResult(stylizedImage,data, targetOutput, config,metaData=null) {
  giaenc.dec64_StringToFile(stylizedImage, targetOutput);

  if (config.savemeta ) {
    data.stylizedImage = null;
    if (metaData) data.meta = metaData;

    fs.writeFileSync(targetOutput + ".json", JSON.stringify(data));
  }

  console.log("A stylizedImage should be available at that path :\n    feh " + targetOutput);
}

