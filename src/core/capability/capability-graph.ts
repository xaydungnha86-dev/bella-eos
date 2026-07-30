/**
 * Hierarchical Capability Graph Registry (v1 / v2)
 * Models enterprise capabilities as a versioned hierarchical graph with metadata.
 */

export interface CapabilityMetadata {
  owner: string;            // e.g. Growth Team, Operations Team, Finance Team
  slaSeconds: number;       // Execution SLA in seconds
  costProfile: 'LOW' | 'MEDIUM' | 'HIGH';
  stability: 'Draft' | 'Experimental' | 'Stable' | 'Deprecated' | 'Archived';
  permissions: string[];
}

export interface CapabilityNode {
  id: string;
  name: string;
  category: string;
  version: string;
  parentCapabilityId?: string;
  childCapabilityIds: string[];
  dependsOnCapabilityIds: string[];
  description: string;
  metadata: CapabilityMetadata;
}

export class CapabilityGraph {
  private static instance: CapabilityGraph;
  private nodes = new Map<string, CapabilityNode>();

  private constructor() {
    this.seedDefaultGraph();
  }

  public static getInstance(): CapabilityGraph {
    if (!CapabilityGraph.instance) {
      CapabilityGraph.instance = new CapabilityGraph();
    }
    return CapabilityGraph.instance;
  }

  private seedDefaultGraph(): void {
    const root: CapabilityNode = {
      id: 'cap_business_growth',
      name: 'Tăng trưởng Doanh nghiệp (Business Growth)',
      category: 'ENTERPRISE',
      version: 'v1',
      childCapabilityIds: ['cap_marketing', 'cap_sales', 'cap_finance', 'cap_ops'],
      dependsOnCapabilityIds: [],
      description: 'Năng lực tăng trưởng doanh thu & vận hành toàn diện',
      metadata: {
        owner: 'Executive C-Suite',
        slaSeconds: 30,
        costProfile: 'HIGH',
        stability: 'Stable',
        permissions: ['executive:all']
      }
    };

    const marketing: CapabilityNode = {
      id: 'cap_marketing',
      name: 'Chiến lược Marketing & Phễu Lead',
      category: 'MARKETING',
      version: 'v1',
      parentCapabilityId: 'cap_business_growth',
      childCapabilityIds: ['cap_content_writing', 'cap_graphic_design', 'cap_social_publishing'],
      dependsOnCapabilityIds: [],
      description: 'Lập chiến lược marketing, thông điệp & phễu tiếp thị',
      metadata: {
        owner: 'Marketing Team',
        slaSeconds: 15,
        costProfile: 'MEDIUM',
        stability: 'Stable',
        permissions: ['marketing:strategy']
      }
    };

    const contentWriting: CapabilityNode = {
      id: 'cap_content_writing',
      name: 'Sáng tạo Nội dung & Copywriting',
      category: 'MARKETING',
      version: 'v1',
      parentCapabilityId: 'cap_marketing',
      childCapabilityIds: [],
      dependsOnCapabilityIds: ['cap_marketing'],
      description: 'Soạn thảo bài viết tiếp thị, headline hook & ưu đãi',
      metadata: {
        owner: 'Content Team',
        slaSeconds: 10,
        costProfile: 'LOW',
        stability: 'Stable',
        permissions: ['content:write']
      }
    };

    const graphicDesign: CapabilityNode = {
      id: 'cap_graphic_design',
      name: 'Thiết kế Đồ họa & Banner 4K',
      category: 'CREATIVE',
      version: 'v1',
      parentCapabilityId: 'cap_marketing',
      childCapabilityIds: [],
      dependsOnCapabilityIds: ['cap_content_writing'],
      description: 'Thiết kế Banner, Poster, Visual asset chuẩn thương hiệu',
      metadata: {
        owner: 'Creative Studio',
        slaSeconds: 20,
        costProfile: 'MEDIUM',
        stability: 'Stable',
        permissions: ['media:create']
      }
    };

    const socialPublishing: CapabilityNode = {
      id: 'cap_social_publishing',
      name: 'Xuất bản Truyền thông Mạng Xã Hội',
      category: 'MEDIA',
      version: 'v1',
      parentCapabilityId: 'cap_marketing',
      childCapabilityIds: [],
      dependsOnCapabilityIds: ['cap_content_writing', 'cap_graphic_design'],
      description: 'Lập lịch & tự động đăng bài lên Fanpage Facebook, Zalo',
      metadata: {
        owner: 'Social Media Operations',
        slaSeconds: 5,
        costProfile: 'LOW',
        stability: 'Stable',
        permissions: ['social:publish']
      }
    };

    const sales: CapabilityNode = {
      id: 'cap_sales',
      name: 'Chốt Đơn & Quản lý Phễu Sales CRM',
      category: 'SALES',
      version: 'v1',
      parentCapabilityId: 'cap_business_growth',
      childCapabilityIds: [],
      dependsOnCapabilityIds: ['cap_marketing'],
      description: 'Tối ưu tỷ lệ chuyển đổi lead sang booking và CSKH',
      metadata: {
        owner: 'Sales Operations',
        slaSeconds: 10,
        costProfile: 'LOW',
        stability: 'Stable',
        permissions: ['crm:manage']
      }
    };

    const finance: CapabilityNode = {
      id: 'cap_finance',
      name: 'Thẩm định Tài chính & Ngân sách',
      category: 'FINANCE',
      version: 'v1',
      parentCapabilityId: 'cap_business_growth',
      childCapabilityIds: [],
      dependsOnCapabilityIds: [],
      description: 'Kiểm toán hạn mức ngân sách, ROI & an toàn dòng tiền',
      metadata: {
        owner: 'Finance & Treasury',
        slaSeconds: 10,
        costProfile: 'LOW',
        stability: 'Stable',
        permissions: ['finance:audit']
      }
    };

    const ops: CapabilityNode = {
      id: 'cap_ops',
      name: 'Vận hành SOP & Công suất Ca Nhân sự',
      category: 'OPERATIONS',
      version: 'v1',
      parentCapabilityId: 'cap_business_growth',
      childCapabilityIds: [],
      dependsOnCapabilityIds: [],
      description: 'Ràng buộc quy trình dịch vụ, tải trọng KTV & SLA',
      metadata: {
        owner: 'Branch Operations',
        slaSeconds: 5,
        costProfile: 'LOW',
        stability: 'Stable',
        permissions: ['ops:manage']
      }
    };

    [root, marketing, contentWriting, graphicDesign, socialPublishing, sales, finance, ops].forEach(n => {
      this.nodes.set(n.id, n);
    });
  }

  public getNode(id: string): CapabilityNode | undefined {
    return this.nodes.get(id);
  }

  public registerNode(node: CapabilityNode): void {
    this.nodes.set(node.id, node);
  }

  public getAllNodes(): CapabilityNode[] {
    return Array.from(this.nodes.values());
  }

  public resolveDependencies(capabilityId: string): CapabilityNode[] {
    const target = this.nodes.get(capabilityId);
    if (!target) return [];

    const deps: CapabilityNode[] = [];
    for (const depId of target.dependsOnCapabilityIds) {
      const depNode = this.nodes.get(depId);
      if (depNode) {
        deps.push(depNode, ...this.resolveDependencies(depId));
      }
    }
    return deps;
  }
}
