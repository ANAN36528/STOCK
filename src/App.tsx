import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Boxes, 
  Clock, 
  Zap, 
  Database, 
  HelpCircle,
  Warehouse,
  Menu,
  X
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import InventoryManager from "./components/InventoryManager";
import TransactionLogger from "./components/TransactionLogger";
import AIProcurement from "./components/AIProcurement";
import DatabaseSchemaViewer from "./components/DatabaseSchemaViewer";
import { Product, Batch, Transaction, PurchaseRequisition } from "./types";
import { INITIAL_PRODUCTS, INITIAL_BATCHES, INITIAL_TRANSACTIONS } from "./data";

export default function App() {
  // 1. Core Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("smart_stock_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    const saved = localStorage.getItem("smart_stock_batches");
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("smart_stock_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(() => {
    const saved = localStorage.getItem("smart_stock_requisitions");
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Active Screen Tab State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync states to LocalStorage
  useEffect(() => {
    localStorage.setItem("smart_stock_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("smart_stock_batches", JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem("smart_stock_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("smart_stock_requisitions", JSON.stringify(requisitions));
  }, [requisitions]);

  // 3. State Handler Functions
  
  // Add product
  const handleAddProduct = (newProd: Omit<Product, "currentStock">) => {
    const product: Product = {
      ...newProd,
      currentStock: 0
    };
    setProducts(prev => [product, ...prev]);
  };

  // Update min max limits
  const handleUpdateMinMax = (productId: string, minLimit: number, maxLimit: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, minLimit, maxLimit };
      }
      return p;
    }));
  };

  // Log in/out transactions and update inventory/batches
  const handleLogTransaction = (newTx: Omit<Transaction, "id" | "date">) => {
    const txId = "tx-" + Date.now();
    const timestamp = new Date().toISOString();
    
    const transaction: Transaction = {
      ...newTx,
      id: txId,
      date: timestamp
    };

    // Prepend new transaction
    setTransactions(prev => [transaction, ...prev]);

    // Update product stock and batches
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === transaction.productId) {
        const delta = transaction.type === "in" ? transaction.quantity : -transaction.quantity;
        return { ...p, currentStock: Math.max(0, p.currentStock + delta) };
      }
      return p;
    }));

    setBatches(prevBatches => {
      if (transaction.type === "in") {
        // Look for existing batch
        const existingIdx = prevBatches.findIndex(b => b.productId === transaction.productId && b.batchNo === transaction.batchNo);
        if (existingIdx !== -1) {
          const updated = [...prevBatches];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + transaction.quantity
          };
          return updated;
        } else {
          // Add new batch
          const newBatch: Batch = {
            id: "b-" + Date.now(),
            productId: transaction.productId,
            batchNo: transaction.batchNo,
            quantity: transaction.quantity,
            expiryDate: transaction.expiryDate,
            receivedDate: timestamp.split("T")[0]
          };
          return [newBatch, ...prevBatches];
        }
      } else {
        // Issue stock: deduct from selected batch
        return prevBatches.map(b => {
          if (b.productId === transaction.productId && b.batchNo === transaction.batchNo) {
            return { ...b, quantity: Math.max(0, b.quantity - transaction.quantity) };
          }
          return b;
        }).filter(b => b.quantity >= 0); // Keep empty batches for record of previous log or filter if 0
      }
    });
  };

  // Add multiple Requisitions (AI or manual)
  const handleAddRequisitions = (newReqs: PurchaseRequisition[]) => {
    // Filter out duplicates based on product and draft status to avoid duplicate PR bloating
    setRequisitions(prev => {
      const filteredPrev = prev.filter(p => !newReqs.some(n => n.productId === p.productId && p.status === "draft"));
      return [...newReqs, ...filteredPrev];
    });
  };

  // Update Requisition Status (e.g. submit / send email notification)
  const handleUpdateRequisitionStatus = (id: string, status: "draft" | "submitted" | "notified") => {
    setRequisitions(prev => prev.map(pr => {
      if (pr.id === id) {
        return { 
          ...pr, 
          status,
          notifiedAt: status === "notified" ? new Date().toISOString() : pr.notifiedAt
        };
      }
      return pr;
    }));
  };

  // Navigation Helper
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans" id="app-root">
      
      {/* 1. Mobile Top Bar */}
      <div className="lg:hidden bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md z-40" id="mobile-navbar">
        <div className="flex items-center gap-2">
          <span className="text-xl">📦</span>
          <span className="font-extrabold text-sm tracking-tight text-white font-display">STOCKSMART</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-indigo-100 transition p-1"
          id="btn-toggle-mobile"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 2. Side Menu Layout */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-indigo-600 text-indigo-100 w-64 p-6 flex flex-col justify-between shadow-2xl z-30 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="app-sidebar"
      >
        <div className="space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-sm shrink-0">
              📦
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight block font-display">STOCKSMART</span>
              <span className="text-[10px] text-indigo-200 font-bold block tracking-wider uppercase">AI Procurement</span>
            </div>
          </div>

          {/* Navigation Menu Buttons */}
          <nav className="space-y-2" id="sidebar-navigation">
            <button
              onClick={() => handleNavigate("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === "dashboard"
                  ? "bg-white/20 text-white shadow-md border-l-4 border-white"
                  : "hover:bg-white/10 text-indigo-100 hover:text-white"
              }`}
            >
              <span className="text-base">📊</span>
              แผงควบคุมหลัก (Dashboard)
            </button>

            <button
              onClick={() => handleNavigate("inventory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === "inventory"
                  ? "bg-white/20 text-white shadow-md border-l-4 border-white"
                  : "hover:bg-white/10 text-indigo-100 hover:text-white"
              }`}
            >
              <span className="text-base">📦</span>
              รายการวัตถุดิบ & คุม Min-Max
            </button>

            <button
              onClick={() => handleNavigate("transactions")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === "transactions"
                  ? "bg-white/20 text-white shadow-md border-l-4 border-white"
                  : "hover:bg-white/10 text-indigo-100 hover:text-white"
              }`}
            >
              <span className="text-base">📝</span>
              บันทึก รับเข้า - เบิกจ่าย
            </button>

            <button
              onClick={() => handleNavigate("ai")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === "ai"
                  ? "bg-white/20 text-white shadow-md border-l-4 border-white"
                  : "hover:bg-white/10 text-indigo-100 hover:text-white"
              }`}
            >
              <span className="text-base">✨</span>
              AI จัดซื้อ & ดึงข้อมูลใบขอซื้อ
            </button>

            <button
              onClick={() => handleNavigate("schema")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                activeTab === "schema"
                  ? "bg-white/20 text-white shadow-md border-l-4 border-white"
                  : "hover:bg-white/10 text-indigo-100 hover:text-white"
              }`}
            >
              <span className="text-base">💾</span>
              โครงสร้างฐานข้อมูล (DB Schema)
            </button>
          </nav>
        </div>

        {/* Sidebar Footer info with AI Assistant card */}
        <div className="space-y-4">
          <div className="p-4 bg-indigo-700 rounded-2xl border border-indigo-500/30">
            <p className="text-[10px] font-black text-indigo-200 mb-1 tracking-wider uppercase">AI ASSISTANT</p>
            <p className="text-[11px] text-indigo-100 leading-snug">ตรวจพบแนวโน้มการใช้วัตถุดิบคงคลังเพิ่มขึ้น แนะนำใช้ฟีเจอร์คำนวณจัดซื้ออัจฉริยะ</p>
          </div>
          
          <div className="border-t border-indigo-500/40 pt-4 text-center lg:text-left">
            <span className="text-[10px] text-indigo-300 block font-semibold">เวอร์ชันซอฟต์แวร์</span>
            <span className="text-[11px] text-indigo-100 font-bold block mt-0.5">V1.0.0-Beta (Vibrant Palette)</span>
          </div>
        </div>
      </aside>

      {/* Background Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        ></div>
      )}

      {/* 3. Main Workspace Container */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto" id="main-content-panel">
        
        {/* Top Navbar Header */}
        <header className="hidden lg:flex justify-between items-center bg-white border-b border-slate-100 px-8 py-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {activeTab === "dashboard" && "📊 แผงควบคุมและภาพรวมคลังวัตถุดิบ"}
              {activeTab === "inventory" && "📦 ทะเบียนคุมวัตถุดิบและค่าควบคุมความจุ (Min-Max)"}
              {activeTab === "transactions" && "📝 ประวัติการนำสินค้าเข้าและระบบเบิกจ่ายรายล็อต"}
              {activeTab === "ai" && "✨ จัดซื้ออัจฉริยะ (AI-Powered Requisition Recommendation)"}
              {activeTab === "schema" && "💾 ร่างรูปแบบความจุตารางและฐานข้อมูล"}
            </h2>
            <p className="text-xs text-slate-400">ระบบประเมินอายุการจัดสรรคลังบริษัท</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">เวลาทำงานระบบ</span>
              <span className="text-xs text-slate-700 font-bold block">10.0.0.1 (Sandbox Mode)</span>
            </div>
            <div className="h-8 w-0.5 bg-slate-200"></div>
            <div className="bg-slate-100 p-2.5 rounded-full text-slate-600">
              <Warehouse className="w-4 h-4 text-slate-700" />
            </div>
          </div>
        </header>

        {/* Scrollable Area Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <Dashboard 
              products={products} 
              transactions={transactions} 
              onNavigate={handleNavigate} 
            />
          )}

          {activeTab === "inventory" && (
            <InventoryManager 
              products={products} 
              batches={batches} 
              onAddProduct={handleAddProduct}
              onUpdateMinMax={handleUpdateMinMax}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionLogger 
              products={products} 
              batches={batches} 
              transactions={transactions} 
              onLogTransaction={handleLogTransaction}
            />
          )}

          {activeTab === "ai" && (
            <AIProcurement 
              products={products} 
              transactions={transactions} 
              requisitions={requisitions} 
              onAddRequisitions={handleAddRequisitions}
              onUpdateRequisitionStatus={handleUpdateRequisitionStatus}
            />
          )}

          {activeTab === "schema" && (
            <DatabaseSchemaViewer />
          )}
        </div>

      </main>

    </div>
  );
}
