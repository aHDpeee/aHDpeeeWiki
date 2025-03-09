let swipeX, swipeY;
let arrow;
let pos = [0, 50, 0, -50], trX = [0, -1, -1, -2];
let active = 2, pages = ["people", "content for discover", "day", "ideas-projects"]
document.getElementById("swipe3d").addEventListener('touchstart', (e)=>{
    swipeX = e.touches[0].clientX
    swipeY = e.touches[0].clientY
})

document.getElementById("swipe3d").addEventListener('touchend', (e)=>{
    if(Math.abs(swipeX - e.changedTouches[0].clientX) > Math.abs(swipeY - e.changedTouches[0].clientY)){
        if(swipeX - e.changedTouches[0].clientX > 0){
            active = (active + 1) % 4
            updateActive(1)
        } else {
            active = (active + 3) % 4;
            updateActive(-1)
        }}
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        active = (active + 3) % 4;
        updateActive(1);
    } else if (e.key === 'ArrowRight') {
        active = (active + 1) % 4;
        updateActive(-1);
    }
})

function updateActive(direct){
    
    opa = [1, .2, 0, .2]
    for (let i =0; i<pages.length; i++){
        style = document.getElementById(pages[(active + i) % pages.length]).style
        style.transform = `rotateY(${((i+2)%4-2)*90}deg) translateX(${trX[i]*50}%)`
        style.left = `${pos[i]}%`
        style.opacity = opa[i]
        style.zIndex  = `${(i*-1)*50}`
        console.log(i, style.zIndex, pages[(active + i) % pages.length])
    }
}

document.getElementById(pages[active]).style.opacity = 1
for (let i =-2; i<2; i++){
    style = document.getElementById(pages[(active + i) % pages.length]).style
    style.left = `${pos[i+2]}%`
    style.transform = `rotateY(${90*i}deg)`

}
