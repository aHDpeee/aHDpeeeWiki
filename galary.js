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