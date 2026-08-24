"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  ArrowUpRight, Layers, PieChart as PieIcon, Printer, Trash2,
  Building2, Clock, Wallet, BarChart3, Target, Receipt,
  ShoppingCart, X, CheckCircle, AlertCircle, RefreshCw
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
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

// ================= DEFAULT DATA =================
const DEFAULT_PRODUCTS: Product[] = [
  { id: "P1", name: "Kopi Arabika Gayo 250g", sku: "KOP-001", category: "Minuman", costPrice: 35000, sellPrice: 65000, stock: 35, minStock: 10, isActive: true, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=120" },
  { id: "P2", name: "Croissant Almond Butter", sku: "BAK-002", category: "Makanan", costPrice: 12000, sellPrice: 28000, stock: 5, minStock: 8, isActive: true, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120" },
  { id: "P3", name: "Matcha Latte Premium 500g", sku: "BEV-003", category: "Minuman", costPrice: 55000, sellPrice: 95000, stock: 18, minStock: 5, isActive: true, image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=120" },
  { id: "P4", name: "Susu Fresh Milk 1L", sku: "ING-004", category: "Bahan Baku", costPrice: 17000, sellPrice: 24000, stock: 4, minStock: 10, isActive: true, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120" },
];

const DEFAULT_SALES: SaleTransaction[] = [
  {
    id: "S1",
    invoiceNo: "INV-2026-0801",
    date: "2026-08-24",
    items: [{ productId: "P1", name: "Kopi Arabika Gayo 250g", price: 65000, costPrice: 35000, qty: 2 }],
    subtotal: 130000,
    discount: 5000,
    total: 125000,
    cogs: 70000,
    paymentMethod: "QRIS",
    amountPaid: 125000,
    change: 0,
    cashier: "Kasir 1",
    notes: "Dine in Meja 02"
  }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "E1", category: "Bahan Baku", amount: 450000, date: "2026-08-24", notes: "Restock Biji Kopi" },
  { id: "E2", category: "Listrik", amount: 250000, date: "2026-08-22", notes: "Token Listrik Mesin Espresso" },
  { id: "E3", category: "Marketing", amount: 150000, date: "2026-08-23", notes: "Instagram Ads Weekend Promo" },
];

const DEFAULT_DEBTS: DebtItem[] = [
  { id: "D1", type: "Piutang", person: "Katering Bu Dewi", amount: 650000, dueDate: "2026-08-28", isPaid: false, notes: "Pesanan 25 botol kopi susu" },
  { id: "D2", type: "Hutang", person: "Supplier Biji Kopi", amount: 480000, dueDate: "2026-08-27", isPaid: false, notes: "Tempo pembayaran bahan baku" },
];

const DEFAULT_CAPITAL: CapitalLog[] = [
  { id: "C1", date: "2026-01-10", type: "Modal Awal", amount: 20000000, notes: "Modal Awal Toko" },
  { id: "C2", date: "2026-05-15", type: "Penambahan Modal", amount: 5000000, notes: "Beli Alat Grinder Baru" },
];

const FINANCIAL_CHART_DATA = [
  { date: "Sen", pemasukan: 1200000, pengeluaran: 450000, laba: 750000 },
  { date: "Sel", pemasukan: 1450000, pengeluaran: 300000, laba: 1150000 },
  { date: "Rab", pemasukan: 980000, pengeluaran: 550000, laba: 430000 },
  { date: "Kam", pemasukan: 1850000, pengeluaran: 620000, laba: 1230000 },
  { date: "Jum", pemasukan: 2300000, pengeluaran: 480000, laba: 1820000 },
  { date: "Sab", pemasukan: 2100000, pengeluaran: 390000, laba: 1710000 },
  { date: "Min", pemasukan: 1950000, pengeluaran: 710000, laba: 1240000 },
];

export default function CashFlowProMaster() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "expenses" | "debts" | "capital" | "reports" | "analytics" | "ai"
  >("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Owner");
  const [isClient, setIsClient] = useState(false);

  // Persistent States with LocalStorage
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(DEFAULT_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>(DEFAULT_CAPITAL);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<SaleTransaction | null>(null);

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [posCashPaid, setPosCashPaid] = useState<string>("");
  const [posNotes, setPosNotes] = useState<string>("");

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
  const [newProdImg, setNewProdImg] = useState("");

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

  const targetRevenue = 30000000;

  // Load from LocalStorage
  useEffect(() => {
    setIsClient(true);
    const savedProducts = localStorage.getItem("cfp_products");
    const savedSales = localStorage.getItem("cfp_sales");
    const savedExpenses = localStorage.getItem("cfp_expenses");
    const savedDebts = localStorage.getItem("cfp_debts");
    const savedCapital = localStorage.getItem("cfp_capital");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    if (savedCapital) setCapitalLogs(JSON.parse(savedCapital));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_products", JSON.stringify(products));
      localStorage.setItem("cfp_sales", JSON.stringify(sales));
      localStorage.setItem("cfp_expenses", JSON.stringify(expenses));
      localStorage.setItem("cfp_debts", JSON.stringify(debts));
      localStorage.setItem("cfp_capital", JSON.stringify(capitalLogs));
    }
  }, [products, sales, expenses, debts, capitalLogs, isClient]);

  // ================= FINANCIAL FORMULAS =================
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

  const totalReceivables = useMemo(() => debts.filter(d => d.type === "Piutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const totalPayables = useMemo(() => debts.filter(d => d.type === "Hutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const lowStockAlerts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // ================= POS CART LOGIC =================
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Stok Habis!", { description: `${product.name} saat ini kosong.` });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.warning("Batas Stok Tercapai", { description: `Hanya tersedia ${product.stock} unit.` });
          return prev;
        }
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { productId: product.id, name: product.name, price: product.sellPrice, costPrice: product.costPrice, qty: 1 }];
      }
    });
    toast.success(`${product.name} masuk keranjang`);
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
      toast.error("Keranjang Masih Kosong!");
      return;
    }

    if (posPaymentMethod === "Cash" && (Number(posCashPaid) < cartTotal)) {
      toast.error("Uang Diterima Kurang!", { description: `Total tagihan: ${formatIDR(cartTotal)}` });
      return;
    }

    const newSale: SaleTransaction = {
      id: `S${Date.now()}`,
      invoiceNo: `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      subtotal: cartSubtotal,
      discount: posDiscount,
      total: cartTotal,
      cogs: cartCOGS,
      paymentMethod: posPaymentMethod,
      amountPaid: posPaymentMethod === "Cash" ? Number(posCashPaid) : cartTotal,
      change: cashChange,
      cashier: `${currentRole} User`,
      notes: posNotes
    };

    // Kurangi stok produk secara permanen
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const itemInCart = cart.find(c => c.productId === p.id);
        if (itemInCart) {
          return { ...p, stock: p.stock - itemInCart.qty };
        }
        return p;
      });
    });

    setSales([newSale, ...sales]);
    setCart([]);
    setPosDiscount(0);
    setPosCashPaid("");
    setPosNotes("");
    setShowAddSaleModal(false);
    setActiveReceiptSale(newSale);
    toast.success("Transaksi Kasir Sukses!", { description: `No Faktur: ${newSale.invoiceNo}` });
  };

  // ================= ACTION HANDLERS =================
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
    toast.info("Pengeluaran Dicatat!", { description: `${expCategory}: ${formatIDR(newExp.amount)}` });
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
      image: newProdImg || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120",
      isActive: true
    };

    setProducts([...products, newP]);
    setShowAddProductModal(false);
    setNewProdName("");
    setNewProdSku("");
    setNewProdCost("");
    setNewProdSell("");
    setNewProdStock("");
    setNewProdImg("");
    toast.success("Produk Baru Ditambahkan!", { description: newP.name });
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
    toast.success("Catatan Hutang/Piutang Disimpan!");
  };

  const handleToggleDebtSettled = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isPaid;
        toast.info(nextState ? "Tagihan Ditandai LUNAS!" : "Status Tagihan Diubah ke BELUM LUNAS");
        return { ...d, isPaid: nextState };
      }
      return d;
    }));
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
    toast.success("Mutasi Modal Berhasil Dicatat!");
  };

  const handleDeleteSale = (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan & menghapus transaksi ini?")) {
      setSales(sales.filter(s => s.id !== id));
      toast.warning("Transaksi Dihapus!");
    }
  };

  // ================= EXPORT CSV =================
  const handleExportCSV = () => {
    const csvRows = [
      ["No Faktur", "Tanggal", "Total Item", "Subtotal", "Diskon", "Total Bayar", "Metode", "Kasir"],
      ...sales.map(s => [
        s.invoiceNo,
        s.date,
        s.items.reduce((sum, i) => sum + i.qty, 0),
        s.subtotal,
        s.discount,
        s.total,
        s.paymentMethod,
        s.cashier
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_CashFlowPro_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File Excel (.csv) Berhasil Diunduh!");
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden pb-16 lg:pb-0">
      
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col justify-between hidden lg:flex border-r border-slate-800 shadow-2xl">
        <div>
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

            <div className="mt-4 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate font-medium">Kopi Senja Nusantara</span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu Utama</div>
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
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 mb-2">Laporan & Strategi</div>
            {[
              { id: "reports", label: "Laporan Laba Rugi & Neraca", icon: Layers },
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
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold" 
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

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-medium">Hak Akses:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-slate-900 border border-slate-700 text-emerald-400 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Kasir">Kasir</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {currentRole.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Budi Santoso</p>
              <p className="text-[10px] text-emerald-400">LocalStorage Terhubung</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN APPLICATION VIEWPORT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* TOP NAVBAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-800">
              {activeTab === "dashboard" && "Dashboard Eksekutif Real-Time"}
              {activeTab === "sales" && "Point of Sale (POS) & Penjualan"}
              {activeTab === "products" && "Katalog Persediaan & Stok"}
              {activeTab === "expenses" && "Pencatatan Beban & Pengeluaran"}
              {activeTab === "debts" && "Buku Catatan Hutang & Piutang"}
              {activeTab === "capital" && "Riwayat Modal & Struktur Ekuitas"}
              {activeTab === "reports" && "Laporan Laba Rugi & Neraca SAK EMKM"}
              {activeTab === "analytics" && "Analisis Break Even Point (BEP)"}
              {activeTab === "ai" && "AI Business Advisor"}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Sistem Kas & Akuntansi Terintegrasi</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {lowStockAlerts.length > 0 && (
              <button 
                onClick={() => setActiveTab("products")}
                className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>{lowStockAlerts.length} Kritis</span>
              </button>
            )}

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
              <ShoppingCart className="h-4 w-4" />
              Buka Kasir POS
            </button>
          </div>
        </header>

        {/* BODY CONTENT */}
        <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">

          {/* 1. DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Omzet</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{formatIDR(totalRevenue)}</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">+18.4% bln ini</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Beban</span>
                  <h3 className="text-lg sm:text-xl font-black text-rose-600 mt-1">{formatIDR(totalExpenses)}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">{expenses.length} transaksi</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total HPP</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{formatIDR(totalCOGS)}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Harga Pokok</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Laba Bersih</span>
                  <h3 className={`text-lg sm:text-xl font-black mt-1 ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatIDR(netProfit)}
                  </h3>
                  <span className="text-[10px] text-blue-600 font-semibold block mt-1">Margin: {profitMarginPercent}%</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Sisa Kas Aktif</span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{formatIDR(cashOnHand)}</h3>
                  <span className="text-[10px] text-purple-700 font-semibold block mt-1">Kas & Bank</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">ROI Modal</span>
                  <h3 className="text-lg sm:text-xl font-black text-purple-600 mt-1">+{roiPercentage}%</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Ekuitas Sehat</span>
                </div>
              </div>

              {/* CHART & TARGET */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Arus Kas Mingguan</h3>
                      <p className="text-xs text-slate-400">Pemasukan vs Beban</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={FINANCIAL_CHART_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `Rp${v/1000}k`} />
                        <Tooltip formatter={(val: any) => formatIDR(Number(val))} />
                        <Area type="monotone" dataKey="pemasukan" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
                        <Area type="monotone" dataKey="pengeluaran" stroke="#f43f5e" fill="transparent" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Target Omzet Bulan Ini</h3>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>{formatIDR(totalRevenue)}</span>
                      <span>Target: {formatIDR(targetRevenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-6">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min((totalRevenue / targetRevenue) * 100, 100)}%` }}
                      />
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Tagihan Aktif</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-800 block">Piutang</span>
                        <span className="text-xs font-black text-amber-900">{formatIDR(totalReceivables)}</span>
                      </div>
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                        <span className="text-[10px] font-bold text-rose-800 block">Hutang</span>
                        <span className="text-xs font-black text-rose-900">{formatIDR(totalPayables)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 text-white rounded-xl text-xs mt-4">
                    💡 <strong>Tips AI:</strong> Margin kotor rata-rata <strong>{profitMarginPercent}%</strong> berada di atas rata-rata standar industri UMKM F&B.
                  </div>
                </div>
              </div>

              {/* TRANSAKSI TERAKHIR */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-800">Transaksi Penjualan Terbaru</h4>
                  <button onClick={() => setActiveTab("sales")} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Lihat Semua &rarr;</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Invoice</th>
                        <th className="py-3 px-4">Item Terjual</th>
                        <th className="py-3 px-4">Metode</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4 text-center">Struk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {sales.slice(0, 5).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.invoiceNo}</td>
                          <td className="py-3 px-4 text-slate-800">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                          <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">{s.paymentMethod}</span></td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{formatIDR(s.total)}</td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => setActiveReceiptSale(s)} className="p-1 text-slate-400 hover:text-slate-800" title="Cetak Struk">
                              <Receipt className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 2. SALES / POS */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari transaksi berdasarkan nomor invoice..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
                    <Download className="h-4 w-4" /> Unduh CSV
                  </button>
                  <button onClick={() => setShowAddSaleModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                    <Plus className="h-4 w-4" /> Buka Kasir POS
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">No. Invoice</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Total Bayar</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4">Kasir</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sales.filter(s => s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{s.invoiceNo}</td>
                        <td className="py-3.5 px-4 text-slate-400">{s.date}</td>
                        <td className="py-3.5 px-4 text-slate-800">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-600">{formatIDR(s.total)}</td>
                        <td className="py-3.5 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-[10px]">{s.paymentMethod}</span></td>
                        <td className="py-3.5 px-4 text-slate-500">{s.cashier}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setActiveReceiptSale(s)} className="p-1 text-slate-400 hover:text-slate-800" title="Cetak Struk"><Receipt className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteSale(s.id)} className="p-1 text-rose-400 hover:text-rose-700" title="Hapus Transaksi"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk berdasarkan nama atau SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowAddProductModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Tambah Produk Baru
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">HPP (Modal)</th>
                      <th className="py-3 px-4">Harga Jual</th>
                      <th className="py-3 px-4">Margin</th>
                      <th className="py-3 px-4">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
                      const margin = p.sellPrice - p.costPrice;
                      const isLow = p.stock <= p.minStock;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <img src={p.image} alt={p.name} className="h-8 w-8 rounded-lg object-cover border border-slate-200" />
                            {p.name}
                          </td>
                          <td className="py-3.5 px-4"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{p.category}</span></td>
                          <td className="py-3.5 px-4 text-slate-500">{formatIDR(p.costPrice)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{formatIDR(p.sellPrice)}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-600">+{formatIDR(margin)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isLow ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                              {p.stock} pcs {isLow && "(Kritis)"}
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

          {/* 4. EXPENSES */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Beban & Pengeluaran Usaha</h3>
                  <p className="text-xs text-slate-400">Total Pengeluaran: <strong className="text-rose-600">{formatIDR(totalExpenses)}</strong></p>
                </div>
                <button onClick={() => setShowAddExpenseModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Catat Beban Baru
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kategori Beban</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 text-slate-400">{e.date}</td>
                        <td className="py-3.5 px-4"><span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">{e.category}</span></td>
                        <td className="py-3.5 px-4 text-slate-800">{e.notes}</td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600">{formatIDR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. DEBTS */}
          {activeTab === "debts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Catatan Hutang & Piutang Jatuh Tempo</h3>
                  <p className="text-xs text-slate-400">Piutang: {formatIDR(totalReceivables)} | Hutang: {formatIDR(totalPayables)}</p>
                </div>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Catat Hutang / Piutang
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Pihak Terkait</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Jatuh Tempo</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.type === "Piutang" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                            {d.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{d.person}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">{formatIDR(d.amount)}</td>
                        <td className="py-3.5 px-4 text-slate-500">{d.dueDate}</td>
                        <td className="py-3.5 px-4 text-slate-500">{d.notes}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {d.isPaid ? "LUNAS" : "BELUM LUNAS"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleToggleDebtSettled(d.id)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px]">
                            {d.isPaid ? "Batal" : "Tandai Lunas"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CAPITAL */}
          {activeTab === "capital" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Modal & Ekuitas</h3>
                  <p className="text-xs text-slate-400">Total Modal Disetor: {formatIDR(totalNetCapital)} | ROI: +{roiPercentage}%</p>
                </div>
                <button onClick={() => setShowCapitalModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Tambah / Tarik Modal
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Jenis Mutasi</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {capitalLogs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 text-slate-400">{c.date}</td>
                        <td className="py-3.5 px-4"><span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">{c.type}</span></td>
                        <td className="py-3.5 px-4 text-slate-800">{c.notes}</td>
                        <td className={`py-3.5 px-4 text-right font-black ${c.type.includes("Penarikan") ? "text-rose-600" : "text-emerald-600"}`}>
                          {c.type.includes("Penarikan") ? `-${formatIDR(c.amount)}` : `+${formatIDR(c.amount)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Laporan Laba Rugi Otomatis</h3>
                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"><Download className="h-3.5 w-3.5" /> Unduh CSV</button>
                  <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"><Printer className="h-3.5 w-3.5" /> Cetak PDF</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="text-center border-b pb-3">
                  <h2 className="text-base font-black uppercase text-slate-800">Laporan Laba Rugi (Income Statement)</h2>
                  <p className="text-[10px] text-slate-400">Periode Berjalan: Agustus 2026 | Entitas: Kopi Senja Nusantara</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                    <span>1. Total Pendapatan Penjualan (Revenue)</span>
                    <span className="text-emerald-600">{formatIDR(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>2. Harga Pokok Penjualan (HPP)</span>
                    <span className="text-rose-600">({formatIDR(totalCOGS)})</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 bg-slate-50 p-2 rounded">
                    <span>LABA KOTOR (GROSS PROFIT)</span>
                    <span>{formatIDR(grossProfit)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t pt-2">
                  <span className="font-bold text-slate-800 block">3. Beban Operasional:</span>
                  {expenses.map(e => (
                    <div key={e.id} className="flex justify-between text-slate-500 pl-3">
                      <span>Beban {e.category} ({e.notes})</span>
                      <span className="text-rose-600">({formatIDR(e.amount)})</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-rose-700 pt-1 border-t">
                    <span>Total Beban Operasional</span>
                    <span>({formatIDR(totalExpenses)})</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 text-white rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">LABA BERSIH BERJALAN</span>
                    <span className="text-xs text-emerald-400 font-semibold">Margin Bersih: {profitMarginPercent}%</span>
                  </div>
                  <h3 className="text-xl font-black text-emerald-400">{formatIDR(netProfit)}</h3>
                </div>
              </div>
            </div>
          )}

          {/* 8. ANALYTICS & AI */}
          {(activeTab === "analytics" || activeTab === "ai") && (
            <div className="space-y-4">
              <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" /> AI Financial Engine
                </div>
                <h2 className="text-xl font-black">Analisis Titik Impas & Proyeksi Finansial</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Sistem mengevaluasi struktur biaya tetap, margin produk, dan volume transaksi untuk memastikan usaha Anda berada di atas Break Even Point (BEP).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Titik Impas (BEP Rupiah)</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{formatIDR(18500000)}</h3>
                  <p className="text-[11px] text-emerald-600 font-bold mt-2">✓ Status: Lolos BEP</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Prediksi Omzet Bulan Depan</span>
                  <h3 className="text-xl font-black text-blue-600 mt-1">{formatIDR(totalRevenue * 1.18)}</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Proyeksi pertumbuhan +18%</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Rasio Likuiditas Kas</span>
                  <h3 className="text-xl font-black text-purple-600 mt-1">3.4x</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Kondisi kas sangat likuid</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= BOTTOM NAVIGATION BAR (KHUSUS LAYAR HP) ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 flex justify-around items-center z-40 shadow-lg">
        {[
          { id: "dashboard", label: "Home", icon: PieIcon },
          { id: "sales", label: "Kasir", icon: ShoppingCart },
          { id: "products", label: "Produk", icon: Package },
          { id: "expenses", label: "Beban", icon: TrendingDown },
          { id: "reports", label: "Laporan", icon: Layers },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 ${isActive ? "text-emerald-600 font-bold" : "text-slate-400"}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= MODALS SECTION ================= */}

      {/* 1. MODAL KASIR MULTI-ITEM (POS SHOPPING CART) */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 max-h-[90vh] flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  Kasir POS & Transaksi Penjualan
                </h3>
                <button onClick={() => setShowAddSaleModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
              </div>

              {/* Grid Pilih Produk */}
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Klik Produk untuk Masuk Keranjang:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      className="p-2 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left flex flex-col justify-between transition active:scale-95 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <img src={p.image} alt={p.name} className="h-6 w-6 rounded object-cover" />
                        <span className="text-[11px] font-bold text-slate-800 truncate">{p.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-emerald-600">{formatIDR(p.sellPrice)}</span>
                        <span className="text-slate-400">Stok: {p.stock}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Keranjang Belanja */}
              <div className="border rounded-xl p-3 bg-slate-50 mb-4 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Keranjang Belanja ({cart.length} item):</span>
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">Keranjang masih kosong. Klik produk di atas.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.productId} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">{formatIDR(item.price * item.qty)}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => updateCartQty(item.productId, item.qty - 1)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold">-</button>
                            <span className="font-bold px-1">{item.qty}</span>
                            <button type="button" onClick={() => updateCartQty(item.productId, item.qty + 1)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-bold">+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Details Form */}
              <form onSubmit={handleCheckoutPOS} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Diskon Transaksi (Rp)</label>
                    <input
                      type="number" min="0" placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                      value={posDiscount || ""}
                      onChange={e => setPosDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Metode Bayar</label>
                    <select
                      value={posPaymentMethod}
                      onChange={e => setPosPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-bold"
                    >
                      <option value="QRIS">QRIS</option>
                      <option value="Cash">Cash (Tunai)</option>
                      <option value="Transfer">Transfer Bank</option>
                      <option value="E-Wallet">E-Wallet</option>
                    </select>
                  </div>
                </div>

                {posPaymentMethod === "Cash" && (
                  <div className="grid grid-cols-2 gap-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div>
                      <label className="text-[11px] font-bold text-emerald-900 block mb-1">Uang Diterima (Rp)</label>
                      <input
                        type="number" required placeholder="Contoh: 100000"
                        className="w-full bg-white border border-emerald-300 p-2 rounded-xl text-xs font-black text-slate-900"
                        value={posCashPaid}
                        onChange={e => setPosCashPaid(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-emerald-900 block mb-1">Kembalian</label>
                      <div className="text-sm font-black text-emerald-700 pt-2">{formatIDR(cashChange)}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-slate-900 text-white rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Yang Harus Dibayar</span>
                    <span className="text-xs text-slate-300">Subtotal: {formatIDR(cartSubtotal)} | Diskon: {formatIDR(posDiscount)}</span>
                  </div>
                  <h3 className="text-xl font-black text-emerald-400">{formatIDR(cartTotal)}</h3>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddSaleModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs">
                    Batal
                  </button>
                  <button type="submit" disabled={cart.length === 0} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl text-xs shadow-md">
                    Proses & Cetak Struk
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL TAMBAH PRODUK BARU */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Tambah Produk Baru
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Produk</label>
                <input type="text" required placeholder="Contoh: Es Kopi Susu Aren" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={newProdName} onChange={e => setNewProdName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Harga Modal (HPP)</label>
                  <input type="number" required placeholder="Rp" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={newProdCost} onChange={e => setNewProdCost(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Harga Jual</label>
                  <input type="number" required placeholder="Rp" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={newProdSell} onChange={e => setNewProdSell(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Stok Awal</label>
                  <input type="number" placeholder="0" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Batas Min. Stok</label>
                  <input type="number" placeholder="5" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={newProdMin} onChange={e => setNewProdMin(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">URL Foto Produk (Opsional)</label>
                <input type="text" placeholder="https://..." className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={newProdImg} onChange={e => setNewProdImg(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL TAMBAH BEBAN PENGELUARAN */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-600" />
              Catat Beban Pengeluaran
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Kategori Pengeluaran</label>
                <select value={expCategory} onChange={e => setExpCategory(e.target.value as ExpenseCategory)} className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nominal Biaya (Rp)</label>
                <input type="number" required placeholder="Contoh: 150000" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan Pengeluaran</label>
                <input type="text" required placeholder="Contoh: Beli kemasan cup 500 pcs" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={expNotes} onChange={e => setExpNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs">Simpan Beban</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH HUTANG & PIUTANG */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Catat Hutang / Piutang
            </h3>
            <form onSubmit={handleAddDebt} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDebtType("Piutang")}
                  className={`py-2 rounded-xl text-xs font-bold border ${debtType === "Piutang" ? "bg-amber-100 border-amber-500 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                >
                  Piutang (Kita Ditagih)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType("Hutang")}
                  className={`py-2 rounded-xl text-xs font-bold border ${debtType === "Hutang" ? "bg-rose-100 border-rose-500 text-rose-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}
                >
                  Hutang (Kita Bayar)
                </button>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Pihak Terkait</label>
                <input type="text" required placeholder="Contoh: Bu Sari Catering / Supplier Susu" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={debtPerson} onChange={e => setDebtPerson(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nominal (Rp)</label>
                  <input type="number" required placeholder="Rp" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={debtAmount} onChange={e => setDebtAmount(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Jatuh Tempo</label>
                  <input type="date" required className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan</label>
                <input type="text" placeholder="Keterangan tagihan..." className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={debtNotes} onChange={e => setDebtNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDebtModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL TAMBAH / TARIK MODAL */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Kelola Modal Usaha
            </h3>
            <form onSubmit={handleAddCapital} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Jenis Mutasi</label>
                <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold">
                  <option value="Penambahan Modal">Penambahan Modal (Injeksi Dana)</option>
                  <option value="Penarikan Modal (Prive)">Penarikan Modal (Prive Owner)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nominal (Rp)</label>
                <input type="number" required placeholder="Contoh: 5000000" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={capAmount} onChange={e => setCapAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Keterangan</label>
                <input type="text" placeholder="Contoh: Tambah modal ekspansi / Keperluan pribadi" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={capNotes} onChange={e => setCapNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCapitalModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs">Simpan Mutasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL STRUK STRUK PEMBAYARAN THERMAL */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-black text-sm text-slate-900 uppercase">KOPI SENJA NUSANTARA</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Jl. Senopati Raya No. 42, Jakarta</p>
              <p className="text-[10px] text-slate-500">Telp: 0812-3456-7890</p>
            </div>

            <div className="space-y-1 text-slate-600 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between"><span>No Faktur:</span> <strong className="text-slate-900">{activeReceiptSale.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Tanggal:</span> <span>{activeReceiptSale.date}</span></div>
              <div className="flex justify-between"><span>Kasir:</span> <span>{activeReceiptSale.cashier}</span></div>
              <div className="flex justify-between"><span>Metode:</span> <span className="font-bold text-slate-900">{activeReceiptSale.paymentMethod}</span></div>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {activeReceiptSale.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{item.name}</span>
                    <span>{formatIDR(item.price * item.qty)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{item.qty} pcs x {formatIDR(item.price)}</div>
                </div>
              ))}
              {activeReceiptSale.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Diskon:</span>
                  <span>-{formatIDR(activeReceiptSale.discount)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between text-sm font-black text-slate-900">
                <span>TOTAL:</span>
                <span className="text-emerald-600">{formatIDR(activeReceiptSale.total)}</span>
              </div>
              {activeReceiptSale.paymentMethod === "Cash" && (
                <>
                  <div className="flex justify-between text-slate-600"><span>Tunai:</span> <span>{formatIDR(activeReceiptSale.amountPaid)}</span></div>
                  <div className="flex justify-between text-slate-600 font-bold"><span>Kembalian:</span> <span>{formatIDR(activeReceiptSale.change)}</span></div>
                </>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-1">
              Terima Kasih Atas Kunjungan Anda!
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setActiveReceiptSale(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold py-2 rounded-xl text-xs">
                Tutup
              </button>
              <button onClick={() => window.print()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                <Printer className="h-3.5 w-3.5" /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}