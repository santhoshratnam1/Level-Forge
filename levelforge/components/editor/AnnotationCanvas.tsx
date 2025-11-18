import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { Annotation, AnnotationTool, Point } from '../../types/portfolio';

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  onAnnotationsChange: (annotations: Annotation[]) => void;
  activeTool: string;
}

export interface AnnotationCanvasHandle {
    exportImage: () => Promise<string>;
}

const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = 3;

    switch (annotation.tool) {
        case 'rect':
            ctx.strokeRect(
                annotation.start.x,
                annotation.start.y,
                annotation.end.x - annotation.start.x,
                annotation.end.y - annotation.start.y
            );
            break;
        case 'circle':
            const radiusX = Math.abs(annotation.end.x - annotation.start.x) / 2;
            const radiusY = Math.abs(annotation.end.y - annotation.start.y) / 2;
            const centerX = annotation.start.x + radiusX;
            const centerY = annotation.start.y + radiusY;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'line':
            ctx.beginPath();
            ctx.moveTo(annotation.start.x, annotation.start.y);
            ctx.lineTo(annotation.end.x, annotation.end.y);
            ctx.stroke();
            break;
    }
};

export const AnnotationCanvas = forwardRef<AnnotationCanvasHandle, AnnotationCanvasProps>(
    ({ imageUrl, annotations, onAnnotationsChange, activeTool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState<Annotation | null>(null);

    useImperativeHandle(ref, () => ({
        exportImage: async (): Promise<string> => {
            return new Promise((resolve, reject) => {
                const canvas = canvasRef.current;
                if (!canvas) return reject('Canvas not found');

                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const exportCanvas = document.createElement('canvas');
                    exportCanvas.width = img.width;
                    exportCanvas.height = img.height;
                    const ctx = exportCanvas.getContext('2d');
                    if (!ctx) return reject('Context not found');
                    
                    // Draw original image
                    ctx.drawImage(img, 0, 0);

                    // Draw annotations scaled to original image size
                    const scaleX = img.width / canvas.width;
                    const scaleY = img.height / canvas.height;
                    
                    annotations.forEach(anno => {
                        // Create a deep copy to avoid modifying the original annotation state
                        const scaledAnno = JSON.parse(JSON.stringify(anno));

                        if ('start' in scaledAnno) {
                            scaledAnno.start.x *= scaleX;
                            scaledAnno.start.y *= scaleY;
                            scaledAnno.end.x *= scaleX;
                            scaledAnno.end.y *= scaleY;
                        }
                        // Add scaling for other annotation types if needed
                        drawAnnotation(ctx, scaledAnno);
                    });
                    
                    resolve(exportCanvas.toDataURL('image/png'));
                };
                img.onerror = () => reject('Failed to load image for export');
                img.src = imageUrl;
            });
        }
    }));


    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            canvas.width = width;
            canvas.height = height;
            // Note: redrawCanvas here will be stale if not updated, but typically resize happens less frequently than drawing.
            // Since we rely on the reactive useEffect below, forcing a redraw here is just a fallback for layout shifts.
        });

        resizeObserver.observe(container);

        return () => resizeObserver.unobserve(container);
    }, [imageUrl]);
    
    // Memoized redraw function to prevent unnecessary re-renders and provide stable reference for useEffect
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
    
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      annotations.forEach(anno => drawAnnotation(ctx, anno));
      if (isDrawing && currentDrawing) {
        drawAnnotation(ctx, currentDrawing);
      }
    }, [annotations, isDrawing, currentDrawing]);
    
    // Automatically redraw whenever the drawing state or annotations change
    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);
    
    const getCanvasPoint = (e: React.MouseEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const startPoint = getCanvasPoint(e);
        setCurrentDrawing({
            id: Date.now().toString(),
            tool: activeTool as AnnotationTool,
            color: '#00BFFF', // Deep Sky Blue
            start: startPoint,
            end: startPoint,
        } as Annotation);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing || !currentDrawing) return;
        const currentPoint = getCanvasPoint(e);
        setCurrentDrawing(prev => ({...prev!, end: currentPoint}));
        // No need to call redrawCanvas() manually; useEffect handles it when currentDrawing updates.
    };

    const handleMouseUp = () => {
        if (!currentDrawing) return;
        onAnnotationsChange([...annotations, currentDrawing]);
        setIsDrawing(false);
        setCurrentDrawing(null);
    };

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <img
                src={imageUrl}
                alt="Generated asset"
                className="w-full h-full object-contain pointer-events-none"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: 'crosshair' }}
            />
        </div>
    );
});