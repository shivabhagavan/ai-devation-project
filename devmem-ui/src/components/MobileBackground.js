import React from 'react';
import { Box } from '@mui/material';
import './MobileBackground.css';

const MobileBackground = () => {
  return (
    <Box
      className="mobile-bg"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF4500 50%, #DC143C 75%, #FF1493 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 69, 0, 0.15) 0%, transparent 50%)
          `,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='particles' x='0' y='0' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='5' cy='5' r='0.5' fill='%23FFFFFF' opacity='0.6'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23particles)'/%3E%3C/svg%3E")
          `,
          opacity: 0.3,
        },
      }}
    >
      {/* Layered panels */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '60%',
          background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 69, 0, 0.4))',
          borderRadius: '20px',
          transform: 'rotate(-5deg)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '70%',
          height: '50%',
          background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.3), rgba(220, 20, 60, 0.4))',
          borderRadius: '15px',
          transform: 'rotate(3deg)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(15px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '60%',
          height: '40%',
          background: 'linear-gradient(225deg, rgba(255, 140, 0, 0.3), rgba(255, 215, 0, 0.4))',
          borderRadius: '10px',
          transform: 'rotate(-2deg)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Abstract geometric shapes */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 600"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }}
      >
        <defs>
          <pattern id="paperTexture" patternUnits="userSpaceOnUse" width="20" height="20">
            <rect width="20" height="20" fill="rgba(255,255,255,0.1)" />
            <path d="M0,10 Q10,0 20,10 Q10,20 0,10" fill="rgba(255,215,0,0.2)" />
          </pattern>
        </defs>
        <g fill="url(#paperTexture)">
          <polygon points="50,50 150,30 200,100 100,120" />
          <polygon points="250,100 350,80 380,150 280,170" />
          <polygon points="100,200 200,180 250,250 150,270" />
          <polygon points="300,250 380,230 400,300 320,320" />
        </g>
        <g stroke="rgba(255,69,0,0.5)" strokeWidth="2" fill="none">
          <path d="M50,300 Q100,250 150,300 Q100,350 50,300" />
          <path d="M250,350 Q300,300 350,350 Q300,400 250,350" />
        </g>
      </svg>

      {/* Lower content area */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '30%',
          background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: '20px',
        }}
      >
        {/* Stacked cards */}
        <Box
          sx={{
            width: '90%',
            height: '60px',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '10px',
            marginBottom: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        />
        <Box
          sx={{
            width: '85%',
            height: '60px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '10px',
            marginBottom: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        />
        <Box
          sx={{
            width: '80%',
            height: '60px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}
        />
      </Box>
    </Box>
  );
};

export default MobileBackground;