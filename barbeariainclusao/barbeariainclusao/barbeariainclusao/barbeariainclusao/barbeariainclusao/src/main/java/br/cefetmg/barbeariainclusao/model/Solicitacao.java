package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Solicitacao {

    private Long idSolicitacao;

    // ID do barbeiro que vai receber a solicitação
    private Long idBarbeiroDestinatario;

    // ID da barbearia que enviou a solicitação
    private Long idBarbeariaRemetente;

    // Estado da solicitação: PENDENTE, ACEITO, RECUSADO
    private String estadoSolicitacao;
}
