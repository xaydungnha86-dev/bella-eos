import { EnterpriseObjectModel } from '../eom/eom';
import { MemoryCenter } from './memory';

export class UnderstandingCenter {
  static understandDocument(fileName: string, rawContent: string): any {
    console.log(`[Understanding Center] Parsing document: ${fileName} (content length: ${rawContent.length})`);
    
    // Classify document type and extract entity variables
    let classification = 'General';
    let entities: any = { Document: 1, Policy: 0 };
    let brandVoice = 'Professional & Premium';
    let designStyle = 'Minimalist Glassmorphism';

    const normalizedContent = rawContent.toLowerCase();

    if (normalizedContent.includes('tuyển dụng') || normalizedContent.includes('ktv') || normalizedContent.includes('jd')) {
      classification = 'Job Requirement (JD)';
      entities = { Document: 1, Task: 1, Role: 1 };
      brandVoice = 'Friendly & Casual';
      designStyle = 'Neo-Brutalist High Contrast';
    } else if (normalizedContent.includes('nội quy') || normalizedContent.includes('quy chế') || normalizedContent.includes('phạt')) {
      classification = 'Company Regulation (SOP)';
      entities = { Document: 1, Policy: 3 };
      brandVoice = 'Formal & Authoritative';
      designStyle = 'Clean Corporate Grid';
    } else if (normalizedContent.includes('brand') || normalizedContent.includes('thương hiệu') || normalizedContent.includes('rose')) {
      classification = 'Brand Identity Guideline';
      entities = { Document: 1, Policy: 1, Asset: 2 };
      brandVoice = 'Professional & Premium';
      designStyle = 'Glassmorphism Fluid';
    }

    // Register Document object in EOM
    const docObj = EnterpriseObjectModel.validate('Document', {
      id: `doc_${Date.now()}`,
      title: fileName,
      version: '1.0',
      content: rawContent
    });

    // Log to Memory Center
    MemoryCenter.addRecord('document', `Ingested & parsed document: ${fileName}. Class: ${classification}. Brand voice updated to: ${brandVoice}`, {
      docId: docObj._id,
      classification
    });

    return {
      fileName,
      classification,
      entities,
      dnaTone: brandVoice,
      styleClass: designStyle
    };
  }

  // Parses database facts, emails, chat recordings, and API payloads
  static understandApiFact(source: string, payload: any): any {
    console.log(`[Understanding Center] Digesting API / EIP payload from: ${source}`);
    const factSummary = JSON.stringify(payload);
    
    MemoryCenter.addRecord('business', `Digested EIP API facts from ${source}: ${factSummary.substring(0, 100)}...`);
    
    return {
      source,
      status: 'PROCESSED',
      timestamp: new Date().toISOString()
    };
  }
}
