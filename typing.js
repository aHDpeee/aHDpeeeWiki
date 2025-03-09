document.getElementById("citates").addEventListener('click', async () =>{
    const resopnse = await fetch('https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/citates.md');
    const text = await resopnse.text();
    const lines = text.split('\n---').filter(line => line.trim()!=='');
    const randomLine = lines[Math.floor(Math.random()*lines.length)];
    typeWriterEffect(randomLine.trim(), "citates");
});

pages = ["day", "people", "content for discover"]
const reg = {
    "day": ["- \\[([ x])\\] (.+)", (match, p1, p2) => {
        const checked = p1 === 'x' ? 'checked' : '';
        return `<input type="checkbox" ${checked} disabled> ${p2}`;
    }],
    "ideas-projects": [
        "\\[\\[(?:[^\\]|]+\\|)? \\]\\]\\s*\\n(Темы:\\s*.+)",
        (match, p1, p2) => `${p1}\n<i>${p2}</i>`
    ],
    "people": ["", ""],
    "content for discover": ["", ""]
};

pages.forEach(async (element) => {
    try {
        const response = await fetch(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/${element}.md`);
        console.log(`https://aHDpeee.github.io/aHDpeeeWiki/RepoSyncFolder/${element}.md`);

        let text = await response.text();
    

        typeWriterEffect(text.trim(), element);
    } catch (error) {
        console.error(`Ошибка загрузки ${element}:`, error);
    }
});



function typeWriterEffect(text, element, speed=10){
    const display = document.getElementById(element);
    text = md2html(text);
    display.textContent = '';
    let i = 0;
    function type(){
        if (i<text.length){
            if (text[i] === '<'){
                const tag = text.substring(i).match(/<[^>]+>/)[0];
                display.innerHTML += tag;
                i += tag.length;
            }
            display.innerHTML = text.substring(0, i+1);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}


function md2html(text) {
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
            const titleMatch = header.match(/#+ (.+)/);
            if (titleMatch) {
                const title = titleMatch[1];
                text = text.replace(header, `<h${level}>${title}</h${level}>`);
            }
        });
    }

    text = text.replace(/(?<!!)\[\[(?:.*\|)?([^\]]+)\]\]/g, `<span class="link_to_note"><b>$1</b></span>`);
    text = text.replace(/(?<=!)\[\[(?:.*\/)?([^\]]+)\]\]/g, `<span class="link_to_img"><b>$1</b></span>`);

    if (text.includes('---')) text = '<div class="block">' + text.replaceAll('---', '</div><div class="block">') + '</div>';
    text = "<p>" + text.replaceAll(/\n/g, "</p><p>") + "</p>";
    text = text.replace(/<p>\s*<\/p>/g, "");

    console.log(text);
    return text; 
}

