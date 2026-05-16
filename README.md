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

## Routine

1. Rooted Wuji
2. Lift the Sky
3. Open the Chest
4. Cloud Hands
5. Press and Receive
6. Gather and Close

Each movement tracks visible landmarks for hands, shoulders, hips, knees, and feet, then scores alignment and gives a live cue for the weakest posture metric.

## Guide video mode

Use **Load guide** to choose a local Qi Gong video file. The app shows the video in an inset, extracts a pose outline from the guide, and draws that outline over your camera feed. When a guide is loaded, alignment scoring compares your landmarks to the guide outline instead of the static routine targets.

Leave **Mirror guide** on when the instructor is facing the camera and you want to follow them like a mirror. Turn it off when the clip is filmed from behind or when left and right should match directly.

## Session replay

Use **Record** during practice to capture pose frames, guide-outline alignment, score, cues, and per-metric breakdowns. After recording, use the timeline to scrub low-score moments, play the skeleton replay, return to **Live**, or export the replay data as JSON.

The UI uses a dark Material-style surface system with Roboto and Google Material Symbols.
