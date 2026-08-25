"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  ArrowUpRight, Layers, PieChart as PieIcon, Printer, Trash2,
  Building2, Clock, Wallet, BarChart3, Target, Receipt,
  ShoppingCart, X, CheckCircle2, AlertCircle, MessageCircle,
  Scale, Edit3
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
  { id: "P1", name: "Kopi Arabika Gayo 250g", sku: "KOP-001", category: "Minuman", costPrice: 35000, sellPrice: 65000, stock: 35, minStock: 10, isActive: true, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=120" },
  { id: "P2", name: "Croissant Almond Butter", sku: "BAK-002", category: "Makanan", costPrice: 12000, sellPrice: 28000, stock: 4, minStock: 8, isActive: true, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120" },
  { id: "P3", name: "Matcha Latte Premium 500g", sku: "BEV-003", category: "Minuman", costPrice: 55000, sellPrice: 95000, stock: 18, minStock: 5, isActive: true, image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=120" },
  { id: "P4", name: "Susu Fresh Milk 1L", sku: "ING-004", category: "Bahan Baku", costPrice: 17000, sellPrice: 24000, stock: 3, minStock: 10, isActive: true, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120" },
];

const DEFAULT_SALES: SaleTransaction[] = [
  {
    id: "S1",
    invoiceNo: "INV-2026-0801",
    date: "2026-08-24",
    items: [{ productId: "P1", name: "Kopi Arabika Gayo 250g", price: 65000, costPrice: 35000, qty: 3 }],
    subtotal: 195000,
    discount: 5000,
    total: 190000,
    cogs: 105000,
    paymentMethod: "QRIS",
    amountPaid: 190000,
    change: 0,
    cashier: "Kasir 1",
    notes: "Dine in Meja 04"
  },
  {
    id: "S2",
    invoiceNo: "INV-2026-0802",
    date: "2026-08-24",
    items: [{ productId: "P2", name: "Croissant Almond Butter", price: 28000, costPrice: 12000, qty: 2 }],
    subtotal: 56000,
    discount: 0,
    total: 56000,
    cogs: 24000,
    paymentMethod: "Cash",
    amountPaid: 100000,
    change: 44000,
    cashier: "Kasir 1",
    notes: "Takeaway"
  }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "E1", category: "Bahan Baku", amount: 650000, date: "2026-08-24", notes: "Restock Biji Kopi Fresh 10kg" },
  { id: "E2", category: "Listrik", amount: 350000, date: "2026-08-21", notes: "Token Listrik Mesin Espresso" },
  { id: "E3", category: "Marketing", amount: 200000, date: "2026-08-22", notes: "Instagram Ads Promo Merdeka" },
  { id: "E4", category: "Gaji", amount: 2500000, date: "2026-08-01", notes: "Gaji Barista Utama" },
  { id: "E5", category: "Internet", amount: 275000, date: "2026-08-10", notes: "Wifi Toko IndiHome" },
];

const DEFAULT_DEBTS: DebtItem[] = [
  { id: "D1", type: "Piutang", person: "Katering Bu Dewi", phone: "628123456789", amount: 750000, dueDate: "2026-08-26", isPaid: false, notes: "Pesanan 30 botol Cold Brew" },
  { id: "D2", type: "Hutang", person: "Supplier Susu Segar Lembang", phone: "628987654321", amount: 480000, dueDate: "2026-08-25", isPaid: false, notes: "Pembayaran tempo 7 hari" },
  { id: "D3", type: "Piutang", person: "PT Maju Gemilang", phone: "628111222333", amount: 1500000, dueDate: "2026-08-20", isPaid: false, notes: "Coffee Break Event (Overdue)" },
];

const DEFAULT_CAPITAL: CapitalLog[] = [
  { id: "C1", date: "2026-01-10", type: "Modal Awal", amount: 25000000, notes: "Setoran Modal Pendirian Toko" },
  { id: "C2", date: "2026-05-15", type: "Penambahan Modal", amount: 5000000, notes: "Beli Alat Espresso Tambahan" },
  { id: "C3", date: "2026-07-20", type: "Penarikan Modal (Prive)", amount: 1500000, notes: "Keperluan Pribadi Owner" },
];

const DEFAULT_BUDGETS: CategoryBudget[] = [
  { category: "Bahan Baku", allocated: 3000000 },
  { category: "Marketing", allocated: 500000 },
  { category: "Gaji", allocated: 3000000 },
  { category: "Listrik", allocated: 500000 },
  { category: "Internet", allocated: 300000 },
  { category: "Sewa", allocated: 2000000 },
  { category: "Operasional Lain", allocated: 500000 },
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

export default function CashFlowProMaster() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "expenses" | "debts" | "capital" | "reports" | "budget" | "analytics" | "ai"
  >("dashboard");
  const [currentRole, setCurrentRole] = useState<Role>("Owner");
  const [reportSubTab, setReportSubTab] = useState<"labarugi" | "neraca" | "aruskas">("labarugi");
  const [debtFilter, setDebtFilter] = useState<"Semua" | "Belum Lunas" | "Lunas" | "Piutang" | "Hutang">("Semua");
  const [isClient, setIsClient] = useState(false);

  // Persistent States with LocalStorage
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [sales, setSales] = useState<SaleTransaction[]>(DEFAULT_SALES);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>(DEFAULT_CAPITAL);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(DEFAULT_BUDGETS);

  // Targets
  const [targetRevenue] = useState(30000000);
  const [targetProfit] = useState(12000000);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
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
  const [debtPhone, setDebtPhone] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Form States - Capital
  const [capType, setCapType] = useState<"Penambahan Modal" | "Penarikan Modal (Prive)">("Penambahan Modal");
  const [capAmount, setCapAmount] = useState("");
  const [capNotes, setCapNotes] = useState("");

  // Form States - Edit Budget
  const [budgetCat, setBudgetCat] = useState<ExpenseCategory>("Bahan Baku");
  const [budgetNominal, setBudgetNominal] = useState("");

  // AI Prompt State
  const [aiSelectedTopic, setAiSelectedTopic] = useState<string>("analisis_kebocoran");

  // Load from LocalStorage
  useEffect(() => {
    setIsClient(true);
    const savedProducts = localStorage.getItem("cfp_products_v2");
    const savedSales = localStorage.getItem("cfp_sales_v2");
    const savedExpenses = localStorage.getItem("cfp_expenses_v2");
    const savedDebts = localStorage.getItem("cfp_debts_v2");
    const savedCapital = localStorage.getItem("cfp_capital_v2");
    const savedBudgets = localStorage.getItem("cfp_budgets_v2");

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedDebts) setDebts(JSON.parse(savedDebts));
    if (savedCapital) setCapitalLogs(JSON.parse(savedCapital));
    if (savedBudgets) setCategoryBudgets(JSON.parse(savedBudgets));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_products_v2", JSON.stringify(products));
      localStorage.setItem("cfp_sales_v2", JSON.stringify(sales));
      localStorage.setItem("cfp_expenses_v2", JSON.stringify(expenses));
      localStorage.setItem("cfp_debts_v2", JSON.stringify(debts));
      localStorage.setItem("cfp_capital_v2", JSON.stringify(capitalLogs));
      localStorage.setItem("cfp_budgets_v2", JSON.stringify(categoryBudgets));
    }
  }, [products, sales, expenses, debts, capitalLogs, categoryBudgets, isClient]);

  // ================= FORMULA KEUANGAN MENDALAM =================
  const totalRevenue = useMemo(() => sales.reduce((acc, curr) => acc + curr.total, 0), [sales]);
  const totalCOGS = useMemo(() => sales.reduce((acc, curr) => acc + curr.cogs, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  const grossProfit = totalRevenue - totalCOGS; // Laba Kotor
  const netProfit = grossProfit - totalExpenses; // Laba Bersih

  // Modal Bersih Disetor
  const totalNetCapital = useMemo(() => {
    return capitalLogs.reduce((acc, curr) => {
      if (curr.type === "Penarikan Modal (Prive)") return acc - curr.amount;
      return acc + curr.amount;
    }, 0);
  }, [capitalLogs]);

  const cashOnHand = totalNetCapital + netProfit; // Kas Nyata Toko
  const roiPercentage = totalNetCapital > 0 ? ((netProfit / totalNetCapital) * 100).toFixed(1) : "0.0";
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Total Nilai Aset Stok
  const inventoryValue = useMemo(() => products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0), [products]);

  // Hutang & Piutang
  const totalReceivables = useMemo(() => debts.filter(d => d.type === "Piutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);
  const totalPayables = useMemo(() => debts.filter(d => d.type === "Hutang" && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0), [debts]);

  // Neraca Components (Balance Sheet)
  const totalAssets = cashOnHand + inventoryValue + totalReceivables;
  const totalLiabilities = totalPayables;
  const totalEquity = totalNetCapital + netProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanceSheetBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  // Breakdown Pengeluaran per Kategori
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  // Top Products by Revenue & Profit
  const productAnalytics = useMemo(() => {
    const stats: Record<string, { qty: number; revenue: number; profit: number }> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!stats[item.name]) stats[item.name] = { qty: 0, revenue: 0, profit: 0 };
        const itemRevenue = item.price * item.qty;
        const itemCOGS = item.costPrice * item.qty;
        stats[item.name].qty += item.qty;
        stats[item.name].revenue += itemRevenue;
        stats[item.name].profit += (itemRevenue - itemCOGS);
      });
    });
    return Object.entries(stats).map(([name, val]) => ({ name, ...val }));
  }, [sales]);

  // Break-Even Point (BEP) Calculations
  const averageMarginRatio = totalRevenue > 0 ? (grossProfit / totalRevenue) : 0.45;
  const bepRevenue = averageMarginRatio > 0 ? (totalExpenses / averageMarginRatio) : 0;

  // Estimasi Hari Capai Target Omzet
  const avgDailyRevenue = totalRevenue > 0 ? (totalRevenue / 24) : 0;
  const estimatedDaysToTarget = avgDailyRevenue > 0 ? Math.ceil(Math.max(0, targetRevenue - totalRevenue) / avgDailyRevenue) : 0;

  // Low Stock
  const lowStockAlerts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);

  // Format Rupiah
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // ================= POS CART LOGIC =================
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Stok Habis!", { description: `${product.name} kosong.` });
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

    // Potong stok
    setProducts(prev => prev.map(p => {
      const itemInCart = cart.find(c => c.productId === p.id);
      return itemInCart ? { ...p, stock: p.stock - itemInCart.qty } : p;
    }));

    setSales([newSale, ...sales]);
    setCart([]);
    setPosDiscount(0);
    setPosCashPaid("");
    setPosNotes("");
    setShowAddSaleModal(false);
    setActiveReceiptSale(newSale);
    toast.success("Transaksi Kasir Berhasil!", { description: `No Faktur: ${newSale.invoiceNo}` });
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
    toast.success("Produk Ditambahkan!", { description: newP.name });
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
    toast.success("Catatan Tagihan Disimpan!");
  };

  const handleToggleDebtSettled = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isPaid;
        toast.info(nextState ? "Tagihan Ditandai LUNAS! 🎉" : "Status Tagihan Diubah ke BELUM LUNAS");
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

  const handleDeleteCapital = (id: string) => {
    if (confirm("Hapus catatan mutasi modal ini?")) {
      setCapitalLogs(capitalLogs.filter(c => c.id !== id));
      toast.warning("Mutasi Modal Dihapus!");
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetNominal || Number(budgetNominal) <= 0) return;

    setCategoryBudgets(prev => {
      const existing = prev.find(b => b.category === budgetCat);
      if (existing) {
        return prev.map(b => b.category === budgetCat ? { ...b, allocated: Number(budgetNominal) } : b);
      }
      return [...prev, { category: budgetCat, allocated: Number(budgetNominal) }];
    });
    setShowBudgetModal(false);
    setBudgetNominal("");
    toast.success(`Anggaran ${budgetCat} Berhasil Diatur!`);
  };

  const handleDeleteSale = (id: string) => {
    if (confirm("Batalkan transaksi penjualan ini?")) {
      setSales(sales.filter(s => s.id !== id));
      toast.warning("Transaksi Dihapus!");
    }
  };

  // WhatsApp Reminder Link Generator
  const generateWhatsAppReminder = (debt: DebtItem) => {
    const cleanPhone = (debt.phone || "").replace(/[^0-9]/g, "");
    const message = `Halo ${debt.person}, ini pengingat ramah dari Kopi Senja Nusantara terkait tagihan ${debt.type} sebesar *${formatIDR(debt.amount)}* yang jatuh tempo pada *${debt.dueDate}* (${debt.notes}). Mohon konfirmasinya ya. Terima kasih!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone || ""}?text=${encoded}`, "_blank");
  };

  // Ekspor Excel CSV
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
    link.setAttribute("download", `Laporan_Keuangan_CashFlowPro_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File Excel (.csv) Berhasil Diunduh!");
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden pb-16 lg:pb-0">
      
      {/* ================= SIDEBAR NAVIGATION (DESKTOP) ================= */}
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
              { id: "products", label: "Inventori & Stok", icon: Package },
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
              { id: "reports", label: "Laporan Finansial (3-in-1)", icon: Layers },
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
              <p className="text-[10px] text-emerald-400">LocalStorage Aktif</p>
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
              {activeTab === "sales" && "Point of Sale (POS) & Kasir"}
              {activeTab === "products" && "Katalog Persediaan & Stok"}
              {activeTab === "expenses" && "Pencatatan Beban & Pengeluaran"}
              {activeTab === "debts" && "Buku Catatan Hutang & Piutang"}
              {activeTab === "capital" && "Riwayat Modal & Struktur Ekuitas"}
              {activeTab === "reports" && "Laporan Keuangan Resmi (Laba Rugi, Neraca, Arus Kas)"}
              {activeTab === "budget" && "Target Finansial & Anggaran Kategori"}
              {activeTab === "analytics" && "Analisis Break Even Point (BEP) & Kinerja Produk"}
              {activeTab === "ai" && "AI Financial Advisor & Business Strategy"}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Sistem Kas & Akuntansi Terintegrasi</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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

          {/* ================= 1. DASHBOARD ================= */}
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

              {/* DUAL CHARTS */}
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

                  <button 
                    onClick={() => setActiveTab("ai")}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Buka Rekomendasi AI
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= 2. SALES / POS ================= */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari transaksi berdasarkan nomor invoice atau kasir..."
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
                            <button onClick={() => handleDeleteSale(s.id)} className="p-1 text-rose-400 hover:text-rose-700" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. PRODUCTS & INVENTORY ================= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk atau SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowAddProductModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Tambah Produk
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

          {/* ================= 4. EXPENSES ================= */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Daftar Beban & Pengeluaran Usaha (11 Pos)</h3>
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

          {/* ================= 5. BUKU HUTANG & PIUTANG ================= */}
          {activeTab === "debts" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Buku Hutang & Piutang</h3>
                  <p className="text-xs text-slate-400">Total Piutang: <strong className="text-amber-600">{formatIDR(totalReceivables)}</strong> | Total Hutang: <strong className="text-rose-600">{formatIDR(totalPayables)}</strong></p>
                </div>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Catat Tagihan Baru
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 bg-slate-200/60 p-1 rounded-xl w-fit">
                {(["Semua", "Belum Lunas", "Lunas", "Piutang", "Hutang"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDebtFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${debtFilter === tab ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Pihak Terkait</th>
                      <th className="py-3 px-4">Nominal Tagihan</th>
                      <th className="py-3 px-4">Jatuh Tempo</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Aksi / Tagih WA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {debts
                      .filter(d => {
                        if (debtFilter === "Belum Lunas") return !d.isPaid;
                        if (debtFilter === "Lunas") return d.isPaid;
                        if (debtFilter === "Piutang") return d.type === "Piutang";
                        if (debtFilter === "Hutang") return d.type === "Hutang";
                        return true;
                      })
                      .map(d => {
                        const isOverdue = new Date(d.dueDate) < new Date() && !d.isPaid;
                        return (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.type === "Piutang" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                                {d.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">{d.person}</p>
                              {d.phone && <p className="text-[10px] text-slate-400">{d.phone}</p>}
                            </td>
                            <td className="py-3.5 px-4 font-black text-slate-900">{formatIDR(d.amount)}</td>
                            <td className="py-3.5 px-4">
                              <span className={isOverdue ? "text-rose-600 font-bold" : "text-slate-600"}>{d.dueDate}</span>
                              {isOverdue && <span className="block text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold w-fit mt-0.5">Lewat Tempo!</span>}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">{d.notes}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                {d.isPaid ? "LUNAS" : "BELUM LUNAS"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => handleToggleDebtSettled(d.id)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px]">
                                  {d.isPaid ? "Batal" : "Tandai Lunas"}
                                </button>
                                {d.type === "Piutang" && !d.isPaid && (
                                  <button onClick={() => generateWhatsAppReminder(d)} className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded" title="Kirim Pengingat WhatsApp">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. MODAL & EKUITAS USAHA ================= */}
          {activeTab === "capital" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manajemen Ekuitas & Return on Investment (ROI)</h3>
                  <p className="text-xs text-slate-400">Total Modal Disetor Bersih: <strong className="text-purple-600">{formatIDR(totalNetCapital)}</strong></p>
                </div>
                <button onClick={() => setShowCapitalModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Kelola Mutasi Modal
                </button>
              </div>

              {/* 3 Detail Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Modal Disetor Bersih</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{formatIDR(totalNetCapital)}</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Modal Awal + Penambahan - Prive</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Ekuitas Pemilik</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">{formatIDR(totalEquity)}</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Modal Bersih + Laba Bersih</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase">Persentase ROI Investasi</span>
                  <h3 className="text-xl font-black text-purple-600 mt-1">+{roiPercentage}%</h3>
                  <p className="text-[11px] text-emerald-600 font-bold mt-2">Tingkat pengembalian modal positif</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Riwayat Mutasi Modal</h4>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Jenis Mutasi</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
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
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleDeleteCapital(c.id)} className="p-1 text-rose-400 hover:text-rose-700" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. LAPORAN KEUANGAN 3-IN-1 (LABA RUGI, NERACA, ARUS KAS) ================= */}
          {activeTab === "reports" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                {/* 3 Report Tabs Switcher */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setReportSubTab("labarugi")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${reportSubTab === "labarugi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>
                    1. Laba Rugi
                  </button>
                  <button onClick={() => setReportSubTab("neraca")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${reportSubTab === "neraca" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>
                    2. Neraca Sederhana
                  </button>
                  <button onClick={() => setReportSubTab("aruskas")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${reportSubTab === "aruskas" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}>
                    3. Arus Kas (Cash Flow)
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"><Download className="h-3.5 w-3.5" /> Unduh CSV</button>
                  <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"><Printer className="h-3.5 w-3.5" /> Cetak PDF</button>
                </div>
              </div>

              {/* REPORT 1: LABA RUGI */}
              {reportSubTab === "labarugi" && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="text-center border-b pb-3">
                    <h2 className="text-base font-black uppercase text-slate-800">Laporan Laba Rugi (Income Statement)</h2>
                    <p className="text-[10px] text-slate-400">Periode: Agustus 2026 | Entitas: Kopi Senja Nusantara (SAK EMKM)</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-800 border-b pb-1">
                      <span>1. Total Pendapatan Penjualan (Revenue)</span>
                      <span className="text-emerald-600">{formatIDR(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>2. Harga Pokok Penjualan (HPP Bahan Baku)</span>
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
              )}

              {/* REPORT 2: NERACA SEDERHANA */}
              {reportSubTab === "neraca" && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="text-center border-b pb-3">
                    <h2 className="text-base font-black uppercase text-slate-800">Neraca Keuangan Sederhana (Balance Sheet)</h2>
                    <p className="text-[10px] text-slate-400">Posisi Keuangan per {new Date().toLocaleDateString("id-ID")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SISI AKTIVA (ASET) */}
                    <div className="space-y-3 border p-4 rounded-xl bg-slate-50/50">
                      <h4 className="font-bold text-slate-900 uppercase border-b pb-1">Aset / Aktiva (Kekayaan)</h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between"><span>Kas & Rekening Toko</span> <span className="font-bold">{formatIDR(cashOnHand)}</span></div>
                        <div className="flex justify-between"><span>Nilai Persediaan Barang (Stok)</span> <span className="font-bold">{formatIDR(inventoryValue)}</span></div>
                        <div className="flex justify-between"><span>Piutang Pelanggan</span> <span className="font-bold">{formatIDR(totalReceivables)}</span></div>
                      </div>
                      <div className="flex justify-between font-black text-emerald-700 border-t pt-2">
                        <span>TOTAL ASET (AKTIVA)</span>
                        <span>{formatIDR(totalAssets)}</span>
                      </div>
                    </div>

                    {/* SISI PASIVA (KEWAJIBAN & EKUITAS) */}
                    <div className="space-y-3 border p-4 rounded-xl bg-slate-50/50">
                      <h4 className="font-bold text-slate-900 uppercase border-b pb-1">Kewajiban & Ekuitas (Pasiva)</h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-rose-700"><span>Hutang Dagang / Supplier</span> <span className="font-bold">{formatIDR(totalPayables)}</span></div>
                        <div className="flex justify-between"><span>Modal Disetor Bersih</span> <span className="font-bold">{formatIDR(totalNetCapital)}</span></div>
                        <div className="flex justify-between text-emerald-700"><span>Laba Ditahan / Berjalan</span> <span className="font-bold">{formatIDR(netProfit)}</span></div>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 border-t pt-2">
                        <span>TOTAL KEWAJIBAN & EKUITAS</span>
                        <span>{formatIDR(totalLiabilitiesAndEquity)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-emerald-600" />
                      Status Keseimbangan Neraca (Aset = Kewajiban + Ekuitas):
                    </span>
                    <span className="font-black bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px]">
                      {isBalanceSheetBalanced ? "SEIMBANG (BALANCED)" : "PERIKSA KEMBALI"}
                    </span>
                  </div>
                </div>
              )}

              {/* REPORT 3: ARUS KAS (CASH FLOW) */}
              {reportSubTab === "aruskas" && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div className="text-center border-b pb-3">
                    <h2 className="text-base font-black uppercase text-slate-800">Laporan Arus Kas (Cash Flow Statement)</h2>
                    <p className="text-[10px] text-slate-400">Penerimaan & Pengeluaran Kas Riil</p>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 block">1. Arus Kas dari Aktivitas Operasional:</span>
                    <div className="pl-3 space-y-1 text-slate-600">
                      <div className="flex justify-between"><span>Penerimaan Kas dari Pelanggan</span> <span className="text-emerald-600 font-bold">+{formatIDR(totalRevenue)}</span></div>
                      <div className="flex justify-between"><span>Pembayaran Beban Operasional Usaha</span> <span className="text-rose-600 font-bold">-{formatIDR(totalExpenses)}</span></div>
                      <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                        <span>Arus Kas Bersih Operasional</span>
                        <span className="text-emerald-600">+{formatIDR(totalRevenue - totalExpenses)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-2">
                    <span className="font-bold text-slate-800 block">2. Arus Kas dari Aktivitas Pendanaan & Modal:</span>
                    <div className="pl-3 space-y-1 text-slate-600">
                      <div className="flex justify-between"><span>Setoran Modal Masuk</span> <span className="text-emerald-600 font-bold">+{formatIDR(totalNetCapital)}</span></div>
                      <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                        <span>Arus Kas Bersih Pendanaan</span>
                        <span>+{formatIDR(totalNetCapital)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 text-white rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL SALDO KAS AKHIR</span>
                      <span className="text-xs text-emerald-400">Tersedia di Kasir & Rekening</span>
                    </div>
                    <h3 className="text-xl font-black text-emerald-400">{formatIDR(cashOnHand)}</h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 8. TARGET & BUDGET PLANNING ================= */}
          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Target Finansial & Pengawasan Anggaran Kategori</h3>
                  <p className="text-xs text-slate-400">Kontrol pengeluaran agar tidak melebihi alokasi budget bulanan</p>
                </div>
                <button onClick={() => setShowBudgetModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" /> Atur Anggaran Kategori
                </button>
              </div>

              {/* Progress Target Omzet & Laba */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Target Omzet Bulanan</span>
                    <span className="text-xs font-black text-emerald-600">{((totalRevenue / targetRevenue) * 100).toFixed(0)}% Tercapai</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.min((totalRevenue / targetRevenue) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Realisasi: {formatIDR(totalRevenue)}</span>
                    <span>Target: {formatIDR(targetRevenue)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">💡 Estimasi tercapai dalam <strong>{estimatedDaysToTarget} hari</strong> lagi.</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Target Laba Bersih Bulanan</span>
                    <span className="text-xs font-black text-blue-600">{((netProfit / targetProfit) * 100).toFixed(0)}% Tercapai</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min((netProfit / targetProfit) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-semibold">
                    <span>Realisasi: {formatIDR(netProfit)}</span>
                    <span>Target: {formatIDR(targetProfit)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">💡 Margin keuntungan saat ini: <strong>{profitMarginPercent}%</strong>.</p>
                </div>
              </div>

              {/* Tabel Pengawasan Anggaran per Pos */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Monitoring Pemakaian Anggaran (Budget Meter)</h4>
                  <span className="text-xs text-slate-400">Alokasi vs Realisasi</span>
                </div>
                <div className="p-4 space-y-4">
                  {categoryBudgets.map(b => {
                    const used = expensesByCategory[b.category] || 0;
                    const percent = Math.min(((used / b.allocated) * 100), 100);
                    const isOver = used > b.allocated;
                    const isNear = used > (b.allocated * 0.8) && !isOver;

                    return (
                      <div key={b.category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800">{b.category}</span>
                          <span className={isOver ? "text-rose-600 font-black" : "text-slate-600"}>
                            {formatIDR(used)} / {formatIDR(b.allocated)} ({((used / b.allocated) * 100).toFixed(0)}%)
                            {isOver && " ⚠️ MELEBIHI BUDGET"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isOver ? "bg-rose-500 animate-pulse" : isNear ? "bg-amber-500" : "bg-emerald-500"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. ANALISIS BEP & MARGIN ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <BarChart3 className="h-3.5 w-3.5" /> Analisis BEP & Profitabilitas
                </div>
                <h2 className="text-xl font-black">Perhitungan Break Even Point & Produk Terlaris</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Memantau titik impas operasional toko untuk memastikan penjualan selalu berada pada zona menguntungkan (*profit zone*).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Titik Impas (BEP Omzet)</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{formatIDR(bepRevenue)}</h3>
                  <p className="text-[11px] text-emerald-600 font-bold mt-2">✓ Status: Penjualan di atas BEP</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Margin Kotor</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">{(averageMarginRatio * 100).toFixed(1)}%</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Setiap Rp 100 omzet, laba kotor Rp {(averageMarginRatio * 100).toFixed(0)}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Margin Laba Bersih</span>
                  <h3 className="text-xl font-black text-blue-600 mt-1">{profitMarginPercent}%</h3>
                  <p className="text-[11px] text-slate-500 mt-2">Kinerja profitabilitas sehat</p>
                </div>
              </div>

              {/* Ranking Produk */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Peringkat Produk Paling Menguntungkan</h4>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">Jumlah Terjual</th>
                      <th className="py-3 px-4">Kontribusi Omzet</th>
                      <th className="py-3 px-4 text-right">Total Laba Kotor Dihasilkan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {productAnalytics.map(p => (
                      <tr key={p.name} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-4">{p.qty} pcs</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{formatIDR(p.revenue)}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600">+{formatIDR(p.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 10. AI FINANCIAL ADVISOR ================= */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-8 rounded-3xl space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" /> CashFlow Pro AI Engine
                </div>
                <h2 className="text-2xl font-black">Konsultan Finansial & Strategi Bisnis Cerdas</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Pilih topik analisis di bawah ini untuk mendapatkan rekomendasi perbaikan dan penghematan biaya secara otomatis:
                </p>

                {/* 4 Multi-Action Topic Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { id: "analisis_kebocoran", label: "🔍 Kebocoran Biaya" },
                    { id: "naikkan_omzet", label: "🚀 Naikkan Omzet 30%" },
                    { id: "cek_kesehatan_kas", label: "🛡️ Kesehatan Kas" },
                    { id: "prediksi_bulan_depan", label: "📈 Prediksi Bulan Depan" },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setAiSelectedTopic(t.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        aiSelectedTopic === t.id ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md" : "bg-slate-900/80 text-slate-300 border-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic AI Advice Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                {aiSelectedTopic === "analisis_kebocoran" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Hasil Audit AI: Efisiensi Beban Bahan Baku & Utilitas
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Pengeluaran Bahan Baku tercatat sebesar <strong>{formatIDR(expensesByCategory["Bahan Baku"] || 0)}</strong> (menyumbang porsi terbesar pengeluaran).
                    </p>
                    <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-2 text-slate-700">
                      <p>✅ <strong>Rekomendasi 1:</strong> Lakukan kontrak suplai susu bulanan dengan peternak lokal untuk memotong HPP hingga 8%.</p>
                      <p>✅ <strong>Rekomendasi 2:</strong> Pengeluaran listrik mesin espresso dapat ditekan dengan mengatur jam operasional standby.</p>
                    </div>
                  </div>
                )}

                {aiSelectedTopic === "naikkan_omzet" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      Strategi Penjualan: Paket Bundling Kopi + Pastry
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Produk <strong>Kopi Arabika Gayo</strong> dan <strong>Croissant Almond</strong> memiliki tingkat margin di atas 45%.
                    </p>
                    <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-2 text-slate-700">
                      <p>✅ <strong>Ide Bundling:</strong> Buat paket sarapan "Kopi + Croissant" seharga Rp 79.000 untuk meningkatkan nominal transaksi rata-rata kasir.</p>
                    </div>
                  </div>
                )}

                {aiSelectedTopic === "cek_kesehatan_kas" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-purple-500" />
                      Rasio Likuiditas Kas Toko: 3.4x (Sangat Aman)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sisa kas aktif <strong>{formatIDR(cashOnHand)}</strong> dapat melunasi seluruh kewajiban hutang berjalan senilai <strong>{formatIDR(totalPayables)}</strong> sebanyak 3 kali lipat.
                    </p>
                  </div>
                )}

                {aiSelectedTopic === "prediksi_bulan_depan" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      Proyeksi Omzet Bulan Depan: {formatIDR(totalRevenue * 1.2)}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dengan pola repeat order saat ini, pertumbuhan omzet diproyeksikan naik <strong>+20%</strong> pada bulan berikutnya.
                    </p>
                  </div>
                )}
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
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">No. WhatsApp (Untuk Kirim Pengingat)</label>
                <input type="text" placeholder="Contoh: 628123456789" className="w-full bg-slate-50 border p-2 rounded-xl text-xs" value={debtPhone} onChange={e => setDebtPhone(e.target.value)} />
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

      {/* 6. MODAL ATUR ANGGARAN KATEGORI */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Atur Alokasi Anggaran
            </h3>
            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Kategori Beban</label>
                <select value={budgetCat} onChange={e => setBudgetCat(e.target.value as ExpenseCategory)} className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Batas Maksimal Anggaran Bulanan (Rp)</label>
                <input type="number" required placeholder="Contoh: 3000000" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold" value={budgetNominal} onChange={e => setBudgetNominal(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs">Simpan Anggaran</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL STRUK PEMBAYARAN THERMAL */}
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
