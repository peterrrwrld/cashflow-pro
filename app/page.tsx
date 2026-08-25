"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  Layers, PieChart as PieIcon, Printer, Trash2, Building2, 
  Wallet, BarChart3, Target, Receipt, ShoppingCart, MessageCircle, 
  Scale, Edit3, CheckCircle2, QrCode, ArrowLeftRight, Bell, User,
  FileText, Home, ArrowUpRight, ArrowDownRight, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// ================= TYPES =================
type Role = "Owner" | "Admin" | "Kasir";
type PaymentMethod = "Cash" | "QRIS" | "Transfer" | "E-Wallet";
type ExpenseCategory = 
  | "Bahan Baku" | "Transportasi" | "Gaji" | "Sewa" | "Listrik" 
  | "Air" | "Internet" | "Pajak" | "Marketing" | "Peralatan" | "Operasional Lain";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
}

interface SaleTransaction {
  id: string;
  invoiceNo: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  cogs: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashier: string;
  notes?: string;
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
  phone?: string;
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

interface CategoryBudget {
  category: ExpenseCategory;
  allocated: number;
}

// ================= DEFAULT DATA =================
const DEFAULT_PRODUCTS: Product[] = [
  { id: "P1", name: "Kopi Arabika Gayo 250g", sku: "KOP-001", category: "Minuman", costPrice: 35000, sellPrice: 65000, stock: 35, minStock: 10, isActive: true },
  { id: "P2", name: "Croissant Almond Butter", sku: "BAK-002", category: "Makanan", costPrice: 12000, sellPrice: 28000, stock: 4, minStock: 8, isActive: true },
  { id: "P3", name: "Matcha Latte Premium 500g", sku: "BEV-003", category: "Minuman", costPrice: 55000, sellPrice: 95000, stock: 18, minStock: 5, isActive: true },
  { id: "P4", name: "Susu Fresh Milk 1L", sku: "ING-004", category: "Bahan Baku", costPrice: 17000, sellPrice: 24000, stock: 3, minStock: 10, isActive: true },
];

const DEFAULT_SALES: SaleTransaction[] = [
  {
    id: "S1",
    invoiceNo: "INV-2026-0801",
    date: "2026-08-25",
    items: [{ productId: "P1", name: "Kopi Arabika Gayo 250g", price: 65000, costPrice: 35000, qty: 3 }],
    subtotal: 195000,
    discount: 5000,
    total: 190000,
    cogs: 105000,
    paymentMethod: "QRIS",
    amountPaid: 190000,
    change: 0,
    cashier: "Peter (Owner)",
    notes: "Meja 04"
  },
  {
    id: "S2",
    invoiceNo: "INV-2026-0802",
    date: "2026-08-25",
    items: [{ productId: "P2", name: "Croissant Almond Butter", price: 28000, costPrice: 12000, qty: 2 }],
    subtotal: 56000,
    discount: 0,
    total: 56000,
    cogs: 24000,
    paymentMethod: "Cash",
    amountPaid: 100000,
    change: 44000,
    cashier: "Peter (Owner)",
    notes: "Takeaway"
  }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "E1", category: "Bahan Baku", amount: 650000, date: "2026-08-25", notes: "Biji Kopi Fresh 10kg" },
  { id: "E2", category: "Listrik", amount: 350000, date: "2026-08-22", notes: "Token Listrik Espresso" },
  { id: "E3", category: "Marketing", amount: 200000, date: "2026-08-23", notes: "Promosi Weekend" },
  { id: "E4", category: "Gaji", amount: 2500000, date: "2026-08-01", notes: "Gaji Barista" },
];

const DEFAULT_DEBTS: DebtItem[] = [
  { id: "D1", type: "Piutang", person: "Katering Bu Dewi", phone: "628123456789", amount: 750000, dueDate: "2026-08-28", isPaid: false, notes: "Pesanan 30 botol Cold Brew" },
  { id: "D2", type: "Hutang", person: "Supplier Susu Segar", phone: "628987654321", amount: 480000, dueDate: "2026-08-27", isPaid: false, notes: "Tempo susu 7 hari" },
];

