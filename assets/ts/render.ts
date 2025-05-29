"use strict";
// Edit the TypeScript file, not the compiled JavaScript file.

import { createHeaderNavDiv } from './header.js';
import { ParagraphsList, YamlData } from './types/types.js';

class UnderConstruction extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("role", "complementary");
    this.setAttribute("aria-label", "Page status notice");
    this.innerHTML = `<aside>This page is under construction. To suggest content-related edits, please open a <a href="https://github.com/FCP-INDI/cpac-docs/blob/main/CONTRIBUTING.md#writing-a-content-related-pr:~:text=Appendix-,Writing%20a%20Content%2DRelated%20PR,-To%20contribute%20content">content-related PR
      </a>.</aside>`;
  }
}

async function loadData(filename: URL): Promise<YamlData> {
  const response: Response = await fetch(filename);
  const yamlText: string = await response.text();
  // @ts-expect-error: jsyaml imported from CDN
  return jsyaml.load(yamlText);
}

async function getData(container: HTMLElement, filename: URL | string | null = null): Promise<[YamlData, string | null]> {
  const dataId: string | null = container.getAttribute("data-id");
  let yamlData: YamlData = {};
  let section: string | null = null;
  if (dataId && !filename) {
    section = getSection(window.location.href);
    const baseUrl = window.location.origin;
    const pathname = window.location.pathname.split("/");
    let project_slug = "";
    while (pathname && !project_slug) {
      project_slug = pathname.shift();
    };
    const base = project_slug && project_slug != "pages" ? baseUrl + "/" + project_slug : baseUrl;
    filename = new URL(`../assets/content/pages/${section}/${dataId}.yaml`, base);
  }
  if (typeof filename === "string") {
    filename = new URL(filename);
  }
  if (filename instanceof URL) {
    try {
      yamlData = await loadData(filename);
    } catch (error: unknown) {
      console.error(`Error loading YAML from ${filename}:`, error);
      const container = document.getElementById("paragraphsContent");
      if (container) {
        let message: string = "";
        if (error instanceof Error) {
          message = error.message;
        } else {
          message = `${error}`;
        }
        container.textContent = `Failed to load YAML from ${filename}: ${message}`;
      };
    }
  } else if (filename === null) {
    console.error("loadYAML: No filename provided.");
  } else {
    console.error(`Invalid filename provided: "${filename}".`)
  }
  return [yamlData, section];
}

function getSection(filename: URL | string): string {
  const pathParts: string[] = String(filename).split("/")
  return pathParts[pathParts.length - 2]
}


function readYAMLparagraphs(paragraphs: ParagraphsList, container: HTMLElement, isTopLevel: boolean = false) {
  paragraphs.forEach(item => {
    const section = document.createElement("div");
    section.classList.add("paragraph-section");
    if (typeof item === "object") {
      if ("paragraph" in item && item.paragraph) {
        const heading = document.createElement(isTopLevel ? "h6" : "h6");
        heading.textContent = item.paragraph;

        section.appendChild(heading);
      }

      if ("details" in item && Array.isArray(item.details)) {
        const ul = document.createElement("ul");
        ul.classList.add("paragraph-details-list");

        item.details.forEach(detailText => {
          const li = document.createElement("li");
          li.textContent = detailText || "(detail)";
          li.classList.add("paragraph-detail");
          ul.appendChild(li);
        });

        section.appendChild(ul);
      }

      if ("subparagraphs" in item && Array.isArray(item.subparagraphs) && item.subparagraphs.length > 0) {
        const subContainer = document.createElement("div");
        subContainer.classList.add("subparagraphs-container");
        readYAMLparagraphs(item.subparagraphs, subContainer, false);
        section.appendChild(subContainer);
      }
    }
    container.appendChild(section);
  });
}

async function populateParagraphs(): Promise<[YamlData, string | null]> {
  const paragraphsContainer: HTMLElement | null = document.getElementById("paragraphsContent");
  let yamlData: YamlData = {}
  let section: string | null = null
  if (paragraphsContainer) {
    [yamlData, section] = await getData(paragraphsContainer);
    paragraphsContainer.innerHTML = "";
    if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
      readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
    }
  }
  return [yamlData, section];
}

function populateTitle(yamlData: YamlData, section: string | null = null): void {
  if (yamlData.meta && yamlData.meta.title) {
    const titleContainer: HTMLElement | null = document.getElementById("title");
    if (titleContainer) {
      let subtitle: string = "";
      if (section) {
        if (section.charAt(section.length -1) == "s") {
          subtitle = section.slice(0, -1);
        } else {
          subtitle = section;
        }
        if (subtitle.length) {
          subtitle = subtitle.charAt(0).toUpperCase() + subtitle.slice(1);
        }
        subtitle += ": ";
      }
      subtitle += yamlData.meta.title
      titleContainer.innerHTML = subtitle;
    }
  }
}


function toggleScrolled(): void {
  const b: HTMLBodyElement | null = document.querySelector("body");
  const h: Element | null = document.querySelector("#header");
  if (h && !h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top")) return;
  if (b) { 
    if (window.scrollY > 100) {
      b.classList.add("scrolled");
    } else {
      b.classList.remove("scrolled");
    };
  };
}

document.addEventListener("scroll", toggleScrolled);
window.addEventListener("load", toggleScrolled);

async function loadYAML(): Promise<void> {
  const [yamlData, section] = await populateParagraphs();
  populateHeader(section);
  populateTitle(yamlData, section);
}

function populateHeader(section: string | null) {
  const header = document.getElementById('header');
  if (header) {
    header.insertBefore(createHeaderNavDiv(section), header.firstChild);
  }
}

const customElementRegistry = window.customElements;
customElementRegistry.define("under-construction", UnderConstruction);

window.addEventListener("load", () => {
  toggleScrolled();
  loadYAML();
});