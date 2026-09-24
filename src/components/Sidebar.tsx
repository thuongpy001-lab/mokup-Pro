import React, { useState } from 'react';
import {
  Gauge,
  Settings,
  Users,
  Car,
  FileText,
  Gift,
  Megaphone,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

export type ActiveModule =
  | 'PROGRAMS'
  | 'INVOICES'
  | 'RECONCILIATION'
  | 'PAYOUT';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeModule,
  onSelectModule,
}) => {
  // Giữ nguyên layout giao diện gốc: Quản lý Chương trình mở sẵn
  const [openProgramsMenu, setOpenProgramsMenu] = useState(true);
  const [openSystemMenu, setOpenSystemMenu] = useState(false);
  const [openBusinessMenu, setOpenBusinessMenu] = useState(false);
  const [openWorkMenu, setOpenWorkMenu] = useState(false);
  const [openSalesMenu, setOpenSalesMenu] = useState(false);
  const [openContentMenu, setOpenContentMenu] = useState(false);
  const [openNotificationMenu, setOpenNotificationMenu] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden no-print"
        />
      )}

      {/* Sidebar container - Giữ nguyên layout gốc w-[240px] */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[240px] flex-col border-r border-[#E5EAEC] bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 no-print select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo POSHACO GROUP chuẩn nhận diện như giao diện gốc */}
        <div className="flex flex-col items-center justify-center pt-6 pb-5 border-b border-[#F0F4F6] relative">
          <div className="flex items-center gap-1">
            <span className="text-xl font-black tracking-wide text-[#0FA3A3]">POSHACO</span>
            {/* Logo Chevrons >> */}
            <span className="flex items-center text-[#EAB308] font-black text-xl -ml-0.5 tracking-tighter">
              <svg className="h-4 w-4.5 text-[#EAB308]" viewBox="0 0 24 20" fill="currentColor">
                <path d="M4 2 L12 10 L4 18 L7 18 L15 10 L7 2 Z" />
                <path d="M11 2 L19 10 L11 18 L14 18 L22 10 L14 2 Z" />
              </svg>
            </span>
            <span className="text-[8px] font-bold text-[#0FA3A3] -mt-2">®</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#0FA3A3] mt-0.5">
            GROUP
          </span>

          {/* Close button on mobile */}
          <button
            onClick={onToggle}
            className="absolute right-2 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Nav Items theo đúng 100% thứ tự & icon layout gốc */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 text-[13.5px]">
          {/* 1. Trang chủ - Giữ nguyên layout, không cho action */}
          <div
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-400 cursor-not-allowed select-none"
            title="Tính năng chưa được kích hoạt"
          >
            <Gauge className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            <span className="font-normal text-slate-400">Trang chủ</span>
          </div>

          {/* 2. Hệ thống & Phân quyền - Giữ nguyên layout */}
          <div>
            <button
              onClick={() => setOpenSystemMenu(!openSystemMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <Settings className="h-4.5 w-4.5 text-[#0FA3A3] shrink-0" />
                <span className="font-normal text-slate-700 truncate">Hệ thống & Phân quyền</span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#0FA3A3] shrink-0 ml-1" />
            </button>
          </div>

          {/* 3. Quản lý Hoạt động Ki... - Giữ nguyên layout */}
          <div>
            <button
              onClick={() => setOpenBusinessMenu(!openBusinessMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <Users className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                <span className="font-normal text-slate-700 truncate">Quản lý Hoạt động Ki...</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
            </button>
          </div>

          {/* 4. Quản lý Công việc (Highlight nền xám/xanh nhạt như layout gốc) */}
          <div>
            <button
              onClick={() => setOpenWorkMenu(!openWorkMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 bg-[#F0F4F8] text-slate-800 transition-colors cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center gap-3 truncate">
                <Car className="h-4.5 w-4.5 text-slate-700 shrink-0" />
                <span className="font-medium text-slate-800 truncate">Quản lý Công việc</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-700 shrink-0 ml-1" />
            </button>
          </div>

          {/* 5. Vận hành bán hàng - Giữ nguyên layout */}
          <div>
            <button
              onClick={() => setOpenSalesMenu(!openSalesMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <FileText className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                <span className="font-normal text-slate-700 truncate">Vận hành bán hàng</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
            </button>
          </div>

          {/* 6. Quản lý Chương trình ... (Mở sẵn ^ với 11 sub-menus đúng thứ tự layout gốc) */}
          <div>
            <button
              onClick={() => setOpenProgramsMenu(!openProgramsMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <Gift className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                <span className="font-normal text-slate-700 truncate">Quản lý Chương trình ...</span>
              </div>
              {openProgramsMenu ? (
                <ChevronUp className="h-4 w-4 text-slate-700 shrink-0 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
              )}
            </button>

            {/* Sub-menu danh sách 11 mục đúng thứ tự layout gốc */}
            {openProgramsMenu && (
              <div className="mt-0.5 space-y-0.5 text-[13px]">
                {/* 6.1: Xét duyệt hồ sơ C3 - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Xét duyệt hồ sơ C3</span>
                </div>

                {/* 6.2: Quản lý Thông tin C3 - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Quản lý Thông tin C3</span>
                </div>

                {/* 6.3: Quản lý Bảo hiểm - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Quản lý Bảo hiểm</span>
                </div>

                {/* 6.4: Phê duyệt Gửi Hóa đơn - CHO PHÉP ACTION ✅ */}
                <button
                  onClick={() => onSelectModule('INVOICES')}
                  className={`flex w-full items-center pl-10.5 pr-2 py-1.5 text-left transition-colors cursor-pointer rounded-md ${
                    activeModule === 'INVOICES'
                      ? 'text-[#0FA3A3] font-semibold bg-teal-50/70'
                      : 'text-slate-700 hover:text-[#0FA3A3] hover:bg-slate-50/80'
                  }`}
                >
                  <span className="truncate">Phê duyệt Gửi Hóa đơn</span>
                </button>

                {/* 6.5: Phiếu đối soát - CHO PHÉP ACTION ✅ */}
                <button
                  onClick={() => onSelectModule('RECONCILIATION')}
                  className={`flex w-full items-center justify-between pl-10.5 pr-2 py-1.5 text-left transition-colors cursor-pointer rounded-md ${
                    activeModule === 'RECONCILIATION'
                      ? 'text-[#0FA3A3] font-semibold bg-teal-50/70'
                      : 'text-slate-700 hover:text-[#0FA3A3] hover:bg-slate-50/80'
                  }`}
                >
                  <span className="truncate">Phiếu đối soát</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeModule === 'RECONCILIATION'
                      ? 'bg-[#0FA3A3] text-white'
                      : 'bg-teal-100 text-[#0FA3A3]'
                  }`}>
                    Sản lượng
                  </span>
                </button>

                {/* 6.6: Danh mục Quà tặng - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Danh mục Quà tặng</span>
                </div>

                {/* 6.7: Đổi thưởng - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Đổi thưởng</span>
                </div>

                {/* 6.8: Chi trả - CHO PHÉP ACTION ✅ */}
                <button
                  onClick={() => onSelectModule('PAYOUT')}
                  className={`flex w-full items-center justify-between pl-10.5 pr-2 py-1.5 text-left transition-colors cursor-pointer rounded-md ${
                    activeModule === 'PAYOUT'
                      ? 'text-[#0FA3A3] font-semibold bg-teal-50/70'
                      : 'text-slate-700 hover:text-[#0FA3A3] hover:bg-slate-50/80'
                  }`}
                >
                  <span className="truncate">Chi trả</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeModule === 'PAYOUT'
                      ? 'bg-[#0FA3A3] text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Kế toán
                  </span>
                </button>

                {/* 6.9: Vòng quay May mắn - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Vòng quay May mắn</span>
                </div>

                {/* 6.10: Chương trình tích lũy - CHO PHÉP ACTION ✅ */}
                <button
                  onClick={() => onSelectModule('PROGRAMS')}
                  className={`flex w-full items-center pl-10.5 pr-2 py-1.5 text-left transition-colors cursor-pointer rounded-md ${
                    activeModule === 'PROGRAMS'
                      ? 'text-[#0FA3A3] font-semibold bg-teal-50/70'
                      : 'text-slate-700 hover:text-[#0FA3A3] hover:bg-slate-50/80'
                  }`}
                >
                  <span className="truncate">Chương trình tích lũy</span>
                </button>

                {/* 6.11: Thống kê hoạt động Pro - Khóa action */}
                <div
                  className="flex w-full items-center pl-10.5 pr-2 py-1.5 text-left text-slate-400 cursor-not-allowed select-none rounded-md"
                  title="Tính năng chưa được kích hoạt"
                >
                  <span className="truncate">Thống kê hoạt động Pro</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. Quản lý Nội dung - Giữ nguyên layout */}
          <div>
            <button
              onClick={() => setOpenContentMenu(!openContentMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <FileText className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                <span className="font-normal text-slate-700 truncate">Quản lý Nội dung</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
            </button>
          </div>

          {/* 8. Thông báo - Giữ nguyên layout */}
          <div>
            <button
              onClick={() => setOpenNotificationMenu(!openNotificationMenu)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 truncate">
                <Megaphone className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                <span className="font-normal text-slate-700 truncate">Thông báo</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 ml-1" />
            </button>
          </div>
        </div>

        {/* Footer info nhẹ nhàng như layout gốc */}
        <div className="border-t border-[#F0F4F6] px-3 py-2.5 text-[11px] text-slate-400 bg-slate-50/40">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>POSHACO PRO</span>
            <span className="font-mono text-[#0FA3A3]">v3.8</span>
          </div>
        </div>
      </aside>
    </>
  );
};
