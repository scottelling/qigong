# Qi Gong Flow Mapper

A local browser app that uses the MacBook camera to map body landmarks against a guided Qi Gong routine.

## Run

```sh
python3 -m http.server 5173
```

Open `http://localhost:5173` on the Mac, or `http://10.0.0.11:5173` from another device on the same Wi-Fi while the server is bound to `0.0.0.0`.

The app asks for camera permission, loads MediaPipe Pose Landmarker from the CDN, and runs pose detection in the browser. Camera frames are not uploaded by this app.

## Deploy to Vercel

This is a static app. Push the repo to GitHub, import it into Vercel, and deploy from the project root with no build command and no output directory.

Vercel serves the app over HTTPS, which is required for camera access outside `localhost`. The included `vercel.json` adds a camera permission policy for this origin and disables microphone access.

If you connect a custom domain such as `name.scottelling.com`, the app will use the camera on the device that opens that domain. It cannot use the MacBook camera when viewed from an iPhone; browser camera access is always local to the viewing device.

## Camera troubleshooting

If the app says **HTTPS required**, you are opening the LAN preview from a phone, such as `http://10.0.0.11:5173`. Mobile Safari and Chrome block camera access on plain HTTP. Use the deployed Vercel HTTPS URL, or open `http://localhost:5173` on the Mac.

If the app says **Permission blocked**, allow camera access for the site in the browser and reload. On iPhone, check **Settings > Safari > Camera** and make sure it is not set to Deny.

If the app says **Camera busy**, close Zoom, FaceTime, Photo Booth, or other camera tabs, then try again.

## Routine

1. Rooted Wuji
2. Lift the Sky
3. Open the Chest
4. Cloud Hands
5. Press and Receive
6. Gather and Close

Each movement tracks visible landmarks for hands, shoulders, hips, knees, and feet, then scores alignment and gives a live cue for the weakest posture metric.

## Guide video mode

Use **Load guide** to choose a local Qi Gong video file. When a guide is loaded, **Follow** mode makes the guide video the main stage, draws a lavender target skeleton over the instructor, and maps your live movement as a green/orange/red skeleton over that target. A small camera preview remains visible so you can confirm the camera sees you.

Use **Target** when the guide video has multiple people. **Center** is the default and usually selects the main instructor. **Largest**, **Left**, and **Right** are available for clips where the instructor is framed differently.

Use **Recenter** when both your body and the instructor outline are visible but the mapped skeleton feels offset. Leave **Mirror guide** on when the instructor is facing the camera and you want to follow them like a mirror. Turn it off when the clip is filmed from behind or when left and right should match directly.

## Session replay

Use **Record** during practice to capture pose frames, guide-outline alignment, score, cues, and per-metric breakdowns. After recording, use the timeline to scrub low-score moments, play the skeleton replay, return to **Live**, or export the replay data as JSON.

The UI uses a dark Material-style surface system with Roboto and Google Material Symbols.
