import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Plus, Trash2, Calculator, Upload, Database, Printer, FileText, Package } from "lucide-react";

const discountRules = {
  "Schneider|Blokset": 0,
  "Schneider|Easy": 0.58,
  "Schneider|EasyControl": 0.58,
  "Schneider|Varset": 0.5,
  "Schneider|DRIVES": 0.5,
  "Schneider|Universal": 0.47,
  "Schneider|Prisma": 0.57,
  "Schneider|Part": 0.6,
  "Schneider|PART": 0.6,
  "Schneider|Retail": 0.57,
  "Schneider|RETAIL": 0.57,
  "Schneider|Control": 0.55,
  "Schneider|CONTROL": 0.55,
  "Schneider|BMS": 0.5,
  "Schneider|Power Management": 0.55,
  "Schneider|Metal Works": 0,
  "Schneider|acc": 0,
  "Schneider|Other": 0,
  "Schneider|OTHER": 0,
  "Local|Wiring": 0,
  "Schneider|Transportation": 0,
  "Schneider|EC": 0,
  "Lovato|M.P": 0,
  "Rittal|bb": 0,
  "Alfanar|DRIVES-Others": 0.2,
  "DKC|Lovato": 0.2,
  "Leipole|Rittal": 0.35,
  "ABB|Alfanar": 0.15,
  "ABB|DKC": 0.2,
  "ABB|Leipole": 0.3,
  "ABB|Disbo": 0.58,
  "ABB|Resbo": 0.58,
  "Circutor|Circutor": 0.2,
};

const motorizedAccessoryRules = {
  Schneider: {
    MCCB: [
      { suffix: "MOTOR", description: "Motor operator / motor mechanism", product: "acc", price: 950 },
      { suffix: "AUX", description: "Auxiliary contact", product: "acc", price: 120 },
      { suffix: "SHT", description: "Shunt trip", product: "acc", price: 180 },
      { suffix: "SEL", description: "Auto / Manual selector switch", product: "Control", price: 95 },
      { suffix: "CTRL", description: "Control protection MCB / fuse", product: "Control", price: 110 },
    ],
    ACB: [
      { suffix: "CHG-MOTOR", description: "ACB charging motor", product: "acc", price: 1800 },
      { suffix: "AUX", description: "ACB auxiliary contact", product: "acc", price: 220 },
      { suffix: "SHT", description: "ACB shunt trip", product: "acc", price: 350 },
      { suffix: "UVR", description: "Under voltage release", product: "acc", price: 420 },
      { suffix: "SEL", description: "ACB close / open selector", product: "Control", price: 140 },
      { suffix: "CTRL", description: "Control protection MCB / fuse", product: "Control", price: 110 },
    ],
  },
};

const enclosureSizingRules = {
  MDB: { baseWidth: 800, sectionWidth: 400, minHeight: 2200, minDepth: 600 },
  SMDB: { baseWidth: 600, sectionWidth: 300, minHeight: 2000, minDepth: 500 },
  DB: { baseWidth: 500, sectionWidth: 250, minHeight: 1600, minDepth: 250 },
  MCC: { baseWidth: 1000, sectionWidth: 400, minHeight: 2200, minDepth: 800 },
  ATS: { baseWidth: 800, sectionWidth: 350, minHeight: 2200, minDepth: 600 },
  Synchronizing: { baseWidth: 1000, sectionWidth: 450, minHeight: 2200, minDepth: 800 },
  PFC: { baseWidth: 800, sectionWidth: 350, minHeight: 2200, minDepth: 600 },
  "Control Panel": { baseWidth: 600, sectionWidth: 250, minHeight: 1800, minDepth: 400 },
};

