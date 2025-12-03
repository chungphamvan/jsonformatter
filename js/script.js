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

    // Remove active class and update aria-pressed for all buttons
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });

    if (view === 'tree') {
        wrapper.style.display = 'none';
        treeView.classList.add('active');
        if (buttons[2]) {
            buttons[2].classList.add('active');
            buttons[2].setAttribute('aria-pressed', 'true');
        }
        renderTree(num);
    } else if (view === 'single') {
        wrapper.style.display = 'flex';
        treeView.classList.remove('active');
        if (buttons[1]) {
            buttons[1].classList.add('active');
            buttons[1].setAttribute('aria-pressed', 'true');
        }
        convertToSingleLine(num);
    } else { // text
        wrapper.style.display = 'flex';
        treeView.classList.remove('active');
        if (buttons[0]) {
            buttons[0].classList.add('active');
            buttons[0].setAttribute('aria-pressed', 'true');
        }

        // If coming from single line mode, auto-format back to pretty print
        if (previousView === 'single') {
            const resultDiv = document.getElementById('result');
            try {
                const json = JSON.parse(textarea.value);
                jsonObjects[num] = json;
                textarea.value = JSON.stringify(json, null, 2);
                updateLineNumbers(num);
                showMessage(resultDiv, 'success', `JSON ${num} formatted to text mode!`, 'mdi:check-circle');
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
        showMessage(resultDiv, 'success', `JSON ${num} converted to single line!`, 'mdi:check-circle');
    } catch (e) {
        showMessage(resultDiv, 'error', `Error in JSON ${num}: ${e.message}`, 'mdi:alert-circle');
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
        showMessage(resultDiv, 'success', `JSON ${num} formatted successfully!`, 'mdi:check-circle');

        if (currentView[num] === 'tree') {
            renderTree(num);
        } else if (currentView[num] === 'text') {
            // Already formatted with indentation
        } else if (currentView[num] === 'single') {
            // Switch back to single line after parsing
            convertToSingleLine(num);
        }
    } catch (e) {
        showMessage(resultDiv, 'error', `Error in JSON ${num}: ${e.message}`, 'mdi:alert-circle');
    }
    updateCopyButtonVisibility(num);
}

function formatBoth() {
    formatJSON(1);
    formatJSON(2);
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
        showMessage(resultDiv, 'error', `Errors:\n${errors.join('\n')}`, 'mdi:alert-circle');
    } else {
        showMessage(resultDiv, 'success', 'Both JSONs minified successfully!', 'mdi:check-circle');
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
        // Clear previous tree
        treeView.innerHTML = '';
        // Build tree using DOM methods
        const treeFragment = buildTreeDOM(json, '');
        treeView.appendChild(treeFragment);
    } catch (e) {
        showMessage(resultDiv, 'error', `Error parsing JSON ${num}: ${e.message}`, 'mdi:alert-circle');
    }
}

// Helper function to create elements safely
function createElement(tag, className, textContent = null) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent !== null) element.textContent = textContent;
    return element;
}

// Helper function to create iconify spans
function createIcon(iconName) {
    const span = document.createElement('span');
    span.className = 'iconify';
    span.setAttribute('data-icon', iconName);
    return span;
}

// Helper function to display messages safely
function showMessage(container, type, message, iconName) {
    container.innerHTML = '';
    const messageClass = type === 'error' ? 'error-message' : 'success-message';
    const messageDiv = createElement('div', messageClass);

    if (iconName) {
        messageDiv.appendChild(createIcon(iconName));
        messageDiv.appendChild(document.createTextNode(' '));
    }
    messageDiv.appendChild(document.createTextNode(message));
    container.appendChild(messageDiv);
}

