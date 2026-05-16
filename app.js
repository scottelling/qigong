const TASKS_VERSION = "0.10.14";
const TASKS_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const ICONS = {
  activity: "monitor_heart",
  cpu: "memory",
  "file-video": "video_file",
  pause: "pause",
  play: "play_arrow",
  "video-off": "videocam_off",
  video: "videocam"
};

const LANDMARK = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28
};

const CONNECTORS = [
  [LANDMARK.leftShoulder, LANDMARK.rightShoulder],
  [LANDMARK.leftShoulder, LANDMARK.leftElbow],
  [LANDMARK.leftElbow, LANDMARK.leftWrist],
  [LANDMARK.rightShoulder, LANDMARK.rightElbow],
  [LANDMARK.rightElbow, LANDMARK.rightWrist],
  [LANDMARK.leftShoulder, LANDMARK.leftHip],
  [LANDMARK.rightShoulder, LANDMARK.rightHip],
  [LANDMARK.leftHip, LANDMARK.rightHip],
  [LANDMARK.leftHip, LANDMARK.leftKnee],
  [LANDMARK.leftKnee, LANDMARK.leftAnkle],
  [LANDMARK.rightHip, LANDMARK.rightKnee],
  [LANDMARK.rightKnee, LANDMARK.rightAnkle]
];

const OVERLAY_LANDMARKS = [
  LANDMARK.leftShoulder,
  LANDMARK.rightShoulder,
  LANDMARK.leftElbow,
  LANDMARK.rightElbow,
  LANDMARK.leftWrist,
  LANDMARK.rightWrist,
  LANDMARK.leftHip,
  LANDMARK.rightHip,
  LANDMARK.leftKnee,
  LANDMARK.rightKnee,
  LANDMARK.leftAnkle,
  LANDMARK.rightAnkle
];

const OVERLAY_COLOR = {
  teacher: "#dabee8",
  teacherJoint: "#f4bf72",
  you: "#6ee7ff",
  youSoft: "rgba(110, 231, 255, 0.46)",
  youGhost: "rgba(110, 231, 255, 0.18)",
  good: "#9bd9b1",
  warn: "#f4bf72",
  error: "#ff8a80"
};

const COUNTERPART = {
  [LANDMARK.leftShoulder]: LANDMARK.rightShoulder,
  [LANDMARK.rightShoulder]: LANDMARK.leftShoulder,
  [LANDMARK.leftElbow]: LANDMARK.rightElbow,
  [LANDMARK.rightElbow]: LANDMARK.leftElbow,
  [LANDMARK.leftWrist]: LANDMARK.rightWrist,
  [LANDMARK.rightWrist]: LANDMARK.leftWrist,
  [LANDMARK.leftHip]: LANDMARK.rightHip,
  [LANDMARK.rightHip]: LANDMARK.leftHip,
  [LANDMARK.leftKnee]: LANDMARK.rightKnee,
  [LANDMARK.rightKnee]: LANDMARK.leftKnee,
  [LANDMARK.leftAnkle]: LANDMARK.rightAnkle,
  [LANDMARK.rightAnkle]: LANDMARK.leftAnkle
};

const routine = [
  {
    id: "root",
    title: "Rooted Wuji",
    seconds: 35,
    breath: "Inhale gently, exhale down through the feet.",
    movement: "Feet grounded, spine tall, hands heavy beside the hips.",
    evaluate: scoreRoot
  },
  {
    id: "lift",
    title: "Lift the Sky",
    seconds: 38,
    breath: "Inhale as the arms rise, soften the ribs.",
    movement: "Wrists float above the shoulders with relaxed elbows.",
    evaluate: scoreLift
  },
  {
    id: "open",
    title: "Open the Chest",
    seconds: 34,
    breath: "Exhale as the arms widen, keep the shoulders quiet.",
    movement: "Hands open out at chest height without locking the elbows.",
    evaluate: scoreOpen
  },
  {
    id: "cloud",
    title: "Cloud Hands",
    seconds: 48,
    breath: "Breathe evenly while the hands drift side to side.",
    movement: "One hand floats high, one hand low, both moving smoothly.",
    evaluate: scoreCloud
  },
  {
    id: "press",
    title: "Press and Receive",
    seconds: 36,
    breath: "Exhale into the press, inhale as the elbows soften.",
    movement: "Palms gather near the sternum with rounded arms.",
    evaluate: scorePress
  },
  {
    id: "gather",
    title: "Gather and Close",
    seconds: 35,
    breath: "Let the breath settle into the lower belly.",
    movement: "Hands descend toward the lower abdomen, body still and easy.",
    evaluate: scoreGather
  }
];

const els = {
  video: document.getElementById("cameraVideo"),
  guideVideo: document.getElementById("guideVideo"),
  canvas: document.getElementById("poseCanvas"),
  videoFrame: document.getElementById("videoFrame"),
  studioPanel: document.querySelector(".studio-panel"),
  guidePanel: document.getElementById("guidePanel"),
  emptyState: document.getElementById("emptyState"),
  enableCamera: document.getElementById("enableCameraButton"),
  stopCamera: document.getElementById("stopCameraButton"),
  cameraSelect: document.getElementById("cameraSelect"),
  viewModeInputs: document.querySelectorAll('input[name="viewMode"]'),
  guideFit: document.getElementById("guideFitSelect"),
  guideTarget: document.getElementById("guideTargetSelect"),
  overlayMode: document.getElementById("overlayModeSelect"),
  guideZoom: document.getElementById("guideZoomRange"),
  overlayOpacity: document.getElementById("overlayOpacityRange"),
  calibrateOverlay: document.getElementById("calibrateOverlayButton"),
  mirrorToggle: document.getElementById("mirrorToggle"),
  guideMirrorToggle: document.getElementById("guideMirrorToggle"),
  guideVideoInput: document.getElementById("guideVideoInput"),
  loadGuide: document.getElementById("loadGuideButton"),
  clearGuide: document.getElementById("clearGuideButton"),
  cameraStatus: document.getElementById("cameraStatus"),
  modelStatus: document.getElementById("modelStatus"),
  poseStatus: document.getElementById("poseStatus"),
  scoreBadge: document.querySelector(".score-badge"),
  scoreValue: document.getElementById("scoreValue"),
  followStatus: document.getElementById("followStatus"),
  stepCount: document.getElementById("stepCount"),
  stepTitle: document.getElementById("stepTitle"),
  timerRing: document.getElementById("timerRing"),
  timerText: document.getElementById("timerText"),
  breathCue: document.getElementById("breathCue"),
  movementCue: document.getElementById("movementCue"),
  liveCue: document.getElementById("liveCue"),
  metricStack: document.getElementById("metricStack"),
  startPause: document.getElementById("startPauseButton"),
  prevStep: document.getElementById("prevStepButton"),
  nextStep: document.getElementById("nextStepButton"),
  reset: document.getElementById("resetButton"),
  sessionScore: document.getElementById("sessionScore"),
  flowScore: document.getElementById("flowScore"),
  timePracticed: document.getElementById("timePracticed"),
  record: document.getElementById("recordButton"),
  replayPlay: document.getElementById("replayPlayButton"),
  liveMode: document.getElementById("liveModeButton"),
  exportReplay: document.getElementById("exportReplayButton"),
  clearReplay: document.getElementById("clearReplayButton"),
  replayTimeline: document.getElementById("replayTimeline"),
  replayMarkers: document.getElementById("replayMarkers"),
  replayCurrentTime: document.getElementById("replayCurrentTime"),
  replayDuration: document.getElementById("replayDuration"),
  replaySamples: document.getElementById("replaySamples"),
  replayLowCount: document.getElementById("replayLowCount"),
  replayBestScore: document.getElementById("replayBestScore"),
  replayFocus: document.getElementById("replayFocus"),
  replayCue: document.getElementById("replayCue"),
  replayIssues: document.getElementById("replayIssues"),
  sequenceStrip: document.getElementById("sequenceStrip")
};

const ctx = els.canvas.getContext("2d");

const state = {
  poseLandmarker: null,
  guideLandmarker: null,
  visionPromise: null,
  modelPromise: null,
  guideModelPromise: null,
  stream: null,
  cameraActive: false,
  guideActive: false,
  guideObjectUrl: "",
  guideMirror: true,
  viewMode: "camera",
  guideFit: "contain",
  guideTarget: "center",
  overlayMode: "targets",
  guideZoom: 1,
  overlayOpacity: 0.85,
  overlayOffset: { x: 0, y: 0 },
  overlayCalibrated: false,
  running: false,
  mirror: true,
  selectedDeviceId: "",
  stepIndex: 0,
  stepElapsed: 0,
  practicedSeconds: 0,
  lastClock: 0,
  lastVideoTime: -1,
  guideLastVideoTime: -1,
  guidePoseCount: 0,
  guidePoseIndex: -1,
  guidePoseQuality: 0,
  animationId: 0,
  lastLandmarks: null,
  guideLandmarks: null,
  overlayLandmarks: null,
  lastResult: noPoseResult("Enable the camera to begin mapping posture."),
  smoothScore: 0,
  poseConfidence: 0,
  stepScores: routine.map(() => []),
  allScores: [],
  lastScoreSample: 0,
  wristTrail: [],
  previousHandCenter: null,
  flow: 0,
  recording: false,
  recordingStart: 0,
  lastReplayCapture: 0,
  replayMode: false,
  replayPlaying: false,
  replayFrames: [],
  replayIndex: 0,
  lastReplayAdvance: 0
};

renderSequence();
updateStepUI();
updateDashboard();
updateReplayUI();
applyViewSettings();

els.enableCamera.addEventListener("click", () => {
  startCamera();
});

els.stopCamera.addEventListener("click", () => {
  stopCamera();
});

els.startPause.addEventListener("click", async () => {
  if (!state.cameraActive) {
    const started = await startCamera();
    if (!started) {
      return;
    }
  }
  setRunning(!state.running);
});

els.prevStep.addEventListener("click", () => {
  goToStep(state.stepIndex - 1, true);
});

els.nextStep.addEventListener("click", () => {
  goToStep(state.stepIndex + 1, true);
});

els.reset.addEventListener("click", () => {
  resetSession();
});

els.record.addEventListener("click", async () => {
  if (state.recording) {
    stopRecording();
    return;
  }

  if (!state.cameraActive) {
    const started = await startCamera();
    if (!started) {
      return;
    }
  }

  startRecording();
});

els.replayPlay.addEventListener("click", () => {
  toggleReplayPlayback();
});

els.liveMode.addEventListener("click", () => {
  exitReplayMode();
});

els.clearReplay.addEventListener("click", () => {
  clearReplay();
});

els.exportReplay.addEventListener("click", () => {
  exportReplayData();
});

els.replayTimeline.addEventListener("input", () => {
  state.replayIndex = Number(els.replayTimeline.value);
  state.replayMode = Boolean(state.replayFrames.length);
  state.replayPlaying = false;
  updateReplayUI();
  drawFrame();
});

els.viewModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }
    state.viewMode = input.value;
    applyViewSettings();
    drawFrame();
  });
});

els.guideFit.addEventListener("change", () => {
  state.guideFit = els.guideFit.value;
  applyViewSettings();
  drawFrame();
});

