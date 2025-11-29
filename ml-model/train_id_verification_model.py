#!/usr/bin/env python3
"""
ID Card Verification Model Training Script
============================================
This script trains a CNN model to verify if an uploaded image is a valid ID card.

Dataset: IndCard dataset from MASK-RCNN-Dataset
Output: TensorFlow SavedModel + TensorFlow.js model for browser inference

Usage:
    python train_id_verification_model.py

The model classifies images as:
- valid_id: Real ID card with expected features
- invalid_id: Not a valid ID card (fake, damaged, or wrong document)
"""

import os
import json
import numpy as np
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from PIL import Image
import random
from sklearn.model_selection import train_test_split

# Configuration
BASE_DIR = Path(__file__).parent.parent
DATASET_DIR = BASE_DIR / "MASK-RCNN-Dataset-master" / "IndCard"
MODEL_OUTPUT_DIR = BASE_DIR / "ml-model" / "saved_model"
TFJS_OUTPUT_DIR = BASE_DIR / "public" / "ml-model"

# Model parameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 8
EPOCHS = 30
LEARNING_RATE = 0.001

print("=" * 60)
print("ID Card Verification Model Training")
print("=" * 60)


def load_and_preprocess_image(image_path, target_size=IMG_SIZE):
    """Load and preprocess a single image."""
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        img_array = np.array(img) / 255.0  # Normalize to [0, 1]
        return img_array
    except Exception as e:
        print(f"Error loading {image_path}: {e}")
        return None


def create_dataset():
    """Create training dataset from IndCard images."""
    print("\n📁 Loading dataset...")
    
    # Paths to images
    original_dir = DATASET_DIR / "Original"
    augmented_dir = DATASET_DIR / "Augmented"
    
    valid_images = []
    
    # Load original images (labeled as valid ID cards)
    if original_dir.exists():
        for img_file in original_dir.glob("*"):
            if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                img = load_and_preprocess_image(img_file)
                if img is not None:
                    valid_images.append((img, 1))  # 1 = valid ID card
    
    # Load augmented images (also valid ID cards)
    if augmented_dir.exists():
        for img_file in augmented_dir.glob("*"):
            if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                img = load_and_preprocess_image(img_file)
                if img is not None:
                    valid_images.append((img, 1))  # 1 = valid ID card
    
    print(f"   ✓ Loaded {len(valid_images)} valid ID card images")
    
    # Create synthetic "invalid" examples by:
    # 1. Random noise images
    # 2. Heavily distorted versions of valid images
    # 3. Random color patches
    
    invalid_images = []
    num_synthetic = len(valid_images)
    
    for i in range(num_synthetic):
        choice = random.choice(['noise', 'distorted', 'color_patch', 'blur'])
        
        if choice == 'noise':
            # Random noise image
            noise = np.random.rand(*IMG_SIZE, 3)
            invalid_images.append((noise, 0))
            
        elif choice == 'distorted' and valid_images:
            # Heavily distorted valid image
            base_img = random.choice(valid_images)[0].copy()
            # Add heavy noise
            noise = np.random.normal(0, 0.3, base_img.shape)
            distorted = np.clip(base_img + noise, 0, 1)
            invalid_images.append((distorted, 0))
            
        elif choice == 'color_patch':
            # Random solid color or gradient
            color = np.random.rand(3)
            patch = np.ones((*IMG_SIZE, 3)) * color
            # Add some variation
            gradient = np.linspace(0, 1, IMG_SIZE[0])[:, np.newaxis, np.newaxis]
            patch = patch * (0.5 + 0.5 * gradient)
            invalid_images.append((patch, 0))
            
        elif choice == 'blur' and valid_images:
            # Extremely blurred version
            base_img = random.choice(valid_images)[0].copy()
            # Simulate heavy blur by downscaling and upscaling
            small = tf.image.resize(base_img, (16, 16))
            blurred = tf.image.resize(small, IMG_SIZE).numpy()
            blurred = np.clip(blurred + np.random.normal(0, 0.1, blurred.shape), 0, 1)
            invalid_images.append((blurred, 0))
    
    print(f"   ✓ Created {len(invalid_images)} invalid/synthetic examples")
    
    # Combine datasets
    all_data = valid_images + invalid_images
    random.shuffle(all_data)
    
    X = np.array([item[0] for item in all_data])
    y = np.array([item[1] for item in all_data])
    
    print(f"   ✓ Total dataset size: {len(X)} images")
    print(f"   ✓ Valid ID cards: {np.sum(y)} | Invalid: {len(y) - np.sum(y)}")
    
    return X, y


