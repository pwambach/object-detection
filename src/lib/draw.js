import {IMAGE_WIDTH, IMAGE_HEIGHT} from '../config';

export function drawImage(image, canvas, xOffset = 0, yOffset = 0) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(IMAGE_WIDTH, IMAGE_HEIGHT);

  ctx.rect(xOffset, yOffset, IMAGE_WIDTH, IMAGE_HEIGHT);
  ctx.fillStyle = 'black';
  ctx.fill();

  for (let i = 0; i < IMAGE_WIDTH * IMAGE_HEIGHT; i++) {
    const x = i % IMAGE_WIDTH;
    const y = Math.floor(i / IMAGE_WIDTH);
    const r = image[i] * 255;
    const g = 0;
    const b = 0;
    const a = 255;
    setPixel(imageData, x, y, r, g, b, a);
  }

  ctx.putImageData(imageData, xOffset, yOffset);
}

function setPixel(imageData, x, y, r, g, b, a) {
  const index = (x + y * imageData.width) * 4;
  imageData.data[index + 0] = r;
  imageData.data[index + 1] = g;
  imageData.data[index + 2] = b;
  imageData.data[index + 3] = a;
}

export function drawBBox(bbox, canvas, xOffset = 0, yOffset = 0, color = 'green', fillColor = false) {
  const x = bbox[0] * IMAGE_WIDTH;
  const y = bbox[1] * IMAGE_HEIGHT;
  const width = bbox[2] * IMAGE_WIDTH;
  const height = bbox[3] * IMAGE_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.rect(x + xOffset, y + yOffset, width, height);

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

export function clear(canvas, width = IMAGE_WIDTH, height = IMAGE_HEIGHT, color = 'black', xOffset = 0, yOffset = 0) {
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.rect(xOffset, yOffset, width, height);
  ctx.fillStyle = color;
  ctx.fill();
}
