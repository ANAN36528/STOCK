import React, { useState } from "react";
import { 
  Database, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  HelpCircle, 
  Code, 
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

export default function DatabaseSchemaViewer() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sqlSchema = `-- ==========================================
-- โครงสร้างฐานข้อมูลสำหรับระบบบริหารสินค้าคงคลัง (Smart Stock)
-- รองรับการระบุ Batch และวันหมดอายุ (Traceability & Expiry tracking)
-- ==========================================

-- 1. ตารางสินค้าวัตถุดิบ (products)
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    min_limit INT DEFAULT 0,  -- ค่าต่ำสุดสำหรับแจ้งเตือน
    max_limit INT DEFAULT 100 -- ค่าสูงสุดของความจุคลัง
);

-- 2. ตารางล็อตคลังสินค้า (batches)
CREATE TABLE batches (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    batch_no VARCHAR(50) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_DATE
);

-- 3. ตารางประวัติธุรกรรมคลังสินค้า (transactions)
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('in', 'out')), -- 'in' รับเข้า / 'out' เบิกออก
    quantity DECIMAL(10, 2) NOT NULL,
    batch_no VARCHAR(50) NOT NULL,
    expiry_date DATE,
    operator VARCHAR(100) NOT NULL, -- พนักงานที่ทำรายการ
    remarks TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const sheetsFormat = `ตารางที่ 1: "Products" (ข้อมูลสินค้าวัตถุดิบ)
----------------------------------------------------------------------
คอลัมน์ A: ProductID   (ตัวอย่าง: prod-1)
คอลัมน์ B: SKU         (ตัวอย่าง: MATCHA-UJI-001)
คอลัมน์ C: Name        (ตัวอย่าง: ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม)
คอลัมน์ D: Category    (ตัวอย่าง: วัตถุดิบเครื่องดื่ม)
คอลัมน์ E: Unit        (ตัวอย่าง: กิโลกรัม)
คอลัมน์ F: MinLimit    (ตัวอย่าง: 15)
คอลัมน์ G: MaxLimit    (ตัวอย่าง: 80)

ตารางที่ 2: "Batches" (สต็อกแยกรายล็อต-Batch)
----------------------------------------------------------------------
คอลัมน์ A: BatchID     (ตัวอย่าง: b-101)
คอลัมน์ B: ProductID   (ตัวอย่าง: prod-1)
คอลัมน์ C: BatchNo     (ตัวอย่าง: MTC2603A)
คอลัมน์ D: Quantity    (ตัวอย่าง: 12)
คอลัมน์ E: ExpiryDate  (ตัวอย่าง: 2026-12-15)
คอลัมน์ F: ReceivedDate(ตัวอย่าง: 2026-03-10)

ตารางที่ 3: "Transactions" (บัญชีธุรกรรม รับเข้า-จ่ายออก)
----------------------------------------------------------------------
คอลัมน์ A: TransactionID(ตัวอย่าง: tx-1)
คอลัมน์ B: ProductID   (ตัวอย่าง: prod-1)
คอลัมน์ C: ProductName (ตัวอย่าง: ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม)
คอลัมน์ D: Type        (ตัวอย่าง: in หรือ out)
คอลัมน์ E: Quantity    (ตัวอย่าง: 30)
คอลัมน์ F: BatchNo     (ตัวอย่าง: MTC2603A)
คอลัมน์ G: Operator    (ตัวอย่าง: สมชาย ใจดี)
คอลัมน์ H: Remarks     (ตัวอย่าง: รับเข้าสต็อกตั้งต้นเดือนเมษายน)
คอลัมน์ I: Timestamp   (ตัวอย่าง: 2026-04-01 09:30:00)`;

  return (
    <div className="space-y-6" id="schema-viewer-tab">
      
      {/* Introduction banner */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex items-start gap-4" id="schema-intro-card">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-800 shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-indigo-900 text-sm font-display">แบบร่างโครงสร้างฐานข้อมูลสำหรับการพัฒนาระบบต่อยอด</h3>
          <p className="text-indigo-800 text-xs leading-relaxed font-semibold">
            ระบบออกแบบโครงสร้างตารางข้อมูลเพื่อสอดรับกับข้อกำหนดการบริหารจัดการแบบ **ระบุ Batch / วันหมดอายุ (FIFO)** 
            และมีค่าจำกัดสต็อกแบบ **Min/Max** เพื่อนำไปต่อยอดใช้ในระบบคลาวด์ หรือจำลองเก็บข้อมูลบน **Google Sheets** เพื่อเริ่มทดสอบได้ทันที!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="schema-types-grid">
        
        {/* PostgreSQL Relational Database Schema */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between" id="relational-schema-panel">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 font-display">
                <Code className="text-indigo-600 w-5 h-5" />
                โครงสร้าง SQL Schema (สำหรับ PostgreSQL/MySQL)
              </h4>
              
              <button
                onClick={() => handleCopy(sqlSchema, "sql")}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition duration-200 shadow-sm"
                id="btn-copy-sql"
              >
                {copiedText === "sql" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />คัดลอก SQL
                  </>
                )}
              </button>
            </div>
            
            <p className="text-slate-500 text-xs mb-3 font-semibold">
              ผังตารางข้อมูล 3 ตารางหลักเพื่อเชื่อมโยงกันแบบ Relational Model:
            </p>

            <pre className="bg-indigo-950 text-indigo-200 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto h-96 border border-indigo-900 select-all shadow-inner">
              {sqlSchema}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-400 font-bold">
            <Info className="w-4 h-4 text-slate-400" />
            <span>ช่วยสร้างดัชนี (Index) บน `product_id` และ `batch_no` เพื่อการสืบค้นที่รวดเร็ว</span>
          </div>
        </div>

        {/* Google Sheets Spreadsheet Mapping */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 flex flex-col justify-between" id="sheets-schema-panel">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5 font-display">
                <FileSpreadsheet className="text-emerald-600 w-5 h-5" />
                โครงสร้างการจัดรูปแบบแผ่นงาน (Google Sheets)
              </h4>
              
              <button
                onClick={() => handleCopy(sheetsFormat, "sheets")}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition duration-200 shadow-sm"
                id="btn-copy-sheets"
              >
                {copiedText === "sheets" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />คัดลอกข้อมูล Sheets
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-500 text-xs mb-3 font-semibold">
              ออกแบบโดยแยกหน้าแผ่นงาน (Tabs) จำนวน 3 หน้า เพื่อเตรียมพร้อมสำหรับการเชื่อมโยง Google Sheets API ในอนาคต:
            </p>

            <pre className="bg-indigo-950 text-indigo-200 p-4 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto h-96 border border-indigo-900 select-all shadow-inner">
              {sheetsFormat}
            </pre>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs text-indigo-900 bg-indigo-50/50 p-2.5 rounded-2xl font-bold">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>💡 ต่อพ่วง Google Sheets ในอนาคตผ่าน Apps Script หรือ Google Sheets API เพื่ออ่านค่าได้ทันที!</span>
          </div>
        </div>

      </div>

      {/* Guide: How to connect Google Sheets in Future */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm" id="schema-integration-guide">
        <h4 className="font-black text-slate-800 text-sm mb-4 font-display">
          แนวทางการดึงข้อมูลและเชื่อมโยงกับ Google Sheets
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
            <span className="bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center mb-3">1</span>
            <h5 className="font-black text-slate-800 mb-1 text-xs">สร้างไฟล์ Google Sheets</h5>
            <p className="text-slate-500 leading-relaxed font-semibold mt-1">
              สร้างไฟล์สเปรดชีตใน Google Drive ของท่าน และแยกแผ่นงานเป็น 3 แท็บตามโครงสร้างคอลัมน์ด้านบน เพื่อใช้เป็นฐานข้อมูลหลัก
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
            <span className="bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center mb-3">2</span>
            <h5 className="font-black text-slate-800 mb-1 text-xs">สร้าง Google Apps Script API</h5>
            <p className="text-slate-500 leading-relaxed font-semibold mt-1">
              เขียนสคริปต์แบบ Web App (doPost/doGet) ในแผ่นงานเพื่อรับ-ส่งข้อมูลในรูปแบบ JSON หรือเลือกเชื่อมต่อผ่าน OAuth / Google Sheets API โดยตรง
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
            <span className="bg-indigo-600 text-white font-black text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center mb-3">3</span>
            <h5 className="font-black text-slate-800 mb-1 text-xs">เชื่อม API บนเซิร์ฟเวอร์ Express</h5>
            <p className="text-slate-500 leading-relaxed font-semibold mt-1">
              อัปเดตไฟล์ `server.ts` ในแอพพลิเคชันนี้เพื่อส่งคำสั่ง GET และ POST ไปยัง URL Web App ของ Google Sheets เพื่อดึงและบันทึกข้อมูลเรียลไทม์
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
