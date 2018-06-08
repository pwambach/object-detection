import {tensor, tensor2d} from '@tensorflow/tfjs';
import {generateImages} from './images';
import {IMAGE_WIDTH, IMAGE_HEIGHT} from '../config';

/**
 * Returns a random generated batch of features and labels
 * @param {number} num The size of the batch
 * @returns {object} The batch {
 *   features: Tensor2d
 *   labels: Tensor2d
 *   origFeatures: array
 *   origLabels: array
 * }
 *  
 */
export function getBatch(num) {
  const {images, labels} = generateImages(num);

  const imageLength = IMAGE_WIDTH * IMAGE_HEIGHT;
  const fullImageData = new Uint8Array(num * imageLength);
  images.forEach((image, index) => {
    fullImageData.set(image, index * imageLength);
  });

  const labelLength = labels[0].length
  const fullLabelData = new Float32Array(num * labelLength);
  labels.forEach((label, index) => {
    fullLabelData.set(label, index * labelLength);
  });

  // normalize labels
  // for (let i = 0; i < fullLabelData.length; i++) {
  //   if (i % 4 === 0 || i % 4 === 2) {
  //     // x and width
  //     fullLabelData[i] = fullLabelData[i] / IMAGE_WIDTH;
  //   } else if (i % 4 === 1 || i % 4 === 3) {
  //     // y and height
  //     fullLabelData[i] = fullLabelData[i] / IMAGE_HEIGHT;
  //   }
  // }

  return {
    features: tensor(fullImageData, [num, IMAGE_WIDTH, IMAGE_HEIGHT, 1]),
    labels: tensor2d(fullLabelData, [num, labelLength])
  };
}
