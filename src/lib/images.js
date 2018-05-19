import * as tf from '@tensorflow/tfjs';
import {IMAGE_WIDTH, IMAGE_HEIGHT, BLACK, WHITE} from '../config';

const canvas = document.createElement('canvas');
canvas.width = IMAGE_WIDTH;
canvas.height = IMAGE_HEIGHT;
canvas.style.display = 'none';
document.body.appendChild(canvas);
const context = canvas.getContext('2d');

/**
 * Returns a defined number of images with the their corresponding labels
 * @param {number} num The number of images to return
 * @returns {object} An object containing a list of images and a list of labels
 */
export function generateImages(num) {
  const images = [];
  const labels = [];

  for (let i = 0; i < num; i++) {
    // const {image, label} = getImageWithOneBlackRect();
    const {image, label} = getImageWithTwoBlackRects();
    images.push(image);
    labels.push(label);
  }

  return {images, labels};
}

/**
 * Logs an image's byte representation to the console in a "viewable" format
 * @param {Uint8Array} bytes The image bytes
 */
export function logBytes(bytes) {
  let s = '';

  for (let i = 0; i < bytes.length; i++) {
    if (i > 0 && i % IMAGE_WIDTH === 0) {
      s += '\n';
    }

    if (i > 0 && i % (IMAGE_WIDTH * IMAGE_HEIGHT) === 0) {
      s += '\n';
    }

    s += bytes[i];
  }
  console.log(s);
}

function getImageWithOneBlackRect() {
  let x = Math.floor(Math.random() * IMAGE_WIDTH);
  let y = Math.floor(Math.random() * IMAGE_HEIGHT);
  // check that rectangle is always completely in canvas
  const w = Math.max(Math.floor(Math.random() * IMAGE_WIDTH / 2), 4);
  const h = Math.max(Math.floor(Math.random() * IMAGE_HEIGHT / 2), 4);
  x = Math.max(x - w, 0);
  y = Math.max(y - h, 0);

  // paint
  clear();
  const label = rectangle(x, y, w ,h, BLACK);
  const image = getBytes();

  return {image, label};
}

function getImageWithTwoBlackRects() {
  // RECT 1
  let x1 = Math.floor(Math.random() * IMAGE_WIDTH);
  let y1 = Math.floor(Math.random() * IMAGE_HEIGHT);
  // check that rectangle is always completely in canvas
  const w1 = Math.max(Math.floor(Math.random() * IMAGE_WIDTH / 2), 4);
  const h1 = Math.max(Math.floor(Math.random() * IMAGE_HEIGHT / 2), 4);
  x1 = Math.max(x1 - w1, 0);
  y1 = Math.max(y1 - h1, 0);

  // paint
  clear();
  const label1 = rectangle(x1, y1, w1 ,h1, BLACK);

  // RECT 1
  let x2 = Math.floor(Math.random() * IMAGE_WIDTH);
  let y2 = Math.floor(Math.random() * IMAGE_HEIGHT);
  // check that rectangle is always completely in canvas
  const w2 = Math.max(Math.floor(Math.random() * IMAGE_WIDTH / 2), 4);
  const h2 = Math.max(Math.floor(Math.random() * IMAGE_HEIGHT / 2), 4);
  x2 = Math.max(x2 - w2, 0);
  y2 = Math.max(y2 - h2, 0);

  const label2 = rectangle(x2, y2, w2 ,h2, BLACK);
  
  const image = getBytes();
  const label = new Uint8Array(label1.length + label2.length);
  label.set(label1, 0);
  label.set(label2, label1.length);

  return {image, label};
}

function getBytes() {
  const pixels = context.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT).data;
  const bytes = new Uint8Array(IMAGE_WIDTH * IMAGE_HEIGHT);

  for (let i = 0; i < pixels.length; i = i + 4) {
    const index = i / 4;
    bytes[i / 4] = pixels[i];
  }

  return bytes;
}

function clear() {
  rectangle(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT, WHITE);
}

function rectangle(x, y, w, h, color) {
  context.fillStyle = `rgb(${color}, ${color}, ${color})`;
  context.fillRect(x, y, w, h);

  return Uint8Array.from([x, y, w, h]);
}

// function circle(x, y, r, color) {
//   context.beginPath();
//   context.arc(x, y, r, 0, 2 * Math.PI);
//   context.strokeStyle = 'transparent';
//   context.stroke();
//   context.fillStyle = color;
//   context.fill();

//   return {type: CIRCLE, x, y, w: r * 2, h: r * 2, color};
// }