const seedCatalog = [
  { id: "seed-1", family: "Incomer", description: "Easypact MVS 2500A 3P Drawout", brand: "Schneider", product: "Easy", partNo: "MVS25H3MW2L", rating: 2500, poles: 3, price: 29674, type: "ACB" },
  { id: "seed-2", family: "Outgoing", description: "NSX630N 3P 630A MCCB", brand: "Schneider", product: "Part", partNo: "LV432893", rating: 630, poles: 3, price: 4762.947, type: "MCCB" },
  { id: "seed-3", family: "Outgoing", description: "CVS400NA 400A 3P MCCB", brand: "Schneider", product: "Easy", partNo: "LV540400", rating: 400, poles: 3, price: 1615, type: "MCCB" },
  { id: "seed-4", family: "Outgoing", description: "EZC250N 150A 3P MCCB", brand: "Schneider", product: "Easy", partNo: "EZC250N3150", rating: 150, poles: 3, price: 723, type: "MCCB" },
  { id: "seed-5", family: "Outgoing", description: "EZC100N 100A 3P MCCB", brand: "Schneider", product: "Easy", partNo: "EZC100N3100", rating: 100, poles: 3, price: 297, type: "MCCB" },
  { id: "seed-6", family: "Metering", description: "PowerLogic PM5310 Meter", brand: "Schneider", product: "Power Management", partNo: "METSEPM5310", rating: 0, poles: 0, price: 2399, type: "Meter" },
  { id: "seed-7", family: "Metering", description: "CT 2500/5A", brand: "Schneider", product: "Power Management", partNo: "METSECT5DC250", rating: 2500, poles: 0, price: 574, type: "CT" },
  { id: "seed-8", family: "Enclosure", description: "Prisma MDB Enclosure", brand: "Schneider", product: "Prisma", partNo: "PRISMA-MDB", rating: 0, poles: 0, price: 8000, type: "Enclosure" },
  { id: "seed-9", family: "Busbar", description: "Copper Busbar Lot", brand: "Schneider", product: "Metal Works", partNo: "CU-BUSBAR", rating: 2500, poles: 0, price: 5000, type: "Busbar" },
  { id: "seed-10", family: "Wiring", description: "Internal Wiring Lot", brand: "Local", product: "Wiring", partNo: "LOCAL-WIRING", rating: 0, poles: 0, price: 1500, type: "Wiring" },
  { id: "seed-11", family: "Accessories", description: "Accessories Lot", brand: "Schneider", product: "acc", partNo: "ACC-LOT", rating: 0, poles: 0, price: 850, type: "Accessory" },
  { id: "seed-12", family: "Services", description: "Testing & Commissioning", brand: "Schneider", product: "EC", partNo: "TEST-EC", rating: 0, poles: 0, price: 1000, type: "Service" },
  { id: "seed-13", family: "Services", description: "Transportation", brand: "Schneider", product: "Transportation", partNo: "TRANS", rating: 0, poles: 0, price: 700, type: "Transport" },
  { id: "seed-14", family: "Signalling", description: "RYB Indication Lamps Set", brand: "Schneider", product: "Control", partNo: "RYB-LAMPS", rating: 0, poles: 0, price: 450, type: "Lamp" },
  { id: "seed-15", family: "Outgoing", description: "NSX100F 100A 3P MCCB", brand: "Schneider", product: "Part", partNo: "LV429790", rating: 100, poles: 3, price: 1912.208, type: "MCCB" },
  { id: "seed-16", family: "Outgoing", description: "NSX250F 150A 3P MCCB", brand: "Schneider", product: "Part", partNo: "LV431161", rating: 150, poles: 3, price: 2733.906, type: "MCCB" }
];

const defaultProject = {
  projectName: "",
  clientName: "",
  panelType: "MDB",
  voltage: "400/230V, 60Hz",
  form: "Form 4b",
  ipRating: "IP54",
  mounting: "Floor Mounted",
  location: "Indoor",
  breakerBrand: "Schneider",
  incomerRating: 2500,
  busbarRating: 2500,
  scc: "25kA",
  metering: true,
  signalling: true,
  enclosure: true,
  labour: 3500,
  profitPct: 12,
  vatPct: 15,
  notes: "",
  warranty: "12 Months from delivery",
  delivery: "4-6 Weeks",
  validity: "30 Days",
  companyName: "Modern Electricity Company for Low Voltage Switch Gear and Control Gear Solution",
};

