# ID Card Verification ML Model

This directory contains the machine learning model for verifying ID card documents.

## Overview

The model is a Convolutional Neural Network (CNN) trained on the IndCard dataset to classify images as:
- **Valid ID Card**: Real, authentic ID cards with expected features
- **Invalid**: Fake, damaged, or non-ID card images

## Dataset

- **Source**: MASK-RCNN-Dataset-master/IndCard
- **Training Data**: Original + Augmented ID card images
- **Synthetic Invalid Data**: Random noise, distorted images, color patches

## Model Architecture

```
Input (224x224x3)
    ↓
Conv2D(32) → BatchNorm → MaxPool → Dropout
    ↓
Conv2D(64) → BatchNorm → MaxPool → Dropout
    ↓
Conv2D(128) → BatchNorm → MaxPool → Dropout
    ↓
Conv2D(256) → BatchNorm → MaxPool → Dropout
    ↓
Flatten → Dense(256) → Dense(128) → Dense(1, sigmoid)
```

## Training

### Prerequisites

```bash
pip install -r requirements.txt
```

### Train the Model

```bash
cd ml-model
python train_id_verification_model.py
```

This will:
1. Load images from IndCard dataset
2. Create synthetic invalid examples
3. Train the CNN model
4. Save model in multiple formats:
   - TensorFlow SavedModel: `saved_model/id_verification_model/`
   - Keras H5: `saved_model/id_verification_model.h5`
   - TensorFlow.js: `../public/ml-model/`

### Test the Model

```bash
# Test with random dataset images
python test_model.py

# Test with specific image
python test_model.py /path/to/image.jpg
```

## Integration with DApp

### Client-Side (Browser - TensorFlow.js)

The model is exported to TensorFlow.js format and can be loaded in the browser:

```javascript
import * as tf from '@tensorflow/tfjs';

// Load model
const model = await tf.loadLayersModel('/ml-model/model.json');

// Preprocess image (224x224, normalized)
const tensor = tf.browser.fromPixels(imageElement)
  .resizeBilinear([224, 224])
  .div(255)
  .expandDims();

// Predict
const prediction = await model.predict(tensor).data();
const isValid = prediction[0] > 0.5;
const confidence = isValid ? prediction[0] : (1 - prediction[0]);
```

### Server-Side (Python API)

```python
import tensorflow as tf

model = tf.keras.models.load_model('ml-model/saved_model/id_verification_model')

def verify_id(image_array):
    # image_array should be (224, 224, 3) normalized to [0, 1]
    prediction = model.predict(image_array[np.newaxis, ...])[0][0]
    return {
        'is_valid': prediction > 0.5,
        'confidence': float(prediction if prediction > 0.5 else 1 - prediction)
    }
```

## Files

```
ml-model/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── train_id_verification_model.py   # Training script
├── test_model.py                # Testing script
└── saved_model/                 # Output directory
    ├── id_verification_model/   # TensorFlow SavedModel
    ├── id_verification_model.h5 # Keras H5 format
    └── model_metadata.json      # Model info
```

## Performance

- **Training Accuracy**: ~90-95% (varies based on training)
- **Validation Accuracy**: ~85-90%
- **Inference Time**: ~50-100ms per image (browser)

## Notes

1. The model is designed for demo/hackathon purposes
2. For production, train on a larger, more diverse dataset
3. Consider using transfer learning (MobileNet, EfficientNet)
4. The TensorFlow.js model can run entirely in the browser

