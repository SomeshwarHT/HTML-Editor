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
    'html': true, 'strong': true, 'em': true, 'code': true, 'pre': true,
    'input': true, 'img': true, 'br': true, 'hr': true
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
        iframe.srcdoc = code;
    } catch (error) {
        console.error('Preview error:', error);
    }
}

// Handle keyboard events
codeEditor.addEventListener('keydown', function(e) {
    // Tab key - insert 4 spaces
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        
        // Insert tab (4 spaces)
        this.value = value.substring(0, start) + '    ' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        return;
    }
    
    // Enter key - maintain indentation
    if (e.key === 'Enter') {
        e.preventDefault();
        const start = this.selectionStart;
        const value = this.value;
        
        // Get current line
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        
        // Count leading spaces/tabs
        const indent = currentLine.match(/^[\s]*/)[0];
        
        // Check if we're between opening and closing tags
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(start);
        const openingTag = beforeCursor.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>$/);
        const closingTag = afterCursor.match(/^<\/([a-zA-Z][a-zA-Z0-9]*)>/);
        
        if (openingTag && closingTag && openingTag[1] === closingTag[1]) {
            // We're between tags - add extra indentation
            this.value = value.substring(0, start) + '\n' + indent + '    ' + '\n' + indent + value.substring(start);
            this.selectionStart = this.selectionEnd = start + indent.length + 5; // +1 for newline, +4 for spaces
        } else {
            // Normal enter - just maintain current indentation
            this.value = value.substring(0, start) + '\n' + indent + value.substring(start);
            this.selectionStart = this.selectionEnd = start + indent.length + 1;
        }
        
        updateLineNumbers();
        return;
    }
    
    // Auto-close tags when > is typed
    if (e.key === '>') {
        const start = this.selectionStart;
        const value = this.value;
        const textBefore = value.substring(0, start);
        
        // Check if we just closed an opening tag
        const tagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?$/);
        
        if (tagMatch && autoCloseTags[tagMatch[1].toLowerCase()]) {
            const tagName = tagMatch[1];
            
            // Don't auto-close if it's a self-closing tag (ends with /)
            if (!textBefore.endsWith('/')) {
                e.preventDefault();
                
                const beforeCursor = value.substring(0, start);
                const afterCursor = value.substring(start);
                
                // Insert > and closing tag
                this.value = beforeCursor + '></' + tagName + '>' + afterCursor;
                
                // Position cursor between the tags
                this.selectionStart = this.selectionEnd = start + 1;
                return;
            }
        }
    }
    
    // Auto-close brackets, quotes, etc.
    const pairs = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'"
    };
    
    if (pairs[e.key]) {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        
        // If there's a selection, wrap it
        if (start !== end) {
            e.preventDefault();
            const selectedText = value.substring(start, end);
            this.value = value.substring(0, start) + e.key + selectedText + pairs[e.key] + value.substring(end);
            this.selectionStart = start + 1;
            this.selectionEnd = end + 1;
            return;
        }
        
        // For quotes, only auto-close if not already inside quotes
        if (e.key === '"' || e.key === "'") {
            const beforeCursor = value.substring(0, start);
            const afterCursor = value.substring(start);
            
            // Check if we're closing an existing quote
            const quotesBefore = (beforeCursor.match(new RegExp('\\' + e.key, 'g')) || []).length;
            if (quotesBefore % 2 === 1) {
                // Odd number of quotes before, so we're closing
                return;
            }
        }
        
        // Auto-close the pair
        e.preventDefault();
        this.value = value.substring(0, start) + e.key + pairs[e.key] + value.substring(start);
        this.selectionStart = this.selectionEnd = start + 1;
    }
});

// Sync scroll between line numbers and editor wrapper
const editorWrapper = document.querySelector('.editor-wrapper');
editorWrapper.addEventListener('scroll', function() {
    lineNumbers.scrollTop = editorWrapper.scrollTop;
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

document.addEventListener("DOMContentLoaded", () => {
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  if (!scrollTopBtn) {
    console.error("Scroll top button not found");
    return;
  }

  window.addEventListener("scroll", () => {
    if (window.scrollY > 150) {
      scrollTopBtn.style.display = "flex";
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
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(function(button) {
    button.addEventListener('click', function() {
        const faqItem = this.closest('.faq-item');
        const faqAnswer = faqItem.querySelector('.faq-answer');
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(function(item) {
            item.classList.remove('active');
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.maxHeight = '0';
            }
        });
        
        // Open clicked FAQ if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
            faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
        }
    });
});

// Search Sidebar Functionality
const discoverLinks = document.querySelectorAll('.discover-link');
const searchSidebar = document.getElementById('searchSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.querySelector('.close-sidebar');

if (discoverLinks.length > 0 && searchSidebar) {
    discoverLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const searchTerm = this.getAttribute('data-search');
            const searchTermElement = document.getElementById('searchTerm');
            if (searchTermElement) {
                searchTermElement.textContent = searchTerm;
            }
            searchSidebar.classList.add('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.add('active');
            }
        });
    });
}

if (closeSidebar) {
    closeSidebar.addEventListener('click', function() {
        searchSidebar.classList.remove('active');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
        searchSidebar.classList.remove('active');
        this.classList.remove('active');
    });
}
