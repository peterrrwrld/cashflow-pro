"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, Package, CreditCard, 
  AlertTriangle, Sparkles, Plus, Download, Search, ShieldCheck, 
  Layers, Printer, Trash2, Building2, 
  Wallet, BarChart3, Target, Receipt, ShoppingCart, MessageCircle, 
  Scale, Edit3, CheckCircle2, ArrowUpRight, ArrowDownRight, User,
  FileText, Home, ArrowLeftRight, Edit
} from "lucide-react";
import { toast } from "sonner";

// ================= LOGO DINAMIS =================
function BrandLogo({ className = "h-9 w-9" }: { className?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img 
        src="/logo.png" 
        alt="Kings County Roasters Logo" 
        onError={() => setImgError(true)}
        className={`${className} object-contain flex-shrink-0 drop-shadow-xs`}
      />
    );
  }

  // Fallback Vektor Logo
  return (
    <div className={`relative flex items-center justify-center ${className} flex-shrink-0`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="cfBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0052cc" />
            <stop offset="60%" stopColor="#0080eb" />
            <stop offset="100%" stopColor="#00c8b3" />
          </linearGradient>
          <linearGradient id="cfGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066cc" />
            <stop offset="40%" stopColor="#00a884" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path 
          d="M 12 78 C 22 78 26 58 35 62 C 44 66 48 84 58 84 C 68 84 74 60 88 32" 
          stroke="url(#cfBlueGrad)" 
          strokeWidth="11" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 70 24 L 90 28 L 84 48 Z" 
          fill="url(#cfGreenGrad)" 
        />
        <path 
          d="M 38 40 C 38 24 50 18 64 18 C 72 18 76 22 76 22" 
          stroke="url(#cfGreenGrad)" 
          strokeWidth="8.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M 38 46 C 45 46 58 46 62 46" 
          stroke="url(#cfBlueGrad)" 
          strokeWidth="7.5" 
          strokeLinecap="round" 
        />
        <circle cx="56" cy="20" r="7.5" fill="#00a884" />
        <text x="56" y="23.8" fontSize="8.5" fontWeight="900" fill="white" textAnchor="middle">$</text>
      </svg>
    </div>
  );
}

// ================= TYPES =================
type Role = "Owner" | "Admin" | "Kasir";
type PaymentMethod = "Cash" | "QRIS" | "Transfer Bank" | "E-Wallet";
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

