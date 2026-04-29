/* 
 * Copyright (c) 2025 JAAB Tech SAS, Uruguay All Rights Reserved
 * See https://jaab.tech
 */

document.addEventListener("DOMContentLoaded", function () {
    const diagrams = document.querySelectorAll(".mermaid");

    // Create Modal Elements
    const modal = document.createElement("div");
    modal.className = "mermaid-modal";

    // Content wrapper
    const content = document.createElement("div");
    content.className = "mermaid-modal-content";
    modal.appendChild(content);

    // Controls Toolbar
    const controls = document.createElement("div");
    controls.className = "mermaid-modal-controls";
    controls.innerHTML = `
        <button class="mermaid-modal-btn" id="zoom-out" title="Zoom Out">➖</button>
        <button class="mermaid-modal-btn" id="zoom-reset" title="Reset to 100%" style="width: auto; padding: 0 10px; font-size: 12px; font-weight: bold;">Original Size</button>
        <button class="mermaid-modal-btn" id="zoom-in" title="Zoom In">➕</button>
        <button class="mermaid-modal-btn" id="modal-close" title="Close" style="color: #ff6b6b; margin-left: 10px;">✖</button>
    `;
    modal.appendChild(controls);
    document.body.appendChild(modal);

    // State Variables
    let scale = 1;
    let pointX = 0;
    let pointY = 0;
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    function setTransform() {
        content.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    function resetZoom() {
        scale = 1;
        pointX = 0;
        pointY = 0;
        setTransform();
    }

    function closeModal() {
        modal.classList.remove("active");
        setTimeout(() => {
            content.innerHTML = "";
        }, 300);
    }

    // --- SANITIZATION FUNCTION ---
    // Removes 'mermaid' class and inline styles to force a clean slate for the modal
    function sanitizeForModal(node) {
        if (node.classList && node.classList.contains("mermaid")) {
            node.classList.remove("mermaid");
            node.classList.add("modal-diagram"); // Add safe class
        }
        if (node.hasAttribute && node.hasAttribute("style")) {
            node.removeAttribute("style");
        }
        // Recursive Clean
        if (node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(child => sanitizeForModal(child));
        }
    }

    // Diagram Wrapping
    diagrams.forEach((diagram) => {
        // We do NOT set styles here anymore, handled by CSS on .mermaid-container

        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-container";

        if (diagram.parentNode) {
            diagram.parentNode.insertBefore(wrapper, diagram);
            wrapper.appendChild(diagram);

            const btn = document.createElement("button");
            btn.className = "mermaid-zoom-btn";
            btn.innerHTML = '<span>🔍</span>';
            btn.title = "Zoom Image";
            wrapper.appendChild(btn);

            // Open Modal handler
            wrapper.addEventListener("click", function (e) {
                e.preventDefault();

                // 1. Deep Clone
                const clone = diagram.cloneNode(true);

                // 2. Preserve Styles but Unbound Width
                // We do NOT remove the 'mermaid' class, so standard styles apply.
                // We do NOT remove inline styles generally, as they contain colors.
                // We ONLY reset formatting constraints.

                const svg = clone.querySelector("svg") || clone;
                if (svg.tagName === "svg") {
                    svg.style.maxWidth = "none";
                    svg.style.width = "100%";
                    svg.style.height = "100%";
                    // Remove fixed height if set by mermaid
                    svg.removeAttribute("height");
                }

                // 3. Inject
                content.innerHTML = "";
                content.appendChild(clone);

                modal.classList.add("active");
                resetZoom();
            });
        }
    });

    // --- CONTROLS Handlers ---
    document.getElementById("zoom-in").addEventListener("click", (e) => {
        e.stopPropagation();
        scale *= 1.2;
        setTransform();
    });

    document.getElementById("zoom-out").addEventListener("click", (e) => {
        e.stopPropagation();
        scale /= 1.2;
        setTransform();
    });

    document.getElementById("zoom-reset").addEventListener("click", (e) => {
        e.stopPropagation();
        resetZoom();
    });

    document.getElementById("modal-close").addEventListener("click", (e) => {
        e.stopPropagation();
        closeModal();
    });

    // --- KEYBOARD (ESCAPE) ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    // --- MOUSE WHEEL ZOOM ---
    modal.addEventListener("wheel", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? -1 : 1;
        const factor = 1 + (delta * 0.1);

        scale *= factor;
        if (scale < 0.1) scale = 0.1;
        if (scale > 10) scale = 10;

        setTransform();
    }, { passive: false });

    // --- PANNING ---
    modal.addEventListener("mousedown", function (e) {
        if (e.target.closest(".mermaid-modal-controls")) return;
        isPanning = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        modal.style.cursor = "grabbing";
    });

    modal.addEventListener("mousemove", function (e) {
        if (!isPanning) return;
        e.preventDefault();
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        setTransform();
    });

    modal.addEventListener("mouseup", function () {
        isPanning = false;
        modal.style.cursor = "grab";
    });
});
