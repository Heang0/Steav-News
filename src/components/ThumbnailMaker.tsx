'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ThumbnailMakerProps {
  onSave: (file: File, previewUrl: string) => void;
  onCancel: () => void;
}

export default function ThumbnailMaker({ onSave, onCancel }: ThumbnailMakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [mode, setMode] = useState<'single' | 'split'>('single');
  const [image1Url, setImage1Url] = useState<string | null>(null);
  const [image2Url, setImage2Url] = useState<string | null>(null);
  
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#e60000');
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [fontSize, setFontSize] = useState(50);
  const [textXOffset, setTextXOffset] = useState(640); // center
  const [textYOffset, setTextYOffset] = useState(50); // pixels from bottom

  // Highlight Shape State
  const [shapeType, setShapeType] = useState<'none' | 'circle' | 'rectangle'>('none');
  const [shapeX, setShapeX] = useState(640);
  const [shapeY, setShapeY] = useState(360);
  const [shapeSize, setShapeSize] = useState(150);
  const [shapeColor, setShapeColor] = useState('#ff0000');
  const [shapeThickness, setShapeThickness] = useState(12);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thumbnailSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.textColor !== undefined) setTextColor(parsed.textColor);
        if (parsed.strokeColor !== undefined) setStrokeColor(parsed.strokeColor);
        if (parsed.strokeWidth !== undefined) setStrokeWidth(parsed.strokeWidth);
        if (parsed.fontSize !== undefined) setFontSize(parsed.fontSize);
        if (parsed.textXOffset !== undefined) setTextXOffset(parsed.textXOffset);
        if (parsed.textYOffset !== undefined) setTextYOffset(parsed.textYOffset);
        if (parsed.shapeType !== undefined) setShapeType(parsed.shapeType);
        if (parsed.shapeX !== undefined) setShapeX(parsed.shapeX);
        if (parsed.shapeY !== undefined) setShapeY(parsed.shapeY);
        if (parsed.shapeSize !== undefined) setShapeSize(parsed.shapeSize);
        if (parsed.shapeColor !== undefined) setShapeColor(parsed.shapeColor);
        if (parsed.shapeThickness !== undefined) setShapeThickness(parsed.shapeThickness);
      }
    } catch(e) {}
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      textColor, strokeColor, strokeWidth, fontSize, textXOffset, textYOffset,
      shapeType, shapeX, shapeY, shapeSize, shapeColor, shapeThickness
    };
    localStorage.setItem('thumbnailSettings', JSON.stringify(settings));
  }, [textColor, strokeColor, strokeWidth, fontSize, textXOffset, textYOffset, shapeType, shapeX, shapeY, shapeSize, shapeColor, shapeThickness]);
  // Canvas target dimensions (standard 16:9 HD thumbnail)
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage2: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (isImage2) {
        setImage2Url(url);
      } else {
        setImage1Url(url);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to draw image covering an area
    const drawCoverImage = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > targetRatio) {
        // Image is wider than target area
        drawH = h;
        drawW = h * imgRatio;
        drawX = x + (w - drawW) / 2;
        drawY = y;
      } else {
        // Image is taller than target area
        drawW = w;
        drawH = w / imgRatio;
        drawX = x;
        drawY = y + (h - drawH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    };

    const renderCanvas = async () => {
      // Clear canvas
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Load Images
      const img1 = new Image();
      const img2 = new Image();
      
      const loadPromises: Promise<void>[] = [];
      
      if (image1Url) {
        loadPromises.push(new Promise((resolve) => {
          img1.onload = () => resolve();
          img1.src = image1Url;
        }));
      }
      
      if (mode === 'split' && image2Url) {
        loadPromises.push(new Promise((resolve) => {
          img2.onload = () => resolve();
          img2.src = image2Url;
        }));
      }

      await Promise.all(loadPromises);

      // Draw Images
      if (mode === 'single' && image1Url) {
        drawCoverImage(img1, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else if (mode === 'split') {
        if (image1Url) drawCoverImage(img1, 0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        if (image2Url) drawCoverImage(img2, CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        
        // Draw separation line
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.stroke();
      }

      // Draw Highlight Shape (Circle or Rectangle)
      if (shapeType !== 'none') {
        ctx.beginPath();
        ctx.lineWidth = shapeThickness;
        ctx.strokeStyle = shapeColor;
        
        if (shapeType === 'circle') {
          // Circle: shapeX, shapeY, radius = shapeSize
          ctx.arc(shapeX, shapeY, shapeSize, 0, Math.PI * 2);
        } else if (shapeType === 'rectangle') {
          // Rectangle: centered at shapeX, shapeY
          const w = shapeSize * 2;
          const h = shapeSize * 1.3; // slightly rectangular
          ctx.rect(shapeX - w/2, shapeY - h/2, w, h);
        }
        ctx.stroke();
      }

      // Draw Text (Multi-line Support)
      if (text) {
        ctx.font = `900 ${fontSize}px 'Kantumruy Pro', 'Kantumruy', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const lines = text.split('\n');
        const lineHeight = fontSize * 1.3; // 1.3 line height multiplier
        const x = textXOffset;
        
        // Calculate the starting Y so that the BOTTOM line sits at CANVAS_HEIGHT - textYOffset
        const bottomY = CANVAS_HEIGHT - textYOffset;
        const startY = bottomY - ((lines.length - 1) * lineHeight);

        lines.forEach((line, index) => {
          const currentY = startY + (index * lineHeight);
          
          // Apply Stroke
          ctx.lineWidth = strokeWidth;
          ctx.strokeStyle = strokeColor;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(line, x, currentY);

          // Fill Text
          ctx.fillStyle = textColor;
          ctx.fillText(line, x, currentY);
        });
      }
    };

    renderCanvas();
  }, [mode, image1Url, image2Url, text, textColor, strokeColor, strokeWidth, fontSize, textXOffset, textYOffset, shapeType, shapeX, shapeY, shapeSize, shapeColor, shapeThickness]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Export to WebP for massive storage savings
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'custom-thumbnail.webp', { type: 'image/webp' });
      const previewUrl = URL.createObjectURL(blob);
      onSave(file, previewUrl);
    }, 'image/webp', 0.85);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white max-w-6xl w-full h-full md:h-auto md:max-h-[90vh] rounded-none shadow-2xl flex flex-col-reverse md:flex-row overflow-hidden">
        
        {/* LEFT: Controls Panel (Scrollable on mobile) */}
        <div className="w-full md:w-[400px] flex-1 bg-gray-50 border-r border-gray-200 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto pb-24 md:pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Thumbnail Maker</h2>
            <p className="text-xs text-gray-500">Create custom split-screen graphics</p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Layout Mode</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setMode('single')}
                className={`flex-1 py-2 text-sm font-bold border ${mode === 'single' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}
              >
                Single Image
              </button>
              <button 
                onClick={() => setMode('split')}
                className={`flex-1 py-2 text-sm font-bold border ${mode === 'split' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300'}`}
              >
                Split Screen (2)
              </button>
            </div>
          </div>

          {/* Image Uploads */}
          <div className="space-y-4 border-y border-gray-200 py-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                {mode === 'split' ? 'Left Image' : 'Main Image'}
              </label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer border border-gray-300" />
            </div>

            {mode === 'split' && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Right Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-black cursor-pointer border border-gray-300" />
              </div>
            )}
          </div>

          {/* Text Controls */}
          <div className="space-y-4 border-b border-gray-200 pb-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Custom Headline Text (Press Enter for new line)</label>
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                placeholder="Type your text here... Press Enter to drop to the next line." 
                className="w-full p-2 border border-gray-300 text-sm focus:border-primary outline-none min-h-[80px]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 cursor-pointer" />
                  <span className="text-xs uppercase">{textColor}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Stroke Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-8 h-8 cursor-pointer" />
                  <span className="text-xs uppercase">{strokeColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <label>Stroke Size: {strokeWidth}px</label>
              </div>
              <input type="range" min="0" max="30" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-full accent-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <label>Font Size: {fontSize}px</label>
              </div>
              <input type="range" min="20" max="200" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <label>X Position (Left-Right)</label>
                </div>
                <input type="range" min="0" max="1280" value={textXOffset} onChange={e => setTextXOffset(Number(e.target.value))} className="w-full accent-primary" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <label>Y Position (Up-Down)</label>
                </div>
                <input type="range" min="10" max="600" value={textYOffset} onChange={e => setTextYOffset(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          {/* Highlight Tool (Circle/Rectangle) */}
          <div className="space-y-4 flex-grow">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Highlight Shape</label>
              <select value={shapeType} onChange={e => setShapeType(e.target.value as any)} className="w-full p-2 border border-gray-300 text-sm focus:border-primary outline-none">
                <option value="none">None</option>
                <option value="circle">⭕ Red Circle</option>
                <option value="rectangle">🟥 Red Rectangle</option>
              </select>
            </div>

            {shapeType !== 'none' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">X Position (Left-Right)</label>
                    <input type="range" min="0" max="1280" value={shapeX} onChange={e => setShapeX(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Y Position (Up-Down)</label>
                    <input type="range" min="0" max="720" value={shapeY} onChange={e => setShapeY(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Shape Size</label>
                    <input type="range" min="20" max="400" value={shapeSize} onChange={e => setShapeSize(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Line Thickness</label>
                    <input type="range" min="2" max="40" value={shapeThickness} onChange={e => setShapeThickness(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-auto sticky bottom-0 bg-gray-50 pb-2 z-20">
            <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors bg-white">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-3 text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg">
              Save & Use
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview (Sticky Top on Mobile) */}
        <div className="w-full md:flex-1 bg-gray-900 flex items-center justify-center p-2 md:p-4 border-b md:border-b-0 border-gray-700 z-10">
          <div className="w-full max-w-3xl relative" style={{ aspectRatio: '16/9' }}>
            <p className="absolute -top-6 left-0 text-white/50 text-[10px] md:text-xs font-bold tracking-widest uppercase hidden md:block">Live Preview (1280x720)</p>
            {/* The actual canvas element */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-full object-contain border border-gray-700 shadow-2xl bg-black"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