def create_model():
    """Create the CNN model for ID verification."""
    print("\n🏗️  Building model architecture...")
    
    # Use a simple but effective CNN architecture
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=(*IMG_SIZE, 3)),
        
        # Convolutional blocks
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Flatten and Dense layers
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        
        # Output layer (binary classification: valid/invalid)
        layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    model.summary()
    return model


def train_model(model, X_train, y_train, X_val, y_val):
    """Train the model with callbacks."""
    print("\n🚀 Starting training...")
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        )
    ]
    
    # Data augmentation
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
    ])
    
    # Apply augmentation to training data
    train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train))
    train_dataset = train_dataset.shuffle(1000).batch(BATCH_SIZE)
    train_dataset = train_dataset.map(
        lambda x, y: (data_augmentation(x, training=True), y),
        num_parallel_calls=tf.data.AUTOTUNE
    ).prefetch(tf.data.AUTOTUNE)
    
    val_dataset = tf.data.Dataset.from_tensor_slices((X_val, y_val))
    val_dataset = val_dataset.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    return history


def evaluate_model(model, X_test, y_test):
    """Evaluate model performance."""
    print("\n📊 Evaluating model...")
    
    results = model.evaluate(X_test, y_test, verbose=0)
    
    print(f"   Loss: {results[0]:.4f}")
    print(f"   Accuracy: {results[1]:.4f}")
    print(f"   Precision: {results[2]:.4f}")
    print(f"   Recall: {results[3]:.4f}")
    
    # Test some predictions
    predictions = model.predict(X_test[:10], verbose=0)
    print("\n   Sample predictions (first 10):")
    for i, (pred, actual) in enumerate(zip(predictions[:10], y_test[:10])):
        status = "✓" if (pred[0] > 0.5) == actual else "✗"
        print(f"   {status} Pred: {pred[0]:.3f} | Actual: {actual}")
    
    return results


def save_model(model):
    """Save model in multiple formats."""
    print("\n💾 Saving model...")
    
    # Create output directories
    MODEL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TFJS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save as TensorFlow SavedModel
    saved_model_path = MODEL_OUTPUT_DIR / "id_verification_model"
    model.save(str(saved_model_path))
    print(f"   ✓ Saved TensorFlow model to: {saved_model_path}")
    
    # Save as Keras H5
    h5_path = MODEL_OUTPUT_DIR / "id_verification_model.h5"
    model.save(str(h5_path))
    print(f"   ✓ Saved Keras H5 model to: {h5_path}")
    
    # Convert to TensorFlow.js format
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, str(TFJS_OUTPUT_DIR))
        print(f"   ✓ Saved TensorFlow.js model to: {TFJS_OUTPUT_DIR}")
    except ImportError:
        print("   ⚠ tensorflowjs not installed. Skipping TFJS conversion.")
        print("   Run: pip install tensorflowjs")
    except Exception as e:
        print(f"   ⚠ TFJS conversion failed: {e}")
    
    # Save model metadata
    metadata = {
        "model_name": "ID Card Verification Model",
        "version": "1.0.0",
        "input_shape": [IMG_SIZE[0], IMG_SIZE[1], 3],
        "output": "probability (0-1), >0.5 = valid ID card",
        "classes": ["invalid", "valid"],
        "training_dataset": "IndCard (MASK-RCNN-Dataset)",
        "accuracy": "See training logs"
    }
    
    with open(MODEL_OUTPUT_DIR / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✓ Saved model metadata")


def main():
    """Main training pipeline."""
    # Check if dataset exists
    if not DATASET_DIR.exists():
        print(f"❌ Dataset not found at: {DATASET_DIR}")
        print("Please ensure the MASK-RCNN-Dataset is in the correct location.")
        return
    
    # Load dataset
    X, y = create_dataset()
    
    if len(X) == 0:
        print("❌ No images found in dataset!")
        return
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"\n📊 Data split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Validation: {len(X_val)} samples")
    print(f"   Test: {len(X_test)} samples")
    
    # Create and train model
    model = create_model()
    history = train_model(model, X_train, y_train, X_val, y_val)
    
    # Evaluate
    evaluate_model(model, X_test, y_test)
    
    # Save model
    save_model(model)
    
    print("\n" + "=" * 60)
    print("✅ Training complete!")
    print("=" * 60)
    print(f"\nModel saved to: {MODEL_OUTPUT_DIR}")
    print(f"TensorFlow.js model saved to: {TFJS_OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Test the model with: python test_model.py")
    print("2. The TFJS model can be loaded in the browser")


if __name__ == "__main__":
    main()

