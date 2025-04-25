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

      const container = document.getElementById("paragraphsContent");
      container.innerHTML = "";

      if (yamlData.steps) {
        renderNodeblockSteps(yamlData.steps, container);
      }

    } catch (error) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
    }
  }

  function renderNodeblockSteps(steps, container) {
    Object.entries(steps).forEach(([stepName, stepData]) => {
      const stepDiv = document.createElement("div");
      stepDiv.classList.add("step-section");

      const stepHeader = document.createElement("h4");
      const strongTitle = document.createElement("strong");
      strongTitle.textContent = stepName;
      stepHeader.appendChild(strongTitle);
      stepDiv.appendChild(stepHeader);

      if (stepData.description) {
        const descEl = renderDescription(stepData.description);
        stepDiv.appendChild(descEl);
      }

      if (stepData.methods) {
        Object.entries(stepData.methods).forEach(([methodName, methodData]) => {
          const methodDiv = document.createElement("div");
          methodDiv.classList.add("method-section");

          const methodHeader = document.createElement("h5");
          methodHeader.textContent = methodName;
          methodDiv.appendChild(methodHeader);

          if (methodData.description) {
            const descEl = renderDescription(methodData.description);
            methodDiv.appendChild(descEl);
          }

          if (methodData.operations) {
            const mermaidDiv = document.createElement("div");
            mermaidDiv.classList.add("mermaid");
            mermaidDiv.textContent = methodData.operations;
            mermaidDiv.style.paddingBottom = "20px";
            methodDiv.appendChild(mermaidDiv);
          }

          stepDiv.appendChild(methodDiv);
        });
      }

      container.appendChild(stepDiv);
    });

    mermaid.init();
  }

  function renderDescription(desc) {
    if (Array.isArray(desc)) {
      const ul = document.createElement("ul");
      desc.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      return ul;
    } else {
      const p = document.createElement("p");
      p.textContent = desc;
      return p;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    mermaid.initialize({ startOnLoad: false });
  });

  window.addEventListener("load", () => {
    toggleScrolled();
    loadYAML("../../assets/content/pages/neuroimaging/nodeblock_descriptors/anat_preproc.yaml");
  });
})();
