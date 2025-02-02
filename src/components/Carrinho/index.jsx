import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, InputAdornment, Collapse, IconButton, Box, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState, useEffect } from 'react';

function CartRow({ row, handleClickOpenEdit, deleteCart, isLoading }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }}}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.id}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteCart(row.id)}
            sx={{ marginRight: 1 }}
            disabled={isLoading}
          >
            Deletar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleClickOpenEdit(row)}
            disabled={isLoading}
          >
            Alterar
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Itens do Carrinho
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Produto</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Unidade de Medida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.itensCarrinho.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.produto.nome}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{item.unidadeDeMedida}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Carrinho() {
  const [rows, setRows] = useState([]);
  const [postData, setPostData] = useState({
    itensCarrinho: []
  });
  const [open, setOpen] = useState(false);
  const [editCart, setEditCart] = useState(null);
  const [editingItems, setEditingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({
    produto: null,
    quantidade: 1,
    unidadeDeMedida: 'unidade'
  });

  const filteredRows = rows.filter(row =>
    row.itensCarrinho.some(item => 
      item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const fetchData = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Carrinho');
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Produto');
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProdutos();
  }, []);

  const handleAddItem = () => {
    if (!novoProduto.produto) return;

    setPostData(prev => ({
      itensCarrinho: [
        ...prev.itensCarrinho,
        {
          produto: novoProduto.produto,
          quantidade: novoProduto.quantidade,
          unidadeDeMedida: novoProduto.unidadeDeMedida
        }
      ]
    }));

    setNovoProduto({
      produto: null,
      quantidade: 1,
      unidadeDeMedida: 'unidade'
    });
  };

  const handleRemoveItem = (index) => {
    setPostData(prev => ({
      itensCarrinho: prev.itensCarrinho.filter((_, i) => i !== index)
    }));
  };

  const postDataToAPI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://localhost:7074/api/Carrinho', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await response.json();
      setRows(prevRows => [data, ...prevRows]);
      setPostData({ itensCarrinho: [] });
      setOpen(false);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCart = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://localhost:7074/api/Carrinho/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o carrinho');
      }

      setRows(prevRows => prevRows.filter(row => row.id !== id));
    } catch (error) {
      console.error('Erro ao excluir o carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...editingItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setEditingItems(newItems);
  };

  const updateCart = async () => {
    if (!editCart) return;
  
    try {
      setIsLoading(true);
      
      const updatedCart = {
        ...editCart,
        itensCarrinho: editingItems
      };
      
      const response = await fetch(`https://localhost:7074/api/Carrinho/${editCart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCart),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar o carrinho');
      }
  
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === editCart.id ? updatedCart : row
        )
      );
      
      handleClose();
      await fetchData();
      
    } catch (error) {
      console.error('Erro ao atualizar o carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOpenEdit = (cart) => {
    setEditCart({ ...cart });
    setEditingItems([...cart.itensCarrinho]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCart(null);
    setEditingItems([]);
    setPostData({ itensCarrinho: [] });
    setNovoProduto({
      produto: null,
      quantidade: 1,
      unidadeDeMedida: 'unidade'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, p: 2 }}>Gerenciamento de Carrinhos</Typography>

      <Typography variant="subtitle1" sx={{ mb: 2, p: 2 }}>
        Total de Carrinhos: {rows.length}
      </Typography>
      
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          Adicionar Carrinho
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={fetchData}
          disabled={isLoading}
        >
          Atualizar Lista
        </Button>
        
        <TextField
          variant="outlined"
          size="small"
          placeholder="Pesquisar produtos nos carrinhos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            marginLeft: 'auto',
            width: '300px'
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="xl">
        <DialogTitle>{editCart ? 'Editar Carrinho' : 'Adicionar Novo Carrinho'}</DialogTitle>
        <DialogContent>
          {editCart ? (
            <Box sx={{ minWidth: 400, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Itens do Carrinho
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Unidade de Medida</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editingItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.produto.nome}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => handleUpdateItem(index, 'quantidade', parseInt(e.target.value))}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.unidadeDeMedida}
                            onChange={(e) => handleUpdateItem(index, 'unidadeDeMedida', e.target.value)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box sx={{ minWidth: 400, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Adicionar Itens ao Carrinho
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
                <TextField
                  select
                  value={novoProduto.produto ? novoProduto.produto.id : ''}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    const produto = produtos.find(p => p.id === selectedId);
                    setNovoProduto(prev => ({
                      ...prev,
                      produto: {
                        id: selectedId,
                        nome: produto.nome
                      }
                    }));
                  }}
                  sx={{ minWidth: 200 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </TextField>

                <TextField
                  type="number"
                  label="Quantidade"
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                  sx={{ width: 100 }}
                />

                <TextField
                  label="Unidade de Medida"
                  value={novoProduto.unidadeDeMedida}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, unidadeDeMedida: e.target.value }))}
                  sx={{ width: 150 }}
                />

                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  disabled={!novoProduto.produto}
                >
                  Adicionar Item
                </Button>
              </Box>

              {postData.itensCarrinho.length > 0 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell>Quantidade</TableCell>
                        <TableCell>Unidade de Medida</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {postData.itensCarrinho.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.produto.nome}</TableCell>
                          <TableCell>{item.quantidade}</TableCell>
                          <TableCell>{item.unidadeDeMedida}</TableCell>
                          <TableCell>
                            <Button
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                            >
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={editCart ? updateCart : postDataToAPI}
            color="primary"
            disabled={isLoading || (!editCart && postData.itensCarrinho.length === 0)}
          >
            {editCart ? 'Salvar Alterações' : 'Adicionar Carrinho'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }} aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID do Carrinho</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {isLoading ? 'Carregando...' : 'Nenhum carrinho encontrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <CartRow 
                  key={row.id}
                  row={row}
                  handleClickOpenEdit={handleClickOpenEdit}
                  deleteCart={deleteCart}
                  isLoading={isLoading}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}