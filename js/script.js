let currentView = {1: 'text', 2: 'text'};
let jsonObjects = {1: null, 2: null};

// Resize functionality variables
let isResizing = false;
let startX = 0;
let startWidth1 = 0;
let startWidth2 = 0;

// Initialize line numbers and resize functionality on page load
window.addEventListener('DOMContentLoaded', () => {
    updateLineNumbers(1);
    updateLineNumbers(2);
    initializeResizeHandle();
    updateCopyButtonVisibility(1);
    updateCopyButtonVisibility(2);
});

function updateLineNumbers(num) {
    const textarea = document.getElementById('json' + num);
    const lineNumbers = document.getElementById('lineNumbers' + num);
    const lines = textarea.value.split('\n');
    const lineCount = lines.length;

    let lineNumbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHtml += `<span>${i}</span>`;
    }
    lineNumbers.innerHTML = lineNumbersHtml;
    updateCopyButtonVisibility(num);
}

function syncScroll(num) {
    const textarea = document.getElementById('json' + num);
    const lineNumbers = document.getElementById('lineNumbers' + num);
    lineNumbers.scrollTop = textarea.scrollTop;
}

function switchView(num, view) {
    const textarea = document.getElementById('json' + num);
    const treeView = document.getElementById('tree' + num);
    const wrapper = document.getElementById('wrapper' + num);
    const panel = document.getElementById('panel' + num);
    const buttons = panel ? panel.querySelectorAll('.toggle-btn') : [];

    const previousView = currentView[num];
    currentView[num] = view;

    // Remove active class from all buttons
    buttons.forEach(btn => btn.classList.remove('active'));

    if (view === 'tree') {
        wrapper.style.display = 'none';
        treeView.classList.add('active');
        if (buttons[2]) buttons[2].classList.add('active');
        renderTree(num);
    } else if (view === 'single') {
        wrapper.style.display = 'flex';
        treeView.classList.remove('active');
        if (buttons[1]) buttons[1].classList.add('active');
        convertToSingleLine(num);
    } else { // text
        wrapper.style.display = 'flex';
        treeView.classList.remove('active');
        if (buttons[0]) buttons[0].classList.add('active');

        // If coming from single line mode, auto-format back to pretty print
        if (previousView === 'single') {
            const resultDiv = document.getElementById('result');
            try {
                const json = JSON.parse(textarea.value);
                jsonObjects[num] = json;
                textarea.value = JSON.stringify(json, null, 2);
                updateLineNumbers(num);
                resultDiv.innerHTML = `<div class="success-message">
                    <span class="iconify" data-icon="mdi:check-circle"></span>
                    JSON ${num} formatted to text mode!
                </div>`;
            } catch (e) {
                // If parse fails, just keep the current value
            }
        }
    }

    // Update copy button visibility after view change
    updateCopyButtonVisibility(num);
}

function convertToSingleLine(num) {
    const textarea = document.getElementById('json' + num);
    const resultDiv = document.getElementById('result');

    try {
        const json = JSON.parse(textarea.value);
        jsonObjects[num] = json;
        textarea.value = JSON.stringify(json);
        updateLineNumbers(num);
        resultDiv.innerHTML = `<div class="success-message">
            <span class="iconify" data-icon="mdi:check-circle"></span>
            JSON ${num} converted to single line!
        </div>`;
    } catch (e) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            Error in JSON ${num}: ${e.message}
        </div>`;
    }
    updateCopyButtonVisibility(num);
}

function formatJSON(num) {
    const textarea = document.getElementById('json' + num);
    const resultDiv = document.getElementById('result');

    try {
        const json = JSON.parse(textarea.value);
        jsonObjects[num] = json;
        textarea.value = JSON.stringify(json, null, 2);
        updateLineNumbers(num);
        resultDiv.innerHTML = `<div class="success-message">
            <span class="iconify" data-icon="mdi:check-circle"></span>
            JSON ${num} formatted successfully!
        </div>`;

        if (currentView[num] === 'tree') {
            renderTree(num);
        } else if (currentView[num] === 'text') {
            // Already formatted with indentation
        } else if (currentView[num] === 'single') {
            // Switch back to single line after parsing
            convertToSingleLine(num);
        }
    } catch (e) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            Error in JSON ${num}: ${e.message}
        </div>`;
    }
    updateCopyButtonVisibility(num);
}

