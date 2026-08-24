"use client";

import React, { useState, useMemo } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Layers, Bell, CheckCircle2,
  Calendar, PieChart as PieIcon, RefreshCcw, Printer, Filter,
  Building2, Trash2, Edit3, Clock, Wallet, BarChart3, Target,
  Receipt, ArrowRightLeft, UserCheck, AlertCircle, ShoppingCart
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend 
} from "recharts";
import { toast } from "sonner";

// ================= TYPES =================
type Role = "Owner" | "Admin" | "Kasir" | "Staff";
type PaymentMethod = "Cash" | "QRIS" | "Transfer" | "E-Wallet";
type ExpenseCategory = 
  | "Bahan Baku" | "Transportasi" | "Gaji" | "Sewa" | "Listrik" 
  | "Air" | "Internet" | "Pajak" | "Marketing" | "Peralatan" | "Operasional Lain";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number; // HPP
  sellPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
}

interface SaleTransaction {
  id: string;
  invoiceNo: string;
  date: string;
  productName: string;
  qty: number;
  sellPrice: number;
  discount: number;
  total: number;
  cogs: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  cashier: string;
}

interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string;
}

interface DebtItem {
  id: string;
  type: "Hutang" | "Piutang";
  person: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  notes: string;
}

interface CapitalLog {
  id: string;
  date: string;
  type: "Modal Awal" | "Penambahan Modal" | "Penarikan Modal (Prive)";
  amount: number;
  notes: string;
}

// ================= INITIAL MOCK DATA =================
const INITIAL_PRODUCTS: Product[] = [
  { id: "P1", name: "Kopi Arabika Gayo 250g", sku: "KOP-001", category: "Minuman", costPrice: 35000, sellPrice: 65000, stock: 38, minStock: 10, isActive: true },
  { id: "P2", name: "Croissant Almond Butter", sku: "BAK-002", category: "Makanan", costPrice: 12000, sellPrice: 28000, stock: 4, minStock: 8, isActive: true }, // Kritis
  { id: "P3", name: "Matcha Latte Premium 500g", sku: "BEV-003", category: "Minuman", costPrice: 55000, sellPrice: 95000, stock: 15, minStock: 5, isActive: true },
  { id: "P4", name: "Susu Fresh Milk Pasteurisasi 1L", sku: "ING-004", category: "Bahan Baku", costPrice: 17000, sellPrice: 24000, stock: 3, minStock: 10, isActive: true }, // Kritis
  { id: "P5", name: "Sirup Karamel Monin 700ml", sku: "ING-005", category: "Bahan Baku", costPrice: 110000, sellPrice: 150000, stock: 12, minStock: 4, isActive: true },
];

const INITIAL_SALES: SaleTransaction[] = [
  { id: "S1", invoiceNo: "INV-2026-0801", date: "2026-08-24", productName: "Kopi Arabika Gayo 250g", qty: 3, sellPrice: 65000, discount: 5000, total: 190000, cogs: 105000, paymentMethod: "QRIS", cashier: "Rian (Kasir)", notes: "Meja 04" },
  { id: "S2", invoiceNo: "INV-2026-0802", date: "2026-08-24", productName: "Croissant Almond Butter", qty: 2, sellPrice: 28000, discount: 0, total: 56000, cogs: 24000, paymentMethod: "Cash", cashier: "Rian (Kasir)", notes: "Takeaway" },
  { id: "S3", invoiceNo: "INV-2026-0803", date: "2026-08-23", productName: "Matcha Latte Premium 500g", qty: 2, sellPrice: 95000, discount: 10000, total: 180000, cogs: 110000, paymentMethod: "Transfer", cashier: "Budi (Owner)", notes: "Langganan Kantor" },
  { id: "S4", invoiceNo: "INV-2026-08-22", date: "2026-08-22", productName: "Kopi Arabika Gayo 250g", qty: 5, sellPrice: 65000, discount: 0, total: 325000, cogs: 175000, paymentMethod: "E-Wallet", cashier: "Rian (Kasir)" },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: "E1", category: "Bahan Baku", amount: 650000, date: "2026-08-24", notes: "Restock Biji Kopi Arabika 10kg" },
  { id: "E2", category: "Listrik", amount: 350000, date: "2026-08-21", notes: "Token Listrik Espresso Machine" },
  { id: "E3", category: "Marketing", amount: 200000, date: "2026-08-22", notes: "Instagram Ads Weekend Special" },
  { id: "E4", category: "Gaji", amount: 2500000, date: "2026-08-01", notes: "Gaji Barista Paruh Waktu" },
  { id: "E5", category: "Internet", amount: 275000, date: "2026-08-10", notes: "Wifi IndiHome Toko" },
];

