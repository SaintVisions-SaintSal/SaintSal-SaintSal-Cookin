// Simple test for PDF extraction service
// This can be run in the browser console to test the PDF extraction

async function testPDFExtraction() {
  console.log('Testing PDF extraction service...');
  
  // Create a simple test file (this would normally be a real PDF)
  const testContent = 'This is a test PDF content for testing the extraction service.';
  const testFile = new File([testContent], 'test.pdf', { type: 'application/pdf' });
  
  try {
    // Import the service (this would work in a real browser environment)
    const { extractPDFText } = await import('./src/services/pdfExtractionService.ts');
    
    const result = await extractPDFText(testFile);
    console.log('PDF extraction result:', result);
    
    if (result.success) {
      console.log('✅ PDF extraction test passed!');
      console.log('Extracted text:', result.text);
      console.log('Pages:', result.pages);
      console.log('Method:', result.method);
    } else {
      console.log('❌ PDF extraction test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Export for browser testing
if (typeof window !== 'undefined') {
  window.testPDFExtraction = testPDFExtraction;
  console.log('PDF extraction test function available as window.testPDFExtraction()');
}

module.exports = { testPDFExtraction };
