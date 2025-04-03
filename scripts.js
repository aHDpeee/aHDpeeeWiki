class MarkdownRenderer {
    static md2html(text) {
        text = text.replace(/\[(?<link_title>.+?)\]\((?<link>.+?)\)/g, '<a href="$<link>">$<link_title></a>');
        text = text.replace(/\*\*(?<bold>.+?)\*\*/g, '<b>$<bold></b>');
        text = text.replace(/\*(?<italic>.+?)\*/g, '<i>$<italic></i>');
        text = text.replace(/`(?<code>.+?)`/g, '<code>$<code></code>');

        text = text.replace(/[-\+] \[\s*(x?|-?)\s*\] (?<checkbox>(?:.|\n\t)+)/gi,
            (match, p1, p2) => {
                const checked = p1.toLowerCase() === 'x' ? 'checked' : p1 === '-' ? 'class="canceled"':'';
                if (p1 === '-') {
                    p2 = `<s>${p2}</s>`
                }
                return `<input type="checkbox" ${checked} disabled/> ${p2}`;
            });

        const headers = text.match(/#+ .+/g);
        if (headers) {
            headers.forEach((header) => {
                const level = header.match(/#+/)[0].length;
                const title = header.match(/#+ (.+)/)[1];
                text = text.replace(header, `<h${level}>${title}</h${level}>`);
            });
        }

        text = text.replace(/(?<!!)\[\[(?:.*\|)?([^\]]+)\]\]/g, `<span class="link_to_note"><b>$1</b></span>`);
        text = text.replace(/(?<=!)\[\[(?:.*\/)?([^\]]+)\]\]/g, `<img class="link_to_img" alt="$1>`);

        if (text.includes('---')) text = '<div class="block">' + text.replaceAll('---', '</div><div class="block">') + '</div>';
        text = "<p>" + text.replaceAll(/\n/g, "</p><p>") + "</p>";
        text = text.replace(/<p>\s*<\/p>/g, "");
        return text;
    }

    static typeWriterEffect(text, element, speed = 10) {
        text = this.md2html(text);
        element.textContent = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                if (text[i] === '<') {
                    const tag = text.substring(i).match(/<[^>]+>/)[0];
                    element.innerHTML += tag;
                    i += tag.length;
                } else {
                    element.innerHTML = text.substring(0, i + 1);
                    i++;
                }
                setTimeout(type, speed);
            }
        }
        type();
    }
}

class Swipe3D {
    static instances = []; 

    constructor(containerId, pages, defaultTransform = ["","","",""], baseUrl = 'https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/') {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container with id ${containerId} not found`);
        
        this.pages = pages;
        this.baseUrl = baseUrl;
        this.pos = [0, 50, 0, -50];
        this.trX = [0, -1, 0, -2];
        this.opa = [1, 0, 0, 0];
        this.pointer = ["", "none", "none", "none"];
        this.defaultTransform = defaultTransform;
        
        this.swipeX = 0;
        this.swipeY = 0;
        this.active = 2;

        Swipe3D.instances.push(this); 
        this.init();
    }

    async init() {
        this.initEventListeners();
        this.updateActive();
        this.initStyles();
        this.updateActive();
    }

    

    initEventListeners() {
        this.container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) e.preventDefault();
            this.activeTouches += 1;
            this.swipeX = e.touches[0].clientX;
            this.swipeY = e.touches[0].clientY;
        });

        this.container.addEventListener("touchend", (e) => {
            if (this.activeTouches !== 1) {
                this.activeTouches = 0;
                return;
            }
            if (Math.abs(this.swipeX - e.changedTouches[0].clientX) > 
                Math.abs(this.swipeY - e.changedTouches[0].clientY)) {
                this.active = (this.swipeX - e.changedTouches[0].clientX > 0) 
                    ? (this.active + 1) % 4 
                    : (this.active + 3) % 4;
                this.updateActive();
            this.activeTouches = 0;
            }
        });
    }

    initStyles() {
        const activeElement = this.container.querySelector(`[id="${this.pages[this.active]}"]`);
        if (activeElement) activeElement.style.opacity = 1;
        
        for (let i = -2; i < 2; i++) {
            const pageId = this.pages[(this.active + i) % this.pages.length];
            const style = this.container.querySelector(`#${pageId}`)?.style;
            if (style) {
                
                style.left = `${this.pos[i + 2]}%`;
                style.transform = `${this.defaultTransform[i+2]} rotateY(${90 * i}deg)`;
            }
        }
    }

    updateActive() {
        for (let i = 0; i < this.pages.length; i++) {
            const pageId = this.pages[(this.active + i) % this.pages.length];
            const style = this.container.querySelector(`[id="${pageId}"]`)?.style;
            if (style) {
                style.transform = `rotateY(${((i + 2) % 4 - 2) * 90}deg) ${this.defaultTransform[i]}`;
                style.left = `${this.pos[i]}%`;
                style.opacity = this.opa[i]; //if (this.opa[i] === 0) {style.display = "none"} 
                style.zIndex = `${(i * -1) * 50}`;
                style.pointerEvents = this.pointer[i];
            }
        }
    }




    getDistanceToScreenCenter() {
        const rect = this.container.getBoundingClientRect();
        const sliderCenter = rect.top + rect.height / 2;
        const screenCenter = window.innerHeight / 2;
        return Math.abs(sliderCenter - screenCenter);
    }
}

