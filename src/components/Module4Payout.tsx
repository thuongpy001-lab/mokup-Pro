import React, { useState, useMemo } from 'react';
import {
  Banknote,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Check,
  Ban,
  Building2,
  Phone,
  CreditCard,
  FileCheck,
  Sparkles,
  Layers,
  X,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { InvoiceItem, ApprovalStage } from '../types/poshaco';
import { AGENCIES_LIST } from '../data/mockData';

interface Module4PayoutProps {
  invoices: InvoiceItem[];
  onUpdateInvoice: (updated: InvoiceItem) => void;
}

const VIETNAMESE_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngân hàng Ngoại Thương)' },
  { code: 'TCB', name: 'Techcombank (Ngân hàng Kỹ Thương)' },
  { code: 'BIDV', name: 'BIDV (Ngân hàng Đầu tư và Phát triển)' },
  { code: 'CTG', name: 'VietinBank (Ngân hàng Công Thương)' },
  { code: 'AGR', name: 'Agribank (Ngân hàng Nông Nghiệp)' },
  { code: 'VPB', name: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
  { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
];

export type PayoutFilterType =
  | 'ALL'
  | 'READY'
  | 'PAID'
  | 'WAITING'
  | 'PENDING_AGENCY'
  | 'PENDING_SALES'
  | 'PENDING_ASM'
  | 'PENDING_MARKETING';

export const Module4Payout: React.FC<Module4PayoutProps> = ({
  invoices,
  onUpdateInvoice,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterAgency, setFilterAgency] = useState('ALL');
  const [filterPayoutStatus, setFilterPayoutStatus] = useState<PayoutFilterType>('ALL');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Modal Payout state
  const [payingInvoice, setPayingInvoice] = useState<InvoiceItem | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'PHONE_CARD' | 'CASH'>('BANK_TRANSFER');
  const [payoutBank, setPayoutBank] = useState('MB Bank');
  const [payoutAccountNo, setPayoutAccountNo] = useState('098765432188');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [payoutTxnCode, setPayoutTxnCode] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutDate, setPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payoutNotes, setPayoutNotes] = useState('');

  // Print voucher preview state
  const [voucherToPrint, setVoucherToPrint] = useState<InvoiceItem | null>(null);

  // Helper to calculate reward amount in VND (10,000 VND per point or 1,000 VND per m2)
  const calculateRewardVND = (inv: InvoiceItem) => {
    if (inv.payoutAmount) return inv.payoutAmount;
    const points = inv.adjustedPoints || inv.calculatedPoints || Math.round(inv.areaM2 * 10);
    return points * 1000; // 1,000 VND per point
  };

  // Stats calculation
  const stats = useMemo(() => {
    let readyCount = 0;
    let readyTotalVND = 0;
    let paidCount = 0;
    let paidTotalVND = 0;
    let waitingCount = 0;
    let agencyCount = 0;
    let salesCount = 0;
    let asmCount = 0;
    let marketingCount = 0;

    invoices.forEach((inv) => {
      const amt = calculateRewardVND(inv);
      if (inv.approvalStage === 'PAID') {
        paidCount++;
        paidTotalVND += amt;
      } else if (inv.approvalStage === 'CONTRACTOR_CONFIRMED') {
        readyCount++;
        readyTotalVND += amt;
      } else if (inv.approvalStage === 'PENDING_AGENCY') {
        agencyCount++;
        waitingCount++;
      } else if (inv.approvalStage === 'PENDING_SALES') {
        salesCount++;
        waitingCount++;
      } else if (inv.approvalStage === 'PENDING_ASM') {
        asmCount++;
        waitingCount++;
      } else if (inv.approvalStage === 'PENDING_MARKETING') {
        marketingCount++;
        waitingCount++;
      } else if (inv.approvalStage !== 'REJECTED') {
        waitingCount++;
      }
    });

    return {
      readyCount,
      readyTotalVND,
      paidCount,
      paidTotalVND,
      waitingCount,
      agencyCount,
      salesCount,
      asmCount,
      marketingCount,
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchKeyword =
        !searchKeyword.trim() ||
        inv.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inv.contractorName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        inv.contractorPhone.includes(searchKeyword) ||
        inv.agencyName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchAgency = filterAgency === 'ALL' || inv.agencyCode === filterAgency;

      let matchStatus = true;
      if (filterPayoutStatus === 'READY') {
        matchStatus = inv.approvalStage === 'CONTRACTOR_CONFIRMED';
      } else if (filterPayoutStatus === 'PAID') {
        matchStatus = inv.approvalStage === 'PAID';
      } else if (filterPayoutStatus === 'PENDING_AGENCY') {
        matchStatus = inv.approvalStage === 'PENDING_AGENCY';
      } else if (filterPayoutStatus === 'PENDING_SALES') {
        matchStatus = inv.approvalStage === 'PENDING_SALES';
      } else if (filterPayoutStatus === 'PENDING_ASM') {
        matchStatus = inv.approvalStage === 'PENDING_ASM';
      } else if (filterPayoutStatus === 'PENDING_MARKETING') {
        matchStatus = inv.approvalStage === 'PENDING_MARKETING';
      } else if (filterPayoutStatus === 'WAITING') {
        matchStatus =
          inv.approvalStage === 'PENDING_AGENCY' ||
          inv.approvalStage === 'PENDING_SALES' ||
          inv.approvalStage === 'PENDING_ASM' ||
          inv.approvalStage === 'PENDING_MARKETING' ||
          inv.approvalStage === 'APPROVED';
      }

      return matchKeyword && matchAgency && matchStatus;
    });
  }, [invoices, searchKeyword, filterAgency, filterPayoutStatus]);

  // Render 5-stage approval pipeline: Chờ đại lý duyệt - Chờ NVKD duyệt - Chờ ASM duyệt - Chờ MTK duyệt - Thợ xác nhận
  const renderStagePipeline = (inv: InvoiceItem) => {
    const isLarge = inv.areaM2 > 500;

    // Cấp 1: Đại lý
    const s1Done = inv.agencyApproved || inv.approvalStage !== 'PENDING_AGENCY';
    // Cấp 2: NVKD
    const s2Waiting = inv.approvalStage === 'PENDING_AGENCY';
    const s2Active = inv.approvalStage === 'PENDING_SALES';
    const s2Done = !s2Waiting && !s2Active;
    // Cấp 3: ASM
    const s3Skipped = !isLarge;
    const s3Active = isLarge && inv.approvalStage === 'PENDING_ASM';
    const s3Waiting = isLarge && (inv.approvalStage === 'PENDING_AGENCY' || inv.approvalStage === 'PENDING_SALES');
    const s3Done = isLarge && !s3Waiting && !s3Active;
    // Cấp 4: MTK
    const s4Active = inv.approvalStage === 'PENDING_MARKETING';
    const s4Done = inv.approvalStage === 'APPROVED' || inv.approvalStage === 'CONTRACTOR_CONFIRMED' || inv.approvalStage === 'PAID';
    const s4Waiting = !s4Active && !s4Done;
    // Cấp 5: Thợ xác nhận
    const s5Done = inv.approvalStage === 'CONTRACTOR_CONFIRMED' || inv.approvalStage === 'PAID';
    const s5Active = inv.approvalStage === 'APPROVED';
    const s5Waiting = !s5Done && !s5Active;

    const renderPill = (
      status: 'done' | 'active' | 'waiting' | 'skipped',
      label: string,
      color: string
    ) => {
      if (status === 'done') {
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/90 shrink-0">
            <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
            <span>{label}</span>
          </span>
        );
      }
      if (status === 'active') {
        return (
          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold border shadow-2xs shrink-0 ${color}`}>
            <Clock className="h-3 w-3 animate-pulse" />
            <span>{label}</span>
          </span>
        );
      }
      if (status === 'skipped') {
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100/90 px-2 py-0.5 text-[10.5px] font-normal text-slate-500 border border-dashed border-slate-300 shrink-0">
            <span className="text-slate-400 text-[10px]">↳</span>
            <span>Miễn ASM</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-50/90 px-2 py-0.5 text-[11px] font-normal text-slate-400 border border-slate-200/80 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 inline-block" />
          <span>{label}</span>
        </span>
      );
    };

    return (
      <div className="flex items-center gap-1 text-xs whitespace-nowrap">
        {renderPill(s1Done ? 'done' : 'active', 'Chờ đại lý', 'bg-amber-50 text-amber-900 border-amber-300')}
        <span className="text-slate-300 font-bold select-none">-</span>
        {renderPill(s2Done ? 'done' : s2Active ? 'active' : 'waiting', 'Chờ NVKD', 'bg-blue-50 text-blue-900 border-blue-300')}
        <span className="text-slate-300 font-bold select-none">-</span>
        {renderPill(s3Skipped ? 'skipped' : s3Done ? 'done' : s3Active ? 'active' : 'waiting', 'Chờ ASM', 'bg-purple-50 text-purple-900 border-purple-300')}
        <span className="text-slate-300 font-bold select-none">-</span>
        {renderPill(s4Done ? 'done' : s4Active ? 'active' : 'waiting', 'Chờ MTK', 'bg-teal-50 text-[#0c7f7f] border-teal-300')}
        <span className="text-slate-300 font-bold select-none">-</span>
        {renderPill(s5Done ? 'done' : s5Active ? 'active' : 'waiting', 'Thợ xác nhận', 'bg-cyan-50 text-cyan-900 border-cyan-300')}
      </div>
    );
  };

  // Open payout confirmation modal
  const handleOpenPayoutModal = (inv: InvoiceItem) => {
    setPayingInvoice(inv);
    setPayoutAmount(calculateRewardVND(inv));
    setPayoutAccountName(inv.contractorBankOwner || inv.contractorName.toUpperCase());
    setPayoutBank(inv.contractorBank || 'MB Bank');
    setPayoutAccountNo(inv.contractorBankAccount || (inv.contractorPhone ? `09${inv.contractorPhone.slice(2)}88` : '190382910293'));
    setPayoutTxnCode(`UNC-PSH-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPayoutNotes(`Chi trả tiền thưởng tích lũy sản lượng tôn POSHACO - Đơn ${inv.code}`);
    setIsPayoutModalOpen(true);
  };

  // Confirm Payout
  const handleConfirmPayout = () => {
    if (!payingInvoice) return;
    if (payoutAmount <= 0) {
      alert('Số tiền chi trả phải lớn hơn 0');
      return;
    }

    const updated: InvoiceItem = {
      ...payingInvoice,
      approvalStage: 'PAID',
      statusDisplay: 'Đã chi tiền',
      payoutAmount,
      payoutDate,
      payoutMethod: payoutMethod === 'BANK_TRANSFER' ? 'Chuyển khoản 24/7' : payoutMethod === 'PHONE_CARD' ? 'Thẻ cào điện thoại' : 'Tiền mặt',
      payoutTxnCode,
      payoutAccountant: 'KT. Nguyễn Thu Hương (Kế toán trưởng)',
      contractorBank: payoutBank,
      contractorBankAccount: payoutAccountNo,
      contractorBankOwner: payoutAccountName,
    };

    onUpdateInvoice(updated);
    setIsPayoutModalOpen(false);
    setPayingInvoice(null);
    alert(`Xác nhận chi tiền thành công!\nĐã giải ngân ${payoutAmount.toLocaleString('vi-VN')} VND cho Thợ ${updated.contractorName} qua mã giao dịch ${payoutTxnCode}.`);
  };

  // Bulk payout for selected invoices that are in CONTRACTOR_CONFIRMED stage
  const handleBulkPayout = () => {
    const readySelected = invoices.filter(
      (inv) => selectedInvoiceIds.includes(inv.id) && inv.approvalStage === 'CONTRACTOR_CONFIRMED'
    );

    if (readySelected.length === 0) {
      alert('Không có đơn hàng nào ở trạng thái "Thợ xác nhận" trong các mục đã chọn!');
      return;
    }

    const totalMoney = readySelected.reduce((sum, inv) => sum + calculateRewardVND(inv), 0);
    const confirmed = window.confirm(
      `Xác nhận chi trả tiền thưởng cho ${readySelected.length} đơn hàng?\nTổng số tiền: ${totalMoney.toLocaleString('vi-VN')} VND\nKế toán: KT. Nguyễn Thu Hương`
    );

    if (confirmed) {
      readySelected.forEach((inv, index) => {
        const updated: InvoiceItem = {
          ...inv,
          approvalStage: 'PAID',
          statusDisplay: 'Đã chi tiền',
          payoutAmount: calculateRewardVND(inv),
          payoutDate: new Date().toISOString().split('T')[0],
          payoutMethod: 'Chuyển khoản ngân hàng 24/7',
          payoutTxnCode: `UNC-BATCH-${Math.floor(10000 + Math.random() * 90000)}-${index + 1}`,
          payoutAccountant: 'KT. Nguyễn Thu Hương (Kế toán trưởng)',
        };
        onUpdateInvoice(updated);
      });
      setSelectedInvoiceIds([]);
      alert(`Đã chi trả thành công ${readySelected.length} đơn hàng! Tổng tiền: ${totalMoney.toLocaleString('vi-VN')} VND.`);
    }
  };

  // Export Payout CSV
  const handleExportPayoutCsv = () => {
    const headers = [
      'STT',
      'Mã đơn hàng',
      'Đại lý',
      'Thầu/Thợ',
      'SĐT',
      'Ngân hàng',
      'Số tài khoản',
      'Chủ tài khoản',
      'Sản lượng (m2)',
      'Tiền thưởng (VND)',
      'Trạng thái duyệt',
      'Trạng thái chi trả',
      'Ngày chi',
      'Mã giao dịch UNC',
    ];

    const rows = filteredInvoices.map((inv, idx) => [
      idx + 1,
      inv.code,
      `"${inv.agencyName}"`,
      `"${inv.contractorName}"`,
      inv.contractorPhone,
      inv.contractorBank || 'MB Bank',
      inv.contractorBankAccount || '---',
      `"${inv.contractorBankOwner || inv.contractorName}"`,
      inv.areaM2,
      calculateRewardVND(inv),
      inv.approvalStage === 'PAID' ? 'Đã chi tiền' : inv.approvalStage === 'CONTRACTOR_CONFIRMED' ? 'Thợ xác nhận' : 'Đang duyệt',
      inv.approvalStage === 'PAID' ? 'Đã chi tiền' : inv.approvalStage === 'CONTRACTOR_CONFIRMED' ? 'Sẵn sàng chi' : 'Chưa đủ điều kiện',
      inv.payoutDate || '---',
      inv.payoutTxnCode || '---',
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_ke_chi_tra_thuong_Poshaco_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold text-[#0FA3A3]">
              MODULE CHI TRẢ
            </span>
            <span className="text-xs text-slate-400">Poshaco Pro · Kế toán tài chính</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2.5">
            <Banknote className="h-6 w-6 text-[#0FA3A3]" />
            <span>Chi trả thưởng Thầu / Thợ</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ duyệt 5 cấp và xác nhận chi tiền thưởng cho Thầu/Thợ sau khi hoàn tất đối soát sản lượng
          </p>
        </div>

        {/* Action Top Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPayoutCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5EAEC] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Xuất Bảng Kê Chi Trả</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Sẵn sàng chi (Thợ xác nhận) */}
        <div
          onClick={() => setFilterPayoutStatus('READY')}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            filterPayoutStatus === 'READY'
              ? 'border-[#0FA3A3] bg-teal-50/50 shadow-sm ring-2 ring-teal-200'
              : 'border-[#E5EAEC] bg-white hover:border-teal-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chờ Kế toán chi tiền (Thợ xác nhận)</span>
            <span className="rounded-full bg-amber-100 p-2 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-[#0FA3A3]">{stats.readyCount}</span>
            <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tổng tiền cần chi:</span>
            <strong className="text-slate-900 font-bold font-mono">
              {stats.readyTotalVND.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        </div>

        {/* Card 2: Đã chi tiền */}
        <div
          onClick={() => setFilterPayoutStatus('PAID')}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            filterPayoutStatus === 'PAID'
              ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-200'
              : 'border-[#E5EAEC] bg-white hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đã chi tiền thành công</span>
            <span className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-700">{stats.paidCount}</span>
            <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tổng tiền đã giải ngân:</span>
            <strong className="text-emerald-700 font-bold font-mono">
              {stats.paidTotalVND.toLocaleString('vi-VN')} đ
            </strong>
          </div>
        </div>

        {/* Card 3: Chưa đủ điều kiện (Đang duyệt các cấp trước) */}
        <div
          onClick={() => setFilterPayoutStatus('WAITING')}
          className={`rounded-2xl border p-4 transition-all cursor-pointer ${
            filterPayoutStatus === 'WAITING'
              ? 'border-slate-400 bg-slate-50 shadow-sm ring-2 ring-slate-200'
              : 'border-[#E5EAEC] bg-white hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang trong luồng duyệt (Chưa đối soát)</span>
            <span className="rounded-full bg-slate-100 p-2 text-slate-600">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-700">{stats.waitingCount}</span>
            <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Chờ các cấp: Đại lý → NVKD → ASM → MTK → Tạo phiếu đối soát
          </div>
        </div>
      </div>

      {/* Filter and Bulk action bar */}
      <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tên thợ, SĐT, mã đơn..."
                className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Filter Agency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý (C2)</label>
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

          {/* Filter Payout Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái duyệt & Chi tiền</label>
            <select
              value={filterPayoutStatus}
              onChange={(e) => setFilterPayoutStatus(e.target.value as any)}
              className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none font-medium"
            >
              <option value="ALL">Tất cả đơn ({invoices.length})</option>
              <option value="PENDING_AGENCY">1. Chờ đại lý duyệt ({stats.agencyCount})</option>
              <option value="PENDING_SALES">2. Chờ NVKD duyệt ({stats.salesCount})</option>
              <option value="PENDING_ASM">3. Chờ ASM duyệt ({stats.asmCount})</option>
              <option value="PENDING_MARKETING">4. Chờ MTK duyệt ({stats.marketingCount})</option>
              <option value="READY">5. Thợ xác nhận - Sẵn sàng chi ({stats.readyCount})</option>
              <option value="PAID">✓ Đã chi tiền ({stats.paidCount})</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchKeyword('');
                setFilterAgency('ALL');
                setFilterPayoutStatus('ALL');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Horizontal Quick Stage Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 text-xs scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Cấp độ duyệt:</span>
          {[
            { id: 'ALL', label: 'Tất cả', count: invoices.length },
            { id: 'PENDING_AGENCY', label: '1. Chờ đại lý duyệt', count: stats.agencyCount },
            { id: 'PENDING_SALES', label: '2. Chờ NVKD duyệt', count: stats.salesCount },
            { id: 'PENDING_ASM', label: '3. Chờ ASM duyệt', count: stats.asmCount },
            { id: 'PENDING_MARKETING', label: '4. Chờ MTK duyệt', count: stats.marketingCount },
            { id: 'READY', label: '5. Thợ xác nhận', count: stats.readyCount },
            { id: 'PAID', label: '✓ Đã chi tiền', count: stats.paidCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPayoutStatus(tab.id as any)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterPayoutStatus === tab.id
                  ? 'bg-[#0FA3A3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filterPayoutStatus === tab.id
                  ? 'bg-white/25 text-white'
                  : 'bg-white text-slate-700 shadow-2xs'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Selected banner / Bulk Payout action */}
        {selectedInvoiceIds.length > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 px-3.5 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-800">
              <span className="font-semibold text-[#0FA3A3]">Đã chọn {selectedInvoiceIds.length} đơn</span>
              <span className="text-slate-400">·</span>
              <span>
                (Các đơn ở trạng thái <strong>Thợ xác nhận</strong> có thể chi tiền cùng lúc)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedInvoiceIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 underline mr-2"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleBulkPayout}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0FA3A3] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c8787] transition-all cursor-pointer"
              >
                <Banknote className="h-3.5 w-3.5" />
                <span>Kế toán chi tiền hàng loạt</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-[#E5EAEC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5EAEC] bg-[#F4F7F8]/80 text-slate-600 font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#0FA3A3] focus:ring-[#0FA3A3]"
                    checked={
                      filteredInvoices.length > 0 &&
                      selectedInvoiceIds.length === filteredInvoices.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedInvoiceIds(filteredInvoices.map((i) => i.id));
                      } else {
                        setSelectedInvoiceIds([]);
                      }
                    }}
                  />
                </th>
                <th className="py-3 px-2 w-10 text-center">STT</th>
                <th className="py-3 px-3 min-w-[110px]">Mã đơn</th>
                <th className="py-3 px-3 min-w-[130px]">Đại lý (C2)</th>
                <th className="py-3 px-3 min-w-[150px]">Thầu / Thợ thụ hưởng</th>
                <th className="py-3 px-3 text-right">Số M²</th>
                <th className="py-3 px-3 text-right min-w-[110px]">Giá trị thưởng (VND)</th>
                <th className="py-3 px-3 text-center min-w-[580px]">
                  <div className="flex items-center justify-center gap-2">
                    <span>Trạng thái duyệt</span>
                    <span className="text-[10px] font-normal text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-[#E5EAEC]">
                      Chờ đại lý duyệt - Chờ NVKD duyệt - Chờ ASM duyệt - Chờ MTK duyệt - Thợ xác nhận
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center min-w-[120px]">Trạng thái chi trả</th>
                <th className="py-3 px-3 text-center min-w-[130px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc chi trả.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, index) => {
                  const rewardVND = calculateRewardVND(inv);
                  const isReadyToPay = inv.approvalStage === 'CONTRACTOR_CONFIRMED';
                  const isPaid = inv.approvalStage === 'PAID';
                  const isSelected = selectedInvoiceIds.includes(inv.id);

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-[#0FA3A3] focus:ring-[#0FA3A3]"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoiceIds([...selectedInvoiceIds, inv.id]);
                            } else {
                              setSelectedInvoiceIds(selectedInvoiceIds.filter((id) => id !== inv.id));
                            }
                          }}
                        />
                      </td>

                      {/* STT */}
                      <td className="py-3.5 px-2 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      {/* Mã đơn */}
                      <td className="py-3.5 px-3 font-semibold font-mono text-slate-800">
                        <div>{inv.code}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {inv.invoiceDate}
                        </div>
                      </td>

                      {/* Đại lý */}
                      <td className="py-3.5 px-3 text-slate-700">
                        <div className="font-semibold">{inv.agencyCode}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                          {inv.agencyName.replace(/^[A-Z0-9-]+\s*-\s*/, '')}
                        </div>
                      </td>

                      {/* Thầu / Thợ */}
                      <td className="py-3.5 px-3 text-slate-800">
                        <div className="font-semibold">{inv.contractorName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{inv.contractorPhone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {inv.contractorBank || 'MB Bank'}: {inv.contractorBankAccount || '---'}
                        </div>
                      </td>

                      {/* Số M2 */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                        {inv.areaM2} m²
                      </td>

                      {/* Giá trị thưởng (VND) */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0FA3A3] tabular-nums">
                        {rewardVND.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Chuỗi 5 cấp phê duyệt */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {renderStagePipeline(inv)}
                        </div>
                      </td>

                      {/* Trạng thái chi trả */}
                      <td className="py-3.5 px-3 text-center">
                        {isPaid ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Đã chi tiền</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {inv.payoutTxnCode || inv.payoutDate}
                            </span>
                          </div>
                        ) : isReadyToPay ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 animate-pulse">
                              <Sparkles className="h-3 w-3 text-amber-600" />
                              <span>Sẵn sàng chi</span>
                            </span>
                            <span className="text-[10px] text-cyan-700 font-medium mt-0.5">
                              Đã thợ xác nhận
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                            <span>Chưa đủ điều kiện</span>
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPaid ? (
                            <button
                              onClick={() => setVoucherToPrint(inv)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                              title="In phiếu chi tiền A4"
                            >
                              <Printer className="h-3.5 w-3.5 text-slate-500" />
                              <span>Phiếu chi</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPayoutModal(inv)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                                isReadyToPay
                                  ? 'bg-[#0FA3A3] text-white shadow-xs hover:bg-[#0c8787] active:scale-95'
                                  : 'border border-[#E5EAEC] bg-slate-50 text-slate-500 hover:bg-slate-100'
                              }`}
                              title={
                                isReadyToPay
                                  ? 'Kế toán duyệt chi tiền cho Thầu/Thợ'
                                  : 'Đơn hàng chưa qua Thợ xác nhận đối soát'
                              }
                            >
                              <Banknote className="h-3.5 w-3.5" />
                              <span>{isReadyToPay ? 'Kế toán chi tiền' : 'Chi tiền'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Kế toán chi tiền & Xác nhận đã chi tiền */}
      {isPayoutModalOpen && payingInvoice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5EAEC] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-teal-100 p-2 text-[#0FA3A3]">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Kế toán chi tiền & Xác nhận đã chi tiền
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mã đơn: <span className="font-mono font-bold text-slate-700">{payingInvoice.code}</span> · Thợ: {payingInvoice.contractorName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              {/* Thợ & Tiền thưởng Box */}
              <div className="rounded-xl bg-teal-50/60 border border-teal-200 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Số tiền thưởng giải ngân:</span>
                  <span className="text-xl font-black font-mono text-[#0FA3A3]">
                    {payoutAmount.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Sản lượng: <strong>{payingInvoice.areaM2} m²</strong></span>
                  <span>Đại lý: <strong>{payingInvoice.agencyName}</strong></span>
                </div>
              </div>

              {/* Phương thức chi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phương thức chi trả
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'BANK_TRANSFER', label: 'Chuyển khoản 24/7' },
                    { id: 'PHONE_CARD', label: 'Thẻ cào ĐT' },
                    { id: 'CASH', label: 'Tiền mặt' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayoutMethod(m.id as any)}
                      className={`rounded-lg p-2 text-center text-xs font-semibold border transition-all cursor-pointer ${
                        payoutMethod === m.id
                          ? 'border-[#0FA3A3] bg-teal-50 text-[#0FA3A3]'
                          : 'border-[#E5EAEC] bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thông tin tài khoản nhận tiền */}
              {payoutMethod === 'BANK_TRANSFER' && (
                <div className="rounded-xl border border-[#E5EAEC] bg-[#F4F7F8]/60 p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ngân hàng thụ hưởng
                      </label>
                      <select
                        value={payoutBank}
                        onChange={(e) => setPayoutBank(e.target.value)}
                        className="w-full rounded-lg border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                      >
                        {VIETNAMESE_BANKS.map((b) => (
                          <option key={b.code} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Số tài khoản
                      </label>
                      <input
                        type="text"
                        value={payoutAccountNo}
                        onChange={(e) => setPayoutAccountNo(e.target.value)}
                        className="w-full rounded-lg border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      value={payoutAccountName}
                      onChange={(e) => setPayoutAccountName(e.target.value)}
                      className="w-full rounded-lg border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Chứng từ chi & Kế toán */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã giao dịch / Số UNC
                  </label>
                  <input
                    type="text"
                    value={payoutTxnCode}
                    onChange={(e) => setPayoutTxnCode(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày hạch toán chi
                  </label>
                  <input
                    type="date"
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kế toán viên xác nhận
                </label>
                <input
                  type="text"
                  disabled
                  value="KT. Nguyễn Thu Hương (Kế toán trưởng POSHACO)"
                  className="w-full rounded-lg border border-[#E5EAEC] bg-slate-50 px-3 py-1.5 text-xs text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chi / Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAEC]">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="rounded-xl border border-[#E5EAEC] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayout}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0FA3A3] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0c8787] active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Xác nhận đã chi tiền</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINT A4: Phiếu chi tiền / Ủy nhiệm chi */}
      {voucherToPrint && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-[#0FA3A3]" />
                <span className="font-bold text-slate-800 text-sm">Xem trước Phiếu chi tiền (A4)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg bg-[#0FA3A3] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0c8787]"
                >
                  In phiếu ngay
                </button>
                <button
                  onClick={() => setVoucherToPrint(null)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="mt-6 space-y-5 text-xs font-sans text-slate-800">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-sm font-black text-[#1F3864]">CÔNG TY CỔ PHẦN TẬP ĐOÀN THÉP POSHACO</h2>
                  <p className="text-[11px] text-slate-500">Phòng Kế toán - Tài chính POSHACO PRO</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-slate-800">Mẫu số: 02-TT</div>
                  <div className="text-[11px] text-slate-500">Mã UNC: {voucherToPrint.payoutTxnCode || 'UNC-2026-09'}</div>
                </div>
              </div>

              <div className="text-center py-2">
                <h1 className="text-lg font-black text-[#1F3864] uppercase tracking-wider">
                  PHIẾU CHI TIỀN THƯỞNG TÍCH LŨY SẢN LƯỢNG
                </h1>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ngày chi: {voucherToPrint.payoutDate || new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div className="space-y-2 border-y py-3 leading-relaxed">
                <div><strong>Họ tên người nhận (Thợ):</strong> {voucherToPrint.contractorName} ({voucherToPrint.contractorPhone})</div>
                <div><strong>Đại lý phát sinh:</strong> {voucherToPrint.agencyName}</div>
                <div><strong>Mã đơn hàng / Hóa đơn:</strong> {voucherToPrint.code}</div>
                <div><strong>Sản lượng đạt được:</strong> {voucherToPrint.areaM2} m² tôn Poshaco</div>
                <div><strong>Số tiền chi trả:</strong> <strong className="text-sm text-[#0FA3A3] font-mono">{calculateRewardVND(voucherToPrint).toLocaleString('vi-VN')} VNĐ</strong></div>
                <div><strong>Hình thức chi trả:</strong> {voucherToPrint.payoutMethod || 'Chuyển khoản ngân hàng 24/7'}</div>
                <div><strong>Tài khoản nhận:</strong> {voucherToPrint.contractorBank || 'MB Bank'} - Số TK: {voucherToPrint.contractorBankAccount || '098765432188'} (Chủ TK: {voucherToPrint.contractorBankOwner || voucherToPrint.contractorName})</div>
                <div><strong>Lý do chi:</strong> Chi trả thưởng tích lũy sản lượng Thầu/Thợ theo chương trình POSHACO PRO</div>
              </div>

              <div className="grid grid-cols-3 text-center pt-4 pb-12">
                <div>
                  <strong className="block">Người lập phiếu</strong>
                  <span className="text-[10px] text-slate-400 italic">(Ký, họ tên)</span>
                </div>
                <div>
                  <strong className="block">Kế toán trưởng</strong>
                  <span className="text-[10px] text-slate-400 italic">(Ký, họ tên)</span>
                  <div className="mt-8 font-semibold text-slate-700">KT. Nguyễn Thu Hương</div>
                </div>
                <div>
                  <strong className="block">Người nhận tiền (Thợ)</strong>
                  <span className="text-[10px] text-slate-400 italic">(Ký, họ tên)</span>
                  <div className="mt-8 font-semibold text-slate-700">{voucherToPrint.contractorName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
