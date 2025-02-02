import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';

export default function Item() {
  const defaultPostData = {
    produto: {
      id: undefined
    },
    quantidade: 0,
    unidadeDeMedida: 'unidade',
    carrinho: {
      id: undefined
    }
  }
  const [rows, setRows] = useState([]);
  const [postData, setPostData] = useState(defaultPostData);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [carrinhos, setCarrinhos] = useState([]);

  const unidadesMedida = ['unidade', 'kg', 'litro', 'metro'];

  const filteredRows = searchTerm ? rows.filter(item =>
    item?.produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : rows;

  const fetchProdutos = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Produto');
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchCarrinhos = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Carrinho');
      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
      const data = await response.json();
      
      setCarrinhos(data);
    } catch (error) {
      console.error('Erro ao buscar carrinhos:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('https://localhost:7074/api/Item');
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
      
      // Prepare the data with carrinho
      const dataToSend = {
        ...postData,
        quantidade: Number(postData.quantidade),
      };

      const response = await fetch('https://localhost:7074/api/Item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro na requisição: ${errorData}`);
      }
      
      const data = await response.json();
      setRows(prevRows => [data, ...prevRows]);
      setPostData(defaultPostData);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://localhost:7074/api/Item/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o item');
      }

      setRows(prevRows => prevRows.filter(row => row.id !== id));
    } catch (error) {
      console.error('Erro ao excluir o item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async () => {
    if (!editItem) return;

    try {
      setIsLoading(true);

      const dataToUpdate = {
        ...editItem,
        quantidade: Number(editItem.quantidade)
      };

      const response = await fetch(`https://localhost:7074/api/Item/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao atualizar o item: ${errorData}`);
      }

      setRows(prevRows =>
        prevRows.map(row =>
          row.id === editItem.id ? editItem : row
        )
      );

      handleClose();
      await fetchData();

    } catch (error) {
      console.error('Erro ao atualizar o item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickOpenEdit = (item) => {
    setEditItem(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
    setPostData(defaultPostData);
  };

  useEffect(() => {
    fetchData();
    fetchProdutos();
    fetchCarrinhos();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, p: 2 }}>Gerenciamento de Itens</Typography>

      <Typography variant="subtitle1" sx={{ mb: 2, p: 2 }}>
        Total de itens cadastrados: {rows.length}
      </Typography>

      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          Adicionar Item
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
          placeholder="Pesquisar itens..."
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
        <DialogTitle>{editItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Selecione um Produto</InputLabel>
            <Select
              value={editItem ? editItem.produto.id : postData.produto.id}
              label="Selecione um Produto"
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                const produto = produtos.find(p => p.id === selectedId);
                if (editItem) {
                  setEditItem({
                    ...editItem,
                    produto: {
                      id: selectedId,
                      nome: produto ? produto.nome : ''
                    }
                  });
                } else {
                  setPostData({
                    ...postData,
                    produto: {
                      id: selectedId,
                      nome: produto ? produto.nome : ''
                    }
                  });
                }
              }}
            >
              <MenuItem value={0}>Selecione um produto</MenuItem>
              {produtos.map((produto) => (
                <MenuItem key={produto.id} value={produto.id}>
                  {produto.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Selecione um Carrinho</InputLabel>
            <Select
              value={editItem ? editItem.carrinho.id : postData.carrinho.id}
              label="Selecione um Carrinho"
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                if (editItem) {
                  setEditItem({
                    ...editItem,
                    carrinho: {
                      id: selectedId,
                    }
                  });
                } else {
                  setPostData({
                    ...postData,
                    carrinho: {
                      id: selectedId,
                    }
                  });
                }
              }}
            >
              <MenuItem value={0}>Selecione um carrinho</MenuItem>
              {carrinhos.map((carrinho) => (
                <MenuItem key={carrinho.id} value={carrinho.id}>
                  {`Carrinho ${carrinho.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Quantidade"
            type="number"
            fullWidth
            variant="outlined"
            value={editItem ? editItem.quantidade || '' : postData.quantidade || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              if (!isNaN(value)) {
                if (editItem) {
                  setEditItem({ ...editItem, quantidade: value });
                } else {
                  setPostData({ ...postData, quantidade: value });
                }
              }
            }}
            inputProps={{
              min: 0,
              step: "any"
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Unidade de Medida</InputLabel>
            <Select
              value={editItem ? editItem.unidadeDeMedida : postData.unidadeDeMedida}
              label="Unidade de Medida"
              onChange={(e) => {
                if (editItem) {
                  setEditItem({ ...editItem, unidadeDeMedida: e.target.value });
                } else {
                  setPostData({ ...postData, unidadeDeMedida: e.target.value });
                }
              }}
            >
              {unidadesMedida.map((unidade) => (
                <MenuItem key={unidade} value={unidade}>
                  {unidade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={editItem ? updateItem : postDataToAPI}
            color="primary"
            disabled={isLoading || (editItem ? !editItem.produto.id : !postData.produto.id)}
          >
            {editItem ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1200 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Nome do Produto</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Unidade de Medida</TableCell>
              <TableCell align="right" sx={{ pr: 12 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {isLoading ? 'Carregando...' : 'Nenhum item encontrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.produto.nome}</TableCell>
                  <TableCell>{row.quantidade}</TableCell>
                  <TableCell>{row.unidadeDeMedida}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => deleteItem(row.id)}
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