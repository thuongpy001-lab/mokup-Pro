import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, ShieldCheck, User, Building2, Check } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
  currentRole: 'ADMIN' | 'AGENCY' | 'SALES' | 'ASM' | 'MARKETING';
  onRoleChange: (role: 'ADMIN' | 'AGENCY' | 'SALES' | 'ASM' | 'MARKETING') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  currentRole,
  onRoleChange,
}) => {
  const [company, setCompany] = useState('Công ty Thép Poshaco');
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const companies = [
    'Công ty Thép Poshaco',
    'Công ty Cổ phần Tập đoàn Poshaco',
    'Nhà máy Tôn Thép Poshaco Hưng Yên',
    'Chi nhánh Poshaco Bắc Giang',
  ];

  const roleNames: Record<string, string> = {
    ADMIN: 'Admin Toàn quyền',
    AGENCY: 'Đại lý C2',
    SALES: 'NVKD (Nhân viên KD)',
    ASM: 'ASM (Giám đốc vùng)',
    MARKETING: 'MTK (Marketing)',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5EAEC] bg-white px-4 md:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] no-print">
      {/* Left zone: Hamburger & Brand mark */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition-colors"
          title="Thu gọn / Mở rộng menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Poshaco Logo Icon */}
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tight text-[#1F3864]">POSHACO</span>
            <span className="ml-1 text-xl font-bold tracking-tight text-[#0FA3A3]">GROUP</span>
            <div className="ml-1.5 flex h-4 w-4 items-center justify-center">
              <span className="inline-block h-2 w-2 rotate-45 bg-[#EAB308]"></span>
              <span className="-ml-1 inline-block h-2 w-2 rotate-45 bg-[#0FA3A3]"></span>
            </div>
          </div>
          <span className="hidden sm:inline-block rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#0FA3A3] uppercase">
            PRO
          </span>
        </div>
      </div>

      {/* Right zone: Switcher, Role Badge, Notifications, User Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Quick Switcher (Facilitates testing the multi-stage approval flow) */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[#E5EAEC] bg-[#F4F7F8] px-2.5 py-1 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0FA3A3]" />
          <span className="text-slate-500">Vai trò duyệt:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as any)}
            className="cursor-pointer bg-transparent font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ADMIN">Toàn quyền (Mô phỏng tất cả)</option>
            <option value="AGENCY">1. Đại lý C2</option>
            <option value="SALES">2. NVKD (Kinh doanh)</option>
            <option value="ASM">3. ASM (Giám đốc vùng)</option>
            <option value="MARKETING">4. MTK (Marketing)</option>
          </select>
        </div>

        {/* Company Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="flex items-center gap-2 rounded-lg border border-[#E5EAEC] px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="max-w-[150px] truncate sm:max-w-[200px]">{company}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showCompanyMenu && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-[#E5EAEC] bg-white p-1.5 shadow-lg z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chọn đơn vị / pháp nhân
              </div>
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCompany(c);
                    setShowCompanyMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    company === c
                      ? 'bg-teal-50 font-semibold text-[#0FA3A3]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c}</span>
                  {company === c && <Check className="h-3.5 w-3.5 text-[#0FA3A3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5EAEC] text-slate-600 hover:bg-slate-50 transition-colors"
            title="Thông báo hệ thống"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EAB308] text-[10px] font-bold text-slate-900 shadow-sm">
              6
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 rounded-xl border border-[#E5EAEC] bg-white shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-[#E5EAEC] px-3.5 py-2.5">
                <span className="text-xs font-bold text-slate-800">Thông báo mới</span>
                <span className="text-[11px] text-[#0FA3A3] font-medium cursor-pointer">Đánh dấu đã đọc</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs font-semibold text-slate-800">Hóa đơn 580.5 m² chờ ASM duyệt</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Thợ Vũ Đình Toàn - Đại lý Đoạt Hương</div>
                  <div className="text-[10px] text-slate-400 mt-1">10 phút trước</div>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs font-semibold text-slate-800">Đơn hàng mới chờ đối soát</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Khoa Hồng gửi đối soát 3 đơn hàng</div>
                  <div className="text-[10px] text-slate-400 mt-1">25 phút trước</div>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="text-xs font-semibold text-slate-800">Chương trình tích lũy quý 3</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đã đạt 85% chỉ tiêu trao thưởng thẻ nạp</div>
                  <div className="text-[10px] text-slate-400 mt-1">1 giờ trước</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F3864] text-xs font-bold text-white shadow-sm">
              T
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-none">ThươngPY</span>
              <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {roleNames[currentRole]}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-[#E5EAEC] bg-white p-1.5 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-[#E5EAEC] mb-1">
                <div className="text-xs font-bold text-slate-800">ThươngPY (thuongpy001)</div>
                <div className="text-[11px] text-slate-500">thuongpy001@gmail.com</div>
              </div>
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase">Vai trò duyệt thử nghiệm</div>
              {(['ADMIN', 'AGENCY', 'SALES', 'ASM', 'MARKETING'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowUserMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                    currentRole === r ? 'bg-teal-50 font-semibold text-[#0FA3A3]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{roleNames[r]}</span>
                  {currentRole === r && <Check className="h-3.5 w-3.5 text-[#0FA3A3]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
