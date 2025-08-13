var player = new Plyr('#player', {
    autoplay: true,
  
  });
  
  (function () {
    var video = document.querySelector('#player');
  
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(media_source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
    }
    
    plyr.setup(video);
  })();