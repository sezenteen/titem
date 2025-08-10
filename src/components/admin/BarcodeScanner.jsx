import React, { useState, useEffect } from 'react';
import Quagga from 'quagga'; // This assumes Quagga is available globally from the script tag

const BarcodeScanner = () => {
    // State to manage whether the scanner is running and the result text
    const [isScanning, setIsScanning] = useState(false);
    const [resultText, setResultText] = useState('Scanning for a barcode...');

    // Function to start the barcode scanner
    const startScanner = () => {
        // Reset the result text
        setResultText('Scanning...');

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#interactive'),
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment" // Use the rear camera
                },
            },
            decoder: {
                readers: [
                    "ean_reader",
                    "ean_8_reader",
                    "upc_reader",
                    "code_128_reader"
                ]
            }
        }, (err) => {
            if (err) {
                console.error(err);
                setResultText("Error accessing camera. Please check permissions.");
                return;
            }
            // Start the scanning process
            Quagga.start();
            setIsScanning(true);
        });

        // Listen for when a barcode is detected
        Quagga.onDetected((result) => {
            if (result && result.codeResult) {
                setResultText(`Barcode Detected: ${result.codeResult.code}`);
                stopScanner();
            }
        });
    };

    // Function to stop the scanner
    const stopScanner = () => {
        Quagga.stop();
        setIsScanning(false);
        setResultText("Scanning stopped.");
    };

    // The component's JSX structure
    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto flex flex-col items-center space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Barcode Scanner</h1>

                {/* The video element for the scanner */}
                <div id="interactive" className="bg-gray-200 rounded-lg w-full max-w-xl h-[300px]"></div>

                {/* Displays the detected barcode result */}
                <div className="bg-blue-100 text-blue-800 p-4 rounded-lg w-full text-center text-lg font-mono">
                    {resultText}
                </div>

                {/* Button to control the scanner */}
                <button
                    onClick={isScanning ? stopScanner : startScanner}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    {isScanning ? "Stop Scanner" : "Start Scanner"}
                </button>
            </div>
        </div>
    );
};

// This is the main App component that will render the scanner
const App = () => {
    // We add the QuaggaJS script tag here so it's included in the HTML output
    // and available to the BarcodeScanner component.
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js";
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>React Barcode Scanner</title>
                {/* Tailwind CSS CDN */}
                <script src="https://cdn.tailwindcss.com"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
                <style>
                    {`
                        body {
                            font-family: 'Inter', sans-serif;
                        }
                        #interactive {
                            overflow: hidden;
                        }
                        video {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    `}
                </style>
            </head>
            <BarcodeScanner />
        </>
    );
};

export default App;
