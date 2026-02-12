// =============================================
// STEP 1: Define your content sequence
// =============================================
const messages = [
  "pixel-art",
  "hi cedric!🧸",
  "this is the first website I made myself!🕺",
  "of course, with the help of the internet hehe",
  "so as practice, I coded this for you!🤓",
  "congrats on making it through the worst part of BMT :)",
  "these five days must have been tough🙃",
  "but I'm super duper proud of you",
  "and I hope you finally get the rest you deserve!!😴",
  "before you know it,",
  "thy dark days shall pass",
  "hahahahaa",
  "uh oh... what's happening!",
];

// =============================================
// STEP 2: Reference HTML elements
// =============================================
const animationContainer = document.querySelector('.animation-container');
const pixelArt = document.querySelector('.pixelart-to-css');
const typewriterText = document.querySelector('.typewriter-text');
const mainButton = document.getElementById('main-button');
const finalMessage = document.querySelector('.final-message');
const blackoutOverlay = document.querySelector('.blackout-overlay');

// =============================================
// STEP 3: Track current position
// =============================================
let currentIndex = 0;

// =============================================
// STEP 4: Typewriter effect function
// =============================================
function typeWriter(text, element, speed = 50) {
  element.textContent = '';
  element.classList.remove('typing-complete');
  let charIndex = 0;

  const typingInterval = setInterval(() => {
    if (charIndex < text.length) {
      element.textContent += text.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(typingInterval);
      element.classList.add('typing-complete');
    }
  }, speed);
}

// =============================================
// STEP 5: Show content based on index
// =============================================
function showContent(index) {
  if (index === 0) {
    pixelArt.style.display = 'block';
    typewriterText.classList.remove('active');
  } else {
    pixelArt.style.display = 'none';
    typewriterText.classList.add('active');
    typeWriter(messages[index], typewriterText, 50);
  }
}

// =============================================
// STEP 6: Initialize
// =============================================
showContent(0);

// =============================================
// STEP 7: Button click handler
// =============================================
mainButton.addEventListener('click', () => {
  currentIndex++;

  if (currentIndex < messages.length) {
    showContent(currentIndex);
  }

  if (currentIndex === messages.length - 1) {
    setTimeout(() => {
      mainButton.style.display = 'none';
      finalMessage.style.display = 'block';

      setTimeout(() => {
        blackoutOverlay.classList.add('active');

        setTimeout(() => {
          startPostBlackoutSequence();
        }, 1000);
      }, 1500);
    }, messages[currentIndex].length * 50 + 1000);
  }
});

// =============================================
// STEP 8: Blow Detection Functions
// =============================================
let audioContext = null;
let microphone = null;
let analyser = null;
let isBlowingActive = false;
let blowThreshold = 80; // Lower = more sensitive

async function initMicrophone() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    return true;
  } catch (error) {
    console.error('Microphone access denied:', error);
    alert('Please allow microphone access to blow out the candle!');
    return false;
  }
}

function detectBlow() {
  if (!analyser) return 0;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const average = sum / bufferLength;

  return average;
}

function startBlowDetection(onBlowSuccess) {
  isBlowingActive = true;
  const blowMeterFill = document.querySelector('.blow-meter-fill');
  let blowStrength = 0;

  function checkBlow() {
    if (!isBlowingActive) return;

    const volume = detectBlow();

    blowStrength = Math.min(volume * 2, 100);
    if (blowMeterFill) {
      blowMeterFill.style.width = blowStrength + '%';
    }

    if (volume > blowThreshold) {
      isBlowingActive = false;
      onBlowSuccess();
      return;
    }

    requestAnimationFrame(checkBlow);
  }

  checkBlow();
}

function stopBlowDetection() {
  isBlowingActive = false;
  if (microphone) {
    microphone.disconnect();
  }
  if (audioContext) {
    audioContext.close();
  }
}

// =============================================
// STEP 9: Post-Blackout Sequence
// =============================================
function startPostBlackoutSequence() {
  const sequence = [
    { id: 'sequence-1', duration: 2000 },
    { id: 'sequence-2', duration: 2000 },
    { id: 'sequence-3', duration: 3000 },
    { id: 'sequence-4', duration: null, requiresBlow: true }, // Candle - wait for blow
    { id: 'sequence-5', duration: 3000 }, // Extinguished candle
    { id: 'sequence-6', duration: 3000},
    { id: 'sequence-7', duration: 1000},
    { id: 'sequence-8', duration: 10000},
  ];

  let currentSequenceIndex = 0;

  function showNextSequenceItem() {
    // Hide all sequence items
    document.querySelectorAll('.sequence-item').forEach(item => {
      item.classList.remove('active');
    });

    // If we've reached the end, stop
    if (currentSequenceIndex >= sequence.length) {
      stopBlowDetection();
      return;
    }

    const currentItem = sequence[currentSequenceIndex];
    const element = document.getElementById(currentItem.id);

    if (element) {
      element.classList.add('active');

      // Check if this item requires blowing
      if (currentItem.requiresBlow) {
        initMicrophone().then(success => {
          if (success) {
            startBlowDetection(() => {
              // Success! Candle blown out
              element.classList.remove('active');
              currentSequenceIndex++;
              showNextSequenceItem();
            });
          } else {
            // Microphone failed, skip after 5 seconds
            setTimeout(() => {
              element.classList.remove('active');
              currentSequenceIndex++;
              showNextSequenceItem();
            }, 5000);
          }
        });
      } else {
        // Normal timed item
        setTimeout(() => {
          element.classList.remove('active');
          currentSequenceIndex++;
          showNextSequenceItem();
        }, currentItem.duration);
      }
    }
  }

  showNextSequenceItem();
}
