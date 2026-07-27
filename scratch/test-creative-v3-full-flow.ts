/**
 * Test Creative Intelligence v3 Full Flow
 * Tests: Copywriter → Creative Director → Image Generation
 */

async function testCreativeV3Flow() {
  console.log('\n🧪 ═══════════════════════════════════════════════════════════');
  console.log('   TESTING CREATIVE INTELLIGENCE V3 FULL FLOW');
  console.log('═══════════════════════════════════════════════════════════\n');

  const baseUrl = 'http://localhost:3000';
  const objective = 'Tăng 20% spa demo trong tháng 7 với ngân sách 10 triệu';

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 1: Copywriter (Content Generation)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('📝 TEST 1: Copywriter API');
  console.log('─────────────────────────────────────────────────────────\n');

  try {
    const copywriterRes = await fetch(`${baseUrl}/api/ai/write-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective,
        voiceTone: 'Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế',
        segment: 'Chủ Spa & Thẩm mỹ viện cao cấp',
        platform: 'facebook'
      })
    });

    if (!copywriterRes.ok) {
      throw new Error(`Copywriter API failed: ${copywriterRes.status}`);
    }

    const copywriterData = await copywriterRes.json();
    console.log('✅ Copywriter Response:');
    console.log(`   Provider: ${copywriterData.provider || 'unknown'}`);
    console.log(`   Model: ${copywriterData.model || 'unknown'}`);
    console.log(`   Content length: ${copywriterData.content?.length || 0} chars`);
    console.log(`   Content preview: ${copywriterData.content?.substring(0, 100)}...\n`);

    const copywriterContent = copywriterData.content;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TEST 2: Creative Intelligence v3 (Full Pipeline)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('🎨 TEST 2: Creative Intelligence v3 API');
    console.log('─────────────────────────────────────────────────────────\n');

    const v3Res = await fetch(`${baseUrl}/api/ai/generate-image-v3`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective,
        copywriterContent,
        brandDna: {
          brandName: 'BELLA EOS',
          voiceTone: 'Cao cấp, Sang trọng, Nhẹ nhàng & Tinh tế',
          visualStyle: 'Minimalist Glassmorphism',
          targetSegment: 'Chủ Spa & Thẩm mỹ viện cao cấp',
          brandColors: {
            primary: '#061E17',
            accent: '#D4AF37'
          }
        },
        format: '16:9',
        tenantId: 'test-tenant',
        model: 'imagen-3'
      })
    });

    if (!v3Res.ok) {
      const errorText = await v3Res.text();
      throw new Error(`v3 API failed: ${v3Res.status} - ${errorText}`);
    }

    const v3Data = await v3Res.json();
    
    console.log('✅ Creative Intelligence v3 Response:');
    console.log(`   Success: ${v3Data.success}`);
    console.log(`   Provider: ${v3Data.provider || 'unknown'}`);
    console.log(`   Model: ${v3Data.model || 'unknown'}`);
    console.log(`   Image URL: ${v3Data.imageUrl?.substring(0, 100)}...`);
    
    if (v3Data.creativeBrief) {
      console.log('\n   📋 Creative Brief:');
      console.log(`      Goal: ${v3Data.creativeBrief.campaignGoal}`);
      console.log(`      Headline: ${v3Data.creativeBrief.posterHeadline}`);
      console.log(`      Design: ${v3Data.creativeBrief.designDirection}`);
      console.log(`      Confidence: ${v3Data.creativeBrief.confidence || 'N/A'}`);
    }
    
    if (v3Data.reasoning) {
      console.log('\n   🧠 Reasoning Chain:');
      v3Data.reasoning.forEach((r: string, i: number) => {
        console.log(`      ${i + 1}. ${r}`);
      });
    }

    if (v3Data.warning) {
      console.log(`\n   ⚠️  Warning: ${v3Data.warning}`);
    }

    console.log('\n   📊 Analysis:');
    
    // Check if using real AI or fallback
    const isRealAI = v3Data.provider?.includes('imagen') || 
                     v3Data.provider?.includes('dall-e') || 
                     v3Data.provider?.includes('flux');
    
    const isSVG = v3Data.imageUrl?.includes('banner-image') || 
                  v3Data.model?.includes('svg');
    
    const hasLLMReasoning = v3Data.creativeBrief?.confidence >= 0.85;

    console.log(`      Using Real AI: ${isRealAI ? '✅ YES' : '❌ NO (fallback)'}`);
    console.log(`      Using SVG Fallback: ${isSVG ? '⚠️  YES (should be real AI)' : '✅ NO'}`);
    console.log(`      LLM Reasoning: ${hasLLMReasoning ? '✅ YES (0.85+)' : '⚠️  NO (rule-based)'}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FINAL VERDICT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   FINAL VERDICT');
    console.log('═══════════════════════════════════════════════════════════\n');

    const allTestsPass = isRealAI && !isSVG && hasLLMReasoning;

    if (allTestsPass) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('   Creative Intelligence v3 is working correctly.');
    } else {
      console.log('❌ TESTS FAILED!');
      console.log('\n   Issues detected:');
      if (!isRealAI) console.log('   - Not using real AI models (Imagen/DALL-E)');
      if (isSVG) console.log('   - Using SVG fallback instead of real images');
      if (!hasLLMReasoning) console.log('   - LLM reasoning not active (check Gemini API key)');
      
      console.log('\n   Possible causes:');
      console.log('   1. Gemini API key not set in localStorage');
      console.log('   2. Server not restarted after code changes');
      console.log('   3. API keys invalid or expired');
      console.log('\n   Fix:');
      console.log('   1. Go to /settings and enter valid Gemini API key');
      console.log('   2. Restart dev server: Ctrl+C then npm run dev');
      console.log('   3. Hard refresh browser: Ctrl+Shift+R');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(`   ${error.message}`);
    console.error('\n   Stack trace:');
    console.error(error.stack);
    
    console.log('\n═══════════════════════════════════════════════════════════\n');
  }
}

// Run test
testCreativeV3Flow().catch(console.error);
