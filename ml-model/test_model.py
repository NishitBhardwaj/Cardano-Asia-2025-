#!/usr/bin/env python3
"""
Test the trained ID Card Verification Model
============================================
This script tests the trained model on sample images.

Usage:
    python test_model.py [image_path]
    python test_model.py  # Tests with random dataset images
"""

import sys
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

# Configuration
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "ml-model" / "saved_model" / "id_verification_model"
DATASET_DIR = BASE_DIR / "MASK-RCNN-Dataset-master" / "IndCard" / "Original"
IMG_SIZE = (224, 224)


def load_and_preprocess_image(image_path):
    """Load and preprocess image for model inference."""
    img = Image.open(image_path).convert('RGB')
    img = img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)


def verify_id(model, image_path):
    """Verify if an image is a valid ID card."""
    img = load_and_preprocess_image(image_path)
    prediction = model.predict(img, verbose=0)[0][0]
    
    is_valid = prediction > 0.5
    confidence = prediction if is_valid else (1 - prediction)
    
    return {
        "is_valid": is_valid,
        "confidence": float(confidence),
        "raw_score": float(prediction),
        "status": "valid" if is_valid else "invalid"
    }


def main():
    print("=" * 60)
    print("ID Card Verification Model Test")
    print("=" * 60)
    
    # Load model
    if not MODEL_PATH.exists():
        print(f"❌ Model not found at: {MODEL_PATH}")
        print("Please run train_id_verification_model.py first.")
        return
    
    print(f"\n📂 Loading model from: {MODEL_PATH}")
    model = tf.keras.models.load_model(str(MODEL_PATH))
    print("✓ Model loaded successfully")
    
    # Test with provided image or random dataset images
    if len(sys.argv) > 1:
        image_path = Path(sys.argv[1])
        if not image_path.exists():
            print(f"❌ Image not found: {image_path}")
            return
        
        print(f"\n🔍 Testing image: {image_path}")
        result = verify_id(model, image_path)
        print(f"\n   Status: {'✓ VALID ID CARD' if result['is_valid'] else '✗ INVALID'}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Raw Score: {result['raw_score']:.4f}")
    
    else:
        # Test with random dataset images
        if not DATASET_DIR.exists():
            print(f"❌ Dataset not found at: {DATASET_DIR}")
            return
        
        image_files = list(DATASET_DIR.glob("*"))
        image_files = [f for f in image_files if f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
        
        if not image_files:
            print("❌ No images found in dataset")
            return
        
        print(f"\n🔍 Testing {min(5, len(image_files))} random images from dataset...\n")
        
        import random
        test_images = random.sample(image_files, min(5, len(image_files)))
        
        for img_path in test_images:
            result = verify_id(model, img_path)
            status = "✓ VALID" if result['is_valid'] else "✗ INVALID"
            print(f"   {img_path.name}: {status} (confidence: {result['confidence']:.2%})")
    
    print("\n" + "=" * 60)
    print("✅ Testing complete!")


if __name__ == "__main__":
    main()