export default function CashFlowProApp() {
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
  const [showEditProductModal, setShowEditProductModal] = useState(false);
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

  // Forms - Expense
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Bahan Baku");
  const [expAmount, setExpAmount] = useState("");
  const [expNotes, setExpNotes] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  // Forms - New Product
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCat, setNewProdCat] = useState("Minuman");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSell, setNewProdSell] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdMin, setNewProdMin] = useState("5");

  // Forms - Edit Product & Stock
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdStock, setEditProdStock] = useState("");
  const [editProdCost, setEditProdCost] = useState("");
  const [editProdSell, setEditProdSell] = useState("");
  const [editProdMin, setEditProdMin] = useState("");

  // Forms - Debt
  const [debtType, setDebtType] = useState<"Hutang" | "Piutang">("Piutang");
  const [debtPerson, setDebtPerson] = useState("");
  const [debtPhone, setDebtPhone] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Forms - Capital
  const [capType, setCapType] = useState<"Penambahan Modal" | "Penarikan Modal (Prive)">("Penambahan Modal");
  const [capAmount, setCapAmount] = useState("");
  const [capNotes, setCapNotes] = useState("");

  // Forms - Budget
  const [budgetCat, setBudgetCat] = useState<ExpenseCategory>("Bahan Baku");
  const [budgetNominal, setBudgetNominal] = useState("");

  useEffect(() => {
    setIsClient(true);
    const p = localStorage.getItem("cfp_kings_products_v10");
    const s = localStorage.getItem("cfp_kings_sales_v10");
    const e = localStorage.getItem("cfp_kings_expenses_v10");
    const d = localStorage.getItem("cfp_kings_debts_v10");
    const c = localStorage.getItem("cfp_kings_capital_v10");
    const b = localStorage.getItem("cfp_kings_budgets_v10");

    if (p) setProducts(JSON.parse(p));
    if (s) setSales(JSON.parse(s));
    if (e) setExpenses(JSON.parse(e));
    if (d) setDebts(JSON.parse(d));
    if (c) setCapitalLogs(JSON.parse(c));
    if (b) setCategoryBudgets(JSON.parse(b));
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cfp_kings_products_v10", JSON.stringify(products));
      localStorage.setItem("cfp_kings_sales_v10", JSON.stringify(sales));
      localStorage.setItem("cfp_kings_expenses_v10", JSON.stringify(expenses));
      localStorage.setItem("cfp_kings_debts_v10", JSON.stringify(debts));
      localStorage.setItem("cfp_kings_capital_v10", JSON.stringify(capitalLogs));
      localStorage.setItem("cfp_kings_budgets_v10", JSON.stringify(categoryBudgets));
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
    return "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(val || 0));
  };

  // ================= VALIDASI STOK KASIR =================
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Stok Kosong!", { description: `${product.name} saat ini habis (0 pcs).` });
      return;
    }

    const existingInCart = cart.find(item => item.productId === product.id);
    const currentQtyInCart = existingInCart ? existingInCart.qty : 0;

    if (currentQtyInCart + 1 > product.stock) {
      toast.error("Tidak Bisa Melebihi Stok!", {
        description: `Stok ${product.name} hanya tersedia ${product.stock} pcs.`
      });
      return;
    }

    setCart(prev => {
      if (existingInCart) {
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.sellPrice, costPrice: product.costPrice, qty: 1 }];
    });
    toast.success(`${product.name} dimasukkan (${currentQtyInCart + 1} pcs)`);
  };

  const updateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    if (newQty > prod.stock) {
      toast.error("Batas Stok Tercapai!", {
        description: `Stok ${prod.name} hanya tersedia maksimal ${prod.stock} pcs.`
      });
      return;
    }

    setCart(prev => prev.map(item => item.productId === productId ? { ...item, qty: newQty } : item));
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

    for (const item of cart) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || item.qty > prod.stock) {
        toast.error("Gagal Memproses Transaksi!", {
          description: `Jumlah ${item.name} (${item.qty} pcs) melebihi stok (${prod?.stock || 0} pcs).`
        });
        return;
      }
    }

    if (posPaymentMethod === "Cash" && (Number(posCashPaid) < cartTotal)) {
      toast.error("Uang yang dibayarkan kurang!");
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
    toast.success("Transaksi Berhasil Disimpan!");
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
    toast.success("Pengeluaran Berhasil Dicatat");
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
    toast.success("Produk Baru Ditambahkan");
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditProdStock(String(p.stock));
    setEditProdCost(String(p.costPrice));
    setEditProdSell(String(p.sellPrice));
    setEditProdMin(String(p.minStock));
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          stock: Number(editProdStock) || 0,
          costPrice: Number(editProdCost) || p.costPrice,
          sellPrice: Number(editProdSell) || p.sellPrice,
          minStock: Number(editProdMin) || p.minStock,
        };
      }
      return p;
    }));

    setShowEditProductModal(false);
    setEditingProduct(null);
    toast.success(`Stok & Data ${editingProduct.name} Berhasil Diperbarui!`);
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
    link.setAttribute("download", `Laporan_KingsCountyRoasters_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV Berhasil Diunduh");
  };

  return (
    <div className="flex h-screen bg-[#f0f6fc] text-slate-800 font-sans antialiased overflow-hidden selection:bg-sky-200">
      
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-sky-100 flex flex-col justify-between hidden lg:flex shadow-[0_8px_30px_rgba(0,100,200,0.04)] z-10">
        <div>
          {/* Brand Header: Logo + Kings County Roasters + by CashFlow Pro */}
          <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 to-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandLogo className="h-9 w-9" />
              <div>
                <span className="font-black text-sm tracking-tight text-slate-900 leading-tight block">
                  Kings County Roasters
                </span>
                <span className="text-[10px] font-extrabold text-[#0060af] tracking-tight block mt-0.5">
                  by CashFlow Pro
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-sky-100 text-[#0060af] font-black px-2 py-0.5 rounded-full">v2.1</span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Menu Utama</div>
            {[
              { id: "dashboard", label: "Dashboard Ringkasan", icon: Home, color: "text-[#0060af]" },
              { id: "sales", label: "Kasir POS", icon: ShoppingCart, color: "text-cyan-600" },
              { id: "products", label: "Stok", icon: Package, color: "text-teal-600" },
              { id: "expenses", label: "Pengeluaran Toko", icon: TrendingDown, color: "text-rose-600" },
              { id: "debts", label: "Buku Hutang & Piutang", icon: CreditCard, color: "text-amber-600" },
              { id: "capital", label: "Modal & Ekuitas", icon: Wallet, color: "text-purple-600" },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition text-left ${
                    isActive 
                      ? "bg-gradient-to-r from-[#0060af] to-[#0080eb] text-white font-bold shadow-md shadow-sky-500/20" 
                      : "text-slate-600 hover:bg-sky-50/70 hover:text-[#0060af]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.color}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-3 py-1">Laporan & Strategi</div>
            {[
              { id: "reports", label: "Laporan 3-in-1", icon: Layers, color: "text-blue-600" },
              { id: "budget", label: "Target & Anggaran", icon: Target, color: "text-emerald-600" },
              { id: "analytics", label: "Analisis BEP", icon: BarChart3, color: "text-indigo-600" },
              { id: "ai", label: "AI Financial Advisor", icon: Sparkles, color: "text-pink-600" },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition text-left ${
                    isActive 
                      ? "bg-gradient-to-r from-[#0060af] to-[#0080eb] text-white font-bold shadow-md shadow-sky-500/20" 
                      : "text-slate-600 hover:bg-sky-50/70 hover:text-[#0060af]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card - Peter */}
        <div className="p-3 border-t border-sky-100 bg-gradient-to-r from-sky-50/60 to-white">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-sky-100 shadow-xs">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0060af] to-sky-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
              P
            </div>
            <div className="flex-1 truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Peter</p>
              <p className="text-[10px] text-[#0060af] font-semibold">Owner • Aktif</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= FULL-WIDTH DESKTOP VIEWPORT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white/90 backdrop-blur-md border-b border-sky-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-8 lg:hidden" />
            <div>
              <h1 className="text-base font-black text-slate-900">
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
              <p className="text-[10px] text-slate-500 font-bold">
                Kings County Roasters <span className="text-[#0060af] font-extrabold">• by CashFlow Pro</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-xl transition shadow-2xs"
            >
              + Catat Beban
            </button>
            <button
              onClick={() => setShowAddSaleModal(true)}
              className="text-xs font-black bg-gradient-to-r from-[#0060af] via-[#0077d6] to-sky-500 hover:from-[#005096] hover:to-[#006cc7] text-white shadow-md shadow-sky-500/25 px-4 py-1.5 rounded-xl transition active:scale-95"
            >
              + Buka Kasir POS
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-5 sm:p-7 max-w-6xl w-full mx-auto space-y-6">

          {/* ================= 1. DASHBOARD VIEW ================= */}
          {activeTab === "dashboard" && (
            <>
              {/* 4 Kartu Metrik Finansial */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Omzet */}
                <div className="bg-white p-4.5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-400/15 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0060af]">Total Omzet</span>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0060af] to-sky-400 text-white flex items-center justify-center shadow-xs">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatIDR(totalRevenue)}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                    <ArrowUpRight className="h-3 w-3" /> Realisasi Penjualan
                  </span>
                </div>

                {/* 2. Beban */}
                <div className="bg-white p-4.5 rounded-3xl border border-rose-100 shadow-[0_8px_25px_rgba(244,63,94,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-400/15 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Total Beban</span>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-xs">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-rose-600 tracking-tight">{formatIDR(totalExpenses)}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">{expenses.length} pos beban toko</span>
                </div>

                {/* 3. Laba Bersih */}
                <div className="bg-white p-4.5 rounded-3xl border border-teal-100 shadow-[0_8px_25px_rgba(20,184,166,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-400/15 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">Laba Bersih</span>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xs">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-black tracking-tight ${netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatIDR(netProfit)}
                  </h3>
                  <span className="text-[10px] text-teal-700 font-bold mt-1">Margin: {profitMarginPercent}%</span>
                </div>

                {/* 4. Kas & ROI */}
                <div className="bg-white p-4.5 rounded-3xl border border-purple-100 shadow-[0_8px_25px_rgba(168,85,247,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-400/15 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Kas & ROI</span>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatIDR(cashOnHand)}</h3>
                  <span className="text-[10px] text-purple-700 font-black mt-1">ROI: +{roiPercentage}%</span>
                </div>
              </div>

              {/* 8 Menu Akses Cepat */}
              <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-[#0060af]">Layanan Finansial Kings County Roasters</span>
                  <span className="text-[10px] bg-sky-50 text-[#0060af] font-bold px-2.5 py-0.5 rounded-full border border-sky-200">Akses Cepat</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                  <button onClick={() => setShowAddSaleModal(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-sky-50/50 hover:bg-sky-100/70 border border-sky-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#0060af] to-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Kasir POS</span>
                  </button>

                  <button onClick={() => setActiveTab("products")} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-teal-50/50 hover:bg-teal-100/70 border border-teal-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Stok</span>
                  </button>

                  <button onClick={() => setShowAddExpenseModal(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-rose-50/50 hover:bg-rose-100/70 border border-rose-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Beban Toko</span>
                  </button>

                  <button onClick={() => setActiveTab("debts")} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/70 border border-amber-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Buku Tagihan</span>
                  </button>

                  <button onClick={() => setShowCapitalModal(true)} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-purple-50/50 hover:bg-purple-100/70 border border-purple-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Modal Ekuitas</span>
                  </button>

                  <button onClick={() => setActiveTab("reports")} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-100/70 border border-blue-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Laporan 3-in-1</span>
                  </button>

                  <button onClick={() => setActiveTab("budget")} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">Target Usaha</span>
                  </button>

                  <button onClick={() => setActiveTab("ai")} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-pink-50/50 hover:bg-pink-100/70 border border-pink-100 transition active:scale-95">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/25">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">AI Advisor</span>
                  </button>
                </div>
              </div>

              {/* Rincian Posisi Keuangan & Target Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-900">Rincian Posisi Finansial Toko</span>
                    <span className="text-[10px] bg-sky-50 text-[#0060af] font-bold px-2.5 py-0.5 rounded-full">Real-Time</span>
                  </div>
                  <div className="space-y-2 text-xs font-medium">
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
                      <span className="font-black text-amber-600">{formatIDR(totalReceivables)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Hutang Dagang Supplier:</span>
                      <span className="font-black text-rose-600">{formatIDR(totalPayables)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                      <span className="text-xs font-black text-slate-900">Pencapaian Target Omzet</span>
                      <span className="text-xs font-black text-[#0060af]">{((totalRevenue / targetRevenue) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2">
                      <div className="bg-gradient-to-r from-[#0060af] via-sky-500 to-cyan-400 h-full transition-all duration-500" style={{ width: `${Math.min((totalRevenue / targetRevenue) * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                      <span>Realisasi: {formatIDR(totalRevenue)}</span>
                      <span>Target: {formatIDR(targetRevenue)}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-2xl text-[11px] text-[#0060af] font-medium">
                    💡 <strong>Status Peter:</strong> Kings County Roasters berada di atas titik impas (BEP).
                  </div>
                </div>
              </div>

              {/* Tabel Transaksi Terakhir */}
              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900">Transaksi Penjualan Terbaru</span>
                  <button onClick={() => setActiveTab("sales")} className="text-xs font-bold text-[#0060af] hover:underline">Lihat Semua Mutasi &rarr;</button>
                </div>
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-sky-50/60 text-[#0060af] font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Invoice</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sales.slice(0, 4).map(s => (
                      <tr key={s.id} className="hover:bg-sky-50/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-3.5 px-4"><span className="bg-sky-50 text-[#0060af] border border-sky-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">{s.paymentMethod}</span></td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">+{formatIDR(s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= 2. SALES / POS VIEW ================= */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nomor faktur..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-sky-100 rounded-2xl text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0060af]"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportCSV} className="bg-white hover:bg-sky-50 border border-sky-200 text-[#0060af] font-bold px-3.5 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-2xs">
                    <Download className="h-3.5 w-3.5" /> Unduh CSV
                  </button>
                  <button onClick={() => setShowAddSaleModal(true)} className="bg-gradient-to-r from-[#0060af] to-sky-500 hover:from-[#005096] hover:to-sky-600 text-white font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/25">
                    <Plus className="h-3.5 w-3.5" /> Buka Kasir POS
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-sky-50/60 text-[#0060af] font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">No. Invoice</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Daftar Item</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Struk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sales.filter(s => s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                      <tr key={s.id} className="hover:bg-sky-50/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.invoiceNo}</td>
                        <td className="py-3.5 px-4 text-slate-400">{s.date}</td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">{s.items.map(i => `${i.name} (${i.qty}x)`).join(", ")}</td>
                        <td className="py-3.5 px-4"><span className="bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#0060af]">{s.paymentMethod}</span></td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm">+{formatIDR(s.total)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => setActiveReceiptSale(s)} className="p-1.5 text-[#0060af] hover:bg-sky-50 rounded-lg"><Receipt className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. STOK VIEW ================= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manajemen Stok Barang ({products.length} Item)</h3>
                  <p className="text-xs text-slate-400">Klik tombol Edit untuk mengubah kuantitas stok atau harga</p>
                </div>
                <button onClick={() => setShowAddProductModal(true)} className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-teal-500/25">
                  + Tambah Produk
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-teal-50/60 text-teal-800 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">HPP (Modal)</th>
                      <th className="py-3 px-4">Harga Jual</th>
                      <th className="py-3 px-4">Margin Laba</th>
                      <th className="py-3 px-4">Stok Aktif</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{formatIDR(p.costPrice)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatIDR(p.sellPrice)}</td>
                        <td className="py-3.5 px-4 text-emerald-600 font-black">+{formatIDR(p.sellPrice - p.costPrice)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.stock <= p.minStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {p.stock} pcs {p.stock <= p.minStock ? "(Kritis)" : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#0060af] rounded-lg font-bold inline-flex items-center gap-1 text-[11px] border border-sky-200"
                            title="Edit Stok & Harga"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit Stok
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 4. EXPENSES VIEW ================= */}
          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Total Beban Usaha: <strong className="text-rose-600">{formatIDR(totalExpenses)}</strong></span>
                <button onClick={() => setShowAddExpenseModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-rose-500/25">
                  + Catat Beban
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-rose-100 shadow-[0_8px_25px_rgba(244,63,94,0.05)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-rose-50/60 text-rose-800 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {expenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 text-slate-400">{e.date}</td>
                        <td className="py-3.5 px-4"><span className="bg-rose-50 border border-rose-200 text-rose-800 px-2 py-0.5 rounded-lg text-[10px] font-bold">{e.category}</span></td>
                        <td className="py-3.5 px-4 text-slate-800">{e.notes}</td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-600">-{formatIDR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 5. DEBTS VIEW ================= */}
          {activeTab === "debts" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <span className="text-xs text-slate-600">Piutang: <strong className="text-amber-700 font-bold">{formatIDR(totalReceivables)}</strong></span>
                  <span className="text-xs text-slate-600">Hutang: <strong className="text-rose-700 font-bold">{formatIDR(totalPayables)}</strong></span>
                </div>
                <button onClick={() => setShowAddDebtModal(true)} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-amber-500/25">
                  + Catat Tagihan
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-amber-100 shadow-[0_8px_25px_rgba(245,158,11,0.05)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-amber-50/60 text-amber-900 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4">Pihak Terkait</th>
                      <th className="py-3 px-4">Nominal Tagihan</th>
                      <th className="py-3 px-4">Jatuh Tempo</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4"><span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${d.type === 'Piutang' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>{d.type}</span></td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{d.person}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">{formatIDR(d.amount)}</td>
                        <td className="py-3.5 px-4 text-slate-500">{d.dueDate}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${d.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {d.isPaid ? 'LUNAS' : 'BELUM'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button onClick={() => handleToggleDebtSettled(d.id)} className="text-[10px] bg-sky-50 hover:bg-sky-100 text-[#0060af] border border-sky-200 px-3 py-1 rounded-xl font-bold">
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

          {/* ================= 6. CAPITAL VIEW ================= */}
          {activeTab === "capital" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Modal Disetor Bersih: <strong className="text-purple-700">{formatIDR(totalNetCapital)}</strong></span>
                <button onClick={() => setShowCapitalModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-purple-500/25">
                  + Mutasi Modal
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-purple-100 shadow-[0_8px_25px_rgba(168,85,247,0.05)] overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-purple-50/60 text-purple-900 font-black uppercase text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Tipe Mutasi</th>
                      <th className="py-3 px-4">Keterangan</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {capitalLogs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
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

          {/* ================= 7. REPORTS VIEW ================= */}
          {activeTab === "reports" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-sky-100 shadow-2xs">
                  <button onClick={() => setReportSubTab("labarugi")} className={`px-4 py-1.5 rounded-xl text-xs font-black ${reportSubTab === 'labarugi' ? 'bg-[#0060af] text-white shadow-xs' : 'text-slate-500'}`}>Laba Rugi</button>
                  <button onClick={() => setReportSubTab("neraca")} className={`px-4 py-1.5 rounded-xl text-xs font-black ${reportSubTab === 'neraca' ? 'bg-[#0060af] text-white shadow-xs' : 'text-slate-500'}`}>Neraca</button>
                </div>
                <button onClick={() => window.print()} className="bg-[#0060af] hover:bg-[#005096] text-white font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-md">
                  <Printer className="h-3.5 w-3.5" /> Cetak PDF
                </button>
              </div>

              {reportSubTab === "labarugi" && (
                <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.06)] space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-3 text-center">
                    <h3 className="font-black text-base text-[#0060af] uppercase">Laporan Laba Rugi (SAK EMKM)</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Kings County Roasters • by CashFlow Pro</p>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between"><span>Penjualan Bersih (Omzet):</span> <span className="font-bold text-slate-900">{formatIDR(totalRevenue)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Harga Pokok Penjualan (HPP):</span> <span>({formatIDR(totalCOGS)})</span></div>
                    <div className="flex justify-between font-black border-t border-slate-100 pt-2 text-slate-900"><span>Laba Kotor:</span> <span>{formatIDR(grossProfit)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Total Beban Operasional:</span> <span>({formatIDR(totalExpenses)})</span></div>
                    <div className="flex justify-between font-black text-emerald-700 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
                      <span>LABA BERSIH:</span>
                      <span className="text-sm">{formatIDR(netProfit)}</span>
                    </div>
                  </div>
                </div>
              )}

              {reportSubTab === "neraca" && (
                <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.06)] space-y-4 text-xs">
                  <div className="border-b border-slate-100 pb-3 text-center">
                    <h3 className="font-black text-base text-[#0060af] uppercase">Neraca Sederhana</h3>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">Kings County Roasters • by CashFlow Pro</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                      <h4 className="font-black text-[#0060af] border-b border-sky-100 pb-2">Aset</h4>
                      <div className="space-y-1.5 mt-2.5 text-slate-600">
                        <div className="flex justify-between"><span>Kas:</span> <span className="font-bold">{formatIDR(cashOnHand)}</span></div>
                        <div className="flex justify-between"><span>Stok:</span> <span className="font-bold">{formatIDR(inventoryValue)}</span></div>
                        <div className="flex justify-between"><span>Piutang:</span> <span className="font-bold">{formatIDR(totalReceivables)}</span></div>
                        <div className="flex justify-between font-black text-slate-900 border-t pt-2"><span>Total:</span> <span>{formatIDR(totalAssets)}</span></div>
                      </div>
                    </div>
                    <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                      <h4 className="font-black text-[#0060af] border-b border-sky-100 pb-2">Kewajiban & Modal</h4>
                      <div className="space-y-1.5 mt-2.5 text-slate-600">
                        <div className="flex justify-between"><span>Hutang:</span> <span className="font-bold text-rose-600">{formatIDR(totalPayables)}</span></div>
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

          {/* ================= 8. BUDGET VIEW ================= */}
          {activeTab === "budget" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">Pengawasan Anggaran Kategori</span>
                <button onClick={() => setShowBudgetModal(true)} className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md shadow-emerald-500/25">
                  Atur Anggaran
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryBudgets.map(b => {
                  const used = expensesByCategory[b.category] || 0;
                  const percent = Math.min(((used / b.allocated) * 100), 100);
                  const isOver = used > b.allocated;

                  return (
                    <div key={b.category} className="bg-white p-4.5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] space-y-2.5">
                      <div className="flex justify-between text-xs font-black">
                        <span>{b.category}</span>
                        <span className={isOver ? "text-rose-600" : "text-[#0060af]"}>
                          {formatIDR(used)} / {formatIDR(b.allocated)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${isOver ? "bg-rose-500" : "bg-gradient-to-r from-[#0060af] to-sky-400"}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 9. ANALYTICS VIEW ================= */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)]">
                  <span className="text-[10px] font-black text-[#0060af] uppercase">Titik Impas (BEP)</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{formatIDR(bepRevenue)}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Lolos Ambang Batas</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)]">
                  <span className="text-[10px] font-black text-teal-700 uppercase">Rasio Margin Kotor</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{(averageMarginRatio * 100).toFixed(1)}%</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Efisiensi HPP Terjaga</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)]">
                  <span className="text-[10px] font-black text-purple-700 uppercase">Margin Bersih</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{profitMarginPercent}%</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">Profitabilitas Sehat</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 10. AI ADVISOR VIEW ================= */}
          {activeTab === "ai" && (
            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-[0_8px_25px_rgba(0,100,200,0.05)] space-y-4 text-xs">
              <div className="flex items-center gap-2 text-[#0060af] font-black text-sm">
                <Sparkles className="h-4 w-4 text-[#0060af]" />
                Rekomendasi AI untuk Kings County Roasters (Peter)
              </div>
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-2.5 text-slate-700 leading-relaxed font-medium">
                <p>• <strong>Bahan Baku:</strong> Pembelian bahan baku menyerap 45% pengeluaran toko. Gunakan skema kontrak grosir bulanan untuk memotong HPP hingga 8%.</p>
                <p>• <strong>Keamanan Kas:</strong> Rasio likuiditas kas Peter berada pada angka 3.4x (sangat aman untuk menutup hutang lancar).</p>
                <p>• <strong>Proyeksi Omzet:</strong> Dengan pola transaksi saat ini, laba bersih diproyeksikan tumbuh 20% bulan depan.</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= MODALS (POPUP) ================= */}

      {/* 1. POS MODAL */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 border border-sky-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="text-xs font-black text-[#0060af] block">Kasir POS Multi-Item</span>
                <span className="text-[10px] text-slate-500 font-bold">Kings County Roasters • by CashFlow Pro</span>
              </div>
              <button onClick={() => setShowAddSaleModal(false)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
            </div>

            {/* Daftar Produk untuk Dipilih */}
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50/50 rounded-2xl">
              {products.map(p => {
                const inCart = cart.find(c => c.productId === p.id);
                const isOutOfStock = p.stock <= 0;
                const isMaxInCart = (inCart?.qty || 0) >= p.stock;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isOutOfStock || isMaxInCart}
                    onClick={() => addToCart(p)}
                    className={`p-2.5 rounded-2xl text-left border transition ${
                      isOutOfStock || isMaxInCart 
                        ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed" 
                        : "bg-white border-sky-100 hover:border-[#0060af] shadow-2xs"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="text-[10px] text-[#0060af] font-black">{formatIDR(p.sellPrice)}</div>
                    <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      Stok: {p.stock} {isMaxInCart && "(Maksimal)"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Keranjang Belanja */}
            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 max-h-32 overflow-y-auto border border-slate-100">
              {cart.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic text-center py-2">Keranjang belanja kosong</p>
              ) : (
                cart.map(item => {
                  const prod = products.find(p => p.id === item.productId);
                  const isMaxReached = prod ? item.qty >= prod.stock : false;

                  return (
                    <div key={item.productId} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100 shadow-2xs">
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{formatIDR(item.price)} / pcs</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button 
                          type="button"
                          onClick={() => updateCartQty(item.productId, item.qty - 1)} 
                          className="h-6 w-6 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-black flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-black px-1 text-xs text-slate-900">{item.qty}</span>
                        <button 
                          type="button"
                          disabled={isMaxReached}
                          onClick={() => updateCartQty(item.productId, item.qty + 1)} 
                          className={`h-6 w-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            isMaxReached 
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed" 
                              : "bg-[#0060af] text-white hover:bg-sky-600"
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleCheckoutPOS} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Diskon (Rp)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={posDiscount || ""} 
                    onChange={e => setPosDiscount(Number(e.target.value))} 
                    className="w-full border p-2 rounded-xl text-xs font-bold" 
                  />
                  {posDiscount > 0 && <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Diskon: {formatIDR(posDiscount)}</span>}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Metode Bayar</label>
                  <select 
                    value={posPaymentMethod} 
                    onChange={e => setPosPaymentMethod(e.target.value as any)} 
                    className="w-full border p-2 rounded-xl font-bold text-xs"
                  >
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Cash (Tunai)</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="E-Wallet">E-Wallet</option>
                  </select>
                </div>
              </div>

              {posPaymentMethod === "Cash" && (
                <div className="grid grid-cols-2 gap-2 bg-sky-50 p-2.5 rounded-2xl border border-sky-100">
                  <div>
                    <label className="text-[9px] text-[#0060af] font-bold block mb-1">Uang Diterima (Rp)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Contoh: 100000" 
                      value={posCashPaid} 
                      onChange={e => setPosCashPaid(e.target.value)} 
                      className="w-full border p-1.5 rounded-xl bg-white font-bold text-xs" 
                    />
                    {posCashPaid && <span className="text-[9px] text-[#0060af] font-bold block mt-0.5">Terbaca: {formatIDR(Number(posCashPaid))}</span>}
                  </div>
                  <div>
                    <label className="text-[9px] text-[#0060af] font-bold block mb-1">Kembalian</label>
                    <span className="font-black text-emerald-700 block pt-1 text-sm">{formatIDR(cashChange)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center font-black text-slate-900 border-t pt-2">
                <span>Total Tagihan:</span>
                <span className="text-[#0060af] text-base">{formatIDR(cartTotal)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddSaleModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" disabled={cart.length === 0} className="flex-1 bg-gradient-to-r from-[#0060af] to-sky-500 text-white p-2.5 rounded-2xl font-black shadow-md shadow-sky-500/25">Simpan & Cetak Struk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-rose-100">
            <span className="font-black text-slate-900 block text-sm">Catat Beban Pengeluaran</span>
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
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal Biaya (Rp)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="Contoh: 150000" 
                  value={expAmount} 
                  onChange={e => setExpAmount(e.target.value)} 
                  className="w-full border p-2 rounded-xl font-bold text-xs" 
                />
                {expAmount && (
                  <span className="text-[10px] text-rose-600 font-bold block mt-1">
                    Terbaca: {formatIDR(Number(expAmount))}
                  </span>
                )}
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" required placeholder="Contoh: Beli kemasan cup" value={expNotes} onChange={e => setExpNotes(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TAMBAH PRODUK BARU */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-sky-100">
            <span className="font-black text-slate-900 block text-sm">Tambah Produk Baru</span>
            <form onSubmit={handleAddProduct} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nama Produk</label>
                <input type="text" required placeholder="Contoh: Cold Brew Coffee" value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">HPP (Modal)</label>
                  <input type="number" required placeholder="Rp" value={newProdCost} onChange={e => setNewProdCost(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  {newProdCost && <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{formatIDR(Number(newProdCost))}</span>}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Harga Jual</label>
                  <input type="number" required placeholder="Rp" value={newProdSell} onChange={e => setNewProdSell(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
                  {newProdSell && <span className="text-[9px] text-[#0060af] font-bold block mt-0.5">{formatIDR(Number(newProdSell))}</span>}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Stok Awal</label>
                <input type="number" placeholder="0" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="w-full border p-2 rounded-xl font-bold" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT STOK & HARGA */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-sky-100">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-black text-slate-900 block text-sm">Edit Stok & Harga</span>
                <span className="text-[10px] text-[#0060af] font-bold">{editingProduct.name} ({editingProduct.sku})</span>
              </div>
              <button onClick={() => setShowEditProductModal(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Jumlah Stok Saat Ini (Unit / Pcs)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={editProdStock} 
                  onChange={e => setEditProdStock(e.target.value)} 
                  className="w-full border-2 border-sky-200 focus:border-[#0060af] p-2 rounded-xl font-black text-sm text-[#0060af] outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">HPP (Modal)</label>
                  <input 
                    type="number" 
                    required 
                    value={editProdCost} 
                    onChange={e => setEditProdCost(e.target.value)} 
                    className="w-full border p-2 rounded-xl font-bold" 
                  />
                  {editProdCost && <span className="text-[9px] text-slate-500 font-bold block mt-0.5">{formatIDR(Number(editProdCost))}</span>}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">Harga Jual</label>
                  <input 
                    type="number" 
                    required 
                    value={editProdSell} 
                    onChange={e => setEditProdSell(e.target.value)} 
                    className="w-full border p-2 rounded-xl font-bold" 
                  />
                  {editProdSell && <span className="text-[9px] text-[#0060af] font-bold block mt-0.5">{formatIDR(Number(editProdSell))}</span>}
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Batas Minimum Peringatan Stok</label>
                <input 
                  type="number" 
                  value={editProdMin} 
                  onChange={e => setEditProdMin(e.target.value)} 
                  className="w-full border p-2 rounded-xl font-bold" 
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowEditProductModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-[#0060af] text-white p-2.5 rounded-2xl font-black shadow-md shadow-sky-500/25">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DEBT MODAL */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-amber-100">
            <span className="font-black text-slate-900 block text-sm">Catat Tagihan / Hutang</span>
            <form onSubmit={handleAddDebt} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDebtType("Piutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Piutang' ? 'bg-[#0060af] text-white' : 'bg-slate-50 text-slate-600'}`}>Piutang</button>
                <button type="button" onClick={() => setDebtType("Hutang")} className={`p-2 rounded-2xl border text-xs font-black ${debtType === 'Hutang' ? 'bg-[#0060af] text-white' : 'bg-slate-50 text-slate-600'}`}>Hutang</button>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nama Pihak Terkait</label>
                <input type="text" required placeholder="Nama orang / supplier" value={debtPerson} onChange={e => setDebtPerson(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="Contoh: 500000" 
                  value={debtAmount} 
                  onChange={e => setDebtAmount(e.target.value)} 
                  className="w-full border p-2 rounded-xl font-bold" 
                />
                {debtAmount && (
                  <span className="text-[10px] text-amber-700 font-bold block mt-1">
                    Terbaca: {formatIDR(Number(debtAmount))}
                  </span>
                )}
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

      {/* 6. CAPITAL MODAL */}
      {showCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-purple-100">
            <span className="font-black text-slate-900 block text-sm">Mutasi Modal Usaha</span>
            <form onSubmit={handleAddCapital} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Jenis</label>
                <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full border p-2 rounded-xl font-bold">
                  <option value="Penambahan Modal">Penambahan Modal (Setor Kas)</option>
                  <option value="Penarikan Modal (Prive)">Penarikan Modal (Prive)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="Contoh: 5000000" 
                  value={capAmount} 
                  onChange={e => setCapAmount(e.target.value)} 
                  className="w-full border p-2 rounded-xl font-bold" 
                />
                {capAmount && (
                  <span className="text-[10px] text-purple-700 font-bold block mt-1">
                    Terbaca: {formatIDR(Number(capAmount))}
                  </span>
                )}
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Keterangan</label>
                <input type="text" placeholder="Catatan mutasi modal..." value={capNotes} onChange={e => setCapNotes(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCapitalModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BUDGET MODAL */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-xs border border-emerald-100">
            <span className="font-black text-slate-900 block text-sm">Atur Anggaran Kategori</span>
            <form onSubmit={handleSaveBudget} className="space-y-2">
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Kategori Beban</label>
                <select value={budgetCat} onChange={e => setBudgetCat(e.target.value as any)} className="w-full border p-2 rounded-xl font-bold">
                  {["Bahan Baku", "Transportasi", "Gaji", "Sewa", "Listrik", "Air", "Internet", "Pajak", "Marketing", "Peralatan", "Operasional Lain"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-1">Batas Anggaran (Rp)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="Contoh: 3000000" 
                  value={budgetNominal} 
                  onChange={e => setBudgetNominal(e.target.value)} 
                  className="w-full border p-2 rounded-xl font-bold" 
                />
                {budgetNominal && (
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                    Terbaca: {formatIDR(Number(budgetNominal))}
                  </span>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 bg-slate-100 p-2.5 rounded-2xl text-slate-600 font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white p-2.5 rounded-2xl font-black">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. RECEIPT MODAL */}
      {activeReceiptSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-3 font-mono text-[11px] border border-sky-100">
            <div className="text-center border-b pb-2">
              <span className="font-black uppercase block text-xs text-[#0060af]">KINGS COUNTY ROASTERS</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">by CashFlow Pro</span>
              <span className="text-[9px] text-slate-500">Kasir: {activeReceiptSale.cashier}</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Faktur:</span> <strong>{activeReceiptSale.invoiceNo}</strong></div>
              <div className="flex justify-between"><span>Tgl:</span> <span>{activeReceiptSale.date}</span></div>
              <div className="flex justify-between"><span>Metode:</span> <span className="font-bold">{activeReceiptSale.paymentMethod}</span></div>
            </div>
            <div className="border-t border-b py-2 space-y-1 text-slate-800">
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
