// Paste API key vào đây
const API_KEY = 'YOUR_KEY_HERE';

const models = [
  'imagen-3.0-generate-001',
  'imagen-3.0-fast-generate-001',
  'imagen-3.0-capability-001',
  'gemini-3-pro-image',
  'gemini-3.1-flash-image'
];

async function testImageGen(model: string) {
  console.log(`\n🧪 Testing: ${model}`);
  
  const prompt = `Create a professional marketing banner (1200x630px) for a spa business.
  
Layout:
- Top left: Logo badge "BELLA SPA" in gold
- Center: Large headline "TĂNG 25% LƯỢNG DEMO SPA" in bold white text
- Below: 3 bullet points with icons
- Bottom right: Pink CTA button "ĐĂNG KÝ NGAY →"
- Background: Luxury spa interior with soft lighting

Style: Modern, clean, professional, high-end spa aesthetic`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );
    
    const data = await res.json();
    
    if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      console.log(`✅ SUCCESS - Generated image with text!`);
      return true;
    } else {
      console.log(`❌ FAILED:`, data.error?.message || JSON.stringify(data).substring(0, 200));
      return false;
    }
  } catch (e) {
    console.log(`❌ ERROR:`, e);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('IMAGEN TEXT GENERATION TEST');
  console.log('========================================');
  
  if (API_KEY === 'YOUR_KEY_HERE') {
    console.log('\n❌ Please edit this file and add your Gemini API key!\n');
    return;
  }
  
  for (const model of models) {
    await testImageGen(model);
  }
  
  console.log('\n========================================');
  console.log('TEST COMPLETE');
  console.log('========================================\n');
  
  console.log('💡 NEXT STEPS:');
  console.log('- If any model succeeded → Use that for banner generation');
  console.log('- If all failed → AI cannot generate text reliably yet');
  console.log('- Alternative: Use DALL-E 3 or Midjourney API\n');
}

main();