function formatBoth() {
    formatJSON(1);
    setTimeout(() => formatJSON(2), 100);
}

function minifyBoth() {
    const resultDiv = document.getElementById('result');
    let errors = [];

    [1, 2].forEach(num => {
        const textarea = document.getElementById('json' + num);
        try {
            const json = JSON.parse(textarea.value);
            jsonObjects[num] = json;
            textarea.value = JSON.stringify(json);
            updateLineNumbers(num);
        } catch (e) {
            errors.push(`JSON ${num}: ${e.message}`);
        }
    });

    if (errors.length > 0) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            Errors:<br>${errors.join('<br>')}
        </div>`;
    } else {
        resultDiv.innerHTML = `<div class="success-message">
            <span class="iconify" data-icon="mdi:check-circle"></span>
            Both JSONs minified successfully!
        </div>`;
    }
}

function clearAll() {
    document.getElementById('json1').value = '';
    document.getElementById('json2').value = '';
    document.getElementById('tree1').innerHTML = '';
    document.getElementById('tree2').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    jsonObjects = {1: null, 2: null};
}

function renderTree(num) {
    const textarea = document.getElementById('json' + num);
    const treeView = document.getElementById('tree' + num);
    const resultDiv = document.getElementById('result');

    try {
        const json = JSON.parse(textarea.value);
        jsonObjects[num] = json;
        treeView.innerHTML = buildTree(json, '');
        addTreeEventListeners(treeView);
    } catch (e) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            Error parsing JSON ${num}: ${e.message}
        </div>`;
    }
}

function buildTree(obj, path = '', isLast = true) {
    if (obj === null) {
        return `<span class="tree-value null">null</span>`;
    }

    const type = typeof obj;

    if (type === 'string') {
        return `<span class="tree-value string">"${escapeHtml(obj)}"</span>`;
    }

    if (type === 'number') {
        return `<span class="tree-value number">${obj}</span>`;
    }

    if (type === 'boolean') {
        return `<span class="tree-value boolean">${obj}</span>`;
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return `<span class="tree-bracket">[]</span>`;
        }

        let html = `<span class="tree-toggle" onclick="toggleNode(this)">
            <span class="iconify" data-icon="mdi:chevron-down"></span>
        </span>`;
        html += `<span class="tree-bracket">[</span>`;
        html += `<span class="tree-count">${obj.length} items</span>`;
        html += `<div class="tree-children">`;

        obj.forEach((item, index) => {
            html += `<div class="tree-node">`;
            html += `<span class="tree-key">${index}:</span> `;
            html += buildTree(item, `${path}[${index}]`, index === obj.length - 1);
            if (index < obj.length - 1) html += `<span class="tree-bracket">,</span>`;
            html += `</div>`;
        });

        html += `</div>`;
        html += `<span class="tree-bracket">]</span>`;
        return html;
    }

    if (type === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return `<span class="tree-bracket">{}</span>`;
        }

        let html = `<span class="tree-toggle" onclick="toggleNode(this)">
            <span class="iconify" data-icon="mdi:chevron-down"></span>
        </span>`;
        html += `<span class="tree-bracket">{</span>`;
        html += `<span class="tree-count">${keys.length} keys</span>`;
        html += `<div class="tree-children">`;

        keys.forEach((key, index) => {
            html += `<div class="tree-node">`;
            html += `<span class="tree-key">"${escapeHtml(key)}":</span> `;
            html += buildTree(obj[key], `${path}.${key}`, index === keys.length - 1);
            if (index < keys.length - 1) html += `<span class="tree-bracket">,</span>`;
            html += `</div>`;
        });

        html += `</div>`;
        html += `<span class="tree-bracket">}</span>`;
        return html;
    }

    return String(obj);
}

