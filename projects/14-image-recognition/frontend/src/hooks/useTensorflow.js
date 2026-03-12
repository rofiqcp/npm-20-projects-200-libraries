import { useState, useRef, useCallback } from 'react';

let modelCache = null;
let modelLoading = false;
const modelListeners = [];

async function loadModel() {
  if (modelCache) return modelCache;
  if (modelLoading) {
    return new Promise((resolve) => modelListeners.push(resolve));
  }

  modelLoading = true;
  // Dynamic import so TF only loads when needed
  const tf = await import('@tensorflow/tfjs');
  await tf.ready();
  const cocoSsd = await import('@tensorflow-models/coco-ssd');
  const model = await cocoSsd.load({ base: 'mobilenet_v2' });
  modelCache = model;
  modelLoading = false;
  modelListeners.forEach((resolve) => resolve(model));
  modelListeners.length = 0;
  return model;
}

export function useTensorflow() {
  const [modelStatus, setModelStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const modelRef = useRef(null);

  const initModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    setModelStatus('loading');
    setError(null);
    try {
      const model = await loadModel();
      modelRef.current = model;
      setModelStatus('ready');
      return model;
    } catch (err) {
      console.error('Model load error:', err);
      setError(err.message);
      setModelStatus('error');
      throw err;
    }
  }, []);

  const detectObjects = useCallback(
    async (imageElement) => {
      let model = modelRef.current;
      if (!model) {
        model = await initModel();
      }

      const predictions = await model.detect(imageElement);
      return predictions.map((pred) => ({
        detection_type: 'object',
        class_name: pred.class,
        confidence: Math.round(pred.score * 100) / 100,
        bbox: {
          x: Math.round(pred.bbox[0]),
          y: Math.round(pred.bbox[1]),
          width: Math.round(pred.bbox[2]),
          height: Math.round(pred.bbox[3]),
        },
      }));
    },
    [initModel]
  );

  return { modelStatus, error, initModel, detectObjects };
}
