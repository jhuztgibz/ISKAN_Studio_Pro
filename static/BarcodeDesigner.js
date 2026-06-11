import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Type, Barcode, Trash2, Download } from 'lucide-react';

const BarcodeDesigner = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [barcodeValue, setBarcodeValue] = useState('12345678');

  // Initialize Canvas
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      height: 500,
      width: 700,
      backgroundColor: '#ffffff',
    });

    fabricCanvas.on('selection:created', (e) => setSelectedObj(e.selected[0]));
    fabricCanvas.on('selection:updated', (e) => setSelectedObj(e.selected[0]));
    fabricCanvas.on('selection:cleared', () => setSelectedObj(null));

    setCanvas(fabricCanvas);
    return () => fabricCanvas.dispose();
  }, []);

  const addBarcode = async () => {
    const canvasElement = document.createElement('canvas');
    try {
      let imgData;
      if (barcodeType === 'QRCODE') {
        imgData = await QRCode.toDataURL(barcodeValue, {
          margin: 2,
          width: 256
        });
      } else {
        JsBarcode(canvasElement, barcodeValue, {
          format: barcodeType,
          displayValue: false, // We handle label separately for better design
        });
        imgData = canvasElement.toDataURL('image/png');
      }

      fabric.Image.fromURL(imgData, (img) => {
        img.set({
          left: 100,
          top: 100,
          data: { type: 'barcode', barcodeType, barcodeValue }
        });
        canvas.add(img);
        canvas.setActiveObject(img);
      });
    } catch (err) {
      alert("Invalid data for barcode type");
    }
  };

  const addLabel = () => {
    const text = new fabric.IText('Edit Label', {
      left: 150,
      top: 150,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const updateLabelProperty = (prop, value) => {
    if (selectedObj && selectedObj.type === 'i-text') {
      selectedObj.set(prop, value);
      canvas.renderAll();
    }
  };

  const deleteSelected = () => {
    canvas.remove(selectedObj);
    canvas.discardActiveObject();
  };

  const downloadDesign = () => {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'barcode-design.png';
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex flex-row gap-4 p-6 bg-gray-100 min-h-screen font-sans">
      {/* Toolbar */}
      <div className="w-64 bg-white p-4 rounded-lg shadow-md flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b pb-2">Tools</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Barcode Value</label>
          <input 
            type="text" 
            value={barcodeValue}
            onChange={(e) => setBarcodeValue(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <label className="block text-sm font-medium mb-1">Type</label>
          <select 
            value={barcodeType} 
            onChange={(e) => setBarcodeType(e.target.value)}
            className="w-full p-2 border rounded mb-3"
          >
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN13</option>
            <option value="UPC">UPC</option>
            <option value="CODE39">CODE39</option>
            <option value="QRCODE">QR CODE</option>
          </select>
          <button 
            onClick={addBarcode}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            <Barcode size={18} /> Add Barcode
          </button>
        </div>

        <button 
          onClick={addLabel}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          <Type size={18} /> Add Label
        </button>

        {selectedObj && (
          <div className="mt-4 p-3 border-t">
            <h3 className="font-semibold mb-2">Properties</h3>
            {selectedObj.type === 'i-text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs">Font Family</label>
                  <select 
                    onChange={(e) => updateLabelProperty('fontFamily', e.target.value)}
                    className="w-full text-sm border rounded p-1"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Font Size</label>
                  <input 
                    type="range" min="10" max="100" 
                    defaultValue={selectedObj.fontSize}
                    onChange={(e) => updateLabelProperty('fontSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <button 
              onClick={deleteSelected}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 text-white p-2 rounded hover:bg-red-600 text-sm"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          </div>
        )}

        <button 
          onClick={downloadDesign}
          className="w-full mt-auto flex items-center justify-center gap-2 bg-gray-800 text-white p-2 rounded hover:bg-black"
        >
          <Download size={18} /> Export PNG
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border-2 border-gray-300">
          <canvas ref={canvasRef} />
        </div>
        <p className="mt-4 text-gray-500 text-sm italic">
          Select elements to resize, rotate, or change properties. Use your mouse to drag and drop.
        </p>
      </div>
    </div>
  );
};

export default BarcodeDesigner;