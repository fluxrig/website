/* 
 * Copyright (c) 2025 JAAB Tech SAS, Uruguay All Rights Reserved
 * See https://jaab.tech
 */

/* 
 * Copyright (c) 2025 JAAB Tech SAS, Uruguay All Rights Reserved
 * See https://jaab.tech
 */

(function () {
    function initZoom() {
        if (typeof document === 'undefined') return;

        // Target Docusaurus specific container
        const targets = document.querySelectorAll(".docusaurus-mermaid-container > svg, .mermaid > svg, .mermaid, .markdown img");
        console.log("FluxRig Zoom: Found targets", targets.length);

        // ... rest of init

        // Create Modal Elements (Singleton)
        let modal = document.querySelector(".mermaid-modal");
        let content, controls;

        if (!modal) {
            modal = document.createElement("div");
            modal.className = "mermaid-modal";
            document.body.appendChild(modal);

            content = document.createElement("div");
            content.className = "mermaid-modal-content";
            modal.appendChild(content);

            controls = document.createElement("div");
            controls.className = "mermaid-modal-controls";
            controls.innerHTML = `
                <button class="mermaid-modal-btn" id="zoom-out" title="Zoom Out">➖</button>
                <button class="mermaid-modal-btn" id="zoom-reset" title="Reset" style="width: auto; padding: 0 10px; font-size: 12px; font-weight: bold;">Reset</button>
                <button class="mermaid-modal-btn" id="zoom-in" title="Zoom In">➕</button>
                <button class="mermaid-modal-btn" id="modal-close" title="Close" style="color: #ff6b6b; margin-left: 10px;">✖</button>
            `;
            modal.appendChild(controls);

            // Event Listeners (One-time setup)
            setupModalListeners(modal, content);
        } else {
            content = modal.querySelector(".mermaid-modal-content");
        }

        // Processing Diagrams
        targets.forEach((diagram) => {
            if (diagram.closest('.mermaid-container')) return; // Already processed

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

                wrapper.addEventListener("click", function (e) {
                    e.preventDefault();
                    openModal(diagram, modal, content);
                });
            }
        });
    }

    // Modal Logic State
    let scale = 1, pointX = 0, pointY = 0, isPanning = false, startX = 0, startY = 0;

    function setTransform(content) {
        if (content) content.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    function resetZoom(content) {
        scale = 1; pointX = 0; pointY = 0;
        setTransform(content);
    }

    function openModal(original, modal, content) {
        const clone = original.cloneNode(true);
        
        // Handle SVG scaling - remove fixed widths/heights so CSS can take over
        const svg = clone.querySelector("svg") || (clone.tagName === 'svg' ? clone : null);
        if (svg) {
            const w = svg.getAttribute("width");
            const h = svg.getAttribute("height");
            
            svg.style.maxWidth = "none";
            svg.style.width = "100%";
            svg.style.height = "auto";
            svg.removeAttribute("width");
            svg.removeAttribute("height");
            
            // Ensure it has a viewBox if missing to allow scaling
            if (!svg.getAttribute("viewBox") && w && h) {
                svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
            }
        }

        // Handle regular images
        if (clone.tagName === 'IMG') {
            clone.style.width = "auto";
            clone.style.height = "auto";
            clone.style.maxWidth = "100%";
            clone.style.maxHeight = "100%";
        }

        content.innerHTML = "";
        content.appendChild(clone);
        modal.classList.add("active");
        resetZoom(content);
    }

    function setupModalListeners(modal, content) {
        document.getElementById("zoom-in").addEventListener("click", (e) => { e.stopPropagation(); scale *= 1.2; setTransform(content); });
        document.getElementById("zoom-out").addEventListener("click", (e) => { e.stopPropagation(); scale /= 1.2; setTransform(content); });
        document.getElementById("zoom-reset").addEventListener("click", (e) => { e.stopPropagation(); resetZoom(content); });
        document.getElementById("modal-close").addEventListener("click", (e) => { e.stopPropagation(); modal.classList.remove("active"); });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) modal.classList.remove("active");
        });

        // Pan/Zoom logic
        modal.addEventListener("wheel", (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -1 : 1;
            scale *= (1 + (delta * 0.1));
            setTransform(content);
        }, { passive: false });

        modal.addEventListener("mousedown", (e) => {
            if (e.target.closest(".mermaid-modal-controls")) return;
            isPanning = true;
            startX = e.clientX - pointX;
            startY = e.clientY - pointY;
            modal.style.cursor = "grabbing";
        });

        modal.addEventListener("mousemove", (e) => {
            if (!isPanning) return;
            e.preventDefault();
            pointX = e.clientX - startX;
            pointY = e.clientY - startY;
            setTransform(content);
        });

        modal.addEventListener("mouseup", () => {
            isPanning = false;
            modal.style.cursor = "grab";
        });
    }

    // Observer to handle SPA navigation
    const observer = new MutationObserver((mutations) => {
        initZoom();
    });

    if (typeof document !== 'undefined') {
        document.addEventListener("DOMContentLoaded", () => {
            initZoom();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
