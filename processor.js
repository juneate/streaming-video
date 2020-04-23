let processor = {
  started: false,

  timerCallback: function() {
    
    if (this.video.paused || this.video.ended || !this.started) {
      return;
    }
    this.computeFrame();
    let self = this;
    setTimeout(function () {
        self.timerCallback();
      }, 0);
  },

  doLoad: function() {
    this.video = document.getElementById("video");

    this.c1 = document.getElementById("c1");
    this.ctx1 = this.c1.getContext("2d");
    this.c2 = document.getElementById("c2");
    this.ctx2 = this.c2.getContext("2d");

    let self = this;
    

    this.colors = {r:65, g:210, b:230, range:140};
    
    const $r = document.getElementById('r')
    const $g = document.getElementById('g')
    const $b = document.getElementById('b')
    const $range = document.getElementById('range')

    $r.value = document.querySelector(`output[for="r"]`).value = this.colors.r
    $g.value = document.querySelector(`output[for="g"]`).value = this.colors.g
    $b.value = document.querySelector(`output[for="b"]`).value = this.colors.b
    $range.value = document.querySelector(`output[for="range"]`).value = this.colors.range
    
    const getTestingVars = ({currentTarget}) => {
      const val = parseInt(currentTarget.value)
      document.querySelector(`output[for="${currentTarget.id}"]`).value = val
      this.colors[currentTarget.id] = val
    }

    $r.addEventListener('input', getTestingVars)
    $g.addEventListener('input', getTestingVars)
    $b.addEventListener('input', getTestingVars)
    $range.addEventListener('input', getTestingVars)

    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
          //video.src = window.URL.createObjectURL(stream);

          self.video.srcObject = stream;
          console.log(self.video.videoWidth, self.video.videoHeight);
          // self.video.play();
          
          self.video.addEventListener("play", function() {
            self.width = self.video.videoWidth / 4;
            self.height = self.video.videoHeight / 4;        
            self.started = true;
            self.timerCallback();  
          }, false);

          self.video.addEventListener("canplay", function() {
            self.video.play();
          }, false);
      
          
      });
    }
  },

  computeFrame: function() {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
        let l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      let r = frame.data[i * 4 + 0];
      let g = frame.data[i * 4 + 1];
      let b = frame.data[i * 4 + 2];
      
      // if (g > 100 && r > 100 && b < 43)
      // 112, 104, 89
      // if (r < 112 && g < 104 && b < 89)
      //  frame.data[i * 4 + 3] = 0;

      // https://github.com/felipenmoura/js-chroma-key/blob/master/ck.js
      // https://felipenmoura.com/js-chroma-key/
      // const colors = [112, 104, 89];


      if (Math.abs(r - this.colors.r) < 250 - this.colors.range &&
          Math.abs(g - this.colors.g) < 250 - this.colors.range &&
          Math.abs(b - this.colors.b) < 250 - this.colors.range)
        frame.data[i * 4 + 3] = 0;
      
      // console.log(r, g, b);
      
    }
    this.ctx2.putImageData(frame, 0, 0);
    return;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  processor.doLoad();
});
