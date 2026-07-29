/**
 * TEST: AI Creative Freedom for Layout
 * 
 * Verify that AI has complete freedom to arrange text and visual elements
 * No more rigid layout templates - AI creates naturally diverse compositions
 */

async function testLayoutFreedom() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST: AI Creative Freedom - Natural Layout Variation');
  console.log('═══════════════════════════════════════════════════════════\n');

  const testConfig = {
    objective: 'Tạo banner marketing thu hút cho dịch vụ spa cao cấp',
    copywriterContent: {
      headline: 'Trải Nghiệm Spa Đẳng Cấp 5 Sao',
      benefits: [
        'Công nghệ chăm sóc da tiên tiến nhất Việt Nam',
        'Đội ngũ chuyên gia 15+ năm kinh nghiệm',
        'Cam kết hiệu quả sau 3 buổi điều trị'
      ],
      cta: 'ĐẶT LỊCH NGAY HÔM NAY'
    },
    brandDna: {
      identity: {
        brandName: 'BELLA SPA',
        targetSegment: 'Phụ nữ hiện đại 25-45 tuổi'
      },
      voice: {
        tone: 'Sang trọng & Thân thiện'
      },
      visual: {
        style: 'Luxury Minimalist',
        colors: {
          primary: '#061E17',
          accent: '#D4AF37'
        }
      }
    },
    format: '16:9',
    tenantId: 'test_layout_freedom',
    client_gemini_key: process.env.GEMINI_API_KEY
  };

  console.log('📋 Test Configuration:');
  console.log(`   Brand: ${testConfig.brandDna.identity.brandName}`);
  console.log(`   Headline: ${testConfig.copywriterContent.headline}`);
  console.log(`   CTA: ${testConfig.copywriterContent.cta}`);
  console.log('');

  console.log('🎨 Expected Behavior:');
  console.log('   ✓ AI has creative freedom to arrange layout');
  console.log('   ✓ No rigid layout templates (split_left, diagonal, etc.)');
  console.log('   ✓ Variation seed ensures uniqueness each generation');
  console.log('   ✓ Temperature = 1.0 for maximum diversity');
  console.log('   ✓ Natural diversity in text positioning');
  console.log('');

  console.log('🚀 Generating 3 consecutive images to verify variation...\n');

  const results = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🎬 GENERATION ${i}/3`);
    console.log('─'.repeat(60));

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-image-v4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig)
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Generation ${i} SUCCESS`);
        console.log(`   Provider: ${data.provider}`);
        console.log(`   Model: ${data.model}`);
        console.log(`   Image URL: ${data.imageUrl}`);
        console.log(`   Headline: ${data.creativeBrief.headline}`);
        console.log(`   Composition: ${data.compositionMethod}`);
        
        results.push({
          generation: i,
          success: true,
          imageUrl: data.imageUrl,
          headline: data.creativeBrief.headline
        });
      } else {
        console.log(`❌ Generation ${i} FAILED`);
        console.log(`   Error: ${data.error}`);
        
        results.push({
          generation: i,
          success: false,
          error: data.error
        });
      }

      // Wait 2 seconds between generations to ensure different timestamps
      if (i < 3) {
        console.log('\n⏳ Waiting 2 seconds before next generation...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (err: any) {
      console.log(`❌ Generation ${i} EXCEPTION`);
      console.log(`   Error: ${err.message}`);
      
      results.push({
        generation: i,
        success: false,
        error: err.message
      });
    }
  }

  // Summary
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const successCount = results.filter(r => r.success).length;
  console.log(`✓ Successful Generations: ${successCount}/3`);
  
  if (successCount > 0) {
    console.log('\n🖼️  Generated Images:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   ${r.generation}. ${r.imageUrl}`);
    });

    console.log('\n✅ EXPECTED RESULTS:');
    console.log('   • Each image should have DIFFERENT visual composition');
    console.log('   • Text position may vary (left/right/center/overlay)');
    console.log('   • Visual elements arranged differently');
    console.log('   • Natural artistic diversity (not rigid templates)');
    console.log('   • All text clearly rendered and readable');
    console.log('');
    console.log('👉 MANUAL VERIFICATION REQUIRED:');
    console.log('   1. Open the 3 images side-by-side');
    console.log('   2. Compare layout arrangements');
    console.log('   3. Verify text positioning varies naturally');
    console.log('   4. Confirm all text is clear and professional');
    console.log('   5. Check visual diversity in composition');
  } else {
    console.log('\n❌ No successful generations to compare');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');
}

// Run test
testLayoutFreedom().catch(console.error);
