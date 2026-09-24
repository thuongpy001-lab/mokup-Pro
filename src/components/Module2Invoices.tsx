import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  FileCheck2,
  X,
  Eye,
  Check,
  Ban,
  Edit3,
  Calendar,
  ChevronRight,
  Download,
  CheckSquare,
  AlertTriangle,
  ZoomIn,
  Clock,
  Layers,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { InvoiceItem, ApprovalStage, EditHistory } from '../types/poshaco';
import { AGENCIES_LIST } from '../data/mockData';

interface Module2InvoicesProps {
  invoices: InvoiceItem[];
  onUpdateInvoice: (updated: InvoiceItem) => void;
  currentRole: 'ADMIN' | 'AGENCY' | 'SALES' | 'ASM' | 'MARKETING';
}

export const Module2Invoices: React.FC<Module2InvoicesProps> = ({
  invoices,
  onUpdateInvoice,
  currentRole,
}) => {
  // Filters
  const [filterAgency, setFilterAgency] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [filterAgencyApproval, setFilterAgencyApproval] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Slide-over drawer state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isEditingData, setIsEditingData] = useState(false);
  const [editAreaM2, setEditAreaM2] = useState<number>(0);
  const [editPosQty, setEditPosQty] = useState<number>(0);
  const [editKQty, setEditKQty] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Modal final MTK approval
  const [isMtkModalOpen, setIsMtkModalOpen] = useState(false);
  const [mtkInvoiceToApprove, setMtkInvoiceToApprove] = useState<InvoiceItem | null>(null);
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [mtkNotes, setMtkNotes] = useState<string>('');

  // Modal reject
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [invoiceToReject, setInvoiceToReject] = useState<InvoiceItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Image preview zoom modal
  const [isImageZoomOpen, setIsImageZoomOpen] = useState(false);

  // Chế độ hiển thị chuỗi trạng thái duyệt: 'FULL' (Chờ đại lý duyệt - Chờ nhân viên kinh doanh duyệt - Chờ ASM duyệt - Chờ MTK duyệt) hoặc 'COMPACT'
  const [stageDisplayMode, setStageDisplayMode] = useState<'FULL' | 'COMPACT'>('FULL');

  // New invoice simulation modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [newAgency, setNewAgency] = useState(AGENCIES_LIST[0].code);
  const [newContractorName, setNewContractorName] = useState('Nguyễn Văn Tuấn');
  const [newContractorPhone, setNewContractorPhone] = useState('0982345678');
  const [newAreaM2, setNewAreaM2] = useState<number>(150);
  const [newProduct, setNewProduct] = useState('Tôn cuộn mạ màu POSHACO S-Series 0.40mm');

  const handleOpenDrawer = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setIsEditingData(false);
    setEditAreaM2(inv.areaM2);
    setEditPosQty(inv.posSeriesQty);
    setEditKQty(inv.kSeriesQty);
    setEditReason('');
  };

  const handleCloseDrawer = () => {
    setSelectedInvoice(null);
    setIsEditingData(false);
  };

  // Workflow Approve Handler
  const handleApproveInvoice = (invoice: InvoiceItem) => {
    const isOver500 = invoice.areaM2 > 500;

    // Check current stage and apply business rules:
    if (invoice.approvalStage === 'PENDING_AGENCY') {
      // Step 1: Đại lý duyệt -> Đơn chuyển sang "Chờ NVKD duyệt"
      const updated: InvoiceItem = {
        ...invoice,
        agencyApproved: true,
        approvalStage: 'PENDING_SALES',
        statusDisplay: 'Chờ xử lý',
      };
      onUpdateInvoice(updated);
      setSelectedInvoice(updated);
      alert('Đại lý đã duyệt thành công! Đơn chuyển tới "Chờ NVKD duyệt".');
      return;
    }

    if (invoice.approvalStage === 'PENDING_SALES') {
      // Step 2: NVKD duyệt
      if (isOver500) {
        // >500m2 -> Chuyển ASM duyệt
        const updated: InvoiceItem = {
          ...invoice,
          approvalStage: 'PENDING_ASM',
          statusDisplay: 'Chờ xử lý',
        };
        onUpdateInvoice(updated);
        setSelectedInvoice(updated);
        alert(`NVKD duyệt thành công! Do sản lượng đơn lớn (${invoice.areaM2} m² > 500m²), đơn được chuyển sang "Chờ ASM duyệt".`);
      } else {
        // <=500m2 -> Chuyển thẳng MTK duyệt (Bỏ qua ASM!)
        const updated: InvoiceItem = {
          ...invoice,
          approvalStage: 'PENDING_MARKETING',
          statusDisplay: 'Chờ xử lý',
        };
        onUpdateInvoice(updated);
        setSelectedInvoice(updated);
        alert(`NVKD duyệt thành công! Sản lượng <= 500m² nên tự động bỏ qua ASM, chuyển thẳng tới "Chờ MTK duyệt".`);
      }
      return;
    }

    if (invoice.approvalStage === 'PENDING_ASM') {
      // Step 3: ASM duyệt đơn >500m2 -> Chuyển sang MTK duyệt
      const updated: InvoiceItem = {
        ...invoice,
        approvalStage: 'PENDING_MARKETING',
        statusDisplay: 'Chờ xử lý',
      };
      onUpdateInvoice(updated);
      setSelectedInvoice(updated);
      alert('Giám đốc vùng (ASM) đã duyệt thành công! Đơn chuyển tới "Chờ MTK duyệt".');
      return;
    }

    if (invoice.approvalStage === 'PENDING_MARKETING') {
      // Step 4: MTK click duyệt -> Mở Modal Phê duyệt cuối để nhập điểm thưởng bù/điều chỉnh!
      setMtkInvoiceToApprove(invoice);
      setBonusPoints(invoice.calculatedPoints);
      setMtkNotes('Phê duyệt sản lượng hợp lệ, cấp thẻ nạp / điểm thưởng tích lũy');
      setIsMtkModalOpen(true);
      return;
    }
  };

  // Submit Final MTK Approval
  const handleConfirmMtkApproval = () => {
    if (!mtkInvoiceToApprove) return;
    const updated: InvoiceItem = {
      ...mtkInvoiceToApprove,
      approvalStage: 'APPROVED',
      statusDisplay: 'Đã duyệt',
      adjustedPoints: bonusPoints,
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
    setIsMtkModalOpen(false);
    setMtkInvoiceToApprove(null);
    alert(`Phê duyệt hoàn tất! Đã ghi nhận ${bonusPoints.toLocaleString('vi-VN')} điểm thưởng cho Thợ.`);
  };

  // Reject Handler
  const handleOpenReject = (invoice: InvoiceItem) => {
    setInvoiceToReject(invoice);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!invoiceToReject) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    const updated: InvoiceItem = {
      ...invoiceToReject,
      approvalStage: 'REJECTED',
      statusDisplay: 'Từ chối',
      rejectionReason: rejectionReason.trim(),
    };
    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
    setIsRejectModalOpen(false);
    setInvoiceToReject(null);
    alert('Đã từ chối hóa đơn và gửi phản hồi lý do cho người gửi.');
  };

  // Save edited data (Sửa số liệu)
  const handleSaveEditedData = () => {
    if (!selectedInvoice) return;
    if (editAreaM2 <= 0) {
      alert('Số m² phải lớn hơn 0');
      return;
    }

    const newHistory: EditHistory = {
      id: `edit-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      editor: 'ThươngPY (Quản trị viên)',
      field: 'Số M2 & Sản lượng',
      oldValue: `${selectedInvoice.areaM2} m² (POS: ${selectedInvoice.posSeriesQty}, K: ${selectedInvoice.kSeriesQty})`,
      newValue: `${editAreaM2} m² (POS: ${editPosQty}, K: ${editKQty})`,
      reason: editReason || 'Điều chỉnh theo quy cách thực tế trên ảnh hóa đơn',
    };

    // Recalculate estimated points
    const recalculatedPoints = Math.round(editAreaM2 * 10);

    const updated: InvoiceItem = {
      ...selectedInvoice,
      areaM2: editAreaM2,
      posSeriesQty: editPosQty,
      kSeriesQty: editKQty,
      calculatedPoints: recalculatedPoints,
      editHistory: [newHistory, ...selectedInvoice.editHistory],
    };

    onUpdateInvoice(updated);
    setSelectedInvoice(updated);
    setIsEditingData(false);
    alert('Đã cập nhật số liệu hóa đơn và ghi nhận lịch sử chỉnh sửa!');
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchKeyword = !searchKeyword.trim() ||
      inv.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      inv.contractorName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      inv.contractorPhone.includes(searchKeyword) ||
      inv.agencyName.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchAgency = filterAgency === 'ALL' || inv.agencyCode === filterAgency;

    const matchStage = filterStage === 'ALL' ||
      (filterStage === 'PENDING' ? inv.statusDisplay === 'Chờ xử lý' :
       filterStage === 'PENDING_AGENCY' ? inv.approvalStage === 'PENDING_AGENCY' :
       filterStage === 'PENDING_SALES' ? inv.approvalStage === 'PENDING_SALES' :
       filterStage === 'PENDING_ASM' ? inv.approvalStage === 'PENDING_ASM' :
       filterStage === 'PENDING_MARKETING' ? inv.approvalStage === 'PENDING_MARKETING' :
       filterStage === 'CONTRACTOR_CONFIRMED' ? inv.approvalStage === 'CONTRACTOR_CONFIRMED' :
       filterStage === 'PAID' ? inv.approvalStage === 'PAID' :
       filterStage === 'APPROVED' ? (inv.approvalStage === 'APPROVED' || inv.approvalStage === 'CONTRACTOR_CONFIRMED' || inv.approvalStage === 'PAID') :
       filterStage === 'REJECTED' ? inv.approvalStage === 'REJECTED' : true);

    const matchAgencyApproval = filterAgencyApproval === 'ALL' ||
      (filterAgencyApproval === 'YES' ? inv.agencyApproved : !inv.agencyApproved);

    return matchKeyword && matchAgency && matchStage && matchAgencyApproval;
  });

  // Hiển thị chuỗi 5 cấp phê duyệt trên cùng 1 hàng: Chờ đại lý duyệt - Chờ NVKD duyệt - Chờ ASM duyệt - Chờ MTK duyệt - Thợ xác nhận
  const renderStagePipeline = (inv: InvoiceItem, isDrawer = false) => {
    const isLarge = inv.areaM2 > 500;
    const isFull = stageDisplayMode === 'FULL';

    // Cấp 1: Đại lý duyệt
    let s1State: 'done' | 'active' | 'waiting' | 'rejected' = 'waiting';
    let s1Text = isFull ? 'Chờ đại lý duyệt' : 'Đại lý';
    if (inv.approvalStage === 'REJECTED' && !inv.agencyApproved) {
      s1State = 'rejected';
      s1Text = isFull ? 'Đại lý từ chối' : 'Đại lý ✗';
    } else if (inv.agencyApproved || inv.approvalStage !== 'PENDING_AGENCY') {
      s1State = 'done';
      s1Text = isFull ? 'Đại lý đã duyệt' : 'Đại lý ✓';
    } else {
      s1State = 'active';
      s1Text = isFull ? 'Chờ đại lý duyệt' : 'Chờ đại lý';
    }

    // Cấp 2: Nhân viên kinh doanh duyệt
    let s2State: 'done' | 'active' | 'waiting' | 'rejected' = 'waiting';
    let s2Text = isFull ? 'Chờ NVKD duyệt' : 'NVKD';
    if (inv.approvalStage === 'PENDING_AGENCY') {
      s2State = 'waiting';
      s2Text = isFull ? 'Chờ NVKD duyệt' : 'Chờ NVKD';
    } else if (inv.approvalStage === 'PENDING_SALES') {
      s2State = 'active';
      s2Text = isFull ? 'Chờ NVKD duyệt' : 'Chờ NVKD';
    } else if (inv.approvalStage === 'REJECTED' && inv.agencyApproved && !inv.adjustedPoints && !isLarge) {
      s2State = 'rejected';
      s2Text = isFull ? 'NVKD từ chối' : 'NVKD ✗';
    } else {
      s2State = 'done';
      s2Text = isFull ? 'NVKD đã duyệt' : 'NVKD ✓';
    }

    // Cấp 3: Giám đốc vùng (ASM) duyệt
    let s3State: 'done' | 'active' | 'waiting' | 'skipped' | 'rejected' = 'waiting';
    let s3Text = isFull ? 'Chờ ASM duyệt' : 'ASM';
    if (!isLarge) {
      // <= 500m2: theo quy chuẩn Poshaco tự động miễn duyệt cấp ASM
      s3State = 'skipped';
      s3Text = isFull ? 'Bỏ qua ASM (≤500m²)' : 'Miễn ASM';
    } else {
      // > 500m2: bắt buộc cấp ASM phê duyệt
      if (inv.approvalStage === 'PENDING_AGENCY' || inv.approvalStage === 'PENDING_SALES') {
        s3State = 'waiting';
        s3Text = isFull ? 'Chờ ASM duyệt' : 'Chờ ASM';
      } else if (inv.approvalStage === 'PENDING_ASM') {
        s3State = 'active';
        s3Text = isFull ? 'Chờ ASM duyệt' : 'Chờ ASM';
      } else if (inv.approvalStage === 'REJECTED' && inv.approvalStage === 'REJECTED') {
        s3State = 'rejected';
        s3Text = isFull ? 'ASM từ chối' : 'ASM ✗';
      } else {
        s3State = 'done';
        s3Text = isFull ? 'ASM đã duyệt' : 'ASM ✓';
      }
    }

    // Cấp 4: Marketing (MTK) phê duyệt
    let s4State: 'done' | 'active' | 'waiting' | 'rejected' = 'waiting';
    let s4Text = isFull ? 'Chờ MTK duyệt' : 'MTK';
    if (inv.approvalStage === 'APPROVED' || inv.approvalStage === 'CONTRACTOR_CONFIRMED' || inv.approvalStage === 'PAID') {
      s4State = 'done';
      s4Text = isFull ? 'MTK đã duyệt' : 'MTK ✓';
    } else if (inv.approvalStage === 'PENDING_MARKETING') {
      s4State = 'active';
      s4Text = isFull ? 'Chờ MTK duyệt' : 'Chờ MTK';
    } else if (inv.approvalStage === 'REJECTED') {
      s4State = 'rejected';
      s4Text = isFull ? 'MTK từ chối' : 'MTK ✗';
    } else {
      s4State = 'waiting';
      s4Text = isFull ? 'Chờ MTK duyệt' : 'Chờ MTK';
    }

    // Cấp 5: Thợ xác nhận (tự động chuyển khi phiếu đối soát sản lượng được duyệt)
    let s5State: 'done' | 'active' | 'waiting' | 'rejected' = 'waiting';
    let s5Text = isFull ? 'Thợ xác nhận' : 'Thợ';
    if (inv.approvalStage === 'CONTRACTOR_CONFIRMED' || inv.approvalStage === 'PAID') {
      s5State = 'done';
      s5Text = isFull ? 'Thợ đã xác nhận' : 'Thợ ✓';
    } else if (inv.approvalStage === 'APPROVED') {
      s5State = 'active';
      s5Text = isFull ? 'Chờ thợ xác nhận' : 'Chờ thợ';
    } else if (inv.approvalStage === 'REJECTED') {
      s5State = 'rejected';
      s5Text = isFull ? 'Không xác nhận' : 'Thợ ✗';
    } else {
      s5State = 'waiting';
      s5Text = isFull ? 'Thợ xác nhận' : 'Thợ';
    }

    const renderPill = (
      state: 'done' | 'active' | 'waiting' | 'skipped' | 'rejected',
      text: string,
      theme: 'agency' | 'sales' | 'asm' | 'mtk' | 'contractor',
      title: string
    ) => {
      if (state === 'done') {
        return (
          <span
            title={title}
            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200/90 shrink-0 shadow-2xs"
          >
            <Check className="h-3 w-3 text-emerald-600 shrink-0 stroke-[2.5]" />
            <span>{text}</span>
          </span>
        );
      }

      if (state === 'active') {
        const themeStyles = {
          agency: 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-200/70',
          sales: 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-200/70',
          asm: 'bg-purple-50 text-purple-900 border-purple-300 ring-2 ring-purple-200/70',
          mtk: 'bg-teal-50 text-[#0c7f7f] border-teal-300 ring-2 ring-teal-200/70',
          contractor: 'bg-cyan-50 text-[#0e7490] border-cyan-300 ring-2 ring-cyan-200/70',
        };
        return (
          <span
            title={`Đang chờ xử lý: ${title}`}
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold border shadow-2xs shrink-0 ${themeStyles[theme]}`}
          >
            <Clock className="h-3 w-3 shrink-0 animate-pulse text-current" />
            <span>{text}</span>
          </span>
        );
      }

      if (state === 'skipped') {
        return (
          <span
            title="Đơn hàng ≤ 500m² tự động bỏ qua cấp Giám đốc vùng (ASM)"
            className="inline-flex items-center gap-1 rounded bg-slate-100/90 px-2 py-0.5 text-[10.5px] font-normal text-slate-500 border border-dashed border-slate-300 shrink-0"
          >
            <span className="text-slate-400 text-[10px]">↳</span>
            <span>{text}</span>
          </span>
        );
      }

      if (state === 'rejected') {
        return (
          <span
            title={`Bị từ chối: ${title}`}
            className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-[#C0392B] border border-rose-200 shrink-0"
          >
            <Ban className="h-3 w-3 text-[#C0392B] shrink-0" />
            <span>{text}</span>
          </span>
        );
      }

      // waiting / upcoming
      return (
        <span
          title={`Chưa đến lượt duyệt: ${title}`}
          className="inline-flex items-center gap-1 rounded bg-slate-50/90 px-2 py-0.5 text-[11px] font-normal text-slate-400 border border-slate-200/80 shrink-0"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0 inline-block" />
          <span>{text}</span>
        </span>
      );
    };

    return (
      <div className={`flex items-center ${isDrawer ? 'flex-wrap' : 'whitespace-nowrap'} gap-1.5 justify-start text-xs`}>
        {renderPill(s1State, s1Text, 'agency', 'Cấp 1: Đại lý tiếp nhận và kiểm tra hóa đơn')}
        <span className="text-slate-300 font-bold select-none px-0.5">-</span>
        {renderPill(s2State, s2Text, 'sales', 'Cấp 2: Nhân viên kinh doanh phụ trách kiểm tra')}
        <span className="text-slate-300 font-bold select-none px-0.5">-</span>
        {renderPill(s3State, s3Text, 'asm', 'Cấp 3: Giám đốc vùng (ASM) phê duyệt đơn >500m²')}
        <span className="text-slate-300 font-bold select-none px-0.5">-</span>
        {renderPill(s4State, s4Text, 'mtk', 'Cấp 4: Marketing phê duyệt phát hành thưởng')}
        <span className="text-slate-300 font-bold select-none px-0.5">-</span>
        {renderPill(s5State, s5Text, 'contractor', 'Cấp 5: Thợ xác nhận sản lượng đối soát')}
      </div>
    );
  };

  const getStageBadge = (inv: InvoiceItem) => {
    return renderStagePipeline(inv);
  };

  const handleExportCsv = () => {
    const headers = ['STT', 'Mã hóa đơn', 'Đại lý', 'Người gửi (Thợ)', 'SĐT', 'Ngày hóa đơn', 'Số m²', 'Trạng thái', 'Điểm thưởng'];
    const rows = filteredInvoices.map((inv, idx) => [
      idx + 1,
      inv.code,
      inv.agencyName,
      inv.contractorName,
      inv.contractorPhone,
      inv.invoiceDate,
      inv.areaM2,
      inv.statusDisplay,
      inv.adjustedPoints || inv.calculatedPoints,
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_hoa_don_Poshaco_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Chương trình Poshaco Pro</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-medium">Hóa đơn</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
            Phê duyệt Hóa đơn
          </h1>
        </div>

        {/* Workflow Helper Banner */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 px-3.5 py-2 text-xs text-slate-700 flex items-center gap-2 max-w-2xl">
          <Layers className="h-4 w-4 text-[#0FA3A3] shrink-0" />
          <div className="leading-tight">
            <strong className="text-[#0FA3A3]">Luồng duyệt chuẩn:</strong> Chờ đại lý duyệt → Chờ NVKD duyệt → Chờ ASM duyệt (&gt;500m²) → Chờ MTK duyệt → Thợ xác nhận (khi duyệt phiếu đối soát).
          </div>
        </div>
      </div>

      {/* Filter Bar (Matching screenshot 3) */}
      <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái duyệt</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý (Tất cả cấp)</option>
              <option value="PENDING_AGENCY">1. Chờ đại lý duyệt</option>
              <option value="PENDING_SALES">2. Chờ NVKD duyệt</option>
              <option value="PENDING_ASM">3. Chờ ASM duyệt (&gt;500m²)</option>
              <option value="PENDING_MARKETING">4. Chờ MTK duyệt cuối</option>
              <option value="CONTRACTOR_CONFIRMED">5. Thợ xác nhận (Đã duyệt đối soát)</option>
              <option value="PAID">6. Đã chi tiền</option>
              <option value="APPROVED">MTK đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>

          {/* Đại lý duyệt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý duyệt</label>
            <select
              value={filterAgencyApproval}
              onChange={(e) => setFilterAgencyApproval(e.target.value)}
              className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-1.5 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="NO">Chờ đại lý duyệt</option>
              <option value="YES">Đại lý đã duyệt</option>
            </select>
          </div>

          {/* Đại lý */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đại lý phát sinh</label>
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

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => {}}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0FA3A3] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0c8787] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tìm kiếm</span>
            </button>
            <button
              onClick={() => {
                setFilterAgency('ALL');
                setFilterStage('ALL');
                setFilterAgencyApproval('ALL');
                setSearchKeyword('');
              }}
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E5EAEC] bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              title="Làm mới bộ lọc"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Header on Table */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo thợ, SĐT, mã đơn..."
            className="w-full rounded-xl border border-[#E5EAEC] bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0FA3A3] focus:outline-none shadow-2xs"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          {/* Chế độ hiển thị chuỗi trạng thái */}
          <div className="hidden sm:inline-flex items-center rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStageDisplayMode('FULL')}
              className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                stageDisplayMode === 'FULL'
                  ? 'bg-white text-[#0FA3A3] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Hiển thị đầy đủ: Chờ đại lý duyệt - Chờ nhân viên kinh doanh duyệt - Chờ ASM duyệt - Chờ MTK duyệt"
            >
              Tên đầy đủ
            </button>
            <button
              type="button"
              onClick={() => setStageDisplayMode('COMPACT')}
              className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                stageDisplayMode === 'COMPACT'
                  ? 'bg-white text-[#0FA3A3] shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Hiển thị rút gọn: Đại lý - NVKD - ASM - MTK"
            >
              Rút gọn
            </button>
          </div>

          <button
            onClick={() => setIsNewInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#0FA3A3]" />
            <span>Tạo hóa đơn hộ</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table Container (Matches screenshot 3) */}
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
                <th className="py-3 px-3 min-w-[150px]">Đại lý</th>
                <th className="py-3 px-3 min-w-[140px]">Người gửi (Thợ)</th>
                <th className="py-3 px-3 text-center">Ngày hóa đơn</th>
                <th className="py-3 px-3 text-right">Số M²</th>
                <th className="py-3 px-3 text-center min-w-[660px]">
                  <div className="flex items-center justify-center gap-2">
                    <span>Trạng thái duyệt</span>
                    <span className="text-[10px] font-normal text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-[#E5EAEC]">
                      Chờ đại lý duyệt - Chờ NVKD duyệt - Chờ ASM duyệt - Chờ MTK duyệt - Thợ xác nhận
                    </span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Ngày gửi</th>
                <th className="py-3 px-3 text-center min-w-[120px]">Phát hành thưởng</th>
                <th className="py-3 px-3 text-center min-w-[90px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy hóa đơn nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, index) => {
                  const isLarge = inv.areaM2 > 500;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(inv)}
                    >
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-[#0FA3A3] focus:ring-[#0FA3A3]"
                          checked={selectedInvoiceIds.includes(inv.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoiceIds([...selectedInvoiceIds, inv.id]);
                            } else {
                              setSelectedInvoiceIds(selectedInvoiceIds.filter((id) => id !== inv.id));
                            }
                          }}
                        />
                      </td>

                      <td className="py-3 px-2 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        <div className="truncate max-w-[150px]">{inv.agencyName}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{inv.contractorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.contractorPhone}</div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {inv.invoiceDate}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className={`font-mono font-bold tabular-nums ${isLarge ? 'text-purple-700 bg-purple-50 px-1 rounded' : 'text-[#0FA3A3]'}`}>
                          {inv.areaM2} m²
                        </span>
                        {isLarge && (
                          <div className="text-[9px] text-purple-600 font-semibold">&gt;500m² ASM</div>
                        )}
                      </td>

                      {/* Trạng thái duyệt: Chuỗi 4 cấp độ trên cùng 1 hàng */}
                      <td className="py-3 px-3">
                        {renderStagePipeline(inv)}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {inv.submittedDate}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {inv.approvalStage === 'APPROVED' ? (
                          <span className="font-mono font-bold text-emerald-700">
                            +{(inv.adjustedPoints || inv.calculatedPoints).toLocaleString('vi-VN')} đ
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(inv);
                        }}
                      >
                        <button
                          className="inline-flex items-center gap-1 rounded-md border border-[#E5EAEC] bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Eye className="h-3 w-3 text-slate-400" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#E5EAEC] px-4 py-3 text-xs text-slate-500">
          <div>
            Hiển thị 1-{filteredInvoices.length} / <strong>{filteredInvoices.length}</strong> bản ghi
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Trang</span>
            <div className="flex items-center gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E5EAEC] bg-[#0FA3A3] text-white font-bold">
                1
              </button>
            </div>
            <select className="rounded border border-[#E5EAEC] bg-white px-2 py-1 text-xs text-slate-700">
              <option>20 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* POPUP DRAWER: Slide-over bên phải màn hình khi click "Chi tiết" (Matches Screenshot 4) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-hidden no-print">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              {/* Drawer Top Navigation Bar */}
              <div className="flex items-center justify-between border-b border-[#E5EAEC] px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloseDrawer}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <h2 className="text-base font-bold text-slate-800">
                    Chi tiết Hóa đơn <span className="font-mono text-slate-500 font-normal">({selectedInvoice.code})</span>
                  </h2>
                </div>

                {/* Top Action Buttons inside Drawer */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingData(!isEditingData)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>{isEditingData ? 'Đóng sửa' : 'Sửa số liệu'}</span>
                  </button>

                  {selectedInvoice.approvalStage !== 'APPROVED' && selectedInvoice.approvalStage !== 'REJECTED' && (
                    <>
                      <button
                        onClick={() => handleApproveInvoice(selectedInvoice)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0FA3A3] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0c8787] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Phê duyệt</span>
                      </button>

                      <button
                        onClick={() => handleOpenReject(selectedInvoice)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#C0392B] bg-white px-3 py-1.5 text-xs font-semibold text-[#C0392B] hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Từ chối</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Form sửa số liệu nếu đang mở chế độ sửa */}
                {isEditingData && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#0FA3A3] flex items-center gap-1.5">
                        <Edit3 className="h-4 w-4" />
                        <span>Điều chỉnh số liệu hóa đơn & sản lượng</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Mọi chỉnh sửa đều ghi vết lịch sử</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Số M² thực tế
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editAreaM2}
                          onChange={(e) => setEditAreaM2(Number(e.target.value))}
                          className="w-full rounded border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Số lượng POS Series
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editPosQty}
                          onChange={(e) => setEditPosQty(Number(e.target.value))}
                          className="w-full rounded border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Số lượng K Series
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editKQty}
                          onChange={(e) => setEditKQty(Number(e.target.value))}
                          className="w-full rounded border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lý do điều chỉnh số liệu
                      </label>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="VD: Kiểm tra ảnh hóa đơn thấy thiếu phần mái hiên, cập nhật đúng quy cách"
                        className="w-full rounded border border-[#E5EAEC] bg-white px-2.5 py-1.5 text-xs text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setIsEditingData(false)}
                        className="rounded px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveEditedData}
                        className="rounded bg-[#0FA3A3] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#0c8787]"
                      >
                        Lưu điều chỉnh
                      </button>
                    </div>
                  </div>
                )}

                {/* Structured Invoice Details Table (Matches screenshot 4 exact layout) */}
                <div className="rounded-xl border border-[#E5EAEC] overflow-hidden text-xs">
                  <div className="grid grid-cols-3 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600 flex items-center">
                      Chuỗi phê duyệt 4 cấp
                    </div>
                    <div className="p-3 col-span-2">
                      {renderStagePipeline(selectedInvoice, true)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Đại lý</div>
                    <div className="p-3 col-span-2 font-medium text-slate-800">
                      {selectedInvoice.agencyName}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Người gửi (Thợ)</div>
                    <div className="p-3 col-span-2 font-medium text-slate-800">
                      {selectedInvoice.contractorName} ({selectedInvoice.contractorPhone})
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Ngày hóa đơn</div>
                    <div className="p-3 font-mono">{selectedInvoice.invoiceDate}</div>
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Ngày gửi</div>
                    <div className="p-3 font-mono">{selectedInvoice.submittedDate}</div>
                  </div>

                  <div className="grid grid-cols-3 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Số M2</div>
                    <div className="p-3 col-span-2 font-mono font-bold text-[#0FA3A3] text-sm tabular-nums">
                      {selectedInvoice.areaM2} m²
                      {selectedInvoice.areaM2 > 500 && (
                        <span className="ml-2 text-xs font-normal text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          (Đơn lớn &gt;500m²: ASM duyệt)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Số lượng POS Series</div>
                    <div className="p-3 font-mono">{selectedInvoice.posSeriesQty || '—'}</div>
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Số lượng K Series</div>
                    <div className="p-3 font-mono">{selectedInvoice.kSeriesQty || '—'}</div>
                  </div>

                  <div className="grid grid-cols-3 border-b border-[#E5EAEC] divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Chi tiết sản phẩm</div>
                    <div className="p-3 col-span-2 text-slate-700">
                      {selectedInvoice.productDescription || '—'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="bg-slate-50/70 p-3 font-semibold text-slate-600">Điểm thưởng</div>
                    <div className="p-3 col-span-2">
                      {selectedInvoice.approvalStage === 'APPROVED' ? (
                        <span className="font-bold text-emerald-700 font-mono text-sm">
                          {(selectedInvoice.adjustedPoints || selectedInvoice.calculatedPoints).toLocaleString('vi-VN')} điểm
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Chưa cộng điểm (Dự kiến: <strong className="font-mono text-[#0FA3A3]">{selectedInvoice.calculatedPoints.toLocaleString('vi-VN')} điểm</strong>)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Lịch sử sửa số liệu (Matches Screenshot 4) */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800">Lịch sử sửa số liệu:</h3>
                  {selectedInvoice.editHistory.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#E5EAEC] p-6 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-2">Chưa có lần sửa nào</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedInvoice.editHistory.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-[#E5EAEC] bg-[#F4F7F8]/50 p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-semibold text-slate-700">{item.editor}</span>
                            <span className="font-mono text-[10px]">{item.timestamp}</span>
                          </div>
                          <div className="text-slate-700">
                            <span className="line-through text-slate-400 mr-2">{item.oldValue}</span>
                            <ArrowRight className="inline h-3 w-3 text-[#0FA3A3] mx-1" />
                            <span className="font-bold text-[#0FA3A3]">{item.newValue}</span>
                          </div>
                          {item.reason && (
                            <div className="text-[11px] text-slate-500 italic">Lý do: {item.reason}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: Ảnh hóa đơn (Matches Screenshot 4) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800">Ảnh hóa đơn:</h3>
                    <button
                      onClick={() => setIsImageZoomOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0FA3A3] hover:underline"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>Xem ảnh phóng to</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setIsImageZoomOpen(true)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#E5EAEC] bg-slate-100"
                  >
                    <img
                      src={selectedInvoice.invoiceImageUri}
                      alt="Hóa đơn bán hàng kiêm giấy xác nhận công nợ Poshaco"
                      referrerPolicy="no-referrer"
                      className="w-full object-contain max-h-[380px] transition-transform duration-200 group-hover:scale-[1.02]"
                      onError={(e) => {
                        // Fallback UI if local image is unavailable
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md flex items-center gap-1.5">
                        <ZoomIn className="h-4 w-4 text-[#0FA3A3]" />
                        <span>Bấm để phóng to chứng từ</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Phê duyệt cuối của Marketing (MTK) */}
      {isMtkModalOpen && mtkInvoiceToApprove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5EAEC] pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-[#0FA3A3]" />
                <span>Xác nhận Phê duyệt cuối (Cấp Marketing)</span>
              </h3>
              <button
                onClick={() => setIsMtkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-[#F4F7F8] p-3.5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã hóa đơn:</span>
                  <span className="font-mono font-bold text-slate-800">{mtkInvoiceToApprove.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thợ nhận thưởng:</span>
                  <span className="font-bold text-slate-800">{mtkInvoiceToApprove.contractorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sản lượng m²:</span>
                  <span className="font-mono font-bold text-[#0FA3A3]">{mtkInvoiceToApprove.areaM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm tính tự động:</span>
                  <span className="font-mono text-slate-700">{mtkInvoiceToApprove.calculatedPoints.toLocaleString('vi-VN')} điểm</span>
                </div>
              </div>

              {/* Textbox: Điểm thưởng cộng bù / điều chỉnh (theo yêu cầu nghiệp vụ) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  * Điểm thưởng ghi nhận chính thức (Điểm cộng bù / điều chỉnh):
                </label>
                <input
                  type="number"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3.5 py-2 text-sm font-mono font-bold text-[#0FA3A3] focus:border-[#0FA3A3] focus:outline-none"
                  min={0}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Marketing có thể điều chỉnh hoặc cộng bù điểm khuyến mãi theo chương trình thực tế.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Ghi chú phê duyệt:
                </label>
                <textarea
                  rows={2}
                  value={mtkNotes}
                  onChange={(e) => setMtkNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EAEC]">
                <button
                  type="button"
                  onClick={() => setIsMtkModalOpen(false)}
                  className="rounded-xl border border-[#E5EAEC] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMtkApproval}
                  className="rounded-xl bg-[#0FA3A3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c8787]"
                >
                  Xác nhận duyệt hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Từ chối hóa đơn */}
      {isRejectModalOpen && invoiceToReject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5EAEC] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#C0392B] flex items-center gap-2">
                <Ban className="h-5 w-5" />
                <span>Từ chối hóa đơn ({invoiceToReject.code})</span>
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Vui lòng nêu rõ lý do từ chối để hệ thống thông báo lại cho Thợ <strong>{invoiceToReject.contractorName}</strong> gửi lại ảnh chứng từ chính xác:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  * Lý do từ chối
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="VD: Ảnh hóa đơn bị mất góc quy cách, số lượng tấm không khớp hoặc hóa đơn đã từng được gửi..."
                  className="w-full rounded-lg border border-[#E5EAEC] p-3 text-xs text-slate-800 focus:border-[#C0392B] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl border border-[#E5EAEC] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="rounded-xl bg-[#C0392B] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Phóng to ảnh chứng từ */}
      {isImageZoomOpen && selectedInvoice && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-3">
              <span className="text-xs font-semibold">
                Chứng từ gốc: Hóa đơn bán hàng kiêm xác nhận công nợ Poshaco ({selectedInvoice.code})
              </span>
              <button
                onClick={() => setIsImageZoomOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={selectedInvoice.invoiceImageUri}
                alt="Chứng từ gốc"
                className="max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tạo hóa đơn hộ (Tiện ích hỗ trợ mô phỏng) */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5EAEC] pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0FA3A3]" />
                <span>Tạo hóa đơn hộ Thợ gửi về</span>
              </h3>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đại lý phát sinh
                </label>
                <select
                  value={newAgency}
                  onChange={(e) => setNewAgency(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                >
                  {AGENCIES_LIST.map((ag) => (
                    <option key={ag.code} value={ag.code}>
                      {ag.code} - {ag.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ tên Thợ</label>
                  <input
                    type="text"
                    value={newContractorName}
                    onChange={(e) => setNewContractorName(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newContractorPhone}
                    onChange={(e) => setNewContractorPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sản lượng diện tích (m²)
                </label>
                <input
                  type="number"
                  value={newAreaM2}
                  onChange={(e) => setNewAreaM2(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs font-bold font-mono text-[#0FA3A3]"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Thử nhập &gt; 500m² (ví dụ 600m²) để kiểm tra luồng ASM duyệt!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sản phẩm chi tiết</label>
                <input
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5EAEC]">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="rounded-xl border border-[#E5EAEC] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const agencyObj = AGENCIES_LIST.find((a) => a.code === newAgency) || AGENCIES_LIST[0];
                    const newInv: InvoiceItem = {
                      id: `inv-${Date.now()}`,
                      code: `HD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      agencyCode: agencyObj.code,
                      agencyName: `${agencyObj.code} - ${agencyObj.name}`,
                      contractorName: newContractorName,
                      contractorPhone: newContractorPhone,
                      invoiceDate: new Date().toLocaleDateString('vi-VN'),
                      submittedDate: new Date().toLocaleDateString('vi-VN'),
                      areaM2: newAreaM2,
                      posSeriesQty: newAreaM2 * 0.8,
                      kSeriesQty: newAreaM2 * 0.2,
                      productDescription: newProduct,
                      calculatedPoints: Math.round(newAreaM2 * 10),
                      approvalStage: 'PENDING_AGENCY',
                      agencyApproved: false,
                      statusDisplay: 'Chờ xử lý',
                      invoiceImageUri: '/assets/images/poshaco_invoice_bill_1790136760766.jpg',
                      editHistory: [],
                    };
                    onUpdateInvoice(newInv);
                    setIsNewInvoiceModalOpen(false);
                    alert(`Đã tạo hóa đơn hộ thành công (${newInv.code})! Đơn bắt đầu ở bước "Chờ đại lý duyệt".`);
                  }}
                  className="rounded-xl bg-[#0FA3A3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0c8787]"
                >
                  Tạo đơn mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
