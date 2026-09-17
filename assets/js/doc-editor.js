/* ==========================================================================
   MICROSOFT WORD / GOOGLE DOCS-STYLE WYSIWYG DOCUMENT EDITOR
   Provides a familiar rich editing ribbon with headings, font sizes,
   bulleting, check symbols (✓), and a searchable icon picker.
   ========================================================================== */

(function(window) {
  'use strict';

  const ICON_COLLECTION = [
    { name: 'school', category: 'Academic', icon: 'school' },
    { name: 'groups', category: 'People', icon: 'groups' },
    { name: 'military_tech', category: 'Leadership', icon: 'military_tech' },
    { name: 'verified', category: 'Status', icon: 'verified' },
    { name: 'insights', category: 'Analytics', icon: 'insights' },
    { name: 'trending_up', category: 'Growth', icon: 'trending_up' },
    { name: 'shield', category: 'Security', icon: 'shield' },
    { name: 'target', category: 'Goal', icon: 'crisis_alert' },
    { name: 'award', category: 'Achievement', icon: 'emoji_events' },
    { name: 'heart', category: 'Wellbeing', icon: 'favorite' },
    { name: 'fitness', category: 'Physical', icon: 'fitness_center' },
    { name: 'tasks', category: 'Work', icon: 'task_alt' },
    { name: 'calendar', category: 'Time', icon: 'calendar_month' },
    { name: 'flag', category: 'Mission', icon: 'flag' },
    { name: 'lightbulb', category: 'Idea', icon: 'lightbulb' },
    { name: 'bolt', category: 'Velocity', icon: 'bolt' },
    { name: 'document', category: 'Doc', icon: 'description' },
    { name: 'folder', category: 'Storage', icon: 'folder' },
    { name: 'public', category: 'Global', icon: 'public' },
    { name: 'radar', category: 'Geospatial', icon: 'radar' },
    { name: 'star', category: 'Rating', icon: 'star' },
    { name: 'check_box', category: 'Check', icon: 'check_box' },
    { name: 'warning', category: 'Alert', icon: 'warning' },
    { name: 'info', category: 'Notice', icon: 'info' }
  ];

  let currentTargetEditor = null;

  class PbiDocEditor {
    constructor(containerId, initialContent = '') {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      this.initialContent = initialContent;
      this.render();
    }

    render() {
      this.container.classList.add('doc-editor-container');
      this.container.innerHTML = `
        <div class="doc-ribbon" role="toolbar" aria-label="Formatting ribbon">
          
          <!-- Group 1: Styles / Headings -->
          <div class="ribbon-group">
            <select class="ribbon-select doc-style-select" title="Text Style">
              <option value="p">Normal Text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote Callout</option>
            </select>
          </div>

          <!-- Group 2: Font Size -->
          <div class="ribbon-group">
            <select class="ribbon-select doc-size-select" title="Font Size">
              <option value="12px">12px (Small)</option>
              <option value="14px" selected>14px (Standard)</option>
              <option value="16px">16px (Medium)</option>
              <option value="18px">18px (Large)</option>
              <option value="22px">22px (Display)</option>
            </select>
          </div>

          <!-- Group 3: Inline Text Formatting -->
          <div class="ribbon-group">
            <button type="button" class="ribbon-btn btn-cmd-bold" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
            <button type="button" class="ribbon-btn btn-cmd-italic" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
            <button type="button" class="ribbon-btn btn-cmd-underline" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
            <button type="button" class="ribbon-btn btn-cmd-strike" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
          </div>

          <!-- Group 4: Lists & Check Symbols (✓) -->
          <div class="ribbon-group">
            <button type="button" class="ribbon-btn btn-cmd-bullet" data-cmd="insertUnorderedList" title="Bulleted List (•)">
              <span class="material-symbols-rounded" style="font-size:16px;">format_list_bulleted</span>
            </button>
            <button type="button" class="ribbon-btn btn-cmd-number" data-cmd="insertOrderedList" title="Numbered List (1.)">
              <span class="material-symbols-rounded" style="font-size:16px;">format_list_numbered</span>
            </button>
            <button type="button" class="ribbon-btn ribbon-btn-pill btn-insert-checklist" title="Insert Check Symbol List (✓)">
              <span style="color:#10b981; font-weight:900;">✓</span> Check List
            </button>
          </div>

          <!-- Group 5: Insert Elements (Icons & Callouts) -->
          <div class="ribbon-group">
            <button type="button" class="ribbon-btn ribbon-btn-pill btn-open-icon-picker" title="Insert Material Icon">
              <span class="material-symbols-rounded" style="font-size:16px; color:#1a73e8;">sentiment_satisfied</span> Icon
            </button>
            <button type="button" class="ribbon-btn ribbon-btn-pill btn-insert-callout" title="Insert Executive Highlight Callout">
              <span class="material-symbols-rounded" style="font-size:16px; color:#fb8c00;">lightbulb</span> Callout
            </button>
          </div>

          <!-- Group 6: History -->
          <div class="ribbon-group">
            <button type="button" class="ribbon-btn btn-cmd-undo" data-cmd="undo" title="Undo (Ctrl+Z)">
              <span class="material-symbols-rounded" style="font-size:16px;">undo</span>
            </button>
            <button type="button" class="ribbon-btn btn-cmd-redo" data-cmd="redo" title="Redo (Ctrl+Y)">
              <span class="material-symbols-rounded" style="font-size:16px;">redo</span>
            </button>
          </div>

        </div>

        <!-- Editable Document Canvas -->
        <div class="doc-canvas" contenteditable="true" spellcheck="true">
          ${this.initialContent || '<p>Click here to start editing with the Word-style ribbon...</p>'}
        </div>
      `;

      this.canvas = this.container.querySelector('.doc-canvas');
      this.bindEvents();
    }

    bindEvents() {
      const ribbon = this.container.querySelector('.doc-ribbon');
      const canvas = this.canvas;

      // Track active editor
      canvas.addEventListener('focus', () => {
        currentTargetEditor = this;
      });

      // Command buttons
      ribbon.querySelectorAll('button[data-cmd]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          canvas.focus();
          const cmd = btn.getAttribute('data-cmd');
          document.execCommand(cmd, false, null);
        });
      });

      // Style select (Headings / Paragraph / Quote)
      const styleSelect = ribbon.querySelector('.doc-style-select');
      styleSelect.addEventListener('change', () => {
        canvas.focus();
        const tag = styleSelect.value;
        if (tag === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else {
          document.execCommand('formatBlock', false, `<${tag}>`);
        }
      });

      // Size select
      const sizeSelect = ribbon.querySelector('.doc-size-select');
      sizeSelect.addEventListener('change', () => {
        canvas.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = sizeSelect.value;
        span.appendChild(range.extractContents());
        range.insertNode(span);
      });

      // Check symbol list insertion (✓)
      const btnChecklist = ribbon.querySelector('.btn-insert-checklist');
      btnChecklist.addEventListener('click', () => {
        canvas.focus();
        const checkItemHtml = `
          <div class="doc-checklist-item" style="display:flex;align-items:center;gap:8px;margin:6px 0;">
            <span class="doc-check-icon" style="background:#e8f5e9;color:#2e7d32;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:900;">✓</span>
            <span>New verified target or objective...</span>
          </div>
        `;
        document.execCommand('insertHTML', false, checkItemHtml);
      });

      // Callout insertion
      const btnCallout = ribbon.querySelector('.btn-insert-callout');
      btnCallout.addEventListener('click', () => {
        canvas.focus();
        const calloutHtml = `
          <div class="doc-callout" style="padding:10px 14px;border-radius:8px;margin:10px 0;border-left:4px solid #1a73e8;background:#f0f7ff;color:#1e3a8a;">
            <strong>Executive Key Takeaway:</strong> Enter strategic takeaway or observation here...
          </div>
        `;
        document.execCommand('insertHTML', false, calloutHtml);
      });

      // Icon Picker Trigger
      const btnIcon = ribbon.querySelector('.btn-open-icon-picker');
      btnIcon.addEventListener('click', () => {
        currentTargetEditor = this;
        openIconPicker();
      });
    }

    getContent() {
      return this.canvas ? this.canvas.innerHTML : '';
    }

    setContent(html) {
      if (this.canvas) {
        this.canvas.innerHTML = html;
      }
    }
  }

  // Global Icon Picker Modal
  function openIconPicker() {
    let pickerModal = document.getElementById('globalIconPickerModal');
    if (!pickerModal) {
      pickerModal = document.createElement('div');
      pickerModal.id = 'globalIconPickerModal';
      pickerModal.className = 'icon-picker-modal';
      pickerModal.innerHTML = `
        <div class="icon-picker-head">
          <h4>Insert Material Symbol</h4>
          <button type="button" class="btn-card-hide" id="btnCloseIconPicker">✕</button>
        </div>
        <input type="text" class="icon-picker-search" id="iconPickerSearch" placeholder="Filter icons (e.g. school, shield, target)...">
        <div class="icon-picker-grid" id="iconPickerGrid"></div>
      `;
      document.body.appendChild(pickerModal);

      document.getElementById('btnCloseIconPicker').addEventListener('click', () => {
        pickerModal.style.display = 'none';
      });

      const searchInput = document.getElementById('iconPickerSearch');
      searchInput.addEventListener('input', (e) => {
        renderIconGrid(e.target.value.toLowerCase());
      });
    }

    renderIconGrid('');
    pickerModal.style.display = 'block';
  }

  function renderIconGrid(filterTerm = '') {
    const grid = document.getElementById('iconPickerGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = ICON_COLLECTION.filter(item => 
      item.name.toLowerCase().includes(filterTerm) || 
      item.category.toLowerCase().includes(filterTerm)
    );

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = 'icon-picker-item';
      el.dataset.icon = item.name;
      el.title = `${item.name} (${item.category})`;
      el.innerHTML = `<span class="material-symbols-rounded" style="font-size:22px;">${item.icon}</span>`;
      el.addEventListener('click', () => {
        if (currentTargetEditor && currentTargetEditor.canvas) {
          currentTargetEditor.canvas.focus();
          const iconHtml = `<span class="material-symbols-rounded" style="font-size:18px;vertical-align:middle;margin:0 3px;">${item.icon}</span>&nbsp;`;
          document.execCommand('insertHTML', false, iconHtml);
        }
        document.getElementById('globalIconPickerModal').style.display = 'none';
      });
      grid.appendChild(el);
    });
  }

  // Export to window
  window.PbiDocEditor = PbiDocEditor;
  window.openIconPicker = openIconPicker;

})(window);
