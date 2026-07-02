import { Product, Batch, Transaction } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม (Uji Matcha Powder)",
    sku: "MATCHA-UJI-001",
    category: "วัตถุดิบเครื่องดื่ม",
    unit: "กิโลกรัม (kg)",
    minLimit: 15,
    maxLimit: 80,
    currentStock: 12, // Low stock! Critically low (below minLimit of 15)
  },
  {
    id: "prod-2",
    name: "กลิ่นวานิลลาแท้ชนิดเข้มข้น (Vanilla Paste)",
    sku: "VANILLA-PASTE-02",
    category: "เบเกอรี่ & กลิ่นผสมอาหาร",
    unit: "ลิตร (L)",
    minLimit: 10,
    maxLimit: 50,
    currentStock: 8, // Low stock! Below minLimit of 10
  },
  {
    id: "prod-3",
    name: "ถั่วแมคคาเดเมียอบเต็มเมล็ด (Macadamia Premium)",
    sku: "MACADAMIA-03",
    category: "ถั่วและธัญพืช",
    unit: "กิโลกรัม (kg)",
    minLimit: 30,
    maxLimit: 150,
    currentStock: 65, // Normal stock
  },
  {
    id: "prod-4",
    name: "เนยโกโก้แท้ 100% ชนิดเม็ด (Cocoa Butter Drops)",
    sku: "COCOA-BUTTER-04",
    category: "ช็อกโกแลต & เนย",
    unit: "กิโลกรัม (kg)",
    minLimit: 25,
    maxLimit: 100,
    currentStock: 92, // High stock, approaching Max
  },
  {
    id: "prod-5",
    name: "สารให้ความหวานออร์แกนิก อีริทริทอล (Organic Erythritol)",
    sku: "ERYTHRITOL-05",
    category: "สารทดแทนน้ำตาล",
    unit: "กิโลกรัม (kg)",
    minLimit: 50,
    maxLimit: 300,
    currentStock: 48, // Slightly low, just below minLimit of 50
  }
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: "b-101",
    productId: "prod-1",
    batchNo: "MTC2603A",
    quantity: 12,
    expiryDate: "2026-12-15",
    receivedDate: "2026-03-10",
  },
  {
    id: "b-201",
    productId: "prod-2",
    batchNo: "VAN2602X",
    quantity: 8,
    expiryDate: "2027-02-20",
    receivedDate: "2026-02-25",
  },
  {
    id: "b-301",
    productId: "prod-3",
    batchNo: "MAC2604B",
    quantity: 40,
    expiryDate: "2027-04-10",
    receivedDate: "2026-04-12",
  },
  {
    id: "b-302",
    productId: "prod-3",
    batchNo: "MAC2605A",
    quantity: 25,
    expiryDate: "2027-05-01",
    receivedDate: "2026-05-05",
  },
  {
    id: "b-401",
    productId: "prod-4",
    batchNo: "CCB2601C",
    quantity: 50,
    expiryDate: "2027-01-30",
    receivedDate: "2026-01-18",
  },
  {
    id: "b-402",
    productId: "prod-4",
    batchNo: "CCB2605B",
    quantity: 42,
    expiryDate: "2027-05-20",
    receivedDate: "2026-05-22",
  },
  {
    id: "b-501",
    productId: "prod-5",
    batchNo: "ERY2604A",
    quantity: 48,
    expiryDate: "2027-10-10",
    receivedDate: "2026-04-05",
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // April 2026
  {
    id: "tx-1",
    productId: "prod-1",
    productName: "ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม (Uji Matcha Powder)",
    type: "in",
    quantity: 30,
    batchNo: "MTC2603A",
    expiryDate: "2026-12-15",
    date: "2026-04-01T09:30:00",
    operator: "สมชาย ใจดี",
    remarks: "รับเข้าสินค้าสต็อกตั้งต้นเดือนเมษายน"
  },
  {
    id: "tx-2",
    productId: "prod-1",
    productName: "ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม (Uji Matcha Powder)",
    type: "out",
    quantity: 10,
    batchNo: "MTC2603A",
    date: "2026-04-10T14:15:00",
    operator: "วิภาดา สายสวย",
    remarks: "เบิกจ่ายเพื่อไปแบ่งบรรจุสำหรับการขายหน้าร้าน"
  },
  {
    id: "tx-3",
    productId: "prod-3",
    productName: "ถั่วแมคคาเดเมียอบเต็มเมล็ด (Macadamia Premium)",
    type: "in",
    quantity: 60,
    batchNo: "MAC2604B",
    expiryDate: "2027-04-10",
    date: "2026-04-12T10:00:00",
    operator: "สมชาย ใจดี",
    remarks: "นำเข้าล็อตสั่งซื้อพิเศษจากต่างประเทศ"
  },
  {
    id: "tx-4",
    productId: "prod-3",
    productName: "ถั่วแมคคาเดเมียอบเต็มเมล็ด (Macadamia Premium)",
    type: "out",
    quantity: 20,
    batchNo: "MAC2604B",
    date: "2026-04-20T11:45:00",
    operator: "วิภาดา สายสวย",
    remarks: "ส่งฝ่ายผลิตทำคุกกี้แมคคาเดเมียล็อตที่ 4"
  },
  // May 2026
  {
    id: "tx-5",
    productId: "prod-2",
    productName: "กลิ่นวานิลลาแท้ชนิดเข้มข้น (Vanilla Paste)",
    type: "in",
    quantity: 15,
    batchNo: "VAN2602X",
    expiryDate: "2027-02-20",
    date: "2026-05-02T08:30:00",
    operator: "สมชาย ใจดี",
    remarks: "นำเข้าทดแทนล็อตที่ใกล้จะหมด"
  },
  {
    id: "tx-6",
    productId: "prod-3",
    productName: "ถั่วแมคคาเดเมียอบเต็มเมล็ด (Macadamia Premium)",
    type: "in",
    quantity: 40,
    batchNo: "MAC2605A",
    expiryDate: "2027-05-01",
    date: "2026-05-05T13:20:00",
    operator: "ธนพล ทรัพย์มาก",
    remarks: "รับสินค้าจากผู้จัดจำหน่ายในประเทศ"
  },
  {
    id: "tx-7",
    productId: "prod-2",
    productName: "กลิ่นวานิลลาแท้ชนิดเข้มข้น (Vanilla Paste)",
    type: "out",
    quantity: 7,
    batchNo: "VAN2602X",
    date: "2026-05-15T15:00:00",
    operator: "วิภาดา สายสวย",
    remarks: "เบิกสำหรับปรุงเค้กวานิลลาฝรั่งเศส"
  },
  {
    id: "tx-8",
    productId: "prod-5",
    productName: "สารให้ความหวานออร์แกนิก อีริทริทอล (Organic Erythritol)",
    type: "in",
    quantity: 80,
    batchNo: "ERY2604A",
    expiryDate: "2027-10-10",
    date: "2026-05-18T10:10:00",
    operator: "สมชาย ใจดี",
    remarks: "เติมสต็อกเตรียมรับเทศกาลรักสุขภาพ"
  },
  {
    id: "tx-9",
    productId: "prod-5",
    productName: "สารให้ความหวานออร์แกนิก อีริทริทอล (Organic Erythritol)",
    type: "out",
    quantity: 32,
    batchNo: "ERY2604A",
    date: "2026-05-25T16:30:00",
    operator: "วิภาดา สายสวย",
    remarks: "เบิกผสมเครื่องดื่มชาหวานแคลอรี่ต่ำ"
  },
  // June 2026
  {
    id: "tx-10",
    productId: "prod-1",
    productName: "ผงชาเขียวมัทฉะอุจิเกรดพรีเมียม (Uji Matcha Powder)",
    type: "out",
    quantity: 8,
    batchNo: "MTC2603A",
    date: "2026-06-05T14:00:00",
    operator: "นารี รัตนา",
    remarks: "เบิกด่วนเนื่องจากยอดสั่งซื้อคาเฟ่พุ่งขึ้นสูง"
  },
  {
    id: "tx-11",
    productId: "prod-4",
    productName: "เนยโกโก้แท้ 100% ชนิดเม็ด (Cocoa Butter Drops)",
    type: "in",
    quantity: 50,
    batchNo: "CCB2605B",
    expiryDate: "2027-05-20",
    date: "2026-06-10T11:00:00",
    operator: "ธนพล ทรัพย์มาก",
    remarks: "รับเพิ่มเนื่องจากราคาโรงงานปรับโปรโมชั่นลดราคา"
  },
  {
    id: "tx-12",
    productId: "prod-4",
    productName: "เนยโกโก้แท้ 100% ชนิดเม็ด (Cocoa Butter Drops)",
    type: "out",
    quantity: 8,
    batchNo: "CCB2601C",
    date: "2026-06-18T15:20:00",
    operator: "วิภาดา สายสวย",
    remarks: "เบิกสำหรับทำช็อกโกแลตบาร์ไวท์ช็อกคราฟต์"
  },
  {
    id: "tx-13",
    productId: "prod-3",
    productName: "ถั่วแมคคาเดเมียอบเต็มเมล็ด (Macadamia Premium)",
    type: "out",
    quantity: 15,
    batchNo: "MAC2604B",
    date: "2026-06-25T10:30:00",
    operator: "นารี รัตนา",
    remarks: "เบิกส่งแผนกเบเกอรี่สาขา 2"
  }
];
