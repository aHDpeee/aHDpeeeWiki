document.addEventListener("contextmenu", (e) => {
    console.log(window.getSelection().toString());
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
            child.onclick=sendMessage;
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

            
            //com.querySelector("#send").addEventListener("click", function(event) {
                //const nodemailer = require("nodemailer");
                //console.log(`${secrets.GMAIL}`)
            //});
        }
        
    }
});

document.addEventListener("mouseup", (e) => {
    e.preventDefault();
});

   async function sendMessage() {
      const text = document.querySelector("div#comment textarea").value; console.log(text); if(!text) return;
      const token = process.env.TOKEN; if (!token) return;
      const chat_id = process.env.chat_id; if (!chat_id) return; 

      const url = `https://api.telegram.org/bot${token}/sendMessage`;

      const data = {
        chat_id: chat_id,
        text: text
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.ok) {
          alert("Сообщение отправлено!");
        } else {
          alert("Ошибка: " + result.description);
        }
      } catch (error) {
        alert("Ошибка подключения: " + error.message);
      }

      document.getElementById("comment").remove();
    }