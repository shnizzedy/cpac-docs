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
      const container = document.getElementById("yamlContent");
      container.innerHTML = "";

      if (filename === "../assets/content/error_triage.yaml") {
        const parsedData = parseYAMLContent(yamlText);
        if (parsedData && parsedData.content) {
          container.innerHTML = parsedData.content.replace(/\n/g, "<br>");
        } else {
          console.error("Content not found in error_triage.yaml");
          container.textContent = "Error: Content not found in the YAML file.";
        }
      } else {
        container.innerHTML = yamlText.replace(/\n/g, "<br>");
      }
    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("yamlContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  async function loadYAMLdropdown(filename) {
    if (!filename) {
      console.error("loadYAMLdropdown: No filename provided.");
      return;
    }

    try {
      const response = await fetch(filename);
      const yamlText = await response.text();
      const yamlData = jsyaml.load(yamlText);

      const dropdownContainer = document.getElementById("dropdownContent");
      dropdownContainer.innerHTML = "";
      dropdownContainer.style.display = "grid";
      dropdownContainer.style.gridTemplateColumns = "1fr"; 
      dropdownContainer.style.gap = "16px";

      const dropdownItems = yamlData.content;

      if (!Array.isArray(dropdownItems) || dropdownItems.length === 0) {
        dropdownContainer.innerHTML = "No dropdown content found in YAML.";
        return;
      }

      dropdownItems.forEach((item) => {
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
    } catch (error) {
      console.error(`Error loading YAML dropdown from ${filename}:`, error);
      const dropdownContainer = document.getElementById("dropdownContent");
      dropdownContainer.textContent = `Failed to load YAML: ${error.message}`;
    }
  }

  function parseYAMLContent(yamlText) {
    try {
      const contentMatch = yamlText.match(/content:\s*([\s\S]*)/);
      if (contentMatch) {
        return { content: contentMatch[1].trim() };
      }
    } catch (error) {
      console.error("Error parsing YAML:", error);
    }
    return null;
  }

  function formatArray(arr) {
    if (!arr) return "N/A";
    return `${(Array.isArray(arr) ? arr : [arr]).map((item) => `${JSON.stringify(item)}`).join(" ")}`;
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

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: true });
  });

  window.onload = function () {
    toggleScrolled();
    loadJSON("../assets/content/pages/pipelines/nodeblock_index.json");
    loadYAML("../assets/content/pages/support/error_triage.yaml");
    loadYAMLdropdown("../assets/content//pages/support/error_triage.yaml");
  };
})();
