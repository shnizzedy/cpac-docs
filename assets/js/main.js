(function() {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector('body');
    const h = document.querySelector('#header');
    if (!h.classList.contains('scroll-up-sticky') && !h.classList.contains('sticky-top') && !h.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? b.classList.add('scrolled') : b.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  async function loadJSON() {
    try {
      const response = await fetch('nodeblock_index.json');
      const data = await response.json();
      const container = document.getElementById('jsonContent');
      container.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = 'No nodeblocks found.';
        return;
      }

      data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      const gridContainer = document.createElement('div');
      gridContainer.classList.add('grid-container');

      data.forEach(item => {
        if (item.name) {
          const block = document.createElement('div');
          block.classList.add('nodeblock');

          const title = document.createElement('button');
          title.classList.add('node-title');
          title.textContent = item.name;
          title.style.fontSize = '12px';
          title.addEventListener('click', () => {
            showPopup(item);
          });

          block.appendChild(title);
          gridContainer.appendChild(block);
        }
      });

      container.appendChild(gridContainer);
    } catch (error) {
      console.error('Error loading JSON:', error);
      document.getElementById('jsonContent').textContent = `Failed to load JSON data: ${error.message}`;
    }
  }

  function formatArray(arr) {
    if (!arr) return 'N/A';
    return `${(Array.isArray(arr) ? arr : [arr])
      .map(item => `${JSON.stringify(item)}`)
      .join(' ')}`;
  }

  function showPopup(item) {
    // Close any existing popups
    const existingPopups = document.querySelectorAll('.popup');
    existingPopups.forEach(popup => popup.remove());

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h6><strong>${item.name}</strong></h6>
        <p><strong>File:</strong> ${item.file}</p>
        <p><strong>Name:</strong> ${JSON.stringify(item.decorator_args?.name || 'N/A')}</p>
        <p><strong>Switch:</strong> ${formatArray(item.decorator_args?.switch)}</p>
        <p><strong>Inputs:</strong> ${formatArray(item.decorator_args?.inputs)}</p>
        <p><strong>Outputs:</strong> ${formatArray(item.decorator_args?.outputs)}</p>
        <p><strong>Workflows:</strong> ${formatArray(item.workflows)}</p>
      </div>
    `;
    document.body.appendChild(popup);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: true });
  });

  window.onload = function() {
    toggleScrolled();
    loadJSON();
  };
})();
