import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Producto, ItemCarrito } from './models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  cargando = true;
  busqueda = '';
  categoriaSeleccionada = 'Todos';
  paginaActual = 1;
  itemsPorPagina = 10;
  
  carrito: ItemCarrito[] = [];
  total = 0;
  metodoPago: string = 'Transferencia';
  totalFinal: number = 0;
  descuentoRecargo: number = 0;
  
  esAdmin = false;
  estaLogueado = false;
  modoAdmin = false;
  
  mostrarModalLogin = false;
  loginEmail = '';
  loginPassword = '';
  errorLogin = false;
  cargandoLogin = false;
  
  nuevosPrecios: { [id: number]: number } = {};
  ingresosStock: { [id: number]: number } = {};
  guardandoStock = false;

  mostrarFormularioCrear = false;
  creandoProducto = false;
  eliminandoId: number | null = null;
  
  descargandoExcel = false;
  sincronizandoExcel = false;

  nuevoProducto: Partial<Producto> = {
    nombre: '',
    categoria: 'Comida',
    precio: 0,
    stock: 0,
    icono: '📦'
  };
  
  private apiUrl = 'https://backend-hmz6.onrender.com/api';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.verificarSesion();
    this.cargarProductos();
    
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('abrir-login', () => {
        this.zone.run(() => {
          this.mostrarModalLogin = true;
          this.cdr.detectChanges();
        });
      });
    }
  }

  verificarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      this.estaLogueado = !!localStorage.getItem('token');
      this.esAdmin = localStorage.getItem('rol') === 'Admin';
    }
  }

  iniciarSesion() {
    this.cargandoLogin = true;
    this.errorLogin = false;

    this.http.post<any>(`${this.apiUrl}/Auth/login`, {
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        window.location.reload();
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorLogin = true;
          this.cargandoLogin = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarProductos() {
    this.cargando = true;
    this.http.get<Producto[]>(`${this.apiUrl}/Productos`).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.todosLosProductos = data || [];
          this.cargando = false;
          this.aplicarFiltros(); 
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.cargando = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  aplicarFiltros() {
    const q = (this.busqueda || '').toLowerCase().trim();
    
    if (!q && this.categoriaSeleccionada === 'Todos') {
      this.productosFiltrados = [...this.todosLosProductos];
    } else {
      this.productosFiltrados = this.todosLosProductos.filter(p => 
        (p.nombre || '').toLowerCase().includes(q) && 
        (this.categoriaSeleccionada === 'Todos' || p.categoria === this.categoriaSeleccionada)
      );
    }
    
    this.paginaActual = 1;
    this.cdr.markForCheck();
    this.cdr.detectChanges(); 
  }

  get productosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas() {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(p: number) {
    this.paginaActual = p;
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  obtenerCantidadEnCarrito(id: number): number {
    const item = this.carrito.find(i => i.producto.id === id);
    return item ? item.cantidad : 0;
  }

  intentarAgregarAlCarrito(prod: Producto) {
    if (!this.estaLogueado) {
      this.mostrarModalLogin = true;
      return;
    }
    
    const item = this.carrito.find(i => i.producto.id === prod.id);
    if (item) {
      if (item.cantidad < prod.stock) {
        item.cantidad++;
      }
    } else {
      if (prod.stock > 0) {
        this.carrito.push({ producto: { ...prod }, cantidad: 1 });
      }
    }
    this.calcularTotal();
  }

  restarDelCarrito(id: number) {
    const item = this.carrito.find(i => i.producto.id === id);
    if (item) {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        this.eliminarDelCarrito(id);
      }
      this.calcularTotal();
    }
  }

  eliminarDelCarrito(id: number) {
    this.carrito = this.carrito.filter(i => i.producto.id !== id);
    this.calcularTotal();
  }

  vaciarCarrito() {
    this.carrito = [];
    this.total = 0;
    this.totalFinal = 0;
    this.descuentoRecargo = 0;
  }

  calcularTotal() {
    const totalBase = this.carrito.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
    this.total = totalBase;
  
    if (this.metodoPago === 'Efectivo') {
      this.descuentoRecargo = -(totalBase * 0.10);
    } else if (this.metodoPago === 'Tarjeta') {
      this.descuentoRecargo = (totalBase * 0.10);
    } else {
      this.descuentoRecargo = 0;
    }
  
    this.totalFinal = totalBase + this.descuentoRecargo;
  }

  cambiarMetodoPago(metodo: string) {
    this.metodoPago = metodo;
    this.calcularTotal();
  }

  confirmarCompra() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const body = this.carrito.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad }));
    
    this.http.post(`${this.apiUrl}/Productos/confirmar-compra`, body, { headers }).subscribe({
      next: () => {
        alert('¡Gracias por tu compra!');
        window.location.reload();
      },
      error: (err) => {
        alert('Error al procesar la compra.');
      }
    });
  }

  abrirPanelAdmin() {
    this.modoAdmin = true;
    this.todosLosProductos.forEach(p => {
      this.ingresosStock[p.id] = 0;
      this.nuevosPrecios[p.id] = p.precio;
    });
  }

  guardarNuevoStock() {
    this.guardandoStock = true;
  
    const payload = this.todosLosProductos
      .map(p => ({
        productoId: p.id,
        cantidad: Number(this.ingresosStock[p.id]) || 0,
        nuevoPrecio: Number(this.nuevosPrecios[p.id]) || p.precio
      }))
      .filter(x => x.cantidad > 0 || x.nuevoPrecio !== this.todosLosProductos.find(p => p.id === x.productoId)?.precio);

    if (payload.length === 0) {
      alert('No hay cambios para guardar.');
      this.guardandoStock = false;
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`${this.apiUrl}/Productos/actualizar-inventario`, payload, { headers }).subscribe({
      next: () => {
        alert('Inventario y precios actualizados');
        window.location.reload();
      },
      error: () => {
        alert('Error al actualizar los datos');
        this.guardandoStock = false;
      }
    });
  }

  toggleFormularioCrear() {
    this.mostrarFormularioCrear = !this.mostrarFormularioCrear;
  }

  crearProducto() {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.precio! <= 0) {
      alert('Completá el nombre y el precio del producto.');
      return;
    }
    this.creandoProducto = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post<Producto>(`${this.apiUrl}/Productos`, this.nuevoProducto, { headers }).subscribe({
      next: (res) => {
        this.todosLosProductos.push(res);
        this.aplicarFiltros(); 
        this.nuevoProducto = { nombre: '', categoria: 'Comida', precio: 0, stock: 0, icono: '📦' };
        this.mostrarFormularioCrear = false;
        this.creandoProducto = false;
        this.ingresosStock[res.id] = 0;
        this.nuevosPrecios[res.id] = res.precio;
      },
      error: (err) => {
        alert('Hubo un error al crear el producto.');
        this.creandoProducto = false;
      }
    });
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;
    
    this.eliminandoId = id;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.delete(`${this.apiUrl}/Productos/${id}`, { headers }).subscribe({
      next: () => {
        this.todosLosProductos = this.todosLosProductos.filter(p => p.id !== id);
        this.aplicarFiltros();
        this.eliminandoId = null;
        delete this.nuevosPrecios[id];
        delete this.ingresosStock[id];
      },
      error: (err) => {
        alert('No se pudo eliminar el producto. Quizás esté en el historial de alguna compra.');
        this.eliminandoId = null;
      }
    });
  }

  descargarExcel() {
    this.descargandoExcel = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get(`${this.apiUrl}/Productos/descargar-excel`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Inventario_Productos.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargandoExcel = false;
      },
      error: () => {
        alert('Error al descargar el archivo Excel.');
        this.descargandoExcel = false;
      }
    });
  }

  sincronizarExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.sincronizandoExcel = true;
    const formData = new FormData();
    formData.append('archivo', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`${this.apiUrl}/Productos/sincronizar-excel`, formData, { headers }).subscribe({
      next: (res: any) => {
        alert(`Sincronización exitosa.\nProcesados: ${res.procesados}\nEliminados: ${res.eliminados}`);
        this.sincronizandoExcel = false;
        window.location.reload();
      },
      error: (err) => {
        alert('Error al sincronizar el archivo Excel.');
        this.sincronizandoExcel = false;
      }
    });
    
    event.target.value = '';
  }
}