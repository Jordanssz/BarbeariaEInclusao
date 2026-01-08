// Barbearia.ts (Angular/Ionic Model)

export class Barbearia {
    idBarbearia: number;
    nomeBarbearia: string;
    enderecoBarbearia: string;
    descricaoBarbearia: string;
    senhaBarbearia: string;
    emailBarbearia: string;
    fotoBarbearia?: string; // opcional, será Base64

    // NOVOS CAMPOS ADICIONADOS
    latitude?: number;    // Opcional, para armazenar a coordenada
    longitude?: number;   // Opcional, para armazenar a coordenada

    constructor() {
        this.idBarbearia = 0;
        this.nomeBarbearia = '';
        this.enderecoBarbearia = '';
        this.descricaoBarbearia = '';
        this.senhaBarbearia = '';
        this.emailBarbearia = '';
        this.fotoBarbearia = ''; 
        
        // Inicialização opcional dos novos campos
        this.latitude = undefined;
        this.longitude = undefined;
    }
}