class folders extends Swipe3D {
    constructor(containerId, pages, baseUrl = 'https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/') {
        super(containerId, pages);
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container with id ${containerId} not found`);
        
        this.pointer = ["", "none", "none", "none"];
        
        this.scrollValues = new Map();
        this.multyTouchDistance = null;
        this.activeTouches = 0;
        this.zSpacing = 1000;

        Swipe3D.instances.push(this); 
        this.init();
    }

    async init() {
        this.initEventListeners();
        this.initStyles();
        this.initNoteBlocks();
        this.updateActive();
        this.loadContent();
    }

    async loadContent() {
        for (const element of this.pages) {
            try {
                const response = await fetch(`${this.baseUrl}${element}.md`);
                const text = await response.text();
                const pageId = this.container.querySelector('[id="' + element + '"]');
                if (!pageId) throw new Error(`Git er ${this.baseUrl}${element}.md not found`);

                if (text.includes("---")) {
                    pageId.innerHTML = '<div id="faketext">...</div>' + MarkdownRenderer.md2html(text.trim());
                    const fake = pageId.querySelector("#faketext");
                    Array.from(pageId.children).forEach(child => {
                        if (child.offsetHeight > fake.offsetHeight) {
                            fake.innerHTML = child.innerHTML;
                        }
                    });
                    this.updateObjects(pageId);
                } else {
                    MarkdownRenderer.typeWriterEffect(text.trim(), pageId);
                }
            } catch (error) {
                //console.error(`Ошибка загрузки ${element}:`, error);
            }
        }
    }

    initEventListeners() {
        this.activeTouches = 0;
        
        this.container.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) e.preventDefault();
            this.activeTouches = e.touches.length;
            this.swipeX = e.touches[0].clientX;
            this.swipeY = e.touches[0].clientY;
        });

        this.container.addEventListener("touchmove", (e) => {
            if (this.activeTouches === 2 && e.touches.length === 2) {
                // Handle two-finger zoom/scroll for noteblocks
                const block = e.target.closest('.noteblock');
                if (block && this.multyTouchDistance !== null) {
                    const newDistance = this.getTouchDistance(e.touches);
                    this.scrollValues.set(block, (this.scrollValues.get(block) || 0) + 
                        (this.multyTouchDistance - newDistance) * 2.5);
                    this.multyTouchDistance = newDistance;
                    this.updateObjects(block);
                }
            }
        });

        this.container.addEventListener("touchend", (e) => {
            if (this.activeTouches === 1 && e.changedTouches.length === 1) {
                const deltaX = this.swipeX - e.changedTouches[0].clientX;
                const deltaY = this.swipeY - e.changedTouches[0].clientY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) { // Added threshold
                    this.active = (deltaX > 0) 
                        ? (this.active + 1) % 4 
                        : (this.active + 3) % 4;
                    this.updateActive();
                }
            }
            this.activeTouches = 0;
            this.multyTouchDistance = null;
        });
    }

    initNoteBlocks() {
        const noteblocks = Array.from(this.container.getElementsByClassName("noteblock"));
        noteblocks.forEach(block => {

            block.addEventListener("wheel", (event) => {
                event.preventDefault();
                this.scrollValues.set(block, (this.scrollValues.get(block) || 0) + event.deltaY * 4);
                this.updateObjects(block);
            });

            block.addEventListener("touchstart", (event) => {
                if (event.touches.length === 2) {
                    event.preventDefault();
                    this.multyTouchDistance = this.getTouchDistance(event.touches);
                }
            });
        });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateObjects(container) {
        const objects = container.querySelectorAll(".block");
        const scrollValue = this.scrollValues.get(container) || 0;
        let closestObj = null;
        let minDist = Infinity;
        objects.forEach((obj, index) => {
            const z = (index * this.zSpacing) - scrollValue;

            if (z < this.zSpacing * 0.8 && z > this.zSpacing * -0.8){
                obj.style.opacity = 1 - Math.abs(z / (this.zSpacing*0.666));
                obj.style.display = "block"
            }else{
                obj.style.opacity = 0;
                obj.style.display = "none"
            }
            obj.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
            
            let dist = Math.abs(z);
            if (dist < minDist) {
                minDist = dist;
                closestObj = obj;
            }

        });

        objects.forEach(obj => obj.style.pointerEvents = obj === closestObj ? "auto" : "none");
    }
}


document.addEventListener("keydown", (e) => {
    if (Swipe3D.instances.length === 0) return;

    let closestSlider = Swipe3D.instances[0];
    let minDistance = closestSlider.getDistanceToScreenCenter();

    Swipe3D.instances.forEach(slider => {
        const distance = slider.getDistanceToScreenCenter();
        if (distance < minDistance) {
            minDistance = distance;
            closestSlider = slider;
        }
        
    });
    
    if (e.key === "ArrowLeft") {
        closestSlider.active = (closestSlider.active + 3) % 4;
        closestSlider.updateActive();
    } else if (e.key === "ArrowRight") {
        closestSlider.active = (closestSlider.active + 1) % 4;
        closestSlider.updateActive();
    }
});


function updateActiveSlider() {
    if (Swipe3D.instances.length === 0) return;

    let closestSlider = Swipe3D.instances[0];
    let minDistance = closestSlider.getDistanceToScreenCenter();

    Swipe3D.instances.forEach(slider => {
        const distance = slider.getDistanceToScreenCenter();
        if (distance < minDistance) {
            minDistance = distance;
            closestSlider = slider;
        }
    });
}

document.getElementById("citates").addEventListener('click', async () => {
    const response = await fetch('https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/citates.md');
    const text = await response.text();
    const lines = text.split('\n---').filter(line => line.trim() !== '');
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    MarkdownRenderer.typeWriterEffect(randomLine.trim(), document.getElementById("citates"));
});

window.addEventListener("scroll", updateActiveSlider);
window.addEventListener("resize", updateActiveSlider);

// Пример использования
const pages1 = ["people", "content for discover", "day", "ideas-projects"];
const swipe1 = new folders("swipe3d1", pages1);


const pages2 = ["citates", "bottom1", "memories", "bottom2"];
deg = 60;
const defaultperspective = [`translateY(-25%)                rotateX(${deg}deg)`,
                            `translate3d(50%, -25%, 0)   rotateX(${deg}deg)`,
                            `translate3d(0, -25%, 0)         rotateX(-${deg}deg)`,
                            `translate3d(-50%, -25%, 0)  rotateX(${deg}deg)`]

                            
const swipe2 = new Swipe3D("perspective", pages2, defaultperspective);

const loading_divs = { memories: "memories" };

async function loadPages() {
    for (const [key, value] of Object.entries(loading_divs)) {
        auto_scroll(value)
        const response = await fetch(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/${value}.md`);
        const text = await response.text();
        const pageId = document.querySelector(`[id="${value}"]`);
        if (!pageId) throw new Error(`Git er ${this.baseUrl}${value}.md not found`);
        
        pageId.innerHTML = text.trim()
            
    }
}
loadPages()



async function auto_scroll(query) {
    query = document.querySelector(`[id="${query}"]`);

    let scrollInterval = null;

    var observer = new IntersectionObserver(function (entries) {
        let entry = entries[0];

        if (entry.isIntersecting) {

            scrollInterval = setInterval(() => {
                query.scrollTop += 1; 
                if (query.scrollTop + query.clientHeight >= query.scrollHeight) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                }
            }, 50);
        } else {
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
        }
    }, { threshold: [0] });

    observer.observe(query);
}
