//@STCGoal PImage to Base64 for API upload

import org.apache.commons.codec.binary.Base64;
import java.io.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
 
void setup() {
  size(1200, 600);
 
  String encoded = "";
  PImage decoded = createImage(500, 500, RGB);
 
  String fileLocation = "C:/Users/charles.fried/Documents/Window/FaceRecogntion/Face++/Faces/Charles/Snapshot_20170511.jpg";
 
  try {
    encoded = encodeToBase64(fileLocation);
  } 
  catch (IOException e) {
    e.printStackTrace();
  }
 
  try {
    decoded = DecodePImageFromBase64(encoded);
  } 
  catch (IOException e) {
    println(e);
  }
 
  image(decoded, 0, 0);
 
  String [] arrayForSave = {encoded};
  saveStrings("encoded.txt", arrayForSave);
}
 
private String encodeToBase64(String fileLoc) throws IOException, FileNotFoundException {
 
  File originalFile = new File(fileLoc);
  String encodedBase64 = null;
 
  FileInputStream fileInputStreamReader = new FileInputStream(originalFile);
  byte[] bytes = new byte[(int)originalFile.length()];
  fileInputStreamReader.read(bytes);
  encodedBase64 = new String(Base64.encodeBase64(bytes));
  fileInputStreamReader.close();
 
  return encodedBase64;
}
 
public PImage DecodePImageFromBase64(String i_Image64) throws IOException
{
  PImage result = null;
  byte[] decodedBytes = Base64.decodeBase64(i_Image64);
 
  ByteArrayInputStream in = new ByteArrayInputStream(decodedBytes);
  BufferedImage bImageFromConvert = ImageIO.read(in);
  BufferedImage convertedImg = new BufferedImage(bImageFromConvert.getWidth(), bImageFromConvert.getHeight(), BufferedImage.TYPE_INT_ARGB);
  convertedImg.getGraphics().drawImage(bImageFromConvert, 0, 0, null);
  result = new PImage(convertedImg);
 
  return result;
}