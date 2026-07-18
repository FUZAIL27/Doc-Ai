const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function parseDocument(filePath, fileType) {
  const buffer = fs.readFileSync(filePath);
  
  switch (fileType) {
    case 'pdf': {
      const data = await pdfParse(buffer);
      return {
        content: data.text,
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).filter(Boolean).length
      };
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      return {
        content: text,
        pageCount: Math.ceil(text.split(/\s+/).length / 300),
        wordCount: text.split(/\s+/).filter(Boolean).length
      };
    }
    case 'txt': {
      const text = buffer.toString('utf-8');
      return {
        content: text,
        pageCount: Math.ceil(text.split(/\s+/).length / 300),
        wordCount: text.split(/\s+/).filter(Boolean).length
      };
    }
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

module.exports = { parseDocument };
