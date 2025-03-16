class MarkdownRenderer {
    static md2html(text) {
        text = text.replace(/\[(?<link_title>.+?)\]\((?<link>.+?)\)/g, '<a href="$<link>">$<link_title></a>');
        text = text.replace(/\*\*(?<bold>.+?)\*\*/g, '<b>$<bold></b>');
        text = text.replace(/\*(?<italic>.+?)\*/g, '<i>$<italic></i>');
        text = text.replace(/`(?<code>.+?)`/g, '<code>$<code></code>');

        text = text.replace(/[-\+] \[\s*(x?)\s*\] (?<checkbox>(?:.|\n\t)+)/gi,
            (match, p1, p2) => {
                const checked = p1.toLowerCase() === 'x' ? 'checked' : '';
                return `<input type="checkbox" ${checked} disabled> ${p2}`;
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
        text = text.replace(/(?<=!)\[\[(?:.*\/)?([^\]]+)\]\]/g, `<span class="link_to_img"><b>$1</b></span>`);

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
    static instances = []; // Хранит все экземпляры для определения активного

    constructor(containerId, pages, baseUrl = 'https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/') {
        this.container = document.getElementById(containerId);
        if (!this.container) throw new Error(`Container with id ${containerId} not found`);
        
        this.pages = pages;
        this.baseUrl = baseUrl;
        this.pos = [0, 50, 0, -50];
        this.trX = [0, -1, 0, -2];
        this.opa = [1, 0.2, 0, 0.2];
        this.pointer = ["", "none", "none", "none"];
        this.zSpacing = -1000;
        
        this.swipeX = 0;
        this.swipeY = 0;
        this.active = 2;
        this.scrollValues = new Map();
        this.multyTouchDistance = null;
        this.activeTouches = 0;

        Swipe3D.instances.push(this); // Добавляем экземпляр в список
        this.init();
    }

    async init() {
        this.initEventListeners();
        this.initNoteBlocks();
        await this.loadContent();
        this.updateActive();
        this.initStyles();
    }

    async loadContent() {
        for (const element of this.pages) {
            try {
                const response = await fetch(`${this.baseUrl}${element}.md`);
                const text = await response.text();
                const pageId = this.container.querySelector('[id="' + element + '"]');
                if (!pageId) throw new Error(`Page element with id ${element} not found`);

                if (text.includes("---")) {
                    pageId.innerHTML = '<div id="faketext">...</div>' + MarkdownRenderer.md2html(text.trim());
                    const fake = pageId.querySelector("#faketext");
                    Array.from(pageId.children).forEach(child => {
                        if (child.offsetHeight > fake.offsetHeight) {
                            fake.innerHTML = child.innerHTML;
                        }
                    });
                } else {
                    MarkdownRenderer.typeWriterEffect(text.trim(), pageId);
                }
            } catch (error) {
                console.error(`Ошибка загрузки ${element}:`, error);
            }
        }
    }

    initEventListeners() {
        this.container.addEventListener("touchstart", (e) => {
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
            }
        });

        this.container.addEventListener("touchstart", e => {
            if (e.touches.length === 2) e.preventDefault();
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
                style.transform = `rotateY(${90 * i}deg)`;
            }else { console.log(pageId)}
        }
    }

    updateActive() {
        for (let i = 0; i < this.pages.length; i++) {
            const pageId = this.pages[(this.active + i) % this.pages.length];
            const style = this.container.querySelector(`[id="${pageId}"]`)?.style;
            if (style) {
                style.transform = `rotateY(${((i + 2) % 4 - 2) * 90}deg) translateX(${this.trX[i] * 50}%)`;
                style.left = `${this.pos[i]}%`;
                style.opacity = this.opa[i];
                style.zIndex = `${(i * -1) * 50}`;
                style.pointerEvents = this.pointer[i];
            }
        }
    }

    initNoteBlocks() {
        const noteblocks = Array.from(this.container.getElementsByClassName("noteblock"));
        noteblocks.forEach(block => {
            this.scrollValues.set(block, 0);

            block.addEventListener("wheel", (event) => {
                event.preventDefault();
                this.scrollValues.set(block, (this.scrollValues.get(block) || 0) + event.deltaY * 2.5);
                this.updateObjects(block);
            });

            block.addEventListener("touchstart", (event) => {
                if (event.touches.length === 2) {
                    event.preventDefault();
                    this.multyTouchDistance = this.getTouchDistance(event.touches);
                }
            });

            block.addEventListener("touchmove", (event) => {
                if (this.multyTouchDistance !== null && event.touches.length === 2) {
                    event.preventDefault();
                    const newDistance = this.getTouchDistance(event.touches);
                    this.scrollValues.set(block, (this.scrollValues.get(block) || 0) + 
                        (this.multyTouchDistance - newDistance) * 2.5);
                    this.multyTouchDistance = newDistance;
                    this.updateObjects(block);
                    this.activeTouches = 0;
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
            obj.style.opacity = z > this.zSpacing * 0.8 && z < this.zSpacing * -0.8 
                ? Math.abs(1 - z / (2 * this.zSpacing)) 
                : 0;
            obj.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
            
            let dist = Math.abs(z);
            if (dist < minDist) {
                minDist = dist;
                closestObj = obj;
            }
        });

        objects.forEach(obj => obj.style.pointerEvents = obj === closestObj ? "auto" : "none");
    }

    // Вычисление расстояния от центра слайдера до центра экрана
    getDistanceToScreenCenter() {
        const rect = this.container.getBoundingClientRect();
        const sliderCenter = rect.top + rect.height / 2;
        const screenCenter = window.innerHeight / 2;
        return Math.abs(sliderCenter - screenCenter);
    }
}

// Глобальный обработчик клавиш для выбора активного слайдера
document.addEventListener("keydown", (e) => {
    if (Swipe3D.instances.length === 0) return;

    // Находим слайдер, ближайший к центру экрана
    let closestSlider = Swipe3D.instances[0];
    let minDistance = closestSlider.getDistanceToScreenCenter();

    Swipe3D.instances.forEach(slider => {
        const distance = slider.getDistanceToScreenCenter();
        if (distance < minDistance) {
            minDistance = distance;
            closestSlider = slider;
        }
        
    });
    console.log(closestSlider.container.id);
    // Управляем только ближайшим слайдером
    if (e.key === "ArrowLeft") {
        closestSlider.active = (closestSlider.active + 3) % 4;
        closestSlider.updateActive();
    } else if (e.key === "ArrowRight") {
        closestSlider.active = (closestSlider.active + 1) % 4;
        closestSlider.updateActive();
    }
});

// Обновление активного слайдера при скролле и изменении размера окна
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
const pages1 = ["day", "people", "content for discover", "ideas-projects"];
const swipe1 = new Swipe3D("swipe3d1", pages1);

const pages2 = ["citates", "", "memorise", ""];
const swipe2 = new Swipe3D("perspective", pages1);