# NearRunner
Hackathon submission to [MetaBuild](https://metabuild.devpost.com/)

### Inspiration
I build on the [Brave challenge](https://metabuild.devpost.com/details/sponsor-challenges#h_68495059719631639493354543)  with the twist that we can play the game as the character.
## What it does
It uses [Tensorflow.js](https://www.tensorflow.org/js) on the backend to crop the human figure from an image removes the background and paste it on the game sprites, then you can play the game

Instead of jumping cactus and pterodactyls you have to avoid the ugly fiat currency running to you!
In the **Near** Future you will be able to have your character as an NFT :)

## How it's built

It takes the base from the [t-rex-runner](https://github.com/wayou/t-rex-runner) repo
and for the image processing  [body-pix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) (for the background removal)
[Opencv.js](https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html) for other image processing 
[Near wallet-example](https://github.com/near-examples/wallet-example) repo for the Near version of the game

## What's next for NearRunner
Issue the skins as NFTs
And make player able to earn $NearRunner coin 

## Instructions 
Download the repo and start a local server on it (python -m http.server) and visit localhost:8000 or appropriate address.

## Live version

[NearRunner(]https://elivasquezhdz.github.io/NearRunner/)


