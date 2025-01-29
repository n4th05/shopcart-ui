import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Produto from './components/Produto';
import Item from './components/Item';
import Carrinho from './components/Carrinho';
import Titulo from './components/Titulo'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Titulo />
      <Routes>
        <Route path="/produtos" element={<Produto />} />
        <Route path="/item" element={<Item />} />
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/" element={<Produto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;