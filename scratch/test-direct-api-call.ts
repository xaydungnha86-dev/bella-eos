/**
 * Direct API Test - Bypass UI cache
 * This calls the API directly to verify it's working
 */

async function testDirectAPI() {
  console.log('\n🔧 DIRECT API TEST - BYPASSING UI CACHE\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test with fresh timestamp to avoid any cache
  const timestamp = Date.now();
  const objective = `Test campaign ${timestamp}`;
  const copywriterContent = `🔥 URGENT SPA OFFER!

Special 30% discount for premium spa management platform.

✅ Automate 80% of operations
✅ Increase revenue by 300%
✅ Save 8 hours per day

👉 Register for demo today!

#SpaTech #Automation #BellaEOS`;

  console.log('📋 Test Parameters:');
  console.log(`   Objective: ${objective}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   Copywriter content: ${copywriterContent.substring(0, 80)}...\n`);

  try {
    console.log('🚀 Calling /api/ai/generate-image-v3...\n');
    
    const res = await fetch(`${baseUrl}/api/ai/generate-image-v3`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        objective,
        copywriterContent,
        brandDna: {
          brandName: 'BELLA EOS',
          voiceTone: 'Premium, Sophisticated',
          visualStyle: 'Modern Glassmorphism',
          targetSegment: 'Spa Owners',
          brandColors: {
            primary: '#061E17',
            accent: '#D4AF37'
          }
        },
        format: '16:9',
        tenantId: `test-${timestamp}`,
        model: 'imagen-3'
      })
    });

    console.log(`📡 Response Status: ${res.status} ${res.statusText}\n`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:');
      console.error(errorText);
      return;
    }

    const data = await res.json();
    
    console.log('📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('ANALYSIS:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`Success: ${data.success ? '✅' : '❌'}`);
    console.log(`Provider: ${data.provider || 'N/A'}`);
    console.log(`Model: ${data.model || 'N/A'}`);
    console.log(`Image URL: ${data.imageUrl?.substring(0, 100)}...`);
    
    if (data.creativeBrief) {
      console.log(`\nCreative Brief:`);
      console.log(`  - Headline: ${data.creativeBrief.posterHeadline || 'N/A'}`);
      console.log(`  - Confidence: ${data.creativeBrief.confidence || 'N/A'}`);
      console.log(`  - Design: ${data.creativeBrief.designDirection || 'N/A'}`);
    }
    
    // Check what's wrong
    const isSVG = data.imageUrl?.includes('banner-image');
    const isRealAI = data.provider?.includes('imagen') || 
                     data.provider?.includes('dall-e') ||
                     data.provider?.includes('google');
    const hasLLM = data.creativeBrief?.confidence >= 0.85;
    
    console.log(`\nDiagnostics:`);
    console.log(`  - Using real AI: ${isRealAI ? '✅ YES' : '❌ NO'}`);
    console.log(`  - Using SVG fallback: ${isSVG ? '⚠️  YES' : '✅ NO'}`);
    console.log(`  - LLM reasoning active: ${hasLLM ? '✅ YES' : '❌ NO'}`);
    
    if (!isRealAI || isSVG || !hasLLM) {
      console.log(`\n⚠️  ISSUES DETECTED:`);
      if (!isRealAI) console.log(`  - Not using real AI image generation`);
      if (isSVG) console.log(`  - Falling back to SVG generator`);
      if (!hasLLM) console.log(`  - LLM reasoning not working (check Gemini key)`);
      
      console.log(`\n💡 NEXT STEPS:`);
      console.log(`  1. Check server logs above for API key errors`);
      console.log(`  2. Verify Gemini API key is valid (starts with AIzaSy...)`);
      console.log(`  3. Check if key has Imagen API enabled in Google Cloud`);
    } else {
      console.log(`\n✅ ALL CHECKS PASSED!`);
      console.log(`   API is working correctly with real AI generation.`);
    }
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error('\nStack:');
    console.error(error.stack);
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

testDirectAPI().catch(console.error);