// Build tree using safe DOM methods instead of innerHTML
function buildTreeDOM(obj, path = '', isLast = true) {
    const fragment = document.createDocumentFragment();

    if (obj === null) {
        const span = createElement('span', 'tree-value null', 'null');
        fragment.appendChild(span);
        return fragment;
    }

    const type = typeof obj;

    if (type === 'string') {
        const span = createElement('span', 'tree-value string', `"${obj}"`);
        fragment.appendChild(span);
        return fragment;
    }

    if (type === 'number') {
        const span = createElement('span', 'tree-value number', String(obj));
        fragment.appendChild(span);
        return fragment;
    }

    if (type === 'boolean') {
        const span = createElement('span', 'tree-value boolean', String(obj));
        fragment.appendChild(span);
        return fragment;
    }

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            const span = createElement('span', 'tree-bracket', '[]');
            fragment.appendChild(span);
            return fragment;
        }

        const toggle = createElement('span', 'tree-toggle');
        toggle.appendChild(createIcon('mdi:chevron-down'));
        toggle.onclick = function() { toggleNode(this); };
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-label', 'Toggle array');
        toggle.setAttribute('tabindex', '0');
        toggle.onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNode(this);
            }
        };
        fragment.appendChild(toggle);

        fragment.appendChild(createElement('span', 'tree-bracket', '['));
        fragment.appendChild(createElement('span', 'tree-count', `${obj.length} items`));

        const children = createElement('div', 'tree-children');
        obj.forEach((item, index) => {
            const node = createElement('div', 'tree-node');
            const keySpan = createElement('span', 'tree-key', `${index}:`);
            node.appendChild(keySpan);
            node.appendChild(document.createTextNode(' '));
            node.appendChild(buildTreeDOM(item, `${path}[${index}]`, index === obj.length - 1));

            if (index < obj.length - 1) {
                node.appendChild(createElement('span', 'tree-bracket', ','));
            }
            children.appendChild(node);
        });

        fragment.appendChild(children);
        fragment.appendChild(createElement('span', 'tree-bracket', ']'));
        return fragment;
    }

    if (type === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            const span = createElement('span', 'tree-bracket', '{}');
            fragment.appendChild(span);
            return fragment;
        }

        const toggle = createElement('span', 'tree-toggle');
        toggle.appendChild(createIcon('mdi:chevron-down'));
        toggle.onclick = function() { toggleNode(this); };
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-label', 'Toggle object');
        toggle.setAttribute('tabindex', '0');
        toggle.onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleNode(this);
            }
        };
        fragment.appendChild(toggle);

        fragment.appendChild(createElement('span', 'tree-bracket', '{'));
        fragment.appendChild(createElement('span', 'tree-count', `${keys.length} keys`));

        const children = createElement('div', 'tree-children');
        keys.forEach((key, index) => {
            const node = createElement('div', 'tree-node');
            const keySpan = createElement('span', 'tree-key', `"${key}":`);
            node.appendChild(keySpan);
            node.appendChild(document.createTextNode(' '));
            node.appendChild(buildTreeDOM(obj[key], `${path}.${key}`, index === keys.length - 1));

            if (index < keys.length - 1) {
                node.appendChild(createElement('span', 'tree-bracket', ','));
            }
            children.appendChild(node);
        });

        fragment.appendChild(children);
        fragment.appendChild(createElement('span', 'tree-bracket', '}'));
        return fragment;
    }

    fragment.appendChild(document.createTextNode(String(obj)));
    return fragment;
}

// Legacy function kept for compatibility (not used anymore)
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
        showMessage(resultDiv, 'error', 'Please enter both JSON inputs to compare!', 'mdi:alert-circle');
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
        showMessage(resultDiv, 'error', `JSON parsing error: ${e.message}`, 'mdi:alert-circle');
    }
}

