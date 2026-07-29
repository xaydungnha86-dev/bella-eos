// Dán key vào đây
const testKey = 'YOUR_KEY_HERE';

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${testKey}`)
  .then(r => r.json())
  .then(data => {
    console.log('\n📋 DANH SÁCH MODELS KHẢ DỤNG:\n');
    if (data.models) {
      data.models.forEach((m: any, i: number) => {
        console.log(`${i+1}. ${m.name}`);
        console.log(`   - ${m.displayName}`);
        console.log(`   - Hỗ trợ: ${m.supportedGenerationMethods?.join(', ')}\n`);
      });
    } else {
      console.log('❌ Lỗi:', data);
    }
  })
  .catch(e => console.error('❌ Lỗi:', e));
