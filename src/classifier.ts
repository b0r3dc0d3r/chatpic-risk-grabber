import fs from "fs";
import path from "path";

// import * as tf from '@tensorflow/tfjs-node'; // switch to this if gpu not supported
import * as tf from '@tensorflow/tfjs-node-gpu';

import * as nsfw from 'nsfwjs';
import * as faceapi from 'face-api.js';

import { Canvas, ImageData, Image, loadImage } from 'canvas';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
(faceapi as any).env.monkeyPatch({ Canvas, Image, ImageData })

export class Classifier {

  public static NSFWModel: any;
  public static sampleImagesResults: any[] = [];

  static async init() {
    const modelsPath = path.join(__dirname, '/../../models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath)
    await faceapi.nets.ageGenderNet.loadFromDisk(modelsPath);
    await faceapi.nets.faceExpressionNet.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
    this.NSFWModel = await nsfw.load();

    const samplesPaths = path.join(__dirname, '/../../samples');
    const sampleFiles = fs.readdirSync(samplesPaths);

    for (const sf of sampleFiles) {
      const filePath = path.join(samplesPaths, sf);
      const input = await loadImage(fs.readFileSync(filePath)) as any;
      
      this.sampleImagesResults.push(
        {
          filename: sf,
          results: await faceapi.detectAllFaces( input )
            .withFaceLandmarks()
            .withFaceDescriptors()
        }
      )
    }
  }

  static async findSamples(imgData: any, buffer: any) {
    try {
      const input = await loadImage(buffer) as any;
      const detections = await faceapi.detectAllFaces( input )
                                      .withFaceLandmarks()
                                      .withFaceDescriptors() as any;
      
      let found = false;

      for (const sir of this.sampleImagesResults) {
        let sirFaceCount = 0;
        for (const res of sir.results) {
          sirFaceCount++;
          let detFaceCount = 0;

          const faceMatcher = new faceapi.FaceMatcher(res);
          
          for (const det of detections) {
            detFaceCount++;
            const bestMatch = faceMatcher.findBestMatch(det.descriptor);
            // console.log(`${imgData.ownerNickname} >> ${imgData.name} (face ${detFaceCount}) - VS ${sir.filename} (face ${sirFaceCount}) : ${bestMatch.label} @ ${bestMatch.distance}`)
  
            if (bestMatch.distance <= 0.45) {
              found = true;
            }
          }
        }
      }

      return found;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  static async scanImage(imgData: any, buffer: any) {
    try {
      const input = await loadImage(buffer) as any;
      const faces = await faceapi.detectAllFaces( input )
                                      .withFaceExpressions()
                                      .withAgeAndGender();

      const image = await tf.node.decodeImage(buffer,3)
      const nswfRes = await this.NSFWModel.classify(image);

      return { faces: faces, nsfw: nswfRes }; 
    } catch (error) {
      console.log(error);
      return {};
    }
  }
}