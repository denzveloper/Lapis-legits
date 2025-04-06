'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useTypewriterAnimation, useTextScrambleAnimation, useSplitTextAnimation } from '../utils/textAnimations';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
`;

const AnimationSection = styled.div`
  margin-bottom: 3rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
`;

const AnimationContainer = styled.div`
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 1.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #eee;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #0060df;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const OptionsContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #555;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const TestGsapAnimations: React.FC = () => {
  // Options state
  const [typewriterOptions, setTypewriterOptions] = useState({
    duration: 2,
    delay: 0,
    cursor: true,
    cursorChar: '|',
    cursorColor: '#000',
    cursorStyle: 'blink' as 'blink' | 'solid',
    cursorBlinkSpeed: 0.5,
    blinkDelay: 0.4,
    randomize: false,
    speedVariation: 0.5,
    pauseProbability: 0.1,
    maxPauseDuration: 0.3
  });
  
  const [scrambleOptions, setScrambleOptions] = useState({
    duration: 2,
    delay: 0,
    ease: 'power1.inOut',
    chars: '!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz'
  });
  
  const [splitOptions, setSplitOptions] = useState({
    duration: 0.8,
    stagger: 0.05,
    delay: 0,
    ease: 'power2.out',
    direction: 'up' as 'up' | 'down' | 'left' | 'right',
    staggerFrom: 'start' as 'start' | 'center' | 'end' | 'edges' | 'random'
  });

  // Text state and keys to force re-render
  const [typewriterText, setTypewriterText] = useState('The quick brown fox jumps over the lazy dog.');
  const [typewriterKey, setTypewriterKey] = useState(0);
  
  const [scrambleText, setScrambleText] = useState('GSAP makes animation simple and powerful!');
  const [scrambleKey, setScrambleKey] = useState(0);
  
  const [splitText, setSplitText] = useState('Split animations are perfect for dramatic entrances.');
  const [splitKey, setSplitKey] = useState(0);

  // Get refs from hooks
  const typewriterRef = useTypewriterAnimation(typewriterText, { ...typewriterOptions });
  const scrambleRef = useTextScrambleAnimation(scrambleText, { ...scrambleOptions });
  const splitRef = useSplitTextAnimation({ ...splitOptions });

  // Handle replay buttons
  const replayTypewriter = () => {
    // Force component re-render by changing key
    setTypewriterKey(prev => prev + 1);
  };
  const replayScramble = () => setScrambleKey(prev => prev + 1);
  const replaySplit = () => setSplitKey(prev => prev + 1);

  return (
    <Container>
      <Title>GSAP Text Animation Test</Title>
      
      {/* Typewriter Animation */}
      <AnimationSection>
        <SectionTitle>Typewriter Animation</SectionTitle>
        <AnimationContainer>
          <div ref={typewriterRef} key={`typewriter-${typewriterKey}`}>
            {/* Content will be set by animation */}
          </div>
        </AnimationContainer>
        
        <OptionsContainer>
          <OptionGroup>
            <Label>Text</Label>
            <Input 
              type="text" 
              value={typewriterText} 
              onChange={e => setTypewriterText(e.target.value)}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Duration (s)</Label>
            <Input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={typewriterOptions.duration} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Delay (s)</Label>
            <Input 
              type="number" 
              min="0" 
              step="0.1" 
              value={typewriterOptions.delay} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, delay: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Show Cursor</Label>
            <input 
              type="checkbox" 
              checked={typewriterOptions.cursor} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, cursor: e.target.checked }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Cursor Character</Label>
            <Input 
              type="text" 
              value={typewriterOptions.cursorChar} 
              maxLength={1}
              onChange={e => setTypewriterOptions(prev => ({ ...prev, cursorChar: e.target.value || '|' }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Cursor Color</Label>
            <Input 
              type="color" 
              value={typewriterOptions.cursorColor} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, cursorColor: e.target.value }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Cursor Style</Label>
            <Select 
              value={typewriterOptions.cursorStyle} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, cursorStyle: e.target.value as 'blink' | 'solid' }))}
            >
              <option value="blink">Blink</option>
              <option value="solid">Solid</option>
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Blink Speed (s)</Label>
            <Input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={typewriterOptions.cursorBlinkSpeed} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, cursorBlinkSpeed: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Randomize Typing</Label>
            <input 
              type="checkbox" 
              checked={typewriterOptions.randomize} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, randomize: e.target.checked }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Speed Variation</Label>
            <Input 
              type="number" 
              min="0" 
              max="2" 
              step="0.1" 
              disabled={!typewriterOptions.randomize}
              value={typewriterOptions.speedVariation} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, speedVariation: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Pause Probability</Label>
            <Input 
              type="number" 
              min="0" 
              max="1" 
              step="0.05" 
              disabled={!typewriterOptions.randomize}
              value={typewriterOptions.pauseProbability} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, pauseProbability: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Max Pause (s)</Label>
            <Input 
              type="number" 
              min="0" 
              max="2" 
              step="0.1" 
              disabled={!typewriterOptions.randomize}
              value={typewriterOptions.maxPauseDuration} 
              onChange={e => setTypewriterOptions(prev => ({ ...prev, maxPauseDuration: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
        </OptionsContainer>
        
        <ButtonContainer>
          <Button onClick={replayTypewriter}>Replay Animation</Button>
        </ButtonContainer>
      </AnimationSection>
      
      {/* Scramble Animation */}
      <AnimationSection>
        <SectionTitle>Text Scramble Animation</SectionTitle>
        <AnimationContainer>
          <div ref={scrambleRef} key={`scramble-${scrambleKey}`}>
            {/* Content will be set by animation */}
          </div>
        </AnimationContainer>
        
        <OptionsContainer>
          <OptionGroup>
            <Label>Text</Label>
            <Input 
              type="text" 
              value={scrambleText} 
              onChange={e => setScrambleText(e.target.value)}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Duration (s)</Label>
            <Input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={scrambleOptions.duration} 
              onChange={e => setScrambleOptions(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Ease</Label>
            <Select 
              value={scrambleOptions.ease} 
              onChange={e => setScrambleOptions(prev => ({ ...prev, ease: e.target.value }))}
            >
              <option value="none">None</option>
              <option value="power1.inOut">Power1 InOut</option>
              <option value="power2.inOut">Power2 InOut</option>
              <option value="power3.inOut">Power3 InOut</option>
              <option value="back.inOut">Back InOut</option>
              <option value="elastic.inOut">Elastic InOut</option>
            </Select>
          </OptionGroup>
        </OptionsContainer>
        
        <ButtonContainer>
          <Button onClick={replayScramble}>Replay Animation</Button>
        </ButtonContainer>
      </AnimationSection>
      
      {/* Split Text Animation */}
      <AnimationSection>
        <SectionTitle>Split Text Animation</SectionTitle>
        <AnimationContainer>
          <div ref={splitRef} key={`split-${splitKey}`}>
            {splitText}
          </div>
        </AnimationContainer>
        
        <OptionsContainer>
          <OptionGroup>
            <Label>Text</Label>
            <Input 
              type="text" 
              value={splitText} 
              onChange={e => setSplitText(e.target.value)}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Duration (s)</Label>
            <Input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={splitOptions.duration} 
              onChange={e => setSplitOptions(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Stagger (s)</Label>
            <Input 
              type="number" 
              min="0.01" 
              step="0.01" 
              value={splitOptions.stagger} 
              onChange={e => setSplitOptions(prev => ({ ...prev, stagger: parseFloat(e.target.value) }))}
            />
          </OptionGroup>
          
          <OptionGroup>
            <Label>Direction</Label>
            <Select 
              value={splitOptions.direction} 
              onChange={e => setSplitOptions(prev => ({ ...prev, direction: e.target.value as 'up' | 'down' | 'left' | 'right' }))}
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Stagger From</Label>
            <Select 
              value={splitOptions.staggerFrom} 
              onChange={e => setSplitOptions(prev => ({ ...prev, staggerFrom: e.target.value as 'start' | 'center' | 'end' | 'edges' | 'random' }))}
            >
              <option value="start">Start</option>
              <option value="end">End</option>
              <option value="center">Center</option>
              <option value="edges">Edges</option>
              <option value="random">Random</option>
            </Select>
          </OptionGroup>
        </OptionsContainer>
        
        <ButtonContainer>
          <Button onClick={replaySplit}>Replay Animation</Button>
        </ButtonContainer>
      </AnimationSection>
    </Container>
  );
};

export default TestGsapAnimations; 