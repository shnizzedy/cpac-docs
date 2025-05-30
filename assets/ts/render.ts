"use strict";
// Edit the TypeScript file, not the compiled JavaScript file.

import { createHeaderNavDiv } from './header.js';
import { AsyncElementCallback, ElementCallback, GridData, ParagraphsList, YamlData } from './types/types.js';


function titleCase(title: string): string {
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function formatPageTitle(title: string): string {
  const segments = title.match(/(\d+|\D+)/g) || [];
  return segments.map(segment => titleCase(segment)).join(" ")
}

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
  const data = jsyaml.load(yamlText);
  if (!("meta" in data)) {
    data.meta = {};
  }
  // set defaults
  ["subtitle", "displayTitle"].forEach(attribute => {
    if (!(attribute in data.meta)) {
      data.meta[attribute] = true;
    }
  });
  return data;
}

function constructUrl(dataId: string, ext: string = "yaml", supersection: string | null = null, subsection: string | null = null, inSection: boolean = true, assets: boolean = true): URL {
  let section: string = "assets"
  if (!supersection) {
    supersection = "content/pages";
  }
  section = assets ? [section, supersection].join("/") : supersection;
  if (inSection) {
    if (!subsection) {
      subsection = getSection(window.location.href);
    }
    section = [section, subsection].join("/");
  }
  const baseUrl = window.location.origin;
  const pathname = window.location.pathname.split("/");
  let project_slug = "";
  while (pathname && !project_slug) {
      project_slug = pathname.shift();
  }
  if (project_slug === "pages") {
      project_slug = "../..";
  } else {
    project_slug = `/${project_slug}`;
  }

  return new URL(`${project_slug}/${section}/${dataId}.${ext}`, baseUrl);
}

async function getData(container: HTMLElement, filename: URL | string | null = null): Promise<[YamlData, string | null]> {
  const dataId: string | null = container.getAttribute("data-id");
  let yamlData: YamlData = {};
  let section: string | null = null;
  if (dataId && !filename) {
    section = getSection(window.location.href);
    filename = constructUrl(dataId);
  }
  if (typeof filename === "string") {
    filename = new URL(filename);
  }
  if (filename instanceof URL) {
    try {
      yamlData = await loadData(filename);
    } catch (error: unknown) {
      console.error(`Error loading YAML from ${filename}:`, error);
      container = getOrCreateContainer("paragraphsContent", "div", container);
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
    console.error("loadYAML: No filename provided. \"data-id\" not found in `<main>` element.");
  } else {
    console.error(`Invalid filename provided: "${filename}".`)
  }
  return [yamlData, section];
}

function getSection(filename: URL | string): string {
  const pathParts: string[] = String(filename).split("/");
  const index: number = pathParts.indexOf("pages") + 1
  return index ? pathParts[index] : "";
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

function getOrCreateContainer(id: string, type: string, parent: HTMLElement | null = null, sibling: HTMLElement | null = null, attributes: object = {}): HTMLElement {
  // If parent and sibling both given, sibling takes precedence.
  let container = document.getElementById(id);
  let return_container = container;
  if (!container && !parent && !sibling) {
    throw new Error("could not find container and no tree information given.");
  }
  if (!container) {
    container = document.createElement(type);
    container.setAttribute("id", id);
    for (const key in attributes) {
      container.setAttribute(key, attributes[key]);
    }
    return_container = container;
    if (container.getAttribute("class") == "grid") {
      // Wrap grid in centered container div
      const grid_container = document.createElement("div");
      grid_container.setAttribute("class", "container");
      const center = document.createElement("center")
      grid_container.appendChild(center);
      center.appendChild(container);
      return_container = container;
      container = grid_container;
    }
    if (sibling) {
      sibling.after(container);
    } else {
      parent.appendChild(container);
    }
  }
  return return_container;
}

async function createGridCard(gridContainer: HTMLElement, cardData: GridData, index: number): Promise<HTMLElement> {
  const gridCard = document.createElement("div");
  gridCard.setAttribute("class", "grid-item");
  const anchor = document.createElement("a");
  anchor.setAttribute("href", `${constructUrl(cardData.page, "html", "pages", null, true, false)}`);
  gridCard.appendChild(anchor);
  const img = document.createElement("img");
  const pageData = await loadData(constructUrl(cardData.page));
  let title = cardData.page;
  if ("meta" in pageData && "title" in pageData.meta) {
    title = pageData.meta.title;
  } else {
    title = formatPageTitle(title);
  }
  anchor.setAttribute("data-label", title);
  img.setAttribute("alt", title);
  if ("image" in cardData) {
    img.setAttribute("src", `${cardData.image}`);
  } else {
    const imgUrl = constructUrl(`b${(index % 9) + 1}`, "png", "img", "tiles");
    img.setAttribute("src", `${imgUrl}`);
  }
  anchor.appendChild(img);
  return gridCard;
}

async function populateGrid(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): Promise<HTMLElement> {
  if ("grid" in yamlData && yamlData.grid) {
    const gridContainer: HTMLElement = getOrCreateContainer("index-grid", "div", parent, sibling, {"class": "grid"});
    for (const [index, cardData] of yamlData.grid.entries()) {
      const card = await createGridCard(gridContainer, cardData, index);
      gridContainer.appendChild(card);
    }
  }
  return parent;
}

function populateIframe(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  const iframeContainer: HTMLElement = getOrCreateContainer("iframeContent", "div", parent, sibling);
  if ("iframe" in yamlData && yamlData.iframe) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", `${yamlData.iframe}`);
    iframe.setAttribute("class", "full-view");
    iframeContainer.appendChild(iframe);
    return iframeContainer;
  }
  return parent;
}

function populateParagraphs(yamlData: YamlData, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  const paragraphsContainer: HTMLElement = getOrCreateContainer("paragraphsContent", "div", parent, sibling);
  if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
    paragraphsContainer.innerHTML = "";
    readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
    return paragraphsContainer;
  }
  return parent;
}

