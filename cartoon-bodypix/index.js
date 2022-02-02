const nobg = document.getElementById('nobg');
const img = document.getElementById('image');
//const tfliteModel =  tflite.loadTFLiteModel("https://storage.googleapis.com/tfweb/models/cartoongan_fp16.tflite",)

/*async function start() {
  // Load the model.
  const tfliteModel = await tflite.loadTFLiteModel(
    "https://storage.googleapis.com/tfweb/models/cartoongan_fp16.tflite",
  );

  // Setup the trigger button.
  cartoonize(tfliteModel);
}*/

async function execute() {
    const net = await bodyPix.load(/** optional arguments, see below **/);
    /**
     * One of (see documentation below):
     *   - net.segmentPerson
     *   - net.segmentPersonParts
     *   - net.segmentMultiPerson
     *   - net.segmentMultiPersonParts
     * See documentation below for details on each method.
     */
    const segmentation = await net.segmentPerson(img);
    const foregroundColor = {r: 0, g: 0, b: 0, a: 0};
    const backgroundColor = {r: 255, g: 255, b: 255, a: 255};
    const backgroundDarkeningMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
    const opacity = 1;
    const flipHorizontal = false;
    const maskBlurAmount = 2;
    bodyPix.drawMask(  nobg, img, backgroundDarkeningMask, opacity, maskBlurAmount,  flipHorizontal);  

  }

execute();
//start();

async function cartoonize(tfliteModel) {   const inputTensor = tf.image.resizeBilinear(tf.browser.fromPixels
    (document.getElementById("nobg")), [224,224])// Normalize.
      .expandDims()
      .div(127.5)
      .sub(1);
    
    const outputTensor = tfliteModel.predict(inputTensor);

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
    const canvas = document.querySelector("cartoon");
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  }

//cartoonize(tfliteModel);