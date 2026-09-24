import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  Trash2,
  X,
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building,
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Maximize2,
  Minimize2,
  Pencil
} from 'lucide-react';
import { PromotionProgram, RewardMilestone } from '../types/poshaco';
import { AGENCIES_LIST } from '../data/mockData';

interface Module1ProgramsProps {
  programs: PromotionProgram[];
  onAddProgram: (program: PromotionProgram) => void;
  onUpdateProgram?: (program: PromotionProgram) => void;
  onToggleStatus: (id: string) => void;
  onDeleteProgram: (id: string) => void;
}

export const Module1Programs: React.FC<Module1ProgramsProps> = ({
  programs,
  onAddProgram,
  onUpdateProgram,
  onToggleStatus,
  onDeleteProgram,
}) => {
  // Filters
  const [filterAgency, setFilterAgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<PromotionProgram | null>(null);
  const [modalTab, setModalTab] = useState<'POINTS' | 'MILESTONES'>('POINTS');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form State: Tab Tích lũy điểm (Theo đúng ảnh mẫu)
  const [pointName, setPointName] = useState('');
  const [businessCode, setBusinessCode] = useState('DUPH-BG');
  const [stepValue, setStepValue] = useState<string>('100');
  const [rewardPerStep, setRewardPerStep] = useState<string>('1000');
  const [rewardGift, setRewardGift] = useState<string>('');
  const [pointStartDate, setPointStartDate] = useState<string>('');
  const [pointEndDate, setPointEndDate] = useState<string>('');
  const [pointStatus, setPointStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Form State: Tab Tích lũy mốc (Giữ nguyên như hiện tại)
  const [name, setName] = useState('');
  const [agencyScope, setAgencyScope] = useState<'ALL' | 'SPECIFIC'>('SPECIFIC');
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>(['DOHU-BG']);
  const [milestones, setMilestones] = useState<RewardMilestone[]>([
    { id: '1', milestoneM2: '', rewardPoints: '' }
  ]);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Dynamic milestone handlers - Khởi tạo ô trống theo yêu cầu
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), milestoneM2: '', rewardPoints: '' }
    ]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) {
      alert('Chương trình phải có ít nhất 1 mốc thưởng!');
      return;
    }
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleUpdateMilestone = (id: string, field: 'milestoneM2' | 'rewardPoints', rawVal: string) => {
    const parsedVal = rawVal === '' ? ('' as any) : Number(rawVal);
    setMilestones(
      milestones.map(m => m.id === id ? { ...m, [field]: parsedVal } : m)
    );
  };

  const toggleSelectAgency = (code: string) => {
    if (selectedAgencies.includes(code)) {
      if (selectedAgencies.length === 1) {
        alert('Vui lòng giữ lại ít nhất 1 đại lý khi chọn phạm vi Đại lý cụ thể');
        return;
      }
      setSelectedAgencies(selectedAgencies.filter(c => c !== code));
    } else {
      setSelectedAgencies([...selectedAgencies, code]);
    }
  };

  const handleResetFilters = () => {
    setFilterAgency('ALL');
    setFilterStatus('ALL');
    setSearchKeyword('');
  };

  const handleOpenCreateModal = () => {
    setEditingProgram(null);
    setFormError(null);
    setModalTab('POINTS');
    // Reset points tab form
    setPointName('');
    setBusinessCode('DUPH-BG');
    setStepValue('100');
    setRewardPerStep('1000');
    setRewardGift('');
    setPointStartDate('');
    setPointEndDate('');
    setPointStatus('ACTIVE');
    // Reset milestones tab form
    setName('');
    setAgencyScope('SPECIFIC');
    setSelectedAgencies(['DOHU-BG']);
    setMilestones([{ id: '1', milestoneM2: '', rewardPoints: '' }]);
    setStartDate('2026-09-01');
    setEndDate('2026-12-31');
    setStatus('ACTIVE');

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prog: PromotionProgram) => {
    setEditingProgram(prog);
    setFormError(null);

    const isPoints = prog.type === 'POINTS_ACCUMULATION';
    setModalTab(isPoints ? 'POINTS' : 'MILESTONES');

    if (isPoints) {
      setPointName(prog.name);
      setBusinessCode(prog.businessCode || prog.agencies[0] || 'DUPH-BG');
      setStepValue(
        prog.stepValue !== undefined
          ? String(prog.stepValue)
          : String(prog.milestones[0]?.milestoneM2 || 100)
      );
      setRewardPerStep(
        prog.rewardPerStep !== undefined
          ? String(prog.rewardPerStep)
          : String(prog.milestones[0]?.rewardPoints || 1000)
      );
      setRewardGift(prog.rewardGift || '');
      setPointStartDate(prog.startDate || '');
      setPointEndDate(prog.endDate || '');
      setPointStatus(prog.status);
    } else {
      setName(prog.name);
      setAgencyScope(prog.agencyScope || 'SPECIFIC');
      setSelectedAgencies(prog.agencies && prog.agencies.length > 0 ? prog.agencies : ['DOHU-BG']);
      setMilestones(
        prog.milestones && prog.milestones.length > 0
          ? prog.milestones.map((m) => ({ ...m }))
          : [{ id: '1', milestoneM2: '', rewardPoints: '' }]
      );
      setStartDate(prog.startDate || '2026-09-01');
      setEndDate(prog.endDate || '2026-12-31');
      setStatus(prog.status);
    }

    setIsModalOpen(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalTab === 'POINTS') {
      if (!pointName.trim()) {
        setFormError('Vui lòng nhập tên chương trình');
        return;
      }
      if (!businessCode.trim()) {
        setFormError('Vui lòng chọn Mã đại lý C2');
        return;
      }

      const stepNum = Number(stepValue) || 100;
      const rewardNum = Number(rewardPerStep) || 1000;

      if (editingProgram) {
        // Cập nhật chương trình tích lũy điểm đang chọn
        const updatedProg: PromotionProgram = {
          ...editingProgram,
          name: pointName.trim(),
          type: 'POINTS_ACCUMULATION',
          agencyScope: 'SPECIFIC',
          businessCode: businessCode.trim(),
          agencies: [businessCode.trim()],
          agencyCodeDisplay: businessCode.trim(),
          stepValue: stepNum,
          rewardPerStep: rewardNum,
          rewardGift: rewardGift ? rewardGift : undefined,
          milestones: [
            {
              id: editingProgram.milestones[0]?.id || '1',
              milestoneM2: stepNum,
              rewardPoints: rewardNum
            }
          ],
          startDate: pointStartDate || editingProgram.startDate || new Date().toISOString().split('T')[0],
          endDate: pointEndDate || editingProgram.endDate || '2026-12-31',
          status: pointStatus,
        };

        if (onUpdateProgram) {
          onUpdateProgram(updatedProg);
        } else {
          onAddProgram(updatedProg);
        }
      } else {
        // Thêm mới chương trình tích lũy điểm
        const newProg: PromotionProgram = {
          id: `prog-pt-${Date.now()}`,
          name: pointName.trim(),
          type: 'POINTS_ACCUMULATION',
          agencyScope: 'SPECIFIC',
          businessCode: businessCode.trim(),
          agencies: [businessCode.trim()],
          agencyCodeDisplay: businessCode.trim(),
          stepValue: stepNum,
          rewardPerStep: rewardNum,
          rewardGift: rewardGift ? rewardGift : undefined,
          milestones: [
            {
              id: '1',
              milestoneM2: stepNum,
              rewardPoints: rewardNum
            }
          ],
          startDate: pointStartDate || new Date().toISOString().split('T')[0],
          endDate: pointEndDate || '2026-12-31',
          status: pointStatus,
          organization: 'Công ty Thép Poshaco',
          createdAt: new Date().toISOString().split('T')[0],
        };

        onAddProgram(newProg);
      }

      setIsModalOpen(false);
      setEditingProgram(null);
      setPointName('');
      setFormError(null);
      return;
    }

    // ModalTab === 'MILESTONES' (Giữ nguyên như hiện tại)
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên chương trình');
      return;
    }
    if (agencyScope === 'SPECIFIC' && selectedAgencies.length === 0) {
      setFormError('Vui lòng chọn ít nhất 1 đại lý áp dụng');
      return;
    }

    if (editingProgram) {
      // Cập nhật chương trình tích lũy mốc đang chọn
      const updatedProg: PromotionProgram = {
        ...editingProgram,
        name: name.trim(),
        type: 'MILESTONE_ACCUMULATION',
        agencyScope,
        agencies: agencyScope === 'ALL' ? [] : selectedAgencies,
        agencyCodeDisplay: agencyScope === 'ALL' ? 'Tất cả đại lý' : selectedAgencies.join(', '),
        milestones: milestones.map(m => ({
          id: m.id,
          milestoneM2: m.milestoneM2 === '' ? 0 : Number(m.milestoneM2),
          rewardPoints: m.rewardPoints === '' ? 0 : Number(m.rewardPoints)
        })),
        startDate,
        endDate,
        status,
      };

      if (onUpdateProgram) {
        onUpdateProgram(updatedProg);
      } else {
        onAddProgram(updatedProg);
      }
    } else {
      // Thêm mới chương trình tích lũy mốc
      const newProg: PromotionProgram = {
        id: `prog-${Date.now()}`,
        name: name.trim(),
        type: 'MILESTONE_ACCUMULATION',
        agencyScope,
        agencies: agencyScope === 'ALL' ? [] : selectedAgencies,
        agencyCodeDisplay: agencyScope === 'ALL' ? 'Tất cả đại lý' : selectedAgencies.join(', '),
        milestones: milestones.map(m => ({
          id: m.id,
          milestoneM2: m.milestoneM2 === '' ? 0 : Number(m.milestoneM2),
          rewardPoints: m.rewardPoints === '' ? 0 : Number(m.rewardPoints)
        })),
        startDate,
        endDate,
        status,
        organization: 'Công ty Thép Poshaco',
        createdAt: new Date().toISOString().split('T')[0],
      };

      onAddProgram(newProg);
    }

    setIsModalOpen(false);
    setEditingProgram(null);
    setName('');
    setFormError(null);
    setMilestones([{ id: '1', milestoneM2: '', rewardPoints: '' }]);
  };

  // Filtered programs
  const filteredPrograms = programs.filter(prog => {
    const matchKeyword = !searchKeyword.trim() || 
      prog.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (prog.agencyCodeDisplay && prog.agencyCodeDisplay.toLowerCase().includes(searchKeyword.toLowerCase()));
    
    const matchAgency = filterAgency === 'ALL' || 
      prog.agencyScope === 'ALL' || 
      prog.agencies.includes(filterAgency);

    const matchStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' ? prog.status === 'ACTIVE' : prog.status === 'INACTIVE');

    return matchKeyword && matchAgency && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Chương trình Poshaco Pro</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-800 font-medium">Chương trình thưởng tích lũy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
            Chương trình thưởng tích lũy
          </h1>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0FA3A3] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#0c8787] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo chương trình</span>
        </button>
      </div>

      {/* Filter Card Container */}
      <div className="rounded-xl border border-[#E5EAEC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Lọc Đại lý */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đại lý
            </label>
            <select
              value={filterAgency}
              onChange={(e) => setFilterAgency(e.target.value)}
              className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0FA3A3] focus:bg-white focus:outline-none transition-colors"
            >
              <option value="ALL">Tất cả đại lý</option>
              {AGENCIES_LIST.map((ag) => (
                <option key={ag.code} value={ag.code}>
                  {ag.code} - {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0FA3A3] focus:bg-white focus:outline-none transition-colors"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tắt / Đã dừng</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
            <button
              onClick={() => {}}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[#0FA3A3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c8787] transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tìm kiếm</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="rounded-xl border border-[#E5EAEC] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Search Bar on top of table (as in screenshot 1) */}
        <div className="p-3 border-b border-[#E5EAEC] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm chương trình, mã đại lý..."
              className="w-full rounded-lg border border-[#E5EAEC] bg-slate-50/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0FA3A3] focus:bg-white focus:outline-none transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-800">{filteredPrograms.length}</strong> chương trình
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5EAEC] bg-[#F4F7F8]/80 text-slate-600 font-semibold">
                <th className="py-3 px-3.5 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[240px]">Tên chương trình</th>
                <th className="py-3 px-3 min-w-[120px]">Đại lý (C2)</th>
                <th className="py-3 px-3 text-right">Mức mốc (m²)</th>
                <th className="py-3 px-3 text-right">Giá trị thưởng (VND)</th>
                <th className="py-3 px-3.5 text-center min-w-[160px]">Thời gian áp dụng</th>
                <th className="py-3 px-3.5 text-center min-w-[110px]">Trạng thái</th>
                <th className="py-3 px-3.5 text-center min-w-[100px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy chương trình tích lũy nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog, index) => {
                  const primaryMilestone = prog.milestones[0] || { milestoneM2: 0, rewardPoints: 0 };
                  const hasMultipleMs = prog.milestones.length > 1;

                  return (
                    <tr
                      key={prog.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-3.5 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="leading-snug">{prog.name}</span>
                          {prog.type === 'POINTS_ACCUMULATION' ? (
                            <span className="rounded bg-teal-50 text-[#115e59] border border-teal-200 px-1.5 py-0.5 text-[10px] font-semibold">
                              Tích lũy điểm
                            </span>
                          ) : (
                            <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold">
                              Tích lũy mốc
                            </span>
                          )}
                        </div>
                        {prog.rewardGift && (
                          <div className="text-[11px] font-medium text-[#115e59] mt-0.5">
                            🎁 Quà: {prog.rewardGift}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Tổ chức: {prog.organization} · Áp dụng: {prog.startDate} đến {prog.endDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px]">
                          {prog.agencyCodeDisplay || 'Tất cả'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                        {primaryMilestone.milestoneM2}
                        {hasMultipleMs && (
                          <span className="ml-1 text-[10px] font-normal text-[#0FA3A3]" title={`Có ${prog.milestones.length} mốc thưởng`}>
                            (+{prog.milestones.length - 1} mốc)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#0FA3A3] tabular-nums">
                        {primaryMilestone.rewardPoints.toLocaleString('vi-VN')}
                      </td>

                      <td className="py-3.5 px-3.5 text-center font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100/80 border border-slate-200">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{prog.startDate} → {prog.endDate}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3.5 text-center">
                        <button
                          onClick={() => onToggleStatus(prog.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                            prog.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          title="Nhấn để bật / tắt trạng thái"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              prog.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {prog.status === 'ACTIVE' ? 'Hoạt động' : 'Tắt'}
                        </button>
                      </td>

                      <td className="py-3.5 px-3.5 text-center relative">
                        <div className="inline-flex items-center gap-1.5 text-left">
                          <button
                            onClick={() => handleOpenEditModal(prog)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#0FA3A3]/40 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-[#0FA3A3] hover:bg-[#0FA3A3] hover:text-white transition-all shadow-2xs cursor-pointer"
                            title="Chỉnh sửa chương trình này"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Sửa</span>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === prog.id ? null : prog.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E5EAEC] bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>Khác</span>
                              <MoreVertical className="h-3 w-3 text-slate-400" />
                            </button>

                            {activeMenuId === prog.id && (
                              <div className="absolute right-0 mt-1 w-38 rounded-lg border border-[#E5EAEC] bg-white p-1 shadow-lg z-20 text-left">
                                <button
                                  onClick={() => {
                                    handleOpenEditModal(prog);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-slate-700 hover:bg-teal-50 hover:text-[#0FA3A3] cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-[#0FA3A3]" />
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  onClick={() => {
                                    onToggleStatus(prog.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{prog.status === 'ACTIVE' ? 'Dừng chương trình' : 'Kích hoạt lại'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa chương trình "${prog.name}"?`)) {
                                      onDeleteProgram(prog.id);
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Xóa chương trình</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar matching image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#E5EAEC] px-4 py-3 text-xs text-slate-500">
          <div>
            Hiển thị 1-{filteredPrograms.length} / <strong>{filteredPrograms.length}</strong> bản ghi
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Trang</span>
            <div className="flex items-center gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E5EAEC] bg-[#0FA3A3] text-white font-bold">
                1
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded border border-[#E5EAEC] hover:bg-slate-50">
                2
              </button>
            </div>
            <select className="rounded border border-[#E5EAEC] bg-white px-2 py-1 text-xs text-slate-700">
              <option>20 / trang</option>
              <option>50 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* POPUP: Thêm mới chương trình mốc thưởng */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs overflow-y-auto">
          <div
            className={`relative w-full rounded-2xl border border-[#E5EAEC] bg-white p-6 shadow-2xl transition-all my-6 overflow-y-auto ${
              isFullscreen
                ? 'fixed inset-3 w-auto max-w-none h-[calc(100vh-24px)]'
                : 'max-w-2xl max-h-[92vh]'
            }`}
          >
            {/* Header: Title + Fullscreen + Close icon (Matches image) */}
            <div className="flex items-center justify-between pb-3 mb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {editingProgram ? 'Chỉnh sửa chương trình mốc thưởng' : 'Thêm mới chương trình mốc thưởng'}
              </h3>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4.5 w-4.5" />
                  ) : (
                    <Maximize2 className="h-4.5 w-4.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-header Tabs: Tích lũy điểm & Tích lũy mốc */}
            <div className="flex items-center border-b border-[#E5EAEC] mb-5 gap-8">
              <button
                type="button"
                onClick={() => {
                  setModalTab('POINTS');
                  setFormError(null);
                }}
                className={`pb-2.5 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                  modalTab === 'POINTS'
                    ? 'text-[#115e59] border-b-2 border-[#115e59]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tích lũy điểm
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab('MILESTONES');
                  setFormError(null);
                }}
                className={`pb-2.5 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                  modalTab === 'MILESTONES'
                    ? 'text-[#115e59] border-b-2 border-[#115e59]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tích lũy mốc
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* TAB 1: TÍCH LŨY ĐIỂM (HIỂN THỊ CHUẨN 100% NHƯ ẢNH MẪU) */}
            {modalTab === 'POINTS' && (
              <form onSubmit={handleSaveProgram} className="space-y-4">
                {/* 1. Tên chương trình */}
                <div>
                  <label className="block text-xs text-slate-700 mb-1.5">
                    <span className="text-red-500 mr-1">*</span>Tên chương trình
                  </label>
                  <input
                    type="text"
                    value={pointName}
                    onChange={(e) => setPointName(e.target.value)}
                    placeholder="VD: Tích lũy 2026 - ĐL Minh Anh"
                    className="w-full rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#115e59] focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* 2. Mã đại lý C2 (businessCode) */}
                <div>
                  <label className="block text-xs text-slate-700 mb-1.5">
                    <span className="text-red-500 mr-1">*</span>Mã đại lý C2 (businessCode)
                  </label>
                  <div className="relative">
                    <select
                      value={businessCode}
                      onChange={(e) => setBusinessCode(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-800 focus:border-[#115e59] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="DUPH-BG">VD: DUPH-BG (NPP Dũng Phát - Bắc Giang)</option>
                      {AGENCIES_LIST.map((ag) => (
                        <option key={ag.code} value={ag.code}>
                          {ag.code} - {ag.name}
                        </option>
                      ))}
                      <option value="MINHANH-HN">MINHANH-HN - Đại lý Minh Anh</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* 3 & 4. Mức mốc (mỗi N giá trị) & Điểm thưởng mỗi mốc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 mb-1.5">
                      <span className="text-red-500 mr-1">*</span>Mức mốc (mỗi N giá trị)
                    </label>
                    <input
                      type="text"
                      value={stepValue}
                      onChange={(e) => setStepValue(e.target.value)}
                      placeholder="100"
                      className="w-full rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#115e59] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 mb-1.5">
                      <span className="text-red-500 mr-1">*</span>Điểm thưởng mỗi mốc
                    </label>
                    <input
                      type="text"
                      value={rewardPerStep}
                      onChange={(e) => setRewardPerStep(e.target.value)}
                      placeholder="1000"
                      className="w-full rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#115e59] focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 5. Quà mỗi mốc (Reward — thẻ CARD-...) */}
                <div>
                  <label className="block text-xs text-slate-700 mb-1.5">
                    Quà mỗi mốc (Reward — thẻ CARD-...)
                  </label>
                  <div className="relative">
                    <select
                      value={rewardGift}
                      onChange={(e) => setRewardGift(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-800 focus:border-[#115e59] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Chọn quà (bỏ trống = chỉ cộng điểm)</option>
                      <option value="CARD-200K">CARD-200K: Thẻ cào điện thoại Viettel/Vina/Mobi 200.000đ</option>
                      <option value="CARD-500K">CARD-500K: Thẻ cào điện thoại Viettel/Vina/Mobi 500.000đ</option>
                      <option value="CARD-1000K">CARD-1000K: Thẻ nạp điện thoại Viettel/Vina/Mobi 1.000.000đ</option>
                      <option value="GIFT-SHIRT-HELMET">GIFT-SHIRT-HELMET: Bộ Áo thun & Mũ bảo hiểm Poshaco Pro</option>
                      <option value="TOOL-MAKITA">TOOL-MAKITA: Máy bắt vít chuyên dụng Makita 18V</option>
                      <option value="TOOL-LASER">TOOL-LASER: Máy bắn cốt Laser 12 tia xanh siêu sáng</option>
                      <option value="GOLD-9999">GOLD-9999: 0.5 Chỉ vàng 9999 PNJ Poshaco</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* 6 & 7. Bắt đầu (tùy chọn) & Kết thúc (tùy chọn) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 mb-1.5">
                      Bắt đầu (tùy chọn)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={pointStartDate}
                        onChange={(e) => setPointStartDate(e.target.value)}
                        placeholder="Chọn thời điểm"
                        className="w-full rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#115e59] focus:outline-none transition-colors cursor-pointer"
                      />
                      <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 mb-1.5">
                      Kết thúc (tùy chọn)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={pointEndDate}
                        onChange={(e) => setPointEndDate(e.target.value)}
                        placeholder="Chọn thời điểm"
                        className="w-full rounded-lg border border-[#D5DCDF] bg-white px-3.5 py-2.5 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#115e59] focus:outline-none transition-colors cursor-pointer"
                      />
                      <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* 8. Trạng thái toggle switch (Đúng chuẩn style ảnh mẫu) */}
                <div className="pt-1">
                  <label className="block text-xs text-slate-700 mb-1.5">
                    Trạng thái
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPointStatus(pointStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                    }
                    className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all shadow-2xs ${
                      pointStatus === 'ACTIVE'
                        ? 'bg-[#115e59] text-white'
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{pointStatus === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}</span>
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        pointStatus === 'ACTIVE' ? 'order-2' : 'order-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Footer Buttons (Đúng vị trí & màu sắc ảnh mẫu) */}
                <div className="flex items-center justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-[#D5DCDF] bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#115e59] px-6 py-2 text-xs font-semibold text-white hover:bg-[#0d4a46] active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    {editingProgram ? 'Lưu thay đổi' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: TÍCH LŨY MỐC (GIỮ NGUYÊN NHƯ HIỆN TẠI) */}
            {modalTab === 'MILESTONES' && (
              <form onSubmit={handleSaveProgram} className="space-y-4">
                {/* Tên chương trình */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    * Tên chương trình
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Tích lũy 2026 - ĐL Minh Anh hoặc Tích lũy nhận quà tặng"
                    className="w-full rounded-lg border border-[#E5EAEC] px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0FA3A3] focus:ring-1 focus:ring-[#0FA3A3] focus:outline-none"
                    required
                  />
                </div>

                {/* Phạm vi áp dụng & Dropdown Đại lý cụ thể */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Phạm vi áp dụng
                    </label>
                    <select
                      value={agencyScope}
                      onChange={(e) => setAgencyScope(e.target.value as any)}
                      className="w-full rounded-lg border border-[#E5EAEC] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                    >
                      <option value="SPECIFIC">Đại lý cụ thể</option>
                      <option value="ALL">Tất cả đại lý</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      * Tổ chức ban hành
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Công ty Thép Poshaco"
                      className="w-full rounded-lg border border-[#E5EAEC] bg-slate-50 px-3 py-2 text-xs text-slate-500"
                    />
                  </div>
                </div>

                {/* Multi-select Đại lý cụ thể */}
                {agencyScope === 'SPECIFIC' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Chọn danh sách Đại lý áp dụng (Chọn một hoặc nhiều)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-[#E5EAEC] rounded-lg bg-slate-50/50">
                      {AGENCIES_LIST.map((ag) => {
                        const isSelected = selectedAgencies.includes(ag.code);
                        return (
                          <div
                            key={ag.code}
                            onClick={() => toggleSelectAgency(ag.code)}
                            className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50 border-[#0FA3A3] text-[#0FA3A3] font-semibold'
                                : 'bg-white border-[#E5EAEC] text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded border ${
                                isSelected
                                  ? 'bg-[#0FA3A3] border-[#0FA3A3] text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">
                              {ag.code} ({ag.name})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* KHỐI ĐỘNG CẤU HÌNH MỐC THƯỞNG */}
                <div className="rounded-xl border border-[#E5EAEC] bg-[#F4F7F8]/60 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#0FA3A3]" />
                      <span className="text-xs font-bold text-slate-800">
                        Cấu hình Mốc thưởng tích lũy (Khối động)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#0FA3A3] px-2.5 py-1 text-[11px] font-semibold text-[#0FA3A3] hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Thêm mốc</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {milestones.map((ms, index) => (
                      <div
                        key={ms.id}
                        className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-[#E5EAEC]"
                      >
                        <span className="text-[11px] font-bold text-slate-400 w-5 text-center">
                          #{index + 1}
                        </span>

                        {/* Mức mốc m2 */}
                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-500 mb-0.5">
                            Mức mốc (m²)
                          </label>
                          <input
                            type="number"
                            value={ms.milestoneM2 === '' ? '' : ms.milestoneM2}
                            onChange={(e) =>
                              handleUpdateMilestone(ms.id, 'milestoneM2', e.target.value)
                            }
                            placeholder="VD: 100"
                            className="w-full rounded border border-[#E5EAEC] px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 placeholder:text-slate-300 focus:border-[#0FA3A3] focus:outline-none"
                            min={1}
                            required
                          />
                        </div>

                        {/* Giá trị thưởng (VND) */}
                        <div className="flex-1">
                          <label className="block text-[10px] text-slate-500 mb-0.5">
                            Giá trị thưởng (VND)
                          </label>
                          <input
                            type="number"
                            value={ms.rewardPoints === '' ? '' : ms.rewardPoints}
                            onChange={(e) =>
                              handleUpdateMilestone(ms.id, 'rewardPoints', e.target.value)
                            }
                            placeholder="VD: 1000000"
                            className="w-full rounded border border-[#E5EAEC] px-2.5 py-1.5 text-xs font-mono font-semibold text-[#0FA3A3] placeholder:text-slate-300 focus:border-[#0FA3A3] focus:outline-none"
                            min={0}
                            required
                          />
                        </div>

                        {/* Nút xóa mốc */}
                        <div className="pt-3.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(ms.id)}
                            className="rounded p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa mốc này"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thời gian bắt đầu - Thời gian kết thúc */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bắt đầu (tùy chọn)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kết thúc (tùy chọn)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-[#E5EAEC] px-3 py-2 text-xs text-slate-800 focus:border-[#0FA3A3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Trạng thái toggle switch */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Trạng thái chương trình
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Kích hoạt để Thợ gửi hóa đơn tích điểm ngay lập tức
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                      status === 'ACTIVE' ? 'bg-[#0FA3A3]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status === 'ACTIVE' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Modal footer buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5EAEC]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-[#E5EAEC] px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0FA3A3] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0c8787] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingProgram ? 'Lưu thay đổi' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
