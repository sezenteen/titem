import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const App = ({ formVisible, editingIndex, setCurrentProduct, setSearchBarcode, handleSearchSubmit }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [resultText, setResultText] = useState('Scanning for a barcode...');
    const scannerRef = useRef(null);
    const containerId = 'interactive';

    const handleBarcodeDetected = (barcode) => {
        setIsScanning(false);
        if (formVisible && editingIndex !== null) {
            setCurrentProduct(prev => ({ ...prev, barcode }));
            setResultText(`Loaded existing product barcode: ${barcode}`);
        } else if (formVisible && editingIndex === null) {
            setCurrentProduct(prev => ({ ...prev, barcode }));
            setResultText(`Assigned new product barcode: ${barcode}`);
        } else {
            setSearchBarcode(barcode);
            handleSearchSubmit();
            setResultText(`Searching for barcode: ${barcode}`);
        }
    };

    const startScanner = async () => {
        if (isScanning) return;
        setResultText('Scanning...');
        setIsScanning(true);

        try {
            scannerRef.current = new Html5QrcodeScanner(
                containerId,
                {
                    fps: 10,
                    qrbox: { width: 300, height: 300 },
                    rememberLastUsedCamera: true,
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                        Html5QrcodeSupportedFormats.CODE_128,
                    ],
                },
                false
            );

            const onSuccess = (decodedText) => {
                scannerRef.current?.clear().catch(() => {});
                handleBarcodeDetected(decodedText);
            };

            const onError = () => {
                // ignore frame errors
            };

            scannerRef.current.render(onSuccess, onError);
        } catch (err) {
            setResultText('Error accessing camera. Please check permissions.');
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
            } catch {}
            scannerRef.current = null;
        }
        setIsScanning(false);
        setResultText('Scanning stopped.');
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans flex items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center">
                    Barcode Scanner
                </h1>

                <div id={containerId} className="w-full max-w-md h-[300px] bg-gray-200 rounded-xl overflow-hidden shadow-inner border-4 border-gray-300">
                    {!isScanning && (
                        <div className="h-full flex items-center justify-center text-center text-gray-500 text-lg">
                            Press "Start Scanner" to activate your camera.
                        </div>
                    )}
                </div>

                <div className="w-full p-4 bg-blue-50 text-blue-800 rounded-xl font-mono text-center text-xl font-bold border border-blue-200 shadow-sm">
                    {resultText}
                </div>

                <button
                    onClick={isScanning ? stopScanner : startScanner}
                    className="w-full sm:w-2/3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isScanning ? "Stop Scanner" : "Start Scanner"}
                </button>
            </div>
        </div>
    );
};

export default App;
