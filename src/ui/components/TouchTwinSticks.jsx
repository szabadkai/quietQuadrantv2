import React, { useEffect, useRef, useState } from "react";
import { setVirtualGamepad, clearVirtualGamepad } from "../../input/virtualGamepad.js";
import { soundManager } from "../../audio/SoundManager.js";
import { musicManager } from "../../audio/MusicManager.js";

const ZERO_VECTOR = { x: 0, y: 0, magnitude: 0 };
const STICK_RADIUS = 75; // Half of stick width/height (150px)

function clampVector(rawX, rawY) {
  const x = Math.max(-1, Math.min(1, rawX));
  const y = Math.max(-1, Math.min(1, rawY));
  const length = Math.hypot(x, y);
  if (length > 1) {
    return { x: x / length, y: y / length, magnitude: 1 };
  }
  return { x, y, magnitude: length };
}

function readVectorFromCenter(event, centerX, centerY) {
  const dx = (event.clientX - centerX) / STICK_RADIUS;
  const dy = (event.clientY - centerY) / STICK_RADIUS;
  return clampVector(dx, dy);
}

function createVirtualPad(left, right, dash) {
  return {
    index: 0,
    left,
    right,
    buttons: {
      south: false,
      east: dash,
      west: false,
      north: false,
      leftShoulder: dash,
      rightShoulder: false,
      leftTrigger: dash ? 1 : 0,
      rightTrigger: right.magnitude,
      back: false,
      start: false,
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false
    }
  };
}

export function TouchTwinSticks({ active, disabled }) {
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);
  const leftPointerId = useRef(null);
  const rightPointerId = useRef(null);
  const leftCenter = useRef({ x: 0, y: 0 });
  const rightCenter = useRef({ x: 0, y: 0 });
  const audioResumed = useRef(false);
  const [left, setLeft] = useState(ZERO_VECTOR);
  const [right, setRight] = useState(ZERO_VECTOR);
  const [leftPos, setLeftPos] = useState(null);
  const [rightPos, setRightPos] = useState(null);
  const [dash, setDash] = useState(false);

  const resumeAudio = () => {
    if (audioResumed.current) return;
    audioResumed.current = true;
    soundManager.resume();
    musicManager.resume();
    musicManager.play(musicManager.currentTrack ?? "level1");
  };

  useEffect(() => {
    if (!active) {
      clearVirtualGamepad(0);
      return;
    }
    const effectiveLeft = disabled ? ZERO_VECTOR : left;
    const effectiveRight = disabled ? ZERO_VECTOR : right;
    const effectiveDash = disabled ? false : dash;
    setVirtualGamepad(0, createVirtualPad(effectiveLeft, effectiveRight, effectiveDash));
    return () => clearVirtualGamepad(0);
  }, [active, disabled, left, right, dash]);

  useEffect(() => {
    if (!disabled) return;
    leftPointerId.current = null;
    rightPointerId.current = null;
    leftCenter.current = { x: 0, y: 0 };
    rightCenter.current = { x: 0, y: 0 };
    setLeft({ x: 0, y: 0, magnitude: 0 });
    setRight({ x: 0, y: 0, magnitude: 0 });
    setLeftPos(null);
    setRightPos(null);
    setDash(false);
  }, [disabled]);

  const handleLeftDown = (event) => {
    if (disabled || leftPointerId.current !== null) return;
    leftPointerId.current = event.pointerId;
    leftZoneRef.current?.setPointerCapture?.(event.pointerId);
    leftCenter.current = { x: event.clientX, y: event.clientY };
    setLeftPos({ x: event.clientX, y: event.clientY });
    setLeft(ZERO_VECTOR);
    resumeAudio();
  };

  const handleLeftMove = (event) => {
    if (disabled || event.pointerId !== leftPointerId.current) return;
    setLeft(readVectorFromCenter(event, leftCenter.current.x, leftCenter.current.y));
  };

  const handleLeftUp = (event) => {
    if (event.pointerId !== leftPointerId.current) return;
    leftPointerId.current = null;
    setLeft({ x: 0, y: 0, magnitude: 0 });
    setLeftPos(null);
  };

  const handleRightDown = (event) => {
    if (disabled || rightPointerId.current !== null) return;
    rightPointerId.current = event.pointerId;
    rightZoneRef.current?.setPointerCapture?.(event.pointerId);
    rightCenter.current = { x: event.clientX, y: event.clientY };
    setRightPos({ x: event.clientX, y: event.clientY });
    setRight(ZERO_VECTOR);
    resumeAudio();
  };

  const handleRightMove = (event) => {
    if (disabled || event.pointerId !== rightPointerId.current) return;
    setRight(readVectorFromCenter(event, rightCenter.current.x, rightCenter.current.y));
  };

  const handleRightUp = (event) => {
    if (event.pointerId !== rightPointerId.current) return;
    rightPointerId.current = null;
    setRight({ x: 0, y: 0, magnitude: 0 });
    setRightPos(null);
  };

  const handleDashDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    setDash(true);
    resumeAudio();
  };

  const handleDashUp = () => {
    setDash(false);
  };

  if (!active) return null;

  const stickStyle = (vector) => ({
    transform: `translate(-50%, -50%) translate(${vector.x * 32}px, ${vector.y * 32}px)`
  });

  const dynamicStickStyle = (pos) => ({
    left: pos.x,
    top: pos.y,
    transform: "translate(-50%, -50%)"
  });

  return (
    <div className={`qq-touch-layer${disabled ? " qq-touch-disabled" : ""}`}>
      <div
        className="qq-touch-zone left"
        ref={leftZoneRef}
        onPointerDown={handleLeftDown}
        onPointerMove={handleLeftMove}
        onPointerUp={handleLeftUp}
        onPointerCancel={handleLeftUp}
      >
        {leftPos && (
          <div className="qq-touch-stick dynamic" style={dynamicStickStyle(leftPos)}>
            <div className="qq-touch-ring" />
            <div className="qq-touch-handle" style={stickStyle(left)} />
          </div>
        )}
      </div>
      <div
        className="qq-touch-zone right"
        ref={rightZoneRef}
        onPointerDown={handleRightDown}
        onPointerMove={handleRightMove}
        onPointerUp={handleRightUp}
        onPointerCancel={handleRightUp}
      >
        {rightPos && (
          <div className="qq-touch-stick dynamic" style={dynamicStickStyle(rightPos)}>
            <div className="qq-touch-ring" />
            <div className="qq-touch-handle" style={stickStyle(right)} />
          </div>
        )}
      </div>
      <button
        className={`qq-touch-button${dash ? " active" : ""}`}
        onPointerDown={handleDashDown}
        onPointerUp={handleDashUp}
        onPointerCancel={handleDashUp}
        onPointerLeave={handleDashUp}
        type="button"
      >
        Dash
      </button>
    </div>
  );
}
