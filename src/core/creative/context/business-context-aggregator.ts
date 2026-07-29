/**
 * BELLA EOS - Business Context Aggregator
 * Layer 1: Business Context (Data Aggregation)
 * 
 * Responsibility: Collect and structure enterprise intelligence
 * WITHOUT reasoning or interpretation - pure data aggregation
 */

import type { 
  BusinessContextPackage, 
  CreativeRequest,
  ERPSnapshot,
  CRMSnapshot,
  BudgetConstraints,
  ParsedEntity
} from '@/types/creative-intelligence';
import type { IEvidence } from '@/types/evidence';
import { EnterpriseParserRuntime } from '@/core/elr/enterprise-parser-runtime';

export class BusinessContextAggregator {
  
  /**
   * Aggregate multi-source enterprise data into structured package
   */
  async aggregate(request: CreativeRequest): Promise<BusinessContextPackage> {
    
    const tenantId = request.tenantId || 'default';
    
    // 1. CEO Intent (raw input)
    const ceoObjective = request.objective;
    
    // 2. Enterprise Context (ERP/CRM simulation for now)
    const enterpriseContext = await this.gatherEnterpriseContext(tenantId, ceoObjective);
    
    // 3. Copywriter Content (if exists from Task #1)
    let copywriterContent = null;
    if (request.copywriterSnippet) {
      // Handle both string (raw text) and object (structured data) formats
      if (typeof request.copywriterSnippet === 'string') {
        copywriterContent = await this.parseCopywriterOutput(request.copywriterSnippet);
      } else if (typeof request.copywriterSnippet === 'object') {
        // Already structured format - use directly
        copywriterContent = {
          rawText: JSON.stringify(request.copywriterSnippet),
          extractedEntities: [
            ...(request.copywriterSnippet.headline ? [{
              type: 'headline' as const,
              text: request.copywriterSnippet.headline,
              confidence: 1.0,
              position: 0
            }] : []),
            ...(request.copywriterSnippet.benefits || []).map((benefit: string, i: number) => ({
              type: 'bullet' as const,
              text: benefit,
              confidence: 1.0,
              position: i + 1
            })),
            ...(request.copywriterSnippet.cta ? [{
              type: 'cta' as const,
              text: request.copywriterSnippet.cta,
              confidence: 1.0,
              position: 99
            }] : [])
          ],
          tone: 'professional',
          keyMessages: [
            request.copywriterSnippet.headline,
            ...(request.copywriterSnippet.benefits || [])
          ].filter(Boolean)
        };
      }
    }
    
    // 4. Brand DNA
    const brandDNA = await this.resolveBrandDNA(request.brandDna, tenantId);
    
    // 5. Campaign Memory (from ELR - simulated for now)
    const campaignMemory = await this.retrieveCampaignMemory(tenantId, ceoObjective);
    
    // 6. Knowledge Graph Context (from Knowledge Runtime - simulated for now)
    const knowledgeContext = await this.retrieveKnowledgeContext(ceoObjective);
    
    return {
      ceoObjective,
      enterpriseContext,
      copywriterContent,
      brandDNA,
      campaignMemory,
      knowledgeContext,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Gather ERP and CRM data
   */
  private async gatherEnterpriseContext(
    tenantId: string, 
    objective: string
  ): Promise<BusinessContextPackage['enterpriseContext']> {
    
    // Parse budget and duration from objective
    const budgetMatch = objective.match(/(\d+[\.,]?\d*)\s*(triệu|tr\b|m\b|million)/i);
    const timeMatch = objective.match(/(\d+)\s*(ngày|tuần|tháng|ngay|tuan|thang)/i);
    const growthMatch = objective.match(/(\d+)\s*%/);
    
    const budget: BudgetConstraints = {
      totalBudget: budgetMatch ? parseFloat(budgetMatch[1].replace(',', '.')) * 1_000_000 : 50_000_000,
      duration: timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : '30 ngày',
      roi_target: growthMatch ? parseFloat(growthMatch[1]) / 100 : 0.20
    };
    
    // Simulated ERP data
    const erp: ERPSnapshot = {
      revenue: {
        current: 500_000_000,
        target: 500_000_000 * (1 + (budget.roi_target || 0.2)),
        currency: 'VND'
      },
      customers: {
        total: 1250,
        active: 890,
        segments: ['Premium', 'Standard', 'Trial']
      },
      campaigns: {
        active: 3,
        budget: budget.totalBudget
      }
    };
    
    // Simulated CRM data
    const crm: CRMSnapshot = {
      leads: {
        total: 450,
        qualified: 180,
        conversionRate: 0.12
      },
      touchpoints: {
        email: 3200,
        social: 8500,
        website: 15000
      }
    };
    
    // Simulated policies
    const policies = [
      {
        id: 'brand-001',
        type: 'brand' as const,
        rule: 'Maintain professional, trustworthy tone',
        severity: 'required' as const
      },
      {
        id: 'budget-001',
        type: 'budget' as const,
        rule: `Total campaign cost must not exceed ${budget.totalBudget.toLocaleString('vi-VN')} VND`,
        severity: 'required' as const
      }
    ];
    
    return {
      erp,
      crm,
      budget,
      policies
    };
  }
  
  /**
   * Parse copywriter output using Enterprise Parser Runtime
   */
  private async parseCopywriterOutput(content: string): Promise<NonNullable<BusinessContextPackage['copywriterContent']>> {
    
    try {
      // Use EnterpriseParserRuntime for structured parsing
      const parser = EnterpriseParserRuntime.getInstance();
      const evidence: IEvidence = {
        id: `evidence-copywriter-${Date.now()}`,
        type: 'TASK_REVIEW',
        source: 'task_1_copywriter',
        content: content,
        attachments: [],
        confidence: 1.0,
        status: 'INGESTED',
        metadata: {
          tenantId: 'default',
          tags: ['copywriter', 'facebook_post']
        },
        createdBy: 'CreativeIntelligenceEngine',
        createdAt: new Date().toISOString()
      };
      const parsed = parser.parse(evidence);
      
      // Extract entities
      const entities: ParsedEntity[] = [];
      
      // Find headlines (first significant line)
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip metadata lines
        if (line.match(/^[\s\-*•]*📅[^\n]*$/i)) continue;
        if (line.match(/^[\s\-*•]*###?[^\n]*$/i)) continue;
        if (line.match(/^(?:---|###|📌|⏰|🎯|📝|📅|- ⏰|- 🎯|- 📝|Lịch đăng|Chủ đề)/i)) continue;
        
        // First significant line is likely headline
        if (i < 3 && line.length > 15 && line.length < 120) {
          entities.push({
            type: 'headline',
            text: line.replace(/^[#*🎯⚡👉🔥•\-\s]+/, '').replace(/\**/g, '').trim(),
            confidence: 0.9,
            position: i
          });
        }
        
        // Bullet points
        if (line.match(/^[•\-*+✓✔✨⚡📈🎯]/)) {
          entities.push({
            type: 'bullet',
            text: line.replace(/^[•\-*+✓✔✨⚡📈🎯\s]+/, '').trim(),
            confidence: 0.85,
            position: i
          });
        }
        
        // CTA (contains action words + link patterns)
        if (line.match(/👉|đăng ký|liên hệ|nhận|https?:\/\//i)) {
          entities.push({
            type: 'cta',
            text: line.replace(/^[👉*#\s]+/, '').trim(),
            confidence: 0.8,
            position: i
          });
        }
      }
      
      // Infer tone from content
      const tone = this.inferTone(content);
      
      // Extract key messages
      const keyMessages = this.extractKeyMessages(entities);
      
      return {
        rawText: content,
        extractedEntities: entities,
        tone,
        keyMessages
      };
      
    } catch (error) {
      console.warn('[BusinessContextAggregator] Copywriter parsing failed:', error);
      
      // Fallback: basic extraction
      return {
        rawText: content,
        extractedEntities: [],
        tone: 'professional',
        keyMessages: [content.substring(0, 100)]
      };
    }
  }
  
  /**
   * Infer tone from text content
   */
  private inferTone(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/sang trọng|cao cấp|đẳng cấp|tinh tế|luxury|premium/i)) {
      return 'luxury, aspirational, refined';
    }
    
    if (lowerText.match(/🔥|siêu|cực|khủng|đỉnh|wow/i)) {
      return 'energetic, exciting, bold';
    }
    
    if (lowerText.match(/chuyên nghiệp|uy tín|tin cậy|đáng tin/i)) {
      return 'professional, trustworthy, authoritative';
    }
    
    if (lowerText.match(/thân thiện|gần gũi|dễ dàng|đơn giản/i)) {
      return 'friendly, approachable, conversational';
    }
    
    return 'professional, balanced, informative';
  }
  
  /**
   * Extract key messages from parsed entities
   */
  private extractKeyMessages(entities: ParsedEntity[]): string[] {
    const messages: string[] = [];
    
    // Headlines are key messages
    const headlines = entities.filter(e => e.type === 'headline');
    messages.push(...headlines.map(h => h.text));
    
    // Top 3 bullets are key messages
    const bullets = entities
      .filter(e => e.type === 'bullet')
      .slice(0, 3)
      .map(b => b.text);
    messages.push(...bullets);
    
    return messages.filter((msg, idx) => idx < 5); // Max 5 key messages
  }
  
  /**
   * Resolve Brand DNA from request or fetch from runtime
   */
  private async resolveBrandDNA(
    providedDna: any, 
    tenantId: string
  ): Promise<BusinessContextPackage['brandDNA']> {
    
    // Use provided DNA or defaults
    const brandName = providedDna?.brandName || 'BELLA EOS';
    
    return {
      identity: {
        brandName,
        tagline: providedDna?.tagline,
        mission: providedDna?.mission || 'Empower enterprises with AI-native operating systems',
        vision: providedDna?.vision || 'Lead the AI-native enterprise transformation',
        targetSegment: providedDna?.targetSegment || 'Enterprise decision-makers'
      },
      voice: {
        tone: providedDna?.voiceTone || 'professional, innovative, trustworthy',
        personality: ['intelligent', 'reliable', 'forward-thinking'],
        vocabulary: ['AI-native', 'enterprise', 'intelligent', 'optimized', 'seamless'],
        avoidWords: ['cheap', 'basic', 'simple', 'free trial']
      },
      visual: {
        style: providedDna?.visualStyle || 'modern luxury tech',
        colors: {
          primary: providedDna?.brandColors?.primary || '#061E17',
          accent: providedDna?.brandColors?.accent || '#D4AF37',
          neutral: providedDna?.brandColors?.neutral || '#F5F5F0'
        },
        typography: {
          primary: 'Segoe UI, Roboto, sans-serif',
          secondary: 'Inter, system-ui, sans-serif'
        },
        imagery: ['premium tech', 'professional environments', 'elegant interfaces']
      },
      values: ['Innovation', 'Reliability', 'Excellence', 'Trust', 'Intelligence']
    };
  }
  
  /**
   * Retrieve campaign memory patterns
   */
  private async retrieveCampaignMemory(
    tenantId: string, 
    objective: string
  ): Promise<BusinessContextPackage['campaignMemory']> {
    
    // TODO: Integrate with CreativeMemoryRuntime when available
    // For now, return simulated patterns
    
    return {
      successfulPatterns: [
        {
          id: 'pattern-001',
          description: 'Luxury wellness imagery with iPad mockups resonates well with spa owners',
          occurrences: 12,
          successRate: 0.78,
          examples: ['Spa AI management campaign Q3 2025']
        },
        {
          id: 'pattern-002',
          description: 'Emphasis on time-saving and automation drives demo bookings',
          occurrences: 8,
          successRate: 0.82,
          examples: ['Automation campaign Q4 2025']
        }
      ],
      avoidPatterns: [
        {
          id: 'avoid-001',
          description: 'Generic stock photos of people reduce credibility',
          occurrences: 5,
          successRate: 0.23,
          examples: ['Generic business campaign Q2 2025']
        },
        {
          id: 'avoid-002',
          description: 'Too much text overlay reduces visual impact',
          occurrences: 7,
          successRate: 0.31,
          examples: ['Text-heavy campaign Q3 2025']
        }
      ],
      performanceInsights: [
        {
          id: 'insight-001',
          title: 'Premium visuals outperform generic stock',
          description: 'Campaigns using premium, custom-styled visuals achieve 2.3x higher CTR',
          confidence: 0.89,
          source: 'Campaign performance analysis Q3-Q4 2025',
          relevance: 0.95
        }
      ]
    };
  }
  
  /**
   * Retrieve knowledge graph context
   */
  private async retrieveKnowledgeContext(
    objective: string
  ): Promise<BusinessContextPackage['knowledgeContext']> {
    
    // TODO: Integrate with KnowledgeGraphRuntime when available
    // For now, infer domain from objective
    
    const lowerObj = objective.toLowerCase();
    
    let domainFacts: BusinessContextPackage['knowledgeContext']['domainFacts'] = [];
    let industryTrends: BusinessContextPackage['knowledgeContext']['industryTrends'] = [];
    
    if (lowerObj.includes('spa') || lowerObj.includes('thẩm mỹ') || lowerObj.includes('làm đẹp')) {
      domainFacts = [
        {
          id: 'fact-spa-001',
          statement: 'Vietnamese spa and wellness market grew 18% in 2025',
          category: 'wellness',
          verified: true,
          source: 'Vietnam Wellness Industry Report 2025'
        },
        {
          id: 'fact-spa-002',
          statement: 'Premium spa owners prioritize customer retention over acquisition',
          category: 'wellness',
          verified: true,
          source: 'Spa Business Survey 2025'
        }
      ];
      
      industryTrends = [
        {
          id: 'trend-spa-001',
          name: 'AI-powered spa management',
          direction: 'rising' as const,
          relevance: 0.92,
          timeframe: '2025-2026'
        },
        {
          id: 'trend-spa-002',
          name: 'Personalized wellness experiences',
          direction: 'rising' as const,
          relevance: 0.88,
          timeframe: '2025-2027'
        }
      ];
    } else if (lowerObj.includes('bất động sản') || lowerObj.includes('căn hộ')) {
      domainFacts = [
        {
          id: 'fact-re-001',
          statement: 'Real estate investors prioritize location and ROI projections',
          category: 'real_estate',
          verified: true,
          source: 'Vietnam Real Estate Market Report 2025'
        }
      ];
      
      industryTrends = [
        {
          id: 'trend-re-001',
          name: 'Smart home integration in premium properties',
          direction: 'rising' as const,
          relevance: 0.85,
          timeframe: '2025-2026'
        }
      ];
    }
    
    return {
      domainFacts,
      industryTrends,
      competitorInsights: []
    };
  }
}
