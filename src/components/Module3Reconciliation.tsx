import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  CheckSquare,
  FileSpreadsheet,
  Printer,
  Download,
  AlertTriangle,
  Lock,
  ChevronRight,
  UserCheck,
  Building,
  Check,
  Ban,
  Layers,
  Sparkles,
  ArrowLeft,
  Calendar,
  X,
  Plus,
  Link as LinkIcon,
  CheckCircle2,
  Eye,
  FileCheck,
  Clock,
  FileText
} from 'lucide-react';
import { ProductionOrder, ReconciliationSheet, InvoiceItem } from '../types/poshaco';
import { AGENCIES_LIST } from '../data/mockData';

const CONTRACTOR_PROFILES = [
  { code: 'THO-BG-01', name: 'Vũ Đình Toàn', phone: '0987654321', agencyCode: 'DOHU-BG', address: 'Việt Yên, Bắc Giang' },
  { code: 'THO-BK-02', name: 'Trần Sông Thao', phone: '0372283663', agencyCode: 'KHHO-BK', address: 'Phủ Thông, Bạch Thông, Bắc Kạn' },
  { code: 'THO-TQ-03', name: 'Đặng Văn Hưng', phone: '0915667788', agencyCode: 'BCTS-TQ', address: 'Yên Sơn, Tuyên Quang' },
  { code: 'THO-TH-04', name: 'A ĐIỆN', phone: '0904123987', agencyCode: 'SOMA-TH', address: 'Sông Mã, Thanh Hóa' },
  { code: 'THO-TN-05', name: 'Phạm Quang Minh', phone: '0988776655', agencyCode: 'YETI-TN', address: 'Đồng Hỷ, Thái Nguyên' },
  { code: 'THO-BG-06', name: 'Hoàng Văn Khiêm', phone: '0933221100', agencyCode: 'HUHUY-BK', address: 'Chợ Mới, Bắc Kạn' },
];

interface Module3ReconciliationProps {
  orders: ProductionOrder[];
  invoices?: InvoiceItem[];
  sheets?: ReconciliationSheet[];
  onAddSheet?: (sheet: ReconciliationSheet) => void;
  onUpdateSheet?: (sheet: ReconciliationSheet) => void;
  onUpdateOrder: (updated: ProductionOrder) => void;
  onAddOrder: (newOrder: ProductionOrder) => void;
  onApproveReconciliationSheet?: (sheet: ReconciliationSheet) => void;
  onNavigateToPayout?: () => void;
}