const DEFAULT_CAPITAL: CapitalLog[] = [
  { id: "C1", date: "2026-01-10", type: "Modal Awal", amount: 25000000, notes: "Setoran Modal Pendirian" },
  { id: "C2", date: "2026-05-15", type: "Penambahan Modal", amount: 5000000, notes: "Alat Grinder Baru" },
];

const DEFAULT_BUDGETS: CategoryBudget[] = [
  { category: "Bahan Baku", allocated: 3000000 },
  { category: "Marketing", allocated: 500000 },
  { category: "Gaji", allocated: 3000000 },
  { category: "Listrik", allocated: 500000 },
  { category: "Sewa", allocated: 2000000 },
  { category: "Operasional Lain", allocated: 500000 },
];

export default function CashFlowProBankingUI() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "expenses" | "debts" | "capital" | "reports" | "budget" | "analytics" | "ai"
  >("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Owner");
  const [reportSubTab, setReportSubTab] = useState<"labarugi" | "neraca" | "aruskas">("labarugi");
  const [debtFilter, setDebtFilter] = useState<"Semua" | "Belum Lunas" | "Lunas" | "Piutang" | "Hutang">("Semua");
  const [isClient, setIsClient] = useState(false);

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(DEFAULT_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>(DEFAULT_CAPITAL);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(DEFAULT_BUDGETS);

  const [targetRevenue] = useState(30000000);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleTransaction | null>(null);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [posCashPaid, setPosCashPaid] = useState<string>("");
  const [posNotes, setPosNotes] = useState<string>("");

  // Forms
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Bahan Baku");
  const [expAmount, setExpAmount] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCat, setNewProdCat] = useState("Minuman");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSell, setNewProdSell] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMin, setNewProdMin] = useState("5");

  const [debtType, setDebtType] = useState<"Hutang" | "Piutang">("Piutang");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtPhone, setDebtPhone] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  const [capType, setCapType] = useState<"Penambahan Modal" | "Penarikan Modal (Prive)">("Penambahan Modal");
  const [capAmount, setCapAmount] = useState("");
  const [capNotes, setCapNotes] = useState("");

  const [budgetCat, setBudgetCat] = useState<ExpenseCategory>("Bahan Baku");
  const [budgetNominal, setBudgetNominal] = useState("");
  const [aiSelectedTopic, setAiSelectedTopic] = useState<string>("analisis_kebocoran");

  useEffect(() => {
    setIsClient(true);
    const p = localStorage.getItem("cfp_bank_products_v5");
    const s = localStorage.getItem("cfp_bank_sales_v5");
    const e = localStorage.getItem("cfp_bank_expenses_v5");
    const d = localStorage.getItem("cfp_bank_debts_v5");
    const c = localStorage.getItem("cfp_bank_capital_v5");
    const b = localStorage.getItem("cfp_bank_budgets_v5");

    if (p) setProducts(JSON.parse(p));
    if (s) setSales(JSON.parse(s));
    if (e) setExpenses(JSON.parse(e));
    if (d) setDebts(JSON.parse(d));
    if (c) setCapitalLogs(JSON.parse(c));
    if (b) setCategoryBudgets(JSON.parse(b));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_bank_products_v5", JSON.stringify(products));
      localStorage.setItem("cfp_bank_sales_v5", JSON.stringify(sales));
      localStorage.setItem("cfp_bank_expenses_v5", JSON.stringify(expenses));
      localStorage.setItem("cfp_bank_debts_v5", JSON.stringify(debts));
      localStorage.setItem("cfp_bank_capital_v5", JSON.stringify(capitalLogs));
      localStorage.setItem("cfp_bank_budgets_v5", JSON.stringify(categoryBudgets));
    }
  }, [products, sales, expenses, debts, capitalLogs, categoryBudgets, isClient]);

  const totalRevenue = useMemo(() => sales.reduce((acc, curr) => acc + curr.total, 0), [sales]);
  const totalCOGS = useMemo(() => sales.reduce((acc, curr) => acc + curr.cogs, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  const totalNetCapital = useMemo(() => {
    return capitalLogs.reduce((acc, curr) => {
      if (curr.type === "Penarikan Modal (Prive)") return acc - curr.amount;
      return acc + curr.amount;
    }, 0);
  }, [capitalLogs]);

  const cashOnHand = totalNetCapital + netProfit;
  const roiPercentage = totalNetCapital > 0 ? ((netProfit / totalNetCapital) * 100).toFixed(1) : "0.0";
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";
  const inventoryValue = useMemo(() => products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0), [products]);

  const totalReceivables = useMemo(() => debts.filter(d => d.type === "Piutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const totalPayables = useMemo(() => debts.filter(d => d.type === "Hutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);

  const totalAssets = cashOnHand + inventoryValue + totalReceivables;
  const totalLiabilities = totalPayables;
  const totalEquity = totalNetCapital + netProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const averageMarginRatio = totalRevenue > 0 ? (grossProfit / totalRevenue) : 0.45;
  const bepRevenue = averageMarginRatio > 0 ? (totalExpenses / averageMarginRatio) : 0;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Stok Kosong!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.warning("Maksimal stok tercapai");
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.sellPrice, costPrice: product.costPrice, qty: 1 }];
    });
    toast.success(`${product.name} dimasukkan`);
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
    } else {
      setCart(prev => prev.map(item => item.productId === productId ? { ...item, qty: newQty } : item));
    }
  };

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.qty), 0), [cart]);
  const cartTotal = useMemo(() => Math.max(0, cartSubtotal - posDiscount), [cartSubtotal, posDiscount]);
  const cartCOGS = useMemo(() => cart.reduce((acc, item) => acc + (item.costPrice * item.qty), 0), [cart]);
  const cashChange = useMemo(() => {
    if (posPaymentMethod !== "Cash") return 0;
    const paid = Number(posCashPaid) || 0;
    return Math.max(0, paid - cartTotal);
  }, [posPaymentMethod, posCashPaid, cartTotal]);

  const handleCheckoutPOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Pilih produk terlebih dahulu");
      return;
    }
    if (posPaymentMethod === "Cash" && (Number(posCashPaid) < cartTotal)) {
      toast.error("Uang yang dibayarkan kurang");
      return;
    }

    const newSale: SaleTransaction = {
      id: `S${Date.now()}`,
      invoiceNo: `INV-${String(sales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      subtotal: cartSubtotal,
      discount: posDiscount,
      total: cartTotal,
      cogs: cartCOGS,
      paymentMethod: posPaymentMethod,
      amountPaid: posPaymentMethod === "Cash" ? Number(posCashPaid) : cartTotal,
      change: cashChange,
      cashier: `Peter (${currentRole})`,
      notes: posNotes
    };

    setProducts(prev => prev.map(p => {
      const item = cart.find(c => c.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));

    setSales([newSale, ...sales]);
    setCart([]);
    setPosDiscount(0);
    setPosCashPaid("");
    setPosNotes("");
    setShowAddSaleModal(false);
    setActiveReceiptSale(newSale);
    toast.success("Transaksi Kasir Berhasil!");
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
    toast.success("Pengeluaran Disimpan");
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
    toast.success("Produk Ditambahkan");
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson || !debtAmount || !debtDueDate) return;
    const newD: DebtItem = {
      id: `D${Date.now()}`,
      type: debtType,
      person: debtPerson,
      phone: debtPhone,
      amount: Number(debtAmount),
      dueDate: debtDueDate,
      isPaid: false,
      notes: debtNotes
    };
    setDebts([newD, ...debts]);
    setShowAddDebtModal(false);
    setDebtPerson("");
    setDebtPhone("");
    setDebtAmount("");
    setDebtDueDate("");
    setDebtNotes("");
    toast.success("Tagihan Dicatat");
  };

  const handleToggleDebtSettled = (id: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d));
    toast.info("Status Tagihan Diperbarui");
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
    toast.success("Mutasi Modal Disimpan");
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetNominal || Number(budgetNominal) <= 0) return;
    setCategoryBudgets(prev => {
      const exists = prev.find(b => b.category === budgetCat);
      if (exists) {
        return prev.map(b => b.category === budgetCat ? { ...b, allocated: Number(budgetNominal) } : b);
      }
      return [...prev, { category: budgetCat, allocated: Number(budgetNominal) }];
    });
    setShowBudgetModal(false);
    setBudgetNominal("");
    toast.success("Alokasi Anggaran Diperbarui");
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["Invoice", "Tanggal", "Total Item", "Subtotal", "Diskon", "Total Bayar", "Metode", "Kasir"],
      ...sales.map(s => [
        s.invoiceNo, s.date, s.items.reduce((sum, i) => sum + i.qty, 0),
        s.subtotal, s.discount, s.total, s.paymentMethod, s.cashier
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Laporan_CashFlowPro_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV Berhasil Diunduh");
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#edf5fc] text-slate-800 font-sans antialiased selection:bg-sky-200">
      
      {/* Container Layar Handphone / Tablet (BCA Mobile Style Frame) */}
      <div className="w-full max-w-md bg-[#f4f9fd] min-h-screen flex flex-col justify-between shadow-[0_20px_60px_rgba(0,100,200,0.12)] relative border-x border-sky-100 overflow-x-hidden pb-24">
        
        {/* ================= BLUE BANKING HEADER ================= */}
        <div className="bg-gradient-to-b from-[#0060af] via-[#0077d6] to-[#0091ff] text-white p-5 pt-8 rounded-b-[2.5rem] shadow-[0_12px_30px_rgba(0,110,220,0.25)] relative">
          
          {/* Top Bar: Logo & Avatar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs text-white border border-white/30 shadow-inner">
                CF
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                  CashFlow<span className="text-sky-200 font-light">mobile</span>
                </span>
                <span className="text-[9px] text-sky-100 font-medium">Kopi Senja Nusantara</span>
              </div>
            </div>

            {/* Profile Peter */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25">
              <div className="h-6 w-6 rounded-full bg-sky-200 text-[#0060af] font-black text-[10px] flex items-center justify-center shadow-xs">
                P
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold leading-none">Peter</p>
                <p className="text-[8px] text-sky-200 uppercase font-semibold">Owner</p>
              </div>
            </div>
          </div>

          {/* Saldo Aktif Banner */}
          <div className="mb-4">
            <span className="text-[11px] text-sky-100 font-medium block">Sisa Kas Toko (Saldo Aktif):</span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
              {formatIDR(cashOnHand)}
            </h2>
          </div>

          {/* ================= VIRTUAL PASPOR PLATINUM CARD ================= */}
          <div className="bg-gradient-to-br from-white/95 via-sky-50/90 to-white/90 backdrop-blur-xl text-slate-800 p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,60,150,0.18)] border border-white relative overflow-hidden">
            {/* Card Chip & Network */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#0060af] uppercase tracking-wider block">Paspor Platinum Bisnis</span>
                <span className="text-[9px] text-slate-400 font-medium">Debit & Cash Card</span>
              </div>
              {/* Gold Chip Icon */}
              <div className="h-6 w-8 rounded bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border border-amber-600/30 shadow-xs flex items-center justify-center">
                <div className="w-5 h-3 border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60" />
              </div>
            </div>

            {/* Card Number & Info */}
            <div className="space-y-1">
              <p className="font-mono text-sm font-black tracking-widest text-slate-700">
                5412 •••• •••• 2026
              </p>
              <div className="flex justify-between items-end pt-1">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase font-bold block">Pemilik Rekening</span>
                  <span className="text-xs font-black text-slate-800">PETER</span>
                </div>
                {/* Mastercard Dual Circle Logo */}
                <div className="flex -space-x-2">
                  <div className="h-5 w-5 rounded-full bg-rose-500/90 shadow-2xs" />
                  <div className="h-5 w-5 rounded-full bg-amber-400/90 shadow-2xs" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= MAIN INTERACTIVE BODY ================= */}
        <div className="p-4 space-y-4">

          {/* ================= 1. DASHBOARD VIEW ================= */}
          {activeTab === "dashboard" && (
            <>
              {/* Ringkasan 4 Kartu Mini Finansial */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-[0_4px_16px_rgba(0,100,200,0.05)]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Omzet Masuk</span>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{formatIDR(totalRevenue)}</p>
                  <span className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                    <ArrowUpRight className="h-2.5 w-2.5" /> Penjualan
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-[0_4px_16px_rgba(0,100,200,0.05)]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Beban Keluar</span>
                  <p className="text-sm font-black text-rose-600 mt-0.5">{formatIDR(totalExpenses)}</p>
                  <span className="text-[8px] text-rose-500 font-bold flex items-center gap-0.5 mt-0.5">
                    <ArrowDownRight className="h-2.5 w-2.5" /> Biaya Toko
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-[0_4px_16px_rgba(0,100,200,0.05)]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Laba Bersih</span>
                  <p className={`text-sm font-black mt-0.5 ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatIDR(netProfit)}
                  </p>
                  <span className="text-[8px] text-[#0060af] font-bold">Margin: {profitMarginPercent}%</span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-sky-100 shadow-[0_4px_16px_rgba(0,100,200,0.05)]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">ROI Modal</span>
                  <p className="text-sm font-black text-[#0060af] mt-0.5">+{roiPercentage}%</p>
                  <span className="text-[8px] text-emerald-600 font-bold">Status Sehat</span>
                </div>
              </div>

              {/* Grid 8 Menu Ikon Kasir & Finansial (BCA Grid Style) */}
              <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-[#0060af]">Layanan Finansial Peter</span>
                  <span className="text-[9px] bg-sky-50 text-[#0060af] font-bold px-2 py-0.5 rounded-full">Menu Utama</span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 text-center">
                  <button onClick={() => setShowAddSaleModal(true)} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#0060af] to-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Kasir</span>
                  </button>

                  <button onClick={() => setActiveTab("products")} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-teal-500/30">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Produk</span>
                  </button>

                  <button onClick={() => setShowAddExpenseModal(true)} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-500/30">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Beban</span>
                  </button>

                  <button onClick={() => setActiveTab("debts")} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Tagihan</span>
                  </button>

                  <button onClick={() => setShowCapitalModal(true)} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/30">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Modal</span>
                  </button>

                  <button onClick={() => setActiveTab("reports")} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Laporan</span>
                  </button>

                  <button onClick={() => setActiveTab("budget")} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Target</span>
                  </button>

                  <button onClick={() => setActiveTab("ai")} className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-sky-50 transition active:scale-90">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700">m-Advisor</span>
                  </button>
                </div>
              </div>

              {/* Mutasi Transaksi Terakhir (Daftar Transfer / Riwayat POS) */}
              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-black text-[#0060af]">Riwayat Mutasi Penjualan</span>
                  <button onClick={() => setActiveTab("sales")} className="text-[10px] font-bold text-[#0060af]">Lihat Semua</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {sales.slice(0, 3).map(s => (
                    <div key={s.id} className="p-3 flex justify-between items-center hover:bg-sky-50/50 transition">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">{s.items.map(i => i.name).join(", ")}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{s.invoiceNo} • {s.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600">+{formatIDR(s.total)}</span>
                        <span className="block text-[8px] text-slate-400">{s.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ================= 2. SALES / POS VIEW ================= */}
          {activeTab === "sales" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#0060af]">Daftar Mutasi Transaksi POS</span>
                <div className="flex gap-1.5">
                  <button onClick={handleExportCSV} className="bg-white border border-sky-200 text-[#0060af] px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">CSV</button>
                  <button onClick={() => setShowAddSaleModal(true)} className="bg-[#0060af] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">+ Kasir</button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] divide-y divide-slate-100">
                {sales.map(s => (
                  <div key={s.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-slate-800">{s.invoiceNo}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</p>
                      <span className="text-[8px] bg-sky-50 text-[#0060af] font-bold px-2 py-0.5 rounded-full">{s.paymentMethod} • {s.cashier}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600">+{formatIDR(s.total)}</p>
                      <button onClick={() => setActiveReceiptSale(s)} className="text-[9px] text-[#0060af] font-bold mt-1 block ml-auto">Struk 🧾</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS VIEW ================= */}
          {activeTab === "products" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#0060af]">Daftar Stok Produk ({products.length})</span>
                <button onClick={() => setShowAddProductModal(true)} className="bg-[#0060af] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">+ Produk</button>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] divide-y divide-slate-100">
                {products.map(p => (
                  <div key={p.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-slate-800">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Modal: {formatIDR(p.costPrice)} | Jual: {formatIDR(p.sellPrice)}</p>
                      <span className="text-[8px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.sku}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.stock <= p.minStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.stock} pcs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. EXPENSES VIEW ================= */}
          {activeTab === "expenses" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#0060af]">Beban Toko: {formatIDR(totalExpenses)}</span>
                <button onClick={() => setShowAddExpenseModal(true)} className="bg-rose-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">+ Beban</button>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] divide-y divide-slate-100">
                {expenses.map(e => (
                  <div key={e.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{e.notes}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{e.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-rose-600">-{formatIDR(e.amount)}</p>
                      <span className="text-[8px] text-slate-400">{e.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. DEBTS VIEW ================= */}
          {activeTab === "debts" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#0060af]">Daftar Tagihan Hutang/Piutang</span>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-[#0060af] text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">+ Tagihan</button>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] divide-y divide-slate-100">
                {debts.map(d => (
                  <div key={d.id} className="p-3.5 flex justify-between items-center">
                    <div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${d.type === 'Piutang' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>{d.type}</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{d.person}</p>
                      <p className="text-[9px] text-slate-400">Tempo: {d.dueDate} ({d.notes})</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-slate-900">{formatIDR(d.amount)}</p>
                      <button onClick={() => handleToggleDebtSettled(d.id)} className="text-[9px] bg-sky-50 text-[#0060af] font-bold px-2 py-0.5 rounded-lg border border-sky-200">
                        {d.isPaid ? 'Lunas ✓' : 'Tandai Lunas'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 6. REPORTS VIEW ================= */}
          {activeTab === "reports" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-sky-100">
                  <button onClick={() => setReportSubTab("labarugi")} className={`px-3 py-1 rounded-lg text-xs font-bold ${reportSubTab === 'labarugi' ? 'bg-[#0060af] text-white' : 'text-slate-500'}`}>Laba Rugi</button>
                  <button onClick={() => setReportSubTab("neraca")} className={`px-3 py-1 rounded-lg text-xs font-bold ${reportSubTab === 'neraca' ? 'bg-[#0060af] text-white' : 'text-slate-500'}`}>Neraca</button>
                </div>
                <button onClick={() => window.print()} className="bg-[#0060af] text-white px-3 py-1.5 rounded-xl text-xs font-bold">Cetak</button>
              </div>

              {reportSubTab === "labarugi" && (
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] space-y-3 text-xs">
                  <div className="text-center border-b pb-2">
                    <h3 className="font-black text-[#0060af]">Laporan Laba Rugi</h3>
                    <p className="text-[9px] text-slate-400">Pemilik: Peter • Agustus 2026</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span>Penjualan Bersih:</span> <span className="font-bold">{formatIDR(totalRevenue)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>HPP:</span> <span>({formatIDR(totalCOGS)})</span></div>
                    <div className="flex justify-between font-bold border-t pt-1"><span>Laba Kotor:</span> <span>{formatIDR(grossProfit)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Total Beban:</span> <span>({formatIDR(totalExpenses)})</span></div>
                    <div className="flex justify-between font-black text-emerald-700 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 mt-2">
                      <span>LABA BERSIH:</span>
                      <span>{formatIDR(netProfit)}</span>
                    </div>
                  </div>
                </div>
              )}

              {reportSubTab === "neraca" && (
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] space-y-3 text-xs">
                  <div className="text-center border-b pb-2">
                    <h3 className="font-black text-[#0060af]">Neraca Sederhana</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Total Aset (Kas + Stok + Piutang):</span> <span className="font-bold">{formatIDR(totalAssets)}</span></div>
                    <div className="flex justify-between"><span>Kewajiban Hutang:</span> <span className="font-bold text-rose-600">{formatIDR(totalPayables)}</span></div>
                    <div className="flex justify-between"><span>Ekuitas Modal & Laba:</span> <span className="font-bold text-[#0060af]">{formatIDR(totalEquity)}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 7. AI ADVISOR VIEW ================= */}
          {activeTab === "ai" && (
            <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_6px_20px_rgba(0,100,200,0.06)] space-y-3 text-xs">
              <div className="flex items-center gap-2 text-[#0060af] font-black">
                <Sparkles className="h-4 w-4 text-[#0060af]" />
                m-Advisor untuk Peter
              </div>
              <div className="p-3.5 bg-sky-50 rounded-2xl space-y-2 text-slate-700 leading-relaxed font-medium">
                <p>• <strong>Bahan Baku:</strong> Biaya bahan baku memakan 45% pengeluaran. Disarankan kontrak suplai bulanan untuk menghemat 8% HPP.</p>
                <p>• <strong>Status Kas:</strong> Saldo kas aktif <strong>{formatIDR(cashOnHand)}</strong> sangat cukup untuk menutup hutang operasional.</p>
              </div>
            </div>
          )}

        </div>

        {/* ================= BOTTOM NAVIGATION (BCA REDESIGN STYLE) ================= */}
        <div className="fixed bottom-0 max-w-md w-full bg-white/95 backdrop-blur-xl border-t border-sky-100 px-4 py-2 flex justify-between items-center shadow-[0_-8px_25px_rgba(0,100,200,0.08)] z-40">
          
          {/* Nav 1: Home */}
          <button onClick={() => setActiveTab("dashboard")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'dashboard' ? 'text-[#0060af]' : 'text-slate-400'}`}>
            <Home className="h-5 w-5" />
            <span className="text-[8px] font-bold">Home</span>
          </button>

          {/* Nav 2: Produk / Transaksi */}
          <button onClick={() => setActiveTab("sales")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'sales' ? 'text-[#0060af]' : 'text-slate-400'}`}>
            <ArrowLeftRight className="h-5 w-5" />
            <span className="text-[8px] font-bold">Mutasi</span>
          </button>

          {/* Nav Center: FLOATING QRIS / KASIR BUTTON */}
          <div className="-mt-7">
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="h-13 w-13 rounded-2xl bg-gradient-to-tr from-[#0060af] via-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(0,120,255,0.45)] border-2 border-white active:scale-90 transition"
            >
              <QrCode className="h-6 w-6" />
            </button>
          </div>

          {/* Nav 4: Tagihan / Hutang */}
          <button onClick={() => setActiveTab("debts")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'debts' ? 'text-[#0060af]' : 'text-slate-400'}`}>
            <FileText className="h-5 w-5" />
            <span className="text-[8px] font-bold">Tagihan</span>
          </button>

          {/* Nav 5: Profile / Laporan */}
          <button onClick={() => setActiveTab("reports")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'reports' ? 'text-[#0060af]' : 'text-slate-400'}`}>
            <Layers className="h-5 w-5" />
            <span className="text-[8px] font-bold">Laporan</span>
          </button>
        </div>

      </div>

      {/* ================= MODALS (POPUP) ================= */}

      {/* 1. POS MODAL */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3.5 border border-sky-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-black text-[#0060af]">m-Kasir Transaksi Baru</span>
              <button onClick={() => setShowAddSaleModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="p-2.5 bg-sky-50/50 border border-sky-100 rounded-2xl text-left hover:border-[#0060af] transition"
                >
                  <div className="text-[11px] font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[10px] text-[#0060af] font-black">{formatIDR(p.sellPrice)} (Stok: {p.stock})</div>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 max-h-24 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center">Keranjang belanja kosong</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <span className="truncate font-semibold">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="px-2 py-0.5 bg-slate-200 rounded-lg text-[10px] font-black">-</button>
                      <span className="font-bold">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="px-2 py-0.5 bg-slate-200 rounded-lg text-[10px] font-black">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCheckoutPOS} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Diskon (Rp)</label>
                  <input type="number" value={posDiscount || ""} onChange={e => setPosDiscount(Number(e.target.value))} className="w-full border p-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Metode Bayar</label>
                  <select value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value as any)} className="w-full border p-2 rounded-xl font-bold">
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Cash (Tunai)</option>
                    <option value="Transfer">Transfer BCA</option>
                  </select>
                </div>
              </div>

              {posPaymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-2 bg-sky-50 p-2.5 rounded-2xl border border-sky-100">
                  <div>
                    <label className="text-[9px] text-[#0060af] font-bold block mb-1">Uang Diterima</label>
                    <input type="number" required value={posCashPaid} onChange={e => setPosCashPaid(e.target.value)} className="w-full border p-1.5 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#0060af] font-bold block mb-1">Kembalian</label>
                    <span className="font-black text-emerald-700 block pt-1">{formatIDR(cashChange)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center font-black text-slate-900 border-t pt-2">
                <span>Total:</span>
                <span className="text-[#0060af] text-base">{formatIDR(cartTotal)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddSaleModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" disabled={cart.length === 0} className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black shadow-md shadow-sky-500/30">Bayar & Cetak</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs">
            <span className="font-black text-slate-900 block text-sm">Catat Beban Toko</span>
            <form onSubmit={handleAddExpense} className="space-y-2.5">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Kategori</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full border p-2 rounded-xl font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" required value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs">
            <span className="font-black text-slate-900 block text-sm">Tambah Produk Baru</span>
            <form onSubmit={handleAddProduct} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nama Produk</label>
                <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">HPP (Modal)</label>
                  <input type="number" required value={newProdCost} onChange={e => setNewProdCost(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Harga Jual</label>
                  <input type="number" required value={newProdSell} onChange={e => setNewProdSell(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Stok Awal</label>
                <input type="number" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DEBT MODAL */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs">
            <span className="font-black text-slate-900 block text-sm">Catat Tagihan</span>
            <form onSubmit={handleAddDebt} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDebtType("Piutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Piutang' ? 'bg-[#0060af] text-white' : 'bg-slate-50 text-slate-600'}`}>Piutang</button>
                <button type="button" onClick={() => setDebtType("Hutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Hutang' ? 'bg-[#0060af] text-white' : 'bg-slate-50 text-slate-600'}`}>Hutang</button>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nama Pihak Terkait</label>
                <input type="text" required value={debtPerson} onChange={e => setDebtPerson(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Jatuh Tempo</label>
                <input type="date" required value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddDebtModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CAPITAL MODAL */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs">
            <span className="font-black text-slate-900 block text-sm">Mutasi Modal</span>
            <form onSubmit={handleAddCapital} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Jenis</label>
                <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full border p-2 rounded-xl font-bold">
                  <option value="Penambahan Modal">Penambahan Modal</option>
                  <option value="Penarikan Modal (Prive)">Penarikan (Prive)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={capAmount} onChange={e => setCapAmount(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" value={capNotes} onChange={e => setCapNotes(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCapitalModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. RECEIPT MODAL */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-3 font-mono text-[11px]">
            <div className="text-center border-b pb-2">
              <span className="font-black uppercase block text-xs text-[#0060af]">Kopi Senja Nusantara</span>
              <span className="text-[9px] text-slate-400">Kasir: {activeReceiptSale.cashier}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Faktur:</span> <strong>{activeReceiptSale.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Tgl:</span> <span>{activeReceiptSale.date}</span></div>
            </div>
            <div className="border-t border-b py-2 space-y-1">
              {activeReceiptSale.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.name} x{i.qty}</span>
                  <span>{formatIDR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-xs pt-1 text-slate-900">
              <span>TOTAL:</span>
              <span className="text-[#0060af]">{formatIDR(activeReceiptSale.total)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveReceiptSale(null)} className="flex-1 bg-slate-100 font-sans p-2 rounded-2xl text-xs font-bold">Tutup</button>
              <button onClick={() => window.print()} className="flex-1 bg-[#0060af] text-white font-sans p-2 rounded-2xl text-xs font-bold">Cetak</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
