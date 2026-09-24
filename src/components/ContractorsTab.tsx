import React, { useState } from 'react';
import { Users, Phone, MapPin, Award, CheckCircle2, Search, Plus, Star, ShieldCheck } from 'lucide-react';
import { ProductionOrder } from '../types/poshaco';

interface ContractorsTabProps {
  orders: ProductionOrder[];
}

export const ContractorsTab: React.FC<ContractorsTabProps> = ({ orders }) => {
  const [keyword, setKeyword] = useState('');

  // Extract unique contractors
  const contractorsMap = new Map<string, {
    code: string;
    name: string;
    phone: string;
    address: string;
    agencyName: string;
    totalMd: number;
    orderCount: number;
    level: string;
  }>();

  orders.forEach((ord) => {
    if (!contractorsMap.has(ord.contractorCode)) {
      contractorsMap.set(ord.contractorCode, {
        code: ord.contractorCode,
        name: ord.contractorName,
        phone: ord.contractorPhone,
        address: ord.contractorAddress,
        agencyName: ord.agencyName,
        totalMd: 0,
        orderCount: 0,
        level: 'Thợ Vàng Poshaco',
      });
    }
    const c = contractorsMap.get(ord.contractorCode)!;
    c.totalMd += ord.productionMd;
    c.orderCount += 1;
  });

  const contractorsList = Array.from(contractorsMap.values()).filter(c => 
    !keyword.trim() ||
    c.name.toLowerCase().includes(keyword.toLowerCase()) ||
    c.code.toLowerCase().includes(keyword.toLowerCase()) ||
    c.phone.includes(keyword) ||
    c.agencyName.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
            Danh sách Thầu/Thợ & Chính sách C3
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mạng lưới thầu thợ thi công mái tôn và chính sách tích điểm Poshaco Pro
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên thợ, SĐT..."
            className="w-full rounded-xl border border-[#E5EAEC] bg-white pl-8 pr-3 py-2 text-xs focus:border-[#0FA3A3] focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Grid of contractors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contractorsList.map((c) => (
          <div
            key={c.code}
            className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 hover:border-teal-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-[#0FA3A3] font-bold text-sm">
                  {c.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
                  <div className="font-mono text-[11px] text-slate-500">{c.code}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                <span>{c.level}</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{c.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0FA3A3] shrink-0" />
                <span className="truncate">Đại lý: {c.agencyName}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Số đơn ghi nhận</div>
                <div className="font-bold font-mono text-slate-800">{c.orderCount} đơn</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Tổng sản lượng</div>
                <div className="font-bold font-mono text-[#0FA3A3] tabular-nums">
                  {c.totalMd.toFixed(1)} md
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
