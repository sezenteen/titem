// src/components/admin/BarcodeScanner.jsx
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const BarcodeScanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);
  const lastScanRef = useRef('');
  const cooldown = 2000;

  useEffect(() => {
    const scannerId = "reader";
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 120 },
        },
        (decodedText) => {
          if (decodedText && decodedText !== lastScanRef.current) {
            lastScanRef.current = decodedText;

            // Feedback
            if (navigator.vibrate) navigator.vibrate(150);
            new Audio("/beep.mp3").play().catch(() => {}); // add beep.mp3 in public/

            onScanSuccess(decodedText);

            // Stop scanner after scan
            html5QrCode
              .stop()
              .then(() => html5QrCode.clear())
              .catch(console.error);

            setTimeout(() => {
              lastScanRef.current = '';
            }, cooldown);
          }
        },
        (errorMessage) => {
          // Optional: console.log(errorMessage);
        }
      )
      .catch(console.error);

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return <div id="reader" style={{ width: "100%", maxWidth: 400 }} />;
};

export default BarcodeScanner;
