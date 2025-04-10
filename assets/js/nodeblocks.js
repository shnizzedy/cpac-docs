import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: true });

document.addEventListener("DOMContentLoaded", function() {
  "use strict";

  function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (!h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
    window.scrollY > 100 ? b.classList.add("scrolled") : b.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);

  window.addEventListener("load", () => {
    toggleScrolled();
    loadNodeblockContent();
  });

  function loadNodeblockContent() {
    const yamlDirectory = '../../assets/content/pages/neuroimaging/nodeblock_descriptors';
    const yamlFiles = [
      'anat_preproc.yaml',
      'func_preproc.yaml'
    ];

    const nodeblocksContainer = document.querySelector('.nodeblocks');

    if (nodeblocksContainer) {
      const contentContainer = document.createElement('div');
      
      yamlFiles.forEach((fileName) => {
        fetch(`${yamlDirectory}/${fileName}`)
          .then(response => response.text())
          .then(yamlContent => {
            const parsedYaml = jsyaml.load(yamlContent);

            for (let title in parsedYaml) {
              const topLevel = parsedYaml[title];

              if (topLevel.description) {
                const titleElement = document.createElement('h3');
                titleElement.textContent = title; 

                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = topLevel.description; 

                contentContainer.appendChild(titleElement);
                contentContainer.appendChild(descriptionElement);
              }

              if (topLevel.method) {
                for (let methodName in topLevel.method) {
                  const methodDetails = topLevel.method[methodName];

                  if (methodDetails.description || methodDetails.operations) {
                    const methodTitleElement = document.createElement('h4');
                    methodTitleElement.textContent = methodName; 

                    const methodDescriptionElement = document.createElement('p');
                    methodDescriptionElement.textContent = methodDetails.description || 'No description available';  

                    contentContainer.appendChild(methodTitleElement);
                    contentContainer.appendChild(methodDescriptionElement);

                    if (methodDetails.operations) {
                      const mermaidContainer = document.createElement('div');
                      mermaidContainer.classList.add('mermaid');
                      mermaidContainer.textContent = methodDetails.operations; 

                      contentContainer.appendChild(mermaidContainer);

                      mermaid.init();
                    }
                  }
                }
              }
            }
          })
          .catch(error => console.error(`Failed to load YAML file: ${fileName}`, error));
      });

      nodeblocksContainer.appendChild(contentContainer);
    }
  }
});