const defaultFeeders = [
  { id: crypto.randomUUID(), rating: 630, qty: 1, motorized: true, poles: 3 },
  { id: crypto.randomUUID(), rating: 800, qty: 2, motorized: true, poles: 3 },
  { id: crypto.randomUUID(), rating: 400, qty: 3, motorized: false, poles: 3 },
  { id: crypto.randomUUID(), rating: 100, qty: 3, motorized: false, poles: 3 },
  { id: crypto.randomUUID(), rating: 150, qty: 1, motorized: false, poles: 3 },
];

function currency(value) {
  return new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(Number(value) || 0);
}
function pct(v) { return `${((Number(v) || 0) * 100).toFixed(2)}%`; }
function titleCaseBrand(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const map = { SCHNEIDER: "Schneider", Schneider: "Schneider", LSIS: "LS", LSis: "LS", LOCAL: "Local", ALFANAR: "Alfanar" };
  return map[text] || text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
function normalizeProduct(product) {
  const p = String(product || "").trim();
  const map = { PART: "Part", EasyControl: "EasyControl", EASY: "Easy", CONTROL: "Control", RETAIL: "Retail", OTHER: "Other", other: "Other" };
  return map[p] || p;
}
function getDiscount(brand, product) { return discountRules[`${brand}|${product}`] ?? 0; }
function inferType(description = "", activity = "") {
  const text = `${description} ${activity}`.toLowerCase();
  if (text.includes("acb") || text.includes("ppacb") || text.includes("mtz") || text.includes("mvs")) return "ACB";
  if (text.includes("mccb") || text.includes("nsx") || text.includes("cvs") || text.includes("ezc") || text.includes("ppccb")) return "MCCB";
  if (text.includes("meter") || text.includes("powerlogic pm") || text.includes("pm53") || text.includes("pm55")) return "Meter";
  if (text.includes("current transformer") || text.includes("2500/5") || text.includes("ct ")) return "CT";
  if (text.includes("lamp")) return "Lamp";
  return "Other";
}
function extractRating(description = "") {
  const text = String(description || "");
  const candidates = [
    text.match(/\b(\d{2,4})\s*A\b/i),
    text.match(/\b(\d{2,4})A\b/i),
    text.match(/\bNSX\s?(\d{2,4})\b/i),
    text.match(/\bCVS\s?(\d{2,4})\b/i),
    text.match(/\bEZC\s?(\d{2,4})\b/i),
    text.match(/\bMVS\s?(\d{2,4})\b/i),
    text.match(/\bMTZ\d\s?(\d{2,4})\b/i),
  ].filter(Boolean);
  return candidates.length ? Number(candidates[0][1]) : 0;
}
function extractPoles(description = "") {
  const text = String(description || "").toUpperCase();
  if (text.includes("4P")) return 4;
  if (text.includes("3P")) return 3;
  return 0;
}
function parsePriceSheet(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const workbook = XLSX.read(e.target.result, { type: "array" });
    const pricesSheetName = workbook.SheetNames.find((name) => name.toLowerCase().includes("price")) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[pricesSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    const header = rows[0] || [];
    const idx = {
      reference: header.findIndex((h) => String(h).toLowerCase().includes("reference")),
      price: header.findIndex((h) => String(h).toLowerCase().includes("price")),
      brand: header.findIndex((h) => String(h).toLowerCase().includes("brand")),
      description: header.findIndex((h) => String(h).toLowerCase().includes("description")),
      activity: header.findIndex((h) => String(h).toLowerCase().includes("activity")),
      product: header.findIndex((h) => String(h).toLowerCase().includes("column1")) >= 0
        ? header.findIndex((h) => String(h).toLowerCase().includes("column1"))
        : header.findIndex((h) => String(h).toLowerCase().includes("product")),
    };
    const catalog = rows.slice(1)
      .filter((r) => r[idx.reference] && r[idx.price] && r[idx.description])
      .map((r, i) => {
        const brand = titleCaseBrand(r[idx.brand]);
        const product = normalizeProduct(r[idx.product]);
        const description = String(r[idx.description] || "").trim();
        const type = inferType(description, r[idx.activity]);
        const rating = extractRating(description);
        const poles = extractPoles(description);
        return {
          id: `xlsx-${i}`, family: type, description, brand, product,
          partNo: String(r[idx.reference] || "").trim(), rating, poles,
          price: Number(r[idx.price]) || 0, type, activity: String(r[idx.activity] || "").trim(),
        };
      })
      .filter((r) => ["ACB", "MCCB", "Meter", "CT", "Lamp"].includes(r.type));
    onDone({ sourceSheet: pricesSheetName, count: catalog.length, catalog: catalog.length ? catalog : seedCatalog });
  };
  reader.readAsArrayBuffer(file);
}
function addComputed(item, qty = 1) {
  const discount = getDiscount(item.brand, item.product);
  const net = (Number(item.price) || 0) * (1 - discount);
  return { ...item, qty: Number(qty) || 1, discount, net, total: (Number(qty) || 1) * net };
}
function scoreItem(item, requested) {
  let score = 0;
  score += Math.abs((Number(item.rating) || 0) - (Number(requested.rating) || 0)) * 10;
  if (requested.poles && item.poles && item.poles !== requested.poles) score += 50;
  if (requested.type && item.type !== requested.type) score += 500;
  if (requested.brand && item.brand !== requested.brand) score += 1000;
  if (requested.motorized && !/motor|mdo|drawout/i.test(item.description)) score += 25;
  return score;
}
function findBestItem({ catalog, type, rating, poles = 3, brand = "Schneider", motorized = false }) {
  const filtered = catalog.filter((c) => c.brand === brand && c.type === type);
  if (!filtered.length) return null;
  return [...filtered].sort((a, b) => scoreItem(a, { type, rating, poles, brand, motorized }) - scoreItem(b, { type, rating, poles, brand, motorized }))[0];
}
function estimateEnclosure(project, feeders) {
  const rule = enclosureSizingRules[project.panelType] || enclosureSizingRules.MDB;
  const feederQty = feeders.reduce((sum, f) => sum + (Number(f.qty) || 0), 0);
  const incomerFactor = Number(project.incomerRating) > 1600 ? 2 : 1;
  const sectionCount = Math.max(2, Math.ceil(feederQty / 4) + incomerFactor);
  const width = rule.baseWidth + Math.max(0, sectionCount - 2) * rule.sectionWidth;
  const height = rule.minHeight;
  const depth = Number(project.busbarRating) >= 2500 ? Math.max(rule.minDepth, 800) : rule.minDepth;
  return { sectionCount, width, height, depth, description: `${project.panelType} enclosure ${width}W x ${height}H x ${depth}D mm, ${sectionCount} sections` };
}
function motorizedAccessoryLines(baseItem, qty = 1) {
  const brandRules = motorizedAccessoryRules[baseItem.brand];
  if (!brandRules) return [];
  const rules = baseItem.type === "ACB" ? brandRules.ACB : brandRules.MCCB;
  if (!rules) return [];
  return rules.map((rule) =>
    addComputed({
      id: `${baseItem.id}-${rule.suffix}`, family: "Accessories",
      description: `${rule.description} for ${baseItem.partNo}`, brand: baseItem.brand, product: rule.product,
      partNo: `${baseItem.partNo}-${rule.suffix}`, rating: 0, poles: 0, price: rule.price, type: "Accessory",
    }, qty)
  );
}
function panelClass(base = "") { return `rounded-3xl border border-slate-200 bg-white shadow-sm ${base}`.trim(); }
function inputClass() { return "w-full rounded-2xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"; }
function selectClass() { return "w-full rounded-2xl border border-slate-300 px-3 py-2 bg-white"; }
function checkClass() { return "h-4 w-4 rounded border-slate-400"; }
function actionBtnClass(kind = "primary") {
  return kind === "primary"
    ? "inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
    : "inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50";
}
function ghostBtnClass() { return "inline-flex items-center rounded-2xl px-3 py-2 hover:bg-slate-100"; }

export default function App() {
  const [project, setProject] = useState(defaultProject);
  const [feeders, setFeeders] = useState(defaultFeeders);
  const [catalogState, setCatalogState] = useState({ sourceSheet: "Seed Catalog", count: seedCatalog.length, catalog: seedCatalog });

  const enclosureEstimate = useMemo(() => estimateEnclosure(project, feeders), [project, feeders]);
  const boq = useMemo(() => {
    const lines = [];
    const catalog = catalogState.catalog;
    const incomer = findBestItem({ catalog, type: "ACB", rating: Number(project.incomerRating), poles: 3, brand: project.breakerBrand, motorized: true });
    if (incomer) { lines.push(addComputed(incomer, 1)); lines.push(...motorizedAccessoryLines(incomer, 1)); }

    feeders.forEach((f) => {
      const item = findBestItem({ catalog, type: "MCCB", rating: Number(f.rating), poles: Number(f.poles) || 3, brand: project.breakerBrand, motorized: !!f.motorized });
      if (item) {
        lines.push(addComputed({ ...item, description: `${item.description} (${f.rating}A requested${f.motorized ? ", motorized" : ""})` }, Number(f.qty)));
        if (f.motorized) lines.push(...motorizedAccessoryLines(item, Number(f.qty)));
      }
    });

    const busbar = seedCatalog.find((c) => c.type === "Busbar");
    if (busbar) {
      const busbarPrice = busbar.price + Math.max(0, Number(project.busbarRating) - 2500) * 1.2;
      lines.push(addComputed({ ...busbar, rating: Number(project.busbarRating) || 2500, price: busbarPrice }, 1));
    }
    if (project.enclosure) {
      const enclosure = seedCatalog.find((c) => c.type === "Enclosure");
      if (enclosure) {
        const scaledPrice = enclosure.price + Math.max(0, enclosureEstimate.sectionCount - 2) * 1200;
        lines.push(addComputed({ ...enclosure, description: enclosureEstimate.description, price: scaledPrice }, 1));
      }
    }
    if (project.metering) {
      const meter = findBestItem({ catalog, type: "Meter", rating: 0, brand: "Schneider" }) || seedCatalog.find((c) => c.type === "Meter");
      const ct = findBestItem({ catalog, type: "CT", rating: Number(project.incomerRating), brand: "Schneider" }) || seedCatalog.find((c) => c.type === "CT");
      if (meter) lines.push(addComputed(meter, 1));
      if (ct) lines.push(addComputed({ ...ct, description: `${ct.description} (${project.incomerRating}/5A assumed)` }, 3));
    }
    if (project.signalling) {
      const lamps = seedCatalog.find((c) => c.type === "Lamp");
      if (lamps) lines.push(addComputed(lamps, 1));
    }
    ["Wiring", "Accessory", "Service", "Transport"].forEach((type) => {
      const item = seedCatalog.find((c) => c.type === type);
      if (item) lines.push(addComputed(item, 1));
    });
    lines.push({ id: "labour", family: "Labour", description: "Factory labour / assembly / testing", brand: "Local", product: "Labour", partNo: "LABOUR", qty: 1, price: Number(project.labour) || 0, discount: 0, net: Number(project.labour) || 0, total: Number(project.labour) || 0, type: "Labour" });
    return lines;
  }, [catalogState.catalog, enclosureEstimate, feeders, project]);

  const totals = useMemo(() => {
    const material = boq.reduce((sum, row) => sum + row.total, 0);
    const profit = material * ((Number(project.profitPct) || 0) / 100);
    const beforeVat = material + profit;
    const vat = beforeVat * ((Number(project.vatPct) || 0) / 100);
    const final = beforeVat + vat;
    return { material, profit, beforeVat, vat, final };
  }, [boq, project.profitPct, project.vatPct]);

  const updateProject = (key, value) => setProject((p) => ({ ...p, [key]: value }));
  const addFeeder = () => setFeeders((prev) => [...prev, { id: crypto.randomUUID(), rating: 100, qty: 1, motorized: false, poles: 3 }]);
  const updateFeeder = (id, key, value) => setFeeders((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  const removeFeeder = (id) => setFeeders((prev) => prev.filter((f) => f.id !== id));

  const exportCsv = () => {
    const rows = [["Project", project.projectName], ["Client", project.clientName], ["Source Sheet", catalogState.sourceSheet], ["Imported Items", catalogState.count], [], ["Description", "Brand", "Product", "Part No", "Qty", "Unit Price", "Discount", "Net Unit Price", "Total"], ...boq.map((r) => [r.description, r.brand, r.product, r.partNo, r.qty, r.price, `${(r.discount * 100).toFixed(2)}%`, r.net, r.total]), [], ["Material Total", totals.material], ["Profit", totals.profit], ["Before VAT", totals.beforeVat], ["VAT", totals.vat], ["Final", totals.final]];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.projectName || "panel-estimation"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <style>{`@media print { body { background: white; } .no-print { display: none !important; } .print-shell { box-shadow: none !important; border: 1px solid #d1d5db !important; } }`}</style>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="no-print flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Online Panel Estimation Program</h1>
            <p className="text-sm text-slate-600">Upload your price sheet, auto-pick breakers, add motorized accessories, size the enclosure, and print a quotation.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCsv} className={actionBtnClass("primary")}><Download className="mr-2 h-4 w-4" /> Export CSV</button>
            <button onClick={() => window.print()} className={actionBtnClass("secondary")}><Printer className="mr-2 h-4 w-4" /> Print</button>
          </div>
        </div>

        <div className={panelClass("no-print border-dashed border-2")}>
          <div className="border-b p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><Upload className="h-5 w-5" /> Price Sheet Import</h2></div>
          <div className="grid gap-4 p-6 md:grid-cols-3 md:items-end">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Upload Excel price sheet</label>
              <input className={inputClass()} type="file" accept=".xlsx,.xls" onChange={(e) => { const file = e.target.files?.[0]; if (file) parsePriceSheet(file, setCatalogState); }} />
              <p className="text-xs text-slate-500">The parser reads the Prices sheet and extracts ACB, MCCB, meter, CT, and lamp items from your uploaded file.</p>
            </div>
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><Database className="h-4 w-4" /> Active Catalog</div>
              <div className="mt-2 text-sm text-slate-600">Sheet: {catalogState.sourceSheet}</div>
              <div className="text-sm text-slate-600">Imported items: {catalogState.count}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className={panelClass("lg:col-span-2 no-print")}>
            <div className="border-b p-6"><h2 className="text-xl font-semibold">Project Inputs</h2></div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[["Project Name", "projectName"], ["Client Name", "clientName"], ["Form of Separation", "form"], ["IP Rating", "ipRating"], ["Mounting", "mounting"], ["Indoor / Outdoor", "location"], ["Short Circuit", "scc"], ["Warranty", "warranty"], ["Delivery", "delivery"], ["Company Name", "companyName"]].map(([label, key]) => (
                <div className={`space-y-2 ${key === "companyName" ? "md:col-span-2" : ""}`} key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input className={inputClass()} value={project[key]} onChange={(e) => updateProject(key, e.target.value)} />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-sm font-medium">Panel Type</label>
                <select className={selectClass()} value={project.panelType} onChange={(e) => updateProject("panelType", e.target.value)}>
                  {["MDB", "SMDB", "DB", "MCC", "ATS", "Synchronizing", "PFC", "Control Panel"].map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Breaker Brand</label>
                <select className={selectClass()} value={project.breakerBrand} onChange={(e) => updateProject("breakerBrand", e.target.value)}>
                  {["Schneider", "ABB", "LS", "Alfanar"].map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              {[["Incomer Rating (A)", "incomerRating"], ["Busbar Rating (A)", "busbarRating"], ["Factory Labour (SAR)", "labour"], ["Profit %", "profitPct"], ["VAT %", "vatPct"]].map(([label, key]) => (
                <div className="space-y-2" key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input className={inputClass()} type="number" value={project[key]} onChange={(e) => updateProject(key, e.target.value)} />
                </div>
              ))}

              <label className="flex items-center gap-3 rounded-2xl border p-3">
                <input className={checkClass()} type="checkbox" checked={project.metering} onChange={(e) => updateProject("metering", e.target.checked)} />
                <span className="text-sm font-medium">Metering required</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border p-3">
                <input className={checkClass()} type="checkbox" checked={project.signalling} onChange={(e) => updateProject("signalling", e.target.checked)} />
                <span className="text-sm font-medium">Signalling required</span>
              </label>
              <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border p-3">
                <input className={checkClass()} type="checkbox" checked={project.enclosure} onChange={(e) => updateProject("enclosure", e.target.checked)} />
                <span className="text-sm font-medium">Enclosure required</span>
              </label>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea className={inputClass()} rows="4" value={project.notes} onChange={(e) => updateProject("notes", e.target.value)} placeholder="Special requirements, cable entry, approvals, indoor/outdoor, etc." />
              </div>
            </div>
          </div>

          <div className={panelClass("print-shell")}>
            <div className="border-b p-6"><h2 className="text-xl font-semibold">Price Summary</h2></div>
            <div className="space-y-4 p-6">
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-slate-500">Material + Labour</div>
                <div className="text-2xl font-bold">{currency(totals.material)}</div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between text-sm"><span>Profit</span><span>{currency(totals.profit)}</span></div>
                <div className="flex items-center justify-between text-sm"><span>Before VAT</span><span>{currency(totals.beforeVat)}</span></div>
                <div className="flex items-center justify-between text-sm"><span>VAT</span><span>{currency(totals.vat)}</span></div>
                <div className="border-t pt-3 flex items-center justify-between text-base font-semibold"><span>Final Price</span><span>{currency(totals.final)}</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[project.panelType, project.breakerBrand, project.ipRating, project.form].map((x) => <span key={x} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{x}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div className={panelClass("no-print")}>
          <div className="border-b p-6 flex flex-row items-center justify-between">
            <h2 className="text-xl font-semibold">Outgoing Feeders</h2>
            <button className={actionBtnClass("secondary")} onClick={addFeeder}><Plus className="mr-2 h-4 w-4" /> Add Feeder</button>
          </div>
          <div className="space-y-3 p-6">
            {feeders.map((f, index) => (
              <div key={f.id} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-12">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium">Feeder #{index + 1} Rating (A)</label>
                  <input className={inputClass()} type="number" value={f.rating} onChange={(e) => updateFeeder(f.id, "rating", e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Qty</label>
                  <input className={inputClass()} type="number" value={f.qty} onChange={(e) => updateFeeder(f.id, "qty", e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Poles</label>
                  <select className={selectClass()} value={String(f.poles)} onChange={(e) => updateFeeder(f.id, "poles", Number(e.target.value))}>
                    <option value="3">3P</option>
                    <option value="4">4P</option>
                  </select>
                </div>
                <label className="md:col-span-3 flex items-center gap-3 pt-8">
                  <input className={checkClass()} type="checkbox" checked={!!f.motorized} onChange={(e) => updateFeeder(f.id, "motorized", e.target.checked)} />
                  <span className="text-sm font-medium">Motorized</span>
                </label>
                <div className="md:col-span-2 flex items-end justify-end">
                  <button className={ghostBtnClass()} onClick={() => removeFeeder(f.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={panelClass("print-shell")}>
          <div className="border-b p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><Package className="h-5 w-5" /> Enclosure Sizing</h2></div>
          <div className="p-6">
            <div className="grid gap-3 md:grid-cols-4 text-sm">
              {[
                ["Sections", enclosureEstimate.sectionCount],
                ["Width", `${enclosureEstimate.width} mm`],
                ["Height", `${enclosureEstimate.height} mm`],
                ["Depth", `${enclosureEstimate.depth} mm`],
              ].map(([label, value]) => <div key={label} className="rounded-2xl border p-4"><div className="text-slate-500">{label}</div><div className="text-xl font-semibold">{value}</div></div>)}
            </div>
            <div className="mt-4 rounded-2xl border p-4 text-sm text-slate-700">{enclosureEstimate.description}</div>
          </div>
        </div>

        <div className={panelClass("print-shell")}>
          <div className="border-b p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><Calculator className="h-5 w-5" /> Auto BOQ / Estimation</h2></div>
          <div className="overflow-x-auto p-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-100 text-left">
                  {["Description", "Brand", "Product", "Part No", "Qty", "Unit Price", "Discount", "Net", "Total"].map((h) => <th key={h} className="p-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {boq.map((row, idx) => (
                  <tr key={`${row.id || row.partNo}-${idx}`} className="border-b">
                    <td className="p-3">{row.description}</td>
                    <td className="p-3">{row.brand}</td>
                    <td className="p-3">{row.product}</td>
                    <td className="p-3">{row.partNo}</td>
                    <td className="p-3">{row.qty}</td>
                    <td className="p-3">{currency(row.price)}</td>
                    <td className="p-3">{pct(row.discount)}</td>
                    <td className="p-3">{currency(row.net)}</td>
                    <td className="p-3 font-medium">{currency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={panelClass("print-shell")}>
          <div className="border-b p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><FileText className="h-5 w-5" /> Quotation Print Page</h2></div>
          <div className="p-6">
            <div className="rounded-2xl border p-6 space-y-5">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold">{project.companyName}</div>
                <div className="text-sm text-slate-600">Technical & Commercial Offer</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 text-sm">
                {[
                  ["Project", project.projectName || "-"], ["Client", project.clientName || "-"], ["Panel Type", project.panelType], ["Voltage", project.voltage],
                  ["IP Rating", project.ipRating], ["Form", project.form], ["Busbar", `${project.busbarRating}A`], ["Short Circuit", project.scc],
                  ["Mounting", project.mounting], ["Location", project.location],
                ].map(([label, value]) => <div key={label}><span className="font-medium">{label}:</span> {value}</div>)}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      {["Description", "Part No", "Qty", "Net Unit", "Total"].map((h) => <th key={h} className="border p-2">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {boq.map((row, idx) => (
                      <tr key={`print-${idx}`}>
                        <td className="border p-2">{row.description}</td>
                        <td className="border p-2">{row.partNo}</td>
                        <td className="border p-2">{row.qty}</td>
                        <td className="border p-2">{currency(row.net)}</td>
                        <td className="border p-2">{currency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div className="space-y-2">
                  <div><span className="font-medium">Warranty:</span> {project.warranty}</div>
                  <div><span className="font-medium">Delivery:</span> {project.delivery}</div>
                  <div><span className="font-medium">Validity:</span> {project.validity}</div>
                </div>
                <div className="space-y-2 text-right">
                  <div><span className="font-medium">Before VAT:</span> {currency(totals.beforeVat)}</div>
                  <div><span className="font-medium">VAT:</span> {currency(totals.vat)}</div>
                  <div className="text-lg font-bold"><span>Final Price:</span> {currency(totals.final)}</div>
                </div>
              </div>
              <div className="text-sm text-slate-600">{project.notes || "No additional notes."}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
