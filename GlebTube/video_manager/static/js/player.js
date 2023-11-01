var player = new Plyr('#player', {
    autoplay: true
  });
  
player.on('ready', (event) => {
    setTimeout(() => {
    let startTime = store.get('plyr-time-audio-01'); 
        if (startTime > 0) player.seek(startTime);
}, 200);
});