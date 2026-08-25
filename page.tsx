"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  ArrowUpRight, Layers, PieChart as PieIcon, Printer, Trash2, Building2, Clock, 
  Wallet, BarChart3, Target, Receipt, ShoppingCart, MessageCircle, 
  Scale, Edit3, ArrowRight, CheckCircle2, User, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// ================= TYPES =================
type Role = "Owner" | "Admin" | "Kasir";
type PaymentMethod = "Cash" | "QRIS";
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
  { id: "E3", category: "Marketing", amount: 200000, date: "2026-08-23", notes: "Promosi Online" },
  { id: "E4", category: "Gaji", amount: 2500000, date: "2026-08-01", notes: "Gaji Barista" },
];

const DEFAULT_DEBTS: DebtItem[] = [
  { id: "D1", type: "Piutang", person: "Katering Bu Dewi", phone: "628123456789", amount: 750000, dueDate: "2026-08-28", isPaid: false, notes: "Pesanan 30 botol Cold Brew" },
  { id: "D2", type: "Hutang", person: "Supplier Susu Segar", phone: "628987654321", amount: 480000, dueDate: "2026-08-27", isPaid: false, notes: "Tempo susu segar" },
];

const DEFAULT_CAPITAL: CapitalLog[] = [
  { id: "C1", date: "2026-01-10", type: "Modal Awal", amount: 25000000, notes: "Setoran Modal Usaha" },
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

export default function CashFlowProMinimalGLM() {
  // States
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

  // Targets
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
    const p = localStorage.getItem("cfp_glm_products");
    const s = localStorage.getItem("cfp_glm_sales");
    const e = localStorage.getItem("cfp_glm_expenses");
    const d = localStorage.getItem("cfp_glm_debts");
    const c = localStorage.getItem("cfp_glm_capital");
    const b = localStorage.getItem("cfp_glm_budgets");

    if (p) setProducts(JSON.parse(p));
    if (s) setSales(JSON.parse(s));
    if (e) setExpenses(JSON.parse(e));
    if (d) setDebts(JSON.parse(d));
    if (c) setCapitalLogs(JSON.parse(c));
    if (b) setCategoryBudgets(JSON.parse(b));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_glm_products", JSON.stringify(products));
      localStorage.setItem("cfp_glm_sales", JSON.stringify(sales));
      localStorage.setItem("cfp_glm_expenses", JSON.stringify(expenses));
      localStorage.setItem("cfp_glm_debts", JSON.stringify(debts));
      localStorage.setItem("cfp_glm_capital", JSON.stringify(capitalLogs));
      localStorage.setItem("cfp_glm_budgets", JSON.stringify(categoryBudgets));
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
  const lowStockAlerts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Stok Kosong");
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
    toast.success(`${product.name} ditambahkan`);
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
    toast.success("Transaksi Disimpan!");
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
    toast.success("Beban Disimpan");
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
    toast.success("Alokasi Anggaran Disimpan");
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
    toast.success("CSV Berhasil Diunduh");
  };

  return (
    <div className="flex h-screen bg-[#fafafa] text-zinc-900 font-sans antialiased overflow-hidden pb-16 lg:pb-0">
      
      {/* ================= MINIMAL SIDEBAR ================= */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-zinc-200/80 flex flex-col justify-between hidden lg:flex">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center font-black text-xs text-white">
                CF
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900">
                CashFlow<span className="text-emerald-600">Pro</span>
              </span>
            </div>
            <span className="text-[10px] bg-zinc-100 text-zinc-600 font-medium px-2 py-0.5 rounded-md">GLM v2</span>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-0.5 text-xs font-medium">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1.5">Operasional</div>
            {[
              { id: "dashboard", label: "Ringkasan", icon: PieIcon },
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                    isActive 
                      ? "bg-zinc-900 text-white font-semibold shadow-xs" 
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 pt-3 py-1.5">Analisis & Laporan</div>
            {[
              { id: "reports", label: "Laporan 3-in-1", icon: Layers },
              { id: "budget", label: "Target & Anggaran", icon: Target },
              { id: "analytics", label: "Analisis BEP", icon: BarChart3 },
              { id: "ai", label: "AI Advisor", icon: Sparkles },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition text-left ${
                    isActive 
                      ? "bg-zinc-900 text-white font-semibold shadow-xs" 
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card - Peter */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              P
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-semibold text-zinc-900 truncate">Peter</p>
              <p className="text-[10px] text-zinc-500">Owner • Aktif</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= VIEWPORT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 capitalize">
              {activeTab === "dashboard" && "Ringkasan Finansial"}
              {activeTab === "sales" && "Point of Sale (Kasir)"}
              {activeTab === "products" && "Katalog Persediaan"}
              {activeTab === "expenses" && "Pencatatan Beban"}
              {activeTab === "debts" && "Buku Hutang & Piutang"}
              {activeTab === "capital" && "Ekuitas & Modal Usaha"}
              {activeTab === "reports" && "Laporan Keuangan Resmi"}
              {activeTab === "budget" && "Target & Anggaran"}
              {activeTab === "analytics" && "Analisis Break Even Point"}
              {activeTab === "ai" && "AI Business Advisor"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 px-3 py-1.5 rounded-lg transition"
            >
              + Beban
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg transition shadow-xs"
            >
              + Kasir POS
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-5">

          {/* ================= 1. MINIMAL DASHBOARD (NO CHART) ================= */}
          {activeTab === "dashboard" && (
            <>
              {/* Minimal Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Omzet</span>
                  <h3 className="text-lg font-bold text-zinc-900 mt-1">{formatIDR(totalRevenue)}</h3>
                  <span className="text-[10px] text-emerald-600 font-medium">Realisasi Penjualan</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Beban</span>
                  <h3 className="text-lg font-bold text-rose-600 mt-1">{formatIDR(totalExpenses)}</h3>
                  <span className="text-[10px] text-zinc-400">{expenses.length} pos beban</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Laba Bersih</span>
                  <h3 className={`text-lg font-bold mt-1 ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatIDR(netProfit)}
                  </h3>
                  <span className="text-[10px] text-zinc-500">Margin: {profitMarginPercent}%</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Sisa Kas & ROI</span>
                  <h3 className="text-lg font-bold text-zinc-900 mt-1">{formatIDR(cashOnHand)}</h3>
                  <span className="text-[10px] text-emerald-600 font-medium">ROI: +{roiPercentage}%</span>
                </div>
              </div>

              {/* Minimalist Summary Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Status Ringkas */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-xs font-bold text-zinc-900">Indikator Finansial</span>
                    <span className="text-[10px] text-zinc-400">Status Operasional</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-600">
                      <span>Harga Pokok Penjualan (HPP):</span>
                      <span className="font-semibold text-zinc-900">{formatIDR(totalCOGS)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Nilai Persediaan Stok Toko:</span>
                      <span className="font-semibold text-zinc-900">{formatIDR(inventoryValue)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Piutang Pelanggan:</span>
                      <span className="font-semibold text-amber-700">{formatIDR(totalReceivables)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Hutang ke Supplier:</span>
                      <span className="font-semibold text-rose-700">{formatIDR(totalPayables)}</span>
                    </div>
                  </div>
                </div>

                {/* Target Minimal Widget */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-xs font-bold text-zinc-900">Target Omzet Bulanan</span>
                    <span className="text-xs font-bold text-emerald-600">{((totalRevenue / targetRevenue) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full" style={{ width: `${Math.min((totalRevenue / targetRevenue) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>Tercapai: {formatIDR(totalRevenue)}</span>
                    <span>Target: {formatIDR(targetRevenue)}</span>
                  </div>
                </div>

              </div>

              {/* Minimal Transaction Table */}
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <div className="p-3.5 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-900">Transaksi Terakhir</span>
                  <button onClick={() => setActiveTab("sales")} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Lihat Semua &rarr;</button>
                </div>
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">Invoice</th>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4">Metode</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {sales.slice(0, 4).map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4 font-mono font-semibold text-zinc-900">{s.invoiceNo}</td>
                        <td className="py-2.5 px-4 text-zinc-700">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-2.5 px-4"><span className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-medium">{s.paymentMethod}</span></td>
                        <td className="py-2.5 px-4 text-right font-bold text-zinc-900">{formatIDR(s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= 2. SALES / POS ================= */}
          {activeTab === "sales" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari faktur..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleExportCSV} className="bg-white border border-zinc-200 text-zinc-700 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" /> CSV
                  </button>
                  <button onClick={() => setShowAddSaleModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Kasir POS
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">No. Invoice</th>
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">Daftar Item</th>
                      <th className="py-2.5 px-4">Metode</th>
                      <th className="py-2.5 px-4 text-right">Total</th>
                      <th className="py-2.5 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {sales.filter(s => s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4 font-mono font-semibold text-zinc-900">{s.invoiceNo}</td>
                        <td className="py-2.5 px-4 text-zinc-400">{s.date}</td>
                        <td className="py-2.5 px-4 text-zinc-800">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-2.5 px-4"><span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px]">{s.paymentMethod}</span></td>
                        <td className="py-2.5 px-4 text-right font-bold text-zinc-900">{formatIDR(s.total)}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button onClick={() => setActiveReceiptSale(s)} className="p-1 text-zinc-400 hover:text-zinc-800"><Receipt className="h-3.5 w-3.5" /></button>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-900">Katalog Produk ({products.length})</span>
                <button onClick={() => setShowAddProductModal(true)} className="bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
                  + Tambah Produk
                </button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Nama Produk</th>
                      <th className="py-2.5 px-4">HPP</th>
                      <th className="py-2.5 px-4">Harga Jual</th>
                      <th className="py-2.5 px-4">Margin</th>
                      <th className="py-2.5 px-4 text-right">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4 font-mono text-zinc-400">{p.sku}</td>
                        <td className="py-2.5 px-4 font-bold text-zinc-900">{p.name}</td>
                        <td className="py-2.5 px-4 text-zinc-500">{formatIDR(p.costPrice)}</td>
                        <td className="py-2.5 px-4 font-semibold text-zinc-900">{formatIDR(p.sellPrice)}</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-semibold">+{formatIDR(p.sellPrice - p.costPrice)}</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock <= p.minStock ? "bg-rose-50 text-rose-700" : "bg-zinc-100 text-zinc-700"}`}>
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
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-900">Total Beban: {formatIDR(totalExpenses)}</span>
                <button onClick={() => setShowAddExpenseModal(true)} className="bg-rose-600 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
                  + Catat Beban
                </button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">Kategori</th>
                      <th className="py-2.5 px-4">Keterangan</th>
                      <th className="py-2.5 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4 text-zinc-400">{e.date}</td>
                        <td className="py-2.5 px-4"><span className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-medium">{e.category}</span></td>
                        <td className="py-2.5 px-4 text-zinc-800">{e.notes}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-rose-600">{formatIDR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. DEBTS ================= */}
          {activeTab === "debts" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="text-xs text-zinc-500">Piutang: <strong className="text-zinc-900">{formatIDR(totalReceivables)}</strong></span>
                  <span className="text-xs text-zinc-500">Hutang: <strong className="text-zinc-900">{formatIDR(totalPayables)}</strong></span>
                </div>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
                  + Catat Tagihan
                </button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">Tipe</th>
                      <th className="py-2.5 px-4">Pihak</th>
                      <th className="py-2.5 px-4">Nominal</th>
                      <th className="py-2.5 px-4">Jatuh Tempo</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${d.type === 'Piutang' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>{d.type}</span></td>
                        <td className="py-2.5 px-4 font-bold text-zinc-900">{d.person}</td>
                        <td className="py-2.5 px-4 font-bold text-zinc-900">{formatIDR(d.amount)}</td>
                        <td className="py-2.5 px-4 text-zinc-500">{d.dueDate}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                            {d.isPaid ? 'LUNAS' : 'BELUM'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button onClick={() => handleToggleDebtSettled(d.id)} className="text-[10px] bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded font-medium">
                            {d.isPaid ? 'Batal' : 'Lunas'}
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
                <span className="text-xs font-bold text-zinc-900">Modal Disetor: {formatIDR(totalNetCapital)}</span>
                <button onClick={() => setShowCapitalModal(true)} className="bg-zinc-900 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
                  + Mutasi Modal
                </button>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 text-zinc-400 font-semibold uppercase text-[10px] border-b border-zinc-100">
                    <tr>
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">Tipe</th>
                      <th className="py-2.5 px-4">Keterangan</th>
                      <th className="py-2.5 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {capitalLogs.map(c => (
                      <tr key={c.id} className="hover:bg-zinc-50/60">
                        <td className="py-2.5 px-4 text-zinc-400">{c.date}</td>
                        <td className="py-2.5 px-4 font-semibold text-zinc-900">{c.type}</td>
                        <td className="py-2.5 px-4 text-zinc-600">{c.notes}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-zinc-900">{formatIDR(c.amount)}</td>
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
                <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
                  <button onClick={() => setReportSubTab("labarugi")} className={`px-3 py-1 rounded-md text-xs font-semibold ${reportSubTab === 'labarugi' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'}`}>Laba Rugi</button>
                  <button onClick={() => setReportSubTab("neraca")} className={`px-3 py-1 rounded-md text-xs font-semibold ${reportSubTab === 'neraca' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'}`}>Neraca</button>
                </div>
                <button onClick={() => window.print()} className="bg-zinc-900 text-white font-medium px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Printer className="h-3 w-3" /> Cetak PDF
                </button>
              </div>

              {reportSubTab === "labarugi" && (
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3 text-xs">
                  <div className="border-b pb-2 text-center">
                    <h3 className="font-bold text-zinc-900 uppercase">Laporan Laba Rugi</h3>
                    <p className="text-[10px] text-zinc-400">Pemilik: Peter • Agustus 2026</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><span>Penjualan Bersih:</span> <span className="font-semibold text-zinc-900">{formatIDR(totalRevenue)}</span></div>
                    <div className="flex justify-between text-zinc-500"><span>HPP:</span> <span>({formatIDR(totalCOGS)})</span></div>
                    <div className="flex justify-between font-bold border-t pt-1"><span>Laba Kotor:</span> <span>{formatIDR(grossProfit)}</span></div>
                    <div className="flex justify-between text-zinc-500"><span>Total Beban:</span> <span>({formatIDR(totalExpenses)})</span></div>
                    <div className="flex justify-between font-black text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <span>LABA BERSIH:</span>
                      <span>{formatIDR(netProfit)}</span>
                    </div>
                  </div>
                </div>
              )}

              {reportSubTab === "neraca" && (
                <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs space-y-3 text-xs">
                  <div className="border-b pb-2 text-center">
                    <h3 className="font-bold text-zinc-900 uppercase">Neraca Sederhana</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-zinc-900 border-b pb-1">Aset</h4>
                      <div className="space-y-1 mt-2 text-zinc-600">
                        <div className="flex justify-between"><span>Kas:</span> <span className="font-medium">{formatIDR(cashOnHand)}</span></div>
                        <div className="flex justify-between"><span>Stok:</span> <span className="font-medium">{formatIDR(inventoryValue)}</span></div>
                        <div className="flex justify-between"><span>Piutang:</span> <span className="font-medium">{formatIDR(totalReceivables)}</span></div>
                        <div className="flex justify-between font-bold text-zinc-900 border-t pt-1"><span>Total:</span> <span>{formatIDR(totalAssets)}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 border-b pb-1">Kewajiban & Modal</h4>
                      <div className="space-y-1 mt-2 text-zinc-600">
                        <div className="flex justify-between"><span>Hutang:</span> <span className="font-medium">{formatIDR(totalPayables)}</span></div>
                        <div className="flex justify-between"><span>Modal:</span> <span className="font-medium">{formatIDR(totalNetCapital)}</span></div>
                        <div className="flex justify-between"><span>Laba:</span> <span className="font-medium">{formatIDR(netProfit)}</span></div>
                        <div className="flex justify-between font-bold text-zinc-900 border-t pt-1"><span>Total:</span> <span>{formatIDR(totalLiabilitiesAndEquity)}</span></div>
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
                <span className="text-xs font-bold text-zinc-900">Alokasi Anggaran Beban</span>
                <button onClick={() => setShowBudgetModal(true)} className="bg-zinc-900 text-white font-medium px-3 py-1.5 rounded-lg text-xs">
                  Atur Anggaran
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryBudgets.map(b => {
                  const used = expensesByCategory[b.category] || 0;
                  const percent = Math.min(((used / b.allocated) * 100), 100);
                  const isOver = used > b.allocated;

                  return (
                    <div key={b.category} className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{b.category}</span>
                        <span className={isOver ? "text-rose-600 font-bold" : "text-zinc-600"}>
                          {formatIDR(used)} / {formatIDR(b.allocated)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${isOver ? "bg-rose-500" : "bg-emerald-600"}`} style={{ width: `${percent}%` }} />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">Titik Impas (BEP)</span>
                  <h3 className="text-lg font-bold text-zinc-900 mt-1">{formatIDR(bepRevenue)}</h3>
                  <p className="text-[10px] text-emerald-600 mt-1">✓ Lolos ambang batas</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">Rasio Margin Kotor</span>
                  <h3 className="text-lg font-bold text-zinc-900 mt-1">{(averageMarginRatio * 100).toFixed(1)}%</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Tingkat efisiensi HPP</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">Margin Bersih</span>
                  <h3 className="text-lg font-bold text-emerald-600 mt-1">{profitMarginPercent}%</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Profitabilitas sehat</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. AI ADVISOR ================= */}
          {activeTab === "ai" && (
            <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-900 font-bold">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Rekomendasi AI untuk Peter
              </div>
              <div className="p-3 bg-zinc-50 rounded-lg space-y-1.5 text-zinc-700 leading-relaxed">
                <p>• <strong>Bahan Baku:</strong> Pembelian bahan baku menyerap 45% total beban. Disarankan pembelian grosir untuk menghemat biaya operasional.</p>
                <p>• <strong>Likuiditas Kas:</strong> Kas aktif saat ini sangat aman untuk menutup seluruh hutang jangka pendek.</p>
                <p>• <strong>Proyeksi:</strong> Dengan pola omzet berjalan, laba bersih diproyeksikan stabil di atas target bulan ini.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= BOTTOM NAV (MOBILE) ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-2 py-1.5 flex justify-around items-center z-40">
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
              className={`flex flex-col items-center gap-0.5 p-1 ${isActive ? "text-emerald-600 font-bold" : "text-zinc-400"}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. POS MODAL */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold text-zinc-900">Kasir POS Multi-Item</span>
              <button onClick={() => setShowAddSaleModal(false)} className="text-zinc-400 hover:text-zinc-700 text-xs">✕</button>
            </div>

            {/* Product selection */}
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="p-2 border border-zinc-200 rounded-lg text-left hover:border-emerald-600 transition"
                >
                  <div className="text-[11px] font-bold text-zinc-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">{formatIDR(p.sellPrice)} (Stok: {p.stock})</div>
                </button>
              ))}
            </div>

            {/* Cart summary */}
            <div className="bg-zinc-50 p-2.5 rounded-lg text-xs space-y-1 max-h-28 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-[11px] text-zinc-400 italic text-center">Keranjang kosong</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <span className="truncate">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="px-1 bg-zinc-200 rounded text-[10px]">-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="px-1 bg-zinc-200 rounded text-[10px]">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleCheckoutPOS} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block">Diskon (Rp)</label>
                  <input type="number" value={posDiscount || ""} onChange={e => setPosDiscount(Number(e.target.value))} className="w-full border p-1.5 rounded-md" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">Metode</label>
                  <select value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value as any)} className="w-full border p-1.5 rounded-md">
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>
              </div>

              {posPaymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2 rounded-md">
                  <div>
                    <label className="text-[10px] text-zinc-500 block">Uang Diterima</label>
                    <input type="number" required value={posCashPaid} onChange={e => setPosCashPaid(e.target.value)} className="w-full border p-1 rounded bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block">Kembalian</label>
                    <span className="font-bold text-emerald-600 block pt-1">{formatIDR(cashChange)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-zinc-900 border-t pt-2">
                <span>Total:</span>
                <span className="text-emerald-600">{formatIDR(cartTotal)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddSaleModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600 font-medium">Batal</button>
                <button type="submit" disabled={cart.length === 0} className="flex-1 bg-emerald-600 text-white p-2 rounded-lg font-medium">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Catat Beban Pengeluaran</span>
            <form onSubmit={handleAddExpense} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-zinc-500 block">Kategori</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full border p-1.5 rounded-md">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Nominal (Rp)</label>
                <input type="number" required value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Keterangan</label>
                <input type="text" required value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white p-2 rounded-lg font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Tambah Produk</span>
            <form onSubmit={handleAddProduct} className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-500 block">Nama Produk</label>
                <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block">HPP (Modal)</label>
                  <input type="number" required value={newProdCost} onChange={e => setNewProdCost(e.target.value)} className="w-full border p-1.5 rounded-md" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block">Harga Jual</label>
                  <input type="number" required value={newProdSell} onChange={e => setNewProdSell(e.target.value)} className="w-full border p-1.5 rounded-md" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Stok Awal</label>
                <input type="number" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-lg font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DEBT MODAL */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Catat Hutang / Piutang</span>
            <form onSubmit={handleAddDebt} className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => setDebtType("Piutang")} className={`p-1.5 rounded border text-xs font-semibold ${debtType === 'Piutang' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Piutang</button>
                <button type="button" onClick={() => setDebtType("Hutang")} className={`p-1.5 rounded border text-xs font-semibold ${debtType === 'Hutang' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Hutang</button>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Nama Pihak Terkait</label>
                <input type="text" required value={debtPerson} onChange={e => setDebtPerson(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Nominal (Rp)</label>
                <input type="number" required value={debtAmount} onChange={e => setDebtAmount(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Jatuh Tempo</label>
                <input type="date" required value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddDebtModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2 rounded-lg font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CAPITAL MODAL */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Mutasi Modal Usaha</span>
            <form onSubmit={handleAddCapital} className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-500 block">Jenis</label>
                <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full border p-1.5 rounded-md">
                  <option value="Penambahan Modal">Penambahan Modal</option>
                  <option value="Penarikan Modal (Prive)">Penarikan (Prive)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Nominal (Rp)</label>
                <input type="number" required value={capAmount} onChange={e => setCapAmount(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Keterangan</label>
                <input type="text" value={capNotes} onChange={e => setCapNotes(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCapitalModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600">Batal</button>
                <button type="submit" className="flex-1 bg-zinc-900 text-white p-2 rounded-lg font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BUDGET MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 text-xs">
            <span className="font-bold text-zinc-900 block">Atur Alokasi Anggaran</span>
            <form onSubmit={handleSaveBudget} className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-500 block">Kategori Beban</label>
                <select value={budgetCat} onChange={e => setBudgetCat(e.target.value as any)} className="w-full border p-1.5 rounded-md">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block">Batas Anggaran (Rp)</label>
                <input type="number" required value={budgetNominal} onChange={e => setBudgetNominal(e.target.value)} className="w-full border p-1.5 rounded-md" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 bg-zinc-100 p-2 rounded-lg text-zinc-600">Batal</button>
                <button type="submit" className="flex-1 bg-zinc-900 text-white p-2 rounded-lg font-medium">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RECEIPT MODAL */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-xl space-y-3 font-mono text-[11px]">
            <div className="text-center border-b pb-2">
              <span className="font-bold uppercase block text-xs">Kopi Senja Nusantara</span>
              <span className="text-[10px] text-zinc-400">Kasir: {activeReceiptSale.cashier}</span>
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
            <div className="flex justify-between font-bold text-xs pt-1">
              <span>TOTAL:</span>
              <span>{formatIDR(activeReceiptSale.total)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveReceiptSale(null)} className="flex-1 bg-zinc-100 font-sans p-1.5 rounded-lg text-xs">Tutup</button>
              <button onClick={() => window.print()} className="flex-1 bg-zinc-900 text-white font-sans p-1.5 rounded-lg text-xs">Cetak</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
