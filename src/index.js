import * as tf from '@tensorflow/tfjs';
import {generateImages, logBytes} from './data/images';
import {IMAGE_WIDTH, IMAGE_HEIGHT, BATCH_SIZE} from './config';
import {drawImage, drawBBox} from './lib/draw';

const canvas = document.getElementById('canvas');

const ITERATIONS = 1000;
const LEARNING_RATE = 0.11;

let trainingBatch = getBatch(BATCH_SIZE);
let validationBatch = getBatch(BATCH_SIZE * 10);

const model = tf.sequential();

model.add(tf.layers.dense({
  units: 200,
  inputDim: IMAGE_WIDTH * IMAGE_HEIGHT,
  kernelInitializer: 'VarianceScaling',
  activation: 'relu'
}));

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
  optimizer: tf.train.sgd(LEARNING_RATE),
  metrics: ['accuracy']
});

// Train the model using the data.
const validationData = [validationBatch.features, validationBatch.labels];
let iterationCount = 0;
let run = true;

function train() {
  model.fit(
    trainingBatch.features,
    trainingBatch.labels,
    {
      batchSize: BATCH_SIZE,
      validationData: [validationBatch.features, validationBatch.labels],
      epochs: 1
    }).then(history => {
      iterationCount++;

      console.log(iterationCount, history.history.acc, history.history.loss);
      
      if (run && iterationCount < ITERATIONS) {
        trainingBatch.features.dispose();
        trainingBatch.labels.dispose();
        trainingBatch = getBatch(BATCH_SIZE);
        setTimeout(() => train(), 0);
      } else {
        console.log(history);
        console.log("Training finished!");
      }
    });
}

function predict() {
  const {features, origFeatures, origLabels} = getBatch(1);
  drawImage(origFeatures[0], canvas);
  const result = model.predict(features).dataSync();
  console.log(new Float32Array(origLabels[0]).map(x => x / 32), result);
  drawBBox(result, canvas, 0, 0, 'blue');
}

document.getElementById('stopButton')
  .addEventListener('click', () => {run = false});
document.getElementById('startButton')
  .addEventListener('click', () => train());
document.getElementById('predictButton')
  .addEventListener('click', () => predict());

function getBatch(num) {
  const {images, labels} = generateImages(num);

  const imageLength = IMAGE_WIDTH * IMAGE_HEIGHT;
  const fullImageData = new Uint8Array(num * imageLength);
  images.forEach((image, index) => {
    fullImageData.set(image, index * imageLength);
  });

  const labelLength = labels[0].length
  const fullLabelData = new Float32Array(num * labels[0].length);
  labels.forEach((label, index) => {
    fullLabelData.set(label, index * labels[0].length);
  });

  // normalize labels
  for (let i = 0; i < fullLabelData.length; i++) {
    if (i % 4 === 0 || i % 4 === 2) {
      // x and width
      fullLabelData[i] = fullLabelData[i] / IMAGE_WIDTH;
    } else if (i % 4 === 1 || i % 4 === 3) {
      // y and height
      fullLabelData[i] = fullLabelData[i] / IMAGE_HEIGHT;
    }
  }

  return {
    features: tf.tensor2d(fullImageData, [num, imageLength]),
    labels: tf.tensor2d(fullLabelData, [num, labelLength]),
    origFeatures: images,
    origLabels: labels
  };
}

