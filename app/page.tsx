"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  Layers, PieChart as PieIcon, Printer, Trash2, Building2, 
  Wallet, BarChart3, Target, Receipt, ShoppingCart, MessageCircle, 
  Scale, Edit3, CheckCircle2
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
  image?: string;
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

export default function CashFlowProPurpleGlass() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "expenses" | "debts" | "capital" | "reports" | "budget" | "analytics" | "ai"
  >("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Owner");
  const [reportSubTab, setReportSubTab] = useState<"labarugi" | "neraca" | "aruskas">("labarugi");
  const [debtFilter, setDebtFilter] = useState<"Semua" | "Belum Lunas" | "Lunas" | "Piutang" | "Hutang">("Semua");
  const [isClient, setIsClient] = useState(false);

  // Persistent States
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(DEFAULT_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>(DEFAULT_CAPITAL);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(DEFAULT_BUDGETS);

  // Targets & Search
  const [targetRevenue] = useState(30000000);
  const [targetProfit] = useState(12000000);
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

  // LocalStorage Sync
  useEffect(() => {
    setIsClient(true);
    const p = localStorage.getItem("cfp_purple_products");
    const s = localStorage.getItem("cfp_purple_sales");
    const e = localStorage.getItem("cfp_purple_expenses");
    const d = localStorage.getItem("cfp_purple_debts");
    const c = localStorage.getItem("cfp_purple_capital");
    const b = localStorage.getItem("cfp_purple_budgets");

    if (p) setProducts(JSON.parse(p));
    if (s) setSales(JSON.parse(s));
    if (e) setExpenses(JSON.parse(e));
    if (d) setDebts(JSON.parse(d));
    if (c) setCapitalLogs(JSON.parse(c));
    if (b) setCategoryBudgets(JSON.parse(b));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_purple_products", JSON.stringify(products));
      localStorage.setItem("cfp_purple_sales", JSON.stringify(sales));
      localStorage.setItem("cfp_purple_expenses", JSON.stringify(expenses));
      localStorage.setItem("cfp_purple_debts", JSON.stringify(debts));
      localStorage.setItem("cfp_purple_capital", JSON.stringify(capitalLogs));
      localStorage.setItem("cfp_purple_budgets", JSON.stringify(categoryBudgets));
    }
  }, [products, sales, expenses, debts, capitalLogs, categoryBudgets, isClient]);

  // Calculations
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
  const isBalanceSheetBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

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

  // Cart Functions
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
    toast.success(`${product.name} dimasukkan ke keranjang`);
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
    toast.success("Beban Berhasil Dicatat");
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
    toast.success("Tagihan Berhasil Dicatat");
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
    toast.success("Mutasi Modal Berhasil Dicatat");
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
    <div className="flex h-screen bg-gradient-to-br from-[#ebeaf8] via-[#e3ddf7] to-[#f4ebf8] text-slate-800 font-sans antialiased overflow-hidden pb-16 lg:pb-0 relative selection:bg-purple-300">
      
      {/* 3D Glossy Floating Spheres (Persis Referensi Gambar) */}
      <div className="fixed top-12 left-1/4 w-44 h-44 rounded-full bg-gradient-to-tr from-purple-400/50 via-indigo-300/40 to-white/70 shadow-[inset_-8px_-8px_20px_rgba(110,60,220,0.3),0_20px_40px_rgba(140,90,240,0.25)] backdrop-blur-xs pointer-events-none z-0" />
      <div className="fixed -top-16 -left-16 w-80 h-80 rounded-full bg-gradient-to-br from-violet-300/40 via-purple-200/50 to-indigo-100/20 blur-xl pointer-events-none z-0" />
      <div className="fixed top-6 right-16 w-60 h-60 rounded-full bg-gradient-to-bl from-purple-300/40 via-indigo-200/50 to-white/60 shadow-[inset_-10px_-10px_25px_rgba(120,70,230,0.25),0_25px_50px_rgba(150,100,250,0.2)] pointer-events-none z-0" />
      <div className="fixed -bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/40 via-indigo-300/30 to-violet-200/50 shadow-[inset_-12px_-12px_30px_rgba(100,50,210,0.3),0_30px_60px_rgba(130,80,240,0.25)] pointer-events-none z-0" />
      <div className="fixed bottom-8 left-16 w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-300/50 via-purple-200/60 to-white/80 shadow-[inset_-6px_-6px_16px_rgba(90,40,200,0.25),0_15px_30px_rgba(120,70,230,0.2)] pointer-events-none z-0" />

      {/* ================= THICK GLASS SIDEBAR ================= */}
      <aside className="w-64 bg-white/40 backdrop-blur-3xl border-r border-white/80 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] flex flex-col justify-between hidden lg:flex relative z-10">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-white/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center font-black text-xs text-white shadow-lg shadow-purple-500/30">
                CF
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">
                CashFlow<span className="text-purple-600">Pro</span>
              </span>
            </div>
            <span className="text-[10px] bg-purple-100/70 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-white/90 shadow-2xs">Glass</span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <div className="text-[10px] font-extrabold text-purple-900/50 uppercase tracking-wider px-2 py-1">Menu Utama</div>
            {[
              { id: "dashboard", label: "Dashboard Ringkasan", icon: PieIcon },
              { id: "sales", label: "Kasir POS", icon: ShoppingCart },
              { id: "products", label: "Inventori Stok", icon: Package },
              { id: "expenses", label: "Pengeluaran", icon: TrendingDown },
              { id: "debts", label: "Hutang & Piutang", icon: CreditCard },
              { id: "capital", label: "Modal & Ekuitas", icon: Wallet },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition text-left ${
                    isActive 
                      ? "bg-white/85 text-purple-900 font-extrabold shadow-[0_4px_20px_rgba(112,66,240,0.12)] border border-white" 
                      : "text-slate-600 hover:bg-white/50 hover:text-purple-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="text-[10px] font-extrabold text-purple-900/50 uppercase tracking-wider px-2 pt-3 py-1">Laporan & Strategi</div>
            {[
              { id: "reports", label: "Laporan 3-in-1", icon: Layers },
              { id: "budget", label: "Target & Anggaran", icon: Target },
              { id: "analytics", label: "Analisis BEP", icon: BarChart3 },
              { id: "ai", label: "AI Financial Advisor", icon: Sparkles },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition text-left ${
                    isActive 
                      ? "bg-white/85 text-purple-900 font-extrabold shadow-[0_4px_20px_rgba(112,66,240,0.12)] border border-white" 
                      : "text-slate-600 hover:bg-white/50 hover:text-purple-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card - Peter */}
        <div className="p-3 border-t border-white/60 bg-white/20">
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/70 border border-white shadow-[0_4px_16px_rgba(112,66,240,0.06)]">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              P
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Peter</p>
              <p className="text-[10px] text-purple-700 font-bold">Owner • Aktif</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= THICK GLASS VIEWPORT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        
        {/* Top Navbar */}
        <header className="bg-white/40 backdrop-blur-3xl border-b border-white/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-[0_4px_20px_rgba(112,66,240,0.04)]">
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight">
              {activeTab === "dashboard" && "Dashboard Eksekutif"}
              {activeTab === "sales" && "Point of Sale (Kasir)"}
              {activeTab === "products" && "Katalog Persediaan & Stok"}
              {activeTab === "expenses" && "Pencatatan Beban Pengeluaran"}
              {activeTab === "debts" && "Buku Hutang & Piutang"}
              {activeTab === "capital" && "Modal & Struktur Ekuitas"}
              {activeTab === "reports" && "Laporan Keuangan Resmi (Laba Rugi, Neraca, Arus Kas)"}
              {activeTab === "budget" && "Target & Pengawasan Anggaran"}
              {activeTab === "analytics" && "Analisis Break Even Point & Margin"}
              {activeTab === "ai" && "AI Financial Advisor"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-white/70 hover:bg-white border border-white shadow-[0_2px_8px_rgba(244,63,94,0.1)] px-3.5 py-1.5 rounded-xl transition active:scale-95"
            >
              + Catat Beban
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-[0_4px_16px_rgba(112,66,240,0.3)] border border-white/50 px-4 py-1.5 rounded-xl transition active:scale-95"
            >
              + Buka Kasir POS
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-5">

          {/* ================= 1. THICK GLASS DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <>
              {/* Glass Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] flex flex-col justify-between hover:bg-white/60 transition duration-300">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900/60">Total Omzet</span>
                    <span className="p-2 bg-purple-100/70 rounded-xl text-purple-700 border border-white shadow-2xs"><DollarSign className="h-3.5 w-3.5" /></span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{formatIDR(totalRevenue)}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">Realisasi Penjualan</span>
                </div>

                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] flex flex-col justify-between hover:bg-white/60 transition duration-300">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-900/60">Total Beban</span>
                    <span className="p-2 bg-rose-100/70 rounded-xl text-rose-700 border border-white shadow-2xs"><TrendingDown className="h-3.5 w-3.5" /></span>
                  </div>
                  <h3 className="text-2xl font-black text-rose-600">{formatIDR(totalExpenses)}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">{expenses.length} transaksi beban</span>
                </div>

                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] flex flex-col justify-between hover:bg-white/60 transition duration-300">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900/60">Laba Bersih</span>
                    <span className="p-2 bg-indigo-100/70 rounded-xl text-indigo-700 border border-white shadow-2xs"><TrendingUp className="h-3.5 w-3.5" /></span>
                  </div>
                  <h3 className={`text-2xl font-black ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatIDR(netProfit)}
                  </h3>
                  <span className="text-[10px] text-indigo-700 font-bold mt-1">Margin: {profitMarginPercent}%</span>
                </div>

                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] flex flex-col justify-between hover:bg-white/60 transition duration-300">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-900/60">Kas & ROI</span>
                    <span className="p-2 bg-purple-100/70 rounded-xl text-purple-700 border border-white shadow-2xs"><ShieldCheck className="h-3.5 w-3.5" /></span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{formatIDR(cashOnHand)}</h3>
                  <span className="text-[10px] text-purple-700 font-black mt-1">ROI: +{roiPercentage}%</span>
                </div>
              </div>

              {/* Glass Cards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Indikator Finansial */}
                <div className="bg-white/50 backdrop-blur-3xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-3.5">
                  <div className="flex justify-between items-center border-b border-purple-100/60 pb-2.5">
                    <span className="text-xs font-black text-slate-900">Rincian Posisi Keuangan</span>
                    <span className="text-[10px] bg-purple-100/80 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-white">Real-Time</span>
                  </div>
                  <div className="space-y-2.5 text-xs font-medium">
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Pokok Penjualan (HPP):</span>
                      <span className="font-bold text-slate-900">{formatIDR(totalCOGS)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Nilai Persediaan Stok Toko:</span>
                      <span className="font-bold text-slate-900">{formatIDR(inventoryValue)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Piutang Pelanggan:</span>
                      <span className="font-black text-amber-700">{formatIDR(totalReceivables)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Hutang Dagang Supplier:</span>
                      <span className="font-black text-rose-700">{formatIDR(totalPayables)}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Target */}
                <div className="bg-white/50 backdrop-blur-3xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-purple-100/60 pb-2.5 mb-3">
                      <span className="text-xs font-black text-slate-900">Target Omzet Bulanan</span>
                      <span className="text-xs font-black text-purple-700">{((totalRevenue / targetRevenue) * 100).toFixed(0)}% Tercapai</span>
                    </div>
                    <div className="w-full bg-purple-100/60 h-3 rounded-full overflow-hidden mb-2.5 border border-white/70">
                      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 h-full transition-all duration-500" style={{ width: `${Math.min((totalRevenue / targetRevenue) * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                      <span>Realisasi: {formatIDR(totalRevenue)}</span>
                      <span>Target: {formatIDR(targetRevenue)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50/80 border border-purple-200/60 rounded-2xl text-[11px] text-purple-900 font-medium">
                    💡 <strong>Status Peter:</strong> Usaha berada dalam zona profit sehat di atas titik impas (BEP).
                  </div>
                </div>

              </div>

              {/* Glass Transaction Table */}
              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <div className="p-4 border-b border-purple-100/60 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900">Transaksi Penjualan Terbaru</span>
                  <button onClick={() => setActiveTab("sales")} className="text-xs font-bold text-purple-700 hover:text-purple-900">Lihat Semua &rarr;</button>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] tracking-wider border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">Invoice</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {sales.slice(0, 4).map(s => (
                      <tr key={s.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-3.5 px-4"><span className="bg-white/80 border border-purple-200/60 text-purple-900 px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs">{s.paymentMethod}</span></td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">{formatIDR(s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= 2. SALES / POS ================= */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Cari nomor faktur..."
                    className="w-full pl-9 pr-3 py-2 bg-white/60 border border-white rounded-2xl text-xs backdrop-blur-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="bg-white/80 hover:bg-white border border-white text-slate-700 font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-2xs">
                    <Download className="h-3.5 w-3.5" /> CSV
                  </button>
                  <button onClick={() => setShowAddSaleModal(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/25">
                    <Plus className="h-3.5 w-3.5" /> Buka Kasir POS
                  </button>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">No. Invoice</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {sales.filter(s => s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                      <tr key={s.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                        <td className="py-3.5 px-4 text-slate-400">{s.date}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-3.5 px-4"><span className="bg-white/80 border border-purple-200/60 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-purple-900">{s.paymentMethod}</span></td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">{formatIDR(s.total)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => setActiveReceiptSale(s)} className="p-1.5 text-purple-400 hover:text-purple-800"><Receipt className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS ================= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Katalog Produk & Stok ({products.length})</span>
                <button onClick={() => setShowAddProductModal(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-purple-500/25">
                  + Tambah Produk
                </button>
              </div>

              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">HPP</th>
                      <th className="py-3 px-4">Harga Jual</th>
                      <th className="py-3 px-4">Margin Laba</th>
                      <th className="py-3 px-4 text-right">Stok Aktif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatIDR(p.costPrice)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatIDR(p.sellPrice)}</td>
                        <td className="py-3.5 px-4 text-emerald-600 font-black">+{formatIDR(p.sellPrice - p.costPrice)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${p.stock <= p.minStock ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                            {p.stock} pcs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4. EXPENSES ================= */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Total Beban Usaha: <strong className="text-rose-600">{formatIDR(totalExpenses)}</strong></span>
                <button onClick={() => setShowAddExpenseModal(true)} className="bg-rose-600 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-rose-500/25">
                  + Catat Beban
                </button>
              </div>

              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4 text-slate-400">{e.date}</td>
                        <td className="py-3.5 px-4"><span className="bg-white/80 border border-purple-200/60 text-slate-800 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">{e.category}</span></td>
                        <td className="py-3.5 px-4 text-slate-800">{e.notes}</td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600">{formatIDR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. DEBTS ================= */}
          {activeTab === "debts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600">Piutang: <strong className="text-amber-700 font-bold">{formatIDR(totalReceivables)}</strong></span>
                  <span className="text-xs text-slate-600">Hutang: <strong className="text-rose-700 font-bold">{formatIDR(totalPayables)}</strong></span>
                </div>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-purple-500/25">
                  + Catat Tagihan
                </button>
              </div>

              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Pihak</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Jatuh Tempo</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${d.type === 'Piutang' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-rose-100 text-rose-900 border border-rose-200'}`}>{d.type}</span></td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{d.person}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">{formatIDR(d.amount)}</td>
                        <td className="py-3.5 px-4 text-slate-500">{d.dueDate}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-black ${d.isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                            {d.isPaid ? 'LUNAS' : 'BELUM'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleToggleDebtSettled(d.id)} className="text-[10px] bg-white/80 hover:bg-white border border-purple-200 px-3 py-1 rounded-xl font-bold text-purple-900">
                            {d.isPaid ? 'Batal' : 'Tandai Lunas'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. CAPITAL ================= */}
          {activeTab === "capital" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Modal Disetor Bersih: <strong className="text-purple-700">{formatIDR(totalNetCapital)}</strong></span>
                <button onClick={() => setShowCapitalModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-purple-500/25">
                  + Mutasi Modal
                </button>
              </div>

              <div className="bg-white/50 backdrop-blur-3xl rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-white/40 text-purple-900/60 font-black uppercase text-[10px] border-b border-purple-100/60">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100/50 font-medium">
                    {capitalLogs.map(c => (
                      <tr key={c.id} className="hover:bg-white/60 transition">
                        <td className="py-3.5 px-4 text-slate-400">{c.date}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{c.type}</td>
                        <td className="py-3.5 px-4 text-slate-600">{c.notes}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">{formatIDR(c.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. REPORTS ================= */}
          {activeTab === "reports" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 bg-white/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white shadow-2xs">
                  <button onClick={() => setReportSubTab("labarugi")} className={`px-4 py-1.5 rounded-xl text-xs font-black ${reportSubTab === 'labarugi' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-500'}`}>Laba Rugi</button>
                  <button onClick={() => setReportSubTab("neraca")} className={`px-4 py-1.5 rounded-xl text-xs font-black ${reportSubTab === 'neraca' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-500'}`}>Neraca</button>
                </div>
                <button onClick={() => window.print()} className="bg-purple-900 hover:bg-purple-950 text-white font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-md">
                  <Printer className="h-3.5 w-3.5" /> Cetak PDF
                </button>
              </div>

              {reportSubTab === "labarugi" && (
                <div className="bg-white/50 backdrop-blur-3xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-4 text-xs">
                  <div className="border-b border-purple-100/60 pb-3 text-center">
                    <h3 className="font-black text-sm text-slate-900 uppercase">Laporan Laba Rugi</h3>
                    <p className="text-[10px] text-slate-400">Pemilik: Peter • Agustus 2026</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between"><span>Penjualan Bersih (Omzet):</span> <span className="font-bold text-slate-900">{formatIDR(totalRevenue)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Harga Pokok Penjualan (HPP):</span> <span>({formatIDR(totalCOGS)})</span></div>
                    <div className="flex justify-between font-black border-t border-purple-100 pt-2"><span>Laba Kotor:</span> <span>{formatIDR(grossProfit)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Total Beban Operasional:</span> <span>({formatIDR(totalExpenses)})</span></div>
                    <div className="flex justify-between font-black text-emerald-700 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
                      <span>LABA BERSIH:</span>
                      <span className="text-sm">{formatIDR(netProfit)}</span>
                    </div>
                  </div>
                </div>
              )}

              {reportSubTab === "neraca" && (
                <div className="bg-white/50 backdrop-blur-3xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-4 text-xs">
                  <div className="border-b border-purple-100/60 pb-3 text-center">
                    <h3 className="font-black text-sm text-slate-900 uppercase">Neraca Sederhana</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-white">
                      <h4 className="font-black text-slate-900 border-b border-purple-100 pb-2">Aset</h4>
                      <div className="space-y-1.5 mt-2.5 text-slate-600">
                        <div className="flex justify-between"><span>Kas:</span> <span className="font-bold">{formatIDR(cashOnHand)}</span></div>
                        <div className="flex justify-between"><span>Stok:</span> <span className="font-bold">{formatIDR(inventoryValue)}</span></div>
                        <div className="flex justify-between"><span>Piutang:</span> <span className="font-bold">{formatIDR(totalReceivables)}</span></div>
                        <div className="flex justify-between font-black text-slate-900 border-t pt-2"><span>Total:</span> <span>{formatIDR(totalAssets)}</span></div>
                      </div>
                    </div>
                    <div className="bg-white/60 p-4 rounded-2xl border border-white">
                      <h4 className="font-black text-slate-900 border-b border-purple-100 pb-2">Kewajiban & Modal</h4>
                      <div className="space-y-1.5 mt-2.5 text-slate-600">
                        <div className="flex justify-between"><span>Hutang:</span> <span className="font-bold">{formatIDR(totalPayables)}</span></div>
                        <div className="flex justify-between"><span>Modal:</span> <span className="font-bold">{formatIDR(totalNetCapital)}</span></div>
                        <div className="flex justify-between"><span>Laba:</span> <span className="font-bold">{formatIDR(netProfit)}</span></div>
                        <div className="flex justify-between font-black text-slate-900 border-t pt-2"><span>Total:</span> <span>{formatIDR(totalLiabilitiesAndEquity)}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 8. BUDGET ================= */}
          {activeTab === "budget" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Alokasi Anggaran Beban</span>
                <button onClick={() => setShowBudgetModal(true)} className="bg-purple-900 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md">
                  Atur Anggaran
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryBudgets.map(b => {
                  const used = expensesByCategory[b.category] || 0;
                  const percent = Math.min(((used / b.allocated) * 100), 100);
                  const isOver = used > b.allocated;

                  return (
                    <div key={b.category} className="bg-white/50 backdrop-blur-3xl p-4.5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-2.5">
                      <div className="flex justify-between text-xs font-black">
                        <span>{b.category}</span>
                        <span className={isOver ? "text-rose-600" : "text-slate-600"}>
                          {formatIDR(used)} / {formatIDR(b.allocated)}
                        </span>
                      </div>
                      <div className="w-full bg-purple-100/60 h-2.5 rounded-full overflow-hidden border border-white/70">
                        <div className={`h-full ${isOver ? "bg-rose-500" : "bg-gradient-to-r from-purple-600 to-indigo-600"}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 9. ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)]">
                  <span className="text-[10px] font-black text-purple-900/60 uppercase">Titik Impas (BEP)</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{formatIDR(bepRevenue)}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Lolos Ambang Batas</p>
                </div>
                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)]">
                  <span className="text-[10px] font-black text-purple-900/60 uppercase">Rasio Margin Kotor</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{(averageMarginRatio * 100).toFixed(1)}%</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Efisiensi HPP Terjaga</p>
                </div>
                <div className="bg-white/50 backdrop-blur-3xl p-5 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)]">
                  <span className="text-[10px] font-black text-purple-900/60 uppercase">Margin Bersih</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{profitMarginPercent}%</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Profitabilitas Sehat</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. AI ADVISOR ================= */}
          {activeTab === "ai" && (
            <div className="bg-white/50 backdrop-blur-3xl p-6 rounded-3xl border border-white/90 shadow-[0_8px_32px_0_rgba(112,66,240,0.08)] space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Rekomendasi AI untuk Peter
              </div>
              <div className="p-4 bg-purple-50/70 border border-purple-200/60 rounded-2xl space-y-2.5 text-slate-700 leading-relaxed font-medium">
                <p>• <strong>Bahan Baku:</strong> Pembelian bahan baku menyerap 45% pengeluaran toko. Gunakan skema kontrak grosir bulanan untuk memotong HPP hingga 8%.</p>
                <p>• <strong>Keamanan Kas:</strong> Rasio likuiditas kas Peter berada pada angka 3.4x (sangat aman untuk menutup hutang lancar).</p>
                <p>• <strong>Proyeksi Omzet:</strong> Dengan pola transaksi saat ini, laba bersih diproyeksikan tumbuh 20% bulan depan.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= THICK GLASS BOTTOM NAV (MOBILE) ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-3xl border-t border-white/90 px-2 py-1.5 flex justify-around items-center z-40 shadow-2xl">
        {[
          { id: "dashboard", label: "Ringkasan", icon: PieIcon },
          { id: "sales", label: "Kasir", icon: ShoppingCart },
          { id: "products", label: "Stok", icon: Package },
          { id: "expenses", label: "Beban", icon: TrendingDown },
          { id: "reports", label: "Laporan", icon: Layers },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-0.5 p-1 ${isActive ? "text-purple-700 font-black" : "text-slate-400"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= THICK GLASS MODALS ================= */}

      {/* 1. POS MODAL */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-lg w-full p-5 shadow-[0_20px_50px_rgba(112,66,240,0.2)] space-y-3.5 border border-white">
            <div className="flex justify-between items-center border-b border-purple-100 pb-2">
              <span className="text-xs font-black text-slate-900">Kasir POS Multi-Item</span>
              <button onClick={() => setShowAddSaleModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="p-2.5 bg-white/70 border border-white rounded-2xl text-left hover:border-purple-600 transition shadow-2xs"
                >
                  <div className="text-[11px] font-bold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-purple-700 font-black">{formatIDR(p.sellPrice)} (Stok: {p.stock})</div>
                </button>
              ))}
            </div>

            <div className="bg-white/60 p-3 rounded-2xl text-xs space-y-1 max-h-28 overflow-y-auto border border-white">
              {cart.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic text-center">Keranjang kosong</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <span className="truncate font-semibold">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="px-2 py-0.5 bg-purple-100 rounded-lg text-[10px] font-black text-purple-900">-</button>
                      <span className="font-bold">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="px-2 py-0.5 bg-purple-100 rounded-lg text-[10px] font-black text-purple-900">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCheckoutPOS} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Diskon (Rp)</label>
                  <input type="number" value={posDiscount || ""} onChange={e => setPosDiscount(Number(e.target.value))} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Metode</label>
                  <select value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value as any)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold">
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Cash (Tunai)</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
              </div>

              {posPaymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-2 bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100">
                  <div>
                    <label className="text-[10px] text-purple-900 font-bold block mb-1">Uang Diterima</label>
                    <input type="number" required value={posCashPaid} onChange={e => setPosCashPaid(e.target.value)} className="w-full border border-white p-1.5 rounded-xl bg-white font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-purple-900 font-bold block mb-1">Kembalian</label>
                    <span className="font-black text-purple-800 block pt-1">{formatIDR(cashChange)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center font-black text-slate-900 border-t border-purple-100 pt-2">
                <span>Total:</span>
                <span className="text-purple-700 text-base">{formatIDR(cartTotal)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddSaleModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" disabled={cart.length === 0} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl font-black shadow-md shadow-purple-500/30">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-sm w-full p-5 shadow-[0_20px_50px_rgba(244,63,94,0.15)] space-y-3 text-xs border border-white">
            <span className="font-black text-slate-900 block text-sm">Catat Beban Pengeluaran</span>
            <form onSubmit={handleAddExpense} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Kategori</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" required value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white p-2.5 rounded-2xl font-black shadow-md shadow-rose-500/25">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-sm w-full p-5 shadow-[0_20px_50px_rgba(112,66,240,0.2)] space-y-3 text-xs border border-white">
            <span className="font-black text-slate-900 block text-sm">Tambah Produk Baru</span>
            <form onSubmit={handleAddProduct} className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Nama Produk</label>
                <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">HPP (Modal)</label>
                  <input type="number" required value={newProdCost} onChange={e => setNewProdCost(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Harga Jual</label>
                  <input type="number" required value={newProdSell} onChange={e => setNewProdSell(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Stok Awal</label>
                <input type="number" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl font-black shadow-md shadow-purple-500/25">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DEBT MODAL */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-sm w-full p-5 shadow-[0_20px_50px_rgba(112,66,240,0.2)] space-y-3 text-xs border border-white">
            <span className="font-black text-slate-900 block text-sm">Catat Tagihan / Hutang</span>
            <form onSubmit={handleAddDebt} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDebtType("Piutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Piutang' ? 'bg-purple-900 text-white border-purple-900 shadow-xs' : 'bg-white/80 text-slate-600 border-white'}`}>Piutang</button>
                <button type="button" onClick={() => setDebtType("Hutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Hutang' ? 'bg-purple-900 text-white border-purple-900 shadow-xs' : 'bg-white/80 text-slate-600 border-white'}`}>Hutang</button>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Nama Pihak Terkait</label>
                <input type="text" required value={debtPerson} onChange={e => setDebtPerson(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Jatuh Tempo</label>
                <input type="date" required value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddDebtModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl font-black shadow-md shadow-purple-500/25">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CAPITAL MODAL */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-sm w-full p-5 shadow-[0_20px_50px_rgba(112,66,240,0.2)] space-y-3 text-xs border border-white">
            <span className="font-black text-slate-900 block text-sm">Mutasi Modal Usaha</span>
            <form onSubmit={handleAddCapital} className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Jenis</label>
                <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold">
                  <option value="Penambahan Modal">Penambahan Modal</option>
                  <option value="Penarikan Modal (Prive)">Penarikan (Prive)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input type="number" required value={capAmount} onChange={e => setCapAmount(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" value={capNotes} onChange={e => setCapNotes(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCapitalModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white p-2.5 rounded-2xl font-black shadow-md shadow-purple-500/25">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BUDGET MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-3">
          <div className="bg-white/85 backdrop-blur-3xl rounded-3xl max-w-sm w-full p-5 shadow-[0_20px_50px_rgba(112,66,240,0.2)] space-y-3 text-xs border border-white">
            <span className="font-black text-slate-900 block text-sm">Atur Anggaran Kategori</span>
            <form onSubmit={handleSaveBudget} className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Kategori Beban</label>
                <select value={budgetCat} onChange={e => setBudgetCat(e.target.value as any)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Batas Anggaran (Rp)</label>
                <input type="number" required value={budgetNominal} onChange={e => setBudgetNominal(e.target.value)} className="w-full border border-white bg-white/80 p-2 rounded-xl font-bold" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 bg-white border border-white p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-purple-900 text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RECEIPT MODAL */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-3 font-mono text-[11px] border border-white">
            <div className="text-center border-b border-purple-100 pb-2">
              <span className="font-black uppercase block text-xs text-purple-900">Kopi Senja Nusantara</span>
              <span className="text-[10px] text-slate-400">Kasir: {activeReceiptSale.cashier}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Faktur:</span> <strong>{activeReceiptSale.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Tgl:</span> <span>{activeReceiptSale.date}</span></div>
            </div>
            <div className="border-t border-b border-purple-100 py-2 space-y-1">
              {activeReceiptSale.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.name} x{i.qty}</span>
                  <span>{formatIDR(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-xs pt-1 text-purple-950">
              <span>TOTAL:</span>
              <span className="text-purple-700">{formatIDR(activeReceiptSale.total)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveReceiptSale(null)} className="flex-1 bg-slate-100 font-sans p-2 rounded-2xl text-xs font-bold">Tutup</button>
              <button onClick={() => window.print()} className="flex-1 bg-purple-900 text-white font-sans p-2 rounded-2xl text-xs font-bold">Cetak</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
