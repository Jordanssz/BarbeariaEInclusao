export class Avaliacao {
    idAvaliacao: number;
    nota: number;
    comentario: string;
    idAtendimentoAvaliacao: number;

    constructor() {
        this.idAvaliacao = 0;
        this.nota = 0;
        this.comentario = '';
        this.idAtendimentoAvaliacao = 0;
    }
}