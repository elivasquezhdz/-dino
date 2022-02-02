async function start() {
    // Load the model.
    const tfliteModel = await tflite.loadTFLiteModel(
      "https://storage.googleapis.com/tfweb/models/cartoongan_fp16.tflite",
    );
  
    // Setup the trigger button.
    setupTrigger(tfliteModel);
  }
  
  async function cartoonize(tfliteModel) {
    // Prepare the input tensors from the image.
    const inputTensor = tf.image
      // Resize.
      .resizeBilinear(tf.browser.fromPixels(document.getElementById("nobg")), [
        224,
        224
      ])
      // Normalize.
      .expandDims()
      .div(127.5)
      .sub(1);
    
    // Run the inference and get the output tensors.
    const outputTensor = tfliteModel.predict(inputTensor);
    
    // Process and draw the result on the canvas.
    //
    // De-normalize.
    const data = outputTensor.add(1).mul(127.5);
    // Convert from RGB to RGBA, and create and return ImageData.
    const rgb = Array.from(data.dataSync());
    const rgba = [];
    for (let i = 0; i < rgb.length / 3; i++) {
      for (let c = 0; c < 3; c++) {
        rgba.push(rgb[i * 3 + c]);
      }
      rgba.push(255);
    }
    // Draw on canvas.
    const imageData = new ImageData(Uint8ClampedArray.from(rgba), 224, 224);
    const canvas = document.getElementById("cartoon");
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
    canvas.classList.remove("hide");
  }
  
  function setupTrigger(tfliteModel) {
    const trigger = document.querySelector(".trigger");
    trigger.textContent = "Cartoonize!";
    document.querySelector(".trigger").addEventListener("click", (e) => {
      trigger.textContent = "Processing...";
      setTimeout(() => {
        cartoonize(tfliteModel);
        trigger.classList.add("hide");
      });
    });
  }
  
  start();
  