function toggleNode(element) {
    const children = element.parentElement.querySelector('.tree-children');
    const icon = element.querySelector('.iconify');
    if (children) {
        children.classList.toggle('collapsed');
        if (children.classList.contains('collapsed')) {
            icon.setAttribute('data-icon', 'mdi:chevron-right');
        } else {
            icon.setAttribute('data-icon', 'mdi:chevron-down');
        }
    }
}

function addTreeEventListeners(container) {
    // Event listeners are added via onclick in the HTML
}

function expandAllTrees() {
    document.querySelectorAll('.tree-children.collapsed').forEach(el => {
        el.classList.remove('collapsed');
    });
    document.querySelectorAll('.tree-toggle .iconify').forEach(el => {
        el.setAttribute('data-icon', 'mdi:chevron-down');
    });
}

function collapseAllTrees() {
    document.querySelectorAll('.tree-children').forEach(el => {
        el.classList.add('collapsed');
    });
    document.querySelectorAll('.tree-toggle .iconify').forEach(el => {
        el.setAttribute('data-icon', 'mdi:chevron-right');
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function compareJSON() {
    const resultDiv = document.getElementById('result');
    const json1Text = document.getElementById('json1').value;
    const json2Text = document.getElementById('json2').value;

    if (!json1Text || !json2Text) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            Vui lòng nhập cả 2 JSON để so sánh!
        </div>`;
        return;
    }

    try {
        const obj1 = JSON.parse(json1Text);
        const obj2 = JSON.parse(json2Text);
        jsonObjects[1] = obj1;
        jsonObjects[2] = obj2;

        const differences = findDifferences(obj1, obj2);
        displayDifferences(differences);
    } catch (e) {
        resultDiv.innerHTML = `<div class="error-message">
            <span class="iconify" data-icon="mdi:alert-circle"></span>
            JSON parsing error: ${e.message}
        </div>`;
    }
}

function findDifferences(obj1, obj2, path = '') {
    const diffs = [];

    // Handle null values
    if (obj1 === null || obj2 === null) {
        if (obj1 !== obj2) {
            diffs.push({
                type: 'changed',
                path: path || 'root',
                value1: obj1,
                value2: obj2
            });
        }
        return diffs;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        const maxLength = Math.max(obj1.length, obj2.length);

        for (let i = 0; i < maxLength; i++) {
            const currentPath = path ? `${path}[${i}]` : `[${i}]`;

            if (i >= obj1.length) {
                diffs.push({
                    type: 'added',
                    path: currentPath,
                    value1: undefined,
                    value2: obj2[i]
                });
            } else if (i >= obj2.length) {
                diffs.push({
                    type: 'removed',
                    path: currentPath,
                    value1: obj1[i],
                    value2: undefined
                });
            } else {
                // Both exist, compare them
                if (typeof obj1[i] === 'object' && obj1[i] !== null &&
                    typeof obj2[i] === 'object' && obj2[i] !== null) {
                    diffs.push(...findDifferences(obj1[i], obj2[i], currentPath));
                } else if (JSON.stringify(obj1[i]) !== JSON.stringify(obj2[i])) {
                    diffs.push({
                        type: 'changed',
                        path: currentPath,
                        value1: obj1[i],
                        value2: obj2[i]
                    });
                }
            }
        }
        return diffs;
    }

    // Handle type mismatch (one is array, one is object, etc.)
    if (typeof obj1 !== typeof obj2 || Array.isArray(obj1) !== Array.isArray(obj2)) {
        diffs.push({
            type: 'changed',
            path: path || 'root',
            value1: obj1,
            value2: obj2
        });
        return diffs;
    }

    // Handle objects
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        allKeys.forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const val1 = obj1[key];
            const val2 = obj2[key];

            if (!(key in obj2)) {
                diffs.push({
                    type: 'removed',
                    path: currentPath,
                    value1: val1,
                    value2: undefined
                });
            } else if (!(key in obj1)) {
                diffs.push({
                    type: 'added',
                    path: currentPath,
                    value1: undefined,
                    value2: val2
                });
            } else {
                // Both have the key
                if (typeof val1 === 'object' && val1 !== null &&
                    typeof val2 === 'object' && val2 !== null) {
                    diffs.push(...findDifferences(val1, val2, currentPath));
                } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                    diffs.push({
                        type: 'changed',
                        path: currentPath,
                        value1: val1,
                        value2: val2
                    });
                }
            }
        });
    }

    return diffs;
}

function displayDifferences(differences) {
    const resultDiv = document.getElementById('result');

    if (differences.length === 0) {
        resultDiv.innerHTML = `
            <div class="success-message">
                <span class="iconify" data-icon="mdi:check-circle"></span>
                Hai JSON hoàn toàn giống nhau!
            </div>
        `;
        return;
    }

    const stats = {
        added: differences.filter(d => d.type === 'added').length,
        removed: differences.filter(d => d.type === 'removed').length,
        changed: differences.filter(d => d.type === 'changed').length
    };

    let html = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">Total Differences:</span>
                <span class="stat-value">${differences.length}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">
                    <span class="iconify" data-icon="mdi:plus-circle"></span>
                    Added:
                </span>
                <span class="stat-value" style="color: #28a745;">${stats.added}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">
                    <span class="iconify" data-icon="mdi:minus-circle"></span>
                    Removed:
                </span>
                <span class="stat-value" style="color: #dc3545;">${stats.removed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">
                    <span class="iconify" data-icon="mdi:sync"></span>
                    Changed:
                </span>
                <span class="stat-value" style="color: #ffc107;">${stats.changed}</span>
            </div>
        </div>
        <div class="diff-container">
    `;

    differences.forEach(diff => {
        const typeClass = `diff-${diff.type}`;
        const typeLabel = {
            'added': '<span class="iconify" data-icon="mdi:plus-circle"></span> ADDED',
            'removed': '<span class="iconify" data-icon="mdi:minus-circle"></span> REMOVED',
            'changed': '<span class="iconify" data-icon="mdi:sync"></span> CHANGED'
        }[diff.type];

        html += `
            <div class="diff-item ${typeClass}">
                <div class="diff-path">${typeLabel}: ${diff.path}</div>
        `;

        if (diff.type === 'changed') {
            html += `
                <div class="diff-value">
                    <strong>JSON 1:</strong> ${JSON.stringify(diff.value1, null, 2)}
                </div>
                <div class="diff-value" style="margin-top: 8px;">
                    <strong>JSON 2:</strong> ${JSON.stringify(diff.value2, null, 2)}
                </div>
            `;
        } else if (diff.type === 'removed') {
            html += `
                <div class="diff-value">
                    <strong>Value:</strong> ${JSON.stringify(diff.value1, null, 2)}
                </div>
            `;
        } else {
            html += `
                <div class="diff-value">
                    <strong>Value:</strong> ${JSON.stringify(diff.value2, null, 2)}
                </div>
            `;
        }

        html += `</div>`;
    });

    html += `</div>`;
    resultDiv.innerHTML = html;
}

// Resize Handle Functionality
function initializeResizeHandle() {
    const resizeHandle = document.getElementById('resizeHandle');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');
    const content = document.querySelector('.json-panels-container');

    if (!resizeHandle || !panel1 || !panel2) return;

    resizeHandle.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);

    function startResize(e) {
        isResizing = true;
        startX = e.clientX;

        const rect1 = panel1.getBoundingClientRect();
        const rect2 = panel2.getBoundingClientRect();

        startWidth1 = rect1.width;
        startWidth2 = rect2.width;

        resizeHandle.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
    }

    function doResize(e) {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const contentRect = content.getBoundingClientRect();
        const contentWidth = contentRect.width - 40; // Account for padding
        const handleWidth = 28; // Handle + margins

        const availableWidth = contentWidth - handleWidth;
        const newWidth1 = Math.max(200, Math.min(availableWidth - 200, startWidth1 + deltaX));
        const newWidth2 = availableWidth - newWidth1;

        const flex1 = newWidth1 / availableWidth;
        const flex2 = newWidth2 / availableWidth;

        panel1.style.flex = `${flex1}`;
        panel2.style.flex = `${flex2}`;

        e.preventDefault();
    }

    function stopResize() {
        if (!isResizing) return;

        isResizing = false;
        resizeHandle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }

    // Handle window resize to maintain proportions
    window.addEventListener('resize', () => {
        if (!isResizing) {
            // Reset to equal widths on window resize if not currently dragging
            panel1.style.flex = '1';
            panel2.style.flex = '1';
        }
    });
}

// Copy Button Functionality
function updateCopyButtonVisibility(num) {
    const textarea = document.getElementById('json' + num);
    const copyBtn = document.getElementById('copyBtn' + num);
    const wrapper = document.getElementById('wrapper' + num);

    if (!textarea || !copyBtn) return;

    const hasContent = textarea.value.trim().length > 0;
    const isTextView = currentView[num] === 'text' || currentView[num] === 'single';
    const wrapperVisible = wrapper && wrapper.style.display !== 'none';

    if (hasContent && isTextView && wrapperVisible) {
        copyBtn.classList.add('has-content');
    } else {
        copyBtn.classList.remove('has-content');
    }
}

function copyContent(num) {
    const textarea = document.getElementById('json' + num);
    const copyBtn = document.getElementById('copyBtn' + num);

    if (!textarea || !copyBtn) return;

    const content = textarea.value;
    if (!content.trim()) return;

    // Clear any existing timeout
    if (copyBtn.resetTimeout) {
        clearTimeout(copyBtn.resetTimeout);
    }

    // Use the Clipboard API
    navigator.clipboard.writeText(content).then(() => {
        // Store original HTML if not already stored
        if (!copyBtn.originalHTML) {
            copyBtn.originalHTML = copyBtn.innerHTML;
        }

        // Change to checkmark icon
        copyBtn.innerHTML = '<span class="iconify" data-icon="mdi:check"></span>';
        copyBtn.classList.add('copied');
        copyBtn.title = 'Copied!';

        // Reset after 3 seconds
        copyBtn.resetTimeout = setTimeout(() => {
            console.log('Resetting copy button icon after 3s...');

            // Restore original copy icon HTML
            copyBtn.innerHTML = copyBtn.originalHTML;
            copyBtn.classList.remove('copied');
            copyBtn.title = 'Copy to clipboard';
            copyBtn.resetTimeout = null;
        }, 3000);
    }).catch(err => {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(content, copyBtn);
    });
}

function fallbackCopyTextToClipboard(text, copyBtn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    // Clear any existing timeout
    if (copyBtn.resetTimeout) {
        clearTimeout(copyBtn.resetTimeout);
    }

    try {
        document.execCommand('copy');

        // Store original HTML if not already stored
        if (!copyBtn.originalHTML) {
            copyBtn.originalHTML = copyBtn.innerHTML;
        }

        // Change to checkmark icon
        copyBtn.innerHTML = '<span class="iconify" data-icon="mdi:check"></span>';
        copyBtn.classList.add('copied');
        copyBtn.title = 'Copied!';

        // Reset after 3 seconds
        copyBtn.resetTimeout = setTimeout(() => {
            console.log('Resetting fallback copy button icon after 3s...');

            // Restore original copy icon HTML
            copyBtn.innerHTML = copyBtn.originalHTML;
            copyBtn.classList.remove('copied');
            copyBtn.title = 'Copy to clipboard';
            copyBtn.resetTimeout = null;
        }, 3000);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}