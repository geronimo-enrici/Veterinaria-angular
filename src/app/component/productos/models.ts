export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  icono: string;
  stock: number;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}