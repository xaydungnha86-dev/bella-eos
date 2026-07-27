/**
 * TEST: Creative Intelligence Engine v3
 * 
 * Verify 4-layer architecture implementation
 */

import { CreativeIntelligenceEngine } from '../src/core/creative/creative-intelligence-engine';

async function testCreativeIntelligenceV3() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING: Creative Intelligence Engine v3');
  console.log('═══════════════════════════════════════════════════════════\n');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 1: SPA DOMAIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('📋 TEST 1: Spa Domain - Full Pipeline');
  console.log('─────────────────────────────────────────────────────────\n');

  const spaRequest = {
    objective: "Tăng 20% khách hàng spa trong 30 ngày với ngân sách 50 triệu",
    copywriterSnippet: `
5 SAI LẦM KHIẾN SPA MẤT KHÁCH HÀNG VIP

- ❌ Không có hệ thống quản lý lịch hẹn chuyên nghiệp
- ❌ Thiếu báo cáo doanh thu realtime
- ❌ Không theo dõi được hiệu suất KTV
- ❌ Mất thông tin khách hàng VIP
- ❌ Không tự động hóa quy trình marketing

🎁 GIẢI PHÁP: BELLA EOS SPA MANAGEMENT

✨ Tự động hóa 90% quy trình quản lý
📈 Báo cáo doanh thu thời gian thực
🎯 Giữ chân 95% khách hàng VIP

👉 Đăng ký demo miễn phí: https://bella.vn/spa-demo
    `,
    brandDna: {
      brandName: "BELLA EOS",
      mission: "Empower spa businesses with AI-native management platform",
      voiceTone: "luxury, serene, trustworthy, innovative",
      visualStyle: "luxury wellness tech",
      brandColors: {
        primary: "#061E17",
        accent: "#D4AF37",
        neutral: "#F5F5F0"
      },
      targetSegment: "Premium spa owners and beauty studio managers"
    },
    format: '16:9' as const,
    tenantId: 'test_spa_001'
  };

  try {
    const engine = new CreativeIntelligenceEngine();
    const output = await engine.generate(spaRequest);

    console.log('✅ Pipeline execution completed\n');

    // Verify Layer 1: Business Context
    console.log('🔍 LAYER 1 VERIFICATION: Business Context');
    console.log('  ✓ CEO Objective:', output.creativeBrief.campaignGoal.substring(0, 60) + '...');
    console.log('  ✓ Target Audience:', output.creativeBrief.targetAudience.substring(0, 60) + '...');
    console.log('  ✓ Emotional Tone:', output.creativeBrief.emotionalTone);
    console.log('');

    // Verify Layer 2: Creative Reasoning
    console.log('🧠 LAYER 2 VERIFICATION: Creative Reasoning');
    console.log('  ✓ Campaign Goal:', output.creativeBrief.campaignGoal);
    console.log('  ✓ Poster Headline:', output.creativeBrief.posterHeadline);
    console.log('  ✓ Design Direction:', output.creativeBrief.designDirection);
    console.log('  ✓ Confidence Score:', output.creativeBrief.confidenceScore);
    console.log('  ✓ Reasoning Chain:', output.creativeBrief.reasoningChain.length, 'steps');
    
    if (output.creativeBrief.reasoningChain.length > 0) {
      console.log('\n  📝 Reasoning Steps:');
      output.creativeBrief.reasoningChain.forEach((step, idx) => {
        console.log(`    ${idx + 1}. ${step.substring(0, 80)}...`);
      });
    }
    console.log('');

    // Verify Layer 3: Prompt Composition
    console.log('🎨 LAYER 3 VERIFICATION: Prompt Composition');
    console.log('  ✓ Base Prompt Length:', output.composedPrompt.basePrompt.length, 'chars');
    console.log('  ✓ Camera Body:', output.composedPrompt.technicalSpec.camera.body);
    console.log('  ✓ Camera Lens:', output.composedPrompt.technicalSpec.camera.lens);
    console.log('  ✓ Layout Rule:', output.composedPrompt.technicalSpec.layout.rule);
    console.log('  ✓ Copy Space:', output.composedPrompt.technicalSpec.layout.copySpacePercent + '%');
    console.log('  ✓ Negative Prompt Length:', output.composedPrompt.negativePrompt.length, 'chars');
    console.log('');

    // Verify Layer 4: Model Adaptation
    console.log('🔌 LAYER 4 VERIFICATION: Model Adaptation');
    const models = Object.keys(output.modelPrompts);
    console.log('  ✓ Supported Models:', models.join(', '));
    
    models.forEach(model => {
      const prompt = output.modelPrompts[model as keyof typeof output.modelPrompts];
      if (prompt) {
        console.log(`  ✓ ${model} prompt:`, prompt.length, 'chars');
      }
    });
    console.log('');

    // Critical Assertions
    console.log('🧪 CRITICAL ASSERTIONS');
    
    const assertions = [
      {
        name: 'Headline is NOT copied from Facebook post',
        pass: !output.creativeBrief.posterHeadline.toLowerCase().includes('5 sai lầm'),
        actual: output.creativeBrief.posterHeadline
      },
      {
        name: 'Headline is poster-optimized (short and punchy)',
        pass: output.creativeBrief.posterHeadline.length < 60,
        actual: `${output.creativeBrief.posterHeadline.length} chars`
      },
      {
        name: 'Creative Brief includes reasoning chain',
        pass: output.creativeBrief.reasoningChain.length > 0,
        actual: `${output.creativeBrief.reasoningChain.length} steps`
      },
      {
        name: 'Base prompt is substantial (not template)',
        pass: output.composedPrompt.basePrompt.length > 200,
        actual: `${output.composedPrompt.basePrompt.length} chars`
      },
      {
        name: 'Multiple model prompts generated',
        pass: Object.keys(output.modelPrompts).length >= 3,
        actual: `${Object.keys(output.modelPrompts).length} models`
      },
      {
        name: 'Confidence score is reasonable',
        pass: output.creativeBrief.confidenceScore > 0.5 && output.creativeBrief.confidenceScore <= 1.0,
        actual: output.creativeBrief.confidenceScore.toString()
      }
    ];

    let passedCount = 0;
    assertions.forEach(assertion => {
      if (assertion.pass) {
        console.log(`  ✅ ${assertion.name}`);
        console.log(`     → ${assertion.actual}`);
        passedCount++;
      } else {
        console.log(`  ❌ ${assertion.name}`);
        console.log(`     → ${assertion.actual}`);
      }
    });

    console.log('');
    console.log(`📊 RESULTS: ${passedCount}/${assertions.length} assertions passed`);
    console.log('');

    if (passedCount === assertions.length) {
      console.log('🎉 TEST 1 PASSED: All assertions successful');
    } else {
      console.log('⚠️  TEST 1 PARTIAL: Some assertions failed');
    }

  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
  }

  console.log('\n═══════════════════════════════════════════════════════════');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 2: REAL ESTATE DOMAIN (Different Industry)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  console.log('\n📋 TEST 2: Real Estate Domain - Domain Agnostic');
  console.log('─────────────────────────────────────────────────────────\n');

  const realEstateRequest = {
    objective: "Mở bán căn hộ cao cấp, tăng 100 lượt đặt chỗ trong 2 tuần",
    copywriterSnippet: `
🏢 MỞ BÁN CĂN HỘ THE GRAND VISTA

Vị trí vàng quận 1 - View sông tuyệt đẹp
Giá chỉ từ 5.2 tỷ/căn

✨ Ưu đãi đặc biệt tháng này:
- Chiết khấu 8% cho 10 khách đầu tiên
- Hỗ trợ lãi suất 0% năm đầu
- Tặng nội thất cao cấp trị giá 200 triệu

📞 Liên hệ ngay: 0909.xxx.xxx
    `,
    brandDna: {
      brandName: "THE GRAND VISTA",
      voiceTone: "aspirational, trustworthy, elegant",
      visualStyle: "premium real estate architectural",
      brandColors: {
        primary: "#1A1A2E",
        accent: "#C19A6B",
        neutral: "#F5F5F5"
      }
    },
    format: '16:9' as const,
    tenantId: 'test_re_001'
  };

  try {
    const engine = new CreativeIntelligenceEngine();
    const output = await engine.generate(realEstateRequest);

    console.log('✅ Pipeline execution completed\n');

    console.log('🔍 DOMAIN AGNOSTIC VERIFICATION');
    console.log('  ✓ Poster Headline:', output.creativeBrief.posterHeadline);
    console.log('  ✓ Design Direction:', output.creativeBrief.designDirection);
    console.log('  ✓ Hero Subject:', output.creativeBrief.heroSubject.substring(0, 80) + '...');
    console.log('  ✓ Confidence:', output.creativeBrief.confidenceScore);
    console.log('');

    // Verify domain understanding
    const domainKeywords = ['real estate', 'property', 'residential', 'architecture', 'condo', 'apartment'];
    const understandsDomain = domainKeywords.some(kw => 
      output.creativeBrief.campaignGoal.toLowerCase().includes(kw) ||
      output.creativeBrief.designDirection.toLowerCase().includes(kw) ||
      output.creativeBrief.heroSubject.toLowerCase().includes(kw)
    );

    console.log('🧪 DOMAIN UNDERSTANDING TEST');
    if (understandsDomain) {
      console.log('  ✅ LLM correctly identified real estate domain');
    } else {
      console.log('  ⚠️  LLM may not have identified domain (check reasoning chain)');
    }

    console.log('\n🎉 TEST 2 COMPLETED');

  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🏁 ALL TESTS COMPLETED');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Run tests
testCreativeIntelligenceV3().catch(console.error);
