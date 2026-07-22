const apiKey = 'AIzaSyDtqU1UQpJZYP4Ez7SRUQDoxrMsNJPF_jU';

async function testModel(modelId, method, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${method}?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log(`\n=== MODEL: ${modelId} | METHOD: ${method} ===`);
    console.log(`Status: ${res.status}`);
    try {
      const parsed = JSON.parse(text);
      if (parsed.predictions && parsed.predictions[0]?.bytesBase64Encoded) {
        console.log('Success! bytesBase64Encoded length:', parsed.predictions[0].bytesBase64Encoded.length);
      } else {
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch {
      console.log('Raw text:', text.substring(0, 500));
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

async function run() {
  await testModel('imagen-4.0-ultra-generate-001', 'predict', {
    instances: [{ prompt: 'A beautiful luxury spa banner' }],
    parameters: { sampleCount: 1 }
  });

  await testModel('imagen-4.0-fast-generate-001', 'predict', {
    instances: [{ prompt: 'A beautiful luxury spa banner' }],
    parameters: { sampleCount: 1 }
  });

  // Let's see if there is any other image generation model, e.g. gemini-3.1-flash-image
  await testModel('gemini-3.1-flash-image', 'generateContent', {
    contents: [{ parts: [{ text: 'generate an image of a luxury spa' }] }]
  });

  await testModel('gemini-3-pro-image', 'generateContent', {
    contents: [{ parts: [{ text: 'generate an image of a luxury spa' }] }]
  });
}

run();
