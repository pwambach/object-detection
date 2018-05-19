import * as tf from '@tensorflow/tfjs';
import {IMAGE_WIDTH, IMAGE_HEIGHT} from './config';
import {drawImage, drawBBox} from './lib/draw';
import {getBatch} from './lib/get-batch';
import {plotAccuracies, plotLosses} from './lib/charts';

const canvas = document.getElementById('canvas');

const ITERATIONS = 200;
const LEARNING_RATE = 0.01;
const BATCH_SIZE = 1000;

// genrate training and validation data
let trainingBatch = getBatch(BATCH_SIZE);
let validationBatch = getBatch(BATCH_SIZE * 10);

// create model
const model = tf.sequential();

// model.add(tf.layers.dense({
//   inputDim: IMAGE_WIDTH * IMAGE_HEIGHT,
//   units: 200,
//   kernelInitializer: 'VarianceScaling',
//   activation: 'relu'
// }));


// // model.add(tf.layers.dropout({
// //   rate: 0.1
// // }));

// model.add(tf.layers.dense({
//   units: 40,
//   kernelInitializer: 'VarianceScaling',
//   activation: 'relu'
// }));

// model.add(tf.layers.dense({
//   units: 8,
//   kernelInitializer: 'VarianceScaling',
//   activation: 'relu'
// }));

// // Prepare the model for training: Specify the loss and the optimizer.
// model.compile({
//   loss: 'meanSquaredError',
//   optimizer: tf.train.adam(LEARNING_RATE),
//   metrics: ['accuracy']
// });

// add button listener
document.getElementById('stopButton')
  .addEventListener('click', () => {run = false});
document.getElementById('startButton')
  .addEventListener('click', () => {run = true; train()});
document.getElementById('predictButton')
  .addEventListener('click', () => predict());


model.add(tf.layers.conv2d({
  inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, 1],
  kernelSize: 4,
  filters: 2,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.conv2d({
  kernelSize: 4,
  filters: 4,
  strides: 2,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.conv2d({
  kernelSize: 2,
  filters: 8,
  strides: 2,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
  units: 8,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));



let iterationCount = 0;
let run = true;
let accuracyValues = [];
let lossValues = [];

function train() {
  model.fit(
    trainingBatch.features,
    trainingBatch.labels,
    {
      batchSize: BATCH_SIZE,
      validationData: [validationBatch.features, validationBatch.labels],
      epochs: 1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {}
      }
    }).then(history => {
      iterationCount++;

      if (run && iterationCount < ITERATIONS) {
        // plot charts
        const accuracy = history.history.acc[0];
        const loss = history.history.loss[0];
        accuracyValues.push({batch: iterationCount, accuracy, set: 'train'});
        plotAccuracies(accuracyValues);
        lossValues.push({batch: iterationCount, loss, set: 'train'});
        plotLosses(lossValues);
        console.log(`${iterationCount} - accuracy: ${accuracy.toFixed(2)}\tloss: ${loss.toFixed(2)}`);

        // switch labels
        const newLabels = getSwitchedLabels(trainingBatch);
        trainingBatch.labels.dispose();
        trainingBatch.labels = newLabels;

        setTimeout(() => train(), 0);
      } else {
        console.log(history);
        console.log("Training finished!");
      }
    });
}

function getSwitchedLabels(trainingBatch) {
  const {features, labels} = trainingBatch;

  return tf.tidy(() => {
    const newLabels = [];
    const predictions = tf.split(model.predict(features), BATCH_SIZE);
    const singleLabels = tf.split(labels, BATCH_SIZE);

    for (let i = 0; i < BATCH_SIZE; i++) {
      const prediction = predictions[i].squeeze();
      const label1 = singleLabels[i]
        .squeeze()
      // flip labels
      const label2 = label1
        .clone()
        .reshape([2,4])
        .reverse(0)
        .reshape([8])
        .squeeze();

      const error1 = tf.metrics.meanSquaredError(label1, prediction).dataSync()[0];
      const error2 = tf.metrics.meanSquaredError(label2, prediction).dataSync()[0];
      const switchedIsBetter = error2 < error1;
  
      if (switchedIsBetter) {
        console.log("switched");
      }

      // debugger;

      newLabels.push(switchedIsBetter ? label2 : label1);
    }

    return tf.stack(newLabels);
  });
}

function predict() {
  const {features, labels} = getBatch(1);
  const featuresArray = features.dataSync().slice(0, BATCH_SIZE);
  const labelsArray = labels.dataSync().slice(0, 8);
  const result = model.predict(features).dataSync();

  drawImage(featuresArray, canvas);
  drawBBox(result.slice(0, 4), canvas, 0, 0, 'blue');
  drawBBox(result.slice(4, 8), canvas, 0, 0, 'green');
}


function getIOU(bbox1, bbox2) {
  // Calculate overlap between two bounding boxes [x, y, w, h] as the area of intersection over the area of unity'''
  const [x1, y1, w1, h1] = bbox1;
  const [x2, y2, w2, h2] = bbox2;
  const w_I = Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2);
  const h_I = Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2);
  
  if (w_I <= 0 || h_I <= 0) {
    // no overlap
    return 0
  }

  const I = w_I * h_I;
  const U = w1 * h1 + w2 * h2 - I;

  return I / U;
}
