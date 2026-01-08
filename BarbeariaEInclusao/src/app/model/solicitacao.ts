export class Solicitacao {
    idSolicitacao: number | null;
    idBarbeiroDestinatario: number | null;
    idBarbeariaRemetente: number | null;
    estadoSolicitacao: string | null;

    constructor(init?: Partial<Solicitacao>) {
        this.idSolicitacao = init?.idSolicitacao ?? null;
        this.idBarbeiroDestinatario = init?.idBarbeiroDestinatario ?? null;
        this.idBarbeariaRemetente = init?.idBarbeariaRemetente ?? null;
        this.estadoSolicitacao = init?.estadoSolicitacao ?? null;
    }
}
