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
      const mermaidContainer = document.getElementById("operationsContent");
      const listContainer = document.getElementById("listContent");

      paragraphsContainer.innerHTML = "";
      mermaidContainer.innerHTML = ""; 
      listContainer.innerHTML = ""; 

      if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
        readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer); 
      }

      if (yamlData.operations) {
        renderMermaidFromYAML(yamlData.operations, mermaidContainer); 
      }

      if (yamlData.list && Array.isArray(yamlData.list)) {
        renderYAMLList(yamlData.list, listContainer); 
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
  

  function renderMermaidFromYAML(operationsData, container) {

    const mermaidContainer = document.createElement("div");
    mermaidContainer.classList.add("mermaid");
    mermaidContainer.textContent = operationsData;

    container.appendChild(mermaidContainer);

    mermaid.init(undefined, mermaidContainer);
  }

  function renderYAMLList(listData, container) {
    listData.forEach((item) => {
      const section = document.createElement("div");
      section.classList.add("list-section");

      const title = document.createElement("h4");
      title.textContent = item.title;

      const list = document.createElement("ul");
      item.items.forEach((listItem) => {
        const li = document.createElement("li");
        li.textContent = listItem;
        list.appendChild(li);
      });

      section.appendChild(title);
      section.appendChild(list);
      container.appendChild(section);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: true });
  });

  window.onload = function () {
    toggleScrolled();
    loadYAML("assets/content/pages/index/index.yaml");
  };
})();
