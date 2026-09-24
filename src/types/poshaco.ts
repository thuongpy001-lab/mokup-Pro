export interface RewardMilestone {
  id: string;
  milestoneM2: number | '';
  rewardPoints: number | '';
}

export type ProgramType = 'POINTS_ACCUMULATION' | 'MILESTONE_ACCUMULATION';

export interface PromotionProgram {
  id: string;
  name: string;
  type?: ProgramType;
  agencyScope: 'ALL' | 'SPECIFIC';
  agencies: string[]; // e.g. ['DOHU-BG', 'HUHUY-BK']
  agencyCodeDisplay?: string;
  businessCode?: string; // Mã đại lý C2 (businessCode, vd: DUPH-BG)
  stepValue?: number; // Mức mốc (mỗi N giá trị)
  rewardPerStep?: number; // Điểm thưởng mỗi mốc
  milestones: RewardMilestone[];
  rewardGift?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  organization: string;
  createdAt: string;
}

export type ApprovalStage = 
  | 'PENDING_AGENCY'        // 1. Chờ đại lý duyệt
  | 'PENDING_SALES'         // 2. Chờ NVKD duyệt
  | 'PENDING_ASM'           // 3. Chờ ASM duyệt (>500m2)
  | 'PENDING_MARKETING'     // 4. Chờ MTK duyệt
  | 'CONTRACTOR_CONFIRMED'  // 5. Thợ xác nhận
  | 'APPROVED'              // Đã phê duyệt hoàn tất (chờ lập đối soát)
  | 'PAID'                  // Kế toán đã chi tiền
  | 'REJECTED';             // Từ chối

export interface EditHistory {
  id: string;
  timestamp: string;
  editor: string;
  field: string;
  oldValue: string | number;
  newValue: string | number;
  reason?: string;
}

export interface InvoiceItem {
  id: string;
  code: string;
  agencyCode: string;
  agencyName: string;
  contractorName: string;
  contractorPhone: string;
  contractorBank?: string;
  contractorBankAccount?: string;
  contractorBankOwner?: string;
  invoiceDate: string;
  submittedDate: string;
  areaM2: number;
  posSeriesQty: number;
  kSeriesQty: number;
  productDescription: string;
  calculatedPoints: number;
  adjustedPoints?: number;
  approvalStage: ApprovalStage;
  agencyApproved: boolean;
  statusDisplay: 'Chờ xử lý' | 'Đã duyệt' | 'Thợ xác nhận' | 'Đã chi tiền' | 'Từ chối';
  invoiceImageUri: string;
  editHistory: EditHistory[];
  rejectionReason?: string;
  programName?: string;
  reconciledSheetCode?: string;
  payoutAmount?: number;
  payoutDate?: string;
  payoutMethod?: string;
  payoutTxnCode?: string;
  payoutAccountant?: string;
}

export interface ProductionOrder {
  id: string;
  orderCode: string;
  contractorCode: string;
  contractorName: string;
  contractorPhone: string;
  contractorAddress: string;
  agencyCode: string;
  agencyName: string;
  agencyAddress: string;
  productName: string;
  productionMd: number; // mét dài (md)
  entryDate: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
  reconciledInSheetId?: string; // Mã phiếu đối soát nếu đã tạo
  linkedInvoiceCode?: string; // Mã hóa đơn liên kết
}

export interface ReconciliationSheet {
  id: string;
  sheetCode: string; // e.g. PDS-2026-09-001
  createdDate: string;
  period: string; // e.g. Tháng 09/2026
  contractorCode: string;
  contractorName: string;
  contractorPhone: string;
  contractorAddress: string;
  agencyCode: string;
  agencyName: string;
  agencyAddress: string;
  orders: ProductionOrder[];
  totalMd: number;
  notes?: string;
  status?: 'Chờ duyệt' | 'Đã duyệt';
}
