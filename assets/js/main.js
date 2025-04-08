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
    const listContainer = document.getElementById("listContent");
    const dropdownContainer = document.getElementById("dropdownContent");

    paragraphsContainer.innerHTML = "";
    listContainer.innerHTML = "";
    dropdownContainer.innerHTML = "";

    if (yamlData.dropdown && Array.isArray(yamlData.dropdown)) {
      loadYAMLdropdown(yamlData.dropdown);
      return;
    }

    if (yamlData.content && Array.isArray(yamlData.content)) {
      readYAMLparagraphs(yamlData.content, paragraphsContainer);
      return;
    }

    if (yamlData.list && Array.isArray(yamlData.list)) {
      loadYAMLList(yamlData.list, listContainer);
      return;
    }

    if (yamlData.operations) {
      renderMermaidFlowchart(yamlData.operations);
      return;
    }

    displayRawYAMLContent(yamlText);

  } catch (error) {
    console.error(`Error loading YAML from ${filename}:`, error);
    const container = document.getElementById("yamlContent");
    container.textContent = `Failed to load YAML from ${filename}: ${error.message}`;
  }
}

function loadYAMLdropdown(dropdownData) {
  const dropdownContainer = document.getElementById("dropdownContent");
  dropdownContainer.innerHTML = "";

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

function loadYAMLList(listData, container) {
  listData.forEach((item) => {
    const section = document.createElement("div");
    section.classList.add("list-section");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const list = document.createElement("ul");

    if (Array.isArray(item.items)) {
      item.items.forEach((listItem) => {
        const listItemElement = document.createElement("li");
        listItemElement.textContent = listItem;
        list.appendChild(listItemElement);
      });
    }

    section.appendChild(title);
    section.appendChild(list);
    container.appendChild(section);
  });
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

function renderMermaidFlowchart(operationsData) {
  const container = document.getElementById("operationsContent");
  container.innerHTML = "";

  const mermaidScript = document.createElement("script");
  mermaidScript.textContent = `graph TD; ${operationsData}`;
  container.appendChild(mermaidScript);

  mermaid.init(undefined, container);
}

function displayRawYAMLContent(yamlText) {
  const container = document.getElementById("yamlContent");
  container.textContent = yamlText;
}

document.addEventListener("DOMContentLoaded", function () {
  mermaid.initialize({ startOnLoad: true });
});

window.onload = function () {
  toggleScrolled();
  loadYAML("assets/content/pages/index/index.yaml");
};
