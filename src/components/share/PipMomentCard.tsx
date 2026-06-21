'use client';

import React, { useRef, useEffect, useState } from 'react';
import PipPenguin from '@/components/PipPenguin';

interface PipMomentCardProps {
  quote: string;
  onImageGenerated?: (dataUrl: string) => void;
  className?: string;
}

export default function PipMomentCard({ quote, onImageGenerated, className = '' }: PipMomentCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateCard();
  }, [quote]);

  const generateCard = async () => {
    if (!canvasRef.current || isGenerating) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size (Instagram square format)
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    try {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#1e3a8a'); // Deep blue
      gradient.addColorStop(0.5, '#3b82f6'); // Blue
      gradient.addColorStop(1, '#1e40af'); // Blue-700
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle star pattern
      await drawStarBackground(ctx, width, height);

      // Draw main content area (rounded rectangle)
      const contentMargin = 80;
      const contentWidth = width - (contentMargin * 2);
      const contentHeight = height - (contentMargin * 2);
      const radius = 40;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      
      drawRoundedRect(ctx, contentMargin, contentMargin, contentWidth, contentHeight, radius);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw Pip penguin illustration (left side)
      await drawPipIllustration(ctx, contentMargin + 60, contentMargin + 60, 300);

      // Draw quote text (right side)
      const textStartX = contentMargin + 400;
      const textStartY = contentMargin + 150;
      const textWidth = contentWidth - 400 - 60;
      
      await drawQuoteText(ctx, quote, textStartX, textStartY, textWidth);

      // Draw North Star logo/branding (bottom)
      await drawBranding(ctx, width, height, contentMargin);

      // Get the image data
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      onImageGenerated?.(dataUrl);

    } catch (error) {
      console.error('Error generating card:', error);
    }
    
    setIsGenerating(false);
  };

  const drawStarBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    // Draw random stars
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      // Draw a simple star shape
      drawStar(ctx, x, y, size);
    }
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add cross lines for sparkle effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size * 2, y);
    ctx.lineTo(x + size * 2, y);
    ctx.moveTo(x, y - size * 2);
    ctx.lineTo(x, y + size * 2);
    ctx.stroke();
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawPipIllustration = async (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Draw a simplified but charming Pip penguin
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // Body (main oval)
    ctx.fillStyle = '#1f2937'; // Dark gray for penguin body
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Belly (white oval)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 20, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head (circle)
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak (triangle)
    ctx.fillStyle = '#f59e0b'; // Orange
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size * 0.3);
    ctx.lineTo(centerX - 15, centerY - size * 0.3 + 10);
    ctx.lineTo(centerX + 15, centerY - size * 0.3 + 10);
    ctx.closePath();
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - size * 0.35, 12, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY - size * 0.35, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 20, centerY - size * 0.35, 6, 0, Math.PI * 2);
    ctx.arc(centerX + 20, centerY - size * 0.35, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Flippers
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(centerX - size * 0.35, centerY, size * 0.15, size * 0.08, -Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(centerX + size * 0.35, centerY, size * 0.15, size * 0.08, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Feet
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(centerX - 30, centerY + size * 0.4, 25, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 30, centerY + size * 0.4, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawQuoteText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) => {
    // Quote marks
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 80px serif';
    ctx.fillText('"', x - 20, y);
    
    // Main quote text
    ctx.fillStyle = '#1f2937';
    ctx.font = '48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    
    // Word wrap the text
    const words = text.split(' ');
    let line = '';
    let lineY = y + 60;
    const lineHeight = 65;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, lineY);
        line = words[n] + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, lineY);
    
    // Closing quote mark
    const finalLineWidth = ctx.measureText(line).width;
    ctx.font = 'bold 80px serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('"', x + finalLineWidth, lineY - 20);
    
    // Attribution
    ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('— Pip, your penguin friend 🐧', x, lineY + 80);
  };

  const drawBranding = (ctx: CanvasRenderingContext2D, width: number, height: number, margin: number) => {
    // North Star logo/text at bottom
    const brandingY = height - margin - 50;
    
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('North Star', width / 2, brandingY);
    
    ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Your Mental Health Companion', width / 2, brandingY + 35);
    
    // Small star icon
    ctx.fillStyle = '#3b82f6';
    drawStar(ctx, width / 2 - 150, brandingY - 15, 8);
    drawStar(ctx, width / 2 + 150, brandingY - 15, 8);
  };

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
        style={{ maxWidth: '400px' }}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Creating your Pip moment...</span>
          </div>
        </div>
      )}
    </div>
  );
}
