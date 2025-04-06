// delay.js - busy-wait for 5 seconds
let start = new Date().getTime();
while (new Date().getTime() < start + 2000) {
  // Busy wait for 5 seconds (5000 milliseconds)
}
output.delayComplete = true;