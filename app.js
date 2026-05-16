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
  guidePanel: document.getElementById("guidePanel"),
  emptyState: document.getElementById("emptyState"),
  enableCamera: document.getElementById("enableCameraButton"),
  stopCamera: document.getElementById("stopCameraButton"),
  cameraSelect: document.getElementById("cameraSelect"),
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
  running: false,
  mirror: true,
  selectedDeviceId: "",
  stepIndex: 0,
  stepElapsed: 0,
  practicedSeconds: 0,
  lastClock: 0,
  lastVideoTime: -1,
  guideLastVideoTime: -1,
  animationId: 0,
  lastLandmarks: null,
  guideLandmarks: null,
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
  state.wristTrail = [];
  els.guideVideo.src = state.guideObjectUrl;
  els.guideVideo.muted = true;
  els.guidePanel.classList.remove("is-hidden");
  els.loadGuide.innerHTML = `${materialIcon("video_file")}Change guide`;
  state.lastResult = noPoseResult("Guide video loaded. Enable the camera and fit your body into the ghost outline.");
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
  els.guideVideo.pause();
  els.guideVideo.removeAttribute("src");
  els.guideVideo.load();
  els.guidePanel.classList.add("is-hidden");
  els.guideVideoInput.value = "";
  els.loadGuide.innerHTML = `${materialIcon("video_file")}Load guide`;
  if (state.guideObjectUrl) {
    URL.revokeObjectURL(state.guideObjectUrl);
    state.guideObjectUrl = "";
  }
  state.lastResult = state.cameraActive
    ? noPoseResult("Guide cleared. Static routine targets are active.")
    : noPoseResult("Enable the camera to begin mapping posture.");
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
    state.poseLandmarker = await createPoseLandmarker();
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
    state.guideLandmarker = await createPoseLandmarker();
    setStatus(els.modelStatus, state.poseLandmarker ? "Models ready" : "Guide ready", "good", "cpu");
    return state.guideLandmarker;
  })();

  return state.guideModelPromise;
}

async function createPoseLandmarker() {
  const { PoseLandmarker, vision } = await loadVisionRuntime();
  const baseOptions = {
    modelAssetPath: MODEL_URL
  };

  const options = {
    baseOptions: { ...baseOptions, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.45,
    minPosePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45
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
    state.guideLandmarks = result.landmarks?.[0] || null;
  } catch (error) {
    console.error(error);
    state.guideLandmarks = null;
  }
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
    state.poseConfidence = 0;
    state.smoothScore = lerp(state.smoothScore, 0, 0.14);
    state.lastResult = noPoseResult("Step fully into frame so shoulders, hands, hips, and feet are visible.");
    setStatus(els.poseStatus, "No pose", "warn", "activity");
    return;
  }

  state.lastLandmarks = landmarks;
  state.poseConfidence = confidenceFor(landmarks);
  updateMotion(landmarks);

  const evaluator = routine[state.stepIndex].evaluate;
  const evaluated = state.guideActive && state.guideLandmarks
    ? compareToGuide(landmarks, state.guideLandmarks)
    : evaluator(landmarks);
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

function drawSkeleton(dims, landmarks) {
  const score = state.smoothScore;
  const lineColor = score >= 72 ? "#9fe7bd" : score >= 45 ? "#f0b35e" : "#ef776f";
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  CONNECTORS.forEach(([a, b]) => {
    if (!isVisible(landmarks, a, 0.32) || !isVisible(landmarks, b, 0.32)) {
      return;
    }
    const start = projectPoint(landmarks[a], dims);
    const end = projectPoint(landmarks[b], dims);
    ctx.strokeStyle = "rgba(17, 21, 19, 0.52)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 4;
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
    if (!isVisible(landmarks, index, 0.32)) {
      return;
    }
    const p = projectPoint(landmarks[index], dims);
    ctx.fillStyle = index === LANDMARK.leftWrist || index === LANDMARK.rightWrist ? "#ffffff" : lineColor;
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

  const userBody = bodyFrom(userLandmarks);
  const guideBody = bodyFrom(guideLandmarks);

  if (!userBody.upperReady) {
    return noPoseResult("Keep your shoulders, elbows, hands, and hips visible.");
  }

  if (!guideBody.upperReady) {
    return noPoseResult("Guide video pose is partial. Pick a clip with the full upper body visible.");
  }

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

  const parts = groups
    .map((group) => scoreGuideGroup(group, userLandmarks, guideLandmarks, userBody, guideBody))
    .filter(Boolean);

  if (!parts.length) {
    return noPoseResult("Guide pose is not clear enough to map. Choose a brighter, wider video.");
  }

  parts.push({
    label: "Flow",
    score: state.flow,
    cue: "Move continuously with the guide instead of holding the shape."
  });

  return combineScores(parts);
}

function scoreGuideGroup(group, userLandmarks, guideLandmarks, userBody, guideBody) {
  const scores = [];

  group.indexes.forEach((index) => {
    const guideIndex = guideIndexFor(index);
    if (!isVisible(guideLandmarks, guideIndex, 0.25)) {
      return;
    }

    if (!isVisible(userLandmarks, index, 0.25)) {
      scores.push(0);
      return;
    }

    const userPoint = normalizeToBody(userLandmarks[index], userBody);
    const guidePoint = normalizeToBody(guideLandmarks[guideIndex], guideBody);
    if (state.guideMirror) {
      guidePoint.x *= -1;
    }
    scores.push(inverseScore(distance(userPoint, guidePoint), group.tolerance));
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
