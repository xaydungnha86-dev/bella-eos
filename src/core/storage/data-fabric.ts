export class DataFabric {
  private static instance: DataFabric;

  private constructor() {}

  public static getInstance(): DataFabric {
    if (!DataFabric.instance) {
      DataFabric.instance = new DataFabric();
    }
    return DataFabric.instance;
  }

  public mapToCanonicalModel(sourceType: 'CRM' | 'ERP', rawData: Record<string, any>): Record<string, any> {
    if (sourceType === 'CRM') {
      return {
        activeCustomersCount: rawData.cust_count || rawData.active_count || 0,
        leadsList: rawData.leads || [],
        sourceSystem: 'SpaPOS_CRM'
      };
    }
    return {
      fbReach24h: rawData.reach_24h || rawData.facebook_reach || 0,
      approvedBudgetLimitVnd: rawData.budget_vnd || 100000000,
      sourceSystem: 'Facebook_Graph_API'
    };
  }
}
