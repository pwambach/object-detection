import embed from 'vega-embed';

const accuracyLabelElement = document.querySelector('.accuracy-label');
export function plotAccuracies(accuracyValues) {
  embed(
    '.accuracy-vis',
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      data: {values: accuracyValues},
      width: 260,
      mark: {type: 'line', legend: null},
      orient: 'vertical',
      encoding: {
        x: {field: 'batch', type: 'quantitative'},
        y: {field: 'accuracy', type: 'quantitative'},
        color: {field: 'set', type: 'nominal', legend: null}
      }
    },
    {width: 360, actions: false}
  );
  accuracyLabelElement.innerText =
    'last accuracy: ' +
    (accuracyValues[accuracyValues.length - 1].accuracy * 100).toFixed(2) +
    '%';
}

const lossLabelElement = document.querySelector('.loss-label');
export function plotLosses(lossValues) {
  embed(
    '.loss-vis',
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      data: {values: lossValues},
      mark: {type: 'line'},
      width: 260,
      orient: 'vertical',
      encoding: {
        x: {field: 'batch', type: 'quantitative'},
        y: {field: 'loss', type: 'quantitative'},
        color: {field: 'set', type: 'nominal', legend: null}
      }
    },
    {width: 360, actions: false}
  );
  lossLabelElement.innerText =
    'last loss: ' + lossValues[lossValues.length - 1].loss.toFixed(2);
}

const valAccuracyLabelElement = document.querySelector('.valAccuracy-label');
export function plotValAccuracies(values) {
  embed(
    '.valAccuracy-vis',
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      data: {values: values},
      width: 260,
      mark: {type: 'line', legend: null},
      orient: 'vertical',
      encoding: {
        x: {field: 'batch', type: 'quantitative'},
        y: {field: 'accuracy', type: 'quantitative'},
        color: {field: 'set', type: 'nominal', legend: null}
      }
    },
    {width: 360, actions: false}
  );
  valAccuracyLabelElement.innerText =
    'last accuracy: ' +
    (values[values.length - 1].accuracy * 100).toFixed(2) +
    '%';
}

const valLossLabelElement = document.querySelector('.valLoss-label');
export function plotValLosses(values) {
  embed(
    '.valLoss-vis',
    {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      data: {values: values},
      mark: {type: 'line'},
      width: 260,
      orient: 'vertical',
      encoding: {
        x: {field: 'batch', type: 'quantitative'},
        y: {field: 'loss', type: 'quantitative'},
        color: {field: 'set', type: 'nominal', legend: null}
      }
    },
    {width: 360, actions: false}
  );
  valLossLabelElement.innerText =
    'last loss: ' + values[values.length - 1].loss.toFixed(2);
}
