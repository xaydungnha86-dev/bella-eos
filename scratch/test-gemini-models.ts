/**
 * KIỂM TRA GEMINI API KEY VÀ CÁC MODEL KHẢ DỤNG
 * 
 * Script này sẽ:
 * 1. Liệt kê tất cả models mà API key của bạn có thể dùng
 * 2. Test tạo text với từng model
 * 3. Test xem model nào hỗ trợ tạo ảnh
 */

// Dán API key Gemini của bạn từ UI Cài Đặt vào đây
const testKey = 'YOUR_API_KEY_HERE'; // Thay cái này bằng key thật

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function listAvailableModels() {
  console.log('\n=== 1. LIỆT KÊ CÁC MODEL KHẢ DỤNG ===\n');
  
  try {
    const res = await fetch(`${BASE_URL}/models?key=${testKey}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Không lấy được danh sách models (${res.status}):`, errorText);
      return [];
    }
    
    const data = await res.json();
    const models = data.models || [];
    
    console.log(`✅ Tìm thấy ${models.length} models khả dụng:\n`);
    
    models.forEach((model: any, index: number) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Tên hiển thị: ${model.displayName}`);
      console.log(`   Chức năng: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    });
    
    return models;
  } catch (error) {
    console.error('❌ Lỗi khi liệt kê models:', error);
    return [];
  }
}

async function testTextGeneration(modelName: string) {
  console.log(`\n--- Đang test: ${modelName} ---`);
  
  try {
    const res = await fetch(
      `${BASE_URL}/models/${modelName}:generateContent?key=${testKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Xin chào! Bạn có thể tạo text không?' }]
          }]
        })
      }
    );
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log(`❌ Thất bại (${res.status}):`, errorText.substring(0, 200));
      return false;
    }
    
    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log(`✅ Thành công! Trả về: "${responseText.substring(0, 100)}..."`);
    return true;
  } catch (error) {
    console.log(`❌ Lỗi:`, error);
    return false;
  }
}

async function testImageGeneration(modelName: string) {
  console.log(`\n--- Đang test Tạo Ảnh: ${modelName} ---`);
  
  try {
    const res = await fetch(
      `${BASE_URL}/models/${modelName}:generateContent?key=${testKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Tạo ảnh hoàng hôn đẹp trên núi' }]
          }]
        })
      }
    );
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log(`❌ Thất bại (${res.status}):`, errorText.substring(0, 200));
      return false;
    }
    
    const data = await res.json();
    const hasImage = !!data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (hasImage) {
      console.log(`✅ Model này hỗ trợ tạo ảnh!`);
      return true;
    } else {
      console.log(`⚠️ Không trả về ảnh (chỉ hỗ trợ text)`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Lỗi:`, error);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('CÔNG CỤ KIỂM TRA GEMINI API KEY');
  console.log('========================================');
  
  if (testKey === 'YOUR_API_KEY_HERE') {
    console.error('\n❌ Vui lòng sửa file này và dán API key Gemini của bạn vào!\n');
    console.log('Lấy key tại: https://aistudio.google.com/apikey');
    return;
  }
  
  console.log(`\nAPI Key: ${testKey.substring(0, 10)}...${testKey.substring(testKey.length - 5)}`);
  
  // Bước 1: Liệt kê tất cả models
  const models = await listAvailableModels();
  
  if (models.length === 0) {
    console.log('\n⚠️ Không tìm thấy model nào hoặc API key không hợp lệ!\n');
    return;
  }
  
  // Bước 2: Test tạo text với các model ổn định
  console.log('\n=== 2. TEST TẠO TEXT ===\n');
  
  const textModelsToTest = [
    'gemini-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp'
  ];
  
  for (const modelName of textModelsToTest) {
    await testTextGeneration(modelName);
  }
  
  // Bước 3: Test tạo ảnh
  console.log('\n=== 3. TEST TẠO ẢNH ===\n');
  
  const imageModelsToTest = [
    'imagen-3.0-generate-002',
    'imagen-3.0-fast-generate-001',
    'imagen-2',
    'gemini-2.0-flash',
    'gemini-pro'
  ];
  
  for (const modelName of imageModelsToTest) {
    await testImageGeneration(modelName);
  }
  
  console.log('\n========================================');
  console.log('HOÀN TẤT KIỂM TRA');
  console.log('========================================\n');
  
  console.log('📋 KHUYẾN NGHỊ:\n');
  console.log('1. Dùng các model có dấu ✅ trong ứng dụng');
  console.log('2. Nếu không có model nào tạo được ảnh, bạn cần:');
  console.log('   - Truy cập Vertex AI (không phải Gemini API miễn phí)');
  console.log('   - Hoặc dùng OpenAI DALL-E / Flux làm dự phòng');
  console.log('3. Để AI phân tích sáng tạo, dùng bất kỳ model text nào có ✅\n');
  console.log('\n💡 LƯU Ý TÀI KHOẢN TRẢ PHÍ:');
  console.log('   - Nếu bạn đang dùng tài khoản trả phí, hãy kiểm tra:');
  console.log('   - API key có được tạo từ Google Cloud Console không?');
  console.log('   - Vertex AI API đã được bật chưa?');
  console.log('   - Billing đã được thiết lập đúng chưa?\n');
}

main().catch(console.error);
