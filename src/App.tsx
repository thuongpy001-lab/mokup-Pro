/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar, ActiveModule } from './components/Sidebar';
import { Module1Programs } from './components/Module1Programs';
import { Module2Invoices } from './components/Module2Invoices';
import { Module3Reconciliation } from './components/Module3Reconciliation';
import { Module4Payout } from './components/Module4Payout';
import {
  INITIAL_PROGRAMS,
  INITIAL_INVOICES,
  INITIAL_ORDERS,
  INITIAL_SHEETS,
} from './data/mockData';
import { PromotionProgram, InvoiceItem, ProductionOrder, ReconciliationSheet } from './types/poshaco';

export default function App() {
  // Navigation State - Sub-menu 3 is default active state as requested
  const [activeModule, setActiveModule] = useState<ActiveModule>('RECONCILIATION');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User Role for multi-stage approval simulation
  const [currentRole, setCurrentRole] = useState<'ADMIN' | 'AGENCY' | 'SALES' | 'ASM' | 'MARKETING'>('ADMIN');

  // Master State for all 3 modules
  const [programs, setPrograms] = useState<PromotionProgram[]>(INITIAL_PROGRAMS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [orders, setOrders] = useState<ProductionOrder[]>(INITIAL_ORDERS);
  const [sheets, setSheets] = useState<ReconciliationSheet[]>(INITIAL_SHEETS);

  // Module 1 Handlers
  const handleAddProgram = (newProg: PromotionProgram) => {
    setPrograms([newProg, ...programs]);
    alert(`Đã thêm chương trình tích lũy "${newProg.name}" thành công!`);
  };

  const handleUpdateProgram = (updated: PromotionProgram) => {
    setPrograms(programs.map((p) => (p.id === updated.id ? updated : p)));
    alert(`Đã cập nhật chương trình "${updated.name}" thành công!`);
  };

  const handleToggleProgramStatus = (id: string) => {
    setPrograms(
      programs.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : p
      )
    );
  };

  const handleDeleteProgram = (id: string) => {
    setPrograms(programs.filter((p) => p.id !== id));
  };

  // Module 2 Handlers
  const handleUpdateInvoice = (updated: InvoiceItem) => {
    setInvoices(invoices.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  // Module 3 Handlers
  const handleUpdateOrder = (updated: ProductionOrder) => {
    setOrders(orders.map((ord) => (ord.id === updated.id ? updated : ord)));
  };

  const handleAddOrder = (newOrder: ProductionOrder) => {
    setOrders([newOrder, ...orders]);
  };

  const handleAddSheet = (newSheet: ReconciliationSheet) => {
    setSheets([newSheet, ...sheets]);
  };

  const handleUpdateSheet = (updatedSheet: ReconciliationSheet) => {
    setSheets(sheets.map((s) => (s.id === updatedSheet.id ? updatedSheet : s)));
  };

  // LOGIC THỢ XÁC NHẬN:
  // "Khi người quản trị tạo phiếu đối soát sản lượng. Các phiếu đối soát có trạng thái duyệt
  // thì hệ thống tự động chuyển trạng thái đơn hàng bên danh sách hóa đơn thành Thợ Xác nhận"
  const handleApproveReconciliationSheet = (sheet: ReconciliationSheet) => {
    // 1. Cập nhật các đơn hàng trong phiếu đối soát
    const orderIdsInSheet = new Set(sheet.orders.map((o) => o.id));
    setOrders((prev) =>
      prev.map((ord) =>
        orderIdsInSheet.has(ord.id)
          ? { ...ord, status: 'Đã duyệt', reconciledInSheetId: sheet.sheetCode }
          : ord
      )
    );

    // 2. Chuyển hóa đơn tương ứng sang trạng thái CONTRACTOR_CONFIRMED ('Thợ xác nhận')
    const contractorPhone = sheet.contractorPhone.trim();
    const contractorName = sheet.contractorName.trim().toLowerCase();
    const linkedCodes = sheet.orders
      .map((o) => o.linkedInvoiceCode)
      .filter(Boolean)
      .flatMap((c) => c!.split(',').map((s) => s.trim()));

    setInvoices((prev) =>
      prev.map((inv) => {
        const isMatchCode = linkedCodes.includes(inv.code);
        const isMatchContractor =
          inv.contractorPhone === contractorPhone ||
          inv.contractorName.trim().toLowerCase() === contractorName;

        if ((isMatchCode || isMatchContractor) && inv.approvalStage !== 'REJECTED') {
          return {
            ...inv,
            approvalStage: 'CONTRACTOR_CONFIRMED',
            statusDisplay: 'Thợ xác nhận',
            reconciledSheetCode: sheet.sheetCode,
          };
        }
        return inv;
      })
    );

    // 3. Cập nhật trạng thái phiếu đối soát
    setSheets((prev) =>
      prev.map((s) =>
        s.id === sheet.id || s.sheetCode === sheet.sheetCode
          ? { ...s, status: 'Đã duyệt' }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] flex flex-col font-sans text-slate-800">
      {/* Topbar navigation */}
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Main layout with responsive sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setIsSidebarOpen(false); // Close on mobile selection
          }}
        />

        {/* Content viewport area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeModule === 'INVOICES' && (
              <Module2Invoices
                invoices={invoices}
                onUpdateInvoice={handleUpdateInvoice}
                currentRole={currentRole}
              />
            )}

            {activeModule === 'RECONCILIATION' && (
              <Module3Reconciliation
                orders={orders}
                invoices={invoices}
                sheets={sheets}
                onAddSheet={handleAddSheet}
                onUpdateSheet={handleUpdateSheet}
                onUpdateOrder={handleUpdateOrder}
                onAddOrder={handleAddOrder}
                onApproveReconciliationSheet={handleApproveReconciliationSheet}
                onNavigateToPayout={() => setActiveModule('PAYOUT')}
              />
            )}

            {activeModule === 'PAYOUT' && (
              <Module4Payout
                invoices={invoices}
                onUpdateInvoice={handleUpdateInvoice}
              />
            )}

            {activeModule === 'PROGRAMS' && (
              <Module1Programs
                programs={programs}
                onAddProgram={handleAddProgram}
                onUpdateProgram={handleUpdateProgram}
                onToggleStatus={handleToggleProgramStatus}
                onDeleteProgram={handleDeleteProgram}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
