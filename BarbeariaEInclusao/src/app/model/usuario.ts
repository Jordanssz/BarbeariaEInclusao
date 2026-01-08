export class Usuario {
    // Usar 'idUsuario' e 'number' (embora o backend use Long, number é o tipo padrão no TS)
    idUsuario: number; 
    
    // Suporte a campos do backend
    nomeUsuario: string;
    senhaUsuario: string;
    emailUsuario: string;
    telefoneUsuario: string = '';
    fotoUsuario?: string;
    
    // Descrição foi removida no backend, mas mantida como opcional se necessário futuramente.
    // descricaoUsuario?: string; 

    constructor() {
        this.idUsuario = 0;
        this.nomeUsuario = '';
        this.senhaUsuario = '';
        this.emailUsuario = '';
        this.fotoUsuario = '';
        this.telefoneUsuario = '';
        // this.descricaoUsuario = '';
    }
}
