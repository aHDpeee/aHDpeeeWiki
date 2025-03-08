document.getElementById("citates").addEventListener('click', async () =>{
    const resopnse = await fetch('https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/citates.md');
    const text = await resopnse.text();
    const lines = text.split('\n---').filter(line => line.trim()!=='');
    const randomLine = lines[Math.floor(Math.random()*lines.length)];
    typeWriterEffect(randomLine.trim(), "citates");
});

blocks = ["day", "ideas-projects", "people", "content for discover"]
const reg = {
    "day": ["- \\[([ x])\\] (.+)", (match, p1, p2) => {
        const checked = p1 === 'x' ? 'checked' : '';
        return `<input type="checkbox" ${checked} disabled> ${p2}`;
    }],
    "ideas-projects": [
        "\\[\\[(?:[^\\]|]+\\|)?([^\\]]+)\\]\\]\\s*\\n(Темы:\\s*.+)",
        (match, p1, p2) => `${p1}\n<i>${p2}</i>`
    ],
    "people": ["", ""],
    "content for discover": ["", ""]
};

blocks.forEach(async (element) => {
    try {
        const response = await fetch(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/${element}.md`);
        console.log(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/${element}.md`);

        let text = await response.text();
        
        // Создаём корректное регулярное выражение (удаляя двойное экранирование)
        let pattern = new RegExp(reg[element][0], "gm");
        text = text.replace(pattern, reg[element][1]);

        typeWriterEffect(text.trim(), element);
    } catch (error) {
        console.error(`Ошибка загрузки ${element}:`, error);
    }
});



function typeWriterEffect(text, element, speed=50){
    const display = document.getElementById(element);
    display.textContent = '';
    text = "<p>"+text.replace(/\n/g, "</p><p>") +"</p>"
    let i = 0;
    function type(){
        if (i<text.length){
            display.innerHTML = text.substring(0, i+1);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}
