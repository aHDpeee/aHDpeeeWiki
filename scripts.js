let swipeX, swipeY
let arrow
let pos = [0, 50, 0, -50]
let active = 2, blocks = ["day", "ideas-projects", "people", "content for discover"]
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
    for (let i =0; i<blocks.length; i++){
        style = document.getElementById(blocks[(active + i) % blocks.length]).style
        style.transform = `rotateY(${((i+2)%4-2)*90}deg)`
        style.left = `${pos[i]}%`
        style.opacity = opa[i]
        style.zIndex  = `${(i-3)*50}`
        console.log(i, style.zIndex, blocks[(active + i) % blocks.length])
    }
}

document.getElementById(blocks[active]).style.opacity = 1
for (let i =-2; i<2; i++){
    style = document.getElementById(blocks[(active + i) % blocks.length]).style
    style.left = `${pos[i+2]}%`
    style.transform = `rotateY(${90*i}deg)`

}