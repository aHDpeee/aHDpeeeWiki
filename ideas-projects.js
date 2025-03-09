
async function ideasprojects(){
    const response = await fetch(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/ideas-projects.md`);
    console.log(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/ideas-projects.md`);

    let text = await response.text();
    document.getElementById("ideas-projects").innerHTML = md2html(text);

    console.log(Array.from(document.getElementById("ideas-projects").getElementsByClassName("block")));
}

ideasprojects();


const container = document.getElementById('ideas-projects');
let scrollValue = 0;

// Отслеживаем событие колеса мыши
container.addEventListener('wheel', (event) => {
    event.preventDefault(); // Отключаем стандартный скролл
    scrollValue += event.deltaY * 1; // Регулируем скорость движения
    updateObjects(); // Обновляем позиции объектов
});

// Функция обновления позиций объектов
function updateObjects() {
    const objects = document.querySelectorAll('.block');
    objects.forEach((obj, index) => {
        const z = (index * -500) - scrollValue; // Рассчитываем Z-позицию
        obj.style.transform = `translate(-50%, -50%) translateZ(${z}px)`;
        obj.style.opacity = 1-(z+100)/1000; // Рассчитываем прозрачность
        if (z < 0) {
            obj.style.opacity = 0;
        }
    });
}