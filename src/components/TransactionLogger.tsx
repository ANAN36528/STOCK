import React, { useState, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  User, 
  FileText, 
  Search, 
  Filter, 
  Layers, 
  Plus,
  Clock,
  UserCheck
} from "lucide-react";
import { Product, Batch, Transaction } from "../types";

interface TransactionLoggerProps {
  products: Product[];
  batches: Batch[];
  transactions: Transaction[];
  onLogTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
}

export default function TransactionLogger({ 
  products, 
  batches, 
  transactions, 
  onLogTransaction 
}: TransactionLoggerProps) {
  // Form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState<number>(5);
  
  // Batch states
  const [batchNo, setBatchNo] = useState("");
  const [selectedExistingBatch, setSelectedExistingBatch] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  
  const [operator, setOperator] = useState("");
  const [remarks, setRemarks] = useState("");

  // Filter lists
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Existing batches for selected product (especially useful for shipping out)
  const availableProductBatches = useMemo(() => {
    return batches.filter(b => b.productId === selectedProductId && b.quantity > 0);
  }, [batches, selectedProductId]);

  // Submit Logger
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("กรุณาเลือกสินค้า");
      return;
    }
    if (quantity <= 0) {
      alert("ปริมาณต้องมากกว่า 0");
      return;
    }
    if (!operator.trim()) {
      alert("กรุณากรอกชื่อผู้ทำรายการ");
      return;
    }

    let batchIdentifier = "";
    if (txType === "in") {
      if (!batchNo.trim()) {
        alert("กรุณาระบุรหัส Batch สำหรับการรับเข้าสินค้าใหม่");
        return;
      }
      batchIdentifier = batchNo.trim().toUpperCase();
    } else {
      // Out type
      if (availableProductBatches.length > 0 && !selectedExistingBatch) {
        alert("กรุณาเลือกล็อต Batch ที่ต้องการเบิกสินค้าออก");
        return;
      }
      batchIdentifier = selectedExistingBatch || batchNo.trim().toUpperCase() || "BATCH-DEFAULT";
      
      // Verify quantity limits
      const targetBatch = batches.find(b => b.productId === selectedProductId && b.batchNo === batchIdentifier);
      if (targetBatch && targetBatch.quantity < quantity) {
        alert(`ยอดคงเหลือในคลังของ Batch ${batchIdentifier} ไม่เพียงพอสำหรับการเบิก (คงเหลือเพียง ${targetBatch.quantity})`);
        return;
      }
    }

    onLogTransaction({
      productId: selectedProductId,
      productName: selectedProduct?.name || "ไม่ระบุชื่อสินค้า",
      type: txType,
      quantity: Number(quantity),
      batchNo: batchIdentifier,
      expiryDate: txType === "in" && expiryDate ? expiryDate : undefined,
      operator: operator.trim(),
      remarks: remarks.trim() || undefined
    });

    // Reset Form
    setBatchNo("");
    setExpiryDate("");
    setRemarks("");
    setSelectedExistingBatch("");
    alert("บันทึกรายการสำเร็จ! สต็อกอัปเดตเรียบร้อย");
  };

  // Filtered Transaction Ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.operator.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === "all" || t.type === filterType;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="transaction-tab">
      
      {/* 1. Transaction Logger Form */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-fit">
        <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-1.5 font-display">
          <span>📝</span>
          ฟอร์มลงบันทึกสินค้า (เข้า-ออก)
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ประเภทธุรกรรมคลัง</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTxType("in"); setSelectedExistingBatch(""); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  txType === "in" 
                    ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 shadow-sm" 
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                }`}
                id="btn-select-tx-in"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                รับสินค้าเข้า (In)
              </button>
              <button
                type="button"
                onClick={() => { setTxType("out"); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  txType === "out" 
                    ? "bg-rose-50 text-rose-700 border-2 border-rose-200 shadow-sm" 
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                }`}
                id="btn-select-tx-out"
              >
                <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                เบิกสินค้าออก (Out)
              </button>
            </div>
          </div>

          {/* Select Product */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">เลือกสินค้าวัตถุดิบ <span className="text-rose-500">*</span></label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedExistingBatch("");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700 transition"
              id="tx-product-select"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (คงเหลือ {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              จำนวนที่ทำรายการ ({selectedProduct?.unit || "หน่วย"}) <span className="text-rose-500">*</span>
            </label>
            <input 
              type="number" 
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-black text-slate-700"
            />
          </div>

          {/* Batch Tracking System */}
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-3">
            <span className="text-indigo-900 font-extrabold text-xs block uppercase flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              ข้อมูลล็อตจัดเก็บ (Batch Specs)
            </span>

            {txType === "in" ? (
              // Stock In: create new batch or specify batch
              <>
                <div>
                  <label className="block text-[9px] font-bold text-indigo-700 mb-1">รหัสล็อตใหม่ (New Batch No.) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="เช่น BTC2607A"
                    value={batchNo}
                    onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs font-mono font-black text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-indigo-700 mb-1">วันหมดอายุผลิตภัณฑ์ (Expiry Date)</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-indigo-950 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">ระบุเพื่อเปิดระบบตรวจวันหมดอายุล่วงหน้า</p>
                </div>
              </>
            ) : (
              // Stock Out: must select existing batch with stock
              <div>
                <label className="block text-[9px] font-bold text-indigo-700 mb-1">เลือกเบิกจาก Batch ในคลังที่มีอยู่ <span className="text-rose-500">*</span></label>
                {availableProductBatches.length === 0 ? (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-100 font-bold">
                    ⚠️ สินค้านี้ไม่มีข้อมูล Batch คงคลังที่พร้อมเบิก
                  </div>
                ) : (
                  <select
                    value={selectedExistingBatch}
                    onChange={(e) => setSelectedExistingBatch(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-xs font-mono font-black text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- เลือกล็อต Batch เพื่อเบิกจ่าย --</option>
                    {availableProductBatches.map(b => (
                      <option key={b.id} value={b.batchNo}>
                        Batch: {b.batchNo} (คงเหลือ: {b.quantity} {selectedProduct?.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Operator Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ผู้รับผิดชอบทำรายการ <span className="text-rose-500">*</span></label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ชื่อ-นามสกุลพนักงานคลัง"
                required
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">หมายเหตุเพิ่มเติม</label>
            <textarea 
              rows={2}
              placeholder="วัตถุประสงค์ หรือสถานที่จัดเก็บย่อย..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full font-black text-xs py-3.5 rounded-2xl text-white shadow-lg transition duration-300 ${
              txType === "in" 
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10" 
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
            }`}
            id="btn-submit-tx"
          >
            {txType === "in" ? "ลงรับเข้าสต็อก (Stock In) ✓" : "ทำรายการเบิกจ่าย (Stock Out) 📤"}
          </button>
        </form>
      </div>

      {/* 2. Transactions History Ledger */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden">
        <div>
          <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <h3 className="font-black text-slate-800 text-base font-display">
              สมุดบัญชีคลังวัตถุดิบแยกประเภท (Ledger)
            </h3>
            
            {/* Filter buttons */}
            <div className="flex gap-1.5" id="ledger-filters">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filterType === "all" ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType("in")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filterType === "in" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                รับเข้า
              </button>
              <button
                onClick={() => setFilterType("out")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filterType === "out" ? "bg-rose-50 border border-rose-200 text-rose-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                เบิกจ่าย
              </button>
            </div>
          </div>

          {/* Search bar inside Ledger */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ค้นหาตามชื่อสินค้า, รหัส Batch หรือพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-6">วันที่ทำรายการ</th>
                  <th className="py-3 px-4">รายการวัตถุดิบ</th>
                  <th className="py-3 px-4 text-center">ประเภท</th>
                  <th className="py-3 px-4 text-center">จำนวน</th>
                  <th className="py-3 px-4 text-center">Batch No.</th>
                  <th className="py-3 px-6 text-center">ผู้ดำเนินงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                      ไม่มีประวัติธุรกรรมคลังสินค้าที่ตรงตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => {
                    const formattedDate = new Date(tx.date).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/30 transition duration-150" id={`ledger-row-${tx.id}`}>
                        {/* Time */}
                        <td className="py-3 px-6 text-slate-500 font-bold">
                          {formattedDate}
                        </td>

                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-800">{tx.productName}</div>
                          {tx.remarks && (
                            <span className="text-[10px] text-slate-400 block italic mt-0.5 max-w-xs truncate">
                              ({tx.remarks})
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3 px-4 text-center">
                          {tx.type === "in" ? (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-black px-2.5 py-1 rounded-full text-[9px]">
                              รับเข้าสต็อก
                            </span>
                          ) : (
                            <span className="bg-rose-50 border border-rose-200 text-rose-800 font-black px-2.5 py-1 rounded-full text-[9px]">
                              เบิกจ่ายออก
                            </span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className={`py-3 px-4 text-center font-black text-xs ${
                          tx.type === "in" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {tx.type === "in" ? "+" : "-"}{tx.quantity}
                        </td>

                        {/* Batch */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono bg-indigo-50 border border-indigo-100 text-indigo-800 font-black px-2 py-1 rounded-lg text-[10px]">
                            {tx.batchNo}
                          </span>
                        </td>

                        {/* Operator */}
                        <td className="py-3 px-6 text-center text-slate-600 font-bold">
                          {tx.operator}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total stats footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-[10px] font-bold text-slate-400 flex justify-between">
          <span>รวมทั้งหมด: {filteredTransactions.length} รายการธุรกรรม</span>
          <span>ระบบแบบเรียลไทม์ (Local Sandbox)</span>
        </div>
      </div>

    </div>
  );
}
