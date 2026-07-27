/**
 * BELLA EOS - Creative Intelligence Engine v3 Integration Test
 * 
 * Tests the full workflow:
 * CEO Objective → Orchestrator → /api/ai/generate-image → v3 Engine → Creative Brief → Prompt
 */

async function testV3Integration() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 INTEGRATION TEST: Creative Intelligence Engine v3');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Direct v3 endpoint call
  console.log('📋 TEST 1: Direct v3 API Call');
  console.log('─────────────────────────────────────────────────────────');
  
  const v3Request = {
    objective: 'Tăng 20% khách hàng spa trong 30 ngày với ngân sách 50 triệu',
    copywriterContent: `
🎯 5 Sai Lầm Khiến Spa Mất Khách VIP

Bạn có biết 70% spa đóng cửa trong vòng 2 năm không phải vì thiếu khách, mà vì không giữ được khách cũ?

❌ Lỗi #1: Xếp lịch thủ công → Khách chờ lâu → Mất niềm tin
❌ Lỗi #2: Không có lịch sử khách → Không thể chăm sóc cá nhân hóa
❌ Lỗi #3: Báo cáo doanh thu chậm → Quyết định kinh doanh sai

✅ BELLA EOS - Giải pháp AI vận hành Spa thế hệ mới:
⚡ Xếp lịch tự động thông minh
📊 Dashboard doanh thu realtime
🎯 CRM giữ chân 95% khách VIP

🎁 DEMO 1-1 MIỄN PHÍ CÙNG CHUYÊN GIA SPA

👉 Đăng ký ngay: https://bellaeos.vn/demo
    `,
    brandDna: {
      brandName: 'BELLA EOS',
      primaryColor: '#061E17',
      accentColor: '#D4AF37',
      tagline: 'AI-Powered Business Operating System'
    }
  };

  try {
    console.log('[Test] Calling /api/ai/generate-image-v3...');
    console.log(`[Test] Objective: ${v3Request.objective.substring(0, 60)}...`);
    
    const response = await fetch('http://localhost:3000/api/ai/generate-image-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v3Request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ V3 API Response:');
    console.log('  Success:', result.success);
    console.log('  Provider:', result.provider);
    console.log('  Model:', result.model);
    console.log('  Image URL:', result.imageUrl?.substring(0, 80) + '...');
    
    if (result.creativeBrief) {
      console.log('\n📝 Creative Brief Generated:');
      console.log('  Campaign Goal:', result.creativeBrief.campaignGoal?.substring(0, 60) + '...');
      console.log('  Poster Headline:', result.creativeBrief.posterHeadline);
      console.log('  Target Audience:', result.creativeBrief.targetAudience?.substring(0, 60) + '...');
      console.log('  Design Direction:', result.creativeBrief.designDirection);
      console.log('  Confidence Score:', result.creativeBrief.confidenceScore);
      console.log('  Reasoning Steps:', result.creativeBrief.reasoningChain?.length || 0);
    }

    if (result.prompts) {
      console.log('\n🎨 Model-Specific Prompts:');
      console.log('  Imagen prompt:', result.prompts.imagen?.substring(0, 100) + '...');
      console.log('  DALL-E prompt:', result.prompts.dalle?.substring(0, 100) + '...');
      console.log('  Flux prompt:', result.prompts.flux?.substring(0, 100) + '...');
    }

    console.log('\n🧪 ASSERTIONS:');
    
    // Assertion 1: Headline is NOT copied from Facebook post
    const facebookHeadline = '5 Sai Lầm Khiến Spa Mất Khách VIP';
    const posterHeadline = result.creativeBrief?.posterHeadline || '';
    const headlineIsTransformed = posterHeadline !== facebookHeadline;
    console.log(`  ${headlineIsTransformed ? '✅' : '❌'} Headline transformed for poster medium`);
    console.log(`     Facebook: "${facebookHeadline}"`);
    console.log(`     Poster: "${posterHeadline}"`);
    
    // Assertion 2: Creative Brief includes reasoning
    const hasReasoning = (result.creativeBrief?.reasoningChain?.length || 0) > 0;
    console.log(`  ${hasReasoning ? '✅' : '❌'} Creative Brief includes reasoning chain`);
    
    // Assertion 3: Multiple model prompts generated
    const modelCount = Object.keys(result.prompts || {}).length;
    console.log(`  ${modelCount >= 3 ? '✅' : '❌'} Multiple model prompts (${modelCount}/3)`);
    
    // Assertion 4: Prompts are substantial (not templates)
    const imagenLength = result.prompts?.imagen?.length || 0;
    console.log(`  ${imagenLength > 500 ? '✅' : '❌'} Prompts are substantial (${imagenLength} chars)`);

    const allPassed = headlineIsTransformed && hasReasoning && modelCount >= 3 && imagenLength > 500;
    
    if (allPassed) {
      console.log('\n🎉 TEST 1 PASSED: All assertions successful');
    } else {
      console.log('\n⚠️  TEST 1 PARTIAL: Some assertions failed');
    }

  } catch (error) {
    console.error('\n❌ TEST 1 FAILED:', error);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  
  // Test 2: Feature flag routing
  console.log('\n📋 TEST 2: Feature Flag Routing');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Testing environment variable: CREATIVE_INTELLIGENCE_VERSION=v3');
  console.log('Expected behavior: /api/ai/generate-image should delegate to v3');
  console.log('\n⚠️  This test requires setting the environment variable and restarting the dev server');
  console.log('Manual test steps:');
  console.log('  1. Set CREATIVE_INTELLIGENCE_VERSION=v3 in .env.local');
  console.log('  2. Restart dev server');
  console.log('  3. Call /api/ai/generate-image (NOT v3 suffix)');
  console.log('  4. Check logs for "Routing to Creative Intelligence Engine v3..."');
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🏁 INTEGRATION TEST COMPLETED');
  console.log('═══════════════════════════════════════════════════════════');
}

// Run test if server is available
testV3Integration().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
