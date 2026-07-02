export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  minLimit: number;
  maxLimit: number;
  currentStock: number;
}

export interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  quantity: number;
  expiryDate?: string;
  receivedDate: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  batchNo: string;
  expiryDate?: string;
  date: string;
  operator: string;
  remarks?: string;
}

export interface PurchaseRequisition {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  minLimit: number;
  currentStock: number;
  status: "draft" | "submitted" | "notified";
  createdAt: string;
  notifiedAt?: string;
  source: "AI" | "SYSTEM_AUTO";
  priority: "CRITICAL" | "WARNING" | "OPTIMAL";
  reasoning: string;
}

export interface AIRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  minLimit: number;
  maxLimit: number;
  suggestedOrderQty: number;
  priority: "CRITICAL" | "WARNING" | "OPTIMAL";
  reasoning: string;
}

export interface AIAnalysisResult {
  recommendations: AIRecommendation[];
  procurementAnalysis: string;
  storageOptimizationAdvice: string;
}
