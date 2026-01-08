package br.cefetmg.barbeariainclusao.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Servico {

    private Long idServico;
    private String nomeServico;
    private String descricaoServico;
    private double precoServico;
    private long idBarbeariaServico;
    private long idBarbeiroServico;
}
