import { AppBar, MenuItem, styled, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';

const Navbar = () => {
  const StyledToobar = styled(Toolbar)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-evenly",
    backgroundColor: "purple"
  }));

  const StyledLink = styled(Link)({
    textDecoration: 'none',
    color: 'white'
  });

  return (
    <AppBar position='fixed'>
      <StyledToobar>
        <StyledLink to="/produtos">
          <MenuItem>Produto</MenuItem>
        </StyledLink>
        <StyledLink to="/carrinho">
          <MenuItem>Carrinho</MenuItem>
        </StyledLink>
        <StyledLink to="/item">
          <MenuItem>Item</MenuItem>
        </StyledLink>
      </StyledToobar>
    </AppBar>
  );
}

export default Navbar;