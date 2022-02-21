let imgElement = document.getElementById('image');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function() {
  console.log("Start process") ;
    const nobg = document.getElementById('nobg');
    const mask = document.getElementById('mask');
    const img = document.getElementById('image');  
    //const mcolors = document.getElementById('swapcolors');
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
        bodyPix.drawMask(nobg, img, backgroundDarkeningMask, opacity, maskBlurAmount,  flipHorizontal);  
        bodyPix.drawMask(mask, img, backgroundDarkeningMask2, opacity, maskBlurAmount,  flipHorizontal);

        await resize_imgs();
        await delete_images();

    }

    async function resize_imgs(){
      
      let mask_mat = new cv.Mat(); let mask_mat1 = new cv.Mat(); let mask_mat2 = new cv.Mat();
      let frame = new cv.Mat(); let frame1 = new cv.Mat(); let frame2 = new cv.Mat(); let bg = new cv.Mat();
      let rotate = new cv.Mat();
      let rgbaPlanes = new cv.MatVector();
      let mergedPlanes = new cv.MatVector();

      const w =44; const h = 47;

      //let resized = new cv.Mat();
      let dsize = new cv.Size(w, h);
     

      let nobgimg =  cv.imread('nobg');
      let src = cv.imread('mask');
      let rectangular_image = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
      let cnt = contours.get(0);
      let rect = cv.boundingRect(cnt);
      frame = nobgimg.roi(rect);
      mask_mat = src.roi(rect);


      dsize = new cv.Size(w, h);
      cv.resize(mask_mat, mask_mat, dsize, 0, 0, cv.INTER_AREA);            
      cv.threshold(mask_mat, mask_mat, 20, 255, cv.THRESH_BINARY);
      cv.imshow('mask',mask_mat);
      cv.split(mask_mat, rgbaPlanes);
      let MASKU = rgbaPlanes.get(0);      
     

      for (let i = 0; i <  MASKU.rows; i++) {
        for (let j =0; j < 0 +MASKU.cols; j++) {
            {
                //MASKU.ucharPtr(i, j)[0] = MASKU.ucharPtr(i, j)[0]/255;
                MASKU.ucharPtr(i, j)[0] = MASKU.ucharPtr(i, j)[0]/255;
            }
    
        }
    }
    cv.imshow('mask',MASKU);
      cv.resize(frame, frame, dsize, 0, 0, cv.INTER_AREA);

      cv.split(frame, rgbaPlanes);
      let channel = rgbaPlanes.get(0);
      mergedPlanes.push_back(channel);
      channel = rgbaPlanes.get(1);
      mergedPlanes.push_back(channel);
      channel = rgbaPlanes.get(2);
      mergedPlanes.push_back(channel);
      //mergedPlanes.push_back(MASKU);


      cv.merge(mergedPlanes, frame);
      cv.imshow('rect',frame);

      dsize = new cv.Size(frame.rows, frame.cols);
      let center = new cv.Point(frame.cols / 2, frame.rows / 2);
      let M = cv.getRotationMatrix2D(center, -90, 1);
      cv.warpAffine(frame, rotate, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      dsize = new cv.Size(59,25);
      cv.resize(rotate, rotate, dsize, 0, 0, cv.INTER_AREA);
      //


      // Split the src
      mergedPlanes = new cv.MatVector();
      cv.split(frame, rgbaPlanes);
      // Get G channel
      channel = rgbaPlanes.get(0);
      mergedPlanes.push_back(channel);
      mergedPlanes.push_back(channel);
      mergedPlanes.push_back(channel);
      //mergedPlanes.push_back(MASKU);
      cv.merge(mergedPlanes, bg);
      cv.imshow('swapcolors', bg);


      
      dsize = new cv.Size(frame.cols, frame.rows);
      center = new cv.Point(frame.cols / 2, frame.rows / 2);
      M = cv.getRotationMatrix2D(center, -3, 1);
      cv.warpAffine(frame, frame1, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

      /*dsize = new cv.Size(w, h);
      cv.resize(dst, resized, dsize, 0, 0, cv.INTER_AREA);*/
      cv.imshow('rect1', frame1);

      //Warp mask1
      dsize = new cv.Size(mask_mat.cols, mask_mat.rows);
      center = new cv.Point(mask_mat.cols / 2, mask_mat.rows / 2);
      M = cv.getRotationMatrix2D(center, -3, 1);
      cv.warpAffine(mask_mat, mask_mat1, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      cv.imshow('mask1', mask_mat1);   

      //Warp mask2
      dsize = new cv.Size(mask_mat.cols, mask_mat.rows);
      center = new cv.Point(mask_mat.cols / 2, mask_mat.rows / 2);
      M = cv.getRotationMatrix2D(center, 3, 1);
      cv.warpAffine(mask_mat, mask_mat2, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      cv.imshow('mask2', mask_mat2);   
      
      M = cv.getRotationMatrix2D(center, 3, 1);
      dsize = new cv.Size(frame.cols, frame.rows);
      cv.warpAffine(frame, frame2, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      /*dsize = new cv.Size(w, h);
      cv.resize(dst, resized, dsize, 0, 0, cv.INTER_AREA);*/
      cv.imshow('rect2', frame2);


      let sprites = cv.imread(document.getElementById("nearsprites"));
      //ADD first image (left side)
      for (let i = 0; i <  frame.rows; i++) {
          for (let j =0; j < frame.cols; j++) {
                sprites.ucharPtr(i+2, j+40)[0] = frame.ucharPtr(i, j)[0];
                sprites.ucharPtr(i+2, j+40)[1] = frame.ucharPtr(i, j)[1];
                sprites.ucharPtr(i+2, j+40)[2] = frame.ucharPtr(i, j)[2];      
          }
      }

      //JUMPING SPRITE
      for (let i = 0; i <  frame.rows; i++) {
        for (let j =0; j < frame.cols; j++) {
              sprites.ucharPtr(i+2, j+848)[0] = frame.ucharPtr(i, j)[0];
              sprites.ucharPtr(i+2, j+848)[1] = frame.ucharPtr(i, j)[1];
              sprites.ucharPtr(i+2, j+848)[2] = frame.ucharPtr(i, j)[2];      
        }
      }

      //JUMPING SPRITE
      for (let i = 0; i <  bg.rows; i++) {
        for (let j =0; j < bg.cols; j++) {
              sprites.ucharPtr(i+2, j+848+ 44 )[0] = bg.ucharPtr(i, j)[0];
              sprites.ucharPtr(i+2, j+848+ 44 )[1] = bg.ucharPtr(i, j)[1];
              sprites.ucharPtr(i+2, j+848+ 44 )[2] = bg.ucharPtr(i, j)[2];      
        }
      }


      //running SPRITE1
      for (let i = 0; i <  frame1.rows; i++) {
        for (let j =0; j < frame1.cols; j++) {
              sprites.ucharPtr(i+2, j+848+ 88 )[0] = frame1.ucharPtr(i, j)[0];
              sprites.ucharPtr(i+2, j+848+ 88 )[1] = frame1.ucharPtr(i, j)[1];
              sprites.ucharPtr(i+2, j+848+ 88 )[2] = frame1.ucharPtr(i, j)[2];      
        }
      }


    //running SPRITE2
      for (let i = 0; i <  frame2.rows; i++) {
        for (let j =0; j < frame2.cols; j++) {
              sprites.ucharPtr(i+2, j+848+ 132 )[0] = frame2.ucharPtr(i, j)[0];
              sprites.ucharPtr(i+2, j+848+ 132 )[1] = frame2.ucharPtr(i, j)[1];
              sprites.ucharPtr(i+2, j+848+ 132 )[2] = frame2.ucharPtr(i, j)[2];      
        }
      }
    
    //lost sprite
    for (let i = 0; i <  bg.rows; i++) {
      for (let j =0; j < bg.cols; j++) {
            sprites.ucharPtr(i+2, j+848+ 176 )[0] = bg.ucharPtr(i, j)[0];
            sprites.ucharPtr(i+2, j+848+ 176 )[1] = bg.ucharPtr(i, j)[1];
            sprites.ucharPtr(i+2, j+848+ 176 )[2] = bg.ucharPtr(i, j)[2];      

            sprites.ucharPtr(i+2, j+848+ 220 )[0] = bg.ucharPtr(i, j)[0];
            sprites.ucharPtr(i+2, j+848+ 220 )[1] = bg.ucharPtr(i, j)[1];
            sprites.ucharPtr(i+2, j+848+ 220 )[2] = bg.ucharPtr(i, j)[2];  
      }
    }


    //rotate 
    for (let i = 0; i <  rotate.rows; i++) {
      for (let j =0; j < rotate.cols; j++) {
            sprites.ucharPtr(i+21, j+848+ 264 )[0] = rotate.ucharPtr(i, j)[0];
            sprites.ucharPtr(i+21, j+848+ 264 )[1] = rotate.ucharPtr(i, j)[1];
            sprites.ucharPtr(i+21, j+848+ 264 )[2] = rotate.ucharPtr(i, j)[2];      

            sprites.ucharPtr(i+21, j+848+ 264 +59)[0] = rotate.ucharPtr(i, j)[0];
            sprites.ucharPtr(i+21, j+848+ 264 +59)[1] = rotate.ucharPtr(i, j)[1];
            sprites.ucharPtr(i+21, j+848+ 264 +59)[2] = rotate.ucharPtr(i, j)[2];  
      }
    }



      cv.imshow("mask",sprites);


      M.delete();  rectangular_image.delete(); src.delete(); contours.delete(); hierarchy.delete(); cnt.delete();
    }

 

    async function delete_images(){

        nobg.width = 1; nobg.height = 1;
        img.src = "";
        //mask.width = 1; mask.height = 1;
        let i =document.getElementById("mask1"); i.width=1; i.height=1;
        i =document.getElementById("mask2"); i.width=1; i.height=1;

    /*let to_delete = document.getElementById("image");
        to_delete.parentElement.removeChild(to_delete);*/

    }
    execute();


};


