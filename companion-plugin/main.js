const { Plugin, setIcon, setTooltip } = require('obsidian');

module.exports = class DeepSeekGlassSidebar extends Plugin {
  newNoteLabel() {
    const command = this.app.commands?.commands?.['file-explorer:new-file'];
    return command?.name || (document.documentElement.lang.toLowerCase().startsWith('zh') ? '新建笔记' : 'New note');
  }

  onload() {
    this.setupTitleReveal();
    this.setupNavigationScroll();
    this.setupScrollbarVisibility();
    this.setupSidebarTransition();
    this.mount = this.mount.bind(this);
    this.app.workspace.onLayoutReady(this.mount);
    this.registerEvent(this.app.workspace.on('layout-change', this.mount));
    this.registerEvent(this.app.workspace.on('css-change', this.mount));
    let frame = 0;
    const observer = new MutationObserver(records => {
      const changed = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
        node.nodeType === 1 && (node.matches('.dsg-sidebar-header, .workspace-tab-header-container-inner') ||
          node.querySelector('.dsg-sidebar-header, .workspace-tab-header-container-inner'))));
      if (changed && !frame) frame = requestAnimationFrame(() => { frame = 0; this.mount(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const fitQuickTooltip = () => {
      const tooltip = document.querySelector('.tooltip.dsg-quick-tooltip');
      const button = document.querySelector('.dsg-collapsed-new-note');
      if (!tooltip || !button || !tooltip.querySelector('.dsg-quick-label')) return;
      // Refit after adding keycaps, using Harness's right/left/bottom/top
      // placement order and 12px viewport margin.
      tooltip.style.width = '';
      tooltip.style.height = '';
      const rect = tooltip.getBoundingClientRect();
      const anchor = button.getBoundingClientRect();
      const margin = 12, width = window.innerWidth, height = window.innerHeight;
      const clampX = x => Math.max(margin, Math.min(x, width - margin - rect.width));
      const clampY = y => Math.max(margin, Math.min(y, height - margin - rect.height));
      const middleX = clampX(anchor.left + (anchor.width - rect.width) / 2);
      const middleY = clampY(anchor.top + (anchor.height - rect.height) / 2);
      const positions = [
        { left: anchor.right + 10, top: middleY },
        { left: anchor.left - 10 - rect.width, top: middleY },
        { left: middleX, top: anchor.bottom + 8 },
        { left: middleX, top: anchor.top - 8 - rect.height },
      ];
      const position = positions.find(p => p.left >= margin && p.top >= margin &&
        p.left + rect.width <= width - margin && p.top + rect.height <= height - margin) ||
        { left: clampX(positions[0].left), top: clampY(positions[0].top) };
      tooltip.style.left = `${position.left}px`;
      tooltip.style.top = `${position.top}px`;
    };
    let observedTooltip = null;
    const tooltipSizeObserver = new ResizeObserver(fitQuickTooltip);
    const tooltipObserver = new MutationObserver(records => {
      if (!records.some(record => record.target instanceof Element &&
          (record.target.matches('.tooltip.dsg-quick-tooltip') ||
           [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && node.matches('.tooltip.dsg-quick-tooltip'))))) return;
      const tooltip = document.querySelector('.tooltip.dsg-quick-tooltip');
      const button = document.querySelector('.dsg-collapsed-new-note');
      if (observedTooltip !== tooltip) {
        tooltipSizeObserver.disconnect();
        observedTooltip = tooltip;
        if (tooltip) tooltipSizeObserver.observe(tooltip, { box: 'border-box' });
      }
      if (!tooltip || !button || tooltip.querySelector('.dsg-quick-label')) return;
      tooltip.replaceChildren();
      tooltip.createSpan({ cls: 'dsg-quick-label', text: this.newNoteLabel() });
      const keys = (button.dataset.dsgShortcut || '').trim().split(/\s+/).filter(Boolean);
      if (keys.length) {
        const group = tooltip.createSpan({ cls: 'dsg-quick-keys' });
        keys.forEach(key => group.createEl('kbd', { cls: 'dsg-quick-key', text: key }));
      }
      fitQuickTooltip();
    });
    tooltipObserver.observe(document.body, { childList: true, subtree: true });
    this.registerDomEvent(window, 'resize', fitQuickTooltip);
    this.register(() => {
      observer.disconnect();
      tooltipObserver.disconnect();
      tooltipSizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
      document.querySelectorAll('.dsg-sidebar-header, .dsg-collapsed-new-note').forEach(el => el.remove());
    });
  }

  setupSidebarTransition() {
    let side = null;
    let frame = 0;
    let fades = [];
    const clearFades = () => { fades.forEach(animation => animation.cancel()); fades = []; };
    const observer = new MutationObserver(records => {
      if (!side) return;
      const changed = records.some(record => {
        const wasCollapsed = (record.oldValue || '').split(/\s+/).includes('is-sidedock-collapsed');
        return wasCollapsed !== side.classList.contains('is-sidedock-collapsed');
      });
      if (!changed) return;
      cancelAnimationFrame(frame);
      clearFades();
      if (!getComputedStyle(document.body).getPropertyValue('--dsg-text-size').trim() ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const collapsed = side.classList.contains('is-sidedock-collapsed');
      frame = requestAnimationFrame(() => {
        frame = 0;
        // Only adjust Obsidian's own dock animation, not animations of its
        // children or effects added by other plugins.
        const animation = side?.getAnimations().find(item =>
          item.effect?.target === side && item.effect.getTiming().duration === 140);
        if (!animation) return;
        const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
        animation.effect.updateTiming({ duration: 300, easing });
        // The dock already preserves its content width while it shrinks.
        // Fade only its visible content, as Harness does, leaving the resize
        // handle and the window's collapsed controls unaffected.
        fades = [...side.querySelectorAll(':scope > .workspace-tabs, :scope > .workspace-sidedock-vault-profile')]
          .map(element => element.animate(
            collapsed ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }],
            { duration: collapsed ? 150 : 200, easing, fill: collapsed ? 'forwards' : 'none' }
          ));
      });
    });
    const bind = () => {
      const current = document.querySelector('.workspace-split.mod-primary-split');
      if (current === side) return;
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearFades();
      side = current;
      if (side) observer.observe(side, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    };
    this.app.workspace.onLayoutReady(bind);
    this.registerEvent(this.app.workspace.on('layout-change', bind));
    this.registerEvent(this.app.workspace.on('css-change', () => { cancelAnimationFrame(frame); clearFades(); }));
    this.register(() => { observer.disconnect(); cancelAnimationFrame(frame); clearFades(); });
  }

  setupScrollbarVisibility() {
    let side = null;
    let timer = 0;
    const hide = () => {
      window.clearTimeout(timer);
      timer = 0;
      side?.classList.remove('dsg-scrollbar-visible');
      side = null;
    };
    const linger = () => {
      if (side && !timer) timer = window.setTimeout(hide, 2000);
    };
    const update = event => {
      if (event.pointerType === 'touch') return;
      const current = document.querySelector('.workspace-split.mod-primary-split');
      if (!current || !getComputedStyle(document.body).getPropertyValue('--dsg-text-size').trim()) { hide(); return; }
      if (side && side !== current) hide();
      const rect = current.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom) {
        window.clearTimeout(timer);
        timer = 0;
        side = current;
        side.classList.add('dsg-scrollbar-visible');
      } else linger();
    };
    this.registerDomEvent(document, 'pointermove', update, true);
    this.registerDomEvent(document, 'pointerover', update, true);
    this.registerDomEvent(document, 'pointerout', event => { if (!event.relatedTarget) linger(); }, true);
    this.register(hide);
  }

  setupNavigationScroll() {
    let inner = null;
    let offset = 0;
    let maximum = 0;
    let lastSplit = Number.NEGATIVE_INFINITY;
    let observedScroller = null;
    const resizeObserver = new ResizeObserver(() => { if (inner) prepare(); });
    const clear = () => {
      resizeObserver.disconnect();
      observedScroller = null;
      if (inner) {
        inner.classList.remove('dsg-nav-scroll');
        inner.style.removeProperty('--dsg-nav-offset');
        inner.querySelectorAll(':scope > .workspace-tab-header').forEach(tab => tab.style.removeProperty('--dsg-nav-top'));
      }
      inner = null;
      offset = 0;
      maximum = 0;
      lastSplit = Number.NEGATIVE_INFINITY;
    };
    const prepare = () => {
      if (document.body.classList.contains('is-mobile') || !getComputedStyle(document.body).getPropertyValue('--dsg-text-size').trim()) {
        clear();
        return null;
      }
      const current = document.querySelector('.mod-primary-split .mod-top .workspace-tab-header-container-inner');
      const scroller = document.querySelector('.mod-primary-split .workspace-leaf-content[data-type="file-explorer"] .nav-files-container');
      if (!current || !scroller || !scroller.isConnected || !scroller.getClientRects().length) { clear(); return null; }
      if (current !== inner) { clear(); inner = current; }
      if (scroller !== observedScroller) {
        resizeObserver.disconnect();
        observedScroller = scroller;
        resizeObserver.observe(scroller);
        if (scroller.firstElementChild) resizeObserver.observe(scroller.firstElementChild);
      }
      const tabs = [...inner.querySelectorAll(':scope > .workspace-tab-header')];
      if (!tabs.length) { clear(); return null; }
      const top = tabs[0].offsetTop;
      const last = tabs[tabs.length - 1];
      const gap = parseFloat(getComputedStyle(inner).rowGap) || 0;
      const navigationHeight = last.offsetTop + last.offsetHeight - top + gap;
      // A short file list must not scroll the navigation away. As the
      // navigation moves, its freed space increases the list's clientHeight,
      // so add the current offset back when calculating the original overflow.
      const content = scroller.firstElementChild;
      const style = getComputedStyle(scroller);
      const contentHeight = content
        ? content.scrollHeight + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
        : scroller.scrollHeight;
      maximum = Math.min(navigationHeight, Math.max(0, contentHeight - scroller.clientHeight + offset));
      if (offset > maximum) {
        offset = maximum;
        inner.style.setProperty('--dsg-nav-offset', `${offset}px`);
      }
      tabs.forEach(tab => tab.style.setProperty('--dsg-nav-top', `${tab.offsetTop - top}px`));
      inner.classList.add('dsg-nav-scroll');
      return scroller;
    };
    const place = value => {
      offset = Math.max(0, Math.min(maximum, value));
      inner?.style.setProperty('--dsg-nav-offset', `${offset}px`);
    };
    this.registerDomEvent(document, 'wheel', event => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX) || !(event.target instanceof Element)) return;
      if (!event.target.closest('.mod-primary-split .workspace-tab-header, .mod-primary-split .nav-files-container, .mod-primary-split .workspace-leaf-content[data-type="file-explorer"] .nav-header')) return;
      const scroller = prepare();
      if (!scroller) return;
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1;
      const delta = event.deltaY * factor;
      if (!delta) return;
      if (scroller.scrollTop > 0 && offset < maximum) place(maximum);
      const native = maximum - offset < 1 && scroller.contains(event.target);
      const continuing = event.cancelable && event.timeStamp - lastSplit < 100;
      if (!continuing) {
        if (native && (delta > 0 || scroller.scrollTop + delta >= 0)) return;
        if (!event.cancelable) {
          // The browser will finish moving the native scroller; hand its
          // remaining upward distance to the navigation synchronously.
          if (native) place(offset + delta + scroller.scrollTop);
          return;
        }
      }
      event.preventDefault();
      lastSplit = event.timeStamp;
      if (delta > 0) {
        const before = offset;
        place(offset + delta);
        scroller.scrollTop += delta - (offset - before);
      } else {
        const before = scroller.scrollTop;
        scroller.scrollTop += delta;
        place(offset + delta - (scroller.scrollTop - before));
      }
    }, { passive: false, capture: true });
    this.registerDomEvent(document, 'focusin', event => {
      if (offset > 0 && event.target instanceof Element && event.target.closest('.mod-primary-split .mod-top .workspace-tab-header')) {
        place(0);
      }
    });
    this.registerEvent(this.app.workspace.on('css-change', clear));
    this.registerEvent(this.app.workspace.on('layout-change', clear));
    this.register(clear);
  }

  setupTitleReveal() {
    let title = null;
    let restoreTitleCheck = null;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (restoreTitleCheck) restoreTitleCheck();
      restoreTitleCheck = null;
      if (!title) return;
      title.scrollLeft = 0;
      delete title.dataset.dsgScrolled;
      delete title.dataset.dsgClipped;
      delete title.dataset.dsgRevealing;
      title = null;
    };
    const rowFor = target => target instanceof Element
      ? target.closest('.workspace-leaf-content[data-type="file-explorer"] .nav-file-title') : null;
    this.registerDomEvent(document, 'pointerover', event => {
      if (event.pointerType === 'touch' || event.buttons || !getComputedStyle(document.body).getPropertyValue('--dsg-text-size').trim()) return;
      const row = rowFor(event.target);
      if (!row || row.contains(event.relatedTarget)) return;
      reset();
      const candidate = row.querySelector('.nav-file-title-content');
      if (!candidate) return;
      const range = candidate.scrollWidth - candidate.clientWidth;
      // Obsidian renders an ellipsis even when the overflow is only 1px.
      // Harness's 8px jitter threshold would strand that title behind it.
      if (range <= 0) return;
      title = candidate;
      // Obsidian checks the wider row, rather than the clipped title, when
      // deciding whether to include the full name in its native tooltip.
      const path = row.getAttribute('data-path');
      const item = this.app.workspace.getLeavesOfType('file-explorer')
        .map(leaf => leaf.view.fileItems?.[path])
        .find(entry => entry?.innerEl === candidate);
      if (item && typeof item.isFullTitleShown === 'function') {
        const ownCheck = Object.getOwnPropertyDescriptor(item, 'isFullTitleShown');
        const clippedCheck = () => false;
        item.isFullTitleShown = clippedCheck;
        restoreTitleCheck = () => {
          if (item.isFullTitleShown !== clippedCheck) return;
          if (ownCheck) Object.defineProperty(item, 'isFullTitleShown', ownCheck);
          else delete item.isFullTitleShown;
        };
      }
      title.dataset.dsgRevealing = '';
      const place = left => {
        candidate.scrollLeft = left;
        // Match Harness's edge fades during normal marquee travel. For the
        // tiny overflows that Obsidian alone reveals, avoid fading the title.
        candidate.toggleAttribute('data-dsg-scrolled', range > 8 && left > 0);
        candidate.toggleAttribute('data-dsg-clipped', range > 8 && left < range);
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        place(range);
        return;
      }
      let previous;
      let position = 0;
      const step = now => {
        if (!candidate.isConnected) { reset(); return; }
        position = Math.min(range, position + (previous === undefined ? 0 : (now - previous) * 0.03));
        previous = now;
        place(position);
        if (position < range) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, true);
    this.registerDomEvent(document, 'pointerout', event => {
      const row = rowFor(event.target);
      if (row && !row.contains(event.relatedTarget)) reset();
    });
    this.registerDomEvent(document, 'dragstart', reset);
    // A theme change can remove the hovered row without emitting pointerout.
    // Always restore Obsidian's tooltip check and scroll position in that case.
    this.registerEvent(this.app.workspace.on('css-change', reset));
    this.register(reset);
  }

  mount() {
    const hasTheme = getComputedStyle(document.body).getPropertyValue('--dsg-text-size').trim() !== '';
    const container = document.querySelector('.mod-primary-split .mod-top .workspace-tab-header-container-inner');
    if (!container || !hasTheme || document.body.classList.contains('is-mobile')) {
      document.querySelectorAll('.dsg-sidebar-header, .dsg-collapsed-new-note').forEach(el => el.remove());
      return;
    }
    if (!document.querySelector('.dsg-collapsed-new-note')) {
      const quickNote = document.createElement('button');
      quickNote.className = 'dsg-collapsed-new-note';
      quickNote.type = 'button';
      const updateQuickNoteTooltip = (delay = 500) => {
        const shortcut = this.app.hotkeyManager?.printHotkeyForCommand?.('file-explorer:new-file');
        const noteLabel = this.newNoteLabel();
        const label = shortcut ? `${noteLabel} ${shortcut}` : noteLabel;
        quickNote.dataset.dsgShortcut = shortcut || '';
        setTooltip(quickNote, label, { placement: 'bottom', delay, classes: ['dsg-quick-tooltip'] });
      };
      updateQuickNoteTooltip();
      quickNote.addEventListener('pointerenter', () => updateQuickNoteTooltip());
      quickNote.addEventListener('focus', () => {
        updateQuickNoteTooltip(quickNote.matches(':focus-visible') ? 0 : 500);
        if (quickNote.matches(':focus-visible')) {
          // Obsidian's tooltip opens on pointer entry only; Harness also
          // opens it immediately when the control receives keyboard focus.
          quickNote.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
        }
      });
      quickNote.addEventListener('blur', () => {
        if (!quickNote.matches(':hover')) {
          quickNote.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' }));
        }
      });
      setIcon(quickNote, 'file-plus');
      quickNote.addEventListener('click', () => {
        quickNote.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' }));
        this.app.commands.executeCommandById('file-explorer:new-file');
      });
      document.body.append(quickNote);
    }
    if (container.querySelector(':scope > .dsg-sidebar-header')) return;
    document.querySelectorAll('.dsg-sidebar-header').forEach(el => el.remove());
    const header = document.createElement('div');
    header.className = 'dsg-sidebar-header';
    const brand = header.createDiv({ cls: 'dsg-sidebar-brand', text: 'DeepSeek Glass' });
    brand.setAttribute('aria-hidden', 'true');
    const noteLabel = this.newNoteLabel();
    const button = header.createEl('button', { cls: 'dsg-sidebar-new-note', attr: { type: 'button', 'aria-label': noteLabel } });
    const labelMask = button.createSpan({ cls: 'dsg-sidebar-new-label-mask' });
    const labelContent = labelMask.createSpan({ cls: 'dsg-sidebar-new-label-content' });
    const icon = labelContent.createSpan({ cls: 'dsg-sidebar-new-icon' });
    setIcon(icon, 'file-plus');
    labelContent.createSpan({ text: noteLabel });
    const shortcut = button.createSpan({ cls: 'dsg-sidebar-shortcut', attr: { 'aria-hidden': 'true' } });
    const updateShortcut = () => {
      shortcut.textContent = this.app.hotkeyManager?.printHotkeyForCommand?.('file-explorer:new-file') || '';
    };
    button.addEventListener('pointerenter', updateShortcut);
    button.addEventListener('focus', updateShortcut);
    button.addEventListener('click', () => this.app.commands.executeCommandById('file-explorer:new-file'));
    container.prepend(header);
  }
};
