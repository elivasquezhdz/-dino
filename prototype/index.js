const nobg = document.getElementById('nobg');
const mask = document.getElementById('mask');
const img = document.getElementById('image');
//const tfliteModel =  tflite.loadTFLiteModel("https://storage.googleapis.com/tfweb/models/cartoongan_fp16.tflite",)


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
    const backgroundColor = {r: 255, g: 255, b:255, a: 255};

    const foregroundColor2 = {r:255, g: 255, b: 255, a: 255};
    const backgroundColor2 = {r: 0, g: 0, b: 0, a: 255};

    const backgroundDarkeningMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);

    const backgroundDarkeningMask2 = bodyPix.toMask(segmentation, foregroundColor2, backgroundColor2);    
    const opacity = 1;
    const flipHorizontal = false;
    const maskBlurAmount = 2;
    bodyPix.drawMask(  nobg, img, backgroundDarkeningMask, opacity, maskBlurAmount,  flipHorizontal);  

    bodyPix.drawMask(mask, img, backgroundDarkeningMask2, opacity, maskBlurAmount,  flipHorizontal);

    await start();
    // await cartoonize(tfliteModel);
    i = document.getElementById("image");
    i.parentElement.removeChild(i);

    n = document.getElementById("nobg");
    n.parentElement.removeChild(n);
  }

  
execute();

async function start() {
  // Load the model.
  const tfliteModel = await tflite.loadTFLiteModel(
    "https://storage.googleapis.com/tfweb/models/cartoongan_fp16.tflite",
  );
  // Setup the trigger button.
  cartoonize(tfliteModel);

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
start();

let src = cv.imread('mask');
let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
let cnt = contours.get(0);
// You can try more different parameters
let rect = cv.boundingRect(cnt);
let contoursColor = new cv.Scalar(255, 255, 255);
let rectangleColor = new cv.Scalar(255, 0, 0);
cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
let point1 = new cv.Point(rect.x, rect.y);
let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
cv.imshow('rect', dst);
src.delete(); dst.delete(); contours.delete(); hierarchy.delete(); cnt.delete();
