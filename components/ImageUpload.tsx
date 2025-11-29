'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
    onImageChange: (base64: string | null) => void;
    currentImage?: string | null;
    maxSizeKB?: number;
    label?: string;
    placeholder?: string;
}

export default function ImageUpload({
    onImageChange,
    currentImage = null,
    maxSizeKB = 500,
    label = 'Campaign Image',
    placeholder = 'Upload an image for your campaign'
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = useCallback(async (file: File, maxSizeBytes: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;
                    
                    // Calculate new dimensions (max 800px)
                    const maxDimension = 800;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    // Try different quality levels to get under max size
                    let quality = 0.8;
                    let result = canvas.toDataURL('image/jpeg', quality);
                    
                    while (result.length > maxSizeBytes * 1.37 && quality > 0.1) { // 1.37 is base64 overhead
                        quality -= 0.1;
                        result = canvas.toDataURL('image/jpeg', quality);
                    }

                    if (result.length > maxSizeBytes * 1.37) {
                        reject(new Error(`Image too large. Please choose a smaller image.`));
                        return;
                    }

                    resolve(result);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsProcessing(true);

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            setIsProcessing(false);
            return;
        }

        try {
            const compressed = await compressImage(file, maxSizeKB * 1024);
            setPreview(compressed);
            onImageChange(compressed);
        } catch (err: any) {
            setError(err.message || 'Failed to process image');
            setPreview(null);
            onImageChange(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files?.[0];
        if (file && fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            handleFileChange({ target: { files: [file] } } as any);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">{label}</label>
            
            {preview ? (
                <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Remove Image
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-colors"
                >
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-foreground/60">Processing image...</p>
                        </div>
                    ) : (
                        <>
                            <svg className="w-12 h-12 text-foreground/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-foreground/60">{placeholder}</p>
                            <p className="text-xs text-foreground/40 mt-1">Click or drag image here (max {maxSizeKB}KB)</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