els.guideTarget.addEventListener("change", () => {
  state.guideTarget = els.guideTarget.value;
  state.guidePoseIndex = -1;
  state.guideLandmarks = null;
  state.overlayLandmarks = null;
  state.overlayOffset = { x: 0, y: 0 };
  state.overlayCalibrated = false;
  drawFrame();
});

els.overlayMode.addEventListener("change", () => {
  state.overlayMode = els.overlayMode.value;
  applyViewSettings();
  drawFrame();
});

els.guideZoom.addEventListener("input", () => {
  state.guideZoom = Number(els.guideZoom.value);
  applyViewSettings();
  drawFrame();
});

els.overlayOpacity.addEventListener("input", () => {
  state.overlayOpacity = Number(els.overlayOpacity.value);
  drawFrame();
});

els.calibrateOverlay.addEventListener("click", () => {
  recenterOverlay();
});

els.mirrorToggle.addEventListener("change", () => {
  state.mirror = els.mirrorToggle.checked;
  els.video.classList.toggle("is-mirrored", state.mirror);
});

els.guideMirrorToggle.addEventListener("change", () => {
  state.guideMirror = els.guideMirrorToggle.checked;
  if (state.lastLandmarks && state.guideLandmarks) {
    state.lastResult = compareToGuide(state.lastLandmarks, state.guideLandmarks);
  }
  updateDashboard();
  drawFrame();
});

els.loadGuide.addEventListener("click", () => {
  els.guideVideoInput.click();
});

els.guideVideoInput.addEventListener("change", () => {
  const file = els.guideVideoInput.files?.[0];
  if (file) {
    loadGuideVideo(file);
  }
});

els.clearGuide.addEventListener("click", () => {
  clearGuideVideo();
});

els.guideVideo.addEventListener("play", () => {
  state.guideLastVideoTime = -1;
  startLoop();
});

els.guideVideo.addEventListener("seeked", () => {
  state.guideLastVideoTime = -1;
});

els.guideVideo.addEventListener("loadedmetadata", () => {
  drawFrame();
});

els.cameraSelect.addEventListener("change", async () => {
  state.selectedDeviceId = els.cameraSelect.value;
  if (state.cameraActive) {
    await restartCamera();
  }
});

els.sequenceStrip.addEventListener("click", (event) => {
  const card = event.target.closest("[data-step]");
  if (!card) {
    return;
  }
  goToStep(Number(card.dataset.step), true);
});

window.addEventListener("resize", () => {
  drawFrame();
});

function applyViewSettings() {
  if (!state.guideActive && state.viewMode === "follow") {
    state.viewMode = "camera";
  }

  const followMode = isFollowVideoMode();
  els.studioPanel.classList.toggle("has-guide", state.guideActive);
  els.videoFrame.classList.toggle("is-follow-video", followMode);
  els.guidePanel.classList.toggle("is-hidden", !state.guideActive);
  els.videoFrame.style.setProperty("--guide-fit", state.guideFit);
  els.videoFrame.style.setProperty("--guide-zoom", String(state.guideZoom));
  els.videoFrame.style.setProperty("--you-color", OVERLAY_COLOR.you);
  els.videoFrame.style.setProperty("--you-glow", "rgba(110, 231, 255, 0.18)");
  els.guideFit.value = state.guideFit;
  els.guideTarget.value = state.guideTarget;
  els.overlayMode.value = state.overlayMode;
  els.guideZoom.value = String(state.guideZoom);
  els.overlayOpacity.value = String(state.overlayOpacity);
  els.calibrateOverlay.disabled = !state.guideActive || !state.cameraActive;
  els.followStatus.textContent = followStatusText();

  els.viewModeInputs.forEach((input) => {
    input.checked = input.value === state.viewMode;
    input.disabled = input.value === "follow" && !state.guideActive;
  });
}

function isFollowVideoMode() {
  return state.viewMode === "follow" && state.guideActive;
}

function followStatusText() {
  if (!state.guideActive) {
    return "Load a guide video";
  }

  if (!state.guideLandmarks) {
    return "Finding teacher";
  }

  if (!state.cameraActive) {
    return `${targetLabel()} target`;
  }

  if (!state.lastLandmarks) {
    return "Finding you";
  }

  const mapped = state.overlayLandmarks ? "mapped" : "partial";
  const calibrated = state.overlayCalibrated ? "recentered" : "auto";
  return `${targetLabel()} target / ${state.overlayMode} / ${mapped} / ${calibrated}`;
}

function targetLabel() {
  return `${state.guideTarget}${state.guidePoseCount > 1 ? ` ${state.guidePoseIndex + 1}/${state.guidePoseCount}` : ""}`;
}

function recenterOverlay() {
  if (!state.lastLandmarks || !state.guideLandmarks) {
    state.lastResult = noPoseResult("Camera and guide pose both need to be visible before recentering.");
    updateDashboard();
    return;
  }

  state.overlayOffset = { x: 0, y: 0 };
  const overlay = buildUserGuideOverlay(state.lastLandmarks, state.guideLandmarks, { skipCalibration: true });
  const shared = OVERLAY_LANDMARKS.filter(
    (index) => overlay?.[index] && isVisible(state.guideLandmarks, guideIndexFor(index), 0.18)
  );

  if (!overlay || shared.length < 2) {
    state.lastResult = noPoseResult("Bring more of your shoulders and hands into view, then recenter.");
    updateDashboard();
    return;
  }

  const overlayFit = landmarkFit(overlay, shared);
  const guideFit = landmarkFit(
    state.guideLandmarks,
    shared.map((index) => guideIndexFor(index))
  );

  if (!overlayFit || !guideFit) {
    state.lastResult = noPoseResult("Could not recenter from this frame. Try a clearer pose.");
    updateDashboard();
    return;
  }

  state.overlayOffset = {
    x: guideFit.center.x - overlayFit.center.x,
    y: guideFit.center.y - overlayFit.center.y
  };
  state.overlayCalibrated = true;
  state.overlayLandmarks = buildUserGuideOverlay(state.lastLandmarks, state.guideLandmarks);
  state.lastResult = {
    ...state.lastResult,
    cue: "Overlay recentered. Fit the green figure into the teacher outline."
  };
  updateDashboard();
  drawFrame();
}

async function startCamera() {
  const cameraPreflight = getCameraPreflight();
  if (!cameraPreflight.ok) {
    setStatus(els.cameraStatus, cameraPreflight.status, "warn", "video-off");
    state.lastResult = noPoseResult(cameraPreflight.cue);
    updateDashboard();
    return false;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus(els.cameraStatus, "Camera unavailable", "warn", "video-off");
    state.lastResult = noPoseResult("This browser does not expose camera access. Try Safari or Chrome on HTTPS.");
    updateDashboard();
    return false;
  }

  setStatus(els.cameraStatus, "Requesting camera", "warn", "video");
  const constraints = buildCameraConstraints();

  try {
    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    els.video.srcObject = state.stream;
    await els.video.play();
    state.cameraActive = true;
    els.video.classList.add("is-live");
    els.video.classList.toggle("is-mirrored", state.mirror);
    els.emptyState.classList.add("is-hidden");
    els.stopCamera.disabled = false;
    setStatus(els.cameraStatus, "Camera live", "good", "video");
    await refreshCameraList();
    startLoop();
  } catch (error) {
    const cameraError = describeCameraError(error);
    setStatus(els.cameraStatus, cameraError.status, "warn", "video-off");
    state.lastResult = noPoseResult(cameraError.cue);
    updateDashboard();
    console.error(error);
    return false;
  }

  try {
    await loadPoseModel();
  } catch (error) {
    setStatus(els.modelStatus, "Model failed", "warn", "cpu");
    state.lastResult = noPoseResult("Pose model could not load. Check the network connection.");
    updateDashboard();
    console.error(error);
    return false;
  }

  return true;
}

function getCameraPreflight() {
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!window.isSecureContext && !isLocalhost) {
    return {
      ok: false,
      status: "HTTPS required",
      cue:
        "Camera access is blocked on this plain HTTP address. Open the deployed HTTPS Vercel URL, or use localhost on the Mac."
    };
  }

  return { ok: true };
}

function describeCameraError(error) {
  const name = error?.name || "";

  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      status: "Permission blocked",
      cue: "Camera permission was blocked. In Safari, allow camera access for this site, then reload."
    };
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      status: "No camera found",
      cue: "No camera was found for this browser. Check the camera device or try another browser."
    };
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      status: "Camera busy",
      cue: "The camera is already in use by another app or tab. Close other camera apps and try again."
    };
  }

  if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
    return {
      status: "Camera mismatch",
      cue: "The selected camera is unavailable. Pick the default camera or reload the page."
    };
  }

  return {
    status: "Camera blocked",
    cue: "The browser could not start the camera. Reload the page and check site camera permissions."
  };
}

async function loadGuideVideo(file) {
  if (state.guideObjectUrl) {
    URL.revokeObjectURL(state.guideObjectUrl);
  }

  state.guideObjectUrl = URL.createObjectURL(file);
  state.guideActive = true;
  state.guideLandmarks = null;
  state.guideLastVideoTime = -1;
  state.guidePoseCount = 0;
  state.guidePoseIndex = -1;
  state.guidePoseQuality = 0;
  state.overlayLandmarks = null;
  state.overlayOffset = { x: 0, y: 0 };
  state.overlayCalibrated = false;
  state.viewMode = "follow";
  state.wristTrail = [];
  els.guideVideo.src = state.guideObjectUrl;
  els.guideVideo.muted = true;
  els.loadGuide.innerHTML = `${materialIcon("video_file")}Change guide`;
  state.lastResult = noPoseResult("Guide video loaded. Enable the camera and fit your body into the ghost outline.");
  applyViewSettings();
  updateDashboard();
  startLoop();

  try {
    await loadGuideModel();
    await els.guideVideo.play();
  } catch (error) {
    state.lastResult = noPoseResult("Guide video loaded. Press play on the video if it did not start.");
    updateDashboard();
    console.warn(error);
  }
}

function clearGuideVideo() {
  state.guideActive = false;
  state.guideLandmarks = null;
  state.guideLastVideoTime = -1;
  state.guidePoseCount = 0;
  state.guidePoseIndex = -1;
  state.guidePoseQuality = 0;
  state.overlayLandmarks = null;
  state.overlayOffset = { x: 0, y: 0 };
  state.overlayCalibrated = false;
  state.viewMode = "camera";
  els.guideVideo.pause();
  els.guideVideo.removeAttribute("src");
  els.guideVideo.load();
  els.guideVideoInput.value = "";
  els.loadGuide.innerHTML = `${materialIcon("video_file")}Load guide`;
  if (state.guideObjectUrl) {
    URL.revokeObjectURL(state.guideObjectUrl);
    state.guideObjectUrl = "";
  }
  state.lastResult = state.cameraActive
    ? noPoseResult("Guide cleared. Static routine targets are active.")
    : noPoseResult("Enable the camera to begin mapping posture.");
  applyViewSettings();
  updateDashboard();
}

async function restartCamera() {
  const wasRunning = state.running;
  stopCamera({ keepScores: true });
  await startCamera();
  setRunning(wasRunning && state.cameraActive);
}

