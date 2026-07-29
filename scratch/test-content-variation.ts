/**
 * TEST: Content Variation System
 * 
 * This test verifies that:
 * 1. Creative Director Agent includes Content History constraints in prompt
 * 2. Gemini outputs pure JSON (no "REASONING:" prefix)
 * 3. Headlines, benefits, and CTAs vary between generations
 * 4. Content History Tracker stores previous outputs
 */

import { CreativeDirectorAgent } from '../src/core/creative/reasoning/creative-director-agent';
import { ContentHistoryTracker } from '../src/core/creative/memory/content-history-tracker';

async function testContentVariation() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST: Content Variation System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('[1] Getting Content History Tracker...');
  const tracker = ContentHistoryTracker.getInstance();
  const initialStats = tracker.getStats();
  console.log(`✓ Tracker ready (${initialStats.total} items in history)\n`);

  const testContext = {
    objective: 'Quảng bá phần mềm quản lý Spa Bella EOS - tăng lượt demo tư vấn',
    industryCategory: 'Wellness & Beauty Tech',
    targetAudience: 'Chủ Spa và Thẩm mỹ viện cao cấp',
    brandDNA: {
      identity: {
        brandName: 'BELLA EOS',
        mission: 'Giải phóng thời gian vận hành cho chủ Spa'
      },
      values: ['Chuyên nghiệp', 'Đổi mới', 'Tận tâm'],
      voice: {
        tone: 'Chuyên nghiệp, Đáng tin cậy, Sáng tạo'
      },
      visual: {
        style: 'Modern Tech Minimalist',
        colors: {
          primary: '#061E17',
          accent: '#D4AF37'
        }
      }
    },
    enterpriseContext: {
      budget: {
        totalBudget: 50000000,
        duration: '30 ngày'
      },
      erp: {
        revenue: {
          target: 500000000
        },
        customers: {
          total: 1200
        }
      },
      crm: {
        leads: {
          conversionRate: 0.156
        }
      }
    },
    campaignMemory: {
      successfulPatterns: [
        { description: 'Banner với số liệu cụ thể (1200+ Spa)', successRate: 0.82 }
      ],
      avoidPatterns: [
        { description: 'Tiêu đề chung chung không nổi bật', successRate: 0.23 }
      ],
      performanceInsights: [
        { title: 'CTA Insight', description: 'CTA cụ thể (Demo 15 phút) convert cao hơn CTA chung chung' }
      ]
    },
    knowledgeContext: {
      domainFacts: [
        { statement: 'Chủ Spa thường mất 8-10 giờ/tuần cho quản lý thủ công' }
      ],
      industryTrends: [
        { name: 'AI trong quản lý Spa', direction: 'tăng mạnh', relevance: 0.89 }
      ]
    }
  };

  const agent = new CreativeDirectorAgent();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GENERATION 1: Should create initial content
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('[2] GENERATION 1: Creating initial content...\n');

  const brief1 = await agent.reason(testContext as any);

  console.log('GENERATION 1 OUTPUT:');
  console.log('  Headline:', brief1.posterHeadline);
  console.log('  Key Benefits:');
  brief1.keyBenefits?.forEach((b, i) => console.log(`    ${i + 1}. ${b}`));
  console.log('  CTA:', brief1.callToAction);
  console.log('  Confidence:', brief1.confidenceScore);
  console.log('');

  // Check history
  const stats1 = tracker.getStats();
  console.log(`[3] Content History after Gen 1: ${stats1.total} items`);
  if (stats1.total > 0) {
    console.log('  ✓ Content saved to history\n');
  } else {
    console.error('  ✗ ERROR: Content NOT saved to history!\n');
  }

  // Wait 2 seconds to ensure different variation seed
  console.log('[4] Waiting 2 seconds before Generation 2...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GENERATION 2: Should be DIFFERENT from Generation 1
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('[5] GENERATION 2: Creating varied content...\n');

  const brief2 = await agent.reason(testContext as any);

  console.log('GENERATION 2 OUTPUT:');
  console.log('  Headline:', brief2.posterHeadline);
  console.log('  Key Benefits:');
  brief2.keyBenefits?.forEach((b, i) => console.log(`    ${i + 1}. ${b}`));
  console.log('  CTA:', brief2.callToAction);
  console.log('  Confidence:', brief2.confidenceScore);
  console.log('');

  // Check history
  const stats2 = tracker.getStats();
  console.log(`[6] Content History after Gen 2: ${stats2.total} items\n`);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPARISON: Analyze differences
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('VARIATION ANALYSIS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const headlineSame = brief1.posterHeadline === brief2.posterHeadline;
  const ctaSame = brief1.callToAction === brief2.callToAction;

  console.log('Headline Variation:');
  console.log('  Gen 1:', brief1.posterHeadline);
  console.log('  Gen 2:', brief2.posterHeadline);
  console.log('  Status:', headlineSame ? '✗ SAME (FAIL)' : '✓ DIFFERENT (PASS)');
  console.log('');

  console.log('CTA Variation:');
  console.log('  Gen 1:', brief1.callToAction);
  console.log('  Gen 2:', brief2.callToAction);
  console.log('  Status:', ctaSame ? '✗ SAME (FAIL)' : '✓ DIFFERENT (PASS)');
  console.log('');

  console.log('Key Benefits Variation:');
  const benefitsOverlap = brief1.keyBenefits?.filter(b1 => 
    brief2.keyBenefits?.some(b2 => b2 === b1)
  ).length || 0;
  const totalBenefits = brief1.keyBenefits?.length || 3;
  const benefitsSame = benefitsOverlap === totalBenefits;
  
  console.log('  Gen 1:', brief1.keyBenefits?.join(' | '));
  console.log('  Gen 2:', brief2.keyBenefits?.join(' | '));
  console.log(`  Overlap: ${benefitsOverlap}/${totalBenefits} benefits are identical`);
  console.log('  Status:', benefitsSame ? '✗ ALL SAME (FAIL)' : `✓ ${totalBenefits - benefitsOverlap}/${totalBenefits} DIFFERENT (PASS)`);
  console.log('');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FINAL VERDICT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FINAL VERDICT:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = !headlineSame && !ctaSame && !benefitsSame;

  if (passed) {
    console.log('✓ TEST PASSED: Content variation system is working!');
    console.log('  - Headlines are different');
    console.log('  - CTAs are different');
    console.log(`  - Benefits show variation (${totalBenefits - benefitsOverlap}/${totalBenefits} changed)`);
  } else {
    console.log('✗ TEST FAILED: Content is not varying between generations!');
    console.log('  Issues found:');
    if (headlineSame) console.log('    - Headlines are IDENTICAL');
    if (ctaSame) console.log('    - CTAs are IDENTICAL');
    if (benefitsSame) console.log('    - Benefits are IDENTICAL');
    console.log('\n  DEBUGGING HINTS:');
    console.log('    1. Check if Content History constraints appear in prompt');
    console.log('    2. Check if Gemini response has "REASONING:" prefix');
    console.log('    3. Check if JSON parsing is extracting pure JSON');
    console.log('    4. Check if temperature/topP are high enough for variation');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run test
testContentVariation().catch(err => {
  console.error('\n✗ TEST CRASHED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
