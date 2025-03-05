import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const LANGUAGE_CONFIG = {
  javascript: {
    id: 63,
    defaultCode: '// Write your JavaScript code here\n\nfunction solve(input) {\n  // Your code here\n}\n',
    name: 'JavaScript (Node.js 12.14.0)'
  },
  python: {
    id: 71,
    defaultCode: '# Write your Python code here\n\ndef solve():\n    # Your code here\n    pass\n',
    name: 'Python (3.8.1)'
  },
  cpp: {
    id: 54,
    defaultCode: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
    name: 'C++ (GCC 9.2.0)'
  },
  java: {
    id: 62,
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n',
    name: 'Java (OpenJDK 13.0.1)'
  }
};

export const CodeEditor = ({ defaultLanguage = 'cpp' }) => {
  const [code, setCode] = useState(LANGUAGE_CONFIG[defaultLanguage].defaultCode);
  const [language, setLanguage] = useState(defaultLanguage);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, running, success, error
  const [customInput, setCustomInput] = useState('');
  const fileInputRef = useRef(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(LANGUAGE_CONFIG[newLang].defaultCode);
  };

  const runCode = async () => {
    try {
      setStatus('running');
      setOutput('Compiling and running...');

      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': '0092a74d05mshfb43ae9af958323p1f0a07jsn3330e8101895',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: LANGUAGE_CONFIG[language].id,
          stdin: customInput,
          wait: false // Add this to use async submission
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { token } = await response.json();
      if (!token) {
        throw new Error('No submission token received');
      }

      // Poll for results
      const result = await checkStatus(token);
      
      if (result.status.id === 3) { // Accepted
        setStatus('success');
        setOutput(result.stdout || 'Program completed successfully!');
      } else {
        setStatus('error');
        setOutput(result.stderr || result.compile_output || result.status.description);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setStatus('error');
      setOutput(`Error running code: ${error.message}`);
    }
  };

  const checkStatus = async (token) => {
    const response = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': '0092a74d05mshfb43ae9af958323p1f0a07jsn3330e8101895', // Update with same key
      },
    });
    
    const result = await response.json();
    
    if (['In Queue', 'Processing'].includes(result.status.description)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkStatus(token);
    }
    
    return result;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
      };
      reader.readAsText(file);

      // Try to detect language from file extension
      const extension = file.name.split('.').pop().toLowerCase();
      const languageMap = {
        'js': 'javascript',
        'py': 'python',
        'cpp': 'cpp',
        'java': 'java'
      };
      
      if (languageMap[extension]) {
        handleLanguageChange(languageMap[extension]);
      }
    }
    
  };

  const downloadCode = () => {
    const extensionMap = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      java: 'java'
    };

    const extension = extensionMap[language];
    const fileName = `solution.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadOutput = () => {
    const fileName = 'output.txt';
    const blob = new Blob([output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-background text-text-primary px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([langId, config]) => (
              <option key={langId} value={langId}>
                {config.name}
              </option>
            ))}
          </select>

          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".js,.py,.cpp,.java"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-background hover:bg-background-paper text-text-secondary px-3 py-1 rounded-lg transition-colors"
          >
            Upload
          </button>

          {/* Download Code Button */}
          <button
            onClick={downloadCode}
            className="bg-background hover:bg-background-paper text-text-secondary px-3 py-1 rounded-lg transition-colors"
          >
            Download
          </button>
        </div>
        
        <button 
          onClick={runCode}
          disabled={status === 'running'}
          className={`btn-primary ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {status === 'running' ? 'Running...' : 'Run Code'}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Code Editor */}
        <div className="flex flex-col">
          <label className="text-sm text-text-secondary mb-2">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-background text-text-primary p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            spellCheck="false"
          />
        </div>

        {/* Input/Output */}
        <div className="flex flex-col">
          <div className="flex-1 flex flex-col">
            <label className="text-sm text-text-secondary mb-2">Custom Input</label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="h-1/3 bg-background text-text-primary p-4 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
              spellCheck="false"
              placeholder="Enter your test input here..."
            />

            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-text-secondary">Output</label>
              {output && (
                <button
                  onClick={downloadOutput}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Download Output
                </button>
              )}
            </div>
            <div 
              className={`flex-1 bg-background p-4 rounded-lg font-mono text-sm overflow-auto ${
                status === 'error' ? 'text-red-500' : 
                status === 'success' ? 'text-green-500' : 
                'text-text-primary'
              }`}
            >
              {output || 'Program output will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 