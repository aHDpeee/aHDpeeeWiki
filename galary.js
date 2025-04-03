for (let i = 1; i < 40; i++) {
    document.querySelector('.swiper-wrapper.swiper__wrapper').innerHTML += `
        <div class="swiper-slide slider__item">
            <div class="slider_img" data-swiper-parallax="20%" style="background-image: url(./images/${i}.jpg);"></div>
        </div>`;
}

const cliderMain = new Swiper('.slider_main', {
    freeMode: {
        enabled: true,
        sticky: false, // Отключает прилипание слайдов
        momentumRatio: false, // Уменьшает инерцию, делает движение более контролируемым
        momentumBounce: false // Отключает эффект отскока
    },
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: true
    },
    
    mousewheel: {
        sensitivity: 10,
    },
    parallax: true,
    lazy: true,
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
});