// Deep equality comparison for primitive values
function deepEquals(val1, val2) {
    // Handle primitives and null
    if (val1 === val2) return true;
    if (val1 === null || val2 === null) return false;
    if (typeof val1 !== 'object' || typeof val2 !== 'object') return false;

    // For objects and arrays in difference detection, we only need primitive comparison
    // Complex objects are handled recursively by findDifferences
    return false;
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
                } else if (!deepEquals(obj1[i], obj2[i])) {
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
                } else if (!deepEquals(val1, val2)) {
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
    resultDiv.innerHTML = '';

    if (differences.length === 0) {
        showMessage(resultDiv, 'success', 'Both JSONs are identical!', 'mdi:check-circle');
        return;
    }

    const stats = {
        added: differences.filter(d => d.type === 'added').length,
        removed: differences.filter(d => d.type === 'removed').length,
        changed: differences.filter(d => d.type === 'changed').length
    };

    // Create stats container
    const statsDiv = createElement('div', 'stats');

    // Total differences
    const totalStat = createElement('div', 'stat-item');
    totalStat.appendChild(createElement('span', 'stat-label', 'Total Differences:'));
    totalStat.appendChild(createElement('span', 'stat-value', String(differences.length)));
    statsDiv.appendChild(totalStat);

    // Added stat
    const addedStat = createElement('div', 'stat-item');
    const addedLabel = createElement('span', 'stat-label');
    addedLabel.appendChild(createIcon('mdi:plus-circle'));
    addedLabel.appendChild(document.createTextNode(' Added:'));
    const addedValue = createElement('span', 'stat-value', String(stats.added));
    addedValue.style.color = '#28a745';
    addedStat.appendChild(addedLabel);
    addedStat.appendChild(addedValue);
    statsDiv.appendChild(addedStat);

    // Removed stat
    const removedStat = createElement('div', 'stat-item');
    const removedLabel = createElement('span', 'stat-label');
    removedLabel.appendChild(createIcon('mdi:minus-circle'));
    removedLabel.appendChild(document.createTextNode(' Removed:'));
    const removedValue = createElement('span', 'stat-value', String(stats.removed));
    removedValue.style.color = '#dc3545';
    removedStat.appendChild(removedLabel);
    removedStat.appendChild(removedValue);
    statsDiv.appendChild(removedStat);

    // Changed stat
    const changedStat = createElement('div', 'stat-item');
    const changedLabel = createElement('span', 'stat-label');
    changedLabel.appendChild(createIcon('mdi:sync'));
    changedLabel.appendChild(document.createTextNode(' Changed:'));
    const changedValue = createElement('span', 'stat-value', String(stats.changed));
    changedValue.style.color = '#ffc107';
    changedStat.appendChild(changedLabel);
    changedStat.appendChild(changedValue);
    statsDiv.appendChild(changedStat);

    resultDiv.appendChild(statsDiv);

    // Create diff container
    const diffContainer = createElement('div', 'diff-container');

    differences.forEach(diff => {
        const typeClass = `diff-${diff.type}`;
        const diffItem = createElement('div', `diff-item ${typeClass}`);

        // Create path header
        const pathDiv = createElement('div', 'diff-path');

        const typeIcons = {
            'added': 'mdi:plus-circle',
            'removed': 'mdi:minus-circle',
            'changed': 'mdi:sync'
        };
        const typeLabels = {
            'added': 'ADDED',
            'removed': 'REMOVED',
            'changed': 'CHANGED'
        };

        pathDiv.appendChild(createIcon(typeIcons[diff.type]));
        pathDiv.appendChild(document.createTextNode(` ${typeLabels[diff.type]}: ${diff.path}`));
        diffItem.appendChild(pathDiv);

        // Create value display
        if (diff.type === 'changed') {
            const value1Div = createElement('div', 'diff-value');
            const strong1 = createElement('strong', null, 'JSON 1:');
            value1Div.appendChild(strong1);
            value1Div.appendChild(document.createTextNode(' ' + JSON.stringify(diff.value1, null, 2)));
            diffItem.appendChild(value1Div);

            const value2Div = createElement('div', 'diff-value');
            value2Div.style.marginTop = '8px';
            const strong2 = createElement('strong', null, 'JSON 2:');
            value2Div.appendChild(strong2);
            value2Div.appendChild(document.createTextNode(' ' + JSON.stringify(diff.value2, null, 2)));
            diffItem.appendChild(value2Div);
        } else {
            const valueDiv = createElement('div', 'diff-value');
            const strong = createElement('strong', null, 'Value:');
            valueDiv.appendChild(strong);
            const value = diff.type === 'removed' ? diff.value1 : diff.value2;
            valueDiv.appendChild(document.createTextNode(' ' + JSON.stringify(value, null, 2)));
            diffItem.appendChild(valueDiv);
        }

        diffContainer.appendChild(diffItem);
    });

    resultDiv.appendChild(diffContainer);
}

// Resize Handle Functionality
function initializeResizeHandle() {
    const resizeHandle = document.getElementById('resizeHandle');
    const panel1 = document.getElementById('panel1');
    const panel2 = document.getElementById('panel2');
    const content = document.querySelector('.json-panels-container');

    if (!resizeHandle || !panel1 || !panel2) return;

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

        // Add listeners only when resizing starts
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);

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

        // Remove listeners when resizing stops
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
    }

    // Only attach mousedown to the resize handle
    resizeHandle.addEventListener('mousedown', startResize);

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
            // Restore original copy icon HTML
            copyBtn.innerHTML = copyBtn.originalHTML;
            copyBtn.classList.remove('copied');
            copyBtn.title = 'Copy to clipboard';
            copyBtn.resetTimeout = null;
        }, 3000);
    } catch (err) {
        // Copy operation failed silently
    }

    document.body.removeChild(textArea);
}