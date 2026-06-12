/**
 * ISKAN Studio - Main Logic
 *
 * This script handles the Fabric.js canvas, object manipulation,
 * properties synchronization, and view options (zoom, grid, ruler).
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("ISKAN Studio Initialized");

  // Global fix for CanvasTextBaseline error "alphabetical"
  // This ensures Fabric.js uses a baseline compatible with all browsers
  fabric.IText.prototype.textBaseline = "top";
  fabric.Text.prototype.textBaseline = "top";

  // Global configuration for Fabric objects to ensure controls are visible and opaque
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: "#2563eb", // Deeper blue for enterprise look
    cornerStrokeColor: "#ffffff",
    cornerSize: 8, // Smaller, sharper corners
    cornerStyle: "circle",
    borderColor: "#2563eb",
    borderScaleFactor: 1.5,
    padding: 8, // Consistent padding
  });

  const canvasElement = document.getElementById("barcodeCanvas");
  const addBarcodeBtn = document.getElementById("addBarcodeBtn");
  const addQrCodeBtn = document.getElementById("addQrCodeBtn"); // New variable
  const barcodeModal = document.getElementById("barcodeModal");
  const closeBarcodeModalBtn = document.getElementById("closeBarcodeModalBtn");
  const modalBarcodeValueInput = document.getElementById("modalBarcodeValue");
  const modalBarcodeTypeSelect = document.getElementById("modalBarcodeType");
  const modalAddBarcodeBtn = document.getElementById("modalAddBarcodeBtn");
  const addLabelBtn = document.getElementById("addLabelBtn");
  const addRectBtn = document.getElementById("addRectBtn");
  const addCircleBtn = document.getElementById("addCircleBtn");
  const addTableBtn = document.getElementById("addTableBtn");
  const addLineBtn = document.getElementById("addLineBtn");
  const propertiesPanel = document.getElementById("propertiesPanel");
  const textPropertiesPanel = document.getElementById("textProperties");
  const barcodePropertiesPanel = document.getElementById("barcodeProperties");
  const shapePropertiesPanel = document.getElementById("shapeProperties");
  const propShapeFill = document.getElementById("propShapeFill");
  const propShapeStroke = document.getElementById("propShapeStroke");
  const propShapeStrokeWidth = document.getElementById("propShapeStrokeWidth");
  const propShapeWidth = document.getElementById("propShapeWidth");
  const propShapeHeight = document.getElementById("propShapeHeight");
  const ungroupTableBtn = document.getElementById("ungroupTableBtn");
  const tablePropertiesPanel = document.getElementById("tableProperties");
  const propTableRows = document.getElementById("propTableRows");
  const propTableCols = document.getElementById("propTableCols");
  const propTableCellWidth = document.getElementById("propTableCellWidth");
  const propTableCellHeight = document.getElementById("propTableCellHeight");
  const propBarcodeValue = document.getElementById("propBarcodeValue");
  const propBarcodeFontSize = document.getElementById("propBarcodeFontSize");
  const propBarcodeMargin = document.getElementById("propBarcodeMargin");
  const propLabelValue = document.getElementById("propLabelValue");
  const propBarcodeShowText = document.getElementById("propBarcodeShowText");
  const fontFamilySelect = document.getElementById("fontFamilySelect");
  const fontSizeRange = document.getElementById("fontSizeRange");
  const boldBtn = document.getElementById("boldBtn");
  const italicBtn = document.getElementById("italicBtn");
  const underlineBtn = document.getElementById("underlineBtn");
  const propTextWrap = document.getElementById("propTextWrap");
  const textWrapWidthContainer = document.getElementById(
    "textWrapWidthContainer",
  );
  const propTextWrapWidth = document.getElementById("propTextWrapWidth");
  const imagePropertiesPanel = document.getElementById("imageProperties"); // New: Image properties panel
  const propImageCropX = document.getElementById("propImageCropX"); // New: Image crop X input
  const propImageCropY = document.getElementById("propImageCropY"); // New: Image crop Y input
  const propImageWidth = document.getElementById("propImageWidth"); // New: Image width input for cropping
  const propImageHeight = document.getElementById("propImageHeight"); // New: Image height input for cropping
  const resetCropBtn = document.getElementById("resetCropBtn"); // New: Reset crop button
  const fitToCanvasBtn = document.getElementById("fitToCanvasBtn"); // New: Fit image to canvas button
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  const newDesignBtn = document.getElementById("newDesignBtn");
  const downloadDesignBtn = document.getElementById("downloadDesignBtn");
  const logoUpload = document.getElementById("logoUpload");
  const addLogoBtn = document.getElementById("addLogoBtn");
  const printPreviewBtn = document.getElementById("printPreviewBtn");
  const agentPreviewBtn = document.getElementById("agentPreviewBtn");
  const saveTemplateBtn = document.getElementById("saveTemplateBtn");
  const printAllRowsBtn = document.getElementById("printAllRowsBtn"); // New: Print All Rows button
  const canvasWidthInput = document.getElementById("canvasWidth");
  const canvasHeightInput = document.getElementById("canvasHeight");
  const printRowsInput = document.getElementById("printRows");
  const printColsInput = document.getElementById("printCols");
  const centerHBtn = document.getElementById("centerHBtn");
  const centerVBtn = document.getElementById("centerVBtn");
  const showGridCheckbox = document.getElementById("showGridCheckbox");
  const showRulerCheckbox = document.getElementById("showRulerCheckbox");
  const canvasViewport = document.getElementById("canvasViewport"); // New: The scrollable container
  const canvasWrapper = document.getElementById("canvasWrapper"); // New: The element to scale/pan
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");

  // QZ Tray Elements
  const connectQZBtn = document.getElementById("connectQZBtn");
  const connectQZText = document.getElementById("connectQZText");
  const disconnectQZBtn = document.getElementById("disconnectQZBtn");
  const disconnectQZText = document.getElementById("disconnectQZText");
  const printerSelect = document.getElementById("printerSelect");
  const printerSelectContainer = document.getElementById(
    "printerSelectContainer",
  );
  const bindingSection = document.getElementById("bindingSection");
  const printToZebraBtn = document.getElementById("printToZebraBtn");
  const qzStatus = document.getElementById("qzStatus");
  const qzStatusDot = document.getElementById("qzStatusDot");
  const ribbonSpacer = document.getElementById("ribbonSpacer");
  const dataSearchInput = document.getElementById("dataSearchInput");

  // Data Tab Elements
  const tabDesign = document.getElementById("tabDesign");
  const tabUploadData = document.getElementById("tabUploadData");
  const tabTemplates = document.getElementById("tabTemplates");
  const tabHistory = document.getElementById("tabHistory");
  const designView = document.getElementById("designView");
  const dataView = document.getElementById("dataView");
  const templatesView = document.getElementById("templatesView");
  const historyView = document.getElementById("historyView");
  const templateGrid = document.getElementById("templateGrid");
  const historyTableBody = document.getElementById("historyTableBody");
  const importExcelBtn = document.getElementById("importExcelBtn");
  const importApiBtn = document.getElementById("importApiBtn");
  const importFileModal = document.getElementById("importFileModal");
  const closeImportFileModalBtn = document.getElementById(
    "closeImportFileModalBtn",
  );
  const fileTypeButtons = document.querySelectorAll(".file-type-btn");
  const apiConfigSection = document.getElementById("apiConfigSection");
  const apiUrlInput = document.getElementById("apiUrlInput");
  const apiHeaderNameInput = document.getElementById("apiHeaderNameInput");
  const apiTokenInput = document.getElementById("apiTokenInput");
  const apiFetchBtn = document.getElementById("apiFetchBtn");
  const apiSaveBtn = document.getElementById("apiSaveBtn");
  const apiRetrieveBtn = document.getElementById("apiRetrieveBtn");
  const clearDataBtn = document.getElementById("clearDataBtn");

  const excelUpload = document.getElementById("excelUpload");
  const tableHeader = document.getElementById("tableHeader");
  const tableBody = document.getElementById("tableBody");
  const propDataBinding = document.getElementById("propDataBinding");
  const totalItemsCount = document.getElementById("totalItemsCount");
  const selectedItemsCount = document.getElementById("selectedItemsCount");
  let printHistory = [];
  let uploadedData = [];

  // Variables for subscription forfeiture logic
  const subscriptionWizard = document.getElementById("subscriptionWizard");
  let activeSubEndsAt = null;
  let dataColumns = [];
  let dbTemplates = []; // Local cache for fetched templates
  let currentTemplateId = null; // Track currently open template from DB
  let currentTemplateName = ""; // Track currently open template name
  let isEditMode = true; // Track if current session is in edit or use mode
  let isCanvasInitialized = false; // Flag to track if canvas is fully initialized

  let agentSocket = null;
  const pendingRequests = new Map();

  // Unit conversion constants
  const DPI = 96; // Standard web DPI
  const CM_PER_INCH = 2.54;
  const PIXELS_PER_INCH = DPI;
  const PIXELS_PER_CM = DPI / CM_PER_INCH;

  // Unit conversion helpers
  function toPixels(value, unit) {
    if (unit === "inches") return value * PIXELS_PER_INCH;
    if (unit === "cm") return value * PIXELS_PER_CM;
    return value;
  }

  function fromPixels(value, unit) {
    if (unit === "inches") return value / PIXELS_PER_INCH;
    if (unit === "cm") return value / PIXELS_PER_CM;
    return value;
  }

  /**
   * Converts a canvas into Zebra Programming Language (ZPL) code.
   * Wraps a monochrome bitmap into the ^GF (Graphic Field) command.
   */
  function canvasToZPL(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    const rowBytes = Math.ceil(width / 8);
    const totalBytes = rowBytes * height;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    let zplHex = "";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < rowBytes; x++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelX = x * 8 + bit;
          if (pixelX < width) {
            const idx = (y * width + pixelX) * 4;
            // Grayscale threshold: if average color < 128, it's "black"
            const avg =
              (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
            if (avg < 128) byte |= 1 << (7 - bit);
          }
        }
        zplHex += byte.toString(16).padStart(2, "0").toUpperCase();
      }
    }
    return `^XA^MNN^LL${height}^LH0,0^FO0,0^GFA,${totalBytes},${totalBytes},${rowBytes},${zplHex}^FS^XZ`;
  }

  /**
   * Converts a canvas into TSPL (TSC Printer Language).
   */
  function canvasToTSPL(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    const rowBytes = Math.ceil(width / 8);
    const imageData = ctx.getImageData(0, 0, width, height).data;

    // Calculate dimensions in mm (TSPL requirement)
    const mmW = Math.round(fromPixels(width, "cm") * 10);
    const mmH = Math.round(fromPixels(height, "cm") * 10);

    let bitmap = new Uint8Array(rowBytes * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const avg =
          (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
        if (avg < 128) {
          const byteIdx = y * rowBytes + Math.floor(x / 8);
          bitmap[byteIdx] |= 1 << (7 - (x % 8));
        }
      }
    }

    // TSPL Command assembly
    const header = `SIZE ${mmW} mm, ${mmH} mm\r\nGAP 3 mm, 0\r\nDIRECTION 1\r\nCLS\r\nBITMAP 0,0,${rowBytes},${height},0,`;
    const footer = `\r\nPRINT 1,1\r\n`;

    // Convert to binary array for Base64 encoding
    const headerBytes = new TextEncoder().encode(header);
    const footerBytes = new TextEncoder().encode(footer);
    const combined = new Uint8Array(
      headerBytes.length + bitmap.length + footerBytes.length,
    );
    combined.set(headerBytes);
    combined.set(bitmap, headerBytes.length);
    combined.set(footerBytes, headerBytes.length + bitmap.length);
    return combined;
  }

  // Helper to parse JSON data
  const parseJSONData = (text) => {
    try {
      const result = JSON.parse(text);
      return Array.isArray(result)
        ? result
        : result.data || result.items || result.results || [];
    } catch (e) {
      throw new Error("Invalid JSON format");
    }
  };

  // Helper to parse XML data into a flat array of objects
  const parseXMLData = (text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) throw new Error("Invalid XML format");

    const root = doc.documentElement;
    const items = Array.from(root.children);
    if (items.length === 0) return [];

    return items.map((item) => {
      const obj = {};
      Array.from(item.children).forEach((child) => {
        obj[child.tagName] = child.textContent;
      });
      // Fallback for simple list of values
      if (Object.keys(obj).length === 0) obj["value"] = item.textContent;
      return obj;
    });
  };

  // Helper to read file as base64
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Determine initial units and dimensions from DOM state
  const stickerUnitRadios = document.querySelectorAll(
    'input[name="stickerUnit"]',
  );
  const activeUnitRadio = document.querySelector(
    'input[name="stickerUnit"]:checked',
  );
  let currentStickerUnit = activeUnitRadio ? activeUnitRadio.value : "pixels";

  // Initialize pixel-based "base" dimensions using the detected unit
  let baseWidth = toPixels(
    parseFloat(canvasWidthInput.value) || 700,
    currentStickerUnit,
  );
  let baseHeight = toPixels(
    parseFloat(canvasHeightInput.value) || 500,
    currentStickerUnit,
  );

  // Tracking modal mode
  let activeModalMode = "barcode";
  const modalTitle = document.getElementById("modalTitle");
  const modalTypeContainer = document.getElementById("modalTypeContainer");

  // Initialize active subscription details from data attributes
  if (subscriptionWizard) {
    const endsAtString = subscriptionWizard.dataset.activeSubEndsAt;
    if (endsAtString) {
      activeSubEndsAt = new Date(endsAtString);
    }
  }
  const canvas = new fabric.Canvas(canvasElement, {
    height: baseHeight,
    width: baseWidth,
    backgroundColor: "#ffffff",
    selection: true,
    controlsAboveOverlay: true, // Ensures handles are drawn on the top-most layer
  });

  let selectedObj = null;
  let isUpdatingBarcode = false; // Flag to prevent properties panel from disappearing during barcode updates
  let currentZoom = 1;
  let isGeneratingPrintBatch = false; // New: Flag to indicate batch printing is in progress
  const gridSize = 20; // Size of each grid square
  let gridLines = []; // Array to hold grid line objects
  let currentRulerUnit = "pixels"; // Default ruler unit
  let rulerObjects = []; // Array to hold ruler objects

  // --- Keyboard Shortcut & Undo Logic ---
  let clipboard = null;
  const history = [];
  const maxHistory = 20;

  function saveHistory() {
    if (isGeneratingPrintBatch) return;
    const state = JSON.stringify(canvas.toJSON(["data"]));
    if (history.length > 0 && history[history.length - 1] === state) return;
    history.push(state);
    if (history.length > maxHistory) history.shift();
  }

  function undo() {
    if (history.length <= 1) return;
    history.pop(); // Remove current state
    const previousState = history[history.length - 1];
    isUpdatingBarcode = true; // Prevent UI flicker
    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();
      isUpdatingBarcode = false;
      updatePropertiesPanel();
    });
  }

  canvas.on("object:added", saveHistory);
  canvas.on("object:modified", saveHistory);
  canvas.on("object:removed", saveHistory);

  function setEditMode(edit) {
    isEditMode = edit;

    // Buttons/Groups to disable in "Use" mode to prevent design changes
    const insertButtons = [
      addBarcodeBtn,
      addQrCodeBtn,
      addLabelBtn,
      addLogoBtn,
      addRectBtn,
      addCircleBtn,
      addLineBtn,
      addTableBtn,
    ];
    const actionButtons = [downloadDesignBtn, saveTemplateBtn];

    const allToDisable = [...insertButtons, ...actionButtons];

    allToDisable.forEach((btn) => {
      if (!btn) return;
      btn.disabled = !isEditMode;
      btn.classList.toggle("opacity-50", !isEditMode);
      btn.classList.toggle("pointer-events-none", !isEditMode);
    });

    // Lock/Unlock objects for editing
    canvas.getObjects().forEach((obj) => {
      if (!obj.excludeFromExport) {
        obj.selectable = true; // Always selectable to allow data binding
        obj.hoverCursor = isEditMode ? "move" : "pointer";
        obj.hasControls = isEditMode;
        obj.lockMovementX = !isEditMode;
        obj.lockMovementY = !isEditMode;
        obj.lockScalingX = !isEditMode;
        obj.lockScalingY = !isEditMode;
        obj.lockRotation = !isEditMode;
      }
    });

    canvas.discardActiveObject().renderAll();
  }

  window.addEventListener("keydown", (e) => {
    // Ignore if typing in an input or textarea
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    )
      return;

    const activeObject = canvas.getActiveObject();
    const isCtrl = e.ctrlKey || e.metaKey;

    // Disable keyboard manipulation if not in edit mode
    if (!isEditMode) return;

    // Undo: Ctrl + Z
    if (isCtrl && e.key === "z") {
      e.preventDefault();
      undo();
    }

    // Copy: Ctrl + C
    if (isCtrl && e.key === "c" && activeObject) {
      e.preventDefault();
      activeObject.clone(
        (cloned) => {
          clipboard = cloned;
        },
        ["data"],
      );
    }

    // Paste: Ctrl + V
    if (isCtrl && e.key === "v" && clipboard) {
      e.preventDefault();
      clipboard.clone(
        (clonedObj) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 20,
            top: clonedObj.top + 20,
            evented: true,
          });
          if (clonedObj.type === "activeSelection") {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj) => canvas.add(obj));
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          clipboard.top += 20;
          clipboard.left += 20;
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        },
        ["data"],
      );
    }

    // Delete: Del or Backspace
    if (
      (e.key === "Delete" || e.key === "Backspace") &&
      activeObject &&
      !activeObject.isEditing
    ) {
      e.preventDefault();
      const activeObjects = canvas.getActiveObjects();
      canvas.remove(...activeObjects);
      canvas.discardActiveObject().renderAll();
    }

    // Move: Arrow Keys
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
      activeObject
    ) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      switch (e.key) {
        case "ArrowUp":
          activeObject.top -= step;
          break;
        case "ArrowDown":
          activeObject.top += step;
          break;
        case "ArrowLeft":
          activeObject.left -= step;
          break;
        case "ArrowRight":
          activeObject.left += step;
          break;
      }
      activeObject.setCoords();
      canvas.renderAll();
    }
  });

  // Zoom via Ctrl + MouseWheel
  canvas.on("mouse:wheel", (opt) => {
    if (!opt.e.ctrlKey) return;
    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 5) zoom = 5;
    if (zoom < 0.1) zoom = 0.1;
    setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  /**
   * QZ Tray Integration
   */
  function callAgent(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!agentSocket || agentSocket.readyState !== WebSocket.OPEN) {
        return reject("Not connected to agent");
      }
      const promiseId = Math.random().toString(36).substring(7);
      pendingRequests.set(promiseId, { resolve, reject });
      agentSocket.send(
        JSON.stringify({
          promise: promiseId,
          call: method,
          params: params,
        }),
      );
    });
  }

  function connectQZ() {
    // Prevent multiple simultaneous connection attempts
    if (
      agentSocket &&
      (agentSocket.readyState === WebSocket.OPEN ||
        agentSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const url = "wss://localhost:8182";
    console.log("Attempting connection to custom agent:", url);

    agentSocket = new WebSocket(url);

    agentSocket.onopen = async () => {
      console.log("Successfully connected to Web-Print Agent.");
      try {
        // This now identifies as "2.1.0-custom-raw" per your Python code
        const version = await callAgent("websocket.getVersion");
        console.log("Agent Version:", version);
        updateConnectionUI(true);

        const printers = await callAgent("printers.find");
        if (printerSelect) {
          printerSelect.innerHTML = printers
            .map((p) => `<option value="${p}">${p}</option>`)
            .join("");
          const zebra =
            printers.find((p) => p.toLowerCase().includes("zebra")) ||
            printers[0];
          if (zebra) printerSelect.value = zebra;
        }
      } catch (err) {
        console.error("Agent Initialization Error:", err);
      }
    };

    agentSocket.onmessage = (event) => {
      console.debug("Agent Response:", event.data);
      try {
        const response = JSON.parse(event.data);
        const promiseId = response.promise;
        if (promiseId && pendingRequests.has(promiseId)) {
          pendingRequests.get(promiseId).resolve(response.data);
          pendingRequests.delete(promiseId);
        }
      } catch (e) {
        console.error("Error parsing agent message:", e);
      }
    };

    agentSocket.onerror = (err) => {
      console.error("WebSocket Error (Usually SSL Trust):", err);
      alert(
        "CANNOT CONNECT TO WEB-PRINT AGENT\n\n" +
          "1. Ensure your Web-Print Connector is running.\n" +
          "2. Open this https://localhost:8182 in your web browser and click advanced.\n" +
          "3. Return here and click 'Connect'.",
      );
    };

    agentSocket.onclose = () => {
      updateConnectionUI(false);
      console.log("Disconnected from Agent");
    };
  }

  function updateConnectionUI(isConnected) {
    if (isConnected) {
      qzStatus.textContent = "Agent: Online";
      qzStatus.classList.remove("text-slate-400");
      qzStatus.classList.add("text-emerald-600");
      qzStatusDot.classList.remove("bg-slate-300");
      qzStatusDot.classList.add("bg-emerald-500", "animate-pulse");

      if (connectQZBtn) connectQZBtn.classList.add("hidden");
      if (disconnectQZBtn) disconnectQZBtn.classList.remove("hidden");
    } else {
      qzStatus.textContent = "Agent: Offline";
      qzStatus.classList.add("text-slate-400");
      qzStatus.classList.remove("text-emerald-600");
      qzStatusDot.classList.add("bg-slate-300");
      qzStatusDot.classList.remove("bg-emerald-500", "animate-pulse");

      if (connectQZBtn) connectQZBtn.classList.remove("hidden");
      if (disconnectQZBtn) disconnectQZBtn.classList.add("hidden");
    }
    // Re-evaluate button visibility for the current tab
    toggleRibbonForDataView(designView.classList.contains("hidden"));
  }

  function disconnectQZ() {
    if (agentSocket && agentSocket.readyState === WebSocket.OPEN) {
      agentSocket.close();
      console.log("Disconnected from Web-Print Agent manually.");
    } else {
      console.log("Agent not connected, no need to disconnect.");
      updateConnectionUI(false); // Ensure UI reflects disconnected state
    }
  }

  // Clear Data Logic
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (uploadedData.length === 0) return;

      if (
        confirm(
          "Are you sure you want to clear all imported data? This will reset your data table and active mapping options.",
        )
      ) {
        uploadedData = [];
        dataColumns = [];
        if (dataSearchInput) dataSearchInput.value = "";

        renderDataTable();
        updateBindingOptions();
        updatePrintAllRowsButtonState();
        console.log("Data source cleared.");
      }
    });
  }

  /**
   * Formatting logic to match Python PrintEngine expectation:
   * if item.get('format') == 'base64':
   *    PrintEngine.print_base64_image(printer_name, item.get('data'))
   */
  async function printToZebra() {
    if (!agentSocket || agentSocket.readyState !== WebSocket.OPEN) {
      return alert("Agent not connected.");
    }
    const selectedPrinter = printerSelect ? printerSelect.value : null;
    if (!selectedPrinter) return alert("Please select a printer first.");

    try {
      // Disable buttons during print
      printToZebraBtn.disabled = true;

      const canvases = await generateTiledPages();

      const result = await callAgent("print", {
        printer: selectedPrinter,
        data: canvases.map((c) => ({
          format: "raw",
          flavor: "text", // Send as plain text ZPL commands
          data: canvasToZPL(c),
        })),
      });

      if (result === "Success") {
        const selectedCheckboxes = document.querySelectorAll(".row-checkbox:checked");
        const rows = Array.from(selectedCheckboxes).map(cb => uploadedData[parseInt(cb.dataset.index)]);
        savePrintHistory(rows.length > 0 ? rows : [{ manual_print: true, date: new Date().toISOString() }]);
        alert("Successfully sent to printer.");
      } else {
        alert("Printer agent returned an error: " + result);
      }
    } catch (err) {
      console.error("Zebra Print Error:", err);
      alert("Print failed: " + err);
    } finally {
      printToZebraBtn.disabled = false;
    }
  }

  if (connectQZBtn) connectQZBtn.addEventListener("click", connectQZ);
  if (disconnectQZBtn) disconnectQZBtn.addEventListener("click", disconnectQZ);
  if (printToZebraBtn)
    printToZebraBtn.addEventListener("click", async () => {
      // If data is uploaded, confirm quantity
      if (uploadedData.length > 0) {
        const selectedCheckboxes = document.querySelectorAll(
          ".row-checkbox:checked",
        );
        if (selectedCheckboxes.length === 0) {
          alert("Please select rows from the table to print.");
          return;
        }

        const rowsToPrint = Array.from(selectedCheckboxes).map(
          (cb) => uploadedData[parseInt(cb.dataset.index)],
        );
        const totalLabels = rowsToPrint.reduce((sum, row) => {
          const qtyKey = Object.keys(row).find((k) =>
            ["qty", "quantity", "count"].includes(k.toLowerCase()),
          );
          return sum + (qtyKey ? parseInt(row[qtyKey]) || 1 : 1);
        }, 0);

        const rows = parseInt(printRowsInput.value) || 1;
        const cols = parseInt(printColsInput.value) || 1;
        const totalPages = Math.ceil(totalLabels / (rows * cols));

        if (
          !confirm(
            `Send ${totalLabels} labels (${totalPages} print jobs) to ${printerSelect.value}?`,
          )
        ) {
          return;
        }
      }

      await printToZebra();
    });

  // Event listeners for Fabric.js object selection
  canvas.on("selection:created", (e) => {
    selectedObj = e.selected[0];
    if (selectedObj) {
      selectedObj.setCoords();
      canvas.requestRenderAll();
    }
    updatePropertiesPanel();
  });

  canvas.on("selection:updated", (e) => {
    selectedObj = e.selected[0];
    if (selectedObj) {
      selectedObj.setCoords();
      canvas.requestRenderAll();
    }
    updatePropertiesPanel();
  });

  canvas.on("selection:cleared", () => {
    if (!isUpdatingBarcode) {
      selectedObj = null;
      updatePropertiesPanel();
    }
  });

  /**
   * Disables or enables the Download, Print, Save, and Print All buttons
   * based on whether there are user objects on the canvas.
   */
  function updateActionButtonState() {
    const hasObjects = canvas
      .getObjects()
      .some((obj) => !obj.excludeFromExport);
    const actionButtons = [
      downloadDesignBtn,
      printPreviewBtn,
      saveTemplateBtn,
      printToZebraBtn,
      agentPreviewBtn,
    ];

    actionButtons.forEach((btn) => {
      if (!btn) return;

      let shouldBeEnabled = hasObjects;

      // Override for "Use" mode: Insert and Save/Download remain disabled
      if (
        !isEditMode &&
        (btn === downloadDesignBtn || btn === saveTemplateBtn)
      ) {
        shouldBeEnabled = false;
      }

      btn.disabled = !shouldBeEnabled;
      btn.classList.toggle("opacity-50", !shouldBeEnabled);
      btn.classList.toggle("cursor-not-allowed", !shouldBeEnabled);
      btn.classList.toggle("pointer-events-none", !shouldBeEnabled);
    });
  }

  // Update state for printAllRowsBtn separately, as it also depends on uploadedData
  function updatePrintAllRowsButtonState() {
    const hasObjects = canvas
      .getObjects()
      .some((obj) => !obj.excludeFromExport);
    const hasData = uploadedData.length > 0;
    const canPrintAll = hasObjects && hasData;
    if (printAllRowsBtn) {
      printAllRowsBtn.disabled = !canPrintAll;
      printAllRowsBtn.classList.toggle("opacity-50", !canPrintAll);
      printAllRowsBtn.classList.toggle("cursor-not-allowed", !canPrintAll);
      printAllRowsBtn.classList.toggle("pointer-events-none", !canPrintAll);
    }
  }

  // Listen for object changes to update button states automatically
  canvas.on("object:added", () => {
    updateActionButtonState();
    updatePrintAllRowsButtonState();
  });
  canvas.on("object:removed", () => {
    updateActionButtonState();
    updatePrintAllRowsButtonState();
  });

  /**
   * Unified function to handle Zoom and Resize.
   * Ensures physical canvas, container, and coordinates stay in sync.
   */
  function applyDimensions() {
    // Use Math.round for physical pixel synchronization
    const physicalWidth = Math.round(baseWidth * currentZoom);
    const physicalHeight = Math.round(baseHeight * currentZoom);

    // Update Fabric.js dimensions (both backstore resolution and CSS synchronized)
    canvas.setDimensions({
      width: physicalWidth,
      height: physicalHeight,
    });

    // Scale internal coordinate system
    canvas.setZoom(currentZoom);

    // Update selection handles for all objects to match the new zoom level
    canvas.getObjects().forEach((obj) => {
      if (typeof obj.setCoords === "function") obj.setCoords();
    });

    // Critical for mouse interactions after resizing
    canvas.calcOffset();

    // Update HTML wrapper to match
    canvasWrapper.style.width = physicalWidth + "px";
    canvasWrapper.style.height = physicalHeight + "px";

    canvas.requestRenderAll();
  }

  function setZoom(level) {
    currentZoom = Math.max(0.1, Math.min(5, level));
    applyDimensions();
  }

  const rulerUnitRadios = document.querySelectorAll('input[name="rulerUnit"]');

  // Sync properties panel when text is edited directly on the canvas
  canvas.on("text:changed", (e) => {
    if (selectedObj && selectedObj === e.target) {
      propLabelValue.value = e.target.text;
    }
  });

  // Functions for grid
  function drawGrid() {
    removeGrid(); // Ensure no duplicate grid lines

    // Draw vertical lines
    for (let i = 0; i <= baseWidth / gridSize; i++) {
      const line = new fabric.Line(
        [i * gridSize, 0, i * gridSize, baseHeight],
        {
          stroke: "#cccccc",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true, // Don't include in exported image
        },
      );
      canvas.add(line);
      canvas.sendToBack(line); // Ensure grid is behind objects
      gridLines.push(line);
    }

    // Draw horizontal lines
    for (let i = 0; i <= baseHeight / gridSize; i++) {
      const line = new fabric.Line([0, i * gridSize, baseWidth, i * gridSize], {
        stroke: "#cccccc",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true, // Don't include in exported image
      });
      canvas.add(line);
      canvas.sendToBack(line); // Ensure grid is behind objects
      gridLines.push(line);
    }
    canvas.renderAll();
  }

  function removeGrid() {
    gridLines.forEach((line) => canvas.remove(line));
    gridLines = []; // Clear the array
    canvas.renderAll();
  }

  function drawRuler(currentRulerUnit) {
    removeRuler();
    const width = baseWidth;
    const height = baseHeight;

    let pixelsPerMajorUnit;
    let pixelsPerMinorUnit;
    let pixelsPerSmallestUnit;
    let unitLabelSuffix;

    if (currentRulerUnit === "inches") {
      pixelsPerMajorUnit = PIXELS_PER_INCH; // 1 inch
      pixelsPerMinorUnit = PIXELS_PER_INCH / 2; // 0.5 inch
      pixelsPerSmallestUnit = PIXELS_PER_INCH / 10; // 0.1 inch
      unitLabelSuffix = "in";
    } else if (currentRulerUnit === "cm") {
      pixelsPerMajorUnit = PIXELS_PER_CM; // 1 cm
      pixelsPerMinorUnit = PIXELS_PER_CM / 2; // 0.5 cm
      pixelsPerSmallestUnit = PIXELS_PER_CM / 10; // 0.1 cm
      unitLabelSuffix = "cm";
    } else {
      // pixels
      pixelsPerMajorUnit = 100; // 100 pixels
      pixelsPerMinorUnit = 50; // 50 pixels
      pixelsPerSmallestUnit = 10; // 10 pixels
      unitLabelSuffix = "px";
    }

    // Horizontal Ruler (Top)
    for (let i = 0; i <= width; i += pixelsPerSmallestUnit) {
      let tickHeight = 5; // Smallest tick
      let labelText = null;

      // Use a small epsilon for floating point comparisons
      const epsilon = 0.001;

      if (
        Math.abs(i % pixelsPerMajorUnit) < epsilon ||
        Math.abs((i % pixelsPerMajorUnit) - pixelsPerMajorUnit) < epsilon
      ) {
        // Major tick
        tickHeight = 15;
        labelText = (i / pixelsPerMajorUnit).toFixed(
          currentRulerUnit === "pixels" ? 0 : 1,
        );
      } else if (
        Math.abs(i % pixelsPerMinorUnit) < epsilon ||
        Math.abs((i % pixelsPerMinorUnit) - pixelsPerMinorUnit) < epsilon
      ) {
        // Minor tick
        tickHeight = 10;
      }

      const tick = new fabric.Line([i, 0, i, tickHeight], {
        stroke: "#888",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      canvas.add(tick);
      canvas.sendToBack(tick); // Ensure ruler is behind objects
      rulerObjects.push(tick);

      if (labelText !== null && parseFloat(labelText) > 0) {
        const text = new fabric.Text(`${labelText}${unitLabelSuffix}`, {
          left: i + 2,
          top: tickHeight + 2,
          fontSize: 10,
          fill: "#888",
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(text);
        canvas.sendToBack(text); // Ensure ruler is behind objects
        rulerObjects.push(text);
      }
    }

    // Vertical Ruler (Left)
    for (let i = 0; i <= height; i += pixelsPerSmallestUnit) {
      let tickWidth = 5; // Smallest tick
      let labelText = null;

      const epsilon = 0.001;
      if (
        Math.abs(i % pixelsPerMajorUnit) < epsilon ||
        Math.abs((i % pixelsPerMajorUnit) - pixelsPerMajorUnit) < epsilon
      ) {
        // Major tick
        tickWidth = 15;
        labelText = (i / pixelsPerMajorUnit).toFixed(
          currentRulerUnit === "pixels" ? 0 : 1,
        );
      } else if (
        Math.abs(i % pixelsPerMinorUnit) < epsilon ||
        Math.abs((i % pixelsPerMinorUnit) - pixelsPerMinorUnit) < epsilon
      ) {
        // Minor tick
        tickWidth = 10;
      }

      const tick = new fabric.Line([0, i, tickWidth, i], {
        stroke: "#888",
        strokeWidth: 1,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      canvas.add(tick);
      canvas.sendToBack(tick); // Ensure ruler is behind objects
      rulerObjects.push(tick);

      if (labelText !== null && parseFloat(labelText) > 0) {
        const text = new fabric.Text(`${labelText}${unitLabelSuffix}`, {
          left: tickWidth + 2,
          top: i + 2,
          fontSize: 10,
          fill: "#888",
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });
        canvas.add(text);
        canvas.sendToBack(text); // Ensure ruler is behind objects
        rulerObjects.push(text);
      }
    }
    canvas.renderAll(); // Render once after all ruler objects are added
  }

  function removeRuler() {
    rulerObjects.forEach((obj) => canvas.remove(obj));
    rulerObjects = [];
    canvas.renderAll();
  }

  // Resize Canvas based on inputs
  canvasWidthInput.addEventListener("change", () => {
    baseWidth =
      toPixels(parseFloat(canvasWidthInput.value), currentStickerUnit) || 700;
    applyDimensions();

    if (showGridCheckbox.checked) {
      drawGrid(); // Redraw grid if visible
    }
    if (showRulerCheckbox.checked) {
      drawRuler(
        document.querySelector('input[name="rulerUnit"]:checked').value,
      ); // Redraw ruler if visible
    }
  });

  canvasHeightInput.addEventListener("change", () => {
    baseHeight =
      toPixels(parseFloat(canvasHeightInput.value), currentStickerUnit) || 500;
    applyDimensions();

    if (showGridCheckbox.checked) {
      drawGrid(); // Redraw grid if visible
    }
    if (showRulerCheckbox.checked) {
      drawRuler(
        document.querySelector('input[name="rulerUnit"]:checked').value,
      ); // Redraw ruler if visible
    }
  });

  // Handle Sticker Unit conversion
  stickerUnitRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const newUnit = e.target.value;
      // Convert current values in inputs to the new unit
      const currentW = toPixels(
        parseFloat(canvasWidthInput.value),
        currentStickerUnit,
      );
      const currentH = toPixels(
        parseFloat(canvasHeightInput.value),
        currentStickerUnit,
      );

      // Synchronize pixel master dimensions
      baseWidth = currentW;
      baseHeight = currentH;

      canvasWidthInput.value = fromPixels(currentW, newUnit).toFixed(2);
      canvasHeightInput.value = fromPixels(currentH, newUnit).toFixed(2);

      currentStickerUnit = newUnit;

      // Refresh UI components that might depend on unit perception
      if (showRulerCheckbox.checked) updateRulerUI();
    });
  });

  zoomInBtn.addEventListener("click", () => setZoom(currentZoom + 0.1));
  zoomOutBtn.addEventListener("click", () => setZoom(currentZoom - 0.1));
  zoomResetBtn.addEventListener("click", resetZoomPan);

  function resetZoomPan() {
    currentZoom = 1;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); // Reset pan/zoom transform
    applyDimensions();
  }

  // Function to disable/enable ruler units
  function updateRulerUI() {
    const isChecked = showRulerCheckbox.checked;
    const rulerUnitsDiv = document.getElementById("rulerUnits");
    const radios = rulerUnitsDiv.querySelectorAll("input");

    // Update visual and functional state of the unit controls
    rulerUnitsDiv.classList.toggle("opacity-40", !isChecked);
    rulerUnitsDiv.classList.toggle("pointer-events-none", !isChecked);
    radios.forEach((radio) => (radio.disabled = !isChecked));

    if (isChecked) {
      drawRuler(
        document.querySelector('input[name="rulerUnit"]:checked').value,
      );
    } else {
      removeRuler();
    }
  }

  // Functions to show/hide the barcode modal
  function showBarcodeModal(mode = "barcode") {
    activeModalMode = mode;
    barcodeModal.classList.remove("hidden");

    // Reset modal to a clean state
    modalBarcodeValueInput.classList.remove("border-red-500");

    if (mode === "qrcode") {
      modalTitle.textContent = "Add QR Code";
      modalTypeContainer.classList.add("hidden");
      modalBarcodeValueInput.value = "DATA12345"; // More generic example
      document.getElementById("modalValueLabel").textContent =
        "QR Content (Text, No, or URL)";
      document.getElementById("modalAddBtnText").textContent = "Add QR Code";
    } else {
      modalTitle.textContent = "Add Barcode";
      modalTypeContainer.classList.remove("hidden");
      modalBarcodeValueInput.value = "123456789012";
      modalBarcodeTypeSelect.value = "code128";
      document.getElementById("modalValueLabel").textContent = "Barcode Data";
      document.getElementById("modalAddBtnText").textContent = "Add Barcode";
    }
    updateModalBarcodePlaceholder();
  }

  function hideBarcodeModal() {
    barcodeModal.classList.add("hidden");
  }

  function updateModalBarcodePlaceholder() {
    if (modalBarcodeTypeSelect.value === "ean13") {
      modalBarcodeValueInput.placeholder = "e.g., 123456789012";
    } else if (modalBarcodeTypeSelect.value === "upc") {
      modalBarcodeValueInput.placeholder = "e.g., 12345678901";
    } else if (modalBarcodeTypeSelect.value === "qrcode") {
      modalBarcodeValueInput.placeholder = "URL or text data";
    } else {
      modalBarcodeValueInput.placeholder = "Barcode data";
    }
  }
  modalBarcodeTypeSelect.addEventListener(
    "change",
    updateModalBarcodePlaceholder,
  );
  closeBarcodeModalBtn.addEventListener("click", hideBarcodeModal);

  // Function to update the properties panel based on selected object
  function updatePropertiesPanel() {
    if (selectedObj) {
      propertiesPanel.classList.remove("hidden");

      // Prioritize Barcode/QR Code data check.
      // This is critical because QR Codes are fabric.Image objects but should show barcode properties.
      if (selectedObj.data && selectedObj.data.type === "barcode") {
        textPropertiesPanel.classList.add("hidden");
        barcodePropertiesPanel.classList.remove("hidden");
        bindingSection.classList.remove("hidden");
        propBarcodeValue.value = selectedObj.data.barcodeValue || "";
        propBarcodeFontSize.value = selectedObj.data.fontSize || 10;
        propBarcodeMargin.value = selectedObj.data.margin || 5;
        propBarcodeShowText.checked = selectedObj.data.writeText !== false;
        imagePropertiesPanel.classList.add("hidden");

        const isQR = selectedObj.data.barcodeType === "qrcode";
        if (propBarcodeFontSize)
          propBarcodeFontSize.closest("div").classList.toggle("hidden", isQR);
        if (propBarcodeMargin)
          propBarcodeMargin.closest("div").classList.toggle("hidden", isQR);
        if (propBarcodeShowText)
          propBarcodeShowText.closest("label").classList.toggle("hidden", isQR);

        // QR Logo Controls visibility
        const qrControls = document.getElementById("qrLogoControls");
        if (qrControls) {
          qrControls.classList.toggle("hidden", !isQR);
          if (isQR) {
            document.getElementById("propQrLogoPos").value =
              selectedObj.data.qrLogoPosition || "center";
            document.getElementById("propQrLogoRounded").checked =
              !!selectedObj.data.qrLogoRounded;
            document.getElementById("propQrLogoSize").value =
              selectedObj.data.qrLogoSize || 25;
            document.getElementById("propQrLogoPadding").value =
              selectedObj.data.qrLogoPadding || 0;
            document.getElementById("propQrLogoBgColor").value =
              selectedObj.data.qrLogoBgColor || "#ffffff";
            document.getElementById("propQrModuleShape").value =
              selectedObj.data.qrModuleShape || "square";
          }
        }
        shapePropertiesPanel.classList.add("hidden");
      } else if (
        ["rect", "circle", "line", "group"].includes(selectedObj.type)
      ) {
        // Show Shape Properties for Rects, Circles, and Tables (Groups)
        textPropertiesPanel.classList.add("hidden");
        barcodePropertiesPanel.classList.add("hidden");
        imagePropertiesPanel.classList.add("hidden");
        shapePropertiesPanel.classList.remove("hidden");
        bindingSection.classList.add("hidden");

        const isTable = selectedObj.data && selectedObj.data.type === "table";
        tablePropertiesPanel.classList.toggle("hidden", !isTable);

        // Tables are groups, we take values from the first child for display
        const target =
          selectedObj.type === "group" ? selectedObj.item(0) : selectedObj;

        propShapeFill.value =
          target.fill && target.fill !== "transparent"
            ? target.fill
            : "#ffffff";
        propShapeStroke.value =
          target.stroke && target.stroke !== "transparent"
            ? target.stroke
            : "#000000";
        propShapeStrokeWidth.value = target.strokeWidth || 0;

        propShapeWidth.value = Math.round(selectedObj.getScaledWidth());
        propShapeHeight.value = Math.round(selectedObj.getScaledHeight());

        if (isTable) {
          propTableRows.value = selectedObj.data.rows || 3;
          propTableCols.value = selectedObj.data.cols || 3;
          propTableCellWidth.value = selectedObj.data.cellWidth || 80;
          propTableCellHeight.value = selectedObj.data.cellHeight || 30;
        }
      } else if (
        selectedObj.type === "i-text" ||
        selectedObj.type === "textbox"
      ) {
        textPropertiesPanel.classList.remove("hidden");
        bindingSection.classList.remove("hidden");
        fontFamilySelect.value = selectedObj.fontFamily || "Arial";
        fontSizeRange.value = selectedObj.fontSize || 24;
        propLabelValue.value = selectedObj.text || "";

        boldBtn.classList.toggle(
          "bg-blue-100",
          selectedObj.fontWeight === "bold",
        );
        italicBtn.classList.toggle(
          "bg-blue-100",
          selectedObj.fontStyle === "italic",
        );
        underlineBtn.classList.toggle("bg-blue-100", !!selectedObj.underline);

        // Sync Wrap Properties
        if (
          propTextWrap &&
          (selectedObj.type === "i-text" || selectedObj.type === "textbox")
        ) {
          const isTextbox = selectedObj.type === "textbox";
          propTextWrap.checked = isTextbox;
          textWrapWidthContainer.classList.toggle("hidden", !isTextbox);
          if (isTextbox) {
            propTextWrapWidth.value = Math.round(selectedObj.width);
          }
        }

        barcodePropertiesPanel.classList.add("hidden");
        imagePropertiesPanel.classList.add("hidden");
        shapePropertiesPanel.classList.add("hidden");
        tablePropertiesPanel.classList.add("hidden");
      } else if (selectedObj.type === "image") {
        textPropertiesPanel.classList.add("hidden");
        barcodePropertiesPanel.classList.add("hidden");
        imagePropertiesPanel.classList.remove("hidden");
        bindingSection.classList.add("hidden");

        propImageCropX.value = selectedObj.cropX || 0;
        propImageCropY.value = selectedObj.cropY || 0;
        propImageWidth.value = selectedObj.width;
        propImageHeight.value = selectedObj.height;

        shapePropertiesPanel.classList.add("hidden");
        tablePropertiesPanel.classList.add("hidden");
      } else {
        textPropertiesPanel.classList.add("hidden");
        barcodePropertiesPanel.classList.add("hidden");
        imagePropertiesPanel.classList.add("hidden"); // Hide image properties
        shapePropertiesPanel.classList.add("hidden");
        tablePropertiesPanel.classList.add("hidden");
        bindingSection.classList.add("hidden");
      }

      // Sync Binding Dropdown
      updateBindingOptions();

      // If in "Use" mode, hide all design-specific panels but keep binding
      if (!isEditMode) {
        textPropertiesPanel.classList.add("hidden");
        barcodePropertiesPanel.classList.add("hidden");
        shapePropertiesPanel.classList.add("hidden");
        imagePropertiesPanel.classList.add("hidden");
        tablePropertiesPanel.classList.add("hidden");
        deleteSelectedBtn.classList.add("hidden");
        // Only show binding for text or barcodes
        const canBind =
          selectedObj.type === "i-text" ||
          selectedObj.type === "textbox" ||
          (selectedObj.data && selectedObj.data.type === "barcode");
        bindingSection.classList.toggle("hidden", !canBind);
      } else {
        deleteSelectedBtn.classList.remove("hidden");
      }
    } else {
      propertiesPanel.classList.add("hidden");
    }
  }

  /**
   * Updates the "Link to Column" dropdown with current Excel headers
   */
  function updateBindingOptions() {
    if (!propDataBinding) return;
    const currentValue =
      (selectedObj && selectedObj.data && selectedObj.data.binding) || "";

    let html = '<option value="">(Manual Input)</option>';
    dataColumns.forEach((col) => {
      html += `<option value="${col}" ${col === currentValue ? "selected" : ""}>${col}</option>`;
    });
    propDataBinding.innerHTML = html;
  }

  // Handle binding change
  propDataBinding.addEventListener("change", (e) => {
    if (selectedObj) {
      const binding = e.target.value;
      selectedObj.set("data", { ...selectedObj.data, binding });
      canvas.renderAll();
    }
  });

  /**
   * Tab Switching Logic
   */
  function toggleRibbonForDataView(isDataView) {
    const ribbonGroups = document.querySelectorAll(".group\\/ribbon");

    // Hide all groups except Data Management (index 1) in Data View
    for (let i = 0; i < ribbonGroups.length; i++) {
      if (i === 1) {
        ribbonGroups[i].classList.remove("hidden");
      } else {
        ribbonGroups[i].classList.toggle("hidden", isDataView);
      }
    }

    if (isDataView) {
    } else {
      // Design View button logic: Restore standard buttons
      [newDesignBtn, downloadDesignBtn, saveTemplateBtn].forEach((btn) => {
        if (btn) btn.classList.remove("hidden");
      });

      const isConnected =
        agentSocket && agentSocket.readyState === WebSocket.OPEN;
      if (printPreviewBtn)
        printPreviewBtn.classList.toggle("hidden", isConnected);
      if (printAllRowsBtn)
        printAllRowsBtn.classList.toggle("hidden", isConnected);
      if (printToZebraBtn)
        printToZebraBtn.classList.toggle("hidden", !isConnected);
      if (agentPreviewBtn)
        agentPreviewBtn.classList.toggle("hidden", !isConnected);
      if (printerSelectContainer)
        printerSelectContainer.classList.toggle("hidden", !isConnected);
    }

    if (ribbonSpacer) ribbonSpacer.classList.toggle("hidden", isDataView);
  }

  let currentApiConfigs = [];

  async function loadApiConfig() {
    // ... (no changes here, keeping existing implementation)
    const modal = document.getElementById("apiSelectionModal");
    const listContainer = document.getElementById("apiConfigList");
    if (!modal || !listContainer) return;

    try {
      modal.classList.remove("hidden");
      listContainer.innerHTML = '<div class="p-4 text-center text-slate-400 italic">Loading saved configs...</div>';

      const response = await fetch("/api/api-config");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

        currentApiConfigs = await response.json();
      if (!currentApiConfigs || currentApiConfigs.length === 0) {
          listContainer.innerHTML = '<div class="p-8 text-center text-slate-400">No saved configurations found.</div>';
          return;
      }

        listContainer.innerHTML = currentApiConfigs.map((config, idx) => `
          <div class="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group">
            <div class="cursor-pointer flex-1" onclick="selectApiConfig(${idx})">
              <div class="font-bold text-slate-800 text-sm">${config.name}</div>
              <div class="text-[10px] text-slate-400 truncate max-w-[200px]">${config.url}</div>
            </div>
            <button onclick="deleteApiConfig(${config.id}, event)" class="p-2 text-slate-300 hover:text-rose-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        `).join('');
    } catch (err) {
      console.error("Failed to load API config:", err);
      listContainer.innerHTML = `<div class="p-4 text-center text-rose-500 italic font-medium text-[10px] leading-tight">${err.message}</div>`;
      alert("Error: " + err.message);
    }
  }

  window.selectApiConfig = (index) => {
    const config = currentApiConfigs[index];
    if (!config) return;

    apiUrlInput.value = config.url || '';
    apiHeaderNameInput.value = config.header_name || '';
    apiTokenInput.value = config.token || '';
    document.getElementById("apiSelectionModal").classList.add("hidden");
  };

  window.deleteApiConfig = async (id, event) => {
    event.stopPropagation();
    if (!confirm("Delete this configuration?")) return;
    const res = await fetch(`/api/api-config/${id}`, { method: 'DELETE' });
    if (res.ok) loadApiConfig();
  };

  async function saveApiConfig() {
    const apiSaveBtnOriginalHTML = apiSaveBtn.innerHTML;
    apiSaveBtn.disabled = true;
    apiSaveBtn.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="truncate">Wait...</span>`;
    const name = prompt("Enter a name for this API configuration:", "My API Config");
    if (!name) return;

    const config = {
      name: name,
      url: apiUrlInput.value.trim(),
      header_name: apiHeaderNameInput.value.trim(),
      token: apiTokenInput.value.trim()
    };

    try {
      const response = await fetch("/api/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        console.log("API config saved successfully.");
        alert("API Settings saved successfully!");
      } else {
        const err = await response.json();
        console.error("Failed to save API settings:", err);
        alert("Failed to save settings: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Save API Config Error:", err);
      alert("Failed to save settings: " + err.message);
    } finally {
      // Always restore the button state
      apiSaveBtn.disabled = false;
      apiSaveBtn.innerHTML = apiSaveBtnOriginalHTML;
    }
  }

  // Attach API Config listeners
  if (apiSaveBtn) {
    apiSaveBtn.addEventListener("click", saveApiConfig);
  }
  if (apiRetrieveBtn) {
    apiRetrieveBtn.addEventListener("click", loadApiConfig);
  }

  const closeApiModalBtn = document.getElementById("closeApiModalBtn");
  if (closeApiModalBtn) {
    closeApiModalBtn.addEventListener("click", () =>
      document.getElementById("apiSelectionModal").classList.add("hidden"),
    );
  }

  /**
   * Print History API Interactions
   */
  async function savePrintHistory(dataRows) {
    try {
      await fetch("/api/print-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: currentTemplateName || "Unnamed Template",
          data: dataRows,
        }),
      });
    } catch (err) {
      console.error("Failed to save print history:", err);
    }
  }

  async function loadPrintHistory() {
    if (!historyTableBody) return;
    historyTableBody.innerHTML =
      '<tr><td colspan="4" class="p-12 text-center animate-pulse">Loading history...</td></tr>';
    try {
      const response = await fetch("/api/print-history");
      printHistory = await response.json();
      if (printHistory.length === 0) {
        historyTableBody.innerHTML =
          '<tr><td colspan="4" class="p-12 text-center text-slate-400 italic">No print history found.</td></tr>';
        return;
      }
      historyTableBody.innerHTML = printHistory
        .map(
          (h) => `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 text-slate-600 font-medium">${new Date(h.created_at).toLocaleString()}</td>
                    <td class="px-6 py-4 text-slate-600 font-bold">${h.template_name}</td>
                    <td class="px-6 py-4 text-slate-500">${h.row_count} records</td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end items-center gap-2">
                            <button onclick="window.reuseHistoryData(${h.id})" 
                                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-blue-100 shadow-sm group/reuse" 
                                title="Reload this data into Data Source">
                                <svg class="w-3.5 h-3.5 transition-transform group-hover/reuse:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                Reuse Data
                            </button>
                            <button onclick="window.deleteHistoryRecord(${h.id})" class="text-slate-300 hover:text-rose-500 transition-colors p-1.5 hover:bg-rose-50 rounded-lg">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        </div>
                    </td>
                </tr>
            `,
        )
        .join("");
    } catch (err) {
      historyTableBody.innerHTML =
        '<tr><td colspan="4" class="p-12 text-center text-rose-500">Failed to load history.</td></tr>';
    }
  }

  window.deleteHistoryRecord = async (id) => {
    if (!confirm("Delete this history record?")) return;
    const res = await fetch(`/api/print-history/${id}`, { method: "DELETE" });
    if (res.ok) loadPrintHistory();
  };

  window.reuseHistoryData = (id) => {
    const record = printHistory.find((r) => r.id === id);
    if (!record || !record.data_source) return;

    if (confirm(`Reload ${record.row_count} records from this print job? This will replace your current Data Source mapping.`)) {
      // Clear current search filter to ensure reloaded data is visible
      if (dataSearchInput) dataSearchInput.value = "";

      uploadedData = record.data_source.map((row, idx) => {
        const { __originalIndex, ...cleanRow } = row;
        return { ...cleanRow, __originalIndex: idx };
      });
      dataColumns = uploadedData.length > 0 ? Object.keys(uploadedData[0]).filter(k => k !== '__originalIndex') : [];

      renderDataTable();
      updateBindingOptions();
      updatePrintAllRowsButtonState();
      updateTabUI("data");
    }
  };

  function updateTabUI(activeTab) {
    const viewMap = {
      design: designView,
      data: dataView,
      templates: templatesView,
      history: historyView,
    };
    const tabMap = {
      design: tabDesign,
      data: tabUploadData,
      templates: tabTemplates,
      history: tabHistory,
    };
    console.log("Switching to tab:", activeTab);

    // Simply toggle 'hidden' class without touching 'flex' or other layout classes
    Object.keys(viewMap).forEach((key) => {
      if (!viewMap[key]) return;
      if (key === activeTab) viewMap[key].classList.remove("hidden");
      else viewMap[key].classList.add("hidden");
    });

    // Update Tab Header Styling
    Object.keys(tabMap).forEach((key) => {
      if (!tabMap[key]) return;
      if (key === activeTab) {
        tabMap[key].classList.add(
          "border-b-2",
          "border-blue-600",
          "text-blue-700",
          "bg-white",
        );
        tabMap[key].classList.remove("text-slate-500");
      } else {
        tabMap[key].classList.remove(
          "border-b-2",
          "border-blue-600",
          "text-blue-700",
          "bg-white",
        );
        tabMap[key].classList.add("text-slate-500");
      }
    });

    // Context-specific ribbon and data loading
    if (activeTab === "data") {
      toggleRibbonForDataView(true);
      console.log("Data tab activated, loading API config...");
    } else if (activeTab === "history") {
      toggleRibbonForDataView(false);
      loadPrintHistory();
    } else if (activeTab === "templates") {
      toggleRibbonForDataView(false);
      loadTemplatesFromDB();
    } else {
      toggleRibbonForDataView(false);
    }
  }

  function switchToDataTab() {
    updateTabUI("data");
  }
  tabUploadData.addEventListener("click", switchToDataTab);
  tabDesign.addEventListener("click", () => updateTabUI("design"));
  if (tabTemplates) {
    tabTemplates.addEventListener("click", () => updateTabUI("templates"));
  }
  if (tabHistory) {
    tabHistory.addEventListener("click", () => updateTabUI("history"));
  }

  async function loadTemplatesFromDB() {
    const templateGridElement = document.getElementById("templateGrid");
    if (!templateGridElement) {
      console.error("Error: templateGrid element not found in the DOM.");
      return;
    }
    console.log("loadTemplatesFromDB called: fetching data...");

    dbTemplates = []; // Reset local cache before fetch
    console.log("Attempting to fetch templates...");
    templateGridElement.innerHTML = `
            <div class="col-span-full py-20 text-center text-slate-400 animate-pulse font-medium italic">
                Fetching your designs from database...
            </div>`;

    try {
      const response = await fetch("/api/templates", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
        console.log("Received JSON response from /api/templates:", result);
      } else {
        const text = await response.text();
        console.error("Server did not return JSON. Raw response:", text);
        throw new Error(
          "Server did not return JSON. Error: " + text.substring(0, 100),
        );
      }

      if (!response.ok) {
        console.error("API Error Response (not ok):", result);
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      // Ensure result is an array even if backend structure changes
      dbTemplates = Array.isArray(result) ? result : [];
      console.log("Templates found in database:", dbTemplates.length);

      if (!Array.isArray(dbTemplates) || dbTemplates.length === 0) {
        console.log(
          "dbTemplates is empty or not an array, displaying empty message.",
        );
        templateGridElement.innerHTML = `
                    <div class="col-span-full py-20 text-center text-slate-400 italic bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-sm">
                        <svg class="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <div class="text-lg font-bold opacity-50">Database is Empty</div>
                        <div class="text-sm opacity-40 mt-1">Save a design first to see it here.</div>
                    </div>`;
        return;
      }

      console.log("Populating templateGrid with fetched data.");
      templateGridElement.innerHTML = dbTemplates
        .map((t, idx) => {
          const content = t.content || {};
          // Robust dimension logic: ensure units and values are synchronized
          const hasUserDims = content.userWidth && content.userHeight;
          const displayW = hasUserDims
            ? content.userWidth
            : content.width || "0";
          const displayH = hasUserDims
            ? content.userHeight
            : content.height || "0";
          const displayU = hasUserDims ? content.userUnit || "px" : "px";

          return `
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
                    <!-- Decorative Preview Area -->
                    <div class="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50/50 transition-colors">
                        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 0, transparent 4px);"></div>
                        <div class="relative z-10 flex flex-col items-center gap-2">
                            <svg class="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18m-9-7v14m-6-14v14m12-14v14M3 6h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
                            </svg>
                            <span class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm">Template</span>
                        </div>
                        <div class="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-800/80 text-white text-[9px] font-bold rounded backdrop-blur-sm">
                            ${displayW} x ${displayH} ${displayU}
                        </div>
                    </div>
                    <!-- Content Area -->
                    <div class="p-4 flex-1 flex flex-col">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-bold text-slate-800 truncate pr-2 text-sm" title="${t.name}">${t.name}</h4>
                            <button onclick="window.deleteTemplate(${t.id}, event)" class="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 -mt-1 -mr-1" title="Delete template">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                        <div class="text-[10px] text-slate-400 font-medium mb-4 flex items-center gap-1">
                            <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                            ${t.created_at ? new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "Date Unknown"}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.applyTemplateFromDB(${idx}, true)" 
                                class="flex-1 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-[0.98]">
                                EDIT
                            </button>
                            <button onclick="window.applyTemplateFromDB(${idx}, false)" 
                                class="flex-1 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98]">
                                USE
                            </button>
                        </div>
                    </div>
                </div>
                `;
        })
        .join("");
    } catch (err) {
      console.log(
        "Caught error in loadTemplatesFromDB, updating templateGrid with error message.",
      );
      console.error("Failed to load templates:", err);
      templateGridElement.innerHTML = `<div class="col-span-full py-20 text-center text-rose-500 italic font-medium">
                <div class="text-lg mb-2">⚠️ Database Connection Error</div>
                <div class="text-sm opacity-75">${err.message}</div>
            </div>`;
    }
  }

  // Define global functions for the template grid interactions
  window.deleteTemplate = async (id, event) => {
    if (event) event.stopPropagation();
    if (!confirm("Are you sure you want to delete this template permanently?"))
      return;
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadTemplatesFromDB();
      } else {
        alert("Could not delete template.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  window.applyTemplateFromDB = (index, isEdit = true) => {
    const template = dbTemplates[index];
    if (template && template.content) {
      currentTemplateId = template.id;
      currentTemplateName = template.name;
      setEditMode(isEdit);
      loadTemplateJSON(template.content);
    }
  };

  window.loadTemplateJSON = (jsonData) => {
    canvas.clear(); // Ensure a clean canvas before loading new template
    canvas.discardActiveObject();

    // Restore canvas size and unit settings if they exist in the metadata
    if (jsonData.width && jsonData.height) {
      // Restore print layout settings
      if (jsonData.printRows) printRowsInput.value = jsonData.printRows;
      if (jsonData.printCols) printColsInput.value = jsonData.printCols;

      if (jsonData.userUnit) {
        currentStickerUnit = jsonData.userUnit;
        // Fallback to logical conversion if userWidth is missing
        const uW =
          jsonData.userWidth ||
          fromPixels(jsonData.width, currentStickerUnit).toFixed(2);
        const uH =
          jsonData.userHeight ||
          fromPixels(jsonData.height, currentStickerUnit).toFixed(2);

        canvasWidthInput.value = uW;
        canvasHeightInput.value = uH;

        baseWidth = toPixels(parseFloat(uW), currentStickerUnit);
        baseHeight = toPixels(parseFloat(uH), currentStickerUnit);

        const unitRadio = document.querySelector(
          `input[name="stickerUnit"][value="${currentStickerUnit}"]`,
        );
        if (unitRadio) unitRadio.checked = true;
      } else {
        baseWidth = jsonData.width;
        baseHeight = jsonData.height;
        canvasWidthInput.value = jsonData.width;
        canvasHeightInput.value = jsonData.height;
        currentStickerUnit = "pixels";
        const pxRadio = document.querySelector(
          'input[name="stickerUnit"][value="pixels"]',
        );
        if (pxRadio) pxRadio.checked = true;
      }

      resetZoomPan();
    }

    canvas.loadFromJSON(jsonData, () => {
      updateTabUI("design");
      // Refresh UI components
      if (showGridCheckbox.checked) drawGrid();
      if (showRulerCheckbox.checked) updateRulerUI();
      updateActionButtonState();
      canvas.renderAll();
      if (!isEditMode) setEditMode(false); // Re-enforce lock on newly loaded objects
    });
  };

  // Import File Logic
  importExcelBtn.addEventListener("click", () => {
    switchToDataTab(); // Switch to the data view automatically
    apiConfigSection.classList.add("hidden");
    importFileModal.classList.remove("hidden");
  });

  if (closeImportFileModalBtn) {
    closeImportFileModalBtn.addEventListener("click", () => {
      importFileModal.classList.add("hidden");
    });
  }

  fileTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      let accept = ".xlsx, .xls, .csv, .json, .xml"; // Default broad selection
      if (type === "excel") accept = ".xlsx, .xls";
      else if (type === "csv") accept = ".csv";
      else if (type === "json") accept = ".json";
      else if (type === "xml") accept = ".xml";

      excelUpload.accept = accept;
      excelUpload.click();
      importFileModal.classList.add("hidden");
    });
  });

  // API Source Logic
  importApiBtn.addEventListener("click", () => {
    switchToDataTab();
    apiConfigSection.classList.remove("hidden");
  });

  excelUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    console.log("Reading file:", fileName);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let json = [];
        if (fileName.endsWith(".json")) {
          json = parseJSONData(evt.target.result);
        } else if (fileName.endsWith(".xml")) {
          json = parseXMLData(evt.target.result);
        } else {
          // SheetJS handling for Excel and CSV
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          json = XLSX.utils.sheet_to_json(worksheet);
        }

        if (json.length > 0) {
          console.log(
            "Data imported successfully:",
            json.length,
            "rows found.",
          );
          if (dataSearchInput) dataSearchInput.value = ""; // Clear search on new upload
          dataColumns = Object.keys(json[0]);
          // Add unique identifier to each row for stable filtering and selection
          uploadedData = json.map((row, idx) => ({
            ...row,
            __originalIndex: idx,
          }));
          renderDataTable();
          updateBindingOptions();
          updatePrintAllRowsButtonState(); // Enable Print All if conditions are met
        } else {
          alert("The uploaded file is empty or has no recognizable data.");
        }
      } catch (error) {
        console.error("Excel Parsing Error:", error);
        alert(
          "Could not read the Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.",
        );
      }
    };
    reader.onerror = (err) => {
      console.error("FileReader Error:", err);
      alert("Failed to read the file from your computer.");
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  });

  // API Fetch Logic
  if (apiFetchBtn) {
    apiFetchBtn.addEventListener("click", async () => {
      const url = apiUrlInput.value.trim();
      if (!url) {
        alert("Please enter a valid API URL endpoint.");
        return;
      }

      apiFetchBtn.disabled = true;
      apiFetchBtn.innerHTML = `
        <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="truncate">Wait...</span>
      `;

      try {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };
        const headerName = apiHeaderNameInput.value.trim() || "Authorization";
        const tokenValue = apiTokenInput.value.trim();

        if (tokenValue) {
          // Only auto-prefix with 'Bearer ' if using the standard Authorization header
          // and the user hasn't already provided a prefix.
          if (
            headerName.toLowerCase() === "authorization" &&
            !tokenValue.includes(" ")
          ) {
            headers[headerName] = `Bearer ${tokenValue}`;
          } else {
            headers[headerName] = tokenValue;
          }
        }

        const response = await fetch(url, {
          method: "GET",
          headers,
        });
        if (response.status === 401)
          throw new Error(
            "401 Unauthorized: Please check your API Token and Header Name.",
          );
        if (!response.ok)
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`,
          );

        const result = await response.json();
        // Normalize data: check if it's a direct array or wrapped in common keys
        const data = Array.isArray(result)
          ? result
          : result.data ||
            result.items ||
            result.results ||
            result.payload ||
            result.content ||
            [];

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("The API did not return an array of data objects.");
        }

        console.log("API Data Fetched:", data.length, "rows.");
        dataColumns = Object.keys(data[0]);
        uploadedData = data.map((row, idx) => ({
          ...row,
          __originalIndex: idx,
        }));

        renderDataTable();
        updateBindingOptions();
        updatePrintAllRowsButtonState();
        if (dataSearchInput) dataSearchInput.value = "";
      } catch (error) {
        console.error("API Error:", error);
        alert("Failed to fetch data from API: " + error.message);
      } finally {
        apiFetchBtn.disabled = false;
        apiFetchBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <span class="truncate">Fetch</span>
        `;
      }
    });
  }

  /**
   * Updates the data counters (Total and Selected)
   */
  function updateDataCounters() {
    if (totalItemsCount) totalItemsCount.textContent = uploadedData.length;
    if (selectedItemsCount) {
      selectedItemsCount.textContent = document.querySelectorAll(
        ".row-checkbox:checked",
      ).length;
    }
  }

  // Search function for the data table
  if (dataSearchInput) {
    dataSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      if (!query) {
        renderDataTable(uploadedData);
        return;
      }
      const filtered = uploadedData.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(query),
        ),
      );
      renderDataTable(filtered);
    });
  }

  async function generateQRCodeImage(value, options = {}) {
    try {
      const response = await fetch("/generate_barcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: value,
          type: "qrcode",
          margin: options.margin || 2,
          logo: options.logo || null,
          logo_position: options.logoPosition || "center",
          logo_rounded: !!options.logoRounded,
          logo_size: options.logoSize || 25,
          logo_padding: options.logoPadding || 0,
          logo_bg_color: options.logoBgColor || "#ffffff",
          module_shape: options.moduleShape || "square",
        }),
      });
      const data = await response.json();
      if (data.image) return data.image;
      throw new Error(data.error || "Generation failed");
    } catch (err) {
      console.error("QR Code Generation Failed:", err);
      return null;
    }
  }

  // Helper to generate barcode SVG using JsBarcode (Vector format prevents blurriness when scaling)
  async function generateBarcodeSVG(value, type, options) {
    const lowerType = (type || "").toLowerCase().trim();

    // 2. Handle standard Barcodes
    let finalValue = value;
    const format = (lowerType || "code128").toUpperCase();
    if (!finalValue) return null;

    if (format === "EAN13" || format === "UPC") {
      finalValue = String(value).replace(/\D/g, ""); // Numbers only

      if (format === "EAN13") {
        if (finalValue.length !== 12 && finalValue.length !== 13) {
          console.error("EAN13 requires exactly 12 or 13 digits.");
          return null;
        }
      } else if (format === "UPC") {
        // UPC-A
        if (finalValue.length !== 11 && finalValue.length !== 12) {
          console.error("UPC requires exactly 11 or 12 digits.");
          return null;
        }
      }
    }

    const svgNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    try {
      JsBarcode(svgNode, finalValue, {
        format: format,
        fontSize: parseInt(options.fontSize, 10) || 20,
        textMargin: parseInt(options.margin, 10) || 2,
        displayValue: options.writeText,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10,
        // This setting ensures guard bars are longer for EAN/UPC
        flat: false,
      });
      // Serialize SVG element to string for Fabric.js loader
      return new XMLSerializer().serializeToString(svgNode);
    } catch (err) {
      console.error("JsBarcode error:", err);
      // Provide more specific error for EAN/UPC if JsBarcode itself fails
      if (format === "EAN13" && err.message.includes("checksum")) {
        console.error(
          "EAN13 checksum calculation failed. Ensure input is valid.",
        );
        return null;
      }
      return null;
    }
  }

  // Event listener for adding a barcode
  addBarcodeBtn.addEventListener("click", () => showBarcodeModal("barcode"));
  if (addQrCodeBtn) {
    addQrCodeBtn.addEventListener("click", () => showBarcodeModal("qrcode"));
  }

  modalAddBarcodeBtn.addEventListener("click", async () => {
    console.log("Attempting to add object...");
    const barcodeValue = modalBarcodeValueInput.value;
    const barcodeType =
      activeModalMode === "qrcode" ? "qrcode" : modalBarcodeTypeSelect.value;
    if (!barcodeValue) {
      alert(
        "Please enter data for the " +
          (activeModalMode === "qrcode" ? "QR Code" : "Barcode"),
      );
      return;
    }

    // Forfeiture confirmation logic
    const now = new Date();
    if (activeSubEndsAt && activeSubEndsAt > now) {
      const remainingTimeMs = activeSubEndsAt.getTime() - now.getTime();
      const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
      const activeSubPlanType =
        subscriptionWizard.dataset.activeSubPlanType || "current";

      const confirmationMessage = `You currently have an active ${activeSubPlanType.toUpperCase()} subscription with approximately ${remainingDays} days remaining. Upgrading to a new plan will forfeit these remaining days. Do you wish to proceed?`;

      // Assuming this function is called from the subscription submission flow
      // If this is not the subscription submission, this check should be moved.
      // For now, it's placed here as per the request to be before the new subscription is processed.
      if (!confirm(confirmationMessage)) {
        // User cancelled the upgrade
        return;
      }
    }

    let generatedObject = null;

    if (barcodeType === "qrcode") {
      let logoB64 = null;
      const logoFile = document.getElementById("modalQrLogo")?.files[0];
      if (logoFile) logoB64 = await readFileAsBase64(logoFile);

      const dataUrl = await generateQRCodeImage(barcodeValue, {
        margin: 2,
        logo: logoB64,
        logoPosition:
          document.getElementById("modalQrLogoPos")?.value || "center",
        logoRounded: document.getElementById("modalQrLogoRounded")?.checked,
        logoSize: document.getElementById("modalQrLogoSize")?.value || 25,
        logoPadding: document.getElementById("modalQrLogoPadding")?.value || 0,
        logoBgColor:
          document.getElementById("modalQrLogoBgColor")?.value || "#ffffff",
        moduleShape:
          document.getElementById("modalQrModuleShape")?.value || "square",
      });
      if (!dataUrl) {
        alert(
          "QR Code failed. Try entering different text or check console for errors.",
        );
        return;
      }
      generatedObject = await new Promise((resolve) => {
        fabric.Image.fromURL(dataUrl, (img) => {
          img.set({
            left: baseWidth / 2,
            top: baseHeight / 2,
            originX: "center",
            originY: "center",
            data: {
              type: "barcode", // Still use 'barcode' type for consistency in data structure
              barcodeType: "qrcode",
              barcodeValue: barcodeValue,
              margin: 2, // Store options for update
            },
          });
          resolve(img);
        });
      });
    } else {
      const svgData = await generateBarcodeSVG(barcodeValue, barcodeType, {
        fontSize: 20,
        margin: 2,
        writeText: true,
      });

      if (!svgData) {
        let msg = "Generation failed.";
        if (barcodeType === "ean13") {
          msg = "EAN13 requires 12 or 13 numbers.";
        } else if (barcodeType === "upc") {
          msg = "UPC requires 11 or 12 numbers.";
        }
        alert(msg);
        return;
      }

      generatedObject = await new Promise((resolve) => {
        fabric.loadSVGFromString(svgData, (objects, options) => {
          const barcodeObj = fabric.util.groupSVGElements(objects, options);
          barcodeObj.set({
            left: baseWidth / 2,
            top: baseHeight / 2,
            originX: "center",
            originY: "center",
            data: {
              type: "barcode",
              barcodeType,
              barcodeValue,
              fontSize: 20,
              margin: 2,
              writeText: true,
            },
          });
          resolve(barcodeObj);
        });
      });
    }

    if (generatedObject) {
      hideBarcodeModal();
      canvas.add(generatedObject);
      canvas.setActiveObject(generatedObject);
      canvas.renderAll();
    }
  });

  // Event listener for adding a label
  addLabelBtn.addEventListener("click", () => {
    const text = new fabric.IText("Edit Label", {
      left: baseWidth / 2,
      top: baseHeight / 2,
      originX: "center",
      originY: "center",
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#000000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  });

  // Add Rectangle
  addRectBtn.addEventListener("click", () => {
    const rect = new fabric.Rect({
      left: baseWidth / 2,
      top: baseHeight / 2,
      originX: "center",
      originY: "center",
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  });

  // Add Line
  addLineBtn.addEventListener("click", () => {
    const line = new fabric.Line([50, 50, 200, 50], {
      left: baseWidth / 2,
      top: baseHeight / 2,
      originX: "center",
      originY: "center",
      stroke: "#000000",
      strokeWidth: 2,
      strokeUniform: true, // Ensures stroke doesn't distort when scaling
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.renderAll();
  });

  // Add Circle
  addCircleBtn.addEventListener("click", () => {
    const circle = new fabric.Circle({
      left: baseWidth / 2,
      top: baseHeight / 2,
      originX: "center",
      originY: "center",
      radius: 50,
      fill: "transparent",
      stroke: "#000000",
      strokeWidth: 2,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  });

  // Add Table (as a group of rectangles)
  addTableBtn.addEventListener("click", () => {
    const rows = 3;
    const cols = 3;
    const cellWidth = 80;
    const cellHeight = 30;
    const cells = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push(
          new fabric.Rect({
            left: c * cellWidth,
            top: r * cellHeight,
            width: cellWidth,
            height: cellHeight,
            fill: "transparent",
            stroke: "#000000",
            strokeWidth: 1,
          }),
        );
      }
    }

    const table = new fabric.Group(cells, {
      left: baseWidth / 2,
      top: baseHeight / 2,
      originX: "center",
      originY: "center",
      subTargetCheck: true,
      data: {
        type: "table",
        rows: rows,
        cols: cols,
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        stroke: "#000000",
        strokeWidth: 1,
        fill: "transparent",
      },
    });
    canvas.add(table);
    canvas.setActiveObject(table);
    canvas.renderAll();
  });

  // Trigger file input when "Add Logo" is clicked
  addLogoBtn.addEventListener("click", () => {
    logoUpload.click();
  });

  // Handle logo upload and add to canvas
  logoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      fabric.Image.fromURL(data, (img) => {
        img.set({
          left: baseWidth / 2,
          top: baseHeight / 2,
          originX: "center",
          originY: "center",
        });
        // Scale down image if it's too large for the canvas
        if (img.width > 200) img.scaleToWidth(200);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset to allow re-uploading the same file
  });

  /**
   * Updates image cropping properties based on panel inputs.
   * Ensures values are numeric and clamped to original dimensions.
   */
  const updateImageCrop = () => {
    if (selectedObj && selectedObj.type === "image") {
      const element = selectedObj.getElement();
      const fullW = element.width;
      const fullH = element.height;

      const cx = Math.min(
        fullW - 1,
        Math.max(0, parseInt(propImageCropX.value) || 0),
      );
      const cy = Math.min(
        fullH - 1,
        Math.max(0, parseInt(propImageCropY.value) || 0),
      );

      const maxW = fullW - cx;
      const maxH = fullH - cy;

      const cw = Math.min(
        maxW,
        Math.max(1, parseInt(propImageWidth.value) || maxW),
      );
      const ch = Math.min(
        maxH,
        Math.max(1, parseInt(propImageHeight.value) || maxH),
      );

      selectedObj.set({ cropX: cx, cropY: cy, width: cw, height: ch });
      selectedObj.setCoords();
      canvas.renderAll();
    }
  };

  // Generic updater for shape properties
  function updateShapeProperty(prop, value) {
    if (!selectedObj) return;

    if (selectedObj.type === "group") {
      selectedObj.data[prop] = value; // Keep metadata in sync
      // For tables, we update all children (cells)
      selectedObj.getObjects().forEach((obj) => obj.set(prop, value));
    } else {
      selectedObj.set(prop, value);
    }
    canvas.renderAll();
  }

  // Ungroup Table into individual shapes
  ungroupTableBtn.addEventListener("click", () => {
    if (!selectedObj || selectedObj.type !== "group") return;

    const items = selectedObj._objects;
    selectedObj.toActiveSelection();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    // After ungrouping, the objects are no longer a "table" data type
    items.forEach((obj) => {
      if (obj.data) delete obj.data.type;
    });
    updatePropertiesPanel();
  });

  // Precise dimension controls
  propShapeWidth.addEventListener("input", (e) => {
    const val = parseInt(e.target.value) || 1;
    if (selectedObj) {
      selectedObj.set("width", val / selectedObj.scaleX);
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  propShapeHeight.addEventListener("input", (e) => {
    const val = parseInt(e.target.value) || 1;
    if (selectedObj) {
      selectedObj.set("height", val / selectedObj.scaleY);
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  // Logic to rebuild the table when structure changes
  function rebuildTable() {
    if (!selectedObj || (selectedObj.data && selectedObj.data.type !== "table"))
      return;

    const rows = parseInt(propTableRows.value) || 1;
    const cols = parseInt(propTableCols.value) || 1;
    const cellW = parseInt(propTableCellWidth.value) || 10;
    const cellH = parseInt(propTableCellHeight.value) || 10;

    const currentData = { ...selectedObj.data };
    currentData.rows = rows;
    currentData.cols = cols;
    currentData.cellWidth = cellW;
    currentData.cellHeight = cellH;

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push(
          new fabric.Rect({
            left: c * cellW,
            top: r * cellH,
            width: cellW,
            height: cellH,
            fill: currentData.fill || "transparent",
            stroke: currentData.stroke || "#000000",
            strokeWidth: currentData.strokeWidth || 1,
          }),
        );
      }
    }

    const oldPos = { left: selectedObj.left, top: selectedObj.top };
    canvas.remove(selectedObj);

    const newTable = new fabric.Group(cells, {
      ...oldPos,
      originX: "center",
      originY: "center",
      data: currentData,
      subTargetCheck: true,
    });
    canvas.add(newTable);
    canvas.setActiveObject(newTable);
    selectedObj = newTable;
    canvas.renderAll();
  }

  propShapeFill.addEventListener("input", (e) => {
    updateShapeProperty("fill", e.target.value);
  });

  propShapeStroke.addEventListener("input", (e) => {
    updateShapeProperty("stroke", e.target.value);
  });

  propShapeStrokeWidth.addEventListener("input", (e) => {
    const val = parseInt(e.target.value) || 0;
    updateShapeProperty("strokeWidth", val);
  });

  [
    propTableRows,
    propTableCols,
    propTableCellWidth,
    propTableCellHeight,
  ].forEach((el) => {
    el.addEventListener("input", rebuildTable);
  });

  if (propImageCropX) {
    [propImageCropX, propImageCropY, propImageWidth, propImageHeight].forEach(
      (el) => {
        if (el) el.addEventListener("input", updateImageCrop);
      },
    );
  }

  if (resetCropBtn) {
    resetCropBtn.addEventListener("click", () => {
      if (selectedObj && selectedObj.type === "image") {
        const element = selectedObj.getElement();
        selectedObj.set({
          cropX: 0,
          cropY: 0,
          width: element.width,
          height: element.height,
        });
        selectedObj.setCoords();
        canvas.renderAll();
        updatePropertiesPanel();
      }
    });
  }

  if (fitToCanvasBtn) {
    fitToCanvasBtn.addEventListener("click", () => {
      if (selectedObj && selectedObj.type === "image") {
        selectedObj.scaleToWidth(baseWidth * 0.8);
        canvas.centerObject(selectedObj);
        selectedObj.setCoords();
        canvas.renderAll();
      }
    });
  }

  /**
   * Renders the Excel data into the table below the canvas
   */
  function renderDataTable(data = uploadedData) {
    if (!uploadedData || uploadedData.length === 0) {
      tableHeader.innerHTML =
        '<th class="p-6 border-b border-slate-100 text-slate-400 italic font-medium text-center">Data source empty</th>';
      tableBody.innerHTML = `
                <tr>
                    <td class="p-20 text-center" colspan="100%">
                        <div class="flex flex-col items-center justify-center text-slate-300">
                            <svg class="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7a2 2 0 012-2h12a2 2 0 012 2M4 7l8 5 8-5M12 12V4"></path></svg>
                            <div class="text-lg font-medium opacity-50">Upload a file or connect an API to begin</div>
                        </div>
                    </td>
                </tr>`;
      updateDataCounters();
      return;
    }

    // Update counters
    updateDataCounters();

    // Render Headers with Select All
    tableHeader.innerHTML =
      `
            <th class="px-6 py-3 border-b bg-slate-50 border-slate-200 w-10 sticky top-0 z-20">
                <input type="checkbox" id="selectAllCheckbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
            </th>
        ` +
      dataColumns
        .map(
          (col) =>
            `<th class="px-6 py-3 border-b font-bold text-slate-500 bg-slate-50 border-slate-200 whitespace-nowrap uppercase text-[10px] tracking-widest sticky top-0 z-20">${col}</th>`,
        )
        .join("");

    if (data.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td class="p-20 text-center" colspan="100%">
                        <div class="text-slate-400 font-medium italic">No matching records found for your search.</div>
                    </td>
                </tr>`;
      return;
    }

    // Render Rows with Checkboxes
    tableBody.innerHTML = data
      .map((row) => {
        const idx = row.__originalIndex;
        return `
            <tr class="data-row group hover:bg-blue-50/50 cursor-pointer transition-colors" data-index="${idx}">
                <td class="px-6 py-3 text-center border-b border-slate-100">
                    <input type="checkbox" class="row-checkbox rounded border-slate-300 text-blue-600 focus:ring-blue-500" data-index="${idx}">
                </td>
                ${dataColumns.map((col) => `<td class="px-6 py-3 text-slate-600 text-xs font-medium truncate max-w-[250px] border-b border-slate-100">${row[col] || '<span class="text-slate-300 italic">—</span>'}</td>`).join("")}
            </tr>
        `;
      })
      .join("");

    // Attach listeners for selection changes
    const rowCheckboxes = document.querySelectorAll(".row-checkbox");
    rowCheckboxes.forEach((cb) => {
      cb.addEventListener("change", updateDataCounters);
    });

    // Select All handler
    const selectAll = document.getElementById("selectAllCheckbox");
    if (selectAll) {
      selectAll.addEventListener("change", () => {
        rowCheckboxes.forEach((cb) => (cb.checked = selectAll.checked));
        updateDataCounters();
      });
    }

    // Add click listeners to rows
    document.querySelectorAll(".data-row").forEach((tr) => {
      tr.addEventListener("click", (e) => {
        // Ignore clicks on checkboxes to prevent triggering row application logic
        if (e.target.type === "checkbox") return;

        const index = tr.getAttribute("data-index");
        applyDataRow(uploadedData[index]);

        // Visual feedback for selected row
        document
          .querySelectorAll(".data-row")
          .forEach((r) => r.classList.remove("bg-blue-100"));
        tr.classList.add("bg-blue-100");
      });
    });
  }

  /**
   * Updates canvas objects based on the selected row and their data bindings
   */
  async function applyDataRow(rowData) {
    // Store the currently selected object to restore it later if needed
    const previouslySelectedObj = selectedObj;
    const previouslyUpdatingBarcode = isUpdatingBarcode;
    isUpdatingBarcode = true; // Prevent selection:cleared from firing during batch updates

    const barcodeUpdatePromises = [];

    canvas.getObjects().forEach((obj) => {
      if (
        obj.data &&
        obj.data.binding &&
        rowData[obj.data.binding] !== undefined
      ) {
        const newValue = String(rowData[obj.data.binding]);

        if (obj.type === "i-text" || obj.type === "textbox") {
          obj.set({ text: newValue });
          obj.setCoords();
        } else if (obj.data.type === "barcode") {
          // Temporarily set selectedObj to this barcode so updateBarcode works
          const previousSelected = selectedObj;
          selectedObj = obj;
          propBarcodeValue.value = newValue;

          // Ensure UI inputs match the object's settings before updating
          propBarcodeFontSize.value = obj.data.fontSize || 10;
          propBarcodeMargin.value = obj.data.margin || 5;
          propBarcodeShowText.checked = obj.data.writeText !== false;

          // updateBarcode now returns a promise
          barcodeUpdatePromises.push(updateBarcode());
          selectedObj = previousSelected;
        }
      }
    });

    // Wait for all barcodes in this row to finish rendering
    await Promise.all(barcodeUpdatePromises);

    // Restore previous selected object and flag
    selectedObj = previouslySelectedObj;
    isUpdatingBarcode = previouslyUpdatingBarcode;
    canvas.renderAll();
    if (!isGeneratingPrintBatch)
      // Only update panel if not in a batch print process
      updatePropertiesPanel(); // Sync panel inputs
  }

  // Function to update an existing barcode image when its properties change
  async function updateBarcode() {
    const targetObj = selectedObj;
    if (!targetObj || !targetObj.data || targetObj.data.type !== "barcode") {
      isUpdatingBarcode = false;
      return Promise.resolve();
    }

    const value = propBarcodeValue.value;
    const type = targetObj.data.barcodeType;
    const fontSize = propBarcodeFontSize.value;
    const margin = propBarcodeMargin.value;
    const writeText = propBarcodeShowText.checked;

    const logoPos = document.getElementById("propQrLogoPos")?.value;
    const logoRounded = document.getElementById("propQrLogoRounded")?.checked;
    const logoSize = document.getElementById("propQrLogoSize")?.value || 25;
    const logoPadding =
      document.getElementById("propQrLogoPadding")?.value || 0;
    const logoBgColor =
      document.getElementById("propQrLogoBgColor")?.value || "#ffffff";
    const moduleShape =
      document.getElementById("propQrModuleShape")?.value || "square";
    const qrLogo = targetObj.data.qrLogo;

    let newObjectData = null; // This will hold either dataUrl (for QR) or svgData (for barcode)

    if (type === "qrcode") {
      newObjectData = await generateQRCodeImage(value, {
        margin,
        logo: qrLogo,
        logoPosition: logoPos,
        logoRounded: logoRounded,
        logoSize: logoSize,
        logoPadding: logoPadding,
        logoBgColor: logoBgColor,
        moduleShape: moduleShape,
      });
      if (!newObjectData) {
        isUpdatingBarcode = false;
        alert(
          "QR Code failed to update. Try entering different text or check console for errors.",
        );
        return Promise.resolve();
      }
    } else {
      newObjectData = await generateBarcodeSVG(value, type, {
        fontSize,
        margin,
        writeText,
      });
      if (!newObjectData) {
        isUpdatingBarcode = false;
        let msg = "Generation failed.";
        if (type === "ean13") {
          msg = "EAN13 requires 12 or 13 numbers.";
        } else if (type === "upc") {
          msg = "UPC requires 11 or 12 numbers.";
        }
        alert(msg);
        return Promise.resolve();
      }
    }

    isUpdatingBarcode = true; // Set flag only when actual replacement starts
    return new Promise((resolve) => {
      const oldProps = {
        left: targetObj.left,
        top: targetObj.top,
        scaleX: targetObj.scaleX,
        scaleY: targetObj.scaleY,
        angle: targetObj.angle,
        originX: targetObj.originX || "left",
        originY: targetObj.originY || "top",
      };

      // Ensure the target object is still on the canvas before replacing it.
      // Using includes() on getObjects() is the correct way to check membership in Fabric.js.
      if (!canvas.getObjects().includes(targetObj)) {
        resolve();
        return;
      }

      canvas.remove(targetObj);

      const commonData = {
        ...targetObj.data, // Important: Preserve existing data properties like 'binding'
        type: "barcode",
        barcodeType: type,
        barcodeValue: value,
        fontSize: fontSize,
        margin: margin,
        writeText: writeText,
        qrLogo: qrLogo,
        qrLogoPosition: logoPos,
        qrLogoRounded: logoRounded,
        qrLogoSize: logoSize,
        qrLogoPadding: logoPadding,
        qrLogoBgColor: logoBgColor,
        qrModuleShape: moduleShape,
      };

      const createAndAddObject = (obj) => {
        obj.set({ ...oldProps, data: commonData });
        canvas.add(obj);

        if (selectedObj === targetObj) {
          canvas.setActiveObject(obj);
          selectedObj = obj;
        }
        obj.setCoords();
        isUpdatingBarcode = false;
        updatePropertiesPanel();
        canvas.renderAll();
        resolve();
      };

      if (type === "qrcode") {
        fabric.Image.fromURL(newObjectData, createAndAddObject);
      } else {
        fabric.loadSVGFromString(newObjectData, (objects, options) => {
          createAndAddObject(fabric.util.groupSVGElements(objects, options));
        });
      }
    });
  }

  propBarcodeValue.addEventListener("input", updateBarcode);
  // Only attach these listeners if the elements exist (they won't for QR codes)
  if (propBarcodeFontSize)
    propBarcodeFontSize.addEventListener("input", updateBarcode);
  if (propBarcodeMargin)
    propBarcodeMargin.addEventListener("input", updateBarcode);
  if (propBarcodeShowText)
    propBarcodeShowText.addEventListener("input", updateBarcode);

  // QR Property Change Listeners
  document
    .getElementById("propQrLogoPos")
    ?.addEventListener("change", updateBarcode);
  document
    .getElementById("propQrLogoRounded")
    ?.addEventListener("change", updateBarcode);
  document
    .getElementById("propQrLogoSize")
    ?.addEventListener("input", updateBarcode);
  document
    .getElementById("propQrLogoPadding")
    ?.addEventListener("input", updateBarcode);
  document
    .getElementById("propQrLogoBgColor")
    ?.addEventListener("input", updateBarcode);
  document
    .getElementById("propQrModuleShape")
    ?.addEventListener("change", updateBarcode);
  document
    .getElementById("changeQrLogoBtn")
    ?.addEventListener("click", () =>
      document.getElementById("qrLogoUpload").click(),
    );
  document
    .getElementById("qrLogoUpload")
    ?.addEventListener("change", async (e) => {
      if (selectedObj && e.target.files[0]) {
        const b64 = await readFileAsBase64(e.target.files[0]);
        selectedObj.data.qrLogo = b64;
        updateBarcode();
      }
      e.target.value = "";
    });

  // Event listeners for label property changes
  propLabelValue.addEventListener("input", (e) => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      selectedObj.set("text", e.target.value);
      selectedObj.setCoords(); // Update selection box as text grows/shrinks
      canvas.renderAll();
    }
  });

  fontFamilySelect.addEventListener("change", (e) => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      selectedObj.set("fontFamily", e.target.value);
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  // Event listeners for text styling buttons
  boldBtn.addEventListener("click", () => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      const isBold = selectedObj.fontWeight === "bold";
      selectedObj.set("fontWeight", isBold ? "normal" : "bold");
      canvas.renderAll();
      updatePropertiesPanel();
    }
  });

  italicBtn.addEventListener("click", () => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      const isItalic = selectedObj.fontStyle === "italic";
      selectedObj.set("fontStyle", isItalic ? "normal" : "italic");
      canvas.renderAll();
      updatePropertiesPanel();
    }
  });

  underlineBtn.addEventListener("click", () => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      selectedObj.set("underline", !selectedObj.underline);
      canvas.renderAll();
      updatePropertiesPanel();
    }
  });

  fontSizeRange.addEventListener("input", (e) => {
    if (
      selectedObj &&
      (selectedObj.type === "i-text" || selectedObj.type === "textbox")
    ) {
      selectedObj.set("fontSize", parseInt(e.target.value));
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  // Text Wrap Listeners
  propTextWrap?.addEventListener("change", () => {
    if (!selectedObj || !["i-text", "textbox"].includes(selectedObj.type))
      return;

    const shouldWrap = propTextWrap.checked; // True if checkbox is checked, false otherwise
    const targetType = shouldWrap ? fabric.Textbox : fabric.IText;

    // Always update the visibility of the wrap width container
    if (textWrapWidthContainer)
      textWrapWidthContainer.classList.toggle("hidden", !shouldWrap);

    // If the object is already the target type, no need to recreate it.
    // Just ensure its width is set if it's a textbox.
    if (selectedObj.type === (shouldWrap ? "textbox" : "i-text")) {
      if (
        shouldWrap &&
        selectedObj.type === "textbox" &&
        (!selectedObj.width || selectedObj.width < 10)
      ) {
        selectedObj.set("width", 200); // Set a default width if none exists or is too small
      }
      canvas.renderAll();
      saveHistory();
      return;
    }

    const props = selectedObj.toObject(["data"]);
    delete props.type; // Ensure the new class type takes precedence

    const newText = new targetType(selectedObj.text, {
      ...props,
      width: shouldWrap ? selectedObj.width || 200 : undefined, // Preserve existing width or set default
    });

    canvas.remove(selectedObj);
    canvas.add(newText);
    canvas.setActiveObject(newText);
    selectedObj = newText; // Update the selectedObj reference
    canvas.renderAll();
    saveHistory();
    updatePropertiesPanel(); // Re-sync properties panel after type change
  });

  propTextWrapWidth?.addEventListener("input", (e) => {
    if (selectedObj && selectedObj.type === "textbox") {
      selectedObj.set("width", parseInt(e.target.value) || 10);
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  // Event listeners for view options
  showGridCheckbox.addEventListener("change", () => {
    if (showGridCheckbox.checked) {
      drawGrid();
    } else {
      removeGrid();
    }
  });

  showRulerCheckbox.addEventListener("change", () => {
    updateRulerUI(); // This will now correctly update the visual state and redraw if checked
  });

  // Add event listeners to ruler unit radios to reflect changes immediately
  rulerUnitRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      updateRulerUI();
    });
  });

  // Centering logic
  centerHBtn.addEventListener("click", () => {
    if (selectedObj) {
      selectedObj.set({
        originX: "center",
        left: baseWidth / 2,
      });
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  centerVBtn.addEventListener("click", () => {
    if (selectedObj) {
      selectedObj.set({
        originY: "center",
        top: baseHeight / 2,
      });
      selectedObj.setCoords();
      canvas.renderAll();
    }
  });

  // Event listener for deleting selected object
  deleteSelectedBtn.addEventListener("click", () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      // selection:cleared handler will manage the properties panel and selectedObj reference
    }
  });

  /**
   * Helper to generate tiled sheets as images.
   * If data is linked, it populates tiles with successive rows from the table.
   * If no data is linked, it tiles the current design.
   * @returns {Promise<Array<HTMLCanvasElement>>} Array of assembled canvas sheets
   */
  async function generateTiledPages() {
    const gridWasVisible = showGridCheckbox.checked;
    const rulerWasVisible = showRulerCheckbox.checked;
    if (gridWasVisible) removeGrid();
    if (rulerWasVisible) removeRuler();

    const originalActive = canvas.getActiveObject();
    canvas.discardActiveObject().renderAll();

    const rows = parseInt(printRowsInput.value) || 1;
    const cols = parseInt(printColsInput.value) || 1;
    const labelsPerPage = rows * cols;
    const qualityMultiplier = 2; // Increase capture resolution for sharpness
    const singleWidth = baseWidth;
    const singleHeight = baseHeight;

    let dataToProcess = [];
    if (uploadedData.length > 0) {
      const selectedCheckboxes = document.querySelectorAll(
        ".row-checkbox:checked",
      );
      const rowsToPrint = Array.from(selectedCheckboxes).map(
        (cb) => uploadedData[parseInt(cb.dataset.index)],
      );

      if (rowsToPrint.length === 0) {
        alert("Please select at least one row from the data table to print.");
        isGeneratingPrintBatch = false;
        if (gridWasVisible) drawGrid();
        if (rulerWasVisible) updateRulerUI();
        if (originalActive) canvas.setActiveObject(originalActive);
        return [];
      }

      rowsToPrint.forEach((row) => {
        // Look for a quantity column (case-insensitive)
        const qtyKey = Object.keys(row).find((k) =>
          ["qty", "quantity", "count", "amount", "pieces"].includes(
            k.toLowerCase(),
          ),
        );

        // Parse quantity or default to 1 if not found or invalid
        const qty = qtyKey ? parseInt(row[qtyKey]) || 1 : 1;

        // Add the row to our processing queue 'qty' times
        for (let i = 0; i < qty; i++) {
          dataToProcess.push(row);
        }
      });
    } else {
      dataToProcess = [null];
    }

    const pages = [];
    isGeneratingPrintBatch = true; // Prevent UI panel flickering

    let currentPageCanvas = null;
    let currentPageCtx = null;
    let labelIndexOnPage = 0;

    for (let i = 0; i < dataToProcess.length; i++) {
      // 1. Update the design with row data if available
      if (dataToProcess[i]) {
        await applyDataRow(dataToProcess[i]);
      }

      // 2. Capture the updated canvas
      const imgData = canvas.toDataURL({
        format: "png",
        multiplier: qualityMultiplier / currentZoom,
        left: 0,
        top: 0,
        width: baseWidth * currentZoom,
        height: baseHeight * currentZoom
      });
      const img = await new Promise((resolve) => {
        const imgObj = new Image();
        imgObj.onload = () => resolve(imgObj);
        imgObj.src = imgData;
      });

      // 3. Setup new page if needed
      if (labelIndexOnPage === 0) {
        currentPageCanvas = document.createElement("canvas");
        currentPageCanvas.width = singleWidth * cols * qualityMultiplier;
        currentPageCanvas.height = singleHeight * rows * qualityMultiplier;
        currentPageCtx = currentPageCanvas.getContext("2d");
      }

      // 4. Draw the label in the correct tile position
      const r = Math.floor(labelIndexOnPage / cols);
      const c = labelIndexOnPage % cols;
      currentPageCtx.drawImage(img, c * singleWidth * qualityMultiplier, r * singleHeight * qualityMultiplier, singleWidth * qualityMultiplier, singleHeight * qualityMultiplier);

      labelIndexOnPage++;

      // 5. If page is full or we reached the end of data, save the page
      if (
        labelIndexOnPage === labelsPerPage ||
        i === dataToProcess.length - 1
      ) {
        pages.push(currentPageCanvas);
        labelIndexOnPage = 0;
      }
    }

    // Cleanup and Restore
    if (gridWasVisible) drawGrid();
    if (rulerWasVisible) updateRulerUI();
    if (originalActive) canvas.setActiveObject(originalActive);
    isGeneratingPrintBatch = false;
    canvas.renderAll();
    return pages;
  }

  // Event listener for downloading the design
  downloadDesignBtn.addEventListener("click", async () => {
    const canvases = await generateTiledPages();
    const link = document.createElement("a");
    link.download = "barcode-design.png";
    link.href = canvases[0].toDataURL("image/png"); // Download the first sheet
    link.click();
  });

  /**
   * Workspace Print: Opens a system print dialog for the current single design.
   * Useful for quick testing on a standard office printer or saving a single PDF.
   */
  printPreviewBtn.addEventListener("click", async () => {
    const gridWasVisible = showGridCheckbox.checked;
    const rulerWasVisible = showRulerCheckbox.checked;
    if (gridWasVisible) removeGrid();
    if (rulerWasVisible) removeRuler();

    const rows = parseInt(printRowsInput.value) || 1;
    const cols = parseInt(printColsInput.value) || 1;
    const pages = await generateTiledPages();
    if (pages.length === 0) return;
    const images = pages.map((c) => c.toDataURL("image/png"));
    openPrintWindow(images, rows, cols, true);
    
    const selectedCheckboxes = document.querySelectorAll(".row-checkbox:checked");
    const rowsToLog = Array.from(selectedCheckboxes).map(cb => uploadedData[parseInt(cb.dataset.index)]);
    savePrintHistory(rowsToLog.length > 0 ? rowsToLog : [{ manual_print: true, date: new Date().toISOString() }]);

    if (gridWasVisible) drawGrid();
    if (rulerWasVisible) updateRulerUI();
  });

  /**
   * Helper to open a stylized print preview window.
   * @param {Array} pages - Array of base64 image data.
   * @param {number} rows - Tiling rows.
   * @param {number} cols - Tiling columns.
   * @param {boolean} autoPrint - Whether to trigger the system print dialog automatically.
   */
  function openPrintWindow(pages, rows, cols, autoPrint = false) {
    if (!pages || pages.length === 0) return;
    // Use logical base dimensions (1:1) instead of zoomed canvas dimensions
    const totalWidth = baseWidth * cols;
    const totalHeight = baseHeight * rows;

    const printScript = autoPrint
      ? `
            window.print();
            window.onafterprint = function() { window.close(); };
        `
      : "";

    const popupWidth = 1000;
    const popupHeight = 800;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    const printWindow = window.open(
      "",
      "PrintPreview",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    // Generate HTML with all pages
    const imgHtml = pages
      .map(
        (src) =>
          `<img src="${src}" style="width:${totalWidth}px; height:${totalHeight}px; display:block; page-break-after:always;">`,
      )
      .join("");

    printWindow.document.open();
    printWindow.document.write(`
            <html>
                <head>
                    <title>ISKAN Studio - Print Preview</title>
                    <style>
                        @page { margin: 0; }
                        body { margin: 0; background: #f0f0f0; }
                        img { background: white; margin-bottom: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    </style>
                </head>
                <body>
                    ${imgHtml}
                    <script>
                        window.onload = function() {
                            ${printScript}
                        };
                    </script>
                </body>
            </html>
        `);
    printWindow.document.close();
  }

  // Preview Action (Web-Print Mode): Shows the full tiled batch layout
  if (agentPreviewBtn) {
    agentPreviewBtn.addEventListener("click", async () => {
      const canvases = await generateTiledPages();
      const images = canvases.map((c) => c.toDataURL("image/png"));
      openPrintWindow(
        images,
        parseInt(printRowsInput.value) || 1,
        parseInt(printColsInput.value) || 1,
        false,
      );
    });
  }

  /**
   * Generates a multi-page PDF from an array of image data URLs.
   * @param {Array<string>} imageDataURLs - Array of base64 image data URLs.
   */
  async function generateMultiPagePDF(imageDataURLs) {
    if (imageDataURLs.length === 0) {
      alert("No designs to print.");
      return;
    }

    // Ensure jsPDF is loaded
    if (
      typeof window.jspdf === "undefined" ||
      typeof window.jspdf.jsPDF === "undefined"
    ) {
      alert(
        "PDF generation library (jsPDF) not loaded. Please check your internet connection.",
      );
      return;
    }

    const rows = parseInt(printRowsInput.value) || 1;
    const cols = parseInt(printColsInput.value) || 1;
    const pageWidth = baseWidth * cols;
    const pageHeight = baseHeight * rows;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: pageWidth > pageHeight ? "l" : "p",
      unit: "px",
      format: [pageWidth, pageHeight],
    });

    for (let i = 0; i < imageDataURLs.length; i++) {
      const imgData = imageDataURLs[i];
      if (i > 0) doc.addPage();

      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    doc.save("barcode_labels.pdf");
  }

  // Event listener for printing all rows from uploaded data
  printAllRowsBtn.addEventListener("click", async () => {
    if (uploadedData.length === 0) {
      alert("Please upload an Excel file with data first.");
      return;
    }
    if (
      canvas.getObjects().filter((obj) => !obj.excludeFromExport).length === 0
    ) {
      alert("Please design your label on the canvas first.");
      return;
    }

    const selectedCheckboxes = document.querySelectorAll(
      ".row-checkbox:checked",
    );
    if (selectedCheckboxes.length === 0) {
      alert("Please select rows from the table to print.");
      return;
    }

    const rowsToPrint = Array.from(selectedCheckboxes).map(
      (cb) => uploadedData[parseInt(cb.dataset.index)],
    );

    // Calculate total labels based on Qty columns for selected rows
    const totalLabels = rowsToPrint.reduce((sum, row) => {
      const qtyKey = Object.keys(row).find((k) =>
        ["qty", "quantity", "count"].includes(k.toLowerCase()),
      );
      return sum + (qtyKey ? parseInt(row[qtyKey]) || 1 : 1);
    }, 0);

    const rows = parseInt(printRowsInput.value) || 1;
    const cols = parseInt(printColsInput.value) || 1;
    const totalPages = Math.ceil(totalLabels / (rows * cols));

    if (
      !confirm(
        `This will generate ${totalLabels} labels across ${totalPages} page(s) based on your selected rows. Continue?`,
      )
    ) {
      return;
    }

    const canvases = await generateTiledPages();
    const images = canvases.map((c) => c.toDataURL("image/png"));
    await generateMultiPagePDF(images);
    savePrintHistory(rowsToPrint);
  });

  // Event listener for creating a new design
  newDesignBtn.addEventListener("click", () => {
    const hasObjects = canvas
      .getObjects()
      .some((obj) => !obj.excludeFromExport);
    if (hasObjects) {
      if (
        !confirm(
          "Are you sure you want to create a new design? All unsaved changes will be lost.",
        )
      ) {
        return;
      }
    }

    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    selectedObj = null;
    updatePropertiesPanel();

    setEditMode(true); // Return to full edit mode when creating a new design

    // Reset template tracking
    currentTemplateId = null;
    currentTemplateName = "";

    // Reset to default dimensions (700x500 px)
    baseWidth = 700;
    baseHeight = 500;
    canvasWidthInput.value = 700;
    canvasHeightInput.value = 500;
    currentStickerUnit = "pixels";
    const pxRadio = document.querySelector(
      'input[name="stickerUnit"][value="pixels"]',
    );
    if (pxRadio) pxRadio.checked = true;

    resetZoomPan();
    // Re-initialize grid and ruler if they were active
    if (showGridCheckbox.checked) drawGrid();
    updateRulerUI();
    updateActionButtonState();
    updatePrintAllRowsButtonState(); // Also update this button
  });

  // Save the current canvas state as a JSON file
  saveTemplateBtn.addEventListener("click", async () => {
    // Temporarily remove grid and ruler so they don't get saved into the template objects
    const gridWasVisible = showGridCheckbox.checked;
    const rulerWasVisible = showRulerCheckbox.checked;
    if (gridWasVisible) removeGrid();
    if (rulerWasVisible) removeRuler();

    let templateName = "";
    let isUpdate = false;

    // Logic to determine if we are updating or saving as new
    if (currentTemplateId) {
      const confirmUpdate = confirm(
        `Do you want to update the existing template "${currentTemplateName}"?\n\nOK: Update current template\nCancel: Save as a new template`,
      );
      if (confirmUpdate) {
        isUpdate = true;
        templateName = currentTemplateName;
      } else {
        templateName = prompt(
          "Enter a name for the new template:",
          currentTemplateName,
        );
        if (!templateName) return;
      }
    } else {
      templateName = prompt("Enter a name for this template:");
      if (!templateName) return;
    }

    // Include 'data' property so our custom barcode metadata is preserved
    const jsonObject = canvas.toJSON(["data"]);

    // Save logical dimensions and unit settings to ensure it loads back exactly as designed
    jsonObject.width = baseWidth;
    jsonObject.height = baseHeight;
    jsonObject.userUnit = currentStickerUnit;
    jsonObject.userWidth = canvasWidthInput.value;
    jsonObject.userHeight = canvasHeightInput.value;
    jsonObject.printRows = printRowsInput.value;
    jsonObject.printCols = printColsInput.value;

    // Restore grid and ruler visibility
    if (gridWasVisible) drawGrid();
    if (rulerWasVisible) updateRulerUI();

    try {
      const url = isUpdate
        ? `/api/templates/${currentTemplateId}`
        : "/api/templates";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          content: jsonObject,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        // If it was a new save, track the new ID and name
        if (!isUpdate) {
          currentTemplateId = resData.id;
          currentTemplateName = templateName;
        }
        alert(
          isUpdate
            ? "Template updated successfully!"
            : "Template saved to database successfully!",
        );
      } else {
        const errorData = await response.json();
        alert(
          "Error saving template: " +
            (errorData.error || "Unknown server error"),
        );
      }
    } catch (err) {
      console.error("Save Error:", err);
    }
  });

  // Load-by-file functionality removed: templates are handled via the Template Library (Save/Open) or Import/Export

  // Fetch and display user plan on load
  async function refreshUserPlan() {
    try {
      const badge = document.getElementById("userPlanBadge");
      if (badge) {
        // Only update if it's still showing the generic placeholder
        if (badge.textContent.trim() === "Loading Plan...") {
          badge.textContent = "Pro Plan";
        }
      }
    } catch (e) {
      console.error("Plan sync error", e);
    }
  }

  // Initialize
  applyDimensions();
  updateRulerUI();
  updateActionButtonState(); // Initial state for download/print/save
  updatePrintAllRowsButtonState(); // Initial state for print all
  isCanvasInitialized = true; // Mark canvas as initialized
  saveHistory(); // Initial state
  refreshUserPlan();
});
