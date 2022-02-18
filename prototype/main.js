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

        let resized = new cv.Mat();

        const w =44; const h = 47;
        let dsize = new cv.Size(w, h);
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

        let nobgimg =  cv.imread('nobg');
        let src = cv.imread('mask');
        let rectangular_image = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        let dst = new cv.Mat();resized = new cv.Mat();


        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(src, src, 177, 200, cv.THRESH_BINARY);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        let cnt = contours.get(0);
        let rect = cv.boundingRect(cnt);
        rectangular_image = nobgimg.roi(rect);
        mask_cut = src.roi(rect);

        dsize = new cv.Size(w, h);
        cv.resize(mask_cut, mask_cut, dsize, 0, 0, cv.INTER_AREA);            
        cv.imshow('mask',mask_cut);
        cv.resize(rectangular_image, resized, dsize, 0, 0, cv.INTER_AREA);
        cv.imshow('rect',resized);

        //Swap colors
        let rgbaPlanes = new cv.MatVector();
        let mergedPlanes = new cv.MatVector();
        // Split the src
        cv.split(resized, rgbaPlanes);
        // Get G channel
        let R = rgbaPlanes.get(0);

        let G = rgbaPlanes.get(1);
        // Get B channel
        let B = rgbaPlanes.get(2);
        // Merge G & B channels
        mergedPlanes.push_back(G);
        mergedPlanes.push_back(G);
        mergedPlanes.push_back(G);
        cv.merge(mergedPlanes, dst);
        cv.imshow('swapcolors', dst);


        
        dsize = new cv.Size(rectangular_image.cols, rectangular_image.rows);
        let center = new cv.Point(rectangular_image.cols / 2, rectangular_image.rows / 2);
        let M = cv.getRotationMatrix2D(center, -3, 1);
        cv.warpAffine(rectangular_image, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        dsize = new cv.Size(w, h);
        cv.resize(dst, resized, dsize, 0, 0, cv.INTER_AREA);
        cv.imshow('rect1', resized);

        //Warp mask1
        dsize = new cv.Size(mask_cut.cols, mask_cut.rows);
        center = new cv.Point(mask_cut.cols / 2, mask_cut.rows / 2);
        M = cv.getRotationMatrix2D(center, -3, 1);
        cv.warpAffine(mask_cut, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        cv.imshow('mask1', dst);   

        //Warp mask2
        dsize = new cv.Size(mask_cut.cols, mask_cut.rows);
        center = new cv.Point(mask_cut.cols / 2, mask_cut.rows / 2);
        M = cv.getRotationMatrix2D(center, 3, 1);
        cv.warpAffine(mask_cut, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        cv.imshow('mask2', dst);   
        
        M = cv.getRotationMatrix2D(center, 3, 1);
        dsize = new cv.Size(rectangular_image.cols, rectangular_image.rows);
        cv.warpAffine(rectangular_image, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
        dsize = new cv.Size(w, h);
        cv.resize(dst, resized, dsize, 0, 0, cv.INTER_AREA);
        cv.imshow('rect2', resized);


        M.delete(); dst.delete();  rectangular_image.delete(); src.delete(); contours.delete(); hierarchy.delete(); cnt.delete();
        await delete_images();
    }

    async function delete_images(){
    /*let to_delete = document.getElementById("image");
        to_delete.parentElement.removeChild(to_delete);*/

        /*to_delete = document.getElementById("nobg");
        to_delete.parentElement.removeChild(to_delete);    */


    }
    execute();


};


