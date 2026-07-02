import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Settings, 
  Trash, 
  Edit, 
  Layers, 
  Filter, 
  Search, 
  Save, 
  X,
  Tag,
  Warehouse,
  Calendar
} from "lucide-react";
import { Product, Batch } from "../types";

interface InventoryManagerProps {
  products: Product[];
  batches: Batch[];
  onAddProduct: (product: Omit<Product, "currentStock">) => void;
  onUpdateMinMax: (productId: string, minLimit: number, maxLimit: number) => void;
}

export default function InventoryManager({ 
  products, 
  batches, 
  onAddProduct, 
  onUpdateMinMax 
}: InventoryManagerProps) {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingMinMaxId, setEditingMinMaxId] = useState<string | null>(null);

  // Form states for new product
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("วัตถุดิบเครื่องดื่ม");
  const [newProductUnit, setNewProductUnit] = useState("กิโลกรัม (kg)");
  const [newMinLimit, setNewMinLimit] = useState(10);
  const [newMaxLimit, setNewMaxLimit] = useState(100);

  // Form states for editing min/max
  const [editMinVal, setEditMinVal] = useState(0);
  const [editMaxVal, setEditMaxVal] = useState(0);

  // Filter Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ["ทั้งหมด", ...Array.from(list)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "ทั้งหมด" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleStartEditMinMax = (p: Product) => {
    setEditingMinMaxId(p.id);
    setEditMinVal(p.minLimit);
    setEditMaxVal(p.maxLimit);
  };

  const handleSaveMinMax = (productId: string) => {
    if (editMinVal < 0 || editMaxVal < 0) {
      alert("ค่า Min/Max ต้องไม่ติดลบ");
      return;
    }
    if (editMinVal > editMaxVal) {
      alert("ค่า Min ต้องไม่มากกว่าค่า Max");
      return;
    }
    onUpdateMinMax(productId, editMinVal, editMaxVal);
    setEditingMinMaxId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductSku.trim()) {
      alert("กรุณากรอกชื่อสินค้าและ SKU");
      return;
    }
    if (newMinLimit > newMaxLimit) {
      alert("ค่าที่ตั้ง Min ห้ามมากกว่า Max");
      return;
    }
    
    onAddProduct({
      id: "prod-" + Date.now(),
      name: newProductName,
      sku: newProductSku.toUpperCase(),
      category: newProductCategory,
      unit: newProductUnit,
      minLimit: Number(newMinLimit),
      maxLimit: Number(newMaxLimit)
    });

    // Reset Form
    setNewProductName("");
    setNewProductSku("");
    setIsAddingProduct(false);
  };

  return (
    <div className="space-y-6" id="inventory-tab">
      
      {/* Search and Filters panel */}
      <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" id="inventory-toolbar">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ค้นหาด้วยชื่อสินค้า หรือ SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition"
              id="search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 transition"
              id="category-select"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <button 
          onClick={() => setIsAddingProduct(true)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition duration-200 animate-fade-in"
          id="btn-add-product"
        >
          <Plus className="w-4.5 h-4.5" />
          ลงทะเบียนสินค้าวัตถุดิบใหม่
        </button>
      </div>

      {/* Add Product Modal (Conditional) */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="add-product-modal">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-black text-lg flex items-center gap-2 font-display">
                <span>📦</span>
                ลงทะเบียนวัตถุดิบใหม่เข้าคลัง
              </h3>
              <button 
                onClick={() => setIsAddingProduct(false)}
                className="text-white hover:text-indigo-100 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ชื่อสินค้าวัตถุดิบ <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="เช่น แป้งเค้กญี่ปุ่นพรีเมียม"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700"
                  />
                </div>

                {/* SKU Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">รหัสสินค้า / SKU <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="เช่น FLOUR-JP-001"
                    required
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold uppercase text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">หมวดหมู่</label>
                    <select 
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700"
                    >
                      <option value="วัตถุดิบเครื่องดื่ม">วัตถุดิบเครื่องดื่ม</option>
                      <option value="เบเกอรี่ & กลิ่นผสมอาหาร">เบเกอรี่ & กลิ่นผสมอาหาร</option>
                      <option value="ถั่วและธัญพืช">ถั่วและธัญพืช</option>
                      <option value="ช็อกโกแลต & เนย">ช็อกโกแลต & เนย</option>
                      <option value="สารทดแทนน้ำตาล">สารทดแทนน้ำตาล</option>
                      <option value="บรรจุภัณฑ์ & อื่นๆ">บรรจุภัณฑ์ & อื่นๆ</option>
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">หน่วยนับ</label>
                    <select 
                      value={newProductUnit}
                      onChange={(e) => setNewProductUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-700"
                    >
                      <option value="กิโลกรัม (kg)">กิโลกรัม (kg)</option>
                      <option value="กรัม (g)">กรัม (g)</option>
                      <option value="ลิตร (L)">ลิตร (L)</option>
                      <option value="กล่อง (box)">กล่อง (box)</option>
                      <option value="ถุง (bag)">ถุง (bag)</option>
                    </select>
                  </div>
                </div>

                {/* Min Max settings */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl">
                  <span className="text-indigo-800 font-extrabold text-xs block mb-3 uppercase flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5" />
                    ขอบเขตคลังจัดเก็บสินค้า (Min / Max Capacity Control)
                  </span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-700 mb-1">จุดสต็อกต่ำสุด (Min Limit)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newMinLimit}
                        onChange={(e) => setNewMinLimit(Number(e.target.value))}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">เตือนฝ่ายจัดซื้อเมื่อสต็อกตกเกณฑ์</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-700 mb-1">จุดสต็อกสูงสุด (Max Limit)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={newMaxLimit}
                        onChange={(e) => setNewMaxLimit(Number(e.target.value))}
                        className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">ขีดจำกัดสูงสุดของเนื้อที่จัดเก็บ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAddingProduct(false)}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-indigo-600/10"
                >
                  ลงทะเบียนสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main product list table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden" id="products-table-container">
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-black text-slate-800 text-base">
            รายการทะเบียนวัตถุดิบหลักและค่าควบคุมการจัดเก็บ
          </h3>
          <span className="text-slate-500 text-xs font-bold">
            แสดง {filteredProducts.length} จาก {products.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6">ข้อมูลวัตถุดิบสินค้า / SKU</th>
                <th className="py-3.5 px-4">หมวดหมู่คลัง</th>
                <th className="py-3.5 px-4 text-center">ระดับสต็อกคงคลัง</th>
                <th className="py-3.5 px-6 text-center">การควบคุมความจุ (Min - Max)</th>
                <th className="py-3.5 px-6 text-center">สถานะสต็อก</th>
                <th className="py-3.5 px-6 text-center">อายุการเบิกจ่าย (Traceability)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    ไม่พบข้อมูลสินค้าตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.currentStock <= p.minLimit;
                  const isEditingThis = editingMinMaxId === p.id;

                  // Get active batches for this product to show trace count
                  const productBatches = batches.filter(b => b.productId === p.id && b.quantity > 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition duration-150" id={`product-row-${p.id}`}>
                      {/* Name & SKU */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-800 text-sm">{p.name}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 mt-1 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          SKU: {p.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-4 px-4 text-center font-black">
                        <span className={`text-sm block ${isLow ? "text-rose-600" : "text-emerald-600"}`}>
                          {p.currentStock}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                          {p.unit}
                        </span>
                      </td>

                      {/* Min / Max Space Limit controls */}
                      <td className="py-4 px-6 text-center">
                        {isEditingThis ? (
                          <div className="inline-flex items-center gap-2 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                            <div>
                              <span className="block text-[8px] text-indigo-800 font-bold">MIN</span>
                              <input 
                                type="number" 
                                value={editMinVal}
                                onChange={(e) => setEditMinVal(Number(e.target.value))}
                                className="w-14 bg-white border border-indigo-200 rounded px-1.5 py-0.5 text-center text-xs font-bold text-indigo-900"
                              />
                            </div>
                            <span className="text-indigo-300">-</span>
                            <div>
                              <span className="block text-[8px] text-indigo-800 font-bold">MAX</span>
                              <input 
                                type="number" 
                                value={editMaxVal}
                                onChange={(e) => setEditMaxVal(Number(e.target.value))}
                                className="w-14 bg-white border border-indigo-200 rounded px-1.5 py-0.5 text-center text-xs font-bold text-indigo-900"
                              />
                            </div>
                            <button 
                              onClick={() => handleSaveMinMax(p.id)}
                              className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition ml-1"
                              title="บันทึก"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingMinMaxId(null)}
                              className="bg-slate-200 text-slate-700 p-1 rounded hover:bg-slate-300 transition"
                              title="ยกเลิก"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-block text-center bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-1.5">
                            <span className="text-xs text-slate-500 font-medium">
                              Min: <strong className="text-rose-600 font-black">{p.minLimit}</strong>
                            </span>
                            <span className="mx-2 text-slate-300">|</span>
                            <span className="text-xs text-slate-500 font-medium">
                              Max: <strong className="text-indigo-600 font-black">{p.maxLimit}</strong>
                            </span>
                            <button 
                              onClick={() => handleStartEditMinMax(p)}
                              className="ml-2 text-indigo-500 hover:text-indigo-700 inline-block align-middle transition"
                              title="แก้ไขค่าควบคุมความจุคลัง"
                            >
                              <Edit className="w-3.5 h-3.5 inline" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status indicator */}
                      <td className="py-4 px-6 text-center">
                        {isLow ? (
                          <span className="bg-rose-50 border border-rose-200 text-rose-700 font-black text-[10px] px-3 py-1 rounded-full animate-pulse inline-block">
                            ⚠️ ต่ำกว่าเกณฑ์วิกฤต
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-[10px] px-3 py-1 rounded-full inline-block">
                            ✓ สต็อกพร้อมใช้งาน
                          </span>
                        )}
                      </td>

                      {/* Batch view popup/button */}
                      <td className="py-4 px-6 text-center">
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                          คุมอยู่ {productBatches.length} ล็อต (Batch)
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traceable Batch Section */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm" id="batch-trace-panel">
        <h3 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
          <span>📦</span>
          ระบบตรวจสอบย้อนกลับราย Batch (Traceability & Expiry Tracker)
        </h3>
        
        <p className="text-slate-500 text-xs mb-5">
          แสดงรายการล็อตวัตถุดิบทั้งหมดที่จัดเก็บบนคั้นคลัง พร้อมระบุรหัส Batch วันที่รับเข้าคลัง และระบุอายุการเก็บรักษา (Expiration Dates) เพื่อคัดแยกและเบิกใช้ตามเกณฑ์อายุสินค้า (FIFO)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.filter(b => b.quantity > 0).map(b => {
            const product = products.find(p => p.id === b.productId);
            if (!product) return null;

            // Calculate status based on expiry
            const isExpired = b.expiryDate ? new Date(b.expiryDate) < new Date() : false;
            
            return (
              <div 
                key={b.id} 
                className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                  isExpired 
                    ? "bg-red-50 border-red-200 text-red-900" 
                    : "bg-slate-50/50 border-slate-200 text-slate-700"
                }`}
                id={`batch-card-${b.id}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-black text-[9px] uppercase bg-indigo-600 text-white px-2 py-1 rounded-lg tracking-wider font-mono shadow-sm">
                    BATCH: {b.batchNo}
                  </span>
                  {isExpired && (
                    <span className="bg-red-200 text-red-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                      EXPIRY ALERT
                    </span>
                  )}
                </div>
                <h4 className="font-black text-slate-800 text-xs truncate mb-2">{product.name}</h4>
                <div className="text-[11px] text-slate-500 space-y-1.5 mt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>ยอดคงคลังล็อตนี้:</span>
                    <strong className="text-slate-950">{b.quantity} {product.unit}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>วันที่ลงรับเข้าคลัง:</span>
                    <strong className="text-slate-700">{b.receivedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>วันสิ้นอายุการใช้งาน:</span>
                    <strong className={isExpired ? "text-red-600 font-extrabold" : "text-indigo-600 font-extrabold"}>
                      {b.expiryDate || "ไม่ได้ระบุ"}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
