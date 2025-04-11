'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { VIDEO_CONSTANTS } from '@/components/video/LazyVideoSection';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayToggle: () => void;
  onMuteToggle: () => void;
  onReplay: () => void;
}

const ControlsContainer = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 5;
`;

const ControlButton = styled(motion.button)`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
`;

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  onPlayToggle,
  onMuteToggle,
  onReplay
}) => {
  return (
    <ControlsContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        delay: VIDEO_CONSTANTS.ANIMATION_DELAYS.CONTROLS_FADE, 
        duration: VIDEO_CONSTANTS.ANIMATION_DELAYS.CONTROLS_DURATION 
      }}
    >
      <ControlButton onClick={onPlayToggle} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </ControlButton>
      <ControlButton onClick={onMuteToggle} aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </ControlButton>
      <ControlButton onClick={onReplay} aria-label="Replay">
        <RotateCcw size={20} />
      </ControlButton>
    </ControlsContainer>
  );
}; 