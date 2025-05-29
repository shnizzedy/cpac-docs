"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Edit the TypeScript file, not the compiled JavaScript file.
import { createHeaderNavDiv } from './header.js';
class UnderConstruction extends HTMLElement {
    constructor() {
        super();
        this.setAttribute("role", "complementary");
        this.setAttribute("aria-label", "Page status notice");
        this.innerHTML = `<aside>This page is under construction. To suggest content-related edits, please open a <a href="https://github.com/FCP-INDI/cpac-docs/blob/main/CONTRIBUTING.md#writing-a-content-related-pr:~:text=Appendix-,Writing%20a%20Content%2DRelated%20PR,-To%20contribute%20content">content-related PR
      </a>.</aside>`;
    }
}
function loadData(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(filename);
        const yamlText = yield response.text();
        // @ts-expect-error: jsyaml imported from CDN
        return jsyaml.load(yamlText);
    });
}
function getData(container_1) {
    return __awaiter(this, arguments, void 0, function* (container, filename = null) {
        const dataId = container.getAttribute("data-id");
        let yamlData = {};
        let section = null;
        if (dataId && !filename) {
            section = getSection(window.location.href);
            const baseUrl = window.location.origin;
            filename = new URL(`../../assets/content/pages/${section}/${dataId}.yaml`, baseUrl);
        }
        if (typeof filename === "string") {
            filename = new URL(filename);
        }
        if (filename instanceof URL) {
            try {
                yamlData = yield loadData(filename);
            }
            catch (error) {
                console.error(`Error loading YAML from ${filename}:`, error);
                const container = document.getElementById("paragraphsContent");
                if (container) {
                    let message = "";
                    if (error instanceof Error) {
                        message = error.message;
                    }
                    else {
                        message = `${error}`;
                    }
                    container.textContent = `Failed to load YAML from ${filename}: ${message}`;
                }
                ;
            }
        }
        else if (filename === null) {
            console.error("loadYAML: No filename provided.");
        }
        else {
            console.error(`Invalid filename provided: "${filename}".`);
        }
        return [yamlData, section];
    });
}
function getSection(filename) {
    const pathParts = String(filename).split("/");
    return pathParts[pathParts.length - 2];
}
function readYAMLparagraphs(paragraphs, container, isTopLevel = false) {
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
function populateParagraphs() {
    return __awaiter(this, void 0, void 0, function* () {
        const paragraphsContainer = document.getElementById("paragraphsContent");
        let yamlData = {};
        let section = null;
        if (paragraphsContainer) {
            [yamlData, section] = yield getData(paragraphsContainer);
            paragraphsContainer.innerHTML = "";
            if (yamlData.paragraphs && Array.isArray(yamlData.paragraphs)) {
                readYAMLparagraphs(yamlData.paragraphs, paragraphsContainer, true);
            }
        }
        return [yamlData, section];
    });
}
function populateTitle(yamlData, section = null) {
    if (yamlData.meta && yamlData.meta.title) {
        const titleContainer = document.getElementById("title");
        if (titleContainer) {
            let subtitle = "";
            if (section) {
                if (section.charAt(section.length - 1) == "s") {
                    subtitle = section.slice(0, -1);
                }
                else {
                    subtitle = section;
                }
                if (subtitle.length) {
                    subtitle = subtitle.charAt(0).toUpperCase() + subtitle.slice(1);
                }
                subtitle += ": ";
            }
            subtitle += yamlData.meta.title;
            titleContainer.innerHTML = subtitle;
        }
    }
}
function toggleScrolled() {
    const b = document.querySelector("body");
    const h = document.querySelector("#header");
    if (h && !h.classList.contains("scroll-up-sticky") && !h.classList.contains("sticky-top") && !h.classList.contains("fixed-top"))
        return;
    if (b) {
        if (window.scrollY > 100) {
            b.classList.add("scrolled");
        }
        else {
            b.classList.remove("scrolled");
        }
        ;
    }
    ;
}
document.addEventListener("scroll", toggleScrolled);
window.addEventListener("load", toggleScrolled);
function loadYAML() {
    return __awaiter(this, void 0, void 0, function* () {
        const [yamlData, section] = yield populateParagraphs();
        populateHeader(section);
        populateTitle(yamlData, section);
    });
}
function populateHeader(section) {
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
