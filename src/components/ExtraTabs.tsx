import React, { useState } from 'react';
import {
  Shield,
  Gift,
  Sparkles,
  CheckCircle2,
  Phone,
  AlertCircle,
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
  RotateCw
} from 'lucide-react';

export const InsuranceTab: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
            Quản lý Bảo hiểm Thầu / Thợ (Chính sách C3)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gói bảo hiểm tai nạn nghề nghiệp & trách nhiệm công trình dành riêng cho Thợ đạt chuẩn Poshaco Pro
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Bảo Việt Insurance Hợp tác
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Thợ đã cấp thẻ BH</span>
            <Shield className="h-5 w-5 text-[#0FA3A3]" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800">42 / 56</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">75% đạt hạn mức sản lượng</p>
        </div>

        <div className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hạn mức chi trả / vụ</span>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">100.000.000 đ</div>
          <p className="text-[11px] text-slate-500 mt-1">Áp dụng cho Thợ Vàng & Thợ Kim Cương</p>
        </div>

        <div className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kỳ bảo hiểm hiện tại</span>
            <Calendar className="h-5 w-5 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-800">2026 - 2027</div>
          <p className="text-[11px] text-slate-500 mt-1">Hiệu lực đến 31/12/2026</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Danh sách Thợ được cấp Thẻ Bảo hiểm Tai nạn Poshaco</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EAEC] bg-slate-50 text-slate-600">
                <th className="py-2.5 px-3">Mã Thợ</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Đại lý bảo lãnh</th>
                <th className="py-2.5 px-3">Số hợp đồng BH</th>
                <th className="py-2.5 px-3">Mức trách nhiệm</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { code: 'THO-BG-01', name: 'Vũ Đình Toàn', agency: 'Đoạt Hương (BG)', contract: 'BV-2026-8891', max: '100.000.000 đ', status: 'Đang hiệu lực' },
                { code: 'THO-BK-02', name: 'Trần Sông Thao', agency: 'Huân Huyền (BK)', contract: 'BV-2026-8892', max: '100.000.000 đ', status: 'Đang hiệu lực' },
                { code: 'THO-TQ-03', name: 'Đặng Văn Hưng', agency: 'Bảo Châu Yên (TQ)', contract: 'BV-2026-8893', max: '100.000.000 đ', status: 'Đang hiệu lực' },
                { code: 'THO-TH-04', name: 'A ĐIỆN', agency: 'Sông Mã (TH)', contract: 'BV-2026-8894', max: '50.000.000 đ', status: 'Chờ thẩm định' },
              ].map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono font-bold text-teal-700">{row.code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{row.name}</td>
                  <td className="py-3 px-3 text-slate-600">{row.agency}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{row.contract}</td>
                  <td className="py-3 px-3 font-bold text-slate-700">{row.max}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status === 'Đang hiệu lực' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const GiftsTab: React.FC = () => {
  const gifts = [
    { id: 'g1', name: 'Thẻ nạp điện thoại Viettel/Vina 500.000đ', points: '500 điểm', category: 'Thẻ cào', stock: 120, img: '💳' },
    { id: 'g2', name: 'Bộ áo thun & Mũ bảo hiểm Thợ Poshaco Pro', points: '800 điểm', category: 'Hiện vật', stock: 85, img: '🪖' },
    { id: 'g3', name: 'Máy bắn cốt laser siêu sáng 12 tia xanh', points: '2.500 điểm', category: 'Thiết bị nghề', stock: 24, img: '📐' },
    { id: 'g4', name: 'Máy bắt vít chuyên dụng Makita 18V', points: '3.500 điểm', category: 'Thiết bị nghề', stock: 16, img: '🔧' },
    { id: 'g5', name: 'Chỉ vàng 9999 PNJ Poshaco Vinh Danh', points: '8.000 điểm', category: 'Kim loại quý', stock: 8, img: '🪙' },
    { id: 'g6', name: 'Xe máy Honda Wave Alpha 110cc', points: '25.000 điểm', category: 'Đại thưởng năm', stock: 2, img: '🏍️' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
            Danh mục Quà tặng Đổi thưởng Poshaco Pro
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý kho hiện vật, thẻ cào và phần thưởng quy đổi dành cho Thầu/Thợ tích lũy sản lượng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.map((g) => (
          <div key={g.id} className="rounded-xl border border-[#E5EAEC] bg-white p-5 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="text-4xl mb-3">{g.img}</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">{g.category}</div>
            <h3 className="text-sm font-bold text-slate-800 mt-1 leading-snug">{g.name}</h3>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="font-mono font-bold text-[#0FA3A3] text-sm">{g.points}</span>
              <span className="text-slate-500">Còn lại: <strong>{g.stock}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LuckyWheelTab: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      setSpinning(false);
      const prizes = ['500.000đ tiền mặt', '1 Mũ bảo hiểm Poshaco', '200 điểm tích lũy', '1 Thẻ cào 200.000đ', '1 Áo thun Poshaco Pro'];
      const won = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(won);
    }, 2000);
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto text-center">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F3864]">
          Vòng quay May mắn Poshaco Pro
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chương trình quay số trúng thưởng định kỳ mỗi tuần dành cho Thầu/Thợ có đơn sản lượng hợp lệ
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5EAEC] bg-white p-8 shadow-sm space-y-6">
        <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border-8 border-[#0FA3A3] bg-gradient-to-tr from-amber-100 via-teal-50 to-amber-200 shadow-inner">
          <Sparkles className={`h-16 w-16 text-[#0FA3A3] ${spinning ? 'animate-spin' : ''}`} />
        </div>

        <div>
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0FA3A3] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0c8787] active:scale-95 transition-all cursor-pointer disabled:bg-slate-300"
          >
            <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'Đang quay số...' : 'Quay thưởng ngay'}</span>
          </button>
        </div>

        {result && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 text-sm font-bold animate-fade-in">
            🎉 Chúc mừng! Thợ vừa trúng giải: <span className="text-[#0FA3A3] underline">{result}</span>!
          </div>
        )}
      </div>
    </div>
  );
};
