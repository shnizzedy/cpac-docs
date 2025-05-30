"use strict";
export function createHeaderNavDiv(selected = null) {
    const container = document.createElement("div");
    container.className = "container-fluid position-relative d-flex align-items-center justify-content-between";
    // Logo link
    const logoLink = document.createElement("a");
    logoLink.href = "../../index.html";
    logoLink.className = "logo d-flex align-items-center me-auto me-xl-0";
    const logoImg = document.createElement("img");
    logoImg.src = "../../assets/img/logo.png";
    logoImg.alt = "";
    logoLink.appendChild(logoImg);
    container.appendChild(logoLink);
    // Navigation menu
    const nav = document.createElement("nav");
    nav.id = "navmenu";
    nav.className = "navmenu";
    const ul = document.createElement("ul");
    const links = [
        { href: "../../index.html", text: "C-PAC", id: "index" },
        { href: "../about.html", text: "About", id: "about" },
        { href: "../neuroimaging.html", text: "Neuroimaging", id: "neuroimaging" },
        { href: "../pipelines.html", text: "Pipelines", id: "pipelines" },
        { href: "../use.html", text: "How to Use", id: "use" },
        { href: "../tutorials.html", text: "Tutorials", id: "tutorials" },
        { href: "../projects.html", text: "Projects", id: "projects" },
        { href: "../support.html", text: "User Support", id: "support" },
        { href: "../appendix.html", text: "Appendix", id: "appendix" }
    ];
    links.forEach(link => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.text;
        a.setAttribute("data-id", link.id);
        if (selected && link.id === selected) {
            a.classList.add("active");
        }
        li.appendChild(a);
        ul.appendChild(li);
    });
    nav.appendChild(ul);
    container.appendChild(nav);
    return container;
}
