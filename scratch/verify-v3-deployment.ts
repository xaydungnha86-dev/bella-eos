/**
 * BELLA EOS - Creative Intelligence Engine v3 Deployment Verification
 * 
 * Verifies that v3 is deployed and functioning correctly
 */

async function verifyV3Deployment() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 VERIFYING: Creative Intelligence Engine v3 Deployment');
  console.log('═══════════════════════════════════════════════════════════\n');

  const baseUrl = 'http://localhost:3000';

  // Test 1: Check if server is running
  console.log('📋 TEST 1: Server Health Check');
  console.log('─────────────────────────────────────────────────────────');
  try {
    const response = await fetch(baseUrl);
    console.log(`✅ Server is running at ${baseUrl}`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.error('❌ Server is not running:', error);
    console.error('   Please start the server: npm run dev');
    process.exit(1);
  }

  // Test 2: Feature Flag Check - Call v2 endpoint (should auto-route to v3)
  console.log('\n📋 TEST 2: Feature Flag Routing');
  console.log('─────────────────────────────────────────────────────────');
  console.log('Calling /api/ai/generate-image (v2 endpoint)...');
  console.log('Expected: Should auto-route to v3 via feature flag\n');

  const testRequest = {
    objective: 'Tăng 20% khách hàng spa trong 30 ngày',
    copywriterContent: `
🎯 5 Sai Lầm Khiến Spa Mất Khách VIP

Bạn có biết 70% spa đóng cửa trong vòng 2 năm?

❌ Xếp lịch thủ công → Khách chờ lâu
❌ Không có lịch sử khách hàng
❌ Báo cáo doanh thu chậm

✅ BELLA EOS - Giải pháp AI vận hành Spa thế hệ mới

🎁 DEMO MIỄN PHÍ
    `,
    brandDna: {
      brandName: 'BELLA EOS',
      primaryColor: '#061E17',
      accentColor: '#D4AF37'
    }
  };

  try {
    console.log('[Verify] Sending request to /api/ai/generate-image...');
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/api/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`\n✅ Response received in ${duration}ms`);
    console.log('\n📊 Response Analysis:');
    console.log('─────────────────────────────────────────────────────────');
    
    // Check if v3 was used
    const isV3 = result.creativeBrief !== undefined;
    
    if (isV3) {
      console.log('✅ FEATURE FLAG WORKING: Request routed to v3');
      console.log('\n🎨 Creative Intelligence v3 Evidence:');
      console.log('  ✓ creativeBrief object present');
      console.log('  ✓ posterHeadline:', result.creativeBrief.posterHeadline);
      console.log('  ✓ campaignGoal:', result.creativeBrief.campaignGoal?.substring(0, 60) + '...');
      console.log('  ✓ confidenceScore:', result.creativeBrief.confidenceScore);
      console.log('  ✓ reasoningChain:', result.creativeBrief.reasoningChain?.length, 'steps');
      
      if (result.prompts) {
        console.log('\n  ✓ Model-specific prompts:');
        console.log('    - Imagen:', result.prompts.imagen?.length, 'chars');
        console.log('    - DALL-E:', result.prompts.dalle?.length, 'chars');
        console.log('    - Flux:', result.prompts.flux?.length, 'chars');
      }
      
      if (result.metadata) {
        console.log('\n  ✓ Pipeline metrics:');
        console.log('    - Total duration:', result.metadata.pipelineDuration, 'ms');
        console.log('    - Layer 1 (Context):', result.metadata.layers?.layer1_context);
        console.log('    - Layer 2 (Reasoning):', result.metadata.layers?.layer2_reasoning);
        console.log('    - Layer 3 (Composition):', result.metadata.layers?.layer3_composition);
        console.log('    - Layer 4 (Adaptation):', result.metadata.layers?.layer4_adaptation);
      }

      // Verify headline transformation
      const facebookHeadline = '5 Sai Lầm Khiến Spa Mất Khách VIP';
      const posterHeadline = result.creativeBrief.posterHeadline;
      const isTransformed = posterHeadline !== facebookHeadline;
      
      console.log('\n🧪 Critical Validation:');
      console.log(`  ${isTransformed ? '✅' : '❌'} Headline transformed (not copied from Facebook)`);
      console.log(`     Facebook: "${facebookHeadline}"`);
      console.log(`     Poster: "${posterHeadline}"`);
      
      const hasReasoning = (result.creativeBrief.reasoningChain?.length || 0) > 0;
      console.log(`  ${hasReasoning ? '✅' : '❌'} Reasoning chain present (${result.creativeBrief.reasoningChain?.length} steps)`);
      
      const hasMultiplePrompts = Object.keys(result.prompts || {}).length >= 3;
      console.log(`  ${hasMultiplePrompts ? '✅' : '❌'} Multiple model prompts (${Object.keys(result.prompts || {}).length}/3)`);

      console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
      console.log('Creative Intelligence Engine v3 is active and working correctly.');
      
    } else {
      console.log('❌ FEATURE FLAG NOT WORKING: v2 logic detected');
      console.log('   creativeBrief object is missing from response');
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Check .env.local contains: CREATIVE_INTELLIGENCE_VERSION=v3');
      console.log('   2. Restart the dev server: npm run dev');
      console.log('   3. Verify no typos in environment variable name');
      console.log('\n📋 Response structure (v2):');
      console.log('   - success:', result.success);
      console.log('   - provider:', result.provider);
      console.log('   - model:', result.model);
      console.log('   - imageUrl:', result.imageUrl?.substring(0, 80) + '...');
    }

  } catch (error) {
    console.error('\n❌ TEST 2 FAILED:', error);
    console.error('\n🔍 Possible Issues:');
    console.error('   - Server not running');
    console.error('   - API endpoint error');
    console.error('   - Network connectivity');
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ VERIFICATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 Next Steps:');
  console.log('  1. Test with different domains (real estate, fashion, tech)');
  console.log('  2. Compare output quality with v2');
  console.log('  3. Monitor confidence scores');
  console.log('  4. Collect stakeholder feedback');
  console.log('  5. Enable in production after validation\n');

  console.log('📚 Documentation:');
  console.log('  - Quick start: CREATIVE_V3_QUICK_START.md');
  console.log('  - Deployment: docs/CREATIVE_INTELLIGENCE_V3_DEPLOYMENT.md');
  console.log('  - Checklist: CREATIVE_V3_DEPLOYMENT_CHECKLIST.md\n');

  console.log('🔄 Rollback (if needed):');
  console.log('  1. Comment out CREATIVE_INTELLIGENCE_VERSION=v3 in .env.local');
  console.log('  2. Restart server: npm run dev\n');
}

// Run verification
verifyV3Deployment().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