function populateTitle(yamlData: YamlData, section: string | null, parent: HTMLElement | null = null, sibling: HTMLElement | null = null): HTMLElement {
  if ("meta" in yamlData && yamlData.meta) {
    if (!yamlData.meta.displayTitle) {
      return parent || sibling;
    }
    let title = "";
    if ("title" in yamlData.meta && yamlData.meta.title) {
      title = yamlData.meta.title;
    } else {
      title = formatPageTitle(window.location.pathname.split("/").pop().split(".").shift());
    }
    const titleContainer = getOrCreateContainer("title", "div", parent, sibling, {"class": "title"});
    if (yamlData.meta.subtitle) {
      let subtitle: string = "";
      if (section) {
        if (section.charAt(section.length -1) == "s") {
          subtitle = section.slice(0, -1);
        } else {
          subtitle = section;
        }
        if (subtitle.length) {
          subtitle = titleCase(subtitle);
        }
        subtitle += ": ";
      }
      subtitle += title;
      titleContainer.innerHTML = subtitle;
    } else { titleContainer.innerHTML = title; }
    return titleContainer;
  }
  return parent || sibling;
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

async function asyncPopulate(container: HTMLElement, data: YamlData, latestElement: HTMLElement, fxn: AsyncElementCallback): Promise<HTMLElement> {
  if (latestElement === container) {
    return await fxn(data, latestElement);
  }
  return await fxn(data, container, latestElement);
}

function populate(container: HTMLElement, data: YamlData, latestElement: HTMLElement, fxn: ElementCallback): HTMLElement {
  if (latestElement === container) {
    return fxn(data, latestElement);
  }
  return fxn(data, container, latestElement);
}

async function populatePage(): Promise<void> {
  const container = document.getElementsByTagName("main")[0];  // first (hopefully only <main> element)
  const [yamlData, section] = await getData(container);
  let latestElement: HTMLElement = container;
  populateHeader(section);
  latestElement = populateTitle(yamlData, section, latestElement);
  latestElement = await asyncPopulate(container, yamlData, latestElement, populateGrid);
  populate(container, yamlData, latestElement, populateIframe);
  populate(container, yamlData, latestElement, populateParagraphs);
  await populateFooter(yamlData, container);
}

function populateHeader(section: string | null) {
  const header = document.getElementById("header");
  if (header) {
    header.insertBefore(createHeaderNavDiv(section), header.firstChild);
  }
}

async function populateFooter(yamlData: YamlData, container: HTMLElement): Promise<void> {
  let footer = document.getElementsByTagName("footer")[0];
  if (!footer) {
    footer = document.createElement("footer");
    container.after(footer);
  }
  footer.setAttribute("class", "footer");
  if ("meta" in yamlData && "copyright" in yamlData.meta) {
    footer.innerHTML = yamlData.meta.copyright;
  } else {
    const defaultData = await loadData(constructUrl("about", "yaml", null, "about"));
    footer.innerHTML = defaultData.meta.copyright;
  }
}

const customElementRegistry = window.customElements;
customElementRegistry.define("under-construction", UnderConstruction);

window.addEventListener("load", () => {
  toggleScrolled();
  populatePage();
});