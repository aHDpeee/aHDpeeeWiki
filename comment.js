document.addEventListener("contextmenu", (e) => {
    let selection = window.getSelection().toString();
    if (selection) {
        e.preventDefault();
        let com = document.createElement("div"); com.setAttribute("id", "comment");

        let child = document.createElement("p");
            child.innerHTML = selection;
            com.appendChild(child);
        child = document.createElement("textarea");
            com.appendChild(child);
        child = document.createElement("button");
            child.setAttribute("id", "send");
            child.textContent = "прокомментировать";
            com.appendChild(child);
        child = document.createElement("button");
            child.setAttribute("id", "cancel");
            child.textContent = "отмена"; com.appendChild(child);
        

        if (document.getElementById("comment")) {document.getElementById("comment").innerHTML = com.innerHTML;}
        else {
            document.body.appendChild(com);
            
            document.getElementById("cancel").addEventListener("click", () => {
                com.remove();
            });
            
            const textarea = com.getElementsByTagName("textarea")[0];
            const p = com.getElementsByTagName("p")[0];
            
            p.addEventListener('wheel', (event) => {
                if (event.deltaY !== 0) {  
                    event.preventDefault();
                    p.scrollLeft += event.deltaY;
                }
            });

            
            com.querySelector("#send").addEventListener("click", function(event) {
                const nodemailer = require("nodemailer");
                console.log(`${secrets.GMAIL}`)
            });
        }

        
    }
});

document.addEventListener("mouseup", (e) => {
    e.preventDefault();
});
