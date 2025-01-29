import { Box, Typography } from '@mui/material';
import React from 'react'

export default function index() {
    return (
        <div>
          <Box
            sx={{
              width: '100%',
              position: 'relative',
              marginTop: '80px',
              padding: '20px 0',
              background: '#fff',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.2rem' },
                fontWeight: 800,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #9c27b0, #d500f9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '1px',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                padding: '10px 20px',
                '@keyframes slideIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(-30px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
                animation: 'slideIn 1s ease-out forwards',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(45deg, #9c27b0, #d500f9)',
                  margin: '10px auto 0',
                  borderRadius: '2px'
                }
              }}
            >
              ShopCart
            </Typography>
          </Box>
    
          <Box sx={{ marginTop: '20px' }}>
          </Box>
        </div>
      );
}
