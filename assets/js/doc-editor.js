/* ==========================================================================
   EXECUTIVE STRATEGIC NARRATIVE & WYSIWYG DOCUMENT EDITOR
   Powered by open-source Quill.js v2
   Tailored for High-Stature Executive Briefs:
   - Newsreader Serif & Plus Jakarta Sans typography
   - Midnight Navy & Antique Brass accent styling
   - 1-Click Executive Templates: Strategic Callout, Leadership Pillar Quote
   - Two-way binding & debounced auto-save callbacks
   ========================================================================== */

(function(window) {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class ExecutiveDocEditor {
    constructor(containerOrId, initialContent = '', options = {}) {
      this.container = typeof containerOrId === 'string'
        ? document.getElementById(containerOrId)
        : containerOrId;
      if (!this.container) return;

      this.initialContent = initialContent || '';
      this.options = options;
      this.onChange = options.onChange || null;
      this.quill = null;
      this.debounceTimer = null;

      this.render();
    }

    render() {
      const uniqueId = 'ql-tb-' + Math.random().toString(36).substring(2, 9);
      this.container.classList.add('executive-doc-editor-container');
      this.container.innerHTML = `
        <div class="executive-quill-wrapper">
          <div class="executive-quill-toolbar" id="${uniqueId}">
            <span class="ql-formats">
              <button class="ql-header" value="2" title="Section Heading (H2)"></button>
              <button class="ql-header" value="3" title="Subsection Heading (H3)"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-bold" title="Bold (Ctrl+B)"></button>
              <button class="ql-italic" title="Italic (Ctrl+I)"></button>
              <button class="ql-underline" title="Underline (Ctrl+U)"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-list" value="ordered" title="Numbered List"></button>
              <button class="ql-list" value="bullet" title="Bulleted List"></button>
              <button class="ql-list" value="check" title="Milestone Checklist"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-blockquote" title="Quote Callout"></button>
              <button class="ql-clean" title="Clear Formatting"></button>
            </span>
            <span class="ql-formats">
              <button class="ql-align" value="" title="Align Left"></button>
              <button class="ql-align" value="center" title="Align Center"></button>
              <button class="ql-align" value="right" title="Align Right"></button>
              <button class="ql-align" value="justify" title="Justify"></button>
            </span>
            <span class="ql-formats executive-quick-templates">
              <button type="button" class="btn-quill-template btn-insert-highlight" title="Insert Reusable Highlight / Anomaly Tag">
                <span class="material-symbols-rounded">warning</span> Highlight Pill
              </button>
              <button type="button" class="btn-quill-template btn-insert-callout" title="Insert Executive Takeaway Box">
                <span class="material-symbols-rounded">lightbulb</span> Callout
              </button>
              <button type="button" class="btn-quill-template btn-insert-pillar" title="Insert Strategic Pillar Quote">
                <span class="material-symbols-rounded">format_quote</span> Pillar
              </button>
            </span>
          </div>
          <div class="executive-quill-editor"></div>
        </div>
      `;

      const toolbarElem = this.container.querySelector('.executive-quill-toolbar');
      const editorElem = this.container.querySelector('.executive-quill-editor');

      if (window.Quill) {
        this.quill = new window.Quill(editorElem, {
          theme: 'snow',
          modules: {
            toolbar: toolbarElem
          },
          placeholder: 'Enter extended strategic analysis, governance context, or leadership takeaways...'
        });

        if (this.initialContent) {
          this.setContent(this.initialContent);
        }

        this.quill.on('text-change', () => {
          if (this.onChange) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              this.onChange(this.getContent());
            }, 300);
          }
        });
      } else {
        // Fallback if Quill script is still loading or unavailable
        editorElem.setAttribute('contenteditable', 'true');
        editorElem.innerHTML = this.initialContent;
        editorElem.addEventListener('input', () => {
          if (this.onChange) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              this.onChange(editorElem.innerHTML);
            }, 300);
          }
        });
      }

      // Bind custom template buttons
      const btnHighlight = toolbarElem.querySelector('.btn-insert-highlight');
      if (btnHighlight) {
        btnHighlight.addEventListener('click', (e) => {
          e.preventDefault();
          this.openPillDesigner();
        });
      }

      const btnCallout = toolbarElem.querySelector('.btn-insert-callout');
      if (btnCallout) {
        btnCallout.addEventListener('click', (e) => {
          e.preventDefault();
          this.insertCallout();
        });
      }

      const btnPillar = toolbarElem.querySelector('.btn-insert-pillar');
      if (btnPillar) {
        btnPillar.addEventListener('click', (e) => {
          e.preventDefault();
          this.insertPillar();
        });
      }
    }

    openPillDesigner() {
      let popover = this.container.querySelector('.executive-pill-picker-popover');
      if (!popover) {
        popover = document.createElement('div');
        popover.className = 'executive-pill-picker-popover';
        popover.innerHTML = `
          <div class="pill-picker-header">
            <div class="pill-picker-title">
              <span class="material-symbols-rounded" style="font-size: 15px; color: var(--c-brass-600);">palette</span>
              <span>Highlight Pill Designer</span>
            </div>
            <button type="button" class="btn-picker-close" title="Close">&times;</button>
          </div>
          <div class="picker-field">
            <label>Pill Text / Label</label>
            <input type="text" class="ue-input picker-text-input" value="Strategic Highlight" placeholder="e.g. Workload Convergence">
          </div>
          <div class="picker-field">
            <label>Accent Color</label>
            <div class="picker-color-swatches">
              <button type="button" class="color-swatch-btn active" data-color="amber" title="Amber Warning" style="background: #F59E0B;"></button>
              <button type="button" class="color-swatch-btn" data-color="emerald" title="Emerald Success" style="background: #10B981;"></button>
              <button type="button" class="color-swatch-btn" data-color="brass" title="Antique Brass" style="background: #9B7738;"></button>
              <button type="button" class="color-swatch-btn" data-color="navy" title="Midnight Navy" style="background: #0F172A;"></button>
              <button type="button" class="color-swatch-btn" data-color="crimson" title="Crimson Alert" style="background: #EF4444;"></button>
              <button type="button" class="color-swatch-btn" data-color="violet" title="Violet Horizon" style="background: #8B5CF6;"></button>
            </div>
          </div>
          <div class="picker-field">
            <label>Icon Symbol</label>
            <div class="picker-icon-grid">
              <button type="button" class="icon-swatch-btn active" data-icon="warning"><span class="material-symbols-rounded">warning</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="verified"><span class="material-symbols-rounded">verified</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="star"><span class="material-symbols-rounded">star</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="bolt"><span class="material-symbols-rounded">bolt</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="flag"><span class="material-symbols-rounded">flag</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="lightbulb"><span class="material-symbols-rounded">lightbulb</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="trending_up"><span class="material-symbols-rounded">trending_up</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="shield"><span class="material-symbols-rounded">shield</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="crisis_alert"><span class="material-symbols-rounded">crisis_alert</span></button>
              <button type="button" class="icon-swatch-btn" data-icon="school"><span class="material-symbols-rounded">school</span></button>
            </div>
          </div>
          <div class="picker-preview-box">
            <label>Live Design Preview</label>
            <div class="picker-preview-stage">
              <span class="anomaly-badge-pill pill-amber" id="pickerLivePreview">
                <span class="material-symbols-rounded preview-icon" style="font-size:12px; line-height:1;">warning</span>
                <span class="preview-text">Strategic Highlight</span>
              </span>
            </div>
          </div>
          <button type="button" class="btn-picker-insert">
            <span class="material-symbols-rounded">add_circle</span> Insert into Briefing
          </button>
        `;

        const wrapper = this.container.querySelector('.executive-quill-wrapper');
        if (wrapper) wrapper.style.position = 'relative';
        (wrapper || this.container).appendChild(popover);

        let curColor = 'amber';
        let curIcon = 'warning';

        const updatePreview = () => {
          const textVal = popover.querySelector('.picker-text-input').value.trim() || 'Highlight';
          const prev = popover.querySelector('#pickerLivePreview');
          if (prev) {
            prev.className = `anomaly-badge-pill pill-${curColor}`;
            prev.innerHTML = `<span class="material-symbols-rounded preview-icon" style="font-size:12px; line-height:1;">${escapeHtml(curIcon)}</span> <span class="preview-text">${escapeHtml(textVal)}</span>`;
          }
        };

        popover.querySelector('.btn-picker-close').addEventListener('click', (e) => {
          e.preventDefault();
          popover.style.display = 'none';
        });

        popover.querySelector('.picker-text-input').addEventListener('input', updatePreview);

        popover.querySelectorAll('.color-swatch-btn').forEach(b => {
          b.addEventListener('click', (e) => {
            e.preventDefault();
            popover.querySelectorAll('.color-swatch-btn').forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            curColor = b.dataset.color;
            updatePreview();
          });
        });

        popover.querySelectorAll('.icon-swatch-btn').forEach(b => {
          b.addEventListener('click', (e) => {
            e.preventDefault();
            popover.querySelectorAll('.icon-swatch-btn').forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            curIcon = b.dataset.icon;
            updatePreview();
          });
        });

        popover.querySelector('.btn-picker-insert').addEventListener('click', (e) => {
          e.preventDefault();
          const textVal = popover.querySelector('.picker-text-input').value.trim() || 'Strategic Highlight';
          const pillHtml = `<span class="anomaly-badge-pill pill-${curColor}" contenteditable="true" style="margin:4px 4px 4px 0;"><span class="material-symbols-rounded" style="font-size:13px; line-height:1;">${escapeHtml(curIcon)}</span><span>${escapeHtml(textVal)}</span></span>&nbsp;`;
          this.insertHtmlAtCursor(pillHtml);
          popover.style.display = 'none';
        });
      }

      popover.style.display = (popover.style.display === 'none' || !popover.style.display) ? 'flex' : 'none';
    }

    insertHighlightPill() {
      this.openPillDesigner();
    }

    insertCallout() {
      const calloutHtml = `<blockquote class="doc-callout success"><strong>Strategic Key Takeaway:</strong> Enter executive takeaway or operational insight here...</blockquote><p><br></p>`;
      this.insertHtmlAtCursor(calloutHtml);
    }

    insertPillar() {
      const quoteHtml = `<blockquote class="doc-callout dark"><strong>Leadership Pillar:</strong> "I turn purpose into performance through data, discipline, and dedication."</blockquote><p><br></p>`;
      this.insertHtmlAtCursor(quoteHtml);
    }

    insertHtmlAtCursor(html) {
      if (this.quill) {
        const range = this.quill.getSelection(true) || { index: this.quill.getLength() };
        this.quill.clipboard.dangerouslyPasteHTML(range.index, html);
        this.quill.setSelection(range.index + 1);
        if (this.onChange) {
          this.onChange(this.getContent());
        }
      } else {
        const editorElem = this.container.querySelector('.executive-quill-editor');
        if (editorElem) {
          editorElem.focus();
          document.execCommand('insertHTML', false, html);
          if (this.onChange) {
            this.onChange(editorElem.innerHTML);
          }
        }
      }
    }

    getContent() {
      if (this.quill) {
        return this.quill.root.innerHTML;
      }
      const editorElem = this.container.querySelector('.executive-quill-editor');
      return editorElem ? editorElem.innerHTML : '';
    }

    setContent(html) {
      if (this.quill) {
        this.quill.clipboard.dangerouslyPasteHTML(html || '');
      } else {
        const editorElem = this.container.querySelector('.executive-quill-editor');
        if (editorElem) {
          editorElem.innerHTML = html || '';
        }
      }
    }

    focus() {
      if (this.quill) {
        this.quill.focus();
      } else {
        const editorElem = this.container.querySelector('.executive-quill-editor');
        if (editorElem) editorElem.focus();
      }
    }

    destroy() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.quill = null;
    }
  }

  // Export to global scope with backward-compatible alias
  window.ExecutiveDocEditor = ExecutiveDocEditor;
  window.PbiDocEditor = ExecutiveDocEditor;

})(window);
