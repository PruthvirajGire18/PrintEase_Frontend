import React, { useState } from "react";
import axios from "axios";
import { PDFDocument } from "pdf-lib";

function Upload() {
  const [files, setFiles] = useState([]);
  const [filePages, setFilePages] = useState({}); // Store pages count for each file
  const [fileCopies, setFileCopies] = useState({}); // Store copies count for each file
  const [fileColor, setFileColor] = useState({}); // Store color mode for each file
  const [fileDoubleSided, setFileDoubleSided] = useState({}); // Store doubleSided for each file
  const [loading, setLoading] = useState(false);

  const getPDFPageCount = async (file) => {
    if (file.type !== 'application/pdf') return 1; // Non-PDF files count as 1 page
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error("Error reading PDF:", error);
      return 6; // Default fallback
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Get page count and initialize settings for each file
    const pagesObj = {};
    const copiesObj = {};
    const colorObj = {};
    const doubleSidedObj = {};
    for (let i = 0; i < selectedFiles.length; i++) {
      const pageCount = await getPDFPageCount(selectedFiles[i]);
      pagesObj[i] = pageCount;
      copiesObj[i] = 1; // Default 1 copy
      colorObj[i] = "color"; // Default color
      doubleSidedObj[i] = false; // Default single-sided
    }
    setFilePages(pagesObj);
    setFileCopies(copiesObj);
    setFileColor(colorObj);
    setFileDoubleSided(doubleSidedObj);
  };
  
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    // Remove corresponding data
    const newPages = { ...filePages };
    const newCopies = { ...fileCopies };
    const newColor = { ...fileColor };
    const newDoubleSided = { ...fileDoubleSided };
    delete newPages[index];
    delete newCopies[index];
    delete newColor[index];
    delete newDoubleSided[index];
    setFilePages(newPages);
    setFileCopies(newCopies);
    setFileColor(newColor);
    setFileDoubleSided(newDoubleSided);
  };
  
  const handlePagesChange = (index, pages) => {
    setFilePages({ ...filePages, [index]: parseInt(pages) });
  };
  
  const handleCopiesChange = (index, copies) => {
    setFileCopies({ ...fileCopies, [index]: parseInt(copies) });
  };
  
  const handleColorChange = (index, color) => {
    setFileColor({ ...fileColor, [index]: color });
  };
  
  const handleDoubleSidedChange = (index, doubleSided) => {
    setFileDoubleSided({ ...fileDoubleSided, [index]: doubleSided });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please select at least one file.");

    try {
      setLoading(true);
      
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert("❌ Razorpay not loaded. Refresh page.");
        setLoading(false);
        return;
      }
      
      // Calculate amount based on pages, copies, and color mode per file
      let totalAmount = 0;
      files.forEach((file, index) => {
        const pages = filePages[index] || 1;
        const copies = fileCopies[index] || 1;
        const color = fileColor[index] || "color";
        const pricePerPage = color === "color" ? 5 : 2; // ₹5 for color, ₹2 for BW
        totalAmount += pages * copies * pricePerPage;
      });
      
      const amount = totalAmount * 100; // Convert to paise (100 paise = 1 INR)
      
      var options = {
        key: "rzp_test_Ra9fEmIOrbpoXw",
        amount: amount,
        currency: "INR",
        name: "PrintEase",
        description: `Print Order - ${files.length} file(s)`,
        handler: async function (response) {
          console.log("✅ Payment Success:", response);
          
          try {
            // Upload files to backend after payment success
            const formData = new FormData();
            
            // Append all files
            files.forEach((file) => {
              formData.append("files", file);
            });
            
            // Prepare files data with metadata
            const filesData = files.map((file, index) => ({
              name: file.name,
              pages: filePages[index] || 1,
              copies: fileCopies[index] || 1,
              color: fileColor[index] || "color",
              doubleSided: fileDoubleSided[index] || false
            }));
            
            formData.append("filesData", JSON.stringify(filesData));
            formData.append("paymentId", response.razorpay_payment_id);
            
            // Upload to backend
            const token = localStorage.getItem("token");
            const uploadRes = await axios.post("http://localhost:5000/api/upload", formData, {
              headers: {
                "Authorization": token ? `Bearer ${token}` : "",
                "Content-Type": "multipart/form-data"
              }
            });
            
            if (uploadRes.data.success) {
              alert(`✅ Payment & Upload successful!\nOrder Number: ${uploadRes.data.order.orderNumber}\nPayment ID: ${response.razorpay_payment_id}`);
              setFiles([]);
              setFilePages({});
              setFileCopies({});
              setFileColor({});
              setFileDoubleSided({});
              e.target.reset();
            } else {
              alert("⚠️ Payment successful but upload failed. Please contact support.");
            }
          } catch (uploadErr) {
            console.error("Upload error:", uploadErr);
            alert("⚠️ Payment successful but upload failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          }
          
          setLoading(false);
        },
        prefill: {
          name: localStorage.getItem("name") || "Guest",
          contact: "9999999999",
          email: ""
        },
        theme: {
          color: "#3399cc"
        }
      };
      
      console.log("Opening Razorpay with options:", options);
      
      var rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error("❌ Payment Failed:", response.error);
        alert("❌ Payment Failed!\n" + response.error.description);
        setLoading(false);
      });
      
      rzp.on('payment.authorized', function (response) {
        console.log("✅ Payment Authorized:", response);
      });
      
      rzp.on('error', function (error) {
        console.error("❌ Razorpay Error:", error);
        alert("❌ Error: " + error.description);
        setLoading(false);
      });
      
      rzp.open();
      
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3 px-2">
            Upload Documents
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">Upload your files and customize print settings</p>
        </div>

      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8 animate-scale-in">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Files (PDF, DOCX, JPG, PNG)
            </label>
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf,.docx,.jpg,.png" 
                onChange={handleFileChange} 
                multiple
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Selected Files ({files.length})
                </p>
                {files.map((file, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <svg className="text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all ml-2"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2 md:space-y-3 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div>
                          <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Pages</label>
                          <input
                            type="number"
                            min="1"
                            value={filePages[index] || 1}
                            onChange={(e) => handlePagesChange(index, e.target.value)}
                            className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Copies</label>
                          <input
                            type="number"
                            min="1"
                            value={fileCopies[index] || 1}
                            onChange={(e) => handleCopiesChange(index, e.target.value)}
                            className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                        <div className="flex-1 w-full sm:w-auto min-w-[120px]">
                          <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Print Type</label>
                          <select 
                            value={fileColor[index] || "color"} 
                            onChange={(e) => handleColorChange(index, e.target.value)} 
                            className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                          >
                            <option value="color">Color ₹5/page</option>
                            <option value="bw">B&W ₹2/page</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-2 mt-4 sm:mt-6 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={fileDoubleSided[index] || false}
                            onChange={(e) => handleDoubleSidedChange(index, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs md:text-sm font-medium text-gray-700">2-Sided</span>
                        </label>
                        <div className="bg-blue-100 px-3 md:px-4 py-1.5 md:py-2 rounded-lg w-full sm:w-auto sm:ml-auto">
                          <span className="text-xs md:text-sm font-bold text-blue-700">
                            ₹{((filePages[index] || 1) * (fileCopies[index] || 1) * ((fileColor[index] || "color") === "color" ? 5 : 2))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <span className="text-xs md:text-sm opacity-90">Total Amount</span>
                <span className="text-2xl md:text-3xl font-bold">
                  ₹{files.reduce((sum, file, index) => {
                    const pages = filePages[index] || 1;
                    const copies = fileCopies[index] || 1;
                    const color = fileColor[index] || "color";
                    const pricePerPage = color === "color" ? 5 : 2;
                    return sum + (pages * copies * pricePerPage);
                  }, 0).toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] md:text-xs opacity-75">
                {files.length} file(s) • Color: ₹5/page • B&W: ₹2/page
              </p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading || files.length === 0} 
            className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              loading || files.length === 0
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transform"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Proceed to Payment
              </>
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

export default Upload;
