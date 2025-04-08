(function () {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);

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
      const yamlData = jsyaml.load(yamlText);

      const paragraphsContainer = document.getElementById("paragraphsContent");
      paragraphsContainer.innerHTML = "";

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer);
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
      section.appendChild(title);
  
      // Support multiple paragraphs
      if (Array.isArray(item.paragraphs)) {
        item.paragraphs.forEach((paraText) => {
          const para = document.createElement("p");
          para.textContent = paraText;
          section.appendChild(para);
        });
      } else {
        // Fallback if single string (legacy support)
        const para = document.createElement("p");
        para.textContent = item.paragraphs || "";
        section.appendChild(para);
      }
  
      container.appendChild(section);
    });
  }
  

  window.addEventListener("load", () => {
    toggleScrolled();
    loadYAML("../assets/content/pages/neuroimaging/neuroimaging.yaml");
  });
})();
