(function () {
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


    const nodeblocks = document.querySelectorAll('nodeblock');


    nodeblocks.forEach((nodeblock, index) => {
      if (index < yamlFiles.length) {
        fetch(`${yamlDirectory}/${yamlFiles[index]}`)
          .then(response => response.text())
          .then(yamlContent => {

            const fileNameElement = document.createElement('h4');
            fileNameElement.textContent = yamlFiles[index].replace('.yaml', ''); 


            const preTag = document.createElement('pre');
            preTag.textContent = yamlContent; 


            nodeblock.appendChild(fileNameElement);
            nodeblock.appendChild(preTag);
          })
          .catch(error => console.error(`Failed to load YAML file: ${yamlFiles[index]}`, error));
      }
    });
  }

})();
