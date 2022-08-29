
const setupAudio = () => {
    const musicAudio = new Howl ({
        src: ["../assets/music.mp3"],
        autoplay:true,
        loop:true
    });
    musicAudio.play();
}
export default setupAudio