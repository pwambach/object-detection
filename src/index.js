import * as tf from '@tensorflow/tfjs';
import {IMAGE_WIDTH, IMAGE_HEIGHT} from './config';
import {drawImage, drawBBox, clear} from './lib/draw';
import {getBatch} from './lib/get-batch';
import {plotAccuracies, plotLosses, plotValLosses, plotValAccuracies} from './lib/charts';

const canvas = document.getElementById('canvas');

const ITERATIONS = 1000;
const LEARNING_RATE = 0.01;
const BATCH_SIZE = 5000;

// genrate training and validation data
let trainingBatch = getBatch(BATCH_SIZE);
let validationBatch = getBatch(BATCH_SIZE / 2);

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
  .addEventListener('click', () => {
    run = true;
    iterationCount = 0;
    train();
  });
document.getElementById('predictButton')
  .addEventListener('click', () => predict());


model.add(tf.layers.conv2d({
  inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, 1],
  kernelSize: 4,
  filters: 1,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.conv2d({
  kernelSize: 4,
  filters: 1,
  strides: 2,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
  units: 100,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

model.add(tf.layers.dense({
  units: 8,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({
  loss: 'meanSquaredError',
  optimizer: tf.train.adam(LEARNING_RATE),
  metrics: ['accuracy']
});

let iterationCount = 0;
let run = true;
let accuracyValues = [];
let lossValues = [];
let valAccuracyValues = [];
let valLossValues = [];

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
        const valAcc = history.history.val_acc[0];
        const valLoss = history.history.val_loss[0];

        accuracyValues.push({batch: iterationCount, accuracy, set: 'train'});
        plotAccuracies(accuracyValues);
        lossValues.push({batch: iterationCount, loss, set: 'train'});
        plotLosses(lossValues);

        valAccuracyValues.push({batch: iterationCount, accuracy: valAcc, set: 'train'});
        plotValAccuracies(valAccuracyValues);
        valLossValues.push({batch: iterationCount, loss: valLoss, set: 'train'});
        plotValLosses(valLossValues);
        console.log(`${iterationCount} - accuracy: ${accuracy.toFixed(2)} (${valAcc})\tloss: ${loss.toFixed(5)} (${valLoss})`);

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

      let switchedIsBetter = error2 < error1;

      if (switchedIsBetter) {
        console.log("switched");
      }

      newLabels.push(switchedIsBetter ? label2 : label1);
    }

    return tf.stack(newLabels);
  });
}

function predict() {
  const {features, labels} = getBatch(1);
  const featuresArray = features.dataSync();
  const labelsArray = labels.dataSync();
  const prediction = model.predict(features);
  const result = prediction.dataSync();

  const realBbox1 = labelsArray.slice(0, 4);
  const realBbox2 = labelsArray.slice(4);
  const predictedBbox1 = result.slice(0, 4);
  const predictedBbox2 = result.slice(4);

  const pred = model.predict(validationBatch.features);
  debugger;
  console.log('MESE Validation', tf.metrics.meanSquaredError(validationBatch.labels, pred).dataSync()[0]);

  const pred2 = model.predict(trainingBatch.features);
  console.log('MESE Training', tf.metrics.meanSquaredError(trainingBatch.labels, pred2).dataSync()[0]);


  // console.log('MSE 1:', tf.metrics.meanSquaredError(labels, prediction).dataSync()[0]);
 
 
  // console.log('IOU 1: ', getIOU(realBbox1, predictedBbox1));
  // console.log('IOU 2: ', getIOU(realBbox2, predictedBbox2));



  const predictions = tf.split(model.predict(trainingBatch.features), BATCH_SIZE);
  const singleLabels = tf.split(trainingBatch.labels, BATCH_SIZE);

  const i = Math.floor(Math.random() * BATCH_SIZE);
  const p = predictions[i].squeeze().dataSync();
  const label1 = singleLabels[i].squeeze().dataSync();

  clear(canvas);
  drawBBox(label1.slice(0, 4), canvas, 0, 0, 'red', 'red');
  drawBBox(label1.slice(4), canvas, 0, 0, 'red', 'red');
  drawBBox(p.slice(0, 4), canvas, 0, 0, 'orange');
  drawBBox(p.slice(4), canvas, 0, 0, 'yellow');

  // debugger;


  //drawImage(featuresArray, canvas);
  drawBBox(predictedBbox1, canvas, 0, 0, 'blue');
  drawBBox(predictedBbox2, canvas, 0, 0, 'green');
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
