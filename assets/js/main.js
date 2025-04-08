(function () {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  async function loadJSON(filepath) {
    if (!filepath) {
      console.error("loadJSON: No filepath provided.");
      document.getElementById("jsonContent").textContent = "Error: No JSON file specified.";
      return;
    }

    try {
      const response = await fetch(filepath);
      const data = await response.json();
      const container = document.getElementById("jsonContent");
      container.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `No data found in ${filepath}`;
        return;
      }

      data.sort((a, b) => a.name?.toLowerCase().localeCompare(b.name?.toLowerCase()));

      const gridContainer = document.createElement("div");
      gridContainer.classList.add("grid-container");

      data.forEach((item) => {
        if (item.name) {
          const block = document.createElement("div");
          block.classList.add("nodeblock");

          const title = document.createElement("button");
          title.classList.add("node-title");
          title.textContent = item.name;
          title.style.fontSize = "12px";
          title.addEventListener("click", () => {
            showPopup(item);
          });

          block.appendChild(title);
          gridContainer.appendChild(block);
        }
      });

      container.appendChild(gridContainer);
    } catch (error) {
      console.error(`Error loading JSON from ${filepath}:`, error);
      document.getElementById("jsonContent").textContent = `Failed to load JSON from ${filepath}: ${error.message}`;
    }
  }

  async function loadYAML(filename) {
    if (!filename) {
      console.error("loadYAML: No filename provided.");
      return;
    }

    try {
      const response = await fetch(filename);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText); // Parsing YAML into a JavaScript object
      const container = document.getElementById("yamlContent");
      container.innerHTML = ""; // Clear previous content

      // Check if 'dropdown' field exists and handle it
      if (yamlData.dropdown && Array.isArray(yamlData.dropdown)) {
        loadYAMLdropdown(yamlData.dropdown); // Function to display dropdown items
        return;
      }

      // Check if 'content' field exists and handle it
      if (yamlData.content && Array.isArray(yamlData.content)) {
        readYAMLparagraphs(yamlData.content); // Function to handle paragraphs
        return;
      }

      // Check if 'operations' field exists and handle it (display mermaid chart)
      if (yamlData.operations) {
        renderMermaidFlowchart(yamlData.operations); // Function to handle mermaid flowchart
        return;
      }

      // If no specific fields found, show raw YAML content
      displayRawYAMLContent(yamlText);

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("yamlContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  function loadYAMLdropdown(dropdownData) {
    const dropdownContainer = document.getElementById("dropdownContent");
    dropdownContainer.innerHTML = ""; // Clear previous dropdown content

    dropdownData.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("dropdown-item");

      const button = document.createElement("button");
      button.classList.add("dropdown-toggle");
      button.textContent = item.dropdown_title;
      button.style.display = "block";
      button.style.marginBottom = "10px";
      button.addEventListener("click", () => {
        details.style.display = details.style.display === "none" ? "block" : "none";
      });

      const details = document.createElement("div");
      details.classList.add("dropdown-details");
      details.style.display = "none";
      details.style.marginLeft = "10px";
      details.style.overflowWrap = "break-word";

      if (Array.isArray(item.dropdown_details)) {
        const list = document.createElement("ul");
        item.dropdown_details.forEach((detail) => {
          const listItem = document.createElement("li");
          listItem.textContent = detail;
          list.appendChild(listItem);
        });
        details.appendChild(list);
      } else {
        details.innerText = "No details available.";
      }

      wrapper.appendChild(button);
      wrapper.appendChild(details);
      dropdownContainer.appendChild(wrapper);
    });
  }

  function readYAMLparagraphs(contentData) {
    const container = document.getElementById("yamlContent");
    contentData.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("paragraph-section");

      const title = document.createElement("h3");
      title.textContent = item.title;

      const paragraph = document.createElement("p");
      paragraph.textContent = item.paragraph;

      section.appendChild(title);
      section.appendChild(paragraph);
      container.appendChild(section);
    });
  }

  function renderMermaidFlowchart(operationsData) {
    const container = document.getElementById("operationsContent");
    container.innerHTML = ""; // Clear previous content

    const mermaidScript = document.createElement("script");
    mermaidScript.textContent = `graph TD; ${operationsData}`; // Assuming operationsData is in mermaid syntax
    container.appendChild(mermaidScript);

    // Initialize Mermaid to render the flowchart
    mermaid.init(undefined, container);
  }

  function displayRawYAMLContent(yamlText) {
    const container = document.getElementById("yamlContent");
    container.textContent = yamlText; // Display the raw YAML content as is
  }

  function showPopup(item) {
    const existingPopups = document.querySelectorAll(".popup");
    existingPopups.forEach((popup) => popup.remove());

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h6><strong>${item.name}</strong></h6>
        <p><strong>File:</strong> ${item.file}</p>
        <p><strong>Name:</strong> ${JSON.stringify(item.decorator_args?.name || "N/A")}</p>
        <p><strong>Switch:</strong> ${formatArray(item.decorator_args?.switch)}</p>
        <p><strong>Inputs:</strong> ${formatArray(item.decorator_args?.inputs)}</p>
        <p><strong>Outputs:</strong> ${formatArray(item.decorator_args?.outputs)}</p>
        <p><strong>Workflows:</strong> ${formatArray(item.workflows)}</p>
      </div>
    `;
    document.body.appendChild(popup);
  }

  function formatArray(arr) {
    if (!arr) return "N/A";
    return `${(Array.isArray(arr) ? arr : [arr]).map((item) => `${JSON.stringify(item)}`).join(" ")}`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: true });
  });

  window.onload = function () {
    toggleScrolled();
    //loadJSON("../assets/content/pages/pipelines/nodeblock_index.json");
    //loadYAML("../assets/content/pages/support/error_triage.yaml");
    loadYAML("../assets/content/pages/index/index.yaml");
  };
})();
