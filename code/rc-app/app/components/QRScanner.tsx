'use client';

import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import Button from './Button';

interface QRScannerProps {
  readonly onScan: (data: string) => void;
  readonly onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

  // Check and request camera permission
  useEffect(() => {
    const checkPermission = async () => {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionStatus('denied');
        setError('Camera API niet beschikbaar. Gebruik HTTPS of localhost.');
        return;
      }

      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // Permission granted, stop the stream as QrReader will create its own
        for (const track of stream.getTracks()) {
          track.stop();
        }
        
        setPermissionStatus('granted');
        setError('');
      } catch (err) {
        console.error('Camera permission error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setPermissionStatus('denied');
            setError('Cameratoegang geweigerd. Geef toestemming om QR codes te scannen.');
          } else if (err.name === 'NotFoundError') {
            setPermissionStatus('denied');
            setError('Geen camera gevonden op dit apparaat.');
          } else {
            setPermissionStatus('denied');
            setError('Kon camera niet openen. Controleer de permissies.');
          }
        }
      }
    };

    checkPermission();
  }, []);

  const handleScan = (result: any) => {
    console.log('handleScan called, result:', result?.text, 'hasScanned:', hasScanned);
    if (result && !hasScanned) {
      // Prevent multiple scans
      console.log('Processing scan...');
      setHasScanned(true);
      // Call onScan and let parent component handle closing
      onScan(result.text);
    }
  };

  const retryPermission = async () => {
    setError('');
    setPermissionStatus('checking');

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionStatus('denied');
      setError('Camera API niet beschikbaar. Gebruik HTTPS of localhost.');
      return;
    }
    
    try {
      // Request camera permission again
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Permission granted, stop the stream as QrReader will create its own
      for (const track of stream.getTracks()) {
        track.stop();
      }
      
      setPermissionStatus('granted');
    } catch (err) {
      console.error('Camera permission error on retry:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionStatus('denied');
          setError('Cameratoegang nog steeds geweigerd. Klik op het camera-icoontje in de adresbalk en sta toegang toe.');
        } else if (err.name === 'NotFoundError') {
          setPermissionStatus('denied');
          setError('Geen camera gevonden op dit apparaat.');
        } else {
          setPermissionStatus('denied');
          setError('Kon camera niet openen. Controleer de permissies.');
        }
      }
    }
  };

  const stopCamera = () => {
    try {
      // Find the video element and stop all tracks
      const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const tracks = stream.getTracks();
        for (const track of tracks) {
          if (track.readyState === 'live') {
            track.stop();
            console.log('Stopped track:', track.kind);
          }
        }
        videoElement.srcObject = null;
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#03091C] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300"
            aria-label="Sluiten"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {permissionStatus === 'checking' && (
          <div className="mb-4 rounded-lg bg-black aspect-square flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Cameratoegang aanvragen...</p>
            </div>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="mb-4 rounded-lg bg-black p-6 flex items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Cameratoegang nodig</h3>
              <p className="text-sm text-gray-300 mb-4">
                Om QR codes te scannen heeft deze app toegang nodig tot je camera.
              </p>
              
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-4 text-xs text-left">
                <p className="font-semibold mb-2">💡 Hoe toegang verlenen:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300">
                  <li>Klik op &quot;Toegang verlenen&quot; hieronder</li>
                  <li>Klik op &quot;Toestaan&quot; wanneer je browser vraagt om cameratoegang</li>
                  <li>Als je per ongeluk &quot;Weigeren&quot; hebt geklikt, klik dan op het camera-icoontje 📷 in de adresbalk</li>
                </ol>
              </div>
              
              <Button variant="primary" onClick={retryPermission} className="w-full">
                📷 Toegang verlenen
              </Button>
            </div>
          </div>
        )}

        {permissionStatus === 'granted' && (
          <>
            <div className="mb-4 rounded-lg overflow-hidden bg-black aspect-square">
              <QrReader
                constraints={{ 
                  facingMode: 'environment'
                }}
                onResult={handleScan}
                videoId="qr-video"
                scanDelay={300}
                videoStyle={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                containerStyle={{ 
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>

            <p className="text-gray-400 text-sm text-center mb-4">
              Houd de QR code voor de camera
            </p>
          </>
        )}

        <Button variant="primary" onClick={handleClose} className="w-full">
          Annuleren
        </Button>
      </div>
    </div>
  );
}
