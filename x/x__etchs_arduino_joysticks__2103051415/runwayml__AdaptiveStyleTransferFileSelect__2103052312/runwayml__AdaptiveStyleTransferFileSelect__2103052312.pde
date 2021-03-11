//I will use this example to get an inference from a local machine running RunwayML Model Servers
//--------------------------------------------------------------

// Copyright (C) 2020 RunwayML Examples
// 
// This file is part of RunwayML Examples.
// 
// Runway-Examples is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Runway-Examples is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with RunwayML.  If not, see <http://www.gnu.org/licenses/>.
// 
// ===========================================================================

// RUNWAYML
// www.runwayml.com

// Adaptive-Style-Transfer
// Receive HTTP messages from Runway
// Running Adaptive-Style-Transfer model
// example by George Profenza

// import Runway library
import com.runwayml.*;
// reference to runway instance
RunwayHTTP runway;

PImage contentImage;
PImage runwayResult;

// status
String status = "Press 'c' to select content image";
String hostName = "192.168.2.44" ;
int serverPort = 8000;


void setup(){
  // match sketch size to default model camera setup
  size(1200,400);
  // setup Runway
  runway = new RunwayHTTP(this,hostName,serverPort);
  // update manually
  runway.setAutoUpdate(false);
}

void draw(){
  background(0);
  // draw content image
  if(contentImage != null){
    image(contentImage,0,0);
  }
  // draw image received from Runway
  if(runwayResult != null){
    image(runwayResult,600,0);
  }
  // display status
  text(status,5,15);
}

void keyPressed(){
  if(key == 'c'){
    selectInput("Select a content image to process:", "contentImageSelected");
  }
}

void contentImageSelected(File selection) {
  if (selection == null) {
    println("Window was closed or the user hit cancel.");
  } else {
    println("selected " + selection.getAbsolutePath());
    contentImage = loadImage(selection.getAbsolutePath());
    // resize image (adjust as needed)
    contentImage.resize(600,400);
    // send it to Runway
    runway.query(contentImage,ModelUtils.IMAGE_FORMAT_JPG,"contentImage");
  }
}

// this is called when new Runway data is available
void runwayDataEvent(JSONObject runwayData){
  // point the sketch data to the Runway incoming data 
  String base64ImageString = runwayData.getString("stylizedImage");
  // try to decode the image from
  try{
    runwayResult = ModelUtils.fromBase64(base64ImageString);
  }catch(Exception e){
    e.printStackTrace();
  }
  status = "received runway result";
}

// this is called each time Processing connects to Runway
// Runway sends information about the current model
public void runwayInfoEvent(JSONObject info){
  println(info);
}
// if anything goes wrong
public void runwayErrorEvent(String message){
  println(message);
}
