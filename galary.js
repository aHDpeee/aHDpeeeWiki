const cliderMain = new Swiper ('.slider_main', {
    freeMode: true,
    // centeredSlides: true,
    mousewheel: {
        // forceToAxis: true, // Ограничивает прокрутку только по одной оси
        sensitivity: 5, // Увеличь это значение для ускорения
    },
    parallax: true,
    breakpoints: {
        0: {
            slidesPerView: 2.5,
            spaceBetween: 20
        },
        680: {
            slidesPerView: 3.5,
            spaceBetween: 60
        }
    }
})

// Базовый URL для изображений
const baseUrl = "https://aHDpeee.github.io/aHDpeeeWiki/images/";
// URL для GitHub API (замените <username> и <repo> на свои)
const apiUrl = "https://api.github.com/repos/aHDpeee/aHDpeeeWiki/contents/images";

// Находим контейнер
const swiperWrapper = document.querySelector(".swiper-wrapper.swiper__wrapper");

async function populateSwiper() {
  try {
    // Получаем список файлов через GitHub API
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Ошибка при запросе к API");
    const files = await response.json();

    // Фильтруем только изображения
    const imageFiles = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file.name))
      .map((file) => file.name);

    // Наполняем контейнер слайдами
    imageFiles.forEach((fileName) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide slider__item";

      const imgDiv = document.createElement("div");
      imgDiv.className = "slider_img";
      imgDiv.setAttribute("data-swiper-parallax", "20%");
      imgDiv.style.backgroundImage = `url(${baseUrl}${fileName})`;

      slide.appendChild(imgDiv);
      swiperWrapper.appendChild(slide);
    });
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

// Запускаем функцию
populateSwiper();


document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slider_img");
  
    slides.forEach((slide) => {
      // Создаем временное изображение для проверки размеров
      const img = new Image();
      const bgImage = slide.style.backgroundImage.slice(5, -2); // Извлекаем URL из "url(...)"
      img.src = bgImage;
  
      img.onload = () => {
        const isVertical = img.height > img.width;
        if (isVertical) {
          slide.classList.add("vertical");
        }
      };
    });
  });