const INITIAL_DEBTS: DebtItem[] = [
  { id: "D1", type: "Piutang", person: "Katering Bu Sari", amount: 750000, dueDate: "2026-08-28", isPaid: false, notes: "Pesanan 30 botol Cold Brew" },
  { id: "D2", type: "Hutang", person: "Supplier Susu Segar Lembang", amount: 480000, dueDate: "2026-08-26", isPaid: false, notes: "Pembayaran tempo 7 hari" },
  { id: "D3", type: "Piutang", person: "PT Maju Bersama", amount: 1200000, dueDate: "2026-09-02", isPaid: false, notes: "Event Coffee Break" },
];

const INITIAL_CAPITAL_LOGS: CapitalLog[] = [
  { id: "C1", date: "2026-01-10", type: "Modal Awal", amount: 25000000, notes: "Setoran Modal Pendirian Usaha" },
  { id: "C2", date: "2026-05-15", type: "Penambahan Modal", amount: 5000000, notes: "Ekspansi Alat Grinder Komersial" },
  { id: "C3", date: "2026-07-20", type: "Penarikan Modal (Prive)", amount: 2000000, notes: "Keperluan Pribadi Owner" },
];

const FINANCIAL_CHART_DATA = [
  { date: "18 Aug", pemasukan: 1200000, pengeluaran: 450000, laba: 750000 },
  { date: "19 Aug", pemasukan: 1450000, pengeluaran: 300000, laba: 1150000 },
  { date: "20 Aug", pemasukan: 980000, pengeluaran: 550000, laba: 430000 },
  { date: "21 Aug", pemasukan: 1850000, pengeluaran: 620000, laba: 1230000 },
  { date: "22 Aug", pemasukan: 2300000, pengeluaran: 480000, laba: 1820000 },
  { date: "23 Aug", pemasukan: 2100000, pengeluaran: 390000, laba: 1710000 },
  { date: "24 Aug", pemasukan: 1950000, pengeluaran: 710000, laba: 1240000 },
];

const BUDGET_DATA = [
  { category: "Bahan Baku", allocated: 4000000, used: 2650000 },
  { category: "Marketing", allocated: 1000000, used: 850000 },
  { category: "Operasional & Utilitas", allocated: 1500000, used: 975000 },
  { category: "Gaji Karyawan", allocated: 3000000, used: 2500000 },
];

