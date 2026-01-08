export class Servico {
    idServico: number;
    nomeServico: string;
    descricaoServico: string;
    precoServico: number;
    fotoServico: string;
    idBarbeariaServico: number;
    idBarbeiroServico: number;

    constructor() {
        this.idServico = 0;
        this.nomeServico = '';
        this.descricaoServico = '';
        this.precoServico = 0;
        this.fotoServico = '';
        this.idBarbeariaServico = 0;
        this.idBarbeiroServico = 0;
    }
}
