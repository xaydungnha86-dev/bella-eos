export interface IResource {
  id: string;
  type: 'GPU' | 'API_CREDITS' | 'BUDGET_VND' | 'HUMAN_HOURS' | 'TECHNICIAN_CAPACITY';
  capacity: number;
  allocated: number;
}

export class ResourceAllocator {
  private static instance: ResourceAllocator;
  private resources: Map<string, IResource> = new Map();

  private constructor() {
    this.seedDefaultResources();
  }

  public static getInstance(): ResourceAllocator {
    if (!ResourceAllocator.instance) {
      ResourceAllocator.instance = new ResourceAllocator();
    }
    return ResourceAllocator.instance;
  }

  private seedDefaultResources(): void {
    this.resources.set('res-gpu', { id: 'res-gpu', type: 'GPU', capacity: 100, allocated: 0 });
    this.resources.set('res-api', { id: 'res-api', type: 'API_CREDITS', capacity: 500000, allocated: 0 });
    this.resources.set('res-ktv', { id: 'res-ktv', type: 'TECHNICIAN_CAPACITY', capacity: 10, allocated: 0 });
  }

  public allocateResource(resourceId: string, amount: number): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;
    
    if (res.allocated + amount <= res.capacity) {
      res.allocated += amount;
      return true;
    }
    return false; // Deadlock or capacity overflow prevention!
  }

  public releaseResource(resourceId: string, amount: number): void {
    const res = this.resources.get(resourceId);
    if (res) {
      res.allocated = Math.max(0, res.allocated - amount);
    }
  }

  public getResource(resourceId: string): IResource | undefined {
    return this.resources.get(resourceId);
  }
}
