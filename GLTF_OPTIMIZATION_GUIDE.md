# GLTF Optimization Guide

## Overview
This document explains the GLTF optimizations implemented for mobile devices to improve loading performance and reduce memory usage.

## Current Optimizations

### 1. Progressive Loading
- **Loading Progress Indicator**: Shows real-time loading progress with a visual progress bar
- **Timeout Handling**: Extended timeout on mobile (15s vs 10s on desktop) to account for slower connections
- **Error Recovery**: Graceful fallback to simple scene if loading fails

### 2. Texture Optimization
- **Mobile Texture Settings**:
  - Reduced anisotropy (1 vs 4 on desktop)
  - Lower quality filters (Linear vs Trilinear)
  - Automatic mipmap generation
- **Texture Size Recommendations**:
  - Mobile: 512-1024px max
  - Desktop: 2048px max
- **Memory Management**: Textures are optimized immediately after loading

### 3. Geometry Optimization
- **Vertex Normal Computation**: Automatically computed if missing
- **Attribute Cleanup**: Unused attributes removed on mobile to save memory
- **Geometry Merging**: Vertices merged where possible

### 4. Material Optimization
- **Mobile-Specific Settings**:
  - Shadows disabled (major performance gain)
  - Simplified roughness/metalness values
  - Environment map intensity set to 0
- **Desktop**: Full quality with shadows enabled

### 5. Resource Management
- **Automatic Cleanup**: Resources disposed on component unmount
- **Cache Management**: THREE.js cache cleared on mobile after optimization
- **Memory Efficient**: Only essential attributes kept on mobile

## File Size Analysis

Current GLTF assets:
- `scene.bin`: ~2.95 MB
- `3863_baseColor.png`: ~3.56 MB ⚠️ (Largest texture - should be optimized)
- Other textures: ~400 KB total

**Total**: ~7-8 MB

## Recommendations for Further Optimization

### 1. Texture Compression
The largest texture (`3863_baseColor.png` at 3.56 MB) should be optimized:

**Option A: Use WebP format**
```bash
# Convert PNG to WebP (typically 25-35% smaller)
# Use tools like ImageMagick or online converters
```

**Option B: Reduce texture resolution**
- Current: Likely 2048x2048 or higher
- Recommended for mobile: 1024x1024 or 512x512
- Use tools like:
  - ImageMagick: `magick input.png -resize 1024x1024 output.png`
  - Online tools: TinyPNG, Squoosh

**Option C: Use compressed texture formats**
- Consider using KTX2 or Basis Universal formats
- Requires additional setup but provides better compression

### 2. GLTF Compression
Consider using Draco compression for geometry:
- Reduces geometry size by 50-90%
- Requires Draco decoder (already supported in drei)
- Use glTF-Pipeline: `gltf-pipeline -i input.gltf -o output.gltf -d`

### 3. Texture Atlas
Combine multiple textures into a single atlas:
- Reduces draw calls
- Better GPU cache utilization
- Smaller total file size

### 4. LOD (Level of Detail)
For very large models, implement LOD:
- High detail: Close to camera
- Medium detail: Medium distance
- Low detail: Far distance
- Currently not implemented but can be added

## Implementation Details

### OptimizedGLTFScene Component
Located at: `src/components/Scene/OptimizedGLTFScene.tsx`

Key features:
- Automatic mobile detection
- Progressive loading with progress tracking
- Post-load optimization pass
- Memory-efficient resource management

### LoadingProgress Component
Located at: `src/components/UI/LoadingProgress.tsx`

Features:
- Real-time progress display
- Smooth fade-out animation
- Mobile-friendly UI

### Texture Optimizer Utility
Located at: `src/components/utils/textureOptimizer.ts`

Provides:
- `optimizeTextureForMobile()`: Applies mobile optimizations
- `preloadTexture()`: Preloads and optimizes textures
- `getOptimalTextureSize()`: Returns device-appropriate texture size

## Performance Metrics

Expected improvements on mobile:
- **Loading Time**: 30-50% faster (with texture optimization)
- **Memory Usage**: 40-60% reduction
- **Frame Rate**: 20-30% improvement (shadows disabled)
- **Initial Load**: Progressive loading reduces perceived wait time

## Testing

To test optimizations:
1. Open browser DevTools
2. Enable mobile emulation
3. Check Network tab for loading times
4. Monitor Memory usage in Performance tab
5. Check frame rate in Rendering tab

## Future Enhancements

1. **Lazy Loading**: Load distant objects only when needed
2. **Texture Streaming**: Load textures progressively
3. **Mesh Simplification**: Reduce polygon count on mobile
4. **Instancing**: Use instanced rendering for repeated objects
5. **Occlusion Culling**: Don't render objects outside view