function stopCamera(options = {}) {
  if (state.recording) {
    stopRecording();
  }
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
  }
  state.stream = null;
  state.cameraActive = false;
  state.lastLandmarks = null;
  state.overlayLandmarks = null;
  state.lastVideoTime = -1;
  state.poseConfidence = 0;
  state.running = false;
  state.previousHandCenter = null;
  state.wristTrail = [];
  els.video.srcObject = null;
  els.video.classList.remove("is-live");
  els.emptyState.classList.remove("is-hidden");
  els.stopCamera.disabled = true;
  setStatus(els.cameraStatus, "Camera idle", "", "video");
  setStatus(els.poseStatus, "No pose", "", "activity");
  state.lastResult = noPoseResult("Enable the camera to begin mapping posture.");
  if (!options.keepScores) {
    state.flow = 0;
  }
  setRunning(false);
  drawFrame();
  updateDashboard();
}

function buildCameraConstraints() {
  const video = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  };

  if (state.selectedDeviceId) {
    delete video.facingMode;
    video.deviceId = { exact: state.selectedDeviceId };
  }

  return { audio: false, video };
}

async function refreshCameraList() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput");
  els.cameraSelect.innerHTML = "";

  cameras.forEach((camera, index) => {
    const option = document.createElement("option");
    option.value = camera.deviceId;
    option.textContent = camera.label || `Camera ${index + 1}`;
    els.cameraSelect.appendChild(option);
  });

  if (!cameras.length) {
    const option = document.createElement("option");
    option.textContent = "Default camera";
    els.cameraSelect.appendChild(option);
  }

  if (state.stream) {
    const activeTrack = state.stream.getVideoTracks()[0];
    const activeSettings = activeTrack?.getSettings();
    if (activeSettings?.deviceId) {
      state.selectedDeviceId = activeSettings.deviceId;
      els.cameraSelect.value = activeSettings.deviceId;
    }
  }

  els.cameraSelect.disabled = cameras.length < 2;
}

async function loadPoseModel() {
  if (state.poseLandmarker) {
    return state.poseLandmarker;
  }

  if (state.modelPromise) {
    return state.modelPromise;
  }

  state.modelPromise = (async () => {
    setStatus(els.modelStatus, "Loading model", "warn", "cpu");
    state.poseLandmarker = await createPoseLandmarker({ numPoses: 1 });
    setStatus(els.modelStatus, "Model ready", "good", "cpu");
    return state.poseLandmarker;
  })();

  return state.modelPromise;
}

async function loadGuideModel() {
  if (state.guideLandmarker) {
    return state.guideLandmarker;
  }

  if (state.guideModelPromise) {
    return state.guideModelPromise;
  }

  state.guideModelPromise = (async () => {
    setStatus(els.modelStatus, "Loading guide", "warn", "cpu");
    state.guideLandmarker = await createPoseLandmarker({
      numPoses: 4,
      minPoseDetectionConfidence: 0.32,
      minPosePresenceConfidence: 0.32,
      minTrackingConfidence: 0.32
    });
    setStatus(els.modelStatus, state.poseLandmarker ? "Models ready" : "Guide ready", "good", "cpu");
    return state.guideLandmarker;
  })();

  return state.guideModelPromise;
}

async function createPoseLandmarker(settings = {}) {
  const { PoseLandmarker, vision } = await loadVisionRuntime();
  const baseOptions = {
    modelAssetPath: MODEL_URL
  };

  const options = {
    baseOptions: { ...baseOptions, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: settings.numPoses || 1,
    minPoseDetectionConfidence: settings.minPoseDetectionConfidence ?? 0.45,
    minPosePresenceConfidence: settings.minPosePresenceConfidence ?? 0.45,
    minTrackingConfidence: settings.minTrackingConfidence ?? 0.45
  };

  try {
    return await PoseLandmarker.createFromOptions(vision, options);
  } catch (gpuError) {
    console.warn("GPU delegate failed, falling back to CPU.", gpuError);
    return PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions
    });
  }
}

async function loadVisionRuntime() {
  if (!state.visionPromise) {
    state.visionPromise = (async () => {
      const visionModule = await import(TASKS_URL);
      const { FilesetResolver, PoseLandmarker } = visionModule;
      const vision = await FilesetResolver.forVisionTasks(`${TASKS_URL}/wasm`);
      return { PoseLandmarker, vision };
    })();
  }

  return state.visionPromise;
}

function startLoop() {
  if (state.animationId) {
    return;
  }
  state.lastClock = performance.now();
  const loop = (now) => {
    state.animationId = requestAnimationFrame(loop);
    tickRoutineClock(now);
    detectGuidePose(now);
    detectPose(now);
    advanceReplay(now);
    drawFrame();
    updateDashboard();
  };
  state.animationId = requestAnimationFrame(loop);
}

function tickRoutineClock(now) {
  const dt = Math.min(Math.max((now - state.lastClock) / 1000, 0), 0.1);
  state.lastClock = now;

  if (!state.running) {
    return;
  }

  state.stepElapsed += dt;
  state.practicedSeconds += dt;

  const step = routine[state.stepIndex];
  if (state.stepElapsed >= step.seconds) {
    if (state.stepIndex === routine.length - 1) {
      state.stepElapsed = step.seconds;
      setRunning(false);
      if (state.recording) {
        stopRecording();
      }
      state.lastResult = {
        ...state.lastResult,
        cue: "Routine complete. Let the breath settle before moving on."
      };
    } else {
      goToStep(state.stepIndex + 1, false);
    }
  }
}

function detectGuidePose(now) {
  if (!state.guideActive || !state.guideLandmarker || els.guideVideo.readyState < 2) {
    return;
  }

  if (els.guideVideo.currentTime === state.guideLastVideoTime) {
    return;
  }

  state.guideLastVideoTime = els.guideVideo.currentTime;

  try {
    const result = state.guideLandmarker.detectForVideo(els.guideVideo, now);
    const poses = result.landmarks || [];
    const selected = selectGuidePose(poses);
    state.guidePoseCount = poses.length;
    if (selected) {
      const switchedPose = selected.index !== state.guidePoseIndex;
      state.guidePoseIndex = selected.index;
      state.guidePoseQuality = selected.quality;
      state.guideLandmarks = switchedPose
        ? selected.landmarks
        : smoothLandmarks(state.guideLandmarks, selected.landmarks, 0.5);
      if (state.lastLandmarks) {
        state.overlayLandmarks = buildUserGuideOverlay(state.lastLandmarks, state.guideLandmarks);
        state.lastResult = compareToGuide(state.lastLandmarks, state.guideLandmarks);
      }
    } else {
      state.guidePoseIndex = -1;
      state.guidePoseQuality = 0;
      state.guideLandmarks = null;
      state.overlayLandmarks = null;
    }
  } catch (error) {
    console.error(error);
    state.guideLandmarks = null;
    state.guidePoseCount = 0;
    state.guidePoseIndex = -1;
    state.guidePoseQuality = 0;
  }
}

