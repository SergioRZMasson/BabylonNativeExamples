/// <reference path="../../node_modules/babylonjs/babylon.module.d.ts" />
/// <reference path="../../node_modules/babylonjs-loaders/babylonjs.loaders.module.d.ts" />

let engine = null;
let scene = null;
let outputTexture = null;
let rootMesh = null;

/**
 * Sets up the engine, scene, and output texture.
 */
function startup(nativeTexture, width, height) {
    // Create a new native engine.
    engine = new BABYLON.NativeEngine();

    // Create a scene with a white background.
    scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.White();

    // Create an environment so that reflections look good.
    scene.createDefaultEnvironment({ createSkybox: false, createGround: false });

    // Wrap the input native texture in a render target texture for the output
    // render target of the camera used in `loadAndRenderAssetAsync` below.
    outputTexture = new BABYLON.RenderTargetTexture(
        "outputTexture",
        {
            width: width,
            height: height
        },
        scene,
        {
            colorAttachment: engine.wrapNativeTexture(nativeTexture),
            generateDepthBuffer: true,
            generateStencilBuffer: true
        }
    );
}

/**
 * Loads and renders an asset given its URL.
 */
async function loadAndRenderAssetAsync(url) {
    // Dispose the previous asset if present.
    if (rootMesh) {
        rootMesh.dispose();
    }

    // Load the asset from the input URL.
    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, url, undefined, scene);
    rootMesh = result.meshes[0];

    // Create a default camera that looks at the asset from a specific angle
    // and outputs to the render target created in `startup` above.
    scene.createDefaultCamera(true, true);
    scene.activeCamera.alpha = 2;
    scene.activeCamera.beta = 1.25;
    scene.activeCamera.outputRenderTarget = outputTexture;

    // Wait until the scene is ready before rendering the frame.
    await scene.whenReadyAsync();

    // Render one frame.
    scene.render();
}