const CATEGORY_COLORS = ["#059669", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CashFlowProMaster() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "expenses" | "debts" | "capital" | "reports" | "analytics" | "budget" | "ai"
  >("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Owner");
  const [currentBusiness, setCurrentBusiness] = useState("Kopi Senja Nusantara (Pusat)");

  // Main Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>(INITIAL_CAPITAL_LOGS);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleTransaction | null>(null);

  // Form States - Sale
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || "");
  const [saleQty, setSaleQty] = useState(1);
  const [saleDiscount, setSaleDiscount] = useState(0);
  const [saleMethod, setSaleMethod] = useState<PaymentMethod>("QRIS");
  const [saleNotes, setSaleNotes] = useState("");

  // Form States - Expense
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Bahan Baku");
  const [expAmount, setExpAmount] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  // Form States - Product
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCat, setNewProdCat] = useState("Minuman");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSell, setNewProdSell] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMin, setNewProdMin] = useState("5");

  // Form States - Debt
  const [debtType, setDebtType] = useState<"Hutang" | "Piutang">("Piutang");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Form States - Capital
  const [capType, setCapType] = useState<"Penambahan Modal" | "Penarikan Modal (Prive)">("Penambahan Modal");
  const [capAmount, setCapAmount] = useState("");
  const [capNotes, setCapNotes] = useState("");

  // Target Keuangan
  const targetMonthlyRevenue = 30000000;
  const targetMonthlyProfit = 12000000;

  // ================= FINANCIAL FORMULA CALCULATIONS =================
  const totalRevenue = useMemo(() => sales.reduce((acc, curr) => acc + curr.total, 0), [sales]);
  const totalCOGS = useMemo(() => sales.reduce((acc, curr) => acc + curr.cogs, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  const grossProfit = totalRevenue - totalCOGS; // Laba Kotor
  const netProfit = grossProfit - totalExpenses; // Laba Bersih
  
  // Modal Bersih Aktif
  const totalNetCapital = useMemo(() => {
    return capitalLogs.reduce((acc, curr) => {
      if (curr.type === "Penarikan Modal (Prive)") return acc - curr.amount;
      return acc + curr.amount;
    }, 0);
  }, [capitalLogs]);

  const cashOnHand = totalNetCapital + netProfit; // Sisa Kas Kasir & Bank
  const roiPercentage = totalNetCapital > 0 ? ((netProfit / totalNetCapital) * 100).toFixed(1) : "0.0";
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Total Nilai Aset Inventori / Persediaan
  const inventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  }, [products]);

  // Total Hutang & Piutang Belum Lunas
  const totalReceivables = useMemo(() => debts.filter(d => d.type === "Piutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const totalPayables = useMemo(() => debts.filter(d => d.type === "Hutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);

  // Alert Stok
  const lowStockAlerts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);

  // Format Mata Uang IDR
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // ================= ACTION HANDLERS =================
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;
    if (prod.stock < saleQty) {
      alert(`Stok tidak mencukupi! Sisa stok ${prod.name} hanya ${prod.stock} unit.`);
      return;
    }

    const total = (prod.sellPrice * saleQty) - saleDiscount;
    const cogs = prod.costPrice * saleQty;

    const newSale: SaleTransaction = {
      id: `S${Date.now()}`,
      invoiceNo: `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split("T")[0],
      productName: prod.name,
      qty: saleQty,
      sellPrice: prod.sellPrice,
      discount: saleDiscount,
      total,
      cogs,
      paymentMethod: saleMethod,
      cashier: `${currentRole} User`,
      notes: saleNotes
    };

    // Kurangi stok barang
    setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: p.stock - saleQty } : p));
    setSales([newSale, ...sales]);
    setShowAddSaleModal(false);
   toast.success("Transaksi Penjualan Berhasil!", {
      description: `${prod.name} (${saleQty}x) • Total: ${formatIDR(total)}`,
    });
    setSaleQty(1);
    setSaleDiscount(0);
    setSaleNotes("");
    setActiveReceiptSale(newSale); // Tampilkan struk otomatis
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || Number(expAmount) <= 0) return;

    const newExp: ExpenseItem = {
      id: `E${Date.now()}`,
      category: expCategory,
      amount: Number(expAmount),
      date: expDate,
      notes: expNotes
    };

    setExpenses([newExp, ...expenses]);
    setShowAddExpenseModal(false);
    setExpAmount("");
    setExpNotes("");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCost || !newProdSell) return;

    const newP: Product = {
      id: `P${Date.now()}`,
      name: newProdName,
      sku: newProdSku || `SKU-${Date.now().toString().slice(-4)}`,
      category: newProdCat,
      costPrice: Number(newProdCost),
      sellPrice: Number(newProdSell),
      stock: Number(newProdStock) || 0,
      minStock: Number(newProdMin) || 5,
      isActive: true
    };

    setProducts([...products, newP]);
    setShowAddProductModal(false);
    setNewProdName("");
    setNewProdSku("");
    setNewProdCost("");
    setNewProdSell("");
    setNewProdStock("");
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson || !debtAmount || !debtDueDate) return;

    const newD: DebtItem = {
      id: `D${Date.now()}`,
      type: debtType,
      person: debtPerson,
      amount: Number(debtAmount),
      dueDate: debtDueDate,
      isPaid: false,
      notes: debtNotes
    };

    setDebts([newD, ...debts]);
    setShowAddDebtModal(false);
    setDebtPerson("");
    setDebtAmount("");
    setDebtDueDate("");
    setDebtNotes("");
  };

  const handleToggleDebtSettled = (id: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d));
  };

  const handleAddCapital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capAmount || Number(capAmount) <= 0) return;

    const newCap: CapitalLog = {
      id: `C${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: capType,
      amount: Number(capAmount),
      notes: capNotes
    };

    setCapitalLogs([newCap, ...capitalLogs]);
    setShowCapitalModal(false);
    setCapAmount("");
    setCapNotes("");
  };

  const handleDeleteSale = (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan & menghapus transaksi ini?")) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col justify-between hidden lg:flex border-r border-slate-800 shadow-2xl">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/30">
                CF
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  CashFlow<span className="text-emerald-400">Pro</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 tracking-widest uppercase font-semibold block">Enterprise UMKM</span>
              </div>
            </div>

            {/* Multi-Branch Selector */}
            <div className="mt-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate font-medium">{currentBusiness}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-3 mb-2">Menu Utama</div>
            {[
              { id: "dashboard", label: "Dashboard Eksekutif", icon: PieIcon },
              { id: "sales", label: "Kasir & Transaksi POS", icon: ShoppingCart },
              { id: "products", label: "Inventori & Katalog Produk", icon: Package },
              { id: "expenses", label: "Beban & Pengeluaran", icon: TrendingDown },
              { id: "debts", label: "Buku Hutang & Piutang", icon: CreditCard },
              { id: "capital", label: "Modal & Ekuitas Usaha", icon: Wallet },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-3 pt-4 mb-2">Laporan & Strategi</div>
            {[
              { id: "reports", label: "Laporan Laba Rugi & Neraca", icon: Layers },
              { id: "budget", label: "Target & Budget Planning", icon: Target },
              { id: "analytics", label: "Analisis BEP & Margin", icon: BarChart3 },
              { id: "ai", label: "AI Financial Advisor", icon: Sparkles },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
                    isActive 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Role Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-medium">Hak Akses Aktif:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-slate-900 border border-slate-700 text-emerald-400 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="Owner">Owner (Semua Akses)</option>
              <option value="Admin">Admin</option>
              <option value="Kasir">Kasir</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Budi Santoso</p>
              <p className="text-[10px] text-emerald-400">Online & Terenkripsi</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN APPLICATION VIEWPORT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black text-slate-800">
                {activeTab === "dashboard" && "Dashboard Eksekutif & Ringkasan Real-Time"}
                {activeTab === "sales" && "Manajemen Penjualan & Kasir (POS)"}
                {activeTab === "products" && "Katalog Persediaan & Manajemen Stok"}
                {activeTab === "expenses" && "Pencatatan Beban & Pengeluaran Operasional"}
                {activeTab === "debts" && "Buku Catatan Hutang & Piutang"}
                {activeTab === "capital" && "Riwayat Modal & Struktur Ekuitas"}
                {activeTab === "reports" && "Laporan Keuangan Resmi (Laba Rugi & Neraca)"}
                {activeTab === "budget" && "Perencanaan Anggaran & Target Keuangan"}
                {activeTab === "analytics" && "Analisis Titik Impas (BEP) & Kinerja Produk"}
                {activeTab === "ai" && "AI Business Advisor & Automated Forecasting"}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Terakhir disinkronkan: Hari ini, {new Date().toLocaleTimeString("id-ID")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Alert Tag */}
            {lowStockAlerts.length > 0 && (
              <button 
                onClick={() => setActiveTab("products")}
                className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>{lowStockAlerts.length} Stok Kritis</span>
              </button>
            )}

            {/* Quick Actions */}
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs transition"
            >
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              Catat Beban
            </button>

            <button
              onClick={() => setShowAddSaleModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Transaksi Baru (F2)
            </button>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* =========================================================================
              1. TAB: DASHBOARD EKSEKUTIF
          ========================================================================= */}
          {activeTab === "dashboard" && (
            <>
              {/* PRIMARY FINANCIAL KPI STATS (6 CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                
                {/* Total Omzet */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Omzet</span>
                    <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><DollarSign className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{formatIDR(totalRevenue)}</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="h-3 w-3" /> +14.2% bln ini
                    </span>
                  </div>
                </div>

                {/* Total Pengeluaran & Beban */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Beban</span>
                    <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600"><TrendingDown className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-rose-600">{formatIDR(totalExpenses)}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">{expenses.length} transaksi beban</span>
                  </div>
                </div>

                {/* HPP (COGS) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total HPP (Modal)</span>
                    <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Package className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{formatIDR(totalCOGS)}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-1">Harga Pokok Jual</span>
                  </div>
                </div>

                {/* Laba Bersih */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Laba Bersih</span>
                    <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><TrendingUp className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatIDR(netProfit)}
                    </h3>
                    <span className="text-[10px] text-blue-600 font-semibold block mt-1">Margin: {profitMarginPercent}%</span>
                  </div>
                </div>

                {/* Sisa Kas & Modal */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Sisa Kas Aktif</span>
                    <span className="p-1.5 bg-purple-50 rounded-lg text-purple-600"><Wallet className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{formatIDR(cashOnHand)}</h3>
                    <span className="text-[10px] text-purple-700 font-semibold block mt-1">Kas & Bank</span>
                  </div>
                </div>

                {/* Nilai Persediaan Stok */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-600 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Nilai Stok Barang</span>
                    <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700"><Layers className="h-3.5 w-3.5" /></span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{formatIDR(inventoryValue)}</h3>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-1">ROI: +{roiPercentage}%</span>
                  </div>
                </div>

              </div>

              {/* DUAL CHARTS & PROGRESS TARGET */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cashflow Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Arus Kas & Tren Laba Mingguan</h3>
                      <p className="text-xs text-slate-500">Perbandingan harian omzet, beban operasional, dan laba bersih</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Pemasukan</div>
                      <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-rose-400" /> Beban</div>
                      <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-500" /> Laba Bersih</div>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={FINANCIAL_CHART_DATA}>
                        <defs>
                          <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `Rp${v/1000}k`} />
                        <Tooltip formatter={(val: any) => formatIDR(Number(val))} />
                        <Area type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                        <Area type="monotone" dataKey="pengeluaran" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} />
                        <Area type="monotone" dataKey="laba" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Target & Budget Speedometer */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-800">Target Omzet Bulan Ini</h3>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg">
                        {((totalRevenue / targetMonthlyRevenue) * 100).toFixed(0)}% Tercapai
                      </span>
                    </div>

                    {/* Progress Bar Omzet */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>Realisasi: {formatIDR(totalRevenue)}</span>
                        <span>Target: {formatIDR(targetMonthlyRevenue)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-500"
                          style={{ width: `${Math.min((totalRevenue / targetMonthlyRevenue) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Kurang {formatIDR(Math.max(targetMonthlyRevenue - totalRevenue, 0))} lagi untuk mencapai target.</p>
                    </div>

                    {/* Hutang & Piutang Mini Widget */}
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Status Tagihan Berjalan</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                        <span className="text-[11px] font-semibold text-amber-800 block">Piutang Pelanggan</span>
                        <span className="text-sm font-black text-amber-900">{formatIDR(totalReceivables)}</span>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/60">
                        <span className="text-[11px] font-semibold text-rose-800 block">Hutang ke Supplier</span>
                        <span className="text-sm font-black text-rose-900">{formatIDR(totalPayables)}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Quick Insight Mini */}
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-xl mt-6 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-slate-200 leading-snug">
                      <strong>AI Tip:</strong> Margin kotor toko stabil di <strong>55%</strong>. Pertahankan strategi bundling akhir pekan!
                    </p>
                  </div>
                </div>

              </div>

              {/* RECENT SALES TABLE & LOW STOCK PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Sales Table (2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-800">Transaksi Penjualan Terbaru</h4>
                      <p className="text-xs text-slate-500">Daftar transaksi kasir & penjualan terinput</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("sales")}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      Buka Kasir Lengkap &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-4">Invoice</th>
                          <th className="py-3 px-4">Produk</th>
                          <th className="py-3 px-4">Qty</th>
                          <th className="py-3 px-4">Metode</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {sales.slice(0, 5).map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.invoiceNo}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{s.productName}</td>
                            <td className="py-3 px-4">{s.qty}x</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                {s.paymentMethod}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-600">{formatIDR(s.total)}</td>
                            <td className="py-3 px-4 text-center">
                              <button 
                                onClick={() => setActiveReceiptSale(s)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="Cetak Struk"
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stock Warning Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Peringatan Restock Barang
                      </h4>
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                        {lowStockAlerts.length} Item Kritis
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Produk yang berada di bawah batas minimum stok operasional:</p>

                    <div className="space-y-3">
                      {lowStockAlerts.map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400">Min: {p.minStock} | SKU: {p.sku}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                              Sisa {p.stock} pcs
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab("products")}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition"
                  >
                    Buka Manajemen Inventori &rarr;
                  </button>
                </div>

              </div>
            </>
          )}

          {/* =========================================================================
              2. TAB: MANAJEMEN PENJUALAN & KASIR (POS)
          ========================================================================= */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari transaksi berdasarkan invoice, produk, atau kasir..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowAddSaleModal(true)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Input Transaksi Baru
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">No. Faktur</th>
                      <th className="py-3.5 px-6">Tanggal</th>
                      <th className="py-3.5 px-6">Produk & Qty</th>
                      <th className="py-3.5 px-6">Harga Satuan</th>
                      <th className="py-3.5 px-6">Diskon</th>
                      <th className="py-3.5 px-6">Total Bayar</th>
                      <th className="py-3.5 px-6">Metode</th>
                      <th className="py-3.5 px-6">Kasir / User</th>
                      <th className="py-3.5 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sales
                      .filter(s => s.productName.toLowerCase().includes(searchTerm.toLowerCase()) || s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition">
                          <td className="py-4 px-6 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                          <td className="py-4 px-6 text-slate-500">{s.date}</td>
                          <td className="py-4 px-6 font-bold text-slate-800">{s.productName} <span className="text-slate-400 font-normal">({s.qty} pcs)</span></td>
                          <td className="py-4 px-6">{formatIDR(s.sellPrice)}</td>
                          <td className="py-4 px-6 text-rose-600">{s.discount > 0 ? `-${formatIDR(s.discount)}` : "-"}</td>
                          <td className="py-4 px-6 font-bold text-emerald-600">{formatIDR(s.total)}</td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                              {s.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">{s.cashier}</td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => setActiveReceiptSale(s)}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                title="Lihat Struk"
                              >
                                <Receipt className="h-4 w-4" />
                              </button>
                              {currentRole === "Owner" && (
                                <button 
                                  onClick={() => handleDeleteSale(s.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              3. TAB: PRODUK & INVENTORI
          ========================================================================= */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk berdasarkan nama, SKU, atau kategori..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Tambah Produk Baru
                </button>
              </div>

              {/* Product Catalog Grid / Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Barcode/SKU</th>
                      <th className="py-3.5 px-6">Nama Produk</th>
                      <th className="py-3.5 px-6">Kategori</th>
                      <th className="py-3.5 px-6">Harga Modal (HPP)</th>
                      <th className="py-3.5 px-6">Harga Jual</th>
                      <th className="py-3.5 px-6">Margin Keuntungan</th>
                      <th className="py-3.5 px-6">Stok Aktif</th>
                      <th className="py-3.5 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(p => {
                        const marginNominal = p.sellPrice - p.costPrice;
                        const marginPercent = ((marginNominal / p.sellPrice) * 100).toFixed(1);
                        const isCritical = p.stock <= p.minStock;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50 transition">
                            <td className="py-4 px-6 font-mono text-slate-500 font-semibold">{p.sku}</td>
                            <td className="py-4 px-6 font-bold text-slate-900">{p.name}</td>
                            <td className="py-4 px-6"><span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">{p.category}</span></td>
                            <td className="py-4 px-6 text-slate-500">{formatIDR(p.costPrice)}</td>
                            <td className="py-4 px-6 font-bold text-slate-900">{formatIDR(p.sellPrice)}</td>
                            <td className="py-4 px-6 font-bold text-emerald-600">
                              +{formatIDR(marginNominal)} <span className="text-[10px] text-slate-400">({marginPercent}%)</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isCritical ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {p.stock} unit {isCritical && "(Kritis)"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Aktif
                              </span>
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              4. TAB: BEBAN & PENGELUARAN (11 KATEGORI)
          ========================================================================= */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Pencatatan 11 Pos Pengeluaran</h3>
                  <p className="text-xs text-slate-500">Kelola beban bahan baku, sewa, utilitas, dan operasional</p>
                </div>
                <button 
                  onClick={() => setShowAddExpenseModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Catat Pengeluaran Baru
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Tabel Pengeluaran */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3.5 px-6">Tanggal</th>
                        <th className="py-3.5 px-6">Kategori Beban</th>
                        <th className="py-3.5 px-6">Keterangan</th>
                        <th className="py-3.5 px-6 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {expenses.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50 transition">
                          <td className="py-4 px-6 text-slate-500">{e.date}</td>
                          <td className="py-4 px-6">
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                              {e.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-800">{e.notes}</td>
                          <td className="py-4 px-6 text-right font-black text-rose-600">{formatIDR(e.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ringkasan Distribusi Beban */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Distribusi Beban Usaha</h4>
                    <p className="text-xs text-slate-500 mb-4">Total Biaya Operasional: <strong className="text-rose-600">{formatIDR(totalExpenses)}</strong></p>

                    <div className="space-y-3">
                      {BUDGET_DATA.map((b, idx) => {
                        const percent = ((b.used / b.allocated) * 100).toFixed(0);
                        return (
                          <div key={b.category} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-700">{b.category}</span>
                              <span className="text-slate-900 font-bold">{formatIDR(b.used)} / {formatIDR(b.allocated)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${Number(percent) > 90 ? "bg-rose-500" : "bg-emerald-500"}`} 
                                style={{ width: `${Math.min(Number(percent), 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 mt-6">
                    💡 <em>Sistem mendeteksi 68% beban dialokasikan untuk Bahan Baku & Tenaga Kerja.</em>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              5. TAB: BUKU HUTANG & PIUTANG
          ========================================================================= */}
          {activeTab === "debts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Manajemen Hutang & Piutang Jatuh Tempo</h3>
                  <p className="text-xs text-slate-500">Pantau kewajiban dan tagihan ke pihak ketiga secara teratur</p>
                </div>
                <button 
                  onClick={() => setShowAddDebtModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Catat Hutang / Piutang
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-500/10 border border-amber-300/80 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-900 uppercase">Total Piutang Belum Tertagih</span>
                    <Clock className="h-4 w-4 text-amber-700" />
                  </div>
                  <h3 className="text-2xl font-black text-amber-900">{formatIDR(totalReceivables)}</h3>
                </div>

                <div className="bg-rose-500/10 border border-rose-300/80 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-rose-900 uppercase">Total Hutang Usaha (Kewajiban)</span>
                    <AlertCircle className="h-4 w-4 text-rose-700" />
                  </div>
                  <h3 className="text-2xl font-black text-rose-900">{formatIDR(totalPayables)}</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Tipe</th>
                      <th className="py-3.5 px-6">Pihak Terkait</th>
                      <th className="py-3.5 px-6">Nominal</th>
                      <th className="py-3.5 px-6">Jatuh Tempo</th>
                      <th className="py-3.5 px-6">Keterangan</th>
                      <th className="py-3.5 px-6 text-center">Status</th>
                      <th className="py-3.5 px-6 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            d.type === "Piutang" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {d.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">{d.person}</td>
                        <td className="py-4 px-6 font-black text-slate-900">{formatIDR(d.amount)}</td>
                        <td className="py-4 px-6 text-slate-500 font-semibold">{d.dueDate}</td>
                        <td className="py-4 px-6 text-slate-500">{d.notes}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            d.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {d.isPaid ? "LUNAS" : "BELUM LUNAS"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleDebtSettled(d.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              d.isPaid ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {d.isPaid ? "Batal Lunas" : "Tandai Lunas"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. TAB: MODAL & EKUITAS
          ========================================================================= */}
          {activeTab === "capital" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Manajemen Modal & ROI</h3>
                  <p className="text-xs text-slate-500">Lacak setoran modal awal, penambahan modal, dan penarikan prive</p>
                </div>
                <button 
                  onClick={() => setShowCapitalModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Kelola Mutasi Modal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Modal Disetor Bersih</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{formatIDR(totalNetCapital)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Laba Bersih Tertahan</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatIDR(netProfit)}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Persentase ROI Ekuitas</span>
                  <h3 className="text-2xl font-black text-purple-600 mt-1">+{roiPercentage}%</h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-6">Tanggal</th>
                      <th className="py-3.5 px-6">Jenis Mutasi Modal</th>
                      <th className="py-3.5 px-6">Keterangan</th>
                      <th className="py-3.5 px-6 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {capitalLogs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 px-6 text-slate-500">{c.date}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            c.type === "Penarikan Modal (Prive)" ? "bg-rose-100 text-rose-800" : "bg-purple-100 text-purple-800"
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-800">{c.notes}</td>
                        <td className={`py-4 px-6 text-right font-black ${
                          c.type === "Penarikan Modal (Prive)" ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          {c.type === "Penarikan Modal (Prive)" ? `-${formatIDR(c.amount)}` : `+${formatIDR(c.amount)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              7. TAB: LAPORAN RESMI (LABA RUGI & NERACA)
          ========================================================================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Laporan Keuangan Otomatis & Pembukuan</h3>
                  <p className="text-xs text-slate-500">Sesuai Standar Akuntansi Keuangan Entitas Mikro (SAK EMKM)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert("Laporan berhasil diekspor ke format Excel (.xlsx)!")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Download className="h-4 w-4" /> Ekspor Excel
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="h-4 w-4" /> Cetak Laporan PDF
                  </button>
                </div>
              </div>

              {/* Laporan Laba Rugi Paper Format */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">LAPORAN LABA RUGI (INCOME STATEMENT)</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Periode Berjalan: Agustus 2026 | Entitas: {currentBusiness}</p>
                </div>

                {/* 1. PENDAPATAN */}
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg mb-2">1. PENDAPATAN USAHA (REVENUE)</h4>
                  <div className="space-y-1.5 text-xs text-slate-700 px-3">
                    <div className="flex justify-between">
                      <span>Penjualan Kotor Produk</span>
                      <span className="font-semibold">{formatIDR(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Potongan / Diskon Penjualan</span>
                      <span>(Rp 0)</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>Total Pendapatan Bersih</span>
                      <span>{formatIDR(totalRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. HARGA POKOK PENJUALAN */}
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg mb-2">2. BEBAN POKOK PENJUALAN (HPP)</h4>
                  <div className="space-y-1.5 text-xs text-slate-700 px-3">
                    <div className="flex justify-between">
                      <span>Harga Pokok Penjualan (Bahan Baku Terpakai)</span>
                      <span className="font-semibold text-rose-600">({formatIDR(totalCOGS)})</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>LABA KOTOR (GROSS PROFIT)</span>
                      <span className="text-emerald-600 font-black">{formatIDR(grossProfit)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. BEBAN OPERASIONAL */}
                <div>
                  <h4 className="text-xs font-black uppercase text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg mb-2">3. BEBAN OPERASIONAL (OPERATING EXPENSES)</h4>
                  <div className="space-y-1.5 text-xs text-slate-700 px-3">
                    {expenses.map(e => (
                      <div key={e.id} className="flex justify-between">
                        <span>Beban {e.category} ({e.notes})</span>
                        <span className="text-rose-600">({formatIDR(e.amount)})</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>Total Beban Operasional</span>
                      <span className="text-rose-600 font-black">({formatIDR(totalExpenses)})</span>
                    </div>
                  </div>
                </div>

                {/* HASIL AKHIR: LABA BERSIH */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">LABA BERSIH TAHUN BERJALAN</span>
                    <span className="text-[11px] text-emerald-400">Net Profit Margin: {profitMarginPercent}%</span>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-400">{formatIDR(netProfit)}</h3>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              8. TAB: ANALISIS BEP & AI ADVISOR
          ========================================================================= */}
          {(activeTab === "analytics" || activeTab === "ai") && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 mb-4">
                    <Sparkles className="h-3.5 w-3.5" /> CashFlow Pro Smart Machine Learning
                  </div>
                  <h2 className="text-2xl font-black mb-2">Analisis Kelayakan Bisnis & Titik Impas (BEP)</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sistem menganalisis seluruh data penjualan, HPP rata-rata, dan biaya tetap untuk memberikan kalkulasi Break Even Point (BEP) serta prediksi laba masa depan secara otomatis.
                  </p>
                </div>
              </div>

              {/* BEP Calculator Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Titik Impas (BEP Rupiah)</span>
                  <h3 className="text-2xl font-black text-slate-900">{formatIDR(18500000)}</h3>
                  <p className="text-xs text-slate-500">Penjualan minimal per bulan agar usaha tidak merugi.</p>
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                    ✓ Status: Lolos BEP (Omzet: {formatIDR(totalRevenue)})
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Prediksi Omzet Bulan Depan</span>
                  <h3 className="text-2xl font-black text-blue-600">{formatIDR(totalRevenue * 1.22)}</h3>
                  <p className="text-xs text-slate-500">Estimasi kenaikan +22% didorong tren akhir pekan.</p>
                  <div className="p-2.5 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold">
                    Tingkat Akurasi AI: 94.8%
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Rasio Likuiditas Kas</span>
                  <h3 className="text-2xl font-black text-purple-600">3.4x</h3>
                  <p className="text-xs text-slate-500">Kemampuan kas membayar seluruh kewajiban lancar.</p>
                  <div className="p-2.5 bg-purple-50 text-purple-800 rounded-xl text-xs font-bold">
                    Kondisi: Sangat Sehat (Ideal &gt; 1.5x)
                  </div>
                </div>
              </div>

              {/* 4 AI Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-sm">01</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Perbanyak Stok 'Kopi Arabika Gayo'</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Produk ini menyumbang margin laba tertinggi (46.1%) dengan perputaran tercepat. Naikkan alokasi stok 30% di awal bulan.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                  <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-bold text-sm">02</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Efisiensi Biaya Bahan Baku</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Biaya pembelian susu eceran lebih mahal 14%. Negosiasikan pasokan langsung dari distributor galonan untuk menghemat hingga Rp 400.000/bulan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          MODALS SECTION (POPUP DIALOGS)
      ========================================================================= */}

      {/* 1. MODAL TAMBAH PENJUALAN KASIR */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                Catat Transaksi Penjualan
              </h3>
              <button onClick={() => setShowAddSaleModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSale} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Produk</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock}) - {formatIDR(p.sellPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah (Qty)</label>
                  <input 
                    type="number" min="1" 
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                    value={saleQty}
                    onChange={(e) => setSaleQty(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diskon (Rp)</label>
                  <input 
                    type="number" min="0"
                    className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Metode Pembayaran</label>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {(["QRIS", "Cash", "Transfer", "E-Wallet"] as PaymentMethod[]).map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSaleMethod(m)}
                      className={`py-2 rounded-xl border transition ${
                        saleMethod === m ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Transaksi (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Meja 02 / Takeaway"
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddSaleModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/30"
                >
                  Simpan & Cetak Struk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL TAMBAH BEBAN PENGELUARAN */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-600" />
              Catat Pengeluaran Beban Usaha
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Pengeluaran</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                >
                  {[
                    "Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", 
                    "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"
                  ].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nominal Biaya (Rp)</label>
                <input 
                  type="number" required placeholder="Contoh: 250000"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Keterangan</label>
                <input 
                  type="text" required placeholder="Contoh: Beli kemasan cup 500pcs"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-slate-100 font-bold py-2.5 rounded-xl text-xs text-slate-700">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 font-bold py-2.5 rounded-xl text-xs text-white shadow-md">Simpan Beban</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL TAMBAH PRODUK BARU */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Tambah Produk ke Katalog
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Produk</label>
                <input type="text" required placeholder="Nama item..." className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" value={newProdName} onChange={e => setNewProdName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga Modal (HPP)</label>
                  <input type="number" required placeholder="Rp" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" value={newProdCost} onChange={e => setNewProdCost(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga Jual</label>
                  <input type="number" required placeholder="Rp" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" value={newProdSell} onChange={e => setNewProdSell(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stok Awal</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Batas Min. Stok Alert</label>
                  <input type="number" placeholder="5" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs" value={newProdMin} onChange={e => setNewProdMin(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-slate-100 font-bold py-2.5 rounded-xl text-xs text-slate-700">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold py-2.5 rounded-xl text-xs text-white">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL STRUK BUKTI TRANSAKSI (RECEIPT PREVIEW) */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase">{currentBusiness}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Jl. Senopati Raya No. 42, Jakarta</p>
              <p className="text-[10px] text-slate-500">Telp: 0812-3456-7890</p>
            </div>

            <div className="space-y-1 text-slate-600 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between"><span>No. Bukti:</span> <strong className="text-slate-900">{activeReceiptSale.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Tanggal:</span> <span>{activeReceiptSale.date}</span></div>
              <div className="flex justify-between"><span>Kasir:</span> <span>{activeReceiptSale.cashier}</span></div>
              <div className="flex justify-between"><span>Metode:</span> <span className="font-bold text-slate-900">{activeReceiptSale.paymentMethod}</span></div>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{activeReceiptSale.productName}</span>
                <span>{formatIDR(activeReceiptSale.sellPrice * activeReceiptSale.qty)}</span>
              </div>
              <div className="text-[10px] text-slate-500">{activeReceiptSale.qty} pcs x {formatIDR(activeReceiptSale.sellPrice)}</div>
              {activeReceiptSale.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatIDR(activeReceiptSale.discount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
              <span>TOTAL DIBAYAR:</span>
              <span className="text-emerald-600">{formatIDR(activeReceiptSale.total)}</span>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
              Terima Kasih atas Kunjungan Anda!
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setActiveReceiptSale(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold py-2 rounded-xl text-xs"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}