function selectGuidePose(poses) {
  const candidates = poses
    .map((landmarks, index) => guidePoseCandidate(landmarks, index))
    .filter(Boolean);

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function guidePoseCandidate(landmarks, index) {
  const visible = OVERLAY_LANDMARKS.filter((pointIndex) => isVisible(landmarks, pointIndex, 0.18));
  const fit = landmarkFit(landmarks, visible);

  if (!fit || visible.length < 3) {
    return null;
  }

  const area = fit.width * fit.height;
  const centerDistance = Math.abs(fit.center.x - 0.5);
  const confidence = average(visible.map((pointIndex) => landmarks[pointIndex]?.visibility ?? 0.5));
  const sideScore = state.guideTarget === "left" ? 1 - fit.center.x : fit.center.x;
  let score = confidence + area * 2;

  if (state.guideTarget === "center") {
    score += 1.4 - centerDistance * 2.2;
  } else if (state.guideTarget === "largest") {
    score += area * 4;
  } else {
    score += sideScore * 1.8;
  }

  if (index === state.guidePoseIndex) {
    score += 0.18;
  }

  return {
    index,
    landmarks,
    quality: clamp01(confidence),
    score
  };
}

function detectPose(now) {
  if (!state.cameraActive || !state.poseLandmarker || els.video.readyState < 2) {
    return;
  }

  if (els.video.currentTime === state.lastVideoTime) {
    return;
  }

  state.lastVideoTime = els.video.currentTime;
  let result;

  try {
    result = state.poseLandmarker.detectForVideo(els.video, now);
  } catch (error) {
    console.error(error);
    setStatus(els.poseStatus, "Pose error", "warn", "activity");
    return;
  }

  const landmarks = result.landmarks?.[0];
  if (!landmarks) {
    state.lastLandmarks = null;
    state.overlayLandmarks = null;
    state.poseConfidence = 0;
    state.smoothScore = lerp(state.smoothScore, 0, 0.14);
    state.lastResult = noPoseResult("Step fully into frame so shoulders, hands, hips, and feet are visible.");
    setStatus(els.poseStatus, "No pose", "warn", "activity");
    return;
  }

  state.lastLandmarks = landmarks;
  state.poseConfidence = confidenceFor(landmarks);
  updateMotion(landmarks);
  state.overlayLandmarks =
    state.guideActive && state.guideLandmarks ? buildUserGuideOverlay(landmarks, state.guideLandmarks) : null;

  const evaluator = routine[state.stepIndex].evaluate;
  let evaluated = state.guideActive && state.guideLandmarks
    ? compareToGuide(landmarks, state.guideLandmarks)
    : evaluator(landmarks);
  const visibilityCue = state.guideActive ? cameraVisibilityCue(landmarks) : "";
  if (visibilityCue) {
    evaluated = { ...evaluated, cue: visibilityCue };
  }
  state.lastResult = evaluated;
  state.smoothScore = lerp(state.smoothScore, evaluated.score, 0.22);
  captureReplayFrame(now, landmarks, evaluated);

  if (state.running && now - state.lastScoreSample > 300 && evaluated.score > 1) {
    state.stepScores[state.stepIndex].push(evaluated.score);
    state.allScores.push(evaluated.score);
    state.lastScoreSample = now;
  }

  const poseLabel = state.poseConfidence > 0.58 ? "Pose locked" : "Pose partial";
  setStatus(
    els.poseStatus,
    `${poseLabel} ${Math.round(state.poseConfidence * 100)}%`,
    state.poseConfidence > 0.58 ? "good" : "warn",
    "activity"
  );
}

function setRunning(value) {
  state.running = Boolean(value && state.cameraActive);
  els.startPause.innerHTML = state.running
    ? `${materialIcon("pause")}Pause`
    : `${materialIcon("play_arrow")}Start`;
}

function goToStep(index, manual) {
  const nextIndex = (index + routine.length) % routine.length;
  state.stepIndex = nextIndex;
  state.stepElapsed = 0;
  state.lastScoreSample = 0;
  state.wristTrail = [];
  state.previousHandCenter = null;
  if (manual && !state.cameraActive) {
    state.lastResult = noPoseResult("Enable the camera to begin mapping posture.");
  }
  updateStepUI();
  renderSequence();
}

function resetSession() {
  if (state.recording) {
    stopRecording();
  }
  state.stepIndex = 0;
  state.stepElapsed = 0;
  state.practicedSeconds = 0;
  state.stepScores = routine.map(() => []);
  state.allScores = [];
  state.wristTrail = [];
  state.previousHandCenter = null;
  state.flow = 0;
  state.smoothScore = 0;
  state.lastResult = state.cameraActive
    ? noPoseResult("Step fully into frame so mapping can resume.")
    : noPoseResult("Enable the camera to begin mapping posture.");
  setRunning(false);
  updateStepUI();
  renderSequence();
  updateDashboard();
}

function updateStepUI() {
  const step = routine[state.stepIndex];
  els.stepCount.textContent = `Step ${state.stepIndex + 1} of ${routine.length}`;
  els.stepTitle.textContent = step.title;
  els.breathCue.textContent = step.breath;
  els.movementCue.textContent = step.movement;
  els.timerText.textContent = formatSeconds(Math.max(step.seconds - state.stepElapsed, 0));
}

function updateDashboard() {
  const step = routine[state.stepIndex];
  const progress = clamp01(state.stepElapsed / step.seconds);
  const replayFrame = state.replayMode ? state.replayFrames[state.replayIndex] : null;
  els.timerRing.style.setProperty("--progress", `${progress * 360}deg`);
  els.timerText.textContent = formatSeconds(Math.max(step.seconds - state.stepElapsed, 0));
  els.scoreValue.textContent = String(Math.round(replayFrame?.score ?? state.smoothScore));
  els.liveCue.textContent = replayFrame?.cue ?? state.lastResult.cue;
  els.timePracticed.textContent = formatSeconds(state.practicedSeconds);
  els.sessionScore.textContent = String(Math.round(average(state.allScores)));
  els.flowScore.textContent = String(Math.round(state.flow * 100));
  els.followStatus.textContent = followStatusText();
  els.calibrateOverlay.disabled = !state.guideActive || !state.cameraActive || !state.guideLandmarks || !state.lastLandmarks;
  renderMetrics(replayFrame?.parts ?? state.lastResult.parts);
  updateActiveCards();
}

function startRecording() {
  state.recording = true;
  state.recordingStart = performance.now();
  state.lastReplayCapture = 0;
  state.replayFrames = [];
  state.replayIndex = 0;
  state.replayMode = false;
  state.replayPlaying = false;
  state.lastReplayAdvance = 0;
  els.scoreBadge.classList.add("is-recording");
  setRunning(true);
  startLoop();
  updateReplayUI();
}

function stopRecording() {
  state.recording = false;
  els.scoreBadge.classList.remove("is-recording");

  if (state.replayFrames.length) {
    state.replayMode = true;
    state.replayPlaying = false;
    state.replayIndex = state.replayFrames.length - 1;
  }

  updateReplayUI();
}

function captureReplayFrame(now, landmarks, evaluated) {
  if (!state.recording || !landmarks || now - state.lastReplayCapture < 250) {
    return;
  }

  const guideGhost =
    state.guideActive && state.guideLandmarks ? buildGuideGhost(landmarks, state.guideLandmarks) : null;

  state.replayFrames.push({
    elapsed: (now - state.recordingStart) / 1000,
    score: evaluated.score,
    cue: evaluated.cue,
    parts: evaluated.parts.map((part) => ({
      label: part.label,
      score: part.score,
      cue: part.cue
    })),
    stepIndex: state.stepIndex,
    stepTitle: routine[state.stepIndex].title,
    flow: state.flow,
    mirror: state.mirror,
    videoWidth: els.video.videoWidth || 1280,
    videoHeight: els.video.videoHeight || 720,
    user: cloneLandmarkMap(landmarks),
    guideGhost: guideGhost ? cloneLandmarkMap(guideGhost) : null
  });

  state.lastReplayCapture = now;
  state.replayIndex = state.replayFrames.length - 1;
  updateReplayUI();
}

function advanceReplay(now) {
  if (!state.replayPlaying || !state.replayFrames.length) {
    return;
  }

  if (now - state.lastReplayAdvance < 250) {
    return;
  }

  state.lastReplayAdvance = now;
  state.replayIndex += 1;

  if (state.replayIndex >= state.replayFrames.length) {
    state.replayIndex = state.replayFrames.length - 1;
    state.replayPlaying = false;
  }

  updateReplayUI();
}

function toggleReplayPlayback() {
  if (!state.replayFrames.length) {
    return;
  }

  state.replayMode = true;
  state.replayPlaying = !state.replayPlaying;

  if (state.replayPlaying && state.replayIndex >= state.replayFrames.length - 1) {
    state.replayIndex = 0;
  }

  state.lastReplayAdvance = 0;
  startLoop();
  updateReplayUI();
}

function exitReplayMode() {
  state.replayMode = false;
  state.replayPlaying = false;
  updateReplayUI();
  drawFrame();
}

function clearReplay() {
  state.recording = false;
  state.replayMode = false;
  state.replayPlaying = false;
  state.replayFrames = [];
  state.replayIndex = 0;
  state.lastReplayCapture = 0;
  els.scoreBadge.classList.remove("is-recording");
  updateReplayUI();
  drawFrame();
}

function exportReplayData() {
  if (!state.replayFrames.length) {
    return;
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    routine: routine.map(({ id, title, seconds }) => ({ id, title, seconds })),
    summary: buildReplaySummary(),
    frames: state.replayFrames
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `qi-gong-replay-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function updateReplayUI() {
  const frameCount = state.replayFrames.length;
  const currentFrame = state.replayFrames[state.replayIndex] || null;
  const summary = buildReplaySummary();

  els.record.classList.toggle("is-recording", state.recording);
  els.record.innerHTML = state.recording
    ? `${materialIcon("stop_circle")}Stop`
    : `${materialIcon("radio_button_checked")}Record`;
  els.replayPlay.innerHTML = state.replayPlaying ? materialIcon("pause") : materialIcon("play_arrow");
  els.replayPlay.disabled = !frameCount;
  els.liveMode.disabled = !state.replayMode;
  els.exportReplay.disabled = !frameCount;
  els.clearReplay.disabled = !frameCount;
  els.replayTimeline.disabled = !frameCount;
  els.replayTimeline.max = String(Math.max(frameCount - 1, 0));
  els.replayTimeline.value = String(Math.min(state.replayIndex, Math.max(frameCount - 1, 0)));
  els.replayCurrentTime.textContent = formatSeconds(currentFrame?.elapsed || 0);
  els.replayDuration.textContent = formatSeconds(lastReplayFrame()?.elapsed || 0);
  els.replaySamples.textContent = String(frameCount);
  els.replayLowCount.textContent = String(summary.lowCount);
  els.replayBestScore.textContent = String(summary.bestScore);
  els.replayFocus.textContent = summary.focus;
  els.replayCue.textContent = currentFrame?.cue || summary.cue;
  renderReplayMarkers(summary.lowFrames);
  renderReplayIssues(summary.issues);
}

function renderReplayMarkers(lowFrames) {
  const duration = lastReplayFrame()?.elapsed || 0;
  els.replayMarkers.innerHTML = lowFrames
    .map((frame) => {
      const left = duration ? clamp01(frame.elapsed / duration) * 100 : 0;
      return `<span style="left: ${left}%"></span>`;
    })
    .join("");
}

function renderReplayIssues(issues) {
  els.replayIssues.innerHTML = issues.length
    ? issues
        .map(
          (issue) =>
            `<span class="issue-chip">${materialIcon("priority_high")}${issue.label} ${Math.round(issue.score * 100)}</span>`
        )
        .join("")
    : `<span class="issue-chip">${materialIcon("check_circle")}No replay yet</span>`;
}

function buildReplaySummary() {
  if (!state.replayFrames.length) {
    return {
      lowCount: 0,
      bestScore: 0,
      focus: "--",
      cue: "No recording yet.",
      lowFrames: [],
      issues: []
    };
  }

  const lowFrames = state.replayFrames.filter((frame) => frame.score < 60);
  const bestScore = Math.max(...state.replayFrames.map((frame) => frame.score));
  const issueMap = new Map();

  state.replayFrames.forEach((frame) => {
    frame.parts.forEach((part) => {
      if (!issueMap.has(part.label)) {
        issueMap.set(part.label, []);
      }
      issueMap.get(part.label).push(part.score);
    });
  });

  const issues = Array.from(issueMap.entries())
    .map(([label, values]) => ({
      label,
      score: average(values)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const focus = issues[0]?.label || "--";
  const cue = lowFrames[0]?.cue || lastReplayFrame()?.cue || "Replay ready.";

  return {
    lowCount: lowFrames.length,
    bestScore,
    focus,
    cue,
    lowFrames,
    issues
  };
}

function lastReplayFrame() {
  return state.replayFrames[state.replayFrames.length - 1] || null;
}

function renderMetrics(parts = []) {
  const metrics = parts.length
    ? parts
    : [{ label: "Visibility", score: 0, cue: "Step into frame." }];

  els.metricStack.innerHTML = metrics
    .slice(0, 4)
    .map((part) => {
      const value = Math.round(part.score * 100);
      return `
        <div class="metric">
          <span>${part.label}</span>
          <div class="metric-bar" aria-hidden="true"><span style="--value: ${value}%"></span></div>
          <span>${value}</span>
        </div>
      `;
    })
    .join("");
}

function renderSequence() {
  els.sequenceStrip.innerHTML = routine
    .map((step, index) => {
      const stepAverage = Math.round(average(state.stepScores[index]));
      return `
        <button class="sequence-card ${index === state.stepIndex ? "is-active" : ""}" type="button" data-step="${index}">
          <div class="sequence-meta">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <span>${formatSeconds(step.seconds)}</span>
          </div>
          <h3>${step.title}</h3>
          <p>${step.movement}</p>
          <div class="sequence-meta">
            <span>score</span>
            <span class="sequence-score">${stepAverage}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function updateActiveCards() {
  const cards = els.sequenceStrip.querySelectorAll(".sequence-card");
  cards.forEach((card, index) => {
    card.classList.toggle("is-active", index === state.stepIndex);
    const score = card.querySelector(".sequence-score");
    if (score) {
      score.textContent = String(Math.round(average(state.stepScores[index])));
    }
  });
}

function drawFrame() {
  const dims = syncCanvas();
  ctx.clearRect(0, 0, dims.width, dims.height);

  if (state.replayMode && state.replayFrames.length) {
    drawReplayFrame(dims, state.replayFrames[state.replayIndex]);
    return;
  }

  if (isFollowVideoMode()) {
    drawFollowVideoFrame(dims);
    return;
  }

  if (!state.cameraActive) {
    drawIdleGuide(dims);
    return;
  }

  if (!state.lastLandmarks) {
    drawFramingGuide(dims);
    return;
  }

  if (state.guideActive && state.guideLandmarks) {
    drawGuideGhost(dims, state.lastLandmarks, state.guideLandmarks);
  } else {
    drawTargetGuide(dims, state.lastLandmarks);
  }
  drawSkeleton(dims, state.lastLandmarks);
}

function drawReplayFrame(dims, frame) {
  if (!frame) {
    return;
  }

  ctx.save();
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, dims.width, dims.height);

  ctx.strokeStyle = "rgba(156, 202, 255, 0.24)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  roundedRect(ctx, dims.width * 0.18, dims.height * 0.08, dims.width * 0.64, dims.height * 0.84, 8);
  ctx.stroke();
  ctx.setLineDash([]);

  if (frame.guideGhost) {
    drawSavedSkeleton(dims, frame.guideGhost, {
      videoWidth: frame.videoWidth,
      videoHeight: frame.videoHeight,
      mirror: frame.mirror,
      lineColor: "rgba(218, 190, 232, 0.92)",
      jointColor: "#f4bf72",
      width: 5,
      halo: true
    });
  }

  drawSavedSkeleton(dims, frame.user, {
    videoWidth: frame.videoWidth,
    videoHeight: frame.videoHeight,
    mirror: frame.mirror,
    lineColor: frame.score >= 72 ? "#9bd9b1" : frame.score >= 45 ? "#f4bf72" : "#ffb4ab",
    jointColor: "#e3e2e8",
    width: 4,
    halo: false
  });

  drawReplayOverlay(dims, frame);
  ctx.restore();
}

function drawSavedSkeleton(dims, landmarkMap, options) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  CONNECTORS.forEach(([a, b]) => {
    const startPoint = landmarkMap[a];
    const endPoint = landmarkMap[b];
    if (!startPoint || !endPoint) {
      return;
    }
    const start = projectSavedPoint(startPoint, dims, options);
    const end = projectSavedPoint(endPoint, dims, options);

    if (options.halo) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.lineWidth = options.width + 8;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    ctx.strokeStyle = options.lineColor;
    ctx.lineWidth = options.width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  Object.values(LANDMARK).forEach((index) => {
    const point = landmarkMap[index];
    if (!point) {
      return;
    }
    const p = projectSavedPoint(point, dims, options);
    ctx.fillStyle = options.jointColor;
    ctx.strokeStyle = "rgba(5, 7, 10, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function drawReplayOverlay(dims, frame) {
  ctx.save();
  ctx.fillStyle = "rgba(17, 19, 24, 0.78)";
  roundedRect(ctx, 16, 16, Math.min(360, dims.width - 32), 96, 8);
  ctx.fill();
  ctx.fillStyle = "#9ccaff";
  ctx.font = "700 13px Roboto, sans-serif";
  ctx.fillText(`Replay / ${frame.stepTitle}`, 32, 44);
  ctx.fillStyle = "#e3e2e8";
  ctx.font = "900 34px Roboto, sans-serif";
  ctx.fillText(String(Math.round(frame.score)), 32, 84);
  ctx.fillStyle = "#c4c7cf";
  ctx.font = "700 13px Roboto, sans-serif";
  ctx.fillText(formatSeconds(frame.elapsed), 96, 84);
  ctx.restore();
}

function syncCanvas() {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  if (els.canvas.width !== pixelWidth || els.canvas.height !== pixelHeight) {
    els.canvas.width = pixelWidth;
    els.canvas.height = pixelHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height };
}

function drawIdleGuide(dims) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  roundedRect(ctx, dims.width * 0.28, dims.height * 0.14, dims.width * 0.44, dims.height * 0.72, 8);
  ctx.stroke();
  ctx.restore();
}

function drawFramingGuide(dims) {
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "#9fd7bd";
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 14]);
  roundedRect(ctx, dims.width * 0.25, dims.height * 0.08, dims.width * 0.5, dims.height * 0.84, 8);
  ctx.stroke();
  ctx.restore();
}

function drawFollowVideoFrame(dims) {
  drawGuideBackdrop(dims);
  drawGuideContentFrame(dims);

  ctx.save();
  const clip = guideMediaRect(dims);
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.width, clip.height);
  ctx.clip();

  if (state.guideLandmarks) {
    drawSkeleton(dims, state.guideLandmarks, {
      project: (point) => projectGuidePoint(point, dims),
      lineColor: "rgba(218, 190, 232, 0.92)",
      jointColor: "rgba(244, 191, 114, 0.96)",
      width: 5,
      haloWidth: 15,
      haloColor: "rgba(5, 7, 10, 0.6)",
      alpha: 0.88,
      visibilityThreshold: 0.18
    });
    drawGuideTargetRings(dims, state.guideLandmarks);
  }

  if (state.cameraActive && state.lastLandmarks && state.guideLandmarks) {
    const overlay = state.overlayLandmarks || buildUserGuideOverlay(state.lastLandmarks, state.guideLandmarks);
    if (overlay) {
      drawMappedOverlay(dims, overlay, state.guideLandmarks);
    }
  }

  ctx.restore();

  drawCameraPreviewSkeleton(dims);

  if (!state.cameraActive) {
    drawFollowHint(dims, "Enable the camera to overlay your movement.");
  } else if (!state.lastLandmarks) {
    drawFollowHint(dims, "Step into frame so your skeleton can map onto the video.");
  } else if (!state.guideLandmarks) {
    drawFollowHint(dims, "Press play or scrub the guide video to a clear pose.");
  }
}

function drawGuideBackdrop(dims) {
  if (!els.guideVideo.videoWidth || !els.guideVideo.videoHeight) {
    return;
  }

  const rect = guideMediaRect(dims);
  ctx.save();
  ctx.filter = "blur(22px) saturate(1.12)";
  ctx.globalAlpha = 0.5;
  drawVideoCover(els.guideVideo, -24, -24, dims.width + 48, dims.height + 48);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(5, 7, 10, 0.5)";
  ctx.fillRect(0, 0, dims.width, dims.height);
  ctx.clearRect(rect.x - 1, rect.y - 1, rect.width + 2, rect.height + 2);
  ctx.restore();
}

function drawVideoCover(video, x, y, width, height) {
  const videoRatio = video.videoWidth / video.videoHeight;
  const boxRatio = width / height;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (videoRatio > boxRatio) {
    sourceWidth = video.videoHeight * boxRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = video.videoWidth / boxRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawGuideContentFrame(dims) {
  const rect = guideMediaRect(dims);
  ctx.save();
  ctx.strokeStyle = "rgba(156, 202, 255, 0.28)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 12]);
  roundedRect(ctx, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, 8);
  ctx.stroke();
  ctx.restore();
}

function drawFollowHint(dims, text) {
  const width = Math.min(430, dims.width - 32);
  const x = (dims.width - width) / 2;
  const y = Math.max(72, dims.height * 0.12);

  ctx.save();
  ctx.fillStyle = "rgba(17, 19, 24, 0.78)";
  roundedRect(ctx, x, y, width, 54, 8);
  ctx.fill();
  ctx.fillStyle = "#e3e2e8";
  ctx.font = "800 14px Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, dims.width / 2, y + 33);
  ctx.restore();
}

function drawGuideTargetRings(dims, guideLandmarks) {
  const points = [LANDMARK.leftWrist, LANDMARK.rightWrist, LANDMARK.leftElbow, LANDMARK.rightElbow];
  ctx.save();
  ctx.lineWidth = 3;

  points.forEach((index) => {
    const point = guideLandmarks[index];
    if (!isVisible(guideLandmarks, index, 0.18)) {
      return;
    }

    const p = projectGuidePoint(point, dims);
    ctx.strokeStyle = index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? "#f4bf72" : "#dabee8";
    ctx.fillStyle = "rgba(5, 7, 10, 0.36)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? 15 : 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function drawMismatchLines(dims, overlayLandmarks, guideLandmarks) {
  const indexes = [
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder
  ];
  const scale = poseScale(guideLandmarks);

  ctx.save();
  ctx.lineCap = "round";
  ctx.setLineDash([6, 9]);

  indexes.forEach((index) => {
    const overlayPoint = overlayLandmarks[index];
    const guideIndex = guideIndexFor(index);
    const guidePoint = guideLandmarks[guideIndex];

    if (!overlayPoint || !isVisible(guideLandmarks, guideIndex, 0.18)) {
      return;
    }

    const miss = distance(overlayPoint, guidePoint) / scale;
    const start = projectGuidePoint(overlayPoint, dims);
    const end = projectGuidePoint(guidePoint, dims);
    const good = miss < 0.22;
    ctx.strokeStyle = good ? "rgba(155, 217, 177, 0.46)" : "rgba(255, 138, 128, 0.72)";
    ctx.lineWidth = good ? 2 : 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  ctx.restore();
}

function drawMappedOverlay(dims, overlayLandmarks, guideLandmarks) {
  drawMismatchLines(dims, overlayLandmarks, guideLandmarks);

  if (state.overlayMode === "ghost") {
    drawGhostOverlay(dims, overlayLandmarks);
    drawTargetDots(dims, overlayLandmarks, guideLandmarks, { compact: true });
    return;
  }

  if (state.overlayMode === "skeleton") {
    drawSkeleton(dims, overlayLandmarks, {
      project: (point) => projectGuidePoint(point, dims),
      lineColor: OVERLAY_COLOR.you,
      jointColor: "#ffffff",
      width: 6,
      haloWidth: 16,
      haloColor: "rgba(5, 7, 10, 0.72)",
      alpha: state.overlayOpacity,
      visibilityThreshold: 0.12
    });
    drawTargetDots(dims, overlayLandmarks, guideLandmarks, { compact: true });
    return;
  }

  drawTargetOverlay(dims, overlayLandmarks, guideLandmarks);
}

function drawTargetOverlay(dims, overlayLandmarks, guideLandmarks) {
  drawMappedLines(dims, overlayLandmarks, {
    connectors: [
      [LANDMARK.leftShoulder, LANDMARK.rightShoulder],
      [LANDMARK.leftShoulder, LANDMARK.leftHip],
      [LANDMARK.rightShoulder, LANDMARK.rightHip],
      [LANDMARK.leftHip, LANDMARK.rightHip],
      [LANDMARK.leftShoulder, LANDMARK.leftElbow],
      [LANDMARK.leftElbow, LANDMARK.leftWrist],
      [LANDMARK.rightShoulder, LANDMARK.rightElbow],
      [LANDMARK.rightElbow, LANDMARK.rightWrist]
    ],
    width: 5,
    alpha: state.overlayOpacity * 0.72
  });
  drawTargetDots(dims, overlayLandmarks, guideLandmarks, { compact: false });
}

function drawMappedLines(dims, landmarks, options) {
  ctx.save();
  ctx.globalAlpha = options.alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  options.connectors.forEach(([a, b]) => {
    if (!landmarks[a] || !landmarks[b]) {
      return;
    }

    const start = projectGuidePoint(landmarks[a], dims);
    const end = projectGuidePoint(landmarks[b], dims);
    ctx.strokeStyle = "rgba(5, 7, 10, 0.68)";
    ctx.lineWidth = options.width + 10;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.strokeStyle = OVERLAY_COLOR.you;
    ctx.lineWidth = options.width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  ctx.restore();
}

function drawTargetDots(dims, overlayLandmarks, guideLandmarks, options) {
  const points = [
    { index: LANDMARK.leftWrist, radius: options.compact ? 11 : 16 },
    { index: LANDMARK.rightWrist, radius: options.compact ? 11 : 16 },
    { index: LANDMARK.leftElbow, radius: options.compact ? 9 : 13 },
    { index: LANDMARK.rightElbow, radius: options.compact ? 9 : 13 },
    { index: LANDMARK.leftShoulder, radius: options.compact ? 8 : 11 },
    { index: LANDMARK.rightShoulder, radius: options.compact ? 8 : 11 },
    { index: LANDMARK.leftHip, radius: options.compact ? 7 : 9 },
    { index: LANDMARK.rightHip, radius: options.compact ? 7 : 9 }
  ];

  ctx.save();
  ctx.globalAlpha = state.overlayOpacity;

  points.forEach(({ index, radius }) => {
    const point = overlayLandmarks[index];
    if (!point) {
      return;
    }

    const p = projectGuidePoint(point, dims);
    const status = overlayJointStatus(index, overlayLandmarks, guideLandmarks);
    ctx.fillStyle = "rgba(5, 7, 10, 0.64)";
    ctx.strokeStyle = status.color;
    ctx.lineWidth = options.compact ? 4 : 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = OVERLAY_COLOR.you;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function drawGhostOverlay(dims, overlayLandmarks) {
  ctx.save();
  ctx.globalAlpha = state.overlayOpacity;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  [
    [LANDMARK.leftShoulder, LANDMARK.leftElbow],
    [LANDMARK.leftElbow, LANDMARK.leftWrist],
    [LANDMARK.rightShoulder, LANDMARK.rightElbow],
    [LANDMARK.rightElbow, LANDMARK.rightWrist],
    [LANDMARK.leftHip, LANDMARK.leftKnee],
    [LANDMARK.leftKnee, LANDMARK.leftAnkle],
    [LANDMARK.rightHip, LANDMARK.rightKnee],
    [LANDMARK.rightKnee, LANDMARK.rightAnkle]
  ].forEach(([a, b]) => {
    if (!overlayLandmarks[a] || !overlayLandmarks[b]) {
      return;
    }
    const start = projectGuidePoint(overlayLandmarks[a], dims);
    const end = projectGuidePoint(overlayLandmarks[b], dims);
    ctx.strokeStyle = OVERLAY_COLOR.youGhost;
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  const torso = [
    overlayLandmarks[LANDMARK.leftShoulder],
    overlayLandmarks[LANDMARK.rightShoulder],
    overlayLandmarks[LANDMARK.rightHip],
    overlayLandmarks[LANDMARK.leftHip]
  ];

  if (torso.every(Boolean)) {
    ctx.fillStyle = OVERLAY_COLOR.youGhost;
    ctx.strokeStyle = OVERLAY_COLOR.youSoft;
    ctx.lineWidth = 3;
    ctx.beginPath();
    torso.forEach((point, index) => {
      const p = projectGuidePoint(point, dims);
      if (index === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawMappedLines(dims, overlayLandmarks, {
    connectors: CONNECTORS,
    width: 3,
    alpha: 0.76
  });
  ctx.restore();
}

function overlayJointStatus(index, overlayLandmarks, guideLandmarks) {
  const guideIndex = guideIndexFor(index);
  const guidePoint = guideLandmarks[guideIndex];
  const overlayPoint = overlayLandmarks[index];

  if (!overlayPoint || !guidePoint || !isVisible(guideLandmarks, guideIndex, 0.18)) {
    return { color: OVERLAY_COLOR.youSoft, miss: 0 };
  }

  const miss = distance(overlayPoint, guidePoint) / poseScale(guideLandmarks);
  if (miss < 0.2) {
    return { color: OVERLAY_COLOR.good, miss };
  }
  if (miss < 0.36) {
    return { color: OVERLAY_COLOR.warn, miss };
  }
  return { color: OVERLAY_COLOR.error, miss };
}

function drawCameraPreviewSkeleton(dims) {
  if (!isFollowVideoMode() || !state.cameraActive || !state.lastLandmarks) {
    return;
  }

  const rect = cameraPreviewRect(dims);
  ctx.save();
  roundedRect(ctx, rect.x, rect.y, rect.width, rect.height, 8);
  ctx.clip();
  drawSkeleton(dims, state.lastLandmarks, {
    project: (point) => projectCameraPreviewPoint(point, rect),
    lineColor: "#9ccaff",
    jointColor: "#ffffff",
    width: 2.5,
    haloWidth: 7,
    haloColor: "rgba(5, 7, 10, 0.68)",
    alpha: 0.92,
    visibilityThreshold: 0.16
  });
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(156, 202, 255, 0.48)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, rect.x, rect.y, rect.width, rect.height, 8);
  ctx.stroke();
  ctx.restore();
}

function drawTargetGuide(dims, landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return;
  }

  const targets = targetPointsFor(routine[state.stepIndex].id, body);
  ctx.save();
  ctx.setLineDash([8, 9]);
  ctx.lineWidth = 3;

  targets.forEach((target) => {
    const p = projectPoint(target, dims);
    ctx.strokeStyle = target.color;
    ctx.globalAlpha = 0.74;
    ctx.beginPath();
    ctx.arc(p.x, p.y, target.radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();
}

function drawGuideGhost(dims, userLandmarks, guideLandmarks) {
  const ghost = buildGuideGhost(userLandmarks, guideLandmarks);
  if (!ghost) {
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.78;

  CONNECTORS.forEach(([a, b]) => {
    const startPoint = ghost[a];
    const endPoint = ghost[b];
    if (!startPoint || !endPoint) {
      return;
    }
    const start = projectPoint(startPoint, dims);
    const end = projectPoint(endPoint, dims);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(159, 231, 189, 0.92)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  Object.values(LANDMARK).forEach((index) => {
    const point = ghost[index];
    if (!point) {
      return;
    }
    const p = projectPoint(point, dims);
    ctx.fillStyle = "#f0b35e";
    ctx.strokeStyle = "rgba(17, 21, 19, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? 9 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function drawTrail(dims) {
  if (state.wristTrail.length < 3) {
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;

  drawTrailSide(
    dims,
    state.wristTrail.map((entry) => entry.left),
    "rgba(207, 134, 40, 0.72)"
  );
  drawTrailSide(
    dims,
    state.wristTrail.map((entry) => entry.right),
    "rgba(79, 140, 170, 0.72)"
  );
  ctx.restore();
}

function drawTrailSide(dims, points, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((point, index) => {
    const p = projectPoint(point, dims);
    if (index === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  ctx.stroke();
}

function drawSkeleton(dims, landmarks, options = {}) {
  const score = state.smoothScore;
  const lineColor = options.lineColor || (score >= 72 ? "#9fe7bd" : score >= 45 ? "#f0b35e" : "#ef776f");
  const jointColor = options.jointColor || "#ffffff";
  const project = options.project || ((point) => projectPoint(point, dims));
  const visibilityThreshold = options.visibilityThreshold ?? 0.32;
  const width = options.width || 4;
  const haloWidth = options.haloWidth || 8;
  const haloColor = options.haloColor || "rgba(17, 21, 19, 0.52)";
  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  CONNECTORS.forEach(([a, b]) => {
    if (!isVisible(landmarks, a, visibilityThreshold) || !isVisible(landmarks, b, visibilityThreshold)) {
      return;
    }
    const start = project(landmarks[a]);
    const end = project(landmarks[b]);
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = haloWidth;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle
  ].forEach((index) => {
    if (!isVisible(landmarks, index, visibilityThreshold)) {
      return;
    }
    const p = project(landmarks[index]);
    ctx.fillStyle = index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? jointColor : lineColor;
    ctx.strokeStyle = "rgba(17, 21, 19, 0.66)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

function projectPoint(point, dims) {
  const videoWidth = els.video.videoWidth || dims.width;
  const videoHeight = els.video.videoHeight || dims.height;
  const scale = Math.max(dims.width / videoWidth, dims.height / videoHeight);
  const renderWidth = videoWidth * scale;
  const renderHeight = videoHeight * scale;
  const offsetX = (dims.width - renderWidth) / 2;
  const offsetY = (dims.height - renderHeight) / 2;
  let x = point.x * renderWidth + offsetX;
  const y = point.y * renderHeight + offsetY;

  if (state.mirror) {
    x = dims.width - x;
  }

  return { x, y };
}

function projectGuidePoint(point, dims) {
  const rect = guideMediaRect(dims);
  return {
    x: rect.x + point.x * rect.width,
    y: rect.y + point.y * rect.height
  };
}

function projectCameraPreviewPoint(point, rect) {
  let x = rect.x + point.x * rect.width;
  const y = rect.y + point.y * rect.height;

  if (state.mirror) {
    x = rect.x + rect.width - point.x * rect.width;
  }

  return { x, y };
}

function cameraPreviewRect(dims) {
  const compact = dims.width < 560;
  return {
    x: compact ? 10 : 16,
    y: dims.height - (compact ? 90 : 126) - (compact ? 10 : 16),
    width: compact ? 126 : Math.min(188, dims.width * 0.28),
    height: compact ? 90 : 126
  };
}

function guideMediaRect(dims) {
  const videoWidth = els.guideVideo.videoWidth || 16;
  const videoHeight = els.guideVideo.videoHeight || 9;
  const zoom = Math.max(state.guideZoom || 1, 1);
  const boxWidth = dims.width * zoom;
  const boxHeight = dims.height * zoom;
  const scale =
    state.guideFit === "cover"
      ? Math.max(boxWidth / videoWidth, boxHeight / videoHeight)
      : Math.min(boxWidth / videoWidth, boxHeight / videoHeight);
  const width = videoWidth * scale;
  const height = videoHeight * scale;

  return {
    x: (dims.width - width) / 2,
    y: (dims.height - height) / 2,
    width,
    height
  };
}

function projectSavedPoint(point, dims, options = {}) {
  const videoWidth = options.videoWidth || 1280;
  const videoHeight = options.videoHeight || 720;
  const scale = Math.max(dims.width / videoWidth, dims.height / videoHeight);
  const renderWidth = videoWidth * scale;
  const renderHeight = videoHeight * scale;
  const offsetX = (dims.width - renderWidth) / 2;
  const offsetY = (dims.height - renderHeight) / 2;
  let x = point.x * renderWidth + offsetX;
  const y = point.y * renderHeight + offsetY;

  if (options.mirror) {
    x = dims.width - x;
  }

  return { x, y };
}

function targetPointsFor(stepId, body) {
  const sw = body.shoulderWidth;
  const th = body.torsoHeight;
  const cx = body.center.x;
  const shoulderY = body.shoulderCenter.y;
  const hipY = body.hipCenter.y;

  const jade = "rgba(159, 231, 189, 0.95)";
  const amber = "rgba(240, 179, 94, 0.95)";
  const sky = "rgba(134, 191, 218, 0.95)";

  switch (stepId) {
    case "lift":
      return [
        { x: body.leftShoulder.x - sw * 0.16, y: shoulderY - th * 0.55, radius: 36, color: jade },
        { x: body.rightShoulder.x + sw * 0.16, y: shoulderY - th * 0.55, radius: 36, color: jade }
      ];
    case "open":
      return [
        { x: cx - sw * 1.25, y: shoulderY + th * 0.22, radius: 38, color: amber },
        { x: cx + sw * 1.25, y: shoulderY + th * 0.22, radius: 38, color: amber }
      ];
    case "cloud":
      return [
        { x: cx - sw * 0.7, y: shoulderY + th * 0.12, radius: 34, color: sky },
        { x: cx + sw * 0.7, y: hipY - th * 0.08, radius: 34, color: amber }
      ];
    case "press":
      return [
        { x: cx - sw * 0.3, y: shoulderY + th * 0.33, radius: 34, color: jade },
        { x: cx + sw * 0.3, y: shoulderY + th * 0.33, radius: 34, color: jade }
      ];
    case "gather":
      return [
        { x: cx - sw * 0.22, y: hipY - th * 0.12, radius: 32, color: amber },
        { x: cx + sw * 0.22, y: hipY - th * 0.12, radius: 32, color: amber }
      ];
    case "root":
    default:
      return [
        { x: body.leftHip.x - sw * 0.2, y: hipY + th * 0.2, radius: 30, color: jade },
        { x: body.rightHip.x + sw * 0.2, y: hipY + th * 0.2, radius: 30, color: jade }
      ];
  }
}

function updateMotion(landmarks) {
  if (!isVisible(landmarks, LANDMARK.leftWrist, 0.35) || !isVisible(landmarks, LANDMARK.rightWrist, 0.35)) {
    state.previousHandCenter = null;
    state.flow = lerp(state.flow, 0, 0.05);
    return;
  }

  const left = landmarks[LANDMARK.leftWrist];
  const right = landmarks[LANDMARK.rightWrist];
  const handCenter = (left.x + right.x) / 2;

  if (state.previousHandCenter !== null) {
    const speed = Math.abs(handCenter - state.previousHandCenter);
    const speedScore = clamp01(1 - Math.abs(speed - 0.006) / 0.016);
    const alignmentBoost = state.lastResult ? state.lastResult.score / 100 : 0;
    state.flow = lerp(state.flow, Math.max(speedScore, alignmentBoost * 0.75), 0.08);
  }

  state.previousHandCenter = handCenter;
  state.wristTrail.push({
    left: { x: left.x, y: left.y },
    right: { x: right.x, y: right.y }
  });

  if (state.wristTrail.length > 42) {
    state.wristTrail.shift();
  }
}

function scoreRoot(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.fullReady) {
    return noPoseResult("Bring your full body into view from hands to feet.");
  }

  const ankleRatio = Math.abs(body.leftAnkle.x - body.rightAnkle.x) / body.shoulderWidth;
  const handDrop = ((body.leftWrist.y + body.rightWrist.y) / 2 - body.hipCenter.y) / body.torsoHeight;
  const shoulderTilt = Math.abs(body.leftShoulder.y - body.rightShoulder.y) / body.torsoHeight;
  const handBalance = Math.abs(body.leftWrist.y - body.rightWrist.y) / body.torsoHeight;

  return combineScores([
    { label: "Stance", score: targetScore(ankleRatio, 1.35, 0.65), cue: "Set the feet about shoulder width." },
    { label: "Hands low", score: rampScore(handDrop, -0.1, 0.24), cue: "Let the hands settle beside the hips." },
    { label: "Shoulders", score: inverseScore(shoulderTilt, 0.18), cue: "Level the shoulders and soften the neck." },
    { label: "Balance", score: inverseScore(handBalance, 0.28), cue: "Let both hands hang with the same weight." }
  ]);
}

function scoreLift(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return noPoseResult("Keep both shoulders, elbows, and hands visible.");
  }

  const leftRise = (body.shoulderCenter.y - body.leftWrist.y) / body.torsoHeight;
  const rightRise = (body.shoulderCenter.y - body.rightWrist.y) / body.torsoHeight;
  const rise = (leftRise + rightRise) / 2;
  const symmetry = Math.abs(body.leftWrist.y - body.rightWrist.y) / body.torsoHeight;
  const centerDrift = Math.abs((body.leftWrist.x + body.rightWrist.x) / 2 - body.center.x) / body.shoulderWidth;
  const leftElbow = elbowSoftness(landmarks, "left");
  const rightElbow = elbowSoftness(landmarks, "right");

  return combineScores([
    { label: "Lift", score: targetScore(rise, 0.58, 0.38), cue: "Float both wrists higher above the shoulders." },
    { label: "Symmetry", score: inverseScore(symmetry, 0.28), cue: "Raise both hands at the same pace." },
    { label: "Center", score: inverseScore(centerDrift, 0.58), cue: "Keep the lifted hands centered over the body." },
    { label: "Soft elbows", score: (leftElbow + rightElbow) / 2, cue: "Keep the elbows soft instead of locked." }
  ]);
}

function scoreOpen(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return noPoseResult("Keep the upper body visible for chest opening.");
  }

  const wristSpan = Math.abs(body.leftWrist.x - body.rightWrist.x) / body.shoulderWidth;
  const targetY = body.shoulderCenter.y + body.torsoHeight * 0.22;
  const heightError =
    (Math.abs(body.leftWrist.y - targetY) + Math.abs(body.rightWrist.y - targetY)) /
    2 /
    body.torsoHeight;
  const shoulderTilt = Math.abs(body.leftShoulder.y - body.rightShoulder.y) / body.torsoHeight;
  const elbows = (elbowSoftness(landmarks, "left") + elbowSoftness(landmarks, "right")) / 2;

  return combineScores([
    { label: "Width", score: targetScore(wristSpan, 2.25, 0.82), cue: "Open the hands wider from the center." },
    { label: "Height", score: inverseScore(heightError, 0.44), cue: "Keep the hands floating at chest height." },
    { label: "Shoulders", score: inverseScore(shoulderTilt, 0.2), cue: "Let the shoulders stay level and quiet." },
    { label: "Elbows", score: elbows, cue: "Round the elbows gently as the chest opens." }
  ]);
}

function scoreCloud(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return noPoseResult("Keep both hands and shoulders in frame for cloud hands.");
  }

  const verticalSeparation = Math.abs(body.leftWrist.y - body.rightWrist.y) / body.torsoHeight;
  const wristSpan = Math.abs(body.leftWrist.x - body.rightWrist.x) / body.shoulderWidth;
  const highHandY = Math.min(body.leftWrist.y, body.rightWrist.y);
  const lowHandY = Math.max(body.leftWrist.y, body.rightWrist.y);
  const highTarget = body.shoulderCenter.y + body.torsoHeight * 0.15;
  const lowTarget = body.hipCenter.y - body.torsoHeight * 0.08;
  const levelScore =
    (inverseScore(Math.abs(highHandY - highTarget) / body.torsoHeight, 0.42) +
      inverseScore(Math.abs(lowHandY - lowTarget) / body.torsoHeight, 0.42)) /
    2;

  return combineScores([
    { label: "High low", score: targetScore(verticalSeparation, 0.44, 0.34), cue: "Keep one hand high and one hand low." },
    { label: "Circle", score: targetScore(wristSpan, 1.25, 0.78), cue: "Let the hands travel in a rounded path." },
    { label: "Levels", score: levelScore, cue: "Carry the top hand near chest height and the low hand near the belly." },
    { label: "Flow", score: state.flow, cue: "Move continuously without rushing." }
  ]);
}

function scorePress(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return noPoseResult("Keep the arms visible for the press.");
  }

  const handGap = distance(body.leftWrist, body.rightWrist) / body.shoulderWidth;
  const targetY = body.shoulderCenter.y + body.torsoHeight * 0.34;
  const heightError =
    (Math.abs(body.leftWrist.y - targetY) + Math.abs(body.rightWrist.y - targetY)) /
    2 /
    body.torsoHeight;
  const centerDrift = Math.abs((body.leftWrist.x + body.rightWrist.x) / 2 - body.center.x) / body.shoulderWidth;
  const elbows = (elbowBendScore(landmarks, "left") + elbowBendScore(landmarks, "right")) / 2;

  return combineScores([
    { label: "Hand gap", score: targetScore(handGap, 0.62, 0.5), cue: "Bring the hands closer in front of the sternum." },
    { label: "Height", score: inverseScore(heightError, 0.4), cue: "Press from chest height, not from the shoulders." },
    { label: "Center", score: inverseScore(centerDrift, 0.52), cue: "Keep the press centered in front of the body." },
    { label: "Rounded arms", score: elbows, cue: "Round the elbows as if holding a light ball." }
  ]);
}

function scoreGather(landmarks) {
  const body = bodyFrom(landmarks);
  if (!body.upperReady) {
    return noPoseResult("Keep the hands visible as they descend.");
  }

  const targetY = body.hipCenter.y - body.torsoHeight * 0.12;
  const heightError =
    (Math.abs(body.leftWrist.y - targetY) + Math.abs(body.rightWrist.y - targetY)) /
    2 /
    body.torsoHeight;
  const handGap = distance(body.leftWrist, body.rightWrist) / body.shoulderWidth;
  const centerDrift = Math.abs((body.leftWrist.x + body.rightWrist.x) / 2 - body.center.x) / body.shoulderWidth;
  const shoulderTilt = Math.abs(body.leftShoulder.y - body.rightShoulder.y) / body.torsoHeight;

  return combineScores([
    { label: "Lower belly", score: inverseScore(heightError, 0.44), cue: "Let the hands settle toward the lower abdomen." },
    { label: "Gather", score: targetScore(handGap, 0.48, 0.42), cue: "Gather the hands closer without squeezing." },
    { label: "Center", score: inverseScore(centerDrift, 0.5), cue: "Keep the closing movement centered." },
    { label: "Stillness", score: inverseScore(shoulderTilt, 0.18), cue: "Settle the shoulders and finish quietly." }
  ]);
}

function compareToGuide(userLandmarks, guideLandmarks) {
  if (!guideLandmarks) {
    return noPoseResult("Guide pose is not visible yet. Press play or choose a clearer frame.");
  }

  const overlay = state.overlayLandmarks || buildUserGuideOverlay(userLandmarks, guideLandmarks);

  const groups = [
    {
      label: "Hands",
      indexes: [LANDMARK.leftWrist, LANDMARK.rightWrist],
      tolerance: 0.58,
      cue: "Fit your hands into the guide outline."
    },
    {
      label: "Arms",
      indexes: [LANDMARK.leftElbow, LANDMARK.rightElbow],
      tolerance: 0.5,
      cue: "Round the arms toward the guide shape."
    },
    {
      label: "Torso",
      indexes: [LANDMARK.leftShoulder, LANDMARK.rightShoulder, LANDMARK.leftHip, LANDMARK.rightHip],
      tolerance: 0.34,
      cue: "Match the guide's upper-body angle before moving the hands."
    },
    {
      label: "Base",
      indexes: [LANDMARK.leftKnee, LANDMARK.rightKnee, LANDMARK.leftAnkle, LANDMARK.rightAnkle],
      tolerance: 0.48,
      cue: "Set your stance closer to the guide's base."
    }
  ];

  if (!overlay) {
    return noPoseResult("Keep your shoulders and hands visible so your figure can map to the guide.");
  }

  const parts = groups.map((group) => scoreGuideGroup(group, overlay, guideLandmarks)).filter(Boolean);

  if (!parts.length) {
    return noPoseResult("Guide pose is too cropped to compare. Try a clearer frame or another target.");
  }

  parts.push({
    label: "Flow",
    score: state.flow,
    cue: "Move continuously with the guide instead of holding the shape."
  });

  return combineScores(parts);
}

function scoreGuideGroup(group, overlayLandmarks, guideLandmarks) {
  const scores = [];
  const scale = poseScale(guideLandmarks);

  group.indexes.forEach((index) => {
    const guideIndex = guideIndexFor(index);
    const overlayPoint = overlayLandmarks[index];
    const guidePoint = guideLandmarks[guideIndex];

    if (!overlayPoint || !isVisible(guideLandmarks, guideIndex, 0.18)) {
      return;
    }

    scores.push(inverseScore(distance(overlayPoint, guidePoint) / scale, group.tolerance));
  });

  if (!scores.length) {
    return null;
  }

  return {
    label: group.label,
    score: average(scores),
    cue: group.cue
  };
}

function buildUserGuideOverlay(userLandmarks, guideLandmarks, options = {}) {
  const shared = OVERLAY_LANDMARKS.filter(
    (index) => isVisible(userLandmarks, index, 0.2) && isVisible(guideLandmarks, guideIndexFor(index), 0.18)
  );

  if (shared.length < 2) {
    return null;
  }

  const mapped = buildBodyMappedOverlay(userLandmarks, guideLandmarks) || buildFitMappedOverlay(userLandmarks, guideLandmarks, shared);

  if (!mapped) {
    return null;
  }

  if (options.skipCalibration) {
    return mapped;
  }

  return applyOverlayOffset(mapped);
}

function buildBodyMappedOverlay(userLandmarks, guideLandmarks) {
  const userReady = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip
  ].every((index) => isVisible(userLandmarks, index, 0.14));
  const guideReady = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftHip,
    LANDMARK.rightHip
  ].every((index) => isVisible(guideLandmarks, index, 0.14));

  if (!userReady || !guideReady) {
    return null;
  }

  const userBody = bodyFrom(userLandmarks);
  const guideBody = bodyFrom(guideLandmarks);

  return OVERLAY_LANDMARKS.reduce((overlay, index) => {
    const point = userLandmarks[index];
    if (!isVisible(userLandmarks, index, 0.12)) {
      return overlay;
    }

    const mapped = normalizeToBody(point, userBody);
    if (state.guideMirror) {
      mapped.x *= -1;
    }

    overlay[index] = {
      ...denormalizeFromBody(mapped, guideBody),
      visibility: point.visibility ?? 1
    };
    return overlay;
  }, {});
}

function buildFitMappedOverlay(userLandmarks, guideLandmarks, shared) {
  const userFit = landmarkFit(userLandmarks, shared);
  const guideFit = landmarkFit(
    guideLandmarks,
    shared.map((index) => guideIndexFor(index))
  );

  if (!userFit || !guideFit) {
    return null;
  }

  return OVERLAY_LANDMARKS.reduce((overlay, index) => {
    const point = userLandmarks[index];
    if (!isVisible(userLandmarks, index, 0.12)) {
      return overlay;
    }

    let x = (point.x - userFit.center.x) / userFit.width;
    if (state.guideMirror) {
      x *= -1;
    }

    overlay[index] = {
      x: guideFit.center.x + x * guideFit.width,
      y: guideFit.center.y + ((point.y - userFit.center.y) / userFit.height) * guideFit.height,
      visibility: point.visibility ?? 1
    };
    return overlay;
  }, {});
}

function applyOverlayOffset(overlay) {
  return Object.entries(overlay).reduce((mapped, [index, point]) => {
    mapped[index] = {
      ...point,
      x: point.x + state.overlayOffset.x,
      y: point.y + state.overlayOffset.y
    };
    return mapped;
  }, {});
}

function landmarkFit(landmarks, indexes) {
  const points = indexes.map((index) => landmarks[index]).filter(Boolean);

  if (points.length < 2) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX, 0.08);
  const height = Math.max(maxY - minY, 0.12);

  return {
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    },
    width,
    height
  };
}

function poseScale(landmarks) {
  const fit = landmarkFit(
    landmarks,
    OVERLAY_LANDMARKS.filter((index) => isVisible(landmarks, index, 0.16))
  );

  if (fit) {
    return Math.max(fit.width, fit.height, 0.16);
  }

  return 0.3;
}

function smoothLandmarks(previous, next, amount) {
  if (!previous || !next) {
    return next;
  }

  return next.map((point, index) => {
    const old = previous[index];
    if (!old || !point) {
      return point;
    }

    return {
      ...point,
      x: lerp(old.x, point.x, amount),
      y: lerp(old.y, point.y, amount),
      z: lerp(old.z ?? 0, point.z ?? 0, amount),
      visibility: point.visibility ?? old.visibility ?? 1
    };
  });
}

function buildGuideGhost(userLandmarks, guideLandmarks) {
  const userBody = bodyFrom(userLandmarks);
  const guideBody = bodyFrom(guideLandmarks);

  if (!userBody.upperReady || !guideBody.upperReady) {
    return null;
  }

  return Object.values(LANDMARK).reduce((ghost, index) => {
    const guideIndex = guideIndexFor(index);
    if (!isVisible(guideLandmarks, guideIndex, 0.25)) {
      return ghost;
    }

    const guidePoint = normalizeToBody(guideLandmarks[guideIndex], guideBody);
    if (state.guideMirror) {
      guidePoint.x *= -1;
    }
    ghost[index] = denormalizeFromBody(guidePoint, userBody);
    return ghost;
  }, {});
}

function guideIndexFor(index) {
  if (state.guideMirror && COUNTERPART[index] !== undefined) {
    return COUNTERPART[index];
  }

  return index;
}

function normalizeToBody(point, body) {
  return {
    x: (point.x - body.center.x) / body.shoulderWidth,
    y: (point.y - body.center.y) / body.torsoHeight
  };
}

function denormalizeFromBody(point, body) {
  return {
    x: body.center.x + point.x * body.shoulderWidth,
    y: body.center.y + point.y * body.torsoHeight
  };
}

function cloneLandmarkMap(landmarks) {
  return Object.values(LANDMARK).reduce((copy, index) => {
    const point = landmarks[index];
    if (!point) {
      return copy;
    }
    copy[index] = {
      x: point.x,
      y: point.y,
      visibility: point.visibility ?? 1
    };
    return copy;
  }, {});
}

function bodyFrom(landmarks) {
  const leftShoulder = landmarks[LANDMARK.leftShoulder];
  const rightShoulder = landmarks[LANDMARK.rightShoulder];
  const leftElbow = landmarks[LANDMARK.leftElbow];
  const rightElbow = landmarks[LANDMARK.rightElbow];
  const leftWrist = landmarks[LANDMARK.leftWrist];
  const rightWrist = landmarks[LANDMARK.rightWrist];
  const leftHip = landmarks[LANDMARK.leftHip];
  const rightHip = landmarks[LANDMARK.rightHip];
  const leftKnee = landmarks[LANDMARK.leftKnee];
  const rightKnee = landmarks[LANDMARK.rightKnee];
  const leftAnkle = landmarks[LANDMARK.leftAnkle];
  const rightAnkle = landmarks[LANDMARK.rightAnkle];

  const upperReady = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftHip,
    LANDMARK.rightHip
  ].every((index) => isVisible(landmarks, index, 0.28));

  const fullReady =
    upperReady &&
    [LANDMARK.leftKnee, LANDMARK.rightKnee, LANDMARK.leftAnkle, LANDMARK.rightAnkle].every((index) =>
      isVisible(landmarks, index, 0.25)
    );

  const shoulderCenter = midpoint(leftShoulder, rightShoulder);
  const hipCenter = midpoint(leftHip, rightHip);
  const center = midpoint(shoulderCenter, hipCenter);
  const shoulderWidth = Math.max(distance(leftShoulder, rightShoulder), 0.08);
  const torsoHeight = Math.max(distance(shoulderCenter, hipCenter), 0.16);

  return {
    upperReady,
    fullReady,
    leftShoulder,
    rightShoulder,
    leftElbow,
    rightElbow,
    leftWrist,
    rightWrist,
    leftHip,
    rightHip,
    leftKnee,
    rightKnee,
    leftAnkle,
    rightAnkle,
    shoulderCenter,
    hipCenter,
    center,
    shoulderWidth,
    torsoHeight
  };
}

function elbowSoftness(landmarks, side) {
  const shoulder = landmarks[LANDMARK[`${side}Shoulder`]];
  const elbow = landmarks[LANDMARK[`${side}Elbow`]];
  const wrist = landmarks[LANDMARK[`${side}Wrist`]];
  const degrees = angleAt(elbow, shoulder, wrist);
  return targetScore(degrees, 150, 42);
}

function elbowBendScore(landmarks, side) {
  const shoulder = landmarks[LANDMARK[`${side}Shoulder`]];
  const elbow = landmarks[LANDMARK[`${side}Elbow`]];
  const wrist = landmarks[LANDMARK[`${side}Wrist`]];
  const degrees = angleAt(elbow, shoulder, wrist);
  return targetScore(degrees, 118, 48);
}

function confidenceFor(landmarks) {
  const important = [
    LANDMARK.leftShoulder,
    LANDMARK.rightShoulder,
    LANDMARK.leftElbow,
    LANDMARK.rightElbow,
    LANDMARK.leftWrist,
    LANDMARK.rightWrist,
    LANDMARK.leftHip,
    LANDMARK.rightHip,
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle
  ];
  return average(important.map((index) => landmarks[index]?.visibility ?? 0.8));
}

function cameraVisibilityCue(landmarks) {
  const visibleCount = OVERLAY_LANDMARKS.filter((index) => isVisible(landmarks, index, 0.28)).length;
  const fullLowerBody = [
    LANDMARK.leftKnee,
    LANDMARK.rightKnee,
    LANDMARK.leftAnkle,
    LANDMARK.rightAnkle
  ].every((index) => isVisible(landmarks, index, 0.24));

  if (visibleCount < 5) {
    return "Only a small part of you is visible. Step back or brighten the room for better mapping.";
  }

  if (!fullLowerBody) {
    return "Only your upper body is visible. Step back if you want full-body matching.";
  }

  if (state.poseConfidence < 0.46) {
    return "Pose is partial. More light and more distance from the camera will improve the overlay.";
  }

  return "";
}

function noPoseResult(cue) {
  return {
    score: 0,
    cue,
    parts: [
      { label: "Visibility", score: 0, cue },
      { label: "Stance", score: 0, cue },
      { label: "Hands", score: 0, cue }
    ]
  };
}

function combineScores(parts) {
  const total = parts.reduce((sum, part) => sum + part.score, 0);
  const score = clamp01(total / Math.max(parts.length, 1));
  const weakest = parts.reduce((lowest, part) => (part.score < lowest.score ? part : lowest), parts[0]);
  return {
    score: Math.round(score * 100),
    cue: weakest?.cue || "Keep the movement soft and steady.",
    parts
  };
}

function targetScore(value, target, tolerance) {
  return clamp01(1 - Math.abs(value - target) / tolerance);
}

function inverseScore(value, tolerance) {
  return clamp01(1 - value / tolerance);
}

function rampScore(value, low, high) {
  return clamp01((value - low) / (high - low));
}

function isVisible(landmarks, index, threshold) {
  const landmark = landmarks[index];
  return Boolean(landmark && (landmark.visibility ?? 1) >= threshold);
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleAt(center, a, b) {
  const ax = a.x - center.x;
  const ay = a.y - center.y;
  const bx = b.x - center.x;
  const by = b.y - center.y;
  const dot = ax * bx + ay * by;
  const mag = Math.hypot(ax, ay) * Math.hypot(bx, by);
  if (!mag) {
    return 0;
  }
  const radians = Math.acos(clamp(dot / mag, -1, 1));
  return (radians * 180) / Math.PI;
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function formatSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function setStatus(element, text, mode, iconName) {
  element.classList.toggle("is-good", mode === "good");
  element.classList.toggle("is-warn", mode === "warn");
  element.innerHTML = `${materialIcon(iconName)}<span>${text}</span>`;
}

function materialIcon(name) {
  const resolvedName = ICONS[name] || name;
  return `<span class="material-symbols-rounded" aria-hidden="true">${resolvedName}</span>`;
}
