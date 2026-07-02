import React, { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Boxes, 
  CheckCircle,
  FileSpreadsheet,
  Zap,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Product, Transaction } from "../types";

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ products, transactions, onNavigate }: DashboardProps) {
  // 1. Stats calculation
  const totalItems = products.length;
  
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minLimit);
  }, [products]);

  // Storage utilization: (Sum of current stock / Sum of Max limits) * 100
  const storageUtilization = useMemo(() => {
    const totalMax = products.reduce((acc, p) => acc + p.maxLimit, 0);
    const totalCurrent = products.reduce((acc, p) => acc + p.currentStock, 0);
    if (totalMax === 0) return 0;
    return Math.round((totalCurrent / totalMax) * 100);
  }, [products]);

  // Aggregate monthly transaction data for Recharts
  const monthlyData = useMemo(() => {
    const months = ["เม.ย. 2569", "พ.ค. 2569", "มิ.ย. 2569"];
    const monthIndexMap: { [key: string]: number } = {
      "04": 0, // April
      "05": 1, // May
      "06": 2  // June
    };

    const data = months.map(m => ({ month: m, รับเข้า: 0, เบิกจ่าย: 0 }));

    transactions.forEach(tx => {
      // Date format is "YYYY-MM-DD..."
      const dateParts = tx.date.split("-");
      if (dateParts.length >= 2) {
        const mm = dateParts[1];
        const idx = monthIndexMap[mm];
        if (idx !== undefined) {
          if (tx.type === "in") {
            data[idx].รับเข้า += tx.quantity;
          } else {
            data[idx].เบิกจ่าย += tx.quantity;
          }
        }
      }
    });

    return data;
  }, [transactions]);

  // Total incoming & outgoing this month
  const currentMonthStats = useMemo(() => {
    let incoming = 0;
    let outgoing = 0;
    transactions.forEach(t => {
      if (t.type === "in") incoming += t.quantity;
      else outgoing += t.quantity;
    });
    return { incoming, outgoing };
  }, [transactions]);

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* 1. Header Banner */}
      <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden" id="dashboard-hero">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-15">
          <Layers className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 text-white font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            AI PREDICTION & PURCHASING ACTIVE
          </span>
          <h1 className="text-3xl font-black mt-3 tracking-tight drop-shadow-sm text-white font-display">
            สวัสดีคุณผู้ใช้งาน ยินดีต้อนรับสู่ระบบ STOCKSMART ✨
          </h1>
          <p className="text-indigo-100 mt-2 font-medium leading-relaxed">
            ระบบตรวจพบความสำคัญในประวัติการเบิกจ่ายและสินค้าใกล้หมดคลัง 3 รายการที่สมควรได้รับการคำนวณสั่งซื้อ 
            AI คำนวณปริมาณที่เหมาะสมตามพื้นที่จัดเก็บสูงสุด (Max) และพร้อมส่งร่างใบขอซื้ออัตโนมัติไปยังฝ่ายจัดซื้อแล้ว
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button 
              onClick={() => onNavigate("ai")}
              className="bg-white text-indigo-600 hover:bg-indigo-50 transition duration-300 px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 text-xs"
              id="btn-trigger-ai"
            >
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              ตรวจสอบรายการขอจัดซื้ออัจฉริยะ (AI)
            </button>
            <button 
              onClick={() => onNavigate("schema")}
              className="bg-indigo-700/60 hover:bg-indigo-700/80 backdrop-blur-sm text-white transition duration-300 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-xs border border-indigo-500/30"
              id="btn-view-schema"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-200" />
              ดูผังโครงสร้างฐานข้อมูลเบื้องต้น
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bento Stats Grid from the Vibrant Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Total Items */}
        <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-sm flex items-center justify-between" id="card-total-skus">
          <div>
            <span className="text-slate-400 text-xs font-bold block uppercase tracking-wide">รายการสินค้าทั้งหมด</span>
            <span className="text-3xl font-black text-indigo-600 mt-1 block font-display">
              {totalItems} <span className="text-sm font-normal text-slate-400">SKU</span>
            </span>
            <span className="text-slate-400 text-xs mt-1 block font-medium">รวมทุกหมวดหมู่ในระบบ</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Items Alert */}
        <div 
          onClick={() => onNavigate("inventory")}
          className="cursor-pointer bg-rose-50 border border-rose-100 p-5 rounded-3xl shadow-sm flex items-center justify-between hover:bg-rose-100/50 transition duration-300"
          id="card-low-stock"
        >
          <div>
            <span className="text-rose-400 text-xs font-bold block uppercase tracking-wide">สินค้าใกล้หมดสต็อก</span>
            <span className="text-3xl font-black text-rose-600 mt-1 block font-display">
              {lowStockItems.length} <span className="text-sm font-normal text-rose-400">รายการ</span>
            </span>
            <span className="text-rose-500 text-xs mt-1 block font-medium">
              {lowStockItems.length > 0 ? "⚠️ จำเป็นต้องเติมสต็อกด่วน" : "✅ สต็อกอยู่ในระดับปลอดภัย"}
            </span>
          </div>
          <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Total Month Incomings */}
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl shadow-sm flex items-center justify-between" id="card-monthly-incomings">
          <div>
            <span className="text-emerald-500 text-xs font-bold block uppercase tracking-wide">รับเข้าทั้งหมด (สะสม)</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block font-display">
              +{currentMonthStats.incoming} <span className="text-sm font-normal text-emerald-400">หน่วย</span>
            </span>
            <span className="text-emerald-600/80 text-xs mt-1 block font-medium">ทำรายการบันทึกรับของเข้า</span>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Month Outgoings */}
        <div className="bg-sky-50 border border-sky-100 p-5 rounded-3xl shadow-sm flex items-center justify-between" id="card-monthly-outgoings">
          <div>
            <span className="text-sky-500 text-xs font-bold block uppercase tracking-wide">เบิกจ่ายออก (สะสม)</span>
            <span className="text-3xl font-black text-sky-600 mt-1 block font-display">
              -{currentMonthStats.outgoing} <span className="text-sm font-normal text-sky-400">หน่วย</span>
            </span>
            <span className="text-sky-600/80 text-xs mt-1 block font-medium">การเบิกใช้วัตถุดิบหน้าร้าน</span>
          </div>
          <div className="bg-sky-100 text-sky-600 p-3 rounded-2xl shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Content (Charts and Alert banners) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-content-grid">
        
        {/* Left 2 columns: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming & Outgoing Monthly Trend */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  สรุปยอดเข้า-ออก รายเดือน (Monthly Aggregated)
                </h3>
                <p className="text-slate-500 text-xs">เปรียบเทียบสถิติการรับเข้าและยอดเบิกออกวัตถุดิบแต่ละเดือน</p>
              </div>
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  รับเข้าเดือนนี้: {currentMonthStats.incoming}
                </span>
                <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl">
                  เบิกจ่ายเดือนนี้: {currentMonthStats.outgoing}
                </span>
              </div>
            </div>
 
            <div className="h-72 w-full animate-fade-in" id="monthly-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#4f46e5", borderRadius: "16px", border: "none", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="รับเข้า" fill="#4f46e5" radius={[6, 6, 0, 0]} name="รับเข้าสินค้า (Stock In)" />
                  <Bar dataKey="เบิกจ่าย" fill="#f43f5e" radius={[6, 6, 0, 0]} name="การเบิกจ่าย (Stock Out)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Stock Storage Allocation Detail */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-1.5">
              <span>📦</span> สัดส่วนการจัดเก็บวัตถุดิบตามค่าพิกัดควบคุมความจุ (Min - Max)
            </h3>
            <div className="space-y-4">
              {products.map(p => {
                const percent = Math.min(Math.round((p.currentStock / p.maxLimit) * 100), 100);
                const isLow = p.currentStock <= p.minLimit;
                const isOverMax = p.currentStock > p.maxLimit;
                
                let barColor = "bg-indigo-600";
                if (isLow) barColor = "bg-rose-500 animate-pulse";
                else if (isOverMax) barColor = "bg-amber-500";
 
                return (
                  <div key={p.id} className="space-y-1.5" id={`storage-bar-${p.id}`}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-bold truncate max-w-xs">{p.name}</span>
                      <span className="text-slate-500 font-mono">
                        {p.currentStock} / {p.maxLimit} {p.unit} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 relative">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                      {/* Min line marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                        style={{ left: `${(p.minLimit / p.maxLimit) * 100}%` }}
                        title={`เกณฑ์ขั้นต่ำ (Min): ${p.minLimit}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-5 text-[10px] font-bold text-slate-500 bg-slate-50 p-3 rounded-2xl justify-center border border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span> ต่ำกว่าเกณฑ์ Min (วิกฤต)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block"></span> ระดับปกติ (Optimal)
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-0.5 h-3.5 bg-slate-400 inline-block"></span> ขีดจำกัด Min
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Action notifications & Quick summary */}
        <div className="space-y-6">
          {/* Stock Alert list */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                  <span className="text-rose-500">🚨</span>
                  รายการที่ต้องเติม (Alert List)
                </h3>
                <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2.5 py-1 rounded-full">
                  {lowStockItems.length} ตกเกณฑ์ Min
                </span>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">✓</div>
                  สินค้าทุกรายการมีจำนวนเพียงพอ 
                  <p className="text-xs text-slate-400 mt-1 font-normal">ยังไม่มีระดับสต็อกต่ำกว่าเกณฑ์ควบคุม Min</p>
                </div>
              ) : (
                <div className="space-y-3" id="low-stock-alert-list">
                  {lowStockItems.map(item => (
                    <div 
                      key={item.id} 
                      className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl text-xs flex flex-col justify-between"
                      id={`alert-item-${item.id}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide shrink-0">
                          REORDER NOW
                        </span>
                      </div>
                      <div className="text-slate-500 space-y-1 mt-1 font-semibold">
                        <div>SKU: <span className="font-mono text-slate-700 font-bold">{item.sku}</span></div>
                        <div className="flex justify-between mt-1">
                          <span>คงเหลือ: <strong className="text-rose-600 font-extrabold">{item.currentStock} {item.unit}</strong></span>
                          <span>เกณฑ์ Min: <strong className="text-slate-700">{item.minLimit} {item.unit}</strong></span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-rose-200/40 flex justify-between items-center">
                        <span className="text-[10px] text-indigo-600 font-bold">
                          ✨ AI แนะนำให้เติมด่วน
                        </span>
                        <button 
                          onClick={() => onNavigate("ai")}
                          className="text-[11px] text-indigo-600 hover:text-indigo-700 font-black flex items-center gap-0.5"
                        >
                          สั่งซื้อ &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick action button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="bg-indigo-50 text-indigo-900 p-4 rounded-2xl text-xs font-semibold leading-relaxed mb-4 border border-indigo-100/50">
                💡 <strong>คำแนะนำ FIFO & Lot Traceability:</strong> ระบบบริหารอายุงานเบิกจ่ายด้วยระบบ Batch แรกเข้าก่อน (First-In, First-Out) เพื่อลดโอกาสเสื่อมคุณภาพวัตถุดิบหน้าร้าน!
              </div>
              <button
                onClick={() => onNavigate("transactions")}
                className="w-full bg-indigo-600 text-white font-black text-xs py-3.5 rounded-2xl hover:bg-indigo-700 transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                id="btn-goto-transactions"
              >
                บันทึกการ รับเข้า / เบิกจ่าย ล็อตสินค้าใหม่
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
