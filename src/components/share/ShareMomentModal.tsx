'use client';

import React, { useState, useEffect } from 'react';
import PipMomentCard from './PipMomentCard';
import PipPenguin from '@/components/PipPenguin';
import { ChatMessage } from '@/types';

interface ShareMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  userName: string;
}

export default function ShareMomentModal({ 
  isOpen, 
  onClose, 
  messages, 
  userName 
}: ShareMomentModalProps) {
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [shareStep, setShareStep] = useState<'extract' | 'preview' | 'share'>('extract');

  useEffect(() => {
    if (isOpen) {
      extractBestMoment();
    }
  }, [isOpen]);

  const extractBestMoment = async () => {
    setLoading(true);
    setShareStep('extract');
    
    try {
      const response = await fetch('/api/extract-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          userName
        })
      });

      const data = await response.json();
      
      if (data.success && data.quote) {
        setQuote(data.quote);
        setShareStep('preview');
      } else {
        throw new Error('Failed to extract moment');
      }
    } catch (error) {
      console.error('Error extracting moment:', error);
      // Use fallback quote
      setQuote("Every moment of self-care is a victory. You're doing great! 🐧💙");
      setShareStep('preview');
    }
    
    setLoading(false);
  };

  const handleImageGenerated = (dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setShareStep('share');
  };

  const downloadImage = () => {
    if (!imageDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `pip-moment-${new Date().getTime()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(`Check out this uplifting moment from my mental health companion Pip! 🐧💙\n\n"${quote}"\n\n#MentalHealth #SelfCare #NorthStar`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&summary=${text}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`"${quote}"\n\n— Pip, your penguin friend 🐧\n\nFrom North Star - Your Mental Health Companion`);
        alert('Quote copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const regenerateQuote = () => {
    setShareStep('extract');
    extractBestMoment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <PipPenguin size="sm" mood="playful" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Save a Pip Moment</h2>
              <p className="text-gray-600">Create a beautiful shareable card from your conversation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content based on step */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left side - Preview */}
          <div>
            {shareStep === 'extract' && (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-600 mb-2">Pip is finding your best moment...</p>
                <p className="text-sm text-gray-500">Analyzing conversation for the most uplifting quote</p>
              </div>
            )}

            {(shareStep === 'preview' || shareStep === 'share') && quote && (
              <div className="relative">
                <PipMomentCard
                  quote={quote}
                  onImageGenerated={handleImageGenerated}
                  className="relative"
                />
                
                {shareStep === 'preview' && !imageDataUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                      <span className="text-gray-600 text-sm">Generating your card...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - Controls */}
          <div className="flex flex-col">
            
            {shareStep !== 'extract' && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Your Pip Moment Quote</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-900 italic">"{quote}"</p>
                  <p className="text-blue-700 text-sm mt-2">— Pip, your penguin friend 🐧</p>
                </div>
                
                <button
                  onClick={regenerateQuote}
                  disabled={loading}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ✨ Generate a different quote
                </button>
              </div>
            )}

            {shareStep === 'share' && (
              <div className="space-y-6">
                
                {/* Download */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Download & Save</h3>
                  <button
                    onClick={downloadImage}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PNG
                  </button>
                </div>

                {/* Social sharing */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Share Your Moment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => shareToSocial('twitter')}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-5 h-5 bg-blue-400 rounded"></div>
                      Twitter
                    </button>
                    
                    <button
                      onClick={() => shareToSocial('facebook')}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-5 h-5 bg-blue-600 rounded"></div>
                      Facebook
                    </button>
                    
                    <button
                      onClick={() => shareToSocial('linkedin')}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-5 h-5 bg-blue-700 rounded"></div>
                      LinkedIn
                    </button>
                    
                    <button
                      onClick={() => shareToSocial('copy')}
                      className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Text
                    </button>
                  </div>
                </div>

                {/* Organic marketing note */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌟</div>
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Spread the Positive Vibes!</h4>
                      <p className="text-green-700 text-sm">
                        When you share your Pip moment, you're helping others discover the power of mental health support. 
                        Every share could help someone find the encouragement they need! 💙
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto pt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                {shareStep === 'share' ? 'Done' : 'Maybe Later'}
              </button>
              
              {shareStep === 'preview' && (
                <button
                  onClick={() => setShareStep('share')}
                  disabled={!imageDataUrl}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share This Moment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
