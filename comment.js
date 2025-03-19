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
            
            textarea.addEventListener('wheel', (event) => {
                console.log(event.deltaY);
                if (event.deltaY !== 0) { 
                    event.preventDefault(); 
                    textarea.scrollLeft += event.deltaY;
                }
            }, { passive: false });

            
            com.querySelector("#send").addEventListener("click", function(event) {
                event.preventDefault();
                const email = "andreyborisov08@yandex.ru";
                const name = "anonimous";    
                const message = `User comment: ${com.getElementsByTagName("p")[0].textContent}\n User's comment: ${textarea.value}`;

                fetch("/.netlify/functions/sendEmail", {
                method: "POST",
                body: JSON.stringify({ name, email, message }),
                headers: {
                    "Content-Type": "application/json",
                },
                })
                .then(response => response.text()) // Получаем ответ в виде текста
                .then(text => {
                    console.log("Ответ сервера:", text); // Логируем текст
                    return JSON.parse(text || '{}'); // Преобразуем в JSON (если пусто, то {})
                })

                .then(data => {
                alert("Email отправлен успешно!");
                })
                .catch(error => {
                console.error("Ошибка:", error);
                alert("Ошибка при отправке email.");
                });
            });
        }

        
    }
});

document.addEventListener("mouseup", (e) => {
    e.preventDefault();
});