export const Module3Reconciliation: React.FC<Module3ReconciliationProps> = ({
  orders,
  invoices = [],
  sheets = [],
  onAddSheet,
  onUpdateSheet,
  onUpdateOrder,
  onAddOrder,
  onApproveReconciliationSheet,
  onNavigateToPayout,
}) => {
  // Navigation View Mode: 'SHEETS_LIST' (Danh sách phiếu) or 'CREATE_SHEET' (Gom đơn & Tạo phiếu)
  const [viewMode, setViewMode] = useState<'SHEETS_LIST' | 'CREATE_SHEET'>('SHEETS_LIST');

  // Sheet filter states
  const [sheetSearchKeyword, setSheetSearchKeyword] = useState<string>('');
  const [sheetFilterAgency, setSheetFilterAgency] = useState<string>('ALL');
  const [sheetFilterStatus, setSheetFilterStatus] = useState<string>('ALL');

  // Selected Order IDs for current reconciliation sheet
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Preview A4 Landscape State
  const [activeSheet, setActiveSheet] = useState<ReconciliationSheet | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);

  // Form states for new order
  const [selectedContractorKey, setSelectedContractorKey] = useState('THO-BG-01');
  const [newAgencyCode, setNewAgencyCode] = useState(AGENCIES_LIST[0].code);
  const [newContractorName, setNewContractorName] = useState('Vũ Đình Toàn');
  const [newContractorPhone, setNewContractorPhone] = useState('0987654321');
  const [newContractorCode, setNewContractorCode] = useState('THO-BG-01');
  const [newProductName, setNewProductName] = useState('Tôn mạ màu POSHACO S-Series 0.40mm');
  const [newProductionMd, setNewProductionMd] = useState<number>(125.5);
  const [selectedSyncedInvoiceCodes, setSelectedSyncedInvoiceCodes] = useState<string[]>([]);
  const [alertSuccessBanner, setAlertSuccessBanner] = useState<string | null>(null);

  // Available synced invoices from Module 2
  const availableSyncedInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.contractorPhone === newContractorPhone ||
        inv.contractorName.toLowerCase() === newContractorName.toLowerCase() ||
        inv.agencyCode === newAgencyCode
    );
  }, [invoices, newContractorPhone, newContractorName, newAgencyCode]);

  // Toggle synced invoice selection & auto-calculate total md
  const handleToggleSyncedInvoice = (inv: InvoiceItem) => {
    const isSelected = selectedSyncedInvoiceCodes.includes(inv.code);
    const nextCodes = isSelected
      ? selectedSyncedInvoiceCodes.filter((c) => c !== inv.code)
      : [...selectedSyncedInvoiceCodes, inv.code];
    setSelectedSyncedInvoiceCodes(nextCodes);

    // Tính tổng sản lượng (md) dựa vào tổng số md trên các đơn hàng đã chọn
    const matchingInvoices = invoices.filter((i) => nextCodes.includes(i.code));
    if (matchingInvoices.length > 0) {
      const sumMd = matchingInvoices.reduce((sum, item) => sum + item.areaM2, 0);
      setNewProductionMd(Number(sumMd.toFixed(2)));
      setNewProductName(matchingInvoices[0].productDescription || 'Tôn Poshaco theo đơn hàng');
    }
  };

  // RULE 2: RÀNG BUỘC 1 THỢ - 1 ĐẠI LÝ
  // Identify the anchor pair from the first selected item
  const selectedOrders = useMemo(() => {
    return orders.filter(o => selectedOrderIds.includes(o.id));
  }, [orders, selectedOrderIds]);

  const activePair = useMemo(() => {
    if (selectedOrders.length === 0) return null;
    const first = selectedOrders[0];
    return {
      contractorCode: first.contractorCode,
      contractorName: first.contractorName,
      contractorPhone: first.contractorPhone,
      agencyCode: first.agencyCode,
      agencyName: first.agencyName,
    };
  }, [selectedOrders]);

  // Compute total selected md
  const totalSelectedMd = useMemo(() => {
    return selectedOrders.reduce((sum, o) => sum + o.productionMd, 0);
  }, [selectedOrders]);

  // Checkbox toggle logic
  const handleToggleSelectOrder = (order: ProductionOrder) => {
    if (order.reconciledInSheetId) {
      alert(`Đơn hàng ${order.orderCode} đã nằm trong phiếu đối soát ${order.reconciledInSheetId}!`);
      return;
    }

    if (selectedOrderIds.includes(order.id)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
    } else {
      // Check rule 1 Thợ - 1 Đại lý
      if (activePair) {
        if (
          order.contractorCode !== activePair.contractorCode ||
          order.agencyCode !== activePair.agencyCode
        ) {
          alert(
            `RÀNG BUỘC ĐỐI SOÁT:\nChỉ được đối soát các đơn cùng Thợ (${activePair.contractorName}) và cùng Đại lý (${activePair.agencyName}).\nVui lòng hoàn tất hoặc hủy chọn các đơn hiện tại để chọn cặp Thợ - Đại lý khác.`
          );
          return;
        }
      }
      setSelectedOrderIds([...selectedOrderIds, order.id]);
    }
  };

  // Quick toggle all matching current active pair (or first group)
  const handleSelectAllGroup = (groupOrders: ProductionOrder[]) => {
    const selectable = groupOrders.filter(o => !o.reconciledInSheetId);
    if (selectable.length === 0) return;

    const first = selectable[0];
    if (activePair && (activePair.contractorCode !== first.contractorCode || activePair.agencyCode !== first.agencyCode)) {
      alert(`Đang chọn đơn của cặp ${activePair.contractorName} - ${activePair.agencyName}. Bỏ chọn các đơn trước để chuyển sang nhóm này.`);
      return;
    }

    const allGroupSelected = selectable.every(o => selectedOrderIds.includes(o.id));
    if (allGroupSelected) {
      const idsToRemove = new Set(selectable.map(o => o.id));
      setSelectedOrderIds(selectedOrderIds.filter(id => !idsToRemove.has(id)));
    } else {
      const newIds = Array.from(new Set([...selectedOrderIds, ...selectable.map(o => o.id)]));
      setSelectedOrderIds(newIds);
    }
  };

  // Quick approval/rejection of single row
  const handleQuickStatusChange = (order: ProductionOrder, status: 'Đã duyệt' | 'Từ chối') => {
    onUpdateOrder({ ...order, status });
  };

  // Generate Reconciliation Sheet
  const handleGenerateSheet = (autoApprove = true) => {
    if (selectedOrders.length === 0) {
      alert('Vui lòng chọn ít nhất 1 đơn hàng để tạo phiếu đối soát!');
      return;
    }

    const first = selectedOrders[0];
    const sheet: ReconciliationSheet = {
      id: `pds-${Date.now()}`,
      sheetCode: `PDS-2026-09-${Math.floor(100 + Math.random() * 900)}`,
      createdDate: new Date().toLocaleDateString('vi-VN'),
      period: 'Tháng 09/2026',
      contractorCode: first.contractorCode,
      contractorName: first.contractorName,
      contractorPhone: first.contractorPhone,
      contractorAddress: first.contractorAddress,
      agencyCode: first.agencyCode,
      agencyName: first.agencyName,
      agencyAddress: first.agencyAddress,
      orders: selectedOrders,
      totalMd: Number(totalSelectedMd.toFixed(2)),
      notes: 'Sản lượng đã xác thực qua phiếu giao nhận và công nợ thực tế.',
      status: autoApprove ? 'Đã duyệt' : 'Chờ duyệt',
    };

    if (onAddSheet) {
      onAddSheet(sheet);
    }

    setActiveSheet(sheet);

    // LOGIC THỢ XÁC NHẬN:
    // Khi người quản trị tạo phiếu đối soát sản lượng có trạng thái duyệt,
    // hệ thống tự động chuyển trạng thái đơn hàng bên danh sách hóa đơn thành Thợ Xác nhận
    if (autoApprove && onApproveReconciliationSheet) {
      onApproveReconciliationSheet(sheet);
      setAlertSuccessBanner(
        `✓ Đã duyệt phiếu đối soát ${sheet.sheetCode}! Toàn bộ đơn hàng của Thợ ${sheet.contractorName} đã tự động chuyển sang trạng thái "Thợ xác nhận" và sẵn sàng chi trả trong menu Chi trả.`
      );
    }
  };

  // Duyệt phiếu đối soát từ danh sách
  const handleApproveSheetFromList = (sheet: ReconciliationSheet) => {
    if (onApproveReconciliationSheet) {
      onApproveReconciliationSheet(sheet);
    }
    if (onUpdateSheet) {
      onUpdateSheet({ ...sheet, status: 'Đã duyệt' });
    }
    setAlertSuccessBanner(
      `✓ Đã duyệt phiếu đối soát ${sheet.sheetCode}! Toàn bộ đơn hàng của Thợ ${sheet.contractorName} đã tự động chuyển sang trạng thái "Thợ xác nhận" và sẵn sàng chi trả trong menu Chi trả.`
    );
  };

  // Filtered sheets
  const filteredSheets = useMemo(() => {
    return (sheets || []).filter((s) => {
      const matchKeyword =
        !sheetSearchKeyword.trim() ||
        s.sheetCode.toLowerCase().includes(sheetSearchKeyword.toLowerCase()) ||
        s.contractorName.toLowerCase().includes(sheetSearchKeyword.toLowerCase()) ||
        s.contractorPhone.includes(sheetSearchKeyword) ||
        s.agencyName.toLowerCase().includes(sheetSearchKeyword.toLowerCase());

      const matchAgency =
        sheetFilterAgency === 'ALL' || s.agencyCode === sheetFilterAgency;
      const matchStatus =
        sheetFilterStatus === 'ALL' || s.status === sheetFilterStatus;

      return matchKeyword && matchAgency && matchStatus;
    });
  }, [sheets, sheetSearchKeyword, sheetFilterAgency, sheetFilterStatus]);

  // Export CSV
  const handleExportCsv = (sheetToExport?: ReconciliationSheet) => {
    const sheet = sheetToExport || activeSheet;
    const ordersToExport = sheet ? sheet.orders : selectedOrders.length > 0 ? selectedOrders : orders;

    // Header UTF-8 BOM
    let csvContent = '\uFEFF';

    if (sheet) {
      csvContent += `PHIẾU XÁC NHẬN & ĐỐI SOÁT SẢN LƯỢNG THẦU / THỢ\n`;
      csvContent += `Mã phiếu:,${sheet.sheetCode},Ngày lập:,${sheet.createdDate}\n`;
      csvContent += `Thầu / Thợ:,${sheet.contractorName} (${sheet.contractorPhone}),Mã thợ:,${sheet.contractorCode}\n`;
      csvContent += `Đại lý:,${sheet.agencyName},Mã đại lý:,${sheet.agencyCode}\n`;
      csvContent += `Kỳ đối soát:,${sheet.period}\n\n`;
      csvContent += `STT,Mã đơn hàng,Ngày nhập đơn,Sản lượng (md)\n`;

      sheet.orders.forEach((ord, index) => {
        csvContent += `${index + 1},${ord.orderCode},${ord.entryDate},${ord.productionMd}\n`;
      });

      csvContent += `,,,Tổng SL đơn (md): ${sheet.totalMd}\n`;
    } else {
      csvContent += `STT,Mã Thầu/Thợ,Họ tên,SĐT,Mã đơn,Ngày nhập đơn,Mã Đại lý,Tên Đại lý,Sản phẩm,Sản lượng (md),Trạng thái\n`;
      ordersToExport.forEach((ord, index) => {
        csvContent += `${index + 1},${ord.contractorCode},"${ord.contractorName}",${ord.contractorPhone},${ord.orderCode},${ord.entryDate},${ord.agencyCode},"${ord.agencyName}","${ord.productName}",${ord.productionMd},${ord.status}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', sheet ? `Phieu_doi_soat_${sheet.sheetCode}.csv` : `Danh_sach_doi_soat_Poshaco.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print A4
  const handlePrint = () => {
    window.print();
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchKeyword = !searchKeyword.trim() ||
      o.contractorName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      o.contractorPhone.includes(searchKeyword) ||
      o.orderCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      o.agencyName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchAgency = filterAgency === 'ALL' || o.agencyCode === filterAgency;
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;

    return matchKeyword && matchAgency && matchStatus;
  });

  // Group by Contractor Code
  const groupedOrders = useMemo(() => {
    const map = new Map<string, { contractor: ProductionOrder; items: ProductionOrder[] }>();
    filteredOrders.forEach(ord => {
      const key = `${ord.contractorCode}_${ord.agencyCode}`;
      if (!map.has(key)) {
        map.set(key, { contractor: ord, items: [] });
      }
      map.get(key)!.items.push(ord);
    });
    return Array.from(map.values());
  }, [filteredOrders]);

  return (
    <div className="space-y-5">
      {/* If Preview Sheet is Active -> Render Clean A4 Landscape View */}
      {activeSheet ? (
        <div className="space-y-4">
          {/* Action Toolbar above print preview (Hidden during actual print) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5EAEC] shadow-xs no-print">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveSheet(null);
                  setViewMode('SHEETS_LIST');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAEC] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại danh sách phiếu</span>
              </button>
              <div className="h-4 w-px bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-800">
                Xem trước Phiếu đối soát ({activeSheet.sheetCode})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                activeSheet.status === 'Đã duyệt'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {activeSheet.status === 'Đã duyệt' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span>Trạng thái: {activeSheet.status === 'Đã duyệt' ? 'ĐÃ DUYỆT (Thợ xác nhận)' : 'CHỜ DUYỆT'}</span>
              </span>

              {activeSheet.status === 'Chờ duyệt' && (
                <button
                  onClick={() => {
                    handleApproveSheetFromList(activeSheet);
                    setActiveSheet({ ...activeSheet, status: 'Đã duyệt' });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Duyệt phiếu đối soát</span>
                </button>
              )}

              {onNavigateToPayout && (
                <button
                  onClick={onNavigateToPayout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Chuyển sang Menu Chi trả</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F3864] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#152747] transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Xuất phiếu / In (A4)</span>
              </button>

              <button
                onClick={() => handleExportCsv(activeSheet)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0FA3A3] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0c8787] transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Xuất CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* A4 PRINT PREVIEW CONTAINER (Matching Screenshot & A4 Specifications) */}
          <div
            id="print-area"
            className="mx-auto w-full max-w-4xl bg-white p-8 md:p-12 rounded-xl border border-[#E5EAEC] shadow-sm text-slate-900 print:p-0 print:border-none print:shadow-none"
          >
            {/* Header POSHACO GROUP */}
            <div className="border-b-2 border-[#1F3864] pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight text-[#1F3864]">POSHACO</span>
                  <span className="text-2xl font-bold tracking-tight text-[#0FA3A3]">GROUP</span>
                  <div className="ml-1 flex h-4 w-4 items-center justify-center">
                    <span className="inline-block h-2.5 w-2.5 rotate-45 bg-[#EAB308]"></span>
                    <span className="-ml-1 inline-block h-2.5 w-2.5 rotate-45 bg-[#0FA3A3]"></span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Mã phiếu: <strong>{activeSheet.sheetCode}</strong></div>
                  <div>Ngày lập phiếu: {activeSheet.createdDate}</div>
                </div>
              </div>

              {/* Title Navy #1F3864 */}
              <div className="text-center mt-5">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-wide text-[#1F3864]">
                  PHIẾU XÁC NHẬN & ĐỐI SOÁT SẢN LƯỢNG THẦU / THỢ
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Kỳ đối soát: <strong className="text-slate-800">{activeSheet.period}</strong>
                </p>
              </div>
            </div>

            {/* Thẻ thống kê tinh gọn: Thông tin Thợ & Đại lý */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs bg-[#F4F7F8] p-4 rounded-xl border border-[#E5EAEC]">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  1. THÔNG TIN THẦU / THỢ
                </div>
                <div className="text-slate-800 font-bold text-sm">
                  {activeSheet.contractorName}
                </div>
                <div className="text-slate-600">
                  Mã Thợ: <span className="font-mono font-semibold">{activeSheet.contractorCode}</span> · SĐT: <span className="font-mono font-semibold">{activeSheet.contractorPhone}</span>
                </div>
                <div className="text-slate-500">
                  Địa bàn thi công: {activeSheet.contractorAddress}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-[#E5EAEC] sm:pl-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  2. THÔNG TIN ĐẠI LÝ PHÁT SINH
                </div>
                <div className="text-slate-800 font-bold text-sm">
                  {activeSheet.agencyName}
                </div>
                <div className="text-slate-600">
                  Mã Đại lý: <span className="font-mono font-semibold">{activeSheet.agencyCode}</span>
                </div>
                <div className="text-slate-500">
                  Địa chỉ kho: {activeSheet.agencyAddress}
                </div>
              </div>
            </div>

            {/* BẢNG PHIẾU ĐỐI SOÁT: CHỈ GỒM 4 CỘT CHÍNH (Theo đúng yêu cầu nghiệp vụ) */}
            <div className="mb-4">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-[#1F3864] text-white">
                    <th className="py-2.5 px-3 border border-slate-400 w-12 text-center font-bold">
                      1. STT
                    </th>
                    <th className="py-2.5 px-4 border border-slate-400 font-bold">
                      2. Mã đơn hàng
                    </th>
                    <th className="py-2.5 px-4 border border-slate-400 text-center font-bold">
                      3. Ngày nhập đơn
                    </th>
                    <th className="py-2.5 px-4 border border-slate-400 text-right font-bold">
                      4. Sản lượng (md)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeSheet.orders.map((ord, idx) => (
                    <tr key={ord.id} className="border-b border-slate-300">
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 border border-slate-300 font-mono font-semibold text-slate-800">
                        {ord.orderCode}
                        <div className="text-[10px] text-slate-500 font-sans font-normal truncate max-w-sm">
                          {ord.productName}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 border border-slate-300 text-center font-mono text-slate-700">
                        {ord.entryDate}
                      </td>
                      <td className="py-2.5 px-4 border border-slate-300 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {ord.productionMd.toFixed(1)} md
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PHẦN TỔNG HỢP KỲ ĐỐI SOÁT: Khối màu xanh lá nhạt / xanh phấn #DCE6F1 */}
            <div className="mb-8 rounded-lg border border-[#B8CCE4] bg-[#DCE6F1] p-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                    TỔNG HỢP KỲ ĐỐI SOÁT ({activeSheet.orders.length} ĐƠN HÀNG)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {activeSheet.notes}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-700 font-medium mr-2">Tổng SL đơn (md):</span>
                  <span className="text-xl font-black font-mono text-[#1F3864] tabular-nums">
                    {activeSheet.totalMd.toFixed(1)} md
                  </span>
                </div>
              </div>
            </div>

            {/* KHỐI CHỮ KÝ 2 BÊN TRANG TRỌNG */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 mb-16">
              {/* Bên trái: CHỦ ĐẠI LÝ */}
              <div className="space-y-1">
                <div className="font-bold text-slate-800 uppercase tracking-wide">
                  CHỦ ĐẠI LÝ
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  (Ký, ghi rõ họ tên & đóng dấu xác nhận)
                </div>
                <div className="h-24"></div>
                <div className="font-semibold text-slate-800">{activeSheet.agencyName}</div>
              </div>

              {/* Bên phải: THẦU/ THỢ PHÁT SINH SẢN LƯỢNG */}
              <div className="space-y-1">
                <div className="font-bold text-slate-800 uppercase tracking-wide">
                  THẦU / THỢ PHÁT SINH SẢN LƯỢNG
                </div>
                <div className="text-[11px] text-slate-400 italic">
                  (Ký và ghi rõ họ tên)
                </div>
                <div className="h-24"></div>
                <div className="font-semibold text-slate-800">{activeSheet.contractorName}</div>
              </div>
            </div>

            {/* Print Footer */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
              Phiếu đối soát được lập tự động từ Hệ thống POSHACO PRO · Hotline hỗ trợ: 1900 8686 · www.poshaco.vn
            </div>
          </div>
        </div>
      ) : (
        /* DASHBOARD: Quản lý & Duyệt Phiếu đối soát sản lượng */
        <div className="space-y-5 pb-20">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span>Chương trình Poshaco Pro</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="text-slate-800 font-medium">Phiếu đối soát sản lượng</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
                Quản lý & Duyệt Phiếu đối soát sản lượng
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewOrderModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAEC] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Plus className="h-4 w-4 text-[#0FA3A3]" />
                <span>Nhập đơn mới</span>
              </button>

              <button
                onClick={() => handleExportCsv()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E5EAEC] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="h-4 w-4 text-slate-500" />
                <span>Xuất file Excel/CSV</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs: Danh sách Phiếu đối soát vs Gom đơn & Tạo phiếu mới */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAEC] pt-1">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setViewMode('SHEETS_LIST')}
                className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                  viewMode === 'SHEETS_LIST'
                    ? 'text-[#0FA3A3] border-b-2 border-[#0FA3A3]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Danh sách Phiếu đối soát</span>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-[#0FA3A3]">
                  {sheets.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('CREATE_SHEET')}
                className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                  viewMode === 'CREATE_SHEET'
                    ? 'text-[#0FA3A3] border-b-2 border-[#0FA3A3]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Gom đơn & Tạo phiếu mới</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                  {orders.length} đơn
                </span>
              </button>
            </div>

            {viewMode === 'SHEETS_LIST' && (
              <button
                type="button"
                onClick={() => setViewMode('CREATE_SHEET')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0FA3A3] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0c8787] transition-all cursor-pointer mb-2"
              >
                <Plus className="h-4 w-4" />
                <span>+ Gom đơn & Tạo phiếu mới</span>
              </button>
            )}
          </div>

          {/* Banner thông báo tự động chuyển sang Thợ xác nhận khi duyệt phiếu */}
          {alertSuccessBanner && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="leading-relaxed">{alertSuccessBanner}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onNavigateToPayout && (
                  <button
                    onClick={onNavigateToPayout}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0FA3A3] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c8787]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Đến Menu Chi trả</span>
                  </button>
                )}
                <button
                  onClick={() => setAlertSuccessBanner(null)}
                  className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DANH SÁCH PHIẾU ĐỐI SOÁT */}
          {viewMode === 'SHEETS_LIST' && (
            <div className="space-y-4">
              {/* Thống kê nhanh */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số phiếu</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{sheets.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Tất cả kỳ đối soát</div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Phiếu đã duyệt</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                    {sheets.filter(s => s.status === 'Đã duyệt').length}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Thợ đã xác nhận</div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Chờ duyệt</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-800 mt-1">
                    {sheets.filter(s => s.status === 'Chờ duyệt').length}
                  </div>
                  <div className="text-[11px] text-amber-600 mt-0.5">Chờ chốt sản lượng</div>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-[#0FA3A3] uppercase tracking-wider">Tổng sản lượng đối soát</div>
                  <div className="text-xl sm:text-2xl font-black text-teal-900 mt-1">
                    {sheets.reduce((acc, s) => acc + s.totalMd, 0).toLocaleString('vi-VN')} <span className="text-xs font-semibold">md</span>
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5">Đã ghi nhận trong phiếu</div>
                </div>
              </div>

              {/* Bộ lọc phiếu đối soát */}
              <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tìm kiếm phiếu</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={sheetSearchKeyword}
                        onChange={(e) => setSheetSearchKeyword(e.target.value)}
                        placeholder="Mã phiếu, thợ, SĐT, đại lý..."
                        className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0FA3A3] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý phát sinh</label>
                    <select
                      value={sheetFilterAgency}
                      onChange={(e) => setSheetFilterAgency(e.target.value)}
                      className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-[#0FA3A3] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả Đại lý ({AGENCIES_LIST.length})</option>
                      {AGENCIES_LIST.map((ag) => (
                        <option key={ag.code} value={ag.code}>
                          {ag.name} ({ag.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái phiếu</label>
                    <select
                      value={sheetFilterStatus}
                      onChange={(e) => setSheetFilterStatus(e.target.value)}
                      className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] py-2 px-3 text-xs text-slate-800 focus:bg-white focus:border-[#0FA3A3] focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="Đã duyệt">Đã duyệt (Thợ xác nhận)</option>
                      <option value="Chờ duyệt">Chờ duyệt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bảng danh sách phiếu đối soát */}
              <div className="rounded-xl border border-[#E5EAEC] bg-white shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E5EAEC] flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-[#0FA3A3]" />
                    <span>Danh sách Phiếu đối soát ({filteredSheets.length})</span>
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5EAEC] bg-[#F8FAFC] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-3 text-center w-12">STT</th>
                        <th className="py-3 px-4">Mã phiếu đối soát</th>
                        <th className="py-3 px-4">Kỳ đối soát</th>
                        <th className="py-3 px-4">Thầu / Thợ</th>
                        <th className="py-3 px-4">Đại lý phát sinh</th>
                        <th className="py-3 px-3 text-center">Số đơn</th>
                        <th className="py-3 px-4 text-right">Tổng sản lượng</th>
                        <th className="py-3 px-3 text-center">Ngày lập</th>
                        <th className="py-3 px-3 text-center">Trạng thái</th>
                        <th className="py-3 px-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5EAEC]">
                      {filteredSheets.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400">
                            Chưa có phiếu đối soát nào phù hợp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredSheets.map((sheet, index) => (
                          <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 text-center font-mono text-slate-500 font-semibold">{index + 1}</td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => setActiveSheet(sheet)}
                                className="font-mono font-bold text-[#0FA3A3] hover:underline cursor-pointer flex items-center gap-1.5"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-[#0FA3A3] shrink-0" />
                                <span>{sheet.sheetCode}</span>
                              </button>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">{sheet.period}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800">{sheet.contractorName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {sheet.contractorCode} · {sheet.contractorPhone}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800">{sheet.agencyName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{sheet.agencyCode}</div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                {sheet.orders.length} đơn
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                              {sheet.totalMd.toFixed(1)} md
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-600">{sheet.createdDate}</td>
                            <td className="py-3 px-3 text-center">
                              {sheet.status === 'Đã duyệt' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  <span>Đã duyệt</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                                  <Clock className="h-3 w-3 text-amber-600" />
                                  <span>Chờ duyệt</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActiveSheet(sheet)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAEC] px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Xem chi tiết & Mẫu in A4"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-600" />
                                  <span>Xem A4</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleExportCsv(sheet)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#0FA3A3] hover:bg-teal-100 transition-colors cursor-pointer"
                                  title="Tải file CSV"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>CSV</span>
                                </button>

                                {sheet.status === 'Chờ duyệt' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveSheetFromList(sheet)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                                    title="Duyệt phiếu đối soát & Chuyển sang Thợ xác nhận"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Duyệt</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOM ĐƠN & TẠO PHIẾU MỚI */}
          {viewMode === 'CREATE_SHEET' && (
            <div className="space-y-4">

          {/* RÀNG BUỘC 1 THỢ - 1 ĐẠI LÝ ALERT (Khi đã có đơn được chọn) */}
          {activePair ? (
            <div className="rounded-xl border border-[#C55A11]/30 bg-amber-50/80 p-3.5 text-xs text-[#C55A11] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xs">
              <div className="flex items-start sm:items-center gap-2">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0 text-[#C55A11]" />
                <div>
                  <strong className="font-bold">Đã kích hoạt Ràng buộc 1 Thợ - 1 Đại lý:</strong> Đang chọn đối soát cho Thợ{' '}
                  <span className="underline font-bold">{activePair.contractorName} ({activePair.contractorCode})</span> tại Đại lý{' '}
                  <span className="underline font-bold">{activePair.agencyName}</span>.
                  Các dòng của Thợ hoặc Đại lý khác đã được khóa chọn tự động.
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="inline-flex items-center gap-1 self-start sm:self-auto rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Bỏ chọn & Mở khóa</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-xs text-slate-700 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#0FA3A3] shrink-0" />
              <span>
                <strong>Quy tắc nghiệp vụ:</strong> Đã bỏ ràng buộc phải duyệt mới được chọn. Khi bạn tích chọn đơn hàng đầu tiên, hệ thống sẽ tự động khóa các đơn khác cặp Thợ - Đại lý để đảm bảo phiếu đối soát chính xác 100%.
              </span>
            </div>
          )}

          {/* Bộ lọc Dashboard */}
          <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tìm kiếm</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm theo thợ, SĐT, mã đơn, sản phẩm..."
                    className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0FA3A3] focus:bg-white focus:outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý</label>
                <select
                  value={filterAgency}
                  onChange={(e) => setFilterAgency(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                >
                  <option value="ALL">Tất cả đại lý</option>
                  {AGENCIES_LIST.map((ag) => (
                    <option key={ag.code} value={ag.code}>
                      {ag.code} - {ag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái duyệt đơn</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
            </div>
          </div>

          {/* BẢNG DANH SÁCH MÀN 1 (Nhóm dòng theo Thợ) */}
          <div className="rounded-xl border border-[#E5EAEC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5EAEC] bg-[#F4F7F8]/80 text-slate-600 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">Chọn</th>
                    <th className="py-3 px-2 w-10 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[100px]">Mã Thầu/Thợ</th>
                    <th className="py-3 px-3 min-w-[130px]">Họ tên</th>
                    <th className="py-3 px-3 text-center">SĐT</th>
                    <th className="py-3 px-3 min-w-[110px]">Mã đơn</th>
                    <th className="py-3 px-3 text-center">Ngày nhập đơn</th>
                    <th className="py-3 px-3 min-w-[90px]">Mã ĐL</th>
                    <th className="py-3 px-3 min-w-[150px]">Tên Đại lý</th>
                    <th className="py-3 px-3 min-w-[170px]">Sản phẩm</th>
                    <th className="py-3 px-3 text-right">Sản lượng (md)</th>
                    <th className="py-3 px-3 text-center min-w-[100px]">Trạng thái</th>
                    <th className="py-3 px-3 text-center min-w-[110px]">Thao tác nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-400">
                        Không có đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    groupedOrders.map((group) => {
                      const sample = group.contractor;
                      const isGroupLocked =
                        activePair !== null &&
                        (activePair.contractorCode !== sample.contractorCode ||
                          activePair.agencyCode !== sample.agencyCode);

                      const groupSelectedCount = group.items.filter((i) =>
                        selectedOrderIds.includes(i.id)
                      ).length;

                      return (
                        <React.Fragment key={`${sample.contractorCode}_${sample.agencyCode}`}>
                          {/* GROUP HEADER ROW */}
                          <tr className="bg-slate-50/90 border-t border-b border-slate-200">
                            <td colSpan={13} className="py-2 px-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-bold text-slate-800">
                                    Thợ: {sample.contractorName} ({sample.contractorCode})
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="text-slate-600 font-mono">{sample.contractorPhone}</span>
                                  <span className="text-slate-400">·</span>
                                  <span className="text-slate-600">
                                    Đại lý: <strong>{sample.agencyName}</strong>
                                  </span>
                                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#0FA3A3]">
                                    {group.items.length} đơn hàng
                                  </span>
                                </div>

                                {!isGroupLocked ? (
                                  <button
                                    onClick={() => handleSelectAllGroup(group.items)}
                                    className="text-[11px] font-semibold text-[#0FA3A3] hover:underline"
                                  >
                                    {groupSelectedCount === group.items.length
                                      ? 'Bỏ chọn cả nhóm'
                                      : 'Chọn tất cả đơn nhóm này'}
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                                    <Lock className="h-3 w-3" />
                                    <span>Khóa do khác cặp Thợ - Đại lý</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* GROUP ITEMS */}
                          {group.items.map((ord, idx) => {
                            const isSelected = selectedOrderIds.includes(ord.id);
                            const isDisabled = isGroupLocked || !!ord.reconciledInSheetId;

                            return (
                              <tr
                                key={ord.id}
                                className={`transition-colors ${
                                  isSelected
                                    ? 'bg-teal-50/50'
                                    : isDisabled
                                    ? 'opacity-60 bg-slate-50/40'
                                    : 'hover:bg-slate-50/70'
                                }`}
                              >
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    disabled={isDisabled}
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectOrder(ord)}
                                    className={`rounded border-slate-300 text-[#0FA3A3] focus:ring-[#0FA3A3] ${
                                      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                  />
                                </td>

                                <td className="py-2.5 px-2 text-center font-mono text-slate-500">
                                  {idx + 1}
                                </td>

                                <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                  {ord.contractorCode}
                                </td>

                                <td className="py-2.5 px-3 font-medium text-slate-800">
                                  {ord.contractorName}
                                </td>

                                <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                                  {ord.contractorPhone}
                                </td>

                                <td className="py-2.5 px-3 font-mono font-semibold text-[#1F3864]">
                                  {ord.orderCode}
                                </td>

                                <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                                  {ord.entryDate}
                                </td>

                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                  {ord.agencyCode}
                                </td>

                                <td className="py-2.5 px-3 text-slate-700 truncate max-w-[150px]">
                                  {ord.agencyName}
                                </td>

                                <td className="py-2.5 px-3 text-slate-700 truncate max-w-[170px]" title={ord.productName}>
                                  {ord.productName}
                                </td>

                                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                  {ord.productionMd.toFixed(1)} md
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                                      ord.status === 'Đã duyệt'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : ord.status === 'Từ chối'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {ord.status}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleQuickStatusChange(ord, 'Đã duyệt')}
                                      className="rounded p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                      title="Duyệt nhanh"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleQuickStatusChange(ord, 'Từ chối')}
                                      className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title="Từ chối nhanh"
                                    >
                                      <Ban className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* THANH STICKY BOTTOM (Tổng số đơn + Tổng sản lượng md đã chọn + Nút Tạo phiếu đối soát) */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EAEC] px-4 md:px-8 py-3 shadow-lg no-print">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-[#0FA3A3]" />
                  <span className="text-slate-600">Đã chọn:</span>
                  <strong className="text-slate-900 font-bold font-mono text-sm">
                    {selectedOrderIds.length} đơn
                  </strong>
                </div>

                <div className="h-4 w-px bg-slate-200"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600">Tổng sản lượng:</span>
                  <strong className="text-[#0FA3A3] font-bold font-mono text-sm tabular-nums">
                    {totalSelectedMd.toFixed(1)} md
                  </strong>
                </div>

                {activePair && (
                  <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500">
                    <span>(Thợ: {activePair.contractorName} - ĐL: {activePair.agencyCode})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {selectedOrderIds.length > 0 && (
                  <button
                    onClick={() => setSelectedOrderIds([])}
                    className="flex-1 sm:flex-none rounded-xl border border-[#E5EAEC] px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Bỏ chọn tất cả
                  </button>
                )}

                <button
                  onClick={() => handleGenerateSheet(true)}
                  disabled={selectedOrderIds.length === 0}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
                    selectedOrderIds.length > 0
                      ? 'bg-[#0FA3A3] hover:bg-[#0c8787] active:scale-[0.98]'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Tạo phiếu đối soát ({selectedOrderIds.length} đơn)</span>
                </button>
              </div>
            </div>
          </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Nhập đơn mới */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between border-b border-[#E5EAEC] pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0FA3A3]" />
                <span>Nhập đơn sản lượng Thầu/Thợ mới</span>
              </h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Gộp text box mã thợ và họ tên thợ làm 1 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã thợ & Họ tên Thầu / Thợ (Gộp chung)
                </label>
                <select
                  value={selectedContractorKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedContractorKey(key);
                    const found = CONTRACTOR_PROFILES.find((c) => c.code === key);
                    if (found) {
                      setNewContractorCode(found.code);
                      setNewContractorName(found.name);
                      setNewContractorPhone(found.phone);
                      setNewAgencyCode(found.agencyCode);
                      setSelectedSyncedInvoiceCodes([]);
                    }
                  }}
                  className="w-full rounded-lg border border-[#E5EAEC] bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                >
                  {CONTRACTOR_PROFILES.map((c) => {
                    const agName = AGENCIES_LIST.find((a) => a.code === c.agencyCode)?.name || c.agencyCode;
                    return (
                      <option key={c.code} value={c.code}>
                        [{c.code}] {c.name} - {c.phone} ({agName})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Thông tin Đại lý & SĐT đi kèm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại Thợ</label>
                  <input
                    type="text"
                    value={newContractorPhone}
                    onChange={(e) => setNewContractorPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý phát sinh</label>
                  <select
                    value={newAgencyCode}
                    onChange={(e) => setNewAgencyCode(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                  >
                    {AGENCIES_LIST.map((ag) => (
                      <option key={ag.code} value={ag.code}>
                        {ag.code} - {ag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Bổ sung textbox / danh sách đơn hàng: Hiển thị các đơn hàng được đồng bộ bên màn hình danh sách hóa đơn */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <LinkIcon className="h-4 w-4 text-[#0FA3A3]" />
                    <span>Đơn hàng đồng bộ từ danh sách Hóa đơn (Module 2)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0FA3A3] bg-white px-2 py-0.5 rounded-full border border-teal-200">
                    Đã chọn: {selectedSyncedInvoiceCodes.length} đơn
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {availableSyncedInvoices.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-xs bg-white rounded-lg border border-dashed border-slate-200">
                      Chưa tìm thấy hóa đơn nào của Thợ này từ màn hình Hóa đơn. Bạn có thể nhập sản lượng thủ công bên dưới.
                    </div>
                  ) : (
                    availableSyncedInvoices.map((inv) => {
                      const isChecked = selectedSyncedInvoiceCodes.includes(inv.code);
                      return (
                        <div
                          key={inv.id}
                          onClick={() => handleToggleSyncedInvoice(inv)}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-teal-100/80 border-[#0FA3A3] text-slate-900 shadow-2xs'
                              : 'bg-white border-[#E5EAEC] text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-[#0FA3A3] focus:ring-[#0FA3A3]"
                            />
                            <div>
                              <div className="font-mono font-bold text-slate-900">
                                {inv.code}{' '}
                                <span className="font-normal text-slate-400 text-[11px]">
                                  ({inv.invoiceDate})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                                {inv.productDescription}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-[#0FA3A3] tabular-nums">
                              {inv.areaM2} md
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {inv.approvalStage === 'CONTRACTOR_CONFIRMED'
                                ? 'Thợ xác nhận'
                                : inv.approvalStage === 'APPROVED'
                                ? 'MTK duyệt'
                                : inv.statusDisplay}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedSyncedInvoiceCodes.length > 0 && (
                  <div className="text-[11px] text-slate-600 bg-white/90 p-2 rounded-lg border border-teal-200/80 flex items-center justify-between">
                    <span>Mã các đơn đã chọn:</span>
                    <strong className="font-mono text-[#0FA3A3]">
                      {selectedSyncedInvoiceCodes.join(', ')}
                    </strong>
                  </div>
                )}
              </div>

              {/* 3. Tổng sản lượng được dựa vào tổng số md trên các đơn hàng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sản phẩm</label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Tổng sản lượng (md)
                    </label>
                    {selectedSyncedInvoiceCodes.length > 0 && (
                      <span className="text-[10px] font-bold text-[#0FA3A3]">
                        ⚡ Tính từ {selectedSyncedInvoiceCodes.length} đơn
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={newProductionMd}
                    onChange={(e) => setNewProductionMd(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-sm font-mono font-bold text-[#0FA3A3] bg-teal-50/30 focus:border-[#0FA3A3] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EAEC]">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="rounded-xl border border-[#E5EAEC] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const agObj = AGENCIES_LIST.find((a) => a.code === newAgencyCode) || AGENCIES_LIST[0];
                    const newOrd: ProductionOrder = {
                      id: `ord-${Date.now()}`,
                      orderCode: `DH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      contractorCode: newContractorCode,
                      contractorName: newContractorName,
                      contractorPhone: newContractorPhone,
                      contractorAddress: 'Việt Yên, Bắc Giang',
                      agencyCode: agObj.code,
                      agencyName: agObj.name,
                      agencyAddress: agObj.address,
                      productName: newProductName,
                      productionMd: newProductionMd,
                      entryDate: new Date().toLocaleDateString('vi-VN'),
                      status: 'Chờ duyệt',
                      linkedInvoiceCode: selectedSyncedInvoiceCodes.length > 0 ? selectedSyncedInvoiceCodes.join(', ') : undefined,
                    };
                    onAddOrder(newOrd);
                    setIsNewOrderModalOpen(false);
                    alert(`Đã thêm đơn sản lượng ${newOrd.orderCode} (${newOrd.productionMd} md) thành công!`);
                  }}
                  className="rounded-xl bg-[#0FA3A3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c8787] cursor-pointer"
                >
                  Lưu đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
