// Editor Elements
const codeEditor = document.getElementById('codeEditor');
const previewFrame = document.getElementById('previewFrame');
const runBtn = document.getElementById('runBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const interactiveMode = document.getElementById('interactiveMode');
const lineNumbers = document.getElementById('lineNumbers');

// Auto-closing tags
const autoCloseTags = {
    'div': true, 'span': true, 'p': true, 'h1': true, 'h2': true, 'h3': true,
    'h4': true, 'h5': true, 'h6': true, 'a': true, 'ul': true, 'ol': true,
    'li': true, 'table': true, 'tr': true, 'td': true, 'th': true,
    'thead': true, 'tbody': true, 'button': true, 'form': true, 'label': true,
    'select': true, 'textarea': true, 'section': true, 'article': true,
    'header': true, 'footer': true, 'main': true, 'nav': true, 'aside': true,
    'script': true, 'style': true, 'title': true, 'body': true, 'head': true,
    'html': true, 'strong': true, 'em': true, 'code': true, 'pre': true
};

// Interactive mode state
let isInteractive = false;

// Run button click
runBtn.addEventListener('click', function() {
    updatePreview();
});

// Interactive mode toggle
interactiveMode.addEventListener('change', function() {
    isInteractive = this.checked;
    if (isInteractive) {
        updatePreview();
    }
});

// Update on input when interactive mode is on
codeEditor.addEventListener('input', function() {
    updateLineNumbers();
    if (isInteractive) {
        updatePreview();
    }
});

// Update preview function
function updatePreview() {
    try {
        const code = codeEditor.value;
        const iframe = previewFrame;
        
        // Write to iframe
        iframe.srcdoc = code;
        
    } catch (error) {
        console.error('Preview error:', error);
    }
}

// Handle Tab key for indentation
codeEditor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        
        this.value = value.substring(0, start) + '    ' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
    }
    
    // Auto-close tags when > is typed
    if (e.key === '>') {
        const start = this.selectionStart;
        const value = this.value;
        const textBefore = value.substring(0, start);
        
        // Check if we just closed an opening tag
        const tagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*$/);
        
        if (tagMatch && autoCloseTags[tagMatch[1].toLowerCase()]) {
            const tagName = tagMatch[1];
            
            // Don't auto-close if it's a self-closing tag
            if (textBefore.endsWith('/')) {
                return;
            }
            
            setTimeout(() => {
                const currentStart = this.selectionStart;
                const currentValue = this.value;
                const beforeCursor = currentValue.substring(0, currentStart);
                const afterCursor = currentValue.substring(currentStart);
                
                this.value = beforeCursor + '</' + tagName + '>' + afterCursor;
                this.selectionStart = this.selectionEnd = currentStart;
            }, 0);
        }
    }
});

// Update line numbers
function updateLineNumbers() {
    const lines = codeEditor.value.split('\n').length;
    let lineNumbersHTML = '';
    
    for (let i = 1; i <= lines; i++) {
        lineNumbersHTML += i + '<br>';
    }
    
    lineNumbers.innerHTML = lineNumbersHTML;
}

// Sync scroll between line numbers and code editor
codeEditor.addEventListener('scroll', function() {
    lineNumbers.scrollTop = codeEditor.scrollTop;
});

// Download HTML function
downloadBtn.addEventListener('click', function() {
    const code = codeEditor.value;
    
    if (!code.trim()) {
        alert('Please write some code first!');
        return;
    }
    
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    const originalText = downloadBtn.textContent;
    const originalBg = downloadBtn.style.background;
    downloadBtn.style.background = '#28a745';
    downloadBtn.textContent = 'Downloaded!';
    
    setTimeout(function() {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = originalBg;
    }, 2000);
});

// Generate and Copy Link function
generateBtn.addEventListener('click', function() {
    const code = codeEditor.value;
    
    if (!code.trim()) {
        alert('Please write some code first!');
        return;
    }
    
    try {
        const base64Code = btoa(unescape(encodeURIComponent(code)));
        const url = window.location.origin + window.location.pathname + '?base64code=' + base64Code;
        
        navigator.clipboard.writeText(url).then(function() {
            // Show success message
            const originalText = generateBtn.textContent;
            const originalBg = generateBtn.style.background;
            generateBtn.style.background = '#28a745';
            generateBtn.textContent = 'Link Copied!';
            
            setTimeout(function() {
                generateBtn.textContent = originalText;
                generateBtn.style.background = originalBg;
            }, 2000);
        }).catch(function(err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalText = generateBtn.textContent;
            generateBtn.textContent = 'Link Copied!';
            setTimeout(function() {
                generateBtn.textContent = originalText;
            }, 2000);
        });
    } catch (error) {
        alert('Failed to generate link: ' + error.message);
    }
});

// Load code from URL parameter on page load
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const base64code = urlParams.get('base64code');
    
    if (base64code) {
        try {
            const decodedCode = decodeURIComponent(escape(atob(base64code)));
            codeEditor.value = decodedCode;
            updateLineNumbers();
            updatePreview();
        } catch (e) {
            console.error('Error decoding code:', e);
            alert('Failed to load code from URL');
        }
    } else {
        updateLineNumbers();
    }
});

// Initialize
updateLineNumbers();

// FAQ Toggle (exact behavior)
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;

    document.querySelectorAll(".faq-item").forEach(faq => {
      if (faq !== item) faq.classList.remove("active");
    });

    item.classList.toggle("active");
  });
});

const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

