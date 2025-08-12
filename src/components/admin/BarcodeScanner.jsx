import React, { useState, useEffect } from 'react';

const App = ({ formVisible, editingIndex, setCurrentProduct, setSearchBarcode, handleSearchSubmit }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [resultText, setResultText] = useState('Scanning for a barcode...');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js";
        script.onload = () => console.log("QuaggaJS loaded");
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const requestCameraPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            return true;
        } catch {
            setResultText("Camera access denied. Please allow camera permissions.");
            return false;
        }
    };

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
        if (typeof window.Quagga === 'undefined') {
            setResultText("QuaggaJS not loaded yet. Please wait.");
            return;
        }

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        setResultText('Scanning...');
        setIsScanning(true);

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#interactive'),
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                },
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"]
            },
            locate: true
        }, (err) => {
            if (err) {
                console.error(err);
                setResultText("Error accessing camera. Please check permissions.");
                setIsScanning(false);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((result) => {
            if (result?.codeResult?.code) {
                handleBarcodeDetected(result.codeResult.code);
                Quagga.stop();
            }
        });
    };

    const stopScanner = () => {
        if (typeof window.Quagga !== 'undefined') {
            Quagga.stop();
        }
        setIsScanning(false);
        setResultText("Scanning stopped.");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans flex items-center justify-center">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center">
                    Barcode Scanner
                </h1>

                <div id="interactive" className="w-full max-w-md h-[300px] bg-gray-200 rounded-xl overflow-hidden shadow-inner border-4 border-gray-300">
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
