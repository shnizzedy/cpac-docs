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

      const paragraphsContainer = document.getElementById("paragraphsContent");
      const mermaidContainer = document.getElementById("operationsContent");

      paragraphsContainer.innerHTML = ""; // Clear previous content
      mermaidContainer.innerHTML = ""; // Clear previous content

      // Check if 'paragraphs' field exists and handle it (display paragraphs first)
      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer); // Function to handle paragraphs
      }

      // Check if 'operations' field exists and handle it (render mermaid flowchart)
      if (yamlData.operations) {
        renderMermaidFromYAML(yamlData.operations, mermaidContainer); // Function to render mermaid chart
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  function readYAMLparagraphs(contentData, container) {
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

  function renderMermaidFromYAML(operationsData, container) {
    // Create a new div to hold the Mermaid chart
    const mermaidContainer = document.createElement("div");
    mermaidContainer.classList.add("mermaid");
    mermaidContainer.textContent = operationsData; // Set the Mermaid syntax

    // Append the Mermaid container to the mermaidContainer
    container.appendChild(mermaidContainer);

    // Initialize Mermaid to render the flowchart
    mermaid.init(undefined, mermaidContainer);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: true });
  });

  window.onload = function () {
    toggleScrolled();
    loadYAML("assets/content/pages/index/index.yaml");
  };
})();
