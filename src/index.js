import * as tf from '@tensorflow/tfjs';
import {IMAGE_WIDTH, IMAGE_HEIGHT} from './config';
import {drawImage, drawBBox} from './lib/draw';
import {getBatch} from './lib/get-batch';

const canvas = document.getElementById('canvas');

const ITERATIONS = 10;
const LEARNING_RATE = 0.001;
const BATCH_SIZE = 10000;

// genrate training and validation data
let trainingBatch = getBatch(BATCH_SIZE);
let validationBatch = getBatch(BATCH_SIZE);

// create model
const model = tf.sequential();

model.add(tf.layers.dense({
  inputDim: IMAGE_WIDTH * IMAGE_HEIGHT,
  units: 200,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

// model.add(tf.layers.dropout({
//   rate: 0.1
// }));

model.add(tf.layers.dense({
  units: 40,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

model.add(tf.layers.dense({
  units: 4,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

// Prepare the model for training: Specify the loss and the optimizer.
model.compile({
  loss: 'meanSquaredError',
  optimizer: tf.train.adam(LEARNING_RATE),
  metrics: ['accuracy']
});

// add button listener
document.getElementById('stopButton')
  .addEventListener('click', () => {run = false});
document.getElementById('startButton')
  .addEventListener('click', () => train());
document.getElementById('predictButton')
  .addEventListener('click', () => predict());


// model.add(tf.layers.conv2d({
//   inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, 1],
//   kernelSize: 8,
//   filters: 2,
//   strides: 1,
//   activation: 'relu',
//   kernelInitializer: 'VarianceScaling'
// }));

// model.add(tf.layers.conv2d({
//   kernelSize: 6,
//   filters: 8,
//   strides: 2,
//   activation: 'relu',
//   kernelInitializer: 'VarianceScaling'
// }));

// model.add(tf.layers.flatten());

// model.add(tf.layers.dense({
//   units: 4,
//   kernelInitializer: 'VarianceScaling',
//   activation: 'relu'
// }));



let iterationCount = 0;
let run = true;

function train() {
  model.fit(
    trainingBatch.features,
    trainingBatch.labels,
    {
      batchSize: BATCH_SIZE,
      validationData: [validationBatch.features, validationBatch.labels],
      epochs: 100,
      callbacks: {
        onEpochEnd: (epoch, logs) => console.log(epoch, logs)
      }
    }).then(history => {
      iterationCount++;

      console.log(`${iterationCount} - accuracy: ${history.history.acc[0].toFixed(2)}\tloss: ${history.history.loss[0].toFixed(2)}`);
      
      // if (run && iterationCount < ITERATIONS) {
      //   trainingBatch.features.dispose();
      //   trainingBatch.labels.dispose();
      //   trainingBatch = getBatch(BATCH_SIZE);
      //   setTimeout(() => train(), 0);
      // } else {
        console.log(history);
        console.log("Training finished!");
      // }
    });
}

function predict() {
  const {features, origFeatures, origLabels} = getBatch(1);
  drawImage(origFeatures[0], canvas);
  const result = model.predict(features).dataSync();
  console.log(new Float32Array(origLabels[0]).map(x => x / 32), result);
  drawBBox(result, canvas, 0, 0, 'blue');
}
