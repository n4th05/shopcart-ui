import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, InputAdornment, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';

export default function Produto() {
  const [rows, setRows] = useState([]);
  const [postData, setPostData] = useState({
    nome: '',
  });
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = rows.filter(row =>
    row.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchData = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Produto');
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const postDataToAPI = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://localhost:7074/api/Produto', {
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
      setPostData({ nome: '' });
      setOpen(false);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://localhost:7074/api/Produto/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o produto');
      }

      setRows(prevRows => prevRows.filter(row => row.id !== id));
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async () => {
    if (!editProduct) return;
  
    try {
      setIsLoading(true);
      
      const body = {
        id: editProduct.id,
        nome: editProduct.nome
      };
  
      const response = await fetch(`https://localhost:7074/api/Produto/${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar o produto');
      }
  
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === editProduct.id ? body : row
        )
      );
      
      handleClose();
      await fetchData();
      
    } catch (error) {
      console.error('Erro ao atualizar o produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOpenEdit = (product) => {
    setEditProduct({ ...product });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProduct(null);
    setPostData({ nome: '' });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: "20px", marginBottom: "20px" }}>
      <Typography variant="h5" sx={{ mb: 2, p: 2 }}>Gerenciamento de Produtos</Typography>
      
      {/* Exibir a quantidade de registros */}
      <Typography variant="subtitle1" sx={{ mb: 2, p: 2 }}>
        Total de produtos cadastrados: {rows.length}
      </Typography>

      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          Adicionar Produto
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
          placeholder="Pesquisar produtos..."
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Produto"
            type="text"
            fullWidth
            variant="outlined"
            value={editProduct ? editProduct.nome : postData.nome}
            onChange={(e) => {
              if (editProduct) {
                setEditProduct({ ...editProduct, nome: e.target.value });
              } else {
                setPostData({ ...postData, nome: e.target.value });
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={editProduct ? updateProduct : postDataToAPI} 
            color="primary"
            disabled={isLoading}
          >
            {editProduct ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="right" sx={{ pr: 12 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {isLoading ? 'Carregando...' : 'Nenhum produto encontrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => deleteProduct(row.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}