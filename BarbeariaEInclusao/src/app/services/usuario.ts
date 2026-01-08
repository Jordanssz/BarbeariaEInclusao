import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../model/usuario'; // Certifique-se de que o caminho do modelo está correto
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = environment.apiUrl + '/api/v1/usuario';
  private usuarioLogado: Usuario | null = null; // Estado interno para evitar JSON.parse constante

  constructor(private http: HttpClient) {
    // Carrega o usuário do localStorage na inicialização do serviço
    this.carregar();
  }

  // ------------------ GERENCIAMENTO DE ESTADO (LOCAL STORAGE) ------------------

  /** Registra o usuário autenticado no serviço e no localStorage */
  registrar(usuario: Usuario) {
    this.usuarioLogado = usuario;
    // O prefixo 'data:' deve ser tratado no componente que exibe,
    // mas garantimos que o objeto esteja salvo.
    localStorage.setItem('usuarioAutenticado', JSON.stringify(usuario));
  }

  /** Carrega e retorna o usuário do localStorage, se existir. */
  carregar(): Usuario | null {
    if (!this.usuarioLogado) {
      const saved = localStorage.getItem('usuarioAutenticado');
      this.usuarioLogado = saved ? JSON.parse(saved) : null;
    }
    return this.usuarioLogado;
  }

  /** Retorna o ID do usuário logado ou null. */
  getIdUsuarioLogado(): number | null {
    return this.carregar()?.idUsuario || null;
  }

  /** Encerra a sessão, limpando o estado interno e o localStorage. */
  encerrar() {
    this.usuarioLogado = null;
    localStorage.removeItem('usuarioAutenticado');
  }


  // ------------------ AUTENTICAÇÃO E CADASTRO ------------------

  /** Autentica o usuário e registra no localStorage em caso de sucesso. */
  autenticar(email: string, senha: string): Observable<Usuario> {
    const loginPayload = { emailUsuario: email, senhaUsuario: senha };
    
    return this.http.post<Usuario>(`${this.apiUrl}/autenticar`, loginPayload).pipe(
      // Usa tap para registrar o usuário no localStorage após a autenticação
      tap(usuario => this.registrar(usuario))
    );
  }

  /** Cadastra um novo usuário. */
  cadastrar(usuario: Usuario): Observable<Usuario> {
    // Usa o endpoint /cadastrar do Controller
    return this.http.post<Usuario>(`${this.apiUrl}/cadastrar`, usuario).pipe(
      // Opcional: registrar automaticamente após o cadastro, se for o fluxo desejado
      tap(usuarioRegistrado => this.registrar(usuarioRegistrado))
    );
  }

  // ------------------ CRUD BÁSICO ------------------

  /** Busca todos os usuários. */
  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}`);
  }

  /** Busca um usuário pelo ID. */
  findById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /** Alias para compatibilidade com serviços que chamam `getById` */
  getById(id: number): Observable<Usuario> {
    return this.findById(id);
  }

  /** Atualiza os dados de um usuário existente. */
  update(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.idUsuario}`, usuario).pipe(
      // Sincroniza o localStorage com os dados mais frescos do servidor
      tap(usuarioAtualizado => this.registrar(usuarioAtualizado))
    );
  }

  /** Deleta um usuário pelo ID. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
