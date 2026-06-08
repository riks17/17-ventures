"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Eye } from "lucide-react";

// Helper to convert numbers to Indian Rupee words
const numberToWords = (num: number) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num > 999999999) return "Overflow";

  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " and " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 !== 0 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 !== 0 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "")
    );
  };

  return convert(num) + " only";
};

export default function BillingSystem() {
  // Navigation State
  const [view, setView] = useState<"edit" | "preview">("edit");

  // Form State
  const [biller, setBiller] = useState("Dinesh Satra");
  const [business, setBusiness] = useState("Pinnacle Ventures");
  const [baseAmount, setBaseAmount] = useState(65000);
  const [billingDate, setBillingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [rentMonth, setRentMonth] = useState("June");
  const [rentYear, setRentYear] = useState("2026");
  const [serialNumber, setSerialNumber] = useState("01");
  const [paymentMode, setPaymentMode] = useState("NEFT");

  // Scaling State for Mobile Preview
  const [scale, setScale] = useState(1);

  // AUTO-INCREMENT LOGIC: Load the last used serial number for the chosen combination
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `17ventures_serial_${biller}_${business}`;
      const lastUsed = localStorage.getItem(storageKey);
      if (lastUsed && !isNaN(parseInt(lastUsed))) {
        // Add 1 to the last used, pad with a leading 0 if needed
        const nextNumber = parseInt(lastUsed, 10) + 1;
        setSerialNumber(nextNumber.toString().padStart(2, "0"));
      } else {
        // Default starting points based on previous templates if no history exists
        if (biller === "Dinesh Satra" && business === "Pinnacle Ventures")
          setSerialNumber("08");
        else if (
          biller === "Dinesh Satra" &&
          business === "SRAR Corporation LLP"
        )
          setSerialNumber("57");
        else setSerialNumber("01");
      }
    }
  }, [biller, business]);

  // Hook to handle dynamic file naming based on the current view
  useEffect(() => {
    if (view === "preview") {
      const formattedBusiness = business.toUpperCase().replace(/\s+/g, "_");
      const formattedMonth = rentMonth.toUpperCase();
      document.title = `${formattedBusiness}_${formattedMonth}_${rentYear}`;
    } else {
      document.title = "17 Ventures Invoice Generator";
    }
  }, [view, business, rentMonth, rentYear]);

  // Hook for Dynamic Scaling
  useEffect(() => {
    if (view !== "preview") return;

    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 826) {
        setScale((screenWidth - 32) / 794);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [view]);

  // Derived Calculations
  const taxRate = biller === "Dinesh Satra" ? 0.09 : 0;
  const cgst = baseAmount * taxRate;
  const sgst = baseAmount * taxRate;
  const totalAmount = baseAmount + cgst + sgst;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Determine Invoice Initials based on Business and Biller
  const getInitials = () => {
    if (biller === "Sachin Satra") return "SS";
    if (biller === "Dinesh Satra" && business === "SRAR Corporation LLP")
      return "DS";
    return "RKV"; // Default for Dinesh + Pinnacle
  };

  const shortYear = parseInt(rentYear.slice(-2));
  const fiscalYear = `${shortYear}-${shortYear + 1}`;
  const invoiceNumber = `${getInitials()}/${serialNumber}/${fiscalYear}`;

  const handlePrint = () => {
    // Save the current serial number to local storage before printing
    if (typeof window !== "undefined") {
      const storageKey = `17ventures_serial_${biller}_${business}`;
      // Save the raw integer string (e.g., "8" or "57")
      localStorage.setItem(storageKey, parseInt(serialNumber, 10).toString());
    }

    window.print();
  };

  // Reusable input class
  const inputClassName =
    "w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all text-gray-900 font-medium appearance-none";

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        }
      `}</style>

      {/* VIEW 1: EDIT FORM */}
      {view === "edit" && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans">
          <div className="w-full max-w-2xl bg-white shadow-sm border border-gray-200 rounded-xl p-6 sm:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                17 Ventures
              </h1>
              <p className="text-gray-500 mt-1">Invoice Generation System</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Biller
                  </label>
                  <select
                    value={biller}
                    onChange={(e) => setBiller(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="Dinesh Satra">Dinesh Satra</option>
                    <option value="Sachin Satra">Sachin Satra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business
                  </label>
                  <select
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="Pinnacle Ventures">Pinnacle Ventures</option>
                    <option value="SRAR Corporation LLP">
                      SRAR Corporation LLP
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rent Month
                  </label>
                  <select
                    value={rentMonth}
                    onChange={(e) => setRentMonth(e.target.value)}
                    className={inputClassName}
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rent Year
                  </label>
                  <input
                    type="text"
                    value={rentYear}
                    onChange={(e) => setRentYear(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Serial No.
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (Pre-tax)
                  </label>
                  <input
                    type="number"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(Number(e.target.value))}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Billing Date
                  </label>
                  <input
                    type="date"
                    value={billingDate}
                    onChange={(e) => setBillingDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className={inputClassName}
                >
                  <option value="NEFT">NEFT</option>
                  <option value="IMPS">IMPS</option>
                  <option value="RTGS">RTGS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setView("preview")}
              className="mt-10 w-full bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <Eye size={20} />
              Preview Invoice
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: DOCUMENT PREVIEW */}
      {view === "preview" && (
        <div className="min-h-screen bg-gray-200 flex flex-col font-sans print:bg-white">
          <div className="sticky top-0 z-50 bg-white border-b border-gray-300 px-4 py-4 sm:px-8 flex justify-between items-center shadow-sm print:hidden">
            <button
              onClick={() => setView("edit")}
              className="flex items-center gap-2 text-gray-700 font-semibold hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Edit</span>
              <span className="sm:hidden">Back</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-black text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>

          <div className="flex-1 w-full flex justify-center py-8 print:py-0 overflow-hidden">
            <div
              className="origin-top print:!scale-100 print:!transform-none"
              style={{
                transform: `scale(${scale})`,
                height: scale < 1 ? `${1122 * scale}px` : "auto",
              }}
            >
              <div
                className="bg-white shadow-2xl p-10 text-sm text-black relative print:shadow-none print:w-[210mm] print:h-[297mm] print:p-12 contenteditable focus:outline-none"
                style={{ width: "210mm", minHeight: "297mm" }}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                  <div className="w-1/2">
                    <h2 className="font-bold text-lg uppercase">{biller}</h2>
                    {/* Only show address header for Dinesh Satra and SRAR */}
                    {biller === "Dinesh Satra" &&
                      business === "SRAR Corporation LLP" && (
                        <p className="text-xs font-semibold mt-1 mb-1 pr-4 uppercase">
                          ADDRESS: Shop No. 40, Fifth Avenue, Rosa Manhattan,
                          Kasarvadavali, Thane West-400615
                        </p>
                      )}
                    {biller === "Dinesh Satra" ? (
                      <p className="mt-1">GSTIN:- 27AQXPS3256P1ZM</p>
                    ) : (
                      <p className="mt-1">PAN NO.:- AQTPS3590E</p>
                    )}
                  </div>
                  <div className="w-1/2 text-right">
                    <p>
                      <span className="font-semibold">DATE:-</span>{" "}
                      {formatDate(billingDate)}
                    </p>
                    <p>
                      <span className="font-semibold">INVOICE No.:-</span>{" "}
                      {invoiceNumber}
                    </p>
                  </div>
                </div>

                {/* Client Details */}
                <div className="mb-8">
                  <p className="font-semibold">To,</p>

                  {business === "Pinnacle Ventures" ? (
                    <>
                      <p className="font-bold">PINNACLE VENTURES,</p>
                      <p>Shop No. 27, Hissa No. 6,</p>
                      <p>Sun Soman Square,</p>
                      <p>Agra Road, Sahajanand Chowk,</p>
                      <p>Kalyan, Thane District, Maharashtra,</p>
                      <p>Pin Code- 421301</p>
                      <p>
                        <span className="font-semibold">GSTIN :</span>{" "}
                        27ABGFP9078A1Z1
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">SRAR CORPORATION LLP,</p>
                      <p>Shop No. 40, Ground Floor,</p>
                      <p>Fifth Avenue, Rosa Manhattan,</p>
                      <p>Godhbunder Road, Kasarvadali,</p>
                      <p>Thane (West), Maharashtra,</p>
                      <p>Pin Code-400615</p>
                      <p>
                        <span className="font-semibold">GSTIN :</span>{" "}
                        27AFGFS6557R1ZX
                      </p>
                    </>
                  )}
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-black mb-6">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="p-2 border-r border-black w-16 text-center">
                        Sr. No.
                      </th>
                      <th className="p-2 border-r border-black">
                        ITEM DESCRIPTIONS
                      </th>
                      <th className="p-2 text-right w-40">TAXABLE VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border-r border-black text-center align-top pt-4">
                        1.
                      </td>
                      <td className="p-2 border-r border-black font-bold align-top pt-4">
                        RENTING OF IMMOVABLE PROPERTY SERVICE FOR THE MONTH OF{" "}
                        {rentMonth.toUpperCase()} {rentYear}
                      </td>
                      <td className="p-2 text-right align-top pt-4 font-bold">
                        {baseAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-4 border-r border-black"></td>
                      <td className="border-r border-black"></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black flex justify-between">
                        <span>NET AMOUNT</span>
                        <span>.</span>
                      </td>
                      <td className="p-2 text-right">
                        {baseAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    {biller === "Dinesh Satra" && (
                      <>
                        <tr>
                          <td className="p-2 border-r border-black"></td>
                          <td className="p-2 border-r border-black flex justify-between">
                            <span>OUTPUT CGST 9%</span>
                            <span>.</span>
                          </td>
                          <td className="p-2 text-right">
                            {cgst.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-black"></td>
                          <td className="p-2 border-r border-black flex justify-between">
                            <span>OUTPUT SGST 9%</span>
                            <span>.</span>
                          </td>
                          <td className="p-2 text-right">
                            {sgst.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </>
                    )}

                    <tr className="border-t border-black font-bold">
                      <td className="p-2 border-r border-black"></td>
                      <td className="p-2 border-r border-black text-right">
                        TOTAL
                      </td>
                      <td className="p-2 text-right">
                        {totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mb-16">
                  <p className="font-semibold">
                    Total Invoice Value (In Words)
                  </p>
                  <p className="capitalize">{numberToWords(totalAmount)}.</p>
                </div>

                <div className="flex justify-end mb-12">
                  <p className="font-bold mr-10">AUTHORISED SIGNATORY</p>
                </div>

                {/* Receipt Section */}
                <div className="border-t-2 border-dashed border-gray-400 pt-6 mt-8 flex justify-between items-start">
                  <div>
                    <p className="font-bold underline mb-2">Receipt</p>
                    <p>
                      <span className="font-semibold">Invoice No.:</span>{" "}
                      {invoiceNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Amount :</span> Rs.{" "}
                      {totalAmount.toLocaleString("en-IN")} /-
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span> Received
                    </p>
                    <p>
                      <span className="font-semibold">Mode of Payment:</span>{" "}
                      {paymentMode}
                    </p>
                  </div>
                  <div className="mt-8">
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {formatDate(receiptDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
