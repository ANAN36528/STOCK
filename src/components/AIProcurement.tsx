import React, { useState, useMemo } from "react";
import { 
  Zap, 
  Send, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Mail, 
  Clock, 
  ArrowRight,
  Printer,
  ListOrdered,
  X
} from "lucide-react";
import { Product, Transaction, PurchaseRequisition, AIAnalysisResult } from "../types";

interface AIProcurementProps {
  products: Product[];
  transactions: Transaction[];
  requisitions: PurchaseRequisition[];
  onAddRequisitions: (reqs: PurchaseRequisition[]) => void;
  onUpdateRequisitionStatus: (id: string, status: "draft" | "submitted" | "notified") => void;
}

export default function AIProcurement({
  products,
  transactions,
  requisitions,
  onAddRequisitions,
  onUpdateRequisitionStatus
}: AIProcurementProps) {
  // State variables
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [activeNotificationPr, setActiveNotificationPr] = useState<PurchaseRequisition | null>(null);
  const [emailSendingStatus, setEmailSendingStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [simulatedEmailContent, setSimulatedEmailContent] = useState<any | null>(null);

  // Auto-generate system recommendations (those below Min Limit)
  const systemTriggeredItems = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minLimit);
  }, [products]);

  // Request Gemini Analysis
  const handleAIAnalysis = async () => {
    setLoading(true);
    setAiResult(null);
    
    // Smooth loader steps
    const steps = [
      "กำลังเชื่อมต่อระบบ AI และดึงรายการวัตถุดิบคงคลัง...",
      "กำลังวิเคราะห์ประวัติการเบิกจ่ายย้อนหลัง 3 เดือน...",
      "กำลังประเมินจุดคุ้มทุนจัดเก็บตามเกณฑ์ Min/Max...",
      "กำลังสังเคราะห์ปริมาณสั่งซื้อแนะนำที่ดีที่สุด..."
    ];

    let stepIndex = 0;
    setLoadingStep(steps[stepIndex]);
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/ai/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory: products, transactions: transactions })
      });

      if (!response.ok) {
        throw new Error("ระบบ AI ไม่ตอบสนอง กรุณาตรวจสอบการตั้งค่าคีย์หรือลองอีกครั้ง");
      }

      const data: AIAnalysisResult = await response.json();
      setAiResult(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "เกิดข้อผิดพลาดในการวิเคราะห์");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Convert AI Recommendations to PRs
  const handleConvertRecommendationsToPr = () => {
    if (!aiResult) return;

    const newPrs: PurchaseRequisition[] = aiResult.recommendations
      .filter(rec => rec.suggestedOrderQty > 0)
      .map(rec => {
        const product = products.find(p => p.id === rec.productId);
        return {
          id: "pr-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          productId: rec.productId,
          productName: rec.productName,
          quantity: rec.suggestedOrderQty,
          minLimit: rec.minLimit,
          currentStock: rec.currentStock,
          status: "draft",
          createdAt: new Date().toISOString(),
          source: "AI",
          priority: rec.priority,
          reasoning: rec.reasoning
        };
      });

    if (newPrs.length === 0) {
      alert("ไม่มีวัตถุดิบรายการใดที่ AI เสนอแนะให้สั่งเพิ่มในขณะนี้");
      return;
    }

    onAddRequisitions(newPrs);
    alert(`ดึงข้อมูลเข้าสู่ 'รายการร่างขออนุมัติจัดซื้อ' เรียบร้อยแล้ว ${newPrs.length} รายการ!`);
  };

  // Convert System Alert Items to PRs manually if desired
  const handleConvertSystemToPr = () => {
    const newPrs: PurchaseRequisition[] = systemTriggeredItems.map(item => ({
      id: "pr-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      productId: item.id,
      productName: item.name,
      quantity: item.maxLimit - item.currentStock, // standard fill to Max
      minLimit: item.minLimit,
      currentStock: item.currentStock,
      status: "draft",
      createdAt: new Date().toISOString(),
      source: "SYSTEM_AUTO",
      priority: "CRITICAL",
      reasoning: `ระบบตรวจพบอัตโนมัติ: สต็อกปัจจุบัน (${item.currentStock} ${item.unit}) ต่ำกว่าเกณฑ์จัดเก็บขั้นต่ำที่กำหนดไว้ (${item.minLimit} ${item.unit})`
    }));

    if (newPrs.length === 0) {
      alert("ไม่มีรายการวัตถุดิบที่ต่ำกว่าค่า Min");
      return;
    }

    onAddRequisitions(newPrs);
    alert(`สร้างใบขอซื้อระบบอัตโนมัติแล้ว ${newPrs.length} รายการ!`);
  };

  // Simulate Sending Email Alert
  const handleSendSimulatedEmail = (pr: PurchaseRequisition) => {
    setActiveNotificationPr(pr);
    setEmailSendingStatus("sending");

    // Formulate a beautiful company purchasing alert email
    setTimeout(() => {
      setEmailSendingStatus("sent");
      onUpdateRequisitionStatus(pr.id, "notified");
      
      setSimulatedEmailContent({
        to: "procurement@company-supply.com, manager@company.com",
        cc: "warehouse-alert@company.com",
        subject: `[🚨 ด่วนที่สุด - ระบบแจ้งเตือนอัตโนมัติ] ขออนุมัติสั่งซื้อวัตถุดิบเร่งด่วน: ${pr.productName}`,
        body: `เรียน แผนกจัดซื้อและผู้เกี่ยวข้อง

เนื่องด้วย ระบบบริหารคลังสินค้าอัจฉริยะ (Smart Stock Automation) ได้ตรวจพบวัตถุดิบขาดแคลนและเข้าสู่สภาวะวิกฤต ซึ่งมีความสำคัญต่อกระบวนการประกอบการ จึงขอส่งใบคำขออนุมัติซื้อ (PR) ไปยังแผนกของท่านโดยอัตโนมัติ ดังรายละเอียดต่อไปนี้:

---------------------------------------------------------
1. รายการสินค้าวัตถุดิบ: ${pr.productName}
2. ปริมาณสต็อกปัจจุบันในคลัง: ${pr.currentStock} หน่วย
3. เกณฑ์สต็อกขั้นต่ำ (Min Limit): ${pr.minLimit} หน่วย
4. จำนวนปริมาณที่ขอซื้อเร่งด่วน: ${pr.quantity} หน่วย
5. แหล่งที่มาและผู้วิเคราะห์: ${pr.source === "AI" ? "สมองกลจัดซื้อปัญญาประดิษฐ์ (AI Recommendations Service)" : "ระบบคอยล์เตือนภัยอัตโนมัติ (System Limit Trigger)"}
6. ความเร่งด่วน: ${pr.priority}
7. เหตุผลความจำเป็นในการจัดซื้อ:
   ${pr.reasoning}
---------------------------------------------------------

กรุณาดำเนินการอนุมัติใบสั่งซื้อ (PO) และประสานงานผู้จัดจำหน่าย (Supplier) เพื่อจัดส่งสินค้าโดยด่วนที่สุด เพื่อไม่ให้เกิดภาวะสะดุดในกระบวนการหน้าร้านและการผลิต

ขอแสดงความนับถือ,
ระบบจัดการและแจ้งเตือนจัดซื้ออัจฉริยะ (Smart Stock AI Engine)
เซิร์ฟเวอร์ควบคุมคลังบริษัท เบเกอรี่ จำกัด (มหาชน)`
      });
    }, 1500);
  };

  return (
    <div className="space-y-6" id="ai-procurement-tab">
      
      {/* Top Interactive Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: AI Trigger */}
        <div className="lg:col-span-2 bg-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-white" />
                AI Assistant Engine
              </span>
              <span className="text-indigo-300 text-xs font-semibold">Gemini 3.5 Flash Active</span>
            </div>
            <h3 className="text-xl font-black text-slate-100 font-display">
              วิเคราะห์คลังด้วย AI เพื่อประเมินอัตราการเบิกจ่าย & การจัดซื้ออัจฉริยะ
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed font-medium">
              ระบบจัดส่งข้อมูลรายการคลังปัจจุบัน และประวัติประเบิกจ่ายเข้า-ออกคลังไปประมวลผลบนคลาวด์ Gemini AI เพื่อคำนวณความรวดเร็วในการใช้งาน และให้ข้อมูลคาดการณ์ปริมาณขอซื้อ (Requisition Quantity) ที่สอดคล้องกับค่า Min-Max ปลอดภัยสูงสุด
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAIAnalysis}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition duration-200"
              id="btn-run-ai"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              {loading ? "กำลังให้ AI คำนวณความเร็วการเบิก..." : "ประมวลผลจัดซื้อด้วย AI"}
            </button>
            
            <button
              onClick={handleConvertSystemToPr}
              className="bg-white/10 hover:bg-white/20 text-slate-100 font-bold px-5 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition border border-white/15"
              id="btn-run-system-alert"
            >
              <ListOrdered className="w-4 h-4" />
              ดึงสินค้าต่ำกว่า Min เพื่อร่างขอซื้อทันที ({systemTriggeredItems.length})
            </button>
          </div>
        </div>

        {/* Right 1 col: Storage Space Alert */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-black text-slate-800 text-sm mb-2 flex items-center gap-1.5 font-display">
              <AlertCircle className="text-rose-500 w-4 h-4" />
              แจ้งเตือนเกณฑ์พิกัดสินค้าตกเกณฑ์
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              ขณะนี้มีวัตถุดิบทั้งหมด <strong className="text-rose-600 font-black">{systemTriggeredItems.length} รายการ</strong> ที่ระดับคลังลดลงต่ำกว่าเกณฑ์การควบคุมสต็อกขั้นต่ำ (Min Limit) ที่วิศวกรกำหนดไว้
            </p>

            <div className="mt-4 space-y-1.5">
              {systemTriggeredItems.slice(0, 3).map(p => (
                <div key={p.id} className="text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-slate-700 truncate max-w-[140px]">{p.name}</span>
                  <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5 rounded font-black">
                    เหลือ {p.currentStock} {p.unit}
                  </span>
                </div>
              ))}
              {systemTriggeredItems.length > 3 && (
                <div className="text-[10px] text-center text-slate-400 font-bold italic">
                  และรายการอื่นๆ อีก {systemTriggeredItems.length - 3} รายการ
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <span className="text-[10px] text-slate-400 block font-bold">การส่งข้อมูลอัตโนมัติ</span>
            <span className="text-[11px] text-indigo-600 font-black block mt-0.5">
              🚀 ส่งอีเมลเตือนพนักงานจัดซื้ออัตโนมัติเมื่อกดยื่นใบขอจัดซื้อ
            </span>
          </div>
        </div>

      </div>

      {/* Loading overlay for AI computation */}
      {loading && (
        <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl text-center space-y-4 animate-pulse shadow-sm">
          <div className="inline-block p-4 bg-indigo-100 rounded-full text-indigo-600">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h4 className="font-black text-slate-800 text-lg">ปัญญาประดิษฐ์ Gemini 3.5 Flash กำลังประมวลผล...</h4>
          <p className="text-sm text-indigo-800 font-bold">{loadingStep}</p>
        </div>
      )}

      {/* AI Recommendations Result Section */}
      {aiResult && !loading && (
        <div className="bg-indigo-50/30 border border-indigo-100 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" id="ai-results-panel">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                <Sparkles className="w-5 h-5 fill-indigo-600 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg font-display">บทวิเคราะห์และข้อเสนอแนะจัดซื้อโดย AI</h3>
                <p className="text-xs text-slate-500 font-medium">ผลลัพธ์การประมวลผลแบบเรียลไทม์จากระบบสแกนข้อมูลและประวัติการเบิกจ่ายสะสม</p>
              </div>
            </div>

            <button
              onClick={handleConvertRecommendationsToPr}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition self-end sm:self-auto shadow-md shadow-indigo-600/10"
              id="btn-convert-ai-pr"
            >
              <FileText className="w-4 h-4 text-white" />
              ดึงคำแนะนำของ AI เข้าร่างใบขอจัดซื้อ
            </button>
          </div>

          {/* AI Texts Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-indigo-100/60 shadow-sm">
              <h4 className="font-black text-indigo-800 text-sm mb-3 flex items-center gap-1.5">
                📢 บทวิเคราะห์การเบิกจ่ายและการจัดซื้อ
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {aiResult.procurementAnalysis}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-100/60 shadow-sm">
              <h4 className="font-black text-indigo-800 text-sm mb-3 flex items-center gap-1.5">
                📦 คำแนะนำจัดการจัดเก็บคลังสินค้า (Space Optimization)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                {aiResult.storageOptimizationAdvice}
              </p>
            </div>
          </div>

          {/* Suggested Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4.5 bg-slate-50 border-b border-slate-200">
              <span className="font-black text-slate-800 text-xs">ตารางปริมาณการขอซื้อแนะนำที่คำนวณโดย AI</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-200 uppercase tracking-wide text-[10px]">
                    <th className="py-3 px-5">ชื่อวัตถุดิบ</th>
                    <th className="py-3 px-2 text-center">สต็อกในคลัง</th>
                    <th className="py-3 px-2 text-center">เกณฑ์ Min-Max</th>
                    <th className="py-3 px-4 text-center">ปริมาณจัดซื้อแนะนำ</th>
                    <th className="py-3 px-3 text-center">ระดับความเร่งด่วน</th>
                    <th className="py-3 px-5">เหตุผลเชิงลึกประกอบการตัดสินใจ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aiResult.recommendations.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-5 font-black text-slate-800">{rec.productName}</td>
                      <td className="py-3 px-2 text-center font-black text-slate-600">{rec.currentStock}</td>
                      <td className="py-3 px-2 text-center text-slate-500 font-mono text-[11px]">Min {rec.minLimit} | Max {rec.maxLimit}</td>
                      <td className="py-3 px-4 text-center font-black text-indigo-600 text-sm">
                        {rec.suggestedOrderQty > 0 ? `+${rec.suggestedOrderQty}` : "ไม่ต้องจัดซื้อเพิ่ม"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[9px] border ${
                          rec.priority === "CRITICAL" 
                            ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" 
                            : rec.priority === "WARNING"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-500 max-w-sm font-bold text-[11px] leading-relaxed">{rec.reasoning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Active Draft Purchase Requisitions (ใบขอซื้อสินค้าที่เปิดระบบ) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden" id="prs-list-section">
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-800 text-base font-display">
              รายการใบขอซื้อวัตถุดิบ (Purchase Requisition - PR Drafts)
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5 font-medium">สถานะคลังสินค้าแบบดึงข้อมูลเพื่อขอซื้อพร้อมประสานงานฝ่ายจัดซื้อ</p>
          </div>
          <span className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-black px-3 py-1.5 rounded-full">
            {requisitions.length} ใบขอซื้อ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <th className="py-3.5 px-6">วันที่ร่างใบสั่ง</th>
                <th className="py-3.5 px-4">รายการสินค้าขอซื้อ</th>
                <th className="py-3.5 px-4 text-center">ปริมาณขอซื้อ</th>
                <th className="py-3.5 px-4 text-center">ระดับความเร่งด่วน</th>
                <th className="py-3.5 px-4">ที่มาข้อเสนอแนะ</th>
                <th className="py-3.5 px-6 text-center">สถานะการประสานงาน</th>
                <th className="py-3.5 px-6 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requisitions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    ไม่มีเอกสารใบขอซื้อจัดส่งคลังสินค้า 
                    <p className="text-[10px] text-slate-400 mt-1.5 font-normal">กดยิงคำนวณปุ่ม AI ด้านบนเพื่อร่างใบอนุมัติซื้ออัตโนมัติ</p>
                  </td>
                </tr>
              ) : (
                requisitions.map(pr => {
                  const formattedDate = new Date(pr.createdAt).toLocaleString("th-TH", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <tr key={pr.id} className="hover:bg-slate-50/30 transition duration-150" id={`pr-row-${pr.id}`}>
                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500 font-bold text-xs">
                        {formattedDate}
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4 font-black text-slate-800 text-sm">
                        {pr.productName}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 text-center font-black text-sm text-indigo-600">
                        {pr.quantity}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${
                          pr.priority === "CRITICAL" 
                            ? "bg-rose-50 border-rose-200 text-rose-700" 
                            : pr.priority === "WARNING"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}>
                          {pr.priority}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-4 px-4 text-slate-500 text-xs font-bold">
                        {pr.source === "AI" ? (
                          <span className="text-indigo-600 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" /> วิเคราะห์โดย AI
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            ⚙️ ระบบแจ้งต่ำกว่า Min
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {pr.status === "draft" ? (
                          <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                            ร่างคำขอ (Draft)
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" /> แจ้งแผนกจัดซื้อแล้ว
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        {pr.status === "draft" ? (
                          <button
                            onClick={() => handleSendSimulatedEmail(pr)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 mx-auto transition shadow-md shadow-indigo-600/15"
                            title="ส่งการแจ้งเตือนไปยังแผนกจัดซื้อ"
                          >
                            <Mail className="w-3.5 h-3.5 text-white" />
                            ส่งแจ้งจัดซื้อด่วน
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveNotificationPr(pr);
                              setEmailSendingStatus("sent");
                              handleSendSimulatedEmail(pr);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-black underline flex items-center gap-1 mx-auto"
                          >
                            <FileText className="w-3 h-3" />
                            ดูประวัติอีเมล์ส่งแล้ว
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Email Log Modal (Conditional) */}
      {activeNotificationPr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="email-sim-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-indigo-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base font-display">
                  {emailSendingStatus === "sending" ? "กำลังส่งอีเมลเตือนจัดซื้อ..." : "ประวัติการจัดส่งอีเมลแจ้งอนุมัติจัดซื้อด่วน 📧"}
                </h3>
              </div>
              <button 
                onClick={() => setActiveNotificationPr(null)}
                className="text-white hover:text-indigo-100 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email content */}
            <div className="p-6 space-y-4">
              {emailSendingStatus === "sending" ? (
                <div className="text-center py-10 space-y-3">
                  <div className="inline-block p-4 bg-indigo-50 rounded-full text-indigo-600 animate-spin">
                    <Clock className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="font-black text-slate-800">ส่งอีเมลแจ้งเตือนอัตโนมัติแล้ว...</h4>
                  <p className="text-xs text-slate-400 font-semibold">ระบบจำลองการประทับคิวจัดส่งข้อความไปยังแผนกจัดซื้อของบริษัท</p>
                </div>
              ) : (
                <div className="space-y-4" id="email-body-content">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-500 font-bold block">ผู้ส่ง (Sender):</strong>
                      <span className="text-slate-800 font-black font-mono">smart-stock-warehouse@company-group.com</span>
                    </div>
                    <div>
                      <strong className="text-slate-500 font-bold block">ผู้รับ (To):</strong>
                      <span className="text-slate-800 font-black font-mono text-indigo-600">{simulatedEmailContent?.to}</span>
                    </div>
                    <div>
                      <strong className="text-slate-500 font-bold block">หัวเรื่อง (Subject):</strong>
                      <span className="text-rose-600 font-black font-mono text-xs">{simulatedEmailContent?.subject}</span>
                    </div>
                  </div>

                  <div className="bg-indigo-950 text-indigo-200 p-5 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-line border border-indigo-900 h-80 overflow-y-auto">
                    {simulatedEmailContent?.body}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>✓ อีเมลนี้จำลองการส่งเรียบร้อยแล้ว แผนกจัดจัดซื้อจะได้รับสัญญาณแจ้งเตือนใบคำขอ PR ชุดนี้ตามเกณฑ์ที่กำหนดไว้!</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setActiveNotificationPr(null)}
                      className="bg-indigo-600 text-white font-black text-xs px-5 py-3 rounded-xl hover:bg-indigo-700 transition"
                    >
                      เสร็จสิ้น / ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
